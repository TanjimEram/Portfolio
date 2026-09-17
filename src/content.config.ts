import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
      /** Hex colour (#rgb or #rrggbb); overrides the accent on the detail page ("chameleon") */
      color: z
        .string()
        .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'color must be a hex colour like #2563eb')
        .optional(),
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
