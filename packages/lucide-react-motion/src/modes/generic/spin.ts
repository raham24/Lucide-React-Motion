import { spinFactory } from "../motions/atom/spin";
import type { Mode } from "../types";

/**
 * One full clockwise rotation. Defaults to linear easing so the rotation
 * feels mechanical rather than organic. For an infinite loader, set
 * `repeat={Infinity}` or use the `"signature"` mode on `loader`.
 */
export const spin: Mode = {
  factory: spinFactory,
  defaults: { duration: 0.8, easing: "linear", stagger: 0 },
  needsTransformOrigin: true,
};
