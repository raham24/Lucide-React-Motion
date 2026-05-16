"use client";

import { useMemo, useState, type ComponentType } from "react";
import { manifest } from "lucide-react-motion/manifest";
import * as Icons from "lucide-react-motion";
import type { DrawIconProps } from "lucide-react-motion";
import { IconCell } from "@/components/icon-cell";
import { ICON_COUNT } from "@/lib/site-config";

type IconComponent = ComponentType<Omit<DrawIconProps, "nodes">>;
const IconMap = Icons as unknown as Record<string, IconComponent | undefined>;

const ICON_COUNT_FORMATTED = ICON_COUNT.toLocaleString();
const PAGE_SIZE = 96;

export function Gallery() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? manifest.filter((m) => m.name.includes(q)) : manifest;
  }, [query]);

  const visible = filtered.slice(0, limit);

  return (
    <>
      {/* Sticky control bar — search. top-13.25 (= 53px) is the exact
          SiteNav height (py-3 + h-7 button row + 1px border), so the bar
          tucks flush under it instead of slipping behind or leaving a gap. */}
      <div className="sticky top-13.25 z-10 -mx-6 mt-8 border-b border-border bg-background/90 px-6 py-4 backdrop-blur sm:-mx-10 sm:px-10">
        <label className="flex items-center gap-2 border border-foreground bg-background px-3 py-2 text-sm focus-within:border-primary">
          <span className="text-muted-foreground">/</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder={`search ${ICON_COUNT_FORMATTED} icons...`}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="mt-12 space-y-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {query
            ? `${filtered.length} matches for "${query}"`
            : "All icons · hover any to draw it on"}
        </div>

        {visible.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            no icons match &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-4 border-l border-t border-border sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {visible.map((m) => {
              const Icon = IconMap[m.component];
              if (!Icon) return null;
              return <IconCell key={m.name} name={m.name} Icon={Icon} />;
            })}
          </div>
        )}

        {limit < filtered.length && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
              className="border border-foreground px-5 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
            >
              Load more ({filtered.length - limit} left)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
