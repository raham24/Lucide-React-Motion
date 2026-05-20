import type { Mode } from "../types";

/**
 * Vertical bounce. Translation scales with icon size because
 * `transformBox: "view-box"` puts y in user units, so an 8-unit hop
 * remains visually proportional at any `size`.
 */
export const bounce: Mode = {
  factory: (ctx) => ({
    rest: { y: 0 },
    active: {
      y: [0, -8, 0],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.5, easing: "easeOut", stagger: 0 },
  needsTransformOrigin: true,
};
