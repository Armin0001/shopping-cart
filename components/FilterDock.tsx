"use client";

import { AnimatePresence, motion } from "motion/react";
import { PRODUCTS } from "@/lib/data";
import { hasActiveFilters } from "@/lib/filters";
import { cn, useFiltered, useMounted } from "@/lib/hooks";
import { usePrefs, useShop } from "@/lib/store";
import { ActiveChips, AnimatedNumber } from "./bits";
import { FilterPanel } from "./FilterPanel";

/** The always-there filter bar. Collapsed it's a status pill; open it's the full panel. */
export function FilterDock() {
  const open = useShop((s) => s.dockOpen);
  const setOpen = useShop((s) => s.setDockOpen);
  const filters = useShop((s) => s.filters);
  const canUndo = useShop((s) => s.past.length > 0);
  const count = useFiltered().length;
  const mode = usePrefs((s) => s.mode);
  const setMode = usePrefs((s) => s.setMode);
  const mounted = useMounted();
  const active = hasActiveFilters(filters);

  return (
    <div data-summon-ui className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        style={{ borderRadius: open ? 28 : 999 }}
        className={cn(
          "pointer-events-auto overflow-hidden shadow-[0_24px_60px_-18px_rgba(20,20,20,.5)]",
          open ? "flex max-h-[78vh] w-[min(760px,96vw)] flex-col bg-paper ring-1 ring-ink/10" : "bg-ink text-paper",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {open ? (
            <motion.div
              key="panel"
              layout="position"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <FilterPanel wide onDone={() => setOpen(false)} className="min-h-0 flex-1" />
            </motion.div>
          ) : (
            <motion.div
              key="pill"
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              className="flex h-14 items-center gap-2 pl-2 pr-2"
            >
              <span className="grid h-10 min-w-10 place-items-center rounded-full bg-acid px-3 text-[14px] font-bold text-ink">
                <AnimatedNumber value={count} />
              </span>
              <span className="hidden pr-1 text-[13px] text-paper/60 sm:inline">of {PRODUCTS.length}</span>

              {active ? (
                <ActiveChips dark max={3} className="max-w-[44vw] flex-nowrap overflow-hidden" />
              ) : (
                <span className="hidden whitespace-nowrap px-1 text-[13px] text-paper/70 md:inline">
                  <span className="text-acid">Right-click</span> anywhere to filter
                </span>
              )}

              <AnimatePresence initial={false}>
                {canUndo && (
                  <motion.button
                    type="button"
                    initial={{ scale: 0, width: 0 }}
                    animate={{ scale: 1, width: 40 }}
                    exit={{ scale: 0, width: 0 }}
                    onClick={() => useShop.getState().undo()}
                    aria-label="Undo filter change"
                    title="Undo (Z)"
                    className="grid h-10 shrink-0 place-items-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper"
                  >
                    ↶
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="relative ml-1 hidden h-10 items-center rounded-full bg-paper/10 p-1 text-[12px] sm:flex" role="radiogroup" aria-label="Right-click mode">
                {(["smart", "full"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mounted && mode === m}
                    onClick={() => {
                      setMode(m);
                      useShop.getState().toast(m === "smart" ? "Right-click → Smart ring" : "Right-click → Full filters", "Shift+right-click gives you the other one");
                    }}
                    className="relative h-8 rounded-full px-3 font-medium"
                    title={m === "smart" ? "Quick, context-aware radial filters" : "Every filter, at your cursor"}
                  >
                    {mounted && mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-paper" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                    <span className={cn("relative", mounted && mode === m ? "text-ink" : "text-paper/70")}>{m === "smart" ? "✦ Smart" : "☰ Full"}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full bg-paper px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-acid"
              >
                All filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
