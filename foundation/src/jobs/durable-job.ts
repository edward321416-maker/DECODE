import type { Clock } from "../shared/clock.js";

export type JobState =
  | "CREATED"
  | "RUNNING"
  | "UNKNOWN_RESULT"
  | "RECONCILIATION_REQUIRED"
  | "RETRY_ALLOWED"
  | "SUCCEEDED"
  | "FAILED";

export type AttemptState = "RUNNING" | "UNKNOWN_RESULT" | "FAILED" | "SUCCEEDED";

export type ReconciliationDecision = "CONFIRMED_SUCCEEDED" | "CONFIRMED_FAILED" | "RETRY_ALLOWED";

export interface Attempt {
  attemptNumber: number;
  state: AttemptState;
  startedAt: Date;
  resultEvidence?: unknown;
  failureEvidence?: unknown;
}

export interface Reconciliation {
  decision: ReconciliationDecision;
  reconciliationRef: string;
  reason: string;
  recordedAt: Date;
  externalObservedAt?: Date;
}

export interface ReconcileInput {
  decision: ReconciliationDecision;
  reconciliationRef: string;
  reason: string;
  externalObservedAt?: Date;
}

export class DurableJobError extends Error {}

export class DurableJob {
  readonly jobId: string;
  private state: JobState = "CREATED";
  private attempts: Attempt[] = [];
  private reconciliations: Reconciliation[] = [];

  constructor(jobId: string, private readonly clock: Clock) {
    this.jobId = jobId;
  }

  getState(): JobState {
    return this.state;
  }

  getAttempts(): readonly Attempt[] {
    return this.attempts;
  }

  getReconciliations(): readonly Reconciliation[] {
    return this.reconciliations;
  }

  getAttemptCount(): number {
    return this.attempts.length;
  }

  private currentAttempt(): Attempt {
    const attempt = this.attempts[this.attempts.length - 1];
    if (!attempt) {
      throw new DurableJobError("no attempt in progress");
    }
    return attempt;
  }

  start(): void {
    if (this.state !== "CREATED" && this.state !== "RETRY_ALLOWED") {
      throw new DurableJobError(`cannot start job from state ${this.state}`);
    }
    this.attempts.push({
      attemptNumber: this.attempts.length + 1,
      state: "RUNNING",
      startedAt: this.clock.now(),
    });
    this.state = "RUNNING";
  }

  succeed(resultEvidence: unknown): void {
    if (this.state !== "RUNNING") {
      throw new DurableJobError(`cannot succeed from state ${this.state}`);
    }
    const attempt = this.currentAttempt();
    attempt.state = "SUCCEEDED";
    attempt.resultEvidence = resultEvidence;
    this.state = "SUCCEEDED";
  }

  fail(failureEvidence: unknown): void {
    if (this.state !== "RUNNING") {
      throw new DurableJobError(`cannot fail from state ${this.state}`);
    }
    const attempt = this.currentAttempt();
    attempt.state = "FAILED";
    attempt.failureEvidence = failureEvidence;
    this.state = "FAILED";
  }

  markUnknownResult(): void {
    if (this.state !== "RUNNING") {
      throw new DurableJobError(`cannot mark unknown result from state ${this.state}`);
    }
    const attempt = this.currentAttempt();
    attempt.state = "UNKNOWN_RESULT";
    this.state = "UNKNOWN_RESULT";
  }

  requireReconciliation(): void {
    if (this.state !== "UNKNOWN_RESULT") {
      throw new DurableJobError(`cannot require reconciliation from state ${this.state}`);
    }
    this.state = "RECONCILIATION_REQUIRED";
  }

  reconcile(input: ReconcileInput): void {
    if (this.state !== "RECONCILIATION_REQUIRED") {
      throw new DurableJobError(`cannot reconcile from state ${this.state}`);
    }
    if (!input.reconciliationRef) {
      throw new DurableJobError("reconciliationRef is required");
    }
    if (!input.reason) {
      throw new DurableJobError("reason is required");
    }

    const record: Reconciliation = {
      decision: input.decision,
      reconciliationRef: input.reconciliationRef,
      reason: input.reason,
      recordedAt: this.clock.now(),
      externalObservedAt: input.externalObservedAt,
    };
    this.reconciliations.push(record);

    const attempt = this.currentAttempt();
    if (input.decision === "CONFIRMED_SUCCEEDED") {
      attempt.state = "SUCCEEDED";
      attempt.resultEvidence = { reconciledBy: record.reconciliationRef };
      this.state = "SUCCEEDED";
    } else if (input.decision === "CONFIRMED_FAILED") {
      attempt.state = "FAILED";
      attempt.failureEvidence = { reconciledBy: record.reconciliationRef };
      this.state = "FAILED";
    } else {
      this.state = "RETRY_ALLOWED";
    }
  }

  retry(): void {
    if (this.state !== "RETRY_ALLOWED") {
      throw new DurableJobError(`cannot retry from state ${this.state}`);
    }
    const lastReconciliation = this.reconciliations[this.reconciliations.length - 1];
    if (!lastReconciliation || lastReconciliation.decision !== "RETRY_ALLOWED") {
      throw new DurableJobError("retry requires a recorded RETRY_ALLOWED reconciliation");
    }
    this.attempts.push({
      attemptNumber: this.attempts.length + 1,
      state: "RUNNING",
      startedAt: this.clock.now(),
    });
    this.state = "RUNNING";
  }
}
