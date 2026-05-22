import { compose } from "../compose";
import { scanCornersFrame } from "../motions/scan-corners-frame";

/**
 * `scan` — bare viewfinder brackets. The scanCornersFrame motion
 * runs the lock-on gesture: the four corners contract uniformly
 * toward (12, 12), hold the lock, then release — paired with a
 * phase-locked opacity dim that reads as the scanner working.
 *
 * Every other scan-* / focus / fullscreen composite reuses
 * scanCornersFrame as the host and layers `scanCornersModifier-
 * Reveal` for interior payloads, which inherit both the scale and
 * the opacity so the payload pinches and dims with the brackets.
 */
export default compose({
  motions: [scanCornersFrame],
  defaults: { duration: 0.7, easing: "easeInOut", stagger: 0 },
  transformOrigin: "12px 12px",
});
