# Signature animations — authoring guide

This is the contributor-facing reference for writing `mode="signature"`
animations. It describes the architecture, the two-tier rule the
project follows, the step-by-step workflow for adding a signature, and
a roadmap of which icon families to tackle next.

> Read this end-to-end before authoring your first signature. Three
> things in particular matter and trip people up: matching paths by
> data not by index, picking the right tier per path, and reusing
> motions across variants instead of re-typing physics.

---

## 1. Goals & principles

Every Lucide icon should eventually have a unique, true-to-life
animation when consumers set `mode="signature"`. The bar is the bell:
the shell rocks from its top mount, the clapper swings as a free
pendulum inside, sound waves radiate outward from the mount. Each
motion is physics-aware and characteristic to what the icon depicts.

Three principles govern every motion in this library — read these
before authoring or reviewing a signature, and re-read them when a
motion you wrote doesn't feel right:

**1. Real-life physics first.** Each motion mimics how the real-world
thing actually behaves. A heart contracts during systole (the icon
should squeeze inward, not balloon out). A bell rocks from its top
mount. Sound waves radiate outward from the source. Stars twinkle,
flames flicker, EKG traces draw at constant paper-tape speed. Generic
transforms (scale, rotate, translate) without grounding in the icon's
real-world referent feel arbitrary — design from the question *"how
does this physically behave in reality?"* before you reach for a
keyframe array.

**2. Cohesion — every path tracks the host.** A modifier (`+`, `−`,
`×`, `✓`, slash, notification dot, crack zigzag, EKG trace) sitting
statically over a moving host reads as clip art floating over an
animation. Every non-shell path in a signed icon inherits the host's
primary transform via the host-keyframes pattern (section 5's
*"Coupling every non-shell path to the host's motion"*) — and that
applies to **both** Tier 1 UI markers and Tier 2 physical elements,
not just Tier 2. If the bell rocks, the `+` rocks with it. If the
heart contracts, the EKG line contracts with it.

**3. Stay within the 24×24 viewBox.** SVGs default to
`overflow: hidden`, so any motion that pushes the stroke past the
viewBox edges visibly clips at runtime. For scale-based motion this
usually means designing the rhythm as a contraction (`scale ≤ 1`)
rather than an expansion — and that's anatomically more accurate for
most icons anyway (real hearts squeeze, real bells stay the same size
while they rock).

Icons without a registered signature fall back to `mode="draw"` (the
default stroke-on) and emit a one-time dev warning, so coverage gaps
are visible during development but never break consumer apps.

## 2. How signatures work

A **signature** is a `Mode` value associated with a specific icon. The
generated wrapper for that icon (`src/generated/<name>.tsx`) imports
its signature and forwards it to `<DrawIcon signature={signature} />`.
When the consumer sets `mode="signature"`, the engine resolves to that
Mode and calls its factory once per path in the icon.

Signatures are built by composing **Motion modules**. A Motion is a
small self-describing per-path animation:

```ts
interface Motion {
  matches: (ctx: ModeContext) => boolean;     // does this motion drive this path?
  factory: (ctx: ModeContext) => Variants;    // how does the path animate?
}
```

The `compose()` helper assembles motions into a Mode. At render time,
the engine iterates over the icon's paths and calls the signature's
factory for each one. The factory tries each Motion's `matches`
predicate in order; the first that returns true provides the variants.
Paths that don't match anything fall back to the default `"draw"`
factory and emit a dev warning.

### File layout

```
packages/lucide-react-motion/src/modes/
├── types.ts              Mode, ModeContext, Motion type definitions
├── compose.ts            compose(), matchPathD, matchPathDOneOf, matchAnyPath
├── resolve.ts            resolveMode() — picks the right Mode at render time
├── draw.ts               The default stroke-on draw factory
│
├── generic/              Named modes (mode="pulse" etc.)
│   ├── pulse.ts
│   ├── spin.ts
│   ├── shake.ts
│   └── bounce.ts
│
├── motions/              Per-path animation modules — the reusable units
│   ├── atom/
│   │   └── spin.ts       Tiny shared factories (spin math used by sun/loader/...)
│   │
│   ├── bell-shell.ts     Bell family — host (exports BELL_SHELL_KEYFRAMES)
│   ├── bell-clapper.ts
│   ├── bell-sound-waves.ts          rocks with shell (Tier 2)
│   ├── bell-modifier-reveal.ts      ±/✓/slash reveal + rocks with shell (Tier 1)
│   ├── bell-dot-reveal.ts           circle reveal + rocks with shell (Tier 1)
│   │
│   ├── heart-beat.ts     Heart family — host (exports HEART_BEAT_KEYFRAMES)
│   ├── heart-pulse-line.ts          EKG draw + beats with heart (Tier 2)
│   ├── heart-handshake-clasp.ts     whole-icon pulse (Tier 2; merged path)
│   ├── heart-modifier-reveal.ts     crack/+/-/×/slash reveal + beats with heart (Tier 1)
│   │
│   ├── modifier-reveal.ts  Generic (no host coupling) — reserved for hosts
│   │                       whose primary motion is itself a pure draw
│   │
│   ├── eye-blink.ts      Singleton hosts
│   ├── star-twinkle.ts
│   ├── sun-ray-pulse.ts  Sun family — wildcard ray-radiation pulse
│   ├── moon-glow.ts                  sun-moon's reflected-light crescent (Tier 2)
│   ├── snowflake-twinkle.ts          sun-snow's ice-crystal sparkle (Tier 2)
│   └── loader-spin.ts
│
└── signatures/           One file per signed icon; thin compose() calls
    ├── bell.ts
    ├── bell-plus.ts
    ├── bell-minus.ts
    ├── bell-check.ts
    ├── bell-off.ts
    ├── bell-ring.ts
    ├── bell-dot.ts
    ├── heart.ts
    ├── eye.ts
    ├── star.ts
    ├── sun.ts
    └── loader.ts
```

### Match helpers

Three helpers cover almost every case:

```ts
matchPathD("M3.262 15.326…")     // matches one specific <path> by its d
matchPathDOneOf(d1, d2, d3)      // matches any of several known d strings
matchAnyPath                     // matches every path (whole-icon motion)
```

For non-path SVG elements (`<circle>`, `<rect>`, `<line>`), write a
custom predicate that inspects `ctx.pathTag` and `ctx.pathAttrs`.
Attribute values are typed `string | number`, so wrap in `String(...)`
to compare defensively — Lucide emits them as strings today but the
type allows either:

```ts
matches: (ctx) =>
  ctx.pathTag === "circle" &&
  String(ctx.pathAttrs.cx) === "18" &&
  String(ctx.pathAttrs.r) === "3",
```

### What `ctx` carries

```ts
interface ModeContext {
  iconName: string;                                // "bell", "heart", …
  index: number;                                   // path index in the icon
  pathTag: string;                                 // "path", "circle", …
  pathAttrs: Record<string, string | number>;      // the path's attrs
  duration: number;                                // resolved timing
  delay: number;
  stagger: number;
  easing: Easing | Easing[];
  repeat: number;
}
```

`duration`/`delay`/`stagger`/`easing`/`repeat` are fully resolved by
the time the factory runs (per-icon prop > `MotionIconConfig` >
mode-preferred defaults > engine defaults). Factories use them
verbatim — never hand-roll prop fallbacks inside a motion.

## 3. The two-tier rule

The single most important judgment call when authoring a signature.
For each non-base path in an icon, classify it into one of two tiers
— but note up-front that **every path, regardless of tier, inherits
the host's primary transform** (principle 2 from section 1). The tier
decides what *additional* motion the path gets; it never decides
whether the path moves with the host.

**Tier 1 — UI / state markers.** Plus, minus, check, ×, slash,
off-mark, dot indicator, badge, etc. These are abstract semantic
decorations whose purpose is to *signify a state* (added, removed,
confirmed, silenced, has-notification). They don't represent anything
physical, so they don't get bespoke physics — they reveal quietly
(`pathLength` + `opacity` for paths; `scale` + `opacity` for circles).

Use the family's **coupled** modifier reveal — `heartModifierReveal`,
`bellModifierReveal`, etc. — which combines the quiet reveal with the
host's primary transform inherited via `inherit: true` per-value
transitions (see section 5). Drop these last in the compose `motions`
list (after any base-shape motions) since they `matchAnyPath`. For
circle markers (notification dots) build the family's geometry-matched
equivalent (`bellDotReveal`).

Generic `modifierReveal` / `dotReveal` (no host coupling) stay
available for the rare case of a family whose host motion is itself a
pure draw — but for any family whose host transforms, build a
family-specific reveal.

**Tier 2 — Real-life-grounded elements.** Sound waves, flames, water
drops, smoke, sparkles, light rays, electricity, lightning bolts,
cracks, EKG traces — anything that depicts an actual physical
phenomenon. These get bespoke motion that mimics how the real thing
behaves: sound waves radiate outward, flames flicker, water drops
fall, smoke drifts upward, hearts contract, cracks split. The motion
*is* the icon's character.

If a Tier 2 element sits visually inside or attached to a transforming
host (e.g. `heart-pulse`'s EKG trace passes through the heart,
`heart-crack`'s zigzag sits on the heart's surface,
`bell-ring`'s sound waves hang off the bell mount), it ALSO inherits
the host's primary transform via the same per-value `inherit: true`
pattern — its bespoke physics and the host's motion run together
through motion's per-value transitions. Otherwise it'll float
statically over the moving host (see section 5).

**Concrete examples already in the codebase:**

| Path | Tier | Motion |
| --- | --- | --- |
| The bell shell + clapper | **host** | `bellShell` + `bellClapper` (pendulum physics; shell exports `BELL_SHELL_KEYFRAMES`) |
| `bell-plus` / `-minus` / `-check` / `-off`'s modifiers | 1 | `bellModifierReveal` — reveal + rocks with shell |
| `bell-dot`'s dot circle | 1 | `bellDotReveal` — circle reveal + rocks with shell |
| `bell-ring`'s sound waves | **2** | `bellSoundWaves` — radiates outward; also rocks with shell |
| `bell-electric`'s dome + base | **host** | `bellElectricBody` (rapid in-place buzz instead of pendulum rock; exports `BELL_ELECTRIC_BODY_KEYFRAMES`) |
| `bell-electric`'s signal arcs | **2** | `bellElectricSignal` — double-pulse radiation from the dome; also rocks with body |
| `bell-electric`'s contact button | 1 | `bellElectricButton` — opacity press-feedback; also rocks with body |
| `bell-electric`'s center spark | 1 | `bellElectricSpark` — scale + opacity flash in place; also rocks with body |
| The heart outline | **host** | `heartBeat` (lub-dub contraction; exports `HEART_BEAT_KEYFRAMES`) |
| `heart-plus` / `-minus` / `-x` / `-off`'s modifiers + `heart-crack`'s crack | 1 | `heartModifierReveal` — reveal + beats with heart |
| `heart-pulse`'s EKG trace | **2** | `heartPulseLine` — linear paper-tape draw; also beats with heart |
| `heart-handshake`'s merged heart+hands | **2** | `heartHandshakeClasp` — single soft pulse on a merged path |
| `sun-dim` / `sun-medium`'s body + rays | **2** | `sunRayPulse` — scale-outward + opacity dim, staggered so the rays cascade outward from the sun's centre |
| `sun-moon`'s moon crescent | **2** | `moonGlow` — opacity-only (reflects light, doesn't radiate) |
| `sun-moon`'s sun rays + quarter-arc | **2** | `sunRayPulse` — radiates with the same cascade as `sun-dim`/`sun-medium` |
| `sun-snow`'s snowflake arms | **2** | `snowflakeTwinkle` — opacity double-pulse sparkle, negligible scale wobble for cohesion |
| `sun-snow`'s sun half-arc + rays | **2** | `sunRayPulse` — signature pivots at (10, 12), the sun's actual centre, so rays radiate cleanly from it |

When in doubt, ask: "does this path depict an actual physical thing
that has its own motion in the real world, or is it a marker?" If the
former, design Tier 2 motion. If the latter, use the family's coupled
modifier reveal. **Either way, the path inherits the host transform.**

## 4. Authoring workflow

The end-to-end process for adding a signature to one icon. Repeat per
icon in the family you're working on.

### Step 1 — Inspect the icon

Open `src/generated/<icon-name>.tsx`. Look at the `nodes` array. Note:

- How many paths the icon has
- The `d` string (or geometry for `<circle>` / `<rect>`) of each
- Which path represents what in the real-world thing the icon depicts

Compare visually if needed — `https://lucide.dev/icons/<name>` shows
the rendered icon, or render it locally via the playground.

### Step 2 — Decide per-path motion

For each path, ask in order:

1. **Does an existing motion module already match this path?** Check
   `src/modes/motions/`. Look for matching `d` strings or matching
   element geometry. If yes → just import it and move on.

2. **Is this path the host shape (or a variant of it)?** Match it via
   the family-base motion (`heartBeat`, `bellShell`, …). If a Lucide
   variant reshapes the host's `d` slightly (e.g. `bell-plus` carves
   out a corner), extend the motion's `matchPathDOneOf` list with the
   new `d`. While you're there, make sure the host motion exports its
   keyframe constants (`HEART_BEAT_KEYFRAMES`, `BELL_SHELL_KEYFRAMES`,
   …) so other family motions can inherit them.

3. **Is this a Tier 1 marker?** Use the family's coupled modifier
   reveal — `heartModifierReveal`, `bellModifierReveal`, etc. — which
   reveals the path AND inherits the host's transform via
   `inherit: true` per-value transitions. If the family doesn't have
   one yet, build it: a `matchAnyPath` motion that does
   `pathLength` + `opacity` reveal plus the host's primary keyframes
   per-value (see section 5's worked example). For circle markers,
   build a geometry-matched equivalent (`bellDotReveal`).

4. **Is this Tier 2 with bespoke physics?** Write a new motion module
   under `src/modes/motions/`. Name it `<icon>-<role>.ts` (e.g.
   `flame-core`, `clock-hour-hand`). If it sits inside or attached to
   a transforming host, also inherit the host's keyframes via the same
   per-value `inherit: true` pattern — its physics plays *with* the
   host, not *over* it.

### Step 3 — Write any new motion modules

Each module exports a single `Motion` value. Match strictly by path
data. Animate using `ctx` for all timing. Document the motion's intent
in a top-of-file JSDoc and reference which icons consume it.

Example skeleton (hypothetical — `flame` doesn't have a signature yet;
this is what one might look like):

```ts
import { matchPathD, type Motion } from "../compose";

const FLAME_CORE_D = "M…"; // paste from src/generated/flame.tsx

export const flameCore: Motion = {
  matches: matchPathD(FLAME_CORE_D),
  factory: (ctx) => ({
    rest:   { scale: 1, opacity: 1 },
    active: {
      scale:   [1, 1.08, 0.95, 1.05, 1],
      opacity: [1, 0.7, 1, 0.85, 1],
      transition: {
        duration: ctx.duration,
        delay:    ctx.delay + ctx.index * ctx.stagger,
        ease:     "easeInOut",
        repeat:   ctx.repeat,
      },
    },
  }),
};
```

For real reference, read any of the existing `motions/*.ts` files —
`bell-clapper.ts` and `bell-sound-waves.ts` are particularly good
examples of physics-aware Tier 2 motion.

### Step 4 — Write the signature

`src/modes/signatures/<icon>.ts`. Thin compose() call:

```ts
import { compose } from "../compose";
import { flameCore } from "../motions/flame-core";
import { flameOuter } from "../motions/flame-outer";

/**
 * Flame flickers — inner core wobbles faster than the outer tongue,
 * mimicking the way a real flame's heart is more active than its
 * envelope.
 */
export default compose({
  motions: [flameCore, flameOuter],
  defaults: { duration: 1.0, easing: "easeInOut", stagger: 0 },
  // No transformOrigin override — flame scales around the icon center.
});
```

Put more specific motions earlier in the list. Wildcard
(`matchAnyPath`) motions go last.

### Step 5 — Regenerate

```bash
pnpm --filter lucide-react-motion generate
```

The codegen detects the new signature file and re-emits the icon's
generated wrapper with the signature import + `signature={signature}`
prop wired up.

### Step 6 — Validate

```bash
pnpm typecheck     # from repo root, fans out to all workspaces
pnpm --filter lucide-react-motion test
```

Both should pass before you ask for review.

### Step 7 — Visual review

Open `/playground` and use the mode toggle next to the search bar to
set `signature`. Search for the icon(s) you added. Hover each one and
verify the animation reads correctly. Things to check:

- Does the motion match what the real-world thing does?
- Are Tier 1 modifiers quiet enough that they don't compete with the
  host motion?
- Does the icon respect the duration / easing without feeling
  abruptly cut off?
- Try it at `size={56}` AND `size={120}` — some motions look great
  small but exaggerated when large (or vice versa).
- Try a few triggers (hover, click) to make sure replay feels right.

### Step 8 — Hand off for review

Commit the new motions + signatures. The user reviews the family
visually and either signs off or requests adjustments. After sign-off,
move to the next family.

## 5. Worked example — the bell family

Reference implementation. Open these files in tandem when reading this
section: `src/modes/motions/bell-*.ts` and
`src/modes/signatures/bell-*.ts`.

The Lucide bell has two paths that recur across most variants:

- `M10.268 21a2 2 0 0 0 3.464 0` — the clapper bob (small curve at the
  bottom)
- `M3.262 15.326…` — the bell shell (the body)

Each variant adds modifier paths on top of these two:

| Variant | Adds |
| --- | --- |
| `bell-plus` | `+` (two short lines) |
| `bell-minus` | `−` (horizontal line) |
| `bell-check` | `✓` (checkmark) |
| `bell-off` | `/` (diagonal slash) |
| `bell-ring` | two sound-wave arcs |
| `bell-dot` | small `<circle>` notification |

Some variants reshape the base shell to make room for the modifier
(`bell-off` has a split shell, `bell-plus` carves out the top-right
corner). The `bellShell` motion lists all known shell `d` strings in a
`matchPathDOneOf` so every variant inherits the same rocking physics.

**Base bell** (`signatures/bell.ts`):

```ts
import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";

export default compose({
  motions: [bellClapper, bellShell],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",   // top mount, not icon center
});
```

**Tier 1 variants** — every `*-plus`, `*-minus`, `*-check`, `*-off`
ends up identical except for the modifier intent. The same motions
list works because `modifierReveal` is `matchAnyPath` (it catches
whatever's left after clapper + shell match):

```ts
// signatures/bell-plus.ts (bell-minus, bell-check, bell-off are identical)
import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { modifierReveal } from "../motions/modifier-reveal";

export default compose({
  motions: [bellClapper, bellShell, modifierReveal],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
```

**Tier 1 variant with a circle** — `bell-dot` has a notification dot
that's a `<circle>`, not a path. `dotReveal` matches it by geometry:

```ts
// signatures/bell-dot.ts
import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { dotReveal } from "../motions/dot-reveal";

export default compose({
  motions: [bellClapper, bellShell, dotReveal],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
```

**Tier 2 variant** — `bell-ring` has actual sound waves that need
radiation physics. Bespoke motion:

```ts
// signatures/bell-ring.ts
import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { bellSoundWaves } from "../motions/bell-sound-waves";

export default compose({
  motions: [bellClapper, bellShell, bellSoundWaves],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
```

`bellSoundWaves` matches the two wave `d` strings via
`matchPathDOneOf` and scales each wave from 0 around the bell's mount
pivot — so the waves visually emerge from where the bell hangs and
propagate outward, the way real sound waves do.

**Result**: six variants, ~80 lines of new code, zero re-typed bell
physics. The shared motion modules are the single source of truth.

### Coupling every non-shell path to the host's motion

When a host shape moves (scale, rotate, translate), anything else in
the icon that doesn't follow visually "floats" over a moving shape
and reads as disconnected. The fix isn't to limit it to Tier 2
internals — *every* non-shell path in the icon, including Tier 1
markers like +, −, ×, and the off-slash, should track the host so the
icon reads as one cohesive unit through the animation.

Convention: each host motion exports its keyframe constants, and any
family-specific reveal motion imports them and applies them via
motion's per-value `transition` so its own animated properties
(reveal, draw, opacity) can keep their independent timing.

```ts
// motions/heart-beat.ts
export const HEART_BEAT_KEYFRAMES = {
  scale: [1, 0.85, 1, 0.9, 0.95, 1],
  times: [0, 0.15, 0.3, 0.45, 0.6, 1],
};

// motions/heart-modifier-reveal.ts
import { HEART_BEAT_KEYFRAMES } from "./heart-beat";

export const heartModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      scale: HEART_BEAT_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // `inherit: true` is required — per-value transitions replace
        // the parent entirely unless this flag is set, which would drop
        // duration/delay/repeat and fall back to motion-dom's defaults.
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.2, 0.55] },
        opacity:    { inherit: true, ease: "easeOut", times: [0, 0.2, 0.55] },
        // Scale piggybacks on the host's keyframes — every non-shell
        // path beats together with the heart.
        scale:      { inherit: true, ease: ctx.easing, times: HEART_BEAT_KEYFRAMES.times },
      },
    },
  }),
};
```

The host motion stays the single source of truth for "what the beat
looks like." Family-specific reveals only have to think about *their*
draw behavior. Reapply this pattern for every family with a primary
transform: build a `<family>ModifierReveal` (wildcard) that piggybacks
the host's keyframes, and the variants compose to
`[host, <family>ModifierReveal]`. Generic `modifierReveal` (no host
coupling) stays available for families whose host motion is itself a
pure draw — but for any family whose host transforms, prefer the
family-specific reveal.

The bell family follows the same pattern with `BELL_SHELL_KEYFRAMES`
(rotate / times / ease arrays) and a `bellModifierReveal` that
piggybacks the shell's damped rock onto the +/−/✓/off-slash strokes.
`bellDotReveal` does the same for the `<circle>` notification dot in
`bell-dot`, and `bellSoundWaves` in `bell-ring` also picks up the
shell's rotation so the sound waves stay anchored to the swinging
mount as they radiate outward.

## 6. Reusable motions currently available

When authoring a new signature, check this list first. If an existing
motion matches the path you're animating, just import and reuse.

| Module | Matches | Animates |
| --- | --- | --- |
| `motions/bell-clapper.ts` | Bell clapper d | Wider damped pendulum, ~6 swings |
| `motions/bell-shell.ts` | All known bell shell d variants | Gentle damped rotation, ~3.5 swings. Exports `BELL_SHELL_KEYFRAMES` for other bell-family motions to inherit. |
| `motions/bell-sound-waves.ts` | Bell-ring wave d's | Radiating pulses out from origin; rotate follows the host `bellShell` so the waves stay anchored to the swinging mount (Tier 2) |
| `motions/bell-modifier-reveal.ts` | `matchAnyPath` (wildcard) | Delayed `pathLength` + `opacity` reveal that also rotates with the host `bellShell`. Used for every non-shell non-clapper bell-family path — +, −, ✓, off-slash — so they stay anchored through the swing |
| `motions/bell-dot-reveal.ts` | Circle at cx=18,cy=5,r=3 | Scale + opacity for notification dots; rotate follows the host `bellShell` so the dot rocks with the bell (Tier 1) |
| `motions/bell-electric-body.ts` | Bell-electric dome circle + base rect | High-frequency low-amplitude buzz rotation around the dome center, ~5 micro-swings. Exports `BELL_ELECTRIC_BODY_KEYFRAMES` for the rest of the bell-electric family to inherit. Different physics from `bellShell` — electric bells vibrate in place rather than swinging from a mount. |
| `motions/bell-electric-signal.ts` | Bell-electric's two signal-arc d's | Double-pulse radiation scaled from the dome center; rotate follows the host `bellElectricBody` so the arcs stay anchored to the buzzing bell (Tier 2; faster cadence than `bellSoundWaves` to read as electric vs acoustic) |
| `motions/bell-electric-button.ts` | Circle at cx=20,cy=16,r=2 | Opacity-only press-feedback pulse (no scale so it stays anchored off-center); rotate follows the host `bellElectricBody` (Tier 1) |
| `motions/bell-electric-spark.ts` | `M9 9h.01` center-dot d | Scale + opacity flash in place at the bell's core (Lucide degenerate-dot path); rotate follows the host `bellElectricBody` (Tier 1) |
| `motions/modifier-reveal.ts` | `matchAnyPath` (wildcard) | Generic pathLength + opacity draw-in, no host coupling. Reserved for future families whose host motion is itself a pure draw — every family with a transforming host should build its own coupled variant (see `bellModifierReveal`, `heartModifierReveal`). |
| `motions/heart-beat.ts` | All known heart shell d variants (heart, heart-crack, heart-minus, heart-plus, heart-x, heart-pulse base, heart-off fragments) | Lub-dub scale beat (Tier 2) |
| `motions/heart-handshake-clasp.ts` | Heart-handshake's single merged d | Gentle whole-icon "shared warmth" pulse (Tier 2; merged path forces a whole-icon gesture) |
| `motions/heart-pulse-line.ts` | Heart-pulse's EKG waveform d | Linear `pathLength` sweep that draws the trace left-to-right; scale follows the host `heartBeat` so the line breathes with the heart (Tier 2) |
| `motions/heart-modifier-reveal.ts` | `matchAnyPath` (wildcard) | Delayed `pathLength` + `opacity` reveal that also scales with the host `heartBeat`. Used for every non-shell heart-family path — crack, ±, ×, off-slash — so they stay anchored through the beat |
| `motions/eye-blink.ts` | `matchAnyPath` for eye | scaleY collapse + return |
| `motions/star-twinkle.ts` | Star base d | Combined rotate + scale + opacity |
| `motions/sun-ray-pulse.ts` | `matchAnyPath` (wildcard) | Per-path scale-outward + opacity dim with stagger. Used as the catch-all in every sun signature (`sun`, `sun-dim`, `sun-medium`, sun parts of `sun-moon` and `sun-snow`) so the rays cascade outward from the sun's centre — light radiating from the surface (Tier 2) |
| `motions/moon-glow.ts` | Sun-moon's moon crescent d | Opacity-only soft dim/glow with no scale (moon reflects light, doesn't radiate; off-centre crescent shouldn't translate when the signature pivots for the sun) (Tier 2) |
| `motions/snowflake-twinkle.ts` | Sun-snow's 5 snowflake d's | Sharp opacity double-pulse + barely-perceptible scale wobble — ice crystals sparkle by reflection, not by changing size (Tier 2) |
| `motions/loader-spin.ts` | `matchAnyPath` for loader | Infinite rotation (via `atom/spin`) |
| `motions/atom/spin.ts` | (factory only, no matches) | Pure rotation math; reused by `spin` Mode + `loader-spin` |

Update this table when you add a new motion module.

## 7. Family roadmap

Before picking a family to work on, run the coverage report to see
what's already done and what's outstanding:

```bash
pnpm --filter lucide-react-motion status        # human-readable
pnpm --filter lucide-react-motion status --all  # include every pending family
pnpm --filter lucide-react-motion status --json # for tooling
```

The report groups every Lucide icon by family (first hyphen segment) and
labels each family **done**, **partial**, or **pending**. It's sourced
directly from `src/modes/signatures/`, so it never goes stale.

The list below is a suggested **priority order** for tackling pending
families — picked for impact and motion clarity, not exhaustive. Use the
status command for what's left; use this list for what to do next. Each
family is self-contained — finish one, get review, then start the next.

**Tier-2-rich families (highest impact):**

1. **`heart-*`** — heart, heart-crack, heart-handshake, heart-off,
   heart-pulse. Already have base `heartBeat`. Variants need: crack-
   line reveal (Tier 1), handshake clasp (Tier 2?), off-slash (Tier
   1), pulse-line (Tier 2 ECG-style sweep).

2. **`clock-*`** — clock, clock-{1..12}, alarm-clock, alarm-clock-*,
   timer, timer-*, watch, hourglass. Each clock variant needs hour-
   hand (slow tick) and minute-hand (faster tick) animated
   independently; face is static. Hourglass is its own thing (sand
   fall, Tier 2).

3. **`sun-*` / `moon-*`** — sun, sunrise, sunset, sun-medium, sun-
   snow, sun-dim, sun-moon, moon, moon-star. Sun family done. The
   sun family uses `sunRayPulse` (per-path scale-outward + opacity
   cascade) for all variants; composite icons (`sun-moon`,
   `sun-snow`) layer element-specific motions on top (`moonGlow`,
   `snowflakeTwinkle`). The moon family is still pending; expect a
   gentle reflected-light glow on the crescent and a Tier 2 twinkle
   for moon-star.

4. **`cloud-*` + `droplet*`** — cloud, cloud-drizzle, cloud-fog,
   cloud-hail, cloud-lightning, cloud-rain, cloud-snow, cloud-sun,
   droplet, droplets, umbrella. Tier 2 cloud drift, Tier 2 rain fall,
   Tier 2 lightning flash.

5. **`flame*` / `fire`** — flame, flame-kindling, fire, candle (if
   present). Tier 2 flicker on each flame layer.

6. **`loader-*` / `refresh-*` / `rotate-*`** — loader-circle, loader-
   pinwheel, refresh-ccw, refresh-cw, rotate-cw, rotate-ccw, repeat-
   *. Most reuse infinite-spin. Refresh icons may have a partial-arc
   variant.

7. **`wifi-*` / `signal-*` / `volume-*`** — wifi, wifi-{high,low,off,
   zero}, signal, signal-{high,low,medium,zero}, volume, volume-x,
   volume-1, volume-2. Tier 2 wave/bar radiation from center
   outward.

**Tier-1-dominant families (medium impact):**

8. **`battery-*`** — battery, battery-charging, battery-full, battery-
   low, battery-medium, battery-warning. Cell-fill cascade is Tier 2
   (state-aware fill animation).

9. **`mail-*` / `send`** — mail, mail-open, mail-plus, send, send-
   horizontal. Envelope flap is Tier 2; send is paper-plane flight.

10. **`mic-*` / `mic-off`** — microphone pulsing during active state,
    cross-out for off variant.

**Directional and UI families (lower impact, can be done fast in
batches):**

11. **`arrow-*` / `chevron-*` / `move-*`** — small directional
    nudge in the indicated direction. Could share a `directional-
    nudge` motion module.

12. **`play` / `pause` / `stop` / media controls** — subtle motion
    on activation (play has the famous "morph to pause" — out of
    scope, just animate stroke).

13. **`search`** — magnifying glass wobble or scan.

**Decorative / one-off (do as opportunistic):**

- `sparkle*` / `sparkles` — twinkle (reuse `starTwinkle`?)
- `zap` — lightning flash
- `atom` — orbiting electrons
- `compass` — needle rotation
- `gauge` — needle sweep
- `wind` — drift lines
- `leaf` — fall + spin
- `waves` — oscillation

**Skip / defer:**

- Pure-text icons (`type`, `a-arrow-up`, etc.) — no clear motion.
- Highly abstract icons (`shapes`, `dashes`, generic geometry) — fall
  back to draw is fine.
- Brand logos (if present) — no animation expected.

## 8. Validation & review checklist

Before asking for review on a family:

- [ ] `pnpm --filter lucide-react-motion generate` runs without
      errors and reports the new icon count with signatures.
- [ ] `pnpm --filter lucide-react-motion status` shows the family
      transitioned from *partial* (or *pending*) to *done*. If any
      icons are intentionally skipped (per section 7's "skip / defer"
      list), note that in the review handoff.
- [ ] `pnpm typecheck` from repo root — all three turbo tasks pass.
- [ ] `pnpm --filter lucide-react-motion test` — all resolver tests
      pass.
- [ ] No unexpected console warnings in dev (the
      `[lucide-react-motion]` ones are intentional but should only
      fire for icons you intentionally haven't covered yet).
- [ ] Visual: open `/playground`, toggle to `signature` mode, hover
      every icon in the family. Each should animate.
- [ ] Visual: each Tier 2 motion *reads as the real thing* (sound
      radiates, flames flicker, hearts beat). No "just scaling" or
      generic motion where physics is expected.
- [ ] Visual: each Tier 1 modifier is quiet enough not to compete
      with the host icon's primary motion.
- [ ] Visual: **every** non-shell path tracks the host through the
      animation — no marker, dot, slash, or internal element sits
      static while the host moves around it.
- [ ] Visual: at peak motion the stroke stays inside the 24×24
      viewBox at default `strokeWidth={2}` — no edge clipping. (Most
      scale motions should be contractions, not expansions.)
- [ ] Every per-value transition uses `inherit: true` so
      `duration` / `delay` / `repeat` propagate down from the parent.
- [ ] Variants reuse base motions; you didn't re-type physics.
- [ ] Each new motion file has a docstring explaining what it
      animates and which icons consume it.
- [ ] The catalog in section 6 of this doc is updated with new
      motions.

## 9. Known pitfalls

**`inherit: true` is required on per-value transitions.** When you
use motion's per-value `transition` to give different properties
different keyframe schedules (the host-coupling pattern — section 5),
each per-value object MUST set `inherit: true` or motion-dom replaces
the parent transition entirely, dropping `duration` / `delay` /
`repeat` and falling back to its 300 ms default. Symptom: a property
animates at the wrong speed or doesn't appear to do anything, and the
modifier ends up out of phase with the rest of the icon. Source:
`getValueTransition` in `motion-dom/animation/utils/get-value-transition.mjs`.

**Scale > 1 clips at the viewBox edges.** The default 24×24 viewBox
plus stroke-width 2 means content can extend from roughly (−1, −1)
to (25, 25) at scale 1, with no margin. Any scale > 1 pushes the
stroke past the SVG, which defaults to `overflow: hidden` — the
peaks of the motion get sliced off at runtime. Design scale rhythms
as contractions (`scale ≤ 1`); they're anatomically more accurate
for most icons (hearts squeeze, they don't balloon) and stay within
bounds at any stroke-width. If a motion genuinely needs to expand
beyond the icon's footprint, that's a signal to use a non-transform
animation (`pathLength`, `opacity`) instead.

**Path `d` strings vary across variants.** Lucide reshapes the base
shape to accommodate modifiers (`bell-plus` carves out the top-right
of the shell). Strict d-string equality means the base motion won't
match unless you extend its `matchPathDOneOf` list. Always check
whether existing motions match the new variant's paths first; extend
the list if they conceptually should but mechanically don't.

**Transform origin is per-signature, not per-path.** If your
signature uses `transformOrigin: "12px 4px"` (top mount) for the
primary motion, any *scale* on a modifier path will scale from that
point too — not from the modifier's own center. This is sometimes
useful thematically (the bell-ring sound waves scaling from the mount
*reads as* radiation). When it isn't, prefer non-transform animations
for the modifier (`pathLength`, `opacity`) so the wrong origin doesn't
fight you.

**Path order is positional and lucide-controlled.** If you author a
signature that branches on `ctx.index === 0`, a future Lucide update
that reorders paths in the icon would silently break the role
mapping. Always prefer matching by path data (`matchPathD`,
`matchPathDOneOf`), not by index.

**`matchAnyPath` is greedy.** It matches every path, including ones
you didn't intend. Always place `matchAnyPath` motions *last* in the
compose `motions` list, so more specific matches get tried first.

**Don't forget to regenerate.** The codegen reads
`src/modes/signatures/` at generate-time. Writing a new signature
without re-running `pnpm generate` means the icon's wrapper won't
import it. The `prebuild` and `predev` scripts handle this
automatically; you only need to run it manually after writing a
signature outside of those flows.

**The dev warning is your friend.** When something doesn't animate
correctly, check the dev console — browser-side for client renders,
terminal-side for the Next.js server during SSR. The engine warns
once per unmatched path with the iconName, index, and tag. That tells
you exactly which path needs a motion module.

---

## Companion references

- **Architecture overview**: this doc.
- **Two-tier rule**: this doc, section 3.
- **Engine source**: `packages/lucide-react-motion/src/engine.tsx`.
- **Compose source**: `packages/lucide-react-motion/src/modes/compose.ts`.
- **Memory** (across Claude sessions): `feedback_signature_design.md`
  contains the tier rule; `feedback_phase_review.md` describes the
  per-phase self-review cadence.

This doc is point-in-time; the source of truth for any specific
behavior is the engine + compose code. If the doc and code disagree,
the code wins — and please update the doc.
