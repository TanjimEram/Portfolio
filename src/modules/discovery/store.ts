/**
 * Discovery state: what can be found, what has been, and when.
 * Generic on purpose — the Case File phase reads the same store.
 *
 * Events (on document):
 *   discovery:found    { id, label, points, count, total }   a new discovery
 *   discovery:complete { count, total }                       the last one
 *   discovery:reset
 */

export interface Discoverable {
  id: string;
  label: string;
  /** Vague hint shown while still locked */
  hint: string;
  points: number;
}

export interface DiscoveryEntry extends Discoverable {
  foundAt?: number;
}

export interface FoundDetail {
  id: string;
  label: string;
  points: number;
  count: number;
  total: number;
}

const KEY = 'discoveries';
const registry = new Map<string, Discoverable>();
let foundMap: Record<string, number> = load();

function load(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(foundMap));
  } catch {
    /* storage unavailable: discoveries live for this session only */
  }
}

const emit = (name: string, detail?: unknown) => document.dispatchEvent(new CustomEvent(name, { detail }));

/** Register discoverables (idempotent; later definitions replace earlier ones with the same id). */
export function define(items: Discoverable[]): void {
  for (const d of items) registry.set(d.id, d);
}

export const total = () => registry.size;
export const count = () => [...registry.keys()].filter((id) => id in foundMap).length;
export const isFound = (id: string) => id in foundMap;
export const isComplete = () => registry.size > 0 && count() === registry.size;
export const points = () => [...registry.values()].reduce((sum, d) => sum + (isFound(d.id) ? d.points : 0), 0);

export function list(): DiscoveryEntry[] {
  return [...registry.values()].map((d) => ({ ...d, foundAt: foundMap[d.id] }));
}

/** Mark a discoverable as found. Returns true only the first time. */
export function found(id: string): boolean {
  const d = registry.get(id);
  if (!d || id in foundMap) return false;
  foundMap[id] = Date.now();
  save();
  const detail: FoundDetail = { id, label: d.label, points: d.points, count: count(), total: total() };
  emit('discovery:found', detail);
  if (isComplete()) emit('discovery:complete', { count: detail.count, total: detail.total });
  return true;
}

/** Forget everything (testing, or a visitor who wants to play again). */
export function reset(): void {
  foundMap = {};
  try {
    localStorage.removeItem(KEY);
  } catch {}
  emit('discovery:reset');
}
