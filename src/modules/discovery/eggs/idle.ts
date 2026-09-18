/**
 * `idle` — after 30 s without input a small doodle character strolls across the bottom of the
 * screen. Click it before it leaves and it counts. Reduced motion: it simply appears near the
 * corner for a while instead of walking.
 */
import type { Egg } from '../types';

const IDLE_MS = 30_000;
const WALK_MS = 14_000;

// stick-figure walker, hand-drawn (viewBox 0 0 60 80)
const WALKER =
  `<svg viewBox="0 0 60 80" aria-hidden="true">` +
  `<path class="w-body" d="M31 14c6 0 9 4 9 9s-4 9-9 9-9-4-9-9 3-9 9-9Zm0 18c1 10 0 18 1 26M31 36c-7 3-12 9-14 15M31 36c7 2 12 8 15 14" />` +
  `<path class="w-legs" d="M32 58c-5 6-9 12-11 19M32 58c4 6 8 12 12 18" />` +
  `</svg>`;

let walker: HTMLButtonElement | undefined;
let idleTimer = 0;
let leaveTimer = 0;

function removeWalker() {
  clearTimeout(leaveTimer);
  walker?.remove();
  walker = undefined;
}

function summon(found: (id: string) => boolean, reduced: boolean) {
  if (walker) return;
  walker = document.createElement('button');
  walker.type = 'button';
  walker.className = 'idle-walker';
  walker.setAttribute('aria-label', 'A little wanderer. Click to say hi.');
  walker.innerHTML = WALKER;
  if (reduced) walker.classList.add('is-static');
  walker.addEventListener('click', () => {
    found('idle');
    walker?.classList.add('is-caught');
    leaveTimer = window.setTimeout(removeWalker, 900);
  });
  document.body.appendChild(walker);
  leaveTimer = window.setTimeout(removeWalker, reduced ? 10_000 : WALK_MS);
}

export const idle: Egg = {
  id: 'idle',
  label: 'the wanderer',
  hint: 'Patience. Do nothing for a while.',
  points: 20,
  attach({ found, reduced }) {
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => summon(found, reduced), IDLE_MS);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((ev) => addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      events.forEach((ev) => removeEventListener(ev, arm));
      clearTimeout(idleTimer);
      removeWalker();
    };
  },
  trigger({ found, reduced }) {
    summon(found, reduced);
  },
};
