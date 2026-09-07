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

// Length-prefixed encoding so distinct field boundaries can never collide on serialized bytes
// (a plain delimiter-joined concatenation lets a delimiter character inside one field shift a
// field boundary and collide with a different canonical tuple).
function encodeField(value: string): string {
  return `${value.length}:${value}`;
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
  // Serializes ALL execute() calls per aggregateKey — not merely per idempotencyKey — so a
  // version check + mutate + commit is atomic relative to any other command (same or different
  // idempotency key) racing on the same aggregate.
  private aggregateLocks = new Map<string, Promise<unknown>>();

  getAggregateVersion(aggregateKey: string): number {
    return this.aggregates.get(aggregateKey)?.version ?? 0;
  }

  private async withAggregateLock<T>(aggregateKey: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.aggregateLocks.get(aggregateKey) ?? Promise.resolve();
    const run = previous.then(fn, fn);
    this.aggregateLocks.set(
      aggregateKey,
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

    const existing = this.receipts.get(idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new CommandConflictError(
          `idempotency key ${idempotencyKey} was already used for a different canonical command`,
        );
      }
      return existing.result as T;
    }

    return this.withAggregateLock(input.aggregateKey, async () => {
      // Re-check inside the critical section: another queued call for the same idempotencyKey
      // may have committed while this call was waiting for the aggregate lock.
      const existingInner = this.receipts.get(idempotencyKey);
      if (existingInner) {
        if (existingInner.fingerprint !== fingerprint) {
          throw new CommandConflictError(
            `idempotency key ${idempotencyKey} was already used for a different canonical command`,
          );
        }
        return existingInner.result as T;
      }

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
  }
}
