import type { Motion } from "../compose";

/**
 * Notification-dot reveal for `bell-dot`. The dot is a `<circle>` element
 * so `pathLength` doesn't apply — this is the circle-equivalent of the
 * generic `modifierReveal`: scale and opacity instead of pathLength and
 * opacity. Same timing and easing as `modifierReveal` so the two read as
 * consistent "Tier 1" draw-ins across path-based and circle-based
 * modifiers.
 *
 * Tier 1 (UI/state marker): the dot is a notification badge, not a
 * physical phenomenon, so it just draws in with the bell rather than
 * getting bespoke motion. See [[feedback-signature-design]].
 *
 * Matched by the circle's geometry (cx=18, cy=5, r=3). If Lucide ever
 * reshapes the dot, this falls through to draw and the dev warning
 * surfaces it.
 */
export const dotReveal: Motion = {
  matches: (ctx) =>
    ctx.pathTag === "circle" &&
    String(ctx.pathAttrs.cx) === "18" &&
    String(ctx.pathAttrs.cy) === "5" &&
    String(ctx.pathAttrs.r) === "3",
  factory: (ctx) => ({
    rest: { opacity: 1, scale: 1 },
    active: {
      scale: [0, 0, 1],
      opacity: [0, 0, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        times: [0, 0.2, 0.55],
        ease: "easeOut",
        repeat: ctx.repeat,
      },
    },
  }),
};
