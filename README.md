# Portfolio

Personal portfolio site, built to be reused as a template. Everything personal lives in
one config file and three content folders; the components never hardcode a name, link or
sentence.

- **Stack:** [Astro](https://astro.build) 7 · TypeScript (strict) · Tailwind CSS 4 · Astro Content Collections · View Transitions
- **Design:** near-black / coral-red / white, dark by default with a light toggle, CSS/SVG-only background effects
- **Chameleon:** each project can set its own accent colour; the whole page recolours on its detail page
- **Deploy:** static output, zero config on Vercel
- **No runtime dependencies** beyond Astro and Tailwind

## Quick start

```bash
git clone https://github.com/TanjimEram/portfolio.git
cd portfolio
npm install
npm run dev        # http://localhost:4321
```

| Script                  | What it does                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload and the dev-only accent switcher (bottom-right)  |
| `npm run build`         | Production build to `dist/`                                                 |
| `npm run preview`       | Serve the production build locally                                          |
| `npm run fetch:github`  | Draft project entries from your public GitHub repos (see below)             |

Node **22.12+** is required (see `engines` in `package.json`).

## Make it yours

### 1. `src/site.config.ts` — everything personal

| Key                  | Purpose                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `name`, `role`       | Hero headline and one-line intro                                                             |
| `email`, `location`, `links` | Contact details; GitHub URL also drives `fetch:github`                                |
| `hero`               | Eyebrow label, portrait filename, CTA                                                        |
| `stats`              | Numbers for the count-up strip under the hero                                                |
| `resume`, `resumeFilename` | Path under `public/` and the filename offered on download                              |
| `seo`                | Title, description, canonical `url`, OG image, locale                                        |
| `nav`                | Header links                                                                                 |
| `sections`           | Home-page section **order**; set `enabled: false` to hide one                                |
| `pattern`, `sectionPatterns` | Site background pattern, and optional per-section overrides                         |
| `about`, `skills`, `education` | Plain copy and grouped lists                                                       |
| `features`           | Optional modules. `synthHover` = hover/click sound layer (visitor-toggled, off by default)   |

Then:

- **Portrait:** drop a photo into `src/assets/` (e.g. `portrait.jpg`) and set `hero.portrait: 'portrait.jpg'`.
  It is optimised by `astro:assets` and rendered in duotone. With no portrait, a placeholder silhouette is shown.
- **Resume:** put your PDF at `public/resume.pdf`.
- **OG image & icons:** run `powershell -ExecutionPolicy Bypass -File scripts/make-og.ps1` (Windows) to
  regenerate `public/og.png`, `apple-touch-icon.png` and `favicon.ico` from your name. `favicon.svg` is
  generated at build time from your first initial.
- **Domain:** once you have one, set `seo.url` (e.g. `https://example.com`). Until then the site URL is
  taken from Vercel's production URL automatically.

### 2. Content — `src/content/`

One Markdown file per entry. Frontmatter is validated by the schemas in `src/content.config.ts`.

**`projects/*.md`**

```yaml
---
title: Project name
summary: One line shown on the card.
description: A longer line used for SEO and the top of the detail page.
tech: [Astro, TypeScript]
repo: https://github.com/you/project     # optional
live: https://project.example.com        # optional
image: ./project.png                     # optional, relative to the .md file, optimised automatically
color: '#2563eb'                         # optional hex; recolours the detail page ("chameleon")
pattern: grid                            # optional; background pattern for the detail page (see Patterns)
featured: true                           # featured projects show on the home page
order: 1                                 # sort key, ascending
source: manual                           # or "github" for drafts from fetch:github
---
Markdown body: the problem, what you built, and the outcome (numbers, screenshots, links).
```

If no project is `featured`, the home page shows all of them.

**`experience/*.md`** — `org, role, type (club | venture | work), start, end?, highlights[], links[]?, order`

**`achievements/*.md`** — `title, category (art | science | sports | academic | language), detail, year?`

### 3. Import projects from GitHub

```bash
npm run fetch:github                 # user from site.config.ts links.github
npm run fetch:github -- --user NAME  # someone else
npm run fetch:github -- --dry-run    # list only
```

Writes `src/content/projects/<repo>.md` for every public, non-fork, non-archived repo with
`source: github` and `featured: false`. **Existing files are never overwritten**, so edits are safe.
Uses `gh` if installed, otherwise the public REST API (set `GITHUB_TOKEN` for a higher rate limit).

## Design system

- **Tokens** live in `src/styles/theme.css` as CSS variables and are exposed to Tailwind in
  `src/styles/global.css` (`bg-bg`, `text-muted`, `text-accent-ink`, `border-border`, …).
- `--color-accent` is the raw brand colour for fills and decoration. `--color-accent-ink` is the
  same hue nudged to ≥ 4.7:1 contrast for text; use it for links and labels.
- **Chameleon:** `BaseLayout` takes an `accent` prop, computes contrast-safe variants
  (`src/lib/color.ts`) and writes them to `<html>`. `ClientRouter` swaps `<html>` attributes on
  navigation, so leaving the page restores the default accent — no JS.
- **Background** (`BackgroundFX.astro`): halftone dots, glow and grain are all CSS/SVG that read
  `--color-accent`; intensities are the `--fx-*` variables in `theme.css`.
- **Patterns** (`src/lib/patterns.ts`): `halftone`, `weave`, `rings`, `grid`, `chevron`, `mesh`, `waves`,
  `scatter`. Each is a seamless inline-SVG tile used as a `mask-image` over the accent, so colour follows the
  theme and can transition. Set the site default with `pattern`, a per-page one with a project's `pattern`
  frontmatter (pages cross-fade between patterns during navigation), or per-section with `sectionPatterns`.
  Compare them all at `/dev/patterns` while running `npm run dev` (not built in production).
- **Sound** (`src/lib/audio.ts`, `src/scripts/sound.ts`, flag `features.synthHover`): a ~2 KB Web Audio synth,
  D-major pentatonic. Off by default; a speaker toggle in the nav turns it on and persists the choice. The module
  is only downloaded once a visitor enables it, and reduced-motion users are never auto-enabled.
- **Motion** (`src/scripts/motion.ts`): scroll reveal, progress bar, count-up, cursor dot. Everything
  respects `prefers-reduced-motion`; with it on, the page renders in its final state.
- **Fonts:** Inter and JetBrains Mono are self-hosted at build time through Astro's Fonts API
  (`astro.config.ts`). Building needs network access to fetch them once.

## Project layout

```
src/
  site.config.ts          # everything personal + feature flags
  content.config.ts       # collection schemas
  content/{projects,experience,achievements}/*.md
  components/             # Hero, About, ProjectCard, ExperienceItem, Skills, …, BackgroundFX, Nav, Footer, ThemeToggle
  layouts/BaseLayout.astro
  pages/                  # index, projects/[slug], 404, sitemap.xml, robots.txt, favicon.svg
  styles/{theme,global}.css
  scripts/motion.ts
  lib/color.ts            # WCAG contrast helpers
scripts/
  fetch-github.mjs        # GitHub → project drafts
  make-og.ps1             # OG image + icons
public/                   # og.png, icons, resume.pdf
```

## Deploy

**Vercel (recommended):** import the GitHub repo at [vercel.com/new](https://vercel.com/new).
Astro is auto-detected (build `astro build`, output `dist`). Every push to `main` deploys.
Nothing else to configure; the canonical URL is derived from `VERCEL_PROJECT_PRODUCTION_URL`
until you set `seo.url`.

Any static host works: run `npm run build` and serve `dist/`.

## Accessibility & performance

Semantic landmarks, one `h1` per page, skip link, visible focus rings, ≥ 24 px tap targets,
WCAG AA contrast on both themes (including per-project accents), no horizontal scroll at 375 px.
Lighthouse on the production build: desktop 100 / 100 / 100 / 100, mobile performance 95+.

## Working on it with Claude Code

`CLAUDE.md` holds the design rules and working conventions this project was built with.

## License

MIT for the code. Personal content (copy, images, resume) is © the site owner — replace it with your own.
