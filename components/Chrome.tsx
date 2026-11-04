"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/hooks";
import { jumpBy, scrollToTarget, useScrollLock } from "@/lib/scroll";
import { usePrefs, useShop } from "@/lib/store";
import { pointer, summonAt } from "./Summoner";

// ---------------------------------------------------------------------------
// Global keyboard shortcuts
// ---------------------------------------------------------------------------

export function Shortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable='true']")) return;
      const s = useShop.getState();
      const modal = s.product || s.searchOpen || s.checkoutOpen || s.cartOpen;

      if (e.key === "Escape") {
        if (s.summon) s.closeSummon();
        else if (s.helpOpen) s.setHelpOpen(false);
        else if (s.dockOpen) s.setDockOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        s.undo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || modal || s.summon) return;

      switch (e.key) {
        case "/":
          e.preventDefault();
          s.setSearchOpen(true);
          break;
        case "f":
        case "F": {
          e.preventDefault();
          const x = pointer.x || window.innerWidth / 2;
          const y = pointer.y || window.innerHeight / 2;
          summonAt(x, y, { flip: e.shiftKey });
          break;
        }
        case "z":
          s.undo();
          break;
        case "b":
          s.setCartOpen(true);
          break;
        case "m": {
          const next = usePrefs.getState().mode === "smart" ? "full" : "smart";
          usePrefs.getState().setMode(next);
          s.toast(next === "smart" ? "Right-click → Smart ring" : "Right-click → Full filters");
          break;
        }
        case "?":
          s.setHelpOpen(!s.helpOpen);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

// ---------------------------------------------------------------------------
// Filtering grows and shrinks everything above you. Keep the section you're
// looking at pinned in place so the page never yanks you somewhere else.
// ---------------------------------------------------------------------------

export function ScrollAnchor() {
  const filters = useShop((s) => s.filters);
  const snap = useRef<{ el: HTMLElement; top: number } | null>(null);

  useEffect(
    () =>
      useShop.subscribe((state, prev) => {
        if (state.filters === prev.filters) return;
        for (const el of document.querySelectorAll<HTMLElement>("[data-section]")) {
          const r = el.getBoundingClientRect();
          if (r.bottom > 120) {
            snap.current = { el, top: r.top };
            break;
          }
        }
      }),
    [],
  );

  // Runs after every section's own layout effects in this commit, before paint.
  useLayoutEffect(() => {
    const s = snap.current;
    snap.current = null;
    if (!s) return;
    const delta = s.el.getBoundingClientRect().top - s.top;
    if (Math.abs(delta) > 1) jumpBy(delta);
  }, [filters]);

  return null;
}

// ---------------------------------------------------------------------------

const KEYS: [string, string][] = [
  ["Right-click", "Summon filters where your cursor is"],
  ["Shift + Right-click", "Summon the other mode (smart ↔ full)"],
  ["Hold right, flick, release", "Pick a smart filter without clicking"],
  ["1 – 6 / 0", "Choose a wedge / reset, while the ring is open"],
  ["Tab", "Swap ring ↔ full panel, just this once"],
  ["Alt + Right-click", "Your browser’s normal menu"],
  ["F", "Summon at cursor, no mouse needed"],
  ["/", "Search in plain words"],
  ["Z  or  Ctrl+Z", "Undo the last filter change"],
  ["M", "Switch your default right-click mode"],
  ["B", "Open the bag"],
  ["← →", "Previous / next product in detail view"],
  ["Shift + wheel", "Scroll an aisle sideways"],
];

export function HelpOverlay() {
  const open = useShop((s) => s.helpOpen);
  const setOpen = useShop((s) => s.setHelpOpen);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[65] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Shortcuts">
          <motion.div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div
            initial={{ scale: 0.8, rotate: -3, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-[min(560px,100%)] rounded-[30px] bg-paper p-7 shadow-2xl"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">How to drive this thing</p>
            <h2 className="mt-1 text-4xl font-extrabold tracking-[-0.05em]">Shortcuts</h2>
            <ul className="mt-5 divide-y divide-ink/8">
              {KEYS.map(([k, v], i) => (
                <motion.li
                  key={k}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.025 }}
                  className="flex items-center justify-between gap-4 py-2 text-[14px]"
                >
                  <span className="text-ink/70">{v}</span>
                  <kbd className="shrink-0 rounded-lg bg-ink px-2 py-1 font-mono text-[11px] text-paper">{k}</kbd>
                </motion.li>
              ))}
            </ul>
            <button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-full bg-acid py-3 text-[14px] font-semibold">
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// First-visit coach mark
// ---------------------------------------------------------------------------

export function Onboarding() {
  const onboarded = usePrefs((s) => s.onboarded);
  const done = usePrefs((s) => s.setOnboarded);
  const [show, setShow] = useState(false);
  const summon = useShop((s) => s.summon);

  useEffect(() => {
    if (onboarded) return;
    const t = setTimeout(() => setShow(true), 2600);
    return () => clearTimeout(t);
  }, [onboarded]);

  // the first real summon counts as having learned it
  useEffect(() => {
    if (summon && !onboarded) done();
  }, [summon, onboarded, done]);

  const visible = show && !onboarded;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="fixed bottom-24 left-1/2 z-[45] w-[min(380px,92vw)] -translate-x-1/2"
        >
          <div className="relative rounded-[24px] bg-acid p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <MouseIcon />
              <div>
                <p className="text-[17px] font-bold leading-tight tracking-tight">Psst — right-click anywhere.</p>
                <p className="mt-1 text-[13.5px] leading-snug text-ink/70">
                  Filters appear at your cursor and they know what you’re pointing at. Try it on a product. Hold, flick, release for speed.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => summonAt(window.innerWidth / 2, window.innerHeight / 2 - 40)}
                className="flex-1 rounded-full bg-ink py-2.5 text-[13px] font-semibold text-paper"
              >
                Show me
              </button>
              <button type="button" onClick={done} className="rounded-full border border-ink/25 px-4 py-2.5 text-[13px]">
                Got it
              </button>
            </div>
            <span className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-acid" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MouseIcon() {
  return (
    <svg viewBox="0 0 32 44" className="h-11 w-8 shrink-0" fill="none" stroke="#141414" strokeWidth="2.2">
      <rect x="2" y="2" width="28" height="40" rx="14" />
      <path d="M16 2v15M2 17h28" />
      <motion.path d="M16 2 A14 14 0 0 1 30 16 L30 17 L16 17 Z" fill="#141414" stroke="none" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Section rail: a vertical map of where you are in the store
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: "top", name: "Lobby" },
  { id: "drop", name: "The Drop" },
  ...CATEGORIES.map((c) => ({ id: `aisle-${c.id}`, name: c.name })),
  { id: "floor", name: "The Floor" },
];

export function MapRail() {
  const sections = SECTIONS;
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map((x) => document.getElementById(x.id)).filter((el): el is HTMLElement => !!el);
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set((e.target as HTMLElement).id, e.isIntersecting ? e.intersectionRect.height : 0));
        let best: string | null = null;
        let max = 0;
        visible.forEach((h, id) => {
          if (h > max) {
            max = h;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 lg:flex"
    >
      {sections.map((s) => {
        const on = s.id === active;
        return (
          <button key={s.id} type="button" onClick={() => scrollToTarget(`#${s.id}`, s.id === "drop" ? 0 : -72)} className="group flex items-center gap-2 py-1" aria-current={on}>
            <span
              className={cn(
                "rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper transition-all duration-300",
                hover || on ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0",
                !on && "bg-ink/70",
              )}
            >
              {s.name}
            </span>
            <motion.span
              className="block w-1.5 rounded-full bg-ink mix-blend-difference"
              animate={{ height: on ? 26 : 8, opacity: on ? 1 : 0.35 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{ background: on ? "#ff4f1f" : "#888" }}
            />
          </button>
        );
      })}
    </nav>
  );
}
