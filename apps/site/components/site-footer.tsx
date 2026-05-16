"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { title: "Gallery", href: "/" },
  { title: "Playground", href: "/playground" },
  { title: "Docs", href: "/docs" },
] as const;

const EXTERNAL_LINKS = [
  { title: "Lucide", href: "https://lucide.dev" },
  { title: "Motion", href: "https://motion.dev" },
  { title: "npm", href: "https://www.npmjs.com/package/lucide-react-motion" },
] as const;

function GitHubIcon() {
  return (
    <svg
      className="size-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg
      className="size-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0v24h24V0zm19.2 19.2H12V7.2H7.2v12H4.8V4.8h14.4z" />
    </svg>
  );
}

export function SiteFooter() {
  const pathname = usePathname() ?? "/";

  // Docs has its own fumadocs layout/footer; skip ours there.
  if (pathname.startsWith("/docs")) return null;

  const { owner, repo } = siteConfig.github;
  const githubUrl = `https://github.com/${owner}/${repo}`;
  const npmUrl = "https://www.npmjs.com/package/lucide-react-motion";

  return (
    <footer className="border-t border-border bg-background py-16 font-mono md:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Link
          href="/"
          aria-label="Lucide React Motion home"
          className="mx-auto block size-fit"
        >
          <Image
            src="/web-app-manifest-192x192.png"
            alt=""
            width={48}
            height={48}
            className="size-10"
          />
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {link.title}
            </Link>
          ))}
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="block text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="block text-muted-foreground transition-colors hover:text-primary"
          >
            <GitHubIcon />
          </a>
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="npm package"
            className="block text-muted-foreground transition-colors hover:text-primary"
          >
            <NpmIcon />
          </a>
        </div>

        <span className="block text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} · Built on Lucide (ISC)
        </span>
      </div>
    </footer>
  );
}
