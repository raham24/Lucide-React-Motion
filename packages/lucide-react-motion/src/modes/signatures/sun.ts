import { spin } from "../generic/spin";
import type { Mode } from "../types";

/**
 * Slow rotation — uses the generic spin factory with a longer duration so
 * the sun arcs through its rotation at a leisurely pace.
 */
const sun: Mode = {
  ...spin,
  defaults: { duration: 2.5, easing: "linear", stagger: 0 },
};

export default sun;
