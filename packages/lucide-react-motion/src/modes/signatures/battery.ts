import { compose } from "../compose";
import { batteryCase } from "../motions/battery-case";

/**
 * Battery — the empty battery casing traces on and settles with a
 * small power-ready dim, reading as an available meter with no charge
 * cells lit.
 */
export default compose({
  motions: [batteryCase],
  defaults: { duration: 1.1, easing: "easeOut", stagger: 0 },
});
