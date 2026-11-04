"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { CATEGORIES, CATEGORY_BY_ID, PRODUCTS, type CategoryId } from "@/lib/data";
import { cn } from "@/lib/hooks";
import { scrollToTarget } from "@/lib/scroll";
import { useCart, useShop } from "@/lib/store";
import { ProductArt } from "./ProductArt";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 text-[26px] font-extrabold leading-none tracking-[-0.06em]", className)}>
      drift
      <motion.span
        className="inline-block text-signal"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        ✦
      </motion.span>
    </span>
  );
}

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hover, setHover] = useState<CategoryId | null>(null);
  const [dir, setDir] = useState(1);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { scrollY } = useScroll();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const pulse = useShop((s) => s.cartPulse);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setSearchOpen = useShop((s) => s.setSearchOpen);
  const setFilters = useShop((s) => s.setFilters);
  const flying = useShop((s) => s.flights.length > 0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    if (hover) return;
    setHidden(y > 200 && y > prev + 2 ? true : y < prev - 2 ? false : hidden);
  });

  const enter = (id: CategoryId) => {
    clearTimeout(closeTimer.current);
    if (hover) {
      const a = CATEGORIES.findIndex((c) => c.id === hover);
      const b = CATEGORIES.findIndex((c) => c.id === id);
      setDir(b >= a ? 1 : -1);
    }
    setHover(id);
  };
  const leave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHover(null), 160);
  };

  const cat = hover ? CATEGORY_BY_ID[hover] : null;
  const preview = cat ? PRODUCTS.filter((p) => p.category === cat.id).slice(0, 4) : [];

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40"
      animate={{ y: hidden && !flying && !hover ? -96 : 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      onPointerLeave={leave}
    >
      <div
        className={cn(
          "mx-3 mt-3 flex h-14 items-center gap-4 rounded-full px-5 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          solid || hover ? "bg-paper/80 shadow-[0_1px_0_rgba(20,20,20,.08),0_10px_30px_-12px_rgba(20,20,20,.25)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <button type="button" onClick={() => scrollToTarget(0)} aria-label="Back to top" data-cursor="Top">
          <Logo />
        </button>

        <nav className="no-scrollbar mx-auto hidden items-center gap-1 overflow-x-auto md:flex" aria-label="Categories">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onPointerEnter={() => enter(c.id)}
              onFocus={() => enter(c.id)}
              onClick={() => {
                setHover(null);
                scrollToTarget(`#aisle-${c.id}`);
              }}
              data-cursor="Go"
              className="relative rounded-full px-4 py-2 text-[14px] font-medium tracking-tight"
            >
              {hover === c.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
              <span className={cn("relative flex items-baseline gap-1.5 transition-colors", hover === c.id && "text-paper")}>
                <span className="font-mono text-[9px] opacity-50">0{i + 1}</span>
                {c.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            data-cursor="Search"
            className="group flex h-10 items-center gap-2 rounded-full border border-ink/15 pl-3.5 pr-2 text-[13px] transition-colors hover:border-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className="hidden text-ink/60 lg:inline">Search or describe…</span>
            <kbd className="rounded-full bg-ink/8 px-2 py-0.5 font-mono text-[11px] text-ink/60">/</kbd>
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            data-cursor="Bag"
            id="cart-button"
            className="relative flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-1.5 text-[13px] font-medium text-paper"
          >
            Bag
            <motion.span
              key={pulse}
              initial={{ scale: pulse ? 1.6 : 1, rotate: pulse ? -20 : 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="grid h-7 min-w-7 place-items-center rounded-full bg-acid px-1.5 font-mono text-[12px] text-ink"
            >
              {count}
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {cat && (
          <motion.div
            onPointerEnter={() => clearTimeout(closeTimer.current)}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="mx-auto mt-2 w-[min(980px,calc(100%-24px))] origin-top overflow-hidden rounded-[28px] bg-paper/90 p-3 shadow-[0_30px_60px_-20px_rgba(20,20,20,.35)] ring-1 ring-ink/10 backdrop-blur-xl"
          >
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={cat.id}
                custom={dir}
                initial={{ x: dir * 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: dir * -60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 36 }}
                className="flex gap-3"
              >
                <div className="flex w-56 shrink-0 flex-col justify-between rounded-[20px] bg-ink p-5 text-paper">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">Aisle {String(CATEGORIES.indexOf(cat) + 1).padStart(2, "0")}</p>
                    <p className="mt-1 text-4xl font-extrabold tracking-[-0.05em]">{cat.name}</p>
                    <p className="mt-2 font-serif text-lg italic leading-snug text-paper/70">{cat.blurb}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5 text-[13px]">
                    <button type="button" className="rounded-full bg-acid px-3 py-2 font-medium text-ink transition-transform hover:scale-[1.03]" onClick={() => { setHover(null); scrollToTarget(`#aisle-${cat.id}`); }}>
                      Walk the aisle →
                    </button>
                    <button type="button" className="rounded-full border border-paper/25 px-3 py-2 transition-colors hover:bg-paper hover:text-ink" onClick={() => { setHover(null); setFilters((f) => ({ ...f, categories: [cat.id] })); scrollToTarget("#floor"); }}>
                      Only show {cat.name}
                    </button>
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-4 gap-3">
                  {preview.map((p, i) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.04 * i, type: "spring", stiffness: 400, damping: 30 }}
                      onClick={() => { setHover(null); useShop.getState().openProduct(p.id, `nav-${p.id}`); }}
                      className="group text-left"
                      data-cursor="View"
                    >
                      <ProductArt kind={p.kind} color={p.colors[0]} layoutId={`art-nav-${p.id}`} className="aspect-square" radius={18} />
                      <p className="mt-2 truncate text-[13px] font-semibold tracking-tight">{p.name}</p>
                      <p className="font-mono text-[11px] text-ink/50">${p.price}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
