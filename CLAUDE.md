# Portfolio — Tanjim Mustak Eram

Personal portfolio site. Clean, plain, professional layout. **Show, don't tell**: let projects, live sites, numbers and screenshots do the talking. No buzzwords, no skill-percentage bars, no "passionate / result-driven" copy.

This site will later be turned into a reusable template, so keep everything **config-driven and modular**.

## Stack
- **Astro** (latest) + **TypeScript**
- **Tailwind CSS** (via the official Astro/Vite integration)
- Astro **Content Collections** for projects, experience and achievements
- Astro **View Transitions** for page/color transitions
- Deploy: **Vercel** (auto-deploy from GitHub `main`)
- No heavy UI frameworks. Plain Astro components; tiny vanilla JS islands only where needed.

## Owner info
- Name: Tanjim Mustak Eram
- Role line: CSE undergraduate at North South University (3rd year): web developer & designer
- Email: eramtanjim@gmail.com
- GitHub: https://github.com/TanjimEram
- LinkedIn: https://www.linkedin.com/in/tanjim-mustak-eram-1a1429181/
- Location: Dhaka, Bangladesh
- Do NOT publish a phone number or home address.

## Design rules
- Palette: **black, red, white**. Define as CSS variables in `src/styles/theme.css`:
  - `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent` (red), `--color-accent-contrast`
- Dark (black bg) is the default; include a light (white bg) mode toggle.
- Red is an accent only: links, highlights, buttons, focus rings. Never large red text blocks.
- Typography: one clean sans-serif (e.g. Inter or Geist) and an optional mono for small labels. Generous whitespace.
- **Project color shift ("chameleon")**: each project has an optional `color` in its frontmatter. On a project detail page, override `--color-accent` (and a subtle bg tint) with that color, animated via View Transitions. Returning to the home page restores red. Ensure text contrast stays WCAG AA.
- Mobile-first, fully responsive, no horizontal scroll.
- Accessibility: semantic HTML, keyboard navigable, visible focus, alt text, `prefers-reduced-motion` respected.
- Performance: Lighthouse 95+ target; optimize images with `astro:assets`.

## Architecture (template-ready)
```
src/
  site.config.ts          # name, role, links, nav, section order, feature flags
  content/
    projects/*.md         # one file per project
    experience/*.md       # jobs, clubs, ventures
    achievements/*.md     # awards, competitions, certificates
  components/             # Hero, About, ProjectCard, ExperienceItem, Skills, Contact, Nav, Footer, ThemeToggle
  layouts/BaseLayout.astro
  pages/index.astro
  pages/projects/[slug].astro
  styles/theme.css
scripts/
  fetch-github.mjs        # pulls repos → drafts in src/content/projects
public/
  resume.pdf
```
- **Nothing personal is hardcoded in components.** All text/links come from `site.config.ts` or content collections.
- Sections render in the order listed in `site.config.ts` and can be turned off with flags.
- Feature flags for optional modules: `doodles` (built, `src/modules/doodles/`), and reserved (keep `false`): `easterEggs`, `caseFile`, `terminalView`. Playful modules plug into `src/lib/experience.ts` (`registerModule({ id, enable, disable })`) and only run in "Full Experience" mode, which visitors toggle in the nav; sound is the first such module.

## Content schemas
**projects**: `title, summary, description, tech[], repo?, live?, image?, color?, featured (bool), order, source ("github" | "manual")`
**experience**: `org, role, type ("club" | "venture" | "work"), start, end?, highlights[], links[]?, order`
**achievements**: `title, category ("art" | "science" | "sports" | "academic" | "language"), detail, year?`

## GitHub import
`scripts/fetch-github.mjs` uses the public GitHub REST API (or `gh` CLI if available) for user `TanjimEram`:
- Skip forks and archived repos.
- For each repo, write `src/content/projects/<repo-name>.md` with title, description, languages/topics as `tech`, repo URL, homepage as `live`, `source: github`, `featured: false`.
- **Never overwrite** a file that already exists (manual edits win). Print a summary.
- It's a one-time/occasional draft generator, not a build-time dependency.

## Page sections (home)
1. **Hero**: name, one-line role, 2 buttons (View projects, Resume) + GitHub/LinkedIn/Email icons
2. **About**: 3–4 plain sentences
3. **Featured projects**: cards → detail pages
4. **Experience & Leadership**: NSU MiBC (club), XeroHour (venture)
5. **Skills**: grouped plain lists (Web, Design, Tools), no bars
6. **Achievements**: compact grid
7. **Contact**: email + links, simple
8. Footer

## Working rules
- Build one section at a time; run `npm run dev` and check before moving on.
- Run `npm run build` before committing; fix all type/build errors.
- Small, descriptive git commits after each working step.
- Ask before adding any new dependency.
