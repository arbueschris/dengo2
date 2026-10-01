import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useApp, hhmm, dayLabel } from '../AppContext';
import { Card, IconBox, PageTop } from '../ui';
import { F } from '../theme';

export default function HistoryScreen() {
  const { c, hist } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageTop title="Histórico" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 18, paddingBottom: 130 }}>
        <Card>
          {hist.length === 0 ? (
            <Text style={{ fontFamily: F.reg, fontSize: 14, color: c.muted, textAlign: 'center', lineHeight: 21, paddingVertical: 20 }}>
              Ainda não aconteceu nada. Pedidos, recados e desenhos de vocês aparecem aqui.
            </Text>
          ) : (
            hist.map((h, i) => (
              <View key={h.id} style={{
                flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 13,
                borderBottomWidth: i === hist.length - 1 ? 0 : 1, borderBottomColor: c.line,
              }}>
                <IconBox icon={h.icon || 'heart'} tone={h.tone || 'o'} size={38} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.reg, fontSize: 14, lineHeight: 20, color: c.ink }}>{h.text}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 12, color: c.muted, marginTop: 2 }}>{dayLabel(h.ts)}, {hhmm(h.ts)}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
