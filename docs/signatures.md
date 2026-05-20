# Signature animations — authoring guide

> ### Source of truth
>
> **`.claude/skills/lucide-signature.md` is the authoritative authoring guide for agents and humans.** It carries the current three principles, the Tier 1 vocabulary table, the three-criteria check for overlay markers, and the anti-pattern catalog. Read it first.
>
> This document is a deeper reference. Use it for:
>
> - Section 2 — file layout, match helpers, the `ctx` interface.
> - Section 4 — the long-form authoring workflow with code excerpts.
> - Section 5 — the bell worked example end-to-end.
> - Section 6 — the catalog of motions currently available (append rows when you add a motion).
> - Section 7 — the family roadmap and priority order.
> - Section 8 — the validation checklist.
>
> Sections 1 (principles), 3 (tier rule), 9 (known pitfalls) duplicate material from the skill at lower fidelity and may lag. When the skill and this doc disagree, the skill wins.

This is the contributor-facing reference for writing `mode="signature"` animations. It describes the architecture, the two-tier rule the project follows, the step-by-step workflow for adding a signature, and a roadmap of which icon families to tackle next.

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

**1. Real-life physics first — bespoke per object.** Each motion
must mimic how *this specific real-world thing* actually behaves.
A heart contracts during systole (squeezes inward, not balloons
out); a bell rocks from its top mount; sound waves radiate
outward from their source, not from the icon centre; flames
flicker in HEIGHT not width; a moon reflects light (opacity only)
rather than emitting it (no radial scale); a clock's hands tick
clockwise in discrete steps. Generic transforms (scale, rotate,
translate) without grounding in the icon's real-world referent
feel arbitrary — design from the question *"how does this
physically behave in reality?"* before you reach for a keyframe
array.

**Never default to a generic pulse / shake / spin** to make an
icon "feel alive." If you find yourself reaching for a uniform
scale pulse, ask whether the real-world referent has a more
specific behaviour — it almost always does. Signatures are about
the icon's identity, so every signature should have a motion that
*only makes sense for that icon*.

**Animate per path — Lucide's path list IS the icon's anatomy.**
Lucide draws each icon as a list of SVG `<path>` / `<circle>` /
`<rect>` strokes, and the split is anatomical: the clock face is
its own path, the hand-pair is another; the bell shell is one,
the clapper is another, each sound wave is its own; every rain
drop is its own stroke; the moon crescent and the star sparkle in
`moon-star` are separate. **Match per path and design a separate
motion for each anatomical role.** A clock isn't one motion — it's
a steady face (`clockFace`) plus a ticking hand-pair
(`clockHands`). A bell is `bellShell` plus `bellClapper` plus
`bellSoundWaves`. A flame-kindling is `flameFlicker` (the flame
itself) plus `flameKindlingEmbers` (the wood underneath). A
composite icon (`sun-moon`, `cloud-sun-rain`, `cloud-hail`) layers
bespoke per-element motions on top of the shared body — moon
glows, sun radiates, drop falls, hailstone twinkles, lightning
flashes — not one shared transform smeared across every path.

The judgement call is per-path, not per-icon: "Could this
anatomical part move independently of the rest of the icon in
reality?" If yes, it deserves its own motion module matched by
`d` data (`matchPathD`, `matchPathDOneOf`, regex over
`pathAttrs.d`, or geometric predicates). If no (rigid sub-part of
a larger piece), it can share its parent's motion via the host-
coupling pattern in section 5.

**2. Cohesion — every non-shell path shares kinetic life with the host.**
A modifier (`+`, `−`, `×`, `✓`, slash, notification dot, crack zigzag,
EKG trace) sitting statically over a moving host reads as clip art
floating over an animation. Both Tier 1 markers AND Tier 2 elements
need motion that shares the host's `times`, but the *mechanism*
depends on the host's transform shape:

- **In-plane host transforms** (rotation, uniform scale, translation):
  the path directly inherits the host transform via per-value
  `inherit: true`. Slash rocks with the bell, slash scales with the
  heart, EKG line contracts with the heart.
- **Axis-asymmetric host transforms** (`scaleY`-only blink,
  `scaleX`-only sway): direct inheritance distorts the marker (a 45°
  diagonal slash inheriting `scaleY`-only flattens horizontally). The
  path instead synthesizes an in-plane companion (uniform `scale` dip,
  `opacity` dip) pinned to the host's `times`. Precedent:
  `eyeModifierReveal`, which defines its own `scale: [1, 0.85, 1]`
  over `EYE_BLINK_KEYFRAMES.times`. Going fully rigid is also wrong;
  the skill's three-criteria check covers this.

See section 5's worked example for the in-plane case, and
`.claude/skills/lucide-signature.md` step 4 (tier-1 markers note) for
the asymmetric case + the three-criteria check.

**3. Stay within the 24×24 viewBox.** SVGs default to
`overflow: hidden`, so any motion that pushes the stroke past the
viewBox edges visibly clips at runtime. Scale-based motion is always
a contraction (`scale ≤ 1`), never an expansion — rest is the maximum
and active oscillates downward. That's anatomically accurate for most
icons anyway (real hearts squeeze, real bells stay the same size
while they rock), and it can never clip regardless of strokeWidth or
path position.

For motions that need to read as outward expansion (sun rays
radiating, sound waves emitting), the effect comes from the active
cycle *starting contracted* and *growing back* to the rest size, not
from exceeding rest. The eye reads "growth back to full" as outward
radiation. Precedent: `sunRayPulse` uses `scale: [0.94, 1, 0.94]` —
rays start 6% contracted at the cycle boundaries and reach Lucide's
full default length at the cycle peak. The previous `[1, 1.06, 1]`
was rejected as a viewBox violation; see project memory
`feedback_scaled_stroke_viewbox.md`.

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
│   ├── moon-glow.ts                  reflected-light crescent (sun-moon + moon + moon-star) (Tier 2)
│   ├── moon-star-twinkle.ts          moon-star's four-pointed sparkle (Tier 2)
│   ├── snowflake-twinkle.ts          sun-snow's ice-crystal sparkle (Tier 2)
│   │
│   ├── clock-face.ts     Clock family — face/arc subtle pulse (exports CLOCK_FACE_KEYFRAMES)
│   ├── clock-hands.ts                hand-pair clockwise tick
│   ├── clock-modifier-reveal.ts      ±/✓/arrow/alert reveal + breathes with face
│   │
│   ├── cloud-body.ts     Cloud family — body subtle pulse (exports CLOUD_BODY_KEYFRAMES)
│   ├── cloud-rain-drops.ts           rain/drizzle/hail-vertical/rain-wind draw-down (Tier 2)
│   ├── cloud-snow-dots.ts            snow + hail-round contraction twinkle (Tier 2)
│   ├── cloud-fog-streaks.ts          horizontal fog reveal + opacity drift (Tier 2)
│   ├── cloud-lightning-bolt.ts       lightning flash-flicker (Tier 2)
│   ├── cloud-modifier-reveal.ts      alert/check/slash/cog/arrows/sync reveal + breathes with body
│   │
│   ├── droplet-shimmer.ts            Droplet family — drop bob + contraction + opacity dim (Tier 2)
│   ├── droplet-modifier-reveal.ts    droplet-off slash reveal + breathes with droplet
│   │
│   ├── umbrella-canopy.ts            Umbrella family — gentle sway + canopy contraction (Tier 2)
│   ├── umbrella-modifier-reveal.ts   umbrella-off slash reveal + sways with canopy
│   │
│   ├── flame-flicker.ts              Flame family — contraction scaleY + sway + brightness flicker (Tier 2)
│   ├── flame-kindling-embers.ts      flame-kindling's crossed sticks — ember glow + slight inherited sway
│   ├── fire-extinguisher-ready.ts    fire-extinguisher's device-armed pulse (not flame physics)
│   │
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

> The authoritative tier definitions (including the full Tier 1 marker vocabulary table sorted by Lucide-catalog frequency) live in `.claude/skills/lucide-signature.md`. The summary below is for context; route through the skill if they conflict.

The single most important judgment call when authoring a signature. For each non-base path in an icon, classify it into one of two tiers. Both tiers share kinetic life with the host (principle 2). The tier decides what *additional* motion the path gets and which mechanism it shares the host's kinetic life through.

**Tier 1 — UI / state markers.** Plus, minus, check, ×, slash, off-mark, dot indicator, alert, warning, question mark, arrow markers, percent, info, asterisk. Lucide uses a fixed vocabulary of these across the catalog (full table in the skill). These are abstract semantic decorations whose purpose is to *signify a state* (added, removed, confirmed, silenced, has-notification). They don't represent anything physical, so they don't get bespoke physics. They reveal quietly (`pathLength` + `opacity` for paths; `scale` + `opacity` for circles).

Use the family's **coupled** modifier reveal (`heartModifierReveal`, `bellModifierReveal`, `eyeModifierReveal`, etc.). Place it LAST in the compose `motions` list since it `matchAnyPath`. The kinetic companion follows the host-transform-shape rule from principle 2: directly inherit if the host is in-plane (bell rotation, heart uniform scale); synthesize an in-plane companion pinned to the host's `times` if the host is axis-asymmetric (eye `scaleY` blink). See section 5 for the in-plane worked example.

For circle markers (notification dots), build the family's geometry-matched equivalent (`bellDotReveal`).

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
| The clock face (circle in `clock`/`clock-1..12`, partial arcs in `clock-{alert,arrow-up,arrow-down,check,fading,plus}`) | **host** | `clockFace` — tiny scale+opacity pulse (exports `CLOCK_FACE_KEYFRAMES`); `clock-fading`'s 5 arc fragments cascade via stagger |
| The clock hand-pair (combined minute+hour stroke starting with `M12 6v…`) | **2** | `clockHands` — clockwise 6° tick (one minute step), hold, ease back |
| `clock-{alert,arrow-up,arrow-down,check,plus}`'s state markers | 1 | `clockModifierReveal` — pathLength + opacity reveal that also scales with the host `clockFace` |
| `sun-dim` / `sun-medium`'s body + rays | **2** | `sunRayPulse` — scale-outward + opacity dim, staggered so the rays cascade outward from the sun's centre |
| `sun-moon`'s moon crescent | **2** | `moonGlow` — opacity-only (reflects light, doesn't radiate) |
| `sun-moon`'s sun rays + quarter-arc | **2** | `sunRayPulse` — radiates with the same cascade as `sun-dim`/`sun-medium` |
| `sun-snow`'s snowflake arms | **2** | `snowflakeTwinkle` — opacity double-pulse sparkle, negligible scale wobble for cohesion |
| `sun-snow`'s sun half-arc + rays | **2** | `sunRayPulse` — signature pivots at (10, 12), the sun's actual centre, so rays radiate cleanly from it |
| `moon`'s crescent | **2** | `moonGlow` — opacity-only soft dim/recover (moon reflects light rather than emits) |
| `moon-star`'s crescent | **2** | `moonGlow` — same opacity-only glow; signature pivots at the star centre (20, 5), but opacity is unaffected |
| `moon-star`'s four-pointed sparkle | **2** | `moonStarTwinkle` — sharp scale + opacity twinkle, scaled in place around the star's own centre |

When in doubt, ask: "does this path depict an actual physical thing that has its own motion in the real world, or is it a marker?" If the former, design Tier 2 motion. If the latter, use the family's coupled modifier reveal. **Either way, the path shares kinetic life with the host** via the in-plane-vs-asymmetric mechanism in principle 2.

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
| `motions/eye-blink.ts` | Eye-body paths (base almond, eye-off's three arc fragments, eye-off's pupil arc) + base eye pupil `<circle cx=12 cy=12 r=3>` | scaleY collapse to a sliver, then snap back open. Exports `EYE_BLINK_KEYFRAMES` so the family modifier-reveal can pin its own in-plane companion to the same `times`. State-marker paths fall through to `eyeModifierReveal` (Tier 2) |
| `motions/eye-closed-lid.ts` | The closed-lid arc d in `eye-closed` | scaleY contraction (`[1, 0.88, 1]`) — the orbicularis muscle tightens the already-shut lid then relaxes. Signature pivots at `12px 8px` (top of closed lid). Exports `EYE_CLOSED_LID_KEYFRAMES` for the lashes to inherit (Tier 2) |
| `motions/eye-closed-lashes.ts` | The four lash d's in `eye-closed` | Opacity dim cascade (inner-to-outer stagger) + inherited `EYE_CLOSED_LID_KEYFRAMES.scaleY` — lashes shimmer in sequence as the lid squeezes (Tier 2) |
| `motions/eye-modifier-reveal.ts` | `matchAnyPath` (wildcard) | Delayed `pathLength` + `opacity` strike that completes AT the blink apex (`times: [0, 0.15, 0.5]`) plus a uniform `scale` dip `[1, 0.85, 1]` over `EYE_BLINK_KEYFRAMES.times`. The synthesized in-plane companion gives the slash kinetic life shared with the blink without inheriting the asymmetric scaleY directly (which would flatten a diagonal). Canonical example of the asymmetric-host synthesized-companion pattern. Used for `eye-off`'s slash and any future eye-plus / eye-minus / eye-check markers |
| `motions/star-twinkle.ts` | Full star d, star-half left-outline d, and the two broken-outline fragments in star-off (`matchPathDOneOf`) | Opacity dim + recover, small rotation wobble, and a brief inward `scale` contraction (`[1, 0.9, 0.98, 1]`, scale ≤ 1 per principle 3 — was 1.18 prior to the star-half/star-off refactor). Exports `STAR_TWINKLE_KEYFRAMES` so the family's modifier reveal inherits the same rhythm (Tier 2) |
| `motions/star-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity draw-in for `star-off`'s slash, plus rotate + scale inherited from `STAR_TWINKLE_KEYFRAMES` so the slash wobbles and contracts in step with the broken star fragments (Tier 1) |
| `motions/sun-ray-pulse.ts` | `matchAnyPath` (wildcard) | Per-path scale-outward + opacity dim with stagger. Used as the catch-all in every sun signature (`sun`, `sun-dim`, `sun-medium`, sun parts of `sun-moon` and `sun-snow`) so the rays cascade outward from the sun's centre — light radiating from the surface (Tier 2) |
| `motions/moon-glow.ts` | Moon crescent d (both the small `sun-moon` variant and the larger `moon`/`moon-star` variant) | Opacity-only soft dim/glow with no scale (moon reflects light, doesn't radiate; off-centre crescent shouldn't translate when the signature pivots for the sun or the star) (Tier 2) |
| `motions/moon-star-twinkle.ts` | Moon-star's two short "+"-forming line d's | Sharp scale + opacity twinkle. The `moon-star` signature pivots at the star centre (20, 5) so this scales in place rather than translating across the icon (Tier 2) |
| `motions/snowflake-twinkle.ts` | Sun-snow's 5 snowflake d's | Sharp opacity double-pulse + barely-perceptible scale wobble — ice crystals sparkle by reflection, not by changing size (Tier 2) |
| `motions/clock-face.ts` | Full `<circle cx=12 cy=12 r=10>` OR any path containing the `[Aa]10 10 0` arc command (catches the partial faces in `clock-{alert,arrow-up,arrow-down,check,fading,plus}`) | Tiny scale + opacity pulse — clock faces stay mostly steady so the hands' tick is the focus. Exports `CLOCK_FACE_KEYFRAMES` for the family's modifier reveal to inherit. In `clock-fading`'s 5 arc fragments the per-path stagger cascades into the "fading" character (Tier 2) |
| `motions/clock-hands.ts` | Any path whose `d` starts with `M12 6v` (catches the combined minute+hour hand-pair stroke in every clock variant) | Clockwise tick — 6° forward (one minute step), hold, ease back to rest (Tier 2) |
| `motions/clock-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal that also scales with the host `clockFace` so state modifiers (alert, arrow, check, plus) breathe in sync with the face instead of floating over a pulsing body |
| `motions/cloud-body.ts` | Cloud-body paths (matches `[Aa]7 7 0` arc OR `[Aa]5 5 0 1 1` arc — catches the standard cloud, the smaller cloud in `cloud-sun`/`-moon` composites, and `cloud-off`'s two split fragments) | Subtle scale-contraction + opacity dim. Exports `CLOUD_BODY_KEYFRAMES` for family motions to inherit (Tier 2) |
| `motions/cloud-rain-drops.ts` | Specific d list — rain (`v6`), drizzle (`v1`), hail-vertical (`v2`), cloud-sun/moon-rain short drops, plus rain-wind diagonals | pathLength + opacity reveal that draws the stroke along its natural direction (top-down for verticals, slanted for rain-wind). Inherits cloudBody scale (Tier 2) |
| `motions/cloud-snow-dots.ts` | Specific d list — `h.01` dots in `cloud-snow` and the round hailstones in `cloud-hail` | Contraction-only scale twinkle + opacity dip — flake dims and shrinks toward its own position, then recovers. Per the moon-star lesson, scale ≤ 1 keeps the bottom-row dots (y=22) safely inside the viewBox (Tier 2) |
| `motions/cloud-fog-streaks.ts` | `cloud-fog`'s two horizontal d's (`M16 17H7`, `M17 21H9`) | pathLength reveal + opacity dim/recover to suggest fog rolling. Inherits cloudBody scale (Tier 2) |
| `motions/cloud-lightning-bolt.ts` | `cloud-lightning`'s bolt d | Translate descent from inside the cloud (`y: [-10, 0, ...]`) + multi-flash opacity flicker (bright/dark/bright/dark/settle) once the bolt lands at rest position. Opacity starts at 0 so the bolt is hidden during its overlap with the cloud body, then ramps to 1 as it emerges below. Inherits cloudBody scale for cohesion (Tier 2) |
| `motions/cloud-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal that also scales with the host `cloudBody`. Used by cloud variants whose modifiers aren't covered by the bespoke weather motions — alert mark, check, off-slash, cog gear, download/upload arrows, sync/backup loops |
| `motions/droplet-shimmer.ts` | Any path with an arc command (`[Aa]\d…`) — catches drop shapes across `droplet`, `droplets`, and the two split fragments in `droplet-off`; the slash `m2 2 20 20` has no arc so it falls through | y-bob + scale-contraction + opacity dim — surface tension drawing the drop inward as it nears release (Tier 2). Exports `DROPLET_KEYFRAMES` |
| `motions/droplet-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal for `droplet-off`'s slash; inherits `dropletShimmer`'s scale so the slash breathes with the drop fragments |
| `motions/umbrella-canopy.ts` | Explicit d-list — handle + tip + canopy + the two canopy fragments in `umbrella-off` | Scale contraction + rotation sway + opacity dim — umbrella catching wind, canopy resisting the gust (Tier 2). Exports `UMBRELLA_KEYFRAMES` |
| `motions/umbrella-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal for `umbrella-off`'s slash; inherits `umbrellaCanopy`'s scale + rotate so the slash sways with the rest |
| `motions/flame-flicker.ts` | The two flame-teardrop d's (`flame` + `flame-kindling`) | scaleY contraction (flame briefly shrinks vertically toward its base) + ±2° rotation sway (tongue leans in a draft) + opacity flicker (hot core alternately exposed and shrouded). The signature pivots at the flame's BASE (`12px 16px` for `flame`, `12px 15px` for `flame-kindling`) so the base stays anchored while the tip dances. Exports `FLAME_KEYFRAMES` (Tier 2) |
| `motions/flame-kindling-embers.ts` | The two crossed-kindling diagonals in `flame-kindling` | Opacity-only ember glow (real burning wood doesn't translate, just glows) + inherited rotate from `flameFlicker` so the sticks rock subtly with the fire's draft (Tier 2) |
| `motions/fire-extinguisher-ready.ts` | `matchAnyPath` for `fire-extinguisher` | Subtle two-pulse scale contraction + opacity dim — a device-armed pulse rather than flame physics, because the extinguisher is a tool and never burns itself |
| `motions/loader-spin.ts` | `matchAnyPath` for loader | Infinite rotation (via `atom/spin`) |
| `motions/loader-circle-sweep.ts` | `loader-circle`'s single arc d | Continuous 0→360 rotation with `easeInOut` per cycle (surge-and-settle) + a mid-cycle opacity breath `[1, 0.78, 1]`. Differentiates from the base `loader` signature. Exports `LOADER_CIRCLE_KEYFRAMES` (Tier 2) |
| `motions/loader-pinwheel-blade.ts` | The three `loader-pinwheel` blade d's | Rigid 0→360 rotation under `easeInOut` (gust-driven cadence) + per-blade reflectance opacity dip phase-shifted by 0, 1/3, 2/3 of the cycle so the bright/dim wave moves around the pinwheel rather than pulsing uniformly. Exports `LOADER_PINWHEEL_KEYFRAMES` (Tier 2) |
| `motions/loader-pinwheel-hub.ts` | `<circle cx=12 cy=12 r=10>` in `loader-pinwheel` | Rigid 0→360 rotation inherited from `LOADER_PINWHEEL_KEYFRAMES` so the outer rim stays rigidly coupled to the blades. No opacity variation (circle has rotational symmetry) (Tier 2 housing) |
| `motions/refresh-arc-cycle.ts` | Arcs + tick arrowheads across `refresh-cw`, `refresh-ccw`, `refresh-ccw-dot`, and `refresh-cw-off`'s four broken-arc fragments | Pinch-then-spin physics: scale `[1, 0.85, 0.85, 1]` (contracts inward, holds while spinning, releases back), rotate `[0, 0, ±360, ±360]` (full revolution in the named direction, performed *while contracted* so the corner caps stay inside the viewBox — corner cap envelope ≈ 0.85 × 13.45 ≈ 11.43 from centre, comfortably inside the inscribed circle of radius 12). Direction comes from `iconName` (cw = +360, ccw = -360). Exports `REFRESH_ARC_KEYFRAMES` (Tier 2 — mechanical wind-up + rotation, the canonical refresh-button gesture) |
| `motions/refresh-center-dot.ts` | `<circle cx=12 cy=12 r=1>` in `refresh-ccw-dot` | Inherits `REFRESH_ARC_KEYFRAMES.scale` so the indicator pinches in lockstep with the wheel + opacity dip `[1, 0.55, 0.55, 1]` (dim during the spin, bright at rest = fresh data ready). Skips rotate inheritance because a circle at the rotation pivot is rotationally symmetric (Tier 2) |
| `motions/refresh-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal for `refresh-cw-off`'s diagonal slash, timed to complete at the rotation midpoint (`t = 0.5`, the moment the wheel has spun 180°) — the slash strikes through at the apex of the action. Inherits the host's pinch via `REFRESH_ARC_KEYFRAMES.scale` for kinetic-life share but skips rotate (would carry the slash around the wheel and destroy the strike-through reading) |
| `motions/zap-strike.ts` | Full zap bolt d + the three fragments in `zap-off` | Translate descent (`y: [-24, 0, ...]`) from above the viewBox, with the SVG's overflow clipping handling pre-strike invisibility, plus a multi-flash opacity flicker (0 → 1 → 0.15 → 1 → 0.4 → 1) once the bolt lands. easeIn on `y` so the bolt accelerates downward like a gravity-pulled charge; linear opacity so flash peaks stay crisp. Exports `ZAP_KEYFRAMES` (Tier 2 — bespoke lightning physics: descent + flash) |
| `motions/zap-modifier-reveal.ts` | `matchAnyPath` (wildcard) | pathLength + opacity reveal for `zap-off`'s diagonal slash, timed to complete at the host's first dim trough (`t = 0.18`, between the primary flash and the secondary peak) so the slash lands in the dark moment right after the strike. Synthesized uniform `scale` dip `[1, 0.92, 1]` provides continuous kinetic life through the rest of the cycle. Skips host's `y` inheritance (slash stays at rest position; sliding down would destroy the strike-through reading) |
| `motions/atom/spin.ts` | (factory only, no matches) | Pure rotation math; reused by `loader-spin` and other rotation signatures |

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
   snow, sun-dim, sun-moon, moon, moon-star. Sun + moon families
   done. Sun uses `sunRayPulse` (per-path scale-outward + opacity
   cascade) for every variant; composites layer element-specific
   motions (`moonGlow` for sun-moon's crescent, `snowflakeTwinkle`
   for sun-snow). Moon uses opacity-only `moonGlow` (reflected
   light, no radial scale); `moon-star` adds the four-pointed
   `moonStarTwinkle` pivoting at the star's own centre. The
   `sunrise` / `sunset` icons are still pending — they're in the
   `sunrise`/`sunset` first-hyphen families, not the `sun-*` group.

4. **`cloud-*` + `droplet*` + `umbrella`** — Whole group done:
   cloud (20/20), droplet (2/2), droplets (1/1), umbrella (2/2).
   `cloudBody` anchors every cloud variant; weather elements get
   bespoke physics — `cloudRainDrops`, `cloudSnowDots`,
   `cloudFogStreaks`, `cloudLightningBolt`. UI variants use
   `cloudModifierReveal`. Composites reuse `sunRayPulse` and
   `moonGlow`. The water-drop icons (`droplet`, `droplets`,
   `droplet-off`) use `dropletShimmer` (y-bob + surface-tension
   contraction) and inherit-coupled modifier reveals. Umbrellas
   sway via `umbrellaCanopy` (scale + rotate + opacity).

5. **`flame*` / `fire`** — flame (2/2) and fire (1/1) families
   done. The flame teardrop in `flame` + `flame-kindling` flickers
   via `flameFlicker` (contraction-only scaleY + rotation sway +
   opacity flicker, pivoted at the flame's base). The kindling
   sticks underneath glow via `flameKindlingEmbers` and inherit
   the flame's sway. `fire-extinguisher` (the only `fire-*` icon)
   isn't actual fire, so it gets a subtle device-armed pulse via
   `fireExtinguisherReady` rather than flame physics. `candle` is
   not currently in Lucide's set; if it ever lands, expect a
   flame-flicker on the tip + a steady-stem motion.

6. **`loader-*` / `refresh-*` / `rotate-*`** — loader (3/3) and
   refresh (4/4) done. Loader variants use continuous rotation
   (`loaderSpin` linear, `loaderCircleSweep` surge-and-settle,
   `loaderPinwheelBlade` gust-driven with per-blade reflectance).
   Refresh uses a mechanical wind-up: scale contracts to 0.85 to
   pull the corner tick marks (at radius √162 ≈ 12.73, outside
   the viewBox's inscribed circle) safely inside, performs one
   full 360° revolution in the named direction *while
   contracted*, then expands back to rest. Reads as the
   canonical refresh-button gesture without clipping the corner
   caps at intermediate angles. `rotate-*`, `repeat-*` are still
   pending; expect them to reuse the rotation atoms where the
   geometry allows.

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
- `zap` ✓ done (2/2) — translate descent from above viewBox + multi-flash flicker; cloud-lightning's bolt rewritten to the same physics
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

- **Authoritative authoring guide**: `.claude/skills/lucide-signature.md` (read this first; this doc is a deeper reference for sections 2, 4, 5, 6, 7, 8).
- **Architecture overview**: this doc, sections 2 and 5.
- **Tier definitions and overlay-marker rules**: the skill is authoritative; this doc's section 3 is a summary.
- **Engine source**: `packages/lucide-react-motion/src/engine.tsx`.
- **Compose source**: `packages/lucide-react-motion/src/modes/compose.ts`.
- **Memory** (across Claude sessions): `feedback_signature_design.md` (tier rule and host-coupling history), `feedback_animation_temporal_review.md` (three-criteria check), `feedback_phase_review.md` (per-phase self-review).

This doc is point-in-time; the source of truth for any specific
behavior is the engine + compose code. If the doc and code disagree,
the code wins — and please update the doc.
