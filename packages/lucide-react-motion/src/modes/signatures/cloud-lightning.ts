import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudLightningBolt } from "../motions/cloud-lightning-bolt";

/**
 * Cloud-lightning — cloud body breathes while the lightning bolt
 * draws in with a flash-flicker via {@link cloudLightningBolt}.
 * Real lightning peaks brighter than ambient, but at icon scale the
 * bolt reads best as a rapid opacity flicker (bright-dark-bright-
 * dark-bright-settle) layered over a quick pathLength reveal.
 */
export default compose({
  motions: [cloudBody, cloudLightningBolt],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0 },
});
