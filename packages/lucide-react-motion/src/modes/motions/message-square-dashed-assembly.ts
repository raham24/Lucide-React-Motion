import { matchPathDOneOf, type Motion } from "../compose";
import { MESSAGE_SQUARE_BODY_KEYFRAMES } from "./message-square-body";

/**
 * Dashed-outline assembly for `message-square-dashed`. Lucide draws
 * the bubble as ten short segments scattered around the perimeter;
 * this motion has each segment start displaced ~2 units radially
 * OUTWARD from the bubble centre (12, 12) and translate to its rest
 * position by `t = 0.35`, fading in as it lands. Reads as the
 * dashed outline "coming together" into the speech bubble.
 *
 * Each segment's displacement vector is its centroid minus (12, 12),
 * normalized and scaled to 2 units. After the assembly window
 * (`t > 0.35`) every segment sits at rest and inherits the bubble's
 * rotate + opacity from `MESSAGE_SQUARE_BODY_KEYFRAMES` so the
 * dashed shape nods together as one bubble through the rest of the
 * cycle — same kinetic life as the solid-outline variants.
 *
 * Place this BEFORE `messageSquareBody` in the
 * `message-square-dashed` compose list so it claims the ten dashed
 * segments with the assembly physics instead of the body's plain
 * nod (the body's `matchPathDOneOf` also lists these d's for the
 * solid bubble's nod, but compose iterates first-match-wins).
 *
 * Closed cycle: x and y end at 0; opacity ends at 1.
 */
type Offset = { x: number; y: number };

const SEGMENT_OFFSETS: Record<string, Offset> = {
  // Top edge (y ≈ 3) — push UP
  "M14 3h2": { x: 0.63, y: -1.9 },
  "M8 3h2": { x: -0.63, y: -1.9 },
  // Bottom edge (y ≈ 19) — push DOWN
  "M16 19h-2": { x: 0.77, y: 1.79 },
  "M8 19h2": { x: -0.79, y: 1.84 },
  // Right edge (x ≈ 22) — push RIGHT
  "M22 10v2": { x: 1.99, y: -0.2 },
  // Left edge (x ≈ 2) — push LEFT
  "M2 12v-2": { x: -1.99, y: -0.2 },
  // Corners — push diagonally outward
  "M22 6V5a2 2 0 0 0-2-2": { x: 1.5, y: -1.33 }, // top-right
  "M4 3a2 2 0 0 0-2 2v1": { x: -1.49, y: -1.33 }, // top-left
  "M20 19a2 2 0 0 0 2-2v-1": { x: 1.66, y: 1.11 }, // bottom-right
  "M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149": { x: -1.58, y: 1.17 }, // tail
};

const matchDashedSegment = matchPathDOneOf(
  ...(Object.keys(SEGMENT_OFFSETS) as (keyof typeof SEGMENT_OFFSETS)[])
);

export const messageSquareDashedAssembly: Motion = {
  matches: matchDashedSegment,
  factory: (ctx) => {
    const d = String(ctx.pathAttrs.d);
    // Unknown d falls back to no displacement — the cycle is still
    // closed at rest. Used by the rest-cycle invariant test which
    // calls with a synthetic d outside our registry.
    const off = SEGMENT_OFFSETS[d] ?? { x: 0, y: 0 };
    return {
      rest: { x: 0, y: 0, opacity: 1, rotate: 0 },
      active: {
        // Assemble: start displaced (invisible), translate to rest by
        // t = 0.35, then hold. Bookend at rest via the t=0 frame so
        // the cycle is closed.
        x: [0, off.x, 0, 0],
        y: [0, off.y, 0, 0],
        opacity: [1, 0, 1, 1],
        // Nod with the bubble after assembly settles.
        rotate: MESSAGE_SQUARE_BODY_KEYFRAMES.rotate,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          x: { inherit: true, ease: "easeOut", times: [0, 0.001, 0.35, 1] },
          y: { inherit: true, ease: "easeOut", times: [0, 0.001, 0.35, 1] },
          opacity: { inherit: true, ease: "easeOut", times: [0, 0.001, 0.35, 1] },
          rotate: {
            inherit: true,
            ease: "easeInOut",
            times: MESSAGE_SQUARE_BODY_KEYFRAMES.times,
          },
        },
      },
    };
  },
};
