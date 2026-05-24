import { compose } from "../compose";
import { medalRibbonSway } from "../motions/medal-ribbon-sway";
import { polishedShineSweep } from "../motions/polished-shine-sweep";

/**
 * `medal` — the neck ribbon sways via `medalRibbonSway` (placed FIRST
 * so it claims the four strap paths); the medallion disc + "1" numeral
 * fall through to `polishedShineSweep` and catch light in place — the
 * same composition shape as `award`.
 */
export default compose({
  motions: [medalRibbonSway, polishedShineSweep],
  defaults: { duration: 1.1, easing: "easeInOut", stagger: 0 },
});
