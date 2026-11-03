import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { Tape } from "../content";
import Cassette from "./Cassette";

type Props = {
  tape: Tape;
  from: DOMRect; // the tape's spot on the shelf
  slot: DOMRect; // the TV's tape slot
  dir: "in" | "out";
  onDone: () => void;
};

const EASE = [0.65, 0, 0.35, 1] as const;

/** A cassette that flies from the shelf into the TV slot (or back out again). */
export default function FlyingTape({ tape, from, slot, dir, onDone }: Props) {
  const w = from.width;
  const h = from.height;
  const scale = (slot.width * 0.82) / w;
  const tx = slot.left + slot.width / 2 - (from.left + w / 2);
  // Position where the tape's bottom edge sits right on the slot.
  const tyAbove = slot.top + slot.height / 2 - (h * scale) / 2 - (from.top + h / 2);

  const inward = dir === "in";
  const x = useMotionValue(inward ? 0 : tx);
  const yBase = useMotionValue(inward ? 0 : tyAbove);
  const s = useMotionValue(inward ? 1 : scale);
  const r = useMotionValue(0);
  const sink = useMotionValue(inward ? 0 : 1); // 0 = above slot, 1 = fully inside
  const y = useTransform([yBase, sink], ([a, b]: number[]) => a + b * h * scale);
  const clipPath = useTransform(sink, (v) => `inset(0% 0% ${v * 100}% 0%)`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (inward) {
        await Promise.all([
          animate(x, tx, { duration: 0.95, ease: EASE }),
          animate(yBase, [0, -90, tyAbove], { duration: 0.95, ease: EASE, times: [0, 0.35, 1] }),
          animate(s, scale, { duration: 0.95, ease: EASE }),
          animate(r, [0, -12, 0], { duration: 0.95 }),
        ]);
        if (cancelled) return;
        await animate(sink, 1, { duration: 0.5, ease: "easeIn" });
      } else {
        await animate(sink, 0, { duration: 0.45, ease: "easeOut" });
        if (cancelled) return;
        await Promise.all([
          animate(x, 0, { duration: 0.85, ease: EASE }),
          animate(yBase, [tyAbove, tyAbove - 70, 0], { duration: 0.85, ease: EASE, times: [0, 0.4, 1] }),
          animate(s, 1, { duration: 0.85, ease: EASE }),
          animate(r, [0, 10, 0], { duration: 0.85 }),
        ]);
      }
      if (!cancelled) onDone();
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per flight; the parent remounts this component for each one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="flying-tape"
      style={{ left: from.left, top: from.top, width: w, height: h, x, y, scale: s, rotate: r, clipPath }}
    >
      <Cassette tape={tape} spinning />
    </motion.div>
  );
}
