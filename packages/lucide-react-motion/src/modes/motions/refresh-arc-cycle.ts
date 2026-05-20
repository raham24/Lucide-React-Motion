import { matchPathDOneOf, type Motion } from "../compose";

/**
 * The refresh icon's structural anatomy — two partial arcs forming a
 * loop around the icon centre, plus the L-shaped tick marks at each
 * arc's end that visually serve as the directional arrowheads.
 *
 * **Real-life motion**: the refresh action is a discrete cyclical
 * redraw — "wipe what's there, fetch new data, redraw it." Common
 * UI vocabulary uses a literal 360° spin to convey this, but the
 * Lucide refresh design has tick-mark corners at radius √(9² + 9²)
 * ≈ 12.73 from the icon centre, which is outside the inscribed
 * circle of the 24×24 viewBox. A full rotation around the centre
 * would carry those corners past the viewBox edge (≈ 0.7 viewBox
 * units beyond x=24 at θ=45°) and slice them off at runtime; even
 * a small ±15° wobble crowds the edge once strokeWidth is factored
 * in.
 *
 * So instead of a literal rotation, this signature *redraws* the
 * loop along the path's own direction: pathLength sweeps from 1
 * (fully visible) down to 0 (wiped) and back up to 1 (redrawn).
 * The redraw half is the longer, easeInOut-shaped phase that
 * carries the motion's character; the path's stored direction in
 * `d` (cw arcs go bottom-left → top-right along the top, ccw the
 * other way) means the redraw visually rotates in the icon's
 * named direction without ever applying a transform. Each variant
 * stays anchored at its rest geometry between cycles.
 *
 * Differentiates from `loaderSpin` (continuous infinite rotation —
 * "ongoing wait"), `loaderCircleSweep` (continuous rotation with
 * mid-cycle opacity breath), and `mode="draw"` (one-shot stroke-on
 * with stagger). This is a cyclical wipe-redraw that reads as
 * "discrete refresh event" rather than "ambient spinner."
 *
 * **Direction encoding**: the path data itself encodes cw vs ccw
 * via the SVG arc sweep flags. PathLength's 0→1 phase always draws
 * from the M point along the path's stored direction, so the
 * refresh-cw arcs redraw clockwise while refresh-ccw arcs redraw
 * counter-clockwise — same motion, opposite read.
 *
 * **ViewBox safety**: no rotation, no scale; only pathLength +
 * opacity, which are both bounds-safe. The icon never leaves its
 * rest geometry.
 *
 * Catches arcs + tick marks across every refresh variant —
 * including the four broken-arc fragments in `refresh-cw-off`
 * where the slash splits the original cw arcs into pieces. The
 * slash itself routes through {@link import("./refresh-modifier-reveal").refreshModifierReveal}.
 *
 * Exports `REFRESH_ARC_KEYFRAMES` so the centre dot and the off-slash
 * can share the same `times` for a synchronized kinetic peak.
 */
export const REFRESH_ARC_KEYFRAMES: {
  pathLength: number[];
  opacity: number[];
  times: number[];
} = {
  pathLength: [1, 0, 1],
  opacity: [1, 0.55, 1],
  times: [0, 0.4, 1],
};

const ARC_AND_TICK_PATHS = [
  // refresh-cw: top arc (bottom-left → top-right) + top-right tick
  "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
  "M21 3v5h-5",
  // refresh-cw: bottom arc (top-right → bottom-left) + bottom-left tick
  "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
  "M8 16H3v5",
  // refresh-ccw: top arc (top-right → top-left) + top-left tick
  // Also used in refresh-ccw-dot.
  "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
  "M3 3v5h5",
  // refresh-ccw: bottom arc (bottom-left → bottom-right) + bottom-right tick
  "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",
  "M16 16h5v5",
  // refresh-cw-off: four arc fragments where the slash cuts through
  // the original cw arcs. The tick marks (M21 3v5h-5 and M8 16H3v5)
  // are shared with refresh-cw and already listed above.
  "M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47",
  "M3 12C3 9.51 4 7.26 5.64 5.64",
  "m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64",
  "M21 12c0 1-.16 1.97-.47 2.87",
];

export const refreshArcCycle: Motion = {
  matches: matchPathDOneOf(...ARC_AND_TICK_PATHS),
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1 },
    active: {
      pathLength: REFRESH_ARC_KEYFRAMES.pathLength,
      opacity: REFRESH_ARC_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // Smooth wipe-then-redraw curve. EaseInOut on both ends gives
        // the contraction-and-recovery a measured, intentional feel —
        // not a panicked snap.
        pathLength: {
          inherit: true,
          ease: "easeInOut",
          times: REFRESH_ARC_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: REFRESH_ARC_KEYFRAMES.times,
        },
      },
    },
  }),
};
