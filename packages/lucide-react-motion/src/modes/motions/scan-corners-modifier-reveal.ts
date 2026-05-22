import { matchAnyPath, type Motion } from "../compose";
import { SCAN_CORNERS_KEYFRAMES } from "./scan-corners-frame";

/**
 * Scan-corners family wildcard reveal — every non-corner path /
 * shape reveals at the brackets' lock-on apex (`t = 0.2`), then
 * inherits the frame's scale + opacity for the rest of the cycle
 * so payloads pinch and dim WITH the brackets (principle 2 —
 * cohesion).
 *
 * Catches whatever's left after `scanCornersFrame` claims the four
 * corner brackets:
 *
 * - Viewfinder interior payloads: `focus` reticle circle, `full-
 *   screen` inner rect, `scan-line` horizontal sweep, `scan-bar-
 *   code` vertical bars, `scan-eye` pupil + eyelid arc, `scan-
 *   face` smile + cheek dots, `scan-heart` heart, `scan-qr-code`
 *   QR fragments + rect, `scan-search` magnifier + handle,
 *   `scan-text` text lines.
 *
 * Branches by element type for the reveal mechanism:
 *
 * - `<path>` / `<line>` → `strokeDasharray` + `strokeDashoffset`
 *   draw-in over the measured `ctx.pathLength` (cleared on
 *   `transitionEnd` so rest stays byte-identical to Lucide).
 * - `<circle>` / `<rect>` → `scale` from 0. The signature's
 *   `transformOrigin: "12px 12px"` is honoured (no fill-box
 *   override) because every payload's centre sits within ~1 unit
 *   of icon centre — scaling around (12, 12) reads as the scanner
 *   focusing inward from the brackets onto the subject.
 *
 * Reveal completes at `t = 0.2` — the frame's lock-on apex. The
 * payload appears AS the brackets pinch closed onto it, then
 * holds drawn while the lock holds.
 *
 * Opacity tracks `SCAN_CORNERS_KEYFRAMES.opacity` from 0 — `[0, 0,
 * 0.85, 0.85, 1]` — so the payload emerges into the scanner's
 * working state and breathes with the frame.
 *
 * Scale inherits the frame's contraction directly — uniform in-
 * plane scale around a fixed pivot is safe to direct-inherit
 * (no orientation distortion).
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath`
 * is greedy and would otherwise claim the corner brackets.
 */
const REVEAL_TIMES = [0, 0.1, 0.2, 0.5, 1];

export const scanCornersModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const isShape = ctx.pathTag === "circle" || ctx.pathTag === "rect";
    if (isShape) {
      return {
        rest: { scale: 1, opacity: 1 },
        active: {
          scale: [0, 0, 0.94, 0.94, 1],
          opacity: [0, 0, 0.85, 0.85, 1],
          transition: {
            duration: ctx.duration,
            delay: ctx.delay + ctx.index * ctx.stagger,
            repeat: ctx.repeat,
            scale: { inherit: true, ease: "easeOut", times: REVEAL_TIMES },
            opacity: { inherit: true, ease: "easeOut", times: REVEAL_TIMES },
          },
        },
      };
    }
    return {
      rest: {
        strokeDasharray: 0,
        strokeDashoffset: 0,
        opacity: 1,
        scale: 1,
      },
      active: {
        strokeDasharray: ctx.pathLength,
        strokeDashoffset: [ctx.pathLength, ctx.pathLength, 0],
        opacity: [0, 0, 0.85, 0.85, 1],
        scale: SCAN_CORNERS_KEYFRAMES.scale,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay + ctx.index * ctx.stagger,
          repeat: ctx.repeat,
          strokeDasharray: { duration: 0 },
          strokeDashoffset: {
            inherit: true,
            ease: "easeOut",
            times: [0, 0.1, 0.2],
          },
          opacity: { inherit: true, ease: "easeOut", times: REVEAL_TIMES },
          scale: {
            inherit: true,
            ease: "easeInOut",
            times: SCAN_CORNERS_KEYFRAMES.times,
          },
        },
        transitionEnd: {
          strokeDasharray: 0,
          strokeDashoffset: 0,
        },
      },
    };
  },
};
