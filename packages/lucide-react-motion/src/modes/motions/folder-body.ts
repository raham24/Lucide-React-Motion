import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Folder body — the host motion for every icon built around the
 * Lucide folder shape (30 icons today). The closed-folder outline
 * comes in two canonical spellings plus many reshaped variants
 * (each composite that inset-cuts the body for a badge); the open
 * folder in `folder-open` / `folder-open-dot` is two more d's. All
 * routed through the same motion.
 *
 * **Real-life referent — folder tipping open / being inspected.**
 * A real folder hinges from its spine at the bottom-left when you
 * pick it up to peek inside. The signature gesture is a damped
 * left-right tilt (`rotate: [0, -3, 2, -1, 0]`) around the bottom-
 * left corner `(4px, 20px)` — the folder's "spine." The top-left
 * tab is the furthest point from the pivot so it moves the most,
 * which reads as the tab bending back as if the folder is being
 * opened to inspect its contents. Paired with an opacity dip phase-
 * locked to the tilt apexes so the surface shimmers as it tips.
 *
 * Pivot at `(4, 20)`: bottom-left corner of the standard folder
 * body. For composites with different bottom-left coordinates (the
 * `-output`, `-input`, `-symlink`, `-pen` variants whose bodies
 * start at x = 2 instead of 4) the pivot is ~2 units off but the
 * gesture still reads cohesively — the whole body just tilts.
 *
 * ViewBox safety. At ±3° the top-right corner at (22, 6) (relative
 * `(18, -14)` from the pivot) moves to roughly (22.71, 5.08); with
 * stroke radius 1 the outer edge sits at x ≈ 23.71 — inside the
 * 24×24 viewBox. The top-left tab at (4, 3) (relative `(0, -17)`)
 * moves to roughly (3.11, 3.04); outer edge at x ≈ 2.11, inside.
 *
 * Sub-icons inherit BOTH `rotate` and `opacity` via the family
 * modifier-reveal so payloads (kanban bars, code chevrons, plus,
 * arrows, etc.) tilt and dim WITH the folder (principle 2 —
 * cohesion; monitor and mail are the existing precedents).
 *
 * Exports `FOLDER_BODY_KEYFRAMES` so the family modifier-reveal can
 * inherit both curves directly.
 *
 * Closed cycle: rotate and opacity both start AND end at rest.
 */
const FOLDER_BODY_PATHS = [
  // Standard closed folder — most variants
  "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  // Standard closed folder — alternate spelling (folder-bookmark, folder-search-2)
  "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z",
  // Alternate canonical — used in folder-dot, folder-kanban, folder-root
  "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",
  // Reshaped bodies — corner cut for inset payloads
  "M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1", // folder-archive
  "M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2", // folder-clock
  "M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3", // folder-cog
  "M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5", // folder-git-2
  "M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417", // folder-heart
  "M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1", // folder-input
  "M13 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1.36", // folder-key
  "M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5", // folder-lock
  "M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5", // folder-output
  "M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5", // folder-pen
  "M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1", // folder-search
  "M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7", // folder-symlink
  "M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5", // folder-sync
  // Open folders
  "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2", // folder-open
  "m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2", // folder-open-dot
];

const matchBody = matchPathDOneOf(...FOLDER_BODY_PATHS);

export const FOLDER_BODY_KEYFRAMES = {
  // Damped tilt around the bottom-left spine. Top-left tab moves
  // the most (furthest from pivot) so the gesture reads as the tab
  // bending back as the folder opens.
  rotate: [0, -3, 2, -1, 0],
  opacity: [1, 0.78, 1, 0.9, 1],
  times: [0, 0.25, 0.5, 0.75, 1],
};

export const folderBody: Motion = {
  matches: matchBody,
  factory: (ctx) => ({
    rest: { rotate: 0, opacity: 1 },
    active: {
      rotate: FOLDER_BODY_KEYFRAMES.rotate,
      opacity: FOLDER_BODY_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: FOLDER_BODY_KEYFRAMES.times,
      },
    },
  }),
};
