import type { DoodleType } from './paths';

/** Where a doodle sits relative to its target element. */
export type DoodlePosition = 'left' | 'right' | 'above' | 'below' | 'over';

export interface DoodlePlacement {
  /** CSS selector for the element the doodle is attached to (first match, or first match containing `text`) */
  selector: string;
  /** Narrow `selector` to the first match whose text includes this */
  text?: string;
  type: DoodleType;
  position: DoodlePosition;
  /** Extra shift in px, after positioning */
  offset?: { x?: number; y?: number };
  /** Width in px, or a multiple of the target's width like "1.4w" */
  size?: number | `${number}w`;
  /** Base rotation in degrees (a random ±8° is added on top) */
  rotation?: number;
  /** Show below 768px too (default: hidden on phones) */
  mobile?: boolean;
}
