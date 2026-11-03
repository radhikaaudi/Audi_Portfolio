import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });
  const [hover, setHover] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement).closest("a, button, [data-cursor]") as HTMLElement | null;
      setHover(t ? t.dataset.cursor ?? "" : null);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div
        className="cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: hover !== null ? (hover ? 2.6 : 1.8) : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {hover ? <span>{hover}</span> : null}
      </motion.div>
    </>
  );
}
