import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudFogStreaks } from "../motions/cloud-fog-streaks";

/**
 * Cloud-fog — cloud body breathes while two horizontal fog streaks
 * smoke into view via {@link cloudFogStreaks}: each streak draws in
 * from one end and pulses opacity to suggest fog rolling.
 */
export default compose({
  motions: [cloudBody, cloudFogStreaks],
  defaults: { duration: 1.6, easing: "easeInOut", stagger: 0.15 },
});
