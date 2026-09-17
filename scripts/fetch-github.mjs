#!/usr/bin/env node
/**
 * Drafts src/content/projects/<repo>.md from a user's public GitHub repos.
 *
 *   npm run fetch:github               # user taken from site.config.ts links.github
 *   npm run fetch:github -- --user X   # explicit user
 *   npm run fetch:github -- --dry-run  # list only, write nothing
 *
 * - Skips forks and archived repos.
 * - Never overwrites an existing file (manual edits win).
 * - Uses `gh` if available (higher rate limit), else the public REST API.
 *   Set GITHUB_TOKEN to authenticate REST calls.
 *
 * One-time/occasional draft generator — not a build-time dependency.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'src/content/projects');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const userArg = args[args.indexOf('--user') + 1];
const user = args.includes('--user') && userArg ? userArg : userFromConfig();

if (!user) {
  console.error('No GitHub user. Pass --user <name> or set links.github in src/site.config.ts');
  process.exit(1);
}

function userFromConfig() {
  try {
    const src = readFileSync(resolve(root, 'src/site.config.ts'), 'utf8');
    return src.match(/github:\s*['"]https:\/\/github\.com\/([^/'"]+)/)?.[1];
  } catch {
    return undefined;
  }
}

function hasGh() {
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const useGh = hasGh();

async function api(path) {
  if (useGh) {
    return JSON.parse(execFileSync('gh', ['api', '--paginate', path], { encoding: 'utf8' }));
  }
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-fetch-github' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

/** YAML-safe scalar (double-quoted JSON is valid YAML) */
const y = (s) => JSON.stringify(s ?? '');

function toMarkdown(repo, tech) {
  const summary = repo.description?.trim() || 'TODO: one-line summary';
  const lines = [
    '---',
    `title: ${y(repo.name)}`,
    `summary: ${y(summary)}`,
    `description: ${y(summary)}`,
    `tech: [${tech.map(y).join(', ')}]`,
    `repo: ${y(repo.html_url)}`,
    repo.homepage ? `live: ${y(repo.homepage)}` : null,
    'featured: false',
    'order: 0',
    'source: github',
    '---',
    '',
    'TODO: describe the problem, what you built, and the outcome (numbers, screenshots, links).',
    '',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

const repos = await api(`/users/${user}/repos?per_page=100&type=owner&sort=updated`);
const kept = repos.filter((r) => !r.fork && !r.archived);

const rows = [];
let written = 0;
let skipped = 0;

for (const repo of kept) {
  const languages = Object.keys(await api(`/repos/${repo.owner.login}/${repo.name}/languages`));
  const tech = [...new Set([...languages, ...(repo.topics ?? [])])];
  const file = resolve(outDir, `${repo.name}.md`);
  let status;

  if (existsSync(file)) {
    status = 'exists';
    skipped++;
  } else if (dryRun) {
    status = 'dry-run';
  } else {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(file, toMarkdown(repo, tech));
    status = 'written';
    written++;
  }

  rows.push({
    name: repo.name,
    description: repo.description ?? '',
    language: repo.language ?? '',
    live: repo.homepage ?? '',
    status,
  });
}

console.table(rows);
console.log(
  `\n${user}: ${repos.length} repos, ${repos.length - kept.length} forks/archived skipped, ` +
    `${written} written, ${skipped} already existed${dryRun ? ' (dry run)' : ''}.`,
);
