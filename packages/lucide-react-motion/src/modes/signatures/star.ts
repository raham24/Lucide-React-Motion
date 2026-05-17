import type { Mode } from "../types";

/**
 * Twinkle — a quick scale wobble combined with a slight rotate and an
 * opacity dip, giving the impression of a star catching the light.
 */
const star: Mode = {
  factory: (ctx) => ({
    rest: { rotate: 0, scale: 1, opacity: 1 },
    active: {
      rotate: [0, 12, -8, 0],
      scale: [1, 1.18, 0.95, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.6, easing: "easeInOut", stagger: 0 },
  needsTransformOrigin: true,
};

export default star;
