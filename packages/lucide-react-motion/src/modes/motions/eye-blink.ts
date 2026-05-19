import { matchAnyPath, type Motion } from "../compose";

/**
 * Quick blink — collapse vertically to a sliver, then snap back open.
 * The eye icon has two paths (outer almond + pupil circle) that both
 * blink together as a whole-icon scaleY, so this motion matches any
 * path in whichever signature imports it.
 *
 * Reused by every eye variant that preserves the blink semantics:
 * - `eye` — wildcard catches both the almond path and the pupil
 *   circle, both collapse together.
 * - `eye-off` — composed alongside `eyeOffSlash` placed FIRST so the
 *   slash is claimed by its dedicated reveal, and this wildcard
 *   catches the remaining eye-shape fragments + pupil arc so they
 *   blink through the slash.
 *
 * Exports `EYE_BLINK_KEYFRAMES` for variant-specific reveal motions
 * (e.g. `eyeOffSlash`) to inherit via per-value `inherit: true`
 * transitions so the slash stays anchored to the blinking eye
 * rather than floating statically over a collapsing shape.
 *
 * Always place this LAST in the compose `motions` list — `matchAnyPath`
 * is greedy and would claim a slash or marker put after it.
 */
export const EYE_BLINK_KEYFRAMES = {
  scaleY: [1, 0.1, 1],
  times: [0, 0.5, 1],
};

export const eyeBlink: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { scaleY: 1 },
    active: {
      scaleY: EYE_BLINK_KEYFRAMES.scaleY,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        times: EYE_BLINK_KEYFRAMES.times,
        repeat: ctx.repeat,
      },
    },
  }),
};
