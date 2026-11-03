import { profile } from "../content";
import { Barcode, StarField } from "./Paint";

export default function Footer() {
  return (
    <footer className="footer night">
      <StarField count={26} seed={21} />
      <p className="footer__quote hand">
        thanks for listening. if you want to make the next track together, i'm one message away.
      </p>
      <div className="footer__links">
        <a className="label" href={`mailto:${profile.email}`}>
          {profile.email} ↗
        </a>
        {profile.links.map((l) => (
          <a key={l.label} className="label" href={l.href} target="_blank" rel="noreferrer">
            {l.label} ↗
          </a>
        ))}
      </div>
      <div className="footer__base">
        <span className="label">
          © {new Date().getFullYear()} {profile.name}
        </span>
        <Barcode value="radhika" className="footer__barcode" />
        <a className="hand" href="#hello">
          rewind to the start ↑
        </a>
      </div>
    </footer>
  );
}
