"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { COLORS, money } from "@/lib/data";
import { useScrollLock } from "@/lib/scroll";
import { useCart, useShop } from "@/lib/store";
import { FREE_SHIPPING, useCartTotals } from "./CartDrawer";

/** A pretend checkout: a receipt prints, confetti flies, no money moves. */
export function Checkout() {
  const open = useShop((s) => s.checkoutOpen);
  useScrollLock(open);
  return <AnimatePresence>{open && <Receipt key="receipt" />}</AnimatePresence>;
}

function Receipt() {
  const setOpen = useShop((s) => s.setCheckoutOpen);
  const totals = useCartTotals();
  // Freeze the bag at the moment of "purchase" so clearing it doesn't wipe the receipt.
  const [snap] = useState(() => ({
    ...totals,
    order: `DR-${Math.floor(100000 + Math.random() * 899999)}`,
    when: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    bars: Array.from({ length: 42 }, () => 1 + Math.floor(Math.random() * 3)),
  }));
  const [done, setDone] = useState(false);
  const shipping = snap.subtotal >= FREE_SHIPPING || snap.subtotal === 0 ? 0 : 9;
  const lines = snap.items.length;
  const printTime = 0.9 + lines * 0.18;

  useEffect(() => {
    const t = setTimeout(() => setDone(true), (printTime + 0.6) * 1000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  });

  function finish() {
    if (snap.items.length) useCart.getState().clear();
    setOpen(false);
    if (snap.items.length) useShop.getState().toast("Preview order complete", "Bag cleared · $0.00 charged");
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center overflow-hidden" role="dialog" aria-modal="true" aria-label="Preview checkout">
      <motion.div className="absolute inset-0 bg-ink/85 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => done && finish()} />

      {/* printer slot */}
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        exit={{ y: -120 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative z-10 mt-10 flex h-14 w-[min(420px,92vw)] items-center justify-between rounded-2xl bg-[#2a2a2c] px-5 shadow-[inset_0_-6px_0_rgba(0,0,0,.4)]"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">drift ✦ preview terminal</span>
        <motion.span
          className="size-2.5 rounded-full"
          animate={{ backgroundColor: done ? "#d9ff42" : ["#ff4f1f", "#401208", "#ff4f1f"] }}
          transition={done ? {} : { duration: 0.5, repeat: Infinity }}
        />
        <div className="absolute inset-x-6 -bottom-1 h-2 rounded-full bg-black" />
      </motion.div>

      {/* paper */}
      <div data-lenis-prevent className="relative z-0 -mt-1 w-[min(360px,86vw)] flex-1 overflow-y-auto pb-40">
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)", y: -40 }}
          animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
          exit={{ y: 900, rotate: 8, transition: { duration: 0.6, ease: [0.7, 0, 0.84, 0] } }}
          transition={{ duration: printTime, ease: "linear" }}
          className="relative bg-[#fffdf6] px-6 pb-10 pt-8 font-mono text-[12px] text-ink shadow-2xl [mask-image:linear-gradient(transparent,#000_8px)]"
        >
          <p className="text-center text-2xl font-sans font-extrabold tracking-[-0.05em]">drift ✦</p>
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-ink/50">a store that moves</p>
          <Dash />
          <Row a="Order" b={snap.order} />
          <Row a="Date" b={snap.when} />
          <Dash />
          {snap.items.length === 0 && <p className="py-2 text-center text-ink/50">(an empty bag — bold choice)</p>}
          {snap.items.map((l) => (
            <div key={l.key} className="py-1">
              <Row a={`${l.qty}× ${l.p.name}`} b={money(l.p.price * l.qty)} />
              <p className="text-[10px] text-ink/45">{[COLORS[l.color].name, l.size].filter(Boolean).join(" / ")}</p>
            </div>
          ))}
          <Dash />
          <Row a="Subtotal" b={money(snap.subtotal)} />
          {snap.savings > 0 && <Row a="You saved" b={`−${money(snap.savings)}`} />}
          <Row a="Shipping" b={shipping ? money(shipping) : "FREE"} />
          <Row a="Tax" b="$0" />
          <div className="mt-2 flex justify-between text-[16px] font-bold">
            <span>TOTAL</span>
            <span>{money(snap.subtotal + shipping)}</span>
          </div>
          <Dash />
          <Row a="Paid with" b="IMAGINATION" />
          <Row a="Charged" b="$0.00" />
          <p className="mt-4 rounded-md border-2 border-dashed border-signal px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-signal">
            Preview mode — no purchase was made
          </p>
          <div className="mt-5 flex h-12 items-stretch justify-center gap-[2px]">
            {snap.bars.map((w, i) => (
              <span key={i} className="bg-ink" style={{ width: w }} />
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-ink/50">thank you for drifting</p>
          <div className="absolute inset-x-0 -bottom-3 h-3 bg-[linear-gradient(-45deg,transparent_6px,#fffdf6_0),linear-gradient(45deg,transparent_6px,#fffdf6_0)] bg-[length:12px_12px] bg-bottom" />
        </motion.div>
      </div>

      <AnimatePresence>
        {done && (
          <>
            <Confetti />
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3"
            >
              <p className="text-center text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-0.05em] text-paper">
                That’s a (pretend) wrap<span className="text-acid">.</span>
              </p>
              <button type="button" onClick={finish} className="rounded-full bg-acid px-7 py-3.5 text-[15px] font-semibold text-ink transition-transform hover:scale-105">
                Back to drifting →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="truncate">{a}</span>
      <span className="shrink-0 tabular-nums">{b}</span>
    </div>
  );
}
const Dash = () => <div className="my-3 border-t-2 border-dashed border-ink/20" />;

const CONFETTI_COLORS = ["#d9ff42", "#ff4f1f", "#3157ff", "#ffd04d", "#b4a2ff", "#78e0b4", "#fffdf6"];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 90 }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 380 + Math.random() * 520;
      return {
        i,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        fall: 500 + Math.random() * 500,
        rot: (Math.random() - 0.5) * 1080,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 14,
        c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() < 0.3,
        delay: Math.random() * 0.15,
      };
    }),
  );
  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-10">
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          className="absolute block"
          style={{ width: p.w, height: p.round ? p.w : p.h, background: p.c, borderRadius: p.round ? 99 : 2 }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: [0, p.x, p.x * 1.15], y: [0, p.y, p.y + p.fall], rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4, times: [0, 0.35, 1], ease: ["easeOut", "easeIn"], delay: p.delay }}
        />
      ))}
    </div>
  );
}
