import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/** Hand-rolled sitemap: home + every project page. Add new static routes here. */
export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const urls = ['/', '/projects/', ...projects.map((p) => `/projects/${p.id}/`)].map((path) => new URL(path, site).href);

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
