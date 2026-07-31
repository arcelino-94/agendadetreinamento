import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { FirebaseConfigCustom } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigCustom = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  databaseId: firebaseConfigJson.firestoreDatabaseId,
};

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(config: FirebaseConfigCustom = DEFAULT_FIREBASE_CONFIG): { app: FirebaseApp; db: Firestore } | null {
  try {
    const activeConfig = config || DEFAULT_FIREBASE_CONFIG;
    if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId) {
      return null;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(activeConfig);
    } else {
      firebaseApp = getApp();
    }

    const dbId = activeConfig.databaseId || firebaseConfigJson.firestoreDatabaseId;
    if (dbId && dbId !== '(default)') {
      firestoreDb = getFirestore(firebaseApp, dbId);
    } else {
      firestoreDb = getFirestore(firebaseApp);
    }
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

export async function saveStateToFirestore(data: any, config?: FirebaseConfigCustom): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return false;
    const docRef = doc(db, 'treinamentos_td', 'main_state');
    await setDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Firestore sync write fallback:", err);
    return false;
  }
}

export async function loadStateFromFirestore(config?: FirebaseConfigCustom): Promise<any> {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return null;
    const docRef = doc(db, 'treinamentos_td', 'main_state');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.warn("Firestore sync read fallback:", err);
    return null;
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
      } else {
        onDataUpdated(null);
      }
    }, (error) => {
      console.warn("Firestore listener fallback:", error);
    });
  } catch (e) {
    console.warn("Erro ao registrar listener Firestore:", e);
    return () => {};
  }
}

