import { matchPathD, type Motion } from "../compose";

/**
 * Lub-dub heart beat — scale keyframes with weighted `times` so the second
 * pump lands faster than the first, matching the rhythm of a real heartbeat.
 *
 * Reused by any icon whose Lucide path data carries this exact `d` string
 * (heart variants that preserve the base shape).
 */
const HEART_D =
  "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5";

export const heartBeat: Motion = {
  matches: matchPathD(HEART_D),
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
};
