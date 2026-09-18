/**
 * `bottom` — keep scrolling once you've hit the true bottom of the page (wheel or touch) and a
 * small hidden line unfolds below the footer.
 */
import type { Egg } from '../types';

const NEEDED = 320; // px of "extra" scroll intent past the bottom

function reveal(message: string, found: (id: string) => boolean) {
  if (document.querySelector('.bottom-note')) return;
  const el = document.createElement('p');
  el.className = 'bottom-note';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-open'));
  found('bottom');
}

export const bottom: Egg = {
  id: 'bottom',
  label: 'the note under the floor',
  hint: 'The page ends. Or does it?',
  points: 10,
  attach({ found, config }) {
    let extra = 0;
    let lastTouchY = 0;
    const atBottom = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    const push = (dy: number) => {
      if (!atBottom() || dy <= 0) {
        extra = 0;
        return;
      }
      extra += dy;
      if (extra >= NEEDED) {
        extra = 0;
        reveal(config.bottomMessage, found);
      }
    };
    const onWheel = (e: WheelEvent) => push(e.deltaY);
    const onTouchStart = (e: TouchEvent) => (lastTouchY = e.touches[0]?.clientY ?? 0);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      push(lastTouchY - y);
      lastTouchY = y;
    };
    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      removeEventListener('wheel', onWheel);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      document.querySelector('.bottom-note')?.remove();
    };
  },
  trigger({ found, config }) {
    reveal(config.bottomMessage, found);
  },
};
