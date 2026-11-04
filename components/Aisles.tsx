"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef } from "react";
import { CATEGORIES, COLORS, PRODUCTS, type Category } from "@/lib/data";
import { cn, useFiltered } from "@/lib/hooks";
import { scrollToTarget } from "@/lib/scroll";
import { useShop } from "@/lib/store";
import { ProductCard } from "./ProductCard";

export function Aisles() {
  const filtered = useFiltered();
  return (
    <div id="aisles" className="relative py-24">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 px-5 md:px-10">
        <h2 className="text-[clamp(52px,8vw,128px)] font-extrabold leading-[0.82] tracking-[-0.06em]">
          The <span className="font-serif font-normal italic">aisles</span>
        </h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink/60">
          Down changes aisle. Sideways wanders it — drag, shift-scroll, or swipe. Right-click an aisle’s heading for aisle-only tricks.
        </p>
      </div>
      {CATEGORIES.map((c, i) => (
        <Aisle key={c.id} c={c} index={i} items={filtered.filter((p) => p.category === c.id)} />
      ))}
    </div>
  );
}

function Aisle({ c, index, items }: { c: Category; index: number; items: typeof PRODUCTS }) {
  const track = useRef<HTMLDivElement>(null);
  const total = PRODUCTS.filter((p) => p.category === c.id).length;
  const { scrollXProgress, scrollX } = useScroll({ container: track });
  const v = useVelocity(scrollX);
  const skew = useSpring(useTransform(v, [-3000, 3000], [6, -6], { clamp: true }), { stiffness: 260, damping: 30 });
  const titleX = useTransform(scrollXProgress, [0, 1], ["0%", "-18%"]);
  useDragScroll(track);

  const nudge = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <section
      id={`aisle-${c.id}`}
      data-section={c.name}
      data-summon-category={c.id}
      className="relative border-t border-ink/10 py-10"
    >
      <div className="relative flex items-end justify-between gap-4 overflow-hidden px-5 md:px-10">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            <span className="size-2 rounded-full" style={{ background: COLORS[c.color].hex }} />
            Aisle {String(index + 1).padStart(2, "0")} · {items.length}/{total} showing
          </p>
          <motion.h3
            style={{ x: titleX }}
            initial={{ y: "60%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="whitespace-nowrap text-[clamp(56px,9vw,150px)] font-extrabold leading-[0.85] tracking-[-0.065em]"
          >
            {c.name}
            <span className="ml-4 font-serif text-[0.32em] font-normal italic tracking-normal text-ink/50">{c.blurb}</span>
          </motion.h3>
        </div>
        <div className="mb-3 hidden shrink-0 items-center gap-2 md:flex">
          <button type="button" aria-label="Scroll left" onClick={() => nudge(-1)} className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper">←</button>
          <button type="button" aria-label="Scroll right" onClick={() => nudge(1)} className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper">→</button>
          <button
            type="button"
            onClick={() => {
              useShop.getState().setFilters((f) => ({ ...f, categories: [c.id] }));
              scrollToTarget("#floor");
            }}
            className="ml-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-acid hover:text-ink"
          >
            Only {c.name} →
          </button>
        </div>
      </div>

      <motion.div
        ref={track}
        layoutScroll
        data-lenis-prevent-horizontal
        data-cursor="Drag"
        className="no-scrollbar relative mt-6 overflow-x-auto overscroll-x-contain"
      >
        <motion.div style={{ skewX: skew }} className="flex w-max gap-5 px-5 pb-4 md:px-10">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="w-[clamp(220px,22vw,300px)] shrink-0"
              >
                <ProductCard p={p} layoutKey={`aisle-${p.id}`} />
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-40 w-[min(90vw,640px)] items-center gap-4 rounded-[22px] border border-dashed border-ink/20 px-8 text-ink/60"
            >
              <span className="text-3xl">∅</span>
              <span>
                Your filters emptied this aisle.{" "}
                <button type="button" className="underline decoration-ink/30 underline-offset-4 hover:text-ink" onClick={() => useShop.getState().undo()}>
                  Undo last change
                </button>
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      <div className={cn("mx-5 mt-2 h-[3px] overflow-hidden rounded-full bg-ink/8 md:mx-10", items.length < 4 && "opacity-0")}>
        <motion.div className="h-full origin-left rounded-full bg-ink" style={{ scaleX: scrollXProgress }} />
      </div>
    </section>
  );
}

/** Click-and-drag horizontal scrolling with momentum, for mice. */
function useDragScroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let moved = 0;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let raf = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      moved = 0;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) {
        el.scrollLeft = startLeft - dx;
        el.dataset.dragging = "true";
      }
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      let v = vel * 16;
      const glide = () => {
        if (Math.abs(v) < 0.4) {
          delete el.dataset.dragging;
          return;
        }
        el.scrollLeft -= v;
        v *= 0.94;
        raf = requestAnimationFrame(glide);
      };
      glide();
    };
    // A drag should never count as a click on the card underneath.
    const onClick = (e: MouseEvent) => {
      if (moved > 4) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}
