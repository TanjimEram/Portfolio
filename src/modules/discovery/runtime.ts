/**
 * Discovery runtime (lazy-loaded by index.ts in Full Experience):
 *   - defines the seven discoverables and attaches each egg (re-attached after navigation)
 *   - the counter pill ("2 / 7 found"), docked bottom-right on desktop or in the nav slot on phones
 *   - the panel listing found / locked entries, and the completion state
 *   - pop / roll / ripple / toast on each find, chime request on completion
 */
import { toast } from '../../lib/experience';
import { count, define, found, isComplete, list, total } from './store';
import type { DiscoveryConfig, Egg, EggContext } from './types';
import { signature } from './eggs/signature';
import { konami } from './eggs/konami';
import { consoleEgg } from './eggs/console';
import { logoTriple } from './eggs/logoTriple';
import { longHover } from './eggs/longHover';
import { bottom } from './eggs/bottom';
import { idle } from './eggs/idle';
import { whois } from './eggs/whois';

const eggs: Egg[] = [signature, konami, consoleEgg, logoTriple, longHover, bottom, idle, whois];
define(eggs);

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(width < 40rem)');

let active = false;
let detachers: (() => void)[] = [];
let ctx: EggContext | undefined;
let pill: HTMLButtonElement | undefined;
let panel: HTMLDivElement | undefined;

function readConfig(): DiscoveryConfig {
  const json = document.querySelector<HTMLScriptElement>('script[data-discovery-config]')?.textContent;
  try {
    return JSON.parse(json ?? '{}') as DiscoveryConfig;
  } catch {
    return { email: '', completeNote: '', bottomMessage: '', palette: [] };
  }
}

/* ---------- counter pill ---------- */

const GLASS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>`;

function makePill(): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'disc-pill';
  b.setAttribute('aria-haspopup', 'dialog');
  b.setAttribute('aria-expanded', 'false');
  b.innerHTML = `${GLASS}<span class="disc-num"><span class="disc-roll">${count()}</span></span><span class="disc-of"> / ${total()}</span><span class="disc-word"> found</span>`;
  b.setAttribute('aria-label', `${count()} of ${total()} discoveries found. Open list.`);
  b.addEventListener('click', () => togglePanel());
  return b;
}

/** Desktop: fixed bottom-right. Phones: inside the nav's [data-discovery-slot]. */
function dock() {
  if (!pill) return;
  const slot = document.querySelector<HTMLElement>('[data-discovery-slot]');
  const inNav = mobile.matches && slot;
  if (inNav) {
    slot.appendChild(pill);
    pill.classList.add('in-nav');
  } else {
    document.body.appendChild(pill);
    pill.classList.remove('in-nav');
  }
}

function rollTo(n: number) {
  if (!pill) return;
  const num = pill.querySelector<HTMLElement>('.disc-num')!;
  // rapid finds: drop any digit still rolling out so only one current digit exists
  num.querySelectorAll('.disc-roll.is-out').forEach((e) => e.remove());
  const old = num.querySelector<HTMLElement>('.disc-roll')!;
  if (reduced()) {
    old.textContent = String(n);
    return;
  }
  const next = document.createElement('span');
  next.className = 'disc-roll is-in';
  next.textContent = String(n);
  old.classList.add('is-out');
  num.appendChild(next);
  setTimeout(() => old.remove(), 400);
}

function celebrate(label: string, n: number) {
  if (!pill) return;
  rollTo(n);
  pill.setAttribute('aria-label', `${n} of ${total()} discoveries found. Open list.`);
  pill.classList.remove('is-pop');
  void pill.offsetWidth;
  pill.classList.add('is-pop');
  const ripple = document.createElement('span');
  ripple.className = 'disc-ripple';
  pill.appendChild(ripple);
  setTimeout(() => ripple.remove(), 900);
  toast(`Found: ${label}`);
  document.dispatchEvent(new CustomEvent('sound:ding'));
}

/* ---------- panel ---------- */

const fmt = (t: number) =>
  new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function renderPanel() {
  if (!panel) return;
  const entries = list();
  const complete = isComplete();
  const { completeNote, email } = ctx?.config ?? { completeNote: '', email: '' };
  panel.classList.toggle('is-complete', complete);
  panel.innerHTML =
    `<div class="disc-head"><span class="label-mono">Discoveries</span><strong>${count()} / ${total()} found</strong>` +
    `<button type="button" class="disc-close" aria-label="Close">×</button></div>` +
    `<ul class="disc-list">` +
    entries
      .map((d) =>
        d.foundAt
          ? `<li class="is-found"><span class="disc-mark">✓</span><span><b>${d.label}</b><small>${fmt(d.foundAt)} · +${d.points}</small></span></li>`
          : `<li class="is-locked"><span class="disc-mark">🔒</span><span><b>???</b><small>${d.hint}</small></span></li>`,
      )
      .join('') +
    `</ul>` +
    (complete
      ? `<p class="disc-complete">${completeNote}${email ? ` <a href="mailto:${email}">${email}</a>` : ''}</p>`
      : '');
  panel.querySelector('.disc-close')?.addEventListener('click', () => togglePanel(false));
}

function togglePanel(open?: boolean) {
  if (!pill) return;
  const show = open ?? !panel;
  if (!show) {
    panel?.remove();
    panel = undefined;
    pill.setAttribute('aria-expanded', 'false');
    pill.focus();
    return;
  }
  panel = document.createElement('div');
  panel.className = 'disc-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Discoveries');
  panel.tabIndex = -1;
  renderPanel();
  document.body.appendChild(panel);
  pill.setAttribute('aria-expanded', 'true');
  panel.focus();
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && panel) togglePanel(false);
};
const onDocClick = (e: MouseEvent) => {
  if (panel && !panel.contains(e.target as Node) && !pill?.contains(e.target as Node)) togglePanel(false);
};
const onFound = (e: Event) => {
  const d = (e as CustomEvent<{ label: string; count: number }>).detail;
  celebrate(d.label, d.count);
  if (panel) renderPanel();
};
const onComplete = () => {
  document.dispatchEvent(new CustomEvent('sound:chime'));
  setTimeout(() => togglePanel(true), 1200);
};
const onReset = () => {
  rollTo(0);
  if (panel) renderPanel();
};
const onTrigger = (e: Event) => {
  const id = (e as CustomEvent<string>).detail;
  const egg = eggs.find((x) => x.id === id);
  if (egg && ctx) (egg.trigger ?? (() => found(id)))(ctx);
};

/* ---------- eggs ---------- */

function attachAll() {
  detachAll();
  if (!ctx) return;
  detachers = eggs.map((egg) => egg.attach(ctx!));
}
function detachAll() {
  detachers.forEach((d) => d());
  detachers = [];
}

/* ---------- mount / unmount ---------- */

export function mount() {
  if (active) return;
  active = true;
  ctx = { config: readConfig(), reduced: reduced(), found };
  pill = makePill();
  dock();
  mobile.addEventListener('change', dock);
  document.addEventListener('discovery:found', onFound);
  document.addEventListener('discovery:complete', onComplete);
  document.addEventListener('discovery:reset', onReset);
  document.addEventListener('discovery:trigger', onTrigger);
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onDocClick);
  attachAll();
}

export function unmount() {
  if (!active) return;
  active = false;
  detachAll();
  mobile.removeEventListener('change', dock);
  document.removeEventListener('discovery:found', onFound);
  document.removeEventListener('discovery:complete', onComplete);
  document.removeEventListener('discovery:reset', onReset);
  document.removeEventListener('discovery:trigger', onTrigger);
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('click', onDocClick);
  panel?.remove();
  panel = undefined;
  pill?.remove();
  pill = undefined;
  ctx = undefined;
}

// After a view transition the body (and nav slot) is new: re-dock the pill, re-attach DOM-bound eggs
document.addEventListener('astro:page-load', () => {
  if (!active) return;
  if (pill && !document.body.contains(pill)) dock();
  else dock();
  attachAll();
});
