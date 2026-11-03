import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type MotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { photos, profile } from "../content";
import { Barcode, Blossom, Markup, StarField, TANGLE, Wire } from "./Paint";

const TILE = 40; // source pixels per tile (photo is 1080×1920)

type Tile = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  ox: number;
  oy: number;
  rot: number;
  sc: number;
  delay: number;
  col: string;
};

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

/** Landing: Radhika's full painted photo starts as scattered paint chips and assembles into an album card as you scroll. */
export default function Cover({ start }: { start: boolean }) {
  const section = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const tiles = useRef<Tile[]>([]);
  const queued = useRef(false);
  const [assembled, setAssembled] = useState(false);
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const draw = () => {
    queued.current = false;
    const cv = canvas.current;
    const im = img.current;
    const fr = frame.current;
    if (!cv || !im || !fr || !tiles.current.length) return;

    const p = reduce ? 1 : scrollYProgress.get();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Tiles land inside the photo frame of the album card.
    const cr = cv.getBoundingClientRect();
    const fb = fr.getBoundingClientRect();
    const left = fb.left - cr.left;
    const top = fb.top - cr.top;
    const s = fb.width / im.naturalWidth;
    const sY = fb.height / im.naturalHeight;

    let done = 0;
    for (const t of tiles.current) {
      let k = (p * 1.3 - t.delay) / 0.45;
      k = k < 0 ? 0 : k > 1 ? 1 : k;
      const e = 1 - Math.pow(1 - k, 3);
      if (e >= 1) done++;
      const w = t.sw * s;
      const h = t.sh * sY;
      const x = left + t.sx * s + w / 2 + t.ox * W * (1 - e);
      const y = top + t.sy * sY + h / 2 + t.oy * H * (1 - e);

      ctx.save();
      ctx.translate(x, y);
      if (e < 1) {
        ctx.rotate(t.rot * (1 - e));
        const sc = 1 + (t.sc - 1) * (1 - e);
        ctx.scale(sc, sc);
        // paint-chip shadow while it's still flying
        ctx.shadowColor = "rgba(20, 30, 50, 0.25)";
        ctx.shadowBlur = 6 * (1 - e);
        ctx.shadowOffsetY = 4 * (1 - e);
      }
      ctx.drawImage(im, t.sx, t.sy, t.sw, t.sh, -w / 2, -h / 2, w + 0.6, h + 0.6);
      if (e < 1) {
        ctx.shadowColor = "transparent";
        ctx.globalAlpha = Math.pow(1 - e, 0.7) * 0.9;
        ctx.fillStyle = t.col;
        ctx.fillRect(-w / 2, -h / 2, w + 0.6, h + 0.6);
      }
      ctx.restore();
    }

    const pct = Math.round((done / tiles.current.length) * 100);
    if (meter.current) meter.current.textContent = pct >= 100 ? "complete ✓" : `${pct}%`;
    setAssembled(pct >= 100);
  };

  const schedule = () => {
    if (queued.current) return;
    queued.current = true;
    requestAnimationFrame(draw);
  };

  useEffect(() => {
    const im = new Image();
    im.src = photos.paintedNight.src;
    im.onload = () => {
      const w = im.naturalWidth;
      const h = im.naturalHeight;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const c = off.getContext("2d", { willReadFrequently: true })!;
      c.drawImage(im, 0, 0);
      const data = c.getImageData(0, 0, w, h).data;
      const rand = seeded(2026);
      const out: Tile[] = [];
      for (let sy = 0; sy < h; sy += TILE) {
        for (let sx = 0; sx < w; sx += TILE) {
          const sw = Math.min(TILE, w - sx);
          const sh = Math.min(TILE, h - sy);
          let r = 0, g = 0, b = 0, n = 0;
          for (let y = sy; y < sy + sh; y += 4) {
            for (let x = sx; x < sx + sw; x += 4) {
              const i = (y * w + x) * 4;
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              n++;
            }
          }
          // Radhika (centre, ~45% down) assembles first, the edges of the scene last.
          const dx = (sx + sw / 2) / w - 0.5;
          const dy = (sy + sh / 2) / h - 0.45;
          const dist = Math.sqrt(dx * dx * 2.2 + dy * dy) / 0.75;
          out.push({
            sx, sy, sw, sh,
            ox: (rand() - 0.5) * 1.8,
            oy: (rand() - 0.5) * 1.5 - 0.1,
            rot: (rand() - 0.5) * 3,
            sc: 0.5 + rand() * 1.4,
            delay: Math.min(0.75, dist * 0.5 + rand() * 0.2),
            col: `rgb(${(r / n) | 0},${(g / n) | 0},${(b / n) | 0})`,
          });
        }
      }
      tiles.current = out;
      img.current = im;
      schedule();
    };
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, "change", schedule);

  const wire = useTransform(scrollYProgress, [0, 0.85], [0.05, 1]);
  const card = useTransform(scrollYProgress, [0.35, 0.8], [0, 1]);
  const stubX = useTransform(scrollYProgress, [0.55, 0.85], [60, 0]);
  const stubO = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const notes = useTransform(scrollYProgress, [0.7, 0.92], [0, 1]);

  return (
    <section className="cover" id="hello" ref={section} aria-label={`${profile.name}, ${profile.role}`}>
      <div className="cover__sticky sky" ref={sticky}>
        <motion.p
          className="cover__tag hand"
          initial={{ opacity: 0, rotate: -8 }}
          animate={start ? { opacity: 1, rotate: -4 } : undefined}
          transition={{ delay: 0.3 }}
        >
          radhika's
        </motion.p>

        <Wire
          className="cover__wire"
          d={TANGLE}
          viewBox="0 0 640 280"
          draw={wire}
          buds={[{ x: 60, y: 262, rot: 160 }]}
        />

        <div className="cover__layout">
          {/* album card + ticket stub */}
          <div className="cover__card">
            <motion.div className="cover__paper" style={{ opacity: card }} aria-hidden />
            <div className="cover__frame" ref={frame}>
              <Markup show={assembled} cross label="the human behind the code" className="cover__mk-face" delay={0.2} />
              <Markup show={assembled} className="cover__mk-frame" />
              <motion.div className="cover__flowers" style={{ opacity: card }}>
                <Blossom className="cover__flower f1" />
                <Blossom className="cover__flower f2" />
              </motion.div>
            </div>
            <motion.div className="cover__stub ticket-stub" style={{ x: stubX, opacity: stubO }}>
              <div className="ticket-stub__spine" aria-hidden />
              <div className="ticket-stub__text">
                <span>ticket:</span>
                <b>{profile.name}</b>
                <span>destination:</span>
                <b>all the right places</b>
              </div>
              <Barcode value={profile.name} className="ticket-stub__barcode" />
            </motion.div>
          </div>

          <div className="cover__text">
            <h1 className="cover__name" aria-label={profile.name}>
              <AssembleWord word={profile.firstName} p={scrollYProgress} start={start} offset={0} />
              <AssembleWord word={profile.lastName} p={scrollYProgress} start={start} offset={7} italic />
            </h1>
            <motion.p className="cover__role label" style={{ opacity: notes }}>
              {profile.role} · {profile.company}
            </motion.p>
            <motion.p className="cover__note hand" style={{ opacity: notes }}>
              i write code, play games, and always have a song on. everything here is a track from my story.
            </motion.p>
          </div>
        </div>

        <canvas ref={canvas} className="cover__canvas" role="img" aria-label={photos.paintedNight.alt} />

        <div className="cover__meter label">
          piecing me together · <span ref={meter}>0%</span>
        </div>
        <motion.p className="cover__hint hand" style={{ opacity: hint }}>
          scroll to put me together ↓
        </motion.p>

        <div className="night cover__night">
          <StarField count={16} seed={11} />
          <p className="night__quote hand">
            i want to build in all the right places, with the right people, a song in my ears and a game waiting at
            home.
          </p>
        </div>
      </div>
    </section>
  );
}

function AssembleWord({
  word,
  p,
  start,
  offset,
  italic = false,
}: {
  word: string;
  p: MotionValue<number>;
  start: boolean;
  offset: number;
  italic?: boolean;
}) {
  return (
    <span className={`cover__word ${italic ? "is-italic" : ""}`} aria-hidden>
      {word.split("").map((ch, i) => (
        <Letter key={i} ch={ch} i={i + offset} p={p} start={start} />
      ))}
    </span>
  );
}

function Letter({ ch, i, p, start }: { ch: string; i: number; p: MotionValue<number>; start: boolean }) {
  const r = useMemo(() => {
    const rand = seeded(7 + i * 31);
    return { x0: (rand() - 0.5) * 60, y0: (rand() - 0.5) * 70, rot0: (rand() - 0.5) * 160 };
  }, [i]);
  const x = useTransform(p, [0, 0.55], [`${r.x0}vw`, "0vw"]);
  const y = useTransform(p, [0, 0.55], [`${r.y0}vh`, "0vh"]);
  const rotate = useTransform(p, [0, 0.55], [r.rot0, 0]);
  return (
    <motion.span
      className="cover__letter"
      style={{ x, y, rotate }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={start ? { opacity: 1, scale: 1 } : undefined}
      transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 160, damping: 14 }}
    >
      {ch}
    </motion.span>
  );
}
