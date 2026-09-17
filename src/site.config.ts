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
  /** Filename offered when the resume is downloaded */
  resumeFilename: string;

  /** <head> metadata */
  seo: {
    title: string;
    description: string;
    /** Canonical origin, no trailing slash. Leave empty to use Vercel's production URL. */
    url: string;
    lang: string;
    /** Open Graph locale, e.g. en_US */
    locale: string;
    /** Path under /public, 1200×630. Regenerate with scripts/make-og.ps1 */
    ogImage: string;
  };

  /** Top navigation, in order */
  nav: NavLink[];

  /** Home page sections render in this order; set `enabled: false` to hide one */
  sections: { id: SectionId; enabled: boolean }[];

  /** About: 3–4 plain sentences, one per array item */
  about: string[];

  /** Skills: grouped plain lists — no bars, no percentages */
  skills: Record<string, string[]>;

  /** Education, most recent first */
  education: {
    degree: string;
    institution: string;
    start: string;
    /** Omit for ongoing */
    end?: string;
  }[];

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
  resumeFilename: 'Tanjim-Mustak-Eram-Resume.pdf',

  seo: {
    title: 'Tanjim Mustak Eram',
    description: 'Web developer & designer. CSE undergraduate at North South University, Dhaka.',
    url: '',
    lang: 'en',
    locale: 'en_US',
    ogImage: '/og.png',
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

  skills: {
    Web: ['HTML', 'CSS', 'JavaScript', 'Python', 'Node.js', 'WordPress'],
    Design: ['Figma', 'Canva', 'UI/UX'],
    Tools: ['Power BI', 'Microsoft 365', 'CapCut', 'PowerPoint'],
  },

  education: [
    { degree: 'BSc in Computer Science & Engineering', institution: 'North South University', start: '2022' },
    { degree: 'HSC, Science', institution: 'Adamjee Cantonment College', start: '2019', end: '2021' },
  ],

  features: {
    synthHover: false,
    doodles: false,
    easterEggs: false,
    caseFile: false,
    terminalView: false,
  },
};

export default siteConfig;
