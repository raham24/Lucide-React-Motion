import { matchPathD, type Motion } from "../compose";

/**
 * `award`'s ribbon flag — the V-shaped tail that hangs below the
 * medal circle. Sways side-to-side from where it attaches to the
 * underside of the medal at (12, 13), reading as a banner / pendant
 * catching a breeze.
 *
 * Per-variant `transformOrigin: "12px 13px"` (resolved against
 * view-box `transformBox`) so the rotation pivots at the
 * attachment point, not the icon centre — the top of the ribbon
 * stays anchored to the medal while the tail swings.
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
    rest: { rotate: 0, transformOrigin: "12px 13px" },
    active: {
      rotate: [0, -8, 5, -2, 0],
      transformOrigin: "12px 13px",
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
