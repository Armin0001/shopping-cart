"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { chipsFor } from "@/lib/filters";
import { cn } from "@/lib/hooks";
import { useShop } from "@/lib/store";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  const text = useTransform(spring, (v) => Math.round(v).toString());
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span className={cn("tabular-nums", className)}>{text}</motion.span>;
}

export function ActiveChips({ className, max = Infinity, dark = false }: { className?: string; max?: number; dark?: boolean }) {
  const filters = useShop((s) => s.filters);
  const setFilters = useShop((s) => s.setFilters);
  const chips = chipsFor(filters);
  const shown = chips.slice(0, max);
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {shown.map((c) => (
          <motion.button
            layout
            key={c.key}
            type="button"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setFilters(c.remove)}
            className={cn(
              "group flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-3 pr-2 text-[12px] font-medium",
              dark ? "bg-paper/12 text-paper hover:bg-signal" : "bg-acid text-ink hover:bg-signal hover:text-white",
            )}
          >
            {c.label}
            <span className="grid size-4 place-items-center rounded-full bg-ink/10 text-[10px] transition-transform group-hover:rotate-90">✕</span>
          </motion.button>
        ))}
        {chips.length > max && (
          <motion.span layout key="more" className={cn("px-1 font-mono text-[11px]", dark ? "text-paper/60" : "text-ink/50")}>
            +{chips.length - max}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn("rounded-md border border-current/20 px-1.5 py-0.5 font-mono text-[10px] leading-none opacity-70", className)}>{children}</kbd>;
}
