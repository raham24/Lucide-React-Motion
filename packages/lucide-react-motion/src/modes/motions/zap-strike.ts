import { matchPathDOneOf, type Motion } from "../compose";

/**
 * The zap lightning-bolt — a visible downward strike with multi-flash
 * after-glow. Real lightning is a fast-moving charge that leaves a
 * visible trail before settling at residual brightness; we render
 * that as a translate descent paired with an opacity flicker.
 *
 * **Key design constraint**: a too-fast descent over a long distance
 * reads as a glitch, not a strike — the eye can't track the motion.
 * The previous version translated 24 viewBox units in 80ms (the
 * full height of the icon), which made the bolt appear to teleport
 * into position. This version uses a smaller distance (-6 → 0, so
 * only the top of the bolt is above the viewBox at start) over a
 * longer descent (40% of the cycle), with opacity reaching 1 well
 * before the descent completes (t=0.20) so the second half of the
 * fall is fully visible — the bolt clearly drops into place rather
 * than popping in.
 *
 * After landing, opacity flickers in the classic 1 → 0.15 → 1 →
 * 0.4 → 1 pattern of secondary flashes before holding at residual
 * brightness.
 *
 * **Why translate + opacity, not pathLength**: pathLength draw-in
 * is a Tier 1 marker move (check / plus / minus / off slashes).
 * Tier 2 elements like a lightning bolt need real physics —
 * translation, rotation, or loops — depicting what the thing
 * actually does. A lightning bolt physically descends; we
 * translate it.
 *
 * Matches the full zap bolt path AND the three fragments in
 * `zap-off` where the slash splits the bolt — each fragment shares
 * the descent + flicker so the broken bolt strikes together.
 *
 * Exports `ZAP_KEYFRAMES` so the family modifier-reveal can pin
 * its own scale dip to the same flicker schedule.
 */
export const ZAP_KEYFRAMES: {
  y: number[];
  yTimes: number[];
  opacity: number[];
  opacityTimes: number[];
} = {
  // Descent from -6 (top clipped above viewBox) to 0 (rest). Single
  // easeIn segment over 40% of the cycle — slow start, fast impact,
  // gravity-like.
  y: [-6, 0, 0, 0, 0, 0],
  yTimes: [0, 0.40, 0.50, 0.60, 0.75, 1],
  // Opacity ramps to 1 by t=0.20 — half-way through the descent.
  // This makes the second half of the fall fully visible (so it
  // reads as motion, not a teleport), then holds bright through the
  // landing (t=0.40) before the multi-flash flicker takes over.
  opacity: [0, 1, 1, 0.15, 1, 0.4, 1],
  opacityTimes: [0, 0.20, 0.40, 0.50, 0.60, 0.75, 1],
};

const BOLT_PATHS = [
  // Full zap bolt
  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  // zap-off: three fragments where the slash splits the original bolt
  "M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317",
  "M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773",
  "M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643",
];

export const zapStrike: Motion = {
  matches: matchPathDOneOf(...BOLT_PATHS),
  factory: (ctx) => ({
    rest: { y: 0, opacity: 1 },
    active: {
      y: ZAP_KEYFRAMES.y,
      opacity: ZAP_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        y: {
          inherit: true,
          // easeIn — the bolt accelerates downward like a gravity-
          // pulled charge, slow at the top of its fall and fastest
          // at impact.
          ease: "easeIn",
          times: ZAP_KEYFRAMES.yTimes,
        },
        opacity: {
          inherit: true,
          // Linear keeps the flash peaks crisp and unsmoothed.
          ease: "linear",
          times: ZAP_KEYFRAMES.opacityTimes,
        },
      },
    },
  }),
};
