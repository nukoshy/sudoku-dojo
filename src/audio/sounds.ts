// Individual sound generators. Each takes an AudioContext and a destination
// node and schedules a short synthesized sound. No audio files are used.

export type SoundName =
  | 'place'
  | 'note'
  | 'erase'
  | 'error'
  | 'hint'
  | 'complete'
  | 'click'
  | 'belt'
  | 'stamp';

type Gen = (ctx: AudioContext, out: AudioNode) => void;

function env(ctx: AudioContext, node: GainNode, peak: number, attack: number, decay: number): void {
  const t = ctx.currentTime;
  node.gain.setValueAtTime(0, t);
  node.gain.linearRampToValueAtTime(peak, t + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  type: OscillatorType,
  freq: number,
  dur: number,
  peak = 0.2,
  startAt = 0,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  osc.connect(g).connect(out);
  g.gain.setValueAtTime(0, ctx.currentTime + startAt);
  g.gain.linearRampToValueAtTime(peak, ctx.currentTime + startAt + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.02);
}

function noiseBuffer(ctx: AudioContext, dur: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(
  ctx: AudioContext,
  out: AudioNode,
  dur: number,
  peak: number,
  filterType: BiquadFilterType,
  startFreq: number,
  endFreq: number,
): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, dur);
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(startFreq, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + dur);
  const g = ctx.createGain();
  src.connect(filter).connect(g).connect(out);
  env(ctx, g, peak, 0.005, dur);
  src.start();
  src.stop(ctx.currentTime + dur + 0.02);
}

export const SOUNDS: Record<SoundName, Gen> = {
  // Pen on paper: a click plus a soft noise burst.
  place: (ctx, out) => {
    tone(ctx, out, 'square', 220, 0.05, 0.12);
    noise(ctx, out, 0.08, 0.06, 'bandpass', 1800, 900);
  },
  // Pencil note: lighter and higher.
  note: (ctx, out) => {
    tone(ctx, out, 'triangle', 520, 0.06, 0.08);
  },
  // Eraser: white-noise sweep down.
  erase: (ctx, out) => {
    noise(ctx, out, 0.05, 0.12, 'highpass', 4000, 800);
  },
  // Soft error thud.
  error: (ctx, out) => {
    tone(ctx, out, 'sine', 140, 0.12, 0.22);
    tone(ctx, out, 'sine', 95, 0.12, 0.15);
  },
  // Hint: sine glide up.
  hint: (ctx, out) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
    osc.connect(g).connect(out);
    env(ctx, g, 0.18, 0.01, 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  },
  // Completion: C-major pentatonic chord + long sine decay.
  complete: (ctx, out) => {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(ctx, out, 'triangle', f, 0.9, 0.18, i * 0.04));
    tone(ctx, out, 'sine', 1046.5, 1.4, 0.1, 0.12);
  },
  // Button tick.
  click: (ctx, out) => {
    tone(ctx, out, 'square', 660, 0.04, 0.08);
  },
  // Belt advance: ascending 3-note fanfare.
  belt: (ctx, out) => {
    [523.25, 659.25, 880].forEach((f, i) => tone(ctx, out, 'square', f, 0.25, 0.16, i * 0.12));
  },
  // Stamp earned: soft thud.
  stamp: (ctx, out) => {
    tone(ctx, out, 'sine', 180, 0.15, 0.24);
    noise(ctx, out, 0.06, 0.08, 'lowpass', 600, 300);
  },
};
