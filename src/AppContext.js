import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  addDoc,
  deleteField,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { palette, AVATAR_COLORS } from './theme';
import { registerForPush, sendPush } from './notifications';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

/* ---------- utilidades ---------- */
export const first = (n) => String(n || '').trim().split(/\s+/)[0] || '';
const pad = (n) => String(n).padStart(2, '0');
export const hhmm = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const dayLabel = (ts) => {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return 'hoje';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function authMessage(e) {
  const code = (e && e.code) || '';
  const map = {
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Toque em Entrar.',
    'auth/invalid-email': 'Digite um e-mail válido, como voce@email.com.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-credential': 'E-mail ou senha incorretos. Confira e tente de novo.',
    'auth/wrong-password': 'E-mail ou senha incorretos. Confira e tente de novo.',
    'auth/user-not-found': 'E-mail ou senha incorretos. Confira e tente de novo.',
    'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
    'auth/network-request-failed': 'Sem internet. Confira a conexão e tente de novo.',
  };
  return map[code] || 'Não deu certo. Tente de novo em instantes.';
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

async function reserveCode(uid, name) {
  for (let i = 0; i < 6; i++) {
    const code = randomCode();
    const ref = doc(db, 'codes', code);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid, name });
      return code;
    }
  }
  throw new Error('Não consegui gerar seu código. Tente de novo.');
}

/* ---------- provider ---------- */
export function AppProvider({ children }) {
  const scheme = useColorScheme();
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [me, setMe] = useState(null);
  const [meReady, setMeReady] = useState(false);
  const [partner, setPartner] = useState(null);
  const [couple, setCouple] = useState(null);
  const [hist, setHist] = useState([]);
  const [mural, setMural] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  const registered = useRef(null);

  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  // 1) Login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthReady(true);
      if (!u) {
        registered.current = null;
        setMe(null); setMeReady(false); setPartner(null); setCouple(null); setHist([]); setMural([]);
      }
    });
    return unsub;
  }, []);

  // 2) Meu perfil
  const uid = authUser ? authUser.uid : null;
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db, 'users', uid),
      (snap) => { setMe(snap.exists() ? { uid: snap.id, ...snap.data() } : null); setMeReady(true); },
      () => setMeReady(true)
    );
  }, [uid]);

  // 2b) Registra este celular para receber avisos (uma vez por login)
  useEffect(() => {
    if (!me || !me.uid || registered.current === me.uid) return;
    registered.current = me.uid;
    (async () => {
      const token = await registerForPush();
      if (token && token !== me.pushToken) {
        updateDoc(doc(db, 'users', me.uid), { pushToken: token }).catch(() => {});
      }
    })();
  }, [me && me.uid]);

  // 3) Perfil do par
  const partnerUid = me ? me.partnerUid : null;
  useEffect(() => {
    if (!partnerUid) { setPartner(null); return undefined; }
    return onSnapshot(
      doc(db, 'users', partnerUid),
      (snap) => setPartner(snap.exists() ? { uid: snap.id, ...snap.data() } : null),
      () => {}
    );
  }, [partnerUid]);

  // 4) Dados do casal (em tempo real)
  const coupleId = me ? me.coupleId : null;
  useEffect(() => {
    if (!coupleId) { setCouple(null); setHist([]); setMural([]); return undefined; }
    const cRef = doc(db, 'couples', coupleId);
    const u1 = onSnapshot(cRef, (snap) => setCouple(snap.exists() ? { id: snap.id, ...snap.data() } : null), () => {});
    const u2 = onSnapshot(
      query(collection(cRef, 'hist'), orderBy('ts', 'desc'), limit(60)),
      (snap) => setHist(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    const u3 = onSnapshot(
      query(collection(cRef, 'mural'), orderBy('ts', 'desc'), limit(12)),
      (snap) => setMural(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return () => { u1(); u2(); u3(); };
  }, [coupleId]);

  const c = useMemo(() => palette(scheme, me && me.theme), [scheme, me && me.theme]);

  // Cor do avatar: quem tem o menor uid é azul, o outro rosa (igual nos dois aparelhos).
  const avatarColor = useCallback((u) => {
    if (!u || !me || !partnerUid) return AVATAR_COLORS[0];
    return [me.uid, partnerUid].sort()[0] === u.uid ? AVATAR_COLORS[0] : AVATAR_COLORS[1];
  }, [me, partnerUid]);

  /* ---------- ações ---------- */
  const ref = useRef({});
  ref.current = { me, partner, couple, coupleId };

  const actions = useMemo(() => {
    const cRef = () => doc(db, 'couples', ref.current.coupleId);
    const log = (text, icon = 'heart', tone = 'o') =>
      addDoc(collection(cRef(), 'hist'), { text, icon, tone, ts: Date.now() });
    const safe = async (fn) => {
      try { await fn(); return true; }
      catch (e) { toast('Não consegui enviar. Confira a internet.'); return false; }
    };
    // Avisa o par (respeita a opção "Notificações" dele)
    const notify = (title, body, screen = 'home') => {
      const p = ref.current.partner;
      if (!p || !p.pushToken || p.notify === false) return;
      sendPush(p.pushToken, title, body, { screen });
    };
    const n = () => first(ref.current.me.name);
    const pn = () => first(ref.current.partner.name);

    return {
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try { await updateProfile(cred.user, { displayName: name }); } catch (e) { /* não é essencial */ }
        const code = await reserveCode(cred.user.uid, name);
        await setDoc(doc(db, 'users', cred.user.uid), {
          name, email, code, partnerUid: null, coupleId: null, theme: 'coral', createdAt: Date.now(),
        });
      },
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      async signOut() {
        try { await updateDoc(doc(db, 'users', ref.current.me.uid), { pushToken: deleteField() }); } catch (e) { /* segue */ }
        await fbSignOut(auth);
      },
      setNotify: (on) => safe(() => updateDoc(doc(db, 'users', ref.current.me.uid), { notify: on })),

      async connect(codeInput) {
        const { me: m } = ref.current;
        const code = String(codeInput || '').trim().toUpperCase();
        if (code.length !== 6) throw new Error('O código tem 6 letras e números.');
        const snap = await getDoc(doc(db, 'codes', code));
        if (!snap.exists()) throw new Error('Não achei esse código. Confira com seu amor.');
        const { uid: otherUid, name: otherName } = snap.data();
        if (otherUid === m.uid) throw new Error('Esse é o seu próprio código. Digite o do seu amor.');
        const cid = [m.uid, otherUid].sort().join('_');
        const batch = writeBatch(db);
        batch.update(doc(db, 'users', otherUid), { partnerUid: m.uid, coupleId: cid });
        batch.update(doc(db, 'users', m.uid), { partnerUid: otherUid, coupleId: cid });
        batch.set(doc(db, 'couples', cid), {
          members: [m.uid, otherUid], since: todayISO(), mood: {}, req: {}, dengo: {}, presence: null, note: null, createdAt: Date.now(),
        });
        try {
          await batch.commit();
        } catch (e) {
          if (e && e.code === 'permission-denied') throw new Error('Esse código já está conectado a outra conta.');
          throw new Error('Não consegui conectar. Confira a internet e tente de novo.');
        }
        try {
          await addDoc(collection(db, 'couples', cid, 'hist'), {
            text: `${first(m.name)} e ${first(otherName)} se conectaram`, icon: 'heart', tone: 'o', ts: Date.now(),
          });
        } catch (e) { /* o registro é só decorativo */ }
        return first(otherName);
      },

      setMood: (k, label) => safe(async () => {
        await updateDoc(cRef(), { [`mood.${ref.current.me.uid}`]: k });
        await log(`${n()} marcou o mood: ${label}`);
        notify(`${n()} marcou como está hoje`, label);
        toast(`${pn()} já sabe como você está`);
      }),
      sendPedido: (text) => safe(async () => {
        await updateDoc(cRef(), { [`req.${ref.current.me.uid}`]: { text, status: 'pending', ts: Date.now() } });
        await log(`${n()} fez um pedido: "${text}"`, 'pill', 'b');
        notify(`${n()} fez um pedido`, text);
        toast(`Pedido enviado para ${pn()}`);
      }),
      sendDengo: (kind, note) => safe(async () => {
        await updateDoc(cRef(), { [`dengo.${ref.current.me.uid}`]: { kind, note, status: 'pending', ts: Date.now() } });
        await log(`${n()} pediu dengo: ${kind}${note ? ` ("${note}")` : ''}`);
        notify(`${n()} pediu dengo 💛`, `${kind}${note ? ` · ${note}` : ''}`);
        toast(`Dengo pedido para ${pn()}`);
      }),
      // Responder ao pedido/dengo do par: status = going | cant | done
      respond: (kind, status) => safe(async () => {
        const field = kind === 'req' ? 'req' : 'dengo';
        await updateDoc(cRef(), { [`${field}.${ref.current.partner.uid}.status`]: status });
        const what = kind === 'req' ? 'o pedido' : 'o dengo';
        const txt = {
          going: `${n()} está indo atender ${what} de ${pn()}`,
          cant: `${n()} não consegue agora: ${what} de ${pn()}`,
          done: kind === 'req' ? `${n()} entregou o pedido` : `${n()} deu o dengo`,
        }[status];
        await log(txt);
        const push = {
          going: [`${n()} está indo! 🏃`, kind === 'req' ? 'Seu pedido está a caminho.' : 'O seu dengo está a caminho.'],
          cant: [`${n()} não consegue agora`, 'Vai avisar quando puder.'],
          done: [kind === 'req' ? 'Pedido entregue ✓' : 'Dengo entregue 💛', `${n()} cuidou de você.`],
        }[status];
        notify(push[0], push[1]);
        toast(status === 'done' ? (kind === 'req' ? 'Pedido entregue!' : 'Dengo dado!') : `Aviso enviado para ${pn()}`);
      }),
      clearMine: (kind) => safe(() =>
        updateDoc(cRef(), { [`${kind === 'req' ? 'req' : 'dengo'}.${ref.current.me.uid}`]: deleteField() })),
      setPresence: (kind) => safe(async () => {
        const cur = ref.current.couple && ref.current.couple.presence;
        const mine = cur && cur.by === ref.current.me.uid;
        if (mine && cur.kind === kind) {
          await updateDoc(cRef(), { presence: null });
          toast('Aviso removido');
        } else {
          await updateDoc(cRef(), { presence: { by: ref.current.me.uid, kind } });
          await log(kind === 'stay' ? `${n()} pediu: fique comigo` : `${n()} precisa ficar a sós`, kind === 'stay' ? 'heart' : 'lotus', kind === 'stay' ? 'g' : 'v');
          notify(
            kind === 'stay' ? `${n()} quer você por perto 💚` : `${n()} precisa ficar a sós 💜`,
            kind === 'stay' ? 'Fique com ele(a) por um tempinho.' : 'Dê um tempinho e avise que está por aqui.'
          );
          toast(`Aviso enviado para ${pn()}`);
        }
      }),
      sendNote: (text) => safe(async () => {
        await updateDoc(cRef(), { note: { from: ref.current.me.uid, text, ts: Date.now() } });
        await log(`${n()} mandou: "${text}"`, 'msg', 'o');
        notify(`${n()} mandou um recado`, text);
        toast(`Mensagem enviada para ${pn()}`);
      }),
      addDrawing: (strokes) => safe(async () => {
        await addDoc(collection(cRef(), 'mural'), { by: ref.current.me.uid, strokes: JSON.stringify(strokes), ts: Date.now() });
        await log(`${n()} deixou um desenho no mural`, 'brush', 'o');
        notify(`${n()} deixou um desenho ❤️`, 'Veja no mural.', 'mural');
        toast(`Desenho enviado para ${pn()}`);
      }),
      setTheme: (key) => safe(() => updateDoc(doc(db, 'users', ref.current.me.uid), { theme: key })),
      setName: (name) => safe(async () => {
        await updateDoc(doc(db, 'users', ref.current.me.uid), { name });
        toast('Nome atualizado');
      }),
      setSince: (iso) => safe(() => updateDoc(cRef(), { since: iso })),
    };
  }, [toast]);

  const value = {
    authUser, authReady, me, meReady, partner, couple, hist, mural,
    c, avatarColor, toast, toastMsg, ...actions,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
