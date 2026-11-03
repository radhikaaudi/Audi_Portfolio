import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tapes } from "../content";
import Cassette from "./Cassette";

/** A cassette rewinding on painted sky before the page appears. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + Math.ceil(Math.random() * 9));
      setN(v);
      if (v === 100) {
        clearInterval(id);
        setTimeout(() => {
          document.body.style.overflow = "";
          onDone();
        }, 400);
      }
    }, 60);
    return () => {
      clearInterval(id);
      document.body.style.overflow = "";
    };
  }, [onDone]);

  return (
    <motion.div className="loader sky" exit={{ y: "-100%" }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}>
      <div className="loader__tape">
        <Cassette tape={tapes[0]} spinning />
      </div>
      <p className="loader__label hand">rewinding the tape…</p>
      <p className="loader__count label">{String(n).padStart(3, "0")} / 100</p>
    </motion.div>
  );
}
