/**
 * Terminal runtime: view switching (grid ⇄ terminal), boot sequence, typed output, input handling
 * (history, tab completion, shortcuts), effects, and the tap-to-run chips on small screens.
 * DOM skeleton comes from TerminalHost.astro; data from its JSON blob; commands from commands.ts.
 */
import { navigate } from 'astro:transitions/client';
import { found } from '../discovery/store';
import { COMMANDS, PROJECT_COMMANDS, run, type Effect, type TerminalData } from './commands';
import { complete } from './fuzzy';

const VIEW_KEY = 'projectsView';
const HIST_KEY = 'terminal-history';
const BOOT_KEY = 'terminal-booted';
const CHAR_MS = 12;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = () => matchMedia('(width < 48rem)').matches;
const sound = (name: string) => document.dispatchEvent(new CustomEvent(name));

let active = false;
let cleanup: (() => void) | undefined;

function readJSON<T>(el: Element | null, fallback: T): T {
  try {
    return el?.textContent ? (JSON.parse(el.textContent) as T) : fallback;
  } catch {
    return fallback;
  }
}
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

function setup(host: HTMLElement): () => void {
  const data = readJSON<TerminalData | null>(host.querySelector('[data-terminal-data]'), null);
  const term = host.querySelector<HTMLElement>('[data-terminal]');
  const section = host.closest<HTMLElement>('section');
  const grid = section?.querySelector<HTMLElement>('[data-projects-grid]') ?? null;
  const out = host.querySelector<HTMLElement>('[data-out]');
  const input = host.querySelector<HTMLInputElement>('[data-input]');
  const form = host.querySelector<HTMLFormElement>('[data-form]');
  const screen = host.querySelector<HTMLElement>('[data-screen]');
  const chips = host.querySelector<HTMLElement>('[data-chips]');
  if (!data || !term || !out || !input || !form || !screen) return () => {};

  const projectIds = data.projects.map((p) => p.id);
  const history = readJSON<string[]>({ textContent: store.get(HIST_KEY) } as Element, []);
  let hIndex = history.length;
  let view: 'grid' | 'terminal' = 'grid';

  /* ---------- output ---------- */
  type Job = { text: string; cls?: string; typed: boolean; step: number };
  const queue: Job[] = [];
  let busy = false;
  let skip = false;
  const scroll = () => (screen.scrollTop = screen.scrollHeight);

  const drain = () => {
    const job = queue.shift();
    if (!job) {
      busy = false;
      return;
    }
    busy = true;
    const line = document.createElement('div');
    line.className = 'term-line' + (job.cls ? ` ${job.cls}` : '');
    out.appendChild(line);
    if (!job.typed || reduced() || skip) {
      line.textContent = job.text;
      scroll();
      queueMicrotask(drain);
      return;
    }
    const step = job.step;
    let i = 0;
    const tick = () => {
      if (skip) {
        line.textContent = job.text;
        scroll();
        drain();
        return;
      }
      i = Math.min(job.text.length, i + step);
      line.textContent = job.text.slice(0, i);
      scroll();
      if (i < job.text.length) setTimeout(tick, CHAR_MS);
      else drain();
    };
    tick();
  };
  const print = (lines: string[], cls?: string, typed = true) => {
    // ~12ms per char, but a whole batch never takes more than ~0.7s, so `help` doesn't crawl
    const total = lines.reduce((n, l) => n + l.length, 0);
    const step = Math.max(1, Math.ceil(total / 60));
    for (const text of lines) queue.push({ text, cls, typed, step });
    if (!busy) drain();
  };
  const clear = () => {
    queue.length = 0;
    out.innerHTML = '';
  };

  /* ---------- effects ---------- */
  const effect = (e: Effect) => {
    switch (e.type) {
      case 'navigate':
        setTimeout(() => navigate(e.href), 350);
        break;
      case 'open':
        window.open(e.href, '_blank', 'noopener');
        break;
      case 'download': {
        const a = document.createElement('a');
        a.href = e.href;
        a.download = e.name;
        a.click();
        break;
      }
      case 'theme':
        document.documentElement.dataset.theme = e.value;
        store.set('theme', e.value);
        break;
      case 'sound': {
        const b = document.querySelector<HTMLButtonElement>('[data-sound-toggle]');
        if (b && (b.getAttribute('aria-pressed') === 'true') !== e.value) b.click();
        break;
      }
      case 'clear':
        clear();
        break;
      case 'exit':
        setTimeout(() => setView('grid'), 400);
        break;
      case 'discover':
        found(e.id);
        break;
    }
  };

  /* ---------- commands ---------- */
  const exec = (raw: string) => {
    const text = raw.trim();
    print([`visitor@${data.user}:~$ ${text}`], 'term-echo', false);
    if (!text) return;
    if (history[history.length - 1] !== text) {
      history.push(text);
      if (history.length > 50) history.shift();
      store.set(HIST_KEY, JSON.stringify(history));
    }
    hIndex = history.length;
    sound('sound:blip');
    const res = run(data, text, { narrow: small() });
    print(res.lines);
    if (res.effect) effect(res.effect);
  };

  /* ---------- input ---------- */
  const onSubmit = (e: Event) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    exec(v);
  };
  const onKey = (e: KeyboardEvent) => {
    skip = true; // any key skips typing that is in flight
    setTimeout(() => (skip = false), 0);
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      hIndex = Math.max(0, Math.min(history.length, hIndex + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[hIndex] ?? '';
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(/\s+/);
      const isArg = parts.length > 1 && PROJECT_COMMANDS.includes(parts[0]!.toLowerCase());
      const cands = complete(parts[parts.length - 1]!, isArg ? projectIds : COMMANDS);
      if (cands.length === 1) {
        parts[parts.length - 1] = cands[0]!;
        input.value = parts.join(' ') + (isArg ? '' : ' ');
      } else if (cands.length > 1) print([cands.join('  ')], 'term-dim', false);
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clear();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      print([`visitor@${data.user}:~$ ${input.value}^C`], 'term-echo', false);
      input.value = '';
      return;
    }
    if (e.key.length === 1) sound('sound:key');
  };
  const onClick = (e: MouseEvent) => {
    if (!(e.target as Element).closest('a, button')) input.focus({ preventScroll: true });
  };
  // soft keyboard: keep the prompt visible
  const onFocus = () => setTimeout(() => input.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }), 300);

  /* ---------- chips (small screens) ---------- */
  const buildChips = () => {
    if (!chips) return;
    const list = ['help', 'ls', 'whoami', 'skills', 'exp', 'contact', ...projectIds.slice(0, 3).map((id) => `cat ${id}`), 'exit'];
    chips.innerHTML = list.map((c) => `<button type="button" data-chip="${c}">${c}</button>`).join('');
  };
  const onChip = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-chip]');
    if (b) exec(b.dataset.chip ?? '');
  };

  /* ---------- view ---------- */
  const boot = () => {
    if (store.get(BOOT_KEY)) {
      print([`type help to begin.`], 'term-dim');
      return;
    }
    store.set(BOOT_KEY, '1');
    print(
      [`booting ${data.user}@portfolio…`, 'mounting /projects … ok', 'loading experience, skills, contact … ok', 'ready. type help to begin.'],
      'term-dim',
    );
  };
  const setView = (next: 'grid' | 'terminal', persist = true) => {
    view = next;
    const on = next === 'terminal';
    section?.setAttribute('data-view', next);
    host.querySelectorAll<HTMLButtonElement>('[data-view-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewBtn === next)));
    if (on) {
      term.hidden = false;
      setTimeout(() => term.classList.add('is-open'), 20);
      if (grid) grid.setAttribute('aria-hidden', 'true');
      if (!out.childElementCount) boot();
      if (small()) buildChips();
      else input.focus({ preventScroll: true });
    } else {
      term.classList.remove('is-open');
      grid?.removeAttribute('aria-hidden');
      setTimeout(() => {
        if (view === 'grid') term.hidden = true;
      }, 400);
    }
    if (persist) store.set(VIEW_KEY, next);
  };
  const onSwitch = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-view-btn]');
    if (b) setView(b.dataset.viewBtn === 'terminal' ? 'terminal' : 'grid');
  };

  host.addEventListener('click', onSwitch);
  form.addEventListener('submit', onSubmit);
  input.addEventListener('keydown', onKey);
  input.addEventListener('focus', onFocus);
  term.addEventListener('click', onClick);
  chips?.addEventListener('click', onChip);

  const wantsTerminal =
    new URLSearchParams(location.search).get('view') === 'terminal' || host.hasAttribute('data-auto-open') || store.get(VIEW_KEY) === 'terminal';
  if (wantsTerminal) setView('terminal', false);
  if (new URLSearchParams(location.search).get('view') === 'terminal') section?.scrollIntoView({ block: 'start' });

  return () => {
    host.removeEventListener('click', onSwitch);
    form.removeEventListener('submit', onSubmit);
    input.removeEventListener('keydown', onKey);
    input.removeEventListener('focus', onFocus);
    term.removeEventListener('click', onClick);
    chips?.removeEventListener('click', onChip);
    if (view === 'terminal') setView('grid', false);
  };
}

export function mount() {
  active = true;
  cleanup?.();
  const cleanups = [...document.querySelectorAll<HTMLElement>('[data-terminal-host]')].map(setup);
  cleanup = () => cleanups.forEach((c) => c());
}

export function unmount() {
  active = false;
  cleanup?.();
  cleanup = undefined;
}

document.addEventListener('astro:page-load', () => {
  if (active) mount();
});
