import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp, first } from '../AppContext';
import { Card, Btn, Chip, Field, H2, Sub, Item, IconBox, Faces, Hero, Avatar, Sug, Drawing, MOODS } from '../ui';
import { Icon } from '../icons';
import { F } from '../theme';

const QUICK = ['Bolsa quente', 'Remédio', 'Chocolate', 'Chá', 'Água'];
const DENGOS = ['Abraço', 'Cafuné', 'Colo', 'Massagem', 'Atenção'];

const SUGGESTIONS = {
  0: [['mural', 'Desenhar no mural'], ['Estou aqui pra o que você precisar. Te amo.', 'Enviar uma mensagem fofa'], ['Desculpa pela cagada. Posso te compensar?', 'Pedir desculpas pela cagada']],
  1: [['Estou pensando em você agora. Quer conversar?', 'Enviar uma mensagem fofa'], ['mural', 'Desenhar no mural'], ['Vou passar aí com um abraço.', 'Avisar que vai dar um abraço']],
  2: [['Como está sendo seu dia?', 'Perguntar como está o dia'], ['mural', 'Deixar um desenho no mural'], ['Que tal um chá mais tarde?', 'Convidar para um chá']],
  3: [['Adorei ver você bem hoje!', 'Elogiar o dia'], ['mural', 'Desenhar no mural'], ['Vamos fazer algo legal hoje?', 'Chamar para um programa']],
  4: [['Você radiante me deixa radiante também!', 'Comemorar junto'], ['mural', 'Desenhar no mural'], ['Vamos sair pra comemorar?', 'Chamar para sair']],
};

export default function HomeScreen({ onOpenMural }) {
  const { c, me, partner, couple, mural, setMood, sendPedido, sendDengo, respond, clearMine, setPresence, sendNote, toast } = useApp();
  const [ped, setPed] = useState('');
  const [dKind, setDKind] = useState(null);
  const [dNote, setDNote] = useState('');

  const pn = first(partner.name);
  const req = couple.req || {};
  const dengo = couple.dengo || {};
  const incReq = req[partner.uid];
  const incDengo = dengo[partner.uid];
  const myReq = req[me.uid];
  const myDengo = dengo[me.uid];

  /* ----- corpo de um pedido/dengo ----- */
  const body = (kind, r) =>
    kind === 'req' ? (
      <Item icon="pill" tone="b"><Text style={{ fontFamily: F.med, fontSize: 14, color: c.ink }}>{r.text}</Text></Item>
    ) : (
      <Item icon="heart" tone="o">
        <Text style={{ fontFamily: F.bold, fontSize: 14, color: c.ink }}>{r.kind}</Text>
        {r.note ? <Text style={{ fontFamily: F.med, fontSize: 13, color: c.muted }}>{r.note}</Text> : null}
      </Item>
    );

  /* ----- pedido do par para mim ----- */
  const incoming = (kind, r) => {
    if (!r) return null;
    const title = kind === 'req' ? `${pn} fez um pedido` : `${pn} pediu Dengo! 💛`;
    const done = kind === 'req' ? 'ENTREGUEI O PEDIDO' : 'DEI O DENGO';
    if (r.status === 'pending')
      return (
        <Card key={'in' + kind}>
          <H2 center>{title}</H2>
          <View style={{ height: 10 }} />
          {body(kind, r)}
          <Btn title="ESTOU INDO" onPress={() => respond(kind, 'going')} />
          <Btn kind="link" title="Não consigo agora" onPress={() => respond(kind, 'cant')} />
        </Card>
      );
    if (r.status === 'going')
      return (
        <Card key={'in' + kind}>
          <H2 center>Você está indo!</H2>
          <Sub center>{pn} sabe que você está a caminho.</Sub>
          {body(kind, r)}
          <Btn title={done} onPress={() => respond(kind, 'done')} />
        </Card>
      );
    if (r.status === 'cant')
      return (
        <Card key={'in' + kind}>
          <H2 center>Você avisou que não consegue</H2>
          <Sub center>{pn} sabe que agora não dá. Quando der:</Sub>
          {body(kind, r)}
          <Btn title="AGORA CONSIGO" onPress={() => respond(kind, 'going')} />
        </Card>
      );
    return null;
  };

  /* ----- dengo (carinho) ----- */
  const dengoCard = () => {
    const r = myDengo;
    if (r && r.status === 'pending')
      return (
        <Card tone="accent">
          <H2>Você pediu dengo</H2><View style={{ height: 10 }} />{body('dengo', r)}
          <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: c.accent, textAlign: 'center', marginTop: 6 }}>Esperando {pn} responder</Text>
        </Card>
      );
    if (r && r.status === 'going')
      return (<Card tone="accent"><H2>{pn} está indo dar dengo! 💛</H2><View style={{ height: 10 }} />{body('dengo', r)}</Card>);
    if (r && r.status === 'cant')
      return (
        <Card tone="accent">
          <H2>{pn} não consegue agora</H2><Sub>Vai te dar dengo assim que puder.</Sub>{body('dengo', r)}
          <Btn title="PEDIR DE NOVO" onPress={() => clearMine('dengo')} />
        </Card>
      );
    return (
      <Card tone="accent">
        <H2>Precisa de dengo?</H2>
        <Sub>{r ? 'O último dengo foi entregue ✓ ' : ''}Não é pedido prático: é carinho. Escolha o tipo e chame {pn}.</Sub>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DENGOS.map((k) => <Chip key={k} title={k} onCard selected={dKind === k} onPress={() => setDKind(dKind === k ? null : k)} />)}
        </View>
        <Field onCard value={dNote} onChangeText={setDNote} maxLength={80} placeholder="Quer contar mais? (opcional)" style={{ marginTop: 10 }} />
        <Btn icon="heartF" title="PEDIR DENGO" onPress={async () => {
          const ok = await sendDengo(dKind || 'Dengo', dNote.trim());
          if (ok) { setDKind(null); setDNote(''); }
        }} />
      </Card>
    );
  };

  /* ----- pedido (prático) ----- */
  const pedidoCard = () => {
    const r = myReq;
    if (r && r.status === 'pending')
      return (<Card><H2>Seu pedido</H2><View style={{ height: 10 }} />{body('req', r)}
        <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: c.accent, textAlign: 'center', marginTop: 6 }}>Esperando {pn} responder</Text></Card>);
    if (r && r.status === 'going')
      return (<Card><H2>{pn} está indo! 🏃</H2><View style={{ height: 10 }} />{body('req', r)}</Card>);
    if (r && r.status === 'cant')
      return (<Card><H2>{pn} não consegue agora</H2><Sub>Vai avisar quando puder.</Sub>{body('req', r)}
        <Btn kind="soft" title="Fazer outro pedido" onPress={() => clearMine('req')} /></Card>);
    const add = (q) => { const cur = ped.trim(); if (!cur.toLowerCase().includes(q.toLowerCase())) setPed(cur ? `${cur}, ${q}` : q); };
    return (
      <Card>
        <H2>Fazer um pedido</H2>
        <Sub>{r ? 'Seu último pedido foi entregue ✓ ' : ''}Algo prático que você precisa agora.</Sub>
        <TextInput
          value={ped} onChangeText={setPed} multiline maxLength={160} placeholder="Ex.: bolsa quente e ibuprofeno 600mg"
          placeholderTextColor={c.muted + '99'} accessibilityLabel="O que você precisa"
          style={{ fontFamily: F.reg, fontSize: 15, color: c.ink, backgroundColor: c.soft, borderRadius: 14, padding: 13, minHeight: 64, textAlignVertical: 'top' }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {QUICK.map((q) => <Chip key={q} title={`+ ${q}`} onPress={() => add(q)} />)}
        </View>
        <Btn title="ENVIAR PEDIDO" onPress={async () => {
          const text = ped.trim();
          if (!text) { toast('Escreva o que você precisa'); return; }
          if (await sendPedido(text)) setPed('');
        }} />
      </Card>
    );
  };

  /* ----- presença ----- */
  const pres = couple.presence;
  const mine = (k) => pres && pres.by === me.uid && pres.kind === k;
  const banner = pres && pres.by === partner.uid ? (
    <View style={{ borderRadius: 18, padding: 14, backgroundColor: pres.kind === 'stay' ? c.greenSoft : c.violetSoft }}>
      <Text style={{ fontFamily: F.semi, fontSize: 14, lineHeight: 20, color: pres.kind === 'stay' ? c.green : c.violet }}>
        {pres.kind === 'stay' ? `💚 ${pn} quer você por perto. Fique com ${pn}.` : `💜 ${pn} precisa ficar a sós. Dê um tempinho e avise que está por aqui.`}
      </Text>
    </View>
  ) : null;

  const quick = (k, icon, tone, label) => (
    <Pressable onPress={() => setPresence(k)} style={{
      flex: 1, minHeight: 124, backgroundColor: c.card, borderRadius: 22, padding: 16, justifyContent: 'space-between',
      borderWidth: 2, borderColor: mine(k) ? c.accent : 'transparent',
    }}>
      <IconBox icon={icon} tone={tone} size={46} round />
      <Text style={{ fontFamily: F.med, fontSize: 16, lineHeight: 20, color: c.ink }}>{label}</Text>
    </Pressable>
  );

  /* ----- humor ----- */
  const mood = couple.mood || {};
  const myMood = mood[me.uid];
  const pm = mood[partner.uid];

  const sug = (v, label) => (
    <Sug key={label} title={label} onPress={() => (v === 'mural' ? onOpenMural() : sendNote(v))} />
  );

  const note = couple.note && couple.note.from === partner.uid ? (
    <View style={{ backgroundColor: c.accentSoft, borderRadius: 18, padding: 14 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 12, color: c.accent, marginBottom: 4 }}>{pn} mandou um recado</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 15, lineHeight: 21, color: c.ink }}>{couple.note.text}</Text>
    </View>
  ) : null;

  const lastFromPartner = mural.find((m) => m.by === partner.uid);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 130 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Hero height={130}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 24, color: '#fff', letterSpacing: -0.2 }}>Olá, {first(me.name)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Avatar user={me} border />
            <Icon name="heartF" size={20} color="#fff" />
            <Avatar user={partner} border />
          </View>
        </View>
      </Hero>

      <View style={{ marginTop: -70, paddingHorizontal: 16, gap: 14 }}>
        {banner}
        {incoming('dengo', incDengo)}
        {incoming('req', incReq)}
        {dengoCard()}
        {pedidoCard()}

        <View style={{ flexDirection: 'row', gap: 14 }}>
          {quick('stay', 'heart', 'g', 'Fique comigo')}
          {quick('alone', 'lotus', 'v', 'Preciso ficar a sós')}
        </View>

        <Card>
          <H2 center>Como você se sente hoje?</H2>
          <Sub center>{pn} saberá como cuidar melhor de você hoje</Sub>
          <Faces value={myMood} onPick={(k) => setMood(k, `${MOODS[k].e} ${MOODS[k].n}`)} />
        </Card>

        {pm == null ? (
          <Card>
            <H2 center>Mood de {pn} hoje</H2>
            <Sub center style={{ marginBottom: 0 }}>{pn} ainda não marcou como está. Que tal perguntar?</Sub>
          </Card>
        ) : (
          <Card>
            <H2 center>Mood de {pn} hoje</H2>
            <Sub center>{MOODS[pm].n}</Sub>
            <Faces value={pm} />
            <Text style={{ fontFamily: F.reg, fontSize: 13.5, color: c.muted, marginTop: 16, marginBottom: 8 }}>Algumas sugestões do que você pode fazer:</Text>
            {SUGGESTIONS[pm].map(([v, l]) => sug(v, l))}
          </Card>
        )}

        {note}

        <Card>
          <H2>Mural</H2>
          <Sub>{lastFromPartner ? `${pn} deixou algo para você ❤️` : `${pn} ainda não deixou nada. Que tal começar?`}</Sub>
          {lastFromPartner ? <Drawing strokes={lastFromPartner.strokes} style={{ marginBottom: 12 }} /> : null}
          <Pressable onPress={onOpenMural} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.soft, borderRadius: 14, padding: 15 }}>
            <Text style={{ fontFamily: F.med, fontSize: 15, color: c.ink }}>{lastFromPartner ? 'Ir para mural' : 'Desenhar no mural'}</Text>
            <Icon name="chev" size={18} color={c.ink} strokeWidth={2.2} />
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}
