import { createHash } from "node:crypto";

export interface CanonicalCommandInput {
  aggregateKey: string;
  operation: string;
  actorId: string;
  payloadHash: string;
  expectedVersion: number;
}

export class CommandConflictError extends Error {}
export class StaleVersionError extends Error {}

// Byte-length-prefixed UTF-16LE encoding. Field boundaries can never collide (the prefix states
// exactly how many following bytes belong to this field), and UTF-16LE preserves every raw
// UTF-16 code unit byte-for-byte -- including lone (unpaired) surrogates -- unlike a length
// computed from JS string .length hashed via Node's default UTF-8 string encoding, which
// substitutes any lone surrogate with the same U+FFFD replacement bytes regardless of which
// surrogate it was, letting genuinely different runtime strings collapse to identical hash input.
function encodeField(value: string): Buffer {
  const bytes = Buffer.from(value, "utf16le");
  const prefix = Buffer.alloc(4);
  prefix.writeUInt32BE(bytes.length, 0);
  return Buffer.concat([prefix, bytes]);
}

export function fingerprintCommand(input: CanonicalCommandInput): string {
  const hash = createHash("sha256");
  hash.update(encodeField(input.aggregateKey));
  hash.update(encodeField(input.operation));
  hash.update(encodeField(input.actorId));
  hash.update(encodeField(input.payloadHash));
  hash.update(encodeField(String(input.expectedVersion)));
  return hash.digest("hex");
}

interface AggregateState {
  version: number;
}

interface IdempotencyReceipt {
  fingerprint: string;
  result: unknown;
}

export class AtomicCommandGate {
  private aggregates = new Map<string, AggregateState>();
  private receipts = new Map<string, IdempotencyReceipt>();
  // Serializes per aggregateKey so a version check + mutate + commit is atomic relative to any
  // other command racing on the same aggregate.
  private aggregateLocks = new Map<string, Promise<unknown>>();
  // Serializes per idempotencyKey FIRST (acquired before any aggregateLock), so two calls
  // sharing the same idempotencyKey but targeting DIFFERENT aggregates cannot both observe "no
  // receipt yet" and both execute their mutation callback. Lock acquisition order is always
  // idempotencyLocks -> aggregateLocks, never the reverse, so this cannot deadlock.
  private idempotencyLocks = new Map<string, Promise<unknown>>();

  getAggregateVersion(aggregateKey: string): number {
    return this.aggregates.get(aggregateKey)?.version ?? 0;
  }

  private async withLock<T>(locks: Map<string, Promise<unknown>>, key: string, fn: () => Promise<T>): Promise<T> {
    const previous = locks.get(key) ?? Promise.resolve();
    const run = previous.then(fn, fn);
    locks.set(
      key,
      run.then(
        () => undefined,
        () => undefined,
      ),
    );
    return run;
  }

  async execute<T>(
    idempotencyKey: string,
    input: CanonicalCommandInput,
    mutate: () => T | Promise<T>,
  ): Promise<T> {
    const fingerprint = fingerprintCommand(input);

    // Fast path outside any lock: exact replay of an already-committed receipt.
    const existing = this.receipts.get(idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new CommandConflictError(
          `idempotency key ${idempotencyKey} was already used for a different canonical command`,
        );
      }
      return existing.result as T;
    }

    return this.withLock(this.idempotencyLocks, idempotencyKey, async () => {
      // Re-check inside the critical section: another queued call for the same idempotencyKey
      // (on any aggregate) may have committed while this call waited for the lock.
      const existingInner = this.receipts.get(idempotencyKey);
      if (existingInner) {
        if (existingInner.fingerprint !== fingerprint) {
          throw new CommandConflictError(
            `idempotency key ${idempotencyKey} was already used for a different canonical command`,
          );
        }
        return existingInner.result as T;
      }

      return this.withLock(this.aggregateLocks, input.aggregateKey, async () => {
        const currentVersion = this.getAggregateVersion(input.aggregateKey);
        if (input.expectedVersion !== currentVersion) {
          throw new StaleVersionError(
            `expected version ${input.expectedVersion}, aggregate ${input.aggregateKey} is at ${currentVersion}`,
          );
        }

        const result = await mutate();
        this.aggregates.set(input.aggregateKey, { version: currentVersion + 1 });
        this.receipts.set(idempotencyKey, { fingerprint, result });
        return result;
      });
    });
  }
}
