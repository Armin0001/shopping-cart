"use client";

import { useRef, useState } from "react";
import { COLORS, money, type ColorId, type Product } from "@/lib/data";
import { cn, useAddToCart } from "@/lib/hooks";
import { useShop } from "@/lib/store";
import { ProductArt } from "./ProductArt";

export function Badges({ p, className }: { p: Product; className?: string }) {
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  return (
    <div className={cn("pointer-events-none flex flex-wrap gap-1.5", className)}>
      {p.tags.includes("new") && <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper">New</span>}
      {off > 0 && <span className="rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">−{off}%</span>}
      {p.tags.includes("limited") && <span className="rounded-full bg-acid px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">Limited</span>}
    </div>
  );
}

export function Price({ p, className }: { p: Product; className?: string }) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {money(p.price)}
      {p.compareAt && <s className="ml-1.5 text-ink/40">{money(p.compareAt)}</s>}
    </span>
  );
}

type Props = { p: Product; layoutKey: string; className?: string; artClassName?: string };

export function ProductCard({ p, layoutKey, className, artClassName }: Props) {
  const [picked, setColor] = useState<ColorId | null>(null);
  // when filtering by colour, show the variant that matched
  const filterColors = useShop((s) => s.filters.colors);
  const color = picked ?? p.colors.find((c) => filterColors.includes(c)) ?? p.colors[0];
  const openProduct = useShop((s) => s.openProduct);
  const addToCart = useAddToCart();
  const artRef = useRef<HTMLDivElement>(null);

  return (
    <article data-summon-product={p.id} data-cursor="View" className={cn("group relative", className)}>
      <div ref={artRef} className={cn("relative aspect-[4/5]", artClassName)}>
        {/* Shares its layoutId with the detail overlay, which grows out of this tile. */}
        <ProductArt kind={p.kind} color={color} layoutId={`art-${layoutKey}`} className="absolute inset-0" />
        <Badges p={p} className="absolute left-3 top-3" />
        <button
          type="button"
          data-cursor="Add"
          aria-label={`Quick add ${p.name}`}
          onClick={() => addToCart(p, { color, from: artRef.current })}
          className="absolute bottom-3 right-3 z-20 grid size-11 translate-y-2 scale-75 place-items-center rounded-full bg-ink text-paper opacity-0 shadow-lg transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-110 hover:bg-acid hover:text-ink group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">{p.brand}</p>
          <h3 className="truncate text-[15px] font-semibold leading-tight tracking-tight">{p.name}</h3>
        </div>
        <Price p={p} className="shrink-0 pt-3 text-[13px]" />
      </div>
      <div className="relative z-20 mt-2 flex items-center gap-1.5 px-0.5">
        {p.colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={COLORS[c].name}
            title={COLORS[c].name}
            onPointerEnter={() => setColor(c)}
            onFocus={() => setColor(c)}
            onClick={() => setColor(c)}
            className={cn("size-3.5 rounded-full border border-ink/25 transition-transform hover:scale-125", c === color && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}
            style={{ background: COLORS[c].hex }}
          />
        ))}
        <span className="ml-auto font-mono text-[11px] text-ink/50">★ {p.rating.toFixed(1)}</span>
      </div>

      <button
        type="button"
        aria-label={`Open ${p.name}`}
        onClick={() => openProduct(p.id, layoutKey, color)}
        className="absolute inset-0 z-10 rounded-[22px]"
      />
    </article>
  );
}
