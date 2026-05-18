import { matchPathD, type Motion } from "../compose";

/**
 * Twinkle — a quick scale wobble combined with a slight rotate and an
 * opacity dip, suggesting a star catching the light.
 */
const STAR_D =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

export const starTwinkle: Motion = {
  matches: matchPathD(STAR_D),
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
};
