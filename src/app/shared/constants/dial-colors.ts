export interface DialColorSwatch {
  accent: string;
  background: string;
  border?: string;
  boxShadow?: string;
}

export const DIAL_COLOR_OPTIONS: string[] = [
  'Black',
  'White',
  'Silver',
  'Grey',
  'Blue',
  'Green',
  'Red',
  'Brown',
  'Gold',
  'Rose Gold',
  'Yellow',
  'Orange',
  'Pink',
  'Purple',
];

const DIAL_COLOR_STYLE_ENTRIES: Array<[string, DialColorSwatch]> = [
  ['black', { accent: '#000000', background: '#000000' }],
  [
    'white',
    {
      accent: '#c9c9c9',
      background: '#ffffff',
      border: '1px solid #d9d9d9',
    },
  ],
  ['silver', { accent: '#9ea4aa', background: '#c0c0c0' }],
  ['grey', { accent: '#6b7280', background: '#808080' }],
  ['gray', { accent: '#6b7280', background: '#808080' }],
  ['blue', { accent: '#0057b8', background: '#0057b8' }],
  ['green', { accent: '#008000', background: '#008000' }],
  ['red', { accent: '#c00000', background: '#c00000' }],
  ['brown', { accent: '#8b4513', background: '#8b4513' }],
  ['gold', { accent: '#b18a2d', background: '#d4af37' }],
  ['rose gold', { accent: '#b76e79', background: '#b76e79' }],
  ['yellow', { accent: '#d4a000', background: '#ffd700' }],
  ['orange', { accent: '#ff8c00', background: '#ff8c00' }],
  ['pink', { accent: '#e67ca4', background: '#ffc0cb' }],
  ['purple', { accent: '#800080', background: '#800080' }],
];

export const normalizeDialColor = (color: string): string =>
  color
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const DIAL_COLOR_STYLE_MAP = DIAL_COLOR_STYLE_ENTRIES.reduce(
  (styleMap, [color, style]) => {
    styleMap[normalizeDialColor(color)] = style;
    return styleMap;
  },
  {} as Record<string, DialColorSwatch>,
);

export const DEFAULT_DIAL_COLOR_SWATCH: DialColorSwatch = {
  accent: '#8a8f6a',
  background: '#d4d4d4',
  border: '1px solid #d9d9d9',
};

export const getDialColorSwatch = (color: string): DialColorSwatch =>
  DIAL_COLOR_STYLE_MAP[normalizeDialColor(color)] ?? DEFAULT_DIAL_COLOR_SWATCH;
