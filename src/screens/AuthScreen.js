import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useApp, authMessage } from '../AppContext';
import { Card, Btn, Field } from '../ui';
import { Hero } from '../ui';
import { F } from '../theme';

export default function AuthScreen() {
  const { c, signUp, signIn, resetPassword, toast } = useApp();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const su = mode === 'signup';

  const fail = (m) => { setErr(m); setBusy(false); };

  const submit = async () => {
    if (busy) return;
    setErr('');
    const em = email.trim().toLowerCase();
    if (su && name.trim().length < 2) return fail('Digite seu nome (pelo menos 2 letras).');
    if (!/^\S+@\S+\.\S+$/.test(em)) return fail('Digite um e-mail válido, como voce@email.com.');
    if (pass.length < 6) return fail(su ? 'A senha precisa ter pelo menos 6 caracteres.' : 'Digite sua senha.');
    setBusy(true);
    try {
      if (su) await signUp(name.trim(), em, pass);
      else await signIn(em, pass);
      // Ao entrar, o app troca de tela sozinho.
    } catch (e) {
      fail(e && e.code ? authMessage(e) : (e && e.message) || 'Não deu certo. Tente de novo.');
    }
  };

  const forgot = async () => {
    const em = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) return fail('Digite seu e-mail acima e toque em "Esqueci a senha".');
    try { await resetPassword(em); setErr(''); toast('Enviamos um e-mail para trocar a senha'); }
    catch (e) { fail(authMessage(e)); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <Hero height={150}>
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 38, color: '#fff', letterSpacing: -0.6 }}>Dengo</Text>
            <Text style={{ fontFamily: F.med, fontSize: 14.5, color: '#fff', textAlign: 'center', marginTop: 6, opacity: 0.95, maxWidth: 270 }}>
              O cuidado de vocês dois, num lugar só.
            </Text>
          </View>
        </Hero>

        <View style={{ paddingHorizontal: 16, marginTop: -56 }}>
          <Card>
            <View style={{ flexDirection: 'row', backgroundColor: c.soft, borderRadius: 14, padding: 4, marginBottom: 4 }}>
              {[['login', 'Entrar'], ['signup', 'Criar conta']].map(([k, l]) => (
                <Pressable key={k} onPress={() => { setMode(k); setErr(''); }}
                  style={{ flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center', backgroundColor: mode === k ? c.card : 'transparent' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: mode === k ? c.ink : c.muted }}>{l}</Text>
                </Pressable>
              ))}
            </View>

            {su ? (
              <Field label="Seu nome" value={name} onChangeText={setName} placeholder="Como o seu amor te chama"
                autoCapitalize="words" autoComplete="given-name" returnKeyType="next" onSubmitEditing={() => emailRef.current && emailRef.current.focus()} />
            ) : null}
            <Field ref={emailRef} label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
              returnKeyType="next" onSubmitEditing={() => passRef.current && passRef.current.focus()} />
            <Field ref={passRef} label="Senha" value={pass} onChangeText={setPass} secureTextEntry
              placeholder={su ? 'Pelo menos 6 caracteres' : 'Sua senha'} autoCapitalize="none"
              autoComplete={su ? 'new-password' : 'current-password'} returnKeyType="go" onSubmitEditing={submit} />

            {err ? <Text style={{ fontFamily: F.semi, fontSize: 13, color: c.danger, marginTop: 14, lineHeight: 18 }}>{err}</Text> : null}

            <Btn title={busy ? '' : su ? 'CRIAR CONTA' : 'ENTRAR'} onPress={submit} disabled={busy} style={{ marginTop: 18 }} />
            {busy ? <ActivityIndicator color={c.accent} style={{ marginTop: -34, marginBottom: 10 }} /> : null}
            {!su ? <Btn kind="link" title="Esqueci a senha" onPress={forgot} /> : null}
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
