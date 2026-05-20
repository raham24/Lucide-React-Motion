import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Wifi-sync's paired arrows — Tier 2 sync-loop motion. The four
 * disjoint paths are separate Lucide strokes, but anatomically they
 * are one rotating sync control, so they rotate in lockstep around the
 * badge center while drawing in.
 */
const WIFI_SYNC_ARROW_PATHS = [
  "M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5",
  "M11.965 14.105h4",
  "M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5",
  "M21.965 22.105v-4",
];

export const wifiSyncArrows: Motion = {
  matches: matchPathDOneOf(...WIFI_SYNC_ARROW_PATHS),
  factory: (ctx) => ({
    rest: {
      pathLength: 1,
      opacity: 1,
      rotate: 0,
      transformOrigin: "18px 17px",
    },
    active: {
      pathLength: [0, 1, 1],
      opacity: [0, 1, 1],
      rotate: [0, 360],
      transformOrigin: "18px 17px",
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.36, 1],
        },
        opacity: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.24, 1],
        },
        rotate: {
          inherit: true,
          ease: "easeInOut",
          times: [0, 1],
        },
      },
    },
  }),
};
