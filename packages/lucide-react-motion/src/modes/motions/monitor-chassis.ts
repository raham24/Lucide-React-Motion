import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Monitor chassis — the host motion for every icon built around the
 * Lucide monitor display (14 icons today: `monitor`, `monitor-check`,
 * `monitor-cloud`, `monitor-cog`, `monitor-dot`, `monitor-down`,
 * `monitor-off`, `monitor-pause`, `monitor-play`, `monitor-stop`,
 * `monitor-up`, `monitor-x`, plus the device-pair composites
 * `monitor-smartphone` and `monitor-speaker`).
 *
 * Three anatomical roles, matched per-path:
 *
 * - **Screen** — the display rectangle. Standard form is
 *   `<rect width=20 height=14 x=2 y=3 rx=2>` (9 variants); Lucide
 *   reshapes it to a path in composites where a payload cuts the
 *   corner (`monitor-cog`, `monitor-dot`, `monitor-smartphone`) and
 *   splits it into two fragments in `monitor-off`.
 * - **Stand stem** — short vertical (`M12 17v4` as a path, or as a
 *   `<line>` in the base `monitor`). Rigid stand, doesn't transform.
 * - **Stand base** — short horizontal (`M8 21h8` as a path, or as a
 *   `<line>` in the base `monitor`). Rigid stand, doesn't transform.
 *
 * **Real-life referent (abstract archetype — device interaction).**
 * Monitors don't have ambient motion; they wake. Per the skill's
 * "Device interaction" archetype, the canonical gesture is the
 * display flashing on. Implemented as a brief opacity dim → recover
 * + a contraction beat on the screen (`scale: [1, 0.96, 1]`), pivoted
 * at the screen centre (12, 10) via the signature's `transformOrigin`.
 * Reads as "display wakes from sleep." Contraction-only per principle
 * 3 — the screen rect already touches the viewBox edge at y=3, any
 * scale > 1 would clip.
 *
 * The stand shares kinetic life via opacity dip on the same `times`
 * but skips the scale (scaling the stand around the screen centre
 * would translate it visibly and break the rigid attachment).
 *
 * Exports `MONITOR_SCREEN_KEYFRAMES` so the family modifier-reveal
 * can inherit the screen's wake `opacity` and phase-lock with the
 * display turning on.
 *
 * Closed cycle: every keyframe array starts AND ends at the rest
 * value (principle 4).
 */
const MONITOR_SCREEN_PATHS = [
  // monitor-cog body (corner cut for the gear circle at top-right)
  "M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7",
  // monitor-dot body (corner cut for the notification dot)
  "M22 12.307V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693",
  // monitor-off — lower-left casing fragment
  "M17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 1.184-1.826",
  // monitor-off — upper-right casing fragment
  "M8.656 3H20a2 2 0 0 1 2 2v10a2 2 0 0 1-.293 1.042",
  // monitor-smartphone — monitor body cut to make room for the phone
  "M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8",
];

const MONITOR_STAND_PATHS = [
  // Standard stand (8 variants where stand is a <path>)
  "M12 17v4",
  "M8 21h8",
];

const matchScreenPath = matchPathDOneOf(...MONITOR_SCREEN_PATHS);
const matchStandPath = matchPathDOneOf(...MONITOR_STAND_PATHS);

const isStandardScreenRect = (ctx: {
  pathTag: string;
  pathAttrs: Record<string, string | number>;
}) =>
  ctx.pathTag === "rect" &&
  String(ctx.pathAttrs.x) === "2" &&
  String(ctx.pathAttrs.y) === "3" &&
  String(ctx.pathAttrs.width) === "20" &&
  String(ctx.pathAttrs.height) === "14";

const isStandardStandLine = (ctx: {
  pathTag: string;
  pathAttrs: Record<string, string | number>;
}) => {
  if (ctx.pathTag !== "line") return false;
  const x1 = String(ctx.pathAttrs.x1);
  const x2 = String(ctx.pathAttrs.x2);
  const y1 = String(ctx.pathAttrs.y1);
  const y2 = String(ctx.pathAttrs.y2);
  // Vertical stem (12,17)→(12,21) OR horizontal base (8,21)→(16,21).
  return (
    (x1 === "12" && x2 === "12" && y1 === "17" && y2 === "21") ||
    (x1 === "8" && x2 === "16" && y1 === "21" && y2 === "21")
  );
};

export const MONITOR_SCREEN_KEYFRAMES = {
  scale: [1, 0.96, 1],
  opacity: [1, 0.45, 1],
  times: [0, 0.3, 1],
};

export const monitorChassis: Motion = {
  matches: (ctx) =>
    isStandardScreenRect(ctx) ||
    matchScreenPath(ctx) ||
    matchStandPath(ctx) ||
    isStandardStandLine(ctx),
  factory: (ctx) => {
    const isScreen = isStandardScreenRect(ctx) || matchScreenPath(ctx);
    if (isScreen) {
      return {
        rest: { scale: 1, opacity: 1 },
        active: {
          scale: MONITOR_SCREEN_KEYFRAMES.scale,
          opacity: MONITOR_SCREEN_KEYFRAMES.opacity,
          transition: {
            duration: ctx.duration,
            delay: ctx.delay,
            repeat: ctx.repeat,
            ease: "easeInOut",
            times: MONITOR_SCREEN_KEYFRAMES.times,
          },
        },
      };
    }
    // Stand stem/base — opacity dip in lockstep, no scale (scaling the
    // stand around the screen centre would translate it visibly and
    // break the rigid attachment to the chassis).
    return {
      rest: { opacity: 1 },
      active: {
        opacity: MONITOR_SCREEN_KEYFRAMES.opacity,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          ease: "easeInOut",
          times: MONITOR_SCREEN_KEYFRAMES.times,
        },
      },
    };
  },
};
