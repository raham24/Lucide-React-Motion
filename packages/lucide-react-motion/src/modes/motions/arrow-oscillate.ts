import { matchAnyPath, type Motion } from "../compose";

/**
 * Bidirectional arrow oscillation — for `arrow-up-down`,
 * `arrow-down-up`, `arrow-left-right`, `arrow-right-left`. Each
 * icon has two arrows pointing in opposite directions; the whole
 * icon oscillates along the bidirectional axis (up then down, or
 * left then right) so the gesture reads as "this means bidirectional
 * movement."
 *
 * Anchorless translate, no pivot dependency. Direction axis comes
 * from `ctx.iconName`. Closed cycle per principle 4.
 *
 * (Per-arrow direction detection — top arrow nudges up, bottom
 * arrow nudges down — would require splitting the paths by
 * position; deferred. The whole-icon oscillation is a clean v0.)
 */
const OSCILLATION_AXIS: Record<string, "x" | "y"> = {
  "arrow-up-down": "y",
  "arrow-down-up": "y",
  "arrow-left-right": "x",
  "arrow-right-left": "x",
};

export const arrowOscillate: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const axis = OSCILLATION_AXIS[ctx.iconName] ?? "y";
    const range = 1.2;
    const series = [0, -range, range, 0];
    const times = [0, 0.25, 0.6, 1];
    return {
      rest: { x: 0, y: 0 },
      active: {
        x: axis === "x" ? series : [0, 0],
        y: axis === "y" ? series : [0, 0],
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          x: {
            inherit: true,
            ease: "easeInOut",
            times: axis === "x" ? times : [0, 1],
          },
          y: {
            inherit: true,
            ease: "easeInOut",
            times: axis === "y" ? times : [0, 1],
          },
        },
      },
    };
  },
};
