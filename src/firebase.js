import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDkRBWMg-k_G99vUbUIZDRtEwiZlEa39Efw",
  authDomain: "dengo-a33d6.firebaseapp.com",
  projectId: "dengo-a33d6",
  storageBucket: "dengo-a33d6.firebasestorage.app",
  messagingSenderId: "302787152539",
  appId: "1:302787152539:web:0fb1982598b81b9391543e"
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

let db;

try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

export { auth, db };
