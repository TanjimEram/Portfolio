import type { Discoverable } from './store';

/** Settings handed to the runtime by Discovery.astro (from site.config) */
export interface DiscoveryConfig {
  email: string;
  /** Shown when everything is found (until a later phase replaces it) */
  completeNote: string;
  /** Revealed by the `bottom` discovery */
  bottomMessage: string;
  /** Preset accents cycled by the `logo-triple` discovery */
  palette: string[];
}

export interface EggContext {
  config: DiscoveryConfig;
  reduced: boolean;
  /** Mark this egg found (idempotent) */
  found: (id: string) => boolean;
}

/** One easter egg: its discoverable entry plus how it hooks into the page. */
export interface Egg extends Discoverable {
  /** Attach listeners / DOM. Returns a detach function. Called again after every page navigation. */
  attach(ctx: EggContext): () => void;
  /** Fire the egg's effect programmatically (dev page) */
  trigger?(ctx: EggContext): void;
}
