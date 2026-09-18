/**
 * `logo-triple` — three quick clicks on the nav logo cycle the accent through a small palette.
 * A single click still goes home; it's just held for a moment to see if more clicks follow.
 */
import { navigate } from 'astro:transitions/client';
import { accentSet } from '../../../lib/color';
import type { Egg } from '../types';

let index = 0;
const VARS = ['dark', 'dark-ink', 'dark-contrast', 'light', 'light-ink', 'light-contrast'] as const;

export function applyPalette(palette: string[], i: number) {
  const root = document.documentElement;
  index = ((i % palette.length) + palette.length) % palette.length;
  if (index === 0) {
    VARS.forEach((v) => root.style.removeProperty(`--accent-${v}`));
    return;
  }
  const a = accentSet(palette[index]!);
  root.style.setProperty('--accent-dark', a.dark);
  root.style.setProperty('--accent-dark-ink', a.darkInk);
  root.style.setProperty('--accent-dark-contrast', a.darkContrast);
  root.style.setProperty('--accent-light', a.light);
  root.style.setProperty('--accent-light-ink', a.lightInk);
  root.style.setProperty('--accent-light-contrast', a.lightContrast);
}

export const logoTriple: Egg = {
  id: 'logo-triple',
  label: 'the colour cycle',
  hint: 'The monogram answers to a rhythm of three.',
  points: 10,
  attach({ found, config }) {
    const logo = document.querySelector<HTMLAnchorElement>('header a[aria-label$="home"]');
    if (!logo) return () => {};
    let clicks = 0;
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      clicks++;
      clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        applyPalette(config.palette, index + 1);
        found('logo-triple');
        return;
      }
      timer = window.setTimeout(() => {
        if (clicks === 1) navigate(logo.href);
        clicks = 0;
      }, 400);
    };
    logo.addEventListener('click', onClick, true);
    // ClientRouter resets <html> inline style on navigation; keep the chosen colour
    const reapply = () => index && applyPalette(config.palette, index);
    document.addEventListener('astro:after-swap', reapply);
    return () => {
      logo.removeEventListener('click', onClick, true);
      document.removeEventListener('astro:after-swap', reapply);
      clearTimeout(timer);
    };
  },
  trigger({ found, config }) {
    applyPalette(config.palette, index + 1);
    found('logo-triple');
  },
};
