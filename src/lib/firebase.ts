import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { FirebaseConfigCustom } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigCustom = {
  apiKey: "AIzaSyBx9A_0p33C0LjoH5ulL1ILMigosqQH-PI",
  authDomain: "agenda-treinamento-dtm.firebaseapp.com",
  projectId: "agenda-treinamento-dtm",
  storageBucket: "agenda-treinamento-dtm.firebasestorage.app",
  messagingSenderId: "282903601931",
  appId: "1:282903601931:web:92e5d1d3ec858cc527f80e",
};

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(config: FirebaseConfigCustom = DEFAULT_FIREBASE_CONFIG): { app: FirebaseApp; db: Firestore } | null {
  try {
    if (!config || !config.apiKey || !config.projectId) {
      return null;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, db: firestoreDb };
  } catch (error) {
    console.error("Erro ao inicializar Firebase Firestore:", error);
    return null;
  }
}

export function getFirestoreInstance(config?: FirebaseConfigCustom): Firestore | null {
  if (!firestoreDb) {
    const res = initFirebase(config || DEFAULT_FIREBASE_CONFIG);
    if (res) return res.db;
  }
  return firestoreDb;
}

export async function saveStateToFirestore(data: any, config?: FirebaseConfigCustom) {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return;
    const docRef = doc(db, 'treinamentos_td', 'main_state');
    await setDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync write fallback:", err);
  }
}

export function subscribeToFirestore(onDataUpdated: (data: any) => void, config?: FirebaseConfigCustom) {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return () => {};
    const docRef = doc(db, 'treinamentos_td', 'main_state');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data();
        onDataUpdated(val);
      }
    }, (error) => {
      console.warn("Firestore listener fallback:", error);
    });
  } catch (e) {
    console.warn("Erro ao registrar listener Firestore:", e);
    return () => {};
  }
}
