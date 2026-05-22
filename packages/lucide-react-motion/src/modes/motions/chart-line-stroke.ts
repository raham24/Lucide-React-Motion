import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Single-stroke data lines across the chart family — `chart-line`'s
 * zig-zag, `chart-spline`'s curve, `chart-area`'s closed mountain
 * polygon, and `chart-no-axes-combined`'s scalloped top line.
 *
 * Tier 2 data motion — the line/curve rests at its plotted shape and
 * dims briefly to signal a data refresh, then brightens back. A tiny
 * uniform scale dip (`[1, 0.94, 1]`) provides continuous kinetic life
 * so the line shares motion with the axes' opacity breath instead of
 * sitting visually static on a pulsing frame.
 *
 * Uniform `scale` (not `scaleY`) so the line contracts toward the
 * signature's transformOrigin (the chart baseline) without distorting
 * the line's intrinsic shape — chart-line's zig-zag stays a zig-zag,
 * chart-spline's curve stays curved.
 *
 * Closed cycle per principle 4; no `transitionEnd` cleanup needed.
 */
const LINE_STROKE_PATHS = [
  // chart-line — zig-zag connecting four points
  "m19 9-5 5-4-4-3 3",
  // chart-spline — smooth cubic curve
  "M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7",
  // chart-area — closed polygon underneath the line
  "M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z",
  // chart-no-axes-combined — top scalloped line
  "m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15",
];

export const chartLineStroke: Motion = {
  matches: matchPathDOneOf(...LINE_STROKE_PATHS),
  factory: (ctx) => ({
    rest: { scale: 1, opacity: 1 },
    active: {
      scale: [1, 0.94, 1, 1],
      opacity: [1, 0.5, 1, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        scale: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.32, 0.65, 1],
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.32, 0.65, 1],
        },
      },
    },
  }),
};
