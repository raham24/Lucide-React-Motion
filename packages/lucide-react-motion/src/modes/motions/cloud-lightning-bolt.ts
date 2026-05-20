import { matchPathD, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * The lightning-bolt path in `cloud-lightning` — Lucide's zigzag
 * stroke hanging from the cloud's underside.
 *
 * **Real-life motion**: a lightning bolt is a fast-moving charge
 * that emerges from the cloud and leaves a visible trail before
 * settling at residual brightness. We render that as a translate
 * descent paired with an opacity flicker — the bolt slides
 * downward into its rest position while becoming visible, then
 * runs the multi-flash flicker of a real strike.
 *
 * **Key design constraint**: short descents over long times read
 * as motion; long descents over short times read as glitches.
 * This version uses a 5-viewBox-unit descent over 30% of the
 * 1.4s cycle (≈ 420 ms), with opacity reaching 1 at t=0.15 so
 * the second half of the fall is fully visible.
 *
 * **Why translate + opacity, not pathLength**: pathLength
 * draw-in is a Tier 1 marker move (check / plus / minus / off
 * slashes). Tier 2 elements like a lightning bolt need real
 * physics — translation, rotation, or loops — depicting what
 * the thing actually does.
 *
 * **Couples to the cloud body**: scale piggybacks on
 * `CLOUD_BODY_KEYFRAMES.scale` via `inherit: true` so the bolt
 * stays anchored to the cloud's gentle breath through the post-
 * strike hold.
 */
const LIGHTNING_D = "m13 12-3 5h4l-3 5";

export const cloudLightningBolt: Motion = {
  matches: matchPathD(LIGHTNING_D),
  factory: (ctx) => ({
    rest: { y: 0, opacity: 1, scale: 1 },
    active: {
      // Descent: -5 viewBox units. At y=-5 the bolt's top sits at
      // y=7 (overlapping the cloud body) and the bottom at y=17
      // (mid-viewBox). As y animates to 0 the bolt slides out the
      // cloud's underside to rest at y=12..22.
      y: [-5, 0, 0, 0, 0, 0],
      // Opacity reaches 1 at t=0.15 — half-way through the descent.
      // The second half of the fall is fully visible (so it reads
      // as motion), then the multi-flash flicker fires.
      opacity: [0, 1, 1, 0.15, 1, 0.4, 1],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // easeIn — bolt accelerates downward like gravity.
        y: { inherit: true, ease: "easeIn", times: [0, 0.30, 0.40, 0.50, 0.65, 1] },
        // Linear opacity keeps each flash peak crisp.
        opacity: {
          inherit: true,
          ease: "linear",
          times: [0, 0.15, 0.30, 0.40, 0.50, 0.65, 1],
        },
        // Scale stays loosely coupled to the cloud's gentle breath.
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
