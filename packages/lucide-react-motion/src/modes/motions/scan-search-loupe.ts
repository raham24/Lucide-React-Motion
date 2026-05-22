import { matchPathD, type Motion } from "../compose";
import type { ModeContext } from "../types";

/**
 * Magnifier in `scan-search`. Lucide draws it as a `<circle cx=12
 * cy=12 r=3>` plus the handle stroke `m16 16-1.9-1.9`.
 *
 * **Real-life referent — magnifying glass scanning the subject.**
 * Same gesture as the `searchScan` primitive (the canonical search
 * wobble), but pivoted at (12, 12) — the scan-search loupe's own
 * centre — instead of the base search's `(11, 11)`. Reads as a
 * magnifying glass tilting to inspect what the brackets locked
 * onto.
 *
 * Stays fully visible (no draw-in). Damped wobble `rotate: [0,
 * -10, 8, -5, 2, 0]` matches the search-family rhythm.
 *
 * ViewBox safety. The handle's far tip at (16, 16) sits at √(4² +
 * 4²) ≈ 5.66 from the pivot. At ±10° rotation the displacement is
 * ≈ 0.98 units; the tip moves to roughly (16.7, 15.0) at the
 * negative-tilt peak — well inside the 24×24 viewBox.
 */
const SCAN_SEARCH_HANDLE_D = "m16 16-1.9-1.9";

const matchHandle = matchPathD(SCAN_SEARCH_HANDLE_D);

const matchLoupe = (ctx: ModeContext): boolean =>
  ctx.pathTag === "circle" &&
  String(ctx.pathAttrs.cx) === "12" &&
  String(ctx.pathAttrs.cy) === "12" &&
  String(ctx.pathAttrs.r) === "3";

export const scanSearchLoupe: Motion = {
  matches: (ctx) => matchHandle(ctx) || matchLoupe(ctx),
  factory: (ctx) => ({
    rest: { rotate: 0 },
    active: {
      rotate: [0, -10, 8, -5, 2, 0],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: [0, 0.18, 0.36, 0.55, 0.78, 1],
      },
    },
  }),
};
