/**
 * Single source of truth for everything personal on the site.
 * Components must read from here (or from content collections) — never hardcode.
 */
import type { PatternName } from './lib/patterns';
import type { DoodlePlacement } from './modules/doodles/types';

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
  /** Hero copy */
  hero: {
    /** Small mono label above the name */
    eyebrow: string;
    /** Short paragraph under the role line */
    intro: string;
    /**
     * Cut-out portrait (transparent PNG) as a path under /public — `scripts/process-images.py` makes it.
     * A `.webp` sibling and a `-sm.webp` (phone) sibling are used when they exist. Omit for the placeholder silhouette.
     */
    portrait?: string;
    portraitAlt: string;
    cta: { label: string; href: string };
    /** Label of the resume button */
    resumeLabel: string;
  };

  /** Handwritten signature as a path under /public to an SVG (one <path>, see scripts/process-images.py). Shown under the portrait and in the footer. */
  signature?: string;

  /** Numbers worth showing. Rendered with a count-up; value is the final number */
  stats: { value: number; suffix?: string; label: string }[];

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

  /** Site-wide background pattern (see src/lib/patterns.ts). Projects can override it per page. */
  pattern: PatternName;
  /** Optional per-section pattern, drawn inside that section on top of the site pattern */
  sectionPatterns?: Partial<Record<SectionId, PatternName>>;

  /** About: 3–4 plain sentences, one per array item */
  about: string[];

  /** Skills: grouped plain lists — no bars, no percentages */
  skills: Record<string, string[]>;

  /** Contact section: one plain line above the email */
  contact: { line: string };

  /** Education, most recent first */
  education: {
    degree: string;
    institution: string;
    start: string;
    /** Omit for ongoing */
    end?: string;
  }[];

  /**
   * Margin doodles (Full Experience only, `features.doodles`). Declared here, never in components.
   * `selector` (+ optional `text`) picks the target; doodles sit in the whitespace around it.
   */
  doodles?: DoodlePlacement[];

  /** Discovery (easter-egg) copy and settings — `features.easterEggs` */
  discovery?: {
    /** Shown in the panel once everything is found */
    completeNote: string;
    /** Revealed by scrolling past the bottom of the page */
    bottomMessage: string;
    /** Accent presets cycled by triple-clicking the logo; index 0 is "back to normal" */
    palette: string[];
  };

  /** Feature flags for optional Full Experience modules. Keep false until the module exists. */
  features: {
    doodles: boolean;
    easterEggs: boolean;
    caseFile: boolean;
    terminalView: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Tanjim Eram',
  role: 'Aspiring engineer · Web developer · Artist',
  email: 'eramtanjim@gmail.com',
  location: 'Dhaka, Bangladesh',
  links: {
    github: 'https://github.com/TanjimEram',
    linkedin: 'https://www.linkedin.com/in/tanjim-mustak-eram-1a1429181/',
  },
  hero: {
    eyebrow: 'Portfolio · Dhaka, Bangladesh',
    intro:
      'I build software and websites that solve real problems — usually mine first. Fourth-year CSE student at North South University, based in Dhaka, open to internships and part-time work.',
    portrait: '/images/profile/tanjim.png',
    portraitAlt: 'Tanjim Eram in a black suit, cut out against the accent disc',
    cta: { label: 'View projects', href: '#projects' },
    resumeLabel: 'Download resume',
  },
  signature: '/images/signature.svg',

  stats: [],

  resume: '/resume.pdf',
  resumeFilename: 'Tanjim-Eram-Resume.pdf',

  seo: {
    title: 'Tanjim Eram',
    description:
      'Aspiring engineer, web developer and artist. Fourth-year CSE student at North South University, Dhaka — open to internships and part-time work.',
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

  pattern: 'halftone',
  sectionPatterns: {},

  about: [
    "I build things. Software, websites, anything technical that solves a problem — and the problem is usually my own first. Athena started because I wanted a voice assistant for my laptop. Goyenda started because my friends and I wanted something to do together that wasn't scrolling on our phones.",
    "I've been drawing since I was a kid — over 50 competitions, including the Toyota Dream Car Art Contest — so I care about how a thing looks, not just whether it runs. Football taught me the other half: you keep going when the plan isn't working, and you finish the match.",
    "Right now I'm in my fourth year of CSE at North South University, getting Goyenda ready to launch, and looking for an internship or part-time work in Dhaka. If you're hiring, or you want a site built, my inbox is open.",
  ],

  skills: {
    Web: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Next.js', 'WordPress', 'Elementor'],
    Software: ['Python', 'Flask', 'PostgreSQL', 'Supabase', 'Google Apps Script', 'Voice & speech APIs', 'Automation scripting'],
    Design: ['Figma', 'Canva', 'UI/UX', 'Illustration'],
    Tools: ['Git', 'Power BI', 'Microsoft 365', 'CapCut'],
  },

  contact: {
    line: 'Open to internships and part-time work in Dhaka. Also available for freelance site builds.',
  },

  education: [
    { degree: 'BSc in Computer Science & Engineering', institution: 'North South University', start: '2022' },
    { degree: 'HSC, Science', institution: 'Adamjee Cantonment College', start: '2019', end: '2021' },
  ],

  doodles: [
    // curved arrow pointing at the hero CTA
    { selector: '#hero a[href="#projects"]', type: 'arrow-curve', position: 'below', offset: { x: 40, y: 10 }, size: 72, rotation: 200 },
    // rough underline under the About heading
    { selector: '#about h2', type: 'underline-rough', position: 'below', size: '1.1w', offset: { x: -4, y: -12 } },
    // star-burst beside the Top Contributor award
    { selector: '#experience li', text: 'Top Contributor', type: 'star-burst', position: 'right', size: 26, offset: { x: 4, y: -2 } },
    // brackets framing the contact email
    { selector: '#contact a[href^="mailto:"]', type: 'bracket-left', position: 'left', size: 14, offset: { x: -2 } },
    { selector: '#contact a[href^="mailto:"]', type: 'bracket-right', position: 'right', size: 14, offset: { x: 2 } },
  ],

  discovery: {
    completeNote: "That's everything — thank you for looking around so carefully. If you'd like to work together, write to me:",
    bottomMessage: 'You scrolled past the end. There was nothing here, but now there is — hello.',
    palette: ['#e8412f', '#2563eb', '#f59e0b', '#22c55e', '#7c3aed', '#ec4899'],
  },

  features: {
    doodles: true,
    easterEggs: true,
    terminalView: true,
    caseFile: false,
  },
};

export default siteConfig;
