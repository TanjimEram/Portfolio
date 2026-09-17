/**
 * Doodle runtime. Renders every placement as an absolutely positioned <svg> in a document-level
 * layer (never inside the target, so there is no layout shift), draws it with a dash animation when
 * it scrolls into view, wobbles on hover, and asks the sound module for a pen scratch while drawing.
 * Re-runs on every ClientRouter navigation while enabled.
 */
import { doodlePaths } from './paths';
import type { DoodlePlacement } from './types';

const LAYER_ID = 'doodle-layer';
const GAP = 8;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let active = false;
let layer: HTMLDivElement | undefined;
let io: IntersectionObserver | undefined;
let ro: ResizeObserver | undefined;
let items: { el: SVGSVGElement; p: DoodlePlacement; target: Element; rot: number }[] = [];

function placements(): DoodlePlacement[] {
  const json = document.querySelector<HTMLScriptElement>('script[data-doodle-placements]')?.textContent;
  try {
    return json ? (JSON.parse(json) as DoodlePlacement[]) : [];
  } catch {
    return [];
  }
}

function findTarget(p: DoodlePlacement): Element | null {
  const all = document.querySelectorAll(p.selector);
  if (!p.text) return all[0] ?? null;
  for (const el of all) if (el.textContent?.includes(p.text)) return el;
  return null;
}

function makeSvg(p: DoodlePlacement): SVGSVGElement {
  const def = doodlePaths[p.type];
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${def.w} ${def.h}`);
  svg.setAttribute('class', 'doodle');
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.type = p.type;
  if (p.mobile) svg.dataset.mobile = '';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', def.d);
  path.setAttribute('pathLength', '1');
  svg.appendChild(path);
  return svg;
}

function sizeFor(p: DoodlePlacement, rect: DOMRect): { w: number; h: number } {
  const def = doodlePaths[p.type];
  let w = 80;
  if (typeof p.size === 'number') w = p.size;
  else if (typeof p.size === 'string') w = rect.width * parseFloat(p.size);
  return { w, h: (w * def.h) / def.w };
}

/** The box of the target's rendered text, not its (often full-width) block box */
function textRect(target: Element): DOMRect {
  if (target.textContent?.trim()) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const r = range.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return r;
  }
  return target.getBoundingClientRect();
}

function place(item: (typeof items)[number]) {
  const { el, p, target, rot } = item;
  const r = textRect(target);
  const { w, h } = sizeFor(p, r);
  const left = r.left + scrollX;
  const top = r.top + scrollY;
  const cx = left + r.width / 2;
  const cy = top + r.height / 2;
  let x = cx - w / 2;
  let y = cy - h / 2;
  switch (p.position) {
    case 'left':
      x = left - w - GAP;
      break;
    case 'right':
      x = left + r.width + GAP;
      break;
    case 'above':
      y = top - h - GAP;
      break;
    case 'below':
      y = top + r.height + GAP;
      break;
  }
  x += p.offset?.x ?? 0;
  y += p.offset?.y ?? 0;
  el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;--doodle-rotate:${rot}deg`;
}

function placeAll() {
  for (const item of items) place(item);
}

export function mount() {
  unmount();
  active = true;
  layer = document.createElement('div');
  layer.id = LAYER_ID;
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const instant = reduced();
  io = instant
    ? undefined
    : new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add('is-drawn');
            document.dispatchEvent(new CustomEvent('doodle:draw'));
            io?.unobserve(e.target);
          }
        },
        { threshold: 0.2 },
      );

  placements().forEach((p, i) => {
    const target = findTarget(p);
    if (!target) return;
    const el = makeSvg(p);
    // ±8° so no two look mechanical; deterministic per slot so it doesn't jitter on re-mount
    const rot = (p.rotation ?? 0) + (((i * 7919) % 17) - 8);
    layer!.appendChild(el);
    const item = { el, p, target, rot };
    items.push(item);
    place(item);
    if (instant) el.classList.add('is-drawn', 'is-instant');
    else io!.observe(el);
  });

  // Anything already on screen draws right away (IO can lag on a hidden/just-loaded tab)
  if (!instant) {
    requestAnimationFrame(() => {
      for (const { el } of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight && !el.classList.contains('is-drawn')) {
          el.classList.add('is-drawn');
          io?.unobserve(el);
        }
      }
    });
  }

  ro = new ResizeObserver(placeAll);
  ro.observe(document.body);
  addEventListener('resize', placeAll, { passive: true });
  // fonts settling can move targets
  document.fonts?.ready.then(placeAll);
}

export function unmount() {
  active = false;
  io?.disconnect();
  ro?.disconnect();
  removeEventListener('resize', placeAll);
  layer?.remove();
  layer = undefined;
  items = [];
}

// New page after a view transition: the layer lives in <body>, which was replaced
document.addEventListener('astro:page-load', () => {
  if (active) mount();
});
