/**
 * Terminal commands. Pure: given the data blob and an argv, return lines to print and an optional
 * side effect for the runtime to perform. Nothing here touches the DOM.
 */
import { closest, findProject } from './fuzzy';

export interface Project {
  id: string;
  title: string;
  summary: string;
  tech: string[];
  repo: string | null;
  live: string | null;
  featured: boolean;
}
export interface TerminalData {
  user: string;
  name: string;
  role: string;
  location: string;
  email: string;
  links: { github: string; linkedin: string };
  resume: string;
  resumeFilename: string;
  skills: Record<string, string[]>;
  projects: Project[];
  experience: { org: string; role: string; type: string; start: string; end: string | null; highlights: string[] }[];
}

export type Effect =
  | { type: 'navigate'; href: string }
  | { type: 'open'; href: string }
  | { type: 'download'; href: string; name: string }
  | { type: 'theme'; value: 'dark' | 'light' }
  | { type: 'sound'; value: boolean }
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'discover'; id: string };

export interface Result {
  lines: string[];
  effect?: Effect;
}

export const COMMANDS = [
  'help', 'ls', 'cat', 'open', 'live', 'repo', 'whoami', 'skills', 'exp', 'resume', 'contact',
  'theme', 'sound', 'clear', 'exit', 'find', 'whois',
];
/** Commands whose first argument is a project */
export const PROJECT_COMMANDS = ['cat', 'open', 'live', 'repo'];

const HELP = [
  'help                 this list',
  'ls [--all]           projects (add --all for everything)',
  'cat <project>        summary, stack and links',
  'open <project>       go to the project page',
  'live <project>       open the live site',
  'repo <project>       open the source',
  'whoami               who runs this place',
  'skills               grouped skills',
  'exp                  experience timeline',
  'resume               download the resume',
  'contact              email and links',
  'theme <dark|light>   switch theme',
  'sound <on|off>       toggle sound',
  'clear                clear the screen',
  'exit                 back to the grid',
  '',
  'tab completes, ↑/↓ walk history, ctrl+l clears, ctrl+c cancels.',
];

const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

function pick(data: TerminalData, arg: string | undefined, cmd: string): Project | string[] {
  if (!arg) return [`usage: ${cmd} <project>   (try: ls)`];
  const p = findProject(data.projects, arg);
  if (p) return p;
  const near = closest(arg, data.projects.map((x) => x.id));
  return [`no project called "${arg}".`, ...(near ? [`did you mean: ${cmd} ${near}?`] : ['try: ls'])];
}

export function run(data: TerminalData, input: string): Result {
  const argv = input.trim().split(/\s+/).filter(Boolean);
  const [cmd = '', ...args] = argv;
  const arg = args[0];
  if (!cmd) return { lines: [] };

  switch (cmd.toLowerCase()) {
    case 'help':
    case '?':
      return { lines: HELP };

    case 'ls': {
      const all = args.includes('--all') || args.includes('-a');
      const list = all ? data.projects : data.projects.filter((p) => p.featured);
      const shown = list.length ? list : data.projects;
      const lines = shown.map(
        (p, i) => `${String(i + 1).padStart(2, '0')}  ${pad(p.id, 32)} ${p.tech.slice(0, 3).join(', ') || '—'}`,
      );
      if (!all && shown.length < data.projects.length) lines.push('', `${data.projects.length - shown.length} more with ls --all`);
      return { lines };
    }

    case 'cat': {
      const p = pick(data, arg, 'cat');
      if (Array.isArray(p)) return { lines: p };
      return {
        lines: [
          `# ${p.title}`,
          p.summary,
          '',
          `stack:  ${p.tech.join(', ') || '—'}`,
          `page:   /projects/${p.id}/`,
          ...(p.live ? [`live:   ${p.live}`] : []),
          ...(p.repo ? [`repo:   ${p.repo}`] : []),
        ],
      };
    }

    case 'open': {
      const p = pick(data, arg, 'open');
      if (Array.isArray(p)) return { lines: p };
      return { lines: [`opening ${p.title}…`], effect: { type: 'navigate', href: `/projects/${p.id}/` } };
    }

    case 'live':
    case 'repo': {
      const p = pick(data, arg, cmd);
      if (Array.isArray(p)) return { lines: p };
      const href = cmd === 'live' ? p.live : p.repo;
      if (!href) return { lines: [`${p.title} has no ${cmd === 'live' ? 'live site' : 'public repo'} listed.`] };
      return { lines: [`opening ${href}`], effect: { type: 'open', href } };
    }

    case 'whoami':
      return { lines: [`${data.name} — ${data.role}`, `${data.location}`] };

    case 'skills':
      return { lines: Object.entries(data.skills).map(([g, items]) => `${pad(g.toLowerCase(), 8)} ${items.join(', ')}`) };

    case 'exp':
      return {
        lines: data.experience.flatMap((e) => [
          `${e.start} – ${e.end ?? 'present'}   ${e.role} · ${e.org} (${e.type})`,
          ...e.highlights.map((h) => `    - ${h}`),
          '',
        ]),
      };

    case 'resume':
      return { lines: [`downloading ${data.resumeFilename}…`], effect: { type: 'download', href: data.resume, name: data.resumeFilename } };

    case 'contact':
      return { lines: [`email     ${data.email}`, `github    ${data.links.github}`, `linkedin  ${data.links.linkedin}`] };

    case 'theme':
      if (arg === 'dark' || arg === 'light') return { lines: [`theme → ${arg}`], effect: { type: 'theme', value: arg } };
      return { lines: ['usage: theme <dark|light>'] };

    case 'sound':
      if (arg === 'on' || arg === 'off') return { lines: [`sound → ${arg}`], effect: { type: 'sound', value: arg === 'on' } };
      return { lines: ['usage: sound <on|off>'] };

    case 'clear':
      return { lines: [], effect: { type: 'clear' } };

    case 'exit':
    case 'quit':
      return { lines: ['back to the grid.'], effect: { type: 'exit' } };

    case 'sudo':
      return { lines: ['nice try, visitor. this incident will be reported (it will not).'] };

    case 'secret':
    case 'find':
      return { lines: ['there are things hidden on this site. the magnifier in the corner keeps count.', 'one of them is a question this terminal can answer.'] };

    case 'whois':
      if (arg?.toLowerCase() === data.user) {
        return {
          lines: [`${data.user}: ${data.name}.`, data.role + '.', 'builds things, draws things, and hides small surprises in websites.'],
          effect: { type: 'discover', id: 'whois' },
        };
      }
      return { lines: [`whois: no record for "${arg ?? ''}"`] };

    default: {
      const near = closest(cmd, COMMANDS);
      return { lines: [`${cmd}: command not found.`, near ? `did you mean: ${near}?` : 'type help for the list.'] };
    }
  }
}
