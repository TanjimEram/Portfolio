/**
 * `whois` — answered by the terminal (`whois tanjim`). Data-only here: the terminal module calls
 * found('whois') itself; this entry just makes it the eighth discoverable with a hint.
 */
import type { Egg } from '../types';

export const whois: Egg = {
  id: 'whois',
  label: 'the whois record',
  hint: 'The terminal keeps a record. Ask it who.',
  points: 15,
  attach: () => () => {},
  trigger: ({ found }) => void found('whois'),
};
