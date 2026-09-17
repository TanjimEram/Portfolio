/**
 * Pattern library: every function returns a seamlessly tileable inline-SVG data URI.
 *
 * On the site the SVG is used as a `mask-image` over a layer whose `background-color` is
 * `var(--color-accent)`, so the colour always follows the theme/project accent and can transition
 * (data URIs can't read CSS variables). `color` therefore only matters when a pattern is used as a
 * plain `background-image` (the /dev/patterns page, exports); for masks the default black is correct.
 *
 * Layer opacity is owned by CSS (`--fx-pattern`: 0.10 dark / 0.06 light) so it can change with the theme;
 * the `opacity` option here is baked into the SVG for one-off uses.
 *
 * Rotation is NOT baked into the tile (a rotated tile stops tiling); it is returned so the caller can
 * rotate the oversized layer element instead, which stays seamless at any angle.
 */

export interface PatternOptions {
  /** Fill/stroke colour inside the SVG. Ignored when used as a mask. */
  color?: string;
  /** Multiplies the tile size (1 = design size). */
  scale?: number;
  /** 0–1, baked into the SVG. Leave at 1 for mask use and let CSS own it. */
  opacity?: number;
  /** Degrees; applied by the caller to the layer element. */
  rotation?: number;
}

export interface PatternResult {
  /** `url("data:image/svg+xml,…")`, ready for mask-image / background-image */
  uri: string;
  /** Tile size in px after `scale` (width; `height` differs for non-square tiles) */
  width: number;
  height: number;
  rotation: number;
}

export const patternNames = ['halftone', 'weave', 'rings', 'grid', 'chevron', 'mesh', 'waves', 'scatter'] as const;
export type PatternName = (typeof patternNames)[number];

const svg = (w: number, h: number, body: string, o: Required<PatternOptions>) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
  `<g fill='${o.color}' stroke='${o.color}' opacity='${o.opacity}'>${body}</g></svg>`;

const defaults = (o: PatternOptions = {}, rotation = 0): Required<PatternOptions> => ({
  color: o.color ?? '#000',
  scale: o.scale ?? 1,
  opacity: o.opacity ?? 1,
  rotation: o.rotation ?? rotation,
});

const result = (w: number, h: number, body: string, o: Required<PatternOptions>): PatternResult => ({
  uri: `url("data:image/svg+xml,${encodeURIComponent(svg(w, h, body, o))}")`,
  width: w * o.scale,
  height: h * o.scale,
  rotation: o.rotation,
});

/** Dot grid; rotated 45° by default so it reads as diamonds. */
export function halftone(opts?: PatternOptions): PatternResult {
  const o = defaults(opts, 45);
  return result(10, 10, `<circle cx='5' cy='5' r='1.6' stroke='none'/>`, o);
}

/** Carbon-fibre weave: alternating blocks of ±45° hatching. */
export function weave(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const s = 8; // block size, tile is 2×2 blocks
  const block = (x: number, y: number, dir: 1 | -1) => {
    const id = `c${x}${y}`;
    const lines = [-s, -s / 2, 0, s / 2, s]
      .map((k) => (dir === 1 ? `M${x + k} ${y}L${x + k + s} ${y + s}` : `M${x + k + s} ${y}L${x + k} ${y + s}`))
      .join('');
    return (
      `<clipPath id='${id}'><rect x='${x}' y='${y}' width='${s}' height='${s}'/></clipPath>` +
      `<path d='${lines}' fill='none' stroke-width='1.5' stroke-linecap='square' clip-path='url(#${id})'/>`
    );
  };
  const body = block(0, 0, 1) + block(s, 0, -1) + block(0, s, -1) + block(s, s, 1);
  return result(2 * s, 2 * s, body, o);
}

/** Large concentric circles with thin strokes, off-centre in the tile. */
export function rings(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const size = 320;
  const cx = 200;
  const cy = 130;
  let body = '';
  for (let r = 14; r <= 118; r += 13) body += `<circle cx='${cx}' cy='${cy}' r='${r}'/>`;
  return result(size, size, `<g fill='none' stroke-width='0.9'>${body}</g>`, o);
}

/** Blueprint grid: fine lines with a small crosshair where they meet. */
export function grid(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const s = 40;
  const c = s / 2;
  const body =
    `<path d='M${c} 0V${s}M0 ${c}H${s}' fill='none' stroke-width='0.5' opacity='0.55'/>` +
    `<path d='M${c} ${c - 4}V${c + 4}M${c - 4} ${c}H${c + 4}' fill='none' stroke-width='1.2'/>`;
  return result(s, s, body, o);
}

/** Repeating chevrons with alternating stroke weights. */
export function chevron(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const w = 28;
  const h = 28;
  const body =
    `<path d='M0 7L14 0L28 7' fill='none' stroke-width='2.4'/>` +
    `<path d='M0 21L14 14L28 21' fill='none' stroke-width='1'/>` +
    // continue the bottom chevron across the tile's vertical seam
    `<path d='M0 35L14 28L28 35' fill='none' stroke-width='1'/>` +
    `<path d='M0 -7L14 -14L28 -7' fill='none' stroke-width='2.4'/>`;
  return result(w, h, body, o);
}

/** Triangular/diamond wireframe: both diagonals plus a horizontal. */
export function mesh(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const s = 24;
  const body = `<path d='M0 0L${s} ${s}M${s} 0L0 ${s}M0 ${s / 2}H${s}' fill='none' stroke-width='0.7'/>`;
  return result(s, s, body, o);
}

/** Stacked sine waves. */
export function waves(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const w = 56;
  const h = 28;
  const wave = (y: number, amp: number, sw: number) =>
    `<path d='M0 ${y}C${w / 4} ${y - amp} ${w / 4} ${y - amp} ${w / 2} ${y}C${(3 * w) / 4} ${y + amp} ${(3 * w) / 4} ${y + amp} ${w} ${y}' fill='none' stroke-width='${sw}'/>`;
  return result(w, h, wave(7, 6, 1.1) + wave(21, 6, 0.6), o);
}

/** Dot matrix whose dot size (density) fades along the tile diagonal. Deterministic jitter. */
export function scatter(opts?: PatternOptions): PatternResult {
  const o = defaults(opts);
  const s = 64;
  const n = 8; // dots per row
  const step = s / n;
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let body = '';
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const t = (i + j) / (2 * (n - 1)); // 0 at top-left → 1 at bottom-right
      const r = 0.35 + (1 - t) * 1.5; // large dots fade to pinpoints
      const x = (i + 0.5) * step + (rnd() - 0.5) * step * 0.5;
      const y = (j + 0.5) * step + (rnd() - 0.5) * step * 0.5;
      body += `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r.toFixed(2)}' stroke='none'/>`;
    }
  }
  return result(s, s, body, o);
}

export const patterns: Record<PatternName, (opts?: PatternOptions) => PatternResult> = {
  halftone,
  weave,
  rings,
  grid,
  chevron,
  mesh,
  waves,
  scatter,
};

/**
 * CSS custom properties for a pattern layer, ready for a `style` attribute:
 *   --pattern-image / --pattern-size / --pattern-rotate
 * BackgroundFX (and any `.pattern-layer`) reads these.
 */
export function patternVars(name: PatternName, opts?: PatternOptions): string {
  const p = patterns[name](opts);
  return `--pattern-image: ${p.uri}; --pattern-size: ${p.width}px ${p.height}px; --pattern-rotate: ${p.rotation}deg;`;
}
