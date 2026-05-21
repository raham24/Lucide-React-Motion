---
"lucide-react-motion": minor
---

Render byte-identical to Lucide's static SVG at rest.

The default `draw` mode previously used Motion's `pathLength` shortcut, which permanently writes `pathLength="1"`, `stroke-dasharray="1 1"`, and `stroke-dashoffset="0"` to every rendered element. On icons whose path starts and ends near the same point (settings gear, cloud, heart, ...) the normalized dash boundary lands on the closure and the two round linecaps render with a visible gap between them. The resting DOM also differed structurally from Lucide's reference SVG, which carries no dash attributes at all.

The default `draw` mode now measures each element's real path length via `getTotalLength()` and animates `stroke-dashoffset` against a real `stroke-dasharray`. At rest both attributes collapse to `0` (solid stroke, no dashing), and a `transitionEnd` resets them after every play so the resting DOM stays dash-free even after the animation completes.

`ModeContext` gains a required `pathLength: number` field carrying the measured length. Anyone building a custom mode by inferring the factory signature (`(ctx) => Variants`) is unaffected — TypeScript infers it. Anyone hand-typing a `ModeContext` literal (typically in tests) will need to add `pathLength` to the object.

Existing bespoke signature motions in `src/modes/motions/` still use Motion's `pathLength` value internally; they target short open strokes (modifier slashes, plus/minus, single arcs) where the seam isn't visible, and they're scheduled for a follow-up migration to the same dasharray pattern.
