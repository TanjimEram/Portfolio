import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/site.config';

// Canonical origin: site.config.ts wins; otherwise Vercel's production URL at build time.
const site =
  siteConfig.seo.url ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
