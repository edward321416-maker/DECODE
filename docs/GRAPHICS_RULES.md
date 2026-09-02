# DECODE Graphics Rules

Version: 0.2 | Updated: 2026-09-02 | Owner: Product/Business Lead for approval; AI/Engineering Lead for implementation
Status: ACTIVE OPERATING POLICY | Scope: UI, charts, images, video and visual handoffs
Authority: user-approved rules plus U-PUBLIC-2026-09-02 in [Decisions](DECISIONS.md). Publication is authorized for the operating foundation; product-candidate promotion, annotation implementation and new visual production are not implied.

## Baseline and design approval

- GFX-01 — Inspect the actual code/assets and their approval status first. Earlier inspection of the local legacy demo found dark surfaces with lime/aqua accents in `app/globals.css`, and Manrope/DM Mono declarations in `app/layout.tsx`. Those local app files are excluded from this operating-foundation publication. These are historical demo references, not a locked Coach Copilot identity, accessibility pass or authorization to redesign. Reinspect the actual approved assets before future UI work; record later token changes centrally.
- GFX-02 — For new or materially changed visuals, state the user task, information order, constraints, affected states and intended difference. Show one representative screen with its small-screen treatment and important states for approval before expanding the visual system. Use existing approved patterns for routine scoped changes; do not require repeated approval for unchanged components. New logos, palettes, fonts or broad layout changes need explicit approval.
- GFX-03 — Track every delivered asset's ID/path, source/creator, permitted-use evidence, original hash, version, transformations, approval reference, and intended runtime binding. Distinguish existing, commissioned, stock and AI-generated assets. Unknown rights/consent or a missing required source blocks use; ask for the source or use an explicitly labeled placeholder. Recheck applicable Riot/third-party requirements before use without claiming legal clearance.
- GFX-04 — Preserve source originals and keep derivatives separate. Cropping, redaction and overlays must be recorded and must not change the meaning of evidence. AI-generated or illustrative gameplay is REFERENCE-ONLY/SIMULATED, never a replacement for actual VOD or an expert observation. Sending private media to an external generator requires authorized destination/use.

## Truthful presentation and accessibility

- GFX-05 — Show DEMO/SIMULATED and NOT YET TESTED labels close to affected values, in exports as well as screens. A marketing caption, score, progress animation or connection badge must not imply an unimplemented model or completed operation. In blind annotation, hide AI recommendations, other reviewers and expected slot answers; accessibility text must not leak those answers either.
- GFX-06 — Distinguish evidence provenance, execution state, verdict and severity with separate text labels. Color alone must not encode meaning. UNCERTAIN and INSUFFICIENT_CONTEXT are not automatically errors. Provide clear selected/focus/disabled/error/loading/empty states and a recoverable next action where applicable.
- GFX-07 — Use WCAG 2.2 AA as the engineering target for affected flows, not a claim that this app conforms. Check all applicable A/AA criteria before a conformance claim. The compact acceptance subset below is sourced from [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), checked 2026-09-02.

| Check | Acceptance subset |
| --- | --- |
| Contrast, 1.4.3 / 1.4.11 | Normal text at least 4.5:1; qualifying large text and required component/graphic indicators at least 3:1; document applicable exceptions |
| Keyboard/focus, 2.1.1 / 2.1.2 / 2.4.7 / 2.4.11 | Operable without pointer, no keyboard trap, visible focus not entirely hidden by authored content |
| Resize/reflow, 1.4.4 / 1.4.10 | Text usable at 200%; vertical content reflows at 320 CSS pixels, except intrinsically two-dimensional regions |
| Targets/dragging, 2.5.8 / 2.5.7 | Targets at least 24 by 24 CSS pixels or a documented permitted exception; non-drag alternative where required |
| Semantics, 1.1.1 / 3.3.1 / 3.3.2 / 4.1.2 / 4.1.3 | Meaningful alternatives, labeled controls, identifiable errors and programmatically exposed status |

- GFX-08 — Verify Korean glyph coverage, long labels, wrapping, enlarged text and fallback fonts in the actual environment. Do not approve typography from Latin-only mockups. Use semantic HTML text for essential labels rather than baking it into images. Do not download new fonts or replace the existing visual identity solely to satisfy a screenshot.
- GFX-09 — Charts need labeled units/scales, source/run references, sample size and a text/table equivalent. Keep missing values visibly unavailable instead of drawing zero. Do not turn ordinal confidence into a calibrated probability or display fabricated percentiles. Preserve axes and annotations needed to interpret a comparison.
- GFX-10 — Match assets to their actual display size, format, transparency and runtime path. Validate decoding, dimensions and missing-asset fallback; sanitize untrusted SVG/active content. Record file size and measured loading/rendering impact when relevant; agree performance budgets for the target device before claiming a pass. Never silently substitute an unrelated asset.

## Media, runtime and release

- GFX-11 — Keep motion subordinate to reading and decision-making. Honor reduced-motion preferences; provide pause/stop controls where applicable and avoid flashing or forced autoplay audio. Caption meaningful speech in delivered media and provide applicable media alternatives without inventing missing comms. If an alternative would compromise blind labeling, escalate the protocol conflict; do not leak the answer. For video delivery, verify actual dimensions, duration, fps, audio presence and decode behavior; unavailable evidence stays NOT YET TESTED.
- GFX-12 — Keep REFERENCE-ONLY, VISUALLY APPROVED and RUNTIME VERIFIED separate. Approval of appearance does not prove functional binding. Runtime verification needs the real route/build snapshot, asset references, viewport/device, relevant states, interaction checks and dated evidence. Redact private content in captures. A static mockup is not a runtime screenshot. Failed or unperformed required checks block a ready-to-ship claim, not safe continued design discussion.

Use [Development Rules](DEVELOPMENT_RULES.md) for implementation and [Documentation Rules](DOCUMENTATION_RULES.md) for evidence. No screen, image, logo, font, CSS or application behavior is changed by adopting this policy.
