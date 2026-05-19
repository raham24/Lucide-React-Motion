import { compose } from "../compose";
import { cloudBody } from "../motions/cloud-body";
import { cloudRainDrops } from "../motions/cloud-rain-drops";

/**
 * Cloud-rain-wind — cloud body breathes while three diagonal rain
 * streaks draw in via {@link cloudRainDrops}. The streaks' slant is
 * baked into the path geometry, so the same draw motion that works
 * for vertical drops also captures the wind-blown character — the
 * pathLength reveal traces each streak along its slanted direction.
 */
export default compose({
  motions: [cloudBody, cloudRainDrops],
  defaults: { duration: 1.4, easing: "easeInOut", stagger: 0.08 },
});
