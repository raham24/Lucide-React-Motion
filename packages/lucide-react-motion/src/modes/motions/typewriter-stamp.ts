import { matchAnyPath, type Motion } from "../compose";

/**
 * Typewriter-stamp archetype — the canonical motion for icons whose
 * subject is a letter, symbol, or typographic mark (no real-world
 * referent with characteristic motion). Reads as a type hammer
 * striking the page: the glyph compresses subtly, bobs down with
 * the impact, and springs back to rest.
 *
 * `matchAnyPath` so every element in the icon stamps together as a
 * single gesture. Anchorless `y` translate + contraction-only
 * `scale` (principle 3) — drops cleanly into any signature
 * regardless of `transformOrigin`.
 *
 * Directional variants (a-arrow-up bobs up, a-arrow-down bobs
 * down) get their `y` direction from `STAMP_Y_DIRECTION` keyed by
 * `ctx.iconName`. The default direction is down (+1) — the
 * type-hammer strike.
 *
 * Coverage: typography icons that route through the abstract
 * "Typewriter stamp" archetype per the skill — `a-arrow-up`,
 * `a-arrow-down`, `a-large-small`, `ampersand`, `ampersands`,
 * `asterisk`, `baseline`, `bold`, `case-lower`, `case-sensitive`,
 * `case-upper`, `heading`, `heading-1..6`, `italic`, `pilcrow`,
 * `pilcrow-left`, `pilcrow-right`, `strikethrough`, `subscript`,
 * `superscript`, `text-cursor`, `text-cursor-input`, `type`,
 * `type-outline`. (text-align-* icons route through the alignment
 * archetype, not this one.)
 */
const STAMP_Y_DIRECTION: Record<string, number> = {
  "a-arrow-up": -1,
  "a-arrow-down": 1,
};

export const TYPEWRITER_STAMP_KEYFRAMES: {
  scale: number[];
  opacity: number[];
  times: number[];
} = {
  scale: [1, 0.94, 1],
  opacity: [1, 0.85, 1],
  times: [0, 0.4, 1],
};

export const typewriterStamp: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const dy = STAMP_Y_DIRECTION[ctx.iconName] ?? 1;
    return {
      rest: { y: 0, scale: 1, opacity: 1 },
      active: {
        y: [0, dy, 0],
        scale: TYPEWRITER_STAMP_KEYFRAMES.scale,
        opacity: TYPEWRITER_STAMP_KEYFRAMES.opacity,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          y: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
          scale: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
          opacity: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
        },
      },
    };
  },
};
