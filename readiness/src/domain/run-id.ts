import { randomUUID } from "node:crypto";

export function generateReadinessRunId(): string {
  return `readiness_${randomUUID()}`;
}
