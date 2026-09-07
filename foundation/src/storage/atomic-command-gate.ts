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

export function fingerprintCommand(input: CanonicalCommandInput): string {
  const hash = createHash("sha256");
  hash.update(input.aggregateKey);
  hash.update(" ");
  hash.update(input.operation);
  hash.update(" ");
  hash.update(input.actorId);
  hash.update(" ");
  hash.update(input.payloadHash);
  hash.update(" ");
  hash.update(String(input.expectedVersion));
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
  private inFlight = new Map<string, Promise<unknown>>();

  getAggregateVersion(aggregateKey: string): number {
    return this.aggregates.get(aggregateKey)?.version ?? 0;
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

    const pending = this.inFlight.get(idempotencyKey);
    if (pending) {
      await pending;
      const receipt = this.receipts.get(idempotencyKey);
      if (!receipt || receipt.fingerprint !== fingerprint) {
        throw new CommandConflictError(
          `idempotency key ${idempotencyKey} was already used for a different canonical command`,
        );
      }
      return receipt.result as T;
    }

    const currentVersion = this.getAggregateVersion(input.aggregateKey);
    if (input.expectedVersion !== currentVersion) {
      throw new StaleVersionError(
        `expected version ${input.expectedVersion}, aggregate ${input.aggregateKey} is at ${currentVersion}`,
      );
    }

    const runPromise = (async () => {
      const result = await mutate();
      this.aggregates.set(input.aggregateKey, { version: currentVersion + 1 });
      this.receipts.set(idempotencyKey, { fingerprint, result });
      return result;
    })();

    this.inFlight.set(idempotencyKey, runPromise);
    try {
      return (await runPromise) as T;
    } finally {
      this.inFlight.delete(idempotencyKey);
    }
  }
}
