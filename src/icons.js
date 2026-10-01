import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Ícones de traço (24x24). p = caminho, c = círculo [cx, cy, r], r = retângulo [x, y, w, h, rx]
const ICONS = {
  drop: [{ p: 'M12 3c3.5 4.2 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-5.8 6-10z' }],
  pill: [{ r: [4, 8, 16, 13, 3] }, { p: 'M8 4h8v4H8zM12 11.5v6M9 14.5h6' }],
  heart: [{ p: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' }],
  lotus: [{ c: [12, 5, 2] }, { p: 'M5 20c2-1 4-1.5 7-1.5s5 .5 7 1.5M12 8v6M7 12l5 2 5-2' }],
  choc: [{ r: [5, 3, 14, 18, 2] }, { p: 'M5 9h14M5 15h14M12 3v18' }],
  tea: [{ p: 'M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2' }],
  hug: [{ c: [9, 6, 2.5] }, { c: [16, 7, 2] }, { p: 'M4 20v-4a5 5 0 0 1 10 0v4M14 20v-3a4 4 0 0 1 6-3.5' }],
  hand: [{ p: 'M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-2-3a1.5 1.5 0 0 1 2.5-1.5L8 13' }],
  chev: [{ p: 'M9 5l7 7-7 7' }],
  back: [{ p: 'M15 5l-7 7 7 7' }],
  home: [{ p: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z' }],
  hist: [{ p: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2' }],
  user: [{ c: [12, 8, 4] }, { p: 'M4 21a8 8 0 0 1 16 0' }],
  msg: [{ p: 'M4 5h16v11H9l-5 4V5z' }],
  brush: [{ p: 'M4 20c3 0 4-1 4-3a2.5 2.5 0 0 1 5 0c0 2-1 3-3 3H4zM12 14L20 5' }],
};

const HEART_FILLED = 'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z';

export function Icon({ name, size = 22, color = '#000', strokeWidth = 2 }) {
  if (name === 'heartF') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={HEART_FILLED} fill={color} />
      </Svg>
    );
  }
  const parts = ICONS[name] || [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {parts.map((x, i) => {
        if (x.p) return <Path key={i} d={x.p} />;
        if (x.c) return <Circle key={i} cx={x.c[0]} cy={x.c[1]} r={x.c[2]} />;
        if (x.r) return <Rect key={i} x={x.r[0]} y={x.r[1]} width={x.r[2]} height={x.r[3]} rx={x.r[4]} />;
        return null;
      })}
    </Svg>
  );
}
