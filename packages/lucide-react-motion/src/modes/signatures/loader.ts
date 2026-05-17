import { spin } from "../generic/spin";
import type { Mode } from "../types";

/**
 * Continuous spin — the spinner default. Loops forever unless the consumer
 * sets `repeat` explicitly to override.
 */
const loader: Mode = {
  ...spin,
  defaults: { duration: 1.0, easing: "linear", stagger: 0, repeat: Infinity },
};

export default loader;
