import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import Cover from "./components/Cover";
import Room from "./components/Room";
import Reel from "./components/Reel";
import Footer from "./components/Footer";
import { PaintDefs } from "./components/Paint";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <PaintDefs />
      <Cursor />
      <AnimatePresence>{!loaded && <Loader key="loader" onDone={() => setLoaded(true)} />}</AnimatePresence>
      <main>
        <Cover start={loaded} />
        <Room start={loaded} />
        <Reel />
      </main>
      <Footer />
    </MotionConfig>
  );
}
