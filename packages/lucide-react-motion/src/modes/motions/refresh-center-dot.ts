import type { Motion } from "../compose";
import { REFRESH_ARC_KEYFRAMES } from "./refresh-arc-cycle";

/**
 * The notification dot at the centre of `refresh-ccw-dot` —
 * `<circle cx="12" cy="12" r="1">`. In Lucide's UI vocabulary a
 * `*-dot` variant means "this surface has a pending indicator",
 * so for refresh the dot reads as "there is fresh content waiting
 * to be pulled."
 *
 * **Real-life motion**: a "new data here" indicator pulses to draw
 * attention. The dot contracts and dims at the host's wipe trough
 * — the moment the arcs vanish — then recovers as the loop
 * redraws. Visually, the dot is the persistent anchor that the
 * refresh action revolves around: while the arcs disappear and
 * redraw, the dot stays present (just dimmer and smaller),
 * communicating "the pending state survives the refresh cycle."
 *
 * **Coupling pattern**: the host motion ({@link import("./refresh-arc-cycle").refreshArcCycle})
 * only transforms `pathLength` and `opacity` — both non-shape
 * transforms. There's no rotation or scale on the host for the
 * dot to inherit directly, so this motion synthesizes its own
 * `scale` + `opacity` dip pinned to `REFRESH_ARC_KEYFRAMES.times`
 * for an apex-aligned kinetic peak. Same shape as
 * `eyeModifierReveal`'s synthesized-companion pattern, applied
 * here because the host's transforms aren't directly inheritable
 * by a `<circle>` whose only geometry is `cx`/`cy`/`r`.
 *
 * Matched by geometry (cx=12, cy=12, r=1) — if Lucide ever
 * reshapes the dot, this falls through to the family wildcard and
 * the dev warning surfaces it.
 *
 * **ViewBox safety**: scale stays at or below 1, and the dot
 * pivots at its own centre (12, 12) — well within the viewBox at
 * any contraction. Opacity is bounds-safe by construction.
 */
export const refreshCenterDot: Motion = {
  matches: (ctx) =>
    ctx.pathTag === "circle" &&
    String(ctx.pathAttrs.cx) === "12" &&
    String(ctx.pathAttrs.cy) === "12" &&
    String(ctx.pathAttrs.r) === "1",
  factory: (ctx) => ({
    rest: { scale: 1, opacity: 1 },
    active: {
      // Dot contracts sharply at the wipe trough but doesn't vanish
      // — staying partially visible reads as "the pending indicator
      // survives the refresh."
      scale: [1, 0.5, 1],
      opacity: [1, 0.45, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        scale: {
          inherit: true,
          ease: "easeInOut",
          times: REFRESH_ARC_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: REFRESH_ARC_KEYFRAMES.times,
        },
      },
    },
  }),
};
