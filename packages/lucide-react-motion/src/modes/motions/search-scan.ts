import { matchAnyPath, type Motion } from "../compose";

/**
 * Whole-icon scan wobble for the `search` family — loupe circle,
 * handle, and any in-loupe contents (the check, slash, ×, alert
 * stem + dot, code brackets) rotate together around the loupe
 * centre at (11, 11) in a damped side-to-side wobble. Reads as a
 * magnifying glass tilting to inspect a target — the canonical
 * search-action gesture mentioned in section 7's roadmap.
 *
 * The signature sets `transformOrigin` to `"11px 11px"` so
 * rotation operates around the loupe centre rather than the icon
 * centre — the handle's far tip at (21, 21) sits at radius
 * √(10²+10²) ≈ 14.14 from (11, 11), and a 10° rotation pushes it
 * to (~22.6, 19.5)/(22.3, ...). With strokeWidth 2, the extent
 * stays comfortably inside the 24×24 viewBox at every angle of
 * the wobble.
 *
 * Rotation is in-plane (uniform z-axis), so in-loupe markers —
 * the alert stem, check tick, slash, × strokes, and search-code
 * brackets — directly inherit without axis-asymmetric distortion
 * (the markers' shapes stay coherent, just rotated). Their
 * continuous kinetic life and apex alignment with the loupe come
 * for free via the shared motion.
 *
 * `matchAnyPath` — placed alone in every search signature's
 * compose list since no path needs different physics.
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

export const searchScan: Motion = {
  matches: matchAnyPath,
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
