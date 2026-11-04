"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PRODUCTS } from "@/lib/data";
import { SORTS, hasActiveFilters } from "@/lib/filters";
import { cn, useFiltered } from "@/lib/hooks";
import { useShop } from "@/lib/store";
import { ActiveChips, AnimatedNumber } from "./bits";
import { ProductCard } from "./ProductCard";

export function Floor() {
  const items = useFiltered();
  const filters = useShop((s) => s.filters);
  const setFilters = useShop((s) => s.setFilters);
  const [dense, setDense] = useState(false);
  const active = hasActiveFilters(filters);

  return (
    <section id="floor" data-section="The Floor" className="relative px-5 pb-48 pt-24 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-[clamp(52px,8vw,128px)] font-extrabold leading-[0.82] tracking-[-0.06em]">
          The <span className="font-serif font-normal italic">floor</span>
        </h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink/60">Everything, all at once. Watch it rearrange when you filter — nothing reloads, things just move.</p>
      </div>

      <div className="sticky top-[76px] z-20 -mx-2 mt-10 rounded-full bg-paper/85 px-2 py-2 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="pl-2 text-[15px] font-semibold tracking-tight">
            <AnimatedNumber value={items.length} /> <span className="font-normal text-ink/40">of {PRODUCTS.length}</span>
          </p>
          <ActiveChips className="min-w-0 flex-1" max={6} />
          {active && (
            <button type="button" onClick={() => useShop.getState().resetFilters()} className="text-[12px] text-ink/50 underline-offset-4 hover:text-ink hover:underline">
              Clear all
            </button>
          )}
          <div className="ml-auto flex items-center gap-1 rounded-full bg-ink/6 p-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, sort: s.id }))}
                className="relative rounded-full px-3 py-1.5 text-[12px] font-medium"
              >
                {filters.sort === s.id && (
                  <motion.span layoutId="sort-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                )}
                <span className={cn("relative", filters.sort === s.id && "text-paper")}>{s.name}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDense((d) => !d)}
            aria-label="Toggle grid density"
            className="grid size-9 place-items-center rounded-full bg-ink/6 transition-colors hover:bg-ink hover:text-paper"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
              {dense
                ? [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={3 + c * 6.5} y={3 + r * 6.5} width="5" height="5" rx="1" />))
                : [0, 1].flatMap((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={3 + c * 10} y={3 + r * 10} width="8" height="8" rx="2" />))}
            </svg>
          </button>
        </div>
      </div>

      <motion.div
        layout
        className={cn(
          "mt-8 grid gap-x-5 gap-y-10",
          dense ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 4, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <ProductCard p={p} layoutKey={`floor-${p.id}`} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-10 flex max-w-lg flex-col items-center text-center"
          >
            <motion.span
              className="text-[120px] leading-none"
              animate={{ rotate: [0, -10, 10, -6, 0], y: [0, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }}
            >
              🫥
            </motion.span>
            <p className="mt-4 text-4xl font-extrabold tracking-[-0.04em]">Nothing fits that.</p>
            <p className="mt-2 text-ink/60">Loosen a filter or two. The shop is patient.</p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => useShop.getState().undo()} className="rounded-full border border-ink/20 px-5 py-2.5 text-[14px] hover:border-ink">Undo</button>
              <button type="button" onClick={() => useShop.getState().resetFilters()} className="rounded-full bg-ink px-5 py-2.5 text-[14px] text-paper hover:bg-signal">Reset everything</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
