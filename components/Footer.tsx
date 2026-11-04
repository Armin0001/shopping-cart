"use client";

import { motion } from "motion/react";
import { scrollToTarget } from "@/lib/scroll";
import { useShop } from "@/lib/store";
import { Marquee } from "./Marquee";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink pb-32 pt-10 text-paper">
      <Marquee items={["Nothing here costs anything", "Preview store", "Right-click anywhere", "Free imaginary shipping"]} speed={1.6} tilt={0} className="text-paper/90" />
      <div className="mt-16 grid gap-10 px-5 md:grid-cols-[2fr_1fr_1fr] md:px-10">
        <div>
          <motion.p
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(60px,12vw,200px)] font-extrabold leading-[0.8] tracking-[-0.07em]"
          >
            drift<span className="text-signal">✦</span>
          </motion.p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/55">
            A design preview of a shop that moves. Every product, brand and review here is made up, and no real purchase can happen.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-[14px] text-paper/70">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">Wander</p>
          <button type="button" className="text-left hover:text-acid" onClick={() => scrollToTarget(0)}>Lobby</button>
          <button type="button" className="text-left hover:text-acid" onClick={() => scrollToTarget("#drop", 0)}>The Drop</button>
          <button type="button" className="text-left hover:text-acid" onClick={() => scrollToTarget("#aisles")}>The Aisles</button>
          <button type="button" className="text-left hover:text-acid" onClick={() => scrollToTarget("#floor")}>The Floor</button>
        </div>
        <div className="flex flex-col gap-2 text-[14px] text-paper/70">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">Drive</p>
          <button type="button" className="text-left hover:text-acid" onClick={() => useShop.getState().setHelpOpen(true)}>Keyboard shortcuts (?)</button>
          <button type="button" className="text-left hover:text-acid" onClick={() => useShop.getState().setSearchOpen(true)}>Search (/)</button>
          <button type="button" className="text-left hover:text-acid" onClick={() => useShop.getState().setDockOpen(true)}>All filters</button>
        </div>
      </div>
    </footer>
  );
}
