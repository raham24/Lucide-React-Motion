import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudModifierReveal } from "../motions/cloud-modifier-reveal";

/**
 * Cloud-sync — cloud body breathes while the four rotating-arrow
 * paths (two curved arcs plus two arrow-head fragments) draw in via
 * {@link cloudModifierReveal} with a per-path stagger cascade. The
 * cascade reads as the sync loop "assembling" rather than rotating;
 * a true rotation would need the four paths to share a rigid pivot
 * which they aren't pre-grouped to.
 */
export default compose({
  motions: [cloudBody, cloudModifierReveal],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.06 },
});
