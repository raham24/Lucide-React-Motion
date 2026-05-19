import { matchPathDOneOf, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * Rain droplets, drizzle, hail's vertical chunks, and rain-wind's
 * diagonal streaks across the cloud family. Lucide draws each one
 * as a short straight stroke (vertical for rain/drizzle/hail,
 * slanted for rain-wind) sitting below the cloud body.
 *
 * Tier 2 motion: precipitation depicts an actual physical
 * phenomenon (water falling from a cloud), so it gets bespoke
 * draw-it-in physics rather than a generic reveal. Each drop
 * animates `pathLength` from 0 to 1, which renders as the stroke
 * extending from its start point toward its end point — for a
 * vertical line that starts above and ends below, that's a top-to-
 * bottom draw, exactly like a real drop falling. The `opacity`
 * fades in alongside so drops don't pop into existence; they emerge
 * as they fall.
 *
 * Per-path stagger from the signature cascades the drops so they
 * don't all appear in lockstep — reads as rain falling rather than
 * a synchronised reveal.
 *
 * **Couples to the cloud body**: scale piggybacks on
 * `cloudBody`'s gentle pulse via `inherit: true` so the drops stay
 * loosely tied to the cloud rather than floating statically below
 * a breathing shape.
 */
const RAIN_PATHS = [
  // cloud-rain — full-length drops
  "M16 14v6",
  "M8 14v6",
  "M12 16v6",
  // cloud-drizzle — short flickers (each drop is a one-unit nub)
  "M8 19v1",
  "M8 14v1",
  "M16 19v1",
  "M16 14v1",
  "M12 21v1",
  "M12 16v1",
  // cloud-hail — vertical chunks (the larger half of the hail pieces)
  "M16 14v2",
  "M8 14v2",
  "M12 16v2",
  // cloud-sun-rain / cloud-moon-rain — short drops below the smaller cloud
  "M11 20v2",
  "M7 19v2",
  // cloud-rain-wind — diagonal streaks (rain blown by wind)
  "m9.2 22 3-7",
  "m9 13-3 7",
  "m17 13-3 7",
];

export const cloudRainDrops: Motion = {
  matches: matchPathDOneOf(...RAIN_PATHS),
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      pathLength: [0, 0, 1],
      opacity: [0, 0, 1],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.15, 0.5] },
        opacity: { inherit: true, ease: "easeOut", times: [0, 0.15, 0.5] },
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
