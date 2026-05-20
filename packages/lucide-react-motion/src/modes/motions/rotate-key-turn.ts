import { matchPathDOneOf, type Motion } from "../compose";
import type { ModeContext } from "../types";

/**
 * The key inside `rotate-ccw-key` — vertical shaft (`M12 7v6`),
 * cross piece (`M12 9h2`), and keyhole `<circle cx=12 cy=15 r=2>`.
 * Demonstrates "spin the key in the lock" by rotating the whole
 * key as one rigid body through one full counter-clockwise
 * revolution around its keyhole pivot at (12, 15) — the natural
 * "spin" gesture of a key turning in its cylinder, in time with
 * the arc's pinch-and-swing.
 *
 * The signature's global `transformOrigin` is (12, 12) (icon
 * centre), but the key needs to pivot at (12, 15) (the keyhole).
 * We synthesize that with a `rotate` + `translate` pair: at angle
 * θ, applying `rotate(θ)` around (12, 12) carries the rest keyhole
 * (12, 15) to (12 − 3·sin(θ), 12 + 3·cos(θ)). Translating by
 * (3·sin(θ), 3 − 3·cos(θ)) restores it to (12, 15) at every angle,
 * so the combined transform reads as rotation around the keyhole.
 *
 * Because motion interpolates `rotate`, `x`, and `y` linearly
 * between keyframes, sampling the (x, y) compensation only at
 * 0°/−360° would leave the keyhole drifting on a straight line
 * between samples (the real path is a circle of radius 3 around
 * (12, 12)). Sampling every 90° approximates the circle as a
 * diamond — close enough that the keyhole shifts by at most ~0.6
 * units between exact and interpolated positions, well within
 * sub-pixel noise at typical icon sizes.
 *
 * The keyhole circle is rotationally symmetric, so its `rotate`
 * value is a visual no-op — it travels with the body via the same
 * translate keyframes so the assembly stays one rigid key. Matched
 * by `<circle cx=12 cy=15 r=2>` via a custom predicate (the
 * generic `matchPathDOneOf` only matches `<path>` elements).
 *
 * The key does not inherit the arc's `scale` pinch — the arc
 * mechanically winds-and-spins, the key spins. Two simultaneous
 * gestures with different roles, but sharing a synchronized
 * apex: the spin's halfway-through moment (rotate = −180°) lands
 * on the arc's apex moment (t = 0.5), and the spin completes at
 * t = 0.85 when the arc has returned upright.
 *
 * Ends the cycle at rotate = −360 ≡ 0 visually; the same pattern
 * as `refreshArcCycle` which holds at `360` at the end of its
 * active state.
 */
const KEY_BODY_PATHS = ["M12 7v6", "M12 9h2"];
const matchKeyBody = matchPathDOneOf(...KEY_BODY_PATHS);

function isKeyholeCircle(ctx: ModeContext): boolean {
  return (
    ctx.pathTag === "circle" &&
    String(ctx.pathAttrs.cx) === "12" &&
    String(ctx.pathAttrs.cy) === "15" &&
    String(ctx.pathAttrs.r) === "2"
  );
}

// Sample one full ccw revolution at 90° intervals. Times pad the
// spin into the same window the arc uses for its pinch-and-swing
// (0.15 → 0.85), with the −180° midpoint pinned to t = 0.5 so the
// key's half-spun moment lands on the arc's apex moment.
const KEY_TURN_ANGLES = [0, 0, -90, -180, -270, -360, -360];
const KEY_TURN_TIMES = [0, 0.15, 0.325, 0.5, 0.675, 0.85, 1];

const KEY_TURN_X_KEYFRAMES = KEY_TURN_ANGLES.map(
  (a) => 3 * Math.sin((a * Math.PI) / 180),
);
const KEY_TURN_Y_KEYFRAMES = KEY_TURN_ANGLES.map(
  (a) => 3 - 3 * Math.cos((a * Math.PI) / 180),
);

export const rotateKeyTurn: Motion = {
  matches: (ctx) => matchKeyBody(ctx) || isKeyholeCircle(ctx),
  factory: (ctx) => ({
    rest: { rotate: 0, x: 0, y: 0 },
    active: {
      rotate: KEY_TURN_ANGLES,
      x: KEY_TURN_X_KEYFRAMES,
      y: KEY_TURN_Y_KEYFRAMES,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        rotate: {
          inherit: true,
          ease: "easeInOut",
          times: KEY_TURN_TIMES,
        },
        x: {
          inherit: true,
          ease: "easeInOut",
          times: KEY_TURN_TIMES,
        },
        y: {
          inherit: true,
          ease: "easeInOut",
          times: KEY_TURN_TIMES,
        },
      },
    },
  }),
};

