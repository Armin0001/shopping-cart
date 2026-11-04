"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CategoryId, ColorId, Kind } from "./data";
import { DEFAULT_FILTERS, type Filters } from "./filters";

export type SummonMode = "smart" | "full";
export type SummonContext =
  | { type: "product"; id: string }
  | { type: "category"; id: CategoryId }
  | { type: "page" };

export type Summon = {
  x: number;
  y: number;
  mode: SummonMode;
  context: SummonContext;
  /** true while the right mouse button is still held (marking-menu gesture) */
  gesture: boolean;
};

export type Flight = { id: number; kind: Kind; color: string; from: { x: number; y: number; w: number; h: number } };
export type Toast = { id: number; text: string; sub?: string };
export type Ripple = { id: number; x: number; y: number };
type Point = { x: number; y: number };

let uid = 0;
const nextId = () => ++uid;
const same = (a: Filters, b: Filters) => JSON.stringify(a) === JSON.stringify(b);

// Slider drags and typing arrive as dozens of tiny changes; fold them into one undo step.
let lastChange = { keys: "", at: 0 };
function shouldMerge(prev: Filters, next: Filters) {
  const keys = (Object.keys(next) as (keyof Filters)[])
    .filter((k) => JSON.stringify(next[k]) !== JSON.stringify(prev[k]))
    .join(",");
  const now = Date.now();
  const merge = (keys === "price" || keys === "q") && keys === lastChange.keys && now - lastChange.at < 800;
  lastChange = { keys, at: now };
  return merge;
}

type Shop = {
  filters: Filters;
  past: Filters[];
  setFilters: (next: Filters | ((f: Filters) => Filters), origin?: Point) => void;
  undo: () => void;
  resetFilters: (origin?: Point) => void;

  summon: Summon | null;
  openSummon: (s: Summon) => void;
  updateSummon: (s: Partial<Summon>) => void;
  closeSummon: () => void;

  product: { id: string; layoutKey: string; color?: ColorId } | null;
  openProduct: (id: string, layoutKey: string, color?: ColorId) => void;
  closeProduct: () => void;

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;
  dockOpen: boolean;
  setDockOpen: (v: boolean) => void;

  flights: Flight[];
  launch: (f: Omit<Flight, "id">) => void;
  land: (id: number) => void;
  cartPulse: number;

  toasts: Toast[];
  toast: (text: string, sub?: string) => void;
  dismissToast: (id: number) => void;

  ripples: Ripple[];
  ripple: (p: Point) => void;
  endRipple: (id: number) => void;
};

export const useShop = create<Shop>()((set, get) => ({
  filters: DEFAULT_FILTERS,
  past: [],
  setFilters: (next, origin) => {
    const prev = get().filters;
    const value = typeof next === "function" ? next(prev) : next;
    if (same(prev, value)) return;
    set({ filters: value, past: shouldMerge(prev, value) ? get().past : [...get().past, prev].slice(-40) });
    if (origin) get().ripple(origin);
  },
  undo: () => {
    const past = get().past;
    if (!past.length) return;
    set({ filters: past[past.length - 1], past: past.slice(0, -1) });
    get().toast("Undid last filter change");
  },
  resetFilters: (origin) => {
    get().setFilters({ ...DEFAULT_FILTERS, sort: get().filters.sort }, origin);
  },

  summon: null,
  openSummon: (s) => set({ summon: s }),
  updateSummon: (s) => {
    const cur = get().summon;
    if (cur) set({ summon: { ...cur, ...s } });
  },
  closeSummon: () => set({ summon: null }),

  product: null,
  openProduct: (id, layoutKey, color) => {
    set({ product: { id, layoutKey, color }, summon: null });
    usePrefs.getState().recordView(id);
  },
  closeProduct: () => set({ product: null }),

  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v, summon: null }),
  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v, summon: null }),
  checkoutOpen: false,
  setCheckoutOpen: (v) => set({ checkoutOpen: v }),
  helpOpen: false,
  setHelpOpen: (v) => set({ helpOpen: v }),
  dockOpen: false,
  setDockOpen: (v) => set({ dockOpen: v }),

  flights: [],
  launch: (f) => set({ flights: [...get().flights, { ...f, id: nextId() }] }),
  land: (id) => set({ flights: get().flights.filter((f) => f.id !== id), cartPulse: get().cartPulse + 1 }),
  cartPulse: 0,

  toasts: [],
  toast: (text, sub) => {
    const id = nextId();
    set({ toasts: [...get().toasts.slice(-2), { id, text, sub }] });
    setTimeout(() => get().dismissToast(id), 2600);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  ripples: [],
  ripple: (p) => set({ ripples: [...get().ripples, { id: nextId(), ...p }] }),
  endRipple: (id) => set({ ripples: get().ripples.filter((r) => r.id !== id) }),
}));

// ---------------------------------------------------------------------------
// Cart (persisted). Nothing here ever talks to a payment provider.
// ---------------------------------------------------------------------------

export type CartLine = { key: string; id: string; color: ColorId; size?: string; qty: number };

type Cart = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<Cart>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) => {
        const key = `${line.id}:${line.color}:${line.size ?? ""}`;
        const existing = get().lines.find((l) => l.key === key);
        if (existing) set({ lines: get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(9, l.qty + qty) } : l)) });
        else set({ lines: [{ ...line, key, qty }, ...get().lines] });
      },
      setQty: (key, qty) =>
        set({ lines: qty <= 0 ? get().lines.filter((l) => l.key !== key) : get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(9, qty) } : l)) }),
      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "drift-cart", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

// ---------------------------------------------------------------------------
// Preferences + taste memory (persisted, local only)
// ---------------------------------------------------------------------------

type Prefs = {
  mode: SummonMode;
  setMode: (m: SummonMode) => void;
  onboarded: boolean;
  setOnboarded: () => void;
  seen: string[];
  recordView: (id: string) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      mode: "smart",
      setMode: (mode) => set({ mode }),
      onboarded: false,
      setOnboarded: () => set({ onboarded: true }),
      seen: [],
      recordView: (id) => set({ seen: [id, ...get().seen.filter((x) => x !== id)].slice(0, 24) }),
    }),
    { name: "drift-prefs", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
