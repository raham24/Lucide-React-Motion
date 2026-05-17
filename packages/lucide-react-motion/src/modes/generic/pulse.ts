import type { Mode } from "../types";

/**
 * Whole-icon scale pulse. Quick "boop" suitable for confirmations or
 * attention nudges (likes, notifications, status changes).
 */
export const pulse: Mode = {
  factory: (ctx) => ({
    rest: { scale: 1 },
    active: {
      scale: [1, 1.15, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.4, easing: "easeOut", stagger: 0 },
  needsTransformOrigin: true,
};
