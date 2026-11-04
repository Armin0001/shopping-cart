import {
  BRAND_NAMES, CATEGORIES, CATEGORY_BY_ID, COLORS, KIND_NAMES, PRICE_CEIL, TAGS, VIBES,
  type CategoryId, type ColorId, type Kind, type Product, type Tag, type Vibe,
} from "./data";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "new";

export type Filters = {
  q: string;
  categories: CategoryId[];
  colors: ColorId[];
  vibes: Vibe[];
  tags: Tag[];
  brands: string[];
  excludeKinds: Kind[];
  price: [number, number];
  minRating: number;
  sort: SortKey;
};

export const DEFAULT_FILTERS: Filters = {
  q: "",
  categories: [],
  colors: [],
  vibes: [],
  tags: [],
  brands: [],
  excludeKinds: [],
  price: [0, PRICE_CEIL],
  minRating: 0,
  sort: "featured",
};

export const SORTS: { id: SortKey; name: string }[] = [
  { id: "featured", name: "Featured" },
  { id: "new", name: "Newest" },
  { id: "price-asc", name: "Price ↑" },
  { id: "price-desc", name: "Price ↓" },
  { id: "rating", name: "Top rated" },
];

function haystack(p: Product) {
  return [
    p.name, p.brand, CATEGORY_BY_ID[p.category].name, KIND_NAMES[p.kind], p.kind, p.vibe,
    ...p.colors.map((c) => COLORS[c].name), ...p.tags,
  ].join(" ").toLowerCase();
}
const HAY = new Map<string, string>();
const hay = (p: Product) => {
  let h = HAY.get(p.id);
  if (!h) HAY.set(p.id, (h = haystack(p)));
  return h;
};

export function matches(p: Product, f: Filters) {
  if (f.categories.length && !f.categories.includes(p.category)) return false;
  if (f.colors.length && !p.colors.some((c) => f.colors.includes(c))) return false;
  if (f.vibes.length && !f.vibes.includes(p.vibe)) return false;
  if (f.tags.length && !f.tags.every((t) => p.tags.includes(t))) return false;
  if (f.brands.length && !f.brands.includes(p.brand)) return false;
  if (f.excludeKinds.includes(p.kind)) return false;
  if (p.price < f.price[0] || p.price > f.price[1]) return false;
  if (p.rating < f.minRating) return false;
  if (f.q.trim()) {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    const h = hay(p);
    if (!words.every((w) => h.includes(w))) return false;
  }
  return true;
}

export function sortProducts(list: Product[], sort: SortKey) {
  const out = [...list];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.price - b.price);
    case "price-desc": return out.sort((a, b) => b.price - a.price);
    case "rating": return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "new": return out.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    default: return out;
  }
}

export function applyFilters(list: Product[], f: Filters) {
  return sortProducts(list.filter((p) => matches(p, f)), f.sort);
}

export type Chip = { key: string; label: string; remove: (f: Filters) => Filters };

const without = <T,>(arr: T[], v: T) => arr.filter((x) => x !== v);

export function chipsFor(f: Filters): Chip[] {
  const chips: Chip[] = [];
  if (f.q.trim()) chips.push({ key: "q", label: `“${f.q.trim()}”`, remove: (x) => ({ ...x, q: "" }) });
  f.categories.forEach((c) => chips.push({ key: `cat-${c}`, label: CATEGORY_BY_ID[c].name, remove: (x) => ({ ...x, categories: without(x.categories, c) }) }));
  if (f.price[0] > 0 || f.price[1] < PRICE_CEIL) {
    const label = f.price[0] <= 0 ? `Under $${f.price[1]}` : f.price[1] >= PRICE_CEIL ? `Over $${f.price[0]}` : `$${f.price[0]}–$${f.price[1]}`;
    chips.push({ key: "price", label, remove: (x) => ({ ...x, price: [0, PRICE_CEIL] }) });
  }
  f.colors.forEach((c) => chips.push({ key: `color-${c}`, label: COLORS[c].name, remove: (x) => ({ ...x, colors: without(x.colors, c) }) }));
  f.vibes.forEach((v) => chips.push({ key: `vibe-${v}`, label: VIBES.find((x) => x.id === v)!.name, remove: (x) => ({ ...x, vibes: without(x.vibes, v) }) }));
  f.tags.forEach((t) => chips.push({ key: `tag-${t}`, label: TAGS.find((x) => x.id === t)!.name, remove: (x) => ({ ...x, tags: without(x.tags, t) }) }));
  f.brands.forEach((b) => chips.push({ key: `brand-${b}`, label: b, remove: (x) => ({ ...x, brands: without(x.brands, b) }) }));
  f.excludeKinds.forEach((k) => chips.push({ key: `ex-${k}`, label: `No ${KIND_NAMES[k].toLowerCase()}`, remove: (x) => ({ ...x, excludeKinds: without(x.excludeKinds, k) }) }));
  if (f.minRating > 0) chips.push({ key: "rating", label: `${f.minRating}★+`, remove: (x) => ({ ...x, minRating: 0 }) });
  return chips;
}

export const hasActiveFilters = (f: Filters) => chipsFor(f).length > 0;

// ---------------------------------------------------------------------------
// "Smart search": turns casual phrases like "cozy blue stuff under 80" into
// structured filters, leaving whatever it didn't understand as free text.
// ---------------------------------------------------------------------------

const COLOR_WORDS: Record<string, ColorId[]> = {
  black: ["ink"], dark: ["ink", "plum"], white: ["chalk"], cream: ["chalk", "sand"],
  red: ["tomato"], orange: ["tomato"], blue: ["cobalt", "ocean"], navy: ["cobalt"],
  green: ["moss", "mint"], yellow: ["butter"], purple: ["lilac", "plum"], violet: ["lilac"],
  pink: ["blush"], beige: ["sand"], brown: ["sand"], teal: ["ocean", "mint"], cyan: ["ocean"],
};
const TAG_WORDS: Record<string, Tag> = {
  new: "new", fresh: "new", latest: "new", sale: "sale", deal: "sale", deals: "sale", discount: "sale",
  bestseller: "bestseller", popular: "bestseller", eco: "eco", sustainable: "eco", limited: "limited", rare: "limited",
};
const STOP = new Set(["a", "an", "the", "for", "and", "with", "in", "of", "some", "stuff", "things", "thing", "me", "show", "i", "want", "need", "on", "that", "is", "are", "my", "something"]);

export type Parsed = { patch: Partial<Filters>; understood: string[]; rest: string };

export function parseQuery(input: string): Parsed {
  const patch: Partial<Filters> = {};
  const understood: string[] = [];
  const rest: string[] = [];
  const tokens = input.toLowerCase().replace(/[$,]/g, " ").split(/\s+/).filter(Boolean);
  const push = <K extends keyof Filters>(k: K, v: Filters[K] extends (infer U)[] ? U : never) => {
    const arr = ((patch[k] as unknown[]) ?? []) as unknown[];
    if (!arr.includes(v)) (patch as Record<string, unknown>)[k] = [...arr, v];
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].replace(/[^a-z0-9.★+-]/g, "");
    if (!t) continue;
    if (t === "cheap" || t === "affordable" || t === "budget") {
      patch.price = [0, 50];
      understood.push("Under $50");
      continue;
    }
    const next = Number(tokens[i + 1]?.replace(/[^0-9.]/g, ""));
    if ((t === "under" || t === "below" || t === "less" || t === "max" || t === "<") && next > 0) {
      patch.price = [patch.price?.[0] ?? 0, next];
      understood.push(`Under $${next}`);
      i++;
      if (tokens[i + 1] === "than") i++;
      continue;
    }
    if ((t === "over" || t === "above" || t === "more" || t === "min" || t === ">") && next > 0) {
      patch.price = [next, patch.price?.[1] ?? PRICE_CEIL];
      understood.push(`Over $${next}`);
      i++;
      continue;
    }
    if (t === "than") continue;
    const cat = CATEGORIES.find((c) => c.id === t || c.name.toLowerCase() === t);
    if (cat) { push("categories", cat.id); understood.push(cat.name); continue; }
    const vibe = VIBES.find((v) => v.id === t);
    if (vibe) { push("vibes", vibe.id); understood.push(vibe.name); continue; }
    const colorId = (Object.keys(COLORS) as ColorId[]).find((c) => c === t || COLORS[c].name.toLowerCase() === t);
    if (colorId) { push("colors", colorId); understood.push(COLORS[colorId].name); continue; }
    if (COLOR_WORDS[t]) { COLOR_WORDS[t].forEach((c) => push("colors", c)); understood.push(t[0].toUpperCase() + t.slice(1)); continue; }
    if (TAG_WORDS[t]) { push("tags", TAG_WORDS[t]); understood.push(TAGS.find((x) => x.id === TAG_WORDS[t])!.name); continue; }
    if (/^(top|best|rated|toprated)$/.test(t)) { patch.minRating = 4.5; patch.sort = "rating"; understood.push("4.5★+"); continue; }
    const brand = BRAND_NAMES.find((b) => b.toLowerCase().split(/[^a-z]/)[0] === t);
    if (brand) { push("brands", brand); understood.push(brand); continue; }
    if (STOP.has(t)) continue;
    rest.push(t.replace(/s$/, ""));
  }
  return { patch, understood: Array.from(new Set(understood)), rest: rest.join(" ") };
}
