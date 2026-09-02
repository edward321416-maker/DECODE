# DECODE Public Repository and Main Policy

Version: 1.0 | Updated: 2026-09-02 | Owner: Product/Business Lead and AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Authority: U-PUBLIC-2026-09-02 / D013

## Canonical source

[edward321416-maker/DECODE](https://github.com/edward321416-maker/DECODE) is a public repository. Its `main` branch is the single Source of Truth for reviewed operating rules, approved specifications, handoffs and validated results. A feature branch, chat proposal or local file is not a substitute for current main. Product candidates remain candidates until explicitly approved; publication never promotes them.

Use scoped branches for development/review when useful. Before delivery, integrate verified current rules/results into main through the applicable PR/review workflow and identify the merged revision. Do not leave the latest accepted rules only on a branch. A user-approved routine merge does not require duplicate approval, but failed checks, conflicts, missing authority and material scope expansion must be resolved first.

## Publication gate

1. Verify the exact owner/repository, public visibility, default branch, current base/head, dirty state, repository rules and requested scope.
2. Preserve unrelated work. Inspect the entire scoped diff and the exact proposed Git tree. For the initial operating foundation, stage only [PUBLICATION_FILES.json](PUBLICATION_FILES.json); never blanket-stage the legacy app.
3. Review content conflicts as well as Git conflicts. Resolve superseded decisions explicitly, distinguish historical reports from current status, and check links against the published tree.
4. Exclude credentials, environment files, private VOD/comms, identities, consent documents, access-bearing links, private chat/task bindings and local-only audit material. Scan staged content; any finding blocks publication until safely resolved. Heuristic scanning is not a security certification.
5. Run the checks appropriate to the change and report exact scope/limits. For this documentation-only foundation, run `node scripts/check-operating-docs.mjs --index` and `git diff --cached --check`. Neither starts package scripts or an application.
6. Create a scoped PR, inspect its base/head, mergeability and applicable checks/review requirements, then perform a normal merge pinned to the reviewed head. Never force-push, bypass protections or auto-delete branches under this task's prohibition.
7. Verify the merged PR and actual main tree from GitHub, recheck the published files, and record the receipt. Keep unexecuted application/model/VOD checks NOT TESTED. Corrections use a new reviewed patch/PR, never destructive history edits.

The content-free initial main bootstrap is an explicit exception needed to create the first comparable PR in the previously empty repository. It contains no operating documents or legacy code; the foundation itself must use the verified PR route.

## Public foundation inventory and checks

The inventory lists the complete initial published file set, including the checker and this policy. It is a review boundary, not permission to publish later files. Future approved feature work may update the inventory and stage-specific assertions with an explicit diff and evidence; do not delete safeguards merely to make a check pass. In particular, an executed experiment requires the provenance/review contract, not simply removing the header-only-log assertion.

The dependency-free checker uses Node.js built-ins. Run from the repository root with Node.js and Git installed:

- `node scripts/check-operating-docs.mjs`: read allowlisted working files; validate required coverage, relative file links, UTF-8/newlines, handoff/report sections, candidates/slots, historical labels, basic privacy/secret patterns and zero recorded experiment runs at this foundation stage.
- `node scripts/check-operating-docs.mjs --index`: also require the staged tree to match the inventory and staged blobs to match inspected working files.
- `node scripts/check-operating-docs.mjs --tracked`: also require HEAD to match the inventory and committed blobs to match inspected working files.

Unknown options fail. Exit 0 means these checks passed; exit 1 reports failures or unavailable prerequisites. Fix the scoped problem and rerun; do not interpret a passed text check as model compliance, full Markdown rendering, full secret detection or external-link availability. The checker does not fetch external links or access private logs/credentials.

## Evidence and authority limits

ACTUAL TEST requires consented real VOD, independent experts, the approved method and actual recorded execution. SELF-BENCHMARK describes internal evaluation; synthetic input origin remains SIMULATED. NOT YET TESTED means unexecuted, not zero and not passed. Documentation checks belong in the operational report, not the experiment log.

This approval covers the operating foundation and verification tooling only. It does not start queued annotation development, publish the excluded local demo, add a license, change access/IAM/branch protections, enable paid services, connect OAuth/Google, or disclose raw/private data. Existing rules must always yield to stricter host safety and task constraints.

## Main handoff

Use [Current Status](CURRENT_STATUS.md) and [publication evidence](MAIN_PUBLICATION.md) for the latest operational state. Preserve earlier reports as historical records; keep private source mappings outside Git. Engineering returns the eight-section [handoff](../handoff/CODEX_TO_CHATGPT.md), then Product records the next decision against the verified main revision.
