"use client";

import {
  AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity,
  type MotionValue,
} from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { CATEGORY_BY_ID, type Product } from "@/lib/data";
import { useAddToCart, useFiltered } from "@/lib/hooks";
import { useShop } from "@/lib/store";
import { ProductArt } from "./ProductArt";
import { Badges, Price } from "./ProductCard";

export function Runway() {
  const drops = useFiltered().filter((p) => p.drop);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);
  const vw = useMotionValue(1200);

  // Height is written straight to the DOM (not React state) so it is already
  // correct when ScrollAnchor measures in the same commit.
  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      vw.set(window.innerWidth);
      dist.set(d);
      if (section.current) section.current.style.height = `calc(${d}px + 100vh)`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [drops.length, vw, dist]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * dist.get());
  const velocity = useVelocity(x);
  const skew = useSpring(useTransform(velocity, [-2500, 2500], [7, -7], { clamp: true }), { stiffness: 300, damping: 40 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(drops.length - 1, Math.max(0, Math.round(v * (drops.length + 1) - 0.6))));
  });

  return (
    <section
      ref={section}
      id="drop"
      data-section="The Drop"
      className="relative h-screen bg-ink text-paper"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-5 top-24 z-10 flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50 md:inset-x-10">
          <span>The Drop — this week only</span>
          <span className="tabular-nums">
            <span className="text-paper">{String(drops.length ? active + 1 : 0).padStart(2, "0")}</span> / {String(drops.length).padStart(2, "0")}
          </span>
        </div>

        <motion.div ref={track} style={{ x, skewX: skew }} className="my-auto flex w-max items-center gap-[4vw] px-5 py-16 will-change-transform md:px-10">
          <div className="flex w-[min(78vw,560px)] shrink-0 flex-col justify-center pr-[4vw]">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-acid">Scroll ↓ to travel →</p>
            <h2 className="mt-4 text-[clamp(72px,11vw,180px)] font-extrabold leading-[0.8] tracking-[-0.065em]">
              The <span className="font-serif font-normal italic text-acid">Drop</span>
            </h2>
            <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-paper/60">
              {drops.length} pieces picked for the week. Your filters apply here too — right-click a card for ideas.
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {drops.map((p, i) => (
              <RunwayCard key={p.id} p={p} i={i} x={x} vw={vw} />
            ))}
          </AnimatePresence>

          {drops.length === 0 && (
            <motion.div layout className="flex h-[60vh] w-[min(80vw,520px)] shrink-0 flex-col items-start justify-center rounded-[32px] border border-dashed border-paper/25 p-10">
              <p className="text-4xl font-bold tracking-tight">Nothing in the drop matches.</p>
              <p className="mt-3 text-paper/60">Your filters are stricter than our buyers.</p>
              <button type="button" onClick={() => useShop.getState().resetFilters()} className="mt-6 rounded-full bg-acid px-5 py-2.5 text-ink">
                Reset filters
              </button>
            </motion.div>
          )}

          <div className="flex w-[min(70vw,460px)] shrink-0 flex-col justify-center pl-[4vw]">
            <p className="text-[clamp(44px,6vw,96px)] font-extrabold leading-[0.85] tracking-[-0.06em]">
              That’s the drop.
              <span className="block font-serif font-normal italic text-paper/50">Keep falling ↓</span>
            </p>
          </div>
        </motion.div>

        <div className="absolute inset-x-5 bottom-8 h-px bg-paper/15 md:inset-x-10">
          <motion.div className="h-full origin-left bg-acid" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}

function RunwayCard({ p, i, x, vw }: { p: Product; i: number; x: MotionValue<number>; vw: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null);
  const center = useMotionValue(0);
  const addToCart = useAddToCart();
  const artRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => center.set(el.offsetLeft + el.offsetWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, [center]);

  // -1 … 1: where this card sits across the viewport
  const d = useTransform([x, center, vw], ([xv, c, w]: number[]) => Math.max(-1.4, Math.min(1.4, (c + xv - w / 2) / w)));
  const rotate = useTransform(d, (v) => v * 9);
  const y = useTransform(d, (v) => v * v * 90);
  const scale = useTransform(d, (v) => 1 - Math.min(0.16, Math.abs(v) * 0.14));

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      data-summon-product={p.id}
      data-cursor="View"
      className="group relative shrink-0"
    >
      <motion.div style={{ rotate, y, scale }} className="relative h-[min(70vh,640px)] w-[clamp(280px,30vw,480px)]">
        <div ref={artRef} className="absolute inset-0">
          <ProductArt kind={p.kind} color={p.colors[0]} layoutId={`art-drop-${p.id}`} className="absolute inset-0" radius={34} float />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 text-ink">
          <span className="font-mono text-[12px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          <Badges p={p} />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-5 text-ink">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">{p.brand} · {CATEGORY_BY_ID[p.category].name}</p>
            <h3 className="text-[clamp(24px,2.4vw,36px)] font-extrabold leading-[0.95] tracking-[-0.04em]">{p.name}</h3>
            <Price p={p} className="mt-1 block text-[14px]" />
          </div>
          <button
            type="button"
            data-cursor="Add"
            onClick={() => addToCart(p, { from: artRef.current })}
            className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-transform hover:scale-105 hover:bg-acid hover:text-ink"
          >
            Add +
          </button>
        </div>
        <button
          type="button"
          aria-label={`Open ${p.name}`}
          onClick={() => useShop.getState().openProduct(p.id, `drop-${p.id}`)}
          className="absolute inset-0 z-10 rounded-[34px]"
        />
      </motion.div>
    </motion.article>
  );
}
