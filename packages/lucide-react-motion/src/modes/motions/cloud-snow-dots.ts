import { matchPathDOneOf, type Motion } from "../compose";

/**
 * The small `h.01` round-capped dots that draw snowflakes in
 * `cloud-snow` and the smaller round pieces in `cloud-hail`. Lucide
 * uses the degenerate `M{x} {y}h.01` path that renders as a single
 * stroke-cap dot for these.
 *
 * Tier 2 motion: snowflakes (and hailstones) drift and flicker as
 * they fall, catching light at different facets. Modeled here as a
 * contraction-only sparkle — each dot dims and shrinks toward its
 * own position, then recovers — so the strokes stay anchored
 * regardless of stroke width (per the moon-star lesson: scale > 1
 * also scales the stroke radius and can clip the viewBox edge,
 * especially for dots sitting near the bottom row at y=22).
 *
 * Per-path stagger cascades the twinkle so flakes don't all
 * flicker in lockstep — reads as falling snow rather than a
 * synchronised reveal.
 *
 * **Couples to the cloud body**: scale piggybacks on
 * `cloudBody`'s gentle pulse via `inherit: true`, layered with the
 * snow's own deeper contraction.
 */
const SNOW_PATHS = [
  // cloud-snow — six flakes
  "M8 15h.01",
  "M8 19h.01",
  "M12 17h.01",
  "M12 21h.01",
  "M16 15h.01",
  "M16 19h.01",
  // cloud-hail — three round pieces (small hailstones)
  "M16 20h.01",
  "M8 20h.01",
  "M12 22h.01",
];

export const cloudSnowDots: Motion = {
  matches: matchPathDOneOf(...SNOW_PATHS),
  factory: (ctx) => ({
    rest: { scale: 1, opacity: 1 },
    active: {
      // Contractions only — scale > 1 here would push stroke past
      // the viewBox edge at the bottom row (y=22). Twinkle reads
      // through opacity dips paired with the gentle scale contract.
      scale: [1, 0.55, 1, 0.75, 1],
      opacity: [1, 0.3, 1, 0.55, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        times: [0, 0.2, 0.5, 0.75, 1],
        repeat: ctx.repeat,
      },
    },
  }),
};
