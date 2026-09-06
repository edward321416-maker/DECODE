# ChatGPT → Codex

Handoff ID: DECODE-M0-PR-A | Version: 1.0 | Owner: Product/Business Lead

## Current development request — M0 authority materialization → PR-A

Start only from verified public main `e8e835718a9f95f02ce81682da2092db81249816`. First materialize the approved authority set exactly:

- `docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md` — expected SHA-256 `bfad20123a4f4263d111fc50924a04e15d8e76fdccccb666f159eea0978009ae`
- `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md` — expected SHA-256 `ff9b083a355d9228dcb37e4514c493e36d6090a20d2dcb1c96fc8eb83f8a6af7`
- `docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md` — expected SHA-256 `11b42a0be56cc761a55929d642c9a5ad1d65d5a0f21d46fdf158f46b23dc2ef0`

Reconcile `DECISIONS`, `CURRENT_STATUS`, publication inventory/checker and this handoff. Preserve D014 from open PR #5 and use D015+ for the 2026-09-06 authority decisions. Do not overwrite, merge, or re-purpose PR #5. Its latest externally verified state remains OPEN / NOT MERGED at head `e3d37e42c129498ddbdf7810ce6dfecf61d9e8f5`.

Run the repository publication checks and inspect the whole M0 diff. Record exact commit SHA and content hashes. Mismatch => `STOP_AND_REPORT`. After reviewed M0 merge, the new main becomes `APPROVED_IMPLEMENTATION_BASE_SHA` for PR-A.

Only after reviewed M0 merge and an exact post-merge receipt may Engineering start PLAN 1A PR-A Canonical Foundation using TDD. Material unresolved decisions must return through the Mandatory Decision Interview Gate. No automatic merge. ACTUAL TEST remains NOT YET TESTED.

## Publication inventory reconciliation

After reviewed M0 merge, M0 `PUBLICATION_FILES` version 2 is canonical. PR #5's branch-local publication version 2 remains a non-canonical candidate; PR #5 must not be merged in its current form. Future reuse requires rebase onto post-M0 main, review of inventory/checker semantics, and adjustment to the next appropriate inventory version. This is not PR #5 merge authorization.

## HISTORICAL / DO NOT EXECUTE

The earlier 003-A-1 annotation-infrastructure request is retained only as historical provenance in [open PR #5](https://github.com/edward321416-maker/DECODE/pull/5) and Git history. It is not an active engineering queue. Do not execute it or modify, merge, or close PR #5 under this handoff. The only active sequence is M0 authority materialization → reviewed merge/receipt → PR-A Canonical Foundation. PR-A = NOT STARTED. ACTUAL TEST = NOT YET TESTED.
