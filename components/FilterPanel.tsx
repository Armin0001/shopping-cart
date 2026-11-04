"use client";

import { motion } from "motion/react";
import { CATEGORIES, COLORS, COLOR_IDS, PRICE_CEIL, PRODUCTS, TAGS, VIBES } from "@/lib/data";
import { SORTS, applyFilters, hasActiveFilters, type Filters } from "@/lib/filters";
import { cn } from "@/lib/hooks";
import { useShop } from "@/lib/store";
import { AnimatedNumber } from "./bits";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const PRICE_PRESETS: { label: string; range: [number, number] }[] = [
  { label: "< $50", range: [0, 50] },
  { label: "$50–150", range: [50, 150] },
  { label: "$150–300", range: [150, 300] },
  { label: "$300+", range: [300, PRICE_CEIL] },
];

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">{title}</p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        on ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink/50",
      )}
    >
      {children}
    </motion.button>
  );
}

export function FilterPanel({ onDone, wide = false, className }: { onDone?: () => void; wide?: boolean; className?: string }) {
  const filters = useShop((s) => s.filters);
  const setFilters = useShop((s) => s.setFilters);
  const past = useShop((s) => s.past.length);
  const count = applyFilters(PRODUCTS, filters).length;
  const set = (fn: (f: Filters) => Filters) => setFilters(fn);
  const [lo, hi] = filters.price;

  return (
    <div className={cn("flex max-h-[inherit] flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-ink/10 px-4 pb-3 pt-4">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Filter by words…"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink/35"
          autoFocus={!wide}
        />
        {onDone && (
          <button type="button" onClick={onDone} aria-label="Close filters" className="grid size-7 shrink-0 place-items-center rounded-full bg-ink/6 text-[12px] hover:bg-ink hover:text-paper">✕</button>
        )}
      </div>

      <div data-lenis-prevent className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-4", wide && "grid gap-x-8 md:grid-cols-2")}>
        <div>
          <Section title="Aisles">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Pill key={c.id} on={filters.categories.includes(c.id)} onClick={() => set((f) => ({ ...f, categories: toggle(f.categories, c.id) }))}>
                  {c.name}
                </Pill>
              ))}
            </div>
          </Section>

          <Section title="Price" aside={<span className="font-mono text-[11px] tabular-nums">${lo} – ${hi}{hi >= PRICE_CEIL ? "+" : ""}</span>}>
            <div className="dual-range relative h-6">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/10" />
              <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${(lo / PRICE_CEIL) * 100}%`, right: `${100 - (hi / PRICE_CEIL) * 100}%` }} />
              <input
                type="range" min={0} max={PRICE_CEIL} step={5} value={lo} aria-label="Minimum price"
                onChange={(e) => setFilters((f) => ({ ...f, price: [Math.min(Number(e.target.value), f.price[1] - 5), f.price[1]] }))}
              />
              <input
                type="range" min={0} max={PRICE_CEIL} step={5} value={hi} aria-label="Maximum price"
                onChange={(e) => setFilters((f) => ({ ...f, price: [f.price[0], Math.max(Number(e.target.value), f.price[0] + 5)] }))}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((p) => (
                <Pill key={p.label} on={lo === p.range[0] && hi === p.range[1]} onClick={() => set((f) => ({ ...f, price: lo === p.range[0] && hi === p.range[1] ? [0, PRICE_CEIL] : p.range }))}>
                  {p.label}
                </Pill>
              ))}
            </div>
          </Section>

          <Section title="Colour">
            <div className="flex flex-wrap gap-2">
              {COLOR_IDS.map((c) => {
                const on = filters.colors.includes(c);
                return (
                  <motion.button
                    key={c}
                    type="button"
                    title={COLORS[c].name}
                    aria-label={COLORS[c].name}
                    aria-pressed={on}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => set((f) => ({ ...f, colors: toggle(f.colors, c) }))}
                    className={cn("relative size-7 rounded-full border border-ink/20", on && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}
                    style={{ background: COLORS[c].hex }}
                  >
                    {on && <span className="absolute inset-0 grid place-items-center text-[11px] mix-blend-difference text-white">✓</span>}
                  </motion.button>
                );
              })}
            </div>
          </Section>
        </div>

        <div>
          <Section title="Vibe">
            <div className="flex flex-wrap gap-1.5">
              {VIBES.map((v) => (
                <Pill key={v.id} on={filters.vibes.includes(v.id)} onClick={() => set((f) => ({ ...f, vibes: toggle(f.vibes, v.id) }))}>
                  {v.name}
                </Pill>
              ))}
            </div>
          </Section>

          <Section title="Only show">
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <Pill key={t.id} on={filters.tags.includes(t.id)} onClick={() => set((f) => ({ ...f, tags: toggle(f.tags, t.id) }))}>
                  {t.name}
                </Pill>
              ))}
            </div>
          </Section>

          <Section title="Rating">
            <div className="flex gap-1.5">
              {[0, 4, 4.5].map((r) => (
                <Pill key={r} on={filters.minRating === r} onClick={() => set((f) => ({ ...f, minRating: r }))}>
                  {r === 0 ? "Any" : `${r}★ +`}
                </Pill>
              ))}
            </div>
          </Section>

          <Section title="Sort">
            <div className="flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <Pill key={s.id} on={filters.sort === s.id} onClick={() => set((f) => ({ ...f, sort: s.id }))}>
                  {s.name}
                </Pill>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-ink/10 px-4 py-3">
        <p className="text-[14px] font-semibold">
          <AnimatedNumber value={count} /> <span className="font-normal text-ink/45">items</span>
        </p>
        <div className="ml-auto flex gap-1.5">
          <button type="button" disabled={!past} onClick={() => useShop.getState().undo()} className="rounded-full px-3 py-1.5 text-[12.5px] text-ink/60 hover:text-ink disabled:opacity-30">
            Undo
          </button>
          <button type="button" disabled={!hasActiveFilters(filters)} onClick={() => useShop.getState().resetFilters()} className="rounded-full border border-ink/15 px-3 py-1.5 text-[12.5px] hover:border-ink disabled:opacity-30">
            Reset
          </button>
          {onDone && (
            <button type="button" onClick={onDone} className="rounded-full bg-ink px-4 py-1.5 text-[12.5px] font-medium text-paper hover:bg-signal">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
