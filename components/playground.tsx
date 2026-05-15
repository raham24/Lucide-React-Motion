"use client";

import { useRef, type ReactNode } from "react";
import {
  Bell,
  Heart,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Star,
  Zap,
} from "@/src/generated";
import { MotionIconConfig, type MotionIconHandle } from "@/src/engine";

/**
 * Section heading + grid container — large readable title + short description
 * over the gallery's editorial grid (border-l/t on the wrapper, border-b/r on
 * cells).
 */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {children}
      </div>
    </section>
  );
}

/**
 * Single demo cell — same shape as the gallery's icon cell: aspect-square,
 * content centered, prop label truncated underneath.
 */
function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative flex aspect-square flex-col items-center justify-between gap-2 border-b border-r border-border bg-transparent px-3 py-5 text-foreground transition-colors hover:bg-secondary/60">
      <span className="flex flex-1 items-center justify-center">
        {children}
      </span>
      <code className="block w-full truncate text-center text-[10px] tracking-tight text-muted-foreground group-hover:text-foreground">
        {label}
      </code>
    </div>
  );
}

/**
 * Cell variant for the parent-hover button demo — the entire cell IS the
 * trigger surface so users can verify the parent-hover behavior naturally.
 */
function ButtonDemo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex aspect-square flex-col items-center justify-between gap-3 border-b border-r border-border px-3 py-5">
      <span className="flex flex-1 items-center justify-center">
        <button
          type="button"
          data-motion-icon-group
          className="inline-flex items-center gap-2 border border-foreground px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
        >
          {children}
        </button>
      </span>
      <code className="block w-full truncate text-center text-[10px] tracking-tight text-muted-foreground">
        {label}
      </code>
    </div>
  );
}

/**
 * Cell variant for the imperative-handle demo — icon plus its play() button,
 * to keep the demo legible inside a single aspect-square cell.
 */
function ManualDemo() {
  const handleRef = useRef<MotionIconHandle>(null);

  return (
    <div className="flex aspect-square flex-col items-center justify-between gap-2 border-b border-r border-border px-3 py-5">
      <span className="flex flex-1 items-center justify-center">
        <Rocket size={56} trigger="manual" ref={handleRef} />
      </span>
      <button
        type="button"
        onClick={() => handleRef.current?.play()}
        className="border border-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
      >
        play()
      </button>
      <code className="block w-full truncate text-center text-[10px] tracking-tight text-muted-foreground">
        trigger=&quot;manual&quot;
      </code>
    </div>
  );
}

export function Playground() {
  return (
    <div className="space-y-12">
      <Section
        title="Timing"
        description="How long the draw takes, when it starts, and how segments are staggered. Hover each demo to play it."
      >
        <Demo label="defaults">
          <Heart size={56} />
        </Demo>
        <Demo label="duration=0.15">
          <Heart size={56} duration={0.15} />
        </Demo>
        <Demo label="duration=2.5">
          <Heart size={56} duration={2.5} />
        </Demo>
        <Demo label="delay=0.5">
          <Settings size={56} delay={0.5} />
        </Demo>
        <Demo label="stagger=0.4">
          <Rocket size={56} stagger={0.4} />
        </Demo>
        <Demo label="stagger=0">
          <Sparkles size={56} stagger={0} />
        </Demo>
        <Demo label="easing=linear">
          <Heart size={56} easing="linear" />
        </Demo>
        <Demo label="repeat=Infinity">
          <Settings size={56} repeat={Infinity} duration={1.2} />
        </Demo>
      </Section>

      <Section
        title="Trigger modes"
        description="Each icon decides when to play. Hover the icon, click it, scroll it into view, hover a parent button, or fire it imperatively via a ref."
      >
        <Demo label='trigger="hover"'>
          <Heart size={56} trigger="hover" />
        </Demo>
        <Demo label='trigger="click"'>
          <Bell size={56} trigger="click" />
        </Demo>
        <Demo label='trigger="mount"'>
          <Star size={56} trigger="mount" />
        </Demo>
        <Demo label='trigger="in-view"'>
          <Zap size={56} trigger="in-view" />
        </Demo>
        <ButtonDemo label='trigger="parent-hover"'>
          Hover button
          <Send size={16} trigger="parent-hover" />
        </ButtonDemo>
        <ManualDemo />
      </Section>

      <Section
        title="Leave behavior"
        description="What happens when the pointer moves away mid-draw. Hover each icon, then leave before it finishes — complete plays out, snap jumps to the end, redraw restarts from blank."
      >
        <Demo label='onLeave="complete"'>
          <Heart size={56} />
        </Demo>
        <Demo label='onLeave="snap"'>
          <Heart size={56} onLeave="snap" />
        </Demo>
        <Demo label='onLeave="redraw"'>
          <Heart size={56} onLeave="redraw" />
        </Demo>
      </Section>

      <Section
        title="Custom variants"
        description="Skip the default stroke-draw and supply your own Motion variants. Get scale, rotation, staggered keyframes — anything Motion supports."
      >
        <Demo label="pulse">
          <Heart
            size={56}
            variants={{
              rest: { scale: 1 },
              active: {
                scale: [1, 1.3, 1],
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
            style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
          />
        </Demo>
        <Demo label="spin">
          <Settings
            size={56}
            variants={{
              rest: { rotate: 0 },
              active: { rotate: 360, transition: { duration: 0.6 } },
            }}
            style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
          />
        </Demo>
        <Demo label="staggered wiggle">
          <Sparkles
            size={56}
            variants={(i) => ({
              rest: { rotate: 0 },
              active: {
                rotate: [0, -15, 12, -8, 0],
                transition: { duration: 0.5, delay: i * 0.06 },
              },
            })}
            style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
          />
        </Demo>
      </Section>

      <Section
        title="MotionIconConfig"
        description="A context provider that sets defaults for every icon underneath. Per-icon props still win, so children can opt out of any inherited value."
      >
        <MotionIconConfig duration={0.2} stagger={0.04} easing="linear">
          <Demo label="inherits">
            <Heart size={56} />
          </Demo>
          <Demo label="inherits">
            <Settings size={56} />
          </Demo>
          <Demo label="duration=1.4 override">
            <Rocket size={56} duration={1.4} />
          </Demo>
        </MotionIconConfig>
      </Section>

      <Section
        title="absoluteStrokeWidth"
        description="Opt-in stroke scaling that matches lucide-react. Without it, strokes thicken at larger sizes; with it, they hold a constant visual weight."
      >
        <Demo label="size=24 stroke=2">
          <Heart size={24} strokeWidth={2} />
        </Demo>
        <Demo label="size=64 stroke=2">
          <Heart size={64} strokeWidth={2} />
        </Demo>
        <Demo label="size=64 absolute">
          <Heart size={64} strokeWidth={2} absoluteStrokeWidth />
        </Demo>
      </Section>

      <Section
        title="Reduced motion"
        description="Respect (or override) the user's prefers-reduced-motion setting. Toggle your OS preference and refresh to see system mode flip; always and never demos ignore the OS."
      >
        <Demo label='reducedMotion="system"'>
          <Heart size={56} />
        </Demo>
        <Demo label='reducedMotion="always"'>
          <Heart size={56} reducedMotion="always" />
        </Demo>
        <Demo label='reducedMotion="never"'>
          <Heart size={56} reducedMotion="never" />
        </Demo>
      </Section>
    </div>
  );
}
