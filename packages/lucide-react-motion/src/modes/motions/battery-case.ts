import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Battery frame + terminal. The casing is the stable host object: it
 * does not physically deform, but it can "wake" as a power meter by
 * tracing on and briefly dimming as the internal charge state settles.
 *
 * Exports `BATTERY_CASE_KEYFRAMES` so in-cell symbols can reveal at
 * the same power-ready peak rather than floating over the frame.
 */
export const BATTERY_CASE_KEYFRAMES = {
  powerPeak: 0.64,
  pathLength: [0.18, 1, 1, 1],
  opacity: [0.62, 1, 0.84, 1],
  times: [0, 0.28, 0.72, 1],
};

const CASE_PATHS = [
  // Terminal cap. `battery` ships the equivalent path with expanded
  // absolute commands; the other variants use compact vertical syntax.
  "M 22 14 L 22 10",
  "M22 14v-4",
  // Split casing around charging / plus / warning symbols.
  "M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935",
  "M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936",
  "M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605",
  "M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606",
  "M14 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2",
  "M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2",
];

function isBatteryRect(ctx: Parameters<Motion["matches"]>[0]): boolean {
  return (
    ctx.pathTag === "rect" &&
    String(ctx.pathAttrs.x) === "2" &&
    String(ctx.pathAttrs.y) === "6" &&
    String(ctx.pathAttrs.width) === "16" &&
    String(ctx.pathAttrs.height) === "12" &&
    String(ctx.pathAttrs.rx) === "2"
  );
}

const matchCasePath = matchPathDOneOf(...CASE_PATHS);

export const batteryCase: Motion = {
  matches: (ctx) => isBatteryRect(ctx) || matchCasePath(ctx),
  factory: (ctx) => ({
    rest: { pathLength: 1, opacity: 1 },
    active: {
      pathLength: BATTERY_CASE_KEYFRAMES.pathLength,
      opacity: BATTERY_CASE_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        pathLength: {
          inherit: true,
          ease: "easeOut",
          times: BATTERY_CASE_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: BATTERY_CASE_KEYFRAMES.times,
        },
      },
    },
  }),
};
