import { useEffect, useRef, useState } from "react";
import { sfx } from "../sfx";
import { resolveColor } from "../theme";

type Thing = { x: number; y: number; vy: number; kind: "note" | "static"; glyph: string; rot: number };
type State = "ready" | "playing" | "over";

const ROUND = 30;
const GLYPHS = ["♪", "♫", "♩", "♬"];
const BEST_KEY = "radhika-note-catcher-best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** An original mini-game: catch falling notes with a cassette, dodge static. */
export default function NoteCatcher({ accent }: { accent: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("ready");
  const [hud, setHud] = useState({ score: 0, lives: 3, time: ROUND });
  const [best, setBest] = useState(readBest);
  const input = useRef({ x: 0.5, left: false, right: false });

  useEffect(() => {
    if (state !== "playing") return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const accentColor = resolveColor(accent);
    let raf = 0;
    let last = performance.now();
    let spawn = 0;
    let elapsed = 0;
    let score = 0;
    let lives = 3;
    let streak = 0;
    let px = input.current.x;
    const things: Thing[] = [];

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // input: keyboard nudges, pointer sets target
      if (input.current.left) input.current.x -= dt * 1.1;
      if (input.current.right) input.current.x += dt * 1.1;
      input.current.x = Math.min(0.95, Math.max(0.05, input.current.x));
      px += (input.current.x - px) * Math.min(1, dt * 14);

      // spawn, getting faster over time
      spawn -= dt;
      if (spawn <= 0) {
        const hard = elapsed / ROUND;
        spawn = 0.55 - hard * 0.3;
        const isStatic = Math.random() < 0.18 + hard * 0.15;
        things.push({
          x: 0.06 + Math.random() * 0.88,
          y: -0.05,
          vy: 0.28 + Math.random() * 0.18 + hard * 0.3,
          kind: isStatic ? "static" : "note",
          glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
          rot: (Math.random() - 0.5) * 0.6,
        });
      }

      const pw = Math.max(70, W * 0.11);
      const ph = pw * 0.64;
      const py = H - ph - 16;

      ctx.clearRect(0, 0, W, H);

      for (let i = things.length - 1; i >= 0; i--) {
        const t = things[i];
        t.y += t.vy * dt;
        const x = t.x * W;
        const y = t.y * H;
        const hit = y > py - 10 && y < py + ph * 0.6 && Math.abs(x - px * W) < pw / 2 + 8;
        if (hit) {
          things.splice(i, 1);
          if (t.kind === "note") {
            score += 1 + Math.floor(streak / 5);
            streak++;
            sfx.catchNote(streak);
          } else {
            lives--;
            streak = 0;
            sfx.hurt();
          }
          continue;
        }
        if (t.y > 1.05) {
          things.splice(i, 1);
          if (t.kind === "note") streak = 0;
          continue;
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t.rot);
        if (t.kind === "note") {
          ctx.fillStyle = accentColor;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 12;
          ctx.font = `${Math.max(26, W * 0.035)}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(t.glyph, 0, 0);
        } else {
          const s = Math.max(22, W * 0.03);
          for (let k = 0; k < 40; k++) {
            const v = (Math.random() * 255) | 0;
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fillRect(-s / 2 + Math.random() * s, -s / 2 + Math.random() * s, 3, 3);
          }
          ctx.strokeStyle = "rgba(255,80,80,.8)";
          ctx.strokeRect(-s / 2, -s / 2, s, s);
        }
        ctx.restore();
      }

      drawTape(ctx, px * W, py, pw, ph, accentColor);

      const time = Math.max(0, ROUND - elapsed);
      setHud({ score, lives, time: Math.ceil(time) });

      if (lives <= 0 || time <= 0) {
        setState("over");
        setBest((b) => {
          const nb = Math.max(b, score);
          try {
            localStorage.setItem(BEST_KEY, String(nb));
          } catch {
            /* storage unavailable */
          }
          return nb;
        });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, accent]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") input.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") input.current.right = true;
      if ((e.key === " " || e.key === "Enter") && state !== "playing") {
        e.preventDefault();
        start();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") input.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") input.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  const start = () => {
    sfx.blip(true);
    setHud({ score: 0, lives: 3, time: ROUND });
    setState("playing");
  };

  const onPointer = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    input.current.x = (e.clientX - r.left) / r.width;
  };

  return (
    <div className="game" onPointerMove={onPointer} onPointerDown={onPointer} style={{ touchAction: "none" }}>
      <div className="game__hud vt">
        <span>SCORE {String(hud.score).padStart(3, "0")}</span>
        <span>{"♥".repeat(Math.max(0, hud.lives))}{"♡".repeat(3 - Math.max(0, hud.lives))}</span>
        <span>TIME {String(hud.time).padStart(2, "0")}</span>
        <span>BEST {String(best).padStart(3, "0")}</span>
      </div>
      <canvas ref={canvas} className="game__canvas" aria-label="Note Catcher game" />
      {state !== "playing" && (
        <div className="game__overlay">
          <p className="game__title vt">{state === "over" ? "GAME OVER" : "NOTE CATCHER"}</p>
          {state === "over" && <p className="vt game__score">SCORE {hud.score}</p>}
          <button className="game__start vt" onClick={start} data-cursor="go">
            {state === "over" ? "▶ PLAY AGAIN" : "▶ PRESS START"}
          </button>
          <p className="game__help vt">← → keys or move your mouse / finger</p>
        </div>
      )}
    </div>
  );
}

function drawTape(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number, accent: string) {
  const x = cx - w / 2;
  ctx.save();
  ctx.fillStyle = "#1b1d22";
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f4f5f7";
  ctx.fillRect(x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.55);
  ctx.fillStyle = accent;
  ctx.fillRect(x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.12);
  ctx.fillStyle = "#15161a";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.25, y + h * 0.32, w * 0.5, h * 0.22, h * 0.11);
  ctx.fill();
  ctx.fillStyle = "#eceef2";
  for (const fx of [0.36, 0.64]) {
    ctx.beginPath();
    ctx.arc(x + w * fx, y + h * 0.43, h * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
