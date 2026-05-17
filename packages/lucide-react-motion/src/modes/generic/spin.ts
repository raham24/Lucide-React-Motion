import type { Mode } from "../types";

/**
 * One full clockwise rotation. Defaults to linear easing so the rotation
 * feels mechanical rather than organic. For an infinite loader, set
 * `repeat={Infinity}` or use the `"signature"` mode on `loader`.
 */
export const spin: Mode = {
  factory: (ctx) => ({
    rest: { rotate: 0 },
    active: {
      rotate: [0, 360],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
  defaults: { duration: 0.8, easing: "linear", stagger: 0 },
  needsTransformOrigin: true,
};
