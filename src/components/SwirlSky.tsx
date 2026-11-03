import { useEffect, useRef } from "react";

/**
 * A swirling night sky painted procedurally with thousands of short impasto-style
 * brush strokes that follow a flow field of vortices around glowing stars.
 * Painted once per size (it's static), so it costs nothing while scrolling.
 */

type Vortex = { x: number; y: number; r: number; spin: number };
type Star = { x: number; y: number; r: number; moon?: boolean };

// Positions are fractions of the canvas; radii are fractions of min(W, H).
// ZOOM < 1 = a wider, zoomed-out view: smaller swirls and stars, finer strokes, more sky.
const ZOOM = 0.45;
const VORTICES: Vortex[] = [
  { x: 0.42, y: 0.34, r: 0.11, spin: 1 },
  { x: 0.63, y: 0.47, r: 0.07, spin: -1 },
  { x: 0.25, y: 0.53, r: 0.065, spin: 1 },
  { x: 0.81, y: 0.6, r: 0.06, spin: 1 },
  { x: 0.11, y: 0.27, r: 0.06, spin: -1 },
  { x: 0.9, y: 0.3, r: 0.055, spin: 1 },
  { x: 0.53, y: 0.64, r: 0.05, spin: -1 },
  { x: 0.33, y: 0.17, r: 0.05, spin: 1 },
];
export const STARS: Star[] = [
  { x: 0.86, y: 0.13, r: 0.036, moon: true },
  { x: 0.14, y: 0.12, r: 0.02 },
  { x: 0.3, y: 0.08, r: 0.015 },
  { x: 0.5, y: 0.1, r: 0.017 },
  { x: 0.66, y: 0.2, r: 0.014 },
  { x: 0.94, y: 0.42, r: 0.015 },
  { x: 0.05, y: 0.4, r: 0.016 },
  { x: 0.46, y: 0.72, r: 0.014 },
  { x: 0.23, y: 0.74, r: 0.012 },
  { x: 0.73, y: 0.74, r: 0.013 },
  { x: 0.7, y: 0.07, r: 0.012 },
  { x: 0.07, y: 0.06, r: 0.011 },
  { x: 0.19, y: 0.4, r: 0.011 },
  { x: 0.58, y: 0.31, r: 0.012 },
  { x: 0.37, y: 0.47, r: 0.01 },
  { x: 0.9, y: 0.8, r: 0.011 },
];

const BLUES = ["#0b2463", "#14358a", "#1d4ba6", "#2a62c0", "#3f7bd0", "#6b9ddf", "#9fc2ea"];
const YELLOWS = ["#f6cf3a", "#f3dc6e", "#fbedaa", "#e6b52f", "#fff6cf"];
const CREAMS = ["#e9e3b0", "#d8e2c8", "#c3d8e6"];
const DARKS = ["#071538", "#0c1f4f", "#12305f", "#1b3f6a"];

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

function paint(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const rand = seeded(1889);
  const m = Math.min(W, H);
  const sc = 0.62 * ZOOM * Math.max(0.8, Math.min(W, 1800) / 1300);
  const pick = (arr: string[]) => arr[(rand() * arr.length) | 0];

  const vort = VORTICES.map((v) => ({ x: v.x * W, y: v.y * H, r: v.r * m, spin: v.spin }));
  const stars = STARS.map((s) => ({ x: s.x * W, y: s.y * H, r: s.r * m, moon: s.moon }));
  const hill = (x: number) => H * (0.9 + 0.035 * Math.sin(x / W * 7 + 1) + 0.02 * Math.sin(x / W * 17));

  // flow direction at a point
  const field = (x: number, y: number) => {
    let vx = 1;
    let vy = 0.35 * Math.sin((x / W) * 6 + (y / H) * 3) + 0.2 * Math.cos((y / H) * 9);
    for (const v of vort) {
      const dx = x - v.x;
      const dy = y - v.y;
      const d = Math.hypot(dx, dy) + 1e-3;
      const f = 3.2 * Math.exp(-((d / v.r) ** 2)) * v.spin;
      vx += (-dy / d) * f;
      vy += (dx / d) * f;
    }
    for (const s of stars) {
      const dx = x - s.x;
      const dy = y - s.y;
      const d = Math.hypot(dx, dy) + 1e-3;
      const f = 2.6 * Math.exp(-(((d - s.r * 1.4) / (s.r * 0.9)) ** 2));
      vx += (-dy / d) * f;
      vy += (dx / d) * f;
    }
    const n = Math.hypot(vx, vy) + 1e-6;
    return [vx / n, vy / n];
  };
  const nearStar = (x: number, y: number) => {
    let best = 0;
    for (const s of stars) {
      const d = Math.hypot(x - s.x, y - s.y);
      best = Math.max(best, Math.exp(-((d / (s.r * 2.3)) ** 2)));
    }
    return best;
  };

  // underpainting
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a1f57");
  g.addColorStop(0.55, "#163b8a");
  g.addColorStop(1, "#0b1d4a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // sky strokes
  const count = Math.round((W * H) / (70 * ZOOM * ZOOM)); // keep density with finer strokes
  for (let i = 0; i < count; i++) {
    let x = rand() * W;
    let y = rand() * H;
    const below = y > hill(x);
    const glow = nearStar(x, y);
    const band = Math.exp(-(((y / H - 0.58 - 0.04 * Math.sin((x / W) * 11)) / 0.035) ** 2)); // the pale cloud band
    let color: string;
    if (below) color = pick(DARKS);
    else if (glow > 0.35 + rand() * 0.4) color = pick(YELLOWS);
    else if (band > 0.5 && rand() < 0.55) color = pick(CREAMS);
    else color = BLUES[Math.min(BLUES.length - 1, Math.floor(rand() ** 1.3 * BLUES.length))];

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.75 + rand() * 0.25;
    ctx.lineWidth = (2.6 + rand() * 2.6) * sc;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 4 + ((rand() * 5) | 0);
    const step = (3 + rand() * 2.5) * sc;
    for (let k = 0; k < steps; k++) {
      const [fx, fy] = below ? [1, 0.15 * Math.sin(x / 40)] : field(x, y);
      x += fx * step;
      y += fy * step;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // star halos: rings of short tangential dabs, then a glowing core
  for (const s of stars) {
    const rings = s.moon ? 7 : 5;
    for (let k = 0; k < rings; k++) {
      const rr = s.r * (0.35 + (k / rings) * 1.35);
      const dabs = Math.round((rr * 2 * Math.PI) / (5 * sc));
      for (let j = 0; j < dabs; j++) {
        const a = (j / dabs) * Math.PI * 2 + rand() * 0.2;
        const x = s.x + Math.cos(a) * rr;
        const y = s.y + Math.sin(a) * rr;
        const outer = k / rings;
        ctx.strokeStyle = outer > 0.7 && rand() < 0.5 ? pick(BLUES.slice(3)) : pick(YELLOWS);
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = (2.4 + rand() * 2) * sc;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.sin(a) * 7 * sc, y + Math.cos(a) * 7 * sc);
        ctx.stroke();
      }
    }
    const core = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 0.6);
    core.addColorStop(0, "#fffbe3");
    core.addColorStop(0.6, "#f8dc5a");
    core.addColorStop(1, "rgba(246, 207, 58, 0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    if (s.moon) {
      // crescent bite
      ctx.fillStyle = "#e9b52e";
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(s.x + s.r * 0.18, s.y - s.r * 0.1, s.r * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // rolling hills silhouette outline strokes
  ctx.globalAlpha = 0.9;
  for (let x = 0; x < W; x += 3 * sc) {
    ctx.strokeStyle = pick(["#2a4f86", "#355e98", "#1b3a6c"]);
    ctx.lineWidth = 3 * sc;
    ctx.beginPath();
    ctx.moveTo(x, hill(x) + rand() * 4);
    ctx.lineTo(x + 6 * sc, hill(x + 6 * sc) + 6 + rand() * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function SwirlSky({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    let timer = 0;
    let lastW = 0;
    const render = () => {
      const W = Math.round(cv.clientWidth);
      const H = Math.round(cv.clientHeight);
      if (!W || !H || Math.abs(W - lastW) < 40) return; // ignore tiny resizes (mobile URL bar)
      lastW = W;
      cv.width = W;
      cv.height = H;
      paint(cv.getContext("2d")!, W, H);
    };
    render();
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(render, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
