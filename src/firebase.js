import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Mantém o login salvo no aparelho. Se já foi inicializado (fast refresh), reaproveita.
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  auth = getAuth(app);
}

// Detecta sozinho quando a rede exige long polling (evita travar em algumas redes/Wi-Fi).
let db;
try {
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} catch (e) {
  db = getFirestore(app);
}

export { auth, db };
