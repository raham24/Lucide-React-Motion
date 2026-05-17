import type { Mode } from "../types";

/**
 * Lub-dub beat — two quick compressions weighted with `times` so the second
 * pump lands faster than the first, matching the rhythm of a real heartbeat.
 */
const heart: Mode = {
  factory: (ctx) => ({
    rest: { scale: 1 },
    active: {
      scale: [1, 1.2, 0.92, 1.15, 0.96, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
        times: [0, 0.15, 0.3, 0.45, 0.6, 1],
      },
    },
  }),
  defaults: { duration: 0.8, easing: "easeInOut", stagger: 0 },
  needsTransformOrigin: true,
};

export default heart;
