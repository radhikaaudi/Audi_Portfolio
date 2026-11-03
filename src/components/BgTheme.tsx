import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { connectTheme } from "../content";
import { isMuted, onMuteChange } from "../sfx";

// Minimal typings for the YouTube IFrame Player API.
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  loadVideoById(o: { videoId: string; startSeconds: number; endSeconds: number }): void;
  destroy(): void;
};
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: Record<string, number> };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

const PLAYING = 1;
const ENDED = 0;

/**
 * Loops one section (connectTheme.start → end) of the official YouTube audio while the
 * connect tape is open. Shown as a small taped "now playing" polaroid (YouTube requires
 * the player to stay visible). Fades in/out, pauses while a Spotify card is playing.
 */
export default function BgTheme({ paused }: { paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const vol = useRef(0);
  const fadeTimer = useRef(0);
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const { start, end, volume } = connectTheme;

  const fadeTo = (target: number, ms: number, then?: () => void) => {
    window.clearInterval(fadeTimer.current);
    const from = vol.current;
    const t0 = performance.now();
    fadeTimer.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      vol.current = from + (target - from) * k;
      player.current?.setVolume(Math.round(vol.current));
      if (k >= 1) {
        window.clearInterval(fadeTimer.current);
        then?.();
      }
    }, 50);
  };

  // Build the player.
  useEffect(() => {
    let alive = true;
    let poll = 0;
    let videoIdx = 0;
    loadYouTubeApi().then(() => {
      if (!alive || !host.current || !window.YT) return;
      const el = document.createElement("div");
      host.current.appendChild(el);
      player.current = new window.YT.Player(el, {
        width: 200,
        height: 200, // YouTube's minimum embed size
        videoId: connectTheme.youtube[0],
        playerVars: { origin: window.location.origin, start, end, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1, fs: 0, iv_load_policy: 3 },
        events: {
          onReady: () => {
            if (!alive) return;
            player.current?.setVolume(0);
            setReady(true);
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === PLAYING) {
              setOn(true);
              setBlocked(false);
            } else if (e.data === ENDED) {
              // reached 1:41 → jump back to 1:08 and keep going
              player.current?.seekTo(start, true);
              player.current?.playVideo();
            } else {
              setOn(false);
            }
          },
          onError: () => {
            // embedding not allowed for this upload: try the next one
            videoIdx++;
            const next = connectTheme.youtube[videoIdx];
            if (next) player.current?.loadVideoById({ videoId: next, startSeconds: start, endSeconds: end });
          },
        },
      });
      // belt and braces: also loop if 'end' is overshot
      poll = window.setInterval(() => {
        const p = player.current;
        if (p && p.getCurrentTime && p.getCurrentTime() >= end) p.seekTo(start, true);
      }, 250);
    });
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(fadeTimer.current);
      const p = player.current;
      player.current = null;
      if (p) {
        // The folder is already fading out, so stop right away: calling the player after
        // React has removed its iframe makes YouTube log "player is not attached to the DOM".
        try {
          p.pauseVideo();
          p.destroy();
        } catch {
          /* player already gone */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    const p = player.current;
    if (!p) return;
    const t = p.getCurrentTime?.() ?? 0;
    if (t < start || t >= end) p.seekTo(start, true);
    p.playVideo();
    fadeTo(volume, 1500);
    // If the browser blocked autoplay with sound, the state never reaches PLAYING.
    window.setTimeout(() => {
      if (player.current && player.current.getPlayerState() !== PLAYING) setBlocked(true);
    }, 1800);
  };
  const pause = () => fadeTo(0, 600, () => player.current?.pauseVideo());

  useEffect(() => {
    if (!ready) return;
    if (muted || paused || userPaused) pause();
    else play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, muted, paused, userPaused]);

  useEffect(() => onMuteChange(setMuted), []);

  const toggle = () => {
    if (blocked || !on) {
      setUserPaused(false);
      play();
    } else {
      setUserPaused(true);
    }
  };

  return (
    <motion.div
      className={`bg-theme ${on ? "is-on" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-theme__screen" ref={host} />
      <div className="bg-theme__caption">
        <span className="bg-theme__kicker hand">-playing in the background-</span>
        <span className="bg-theme__bars" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="bg-theme__text">
          <small>{blocked ? "tap ▶ to play the vibe" : on ? "now playing · 1:06–1:41" : "paused"}</small>
          <b>
            {connectTheme.title} · {connectTheme.artist}
          </b>
        </span>
        <button
          className="bg-theme__btn"
          onClick={toggle}
          aria-label={on ? `Pause ${connectTheme.title}` : `Play ${connectTheme.title}`}
          data-cursor={on ? "pause" : "play"}
        >
          {on ? "❚❚" : "▶"}
        </button>
      </div>
    </motion.div>
  );
}
