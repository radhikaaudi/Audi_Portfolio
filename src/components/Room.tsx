import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { tapes, type Tape } from "../content";
import { isMuted, onMuteChange, setMuted, sfx } from "../sfx";
import Cassette from "./Cassette";
import FlyingTape from "./FlyingTape";
import Ticket from "./Ticket";
import Walkman, { type Phase } from "./Walkman";
import { Markup } from "./Paint";

/** The mixtape desk: painted cassettes on graph paper and a Walkman that plays them. */
export default function Room({ start: ready }: { start: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const start = ready && inView;
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState<Tape | null>(null);
  const [flight, setFlight] = useState<{ from: DOMRect; slot: DOMRect } | null>(null);
  const [openRect, setOpenRect] = useState<DOMRect | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [muted, setMutedState] = useState(isMuted());

  const tapeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slotRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();

  useEffect(() => onMuteChange(setMutedState), []);

  const measure = (t: Tape) => ({
    from: tapeRefs.current[t.id]!.getBoundingClientRect(),
    slot: slotRef.current!.getBoundingClientRect(),
  });

  // 1. Click a tape → it flies into the Walkman's slot.
  const play = (t: Tape) => {
    if (phase !== "idle") return;
    slotRef.current?.scrollIntoView({ block: "nearest" });
    sfx.whoosh();
    setFlight(measure(t));
    setActive(t);
    setHovered(null);
    setPhase("inserting");
  };

  // 2. Tape is in → reels spin, then its ticket opens out of the Walkman window.
  const onInserted = () => {
    sfx.clunk();
    setPhase("booting");
    timer.current = window.setTimeout(() => {
      setOpenRect(windowRef.current!.getBoundingClientRect());
      setPhase("playing");
    }, 1100);
  };

  // 3. Eject → ticket folds back into the Walkman, then the tape pops back onto the desk.
  const eject = useCallback(() => {
    sfx.eject();
    setPhase("closing");
  }, []);
  const onClosed = () => {
    if (!active) return;
    setFlight(measure(active));
    setPhase("ejecting");
  };
  const onEjected = () => {
    sfx.click();
    setPhase("idle");
    setActive(null);
  };
  const skip = (dir: 1 | -1) => {
    if (!active) return;
    const i = tapes.findIndex((t) => t.id === active.id);
    setActive(tapes[(i + dir + tapes.length) % tapes.length]);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    document.body.style.overflow = phase === "idle" ? "" : "hidden";
  }, [phase]);

  const activeIndex = active ? tapes.findIndex((t) => t.id === active.id) : 0;

  return (
    <section className="desk paper-grid" id="tapes" ref={sectionRef}>
      <header className="desk__head">
        <p className="label desk__kicker">side a + side b · {tapes.length} tapes</p>
        <h2 className="desk__title">
          <span className="desk__title-box">
            pick a <em>tape,</em>
            <Markup show={start} cross label="start here" className="desk__mk" delay={0.4} />
          </span>
        </h2>
        <p className="hand desk__sub">press play and i'll tell you that part of the story ↘</p>
      </header>

      <div className="desk__grid">
        <div className="desk__tapes">
          {tapes.map((t, i) => (
            <motion.button
              key={t.id}
              ref={(el) => {
                tapeRefs.current[t.id] = el;
              }}
              className="tape-btn"
              aria-label={`Play tape ${i + 1}: ${t.label}`}
              data-cursor="play"
              onClick={() => play(t)}
              onMouseEnter={() => {
                if (phase !== "idle") return;
                setHovered(t.id);
                sfx.blip();
              }}
              onMouseLeave={() => setHovered((h) => (h === t.id ? null : h))}
              onFocus={() => setHovered(t.id)}
              onBlur={() => setHovered(null)}
              disabled={phase !== "idle"}
              style={{ visibility: active?.id === t.id && phase !== "idle" ? "hidden" : "visible" }}
              initial={{ opacity: 0, y: 80, rotate: (i % 2 ? 1 : -1) * 20 }}
              animate={start ? { opacity: 1, y: 0, rotate: ((i * 37) % 9) - 4 } : undefined}
              whileHover={phase === "idle" ? { y: -10, rotate: 0, scale: 1.05 } : undefined}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 170, damping: 16, delay: start ? 0.15 + i * 0.07 : 0 }}
            >
              <Cassette tape={t} />
              <Markup show={hovered === t.id} cross label={`0${i + 1} · ${t.label}`} className="tape-btn__mk" />
            </motion.button>
          ))}
        </div>

        <motion.div
          className="desk__walkman"
          initial={{ opacity: 0, y: 40, rotate: 3 }}
          animate={start ? { opacity: 1, y: 0, rotate: -2 } : undefined}
          transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.2 }}
        >
          <Walkman
            phase={phase}
            tape={active}
            muted={muted}
            onToggleSound={() => setMuted(!muted)}
            slotRef={slotRef}
            windowRef={windowRef}
          />
        </motion.div>
      </div>

      {(phase === "inserting" || phase === "ejecting") && flight && active && (
        <FlyingTape
          key={phase}
          tape={active}
          from={flight.from}
          slot={flight.slot}
          dir={phase === "inserting" ? "in" : "out"}
          onDone={phase === "inserting" ? onInserted : onEjected}
        />
      )}

      <AnimatePresence onExitComplete={onClosed}>
        {phase === "playing" && active && openRect && (
          <Ticket
            key="ticket"
            tape={active}
            index={activeIndex}
            total={tapes.length}
            rect={openRect}
            onEject={eject}
            onSkip={skip}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
