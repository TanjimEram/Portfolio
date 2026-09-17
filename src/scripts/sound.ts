/**
 * Sound behaviour. Loaded on demand (dynamic import) only once sound is enabled,
 * so pages with the flag off, or sound off, never ship it.
 *
 *  - hover a project card → its own pentatonic note (index-based)
 *  - click a project card → 3-note arpeggio, then navigate
 *  - nav links / buttons → quiet high tick
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
  if (on) synth.unlock();
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
    if (t.closest('header a, header button, .btn-solid, .btn-outline, .btn-circle, button')) {
      throttled(() => synth.tick());
    }
  },
  true,
);
