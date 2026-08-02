import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Multiplicador, 
  CelulaAtendimento, 
  SalaTreinamento, 
  Demanda, 
  Turma, 
  FirebaseConfigCustom,
  OperadorQuadro,
  OperadorAlinhamento,
  AlinhamentoTabulador,
  ItemFrequenciaNota,
  AlunoFrequenciaNota
} from '../types';
import { 
  INITIAL_MULTIPLICADORES, 
  INITIAL_CELULAS, 
  INITIAL_SALAS, 
  INITIAL_DEMANDAS, 
  INITIAL_TURMAS,
  INITIAL_OPERADORES,
  INITIAL_TABULADOR,
  INITIAL_FREQUENCIAS_NOTAS
} from '../data/mockData';
import { isOverlapping } from '../lib/planningEngine';
import { 
  DEFAULT_FIREBASE_CONFIG, 
  saveStateToFirestore, 
  loadStateFromFirestore, 
  subscribeToCollection,
  saveItemToFirestore,
  deleteItemFromFirestore,
  migrateMainStateToCollections,
  saveFrequenciaNotaToFirestore,
  deleteFrequenciaNotaFromFirestore,
  atomicUpdateArrayInFirestoreDoc
} from '../lib/firebase';

interface AppContextType {
  multiplicadores: Multiplicador[];
  celulas: CelulaAtendimento[];
  salas: SalaTreinamento[];
  demandas: Demanda[];
  turmas: Turma[];
  operadores: OperadorQuadro[];
  tabulador: AlinhamentoTabulador[];
  frequenciasNotas: ItemFrequenciaNota[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  
  // Custom Firebase Status & Sync Notifications
  isFirebaseConnected: boolean;
  firebaseConfig: FirebaseConfigCustom | null;
  setFirebaseConfig: (config: FirebaseConfigCustom | null) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isSaving: boolean;
  lastSyncTime: string | null;

  // Pending Sync Queue State & Helper Functions
  pendingSyncQueue: Record<string, { collectionName: string; item: any; timestamp: number }>;
  isItemPendingSync: (id: string) => boolean;
  hasPendingSync: boolean;
  pendingSyncCount: number;
  retrySync: () => Promise<void>;

  // Cloud force sync functions
  forceSaveToCloud: () => Promise<boolean>;
  forceReloadFromCloud: () => Promise<boolean>;

  // Security & Passwords
  securityPassword: string;
  setSecurityPassword: (pass: string) => void;
  validatePassword: (pass: string) => boolean;

  // Actions - Demandas
  addDemanda: (demanda: Omit<Demanda, 'id' | 'dataCriacao'>) => Demanda;
  updateDemanda: (id: string, updates: Partial<Demanda>) => void;
  deleteDemanda: (id: string) => void;

  // Actions - Turmas
  addTurma: (turma: Omit<Turma, 'id'>) => { success: boolean; error?: string; turma?: Turma };
  updateTurma: (id: string, updates: Partial<Turma>) => { success: boolean; error?: string };
  deleteTurma: (id: string) => void;

  // Actions - Multiplicadores
  addMultiplicador: (multiplicador: Omit<Multiplicador, 'id'>) => void;
  updateMultiplicador: (id: string, updates: Partial<Multiplicador>) => void;
  deleteMultiplicador: (id: string) => void;

  // Actions - Células
  addCelula: (celula: Omit<CelulaAtendimento, 'id'>) => void;
  updateCelula: (id: string, updates: Partial<CelulaAtendimento>) => void;
  deleteCelula: (id: string) => void;

  // Actions - Salas
  addSala: (sala: Omit<SalaTreinamento, 'id'>) => void;
  updateSala: (id: string, updates: Partial<SalaTreinamento>) => void;
  deleteSala: (id: string) => void;

  // Actions - Operadores (Quadro)
  addOperador: (operador: Omit<OperadorQuadro, 'id'>) => void;
  updateOperador: (id: string, updates: Partial<OperadorQuadro>) => void;
  deleteOperador: (id: string) => void;
  bulkSetOperadores: (novosOperadores: OperadorQuadro[]) => void;
  getOperadorByLogin: (loginBB: string) => OperadorQuadro | undefined;

  // Actions - Tabulador (Alinhamentos)
  addAlinhamentoTabulador: (item: Omit<AlinhamentoTabulador, 'id' | 'criadoEm'>) => void;
  updateAlinhamentoTabulador: (id: string, updates: Partial<AlinhamentoTabulador>) => void;
  atomicUpdateTabuladorOperadores: (
    id: string, 
    newlyAddedOps: OperadorAlinhamento[], 
    updatedOpsPairs: { oldOp: OperadorAlinhamento; newOp: OperadorAlinhamento }[], 
    extraUpdates?: Partial<AlinhamentoTabulador>
  ) => void;
  deleteAlinhamentoTabulador: (id: string) => void;
  toggleAlinhamentoStatus: (id: string) => void;

  // Actions - Frequências e Notas
  addFrequenciaNota: (item: Omit<ItemFrequenciaNota, 'id' | 'criadoEm'> & { id?: string; criadoEm?: string }) => void;
  updateFrequenciaNota: (id: string, updates: Partial<ItemFrequenciaNota>) => void;
  atomicUpdateFrequenciaNotaAlunos: (
    id: string, 
    newlyAddedAlunos: AlunoFrequenciaNota[], 
    updatedAlunosPairs: { oldAluno: AlunoFrequenciaNota; newAluno: AlunoFrequenciaNota }[], 
    extraUpdates?: Partial<ItemFrequenciaNota>
  ) => void;
  deleteFrequenciaNota: (id: string) => void;

  // Validation
  checkRoomConflict: (salaId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;
  checkTrainerConflict: (multiplicadorId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;

  // Reset
  resetToInitialData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function calculateHorasTreinamento(presentes: number, chString: string): string {
  if (!chString || presentes <= 0) return '0:00:00';
  const parts = chString.split(':').map(p => parseInt(p, 10) || 0);
  const chSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  const totalSeconds = chSeconds * presentes;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function diffArrayItems<T extends Record<string, any>>(oldArray: T[], newArray: T[]) {
  const oldItemsToRemove: T[] = [];
  const newItemsToAdd: T[] = [];

  const oldJsonSet = new Set((oldArray || []).map(item => JSON.stringify(item)));
  const newJsonSet = new Set((newArray || []).map(item => JSON.stringify(item)));

  (newArray || []).forEach(newItem => {
    const jsonStr = JSON.stringify(newItem);
    if (!oldJsonSet.has(jsonStr)) {
      newItemsToAdd.push(newItem);
    }
  });

  (oldArray || []).forEach(oldItem => {
    const jsonStr = JSON.stringify(oldItem);
    if (!newJsonSet.has(jsonStr)) {
      oldItemsToRemove.push(oldItem);
    }
  });

  return { oldItemsToRemove, newItemsToAdd };
}

const LOCAL_STORAGE_KEY = 'td_callcenter_data_v2';
const BROADCAST_CHANNEL = 'td_callcenter_broadcast_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('td_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Sync dark mode class on html root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('td_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('td_dark_mode', 'false');
    }
  }, [isDarkMode]);
  const [securityPassword, setSecurityPasswordState] = useState<string>('123456');

  // Entities state
  const [multiplicadores, setMultiplicadores] = useState<Multiplicador[]>([]);
  const [celulas, setCelulas] = useState<CelulaAtendimento[]>([]);
  const [salas, setSalas] = useState<SalaTreinamento[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [operadores, setOperadores] = useState<OperadorQuadro[]>([]);
  const [tabulador, setTabulador] = useState<AlinhamentoTabulador[]>([]);
  const [frequenciasNotas, setFrequenciasNotas] = useState<ItemFrequenciaNota[]>([]);

  // Firebase & Sync Status
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigCustom | null>(null);
  const firebaseConfigRef = useRef(firebaseConfig);
  useEffect(() => {
    firebaseConfigRef.current = firebaseConfig;
  }, [firebaseConfig]);

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const statusTimeoutRef = useRef<any>(null);

  const updateSaveStatus = useCallback((status: 'idle' | 'saving' | 'saved' | 'error', durationMs = 2500) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setSaveStatus(status);
    if (status === 'saved' || status === 'error') {
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, durationMs);
    }
  }, []);

  const isSaving = saveStatus === 'saving';

  // Pending Sync Queue State & Deleted IDs Persistence
  const [pendingSyncQueue, setPendingSyncQueue] = useState<Record<string, { collectionName: string; item: any; timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem('td_pending_sync_queue');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('td_deleted_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const pendingSyncQueueRef = useRef(pendingSyncQueue);
  useEffect(() => {
    pendingSyncQueueRef.current = pendingSyncQueue;
    try {
      localStorage.setItem('td_pending_sync_queue', JSON.stringify(pendingSyncQueue));
    } catch (e) {
      console.warn("Erro ao guardar fila de sincronização no localStorage:", e);
    }
  }, [pendingSyncQueue]);

  const deletedIdsRef = useRef(deletedIds);
  useEffect(() => {
    deletedIdsRef.current = deletedIds;
    try {
      localStorage.setItem('td_deleted_ids', JSON.stringify(Array.from(deletedIds)));
    } catch (e) {
      console.warn("Erro ao guardar IDs excluídos no localStorage:", e);
    }
  }, [deletedIds]);

  const addPendingSync = useCallback((collectionName: string, item: { id: string }) => {
    if (!item || !item.id) return;
    setPendingSyncQueue(prev => ({
      ...prev,
      [item.id]: {
        collectionName,
        item,
        timestamp: Date.now()
      }
    }));
  }, []);

  const removePendingSync = useCallback((id: string) => {
    if (!id) return;
    setPendingSyncQueue(prev => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const markItemDeleted = useCallback((id: string) => {
    if (!id) return;
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    removePendingSync(id);
  }, [removePendingSync]);

  const isItemPendingSync = useCallback((id: string) => {
    if (!id) return false;
    const cleanId = id.replace(/^tab-/, '').replace(/^freq-/, '');
    return Boolean(pendingSyncQueue[id] || pendingSyncQueue[cleanId]);
  }, [pendingSyncQueue]);

  const pendingSyncCount = Object.keys(pendingSyncQueue).length;
  const hasPendingSync = pendingSyncCount > 0;

  // Single Attempt to save item with automatic pending fallback
  const attemptSaveItem = useCallback(async (collectionName: string, item: { id: string }) => {
    if (!item || !item.id) return false;
    const activeConfig = firebaseConfigRef.current || DEFAULT_FIREBASE_CONFIG;
    updateSaveStatus('saving');
    const success = await saveItemToFirestore(collectionName, item, activeConfig);
    if (success) {
      removePendingSync(item.id);
      setLastSyncTime(new Date().toLocaleTimeString());
      updateSaveStatus('saved', 2500);
      return true;
    } else {
      addPendingSync(collectionName, item);
      updateSaveStatus('error', 3000);
      return false;
    }
  }, [addPendingSync, removePendingSync, updateSaveStatus]);

  // Retry all pending items in background
  const retrySync = useCallback(async () => {
    const queue = pendingSyncQueueRef.current;
    const keys = Object.keys(queue);
    if (keys.length === 0) return;

    const activeConfig = firebaseConfigRef.current || DEFAULT_FIREBASE_CONFIG;
    updateSaveStatus('saving');
    let anyFailed = false;

    for (const id of keys) {
      const entry = queue[id];
      if (entry && entry.item) {
        const ok = await saveItemToFirestore(entry.collectionName, entry.item, activeConfig);
        if (ok) {
          removePendingSync(id);
        } else {
          anyFailed = true;
        }
      }
    }

    if (!anyFailed) {
      setLastSyncTime(new Date().toLocaleTimeString());
      updateSaveStatus('saved', 2500);
    } else {
      updateSaveStatus('error', 3000);
    }
  }, [removePendingSync, updateSaveStatus]);

  // Periodic Retry Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(pendingSyncQueueRef.current).length > 0) {
        retrySync();
      }
    }, 5000);

    const handleOnline = () => {
      if (Object.keys(pendingSyncQueueRef.current).length > 0) {
        retrySync();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [retrySync]);

  // Helper to normalize tabulador data schema safely
  const sanitizeTabuladorData = (items: any[]): AlinhamentoTabulador[] => {
    if (!Array.isArray(items) || items.length === 0) return INITIAL_TABULADOR;
    return items.map((item, idx) => {
      const treinamento = item.treinamento || item.titulo || `Treinamento ${idx + 1}`;
      const solicitante = item.solicitante || 'OPERAÇÃO / T&D/BB';
      const celula = item.celula || item.segmento || 'SAC PRIORITÁRIO';
      const convocados = typeof item.convocados === 'number' ? item.convocados : 20;
      const presentes = typeof item.presentes === 'number' ? item.presentes : 20;
      const dispensado = typeof item.dispensado === 'number' ? item.dispensado : 0;
      const pendentes = typeof item.pendentes === 'number' ? item.pendentes : Math.max(0, convocados - presentes - dispensado);
      const cargaHoraria = item.cargaHoraria || '0:20:00';
      const horasTreinamento = item.horasTreinamento || '6:40:00';
      const percentual = typeof item.percentual === 'number' ? item.percentual : (convocados > 0 ? Math.round((presentes / convocados) * 100) : 100);
      const data = item.data || new Date().toISOString().split('T')[0];
      const operadores = Array.isArray(item.operadores) ? item.operadores : [];
      const status = item.status || 'Concluído';

      return {
        id: item.id || `TAB-${100 + idx}`,
        treinamento,
        solicitante,
        celula,
        convocados,
        presentes,
        dispensado,
        pendentes,
        horasTreinamento,
        cargaHoraria,
        percentual,
        data,
        operadores,
        observacoes: item.observacoes || '',
        status,
        criadoEm: item.criadoEm || new Date().toISOString()
      };
    });
  };

  // 1. Carregar dados do LocalStorage ou Mocks
  useEffect(() => {
    try {
      const savedPass = localStorage.getItem('td_callcenter_sec_pass');
      if (savedPass) setSecurityPasswordState(savedPass);

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMultiplicadores(parsed.multiplicadores || INITIAL_MULTIPLICADORES);
        setCelulas(parsed.celulas || INITIAL_CELULAS);
        setSalas(parsed.salas || INITIAL_SALAS);
        setDemandas(parsed.demandas || INITIAL_DEMANDAS);
        setTurmas(parsed.turmas || INITIAL_TURMAS);
        setOperadores(parsed.operadores || INITIAL_OPERADORES);
        setTabulador(sanitizeTabuladorData(parsed.tabulador));
        setFrequenciasNotas(Array.isArray(parsed.frequenciasNotas) ? parsed.frequenciasNotas : INITIAL_FREQUENCIAS_NOTAS);
      } else {
        setMultiplicadores(INITIAL_MULTIPLICADORES);
        setCelulas(INITIAL_CELULAS);
        setSalas(INITIAL_SALAS);
        setDemandas(INITIAL_DEMANDAS);
        setTurmas(INITIAL_TURMAS);
        setOperadores(INITIAL_OPERADORES);
        setTabulador(INITIAL_TABULADOR);
        setFrequenciasNotas(INITIAL_FREQUENCIAS_NOTAS);
      }

      const fbSaved = localStorage.getItem('td_callcenter_firebase_config');
      if (fbSaved) {
        const parsedFb = JSON.parse(fbSaved);
        setFirebaseConfigState(parsedFb);
        setIsFirebaseConnected(true);
      } else {
        setFirebaseConfigState(DEFAULT_FIREBASE_CONFIG);
        setIsFirebaseConnected(true);
        localStorage.setItem('td_callcenter_firebase_config', JSON.stringify(DEFAULT_FIREBASE_CONFIG));
      }
    } catch (e) {
      console.error('Erro ao inicializar dados locais:', e);
      setMultiplicadores(INITIAL_MULTIPLICADORES);
      setCelulas(INITIAL_CELULAS);
      setSalas(INITIAL_SALAS);
      setDemandas(INITIAL_DEMANDAS);
      setTurmas(INITIAL_TURMAS);
      setOperadores(INITIAL_OPERADORES);
      setTabulador(INITIAL_TABULADOR);
    }
  }, []);

  const setSecurityPassword = (pass: string) => {
    setSecurityPasswordState(pass);
    localStorage.setItem('td_callcenter_sec_pass', pass);
  };

  const validatePassword = (pass: string): boolean => {
    return pass.trim() === securityPassword;
  };

  // 2. Salvar no LocalStorage e Broadcast
  const persistAndNotify = useCallback((data: {
    multiplicadores: Multiplicador[];
    celulas: CelulaAtendimento[];
    salas: SalaTreinamento[];
    demandas: Demanda[];
    turmas: Turma[];
    operadores: OperadorQuadro[];
    tabulador: AlinhamentoTabulador[];
    frequenciasNotas?: ItemFrequenciaNota[];
  }) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'DATA_UPDATED', data });
        bc.close();
      }
      updateSaveStatus('saved', 2500);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Erro ao salvar localmente:', err);
    }
  }, [updateSaveStatus]);

  // Listener Firestore em Tempo Real por Coleção Independente (Smart Merge - Zero Data Loss)
  useEffect(() => {
    if (!isFirebaseConnected) return;

    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;

    // Migração automática única do antigo main_state se ele existir
    migrateMainStateToCollections(activeConfig);

    const seeded = {
      multiplicadores: false,
      celulas: false,
      salas: false,
      demandas: false,
      turmas: false,
      operadores: false,
      tabulador: false,
      frequenciasNotas: false,
    };

    const unsubMults = subscribeToCollection<Multiplicador>('multiplicadores', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setMultiplicadores(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.multiplicadores) {
        seeded.multiplicadores = true;
        INITIAL_MULTIPLICADORES.forEach(item => attemptSaveItem('multiplicadores', item));
        setMultiplicadores(INITIAL_MULTIPLICADORES);
      }
    }, activeConfig);

    const unsubCelulas = subscribeToCollection<CelulaAtendimento>('celulas', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setCelulas(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.celulas) {
        seeded.celulas = true;
        INITIAL_CELULAS.forEach(item => attemptSaveItem('celulas', item));
        setCelulas(INITIAL_CELULAS);
      }
    }, activeConfig);

    const unsubSalas = subscribeToCollection<SalaTreinamento>('salas', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setSalas(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.salas) {
        seeded.salas = true;
        INITIAL_SALAS.forEach(item => attemptSaveItem('salas', item));
        setSalas(INITIAL_SALAS);
      }
    }, activeConfig);

    const unsubDemandas = subscribeToCollection<Demanda>('demandas', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setDemandas(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.demandas) {
        seeded.demandas = true;
        INITIAL_DEMANDAS.forEach(item => attemptSaveItem('demandas', item));
        setDemandas(INITIAL_DEMANDAS);
      }
    }, activeConfig);

    const unsubTurmas = subscribeToCollection<Turma>('turmas', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setTurmas(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.turmas) {
        seeded.turmas = true;
        INITIAL_TURMAS.forEach(item => attemptSaveItem('turmas', item));
        setTurmas(INITIAL_TURMAS);
      }
    }, activeConfig);

    const unsubOperadores = subscribeToCollection<OperadorQuadro>('operadores', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setOperadores(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.operadores) {
        seeded.operadores = true;
        INITIAL_OPERADORES.forEach(item => attemptSaveItem('operadores', item));
        setOperadores(INITIAL_OPERADORES);
      }
    }, activeConfig);

    const unsubTabulador = subscribeToCollection<AlinhamentoTabulador>('tabulador', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setTabulador(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.tabulador) {
        seeded.tabulador = true;
        INITIAL_TABULADOR.forEach(item => attemptSaveItem('tabulador', item));
        setTabulador(INITIAL_TABULADOR);
      }
    }, activeConfig);

    const unsubFreq = subscribeToCollection<ItemFrequenciaNota>('frequencias_notas', (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setFrequenciasNotas(prev => {
          const cloudMap = new Map(cloudItems.map(item => [item.id, item]));
          const retainedLocal = prev.filter(local => !cloudMap.has(local.id) && !deletedIdsRef.current.has(local.id));
          return [...cloudItems, ...retainedLocal];
        });
      } else if (!seeded.frequenciasNotas) {
        seeded.frequenciasNotas = true;
        INITIAL_FREQUENCIAS_NOTAS.forEach(item => attemptSaveItem('frequencias_notas', item));
        setFrequenciasNotas(INITIAL_FREQUENCIAS_NOTAS);
      }
    }, activeConfig);

    updateSaveStatus('saved', 2500);
    setLastSyncTime(new Date().toLocaleTimeString());

    return () => {
      if (unsubMults) unsubMults();
      if (unsubCelulas) unsubCelulas();
      if (unsubSalas) unsubSalas();
      if (unsubDemandas) unsubDemandas();
      if (unsubTurmas) unsubTurmas();
      if (unsubOperadores) unsubOperadores();
      if (unsubTabulador) unsubTabulador();
      if (unsubFreq) unsubFreq();
    };
  }, [isFirebaseConnected, firebaseConfig, attemptSaveItem, updateSaveStatus]);

  const setFirebaseConfig = (config: FirebaseConfigCustom | null) => {
    setFirebaseConfigState(config);
    if (config) {
      localStorage.setItem('td_callcenter_firebase_config', JSON.stringify(config));
      setIsFirebaseConnected(true);
    } else {
      localStorage.removeItem('td_callcenter_firebase_config');
      setIsFirebaseConnected(false);
    }
  };

  // Forçar Salvamento Manual na Nuvem
  const forceSaveToCloud = useCallback(async (): Promise<boolean> => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const currentState = {
      multiplicadores,
      celulas,
      salas,
      demandas,
      turmas,
      operadores,
      tabulador,
      frequenciasNotas
    };
    updateSaveStatus('saving');
    const success = await saveStateToFirestore(currentState, activeConfig);
    if (success) {
      setLastSyncTime(new Date().toLocaleTimeString());
      updateSaveStatus('saved', 2500);
    } else {
      updateSaveStatus('error', 3000);
    }
    return success;
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas, firebaseConfig, updateSaveStatus]);

  // Forçar Carregamento Manual da Nuvem (Sobrescrever local)
  const forceReloadFromCloud = useCallback(async (): Promise<boolean> => {
    updateSaveStatus('saving');
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const cloudData = await loadStateFromFirestore(activeConfig);
    if (cloudData) {
      if (Array.isArray(cloudData.multiplicadores)) setMultiplicadores(cloudData.multiplicadores);
      if (Array.isArray(cloudData.celulas)) setCelulas(cloudData.celulas);
      if (Array.isArray(cloudData.salas)) setSalas(cloudData.salas);
      if (Array.isArray(cloudData.demandas)) setDemandas(cloudData.demandas);
      if (Array.isArray(cloudData.turmas)) setTurmas(cloudData.turmas);
      if (Array.isArray(cloudData.operadores)) setOperadores(cloudData.operadores);
      if (Array.isArray(cloudData.tabulador)) setTabulador(cloudData.tabulador);
      if (Array.isArray(cloudData.frequenciasNotas)) setFrequenciasNotas(cloudData.frequenciasNotas);

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          multiplicadores: cloudData.multiplicadores || [],
          celulas: cloudData.celulas || [],
          salas: cloudData.salas || [],
          demandas: cloudData.demandas || [],
          turmas: cloudData.turmas || [],
          operadores: cloudData.operadores || [],
          tabulador: cloudData.tabulador || [],
          frequenciasNotas: cloudData.frequenciasNotas || []
        }));
      } catch (e) {
        console.warn('Erro ao atualizar localStorage:', e);
      }

      setLastSyncTime(new Date().toLocaleTimeString());
      updateSaveStatus('saved', 2500);
      return true;
    } else {
      updateSaveStatus('error', 3000);
      return false;
    }
  }, [firebaseConfig, updateSaveStatus]);

  // Validação de Conflito de Sala
  const checkRoomConflict = (
    salaId: string, 
    data: string, 
    horarioInicio: string, 
    horarioFim: string, 
    excludeTurmaId?: string
  ): Turma | null => {
    const conflito = turmas.find(t => {
      if (t.id === excludeTurmaId) return false;
      if (t.status === 'Cancelado') return false;
      if (t.salaId !== salaId) return false;
      if (t.data !== data) return false;

      return isOverlapping(t.horarioInicio, t.horarioFim, horarioInicio, horarioFim);
    });

    return conflito || null;
  };

  // Validação de Conflito de Multiplicador
  const checkTrainerConflict = (
    multiplicadorId: string, 
    data: string, 
    horarioInicio: string, 
    horarioFim: string, 
    excludeTurmaId?: string
  ): Turma | null => {
    const conflito = turmas.find(t => {
      if (t.id === excludeTurmaId) return false;
      if (t.status === 'Cancelado') return false;
      if (t.multiplicadorId !== multiplicadorId) return false;
      if (t.data !== data) return false;

      return isOverlapping(t.horarioInicio, t.horarioFim, horarioInicio, horarioFim);
    });

    return conflito || null;
  };

  // --- Ações de Demandas ---
  const addDemanda = (demandaData: Omit<Demanda, 'id' | 'dataCriacao'>): Demanda => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const newId = `DEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDemanda: Demanda = {
      ...demandaData,
      id: newId,
      dataCriacao: new Date().toISOString()
    };

    const nextDemandas = [newDemanda, ...demandas];

    // Auto create tabulador entry for new demand, pulling data from quadroOperadores
    const parsedLogins = demandaData.listaOperadores || [];
    const ops: OperadorAlinhamento[] = parsedLogins.map(item => {
      const cleanStr = item.trim().toUpperCase();
      const q = operadores.find(op => 
        op.loginBB.toUpperCase() === cleanStr || 
        op.matDP.toUpperCase() === cleanStr || 
        op.nome.toUpperCase().includes(cleanStr)
      );
      return {
        loginBB: q ? q.loginBB : (cleanStr || 'N/A'),
        nome: q ? q.nome : item,
        matDP: q ? q.matDP : 'N/A',
        supervisor: q ? q.supervisor : (demandaData.supervisor || 'N/A'),
        gerente: q ? q.gerente : 'N/A',
        segmento: q ? q.segmento : (demandaData.celulaNome || 'SAC PRIORITÁRIO'),
        statusPresenca: 'Pendente'
      };
    });

    const convocados = ops.length || (demandaData.qtdOperadores || 0);
    const newTabuladorItem: AlinhamentoTabulador = {
      id: `TAB-${newId}`,
      treinamento: demandaData.tema || 'TREINAMENTO SEM TÍTULO',
      solicitante: `OPERAÇÃO (${demandaData.supervisor || 'T&D/BB'})`,
      celula: demandaData.celulaNome || 'SAC PRIORITÁRIO',
      convocados,
      presentes: 0,
      dispensado: 0,
      pendentes: convocados,
      horasTreinamento: '0:00:00',
      cargaHoraria: '0:20:00',
      percentual: 0,
      data: demandaData.dataSolicitacao || new Date().toISOString().split('T')[0],
      operadores: ops,
      observacoes: demandaData.observacoes || '',
      status: 'Pendente',
      criadoEm: new Date().toISOString()
    };

    const nextTabulador = [newTabuladorItem, ...tabulador];

    // If demand is Sinergia, Migração, Novatos or Retorno LMG, create a Frequencias & Notas item automatically
    let nextFreqList = frequenciasNotas;
    if (['Sinergia', 'Migração', 'Novatos', 'Retorno LMG'].includes(demandaData.tipo)) {
      const alunosList: AlunoFrequenciaNota[] = ops.map((op, idx) => ({
        id: `aln-${newId}-${idx}`,
        matDP: op.matDP || 'N/A',
        loginBB: op.loginBB || 'N/A',
        nome: op.nome || op.loginBB || 'N/A',
        supervisor: op.supervisor || 'N/A',
        gerente: op.gerente || 'N/A',
        celula: op.segmento || demandaData.celulaNome || 'GERAL',
        frequenciaPercent: 100,
        notaFinal: 10,
        statusAprovacao: 'Em Andamento'
      }));

      const newFreqItem: ItemFrequenciaNota = {
        id: `FN-${newId}`,
        demandaId: newId,
        treinamento: demandaData.tema || 'TREINAMENTO DE FREQUÊNCIA E NOTAS',
        tipo: demandaData.tipo as any,
        celulas: [demandaData.celulaNome || 'GERAL'],
        dataInicio: demandaData.dataInicio || demandaData.dataSolicitacao || new Date().toISOString().split('T')[0],
        dataFim: demandaData.dataFim || demandaData.dataSolicitacao || new Date().toISOString().split('T')[0],
        multiplicador: demandaData.multiplicadorNome || 'T&D/BB',
        cargaHoraria: '40h',
        alunos: alunosList,
        status: 'Em Andamento',
        criadoEm: new Date().toISOString()
      };

      nextFreqList = [newFreqItem, ...frequenciasNotas];
      setFrequenciasNotas(nextFreqList);
      saveItemToFirestore('frequencias_notas', newFreqItem, activeConfig);
    }

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);

    saveItemToFirestore('demandas', newDemanda, activeConfig);
    saveItemToFirestore('tabulador', newTabuladorItem, activeConfig);

    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador, frequenciasNotas: nextFreqList });
    return newDemanda;
  };

  const updateDemanda = (id: string, updates: Partial<Demanda>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updatedDemanda: Demanda | null = null;
    const nextDemandas = demandas.map(d => {
      if (d.id === id) {
        updatedDemanda = { ...d, ...updates };
        return updatedDemanda;
      }
      return d;
    });

    let updatedTab: AlinhamentoTabulador | null = null;
    const nextTabulador = tabulador.map(t => {
      if (t.id === `TAB-${id}`) {
        const convocados = updates.qtdOperadores !== undefined ? updates.qtdOperadores : t.convocados;
        updatedTab = {
          ...t,
          treinamento: updates.tema !== undefined ? updates.tema : t.treinamento,
          celula: updates.celulaNome !== undefined ? updates.celulaNome : t.celula,
          convocados,
          presentes: convocados,
          observacoes: updates.observacoes !== undefined ? updates.observacoes : t.observacoes
        };
        return updatedTab;
      }
      return t;
    });

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);

    if (updatedDemanda) saveItemToFirestore('demandas', updatedDemanda, activeConfig);
    if (updatedTab) saveItemToFirestore('tabulador', updatedTab, activeConfig);

    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador });
  };

  const deleteDemanda = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const nextDemandas = demandas.filter(d => d.id !== id);
    const nextTabulador = tabulador.filter(t => t.id !== `TAB-${id}`);

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);

    deleteItemFromFirestore('demandas', id, activeConfig);
    deleteItemFromFirestore('tabulador', `TAB-${id}`, activeConfig);

    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador });
  };

  // --- Ações de Turmas ---
  const addTurma = (turmaData: Omit<Turma, 'id'>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const conflitoSala = checkRoomConflict(
      turmaData.salaId,
      turmaData.data,
      turmaData.horarioInicio,
      turmaData.horarioFim
    );

    if (conflitoSala) {
      return {
        success: false,
        error: `CONFLITO DE SALA: A sala "${turmaData.salaNome}" já está reservada para a turma "${conflitoSala.nomeTurma}" no horário das ${conflitoSala.horarioInicio} às ${conflitoSala.horarioFim}.`
      };
    }

    const conflitoInstrutor = checkTrainerConflict(
      turmaData.multiplicadorId,
      turmaData.data,
      turmaData.horarioInicio,
      turmaData.horarioFim
    );

    if (conflitoInstrutor) {
      return {
        success: false,
        error: `CONFLITO DE MULTIPLICADOR: O instrutor "${turmaData.multiplicadorNome}" já possui a turma "${conflitoInstrutor.nomeTurma}" agendada entre ${conflitoInstrutor.horarioInicio} e ${conflitoInstrutor.horarioFim}.`
      };
    }

    const newTurmaId = `TURMA-${Math.floor(2000 + Math.random() * 8000)}`;
    const newTurma: Turma = {
      ...turmaData,
      id: newTurmaId
    };

    const nextTurmas = [newTurma, ...turmas];

    const updatedDemandas: Demanda[] = [];
    const nextDemandas = demandas.map(d => {
      if (turmaData.demandaIds.includes(d.id)) {
        const updated = {
          ...d,
          status: 'Agendado' as const,
          turmaAgendadaId: newTurmaId
        };
        updatedDemandas.push(updated);
        return updated;
      }
      return d;
    });

    setTurmas(nextTurmas);
    setDemandas(nextDemandas);

    saveItemToFirestore('turmas', newTurma, activeConfig);
    updatedDemandas.forEach(d => saveItemToFirestore('demandas', d, activeConfig));

    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas, operadores, tabulador });

    return { success: true, turma: newTurma };
  };

  const updateTurma = (id: string, updates: Partial<Turma>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const currentTurma = turmas.find(t => t.id === id);
    if (!currentTurma) return { success: false, error: 'Turma não encontrada.' };

    const targetSalaId = updates.salaId || currentTurma.salaId;
    const targetData = updates.data || currentTurma.data;
    const targetStart = updates.horarioInicio || currentTurma.horarioInicio;
    const targetEnd = updates.horarioFim || currentTurma.horarioFim;
    const targetMultiplicador = updates.multiplicadorId || currentTurma.multiplicadorId;

    if (updates.status !== 'Cancelado') {
      const conflitoSala = checkRoomConflict(targetSalaId, targetData, targetStart, targetEnd, id);
      if (conflitoSala) {
        return {
          success: false,
          error: `CONFLITO DE SALA: A sala já está reservada para a turma "${conflitoSala.nomeTurma}" (${conflitoSala.horarioInicio} - ${conflitoSala.horarioFim}).`
        };
      }

      const conflitoInstrutor = checkTrainerConflict(targetMultiplicador, targetData, targetStart, targetEnd, id);
      if (conflitoInstrutor) {
        return {
          success: false,
          error: `CONFLITO DE MULTIPLICADOR: Instrutor ocupado na turma "${conflitoInstrutor.nomeTurma}" (${conflitoInstrutor.horarioInicio} - ${conflitoInstrutor.horarioFim}).`
        };
      }
    }

    let updatedTurma: Turma | null = null;
    const nextTurmas = turmas.map(t => {
      if (t.id === id) {
        updatedTurma = { ...t, ...updates };
        return updatedTurma;
      }
      return t;
    });

    setTurmas(nextTurmas);
    if (updatedTurma) saveItemToFirestore('turmas', updatedTurma, activeConfig);

    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas: nextTurmas, operadores, tabulador });
    return { success: true };
  };

  const deleteTurma = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const targetTurma = turmas.find(t => t.id === id);
    const nextTurmas = turmas.filter(t => t.id !== id);

    let nextDemandas = demandas;
    const updatedDemandas: Demanda[] = [];
    if (targetTurma && targetTurma.demandaIds.length > 0) {
      nextDemandas = demandas.map(d => {
        if (targetTurma.demandaIds.includes(d.id)) {
          const reverted = {
            ...d,
            status: 'Novo' as const,
            turmaAgendadaId: null
          };
          updatedDemandas.push(reverted);
          return reverted;
        }
        return d;
      });
      setDemandas(nextDemandas);
    }

    setTurmas(nextTurmas);

    deleteItemFromFirestore('turmas', id, activeConfig);
    updatedDemandas.forEach(d => saveItemToFirestore('demandas', d, activeConfig));

    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas, operadores, tabulador });
  };

  // --- Ações de Multiplicadores ---
  const addMultiplicador = (multiplicadorData: Omit<Multiplicador, 'id'>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const newMult: Multiplicador = {
      ...multiplicadorData,
      id: `mult-${Date.now()}`
    };
    const nextMults = [...multiplicadores, newMult];
    setMultiplicadores(nextMults);
    saveItemToFirestore('multiplicadores', newMult, activeConfig);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  const updateMultiplicador = (id: string, updates: Partial<Multiplicador>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updated: Multiplicador | null = null;
    const nextMults = multiplicadores.map(m => {
      if (m.id === id) {
        updated = { ...m, ...updates };
        return updated;
      }
      return m;
    });
    setMultiplicadores(nextMults);
    if (updated) saveItemToFirestore('multiplicadores', updated, activeConfig);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  const deleteMultiplicador = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const nextMults = multiplicadores.filter(m => m.id !== id);
    setMultiplicadores(nextMults);
    deleteItemFromFirestore('multiplicadores', id, activeConfig);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Células ---
  const addCelula = (celulaData: Omit<CelulaAtendimento, 'id'>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const newCel: CelulaAtendimento = {
      ...celulaData,
      id: `cel-${Date.now()}`
    };
    const nextCelulas = [...celulas, newCel];
    setCelulas(nextCelulas);
    saveItemToFirestore('celulas', newCel, activeConfig);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  const updateCelula = (id: string, updates: Partial<CelulaAtendimento>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updated: CelulaAtendimento | null = null;
    const nextCelulas = celulas.map(c => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });
    setCelulas(nextCelulas);
    if (updated) saveItemToFirestore('celulas', updated, activeConfig);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  const deleteCelula = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const nextCelulas = celulas.filter(c => c.id !== id);
    setCelulas(nextCelulas);
    deleteItemFromFirestore('celulas', id, activeConfig);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Salas ---
  const addSala = (salaData: Omit<SalaTreinamento, 'id'>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const newSala: SalaTreinamento = {
      ...salaData,
      id: `sala-${Date.now()}`
    };
    const nextSalas = [...salas, newSala];
    setSalas(nextSalas);
    saveItemToFirestore('salas', newSala, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  const updateSala = (id: string, updates: Partial<SalaTreinamento>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updated: SalaTreinamento | null = null;
    const nextSalas = salas.map(s => {
      if (s.id === id) {
        updated = { ...s, ...updates };
        return updated;
      }
      return s;
    });
    setSalas(nextSalas);
    if (updated) saveItemToFirestore('salas', updated, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  const deleteSala = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const nextSalas = salas.filter(s => s.id !== id);
    setSalas(nextSalas);
    deleteItemFromFirestore('salas', id, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Operadores ---
  const addOperador = (opData: Omit<OperadorQuadro, 'id'>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const newOp: OperadorQuadro = {
      ...opData,
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
    };
    const nextOp = [newOp, ...operadores];
    setOperadores(nextOp);
    saveItemToFirestore('operadores', newOp, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const updateOperador = (id: string, updates: Partial<OperadorQuadro>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updated: OperadorQuadro | null = null;
    const nextOp = operadores.map(o => {
      if (o.id === id) {
        updated = { ...o, ...updates };
        return updated;
      }
      return o;
    });
    setOperadores(nextOp);
    if (updated) saveItemToFirestore('operadores', updated, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const deleteOperador = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const nextOp = operadores.filter(o => o.id !== id);
    setOperadores(nextOp);
    deleteItemFromFirestore('operadores', id, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const bulkSetOperadores = (novosOperadores: OperadorQuadro[]) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    const opMap = new Map<string, OperadorQuadro>();
    novosOperadores.forEach(op => {
      if (op.loginBB) {
        opMap.set(op.loginBB.trim().toUpperCase(), op);
      }
    });

    const changedTabItems: AlinhamentoTabulador[] = [];
    const updatedTabulador = tabulador.map(item => {
      if (!Array.isArray(item.operadores) || item.operadores.length === 0) return item;
      
      let changed = false;
      const updatedOps = item.operadores.map(op => {
        const cleanLogin = op.loginBB ? op.loginBB.trim().toUpperCase() : '';
        const activeOp = cleanLogin ? opMap.get(cleanLogin) : undefined;

        if (activeOp) {
          changed = true;
          return {
            ...op,
            nome: activeOp.nome || op.nome,
            matDP: activeOp.matDP || op.matDP,
            supervisor: activeOp.supervisor || op.supervisor,
            gerente: activeOp.gerente || op.gerente,
            segmento: activeOp.segmento || op.segmento
          };
        }
        return op;
      });

      if (changed) {
        const newItem = { ...item, operadores: updatedOps };
        changedTabItems.push(newItem);
        return newItem;
      }
      return item;
    });

    setOperadores(novosOperadores);
    setTabulador(updatedTabulador);

    novosOperadores.forEach(op => saveItemToFirestore('operadores', op, activeConfig));
    changedTabItems.forEach(item => saveItemToFirestore('tabulador', item, activeConfig));

    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: novosOperadores, tabulador: updatedTabulador });
  };

  const getOperadorByLogin = (loginBB: string): OperadorQuadro | undefined => {
    if (!loginBB) return undefined;
    const clean = loginBB.trim().toUpperCase();
    return operadores.find(o => o.loginBB.trim().toUpperCase() === clean);
  };

  // --- Ações de Tabulador ---
  const addAlinhamentoTabulador = (itemData: Omit<AlinhamentoTabulador, 'id' | 'criadoEm'>) => {
    const newItem: AlinhamentoTabulador = {
      ...itemData,
      id: `TAB-${Math.floor(100 + Math.random() * 900)}`,
      criadoEm: new Date().toISOString()
    };
    const nextTab = [newItem, ...tabulador];
    setTabulador(nextTab);
    attemptSaveItem('tabulador', newItem);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab, frequenciasNotas });
  };

  const updateAlinhamentoTabulador = useCallback((id: string, updates: Partial<AlinhamentoTabulador>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updatedItem: AlinhamentoTabulador | null = null;
    let oldItem: AlinhamentoTabulador | null = null;

    const nextTab = tabulador.map(t => {
      if (t.id === id) {
        oldItem = t;
        let newOps = updates.operadores !== undefined ? updates.operadores : t.operadores;
        
        let convocados = updates.convocados !== undefined ? updates.convocados : t.convocados;
        let presentes = updates.presentes !== undefined ? updates.presentes : t.presentes;
        let dispensado = updates.dispensado !== undefined ? updates.dispensado : t.dispensado;
        let pendentes = updates.pendentes !== undefined ? updates.pendentes : t.pendentes;
        let percentual = updates.percentual !== undefined ? updates.percentual : t.percentual;
        let horasTreinamento = updates.horasTreinamento !== undefined ? updates.horasTreinamento : t.horasTreinamento;

        if (updates.operadores !== undefined) {
          convocados = newOps.length;
          presentes = newOps.filter(o => o.statusPresenca === 'Presente').length;
          dispensado = newOps.filter(o => o.statusPresenca === 'Dispensado').length;
          pendentes = Math.max(0, convocados - presentes - dispensado);
          percentual = convocados > 0 ? Math.round((presentes / convocados) * 100) : 0;
          const ch = updates.cargaHoraria || t.cargaHoraria || '0:20:00';
          horasTreinamento = calculateHorasTreinamento(presentes, ch);
        }

        updatedItem = {
          ...t,
          ...updates,
          convocados,
          presentes,
          dispensado,
          pendentes,
          percentual,
          horasTreinamento,
          operadores: newOps
        };
        return updatedItem;
      }
      return t;
    });

    setTabulador(nextTab);

    if (updatedItem && oldItem) {
      if (updates.operadores !== undefined) {
        const { oldItemsToRemove, newItemsToAdd } = diffArrayItems(
          (oldItem as AlinhamentoTabulador).operadores || [],
          (updatedItem as AlinhamentoTabulador).operadores || []
        );

        const extraFields: Record<string, any> = { ...updates };
        delete extraFields.operadores;
        
        extraFields.convocados = updatedItem.convocados;
        extraFields.presentes = updatedItem.presentes;
        extraFields.dispensado = updatedItem.dispensado;
        extraFields.pendentes = updatedItem.pendentes;
        extraFields.percentual = updatedItem.percentual;
        extraFields.horasTreinamento = updatedItem.horasTreinamento;

        atomicUpdateArrayInFirestoreDoc(
          'tabulador',
          id,
          'operadores',
          oldItemsToRemove,
          newItemsToAdd,
          extraFields,
          activeConfig
        ).catch(() => {
          attemptSaveItem('tabulador', updatedItem!);
        });
      } else {
        attemptSaveItem('tabulador', updatedItem);
      }
    }

    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab, frequenciasNotas });
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas, firebaseConfig, attemptSaveItem, persistAndNotify]);

  const atomicUpdateTabuladorOperadores = useCallback((
    id: string,
    newlyAddedOps: OperadorAlinhamento[],
    updatedOpsPairs: { oldOp: OperadorAlinhamento; newOp: OperadorAlinhamento }[],
    extraUpdates?: Partial<AlinhamentoTabulador>
  ) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    let updatedItem: AlinhamentoTabulador | null = null;

    const nextTab = tabulador.map(t => {
      if (t.id === id) {
        const existingOps = t.operadores || [];
        let nextOps = [...existingOps];

        updatedOpsPairs.forEach(({ oldOp, newOp }) => {
          const idx = nextOps.findIndex(o => 
            JSON.stringify(o) === JSON.stringify(oldOp) ||
            (o.loginBB && newOp.loginBB && o.loginBB === newOp.loginBB) ||
            (o.matDP && newOp.matDP && o.matDP === newOp.matDP)
          );
          if (idx >= 0) {
            nextOps[idx] = newOp;
          }
        });

        newlyAddedOps.forEach(newOp => {
          nextOps.push(newOp);
        });

        const convocados = nextOps.length;
        const presentes = nextOps.filter(o => o.statusPresenca === 'Presente').length;
        const dispensado = nextOps.filter(o => o.statusPresenca === 'Dispensado').length;
        const pendentes = Math.max(0, convocados - presentes - dispensado);
        const percentual = convocados > 0 ? Math.round((presentes / convocados) * 100) : 0;
        const ch = extraUpdates?.cargaHoraria || t.cargaHoraria || '0:20:00';
        const horasTreinamento = calculateHorasTreinamento(presentes, ch);

        const aggregated = {
          convocados,
          presentes,
          dispensado,
          pendentes,
          percentual,
          horasTreinamento,
          ...extraUpdates
        };

        updatedItem = {
          ...t,
          ...aggregated,
          operadores: nextOps
        };
        return updatedItem;
      }
      return t;
    });

    setTabulador(nextTab);

    const oldItemsToRemove = updatedOpsPairs.map(p => p.oldOp);
    const newItemsToAdd = [...newlyAddedOps, ...updatedOpsPairs.map(p => p.newOp)];

    if (updatedItem) {
      const extraFieldsToUpdate: Record<string, any> = {
        convocados: updatedItem.convocados,
        presentes: updatedItem.presentes,
        dispensado: updatedItem.dispensado,
        pendentes: updatedItem.pendentes,
        percentual: updatedItem.percentual,
        horasTreinamento: updatedItem.horasTreinamento,
        ...(extraUpdates || {})
      };
      delete extraFieldsToUpdate.operadores;

      atomicUpdateArrayInFirestoreDoc(
        'tabulador',
        id,
        'operadores',
        oldItemsToRemove,
        newItemsToAdd,
        extraFieldsToUpdate,
        activeConfig
      ).catch(() => {
        attemptSaveItem('tabulador', updatedItem!);
      });
    }

    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab, frequenciasNotas });
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas, firebaseConfig, attemptSaveItem, persistAndNotify]);

  const deleteAlinhamentoTabulador = (id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    markItemDeleted(id);
    const nextTab = tabulador.filter(t => t.id !== id);
    setTabulador(nextTab);
    deleteItemFromFirestore('tabulador', id, activeConfig);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab, frequenciasNotas });
  };

  const toggleAlinhamentoStatus = (id: string) => {
    let updated: AlinhamentoTabulador | null = null;
    const nextTab = tabulador.map(t => {
      if (t.id === id) {
        updated = {
          ...t,
          status: (t.status === 'Pendente' ? 'Concluído' : 'Pendente') as 'Pendente' | 'Concluído'
        };
        return updated;
      }
      return t;
    });
    setTabulador(nextTab);
    if (updated) attemptSaveItem('tabulador', updated);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab, frequenciasNotas });
  };

  // --- Ações de Frequências e Notas ---
  const addFrequenciaNota = useCallback((itemData: Omit<ItemFrequenciaNota, 'id' | 'criadoEm'> & { id?: string; criadoEm?: string }) => {
    const newId = itemData.id || `FN-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: ItemFrequenciaNota = {
      ...itemData,
      id: newId,
      criadoEm: itemData.criadoEm || new Date().toISOString()
    } as ItemFrequenciaNota;

    setFrequenciasNotas(prev => {
      const idx = prev.findIndex(f => f.id === newItem.id);
      let nextList: ItemFrequenciaNota[];
      if (idx >= 0) {
        nextList = [...prev];
        nextList[idx] = newItem;
      } else {
        nextList = [newItem, ...prev];
      }
      persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas: nextList });
      return nextList;
    });

    attemptSaveItem('frequencias_notas', newItem);
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, attemptSaveItem, persistAndNotify]);

  const updateFrequenciaNota = useCallback((id: string, updates: Partial<ItemFrequenciaNota>) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;

    setFrequenciasNotas(prev => {
      let updatedItem: ItemFrequenciaNota | null = null;
      let oldItem: ItemFrequenciaNota | null = null;

      const nextList = prev.map(item => {
        if (item.id === id) {
          oldItem = item;
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      });

      if (updatedItem && oldItem) {
        if (updates.alunos !== undefined) {
          const { oldItemsToRemove, newItemsToAdd } = diffArrayItems(
            (oldItem as ItemFrequenciaNota).alunos || [],
            (updatedItem as ItemFrequenciaNota).alunos || []
          );

          const extraFields: Record<string, any> = { ...updates };
          delete extraFields.alunos;

          atomicUpdateArrayInFirestoreDoc(
            'frequencias_notas',
            id,
            'alunos',
            oldItemsToRemove,
            newItemsToAdd,
            extraFields,
            activeConfig
          ).catch(() => {
            attemptSaveItem('frequencias_notas', updatedItem!);
          });
        } else {
          attemptSaveItem('frequencias_notas', updatedItem);
        }
      }

      persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas: nextList });
      return nextList;
    });
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, firebaseConfig, attemptSaveItem, persistAndNotify]);

  const atomicUpdateFrequenciaNotaAlunos = useCallback((
    id: string,
    newlyAddedAlunos: AlunoFrequenciaNota[],
    updatedAlunosPairs: { oldAluno: AlunoFrequenciaNota; newAluno: AlunoFrequenciaNota }[],
    extraUpdates?: Partial<ItemFrequenciaNota>
  ) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;

    setFrequenciasNotas(prev => {
      let updatedItem: ItemFrequenciaNota | null = null;
      const nextList = prev.map(item => {
        if (item.id === id) {
          const existingAlunos = item.alunos || [];
          let nextAlunos = [...existingAlunos];

          updatedAlunosPairs.forEach(({ oldAluno, newAluno }) => {
            const idx = nextAlunos.findIndex(a => 
              JSON.stringify(a) === JSON.stringify(oldAluno) || 
              (a.id && newAluno.id && a.id === newAluno.id) ||
              (a.loginBB && newAluno.loginBB && a.loginBB === newAluno.loginBB)
            );
            if (idx >= 0) {
              nextAlunos[idx] = newAluno;
            }
          });

          newlyAddedAlunos.forEach(newAluno => {
            nextAlunos.push(newAluno);
          });

          updatedItem = {
            ...item,
            ...(extraUpdates || {}),
            alunos: nextAlunos
          };
          return updatedItem;
        }
        return item;
      });

      const oldItemsToRemove = updatedAlunosPairs.map(p => p.oldAluno);
      const newItemsToAdd = [...newlyAddedAlunos, ...updatedAlunosPairs.map(p => p.newAluno)];

      if (updatedItem) {
        const extraFieldsToUpdate: Record<string, any> = { ...(extraUpdates || {}) };
        delete extraFieldsToUpdate.alunos;

        atomicUpdateArrayInFirestoreDoc(
          'frequencias_notas',
          id,
          'alunos',
          oldItemsToRemove,
          newItemsToAdd,
          extraFieldsToUpdate,
          activeConfig
        ).catch(() => {
          attemptSaveItem('frequencias_notas', updatedItem!);
        });
      }

      persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas: nextList });
      return nextList;
    });
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, firebaseConfig, attemptSaveItem, persistAndNotify]);

  const deleteFrequenciaNota = useCallback((id: string) => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    markItemDeleted(id);
    setFrequenciasNotas(prev => {
      const nextList = prev.filter(item => item.id !== id);
      persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, frequenciasNotas: nextList });
      return nextList;
    });
    deleteItemFromFirestore('frequencias_notas', id, activeConfig);
  }, [multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador, firebaseConfig, markItemDeleted, persistAndNotify]);

  const resetToInitialData = () => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    setMultiplicadores(INITIAL_MULTIPLICADORES);
    setCelulas(INITIAL_CELULAS);
    setSalas(INITIAL_SALAS);
    setDemandas(INITIAL_DEMANDAS);
    setTurmas(INITIAL_TURMAS);
    setOperadores(INITIAL_OPERADORES);
    setTabulador(INITIAL_TABULADOR);
    setFrequenciasNotas(INITIAL_FREQUENCIAS_NOTAS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    INITIAL_MULTIPLICADORES.forEach(item => saveItemToFirestore('multiplicadores', item, activeConfig));
    INITIAL_CELULAS.forEach(item => saveItemToFirestore('celulas', item, activeConfig));
    INITIAL_SALAS.forEach(item => saveItemToFirestore('salas', item, activeConfig));
    INITIAL_DEMANDAS.forEach(item => saveItemToFirestore('demandas', item, activeConfig));
    INITIAL_TURMAS.forEach(item => saveItemToFirestore('turmas', item, activeConfig));
    INITIAL_OPERADORES.forEach(item => saveItemToFirestore('operadores', item, activeConfig));
    INITIAL_TABULADOR.forEach(item => saveItemToFirestore('tabulador', item, activeConfig));
    INITIAL_FREQUENCIAS_NOTAS.forEach(item => saveItemToFirestore('frequencias_notas', item, activeConfig));

    persistAndNotify({
      multiplicadores: INITIAL_MULTIPLICADORES,
      celulas: INITIAL_CELULAS,
      salas: INITIAL_SALAS,
      demandas: INITIAL_DEMANDAS,
      turmas: INITIAL_TURMAS,
      operadores: INITIAL_OPERADORES,
      tabulador: INITIAL_TABULADOR,
      frequenciasNotas: INITIAL_FREQUENCIAS_NOTAS
    });
  };

  const clearAllData = () => {
    const activeConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
    multiplicadores.forEach(m => deleteItemFromFirestore('multiplicadores', m.id, activeConfig));
    celulas.forEach(c => deleteItemFromFirestore('celulas', c.id, activeConfig));
    salas.forEach(s => deleteItemFromFirestore('salas', s.id, activeConfig));
    demandas.forEach(d => deleteItemFromFirestore('demandas', d.id, activeConfig));
    turmas.forEach(t => deleteItemFromFirestore('turmas', t.id, activeConfig));
    operadores.forEach(o => deleteItemFromFirestore('operadores', o.id, activeConfig));
    tabulador.forEach(t => deleteItemFromFirestore('tabulador', t.id, activeConfig));
    frequenciasNotas.forEach(fn => deleteItemFromFirestore('frequencias_notas', fn.id, activeConfig));

    setMultiplicadores([]);
    setCelulas([]);
    setSalas([]);
    setDemandas([]);
    setTurmas([]);
    setOperadores([]);
    setTabulador([]);
    setFrequenciasNotas([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    persistAndNotify({
      multiplicadores: [],
      celulas: [],
      salas: [],
      demandas: [],
      turmas: [],
      operadores: [],
      tabulador: [],
      frequenciasNotas: []
    });
  };

  return (
    <AppContext.Provider
      value={{
        multiplicadores,
        celulas,
        salas,
        demandas,
        turmas,
        operadores,
        tabulador,
        frequenciasNotas,
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        isDarkMode,
        setIsDarkMode,
        isFirebaseConnected,
        firebaseConfig,
        setFirebaseConfig,
        saveStatus,
        isSaving,
        lastSyncTime,
        pendingSyncQueue,
        isItemPendingSync,
        hasPendingSync,
        pendingSyncCount,
        retrySync,
        forceSaveToCloud,
        forceReloadFromCloud,
        securityPassword,
        setSecurityPassword,
        validatePassword,
        addDemanda,
        updateDemanda,
        deleteDemanda,
        addTurma,
        updateTurma,
        deleteTurma,
        addMultiplicador,
        updateMultiplicador,
        deleteMultiplicador,
        addCelula,
        updateCelula,
        deleteCelula,
        addSala,
        updateSala,
        deleteSala,
        addOperador,
        updateOperador,
        deleteOperador,
        bulkSetOperadores,
        getOperadorByLogin,
        addAlinhamentoTabulador,
        updateAlinhamentoTabulador,
        atomicUpdateTabuladorOperadores,
        deleteAlinhamentoTabulador,
        toggleAlinhamentoStatus,
        addFrequenciaNota,
        updateFrequenciaNota,
        atomicUpdateFrequenciaNotaAlunos,
        deleteFrequenciaNota,
        checkRoomConflict,
        checkTrainerConflict,
        resetToInitialData,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
