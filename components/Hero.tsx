"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { COLORS, PRODUCTS, type Product } from "@/lib/data";
import { scrollToTarget } from "@/lib/scroll";
import { useShop } from "@/lib/store";
import { Glyph } from "./Glyph";

const SPOTS = [
  { x: 5, y: 16, s: 12, r: -12, d: 1.2 },
  { x: 79, y: 13, s: 14, r: 10, d: 0.7 },
  { x: 85, y: 56, s: 11, r: -8, d: 1.5 },
  { x: 7, y: 60, s: 13, r: 14, d: 0.9 },
  { x: 63, y: 66, s: 9, r: -18, d: 1.9 },
  { x: 33, y: 13, s: 8, r: 20, d: 2.1 },
  { x: 27, y: 70, s: 9, r: 6, d: 1.4 },
  { x: 58, y: 12, s: 7, r: -6, d: 2.4 },
];

const stickers = PRODUCTS.filter((p) => p.drop).slice(0, SPOTS.length);

function Sticker({ p, i, mx, my, bounds }: { p: Product; i: number; mx: MotionValue<number>; my: MotionValue<number>; bounds: React.RefObject<HTMLElement | null> }) {
  const spot = SPOTS[i];
  const px = useTransform(mx, (v) => v * 50 * spot.d);
  const py = useTransform(my, (v) => v * 36 * spot.d);
  const dragged = useRef(false);
  return (
    <motion.div className="absolute z-10" style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `clamp(84px, ${spot.s}vw, 230px)`, x: px, y: py }}>
      <motion.button
        type="button"
        aria-label={`Open ${p.name}`}
        data-summon-product={p.id}
        data-cursor="Drag me"
        drag
        dragConstraints={bounds}
        dragElastic={0.25}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
        onDragStart={() => (dragged.current = true)}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          useShop.getState().openProduct(p.id, `hero-${p.id}`);
        }}
        initial={{ scale: 0, rotate: spot.r - 40, opacity: 0 }}
        animate={{ scale: 1, rotate: spot.r, opacity: 1 }}
        whileHover={{ scale: 1.08, rotate: spot.r * -0.4 }}
        whileDrag={{ scale: 1.15, rotate: 0, zIndex: 30 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.5 + i * 0.07 }}
        className="block w-full touch-none [filter:drop-shadow(3px_0_0_#fffdf8)_drop-shadow(-3px_0_0_#fffdf8)_drop-shadow(0_3px_0_#fffdf8)_drop-shadow(0_-3px_0_#fffdf8)_drop-shadow(0_16px_18px_rgba(20,20,20,.2))]"
      >
        <motion.div layoutId={`art-hero-${p.id}`}>
          <div className="animate-float" style={{ animationDelay: `${-i * 0.8}s` }}>
            <Glyph kind={p.kind} color={COLORS[p.colors[0]].hex} className="h-auto w-full" shadow={false} />
          </div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

const words = ["Don’t", "browse."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const mx = useSpring(0, { stiffness: 60, damping: 18 });
  const my = useSpring(0, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const headScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      data-section="Lobby"
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-28 pt-28 md:px-10"
    >
      {stickers.map((p, i) => (
        <Sticker key={p.id} p={p} i={i} mx={mx} my={my} bounds={ref} />
      ))}

      <motion.div style={{ y: headY, scale: headScale, opacity: fade }} className="pointer-events-none relative z-0 my-auto flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-full border border-ink/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60"
        >
          Autumn index · 60 objects · 6 aisles · $0 real money
        </motion.p>
        <h1 className="text-[clamp(64px,13.5vw,230px)] font-extrabold leading-[0.82] tracking-[-0.065em]">
          <span className="flex flex-wrap justify-center gap-x-[0.18em]">
            {words.map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%", rotate: 6 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.12 }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className="inline-block font-serif font-normal italic tracking-[-0.03em] text-signal"
              initial={{ y: "110%", skewX: -12 }}
              animate={{ y: "0%", skewX: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
            >
              Drift.
            </motion.span>
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-ink/70"
        >
          A store with two directions. Scroll down to change aisles, scroll sideways to wander them, and right-click anywhere to bend the whole shop to your mood.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative z-20 mt-10 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/60">
          <Hint k="Right-click" t="filters at cursor" />
          <Hint k="Drag" t="the objects" />
          <Hint k="/" t="search in plain words" />
          <Hint k="?" t="all shortcuts" />
        </div>
        <button
          type="button"
          data-cursor="Go"
          onClick={() => scrollToTarget("#drop", 0)}
          className="group flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[15px] font-medium text-paper"
        >
          Enter the drop
          <span className="grid size-10 place-items-center rounded-full bg-acid text-ink transition-transform duration-500 group-hover:rotate-90">↓</span>
        </button>
      </motion.div>
    </section>
  );
}

function Hint({ k, t }: { k: string; t: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-paper-2/70 py-1 pl-1 pr-3 backdrop-blur">
      <kbd className="rounded-full bg-ink px-2 py-0.5 text-paper">{k}</kbd>
      {t}
    </span>
  );
}
