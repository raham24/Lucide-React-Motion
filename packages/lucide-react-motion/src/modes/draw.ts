import type { Mode } from "./types";

/**
 * The default stroke-on draw — what every icon does by default.
 *
 * Implementation note: we deliberately avoid Motion's `pathLength` shortcut.
 * `pathLength` writes `pathLength="1"`, `stroke-dasharray="1 1"`, and
 * `stroke-dashoffset="0"` to the rendered element and leaves them there
 * permanently. The leftover normalized dash pattern produces a visible seam
 * on icons whose path starts and ends near the same point (gear, cloud,
 * heart, ...) because the dash boundary lands on the closure and the two
 * round linecaps render with a hairline gap between them. To render
 * byte-identical to Lucide's static SVG, the resting DOM must carry no
 * dash attributes at all.
 *
 * So instead: at rest we set `strokeDasharray` and `strokeDashoffset` to 0
 * (solid stroke, no dashing). During the active draw-in we snap
 * `strokeDasharray` to the element's measured length and animate
 * `strokeDashoffset` from `length → 0`. `transitionEnd` clears
 * `strokeDasharray` back to 0 the moment the draw finishes so the resting
 * state remains dash-free even after a play.
 */
export const draw: Mode = {
  factory: (ctx) => ({
    rest: {
      strokeDasharray: 0,
      strokeDashoffset: 0,
      opacity: 1,
    },
    active: {
      strokeDasharray: ctx.pathLength,
      strokeDashoffset: [ctx.pathLength, 0],
      opacity: [0.25, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
        repeatType: "loop",
        // Snap the dasharray switch — without this motion would tween from
        // 0 → pathLength over the full duration and render a shifting dash
        // pattern instead of a clean offset sweep.
        strokeDasharray: { duration: 0 },
      },
      transitionEnd: {
        // Drop the dash pattern the instant the draw finishes so the
        // resting DOM is back to a plain stroke. Without this, a finished
        // play would leave `stroke-dasharray="<L>"` on the element and
        // re-introduce the closed-path seam on any subsequent re-render.
        strokeDasharray: 0,
        strokeDashoffset: 0,
      },
    },
  }),
};
