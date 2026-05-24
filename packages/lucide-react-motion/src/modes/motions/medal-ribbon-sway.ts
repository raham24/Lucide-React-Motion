import { matchPathDOneOf, type Motion } from "../compose";

/**
 * `medal` — the neck ribbon above the medallion sways side-to-side as
 * if catching a breeze, while the heavy medallion disc hangs steady
 * and catches light in place (it falls through to `polishedShineSweep`
 * in the signature, exactly the way `award`'s medal circle does).
 *
 * Four paths make up the cloth strap: the V-shaped band itself, its
 * two inner fold lines, and the horizontal stripe across it. All four
 * sway together via an anchorless horizontal `x` translate
 * `[0, -1.6, 1, -0.4, 0]` — the same mechanism as `awardRibbonSway`.
 * Anchorless avoids any pivot dependency with the engine's view-box
 * `transformBox`; the strap's join to the medallion shifts slightly
 * during the sway (the same accepted trade-off documented for
 * `awardRibbonSway`), kept small by the modest amplitude.
 *
 * Place this BEFORE `polishedShineSweep` in `medal`'s compose list so
 * the strap paths are claimed by the sway; the medallion `<circle>`
 * and the "1" numeral fall through to the shine sweep.
 */
const MEDAL_RIBBON_DS = [
  "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",
  "M11 12 5.12 2.2",
  "m13 12 5.88-9.8",
  "M8 7h8",
];

export const medalRibbonSway: Motion = {
  matches: matchPathDOneOf(...MEDAL_RIBBON_DS),
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
