import type { ModeContext } from "../../types";

/**
 * Pure rotation factory shared by both the generic `"spin"` mode and any
 * signature that wants whole-icon rotation (sun, loader, refresh, etc.).
 * Defines the variant shape only — defaults like duration and easing are
 * supplied by whichever Mode or signature wraps it.
 */
export const spinFactory = (ctx: ModeContext) => ({
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
});
