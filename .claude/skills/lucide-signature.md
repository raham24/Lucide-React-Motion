---
name: lucide-signature
description: Author the next high-priority pending Lucide signature family for the lucide-react-motion library. Use when the user says "work on the next family", "continue signatures", "next signature family", "do the next family", "/signature", or otherwise asks Claude to extend signature coverage. Auto-detects what's next by running `pnpm --filter lucide-react-motion status --json` and cross-referencing the section 7 priority list in `docs/signatures.md`. Falls back to one-off decorative icons after all priority families are done. Follows the project's signature authoring guide end-to-end — three principles (real-life physics, cohesion, within-bounds), two-tier rule, host-keyframes coupling pattern, full validation checklist.
---

# Lucide signature authoring workflow

You're authoring the next pending signature family for `lucide-react-motion`. The user did not specify which family — you pick the highest-priority one with pending icons. Be explicit with the user about what you picked and why, then proceed.

## Step 1 — Read the authoring guide

Before anything else, read `docs/signatures.md` end-to-end. It's the source of truth. The three principles in section 1 govern every motion you write:

1. **Real-life physics first.** Each motion mimics how the real-world thing actually behaves. Generic transforms without grounding in the icon's referent feel arbitrary.
2. **Cohesion — every path tracks the host.** Both Tier 1 markers AND Tier 2 physical elements inherit the host's primary transform via `inherit: true` per-value transitions.
3. **Stay within the 24×24 viewBox.** Scale-based motion should be a contraction (`scale ≤ 1`), not an expansion — anatomically more accurate for most icons AND keeps the stroke inside the SVG (which defaults to `overflow: hidden`).

Then read existing family motions for the quality bar — `motions/bell-shell.ts`, `motions/heart-beat.ts`, `motions/bell-sound-waves.ts`, `motions/heart-pulse-line.ts`. The host-coupling pattern (section 5's worked example) is mandatory for any family whose host transforms.

## Step 2 — Find the next family

Run the coverage report:

```bash
pnpm --filter lucide-react-motion status --json
```

Parse the JSON. You'll get `families[]` with `family`, `total`, `signed`, `pending`, `status` for each.

Pick the next target using this order:

1. **Partial families with 1–2 pending icons** that are listed in the section 7 priority roadmap — finish those first (less context-switching).
2. Otherwise, the highest-priority **partial** family from section 7's order.
3. Otherwise, the highest-priority **pending** family from section 7's order.
4. If all section-7 families are done, fall back to the **one-off decorative** icons listed in section 7's "Decorative / one-off" block (sparkle*, zap, atom, compass, gauge, wind, leaf, waves, …). Pick them one at a time.
5. **Skip** the explicit "Skip / defer" list (pure-text icons, abstract geometry, brand logos). Don't author signatures for those.

Section 7's priority order (high to low):

- `heart-*`
- `clock-*` (clock, alarm-clock, timer, watch, hourglass)
- `sun-*` / `moon-*`
- `cloud-*` + `droplet*`
- `flame*` / `fire`
- `loader-*` / `refresh-*` / `rotate-*`
- `wifi-*` / `signal-*` / `volume-*`
- `battery-*`
- `mail-*` / `send`
- `mic-*` / `mic-off`
- `arrow-*` / `chevron-*` / `move-*`
- `play` / `pause` / `stop` / media controls
- `search`

Then the decoratives.

**Announce your pick** to the user before starting:

> Picking the **`<family>`** family next — N pending icon(s): `a`, `b`, `c`. Status is currently `<partial|pending>` (M/N signed).

## Step 3 — Pre-flight check

Before writing any code:

- `git status` — if the working tree has uncommitted changes, ask the user whether to proceed (they may be mid-task on something else).
- Confirm the current branch — typically `feat/animation-modes` or wherever the user has been working. Don't switch branches without asking.
- Check user memory (`MEMORY.md`) for any relevant feedback notes — especially around commit conventions and phase review cadence.

## Step 4 — Author each variant

For every pending icon in the family, follow section 4 of the doc:

1. **Inspect the paths** — open `src/generated/<icon>.tsx`, note how many paths it has, what each one represents in the real-world referent.
2. **Decide tier per path** (section 3). Remember: tier only decides what *additional* motion the path gets — both tiers inherit the host's transform.
3. **Reuse existing motions** by path-data match. If a variant reshapes the host's `d` slightly, extend the host motion's `matchPathDOneOf` list rather than writing a new motion.
4. **Make sure the host motion exports its keyframe constants** (`HEART_BEAT_KEYFRAMES`, `BELL_SHELL_KEYFRAMES` are the precedent). Other family motions inherit them.
5. **Tier 1 markers** — use the family's coupled modifier reveal (`heartModifierReveal`, `bellModifierReveal`, etc.). If the family doesn't have one yet, build it: a `matchAnyPath` motion that combines `pathLength` + `opacity` reveal with the host's primary transform via per-value `inherit: true` transitions. For circle markers, build a geometry-matched equivalent (`bellDotReveal`).
6. **Tier 2 with bespoke physics** — write a new motion under `src/modes/motions/`, named `<icon>-<role>.ts`. Design it from "how does this real-world thing actually behave?". If it sits inside or attached to a transforming host, also inherit the host's keyframes via the same per-value pattern.
7. **Write the signature** as a thin `compose()` call (`src/modes/signatures/<icon>.ts`).
8. **Don't force motion on icons where `draw` is the right answer** — if a variant has no clear physical or semantic motion, skip its signature and let it fall back to draw.

After each phase of work, **self-review before moving on** (project memory `feedback_phase_review.md`): fix issues and re-review before the next phase.

## Step 5 — Validate (code-side)

```bash
pnpm --filter lucide-react-motion generate
pnpm typecheck
pnpm --filter lucide-react-motion test
```

All three must pass. If `pnpm typecheck` fails on the first run via turbo, retry once — the prebuild generate step can race with the typecheck task.

Trace every path of every variant through the compose order and confirm no path falls through to `draw` (no dev warnings expected at runtime).

## Step 6 — Section 8 checklist

Walk through `docs/signatures.md` section 8. Code-side items are yours to confirm. The visual items are for the user — list each variant out by name so they know what to hover in `/playground`.

## Step 7 — Commit on this branch

Per project memory (`feedback_commits.md`): **no Co-Authored-By trailer.** All commits attributed solely to the user.

Subject conventions (from recent commits): `feat(lib): <family> family signatures` for a new family, `fix(lib): ...` for a refinement of an existing one. Use a HEREDOC for the body to keep multi-line formatting intact.

Stage **only the source files** you touched — `src/generated/` is gitignored and regenerated on prebuild, so generated wrappers aren't part of the commit.

Update `docs/signatures.md`'s section-6 catalog table with rows for any new motion modules.

## Step 8 — Hand back for visual review

Report to the user:

- Commit hash + subject.
- New status (`pnpm --filter lucide-react-motion status`) so they see coverage progress.
- The list of variants to hover in `/playground` with `mode="signature"` at size 56 AND 120.
- What to look for: real-life motion reads correctly, every non-shell path tracks the host, no clipping at the edges, no static modifiers floating over moving icons.

**Do not start the next family without explicit user approval.** One family per invocation. The user reviews visually, requests adjustments if needed (those become a refinement fix commit), then approves moving on.

## Common pitfalls (from `docs/signatures.md` section 9 — re-read before submitting)

- **`inherit: true` is REQUIRED on every per-value transition.** Without it, motion-dom replaces the parent transition entirely, dropping `duration`/`delay`/`repeat` and falling back to its 300 ms default — the modifier ends up out of phase with the rest of the icon.
- **`scale > 1` clips at viewBox edges.** Design scale rhythms as contractions (`scale ≤ 1`). Real things squeeze when they pulse, they don't balloon.
- **Match paths by `d` data**, never by `ctx.index` — Lucide reorders paths sometimes.
- **`matchAnyPath` is greedy.** Always last in the compose `motions` list.
- **Regenerate after writing a signature.** The codegen reads `src/modes/signatures/` at generate-time; `prebuild` and `predev` handle it automatically, but you'll need to run it manually outside those flows.
