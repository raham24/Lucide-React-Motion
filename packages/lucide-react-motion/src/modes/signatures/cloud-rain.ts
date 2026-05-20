import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudRainDrops } from "../motions/cloud-rain-drops";

/**
 * Cloud-rain — cloud body breathes while three rain drops draw in
 * top-to-bottom via {@link cloudRainDrops}. Stagger cascades the
 * drops so they don't appear in lockstep — reads as falling rain.
 */
export default compose({
  motions: [cloudBody, cloudRainDrops],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.08 },
});
