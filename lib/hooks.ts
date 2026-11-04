"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { COLORS, PRODUCTS, type ColorId, type Product } from "./data";
import { applyFilters } from "./filters";
import { useCart, useShop } from "./store";

/** The whole store, after the current filters and sort. */
export function useFiltered() {
  const filters = useShop((s) => s.filters);
  return useMemo(() => applyFilters(PRODUCTS, filters), [filters]);
}

const noop = () => () => {};
/** false during SSR + hydration, true afterwards. */
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function defaultSize(p: Product) {
  if (!p.sizes) return undefined;
  return p.sizes[Math.floor(p.sizes.length / 2)];
}

/** Adds to the bag and sends a little copy of the product flying to the bag button. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const launch = useShop((s) => s.launch);
  const toast = useShop((s) => s.toast);
  return useCallback(
    (p: Product, opts: { color?: ColorId; size?: string; qty?: number; from?: Element | null } = {}) => {
      const color = opts.color ?? p.colors[0];
      const size = opts.size ?? defaultSize(p);
      add({ id: p.id, color, size }, opts.qty ?? 1);
      const r = opts.from?.getBoundingClientRect();
      if (r) launch({ kind: p.kind, color: COLORS[color].hex, from: { x: r.left, y: r.top, w: r.width, h: r.height } });
      toast(`${p.name} → bag`, [COLORS[color].name, size].filter(Boolean).join(" · "));
    },
    [add, launch, toast],
  );
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
