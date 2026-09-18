/**
 * `long-hover` — rest the pointer on the hero portrait for 3 seconds and it becomes a sketch.
 * If `hero.portraitSketch` exists, Hero.astro renders it as a second image and the swap cross-fades;
 * otherwise `.portrait.is-sketch` applies an SVG edge/ink filter to the photo (see global.css).
 */
import type { Egg } from '../types';

export const longHover: Egg = {
  id: 'long-hover',
  label: 'the sketch portrait',
  hint: 'Some things reveal themselves if you wait.',
  points: 15,
  attach({ found }) {
    const portrait = document.querySelector<HTMLElement>('#hero .portrait');
    if (!portrait) return () => {};
    let timer = 0;
    const start = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        portrait.classList.toggle('is-sketch');
        found('long-hover');
      }, 3000);
    };
    const stop = () => clearTimeout(timer);
    portrait.addEventListener('pointerenter', start);
    portrait.addEventListener('pointerleave', stop);
    return () => {
      portrait.removeEventListener('pointerenter', start);
      portrait.removeEventListener('pointerleave', stop);
      clearTimeout(timer);
    };
  },
  trigger({ found }) {
    document.querySelector('#hero .portrait')?.classList.toggle('is-sketch');
    found('long-hover');
  },
};
