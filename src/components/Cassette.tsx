import type { Tape } from "../content";

const SCREWS = [
  [10, 10],
  [190, 10],
  [10, 118],
  [190, 118],
];

/** A front-facing audio cassette drawn in SVG. Reels spin when `spinning` or on hover. */
export default function Cassette({ tape, spinning = false }: { tape: Tape; spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 128"
      className={`cassette ${spinning ? "is-spinning" : ""}`}
      style={{ "--shell": tape.shell, "--stripe": tape.color } as React.CSSProperties}
      aria-hidden
    >
      <rect x="1.5" y="1.5" width="197" height="125" rx="9" className="c-shell" />
      {SCREWS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.2" className="c-screw" />
          <line x1={x - 2} y1={y} x2={x + 2} y2={y} className="c-screw-slot" />
        </g>
      ))}

      {/* label */}
      <rect x="16" y="9" width="168" height="84" rx="4" className="c-label" />
      <path d="M16 13 a4 4 0 0 1 4 -4 h160 a4 4 0 0 1 4 4 v13 h-168 z" className="c-stripe" />
      <text x="24" y="22" className="c-side">
        {tape.side}
      </text>
      <text x="100" y="44" textAnchor="middle" className="c-title">
        {tape.label}
      </text>

      {/* window with tape spools and reels */}
      <rect x="50" y="52" width="100" height="32" rx="16" className="c-window" />
      <circle cx="73" cy="68" r="15" className="c-spool" />
      <circle cx="127" cy="68" r="10" className="c-spool" />
      {[73, 127].map((cx) => (
        <g key={cx} className="c-reel">
          <circle cx={cx} cy="68" r="8" className="c-hub" />
          <circle cx={cx} cy="68" r="5" className="c-teeth" />
        </g>
      ))}

      {/* bottom head area */}
      <path d="M38 126.5 L48 100 L152 100 L162 126.5 Z" className="c-bottom" />
      <circle cx="66" cy="114" r="4" className="c-hole" />
      <circle cx="134" cy="114" r="4" className="c-hole" />
      <rect x="88" y="108" width="7" height="7" className="c-hole" />
      <rect x="105" y="108" width="7" height="7" className="c-hole" />
    </svg>
  );
}
