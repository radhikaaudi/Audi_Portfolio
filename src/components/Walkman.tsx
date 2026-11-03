import { motion } from "framer-motion";
import type { Tape } from "../content";
import Cassette from "./Cassette";
import { Wire } from "./Paint";

export type Phase = "idle" | "inserting" | "booting" | "playing" | "closing" | "ejecting";

type Props = {
  phase: Phase;
  tape: Tape | null;
  muted: boolean;
  onToggleSound: () => void;
  slotRef: React.RefObject<HTMLDivElement>;
  windowRef: React.RefObject<HTMLDivElement>;
};

const WALKMAN_WIRE =
  "M232 330 C 250 300, 300 300, 300 250 S 250 190, 280 160 S 350 170, 330 120 S 250 110, 270 70 S 340 40, 320 6";

/** A hand-painted cassette Walkman. Tapes drop into the slot on top and show through the window. */
export default function Walkman({ phase, tape, muted, onToggleSound, slotRef, windowRef }: Props) {
  const loaded = phase === "booting" || phase === "playing" || phase === "closing";
  const playing = phase === "booting" || phase === "playing";

  return (
    <div className="walkman">
      <Wire className="walkman__wire" d={WALKMAN_WIRE} viewBox="0 0 360 340" buds={[{ x: 320, y: 6, rot: 200 }]} />

      <div className="walkman__top">
        <div className="walkman__slot" ref={slotRef} aria-hidden />
        <div className="walkman__keys" aria-hidden>
          <span className={playing ? "is-down" : ""}>▶</span>
          <span>■</span>
          <span>◀◀</span>
          <span>▶▶</span>
        </div>
      </div>

      <div className="walkman__body paint">
        <div className="walkman__window" ref={windowRef}>
          {loaded && tape ? (
            <motion.div
              className="walkman__tape"
              initial={{ y: "-30%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <Cassette tape={tape} spinning={playing} />
            </motion.div>
          ) : (
            <div className="walkman__empty label">insert tape</div>
          )}
        </div>
        <div className="walkman__brand label">
          <b>radhika</b> walkman · auto reverse
        </div>
        <div className="walkman__grille" aria-hidden />
        <div className="walkman__wheel" aria-hidden />
        <span className={`walkman__led ${playing ? "is-on" : ""}`} aria-hidden />
      </div>

      <button className="walkman__sound hand" onClick={onToggleSound} aria-pressed={!muted}>
        {muted ? "sound: off (tap to turn on)" : "sound: on ♪"}
      </button>
    </div>
  );
}
