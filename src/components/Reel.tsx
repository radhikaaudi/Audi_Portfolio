import { useEffect, useRef, useState } from "react";
import { motion, type MotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { reel, type Frame } from "../content";
import SwirlSky, { STARS } from "./SwirlSky";

const N = reel.length;
const ANGLE = 360 / 7; // one full turn every 7 frames
const TOTAL_ANGLE = (N - 1) * ANGLE;

function useSize() {
  const get = () => {
    const w = Math.min(280, window.innerWidth * 0.52);
    return { w, h: w * 0.72, R: Math.min(440, window.innerWidth * 0.5), dy: w * 0.46 };
  };
  const [s, setS] = useState(get);
  useEffect(() => {
    const on = () => setS(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

/** Scroll-driven 3D film-strip spiral over a swirling painted night sky. */
export default function Reel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const { w, h, R, dy } = useSize();
  const [current, setCurrent] = useState(0);

  const rotateY = useTransform(p, (v) => -v * TOTAL_ANGLE);
  const y = useTransform(p, (v) => -v * (N - 1) * dy);
  // the painted sky slowly turns with the reel
  const skyRotate = useTransform(p, [0, 1], [-3, 4]);
  const skyScale = useTransform(p, [0, 0.5, 1], [1, 1.03, 1]);

  useMotionValueEvent(p, "change", (v) => setCurrent(Math.min(N - 1, Math.max(0, Math.round(v * (N - 1))))));

  const f = reel[current];

  return (
    <section className="reel" id="story" ref={ref} style={{ height: `${N * 45 + 100}vh` }} aria-label="Timeline">
      <div className="reel__sticky">
        <motion.div className="reel__sky" style={{ rotate: skyRotate, scale: skyScale }}>
          <SwirlSky className="reel__sky-canvas" />
          {STARS.map((s, i) => (
            <span
              key={i}
              className="reel__glow"
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                width: `${s.r * 520}vmin`,
                animationDelay: `${i * 0.6}s`,
              }}
              aria-hidden
            />
          ))}
        </motion.div>

        <div className="reel__head">
          <span className="hand">liner notes</span>
          <h2 className="reel__title">
            frame by <em>frame</em>
          </h2>
        </div>

        <div className="reel__stage" aria-hidden>
          <div className="reel__tilt">
            <motion.div className="reel__helix" style={{ rotateY, y }}>
              {reel.map((fr, k) => (
                <FrameEl key={k} frame={fr} k={k} w={w} h={h} R={R} dy={dy} p={p} />
              ))}
            </motion.div>
          </div>
        </div>

        <div className="reel__caption" aria-live="polite">
          <motion.div
            key={current}
            className="reel__card paper-grid"
            initial={{ opacity: 0, y: 14, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.35 }}
          >
            <span className="tape-strip" aria-hidden />
            <span className="reel__tag label">
              {String(current + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {f.tag}
            </span>
            {f.title ? (
              <p className="reel__cap-title">{f.title}</p>
            ) : (
              <p className="reel__cap-title">{f.tag === "♪" ? "night out, song on" : "under the neon lights"}</p>
            )}
            {f.line && <p className="reel__cap-line hand">{f.line}</p>}
          </motion.div>
        </div>

        <div className="reel__counter" aria-hidden>
          {reel.map((_, k) => (
            <span key={k} className={k === current ? "is-on" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FrameEl({
  frame, k, w, h, R, dy, p,
}: {
  frame: Frame; k: number; w: number; h: number; R: number; dy: number; p: MotionValue<number>;
}) {
  // Frames facing the viewer catch the starlight; frames on the far side fall into shadow.
  const light = useTransform(p, (v) => {
    const diff = ((k * ANGLE - v * TOTAL_ANGLE) * Math.PI) / 180;
    return 0.22 + 0.78 * Math.max(0, Math.cos(diff));
  });
  const filter = useTransform(light, (l) => `brightness(${l.toFixed(3)})`);

  return (
    <motion.div
      className="frame"
      style={{
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        transform: `translateY(${k * dy}px) rotateY(${k * ANGLE}deg) translateZ(${R}px)`,
        filter,
      }}
    >
      <div className={`frame__pic ${frame.photo ? "has-photo" : ""}`} data-k={k % 4}>
        {frame.photo ? (
          <img src={frame.photo} alt="" width={360} height={640} loading="lazy" decoding="async" />
        ) : (
          <>
            <span className="frame__tag label">{frame.tag}</span>
            <span className="frame__title">{frame.title}</span>
            <span className="frame__line hand">{frame.line}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
