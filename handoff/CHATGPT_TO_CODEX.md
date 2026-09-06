# ChatGPT → Codex

Handoff ID: DECODE-M0-PR-A | Version: 1.0 | Owner: Product/Business Lead

## Current development request — M0 authority materialization → PR-A

M0 authority materialization is now MERGED. `M0_AUTHORITY_MERGE_SHA = 94252efe862d01c6441d6b0ed10fde589870b562` (PR #6, `m0/authority-materialization-2026-09-06`, merged into main). The approved authority set is confirmed present at that merge, re-verified in this post-merge receipt by exact Git blob ID and SHA-256 of Git object bytes:

- `docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md` — blob `f7571338e93a408a8aeef93d63275d7076e76f80`, SHA-256 `bfad20123a4f4263d111fc50924a04e15d8e76fdccccb666f159eea0978009ae`
- `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md` — blob `10aa423531f83a044ded273cde603a04e33c03d0`, SHA-256 `ff9b083a355d9228dcb37e4514c493e36d6090a20d2dcb1c96fc8eb83f8a6af7`
- `docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md` — blob `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0`, SHA-256 `11b42a0be56cc761a55929d642c9a5ad1d65d5a0f21d46fdf158f46b23dc2ef0`

All three match expected values exactly. `DECISIONS`, `CURRENT_STATUS`, this handoff and the pending log are reconciled in this post-merge receipt without weakening existing safeguards or touching PR #5, the publication inventory/checker, or any authority document. D014 from open PR #5 remains preserved; D015-D019 remain the 2026-09-06 authority decisions; D020 records this receipt. PR #5 is not overwritten, merged, or re-purposed and remains OPEN / NOT MERGED / non-canonical candidate.

`APPROVED_IMPLEMENTATION_BASE_SHA` = the actual `origin/main` HEAD produced by the reviewed merge of this receipt PR (PR #7). Immediately after that merge, `origin/main` is fetched and verified, and the exact SHA is recorded in the merge receipt/report — not written into repository files by a further commit, since that would move main HEAD again and create an infinite receipt loop. Only after that verified HEAD is recorded may Engineering start PLAN 1A PR-A Canonical Foundation using TDD, branching from that exact SHA; immediately before PR-A starts, `git rev-parse origin/main` is re-checked against the approved receipt SHA, and any mismatch is STOP_AND_REPORT. Material unresolved decisions must return through the Mandatory Decision Interview Gate. No automatic merge. ACTUAL TEST remains NOT YET TESTED.

## Publication inventory reconciliation

M0 `PUBLICATION_FILES` version 2 is canonical on merged main. PR #5's branch-local publication version 2 remains a non-canonical candidate; PR #5 must not be merged in its current form. Future reuse requires rebase onto post-M0 main, review of inventory/checker semantics, and adjustment to the next appropriate inventory version. This is not PR #5 merge authorization.

## HISTORICAL / DO NOT EXECUTE

The earlier 003-A-1 annotation-infrastructure request is retained only as historical provenance in [open PR #5](https://github.com/edward321416-maker/DECODE/pull/5) and Git history. It is not an active engineering queue. Do not execute it or modify, merge, or close PR #5 under this handoff. The only active sequence is M0 authority materialization → reviewed merge/receipt → PR-A Canonical Foundation. PR-A = NOT STARTED. ACTUAL TEST = NOT YET TESTED.
