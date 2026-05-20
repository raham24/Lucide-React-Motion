import { matchPathD, type Motion } from "../compose";

/**
 * Battery-charging lightning bolt. It represents incoming current, so
 * it draws in quickly, flashes at the charge peak, and settles back to
 * full opacity without leaving the battery casing.
 */
const BATTERY_CHARGING_BOLT_D = "m11 7-3 5h4l-3 5";

export const batteryChargingBolt: Motion = {
  matches: matchPathD(BATTERY_CHARGING_BOLT_D),
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
      scale: [0.86, 0.86, 1, 0.92, 1],
      opacity: [0, 0, 1, 0.35, 1],
      transformBox: "view-box",
      transformOrigin: "10px 12px",
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.16, 0.42, 0.64, 1],
        },
        scale: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.16, 0.42, 0.64, 1],
        },
        opacity: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.16, 0.42, 0.64, 1],
        },
      },
    },
  }),
};
