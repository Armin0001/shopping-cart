"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { COLORS, type ColorId, type Kind } from "@/lib/data";
import { cn } from "@/lib/hooks";
import { Glyph } from "./Glyph";

type Props = {
  kind: Kind;
  color: ColorId;
  layoutId?: string;
  className?: string;
  radius?: number;
  /** follow the pointer with a soft 3D tilt */
  tilt?: boolean;
  /** idle bobbing */
  float?: boolean;
  glyphClassName?: string;
  children?: ReactNode;
};

export function ProductArt({ kind, color, layoutId, className, radius = 22, tilt = true, float = false, glyphClassName, children }: Props) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 220, damping: 20 });
  const gx = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 220, damping: 22 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tilt || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      layoutId={layoutId}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("tile-bg isolate overflow-hidden [perspective:700px]", !className?.includes("absolute") && "relative", className)}
      style={{ ["--c" as string]: COLORS[color].hex, borderRadius: radius }}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply" />
      <motion.div className="absolute inset-[9%] [transform-style:preserve-3d]" style={{ rotateX: rx, rotateY: ry, x: gx }}>
        <div className={cn("h-full w-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-[5%] group-hover:-rotate-3 group-hover:scale-[1.04]", float && "animate-float")}>
          <Glyph kind={kind} color={COLORS[color].hex} className={cn("h-full w-full drop-shadow-[0_18px_18px_rgba(20,20,20,.12)]", glyphClassName)} shadow={false} />
        </div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-[6%] left-1/2 h-[4%] w-[52%] -translate-x-1/2 rounded-[50%] bg-ink/15 blur-[2px] transition-transform duration-700 group-hover:scale-x-75" />
      {children}
    </motion.div>
  );
}
