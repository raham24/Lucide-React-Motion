---
"lucide-react-motion": patch
---

Every signature motion now lands cleanly back at the rest glyph after one play. Six motions had been authored with `active` keyframes whose last value didn't match the rest value, leaving the icon visibly drifted: `cloud-rain-drops` and `cloud-snow-dots` ended with the drop translated downward and invisible; `sun-ray-pulse` left the rays shrunk to 94%; `snowflake-twinkle` to 98%; `mail-modifier-pulse` left warning markers at 18% opacity and 82% scale; `rotate-key-turn` ended at -360°.

Each is now re-authored as a closed cycle that starts AND ends at the rest value — no engine-level snap, the return is part of the animation. For loop-shaped motions (rain, snow) the cycle wraps the visible fall in opacity-covered teleport beats so the start and end land at rest position invisibly.

Added a `rest-cycle.test.ts` invariant test that iterates every motion in `src/modes/motions/` via `import.meta.glob`, calls the factory, and asserts each animated property in `active` lands at its `rest` value (literally for most, mod-360 for rotations). Catches this class of bug automatically going forward.
