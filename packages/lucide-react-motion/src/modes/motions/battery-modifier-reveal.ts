import { matchAnyPath, type Motion } from "../compose";
import { BATTERY_CASE_KEYFRAMES } from "./battery-case";

/**
 * Battery-family in-cell state markers: plus and warning strokes.
 * They reveal at the battery frame's power-ready peak and keep a
 * small uniform scale/opacity cadence so they stay alive without
 * distorting the marker shape.
 *
 * Place this last in the compose list; `matchAnyPath` is greedy.
 */
export const batteryModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: {
      pathLength: 1,
      scale: 1,
      opacity: 1,
      transformBox: "view-box",
      transformOrigin: "10px 12px",
    },
    active: {
      pathLength: [0, 0, 1, 1, 1],
      scale: [1, 0.9, 1, 0.96, 1],
      opacity: [0, 0, 1, 0.72, 1],
      transformBox: "view-box",
      transformOrigin: "10px 12px",
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.16, BATTERY_CASE_KEYFRAMES.powerPeak, 0.84, 1],
        },
        scale: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.16, BATTERY_CASE_KEYFRAMES.powerPeak, 0.84, 1],
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.16, BATTERY_CASE_KEYFRAMES.powerPeak, 0.84, 1],
        },
      },
    },
  }),
};
