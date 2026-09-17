import type { APIRoute } from 'astro';
import { siteConfig } from '../site.config';

/** Monogram favicon generated from the owner's first initial: black tile, white letter, red mark. */
export const GET: APIRoute = () => {
  const letter = siteConfig.name.trim().charAt(0).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="12" fill="#0a0a0a"/>` +
    `<rect x="12" y="46" width="40" height="6" rx="3" fill="#f13d4d"/>` +
    `<text x="32" y="40" text-anchor="middle" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${letter}</text>` +
    `</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
