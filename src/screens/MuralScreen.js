import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, PanResponder, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp, first, hhmm, dayLabel } from '../AppContext';
import { Card, Btn, H2, Sub, PageTop, Drawing } from '../ui';
import { F } from '../theme';

const PENS = ['#D8264B', '#3E6FD1', '#2E9E6B', '#1B1A19'];
const W = 640, H = 400;
const MAX_CHARS = 180000; // limite de segurança (documento do Firestore aceita até ~1 MB)

export default function MuralScreen({ onBack }) {
  const { c, me, partner, mural, addDrawing, toast } = useApp();
  const [strokes, setStrokes] = useState([]);
  const [live, setLive] = useState(null);
  const [scrollOn, setScrollOn] = useState(true);
  const [pen, setPen] = useState(PENS[0]);
  const [busy, setBusy] = useState(false);
  const penRef = useRef(pen);
  penRef.current = pen;
  const box = useRef({ w: 1, h: 1 });
  const cur = useRef(null);

  const pan = useMemo(() => {
    const pt = (e) => ({
      x: Math.round((e.nativeEvent.locationX * W) / box.current.w),
      y: Math.round((e.nativeEvent.locationY * H) / box.current.h),
    });
    const finish = () => {
      const s = cur.current;
      cur.current = null;
      setLive(null);
      setScrollOn(true);
      if (s) setStrokes((prev) => [...prev, { c: s.c, d: s.d }]);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        setScrollOn(false);
        const p = pt(e);
        cur.current = { c: penRef.current, d: `M${p.x} ${p.y} L${p.x + 1} ${p.y}`, last: p };
        setLive({ c: cur.current.c, d: cur.current.d });
      },
      onPanResponderMove: (e) => {
        const s = cur.current;
        if (!s) return;
        const p = pt(e);
        if (Math.abs(p.x - s.last.x) + Math.abs(p.y - s.last.y) < 3) return;
        s.d += ` L${p.x} ${p.y}`;
        s.last = p;
        setLive({ c: s.c, d: s.d });
      },
      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
    });
  }, []);

  const send = async () => {
    if (!strokes.length) { toast('Desenhe algo antes de enviar'); return; }
    if (JSON.stringify(strokes).length > MAX_CHARS) { toast('Desenho grande demais. Apague um pouco e tente de novo.'); return; }
    setBusy(true);
    const ok = await addDrawing(strokes);
    setBusy(false);
    if (ok) { setStrokes([]); onBack(); }
  };

  const pn = first(partner.name);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageTop title="Mural" onBack={onBack} />
      <ScrollView scrollEnabled={scrollOn} contentContainerStyle={{ padding: 16, paddingTop: 18, paddingBottom: 60, gap: 14 }}>
        <Card>
          <H2>Desenhe para {pn}</H2>
          <Sub>Use o dedo e deixe um recado.</Sub>
          <View
            {...pan.panHandlers}
            onLayout={(e) => { box.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}
            style={{ backgroundColor: c.paper, borderRadius: 18, overflow: 'hidden', aspectRatio: W / H }}
          >
            <Svg pointerEvents="none" width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
              {strokes.map((s, i) => <Path key={i} d={s.d} stroke={s.c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
              {live ? <Path d={live.d} stroke={live.c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
            </Svg>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 }}>
            {PENS.map((p) => (
              <Pressable key={p} onPress={() => setPen(p)} accessibilityLabel={`Cor ${p}`}
                style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p, borderWidth: 3, borderColor: pen === p ? c.card : 'transparent', shadowColor: '#000', elevation: pen === p ? 3 : 0 }}>
                {pen === p ? <View style={{ position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: 20, borderWidth: 2, borderColor: c.ink }} /> : null}
              </Pressable>
            ))}
            <Pressable onPress={() => setStrokes((s) => s.slice(0, -1))} style={{ marginLeft: 'auto', padding: 8 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: c.muted }}>Desfazer</Text>
            </Pressable>
            <Pressable onPress={() => setStrokes([])} style={{ padding: 8 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: c.muted }}>Limpar</Text>
            </Pressable>
          </View>
          <Btn title={busy ? 'ENVIANDO...' : 'DEIXAR NO MURAL'} onPress={send} disabled={busy} />
        </Card>

        <Card>
          <H2>Recados</H2>
          <View style={{ height: 10 }} />
          {mural.length === 0 ? (
            <Text style={{ fontFamily: F.reg, fontSize: 14, color: c.muted, textAlign: 'center', paddingVertical: 14 }}>
              Nenhum recado ainda. O primeiro desenho fica por sua conta.
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {mural.map((m) => (
                <View key={m.id} style={{ width: '48%' }}>
                  <Drawing strokes={m.strokes} style={{ borderRadius: 12, marginBottom: 4 }} />
                  <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: c.muted }}>
                    {m.by === me.uid ? 'Você' : pn}, {dayLabel(m.ts)} {hhmm(m.ts)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
