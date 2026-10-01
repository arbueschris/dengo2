import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useApp } from '../AppContext';
import { Card, Btn, Field, H2, Sub, PageTop, Avatar } from '../ui';
import { THEMES, F } from '../theme';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const isoToBr = (iso) => { const [y, m, d] = (iso || '').split('-'); return y ? `${d}/${m}/${y}` : ''; };
const brToIso = (br) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!m) return null;
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
  if (isNaN(d.getTime()) || d.getDate() !== +m[1] || d > new Date()) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
};

export default function ProfileScreen() {
  const { c, me, partner, couple, setName, setSince, setTheme, setNotify, signOut, toast } = useApp();
  const [name, setNameText] = useState(me.name);
  const [since, setSinceText] = useState(isoToBr(couple.since));
  useEffect(() => setSinceText(isoToBr(couple.since)), [couple.since]);

  const days = Math.max(0, Math.floor((Date.now() - new Date(`${couple.since}T00:00:00`).getTime()) / 864e5));
  const themeOf = me.theme || 'coral';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageTop title="Perfil" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingTop: 18, paddingBottom: 130, gap: 14 }}>
        <Card>
          <Text style={{ fontFamily: F.bold, fontSize: 44, color: c.accent, textAlign: 'center' }}>{days}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 4 }}>dias juntos</Text>
          <Field label="Data que começaram (dd/mm/aaaa)" value={since} onChangeText={setSinceText} keyboardType="numbers-and-punctuation" maxLength={10}
            onEndEditing={() => {
              const iso = brToIso(since);
              if (iso) setSince(iso); else { toast('Use o formato dd/mm/aaaa'); setSinceText(isoToBr(couple.since)); }
            }} />
        </Card>

        <Card>
          <H2>Casal</H2>
          <View style={{ height: 6 }} />
          {[[me, 'Você · ' + me.email], [partner, 'Seu amor']].map(([u, sub]) => (
            <View key={u.uid} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
              <Avatar user={u} size={44} />
              <View>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: c.ink }}>{u.name}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: c.muted }}>{sub}</Text>
              </View>
            </View>
          ))}
          <Field label="Seu nome no app" value={name} onChangeText={setNameText} maxLength={30}
            onEndEditing={() => {
              const v = name.trim();
              if (v.length < 2) { toast('O nome precisa ter pelo menos 2 letras'); setNameText(me.name); }
              else if (v !== me.name) setName(v);
            }} />
        </Card>

        <Card>
          <H2>Tema de cor</H2>
          <Sub>A escolha vale só para o seu aparelho.</Sub>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {THEMES.map((t) => (
              <Pressable key={t.key} onPress={() => setTheme(t.key)} accessibilityLabel={`Tema ${t.name}`}
                style={{ alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 14, borderWidth: 2, borderColor: themeOf === t.key ? c.accent : 'transparent' }}>
                <Svg width={38} height={38}>
                  <Defs>
                    <LinearGradient id={`g-${t.key}`} x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={t.a} /><Stop offset="1" stopColor={t.b} />
                    </LinearGradient>
                  </Defs>
                  <Circle cx={19} cy={19} r={19} fill={`url(#g-${t.key})`} />
                </Svg>
                <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: themeOf === t.key ? c.ink : c.muted }}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <H2 style={{ marginBottom: 2 }}>Notificações</H2>
              <Text style={{ fontFamily: F.reg, fontSize: 13, lineHeight: 19, color: c.muted }}>
                Receber aviso quando {(partner.name || '').trim().split(/\s+/)[0]} pedir dengo, responder ou deixar um recado.
              </Text>
            </View>
            <Switch value={me.notify !== false} onValueChange={setNotify}
              trackColor={{ true: c.accent, false: c.soft }} thumbColor="#fff" />
          </View>
        </Card>

        <Pressable onPress={signOut} style={{ backgroundColor: c.soft, borderRadius: 16, padding: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 14.5, color: c.ink }}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
