import { matchPathDOneOf, type Motion } from "../compose";
import { MESSAGE_SQUARE_BODY_KEYFRAMES } from "./message-square-body";

/**
 * Dashed-outline draw-in for `message-square-dashed`. Lucide draws
 * the bubble as ten short segments scattered around the perimeter;
 * each segment draws itself in stroke-by-stroke, STRICTLY one after
 * another in a clockwise sweep starting from the tail, so the
 * dashed outline visibly assembles segment-by-segment around the
 * bubble. Reads as the bubble being sketched out a piece at a time.
 *
 * Sweep order (clockwise from the tail tip):
 *
 *   0. tail piece (`M2 16v5.286...`)
 *   1. left edge (`M2 12v-2`)
 *   2. top-left corner (`M4 3a2...`)
 *   3. top edge — left (`M8 3h2`)
 *   4. top edge — right (`M14 3h2`)
 *   5. top-right corner (`M22 6V5...`)
 *   6. right edge (`M22 10v2`)
 *   7. bottom-right corner (`M20 19a...`)
 *   8. bottom edge — right (`M16 19h-2`)
 *   9. bottom edge — left (`M8 19h2`)
 *
 * Each segment owns a non-overlapping `0.07`-wide slice of the
 * cycle. Segment `i` draws over `[i * 0.07, (i+1) * 0.07]`; all ten
 * finish by `t = 0.7`, leaving the last 30% of the cycle for the
 * bubble to nod with the freshly assembled outline.
 *
 * Each segment uses `strokeDasharray` + `strokeDashoffset` against
 * the measured `ctx.pathLength` (cleared on `transitionEnd` so rest
 * stays byte-identical to Lucide), with opacity flipping from 0 to
 * 1 in sync with the stroke draw.
 *
 * Stagger is baked into per-value `times` arrays so the rotate
 * inherit stays synchronised across all segments (motion-react's
 * per-value `delay` would shift the start of each, breaking the
 * shared nod).
 *
 * Closed cycle: first frame is `dashoffset = 0` (rest, drawn) so
 * the cycle is closed; the second frame teleports to
 * `dashoffset = pathLength` (invisible) within 1ms; then waits
 * until the segment's slice and draws in. Bookend pattern matches
 * the family wildcard.
 *
 * Place this BEFORE `messageSquareBody` in
 * `message-square-dashed`'s compose list so it claims the ten
 * dashed segments with the strict one-by-one draw-in instead of
 * the body's plain nod.
 */
const SWEEP_INDEX: Record<string, number> = {
  "M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149": 0, // tail
  "M2 12v-2": 1, // left edge
  "M4 3a2 2 0 0 0-2 2v1": 2, // top-left corner
  "M8 3h2": 3, // top left
  "M14 3h2": 4, // top right
  "M22 6V5a2 2 0 0 0-2-2": 5, // top-right corner
  "M22 10v2": 6, // right edge
  "M20 19a2 2 0 0 0 2-2v-1": 7, // bottom-right corner
  "M16 19h-2": 8, // bottom right
  "M8 19h2": 9, // bottom left
};

const matchDashedSegment = matchPathDOneOf(
  ...(Object.keys(SWEEP_INDEX) as (keyof typeof SWEEP_INDEX)[])
);

export const messageSquareDashedAssembly: Motion = {
  matches: matchDashedSegment,
  factory: (ctx) => {
    // Use the clockwise sweep index, not ctx.index (which is Lucide's
    // path order — spatially scrambled). Fallback to 0 for the
    // rest-cycle test which calls with a synthetic d.
    const seq = SWEEP_INDEX[String(ctx.pathAttrs.d)] ?? 0;
    // 10 segments × 0.07-wide slices = 0.7 of the cycle for the
    // sweep; the remaining 0.3 lets the bubble nod with the fully
    // assembled outline.
    const start = seq * 0.07;
    const end = start + 0.07;
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
