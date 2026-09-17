/**
 * Motion. Scroll reveal runs in both modes (subtle in standard, richer in full — see global.css).
 * The scroll progress bar, count-up numbers and the cursor dot are Full Experience modules
 * (src/lib/experience.ts) and switch on/off with the mode.
 * Everything is gated on prefers-reduced-motion; the CSS side is gated too, so with motion reduced
 * the page simply renders in its final state. Re-initialised on every ClientRouter navigation.
 */
import { registerModule, isFull } from '../lib/experience';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- scroll reveal (always) ---- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger siblings inside the same [data-reveal-group]
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll<HTMLElement>(':scope [data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-index', String(Math.min(i, 8)));
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  items.forEach((el) => io.observe(el));
}

/* ---- scroll progress (full) ---- */
let progressOn = false;
let progressBound = false;
const updateProgress = () => {
  if (!progressOn) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', max > 0 ? String(scrollY / max) : '0');
};
registerModule({
  id: 'progress',
  enable: () => {
    if (reduced()) return;
    progressOn = true;
    updateProgress();
    if (!progressBound) {
      progressBound = true;
      let ticking = false;
      addEventListener(
        'scroll',
        () => {
          if (ticking || !progressOn) return;
          ticking = true;
          requestAnimationFrame(() => {
            updateProgress();
            ticking = false;
          });
        },
        { passive: true },
      );
      addEventListener('resize', updateProgress, { passive: true });
    }
  },
  disable: () => {
    progressOn = false;
    document.documentElement.style.setProperty('--scroll-progress', '0');
  },
});

/* ---- count-up (full) ---- */
let countIO: IntersectionObserver | undefined;
function initCountUp() {
  countIO?.disconnect();
  countIO = undefined;
  if (!isFull()) return;
  const nums = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!nums.length || reduced() || !('IntersectionObserver' in window)) return;

  const fmt = new Intl.NumberFormat(document.documentElement.lang || 'en');
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt.format(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  countIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          run(e.target as HTMLElement);
          countIO?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.5 },
  );
  nums.forEach((el) => countIO?.observe(el));
}
registerModule({ id: 'countup', enable: initCountUp, disable: () => countIO?.disconnect() });

/* ---- cursor dot (full, desktop pointers only; the native cursor stays) ---- */
let cursorOn = false;
let cursorBound = false;
let idleTimer = 0;
const dot = () => document.querySelector<HTMLElement>('.cursor-dot');
const hideDot = () => dot()?.classList.remove('is-active');
registerModule({
  id: 'cursor',
  enable: () => {
    if (reduced() || !matchMedia('(pointer: fine)').matches) return;
    cursorOn = true;
    if (cursorBound) return;
    cursorBound = true;
    const root = document.documentElement;
    const interactive = 'a, button, input, select, textarea, [role="button"], [data-cursor]';
    addEventListener(
      'pointermove',
      (e) => {
        if (!cursorOn) return;
        const d = dot();
        if (!d) return;
        root.style.setProperty('--cx', `${e.clientX}px`);
        root.style.setProperty('--cy', `${e.clientY}px`);
        d.classList.add('is-active');
        root.style.setProperty('--cs', (e.target as Element | null)?.closest?.(interactive) ? '3.2' : '1');
        // never leave the dot parked on a still page: hide after a moment of no movement, and on scroll
        clearTimeout(idleTimer);
        idleTimer = window.setTimeout(hideDot, 1500);
      },
      { passive: true },
    );
    addEventListener('scroll', hideDot, { passive: true });
    document.addEventListener('mouseleave', hideDot);
  },
  disable: () => {
    cursorOn = false;
    hideDot();
  },
});

document.addEventListener('astro:page-load', () => {
  initReveal();
  if (isFull()) {
    updateProgress();
    initCountUp();
  }
});
