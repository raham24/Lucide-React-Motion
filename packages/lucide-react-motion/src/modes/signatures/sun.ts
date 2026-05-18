import { compose } from "../compose";
import { sunRotate } from "../motions/sun-rotate";

/** Sun slow rotation — composed from the shared {@link sunRotate} motion. */
export default compose({
  motions: [sunRotate],
  defaults: { duration: 2.5, easing: "linear", stagger: 0 },
});
