/**
 * `console` — an ASCII signature and a hiring note in the browser console.
 * Detection: a getter on an object passed to console.log runs only when devtools formats it
 * (Chromium/WebKit). If a browser never calls it, nothing happens — the dev page can still trigger it.
 */
import type { Egg } from '../types';

const art = String.raw`
  _____ _____
 |_   _| ____|   Tanjim Eram
   | | |  _|     web developer & designer
   | | | |___
   |_| |_____|   you found the console. hello.
`;

let printed = false;

export const consoleEgg: Egg = {
  id: 'console',
  label: 'the console note',
  hint: 'Developers look in one particular place first.',
  points: 15,
  attach({ found, config }) {
    if (printed) return () => {};
    printed = true;
    try {
      const probe: Record<string, unknown> = {};
      Object.defineProperty(probe, 'toString', {
        get() {
          found('console');
          return () => '';
        },
      });
      console.log('%c' + art, 'color:#e8412f;font-family:monospace;font-size:12px;line-height:1.3');
      console.log(
        '%cHiring or collaborating? %c' + config.email + '  — this site is open source, have a look around.',
        'color:#8e8e95',
        'color:inherit;font-weight:600',
      );
      // formatting this object is what trips the getter
      console.log('%c', probe);
    } catch {
      /* console unavailable */
    }
    return () => {};
  },
  trigger({ found }) {
    found('console');
  },
};
