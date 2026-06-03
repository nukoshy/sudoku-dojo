import { SOUNDS, type SoundName } from './sounds';

// WebAudio engine. Lazily creates the AudioContext, resumes it on the first
// user gesture (autoplay policy), and gates all playback on settings flags.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;
  ambientEnabled = false;
  private ambientNodes: AudioNode[] = [];
  private ambientTimer: number | null = null;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Resume a suspended context — call from a user-gesture handler. */
  resume(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state === 'suspended') void ctx.resume();
    try {
      SOUNDS[name](ctx, this.master);
    } catch {
      /* ignore audio scheduling errors */
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.stopAmbient();
  }

  setAmbient(on: boolean): void {
    this.ambientEnabled = on;
    if (on && this.enabled) this.startAmbient();
    else this.stopAmbient();
  }

  // Gentle pink-ish noise bed + occasional sine pings at irregular intervals.
  private startAmbient(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.ambientTimer !== null) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.value = 0.04;
    src.connect(filter).connect(g).connect(this.master);
    src.start();
    this.ambientNodes = [src, filter, g];

    const ping = (): void => {
      if (!this.ambientEnabled) return;
      const notes = [523.25, 587.33, 659.25, 783.99, 880];
      const f = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(og).connect(this.master!);
      const t = ctx.currentTime;
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(0.06, t + 0.1);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 2);
      osc.start();
      osc.stop(t + 2.1);
      this.ambientTimer = window.setTimeout(ping, 4000 + Math.random() * 6000);
    };
    this.ambientTimer = window.setTimeout(ping, 3000);
  }

  private stopAmbient(): void {
    if (this.ambientTimer !== null) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    for (const n of this.ambientNodes) {
      try {
        (n as AudioScheduledSourceNode).stop?.();
        n.disconnect();
      } catch {
        /* noop */
      }
    }
    this.ambientNodes = [];
  }
}

export const audio = new AudioEngine();
