import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDoc, getDocs, onSnapshot, collection, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FirebaseConfigCustom, ItemFrequenciaNota } from '../types';
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

function sanitizeForFirestore(value: any): any {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (typeof value === 'object' && !(value instanceof Date)) {
    const clean: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      if (value[key] !== undefined) clean[key] = sanitizeForFirestore(value[key]);
    });
    return clean;
  }
  return value;
}

export async function saveStateToFirestore(data: any, config?: FirebaseConfigCustom): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return false;
    const sanitizedData = sanitizeForFirestore(data);
    const docRef = doc(db, 'treinamentos_td', 'main_state');
    await setDoc(docRef, { ...sanitizedData, lastUpdated: new Date().toISOString() }, { merge: true });
    const mapping: Record<string, string> = {
      multiplicadores: 'multiplicadores',
      celulas: 'celulas',
      salas: 'salas',
      demandas: 'demandas',
      turmas: 'turmas',
      operadores: 'operadores',
      tabulador: 'tabulador',
      frequenciasNotas: 'frequencias_notas'
    };

    for (const [key, collName] of Object.entries(mapping)) {
      const items = data[key];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.id) {
            await saveItemToFirestore(collName, item, config);
          }
        }
      }
    }
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
    const collections = ['multiplicadores', 'celulas', 'salas', 'demandas', 'turmas', 'operadores', 'tabulador', 'frequencias_notas'];
    const result: Record<string, any> = {};

    for (const collName of collections) {
      const colRef = collection(db, collName);
      const snapshot = await getDocs(colRef);
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      const keyName = collName === 'frequencias_notas' ? 'frequenciasNotas' : collName;
      result[keyName] = list;
    }

    return result;
  } catch (err) {
    console.warn("Firestore sync read fallback:", err);
    return null;
  }
}

export function subscribeToFirestore(onDataUpdated: (data: any) => void, config?: FirebaseConfigCustom) {
  return () => {};
}

// --- Funções para Coleções Individuais ---

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onDataUpdated: (items: T[]) => void,
  config?: FirebaseConfigCustom
) {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return () => {};
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, (snapshot) => {
      const list: T[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          ...data
        } as T);
      });
      onDataUpdated(list);
    }, (error) => {
      console.warn(`Firestore listener na coleção ${collectionName} fallback:`, error);
    });
  } catch (e) {
    console.warn(`Erro ao registrar listener na coleção ${collectionName}:`, e);
    return () => {};
  }
}

export async function saveItemToFirestore<T extends { id: string }>(
  collectionName: string,
  item: T,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db || !item || !item.id) return false;
    const docRef = doc(db, collectionName, String(item.id));
    const sanitized = sanitizeForFirestore(item);
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Erro ao salvar documento na coleção ${collectionName}:`, err);
    return false;
  }
}

export async function deleteItemFromFirestore(
  collectionName: string,
  id: string,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db || !id) return false;
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Erro ao excluir documento na coleção ${collectionName}:`, err);
    return false;
  }
}

// --- Script de Migração de treinamentos_td/main_state para Coleções Independentes ---

export async function migrateMainStateToCollections(config?: FirebaseConfigCustom): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db) return false;
    const mainRef = doc(db, 'treinamentos_td', 'main_state');
    const snapshot = await getDoc(mainRef);
    if (!snapshot.exists()) {
      return false;
    }

    const data = snapshot.data();
    if (data?.migrated) {
      console.log("Migração do main_state já realizada anteriormente.");
      return true;
    }

    console.log("Iniciando migração de treinamentos_td/main_state para coleções independentes...");

    const mapping: Record<string, string> = {
      multiplicadores: 'multiplicadores',
      celulas: 'celulas',
      salas: 'salas',
      demandas: 'demandas',
      turmas: 'turmas',
      operadores: 'operadores',
      tabulador: 'tabulador',
      frequenciasNotas: 'frequencias_notas'
    };

    for (const [key, collName] of Object.entries(mapping)) {
      const items = data[key];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.id) {
            await saveItemToFirestore(collName, item, config);
          }
        }
      }
    }

    // Marcar documento main_state como migrado
    await setDoc(mainRef, {
      migrated: true,
      migratedAt: new Date().toISOString()
    }, { merge: true });

    console.log("Migração do main_state para coleções concluída com sucesso!");
    return true;
  } catch (err) {
    console.warn("Erro ao migrar main_state:", err);
    return false;
  }
}

// --- Coleção Firestore Própria para Frequências e Notas ---
export function subscribeToFrequenciasNotasCollection(
  onDataUpdated: (items: ItemFrequenciaNota[]) => void,
  config?: FirebaseConfigCustom
) {
  return subscribeToCollection<ItemFrequenciaNota>('frequencias_notas', onDataUpdated, config);
}

export async function saveFrequenciaNotaToFirestore(
  item: ItemFrequenciaNota,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  return saveItemToFirestore<ItemFrequenciaNota>('frequencias_notas', item, config);
}

export async function deleteFrequenciaNotaFromFirestore(
  id: string,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  return deleteItemFromFirestore('frequencias_notas', id, config);
}

// --- Operações Atômicas Firestore para Arrays (arrayUnion / arrayRemove) ---

export async function addArrayItemsToFirestoreDoc(
  collectionName: string,
  docId: string,
  arrayFieldName: string,
  newItems: any[],
  extraFieldsToUpdate?: Record<string, any>,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db || !docId || !newItems || newItems.length === 0) return false;
    const docRef = doc(db, collectionName, String(docId));
    const sanitizedItems = sanitizeForFirestore(newItems);
    const sanitizedExtra = extraFieldsToUpdate ? sanitizeForFirestore(extraFieldsToUpdate) : {};

    await updateDoc(docRef, {
      [arrayFieldName]: arrayUnion(...sanitizedItems),
      ...sanitizedExtra
    });
    return true;
  } catch (err) {
    console.warn(`Erro ao executar arrayUnion na coleção ${collectionName}:`, err);
    return false;
  }
}

export async function updateArrayItemInFirestoreDoc(
  collectionName: string,
  docId: string,
  arrayFieldName: string,
  oldItem: any,
  newItem: any,
  extraFieldsToUpdate?: Record<string, any>,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db || !docId) return false;
    const docRef = doc(db, collectionName, String(docId));
    const sanitizedOld = oldItem ? sanitizeForFirestore(oldItem) : null;
    const sanitizedNew = newItem ? sanitizeForFirestore(newItem) : null;
    const sanitizedExtra = extraFieldsToUpdate ? sanitizeForFirestore(extraFieldsToUpdate) : {};

    if (sanitizedOld) {
      await updateDoc(docRef, {
        [arrayFieldName]: arrayRemove(sanitizedOld)
      });
    }

    if (sanitizedNew) {
      await updateDoc(docRef, {
        [arrayFieldName]: arrayUnion(sanitizedNew),
        ...sanitizedExtra
      });
    } else if (Object.keys(sanitizedExtra).length > 0) {
      await updateDoc(docRef, sanitizedExtra);
    }
    return true;
  } catch (err) {
    console.warn(`Erro ao atualizar item no array via arrayRemove/arrayUnion na coleção ${collectionName}:`, err);
    return false;
  }
}

export async function atomicUpdateArrayInFirestoreDoc(
  collectionName: string,
  docId: string,
  arrayFieldName: string,
  oldItemsToRemove: any[],
  newItemsToAdd: any[],
  extraFieldsToUpdate?: Record<string, any>,
  config?: FirebaseConfigCustom
): Promise<boolean> {
  try {
    const db = getFirestoreInstance(config);
    if (!db || !docId) return false;
    const docRef = doc(db, collectionName, String(docId));

    const sanitizedOld = oldItemsToRemove && oldItemsToRemove.length > 0
      ? sanitizeForFirestore(oldItemsToRemove)
      : [];
    const sanitizedNew = newItemsToAdd && newItemsToAdd.length > 0
      ? sanitizeForFirestore(newItemsToAdd)
      : [];
    const sanitizedExtra = extraFieldsToUpdate ? sanitizeForFirestore(extraFieldsToUpdate) : {};

    if (sanitizedOld.length > 0) {
      await updateDoc(docRef, {
        [arrayFieldName]: arrayRemove(...sanitizedOld)
      });
    }

    if (sanitizedNew.length > 0) {
      await updateDoc(docRef, {
        [arrayFieldName]: arrayUnion(...sanitizedNew),
        ...sanitizedExtra
      });
    } else if (Object.keys(sanitizedExtra).length > 0) {
      await updateDoc(docRef, sanitizedExtra);
    }

    return true;
  } catch (err) {
    console.warn(`Erro na atualização atômica de array na coleção ${collectionName}:`, err);
    return false;
  }
}

