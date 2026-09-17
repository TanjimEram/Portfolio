/**
 * Tiny Web Audio synth — no libraries.
 * Notes come from D major pentatonic (D E F# A B), so any order of hovers sounds fine.
 * The AudioContext is created lazily inside a user gesture and resumed if suspended.
 */

const SCALE = [62, 64, 66, 69, 71]; // MIDI: D4 E4 F#4 A4 B4
const midiToHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Scale degree → frequency, climbing octaves as the index grows. */
export function noteFor(index: number): number {
  const i = Math.max(0, index);
  return midiToHz(SCALE[i % SCALE.length]! + 12 * Math.floor(i / SCALE.length));
}

export interface Synth {
  /** Warm pluck at `hz`. */
  pluck(hz: number, opts?: { gain?: number; decay?: number }): void;
  /** Three quick notes: root, +2 degrees, +4 degrees. */
  arpeggio(index: number): void;
  /** Quiet, high, very short — for buttons and nav. */
  tick(): void;
  /** 40 ms filtered noise burst — a pen scratch for doodles drawing themselves. */
  scratch(): void;
  /** Call from a user gesture to create/resume the context. */
  unlock(): void;
}

export function createSynth(master = 0.12): Synth {
  let ctx: AudioContext | undefined;
  let out: GainNode | undefined;

  const ensure = () => {
    if (!ctx) {
      ctx = new AudioContext();
      out = ctx.createGain();
      out.gain.value = master;
      out.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx.state === 'running' ? ctx : undefined;
  };

  const voice = (hz: number, type: OscillatorType, gain: number, attack: number, decay: number, cutoff: number, at = 0) => {
    const c = ensure();
    if (!c || !out) return;
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.value = hz;
    osc.detune.value = Math.random() * 12 - 6; // ±6 cents so repeats feel alive
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = cutoff;
    lp.Q.value = 0.7;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    osc.connect(lp).connect(env).connect(out);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
    osc.onended = () => {
      osc.disconnect();
      lp.disconnect();
      env.disconnect();
    };
  };

  let noise: AudioBuffer | undefined;
  const scratch = () => {
    const c = ensure();
    if (!c || !out) return;
    if (!noise) {
      noise = c.createBuffer(1, Math.ceil(c.sampleRate * 0.05), c.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noise;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600 + Math.random() * 800;
    bp.Q.value = 1.4;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(bp).connect(env).connect(out);
    src.start(t);
    src.stop(t + 0.05);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      env.disconnect();
    };
  };

  return {
    scratch,
    pluck: (hz, o = {}) => voice(hz, 'triangle', o.gain ?? 1, 0.005, o.decay ?? 0.25, 1800),
    arpeggio: (index) => {
      [0, 2, 4].forEach((step, i) => voice(noteFor(index + step), 'triangle', 0.9, 0.005, 0.22, 1800, i * 0.07));
    },
    tick: () => voice(noteFor(14), 'sine', 0.18, 0.003, 0.06, 4000),
    unlock: () => void ensure(),
  };
}
