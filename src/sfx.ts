// Tiny synthesized sound effects (no audio files). Created lazily on first user gesture.
let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  listeners.forEach((fn) => fn(m));
}
export function onMuteChange(fn: (m: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function ac() {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noise(c: AudioContext, dur: number) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.08, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur);
}

function burst(dur: number, freq: number, vol: number, q = 1, delay = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const n = noise(c, dur);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f).connect(g).connect(c.destination);
  n.start(t);
}

export const sfx = {
  click: () => burst(0.04, 2500, 0.25, 2),
  clunk: () => {
    burst(0.08, 900, 0.5, 1.5);
    tone(90, 0.18, "sine", 0.35, 45);
    burst(0.05, 3000, 0.2, 3, 0.12);
  },
  eject: () => {
    burst(0.05, 2200, 0.3, 2);
    tone(140, 0.12, "sine", 0.25, 220);
    burst(0.06, 1200, 0.3, 2, 0.15);
  },
  static: (dur = 1.2) => burst(dur, 4000, 0.12, 0.3),
  whoosh: () => burst(0.35, 600, 0.15, 0.6),
  power: () => tone(60, 0.35, "sawtooth", 0.06, 15000),
  blip: (hi = false) => tone(hi ? 880 : 660, 0.08, "square", 0.05),
  catchNote: (n: number) => tone([523, 587, 659, 784, 880][n % 5], 0.12, "triangle", 0.12),
  hurt: () => {
    burst(0.25, 400, 0.3, 0.5);
    tone(200, 0.25, "sawtooth", 0.06, 60);
  },
};
