import { matchAnyPath, type Motion } from "../compose";

/**
 * Quick blink — collapse vertically to a sliver, then snap back open. The
 * eye icon has two paths (outer almond + pupil circle) that both blink
 * together as a whole-icon scaleY, so this motion matches any path in
 * whichever signature imports it.
 *
 * Reused by every eye variant that preserves the blink semantics
 * (`eye`, `eye-off` could compose it alongside a slash motion, etc.).
 */
export const eyeBlink: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { scaleY: 1 },
    active: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
};
