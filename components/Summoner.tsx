"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_BY_ID, PRODUCTS, PRODUCT_BY_ID, type CategoryId } from "@/lib/data";
import { applyFilters, hasActiveFilters } from "@/lib/filters";
import { cn } from "@/lib/hooks";
import { smartActions, type SmartAction, type SmartIcon } from "@/lib/smart";
import { usePrefs, useShop, type Summon, type SummonContext, type SummonMode } from "@/lib/store";
import { FilterPanel } from "./FilterPanel";

// ---------------------------------------------------------------------------
// Where the pointer is and what's under it
// ---------------------------------------------------------------------------

export const pointer = { x: 0, y: 0 };

function contextAt(target: Element | null): SummonContext {
  const prod = target?.closest<HTMLElement>("[data-summon-product]");
  if (prod?.dataset.summonProduct) return { type: "product", id: prod.dataset.summonProduct };
  const cat = target?.closest<HTMLElement>("[data-summon-category]");
  if (cat?.dataset.summonCategory) return { type: "category", id: cat.dataset.summonCategory as CategoryId };
  return { type: "page" };
}

const isField = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("input, textarea, select, [contenteditable='true']");
const other = (m: SummonMode): SummonMode => (m === "smart" ? "full" : "smart");

/** Opens the filter summon at a point — used by right-click, the F key and the dock. */
export function summonAt(x: number, y: number, opts: { flip?: boolean; gesture?: boolean } = {}) {
  const base = usePrefs.getState().mode;
  const mode = opts.flip ? other(base) : base;
  const el = document.elementFromPoint(x, y);
  useShop.getState().openSummon({ x, y, mode, context: contextAt(el), gesture: !!opts.gesture && mode === "smart" });
}

// ---------------------------------------------------------------------------

export function Summoner() {
  const summon = useShop((s) => s.summon);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 2 || e.altKey || isField(e.target)) return;
      if (e.target instanceof Element && e.target.closest("[data-summon-ui]")) return;
      const { product, searchOpen, checkoutOpen } = useShop.getState();
      if (product || searchOpen || checkoutOpen) return;
      summonAt(e.clientX, e.clientY, { flip: e.shiftKey, gesture: true });
    };
    const onContext = (e: MouseEvent) => {
      if (e.altKey || isField(e.target)) return;
      e.preventDefault();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("contextmenu", onContext);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("contextmenu", onContext);
    };
  }, []);

  return (
    <AnimatePresence>
      {summon &&
        (summon.mode === "smart" ? (
          <SmartRing key={`ring-${summon.x}-${summon.y}`} s={summon} />
        ) : (
          <FullAtCursor key={`full-${summon.x}-${summon.y}`} s={summon} />
        ))}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Smart ring: a radial "marking menu". Hold right-click, flick toward a wedge,
// release — the filter applies before the menu has finished drawing.
// ---------------------------------------------------------------------------

const R = 150;
const r0 = 58;
const N = 6;
const STEP = 360 / N;

function wedgePath(a0: number, a1: number, inner: number, outer: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (rr: number, a: number) => `${(rr * Math.cos(rad(a))).toFixed(2)} ${(rr * Math.sin(rad(a))).toFixed(2)}`;
  return `M${pt(outer, a0)} A${outer} ${outer} 0 0 1 ${pt(outer, a1)} L${pt(inner, a1)} A${inner} ${inner} 0 0 0 ${pt(inner, a0)} Z`;
}

function contextTitle(ctx: SummonContext) {
  if (ctx.type === "product") return PRODUCT_BY_ID[ctx.id]?.name ?? "This item";
  if (ctx.type === "category") return `${CATEGORY_BY_ID[ctx.id].name} aisle`;
  return "Whole store";
}

function SmartRing({ s }: { s: Summon }) {
  const filters = useShop((st) => st.filters);
  const seen = usePrefs((st) => st.seen);
  const [seed] = useState(() => Math.floor(Math.random() * 1e6));
  const actions = useMemo(() => smartActions(s.context, seen, seed), [s.context, seen, seed]);
  const previews = useMemo(() => actions.map((a) => applyFilters(PRODUCTS, a.apply(filters)).length), [actions, filters]);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const gesture = useRef(s.gesture);

  // keep the ring on screen
  const [pos] = useState(() => ({
    x: Math.min(Math.max(s.x, R + 16), window.innerWidth - R - 16),
    y: Math.min(Math.max(s.y, R + 16), window.innerHeight - R - 56),
  }));

  useEffect(() => {
    const st = useShop.getState;
    const apply = (a: SmartAction, i: number) => {
      st().setFilters(a.apply, { x: pos.x, y: pos.y });
      st().toast(a.label, `${previews[i]} item${previews[i] === 1 ? "" : "s"}`);
      st().closeSummon();
    };
    const center = () => {
      if (hasActiveFilters(st().filters)) {
        st().resetFilters({ x: pos.x, y: pos.y });
        st().toast("Filters cleared", `${PRODUCTS.length} items`);
      }
      st().closeSummon();
    };
    const zone = (e: PointerEvent) => {
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < r0) return { idx: null, inCenter: true, dist };
      if (dist > R + 70) return { idx: null, inCenter: false, dist };
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90 + STEP / 2;
      return { idx: Math.floor((((deg % 360) + 360) % 360) / STEP), inCenter: false, dist };
    };

    const onMove = (e: PointerEvent) => {
      const z = zone(e);
      hoverRef.current = z.idx;
      setHover(z.idx);
    };
    const swallowNextClick = () => {
      const stop = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      window.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 400);
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.target instanceof Element && e.target.closest("[data-ring-control]")) return;
      const z = zone(e);
      e.preventDefault();
      e.stopPropagation();
      swallowNextClick();
      if (z.inCenter) center();
      else if (z.idx !== null) apply(actions[z.idx], z.idx);
      else st().closeSummon();
    };
    const onUp = (e: PointerEvent) => {
      if (e.button !== 2 || !gesture.current) return;
      gesture.current = false;
      const z = zone(e);
      if (z.idx !== null && z.dist > r0 + 8) apply(actions[z.idx], z.idx);
    };
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= N) {
        e.preventDefault();
        apply(actions[n - 1], n - 1);
      } else if (e.key === "0" || e.key === "Backspace") {
        e.preventDefault();
        center();
      } else if (e.key === "Tab") {
        e.preventDefault();
        st().updateSummon({ mode: "full" });
      }
    };
    const onWheel = () => st().closeSummon();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [actions, previews, pos]);

  const active = hover !== null ? actions[hover] : null;
  const filtersOn = hasActiveFilters(filters);

  return (
    <motion.div
      data-summon-ui
      className="pointer-events-none fixed left-0 top-0 z-[60]"
      style={{ x: pos.x, y: pos.y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
    >
      {/* pulse at the click point */}
      <motion.div
        className="absolute rounded-full border-2 border-ink/40"
        style={{ left: -R, top: -R, width: R * 2, height: R * 2 }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 1.35, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.svg
        width={(R + 8) * 2}
        height={(R + 8) * 2}
        viewBox={`${-R - 8} ${-R - 8} ${(R + 8) * 2} ${(R + 8) * 2}`}
        className="pointer-events-auto absolute overflow-visible drop-shadow-[0_24px_40px_rgba(20,20,20,.35)]"
        style={{ left: -R - 8, top: -R - 8 }}
        initial={{ scale: 0.3, rotate: -60 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.6, rotate: 30 }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
      >
        {actions.map((a, i) => {
          const mid = -90 + i * STEP;
          const on = hover === i;
          return (
            <motion.g
              key={a.id}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: on ? 1.06 : 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 28, delay: on ? 0 : i * 0.025 }}
            >
              <path
                d={wedgePath(mid - STEP / 2, mid + STEP / 2, r0 + 2, R)}
                className={cn("transition-colors duration-150", on ? "fill-acid" : "fill-ink")}
                stroke="#f2efe8"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <WedgeLabel a={a} mid={mid} on={on} count={previews[i]} />
            </motion.g>
          );
        })}
        <circle r={r0 - 4} className="fill-paper" stroke="#141414" strokeWidth="2" />
      </motion.svg>

      {/* centre readout */}
      <div className="absolute grid place-items-center text-center" style={{ left: -r0 + 6, top: -r0 + 6, width: (r0 - 6) * 2, height: (r0 - 6) * 2 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active?.id ?? "idle"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="px-1"
          >
            {active ? (
              <>
                <p className="text-[22px] font-extrabold leading-none tracking-tight">{previews[hover!]}</p>
                <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-ink/55">items</p>
              </>
            ) : (
              <>
                <p className="font-mono text-[8.5px] uppercase leading-tight tracking-wider text-ink/50">{filtersOn ? "click to" : "smart"}</p>
                <p className="text-[13px] font-bold leading-tight">{filtersOn ? "Reset" : "✦"}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* caption under the ring */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="absolute flex w-[320px] flex-col items-center gap-2 text-center"
        style={{ left: -160, top: R + 18 }}
      >
        <div className="max-w-[300px] rounded-2xl bg-ink px-3.5 py-2 text-paper shadow-xl">
          <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/50">{contextTitle(s.context)}</p>
          <p className="text-[12.5px] leading-snug">{active ? active.hint : "Flick toward a wedge, or press 1–6"}</p>
        </div>
        <button
          type="button"
          data-ring-control
          onClick={() => useShop.getState().updateSummon({ mode: "full" })}
          className="pointer-events-auto rounded-full bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/70 shadow ring-1 ring-ink/10 hover:text-ink"
        >
          Full filters instead (Tab)
        </button>
      </motion.div>
    </motion.div>
  );
}

function WedgeLabel({ a, mid, on, count }: { a: SmartAction; mid: number; on: boolean; count: number }) {
  const rad = (mid * Math.PI) / 180;
  const rr = (R + r0) / 2 + 2;
  const x = rr * Math.cos(rad);
  const y = rr * Math.sin(rad);
  const fg = on ? "#141414" : "#f2efe8";
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} style={{ pointerEvents: "none" }}>
      <g transform="translate(-10 -26)" stroke={fg} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Icon name={a.icon} />
      </g>
      <text y="8" textAnchor="middle" fill={fg} fontSize="11.5" fontWeight="650" style={{ fontFamily: "var(--font-bricolage)" }}>
        {a.label.length > 15 ? a.label.slice(0, 14) + "…" : a.label}
      </text>
      <text y="22" textAnchor="middle" fill={fg} opacity=".55" fontSize="9" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {count} item{count === 1 ? "" : "s"}
      </text>
    </g>
  );
}

function Icon({ name }: { name: SmartIcon }) {
  // 20×20 line icons
  switch (name) {
    case "like": return <path d="M2 10c2.5-5 5.5-5 8 0s5.5 5 8 0M2 15c2.5-5 5.5-5 8 0s5.5 5 8 0" />;
    case "down": return <path d="M10 2v15M4 11l6 6 6-6" />;
    case "swatch": return <><circle cx="10" cy="10" r="7" /><path d="M10 3v14" /></>;
    case "tag": return <><path d="M2 10V2h8l8 8-8 8z" /><circle cx="6" cy="6" r="1.2" /></>;
    case "equal": return <path d="M3 7h14M3 13h14" />;
    case "hide": return <><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" /><path d="M3 17L17 3" /></>;
    case "only": return <><circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="10" r="3" /></>;
    case "sale": return <><path d="M16 4L4 16" /><circle cx="5.5" cy="5.5" r="2" /><circle cx="14.5" cy="14.5" r="2" /></>;
    case "star": return <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z" />;
    case "sort": return <path d="M6 3v14M2 13l4 4 4-4M14 17V3M10 7l4-4 4 4" />;
    case "spark": return <path d="M10 1v18M1 10h18M4 4l12 12M16 4L4 16" />;
    case "dice": return <><rect x="2.5" y="2.5" width="15" height="15" rx="3" /><circle cx="7" cy="7" r=".8" /><circle cx="13" cy="13" r=".8" /><circle cx="10" cy="10" r=".8" /></>;
    case "heart": return <path d="M10 17s-7-4.4-7-9.5A3.8 3.8 0 0 1 10 5a3.8 3.8 0 0 1 7 2.5C17 12.6 10 17 10 17z" />;
    case "clock": return <><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></>;
  }
}

// ---------------------------------------------------------------------------
// Full mode: the complete filter panel pops out right where you clicked.
// ---------------------------------------------------------------------------

const PANEL_W = 380;

function FullAtCursor({ s }: { s: Summon }) {
  const close = useShop((st) => st.closeSummon);
  const [pos] = useState(() => {
    const h = Math.min(640, window.innerHeight * 0.85);
    const left = s.x + PANEL_W + 24 > window.innerWidth ? s.x - PANEL_W - 12 : s.x + 12;
    return {
      left: Math.max(12, left),
      top: Math.min(Math.max(12, s.y - 40), window.innerHeight - h - 12),
      h,
      originX: s.x + PANEL_W + 24 > window.innerWidth ? 1 : 0,
    };
  });

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-summon-ui]")) return;
      if (e.button === 0) close();
    };
    const onKey = (e: KeyboardEvent) => {
      // Tab moves focus inside the panel; Shift+Tab from the search box flips back to the ring
      if (e.key === "Tab" && e.shiftKey && e.target instanceof HTMLInputElement && e.target.type !== "range") {
        e.preventDefault();
        useShop.getState().updateSummon({ mode: "smart" });
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <>
      <motion.span
        className="pointer-events-none fixed z-[60] size-3 rounded-full bg-signal"
        style={{ left: s.x - 6, top: s.y - 6 }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.6, 1] }}
        exit={{ scale: 0 }}
      />
      <motion.div
        data-summon-ui
        className="fixed z-[60] flex flex-col overflow-hidden rounded-[26px] bg-paper shadow-[0_40px_80px_-20px_rgba(20,20,20,.45)] ring-1 ring-ink/10"
        style={{ left: pos.left, top: pos.top, width: PANEL_W, maxHeight: pos.h, originX: pos.originX, originY: 0 }}
        initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)", transition: { duration: 0.16 } }}
        transition={{ type: "spring", stiffness: 480, damping: 34 }}
      >
        <div className="flex items-center justify-between bg-ink px-4 py-2 text-paper">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">Full filters · live</p>
          <button
            type="button"
            onClick={() => useShop.getState().updateSummon({ mode: "smart" })}
            className="rounded-full bg-paper/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider hover:bg-acid hover:text-ink"
          >
            ✦ Smart ring
          </button>
        </div>
        <FilterPanel onDone={close} className="min-h-0 flex-1" />
      </motion.div>
    </>
  );
}
