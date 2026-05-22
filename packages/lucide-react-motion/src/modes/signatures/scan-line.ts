import { compose } from "../compose";
import { scanCornersFrame } from "../motions/scan-corners-frame";
import { scanCornersModifierReveal } from "../motions/scan-corners-modifier-reveal";

/**
 * `scan-line` — the viewfinder brackets lock on (`scanCornersFrame`)
 * while the interior payload reveals at the lock-on apex via
 * `scanCornersModifierReveal`, inheriting both the scale and the
 * opacity so the payload pinches and dims with the brackets.
 */
export default compose({
  motions: [scanCornersFrame, scanCornersModifierReveal],
  defaults: { duration: 0.7, easing: "easeInOut", stagger: 0 },
  transformOrigin: "12px 12px",
});
