import { useMemo } from "react";
import { motion, type MotionValue } from "framer-motion";

/** Global SVG filters that make flat shapes look hand-painted. Render once. */
export function PaintDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        {/* wobbly edges + gouache grain, for painted objects */}
        <filter id="gouache" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="9" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0.32 0 0 0 0.7  0.32 0 0 0 0.7  0.32 0 0 0 0.7  0 0 0 0 1" result="grain" />
          <feComposite in="grain" in2="wobbly" operator="in" result="tex" />
          <feBlend in="wobbly" in2="tex" mode="multiply" />
        </filter>
        {/* just the wobble, for lines and outlines */}
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** The tangled white earphone wire. `draw` (0–1) controls how much of it is drawn. */
export function Wire({
  d,
  viewBox,
  draw,
  className,
  buds = [],
}: {
  d: string;
  viewBox: string;
  draw?: MotionValue<number> | number;
  className?: string;
  buds?: { x: number; y: number; rot: number }[];
}) {
  const style = draw === undefined ? undefined : { pathLength: draw };
  return (
    <svg className={`wire ${className ?? ""}`} viewBox={viewBox} fill="none" aria-hidden>
      <motion.path d={d} className="wire__shadow" style={style} />
      <motion.path d={d} className="wire__line" style={style} />
      {buds.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} className="earbud">
          <path d="M-5 0 h10 v34 a5 5 0 0 1 -10 0z" />
          <ellipse cx="0" cy="-10" rx="15" ry="13" />
          <ellipse cx="4" cy="-12" rx="6" ry="5" className="earbud__mesh" />
        </g>
      ))}
    </svg>
  );
}

/** Red design-markup box: a thin frame with a crosshair and a handwritten label, drawn in with a wipe. */
export function Markup({
  label,
  show = true,
  cross = false,
  className = "",
  delay = 0,
  style,
}: {
  label?: string;
  show?: boolean;
  cross?: boolean;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.span
      className={`markup ${className}`}
      style={style}
      aria-hidden
      initial={{ clipPath: "inset(0% 100% 100% 0%)" }}
      animate={{ clipPath: show ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 100% 0%)" }}
      transition={{ duration: 0.7, delay: show ? delay : 0, ease: [0.65, 0, 0.35, 1] }}
    >
      {cross && <span className="markup__cross" />}
      {label && <span className="markup__label">{label}</span>}
    </motion.span>
  );
}

/** Deterministic barcode generated from a string. */
export function Barcode({ value, className }: { value: string; className?: string }) {
  const bars = useMemo(() => {
    let h = 2166136261;
    const out: { x: number; w: number }[] = [];
    let x = 0;
    for (let i = 0; x < 100; i++) {
      h ^= value.charCodeAt(i % value.length) + i;
      h = Math.imul(h, 16777619) >>> 0;
      const w = 1 + (h % 3);
      if (i % 2 === 0) out.push({ x, w });
      x += w + ((h >> 3) % 2);
    }
    return out;
  }, [value]);
  return (
    <svg className={`barcode ${className ?? ""}`} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="30" />
      ))}
    </svg>
  );
}

/** A spiky red blossom, like the painted flowers in the reference. */
export function Blossom({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`blossom ${className ?? ""}`} style={style} viewBox="-50 -50 100 100" aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} transform={`rotate(${r})`} d="M0 -6 C 6 -16, 5 -30, 0 -44 C -5 -30, -6 -16, 0 -6z" />
      ))}
      <circle r="6" className="blossom__heart" />
      <path d="M0 6 C 4 20, 10 32, 22 44" className="blossom__stem" />
    </svg>
  );
}

/** A four-point hand-drawn sparkle. */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`sparkle ${className ?? ""}`} style={style} viewBox="-50 -50 100 100" aria-hidden>
      <path d="M0 -46 C 3 -12, 12 -3, 46 0 C 12 3, 3 12, 0 46 C -3 12, -12 3, -46 0 C -12 -3, -3 -12, 0 -46z" />
    </svg>
  );
}

/** A field of white stars and sparkles for the dark night bands. */
export function StarField({ count = 18, seed = 3 }: { count?: number; seed?: number }) {
  const stars = useMemo(() => {
    let a = seed;
    const rand = () => {
      a = (a * 9301 + 49297) % 233280;
      return a / 233280;
    };
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: 8 + rand() * 26,
      kind: rand() < 0.55 ? "spark" : "dot",
      delay: rand() * 3,
    }));
  }, [count, seed]);
  return (
    <div className="stars" aria-hidden>
      {stars.map((s, i) =>
        s.kind === "spark" ? (
          <Sparkle
            key={i}
            className="stars__spark"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, animationDelay: `${s.delay}s` }}
          />
        ) : (
          <span key={i} className="stars__dot" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
        )
      )}
    </div>
  );
}

// A long tangled wire, reusable across sections.
export const TANGLE =
  "M620 6 C 560 20, 520 70, 470 52 S 400 -6, 372 46 S 430 132, 380 146 S 270 96, 300 50 S 392 36, 352 118 S 238 178, 214 128 S 282 66, 236 76 S 150 150, 128 196 S 92 250, 60 262";
