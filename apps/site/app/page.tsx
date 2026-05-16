import Image from "next/image";
import Link from "next/link";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { manifest } from "lucide-react-motion/manifest";
import { Gallery } from "@/components/gallery";
import { siteConfig } from "@/lib/site-config";

const GITHUB_URL = `https://github.com/${siteConfig.github.owner}/${siteConfig.github.repo}`;

export default function Page() {
  return (
    <div
      className="min-h-screen bg-background font-mono text-foreground"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-10">
        {/* Header — eyebrow / wordmark / tagline (centered) */}
        <header className="flex flex-col items-center space-y-6 border-b border-border pb-12 text-center">
          <div className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Open Source · ISC</span>
            <span>{manifest.length.toLocaleString()} icons</span>
          </div>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-4">
            <Image
              src="/web-app-manifest-192x192.png"
              alt=""
              width={64}
              height={64}
              priority
              className="size-14 shrink-0 sm:size-16"
            />
            <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              Lucide React Motion
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every Lucide icon, animated. A drop-in replacement for{" "}
            <code className="text-[0.95em]">lucide-react</code>{" "}
            with hover-to-draw motion, full prop parity, and a low-level escape
            hatch for custom variants. Editable React components, generated
            from source.
          </p>
          <div className="w-full max-w-xl text-left">
            <Tabs
              items={["bun", "npm", "pnpm", "yarn"]}
              className="[&>[role=tablist]]:border-b [&>[role=tablist]]:border-fd-border [&_[role=tabpanel]]:!rounded-none [&_[role=tabpanel]]:!bg-transparent [&_[role=tabpanel]]:!p-0 [&_[role=tabpanel]>figure]:!m-0 [&_[role=tabpanel]>figure]:!rounded-none [&_[role=tabpanel]>figure]:!border-0"
            >
              <Tab value="bun">
                <DynamicCodeBlock lang="bash" code="bun add lucide-react-motion" />
              </Tab>
              <Tab value="npm">
                <DynamicCodeBlock lang="bash" code="npm install lucide-react-motion" />
              </Tab>
              <Tab value="pnpm">
                <DynamicCodeBlock lang="bash" code="pnpm add lucide-react-motion" />
              </Tab>
              <Tab value="yarn">
                <DynamicCodeBlock lang="bash" code="yarn add lucide-react-motion" />
              </Tab>
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/docs"
              className="border border-foreground bg-foreground px-4 py-2 text-xs uppercase tracking-[0.12em] text-background transition-colors hover:bg-primary hover:border-primary hover:text-primary-foreground"
            >
              Read the docs
            </Link>
            <Link
              href="/playground"
              className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
            >
              Playground
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
            >
              GitHub
            </a>
          </div>
        </header>

        <Gallery />
      </div>
    </div>
  );
}
