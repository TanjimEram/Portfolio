/**
 * `signature` — a faint ink signature in the footer (Footer.astro renders it when easter eggs are on).
 * Hovering or focusing it draws it in accent; finishing the draw counts as found.
 */
import type { Egg } from '../types';

export const signature: Egg = {
  id: 'signature',
  label: 'the signature',
  hint: 'Something faint, signed at the very end.',
  points: 10,
  attach({ found, reduced }) {
    const el = document.querySelector<SVGSVGElement>('[data-egg="signature"]');
    if (!el) return () => {};
    const path = el.querySelector('path');
    const draw = () => {
      el.classList.add('is-drawing');
      if (reduced) found('signature');
    };
    const done = () => {
      if (el.classList.contains('is-drawing')) found('signature');
    };
    el.addEventListener('pointerenter', draw);
    el.addEventListener('focus', draw);
    path?.addEventListener('transitionend', done);
    return () => {
      el.removeEventListener('pointerenter', draw);
      el.removeEventListener('focus', draw);
      path?.removeEventListener('transitionend', done);
    };
  },
  trigger({ found }) {
    document.querySelector('[data-egg="signature"]')?.classList.add('is-drawing');
    found('signature');
  },
};
