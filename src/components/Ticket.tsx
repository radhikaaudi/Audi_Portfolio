import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile, type Tape } from "../content";
import { sfx } from "../sfx";
import Cassette from "./Cassette";
import NoteCatcher from "./NoteCatcher";
import ConnectFolder from "./ConnectFolder";
import MistyForest from "./MistyForest";
import { Barcode, Blossom, Markup, StarField, Wire } from "./Paint";

type Props = {
  tape: Tape;
  index: number;
  total: number;
  rect: DOMRect;
  onEject: () => void;
  onSkip: (dir: 1 | -1) => void;
};

const TICKET_WIRE = "M0 40 C 60 10, 110 70, 160 40 S 240 -10, 260 50 S 200 120, 250 120 S 330 60, 380 30";

/** A tape's chapter, presented as a painted ticket + liner notes. Unfolds out of the Walkman window. */
export default function Ticket({ tape, index, total, rect, onEject, onSkip }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const closed = `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round 14px)`;
  const open = "inset(0px 0px 0px 0px round 0px)";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEject();
      if (tape.kind === "game") return; // arrows belong to the game
      if (e.key === "ArrowRight") skip(1);
      if (e.key === "ArrowLeft") skip(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [tape.id]);

  const skip = (dir: 1 | -1) => {
    sfx.click();
    onSkip(dir);
  };

  return (
    <motion.div
      className={`ticket-view ${tape.kind === "contact" ? "ticket-view--forest" : "sky"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${tape.label}`}
      style={{ "--accent": tape.color } as React.CSSProperties}
      initial={{ clipPath: closed }}
      animate={{ clipPath: open }}
      exit={{ clipPath: closed, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
    >
      <AnimatePresence>
        {tape.kind === "contact" && (
          <motion.div
            key="forest"
            className="ticket-view__bg"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <MistyForest />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="ticket-view__scroll" ref={scroller}>
        <button className="ticket-view__eject hand" onClick={onEject} data-cursor="eject">
          eject ⏏ <small>(esc)</small>
        </button>
        <p className="ticket-view__tag hand">radhika's</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={tape.id}
            initial={{ opacity: 0, y: 40, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -30, rotate: 1, transition: { duration: 0.2 } }}
            transition={{ delay: 0.45, type: "spring", stiffness: 120, damping: 16 }}
          >
            {tape.kind === "contact" ? (
              <ConnectFolder />
            ) : (
              <>
            {/* the ticket */}
            <div className="ticket">
              <Wire className="ticket__wire" d={TICKET_WIRE} viewBox="0 0 380 130" buds={[{ x: 380, y: 30, rot: 250 }]} />
              <div className="ticket__art">
                <TicketArt tape={tape} />
                <Markup show cross className="ticket__mk" label={tape.kicker.toLowerCase()} delay={0.9} />
                <Blossom className="ticket__flower t1" />
                <Blossom className="ticket__flower t2" />
                <Blossom className="ticket__flower t3" />
              </div>
              <div className="ticket__stub ticket-stub">
                <div className="ticket-stub__spine" aria-hidden />
                <div className="ticket-stub__text">
                  <span>ticket:</span>
                  <b>{tape.label}</b>
                  <span>destination:</span>
                  <b>{tape.title} {tape.titleItalic}</b>
                </div>
                <Barcode value={tape.id} className="ticket-stub__barcode" />
              </div>
            </div>

            {/* liner notes */}
            <article className="liner paper-grid">
              <p className="label liner__kicker">{tape.kicker}</p>
              <h2 className="liner__title">
                {tape.title} <em>{tape.titleItalic}</em>
              </h2>
              <TapeBody tape={tape} />
            </article>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="night ticket-view__night">
          <StarField count={14} seed={index + 5} />
          <div className="ticket-view__controls">
            <button className="hand" onClick={() => skip(-1)} aria-label="Previous tape">
              ← previous tape
            </button>
            <span className="label">
              tape {index + 1} of {total}
            </span>
            <button className="hand" onClick={() => skip(1)} aria-label="Next tape">
              next tape →
            </button>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}

function TicketArt({ tape }: { tape: Tape }) {
  if (tape.kind === "about") {
    return <img className="ticket__photo" src={tape.photo.src} alt={tape.photo.alt} width={1080} height={1920} decoding="async" />;
  }
  return (
    <div className="ticket__painting" aria-hidden>
      <div className="ticket__disc" />
      <div className="ticket__cassette">
        <Cassette tape={tape} spinning />
      </div>
    </div>
  );
}

/** Renders **bold** segments as painted highlights. */
function Rich({ text }: { text: string }) {
  return <>{text.split("**").map((s, i) => (i % 2 ? <mark key={i}>{s}</mark> : s))}</>;
}

function TapeBody({ tape }: { tape: Tape }) {
  const rise = (i: number) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  });

  const paragraphs = tape.body.map((p, i) => (
    <motion.p key={i} className={`liner__body ${p.startsWith("TODO") ? "todo" : ""}`} {...rise(i)}>
      <Rich text={p} />
    </motion.p>
  ));

  switch (tape.kind) {
    case "story":
      return (
        <>
          {paragraphs}
          {tape.points && (
            <ol className="liner__points">
              {tape.points.map((pt, i) => (
                <motion.li key={i} {...rise(i + tape.body.length)}>
                  <span className="hand">{i + 1}.</span>
                  <p>
                    <Rich text={pt} />
                  </p>
                </motion.li>
              ))}
            </ol>
          )}
          {tape.facts && (
            <dl className="stubs">
              {tape.facts.map((f, i) => (
                <motion.div key={f.label} className="stub" {...rise(i + 2)}>
                  <dt className="label">{f.label}</dt>
                  <dd>{f.value}</dd>
                </motion.div>
              ))}
            </dl>
          )}
        </>
      );
    case "projects":
      return (
        <>
          {paragraphs}
          <ol className="tracks">
            {tape.projects.map((p, i) => (
              <motion.li key={p.title} className="track-card" {...rise(i + 1)}>
                <span className="track-card__side label">
                  side {i < tape.projects.length / 2 ? "a" : "b"} · track {i + 1}
                  {p.event && <span className="track-card__event"> · {p.event}</span>}
                </span>
                <h3 className="track-card__title">{p.title}</h3>
                <p className="track-card__tag hand">{p.tagline}</p>
                <ul className="track-card__points">
                  {p.points.map((pt, k) => (
                    <li key={k}>
                      <Rich text={pt} />
                    </li>
                  ))}
                </ul>
                <ul className="chips label">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {(p.repo || p.live || p.demo) && (
                  <div className="track-card__links">
                    {p.repo && (
                      <a href={p.repo} target="_blank" rel="noreferrer" data-cursor="open">
                        <svg viewBox="0 0 16 16" aria-hidden>
                          <path
                            fill="currentColor"
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                          />
                        </svg>
                        code
                      </a>
                    )}
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer" data-cursor="open">
                        ● live
                      </a>
                    )}
                    {p.demo && (
                      <a href={p.demo} target="_blank" rel="noreferrer" data-cursor="play">
                        ▶ demo
                      </a>
                    )}
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
          <h3 className="liner__sub hand">the instruments ♪</h3>
          <div className="skills">
            {tape.skills.map((g, i) => (
              <motion.div key={g.group} className="skills__row" {...rise(i + 3)}>
                <span className="label">{g.group}</span>
                <ul className="chips label">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </>
      );
    case "about":
      return (
        <>
          {paragraphs}
          <dl className="stubs">
            {tape.loves.map((f, i) => (
              <motion.div key={f.label} className="stub" {...rise(i + 3)}>
                <dt className="label">{f.label}</dt>
                <dd className={f.value.startsWith("TODO") ? "todo" : ""}>{f.value}</dd>
              </motion.div>
            ))}
          </dl>
        </>
      );
    case "game":
      return (
        <>
          {paragraphs}
          <motion.div {...rise(1)}>
            <NoteCatcher accent={tape.color} />
          </motion.div>
        </>
      );
    case "contact":
      return (
        <>
          {paragraphs}
          <motion.a {...rise(1)} className="liner__mail" href={`mailto:${profile.email}`} data-cursor="hi">
            {profile.email} ↗
          </motion.a>
          <div className="liner__links">
            {profile.links.map((l, i) => (
              <motion.a key={l.label} className="label" href={l.href} target="_blank" rel="noreferrer" {...rise(i + 2)}>
                {l.label} ↗
              </motion.a>
            ))}
          </div>
        </>
      );
  }
}
