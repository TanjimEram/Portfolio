/**
 * Doodle library: loose, hand-drawn SVG paths, as if sketched in a margin with a pen.
 * Every entry is ONE <path> (sub-paths joined with M) so a single dash animation draws it,
 * and every path is normalised with pathLength="1" by the renderer, so drawing is just
 * `stroke-dashoffset: 1 → 0`. Coordinates are loose on purpose — no straight lines, no perfect arcs.
 */

export interface DoodlePath {
  /** viewBox width/height */
  w: number;
  h: number;
  d: string;
}

export const doodlePaths = {
  /** curved arrow, tail top-left → head bottom-right */
  'arrow-curve': {
    w: 120,
    h: 100,
    d: 'M9 17 C22 52 48 79 82 74 C92 72 99 67 105 61 M89 49 C95 54 101 58 106 62 C99 65 93 70 88 75',
  },
  /** squiggly arrow, left → right */
  'arrow-squiggle': {
    w: 130,
    h: 60,
    d: 'M6 32 C15 12 24 50 36 30 C47 11 56 49 68 31 C79 12 88 48 100 31 L112 31 M98 18 C104 23 109 27 114 31 C108 36 103 40 98 45',
  },
  /** an ellipse drawn about one-and-a-half times, for circling a word */
  'circle-scribble': {
    w: 140,
    h: 70,
    d: 'M72 9 C104 6 132 19 129 37 C126 56 96 66 64 63 C33 60 8 47 11 31 C14 14 42 5 70 8 C99 11 124 24 122 40 C119 57 88 66 56 62 C36 59 22 51 20 42',
  },
  /** two rough strokes under a heading */
  'underline-rough': {
    w: 200,
    h: 24,
    d: 'M4 10 C42 6 84 13 126 8 C152 6 176 11 196 7 M12 17 C60 13 110 19 150 15 C166 13 178 15 188 14',
  },
  /** eight uneven rays */
  'star-burst': {
    w: 80,
    h: 80,
    d: 'M40 5 L41 22 M63 15 L53 27 M75 41 L58 40 M64 66 L53 53 M39 75 L40 58 M15 65 L27 54 M5 39 L22 40 M16 15 L27 27',
  },
  /** exclamation mark */
  'exclamation': {
    w: 40,
    h: 90,
    d: 'M18 7 C24 26 17 44 21 60 M19 76 C22 76 24 79 22 82 C20 84 17 82 18 79',
  },
  'bracket-left': {
    w: 30,
    h: 100,
    d: 'M23 5 C12 6 8 11 9 21 C10 40 8 60 9 79 C8 90 13 95 24 95',
  },
  'bracket-right': {
    w: 30,
    h: 100,
    d: 'M7 5 C18 6 22 11 21 21 C20 40 22 60 21 79 C22 90 17 95 6 95',
  },
  'check-mark': {
    w: 80,
    h: 60,
    d: 'M7 33 C16 38 23 47 29 53 C39 36 55 20 74 7',
  },
  /** a coffee-cup ring: one and a bit turns, with a gap */
  'coffee-ring': {
    w: 100,
    h: 100,
    d: 'M52 10 C75 8 92 27 90 49 C88 72 69 90 46 88 C24 86 8 68 10 46 C12 24 31 9 53 12 C72 15 85 30 84 47 C83 60 75 71 63 77',
  },
  /** paper plane: outline then the fold */
  'paper-plane': {
    w: 100,
    h: 80,
    d: 'M6 41 C34 30 62 19 92 8 C83 30 74 51 65 72 C59 63 52 55 46 47 C33 45 19 43 6 41 M46 47 C61 34 77 21 92 8',
  },
  /** bulb, then two base lines */
  'lightbulb': {
    w: 60,
    h: 90,
    d: 'M30 6 C14 6 6 20 10 34 C13 44 20 49 22 58 L38 58 C40 49 47 44 50 34 C54 20 46 6 30 6 M22 67 C27 66 33 67 38 66 M24 75 C28 74 32 75 36 74',
  },
  /** quarter note */
  'music-note': {
    w: 60,
    h: 80,
    d: 'M31 58 C21 53 11 60 15 68 C19 76 33 74 33 64 C33 48 32 30 31 13 C39 19 48 22 49 33',
  },
} as const satisfies Record<string, DoodlePath>;

export type DoodleType = keyof typeof doodlePaths;
export const doodleTypes = Object.keys(doodlePaths) as DoodleType[];
