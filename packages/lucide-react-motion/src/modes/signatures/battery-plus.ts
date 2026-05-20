import { compose } from "../compose";
import { batteryCase } from "../motions/battery-case";
import { batteryModifierReveal } from "../motions/battery-modifier-reveal";

/**
 * Battery-plus — the split casing wakes while the plus marker reveals
 * at the power-ready peak and continues a small in-place cadence.
 */
export default compose({
  motions: [batteryCase, batteryModifierReveal],
  defaults: { duration: 1.1, easing: "easeOut", stagger: 0 },
});
