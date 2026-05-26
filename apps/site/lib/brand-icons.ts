/**
 * Bridges the library's `scripts/brand-icons.json` source-of-truth into the
 * site. Brand icons (github, linkedin, ...) restored from deprecated Lucide
 * aren't in `lucide-static/icon-nodes.json`, so the per-icon detail page
 * needs to merge them in. `isUpstreamLucide` lets the page hide external
 * lucide.dev / lucide-icons GitHub links for restored brand icons.
 */

import type { IconNode } from "lucide-react-motion";
import brandIconsJson from "../../../packages/lucide-react-motion/scripts/brand-icons.json";

type BrandEntry = { nodes: IconNode[]; tags: string[] };
const brand = brandIconsJson as unknown as Record<string, BrandEntry>;

export const brandNodes: Record<string, IconNode[]> = Object.fromEntries(
  Object.entries(brand).map(([name, entry]) => [name, entry.nodes])
);

const brandNameSet: ReadonlySet<string> = new Set(Object.keys(brand));

export function isUpstreamLucide(name: string): boolean {
  return !brandNameSet.has(name);
}
