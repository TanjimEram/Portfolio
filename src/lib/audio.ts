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

  return {
    pluck: (hz, o = {}) => voice(hz, 'triangle', o.gain ?? 1, 0.005, o.decay ?? 0.25, 1800),
    arpeggio: (index) => {
      [0, 2, 4].forEach((step, i) => voice(noteFor(index + step), 'triangle', 0.9, 0.005, 0.22, 1800, i * 0.07));
    },
    tick: () => voice(noteFor(14), 'sine', 0.18, 0.003, 0.06, 4000),
    unlock: () => void ensure(),
  };
}
