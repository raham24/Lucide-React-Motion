import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Wifi-sync's paired arrows — Tier 2 sync-loop motion. The four
 * disjoint paths spin about their own bounds, loader-style, rather
 * than orbiting around a shared badge center.
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
      rotate: 0,
      transformBox: "fill-box",
      transformOrigin: "center",
    },
    active: {
      rotate: [0, 360],
      transformBox: "fill-box",
      transformOrigin: "center",
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        rotate: {
          inherit: true,
          ease: "linear",
          times: [0, 1],
        },
      },
    },
  }),
};
