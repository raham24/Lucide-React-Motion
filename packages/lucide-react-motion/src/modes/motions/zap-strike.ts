import { matchPathDOneOf, type Motion } from "../compose";

/**
 * The zap lightning-bolt — a rapid descent from above the viewBox
 * followed by a flash-and-flicker pattern, matching the canonical
 * physics of a real lightning strike.
 *
 * **Real-life motion**: lightning is a fast-moving charge that
 * carves a visible trail from cloud to ground. We render that by
 * translating the bolt from above the viewBox (y = -24 in viewBox
 * units, fully clipped by the SVG's overflow boundary) down to its
 * rest position. Opacity ramps from 0 to 1 over the same window so
 * the bolt becomes visible *as it strikes* rather than fading in
 * from a held position. After landing, opacity flickers in the
 * classic 1 → 0.15 → 1 → 0.4 → 1 pattern of secondary flashes
 * before settling at residual brightness.
 *
 * **Why translate-and-flicker, not pathLength reveal**: pathLength
 * draw-in is a generic move that belongs to Tier 1 markers
 * (check / plus / minus / off slashes). Tier 2 elements need real
 * physics — translation, rotation, or loops — that depict what the
 * thing actually does. A lightning bolt moves through space. We
 * render the movement explicitly.
 *
 * Matches the full zap bolt path AND the three fragments in
 * `zap-off` where the slash splits the bolt — each fragment shares
 * the descent + flicker so the broken bolt strikes together, and
 * the slash strikes through afterward via the family modifier-
 * reveal.
 *
 * **ViewBox safety**: translation is the only transform that can
 * push content out of the viewBox, and we deliberately *use* that
 * for the pre-strike phase (y = -24 clips the bolt entirely above
 * the visible area). At rest position (y = 0) the bolt's
 * geometry matches Lucide's own design which is already viewBox-
 * safe. No scale > 1.
 *
 * Exports `ZAP_KEYFRAMES` so the family modifier-reveal can pin
 * its own scale dip to the same flicker schedule.
 */
export const ZAP_KEYFRAMES: {
  y: number[];
  opacity: number[];
  times: number[];
} = {
  // Descent finishes by the first flash peak (t = 0.10). After
  // landing, the bolt holds at y=0 while opacity carries the
  // multi-flash flicker.
  y: [-24, 0, 0, 0, 0, 0],
  opacity: [0, 1, 0.15, 1, 0.4, 1],
  times: [0, 0.10, 0.18, 0.28, 0.40, 1],
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
          // pulled charge, slow at the start and fastest at impact.
          ease: "easeIn",
          times: ZAP_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          // Linear keeps the flash peaks crisp and unsmoothed.
          ease: "linear",
          times: ZAP_KEYFRAMES.times,
        },
      },
    },
  }),
};
