import { matchPathDOneOf, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * The two horizontal fog streaks in `cloud-fog`. Lucide draws them
 * as `M16 17H7` (upper) and `M17 21H9` (lower) — short flat lines
 * sitting under the cloud body.
 *
 * Tier 2 motion: fog drifts. Modeled here as an opacity dim/recover
 * layered with a `pathLength` reveal so the streaks "smoke into
 * view" rather than just popping on, then settle. Stagger between
 * the two streaks lets the upper bank appear slightly before the
 * lower, suggesting fog rolling in.
 *
 * **Couples to the cloud body**: scale piggybacks on `cloudBody`'s
 * gentle pulse via `inherit: true` so the streaks breathe with the
 * cloud rather than floating statically.
 */
const FOG_PATHS = [
  "M16 17H7",
  "M17 21H9",
];

export const cloudFogStreaks: Motion = {
  matches: matchPathDOneOf(...FOG_PATHS),
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      pathLength: [0, 1, 1],
      opacity: [0, 1, 0.4, 1],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        pathLength: { inherit: true, ease: "easeOut", times: [0, 0.4, 1] },
        opacity: { inherit: true, ease: "easeInOut", times: [0, 0.3, 0.7, 1] },
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
