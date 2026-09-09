export interface RehearsalArtifact {
  rehearsal: true;
  evaluationMode: "SELF_BENCHMARK";
  dataOrigin: "SIMULATED";
}

/** Every operational rehearsal result (consent, source-rights, Second
 * Expert qualification, Pilot Operator checklist) carries this artifact
 * marker explicitly on the result itself — not only in prose — so no
 * result can be mistaken for a real determination (Design Spec §7). */
export const REHEARSAL_ARTIFACT: RehearsalArtifact = Object.freeze({
  rehearsal: true,
  evaluationMode: "SELF_BENCHMARK",
  dataOrigin: "SIMULATED",
});
