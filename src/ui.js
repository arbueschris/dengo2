import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './AppContext';
import { Icon } from './icons';
import { F } from './theme';

export const MOODS = [
  { e: '😠', n: 'Com raiva' },
  { e: '😢', n: 'Triste' },
  { e: '😐', n: 'Meio assim' },
  { e: '🙂', n: 'Bem' },
  { e: '😄', n: 'Radiante' },
];

/* ---------- textos ---------- */
export function H2({ children, center, style }) {
  const { c } = useApp();
  return <Text style={[{ fontFamily: F.bold, fontSize: 18, color: c.ink, marginBottom: 4, textAlign: center ? 'center' : 'left' }, style]}>{children}</Text>;
}
export function Sub({ children, center, style }) {
  const { c } = useApp();
  return <Text style={[{ fontFamily: F.reg, fontSize: 13, lineHeight: 19, color: c.muted, marginBottom: 14, textAlign: center ? 'center' : 'left' }, style]}>{children}</Text>;
}

/* ---------- cartão ---------- */
export function Card({ children, tone, style }) {
  const { c } = useApp();
  return (
    <View style={[{ backgroundColor: tone === 'accent' ? c.accentSoft : c.card, borderRadius: 22, padding: 18 }, style]}>
      {children}
    </View>
  );
}

/* ---------- botões ---------- */
export function Btn({ title, onPress, kind = 'solid', icon, disabled, style }) {
  const { c } = useApp();
  if (kind === 'link') {
    return (
      <Pressable onPress={onPress} hitSlop={8} style={[{ alignSelf: 'center', marginTop: 14 }, style]}>
        <Text style={{ fontFamily: F.bold, fontSize: 12.5, letterSpacing: 0.5, color: c.accent, textTransform: 'uppercase' }}>{title}</Text>
      </Pressable>
    );
  }
  const soft = kind === 'soft';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: soft ? c.accentSoft : c.accent,
          borderRadius: 16,
          paddingVertical: 17,
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: 8 }}><Icon name={icon} size={17} color={soft ? c.accent : '#fff'} /></View> : null}
      <Text style={{ fontFamily: F.bold, fontSize: soft ? 14 : 15, letterSpacing: soft ? 0 : 0.6, color: soft ? c.accent : '#fff' }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ title, onPress, selected, onCard }) {
  const { c } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999,
        backgroundColor: selected ? c.accent : onCard ? c.card : c.soft,
      }}
    >
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: selected ? '#fff' : c.ink }}>{title}</Text>
    </Pressable>
  );
}

/* ---------- campos ---------- */
export const Field = React.forwardRef(function Field({ label, style, inputStyle, onCard, ...props }, ref) {
  const { c } = useApp();
  return (
    <View style={[{ marginTop: 14 }, style]}>
      {label ? <Text style={{ fontFamily: F.semi, fontSize: 13, color: c.muted, marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.muted + '99'}
        style={[{
          fontFamily: F.reg, fontSize: 15, color: c.ink, backgroundColor: onCard ? c.card : c.soft,
          borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
        }, inputStyle]}
        {...props}
      />
    </View>
  );
});

/* ---------- avatar ---------- */
export function Avatar({ user, size = 38, border }) {
  const { avatarColor } = useApp();
  const letter = (user && user.name ? user.name.trim().charAt(0) : '?').toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor(user),
      alignItems: 'center', justifyContent: 'center',
      borderWidth: border ? 2 : 0, borderColor: 'rgba(255,255,255,.85)',
    }}>
      <Text style={{ fontFamily: F.bold, color: '#fff', fontSize: size * 0.4 }}>{letter}</Text>
    </View>
  );
}

/* ---------- item de lista com ícone ---------- */
export function Item({ icon, tone = 'o', children }) {
  const { c } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.soft, borderRadius: 16, padding: 12, marginBottom: 8 }}>
      <IconBox icon={icon} tone={tone} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export function IconBox({ icon, tone = 'o', size = 42, round }) {
  const { c } = useApp();
  const t = {
    o: [c.accentSoft, c.accent], b: [c.blueSoft, c.blue], g: [c.greenSoft, c.green], v: [c.violetSoft, c.violet],
  }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: round ? size / 2 : size * 0.31, backgroundColor: t[0], alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.52} color={t[1]} />
    </View>
  );
}

/* ---------- carinhas de humor ---------- */
export function Faces({ value, onPick }) {
  const { c } = useApp();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
      {MOODS.map((m, k) => {
        const on = value === k;
        const Box = onPick ? Pressable : View;
        return (
          <Box
            key={k}
            onPress={onPick ? () => onPick(k) : undefined}
            accessibilityLabel={m.n}
            style={{
              width: 52, height: 52, borderRadius: 26, backgroundColor: c.soft,
              alignItems: 'center', justifyContent: 'center',
              opacity: on ? 1 : 0.5, transform: [{ scale: on ? 1.08 : 1 }],
            }}
          >
            <Text style={{ fontSize: 26 }}>{m.e}</Text>
          </Box>
        );
      })}
    </View>
  );
}

/* ---------- cabeçalho com degradê ---------- */
export function Hero({ children, height = 170 }) {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height: height + insets.top, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' }}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="hero" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.accent} />
            <Stop offset="1" stopColor={c.accent2} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hero)" />
      </Svg>
      <View style={{ paddingTop: insets.top + 18, paddingHorizontal: 20 }}>{children}</View>
    </View>
  );
}

/* ---------- título simples de página ---------- */
export function PageTop({ title, onBack }) {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityLabel="Voltar" style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={18} color={c.ink} strokeWidth={2.2} />
        </Pressable>
      ) : null}
      <Text style={{ fontFamily: F.bold, fontSize: 24, color: c.ink, letterSpacing: -0.2 }}>{title}</Text>
    </View>
  );
}

/* ---------- linha "sugestão" ---------- */
export function Sug({ title, onPress }) {
  const { c } = useApp();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.soft, borderRadius: 14, padding: 11, marginBottom: 8 }}>
      <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#F0555E', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="heartF" size={16} color="#fff" />
      </View>
      <Text style={{ flex: 1, fontFamily: F.med, fontSize: 14.5, color: c.ink }}>{title}</Text>
      <Icon name="chev" size={18} color={c.muted} strokeWidth={2.2} />
    </Pressable>
  );
}

/* ---------- desenho do mural (renderiza os traços salvos) ---------- */
export function Drawing({ strokes, style }) {
  const { c } = useApp();
  let list = strokes;
  if (typeof strokes === 'string') { try { list = JSON.parse(strokes); } catch (e) { list = []; } }
  return (
    <View style={[{ backgroundColor: c.paper, borderRadius: 16, overflow: 'hidden', aspectRatio: 16 / 10 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 640 400">
        {(list || []).map((s, i) => (
          <Path key={i} d={s.d} stroke={s.c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
      </Svg>
    </View>
  );
}

/* ---------- aviso rápido ---------- */
export function Toast() {
  const { toastMsg, c } = useApp();
  const insets = useSafeAreaInsets();
  if (!toastMsg) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 96, alignItems: 'center' }}>
      <View style={{ backgroundColor: c.ink, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999, maxWidth: '100%' }}>
        <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 13.5, color: c.bg, textAlign: 'center' }}>{toastMsg}</Text>
      </View>
    </View>
  );
}
