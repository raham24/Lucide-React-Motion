import { matchPathD, type Motion } from "../compose";
import { WIFI_SIGNAL_KEYFRAMES } from "./wifi-signal-wave";

/**
 * Wifi-pen's editing pen — Tier 2 writing motion. The pen path draws
 * in while the tool slides along its diagonal writing axis, starting
 * slightly up/right and settling back at rest as if the nib just
 * finished marking the wifi setting.
 */
const WIFI_PEN_D =
  "M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z";

export const wifiPenWrite: Motion = {
  matches: matchPathD(WIFI_PEN_D),
  factory: (ctx) => ({
    rest: {
      pathLength: 1,
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      transformOrigin: "18px 18px",
    },
    active: {
      pathLength: [0, 0, 1, 1, 1],
      opacity: [0, 0, 1, 0.78, 1],
      x: [0.8, 0.8, 0, -0.18, 0],
      y: [-0.8, -0.8, 0, 0.18, 0],
      rotate: [-7, -7, 1.5, -2, 0],
      transformOrigin: "18px 18px",
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.26, WIFI_SIGNAL_KEYFRAMES.fullSignalPeak, 0.86, 1],
        },
        opacity: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.26, WIFI_SIGNAL_KEYFRAMES.fullSignalPeak, 0.86, 1],
        },
        x: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.26, WIFI_SIGNAL_KEYFRAMES.fullSignalPeak, 0.86, 1],
        },
        y: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.26, WIFI_SIGNAL_KEYFRAMES.fullSignalPeak, 0.86, 1],
        },
        rotate: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 0.26, WIFI_SIGNAL_KEYFRAMES.fullSignalPeak, 0.86, 1],
        },
      },
    },
  }),
};
