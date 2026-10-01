import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Share, ActivityIndicator } from 'react-native';
import { useApp } from '../AppContext';
import { Card, Btn, Field, H2, Sub, PageTop } from '../ui';
import { F } from '../theme';

export default function PairScreen() {
  const { c, me, connect, signOut, toast } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (busy) return;
    setErr(''); setBusy(true);
    try {
      const name = await connect(code);
      toast(`Conectado com ${name}!`);
    } catch (e) {
      setErr(e.message || 'Não consegui conectar.');
    }
    setBusy(false);
  };

  const share = () => Share.share({ message: `Entra no Dengo comigo! Crie sua conta e digite meu código: ${me.code}` }).catch(() => {});

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <PageTop title={`Olá, ${(me.name || '').trim().split(/\s+/)[0]}`} />
        <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 14 }}>
          <Card>
            <H2 center>Seu código de casal</H2>
            <Sub center>Mande este código para o seu amor digitar no app dele(a).</Sub>
            <Text selectable style={{ fontFamily: F.bold, fontSize: 36, letterSpacing: 7, color: c.accent, textAlign: 'center', marginVertical: 6, paddingLeft: 7 }}>
              {me.code}
            </Text>
            <Btn kind="soft" title="Compartilhar código" onPress={share} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <ActivityIndicator size="small" color={c.accent} />
              <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: c.accent }}>Esperando a conexão</Text>
            </View>
          </Card>

          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: c.muted, textAlign: 'center' }}>ou</Text>

          <Card>
            <H2>Seu amor já criou a conta?</H2>
            <Sub>Digite o código que aparece na tela dele(a).</Sub>
            <Field
              value={code} onChangeText={(t) => setCode(t.toUpperCase())} maxLength={6} autoCapitalize="characters" autoCorrect={false}
              placeholder="ABC123" style={{ marginTop: 0 }}
              inputStyle={{ textAlign: 'center', letterSpacing: 4, fontFamily: F.bold, fontSize: 18 }}
              onSubmitEditing={go} returnKeyType="go"
            />
            {err ? <Text style={{ fontFamily: F.semi, fontSize: 13, color: c.danger, marginTop: 14, lineHeight: 18 }}>{err}</Text> : null}
            <Btn title={busy ? 'CONECTANDO...' : 'CONECTAR'} onPress={go} disabled={busy} />
          </Card>

          <Btn kind="link" title="Sair da conta" onPress={signOut} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
