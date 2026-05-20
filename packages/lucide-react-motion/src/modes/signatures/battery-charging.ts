import { compose } from "../compose";
import { batteryCase } from "../motions/battery-case";
import { batteryChargingBolt } from "../motions/battery-charging-bolt";

/**
 * Battery-charging — the split casing wakes while the lightning bolt
 * draws in and flashes as incoming current.
 */
export default compose({
  motions: [batteryChargingBolt, batteryCase],
  defaults: { duration: 1.1, easing: "easeOut", stagger: 0 },
});
