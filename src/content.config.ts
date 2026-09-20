import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { patternNames } from './lib/patterns';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      description: z.string(),
      tech: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      live: z.string().url().optional(),
      image: image().optional(),
      /** Intro video as a path under /public (e.g. /project_vids/Athena.mp4). A .jpg sibling is used as the poster when it exists. */
      video: z.string().regex(/^\/.+\.mp4$/, 'video must be a /public path ending in .mp4').optional(),
      /** How to run it locally, one line each: lines starting with `#` are directions, the rest are shell commands. Printed by the terminal's `run` command. */
      run: z.array(z.string()).optional(),
      /** Hex colour (#rgb or #rrggbb); overrides the accent on the detail page ("chameleon") */
      color: z
        .string()
        .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'color must be a hex colour like #2563eb')
        .optional(),
      /** Background pattern for the detail page; defaults to site.config `pattern` */
      pattern: z.enum(patternNames).optional(),
      /** Card badge: Shipped / In development / Ongoing */
      status: z.enum(['shipped', 'in-development', 'ongoing']).optional(),
      /** Short qualifier shown next to the status on the detail page, e.g. "Hosting has since expired" */
      statusNote: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      source: z.enum(['github', 'manual']).default('manual'),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    type: z.enum(['club', 'venture', 'work']),
    /** "YYYY" or "YYYY-MM" */
    start: z.string(),
    /** Omit for ongoing */
    end: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).optional(),
    order: z.number().default(0),
  }),
});

const achievements = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/achievements' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['art', 'science', 'sports', 'academic', 'language']),
    detail: z.string(),
    year: z.number().int().optional(),
  }),
});

export const collections = { projects, experience, achievements };
