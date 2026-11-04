import type { Kind } from "@/lib/data";

// Sticker-style product illustrations on a 200×200 canvas.
// .gc = product colour, .gs = shade, .gh = highlight, .gk = ink, .gw = white.
// Every shape inherits the ink outline from the wrapping <g>.

const Shapes: Record<Kind, () => React.ReactNode> = {
  sneaker: () => (
    <>
      <path className="gc" d="M28 140 L33 100 Q36 88 50 90 L70 94 Q82 76 98 70 L110 73 Q122 98 150 110 Q178 121 180 138 L180 142 Z" />
      <path className="gs" stroke="none" d="M30 128 Q100 134 178 128 L180 140 L28 140 Z" />
      <path className="gw" d="M18 140 H184 Q190 140 190 147 V151 Q190 163 178 163 H30 Q18 163 18 151 Z" />
      <path className="gk" stroke="none" d="M22 152 H186 V156 Q184 160 178 160 H30 Q24 160 22 156 Z" opacity=".18" />
      <path fill="none" d="M96 86 L114 80 M102 97 L122 90 M110 107 L130 100" />
      <path className="gw" d="M48 120 Q90 104 132 122 Q96 118 52 132 Z" />
      <circle className="gk" stroke="none" cx="44" cy="104" r="4" />
    </>
  ),
  hoodie: () => (
    <>
      <path className="gc" d="M64 58 Q100 38 136 58 L166 74 Q176 80 178 92 L186 150 L162 156 L152 112 L152 172 H48 L48 112 L38 156 L14 150 L22 92 Q24 80 34 74 Z" />
      <path className="gk" d="M76 60 Q100 98 124 60 Q100 50 76 60 Z" />
      <path className="gs" stroke="none" d="M48 150 H152 V172 H48 Z" />
      <path className="gs" d="M68 128 H132 L140 158 H60 Z" />
      <path fill="none" d="M92 78 L90 108 M108 78 L110 108" />
      <circle className="gw" cx="90" cy="112" r="4" />
      <circle className="gw" cx="110" cy="112" r="4" />
      <path className="gh" stroke="none" d="M30 92 Q34 82 44 78 L40 120 L30 122 Z" />
    </>
  ),
  cap: () => (
    <>
      <path className="gc" d="M118 132 Q168 116 192 136 Q166 152 118 146 Z" />
      <path className="gs" stroke="none" d="M122 140 Q160 144 186 137 Q166 150 122 146 Z" />
      <path className="gc" d="M30 138 Q28 72 96 64 Q156 62 164 130 Q100 146 30 138 Z" />
      <path className="gh" stroke="none" d="M50 112 Q56 84 86 76 Q66 96 64 124 Z" />
      <path fill="none" d="M96 64 Q104 100 100 140 M62 72 Q60 100 64 136" />
      <circle className="gc" cx="96" cy="62" r="7" />
      <path className="gs" stroke="none" d="M32 128 Q100 138 162 124 L164 130 Q100 146 30 138 Z" />
    </>
  ),
  headphones: () => (
    <>
      <path className="gc" d="M36 118 A64 64 0 0 1 164 118 L150 118 A50 50 0 0 0 50 118 Z" />
      <path className="gh" stroke="none" d="M58 78 Q76 62 98 60 L98 66 Q78 70 64 84 Z" />
      <rect className="gc" x="22" y="104" width="40" height="66" rx="16" />
      <rect className="gc" x="138" y="104" width="40" height="66" rx="16" />
      <rect className="gk" x="54" y="112" width="14" height="50" rx="7" />
      <rect className="gk" x="132" y="112" width="14" height="50" rx="7" />
      <path className="gs" stroke="none" d="M24 150 H60 V160 Q58 168 46 168 H38 Q26 168 24 160 Z" />
      <path className="gs" stroke="none" d="M140 150 H176 V160 Q174 168 162 168 H154 Q142 168 140 160 Z" />
    </>
  ),
  speaker: () => (
    <>
      <rect className="gc" x="52" y="34" width="96" height="140" rx="18" />
      <path className="gs" stroke="none" d="M54 150 H146 V156 Q146 172 130 172 H70 Q54 172 54 156 Z" />
      <circle className="gk" cx="100" cy="122" r="32" />
      <circle className="gc" cx="100" cy="122" r="16" />
      <circle className="gh" stroke="none" cx="94" cy="116" r="5" />
      <circle className="gk" cx="100" cy="68" r="14" />
      <circle className="gw" stroke="none" cx="96" cy="64" r="3.5" />
      <path className="gh" stroke="none" d="M62 48 Q64 42 72 42 L72 140 L62 140 Z" />
    </>
  ),
  radio: () => (
    <>
      <path fill="none" d="M146 70 L170 24" />
      <circle className="gk" cx="171" cy="22" r="6" />
      <path fill="none" d="M62 70 Q62 46 100 46 Q138 46 138 70" strokeWidth="7" />
      <rect className="gc" x="26" y="68" width="148" height="96" rx="20" />
      <path className="gs" stroke="none" d="M28 140 H172 V146 Q172 162 156 162 H44 Q28 162 28 146 Z" />
      <circle className="gw" cx="72" cy="116" r="30" />
      <path fill="none" strokeWidth="4" d="M52 104 H92 M48 116 H96 M52 128 H92" />
      <rect className="gk" x="114" y="88" width="44" height="22" rx="5" />
      <path stroke="var(--c)" strokeWidth="3" d="M128 92 V106" />
      <circle className="gw" cx="122" cy="138" r="9" />
      <circle className="gw" cx="150" cy="138" r="9" />
    </>
  ),
  lamp: () => (
    <>
      <path fill="var(--c)" stroke="none" d="M58 100 H142 L176 172 H24 Z" opacity=".22" />
      <path fill="none" d="M100 100 V160" strokeWidth="7" />
      <ellipse className="gc" cx="100" cy="164" rx="40" ry="10" />
      <path className="gc" d="M70 36 H130 Q138 36 142 44 L160 100 H40 L58 44 Q62 36 70 36 Z" />
      <path className="gs" stroke="none" d="M44 88 H156 L160 100 H40 Z" />
      <path className="gh" stroke="none" d="M72 44 H84 L72 92 H60 Z" />
      <circle className="gw" cx="100" cy="104" r="8" />
    </>
  ),
  chair: () => (
    <>
      <path fill="none" strokeWidth="8" d="M64 128 L48 174 M136 128 L152 174 M80 128 L76 170 M120 128 L124 170" />
      <rect className="gc" x="56" y="34" width="88" height="80" rx="22" />
      <path className="gh" stroke="none" d="M68 46 Q70 42 76 42 L76 102 L68 102 Z" />
      <rect className="gc" x="40" y="104" width="120" height="30" rx="14" />
      <path className="gs" stroke="none" d="M42 122 H158 V124 Q156 132 146 132 H54 Q44 132 42 124 Z" />
    </>
  ),
  plant: () => (
    <>
      <path fill="#5f9e4a" d="M100 112 Q60 96 50 58 Q86 62 100 112 Z" />
      <path fill="#4b8a3a" d="M100 112 Q140 92 156 54 Q116 60 100 112 Z" />
      <path fill="#6db356" d="M100 114 Q86 64 104 22 Q124 66 100 114 Z" />
      <path fill="#57a044" d="M100 114 Q70 108 40 94 Q72 82 100 114 Z" />
      <path fill="#57a044" d="M100 114 Q132 106 162 94 Q128 80 100 114 Z" />
      <path className="gc" d="M64 120 H136 L128 174 H72 Z" />
      <rect className="gc" x="58" y="110" width="84" height="18" rx="6" />
      <path className="gs" stroke="none" d="M68 152 H132 L128 172 H72 Z" />
      <path className="gh" stroke="none" d="M74 132 H84 L80 166 H76 Z" />
    </>
  ),
  mug: () => (
    <>
      <path fill="none" strokeWidth="4" opacity=".5" d="M82 52 Q74 40 82 28 M100 52 Q92 38 100 24 M118 52 Q110 40 118 28" />
      <path className="gc" d="M134 88 Q168 86 168 118 Q168 148 134 146 L134 132 Q154 132 154 118 Q154 102 134 102 Z" />
      <path className="gc" d="M52 66 H136 V152 Q136 172 116 172 H72 Q52 172 52 152 Z" />
      <ellipse className="gk" cx="94" cy="66" rx="42" ry="8" />
      <path className="gs" stroke="none" d="M54 146 H134 V152 Q134 170 116 170 H72 Q54 170 54 152 Z" />
      <path className="gh" stroke="none" d="M64 80 H76 V150 H64 Z" />
    </>
  ),
  camera: () => (
    <>
      <path className="gc" d="M72 70 L82 48 H120 L130 70 Z" />
      <rect className="gc" x="24" y="68" width="152" height="94" rx="16" />
      <path className="gk" stroke="none" d="M26 88 H174 V96 H26 Z" opacity=".85" />
      <path className="gk" stroke="none" d="M26 132 H174 V146 H26 Z" opacity=".85" />
      <circle className="gw" cx="100" cy="116" r="38" />
      <circle className="gk" cx="100" cy="116" r="28" />
      <circle className="gc" cx="100" cy="116" r="16" />
      <circle className="gw" stroke="none" cx="92" cy="108" r="5" />
      <rect className="gw" x="140" y="74" width="24" height="12" rx="3" />
      <rect className="gk" x="38" y="58" width="22" height="12" rx="4" />
    </>
  ),
  watch: () => (
    <>
      <rect className="gc" x="78" y="16" width="44" height="168" rx="14" />
      <path className="gs" stroke="none" d="M80 150 H120 V170 Q120 182 108 182 H92 Q80 182 80 170 Z" />
      <circle fill="none" strokeWidth="3" cx="100" cy="40" r="3" />
      <circle fill="none" strokeWidth="3" cx="100" cy="164" r="3" />
      <rect className="gk" x="144" y="92" width="12" height="16" rx="3" />
      <circle className="gk" cx="100" cy="100" r="48" />
      <circle className="gw" cx="100" cy="100" r="38" />
      <path fill="none" strokeWidth="3" d="M100 66 V72 M100 128 V134 M66 100 H72 M128 100 H134" />
      <path fill="none" strokeWidth="5" d="M100 100 L100 78 M100 100 L116 108" />
      <path stroke="var(--c)" strokeWidth="2.5" d="M100 100 L84 120" />
      <circle className="gk" stroke="none" cx="100" cy="100" r="5" />
    </>
  ),
  keyboard: () => (
    <>
      <path className="gs" stroke="none" d="M24 140 H176 L180 152 Q180 160 170 160 H30 Q20 160 20 152 Z" />
      <rect className="gc" x="16" y="70" width="168" height="84" rx="14" />
      {[0, 1, 2, 3].map((row) =>
        Array.from({ length: 9 - (row === 3 ? 4 : 0) }).map((_, i) => (
          <rect
            key={`${row}-${i}`}
            className={row === 0 && i === 0 ? "gk" : "gw"}
            strokeWidth="3"
            x={row === 3 ? 30 + i * 32 : 28 + i * 16.4 + (row % 2) * 4}
            y={80 + row * 17}
            width={row === 3 ? (i === 2 ? 46 : 22) : 12}
            height="12"
            rx="3"
          />
        )),
      )}
    </>
  ),
  backpack: () => (
    <>
      <path fill="none" strokeWidth="7" d="M82 44 Q82 22 100 22 Q118 22 118 44" />
      <path className="gc" d="M52 70 Q52 40 100 40 Q148 40 148 70 V158 Q148 176 130 176 H70 Q52 176 52 158 Z" />
      <path className="gh" stroke="none" d="M62 72 Q64 52 82 48 L74 150 L62 150 Z" />
      <path fill="none" d="M60 78 Q100 64 140 78" />
      <rect className="gs" x="66" y="112" width="68" height="52" rx="14" />
      <path fill="none" d="M74 126 H126" />
      <rect className="gk" x="94" y="120" width="12" height="12" rx="3" />
    </>
  ),
  tote: () => (
    <>
      <path fill="none" strokeWidth="7" d="M70 88 Q70 32 100 32 Q130 32 130 88 M58 88 Q58 50 80 44" />
      <path className="gc" d="M42 84 H158 L168 172 H32 Z" />
      <path className="gs" stroke="none" d="M36 150 H164 L166 170 H34 Z" />
      <path className="gk" stroke="none" d="M100 104 L106 120 L122 122 L110 132 L114 148 L100 140 L86 148 L90 132 L78 122 L94 120 Z" />
      <path className="gh" stroke="none" d="M50 92 H62 L56 160 H44 Z" />
    </>
  ),
  bottle: () => (
    <>
      <rect className="gk" x="84" y="18" width="32" height="24" rx="6" />
      <path className="gc" d="M88 42 H112 L114 54 Q136 60 136 84 V160 Q136 178 118 178 H82 Q64 178 64 160 V84 Q64 60 86 54 Z" />
      <rect className="gw" x="64" y="98" width="72" height="40" />
      <path fill="none" strokeWidth="3" d="M76 112 H124 M84 124 H116" />
      <path className="gh" stroke="none" d="M72 82 Q74 68 84 64 L82 92 L72 92 Z" />
      <path className="gs" stroke="none" d="M66 150 H134 V160 Q134 176 118 176 H82 Q66 176 66 160 Z" />
    </>
  ),
  controller: () => (
    <>
      <path className="gc" d="M54 64 H146 Q176 64 184 104 L192 146 Q196 172 172 172 Q158 172 148 154 L138 138 H62 L52 154 Q42 172 28 172 Q4 172 8 146 L16 104 Q24 64 54 64 Z" />
      <path className="gs" stroke="none" d="M12 140 Q14 168 30 168 Q44 168 52 150 L60 138 H140 L148 150 Q156 168 170 168 Q188 168 190 140 L192 146 Q196 172 172 172 Q158 172 148 154 L138 138 H62 L52 154 Q42 172 28 172 Q4 172 8 146 Z" />
      <path className="gk" stroke="none" d="M48 88 H60 V100 H72 V112 H60 V124 H48 V112 H36 V100 H48 Z" />
      <circle className="gw" cx="146" cy="92" r="8" />
      <circle className="gk" cx="166" cy="108" r="8" />
      <circle className="gk" cx="126" cy="108" r="8" />
      <circle className="gw" cx="146" cy="124" r="8" />
      <circle className="gk" cx="84" cy="130" r="10" />
      <circle className="gk" cx="116" cy="130" r="10" />
    </>
  ),
  skateboard: () => (
    <>
      <path className="gk" d="M50 118 H74 L68 132 H56 Z" />
      <path className="gk" d="M126 118 H150 L144 132 H132 Z" />
      <circle className="gw" cx="62" cy="146" r="15" />
      <circle className="gw" cx="138" cy="146" r="15" />
      <circle className="gk" stroke="none" cx="62" cy="146" r="5" />
      <circle className="gk" stroke="none" cx="138" cy="146" r="5" />
      <path className="gc" d="M10 92 Q20 114 46 114 H154 Q180 114 190 92 L192 100 Q182 126 154 126 H46 Q18 126 8 100 Z" />
      <path className="gs" stroke="none" d="M14 106 Q24 120 46 120 H154 Q176 120 186 106 Q180 124 154 124 H46 Q20 124 14 106 Z" />
    </>
  ),
  ball: () => (
    <>
      <circle className="gc" cx="100" cy="104" r="64" />
      <path className="gs" stroke="none" d="M48 140 Q80 176 132 162 Q164 148 164 104 Q164 150 120 164 Q76 174 48 140 Z" />
      <path fill="none" d="M36 104 H164 M100 40 V168 M54 58 Q82 104 54 150 M146 58 Q118 104 146 150" />
      <path className="gh" stroke="none" d="M62 72 Q74 54 94 50 Q78 62 70 80 Z" />
    </>
  ),
};

export function Glyph({ kind, color, className, shadow = true }: { kind: Kind; color: string; className?: string; shadow?: boolean }) {
  const Draw = Shapes[kind];
  return (
    <svg viewBox="0 0 200 200" className={`glyph ${className ?? ""}`} style={{ ["--c" as string]: color }} aria-hidden>
      {shadow && <ellipse cx="100" cy="186" rx="62" ry="7" fill="rgba(20,20,20,.13)" />}
      <g stroke="#151515" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <Draw />
      </g>
    </svg>
  );
}
