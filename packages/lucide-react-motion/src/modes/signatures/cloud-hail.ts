import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudRainDrops } from "../motions/cloud-rain-drops";
import { cloudSnowDots } from "../motions/cloud-snow-dots";

/**
 * Cloud-hail — three larger vertical hailstone-trails draw in via
 * {@link cloudRainDrops}, while three smaller round hailstones
 * twinkle via {@link cloudSnowDots}. The double cascade reads as
 * mixed-size hail bouncing down — the bigger pieces falling
 * straight, the smaller ones flickering as they bounce.
 */
export default compose({
  motions: [cloudBody, cloudRainDrops, cloudSnowDots],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.06 },
});
