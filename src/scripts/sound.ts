/**
 * Sound behaviour. Loaded on demand (dynamic import) only once sound is enabled,
 * so pages with the flag off, or sound off, never ship it.
 *
 *  - hover a project card → its own pentatonic note (index-based)
 *  - click a project card → 3-note arpeggio, then navigate
 *  - any other click → quiet high tick
 *  - one note per 80 ms; touch devices get tap sounds only
 */
import { navigate } from 'astro:transitions/client';
import { createSynth, noteFor } from '../lib/audio';

const synth = createSynth(0.12);
const canHover = matchMedia('(hover: hover)').matches;
const THROTTLE = 80;
let last = 0;
const throttled = (fn: () => void) => {
  const now = performance.now();
  if (now - last < THROTTLE) return;
  last = now;
  fn();
};

let enabled = false;
export const setEnabled = (on: boolean) => {
  enabled = on;
  // the AudioContext itself is created on the first real gesture (below), not here
};

// A restored "on" runs without a gesture, and hover isn't one: unlock on the first real interaction.
for (const ev of ['pointerdown', 'keydown'] as const) {
  document.addEventListener(ev, () => enabled && synth.unlock(), { passive: true });
}

const card = (el: EventTarget | null) => (el as Element | null)?.closest?.<HTMLElement>('[data-sound-note]') ?? null;
const noteOf = (el: HTMLElement) => noteFor(Number(el.dataset.soundNote) || 0);

// Hover: one note per card entry (pointerover fires once per element boundary crossing)
if (canHover) {
  document.addEventListener(
    'pointerover',
    (e) => {
      if (!enabled || e.pointerType === 'touch') return;
      const el = card(e.target);
      if (!el || el.contains(e.relatedTarget as Node | null)) return; // moving within the same card
      throttled(() => synth.pluck(noteOf(el)));
    },
    { passive: true },
  );
}

// Doodles drawing themselves ask for a pen scratch — at most one per second across the page
let lastScratch = 0;
document.addEventListener('doodle:draw', () => {
  if (!enabled) return;
  const now = performance.now();
  if (now - lastScratch < 1000) return;
  lastScratch = now;
  synth.scratch();
});

// Discoveries: a small ding per find, a soft rising chime when everything is found
document.addEventListener('sound:ding', () => enabled && synth.pluck(noteFor(9), { gain: 0.7, decay: 0.35 }));
document.addEventListener('sound:chime', () => {
  if (!enabled) return;
  [0, 2, 4, 7].forEach((step, i) => setTimeout(() => synth.pluck(noteFor(5 + step), { gain: 0.6, decay: 0.6 }), i * 160));
});

// Terminal: very quiet keystroke tick (max one per 30 ms) and a blip when a command runs
let lastKey = 0;
document.addEventListener('sound:key', () => {
  if (!enabled) return;
  const now = performance.now();
  if (now - lastKey < 30) return;
  lastKey = now;
  synth.pluck(noteFor(12), { gain: 0.08, decay: 0.04 });
});
document.addEventListener('sound:blip', () => enabled && synth.pluck(noteFor(7), { gain: 0.35, decay: 0.12 }));

// Click: arpeggio on project cards (then navigate), tick on nav links and buttons.
// Capture phase so this runs before ClientRouter's own click handler, which would navigate at once.
document.addEventListener(
  'click',
  (e) => {
    if (!enabled) return;
    const t = e.target as Element;
    const el = card(t);
    const link = t.closest<HTMLAnchorElement>('a[href]');

    if (el && link && link.origin === location.origin && !link.target && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
      synth.arpeggio(Number(el.dataset.soundNote) || 0);
      setTimeout(() => navigate(link.href), 180);
      return;
    }
    // every other click, anywhere, gets the quiet tick
    throttled(() => synth.tick());
  },
  true,
);
