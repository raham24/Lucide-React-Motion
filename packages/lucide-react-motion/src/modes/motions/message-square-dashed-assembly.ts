import { matchPathDOneOf, type Motion } from "../compose";
import { MESSAGE_SQUARE_BODY_KEYFRAMES } from "./message-square-body";

/**
 * Dashed-outline draw-in for `message-square-dashed`. Lucide draws
 * the bubble as ten short segments scattered around the perimeter;
 * each segment draws itself in stroke-by-stroke, staggered around
 * the bubble in Lucide's path order, so the dashed outline visibly
 * assembles. Reads as the bubble being sketched out one segment at
 * a time.
 *
 * Each segment uses `strokeDasharray` + `strokeDashoffset` against
 * the measured `ctx.pathLength` (cleared on `transitionEnd` so rest
 * stays byte-identical to Lucide), with opacity flipping from 0 to
 * 1 in sync with the stroke draw.
 *
 * Stagger: each segment's draw window is `[i * 0.065, i * 0.065 +
 * 0.15]` so all ten finish by `t ≈ 0.735`, leaving the rest of the
 * cycle for the bubble's nod. The stagger is baked into per-value
 * `times` arrays — `ctx.stagger` would shift each segment's start
 * but motion-react's per-value inherit also picks up delay; baking
 * the offset into `times` keeps the rotate inherit synchronised
 * across all segments.
 *
 * Closed cycle: first frame is `dashoffset = 0` (rest, drawn) so the
 * cycle is closed; the second frame teleports to
 * `dashoffset = pathLength` (still drawn at the END of the cycle
 * via `transitionEnd`). Bookend pattern matches the family wildcard.
 *
 * Place this BEFORE `messageSquareBody` in
 * `message-square-dashed`'s compose list so it claims the ten
 * dashed segments with the staggered draw-in instead of the body's
 * plain nod.
 */
const DASHED_SEGMENT_PATHS = [
  "M14 3h2",
  "M16 19h-2",
  "M2 12v-2",
  "M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149",
  "M20 19a2 2 0 0 0 2-2v-1",
  "M22 10v2",
  "M22 6V5a2 2 0 0 0-2-2",
  "M4 3a2 2 0 0 0-2 2v1",
  "M8 19h2",
  "M8 3h2",
];

const matchDashedSegment = matchPathDOneOf(...DASHED_SEGMENT_PATHS);

export const messageSquareDashedAssembly: Motion = {
  matches: matchDashedSegment,
  factory: (ctx) => {
    // Stagger by Lucide path index — each segment kicks off its draw
    // 65ms (in normalised time) after the previous one.
    const start = Math.min(0.85, ctx.index * 0.065);
    const end = Math.min(0.95, start + 0.15);
    return {
      rest: {
        strokeDasharray: 0,
        strokeDashoffset: 0,
        opacity: 1,
        rotate: 0,
      },
      active: {
        strokeDasharray: ctx.pathLength,
        // Bookend at rest: first frame drawn (offset 0), second frame
        // teleports to invisible (offset = length), then draws in
        // through the segment's window. Drawn-and-held for the rest
        // of the cycle.
        strokeDashoffset: [0, ctx.pathLength, ctx.pathLength, 0, 0],
        opacity: [1, 0, 0, 1, 1],
        rotate: MESSAGE_SQUARE_BODY_KEYFRAMES.rotate,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          strokeDasharray: { duration: 0 },
          strokeDashoffset: {
            inherit: true,
            ease: "easeOut",
            times: [0, 0.001, start, end, 1],
          },
          opacity: {
            inherit: true,
            ease: "easeOut",
            times: [0, 0.001, start, end, 1],
          },
          rotate: {
            inherit: true,
            ease: "easeInOut",
            times: MESSAGE_SQUARE_BODY_KEYFRAMES.times,
          },
        },
        transitionEnd: {
          strokeDasharray: 0,
          strokeDashoffset: 0,
        },
      },
    };
  },
};
