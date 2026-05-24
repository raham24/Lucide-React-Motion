import { matchPathD, type Motion } from "../compose";

/**
 * `award`'s ribbon flag — the V-shaped tail that hangs below the
 * medal circle. Sways side-to-side as if catching a breeze.
 *
 * Implemented as a horizontal `x` translate `[0, -1.6, 1, -0.4, 0]`
 * — anchorless so there's no transformOrigin / pivot dependency
 * with the engine's view-box transformBox setup. The ribbon's top
 * does shift slightly relative to the medal underside (it doesn't
 * stay perfectly pinned the way a true rotation around the
 * attachment point would), but the back-and-forth motion reads as
 * a clear sway rather than a rotation that might fight the
 * engine's per-element transform plumbing.
 *
 * Place this BEFORE `polishedShineSweep` in `award`'s compose list
 * so the ribbon path is claimed by the sway; the medal circle
 * falls through to the shine sweep.
 */
const AWARD_RIBBON_D =
  "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526";

export const awardRibbonSway: Motion = {
  matches: matchPathD(AWARD_RIBBON_D),
  factory: (ctx) => ({
    rest: { x: 0 },
    active: {
      x: [0, -1.6, 1, -0.4, 0],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: [0, 0.25, 0.55, 0.8, 1],
      },
    },
  }),
};
