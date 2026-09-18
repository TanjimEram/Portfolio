/**
 * `konami` — ↑ ↑ ↓ ↓ ← → ← → B A toggles SKETCH MODE: <html data-sketch> makes every card, button and
 * border render as a rough hand-drawn outline (see global.css: uneven border-radius + an SVG
 * displacement filter). Same code toggles it off.
 */
import type { Egg } from '../types';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export const toggleSketch = (on?: boolean) => {
  const root = document.documentElement;
  const next = on ?? root.dataset.sketch === undefined;
  if (next) root.dataset.sketch = '';
  else delete root.dataset.sketch;
  return next;
};

export const konami: Egg = {
  id: 'konami',
  label: 'sketch mode',
  hint: 'An old cheat code still works here.',
  points: 20,
  attach({ found }) {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.matches?.('input, textarea, select, [contenteditable]')) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        toggleSketch();
        found('konami');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  },
  trigger({ found }) {
    toggleSketch();
    found('konami');
  },
};
