"use client";

import { useState, type ComponentType } from "react";
import type { DrawIconProps } from "@/src/engine";

type IconComponent = ComponentType<Omit<DrawIconProps, "nodes">>;

interface IconCellProps {
  name: string;
  component: string;
  Icon: IconComponent;
}

/** A single clickable icon tile in the gallery. Click copies the import line. */
export function IconCell({ name, component, Icon }: IconCellProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const line = `import { ${component} } from "lucide-react-motion";`;
    navigator.clipboard?.writeText(line);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`${name} — click to copy import`}
      className="group relative flex aspect-square cursor-pointer flex-col items-center justify-between gap-2 border-b border-r border-line bg-transparent px-3 py-5 text-ink transition-colors hover:bg-paper-dim/60 hover:text-accent"
    >
      <span className="flex flex-1 items-center justify-center">
        <Icon size={36} strokeWidth={1.75} />
      </span>
      <span className="block w-full truncate text-center text-[10px] uppercase tracking-[0.08em] text-ink-soft group-hover:text-ink">
        {name}
      </span>
      {copied && (
        <span className="pointer-events-none absolute inset-x-1 top-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
          copied
        </span>
      )}
    </button>
  );
}
