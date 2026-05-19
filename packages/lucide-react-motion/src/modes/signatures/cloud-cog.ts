import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudModifierReveal } from "../motions/cloud-modifier-reveal";

/**
 * Cloud-cog — cloud body breathes while the eight separate gear
 * paths below the cloud each draw in via {@link cloudModifierReveal}
 * with a per-path stagger cascade. The gear's anatomy (a central
 * circle plus radial nubs) makes the cascade read as the gear
 * "assembling itself" rather than spinning, which would require a
 * compound transform we can't achieve from disjoint paths with one
 * signature transform-origin.
 */
export default compose({
  motions: [cloudBody, cloudModifierReveal],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.04 },
});
