import { matchPathD, type Motion } from "../compose";
import { EYE_BLINK_KEYFRAMES } from "./eye-blink";

/**
 * The diagonal slash in `eye-off` — Lucide's `m2 2 20 20`, a single
 * 28-unit stroke from (2, 2) to (22, 22). The slash silences the eye
 * the way a strike-through silences a word.
 *
 * Tier 1 modifier reveal: a delayed `pathLength` draw + opacity
 * fade-in that strikes through after the eye has begun blinking, so
 * the silenced reading lands as a *gesture* — the eye blinks, the
 * slash hits, the eye reopens through the strike. The slash draws
 * from its natural start (top-left) to its end (bottom-right), the
 * way a real pen stroke moves.
 *
 * Couples to the host eye blink via `EYE_BLINK_KEYFRAMES.scaleY` so
 * the slash collapses vertically with the rest of the icon and stays
 * anchored through the blink rather than hovering statically over a
 * collapsing shape. The per-value `inherit: true` is required — without
 * it motion-dom drops the parent transition's duration / delay /
 * repeat and falls back to its default 300 ms, leaving the slash out
 * of phase with the rest of the eye.
 *
 * Place this BEFORE `eyeBlink` in the compose `motions` list — the
 * specific `matchPathD` here claims the slash before `eyeBlink`'s
 * wildcard does, so the slash gets its reveal physics while the
 * three eye fragments and the pupil arc fall through to the blink.
 */
export const eyeOffSlash: Motion = {
  matches: matchPathD("m2 2 20 20"),
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
        // Slash holds invisible until ~25% of the duration, then draws
        // in over the next 35% — landing during the eye's collapse so
        // the strike-through reads as the silencing gesture.
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.25, 0.6] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.25, 0.6] },
        // ScaleY piggybacks on the eye's blink collapse so the slash
        // shrinks vertically with the eye and re-extends as it reopens.
        scaleY: {
          inherit: true,
          ease: ctx.easing,
          times: EYE_BLINK_KEYFRAMES.times,
        },
      },
    },
  }),
};
