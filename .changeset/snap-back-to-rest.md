---
"lucide-react-motion": patch
---

Every icon now snaps back to its rest state when the active animation completes. Most signature motions already landed at rest via their final keyframe value, but a handful — `cloud-rain-drops`, `cloud-snow-dots`, `sun-ray-pulse`, `snowflake-twinkle`, `mail-modifier-pulse`, `rotate-key-turn` — left residual offsets, opacity, or scale that drifted the icon away from its Lucide-original glyph after one play. The engine now issues a zero-duration return to the `rest` variant on `onAnimationComplete`, guaranteeing the resting DOM is byte-identical to Lucide's static SVG regardless of how the motion was authored. Looping animations (`repeat: Infinity`, e.g. loaders) never complete and so are unaffected.
