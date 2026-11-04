"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/hooks";
import { useShop, type Flight } from "@/lib/store";
import { Glyph } from "./Glyph";

// ---------------------------------------------------------------------------
// Cursor: an exact dot plus a lagging ring that grows a label over
// anything marked with data-cursor="…".
// ---------------------------------------------------------------------------

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 520, damping: 42, mass: 0.6 });
  const [label, setLabel] = useState<string | null>(null);
  const [state, setState] = useState({ enabled: false, visible: false, down: false, text: false });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let current: string | null = null;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target instanceof Element ? e.target : null;
      const text = !!t?.closest("input, textarea");
      const next = text ? null : t?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? null;
      if (next !== current) {
        current = next;
        setLabel(next);
      }
      setState((s) => (s.visible && s.text === text && s.enabled ? s : { ...s, enabled: true, visible: true, text }));
    };
    const down = () => setState((s) => ({ ...s, down: true }));
    const up = () => setState((s) => ({ ...s, down: false }));
    const leave = () => setState((s) => ({ ...s, visible: false }));
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!state.enabled) return null;
  const hide = !state.visible || state.text;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider",
            label ? "bg-acid text-ink" : "border-[1.5px] border-white mix-blend-difference",
          )}
          animate={{
            width: label ? Math.max(64, label.length * 8 + 28) : state.down ? 22 : 34,
            height: label ? 64 : state.down ? 22 : 34,
            opacity: hide ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          <AnimatePresence>
            {label && (
              <motion.span key={label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
          animate={{ opacity: hide || label ? 0 : 1 }}
        />
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add-to-bag flights: a copy of the product arcs into the bag button.
// ---------------------------------------------------------------------------

export function FlightLayer() {
  const flights = useShop((s) => s.flights);
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      {flights.map((f) => (
        <Flyer key={f.id} f={f} />
      ))}
    </div>
  );
}

function bagTarget() {
  const btn = document.getElementById("cart-button");
  if (!btn) return { x: window.innerWidth - 60, y: 36 };
  const r = btn.getBoundingClientRect();
  // the header may be slid out of view; aim for where it rests
  const header = btn.closest("header");
  const ty = header ? new DOMMatrix(getComputedStyle(header).transform).m42 : 0;
  return { x: r.right - 22, y: r.top - ty + r.height / 2 };
}

function Flyer({ f }: { f: Flight }) {
  const land = useShop((s) => s.land);
  const [to] = useState(bagTarget);
  const size = Math.min(f.from.w, f.from.h, 220);
  const sx = f.from.x + f.from.w / 2 - size / 2;
  const sy = f.from.y + f.from.h / 2 - size / 2;
  const ex = to.x - size / 2;
  const ey = to.y - size / 2;
  // rise a little first, then swoop up into the bag
  const lift = Math.max(ey, sy - 90);
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: size, height: size }}
      initial={{ x: sx }}
      animate={{ x: ex }}
      transition={{ duration: 0.85, ease: [0.45, 0, 0.55, 1] }}
    >
      <motion.div
        initial={{ y: sy, scale: 1, rotate: 0 }}
        animate={{ y: [sy, lift, ey], scale: [1, 0.8, 0.14], rotate: [0, -18, 200] }}
        transition={{ duration: 0.85, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"] }}
        onAnimationComplete={() => land(f.id)}
        className="size-full drop-shadow-[0_20px_20px_rgba(20,20,20,.3)]"
      >
        <Glyph kind={f.kind} color={f.color} className="size-full" shadow={false} />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Ripples: the shockwave when a filter lands
// ---------------------------------------------------------------------------

export function Ripples() {
  const ripples = useShop((s) => s.ripples);
  const end = useShop((s) => s.endRipple);
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden" aria-hidden>
      {ripples.map((r) => (
        <div key={r.id} className="absolute" style={{ left: r.x, top: r.y }}>
          {[0, 1].map((k) => (
            <motion.span
              key={k}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full", k === 0 ? "bg-acid/25" : "border-2 border-ink/30")}
              style={{ width: 200, height: 200 }}
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 14, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: k * 0.08 }}
              onAnimationComplete={() => k === 1 && end(r.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Toasts() {
  const toasts = useShop((s) => s.toasts);
  const dismiss = useShop((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed left-4 top-24 z-[80] flex w-[300px] flex-col gap-2" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            type="button"
            onClick={() => dismiss(t.id)}
            initial={{ x: -340, rotate: -8 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: -340, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto rounded-2xl bg-ink px-4 py-3 text-left text-paper shadow-xl"
          >
            <p className="text-[14px] font-semibold leading-tight">{t.text}</p>
            {t.sub && <p className="mt-0.5 font-mono text-[11px] text-paper/55">{t.sub}</p>}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
