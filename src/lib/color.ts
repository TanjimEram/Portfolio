/**
 * Small colour helpers for the per-project accent ("chameleon").
 * Adjusts a project's colour so it still meets WCAG AA (4.5:1) as text on each theme's background,
 * and picks a black/white contrast colour for text on top of it. Hex input only.
 */

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** WCAG relative luminance */
export function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, 1–21 */
export function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/**
 * Nudge `color`'s lightness (keeping hue/saturation) until it reaches `ratio` against `bg`.
 * Lightens on dark backgrounds, darkens on light ones.
 */
export function ensureContrast(color: RGB, bg: RGB, ratio = 4.5): RGB {
  if (contrast(color, bg) >= ratio) return color;
  const [h, s, l] = rgbToHsl(color);
  const lighten = luminance(bg) < 0.5;
  let lo = l;
  let out = color;
  for (let i = 0; i < 40; i++) {
    lo += lighten ? 0.02 : -0.02;
    if (lo < 0 || lo > 1) break;
    out = hslToRgb([h, s, lo]);
    if (contrast(out, bg) >= ratio) return out;
  }
  return out;
}

/** White or black, whichever reads better on `color` */
export function contrastColor(color: RGB): string {
  return contrast(color, [255, 255, 255]) >= contrast(color, [0, 0, 0]) ? '#ffffff' : '#000000';
}

export interface AccentSet {
  /** Raw colour for fills/decoration on the dark theme */
  dark: string;
  /** Same hue, nudged to ≥ 4.7:1 on the dark surface — use for text */
  darkInk: string;
  /** Text colour on top of `dark` */
  darkContrast: string;
  light: string;
  lightInk: string;
  lightContrast: string;
}

/** Theme surfaces — keep in sync with src/styles/theme.css (text sits on bg AND surfaces, so test the lighter one) */
const DARK_SURFACE: RGB = [0x1c, 0x1c, 0x20];
const LIGHT_SURFACE: RGB = [255, 255, 255];

export function accentSet(hex: string): AccentSet {
  const base = hexToRgb(hex);
  // Fills keep the raw colour; ink variants are corrected for AA text contrast.
  const darkInk = ensureContrast(base, DARK_SURFACE, 4.7);
  const lightInk = ensureContrast(base, LIGHT_SURFACE, 4.7);
  return {
    dark: rgbToHex(base),
    darkInk: rgbToHex(darkInk),
    darkContrast: contrastColor(base),
    light: rgbToHex(base),
    lightInk: rgbToHex(lightInk),
    lightContrast: contrastColor(base),
  };
}
