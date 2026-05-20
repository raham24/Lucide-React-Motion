import { matchAnyPath, type Motion } from "../compose";
import { REFRESH_ARC_KEYFRAMES } from "./refresh-arc-cycle";

/**
 * Refresh-family wildcard reveal for the off-slash in `refresh-cw-off`
 * (the diagonal `M22 22 2 2` stroke that strikes through the icon to
 * indicate the refresh action is disabled).
 *
 * **Coupling pattern**: the host motion
 * ({@link import("./refresh-arc-cycle").refreshArcCycle}) animates
 * `pathLength` + `opacity` only — both non-shape transforms. Directly
 * inheriting the host's pathLength keyframes here would just mean
 * "wipe and redraw the slash alongside the arcs," which removes the
 * moment when the slash is the *only* thing visible (at the wipe
 * trough where the arcs are fully gone). That moment is the strongest
 * narrative beat for a `-off` variant: even when the icon tries to
 * refresh itself, the disabled-state marker is what remains.
 *
 * So the slash's `pathLength` runs on a *delayed reveal* schedule
 * timed to complete at `t = 0.4` — exactly the wipe trough — and
 * then holds steady through the redraw half. After the strike-in,
 * a synthesized in-plane `scale` dip `[1, 0.92, 1]` pinned to
 * `REFRESH_ARC_KEYFRAMES.times` provides continuous kinetic life
 * (criterion 1 of the three-criteria check) without rotating or
 * skewing the slash (criterion 2 — uniform scale only). The strike
 * completes at the host's apex event (criterion 3).
 *
 * ## Why not inherit pathLength from the host
 *
 * The host's pathLength rhythm is `[1, 0, 1]` (start visible, wipe
 * to nothing, redraw). If the slash followed that exactly, it would
 * vanish at the wipe trough alongside the arcs — leaving the icon
 * empty at the most narratively important moment of the cycle. The
 * `[0, 0, 1]` reveal schedule used here instead lands the slash AT
 * the trough, when nothing else is visible, so the "this action is
 * blocked" reading lands cleanly.
 *
 * ## Why uniform `scale` rather than rotate / scaleX-only
 *
 * The host has no rotation to inherit, so we're choosing a kinetic
 * companion from scratch. Uniform `scale` contracts the slash
 * proportionally — it stays a 45° diagonal — and the `[1, 0.92, 1]`
 * dip is large enough to register as "the slash breathes with the
 * cycle" without distracting from its strike-through role. This is
 * the same isotropic-companion pattern as `eyeModifierReveal`, just
 * pinned to refresh's wipe-trough timing instead of a blink apex.
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath` is
 * greedy and would otherwise claim the arcs.
 */
export const refreshModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      // Slash holds invisible through the early wipe, then strikes
      // in to land AT the wipe trough — exactly when the arcs are
      // fully gone and the slash is the only thing on screen.
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      // Continuous kinetic life via a subtle uniform contraction
      // shared with the host's wipe rhythm. Stays at scale 1 at the
      // cycle boundaries so the slash matches its rest geometry.
      scale: [1, 0.92, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // Strike completes AT the wipe trough (t = 0.4), apex-
        // aligned with the host's "nothing else visible" moment.
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.15, 0.4] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.15, 0.4] },
        // Scale dip shares the host's wipe times so the slash
        // contracts at the same moment the arcs vanish, giving the
        // two motions a single shared peak instead of competing.
        scale: {
          inherit: true,
          ease: "easeInOut",
          times: REFRESH_ARC_KEYFRAMES.times,
        },
      },
    },
  }),
};
