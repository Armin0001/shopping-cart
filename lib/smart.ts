import {
  CATEGORIES, CATEGORY_BY_ID, COLORS, KIND_NAMES, PRICE_CEIL, PRODUCTS, PRODUCT_BY_ID, VIBES,
  type Vibe,
} from "./data";
import { DEFAULT_FILTERS, type Filters } from "./filters";
import type { SummonContext } from "./store";

export type SmartIcon =
  | "like" | "down" | "swatch" | "tag" | "equal" | "hide" | "only" | "sale" | "star"
  | "sort" | "spark" | "dice" | "heart" | "clock";

export type SmartAction = {
  id: string;
  label: string;
  hint: string;
  icon: SmartIcon;
  apply: (f: Filters) => Filters;
};

const r5 = (n: number) => Math.round(n / 5) * 5;
const vibeName = (v: Vibe) => VIBES.find((x) => x.id === v)!.name;

/** What the person has been looking at lately, distilled into a filter. */
export function tasteOf(seen: string[]) {
  const items = seen.map((id) => PRODUCT_BY_ID[id]).filter(Boolean);
  if (items.length < 2) return null;
  const count = <K extends string>(keys: K[]) => {
    const m = new Map<K, number>();
    keys.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
  const vibe = count(items.map((p) => p.vibe));
  const prices = items.map((p) => p.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  return { vibe, lo: Math.max(0, r5(median * 0.5)), hi: r5(median * 1.6) + 5 };
}

export function smartActions(ctx: SummonContext, seen: string[], seed: number): SmartAction[] {
  if (ctx.type === "product") {
    const p = PRODUCT_BY_ID[ctx.id];
    if (p) {
      const color = p.colors[0];
      return [
        { id: "like", label: "More like this", hint: `${CATEGORY_BY_ID[p.category].name} · ${vibeName(p.vibe)}`, icon: "like", apply: (f) => ({ ...f, categories: [p.category], vibes: [p.vibe], excludeKinds: [] }) },
        { id: "cheaper", label: "Cheaper", hint: `Everything under $${p.price}`, icon: "down", apply: (f) => ({ ...f, price: [0, p.price - 1] }) },
        { id: "color", label: `In ${COLORS[color].name}`, hint: `Only ${COLORS[color].name.toLowerCase()} things`, icon: "swatch", apply: (f) => ({ ...f, colors: [color] }) },
        { id: "brand", label: p.brand, hint: `Only from ${p.brand}`, icon: "tag", apply: (f) => ({ ...f, brands: [p.brand] }) },
        { id: "near", label: "Same price", hint: `$${r5(p.price * 0.75)}–$${r5(p.price * 1.25)}`, icon: "equal", apply: (f) => ({ ...f, price: [r5(p.price * 0.75), r5(p.price * 1.25)] }) },
        { id: "hide", label: `No ${KIND_NAMES[p.kind].toLowerCase()}`, hint: `Hide every ${p.kind}`, icon: "hide", apply: (f) => ({ ...f, excludeKinds: [...new Set([...f.excludeKinds, p.kind])] }) },
      ];
    }
  }

  if (ctx.type === "category") {
    const c = CATEGORY_BY_ID[ctx.id];
    return [
      { id: "only", label: `Only ${c.name}`, hint: c.blurb, icon: "only", apply: (f) => ({ ...f, categories: [c.id] }) },
      { id: "csale", label: "On sale here", hint: `${c.name} with a discount`, icon: "sale", apply: (f) => ({ ...f, categories: [c.id], tags: ["sale"] }) },
      { id: "cbest", label: `Best of ${c.name}`, hint: "4.5★ and up, best first", icon: "star", apply: (f) => ({ ...f, categories: [c.id], minRating: 4.5, sort: "rating" }) },
      { id: "chide", label: `Hide ${c.name}`, hint: "Everything except this aisle", icon: "hide", apply: (f) => ({ ...f, categories: CATEGORIES.map((x) => x.id).filter((x) => x !== c.id && (f.categories.length === 0 || f.categories.includes(x))) }) },
      { id: "csort", label: "Cheapest first", hint: "Sort the whole store by price", icon: "sort", apply: (f) => ({ ...f, sort: "price-asc" }) },
      { id: "cnew", label: `New in ${c.name}`, hint: "Added in the last two weeks", icon: "clock", apply: (f) => ({ ...f, categories: [c.id], tags: ["new"] }) },
    ];
  }

  const taste = tasteOf(seen);
  // "Surprise me" always lands on something real: borrow the traits of a random product.
  const lucky = PRODUCTS[Math.abs(seed) % PRODUCTS.length];
  return [
    { id: "u50", label: "Under $50", hint: "Small treats only", icon: "down", apply: (f) => ({ ...f, price: [0, 50] }) },
    { id: "new", label: "Just dropped", hint: "Newest first", icon: "clock", apply: (f) => ({ ...f, tags: [...new Set([...f.tags, "new" as const])], sort: "new" }) },
    { id: "sale", label: "On sale", hint: "Marked down right now", icon: "sale", apply: (f) => ({ ...f, tags: [...new Set([...f.tags, "sale" as const])] }) },
    { id: "top", label: "4.5★ and up", hint: "Only the crowd favourites", icon: "star", apply: (f) => ({ ...f, minRating: 4.5 }) },
    taste
      ? { id: "taste", label: "My taste", hint: `${vibeName(taste.vibe)} · $${taste.lo}–$${taste.hi}, from what you've viewed`, icon: "heart", apply: (f) => ({ ...DEFAULT_FILTERS, sort: f.sort, vibes: [taste.vibe], price: [taste.lo, Math.min(PRICE_CEIL, taste.hi)] }) }
      : { id: "taste", label: "Bestsellers", hint: "Open a few products and this becomes ‘My taste’", icon: "heart", apply: (f) => ({ ...f, tags: [...new Set([...f.tags, "bestseller" as const])] }) },
    { id: "lucky", label: "Surprise me", hint: `${vibeName(lucky.vibe)} ${CATEGORY_BY_ID[lucky.category].name.toLowerCase()}, why not`, icon: "dice", apply: (f) => ({ ...DEFAULT_FILTERS, sort: f.sort, categories: [lucky.category], vibes: [lucky.vibe] }) },
  ];
}
