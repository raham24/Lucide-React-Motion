import type { Mode } from "./types";

/**
 * The default stroke-on draw — what every icon does by default. Each path's
 * `pathLength` animates from 0 to 1 with a fade-in on opacity. Strokes
 * stagger by `index * stagger` so multi-path icons cascade.
 */
export const draw: Mode = {
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1 },
    active: {
      pathLength: [0, 1],
      opacity: [0.25, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
        repeatType: "loop",
      },
    },
  }),
};
