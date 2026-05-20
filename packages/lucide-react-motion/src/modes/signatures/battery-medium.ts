import { compose } from "../compose";
import { batteryCase } from "../motions/battery-case";
import { batteryCellFill } from "../motions/battery-cell-fill";

/**
 * Battery-medium — the casing wakes while the first two charge cells
 * fill left-to-right from the bottom baseline.
 */
export default compose({
  motions: [batteryCellFill, batteryCase],
  defaults: { duration: 1.1, easing: "easeOut", stagger: 0 },
});
