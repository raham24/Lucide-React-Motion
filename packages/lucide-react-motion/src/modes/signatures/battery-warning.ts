import { compose } from "../compose";
import { batteryCase } from "../motions/battery-case";
import { batteryModifierReveal } from "../motions/battery-modifier-reveal";

/**
 * Battery-warning — the split casing wakes while the warning marker
 * reveals at the power-ready peak and pulses without distortion.
 */
export default compose({
  motions: [batteryCase, batteryModifierReveal],
  defaults: { duration: 1.1, easing: "easeOut", stagger: 0 },
});
