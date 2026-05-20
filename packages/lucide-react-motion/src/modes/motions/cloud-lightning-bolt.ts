import { matchPathD, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * The lightning-bolt path in `cloud-lightning` — Lucide's zigzag
 * stroke hanging from the cloud's underside.
 *
 * **Real-life motion**: a lightning bolt is a fast-moving charge
 * that emerges from the cloud and carves a visible trail downward
 * to its strike point. We render that as a translate descent: the
 * bolt starts at `y = -10` (which puts it overlapping the cloud
 * body, with opacity 0 so it reads as "hidden inside the cloud"),
 * then translates down to its rest position (`y = 0`) over the
 * first 10% of the cycle. Opacity ramps to 1 over the same window
 * so the bolt *appears* as it emerges from the cloud's underside.
 *
 * After landing, opacity flickers in the multi-flash pattern of a
 * real lightning strike — bright → dim → bright → dim → settle —
 * before holding at residual brightness for the rest of the cycle.
 *
 * **Why translate + opacity, not pathLength reveal**: pathLength
 * draw-in is a Tier 1 marker move (check / plus / minus / off
 * slashes). Tier 2 elements like a lightning bolt need real
 * physics: translation, rotation, or loops that depict what the
 * thing actually does. The bolt physically descends from cloud to
 * ground — so we translate it.
 *
 * **Couples to the cloud body**: scale piggybacks on
 * `CLOUD_BODY_KEYFRAMES.scale` via `inherit: true` so the bolt
 * stays anchored to the cloud's gentle breath through the post-
 * strike hold.
 *
 * **ViewBox safety**: translation is what carries the bolt out of
 * (and into) the viewBox; at the start of the cycle the bolt's top
 * sits at y=2 (clipped behind the cloud at y=5-13), and at rest
 * the bolt spans y=12-22 (Lucide's design, already safe). No scale
 * > 1.
 */
const LIGHTNING_D = "m13 12-3 5h4l-3 5";

const TIMES = [0, 0.10, 0.18, 0.28, 0.40, 1];

export const cloudLightningBolt: Motion = {
  matches: matchPathD(LIGHTNING_D),
  factory: (ctx) => ({
    rest: { y: 0, opacity: 1, scale: 1 },
    active: {
      // Descent finishes by t = 0.10 — the bolt emerges from the
      // cloud's underside, lands at rest position with opacity = 1
      // (the first flash peak), then holds at y = 0 through the
      // flicker schedule that follows.
      y: [-10, 0, 0, 0, 0, 0],
      opacity: [0, 1, 0.15, 1, 0.4, 1],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        // easeIn — bolt accelerates downward like a gravity-pulled
        // charge.
        y: { inherit: true, ease: "easeIn", times: TIMES },
        // Linear keeps each flash crisp and unsmoothed.
        opacity: { inherit: true, ease: "linear", times: TIMES },
        // Scale stays coupled to the cloud's gentle breath.
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
