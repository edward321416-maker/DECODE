# Readiness run artifacts

This directory holds sanitized, immutable `ReadinessRun` JSON artifacts produced by
`npm run readiness -- run --scenario <fixture-id> --output-dir results`.

Every file here is `EvaluationMode=SELF_BENCHMARK`, `DataOrigin=SIMULATED` evidence — a
synthetic dry rehearsal of the 10-Case ACTUAL TEST Protocol's pre-execution/structural
mechanics (D025-D037). None of it is ACTUAL TEST evidence; `ACTUAL TEST = NOT YET TESTED`
regardless of any `readiness_verdict` recorded here.

Artifacts are written with exclusive create and are never overwritten or deleted once
committed (D033) — both `DRY_READY` and `BLOCKED` runs are retained as immutable history.
A run whose frozen hashes no longer match current canonical state is stale; see
`evaluateCurrentReadiness()` rather than assuming the latest file by name is still current.
