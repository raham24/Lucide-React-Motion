import Link from "next/link";
import type { ComponentType } from "react";
import type { DrawIconProps } from "lucide-react-motion";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<Omit<DrawIconProps, "nodes">>;

interface IconCellProps {
  name: string;
  Icon: IconComponent;
}

/**
 * A single tile in the gallery. Clicking the tile navigates to that icon's
 * detail page at `/icons/{name}`.
 */
export function IconCell({ name, Icon }: IconCellProps) {
  return (
    <Link
      href={`/icons/${name}`}
      title={`${name} — view details`}
      data-motion-icon-group
      className={cn(
        "group relative flex aspect-square cursor-pointer flex-col items-center justify-between gap-2",
        "border-b border-r border-border bg-transparent px-3 py-5",
        "text-foreground",
        // Simple, clean hover: subtle background tint + color shift.
        // Smooth fade in and out, no lift/scale/shadow.
        "transition-colors duration-300 ease-out",
        "hover:bg-accent hover:text-primary",
        "focus-visible:bg-accent focus-visible:text-primary focus-visible:outline-none"
      )}
    >
      <span className="flex flex-1 items-center justify-center">
        <Icon size={36} strokeWidth={1.75} trigger="parent-hover" />
      </span>
      <span
        className={cn(
          "block w-full truncate text-center text-[10px] uppercase tracking-[0.08em]",
          "text-muted-foreground transition-colors duration-200 ease-out",
          "group-hover:text-foreground group-focus-visible:text-foreground"
        )}
      >
        {name}
      </span>
    </Link>
  );
}
