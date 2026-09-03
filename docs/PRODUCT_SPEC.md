# DECODE Coach Copilot MVP v0.1

Scope: LOCKED | Implementation: candidate annotation infrastructure proposed; full Coach Copilot NOT IMPLEMENTED

## User and job

Primary user: a VALORANT specialist coach or a coach at a small esports academy. Help the coach find important decision moments in a student's VOD, review a grounded draft, and communicate one improvement priority. Time saving, willingness to pay, and coaching effectiveness are hypotheses, not measured outcomes.

## Intended flow

Consented VOD → semi-automatic candidate moments → AI decision draft with evidence/pro reference → coach Approve/Edit/Reject → priority #1 → shareable report → next VOD → coach marks Improved/Same/Worse and adds a note.

Candidate selection may be manual while automation is immature. AI drafts are never expert ground truth. Follow-up is coach judgment, not automatic proof of skill improvement.

## Planning baseline: four surfaces

| Surface | Minimum responsibility |
| --- | --- |
| Players | Student, recent review, current priority, new VOD |
| Review Workspace | Clip, context, observed decision, proposed principle/reason, evidence, Approve/Edit/Reject |
| Report Builder | What happened, why it matters, what to do next; coach-selected priority |
| Follow-up | Prior priority, next VOD, Improved/Same/Worse, coach note |

These are P-MVP planning requirements, not descriptions of existing screens. First engineering delivery is the annotation/testing foundation in the handoff, not all four surfaces.

## Scope boundaries

- Analyze only Fight Selection, Post-contact Decision, and Tradeability & Spacing.
- Preserve the existing B2C demo without treating Player DNA/PIR/mock reports as Coach Copilot validation.
- No fully automatic growth loop, comprehensive match understanding, rank prediction, team intelligence, or production Riot dependency in this phase.
- No model training or Alpha 50/150 generation before the stress-test decision gate.
- Keep source clips, player identifiers, voice/comms and consent records in access-controlled storage; repository contains sanitized references, not raw personal data.

## Distinct labeling workflows

Gold dataset: independent expert watches evidence → labels → label lock → optional AI comparison. Product pilot: AI draft → coach Approve/Edit/Reject. Never silently combine these into one evaluation set.

## Architecture boundary

P-MVP discusses Next.js, FastAPI, PostgreSQL, FFmpeg and retrieval. Only the manifest facts in [CURRENT_STATUS](CURRENT_STATUS.md) describe the inspected implementation. Choose further implementation dependencies only when required by an approved request; no installation or service startup is authorized by merely parsing a manifest.
