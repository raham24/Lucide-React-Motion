---
name: lucide-signature
description: Author the next high-priority pending Lucide signature family for the lucide-react-motion library. Use this skill whenever the user says "work on the next family", "continue signatures", "next signature family", "do the next family", "/signature", or otherwise asks Claude to extend signature motion coverage — even when they don't name the file or path. Bell family (`bellShell` + `bellClapper` + `bellSoundWaves` + `bellModifierReveal` + `bellDotReveal`) is the canonical template every other family is shaped against. Auto-detects what's next by running `pnpm --filter lucide-react-motion status --json` and cross-referencing the section 7 priority list in `docs/signatures.md`. Falls back to one-off decorative icons after all priority families are done. Enforces the three-criteria check on every overlay marker — continuous kinetic life, non-distortion, apex alignment — so the agent doesn't ship partially-fixed motion.
---

# Lucide signature authoring workflow

You're authoring the next pending signature family for `lucide-react-motion`. The user did not specify which family — you pick the highest-priority one with pending icons. Be explicit with the user about what you picked and why, then proceed.

## Workflow at a glance

1. **Read this skill end-to-end + the bell family motions** (≈10 min). This skill is the authoritative authoring guide. Bell is the canonical template; mirror its layout when authoring a family with state-modifier variants. `docs/signatures.md` is a deeper reference (mechanism details in section 2, worked bell example in section 5, motion catalog in section 6, family roadmap in section 7, validation checklist in section 8) that you can dip into as needed.
2. **Pick the next family** — parse `pnpm --filter lucide-react-motion status --json` and apply the priority order from Step 2 below.
3. **Pre-flight** — `git status`, branch check, scan project memory.
4. **Propose the motion plan and wait for user sign-off** — before writing any code, post a short plan: which anatomical roles you identified, what each role's motion is (host physics, Tier 1 reveals, Tier 2 bespoke), and which existing motions you'll reuse vs. author new. Wait for explicit user approval. Do not code first and ask after.
5. **For each variant** — inspect the generated tsx, decide a motion per anatomical role, reuse or author motions, compose the signature.
6. **Run the three-criteria check** on every overlay marker (slash / plus / minus / check / dot) before declaring done — see step 4's check-list.
7. **Validate** — generate + typecheck + test must all pass.
8. **Commit** on the current branch (no Co-Authored-By trailer per project memory).
9. **Hand back** to the user for visual review — list variants + what to look for.

One family per invocation. Don't start the next one without explicit user approval.

## Step 1 — Internalize the four principles + the bell template

This skill is the authoritative authoring guide. `docs/signatures.md` is a deeper reference (mechanism details, worked bell example, motion catalog, family roadmap, validation checklist). Skim its section 5 for the bell-coupling worked example after the principles below, but you do not need to read it end-to-end before authoring.

The four principles govern every motion you write:

1. **Real-life physics first — bespoke per object.** Each motion must mimic how *this specific real-world thing* actually behaves. **Never default to a generic pulse / shake / spin / scale to make an icon "feel alive."** A flame flickers in HEIGHT not width; a heart contracts inward during systole, not outward; sound waves radiate from their source, not from the icon centre; a moon reflects light (opacity only) rather than emitting it (no radial scale); a clock's hands tick clockwise in discrete steps, not smooth sweeps. If you're tempted to "just rotate the whole icon" or "just add a uniform scale pulse," stop and design what the real-life referent actually does instead.

   **Every icon gets a signature. No skip list, no `draw` as the answer.** Decide a motion in this order:

   1. **Real-world object with characteristic motion** → design bespoke physics (bell rocks, flame flickers, heart beats). The bulk of the catalog.
   2. **Real-world object with no inherent motion** → find its characteristic small life-cue (buildings: window lights flicker on; lamps: bulb glow; furniture: settle compression as if used; bath: water shimmer; tag: dangle sway).
   3. **No real-world referent at all** (typography, geometric primitives, brand marks, alignment indicators, UI device depictions, emoji) → assign to one of the **abstract archetypes** in the catalog below.

   The engine still routes unsigned icons through `draw` as a runtime safety net while coverage builds out, but `draw` is never the *design answer* for any icon — only a placeholder until its signature lands. The dev warning is an authoring TODO, not an acknowledgment of intentional skip.
2. **Cohesion — every non-shell path shares kinetic life with the host.** A modifier or attached element sitting statically over a moving host reads as clip art floating over an animation. The cohesion mechanism depends on the host's transform shape:
   - **In-plane host transforms** (rotation, uniform `scale`, translation) — the non-shell path directly inherits the host transform via per-value `inherit: true`. Slash rocks with the bell, slash scales with the heart.
   - **Axis-asymmetric host transforms** (`scaleY`-only blink, `scaleX`-only sway) — direct inheritance distorts the marker (a 45° slash inheriting `scaleY` only flattens horizontally). The non-shell path instead synthesizes an in-plane companion (uniform `scale` dip, `opacity` dip) pinned to the host's `times` so it shares a kinetic peak with the host without orientation distortion. Going fully rigid is also wrong — see the three-criteria check in step 4.
3. **Stay within the 24×24 viewBox.** Scale-based motion is always a contraction (`scale ≤ 1`), never an expansion. Rest is the maximum size; active oscillates *downward* from rest. Keeps the stroke inside the SVG (which defaults to `overflow: hidden`) and remember the scaled-stroke gotcha: `transform: scale(1.2)` also scales the strokeWidth by 1.2, so a path's visible edge is `scaled_endpoint + scaled_stroke_radius`, not just the scaled endpoint.

   **For motions that need to read as outward expansion** (sun rays radiating, sound waves emitting, sparks bursting), achieve the effect by contracting the active cycle *inward from rest*, not by exceeding rest. The eye reads "return to rest from contracted" as outward radiation just as well as "growth past normal size," and the contraction-only version can never clip. Precedent: `sunRayPulse` uses `scale: [1, 0.94, 1]` — rays sit at Lucide-default length at rest, contract 6% mid-cycle, and return to full. The previous `[1, 1.06, 1]` was rejected by the user as a viewBox violation; see project memory `feedback_scaled_stroke_viewbox.md`.
4. **Every `active` keyframe array starts AND ends at the rest value.** When the active animation completes, the icon stays at its final keyframe — the engine does not snap back to rest. If `rest: { scale: 1 }` and `active: { scale: [0.94, 1, 0.94] }`, the icon ends visibly shrunk and drifts away from the Lucide-original glyph. Author every keyframe array as a closed cycle: `scale: [1, 0.94, 1]`, `y: [0, -3, 3, 0]`, `opacity: [1, 0.3, 1]`. For loop-shaped motions (rain/snow falling, drops fading) wrap the visible cycle in opacity-covered teleport beats so the bookend frames land at rest position invisibly — see `cloud-rain-drops.ts` for the `y: [0, -3, -1.5, 1.5, 3, 0]` + `opacity: [1, 0, 1, 1, 0, 1]` pattern. Rotations are the only exception: `rotate: [0, -360]` is fine because Motion snaps to keyframe[0] on re-trigger, making `-360 ≡ 0` indistinguishable from rest. The `rest-cycle.test.ts` invariant catches violations automatically — run `pnpm test` before committing.

### The two tiers

Authoritative definition. (`docs/signatures.md` section 3 has the long-form prose discussion, but this skill carries the current rules.)

- **Tier 1 — UI / state markers.** Abstract semantic decorations that *signify a state* — they don't represent anything physical. Lucide uses a fixed vocabulary of these across the catalog; when you see a path or `<circle>` matching any of these patterns, it is Tier 1 by default:

  Sorted by how often Lucide uses each suffix across the 1711-icon catalog (count in parentheses):

  | Suffix | Marker shape | Examples |
  |---|---|---|
  | `*-off` (77) | diagonal strikethrough slash (`m2 2 20 20` or mirror) | `eye-off`, `cloud-off`, `bell-off`, `heart-off`, `droplet-off`, `umbrella-off`, `volume-off`, `wifi-off`, `mic-off` |
  | `*-plus` (37) / `*-minus` (28) | small `+` / `−` stroke pair | `bell-plus`, `heart-plus`, `clock-plus`, `cloud-plus` |
  | `*-check` (33) / `*-x` (32) | `✓` / `×` stroke marker | `bell-check`, `heart-x`, `clock-check`, `cloud-check`, `archive-x`, `calendar-x` |
  | `*-dot` (12) | small filled `<circle>` (notification dot) | `bell-dot` |
  | `*-arrow-{up,down,left,right}` (22 total) | small directional arrow at corner-badge size | `clock-arrow-up`, `clock-arrow-down`, `circle-arrow-up`, `square-arrow-up` |
  | `*-alert` (9) / `*-warning` (4) | `!` exclamation or alert triangle | `cloud-alert`, `clock-alert`, `badge-alert`, `book-alert`, `circle-alert`, `octagon-alert`, `shield-alert`, `battery-warning`, `mail-warning` |
  | `*-question-mark` (6) | `?` stroke marker | `file-question-mark`, `circle-question-mark`, `badge-question-mark`, `mail-question-mark`, `message-circle-question-mark`, `shield-question-mark` |
  | `*-percent` (5) | `%` stroke marker | `circle-percent`, `square-percent` |
  | `*-info` (1) / `*-asterisk` (1) | `i` / `*` stroke marker (rare) | `badge-info`, `square-asterisk` |

  **Every Tier 1 marker is authored through the family-wide modifier-reveal** (`bellModifierReveal`, `heartModifierReveal`, `cloudModifierReveal`, `eyeModifierReveal`): `pathLength` + `opacity` draw-in for path markers, or `scale` + `opacity` for `<circle>` markers (see `bellDotReveal`). Placed LAST in the compose list. Kinetic companion sharing the host's `times` per principle 2.

  **Default to the family modifier-reveal whenever you see one of these suffixes.** Don't write a one-off `matchPathD("<exact d>")` motion for a state marker — that's how the eye-off pass initially went wrong. If the family doesn't have its modifier-reveal yet, build it (matchAnyPath wildcard) — once. Every future variant in that family will route through it for free.

  **State markers are always External State Markers — even when they sit visually inside a container host.** The suffix list above wins regardless of containment. A check inside a search loupe (`search-check`), a plus on a mail envelope (`mail-plus`), an `x` inside a shield (`shield-x`), a slash through a circle (`circle-slash`) — all of these are *external state announcements applied to the host*, not "contained payload being inspected" and not "mounted UI badge pulsing in place." Draw them in via the family modifier-reveal, kinetically coupled to the host. The two existing exceptions (`searchScan` rotates `search-{check,code,slash,alert,x}` rigidly; `mailModifierPulse` does a press-rebound on `mail-{check,plus,minus,x,warning,question}`) are pending conversions, not patterns to copy. See project memory `feedback_state_markers_are_external.md`.

- **Tier 2 — Real-life-grounded elements.** Things that exist as physical parts of the depicted object — sound waves, flames, water drops, smoke, sparkles, EKG traces, cracks, gears, locks, the second hand of a clock. Bespoke physics designed from "how does this real-world thing actually behave," plus host-keyframe inheritance for cohesion.

  **Composite badges that look like state markers but belong in Tier 2** because they have their own physical/semantic motion: `*-cog` (gear rotates), `*-pen` / `*-edit` (writes), `*-lock` / `*-unlock` (clicks open/closed), `*-clock` (ticks), `*-search` (magnifier swings), `*-sync` (paired arrows rotate), `*-share` (graph). When in doubt: does the marker have a single canonical real-world motion? If yes, Tier 2.

Tier only determines what *additional* motion the path gets. Both tiers share kinetic life with the host (principle 2).

### Abstract archetype catalog (icons without a real-world referent)

The two tiers handle anything depicting a real physical object. For icons whose subject has no real-world physical motion at all — typography, geometric primitives, brand marks, alignment indicators, UI device depictions, emoji — assign to one of the eight archetypes below. **Don't fall back to `draw`; pick the matching archetype and build a signature.**

These are the *only* sanctioned non-physics motions in the library. Every archetype still obeys principles 2 and 3 (host coupling for any composite that has one; contraction-only scale to stay inside the viewBox).

| # | Archetype | When | Mechanics |
|---|---|---|---|
| 1 | **Typewriter stamp** | Typography (letters, math symbols, alignment-of-text indicators — `a-arrow-*`, `ampersand`, `asterisk`, `bold`, `italic`, `heading-1..6`, `pilcrow-*`, `case-*`, `text-align-*`, `subscript`, `superscript`, `strikethrough`, `type`) | `scale: [1, 1.04, 0.98, 1]` over a short duration + 1-unit `y` bob (the type-hammer strikes). Directional variants (`a-arrow-up`, `text-align-left`, `pilcrow-right`) orient the bob to match. Reads as "a type hammer struck the page." |
| 2 | **Vertex sequence pulse** | Geometric primitives with no real referent (`square`, `circle`, `triangle`, `hexagon`, `pentagon`, `octagon`, `diamond`, `astroid`, `cone`, `cube`, `cylinder`, `parallelogram`, `dot`, `slash`, `spline`, `shapes`, `line-squiggle`) | Each vertex pulses (small `scale` dip + `opacity` glow) in clockwise order, staggered by `1/N` of the cycle. Triangle = 3 pulses, square = 4, octagon = 8. Circle/dot have no vertices — they get a uniform breath. Different per shape because the shapes themselves differ in vertex count. |
| 3 | **Literal-depiction motion** | Brand marks that double as an object (`apple` → fruit) | Animate the underlying object (apple = fruit bob: `y: [0, -0.5, 0]` + tiny scale breath). Never animate the brand-as-brand. |
| 4 | **Alignment action** | Layout/alignment indicators (`align-*`, `columns-*`, `rows-*`, `grid-*`, `panel-*`, `dock`, `layout-*`, `sidebar`) | The bars/cells perform the alignment they depict. `align-left`'s bars slide leftward into their aligned position; `columns-3` cells flash in left-to-right sequence; `grid-2x2` cells sequence by row-then-column; `panel-left` slides open and back. The motion IS the alignment action. |
| 5 | **Device interaction** | UI device depictions (`monitor`, `tv`, `smartphone`, `laptop`, `tablet`, `computer`, `keyboard`, `mouse`, `server`, `database`, `hard-drive`, `app-window`) | Each device performs its signature gesture: laptop lid opens 10°; smartphone screen wakes (opacity flash on display rect); TV scanline sweep; keyboard one-key dip; mouse click; server LED flicker; hard-drive head-seek jitter; database rings rotate; app-window content does a physical resize. |
| 6 | **Window-lights + settle** | Buildings & furniture & static objects (`building`, `house`, `castle`, `church`, `factory`, `lamp-*`, `armchair`, `bed-*`, `sofa`, `refrigerator`, `bath`, `tent`, etc.) | Buildings/houses/castles/churches/factories: window-rect opacity flicker on (lights coming on inside). Lamps: bulb opacity glow. Furniture: `scaleY: 0.97` settle compression as if used. Bath: opacity shimmer in basin. Tent: flap rotate sway. |
| 7 | **Polished shine sweep** | Awards, badges, alerts, status markers (`badge-*`, `award`, `crown`, `gem`, `medal`, `ribbon`, `shield`, `tag`, `bookmark-*`, `ban`, `circle-alert`, `triangle-alert`, `square-alert`) | Linear-gradient highlight sweeps across the metal/surface (translateX 0 → 24 via a `<linearGradient>` mask or a moving overlay). Gem reuses `starTwinkle`. Tag dangles around its hole. Bookmark stick-and-release (`y: [0, 1, 0]`). Alerts pulse with their marker (exclamation flash + attention `scaleY` contraction). |
| 8 | **Expression intensification** | Emoji faces (`smile`, `angry`, `laugh`, `frown`, `meh`, `annoyed`, `smile-plus`) | Eyes/mouth deform to exaggerate the emotion. Angry: brows furrow harder + eyes narrow. Laugh: mouth widens + cheek dots bounce. Smile: arc deepens slightly. Meh: stays nearly still (its character IS the non-motion — a tiny opacity flicker is enough). Frown: arc deepens downward. |

**Implementation note.** Each archetype should ship as a single reusable motion factory: `makeTypewriterStamp({ direction? })`, `makeVertexSequencePulse({ vertices })`, `makeAlignmentAction({ axis, anchor })`, etc. Building the archetype once unlocks ~30-80 icons at a time instead of one family at a time.

### Read the bell family first — it is the canonical template

Before reading any other family, read the bell family motions end-to-end. **Bell is the template every other family is shaped against.** It covers, in one place, every structural pattern you will need to write a new family. When you start a new family with state-modifier variants (`-off`, `-plus`, `-minus`, `-check`, `-dot`), copy bell's layout first and adapt the physics.

- `motions/bell-shell.ts` — the host motion. Specific path match via `matchPathDOneOf` over a registry (Lucide reshapes the shell across variants — every shape goes in the registry). Exports `BELL_SHELL_KEYFRAMES` so other family motions can inherit the rock.
- `motions/bell-clapper.ts` — a second physical element inside the host with its own physics (free pendulum inside the rocking shell), coupled to the shell's rhythm via inherited keyframes.
- `motions/bell-sound-waves.ts` — Tier 2 emitted physical elements (the radiating arcs). Bespoke draw-in physics + host-rotation inheritance for cohesion.
- `motions/bell-modifier-reveal.ts` — **the family wildcard for state modifiers** (slash for `bell-off`, plus / minus / check stroke markers in `bell-plus` / `bell-minus` / `bell-check`). `matchAnyPath` placed LAST in the compose list, `pathLength` + `opacity` draw-in plus inherited host rotation. Copy this shape whenever a new family needs `-off` / `-plus` / `-minus` / `-check` variants.
- `motions/bell-dot-reveal.ts` — the geometric-marker counterpart of the family wildcard, for `<circle>` modifiers (the notification dot in `bell-dot`). Same shape as the wildcard but matches by `cx` / `cy` / `r` and uses `scale` + `opacity` (no `pathLength` on circles).

`signatures/bell-off.ts` is the textbook composition order: `[bellClapper, bellShell, bellModifierReveal]` — specific physics first, family wildcard LAST. When you build a new family with state-modifier variants, mirror this layout exactly.

Then skim these for additional vocabulary:

- `motions/heart-beat.ts` + `motions/heart-modifier-reveal.ts` — bell template applied to a uniform-scale host (the registry is `HEART_PATHS`; the modifier-reveal inherits `scale` instead of `rotate`).
- `motions/flame-flicker.ts` — per-element-direction physics (scaleY contraction, base-anchored sway, brightness flicker — *not* a uniform scale).
- `motions/cloud-rain-drops.ts` vs `motions/cloud-snow-dots.ts` vs `motions/cloud-lightning-bolt.ts` — three different precipitation types, three different motions inside one family.
- `motions/moon-glow.ts` (opacity only — moon reflects) vs `motions/sun-ray-pulse.ts` (radial scale + opacity — sun emits).
- `motions/eye-blink.ts` + `motions/eye-modifier-reveal.ts` — bell template applied to an **axis-asymmetric** host (eye blink is `scaleY`-only). The modifier-reveal doesn't inherit `scaleY` directly (would flatten the slash) but synthesizes an in-plane uniform `scale` dip over the host's `times` so the slash shares a kinetic peak with the blink without distortion. See step 4's tier-1 markers note.

The host-coupling pattern (section 5's worked example) is mandatory for any family whose host transforms.

### Animate per path — one motion per anatomical part

Lucide draws each icon as a list of SVG paths/strokes, and Lucide chose to split them along the icon's anatomy: the clock face is one path, the hour-pair stroke is another; the bell shell is one path, the clapper is another; the cloud body is one path, each rain drop is its own. **Treat that path list as the icon's anatomy.** When the depicted object is made of parts that move differently in real life, you author a separate motion per part and match by path data — not one shared motion smeared across everything.

Worked examples that already shipped:

- **Bell** has shell (rocks on the mount, ~12°), clapper (free pendulum inside, ~22°), and sound waves (radiate outward from the mount). Three different paths, three different motions, three different physical behaviours — but they share a coupled rhythm via `BELL_SHELL_KEYFRAMES`.
- **Clock** has face (mostly steady, tiny breath) and a combined hand-pair (clockwise tick); composite variants add a modifier (alert / arrow / check / plus) that reveals separately. `clockFace` + `clockHands` + `clockModifierReveal` — three motions matched per path role.
- **Flame-kindling** has the flame teardrop (flicker, sway, brightness) AND the two crossed wood sticks (ember opacity glow, slight inherited sway). Two motions per role; the flame dances and the kindling glows independently.
- **Cloud-hail** has the cloud body (gentle breath), three bigger vertical hail pieces (draw-down via `cloudRainDrops`), and three round hailstones (contraction twinkle via `cloudSnowDots`). Three concurrent motions inside one icon.
- **Moon-star** has the crescent (opacity-only reflective glow) AND the small four-pointed sparkle (contraction twinkle pivoted at the star's own centre). Two motions, two different physics, two different transform origins of concern.

How to apply this in practice:

1. Open `src/generated/<icon>.tsx` and **enumerate the `nodes` array out loud** — every entry corresponds to one drawable stroke. Label each one by what it depicts (handle, canopy, slash, ray, sparkle, …).
2. For each anatomical role, decide its own physical motion. If two roles share the same physics (e.g. the upper and lower fragments of a split `cloud-off` body both want the cloud's gentle breath), one motion can cover both via a shared `d`-list matcher. If two roles need different physics, they get separate motion modules.
3. Match by **path data**, not index — `matchPathD`, `matchPathDOneOf`, a regex over `ctx.pathAttrs.d`, or geometric predicates over `ctx.pathTag` / `pathAttrs.cx` / `cy` / `r`. The path list is anatomy; the index list is incidental ordering.
4. If a path's role doesn't have a clear real-life motion (e.g. a decorative state marker), use the family's coupled modifier reveal — see Step 4 item 5 for the inheritance-vs-synthesize choice and the three-criteria check.

When in doubt, ask: "Could this anatomical part move independently of the rest of the icon in reality?" If yes, it deserves its own motion. If no (rigid sub-part of a larger piece), it can share its parent's motion. Either way, the decision happens at the **path level**, not the icon level.

### Design anti-patterns — what NOT to do

Conceptual mistakes (about *what* motion to design). Technical wiring gotchas are covered separately at the end under "Common pitfalls."

- **Defaulting to a family's wildcard motion for every variant.** ("Just use `sunRotate` / `eyeBlink` / `cloudBody` for everything.") Lazy reuse reads as wrong physics — sun-moon's moon must glow, not rotate; sun-snow's snowflake must twinkle in place, not spin. Design what *this specific composite icon* does in reality, then layer specific motions per element role.
- **Drawn-in as the primary signature.** A signature is not `mode="draw"` with bespoke timing. If the main object or most anatomical parts start invisible / `pathLength: 0` and simply stroke on, that is a major failure. `pathLength` is allowed only as a supporting detail when it represents a real physical event (a pen writes, a wave propagates from a source, a slash/marker strikes at a host apex). Core anatomy should usually start from the complete rest glyph and move through object-specific physics: tick, sway, flicker, radiate, fill, drain, bounce, flash, latch, breathe, etc. Before shipping, ask: "If I removed the icon name, would this just look like draw mode?" If yes, redesign.
- **Generic pulse / shake / spin to make an icon "feel alive."** A signature should be a motion that *only makes sense for that icon* — flames flicker in height, hearts contract during systole, clocks tick clockwise in discrete steps, moons reflect (no radial scale). If a uniform scale or rotation would look just as right on any other icon, the design isn't bespoke enough.
- **Scaling up for emphasis.** Per principle 3, the right answer is almost always contraction (`scale ≤ 1`). Brightness/character comes from opacity dips or per-axis transforms, not from ballooning past the viewBox.
- **One motion smeared across an icon with multiple moving parts.** If the icon depicts something whose anatomical parts move differently in real life (clock face vs hands, bell shell vs clapper vs waves, flame vs kindling, cloud vs rain drops), each role needs its own motion matched by path data. See "Animate per path" above.
- **Partial-fixing an overlay marker.** Fixing one of the three criteria (kinetic life / non-distortion / apex alignment) by breaking another. The recurring pattern: agent fixes "marker is co-blinking" (criterion 2) by removing inheritance and breaks criterion 1 (now static); or fixes "marker is static" (criterion 1) by direct-inheriting and breaks criterion 2 (now distorted). Run all three checks; see Step 4's three-criteria table.

### Future feature you might be asked about

There's a deferred `intensity` prop planned — see project memory `project_intensity_prop.md`. It would multiply keyframe amplitudes toward rest so consumers can dial each icon's motion up or down. Don't implement it unless the user explicitly asks; just be aware it exists and that any motion you write today should expect to eventually be wrapped by `attenuate(rest, keyframes, intensity)`.

## Step 2 — Find the next family (primitives-first)

The motion architecture composes per **path data**, not per icon name. A motion declared with `matchPathD(...)` or `matchPathDOneOf(...)` auto-applies anywhere that exact path appears in the catalog. So a host primitive (file envelope, calendar frame, badge wavy outline, message bubble, etc.) authored once unlocks every composite that contains it for free.

**Author primitives BEFORE their composites.** This avoids retrofitting later and produces a cleaner motion catalog.

### How to pick

Step 2a — check what primitives still need a host motion:

```bash
# Find the most-reused path-d's across the catalog
python3 -c "
import json
data = json.load(open('node_modules/.pnpm/lucide-static@1.16.0/node_modules/lucide-static/icon-nodes.json'))
counts = {}
for icon, nodes in data.items():
    for tag, attrs in nodes:
        key = attrs.get('d') if tag == 'path' else (tag, attrs.get('cx'), attrs.get('cy'), attrs.get('r'))
        counts.setdefault(key, []).append(icon)
for k, v in sorted(counts.items(), key=lambda x: -len(x[1]))[:30]:
    print(f'{len(v):3d}x  {str(k)[:60]}  {v[:3]}')
"
```

Then `grep matchPathD src/modes/motions/*.ts` to see which high-reuse paths are *already* covered. The gap is the primitive backlog.

Step 2b — pick using this priority:

1. **Uncovered high-reuse primitive (≥10 hosts)** — author the host motion that unlocks the most composites. See "Primitive roadmap" below for the current count.
2. **Partial families with 1–2 pending icons** that are listed in the family roadmap — finish those first (less context-switching).
3. **Highest-priority partial family** from the family roadmap.
4. **Highest-priority pending family** from the family roadmap.
5. **One-off decorative** icons (sparkle*, zap, atom, compass, gauge, wind, leaf, waves, …).
6. **Icons with no real-world referent** (typography, geometric primitives, brand marks, alignment indicators, UI device depictions, emoji) route through the **abstract archetype catalog** in step 1.

**Never skip an icon; never let it fall back to `draw` as the design answer.**

### Primitive roadmap

The container hosts below cover 200+ composite icons between them. Each is one motion file matched by `matchPathD` (or `matchPathDOneOf` if Lucide reshapes across composites). Author in roughly this order — the count is the number of catalog icons that include the path:

| # | Primitive | Motion file | Hosts | Examples |
|---|---|---|---|---|
| 1 | File envelope (body + folded corner) | `file-envelope.ts` | 50+ | `file`, `file-code`, `file-text`, `file-image`, `file-search`, ... |
| 2 | Calendar frame (body + 2 pins + top line) | `calendar-frame.ts` | 22+ | `calendar`, `calendar-clock`, `calendar-check`, `calendar-search`, ... |
| 3 | Badge wavy outline | `badge-shell.ts` | 17 | `badge`, `badge-alert`, `badge-check`, `badge-dollar-sign`, ... |
| 4 | Book body | `book-body.ts` | 17 | `book`, `book-open`, `book-marked`, `book-key`, `book-heart`, ... |
| 5 | Chart axes (L-shape) | `chart-axes.ts` | 17 | `chart-area`, `chart-bar-big`, `chart-column`, `chart-line`, ... |
| 6 | Monitor frame | `monitor-frame.ts` | 15 | `monitor`, `monitor-check`, `monitor-cog`, `monitor-cloud`, ... |
| 7 | Shield body | `shield-body.ts` | 12 | `shield`, `shield-alert`, `shield-check`, `shield-cog`, ... |
| 8 | Message-square body | `message-square-body.ts` | 11 | `message-square`, `message-square-text`, `message-square-code`, ... |
| 9 | Scan corner brackets (4-path set) | `scan-corners.ts` | 11 | `focus`, `fullscreen`, `scan-barcode`, `scan-eye`, ... |
| 10 | Folder body | `folder-body.ts` | 10 | `folder`, `folder-open`, `folder-check`, `folder-git`, ... |
| 11 | Message-circle body | `message-circle-body.ts` | 10 | `message-circle`, `message-circle-code`, `message-circle-heart`, ... |
| 12 | Receipt body | `receipt-body.ts` | 10 | `receipt`, `receipt-cent`, `receipt-euro`, `receipt-text`, ... |

After Round 1 (host primitives), Round 2 is the standalone primitive **subjects** that show up *inside* the hosts — author each once, and every composite that includes it (`file-code`, `mail-search`, `calendar-cog`, `badge-clock`, ...) gets the motion for free:

| Subject | Motion | Status | Hosts examples |
|---|---|---|---|
| `cog` (gear teeth) | `cog-gear.ts` | **authored — canonical Round-2 precedent** | `cog`, `settings`, `cloud-cog`, `wifi-cog`, `monitor-cog`, `file-cog`, `calendar-cog`, `badge-cog`, ... |
| `clock` (face + hands) | already authored as `clock-face` + `clock-hands` | authored | `clock`, `file-clock`, `calendar-clock`, `badge-clock` |
| `lock`/`unlock` | `lock-shackle.ts` + `lock-body.ts` + `lock-keyhole.ts` | authored | `lock`, `lock-open`, `lock-keyhole`, `lock-keyhole-open`, `folder-lock`, `message-square-lock`, `file-lock`, `book-lock`, ... |
| `pen`/`edit` | `pen-write.ts` + `pen-line-stroke.ts` + `pen-eraser-tip.ts` (`wifi-pen-write.ts` keeps its bespoke wifi-tight variant) | authored | `pen`, `pencil`, `pen-line`, `pencil-line`, `folder-pen`, `file-pen`, ... |
| `code` (chevron pair) | `code-symbol.ts` + `code-xml-slash.ts` | authored | `code`, `code-xml`, `folder-code`, `message-circle-code`, `message-square-code`, `search-code`, `file-code`, `square-code`, ... |
| `arrow` directions | `arrow-glide.ts` | authored (standalone arrow + move families) | `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `arrow-up-right`, `arrow-up-left`, `arrow-down-right`, `arrow-down-left`, `move-up`, `move-down`, `move-left`, `move-right` (composite `*-arrow-{up,down,left,right}` corner badges stay Tier 1 state markers) |
| `search` (loupe + circle) | `search-loupe.ts` (existing `searchScan` is loupe-only; pending External-State-Marker conversion in other signed composites) | partially authored | `search`, `file-search`, `mail-search`, `calendar-search`, `database-search` |
| `image` | `image-frame.ts` | pending | `image`, `file-image`, `book-image` |
| `arrow` directions | `arrow-glide.ts` | pending | `arrow-up/down/left/right`, `file-arrow-up`, `calendar-arrow-up`, ... |
| `share`/`graph` | `share-graph.ts` | pending | `share`, `file-share`, `share-2` |

#### Round-2 subject playbook (cog is the canonical precedent — copy its shape)

Read `motions/cog-gear.ts`, `signatures/cog.ts`, the cog-bearing composite signatures (`cloud-cog.ts`, `wifi-cog.ts`, `monitor-cog.ts`), and `motions/cog-subject.test.ts` before authoring any new Round-2 subject. The cog file establishes the patterns every other subject mirrors:

1. **One subject = one motion file.** All cog elements (standalone teeth + composite teeth + hub circles + merged hub-tooth strokes) live in `cog-gear.ts`. Don't fork per composite.
2. **Specific d-list + geometric matchers.** `COG_TOOTH_DS` is a `Set<string>` of every tooth `d` Lucide uses across composites; `COG_HUB_CIRCLES` is a `Set<"cx,cy,r">` for the hubs. Each new cog-bearing composite extends both sets — never write a new motion.
3. **Per-iconName pivot lookup when the subject's centre varies by composite.** `COG_CENTERS: Record<string, [number, number]>` maps each iconName to its cog centre in user units. The factory reads it and sets `transformOrigin: "${cx}px ${cy}px"` inside both `rest` and `active` variants. Works because the engine uses `transformBox: "view-box"` (see `engine.tsx`), so per-variant `transformOrigin` overrides the signature-level pivot for those specific elements and resolves in user units cleanly — no fillBox bbox math needed.
4. **Place subject motions FIRST in compose order.** `compose` is first-match-wins. Putting the subject ahead of the family modifier-reveal means the specific d-match claims the cog elements before the wildcard would draw them on as a state marker.
5. **Subject-consistency regression test.** `cog-subject.test.ts` instantiates every cog-bearing signature, runs a representative tooth + hub through it, and asserts the resolved variant has `rotate` ending at 360 and NO `strokeDasharray`. New cog-bearing signatures add a row to the test's `cogVariants` array. Future regressions (someone re-adds the family wildcard ahead of `cogGear`) fail the test immediately.

When authoring a new Round-2 subject, mirror these five rules. The subject's bespoke physics differ — lock shackles click open and settle; pens write along their nib path; image frames blink corners; arrows glide in their named direction — but the file structure, per-iconName lookup pattern, compose-order rule, and regression test all follow cog's template.

#### When you're authoring a family that contains a Round-2 subject

This is the consistency rule that prevents subject regressions:

- **Before composing the family modifier-reveal**, scan the variants for any Round-2 subject suffix: `-cog`, `-lock` / `-unlock`, `-pen` / `-edit`, `-code`, `-search`, `-image`, `-arrow-{up,down,left,right}`, `-share`. If the subject's motion is authored (Status column above), import it and place it FIRST in that composite's compose list.
- **Extend the subject's matcher data in the same commit.** For cog: add a `COG_CENTERS` row for the new composite's iconName + the eight tooth d-strings from `src/generated/<iconName>.tsx` + the `<circle r=3>` hub geometry. For other subjects, follow whatever centre/d-list/geometry the motion uses.
- **Add a row to the subject's regression test.** Mirror the existing `cogVariants` shape: iconName, signature import, representative subject nodes. This catches future composites that forget to compose the subject motion.
- **Subject motions are NEVER routed through the family modifier-reveal.** State-marker suffixes (-check, -x, -plus, -minus, -off, -alert, -warning, -question-mark, -percent, -info, -dot, -arrow-*) ARE routed through it. The list of suffixes that aren't state markers but Tier-2 subjects is exactly the Round-2 subject table above. When in doubt, check the table.

Round 3 is the remaining **rich-physics families** that don't decompose cleanly (their parts couple in icon-specific ways): `heart-*`, `clock-*`, `sun-*`/`moon-*`, `cloud-*`, `flame-*`, `loader-*`/`refresh-*`/`rotate-*`, `wifi-*`/`signal-*`/`volume-*`, `battery-*`, `mail-*`/`send`, `mic-*`, `arrow-*`/`chevron-*`/`move-*`, media controls. Most of these are partially or fully authored already.

### Before authoring a new motion, check what's already in the catalog

```bash
grep -r "matchPathD\|matchPathDOneOf" src/modes/motions/ | grep -v ".test.ts"
```

If a primitive you need is already covered by a `matchPathD` somewhere, **reuse it in the new signature's `compose({ motions: [...] })`**. Don't author a duplicate just because the new icon's family is different — that's how the catalog stays small and consistent.

**Announce your pick** to the user before starting:

> Picking **`<primitive | family>`** next — covers N icons: `a`, `b`, `c`, ... Status is currently `<pending | partial>` (M/N signed).

Then immediately follow with the motion plan (next step) and wait for sign-off before coding.

## Step 3.5 — Propose the motion plan and wait for sign-off

Before writing any code for the picked family, post a concise plan and wait for the user to approve it. This is a gate — no edits until they say go. Format:

> **Plan for `<family>`:**
> - **Host motion:** `<motionName>` — `<one-line physics>` (existing | new).
> - **Tier 1 markers (`-check`, `-plus`, `-off`, etc.):** family modifier-reveal `<name>` — draw-in via pathLength + opacity, kinetically coupled via `<inherit | synthesized in-plane companion>` (existing | new).
> - **Tier 2 elements (per variant):** list each role and its bespoke motion. E.g. for `mail-open` — `mailEnvelope` (body breath) + `mailFlap` (raise gesture, replaces V-flap path).
> - **New motions to author:** `<list>`.
> - **Existing motions reused:** `<list>`.
> - **Open design questions:** `<anything ambiguous about real-world referent, host coupling, or marker placement>`.

The user will either approve, redirect, or answer the open questions. Only then move to Step 4. Per project memory `feedback_state_markers_are_external.md`: any state-marker suffix is an external draw-in; never propose a contained-payload or mounted-badge alternative.

## Step 3 — Pre-flight check

Before writing any code:

- `git status` — if the working tree has uncommitted changes, ask the user whether to proceed (they may be mid-task on something else).
- Confirm the current branch — typically `feat/animation-modes` or wherever the user has been working. Don't switch branches without asking.
- Check user memory (`MEMORY.md`) for any relevant feedback notes — especially around commit conventions and phase review cadence.

## Step 4 — Author each variant

For every pending icon in the family, follow section 4 of the doc:

1. **Inspect the paths** — open `src/generated/<icon>.tsx`, note how many paths it has, what each one represents in the real-world referent.
2. **Decide tier per path** (Step 1's "two tiers" definition, or section 3 of the doc). Tier only decides what *additional* motion the path gets — both tiers share kinetic life with the host (see principle 2 for the inherit-vs-synthesize rule).
3. **Reuse existing motions** by path-data match. If a variant reshapes the host's `d` slightly, extend the host motion's `matchPathDOneOf` list rather than writing a new motion.
4. **Make sure the host motion exports its keyframe constants** (`HEART_BEAT_KEYFRAMES`, `BELL_SHELL_KEYFRAMES` are the precedent). Other family motions inherit them.
5. **Tier 1 markers — recognize the suffix, then route through the family's modifier-reveal.** If the variant's name ends in `-off`, `-plus`, `-minus`, `-check`, `-x`, `-dot`, `-alert`, `-warning`, `-info`, `-question`, or `-arrow-{up,down,left,right}`, the modifier path is Tier 1 (see Step 1's "two tiers" table). Don't write a one-off specific matcher for it. Use the family-wide modifier-reveal (`heartModifierReveal`, `bellModifierReveal`, `eyeModifierReveal`) — or build one if the family doesn't have it yet: a `matchAnyPath` motion combining `pathLength` + `opacity` reveal (or `scale` + `opacity` for `<circle>` markers — see `bellDotReveal`), placed LAST in the compose list. The kinetic companion follows principle 2's host-transform-shape rule:
   - **In-plane host** → directly inherit the host's primary transform. Examples: `bellModifierReveal` inherits `BELL_SHELL_KEYFRAMES.rotate`; `heartModifierReveal` inherits `HEART_BEAT_KEYFRAMES.scale`; `cloudModifierReveal` inherits `CLOUD_BODY_KEYFRAMES.scale`.
   - **Axis-asymmetric host** → synthesize an in-plane companion (uniform `scale` dip like `[1, 0.85, 1]`, or `opacity` dip) and pin it to the host's `times`. Example: `eyeModifierReveal` defines its own `scale: [1, 0.85, 1]` over `EYE_BLINK_KEYFRAMES.times` because the eye's `scaleY`-only blink would flatten a diagonal slash if inherited directly.
6. **Tier 2 with bespoke physics** — write a new motion under `src/modes/motions/`, named `<icon>-<role>.ts`. Design it from "how does this real-world thing actually behave?". If it sits inside or attached to a transforming host, also share the host's kinetic life via principle 2 (direct inherit or synthesized companion as appropriate).
7. **Write the signature** as a thin `compose()` call (`src/modes/signatures/<icon>.ts`).
8. **Every icon gets a signature.** If a variant's referent has no clear physical motion, identify its bucket in step 1's abstract archetype catalog and apply the matching archetype. `draw` is never the design answer — the engine's runtime fallback exists only as a safety net while signature coverage builds out.
9. **Run the drawn-in anti-pattern check before coding and again before handoff.** List the primary visible action for every anatomical role. If that list is mostly "pathLength reveals" / "opacity fades in" / "draws on", stop. Redesign around a real object behavior and reserve `pathLength` for small supporting events with physical meaning.

After each phase of work, **self-review before moving on** (project memory `feedback_phase_review.md`): fix issues and re-review before the next phase.

### Three-criteria check (run on EVERY overlay marker before declaring done)

Recurring corrections happen when you fix one symptom and introduce another. To prevent that, walk every modifier-reveal and overlay marker through these three checks. All three must pass.

| # | Criterion | What it means | How to verify |
|---|---|---|---|
| 1 | **Continuous kinetic life** | The marker is doing *something* throughout the cycle — not just at start/end. A static overlay reads as disconnected from the host. | Look at the marker's `active` block. Is there a transform that varies across the cycle (rotate, scale, opacity dip)? Or does the marker only animate `pathLength` + `opacity` and otherwise sit still? Sit-still = fail. |
| 2 | **Non-distortion** | The marker's intrinsic shape stays intact (a 45° diagonal slash stays a 45° diagonal; a `+` sign stays orthogonal). No axis-asymmetric host transform inherited directly. | Is the marker inheriting `scaleY` only or `scaleX` only from the host? If yes, replace with synthesized in-plane companion (see step 5). |
| 3 | **Apex alignment** | The marker's `pathLength` strike *completes at* the host's primary event peak, not after it. The draw-in and the host's peak event share one peak. | Compare the marker's `pathLength` times to the host's keyframe times. The end of the strike (`pathLength → 1`) should land at the same time fraction as the host's apex (e.g. `0.5` for `EYE_BLINK_KEYFRAMES.times = [0, 0.5, 1]`). |

The recurring failure mode this guards against: fix criterion 2 by removing inheritance → break criterion 1 (marker now static). Or fix criterion 1 by inheriting → break criterion 2 (marker distorts). The synthesized in-plane companion + apex-aligned pathLength is the configuration that satisfies all three.

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
- **What to look for** — frame this as the three-criteria check so the user knows what visual signal to attend to:
  1. **Real-life motion reads correctly** — flame flickers in height, heart contracts inward, clock ticks discretely, etc. No generic pulse/spin that could apply to any icon.
  2. **Overlay markers have continuous kinetic life AND stay undistorted AND complete at the host's apex** — slash strikes through *as* the eye reaches max-close (not after); the slash stays a 45° diagonal throughout (no horizontal flattening); the slash isn't a static line popping in over a moving icon.
  3. **No clipping at the 24×24 edges, no static modifiers floating over moving icons.**

**Do not start the next family without explicit user approval.** One family per invocation. The user reviews visually, requests adjustments if needed (those become a refinement `fix(lib): ...` commit), then approves moving on.

## Common pitfalls — technical wiring gotchas (re-read before submitting)

Distinct from the conceptual anti-patterns above; these are the wiring traps that produce silent/subtle bugs even when the design is right.

- **`inherit: true` on every per-value transition.** Required because motion-dom otherwise replaces the parent transition entirely, dropping `duration` / `delay` / `repeat` and falling back to its default 300 ms — the modifier ends up out of phase with the rest of the icon.
- **Match by `d` data, not `ctx.index`.** Lucide reorders paths sometimes. Use `matchPathD`, `matchPathDOneOf`, a regex over `pathAttrs.d`, or `<circle>` geometry (`cx` / `cy` / `r`).
- **`matchAnyPath` is greedy — last in the compose list.** Otherwise it claims paths that need bespoke physics. The compose iterator is first-match-wins (`src/modes/compose.ts`).
- **`scale > 1` clips at viewBox edges.** Design scale rhythms as contractions. Also remember the scaled-stroke gotcha — `transform: scale(1.2)` scales `strokeWidth` by 1.2 too, so the visible edge is `scaled_endpoint + scaled_stroke_radius`.
- **Regenerate after writing a signature.** The codegen reads `src/modes/signatures/` at generate-time; `prebuild` and `predev` handle it automatically, but standalone changes need a manual `pnpm --filter lucide-react-motion generate`.
- **Run the three-criteria check on every overlay marker before commit.** See the table in Step 4. The recurring failure mode is partial-fixing one criterion and silently breaking another.
- **Motion's `pathLength` shortcut leaves a seam on closed paths.** Setting `pathLength: [0, 1]` in a variant permanently writes `pathLength="1"` + `stroke-dasharray="1 1"` + `stroke-dashoffset="0"` to the rendered element. On open-but-closing paths (gear, cloud, heart, settings) the normalized dash boundary lands on the closure and the two round linecaps render with a visible gap. The default `draw` mode and every bespoke signature motion now use real `stroke-dasharray` + `stroke-dashoffset` driven by `ctx.pathLength` (measured via `getTotalLength()`) and clear both at rest via `transitionEnd` — see `src/modes/draw.ts` or any existing modifier-reveal (`bell-modifier-reveal.ts`, etc.). **Mirror that pattern for any NEW draw-in motion you author.** Never reach for Motion's `pathLength` value — that's the leftover-dash trap.
- **Every `active` keyframe must form a closed cycle that starts and ends at the rest value.** When the animation completes, the icon stays at the final keyframe — there is no engine-level snap-back. If `rest: { scale: 1 }` and `active: { scale: [0.94, 1, 0.94] }`, the icon ends at 94% and visibly drifts away from the Lucide-original glyph. Author every keyframe array so the first AND last value equal the rest value: `scale: [1, 0.94, 1]`, `y: [0, -3, 3, 0]`, etc. For loop-shaped motions (rain/snow falling, drops fading) wrap the visible cycle in opacity-covered teleport beats so the start/end land at rest position invisibly. Rotations are the only exception — `[0, -360]` is fine because Motion snaps to keyframe[0] on re-trigger, making `-360 ≡ 0` indistinguishable from rest. The `rest-cycle.test.ts` invariant test catches violations automatically; run `pnpm test` before committing a new motion.
