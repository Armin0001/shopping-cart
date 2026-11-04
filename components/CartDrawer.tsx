"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { COLORS, PRODUCT_BY_ID, money } from "@/lib/data";
import { useMounted } from "@/lib/hooks";
import { useScrollLock } from "@/lib/scroll";
import { useCart, useShop } from "@/lib/store";
import { AnimatedNumber } from "./bits";
import { Glyph } from "./Glyph";

export const FREE_SHIPPING = 150;

export function useCartTotals() {
  const lines = useCart((s) => s.lines);
  const items = lines.map((l) => ({ ...l, p: PRODUCT_BY_ID[l.id] })).filter((l) => l.p);
  const subtotal = items.reduce((n, l) => n + l.p.price * l.qty, 0);
  const savings = items.reduce((n, l) => n + ((l.p.compareAt ?? l.p.price) - l.p.price) * l.qty, 0);
  return { items, subtotal, savings, count: items.reduce((n, l) => n + l.qty, 0) };
}

export function CartDrawer() {
  const open = useShop((s) => s.cartOpen);
  const setOpen = useShop((s) => s.setCartOpen);
  const setCheckoutOpen = useShop((s) => s.setCheckoutOpen);
  const { setQty, remove } = useCart.getState();
  const { items, subtotal, savings, count } = useCartTotals();
  const mounted = useMounted();
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const toFree = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <AnimatePresence>
      {open && mounted && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            className="absolute bottom-2 right-2 top-2 flex w-[min(460px,calc(100vw-16px))] flex-col overflow-hidden rounded-[30px] bg-paper shadow-2xl"
            initial={{ x: "110%", rotate: 4 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: "110%", rotate: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
          >
            <header className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 className="text-4xl font-extrabold tracking-[-0.05em]">
                Bag <span className="font-serif text-3xl font-normal italic text-ink/40">({count})</span>
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="grid size-10 place-items-center rounded-full bg-ink/6 transition-transform hover:rotate-90 hover:bg-ink hover:text-paper">✕</button>
            </header>

            {items.length > 0 && (
              <div className="mx-6 mb-2 rounded-2xl bg-ink/5 p-3">
                <p className="text-[12.5px]">{toFree > 0 ? <>Add <b>{money(toFree)}</b> more for free (imaginary) shipping</> : <>You’ve unlocked free imaginary shipping ✦</>}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.div className="h-full rounded-full bg-ink" initial={false} animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%`, backgroundColor: toFree > 0 ? "#141414" : "#ff4f1f" }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                </div>
              </div>
            )}

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-4">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((l) => (
                  <motion.div
                    key={l.key}
                    layout
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0.6, right: 0.1 }}
                    onDragEnd={(_, info) => info.offset.x < -120 && remove(l.key)}
                    className="flex cursor-grab items-center gap-4 rounded-2xl p-2 active:cursor-grabbing"
                  >
                    <div className="tile-bg size-20 shrink-0 overflow-hidden rounded-2xl p-1.5" style={{ ["--c" as string]: COLORS[l.color].hex }}>
                      <Glyph kind={l.p.kind} color={COLORS[l.color].hex} className="h-full w-full" shadow={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold tracking-tight">{l.p.name}</p>
                      <p className="font-mono text-[11px] text-ink/50">{[COLORS[l.color].name, l.size].filter(Boolean).join(" · ")}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <button type="button" aria-label="Less" onClick={() => setQty(l.key, l.qty - 1)} className="grid size-7 place-items-center rounded-full border border-ink/15 text-sm hover:border-ink">−</button>
                        <span className="w-6 text-center font-mono text-[13px] tabular-nums">{l.qty}</span>
                        <button type="button" aria-label="More" onClick={() => setQty(l.key, l.qty + 1)} className="grid size-7 place-items-center rounded-full border border-ink/15 text-sm hover:border-ink">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[14px] tabular-nums">{money(l.p.price * l.qty)}</p>
                      <button type="button" onClick={() => remove(l.key)} className="mt-1 text-[11px] text-ink/40 hover:text-signal">Remove</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center pb-16 text-center">
                  <motion.div animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-32">
                    <Glyph kind="tote" color="#d9ff42" className="h-auto w-full" />
                  </motion.div>
                  <p className="mt-4 text-2xl font-bold tracking-tight">Light as air.</p>
                  <p className="mt-1 max-w-[260px] text-[14px] text-ink/55">Hit the + on anything you like. It’ll fly in here.</p>
                  <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-ink px-5 py-2.5 text-[14px] text-paper hover:bg-signal">Keep drifting</button>
                </motion.div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-ink/10 px-6 pb-6 pt-4">
                {items.length > 1 && <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink/40">Tip: swipe an item left to remove it</p>}
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="font-mono text-2xl font-medium">$<AnimatedNumber value={subtotal} /></span>
                </div>
                {savings > 0 && <p className="mt-1 text-right font-mono text-[12px] text-signal">You saved {money(savings)}</p>}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="mt-4 h-14 w-full rounded-full bg-ink text-[15px] font-semibold text-paper transition-colors hover:bg-signal"
                >
                  Check out (preview — nothing is charged)
                </motion.button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
