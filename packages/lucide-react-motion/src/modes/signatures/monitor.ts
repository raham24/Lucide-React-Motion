import { compose } from "../compose";
import { monitorChassis } from "../motions/monitor-chassis";

/**
 * `monitor` — bare display + stand. The monitorChassis motion covers
 * both anatomical roles: the screen wakes (contraction + opacity dim
 * → recover) and the stand opacity-dips in lockstep so the chassis
 * reads as one device flashing on.
 *
 * Every other monitor-* composite reuses monitorChassis as the host
 * and layers `monitorModifierReveal` for the marker / payload glyph.
 */
export default compose({
  motions: [monitorChassis],
  defaults: { duration: 0.65, easing: "easeInOut", stagger: 0 },
  transformOrigin: "12px 10px",
});
