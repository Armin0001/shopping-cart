// Dummy catalogue. Everything is generated from a fixed seed so the server and
// the browser always agree on the exact same 60 products.

export type CategoryId = "wear" | "sound" | "living" | "tech" | "carry" | "play";
export type Kind =
  | "sneaker" | "hoodie" | "cap"
  | "headphones" | "speaker" | "radio"
  | "lamp" | "chair" | "plant" | "mug"
  | "camera" | "watch" | "keyboard"
  | "backpack" | "tote" | "bottle"
  | "controller" | "skateboard" | "ball";
export type ColorId =
  | "ink" | "chalk" | "tomato" | "cobalt" | "moss" | "butter"
  | "lilac" | "mint" | "blush" | "sand" | "ocean" | "plum";
export type Vibe = "minimal" | "bold" | "retro" | "cozy" | "technical";
export type Tag = "new" | "sale" | "bestseller" | "eco" | "limited";

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  kinds: Kind[];
  color: ColorId;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  kind: Kind;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  colors: ColorId[];
  vibe: Vibe;
  tags: Tag[];
  blurb: string;
  sizes?: string[];
  addedDaysAgo: number;
  drop: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "wear", name: "Wear", blurb: "Things that go on you and make you go.", kinds: ["sneaker", "hoodie", "cap"], color: "tomato" },
  { id: "sound", name: "Sound", blurb: "Small boxes that make rooms feel bigger.", kinds: ["headphones", "speaker", "radio"], color: "cobalt" },
  { id: "living", name: "Living", blurb: "Objects for the hours spent indoors.", kinds: ["lamp", "chair", "plant", "mug"], color: "butter" },
  { id: "tech", name: "Tech", blurb: "Tools with good buttons.", kinds: ["camera", "watch", "keyboard"], color: "ocean" },
  { id: "carry", name: "Carry", blurb: "For everything you refuse to leave behind.", kinds: ["backpack", "tote", "bottle"], color: "moss" },
  { id: "play", name: "Play", blurb: "Serious equipment for unserious afternoons.", kinds: ["controller", "skateboard", "ball"], color: "lilac" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export const COLORS: Record<ColorId, { name: string; hex: string }> = {
  ink: { name: "Ink", hex: "#2a2a2c" },
  chalk: { name: "Chalk", hex: "#f4f1ea" },
  tomato: { name: "Tomato", hex: "#ff5a36" },
  cobalt: { name: "Cobalt", hex: "#3157ff" },
  moss: { name: "Moss", hex: "#6f9440" },
  butter: { name: "Butter", hex: "#ffd04d" },
  lilac: { name: "Lilac", hex: "#b4a2ff" },
  mint: { name: "Mint", hex: "#78e0b4" },
  blush: { name: "Blush", hex: "#ffacbf" },
  sand: { name: "Sand", hex: "#d9c29c" },
  ocean: { name: "Ocean", hex: "#19b3c8" },
  plum: { name: "Plum", hex: "#7d3a6c" },
};
export const COLOR_IDS = Object.keys(COLORS) as ColorId[];

export const VIBES: { id: Vibe; name: string }[] = [
  { id: "minimal", name: "Minimal" },
  { id: "bold", name: "Bold" },
  { id: "retro", name: "Retro" },
  { id: "cozy", name: "Cozy" },
  { id: "technical", name: "Technical" },
];

export const TAGS: { id: Tag; name: string }[] = [
  { id: "new", name: "New" },
  { id: "sale", name: "On sale" },
  { id: "bestseller", name: "Bestseller" },
  { id: "eco", name: "Eco" },
  { id: "limited", name: "Limited" },
];

export const KIND_NAMES: Record<Kind, string> = {
  sneaker: "Sneakers", hoodie: "Hoodies", cap: "Caps",
  headphones: "Headphones", speaker: "Speakers", radio: "Radios",
  lamp: "Lamps", chair: "Chairs", plant: "Plants", mug: "Mugs",
  camera: "Cameras", watch: "Watches", keyboard: "Keyboards",
  backpack: "Backpacks", tote: "Totes", bottle: "Bottles",
  controller: "Controllers", skateboard: "Skateboards", ball: "Balls",
};

const NAMES: Record<Kind, string[]> = {
  sneaker: ["Driftstep Runner", "Kerbside Low", "Cloudhop 2", "Pacer '92"],
  hoodie: ["Overcast Hoodie", "Sunday Fleece", "Loopback Zip", "Heavy Fog Pullover"],
  cap: ["Field Cap", "Six-Panel Dusk", "Corduroy Dad Cap", "Brimline"],
  headphones: ["Halo Over-Ear", "Quiet Hours ANC", "Studio Cans", "Orbit Wireless"],
  speaker: ["Pebble Speaker", "Monolith XL", "Roomfill Mini", "Bassbox Go"],
  radio: ["Transistor 64", "Kitchen Radio", "Shortwave One", "Dial Tone"],
  lamp: ["Tilt Lamp", "Mushroom Glow", "Pivot Desk Light", "Dusk Dome"],
  chair: ["Slouch Lounger", "Bentwood One", "Stackable Café", "Low Rider Chair"],
  plant: ["Monstera in Pot", "Desk Fern", "Tall Snake Plant", "Little Pilea"],
  mug: ["Morning Mug", "Thick Rim Cup", "Diner Mug", "Speckle Mug"],
  camera: ["Point-and-Shoot 35", "Rangefinder M", "Instant Square", "Pocket Zoom"],
  watch: ["Field Watch 38", "Tide Diver", "Mono Dial", "Chrono Lite"],
  keyboard: ["Clack 75%", "Low Profile TKL", "Typewriter Board", "Split Ergo"],
  backpack: ["Daypack 22L", "Rolltop Commuter", "Trail Sling Pack", "Laptop Ruck"],
  tote: ["Market Tote", "Canvas Carryall", "Library Bag", "Big Errand Tote"],
  bottle: ["Steel Bottle 750", "Trail Flask", "Desk Carafe", "Cold Keeper"],
  controller: ["Pad Pro Wireless", "Retro Pad", "Couch Co-op Pad", "Arcade Pad"],
  skateboard: ["Street Deck 8.0", "Cruiser 29", "Pool Shape", "Mini Cruiser"],
  ball: ["Court Ball 7", "Park Football", "Beach Volley", "Pickup Hoops Ball"],
};

const BRANDS = [
  "Nordwell", "Halcyon", "Ostra", "Mono/Mono", "Loop Lab", "Paperhaus",
  "Vantaa", "Bramble", "Studio Oto", "Lumenworks", "Kiln & Co", "Weekday Supply",
];

const PRICE: Record<Kind, [number, number]> = {
  sneaker: [90, 220], hoodie: [60, 140], cap: [25, 55],
  headphones: [120, 380], speaker: [70, 300], radio: [60, 180],
  lamp: [45, 260], chair: [140, 620], plant: [18, 80], mug: [14, 38],
  camera: [180, 900], watch: [120, 480], keyboard: [90, 260],
  backpack: [70, 210], tote: [20, 70], bottle: [18, 48],
  controller: [45, 120], skateboard: [60, 180], ball: [20, 60],
};

const KIND_LINES: Record<Kind, string> = {
  sneaker: "A featherweight runner with a recycled knit upper and a sole that is roughly forty percent bounce.",
  hoodie: "Brushed-back heavyweight cotton, a hood that actually stays up, and pockets deep enough for snacks.",
  cap: "Six panels, a pre-curved brim, and a strap that never leaves a dent in your hair.",
  headphones: "Plush memory-foam cushions, forty hours of battery, and noise cancelling that hushes the commute.",
  speaker: "Room-filling sound from a box smaller than it has any right to be. Pairs in one tap.",
  radio: "Turn the dial, find a station, feel briefly like it is 1964. Also does Bluetooth.",
  lamp: "Dimmable warm light on a joint that holds any angle you throw at it.",
  chair: "Solid frame, forgiving seat, and a lean that suits both reading and staring at the ceiling.",
  plant: "Nursery-grown, pot included, and forgiving of people who forget to water things.",
  mug: "Thick-walled stoneware that keeps coffee warm through at least two meetings.",
  camera: "A sharp lens, a satisfying shutter, and dials where your thumbs expect them.",
  watch: "Sapphire crystal, 100m water resistance, and a dial you can read at a glance.",
  keyboard: "Hot-swappable switches, gasket-mounted plate, and a sound best described as 'thock'.",
  backpack: "Weatherproof shell, a padded laptop sleeve, and a back panel that breathes.",
  tote: "Heavy canvas with reinforced handles. Holds groceries, books, or one very good baguette.",
  bottle: "Double-wall steel: ice for 24 hours, tea for 12, smugness indefinitely.",
  controller: "Hall-effect sticks, clicky face buttons, and rumble you feel in your teeth.",
  skateboard: "Seven-ply maple, soft cruiser wheels, and bearings that roll like rumours.",
  ball: "Grippy composite cover that keeps its shape through a thousand pickup games.",
};

const VIBE_LINES: Record<Vibe, string> = {
  minimal: "Quiet, clean, and designed to disappear into your day.",
  bold: "Loud on purpose. Expect compliments from strangers.",
  retro: "Borrowed from an era with better fonts.",
  cozy: "Soft edges, warm tones, zero urgency.",
  technical: "Overbuilt in all the right places.",
};

const SIZES: Partial<Record<Kind, string[]>> = {
  sneaker: ["38", "39", "40", "41", "42", "43", "44", "45"],
  hoodie: ["XS", "S", "M", "L", "XL"],
  cap: ["S/M", "L/XL"],
};

// mulberry32: tiny deterministic PRNG
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): Product[] {
  const rand = rng(20261005);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const out: Product[] = [];
  const vibes = VIBES.map((v) => v.id);

  CATEGORIES.forEach((cat, ci) => {
    const used: Record<string, number> = {};
    for (let i = 0; i < 10; i++) {
      const kind = cat.kinds[i % cat.kinds.length];
      const nameIndex = used[kind] ?? 0;
      used[kind] = nameIndex + 1;
      const [lo, hi] = PRICE[kind];
      const price = Math.max(9, Math.round((lo + rand() * (hi - lo)) / 5) * 5 - 1);
      const addedDaysAgo = Math.floor(rand() * 90);
      const reviews = Math.floor(3 + rand() ** 2 * 2400);
      const rating = Math.round((3.6 + rand() * 1.4) * 10) / 10;

      const colors: ColorId[] = [];
      const colorCount = 2 + Math.floor(rand() * 3);
      while (colors.length < colorCount) {
        const c = pick(COLOR_IDS);
        if (!colors.includes(c)) colors.push(c);
      }

      const tags: Tag[] = [];
      if (addedDaysAgo < 14) tags.push("new");
      let compareAt: number | undefined;
      if (rand() < 0.27) {
        tags.push("sale");
        compareAt = Math.round((price * (1.2 + rand() * 0.25)) / 5) * 5 - 1;
      }
      if (reviews > 1100) tags.push("bestseller");
      if (rand() < 0.22) tags.push("eco");
      if (rand() < 0.12) tags.push("limited");

      const vibe = pick(vibes);
      const brand = pick(BRANDS);
      out.push({
        id: `${cat.id}-${i + 1}`,
        name: NAMES[kind][nameIndex % NAMES[kind].length],
        brand,
        category: cat.id,
        kind,
        price,
        compareAt,
        rating,
        reviews,
        colors,
        vibe,
        tags,
        blurb: `${KIND_LINES[kind]} ${VIBE_LINES[vibe]}`,
        sizes: SIZES[kind],
        addedDaysAgo,
        drop: i === 0 || (i === 5 && ci % 3 === 0),
      });
    }
  });
  return out;
}

export const PRODUCTS: Product[] = build();
export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;
export const BRAND_NAMES = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();
export const PRICE_CEIL = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 50) * 50;

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
