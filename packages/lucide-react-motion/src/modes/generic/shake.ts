import type { Mode } from "../types";

/**
 * Damped side-to-side wiggle. Useful for error states, "shake your head"
 * disapproval cues, or playful attention grabs.
 */
export const shake: Mode = {
  factory: (ctx) => ({
    rest: { rotate: 0 },
    active: {
      rotate: [0, -8, 8, -5, 5, 0],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.5, easing: "easeInOut", stagger: 0 },
  needsTransformOrigin: true,
};
