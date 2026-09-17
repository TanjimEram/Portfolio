/**
 * Single source of truth for everything personal on the site.
 * Components must read from here (or from content collections) — never hardcode.
 */

export type SectionId =
  | 'hero'
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'achievements'
  | 'contact';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  /** Owner */
  name: string;
  role: string;
  email: string;
  location: string;
  links: {
    github: string;
    linkedin: string;
  };
  /** Path under /public */
  resume: string;

  /** <head> metadata */
  seo: {
    title: string;
    description: string;
    /** Canonical origin, no trailing slash. Set once deployed. */
    url: string;
    lang: string;
  };

  /** Top navigation, in order */
  nav: NavLink[];

  /** Home page sections render in this order; set `enabled: false` to hide one */
  sections: { id: SectionId; enabled: boolean }[];

  /** About: 3–4 plain sentences, one per array item */
  about: string[];

  /** Skills: grouped plain lists — no bars, no percentages */
  skills: Record<string, string[]>;

  /** Feature flags reserved for later modules. Keep false until built. */
  features: {
    synthHover: boolean;
    doodles: boolean;
    easterEggs: boolean;
    caseFile: boolean;
    terminalView: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Tanjim Mustak Eram',
  role: 'CSE undergraduate at North South University (3rd year): web developer & designer',
  email: 'eramtanjim@gmail.com',
  location: 'Dhaka, Bangladesh',
  links: {
    github: 'https://github.com/TanjimEram',
    linkedin: 'https://www.linkedin.com/in/tanjim-mustak-eram-1a1429181/',
  },
  resume: '/resume.pdf',

  seo: {
    title: 'Tanjim Mustak Eram',
    description: 'Web developer & designer. CSE undergraduate at North South University, Dhaka.',
    url: '',
    lang: 'en',
  },

  nav: [
    { label: 'Projects', href: '/#projects' },
    { label: 'Experience', href: '/#experience' },
    { label: 'Contact', href: '/#contact' },
  ],

  sections: [
    { id: 'hero', enabled: true },
    { id: 'about', enabled: true },
    { id: 'projects', enabled: true },
    { id: 'experience', enabled: true },
    { id: 'skills', enabled: true },
    { id: 'achievements', enabled: true },
    { id: 'contact', enabled: true },
  ],

  // TODO: replace placeholder copy
  about: [
    'Placeholder: first sentence about what you build.',
    'Placeholder: second sentence about how you work.',
    'Placeholder: third sentence about what you are looking for.',
  ],

  // TODO: fill in real skills
  skills: {
    Web: ['Placeholder'],
    Design: ['Placeholder'],
    Tools: ['Placeholder'],
  },

  features: {
    synthHover: false,
    doodles: false,
    easterEggs: false,
    caseFile: false,
    terminalView: false,
  },
};

export default siteConfig;
