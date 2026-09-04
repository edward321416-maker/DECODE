# DECODE Risks and Open Decisions

Updated: 2026-09-03

| Risk / blocker | Current evidence | Required action / owner |
| --- | --- | --- |
| Public disclosure and stale branch policy | Public main is canonical under D013; private/local material must stay excluded | Review allowlist/diff/links before publication; merge validated current rules/results into main |
| Planning-chat move did not persist | DECODE project and instructions exist, but project chat list is empty and planning chat metadata has projectId=null after move attempts | User manually completes/rechecks the move; do not duplicate the conversation or claim automatic sync |
| Existing untracked user work | Legacy app coexists locally but is excluded from the operating foundation | Preserve unrelated files; no blanket staging or app publication |
| Actual-test prerequisites missing | No consented real VOD or expert annotations supplied to this task | Product obtains sources, consent and expert availability before ACTUAL TEST |
| Candidate schema mistaken for fact | Eight fields/context/taxonomy/thresholds remain LOCK CANDIDATE | Pilot and explicit Product approval; no silent promotion |
| Outcome/selection/anchoring bias | Winning/losing, slot targets and AI suggestions can bias labels | Blind independent labeling; quality separated from outcomes |
| Video-only unknowns | Enemy information, LOS and comms may be absent | Permit unknowns, UNCERTAIN, INSUFFICIENT_CONTEXT and multiple-valid alternatives |
| Unsupported aggregate claims | Ten cases and four double reviews are exploratory | Report counts/denominators; no significance, accuracy or business success extrapolation |
| Dataset leakage and privacy | Real identifiers, voices and media may be sensitive | Restricted media store, pseudonyms, consent/use scope, approved access; no raw media in Git |
| Demo mistaken for live model | Excluded local demo is deterministic; public foundation contains no annotation model | Keep mock and implementation boundaries explicit; no Runtime/live API claims from publication |
| Google integrations unavailable | No designated spreadsheet/folder or verified authentication | User designates resources and authorizes connection; use pending local audit row, never claim sync |
| Prompt instructions mistaken for enforcement | Markdown cannot grant tools, permissions, erase context, or enforce a host security boundary | Host permissions/approval gates and evaluated runtime behavior remain necessary |
| Token optimization overclaim | No measured prompt/model baseline | 80–90% diff-output reduction is a target for sparse edits only, not a guarantee or result |

U-PUBLIC-2026-09-02 authorizes the public operating foundation and normal PR merge to main. It does not authorize unrelated app/private data publication, a new account/OAuth connection, API enablement, paid service, collaborator/IAM grant or destructive command. Branch protections and automated CI are not established by policy prose. Before legal/policy-sensitive data use, recheck current authoritative requirements; this is not a compliance certification.

D014 now authorizes candidate annotation implementation and a main-targeted PR, but explicitly prohibits merge before Product review. Current implementation risks: trusted local operator/OS boundary; no encrypted store or human identity proof; active timing continues until explicit pause while the server runs; snapshot quota and uncertain-write recovery; no embedded VOD/adjudication/aggregate metrics. [Guide](../annotation/README.md) and [implementation review](ANNOTATION_IMPLEMENTATION.md) distinguish tested behavior from these limitations. Do not ingest real data until Product approves the operational consent/storage/withdrawal and measurement gates.
