import { matchAnyPath, type Motion } from "../compose";

/**
 * Zap-family wildcard reveal for the off-slash in `zap-off` (the
 * diagonal `m2 2 20 20` stroke that strikes through the broken bolt
 * to indicate the lightning is suppressed).
 *
 * **Coupling pattern**: the host motion ({@link import("./zap-strike").zapStrike})
 * animates `y` (descent) + `opacity` (flicker).
 *
 * - Direct `y` inheritance is wrong: a slash that slides DOWN with
 *   the bolt fragments stops reading as a static strike-through.
 *   The slash skips translation entirely and stays at its rest
 *   position.
 * - Direct `opacity` inheritance is also wrong: the host's opacity
 *   pattern starts at 0 and peaks at the descent's end (t=0.10) —
 *   if the slash inherited that, it would land alongside the bolt's
 *   primary flash, fighting it for attention. The slash needs to
 *   land AFTER the bolt, in the dim trough between flashes.
 *
 * So the slash has its own `pathLength` + `opacity` reveal that
 * completes at t=0.18 (the host's first dim trough between flash
 * peaks), and a synthesized uniform `scale` dip `[1, 0.92, 1]` that
 * shares a kinetic peak with the slash's strike completion. Uniform
 * scale preserves the 45° diagonal (criterion 2 — no distortion);
 * the scale dip provides continuous kinetic life through the rest
 * of the cycle (criterion 1); and the strike apex aligns with the
 * host's first dim trough (criterion 3).
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath` is
 * greedy and would otherwise claim the bolt fragments.
 */
export const zapModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      // Hold invisible through the bolt's descent and primary
      // flash (t = 0..0.10), then strike through during the first
      // dim trough (t = 0.10..0.18). Slash lands in the dark moment
      // right after the bolt's brightest peak.
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      // Scale contracts to its trough at the slash's strike apex,
      // then gradually releases over the rest of the cycle. Keeps
      // the slash alive while the bolt continues to flicker.
      scale: [1, 0.92, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.10, 0.18] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.10, 0.18] },
        // Scale trough at t=0.18 = the slash's strike moment.
        // Recovers across the bolt's secondary flickers.
        scale: { inherit: true, ease: "easeInOut", times: [0, 0.18, 1] },
      },
    },
  }),
};
