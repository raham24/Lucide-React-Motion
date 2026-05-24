import { compose } from "../compose";
import { polishedShineSweep } from "../motions/polished-shine-sweep";

export default compose({
  motions: [polishedShineSweep],
  defaults: { duration: 0.7, easing: "easeInOut", stagger: 0.05 },
});
