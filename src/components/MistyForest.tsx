import { useMemo } from "react";

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 1000;

/** A ridge line with a broad mountain shape plus small jagged "treetop" bumps, closed to the bottom. */
function ridge(seed: number, base: number, peaks: [number, number, number][], jag: number, step = 14) {
  const r = seeded(seed);
  let d = `M0 ${H} L0 ${base}`;
  for (let x = 0; x <= W; x += step) {
    let y = base;
    for (const [px, h, w] of peaks) y -= h * Math.exp(-(((x - px) / w) ** 2));
    y += (r() - 0.5) * jag + (x % (step * 2) === 0 ? -jag * 0.6 : 0);
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

/** Soft, out-of-focus misty forest and mountains (like a blurred photo behind the folder). */
export default function MistyForest({ className }: { className?: string }) {
  const layers = useMemo(
    () => [
      { d: ridge(3, 520, [[1180, 320, 260], [1450, 220, 200], [700, 90, 300]], 6, 18), fill: "#b9c7bf", blur: 10, o: 0.75 },
      { d: ridge(8, 640, [[1320, 300, 170], [980, 120, 220], [300, 80, 260]], 16), fill: "#8fa79a", blur: 9, o: 0.85 },
      { d: ridge(13, 740, [[1500, 260, 150], [1150, 90, 160], [520, 60, 220]], 22, 12), fill: "#5f7f6c", blur: 8, o: 0.92 },
      { d: ridge(21, 860, [[1560, 160, 120], [860, 40, 200]], 30, 10), fill: "#3d5c49", blur: 10, o: 0.95 },
    ],
    []
  );

  return (
    <div className={`forest ${className ?? ""}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9eeeb" />
            <stop offset="0.55" stopColor="#d5dfda" />
            <stop offset="1" stopColor="#b7c6be" />
          </linearGradient>
          <radialGradient id="forest-light" cx="0.78" cy="0.25" r="0.55">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {[8, 9, 10, 34, 48].map((b) => (
            <filter key={b} id={`fb${b}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={b} />
            </filter>
          ))}
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.65" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#forest-sky)" />
        <rect width={W} height={H} fill="url(#forest-light)" />

        {layers.map((l, i) => (
          <g key={i}>
            <path d={l.d} fill={l.fill} opacity={l.o} filter={`url(#fb${l.blur})`} />
            {/* fog drifting between each layer */}
            <rect className={`forest__fog f${i}`} x={-200} y={420 + i * 110} width={W + 400} height={170} fill="url(#fog)" filter="url(#fb34)" />
          </g>
        ))}

        {/* big blurry foreground trees on the left, like a shallow-focus photo */}
        <g filter="url(#fb48)">
          <path d="M-60 1000 L-60 120 C 40 90, 110 160, 160 120 C 240 70, 300 180, 380 160 C 450 150, 470 300, 560 330 C 620 360, 540 560, 640 640 C 700 700, 620 860, 700 1000 Z" fill="#203a2b" />
          <path d="M-60 1000 L-60 420 C 60 380, 140 470, 240 450 C 330 440, 400 560, 460 640 C 520 720, 480 880, 540 1000 Z" fill="#152a1e" />
        </g>
        <path d="M1380 1000 C 1420 880, 1460 820, 1520 790 C 1580 760, 1640 820, 1660 1000 Z" fill="#2a4535" filter="url(#fb34)" opacity="0.85" />
      </svg>
      <div className="forest__grain" />
    </div>
  );
}
