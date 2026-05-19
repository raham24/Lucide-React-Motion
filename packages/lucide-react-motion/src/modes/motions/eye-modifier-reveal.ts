import { matchAnyPath, type Motion } from "../compose";
import { EYE_BLINK_KEYFRAMES } from "./eye-blink";

/**
 * Eye-family wildcard reveal — `pathLength` + `opacity` draw-in plus
 * the host `eyeBlink`'s scaleY collapse so any state modifier overlaid
 * on the eye (the diagonal slash in `eye-off`, and future markers like
 * plus / minus / check / dot if Lucide ships them) strikes through on
 * top of the eye, individually, then stays anchored to the blink rather
 * than floating statically over a collapsing shell.
 *
 * Catches whatever's left after `eyeBlink` matches the registered eye-
 * body paths and pupil circle:
 *
 * - `eye-off`'s diagonal slash `m2 2 20 20`
 * - any future eye-plus / eye-minus / eye-check / eye-x marker stroke
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath` is
 * greedy and would claim eye-body paths if put before `eyeBlink`. Same
 * arrangement as `bell-off`'s `[bellClapper, bellShell,
 * bellModifierReveal]` and `heart-off`'s `[heartBeat,
 * heartModifierReveal]`.
 *
 * `scaleY` uses `inherit: true` so the host transition's duration /
 * delay / repeat propagate down. Without that, motion-dom replaces the
 * parent transition entirely and the per-value block falls back to its
 * default 300 ms — completely out of phase with the eye's blink.
 */
export const eyeModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scaleY: 1 },
    active: {
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      scaleY: EYE_BLINK_KEYFRAMES.scaleY,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // Marker draws in on its own delayed schedule — holds invisible
        // through the eye's collapse, strikes in as the eye reopens.
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.25, 0.6] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.25, 0.6] },
        // ScaleY piggybacks on the eye's blink collapse so the marker
        // stays anchored through the squeeze rather than hovering over
        // a collapsing shell.
        scaleY: {
          inherit: true,
          ease: ctx.easing,
          times: EYE_BLINK_KEYFRAMES.times,
        },
      },
    },
  }),
};
