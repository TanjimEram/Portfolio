/**
 * Experience mode: "standard" (calm, minimal — the default) or "full" (the playful layer).
 *
 * State lives on <html data-experience="…"> so CSS and JS both react; the choice persists in
 * localStorage. BaseLayout's inline script applies the saved mode before first paint (never "full"
 * for prefers-reduced-motion users — they opt in per visit).
 *
 * Optional modules register an enable()/disable() pair here; sound, cursor, count-up and the scroll
 * progress bar do today, doodles / easter eggs / games can later, without touching the nav.
 * Nothing essential may live in a module: the site must work with every module disabled.
 */

export type ExperienceMode = 'standard' | 'full';

export interface ExperienceModule {
  id: string;
  enable(): void | Promise<void>;
  disable(): void;
}

export const STORAGE_KEY = 'experience';
const EVENT = 'experience:change';

const modules = new Map<string, ExperienceModule>();
const root = () => document.documentElement;

export const getMode = (): ExperienceMode => (root().dataset.experience === 'full' ? 'full' : 'standard');
export const isFull = () => getMode() === 'full';

/** Register a module. If full mode is already on, it is enabled immediately. Returns an unregister function. */
export function registerModule(mod: ExperienceModule): () => void {
  modules.set(mod.id, mod);
  if (isFull()) void mod.enable();
  return () => {
    modules.delete(mod.id);
    mod.disable();
  };
}

export function setMode(mode: ExperienceMode): void {
  if (mode === getMode()) return;
  root().dataset.experience = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
  for (const mod of modules.values()) {
    if (mode === 'full') void mod.enable();
    else mod.disable();
  }
  document.dispatchEvent(new CustomEvent<ExperienceMode>(EVENT, { detail: mode }));
}

export const toggleMode = () => setMode(isFull() ? 'standard' : 'full');

export function onModeChange(fn: (mode: ExperienceMode) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<ExperienceMode>).detail);
  document.addEventListener(EVENT, handler);
  return () => document.removeEventListener(EVENT, handler);
}

/** Small one-line status toast shared by modules. */
export function toast(text: string, ms = 3200): void {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className = 'toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/**
 * ClientRouter replaces <html> attributes on navigation; re-apply the mode that is active in this
 * session (not storage — a reduced-motion visitor who hasn't opted in must stay in standard).
 */
let session: ExperienceMode = getMode();
onModeChange((m) => (session = m));
document.addEventListener('astro:after-swap', () => {
  root().dataset.experience = session;
});
