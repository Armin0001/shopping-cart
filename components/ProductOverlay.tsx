"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_BY_ID, COLORS, KIND_NAMES, PRODUCTS, PRODUCT_BY_ID, VIBES, money, type ColorId, type Product } from "@/lib/data";
import { cn, defaultSize, useAddToCart, useFiltered } from "@/lib/hooks";
import { scrollToTarget, useScrollLock } from "@/lib/scroll";
import { useShop } from "@/lib/store";
import { ProductArt } from "./ProductArt";
import { Badges } from "./ProductCard";
import { Glyph } from "./Glyph";

export function ProductOverlay() {
  const current = useShop((s) => s.product);
  useScrollLock(!!current);
  return (
    <AnimatePresence>
      {current && PRODUCT_BY_ID[current.id] && (
        <Overlay key="overlay" p={PRODUCT_BY_ID[current.id]} layoutKey={current.layoutKey} initialColor={current.color} />
      )}
    </AnimatePresence>
  );
}

function Overlay({ p, layoutKey, initialColor }: { p: Product; layoutKey: string; initialColor?: ColorId }) {
  const close = useShop((s) => s.closeProduct);
  const open = useShop((s) => s.openProduct);
  const list = useFiltered();
  const idx = list.findIndex((x) => x.id === p.id);
  const [dir, setDir] = useState(1);

  const go = (step: number) => {
    const pool = list.length ? list : PRODUCTS;
    const i = idx === -1 ? 0 : (idx + step + pool.length) % pool.length;
    setDir(step);
    open(pool[i].id, `ov-${pool[i].id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={p.name}>
      <motion.div
        className="absolute inset-0 bg-ink/45 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        className="absolute inset-2 overflow-hidden rounded-[34px] bg-paper shadow-2xl md:inset-5"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.22 } }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <Detail key={p.id} p={p} layoutKey={layoutKey} initialColor={initialColor} dir={dir} />
        </AnimatePresence>

        <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-ink/45 md:inline">
            {idx >= 0 ? `${idx + 1} / ${list.length}` : "—"} · ← →
          </span>
          <button type="button" onClick={() => go(-1)} aria-label="Previous product" className="grid size-10 place-items-center rounded-full bg-paper/80 ring-1 ring-ink/10 backdrop-blur hover:bg-ink hover:text-paper">←</button>
          <button type="button" onClick={() => go(1)} aria-label="Next product" className="grid size-10 place-items-center rounded-full bg-paper/80 ring-1 ring-ink/10 backdrop-blur hover:bg-ink hover:text-paper">→</button>
          <button type="button" onClick={close} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-ink text-paper hover:rotate-90 hover:bg-signal transition-transform">✕</button>
        </div>
      </motion.div>
    </div>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 30 } },
};

function Detail({ p, layoutKey, initialColor, dir }: { p: Product; layoutKey: string; initialColor?: ColorId; dir: number }) {
  const [color, setColor] = useState<ColorId>(initialColor && p.colors.includes(initialColor) ? initialColor : p.colors[0]);
  const [size, setSize] = useState(defaultSize(p));
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const artRef = useRef<HTMLDivElement>(null);
  const setFilters = useShop((s) => s.setFilters);
  const closeProduct = useShop((s) => s.closeProduct);
  const setCheckoutOpen = useShop((s) => s.setCheckoutOpen);
  const similar = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
  const vibe = VIBES.find((v) => v.id === p.vibe)!.name;

  const moreLikeThis = () => {
    setFilters((f) => ({ ...f, categories: [p.category], vibes: [p.vibe] }));
    closeProduct();
    setTimeout(() => scrollToTarget("#floor"), 350);
  };

  return (
    <motion.div
      custom={dir}
      initial={{ x: `${dir * 30}%`, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: `${dir * -30}%`, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="grid h-full grid-cols-1 md:grid-cols-[1.15fr_1fr]"
    >
      <div ref={artRef} className="relative min-h-[42vh] p-3 md:p-4">
        <ProductArt kind={p.kind} color={color} layoutId={`art-${layoutKey}`} className="group h-full w-full" radius={28} float glyphClassName="scale-[0.92]" />
        <div className="pointer-events-none absolute bottom-8 left-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {KIND_NAMES[p.kind]} · {COLORS[color].name}
        </div>
      </div>

      <div data-lenis-prevent className="relative overflow-y-auto px-6 pb-10 pt-6 md:px-10 md:pt-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={rise} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">
            <span>{p.brand}</span>
            <span>·</span>
            <span>{CATEGORY_BY_ID[p.category].name}</span>
            <span>·</span>
            <span>{vibe}</span>
          </motion.div>
          <motion.h2 variants={rise} className="mt-3 text-[clamp(40px,5vw,76px)] font-extrabold leading-[0.88] tracking-[-0.055em]">
            {p.name}
          </motion.h2>
          <motion.div variants={rise} className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl tabular-nums">{money(p.price)}</span>
            {p.compareAt && <s className="font-mono text-ink/40">{money(p.compareAt)}</s>}
            <Badges p={p} />
            <span className="ml-auto font-mono text-[12px] text-ink/60">★ {p.rating.toFixed(1)} · {p.reviews.toLocaleString("en-US")} reviews</span>
          </motion.div>
          <motion.p variants={rise} className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink/75">{p.blurb}</motion.p>

          <motion.div variants={rise} className="mt-7">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">Colour — {COLORS[color].name}</p>
            <div className="flex gap-2.5">
              {p.colors.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c)}
                  aria-label={COLORS[c].name}
                  className={cn("relative size-10 rounded-full border border-ink/20", c === color && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}
                  style={{ background: COLORS[c].hex }}
                />
              ))}
            </div>
          </motion.div>

          {p.sizes && (
            <motion.div variants={rise} className="mt-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn("relative h-10 min-w-12 rounded-full border px-3 text-[13px] font-medium", s === size ? "border-ink text-paper" : "border-ink/15 hover:border-ink/50")}
                  >
                    {s === size && <motion.span layoutId={`size-${p.id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                    <span className="relative">{s}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-2">
            <div className="flex h-14 items-center rounded-full border border-ink/15">
              <button type="button" aria-label="Less" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-14 place-items-center text-xl">−</button>
              <span className="w-6 text-center font-mono tabular-nums">{qty}</span>
              <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(9, q + 1))} className="grid size-14 place-items-center text-xl">+</button>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => addToCart(p, { color, size, qty, from: artRef.current })}
              className="h-14 flex-1 rounded-full bg-ink px-8 text-[15px] font-semibold text-paper transition-colors hover:bg-signal"
            >
              Add to bag — {money(p.price * qty)}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                addToCart(p, { color, size, qty });
                closeProduct();
                setCheckoutOpen(true);
              }}
              className="h-14 rounded-full border border-ink px-6 text-[14px] font-medium hover:bg-acid"
            >
              Buy now
            </button>
          </motion.div>
          <motion.p variants={rise} className="mt-3 font-mono text-[11px] text-ink/45">
            Preview store · no payment is ever taken · free imaginary shipping
          </motion.p>

          <motion.div variants={rise} className="mt-10 border-t border-ink/10 pt-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">From the same aisle</p>
              <button type="button" onClick={moreLikeThis} className="text-[13px] font-medium underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
                Filter the store to things like this →
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {similar.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => useShop.getState().openProduct(s.id, `ov-${s.id}`)}
                  className="group text-left"
                >
                  <div className="tile-bg aspect-square overflow-hidden rounded-2xl p-2 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-[1.04]" style={{ ["--c" as string]: COLORS[s.colors[0]].hex }}>
                    <Glyph kind={s.kind} color={COLORS[s.colors[0]].hex} className="h-full w-full" shadow={false} />
                  </div>
                  <p className="mt-1.5 truncate text-[12px] font-semibold">{s.name}</p>
                  <p className="font-mono text-[11px] text-ink/50">{money(s.price)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
