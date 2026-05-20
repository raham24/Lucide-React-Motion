import { matchAnyPath, type Motion } from "../compose";

/**
 * Generic "modifier reveals itself during the action" motion. Used by every
 * bell variant whose modifier is a path: `bell-plus`, `bell-minus`,
 * `bell-check`, `bell-off`, `bell-ring`. The modifier starts invisible and
 * draws itself in mid-way through the ring, so the bell appears to ring
 * *and then* the modifier registers (a "+ was added", "× cancelled it",
 * "✓ confirmed it"). At the end of the animation the modifier stays
 * visible, matching the icon's resting state.
 *
 * Uses `pathLength` + `opacity` so no transform origin is needed — works
 * cleanly under the bell's `12px 4px` mount pivot without scaling from
 * the wrong point.
 *
 * Wildcard match: place this last in the compose `motions` list so the
 * shell and clapper get matched first; whatever's left is the modifier.
 */
export const modifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1 },
    active: {
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        times: [0, 0.2, 0.55],
        ease: "easeOut",
        repeat: ctx.repeat,
      },
    },
  }),
};
