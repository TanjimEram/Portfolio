/**
 * Motion: scroll reveal, scroll progress, count-up numbers, cursor dot.
 * Everything here is gated on prefers-reduced-motion; the CSS side is gated too,
 * so with motion reduced the page simply renders in its final state.
 * Re-initialised on every ClientRouter navigation via astro:page-load.
 */

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- scroll reveal ---- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger siblings inside the same [data-reveal-group] by 60ms
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll<HTMLElement>(':scope [data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 60}ms`);
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

/* ---- scroll progress ---- */
let progressBound = false;
function initProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) return;
  if (reduced()) {
    bar.style.display = 'none';
    return;
  }
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll-progress', max > 0 ? String(scrollY / max) : '0');
  };
  update();
  if (!progressBound) {
    progressBound = true;
    let ticking = false;
    addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      },
      { passive: true },
    );
    addEventListener('resize', update, { passive: true });
  }
}

/* ---- count-up ---- */
function initCountUp() {
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

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          run(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.5 },
  );
  nums.forEach((el) => io.observe(el));
}

/* ---- cursor dot (desktop only; the native cursor stays) ---- */
let cursorBound = false;
function initCursor() {
  if (cursorBound) return;
  if (reduced() || !matchMedia('(pointer: fine)').matches) return;
  cursorBound = true;
  const root = document.documentElement;
  const dot = () => document.querySelector<HTMLElement>('.cursor-dot');
  const interactive = 'a, button, input, select, textarea, [role="button"], [data-cursor]';

  addEventListener(
    'pointermove',
    (e) => {
      const d = dot();
      if (!d) return;
      root.style.setProperty('--cx', `${e.clientX}px`);
      root.style.setProperty('--cy', `${e.clientY}px`);
      d.classList.add('is-active');
      const over = (e.target as Element | null)?.closest?.(interactive);
      root.style.setProperty('--cs', over ? '3.2' : '1');
    },
    { passive: true },
  );
  addEventListener('pointerleave', () => dot()?.classList.remove('is-active'));
  document.addEventListener('mouseleave', () => dot()?.classList.remove('is-active'));
}

function init() {
  initReveal();
  initProgress();
  initCountUp();
  initCursor();
}

document.addEventListener('astro:page-load', init);
