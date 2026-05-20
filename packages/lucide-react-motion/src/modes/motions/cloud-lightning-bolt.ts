import { matchPathD, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * The lightning-bolt path in `cloud-lightning` — Lucide's
 * zigzag stroke from the cloud's underside.
 *
 * Tier 2 motion: real lightning flashes — sub-second bursts of
 * brightness separated by darker pauses. Modeled here as an opacity
 * flicker pattern (bright-dark-bright-dark-bright-settle) layered
 * with a `pathLength` reveal so the bolt "strikes in" rather than
 * fading in slowly. The sharp opacity peaks early in the duration
 * read as discrete strikes; after the flicker, the bolt holds at
 * full opacity through the rest of the animation.
 *
 * **Couples to the cloud body**: scale piggybacks on `cloudBody`'s
 * gentle pulse via `inherit: true` so the bolt stays anchored to
 * the cloud during the post-flicker hold.
 */
const LIGHTNING_D = "m13 12-3 5h4l-3 5";

export const cloudLightningBolt: Motion = {
  matches: matchPathD(LIGHTNING_D),
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1, scale: 1 },
    active: {
      pathLength: [0, 1, 1, 1, 1, 1, 1],
      opacity: [0, 1, 0.1, 1, 0.3, 1, 1],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.12, 0.2, 0.35, 0.45, 0.6, 1],
        },
        opacity: {
          inherit: true,
          ease: "linear",
          times: [0, 0.12, 0.2, 0.35, 0.45, 0.6, 1],
        },
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
