import type { Metadata } from "next";
import { IBM_Plex_Mono, Geist } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucide//Motion — animated icons for every Lucide icon",
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", plexMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen">
        <RootProvider>
          <SiteNav />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
