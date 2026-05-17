import type { Mode } from "../types";

/**
 * Quick blink — collapse vertically to a sliver, then snap back open.
 */
const eye: Mode = {
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
  defaults: { duration: 0.3, easing: "easeInOut", stagger: 0 },
  needsTransformOrigin: true,
};

export default eye;
