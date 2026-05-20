import { matchAnyPath, type Motion } from "../compose";

/**
 * Zap-family wildcard reveal for the off-slash in `zap-off` (the
 * diagonal `m2 2 20 20` stroke that strikes through the broken
 * bolt to indicate the lightning is suppressed).
 *
 * **Coupling pattern**: the host motion ({@link import("./zap-strike").zapStrike})
 * animates `y` (descent) + `opacity` (multi-flash). The slash skips
 * `y` inheritance entirely (a slash that slides down with the bolt
 * stops reading as a static strike-through), has its own
 * `pathLength` + `opacity` reveal completing at t=0.50 (the host's
 * first dim trough, right after the strike lands), and a
 * synthesized uniform `scale` dip `[1, 0.92, 1]` whose trough
 * aligns with the slash's strike apex.
 *
 * Three-criteria check:
 * - **Kinetic life**: pathLength + opacity vary through the reveal
 *   (t=0..0.50); scale dip continues across the rest of the cycle
 *   (t=0.50..1) so the slash stays alive through the post-strike
 *   flicker. ✓
 * - **Non-distortion**: uniform scale, no rotation, no translation.
 *   The slash holds its 45° diagonal throughout. ✓
 * - **Apex alignment**: strike completes at t=0.50, the dark moment
 *   right after the bolt's first flash and before the second. ✓
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath`
 * is greedy and would otherwise claim the bolt fragments.
 */
export const zapModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      // Hold invisible through the descent + primary flash (t=0..0.40),
      // then strike through during the dim trough (t=0.40..0.50). Slash
      // lands when the bolt's brightness has just dropped — a clear
      // "blocked just after the strike" beat.
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      scale: [1, 0.92, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.40, 0.50] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.40, 0.50] },
        // Scale trough at t=0.50 = slash strike apex; recovers
        // across the bolt's secondary flickers.
        scale: { inherit: true, ease: "easeInOut", times: [0, 0.50, 1] },
      },
    },
  }),
};
