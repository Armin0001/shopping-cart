"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { COLORS, PRODUCTS, money } from "@/lib/data";
import { DEFAULT_FILTERS, applyFilters, parseQuery, type Filters } from "@/lib/filters";
import { scrollToTarget, useScrollLock } from "@/lib/scroll";
import { useShop } from "@/lib/store";
import { Glyph } from "./Glyph";

const IDEAS = ["cozy lamps under 100", "blue tech", "bold wear on sale", "new sound", "minimal under 50", "retro play", "top rated living", "green carry"];

export function SearchOverlay() {
  const open = useShop((s) => s.searchOpen);
  useScrollLock(open);
  return <AnimatePresence>{open && <Search key="search" />}</AnimatePresence>;
}

function Search() {
  const setOpen = useShop((s) => s.setSearchOpen);
  const [text, setText] = useState("");
  const parsed = useMemo(() => parseQuery(text), [text]);
  const next: Filters = useMemo(
    () => ({ ...DEFAULT_FILTERS, sort: useShop.getState().filters.sort, ...parsed.patch, q: parsed.rest }),
    [parsed],
  );
  const results = useMemo(() => (text.trim() ? applyFilters(PRODUCTS, next) : []), [text, next]);

  const commit = () => {
    if (!text.trim()) return;
    useShop.getState().setFilters(next);
    useShop.getState().toast(`Showing ${results.length} for “${text.trim()}”`, parsed.understood.length ? `Understood: ${parsed.understood.join(" · ")}` : undefined);
    setOpen(false);
    setTimeout(() => scrollToTarget("#floor"), 300);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <motion.div
        className="absolute inset-0 bg-paper/90 backdrop-blur-2xl"
        initial={{ clipPath: "circle(0% at 85% 3%)" }}
        animate={{ clipPath: "circle(150% at 85% 3%)" }}
        exit={{ clipPath: "circle(0% at 85% 3%)", transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] } }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setOpen(false)}
      />
      <motion.div
        className="relative mx-auto flex h-full max-w-6xl flex-col px-5 pt-[12vh] md:px-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.15 } }}
      >
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          <span>Search · say it how you’d say it</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-ink/20 px-3 py-1 hover:bg-ink hover:text-paper">Esc</button>
        </div>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="cozy blue things under 80…"
          className="mt-4 w-full border-b-2 border-ink bg-transparent pb-3 text-[clamp(36px,6.5vw,96px)] font-extrabold tracking-[-0.05em] outline-none placeholder:text-ink/15"
        />

        <div className="mt-4 flex min-h-9 flex-wrap items-center gap-2">
          {text.trim() === "" ? (
            <>
              <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-ink/45">Try</span>
              {IDEAS.map((idea, i) => (
                <motion.button
                  key={idea}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  onClick={() => setText(idea)}
                  className="rounded-full border border-ink/15 px-3.5 py-1.5 text-[14px] hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {idea}
                </motion.button>
              ))}
            </>
          ) : (
            <>
              <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-ink/45">Understood</span>
              <AnimatePresence mode="popLayout">
                {parsed.understood.map((u) => (
                  <motion.span key={u} layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="rounded-full bg-acid px-3 py-1 text-[13px] font-semibold">
                    {u}
                  </motion.span>
                ))}
                {parsed.rest && (
                  <motion.span key="rest" layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-ink px-3 py-1 text-[13px] text-paper">
                    “{parsed.rest}”
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="ml-auto font-mono text-[12px] text-ink/60">
                {results.length} match{results.length === 1 ? "" : "es"} · <kbd className="rounded bg-ink px-1.5 py-0.5 text-paper">Enter</kbd> filters the store
              </span>
            </>
          )}
        </div>

        <div data-lenis-prevent className="no-scrollbar -mx-5 mt-8 overflow-x-auto px-5 pb-6 md:-mx-10 md:px-10">
          <div className="flex w-max gap-4">
            <AnimatePresence mode="popLayout">
              {results.slice(0, 14).map((p, i) => {
                const c = COLORS[p.colors.find((x) => next.colors.includes(x)) ?? p.colors[0]].hex;
                return (
                <motion.button
                  key={p.id}
                  layout
                  type="button"
                  initial={{ opacity: 0, y: 40, rotate: 6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, transition: { delay: i * 0.03, type: "spring", stiffness: 300, damping: 26 } }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setOpen(false);
                    useShop.getState().openProduct(p.id, `search-${p.id}`);
                  }}
                  className="group w-48 shrink-0 text-left"
                >
                  <motion.div layoutId={`art-search-${p.id}`} className="tile-bg aspect-[4/5] overflow-hidden rounded-[20px] p-4" style={{ ["--c" as string]: c }}>
                    <Glyph kind={p.kind} color={c} className="h-full w-full transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105" shadow={false} />
                  </motion.div>
                  <p className="mt-2 truncate text-[14px] font-semibold">{p.name}</p>
                  <p className="font-mono text-[11px] text-ink/50">{p.brand} · {money(p.price)}</p>
                </motion.button>
                );
              })}
            </AnimatePresence>
            {text.trim() !== "" && results.length === 0 && (
              <p className="py-10 text-2xl font-semibold text-ink/40">Nothing yet. Try fewer words, or a colour.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
