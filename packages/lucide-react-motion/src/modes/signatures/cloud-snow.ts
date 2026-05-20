import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudSnowDots } from "../motions/cloud-snow-dots";

/**
 * Cloud-snow — six snowflake dots twinkle by scale-contraction +
 * opacity dip via {@link cloudSnowDots}. Real snowflakes flicker as
 * they fall (light reflecting from different facets), so the dots
 * shrink toward their own positions and dim, then recover. Stagger
 * cascades the twinkle across the six flakes.
 */
export default compose({
  motions: [cloudBody, cloudSnowDots],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.05 },
});
