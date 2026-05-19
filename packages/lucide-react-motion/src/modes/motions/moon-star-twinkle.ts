import { matchPathDOneOf, type Motion } from "../compose";

/**
 * The small four-pointed sparkle next to the crescent in `moon-star`.
 * Lucide draws it as two short crossing strokes — a horizontal at
 * (18,5)→(22,5) and a vertical at (20,3)→(20,7) — that together form
 * a "+" shape in the icon's upper-right.
 *
 * Tier 2 motion: a star twinkles by light intensity flicker — its
 * apparent brightness fluctuates as atmospheric turbulence bends the
 * light from a distant point source. Modeled here as two opacity
 * dips between subtle scale pops — the brightness change carries the
 * twinkle character, the small scale pulse just adds a little visual
 * punch without ever pushing the strokes past the viewBox edges.
 *
 * **Pivot**: the `moon-star` signature sets its `transformOrigin` to
 * `"20px 5px"` — the star's geometric centre — so this scale animates
 * in place rather than translating the sparkle toward the icon centre.
 * The opacity-only `moonGlow` on the crescent is unaffected by that
 * off-centre origin, so both motions can coexist cleanly.
 *
 * **ViewBox math**: scale peaks at 1.2. The horizontal endpoint at
 * (22, 5) scales to (22.4, 5) with a stroke radius of 1.2 (the stroke
 * scales with the transform), so the right-most visible pixel sits at
 * x≈23.6 — inside the 24-unit viewBox with ~0.4u margin. Going higher
 * than 1.2 (the previous 1.35 attempt) leaked over the right edge.
 */
const STAR_PATHS = [
  "M18 5h4",
  "M20 3v4",
];

export const moonStarTwinkle: Motion = {
  matches: matchPathDOneOf(...STAR_PATHS),
  factory: (ctx) => ({
    rest: { scale: 1, opacity: 1 },
    active: {
      scale: [1, 1.2, 1, 1.1, 1],
      opacity: [1, 1, 0.3, 1, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        times: [0, 0.15, 0.4, 0.7, 1],
        repeat: ctx.repeat,
      },
    },
  }),
};
