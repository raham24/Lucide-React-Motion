import { matchAnyPath, type Motion } from "../compose";
import { spinFactory } from "./atom/spin";

/**
 * Slow whole-icon rotation. The sun has a central circle plus several ray
 * paths; all rotate together as a rigid disc. Built on the shared
 * `spinFactory` so the rotation math stays in one place.
 */
export const sunRotate: Motion = {
  matches: matchAnyPath,
  factory: spinFactory,
};
