import type { Clock } from "../foundation-api.js";

export class TimingContractError extends Error {}

export interface TimingReport {
  activeDurationMs: number;
  manualPauseCount: number;
  manualPauseDurationMs: number;
  interruptionCandidateCount: number;
  confirmedInterruptionCount: number;
  confirmedInterruptionDurationMs: number;
}

/**
 * Protocol §15: manual pause/resume controls elapsed active time. Automatic
 * focus/inactivity signals only increment candidate flags — they never
 * silently rewrite active duration unless explicitly confirmed via
 * confirmInterruption(), which is the only other subtraction path besides
 * manual pause.
 */
export class ActiveTimer {
  #startedAt: Date | null = null;
  #pausedAt: Date | null = null;
  #manualPauseCount = 0;
  #manualPauseDurationMs = 0;
  #interruptionCandidateCount = 0;
  #confirmedInterruptionCount = 0;
  #confirmedInterruptionDurationMs = 0;

  constructor(private readonly clock: Clock) {}

  start(): void {
    if (this.#startedAt) throw new TimingContractError("ALREADY_STARTED");
    this.#startedAt = this.clock.now();
  }

  pause(): void {
    if (!this.#startedAt) throw new TimingContractError("NOT_STARTED");
    if (this.#pausedAt) throw new TimingContractError("ALREADY_PAUSED");
    this.#pausedAt = this.clock.now();
    this.#manualPauseCount += 1;
  }

  resume(): void {
    if (!this.#pausedAt) throw new TimingContractError("NOT_PAUSED");
    const now = this.clock.now();
    const delta = now.getTime() - this.#pausedAt.getTime();
    if (delta < 0) throw new TimingContractError("NEGATIVE_INTERVAL");
    this.#manualPauseDurationMs += delta;
    this.#pausedAt = null;
  }

  flagFocusLoss(): void {
    this.#interruptionCandidateCount += 1;
  }

  flagInactivity(): void {
    this.#interruptionCandidateCount += 1;
  }

  confirmInterruption(durationMs: number): void {
    if (durationMs < 0) throw new TimingContractError("NEGATIVE_INTERVAL");
    this.#confirmedInterruptionCount += 1;
    this.#confirmedInterruptionDurationMs += durationMs;
  }

  report(now: Date): TimingReport {
    if (!this.#startedAt) throw new TimingContractError("NOT_STARTED");
    const end = this.#pausedAt ?? now;
    const elapsed = end.getTime() - this.#startedAt.getTime();
    if (elapsed < 0) throw new TimingContractError("NEGATIVE_INTERVAL");
    const activeDurationMs = elapsed - this.#manualPauseDurationMs - this.#confirmedInterruptionDurationMs;
    return {
      activeDurationMs,
      manualPauseCount: this.#manualPauseCount,
      manualPauseDurationMs: this.#manualPauseDurationMs,
      interruptionCandidateCount: this.#interruptionCandidateCount,
      confirmedInterruptionCount: this.#confirmedInterruptionCount,
      confirmedInterruptionDurationMs: this.#confirmedInterruptionDurationMs,
    };
  }
}
