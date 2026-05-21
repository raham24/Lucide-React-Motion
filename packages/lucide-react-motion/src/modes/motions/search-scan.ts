import { type Motion } from "../compose";
import { type ModeContext } from "../types";

/**
 * Magnifier scan-wobble for the `search` family — the loupe circle
 * (cx=11, cy=11, r=8) and the handle stroke (`m21 21-4.34-4.34` on
 * the base `search`, `m21 21-4.3-4.3` on every -check / -x / -slash
 * / -code / -alert variant) rotate together around the loupe centre
 * at (11, 11) in a damped side-to-side wobble. Reads as a magnifying
 * glass tilting to inspect a target — the canonical search-action
 * gesture mentioned in section 7's roadmap.
 *
 * The signature sets `transformOrigin` to `"11px 11px"` so rotation
 * operates around the loupe centre rather than the icon centre — the
 * handle's far tip at (21, 21) sits at radius √(10²+10²) ≈ 14.14 from
 * (11, 11), and a 10° rotation pushes it to roughly (22.6, 19.5). With
 * strokeWidth 2, the extent stays comfortably inside the 24×24 viewBox
 * at every angle of the wobble.
 *
 * **Why this motion is NOT `matchAnyPath`.** Earlier passes had every
 * path in a search variant (including the inner state marker) ride the
 * wobble rigidly. Per the new family rule (see project memory
 * `feedback_state_markers_are_external.md`), state-marker suffixes
 * (-check, -x, -slash, -code, -alert) are External State Markers —
 * they draw in via `searchModifierReveal` rather than ride the host
 * rigidly. So this motion is scoped to the loupe + handle only; the
 * modifier-reveal is responsible for inheriting the rotate so the
 * marker tilts cohesively after it has drawn in.
 */
export const SEARCH_SCAN_KEYFRAMES: {
  rotate: number[];
  times: number[];
} = {
  // Damped wobble: tilt left hard, tilt right less, settle through
  // smaller swings — reads as inspecting from a few angles.
  rotate: [0, -10, 8, -5, 2, 0],
  times: [0, 0.18, 0.36, 0.55, 0.78, 1],
};

const LOUPE_HANDLE_PATHS = new Set([
  // search (base)
  "m21 21-4.34-4.34",
  // every -check / -x / -slash / -code / -alert variant
  "m21 21-4.3-4.3",
]);

const matchLoupeOrHandle = (ctx: ModeContext): boolean => {
  if (ctx.pathTag === "path") {
    return LOUPE_HANDLE_PATHS.has(String(ctx.pathAttrs.d));
  }
  if (ctx.pathTag === "circle") {
    return (
      String(ctx.pathAttrs.cx) === "11" &&
      String(ctx.pathAttrs.cy) === "11" &&
      String(ctx.pathAttrs.r) === "8"
    );
  }
  return false;
};

export const searchScan: Motion = {
  matches: matchLoupeOrHandle,
  factory: (ctx) => ({
    rest: { rotate: 0 },
    active: {
      rotate: SEARCH_SCAN_KEYFRAMES.rotate,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: SEARCH_SCAN_KEYFRAMES.times,
      },
    },
  }),
};
