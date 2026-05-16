import { manifest } from "lucide-react-motion/manifest";

export const ICON_COUNT = manifest.length;

export const siteConfig = {
  name: "Lucide React Motion",
  description: `Animated, editable React components for all ${ICON_COUNT.toLocaleString()} Lucide icons. Drop-in replacement for lucide-react.`,
  url: "https://lucide-react-motion-site.vercel.app",
  ogImage: "/og.png",
  keywords: [
    "lucide",
    "lucide-react",
    "lucide-react-motion",
    "react icons",
    "animated icons",
    "motion",
    "framer motion",
    "svg icons",
    "icon library",
    "react components",
  ],
  github: {
    owner: "Aadil1505",
    repo: "Lucide-React-Motion",
    branch: "main",
  },
} as const;

export function docsGithubUrl(pagePath: string): string {
  const { owner, repo, branch } = siteConfig.github;
  return `https://github.com/${owner}/${repo}/blob/${branch}/content/docs/${pagePath}`;
}
