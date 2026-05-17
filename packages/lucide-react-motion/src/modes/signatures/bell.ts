import type { Mode } from "../types";

/**
 * Damped ring — alternating rotations decay toward zero, like a bell rocking
 * after it's been struck.
 */
const bell: Mode = {
  factory: (ctx) => ({
    rest: { rotate: 0 },
    active: {
      rotate: [0, -15, 12, -10, 8, -5, 4, 0],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.7, easing: "easeOut", stagger: 0 },
  needsTransformOrigin: true,
};

export default bell;
