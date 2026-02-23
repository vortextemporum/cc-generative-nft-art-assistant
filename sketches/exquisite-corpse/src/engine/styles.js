import * as ink from './render-ink.js';
import * as circuit from './render-circuit.js';

export const STYLES = {
  ink: { name: 'Ink', description: 'Monochrome ink on paper', bg: 'ink', renderer: ink },
  circuit: { name: 'Circuit', description: 'Neon network on dark', bg: 'circuit', renderer: circuit },
};

export const STYLE_KEYS = Object.keys(STYLES);
