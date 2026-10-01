import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as Notifications from 'expo-notifications';
import { AppProvider, useApp } from './src/AppContext';
import { Toast } from './src/ui';
import { Icon } from './src/icons';
import { F } from './src/theme';
import AuthScreen from './src/screens/AuthScreen';
import PairScreen from './src/screens/PairScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MuralScreen from './src/screens/MuralScreen';

const TABS = [
  ['home', 'Início', 'home'],
  ['hist', 'Histórico', 'hist'],
  ['perfil', 'Perfil', 'user'],
];

function TabBar({ tab, onChange }) {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      position: 'absolute', left: 14, right: 14, bottom: insets.bottom + 12, backgroundColor: c.card, borderRadius: 24,
      padding: 10, flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
    }}>
      {TABS.map(([k, label, icon]) => {
        const on = tab === k;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={{ flex: on ? 1.15 : 1, alignItems: 'center', gap: 4, paddingVertical: 9, borderRadius: 16, backgroundColor: on ? c.accent : 'transparent' }}>
            <Icon name={icon} size={22} color={on ? '#fff' : c.muted} />
            <Text style={{ fontFamily: F.med, fontSize: 12.5, color: on ? '#fff' : c.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Loading({ showLogout }) {
  const { c, signOut } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator color={c.accent} size="large" />
      {showLogout ? (
        <Pressable onPress={signOut}><Text style={{ fontFamily: F.semi, color: c.accent }}>Sair da conta</Text></Pressable>
      ) : null}
    </View>
  );
}

function Root() {
  const { c, authReady, authUser, me, meReady, partner, couple } = useApp();
  const [tab, setTab] = useState('home');
  const [mural, setMural] = useState(false);

  // Ao tocar num aviso: abre o mural (se for desenho) ou a tela inicial.
  useEffect(() => {
    const open = (resp) => {
      const screen = resp && resp.notification && resp.notification.request.content.data && resp.notification.request.content.data.screen;
      setTab('home');
      setMural(screen === 'mural');
    };
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    try {
      const last = Notifications.getLastNotificationResponseAsync && Notifications.getLastNotificationResponseAsync();
      if (last && last.then) last.then((r) => { if (r) open(r); }).catch(() => {});
    } catch (e) { /* recurso opcional */ }
    return () => sub.remove();
  }, []);

  let content;
  let inApp = false;
  if (!authReady) content = <Loading />;
  else if (!authUser) content = <AuthScreen />;
  else if (!meReady || !me) content = <Loading showLogout />;   // criando o perfil...
  else if (!me.partnerUid) content = <PairScreen />;
  else if (!partner || !couple) content = <Loading showLogout />; // carregando o casal...
  else {
    inApp = true;
    if (mural) content = <MuralScreen onBack={() => setMural(false)} />;
    else if (tab === 'home') content = <HomeScreen onOpenMural={() => setMural(true)} />;
    else if (tab === 'hist') content = <HistoryScreen />;
    else content = <ProfileScreen />;
  }

  // Telas com o degradê no topo usam ícones claros na barra de status.
  const heroScreen = authReady && (!authUser || (inApp && tab === 'home' && !mural));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={heroScreen ? 'light-content' : (c.dark ? 'light-content' : 'dark-content')} translucent backgroundColor="transparent" />
      {content}
      {inApp && !mural ? <TabBar tab={tab} onChange={setTab} /> : null}
      <Toast />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#F7F5F4' }} />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
