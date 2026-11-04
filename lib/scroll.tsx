"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const LenisContext = createContext<Lenis | null>(null);
let instance: Lenis | null = null;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, autoRaf: true, anchors: true });
    instance = l;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the instance only exists on the client
    setLenis(l);
    return () => {
      l.destroy();
      instance = null;
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

/** Smoothly bring an element (or y position) into view, with or without Lenis. */
export function scrollToTarget(target: string | HTMLElement | number, offset = -72) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el === null) return;
  if (instance) {
    instance.scrollTo(el as HTMLElement | number, { offset, duration: 1.4 });
    return;
  }
  const y = typeof el === "number" ? el : el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/** Shift the page instantly (no smoothing) — used to keep your place when content above you resizes. */
export function jumpBy(delta: number) {
  if (instance) instance.scrollTo(window.scrollY + delta, { immediate: true, force: true });
  else window.scrollBy(0, delta);
}

/** Freeze page scroll while an overlay is open. Overlay content opts out with data-lenis-prevent. */
const locks = new Set<symbol>();
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const key = Symbol("lock");
    locks.add(key);
    instance?.stop();
    document.documentElement.classList.add("scroll-locked");
    return () => {
      locks.delete(key);
      if (locks.size === 0) {
        instance?.start();
        document.documentElement.classList.remove("scroll-locked");
      }
    };
  }, [active]);
}
