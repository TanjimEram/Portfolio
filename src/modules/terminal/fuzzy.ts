/** Tiny matching helpers: Levenshtein distance, closest candidate, project lookup. */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n]!;
}

/** The candidate within an edit distance of ~40% of its length, or undefined. */
export function closest(input: string, candidates: string[]): string | undefined {
  const q = input.toLowerCase();
  let best: string | undefined;
  let bestD = Infinity;
  for (const c of candidates) {
    const d = levenshtein(q, c.toLowerCase());
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best && bestD <= Math.max(1, Math.floor(best.length * 0.4)) ? best : undefined;
}

/** Match a project by 1-based index, exact id, id/title prefix, or substring. */
export function findProject<T extends { id: string; title: string }>(projects: T[], arg: string): T | undefined {
  const q = arg.toLowerCase();
  const n = Number(q);
  if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
  return (
    projects.find((p) => p.id.toLowerCase() === q) ??
    projects.find((p) => p.id.toLowerCase().startsWith(q) || p.title.toLowerCase().startsWith(q)) ??
    projects.find((p) => p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
  );
}

/** Completions for a partial token */
export function complete(partial: string, candidates: string[]): string[] {
  const q = partial.toLowerCase();
  return candidates.filter((c) => c.toLowerCase().startsWith(q));
}
