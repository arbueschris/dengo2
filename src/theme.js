// Sistema de cores do Dengo. Só o "acento" muda entre temas; o resto se adapta ao modo claro/escuro.
export const THEMES = [
  { key: 'coral', name: 'Coral', a: '#DE7150', b: '#F2A07E' },
  { key: 'rosa', name: 'Rosa', a: '#D6547F', b: '#EE8DAB' },
  { key: 'lavanda', name: 'Lavanda', a: '#7B61D9', b: '#A996EE' },
  { key: 'oceano', name: 'Oceano', a: '#2A7BA8', b: '#6DB6DE' },
  { key: 'floresta', name: 'Floresta', a: '#2F8A5E', b: '#7CC9A1' },
];

export const F = {
  reg: 'Montserrat_400Regular',
  med: 'Montserrat_500Medium',
  semi: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};

const hexToRgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
// Mistura a cor `a` sobre `b` (t = quanto de `a`, de 0 a 1).
export const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  const m = A.map((v, i) => Math.round(v * t + B[i] * (1 - t)));
  return '#' + m.map((v) => v.toString(16).padStart(2, '0')).join('');
};

export const palette = (scheme, themeKey) => {
  const t = THEMES.find((x) => x.key === themeKey) || THEMES[0];
  const dark = scheme === 'dark';
  const base = dark
    ? { bg: '#181615', card: '#23201F', ink: '#F5F0ED', muted: '#A9A19B', soft: '#2D2927', line: '#332E2C' }
    : { bg: '#F7F5F4', card: '#FFFFFF', ink: '#1B1A19', muted: '#6E6863', soft: '#F3F1F0', line: '#ECE8E6' };
  return {
    ...base,
    dark,
    accent: t.a,
    accent2: t.b,
    accentSoft: mix(t.a, base.card, 0.14),
    green: '#3FBF8B',
    greenSoft: mix('#3FBF8B', base.card, 0.16),
    violet: '#8F5BD6',
    violetSoft: mix('#8F5BD6', base.card, 0.16),
    blue: '#3E6FD1',
    blueSoft: mix('#3E6FD1', base.card, 0.16),
    danger: '#D8264B',
    paper: '#FDEFE2', // fundo do mural
  };
};

export const AVATAR_COLORS = ['#4F7BD9', '#E0568A'];
