import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { connectNote, favSongs, profile, type Song } from "../content";
import { sfx } from "../sfx";
import { Blossom } from "./Paint";
import BgTheme from "./BgTheme";

/** Spotify track id from a share link like https://open.spotify.com/track/<id>?si=… */
function trackId(url: string) {
  return /open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]+)/.exec(url)?.[1] ?? null;
}

/** Fills in title + cover art from Spotify's public oEmbed endpoint when they aren't given by hand. */
function useSongMeta(song: Song) {
  const [meta, setMeta] = useState<{ title?: string; cover?: string }>({});
  useEffect(() => {
    if (!song.spotify || (song.title && song.cover)) return;
    let alive = true;
    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(song.spotify)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setMeta({ title: d.title, cover: d.thumbnail_url });
      })
      .catch(() => {
        /* offline or blocked: keep the painted placeholder */
      });
    return () => {
      alive = false;
    };
  }, [song.spotify, song.title, song.cover]);
  return {
    title: song.title && !song.title.startsWith("TODO") ? song.title : meta.title ?? song.title ?? "untitled",
    cover: song.cover ?? meta.cover,
  };
}

/** The "let's connect" tape: a yellow folder. Profile links + pinned note on top, fav songs below. */
export default function ConnectFolder() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="folder-wrap">

      <motion.section
        className="folder"
        initial={{ opacity: 0, y: 50, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -0.6 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 110, damping: 15 }}
      >
        <span className="folder__tab" aria-hidden />

        {/* ── connect with me (top) ── */}
        <header className="folder__head">
          <h2 className="folder__title">
            <span className="folder__fav">Connect</span>
            <span className="folder__script">
              <Blossom className="folder__bloom" />
              with Me
            </span>
          </h2>
          <p className="folder__aside hand">-say hi, i reply fast-</p>
        </header>

        <div className="folder__connect">
          <ConnectLinks />

          <motion.aside
            className="note"
            initial={{ opacity: 0, rotate: 8, y: 30 }}
            animate={{ opacity: 1, rotate: 2.5, y: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 120, damping: 14 }}
          >
            <span className="note__pin" aria-hidden />
            <p className="note__text hand">{connectNote}</p>
            <div className="note__links">
              <a className="hand" href={`mailto:${profile.email}`} data-cursor="hi">
                ✉ {profile.email}
              </a>
            </div>
            <span className="note__sign hand">- r.</span>
          </motion.aside>
        </div>

        {/* ── fav songs (below) ── */}
        <section className="folder__songs" aria-label="Favourite songs">
          <header className="folder__head folder__head--small">
            <h3 className="folder__title">
              <span className="folder__fav">Fav</span>
              <span className="folder__script">Songs</span>
              <span className="folder__sub">(on repeat, in no particular order)</span>
            </h3>
            <p className="folder__aside hand">-tap a cover to play-</p>
          </header>

          <div className="folder__row">
            {favSongs.map((s, i) => (
              <SongCard
                key={i}
                song={s}
                i={i}
                active={playing === `${i}`}
                onPlay={() => {
                  sfx.click();
                  setPlaying((p) => (p === `${i}` ? null : `${i}`));
                }}
              />
            ))}
          </div>

          <AnimatePresence>
            {playing !== null && trackId(favSongs[Number(playing)].spotify) && (
              <motion.div
                key={playing}
                className="folder__player"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <iframe
                  title="Spotify player"
                  src={`https://open.spotify.com/embed/track/${trackId(favSongs[Number(playing)].spotify)}?utm_source=generator`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "Yeh Duniya" 1:06–1:41 loops softly while this tape is open; pauses when a Spotify card plays */}
          <BgTheme paused={playing !== null} />
        </section>

        <footer className="folder__foot">
          <a href={profile.links.find((l) => l.label === "Resume")?.href ?? "#"} target="_blank" rel="noreferrer">
            archive
          </a>
          <span aria-hidden>·✦·♡·✿</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </motion.section>
    </div>
  );
}

function SongCard({ song, i, active, onPlay }: { song: Song; i: number; active: boolean; onPlay: () => void }) {
  const { title, cover } = useSongMeta(song);
  const playable = !!trackId(song.spotify);
  // No exact track link yet: open the song in Spotify search instead, so the card still works.
  const searchUrl =
    !playable && song.title && !song.title.startsWith("TODO")
      ? `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist ?? ""}`.trim())}`
      : null;

  return (
    <motion.article
      className={`song ${active ? "is-playing" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        className="song__cover"
        onClick={() => (playable ? onPlay() : searchUrl && window.open(searchUrl, "_blank", "noopener"))}
        disabled={!playable && !searchUrl}
        aria-label={
          playable ? `${active ? "Close" : "Play"} ${title} on Spotify` : searchUrl ? `Find ${title} on Spotify` : `${title} (link coming soon)`
        }
        data-cursor={playable ? (active ? "stop" : "play") : searchUrl ? "open" : undefined}
      >
        {cover ? (
          <img src={cover} alt="" width={480} height={480} loading="lazy" decoding="async" />
        ) : (
          <span className={`song__placeholder p${i % 4}`} aria-hidden>
            <span className="song__disc" />
            <span className="hand">{title}</span>
          </span>
        )}
        {(playable || searchUrl) && <span className="song__play" aria-hidden>{playable ? (active ? "❚❚" : "▶") : "↗"}</span>}
      </button>
      <h3 className={`song__title ${title.startsWith("TODO") ? "todo" : ""}`}>{title}</h3>
      <p className="song__meta">
        {song.artist && !song.artist.startsWith("artist") ? song.artist : playable ? "on spotify" : "spotify link soon"}
        {song.year && <> · ({song.year})</>}
      </p>
    </motion.article>
  );
}

const HANDLES: Record<string, string> = {
  GitHub: "@radhikaaudi",
  LinkedIn: "radhika-audichya",
  LeetCode: "radhikaaudi11",
  Resume: "one page, pdf",
};

function Icon({ name }: { name: string }) {
  switch (name) {
    case "GitHub":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="4" fill="currentColor" />
          <path fill="#fff" d="M5.3 9.4h2.9v9.3H5.3zM6.7 4.8a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM10 9.4h2.8v1.3c.4-.7 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5v5H16.2v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.5H10z" />
        </svg>
      );
    case "LeetCode":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M15 4 7 12l8 8M10 12h10" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M6 2h8l5 5v15H6zM14 2v5h5M9 12h7M9 16h7" />
        </svg>
      );
  }
}

/** Big, eye-catching profile cards with a hand-drawn "find me here" scribble. */
function ConnectLinks() {
  return (
    <section className="links" aria-label="Find me online">
      <motion.p
        className="links__cue hand"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6 }}
      >
        find me here!
        <svg className="links__arrow" viewBox="0 0 120 60" aria-hidden>
          <motion.path
            d="M4 8 C 40 4, 80 14, 96 44 M84 40 l12 6 4 -13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.8, duration: 0.8, ease: "easeInOut" }}
          />
        </svg>
      </motion.p>

      <div className="links__row">
        {profile.links.map((l, i) => (
          <motion.a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className={`link-card link-card--${l.label.toLowerCase()}`}
            data-cursor="open"
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
            whileHover={{ y: -8, rotate: 0, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 200, damping: 15 }}
          >
            <span className="link-card__icon">
              <Icon name={l.label} />
            </span>
            <span className="link-card__text">
              <b>{l.label}</b>
              <small>{HANDLES[l.label] ?? ""}</small>
            </span>
            <span className="link-card__go" aria-hidden>
              ↗
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
