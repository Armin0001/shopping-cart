"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/hooks";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** A band of text that drifts on its own and speeds up / flips with your scrolling. */
export function Marquee({ items, speed = 2.2, className, tilt = -2 }: { items: string[]; speed?: number; className?: string; tilt?: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * -speed * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const row = [...items, ...items, ...items];
  return (
    <div className={cn("relative overflow-hidden py-4", className)} style={{ rotate: `${tilt}deg` }} aria-hidden>
      <motion.div className="flex w-max whitespace-nowrap" style={{ x }}>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={i} className="flex items-center text-[clamp(28px,4.4vw,64px)] font-extrabold uppercase leading-none tracking-[-0.04em]">
                <span className="px-6">{t}</span>
                <span className="font-serif text-[0.8em] font-normal">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
