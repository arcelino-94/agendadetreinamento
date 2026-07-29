import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Multiplicador, 
  CelulaAtendimento, 
  SalaTreinamento, 
  Demanda, 
  Turma, 
  FirebaseConfigCustom 
} from '../types';
import { 
  INITIAL_MULTIPLICADORES, 
  INITIAL_CELULAS, 
  INITIAL_SALAS, 
  INITIAL_DEMANDAS, 
  INITIAL_TURMAS 
} from '../data/mockData';
import { isOverlapping } from '../lib/planningEngine';
import { DEFAULT_FIREBASE_CONFIG, saveStateToFirestore, subscribeToFirestore } from '../lib/firebase';

interface AppContextType {
  multiplicadores: Multiplicador[];
  celulas: CelulaAtendimento[];
  salas: SalaTreinamento[];
  demandas: Demanda[];
  turmas: Turma[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  
  // Custom Firebase Status
  isFirebaseConnected: boolean;
  firebaseConfig: FirebaseConfigCustom | null;
  setFirebaseConfig: (config: FirebaseConfigCustom | null) => void;

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

  // Actions - Salas
  addSala: (sala: Omit<SalaTreinamento, 'id'>) => void;
  updateSala: (id: string, updates: Partial<SalaTreinamento>) => void;
  deleteSala: (id: string) => void;

  // Validation
  checkRoomConflict: (salaId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;
  checkTrainerConflict: (multiplicadorId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;

  // Reset
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'td_callcenter_data_v1';
const BROADCAST_CHANNEL = 'td_callcenter_broadcast_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Entities state
  const [multiplicadores, setMultiplicadores] = useState<Multiplicador[]>([]);
  const [celulas, setCelulas] = useState<CelulaAtendimento[]>([]);
  const [salas, setSalas] = useState<SalaTreinamento[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  // Firebase
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigCustom | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // 1. Carregar dados do LocalStorage ou Mocks na primeira execução
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMultiplicadores(parsed.multiplicadores || INITIAL_MULTIPLICADORES);
        setCelulas(parsed.celulas || INITIAL_CELULAS);
        setSalas(parsed.salas || INITIAL_SALAS);
        setDemandas(parsed.demandas || INITIAL_DEMANDAS);
        setTurmas(parsed.turmas || INITIAL_TURMAS);
      } else {
        setMultiplicadores(INITIAL_MULTIPLICADORES);
        setCelulas(INITIAL_CELULAS);
        setSalas(INITIAL_SALAS);
        setDemandas(INITIAL_DEMANDAS);
        setTurmas(INITIAL_TURMAS);
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
    }
  }, []);

  // 2. Salvar no LocalStorage, Firestore e notificar outras abas
  const persistAndNotify = useCallback((data: {
    multiplicadores: Multiplicador[];
    celulas: CelulaAtendimento[];
    salas: SalaTreinamento[];
    demandas: Demanda[];
    turmas: Turma[];
  }) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'DATA_UPDATED', data });
        bc.close();
      }
      saveStateToFirestore(data);
    } catch (err) {
      console.error('Erro ao persistir estado:', err);
    }
  }, []);

  // Listener Firestore em Tempo Real
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const unsubscribe = subscribeToFirestore((data) => {
      if (data) {
        if (data.multiplicadores) setMultiplicadores(data.multiplicadores);
        if (data.celulas) setCelulas(data.celulas);
        if (data.salas) setSalas(data.salas);
        if (data.demandas) setDemandas(data.demandas);
        if (data.turmas) setTurmas(data.turmas);
      }
    }, firebaseConfig || DEFAULT_FIREBASE_CONFIG);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isFirebaseConnected, firebaseConfig]);

  // Listener para sincronização em tempo real entre abas no mesmo navegador
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.onmessage = (event) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        const { multiplicadores, celulas, salas, demandas, turmas } = event.data.data;
        setMultiplicadores(multiplicadores);
        setCelulas(celulas);
        setSalas(salas);
        setDemandas(demandas);
        setTurmas(turmas);
      }
    };
    return () => {
      bc.close();
    };
  }, []);

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

  // --- Validação de Conflito de Sala (Requisito Estrito) ---
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

  // --- Validação de Conflito de Multiplicador ---
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
    const newId = `DEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDemanda: Demanda = {
      ...demandaData,
      id: newId,
      dataCriacao: new Date().toISOString()
    };

    const nextDemandas = [newDemanda, ...demandas];
    setDemandas(nextDemandas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas });
    return newDemanda;
  };

  const updateDemanda = (id: string, updates: Partial<Demanda>) => {
    const nextDemandas = demandas.map(d => d.id === id ? { ...d, ...updates } : d);
    setDemandas(nextDemandas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas });
  };

  const deleteDemanda = (id: string) => {
    const nextDemandas = demandas.filter(d => d.id !== id);
    setDemandas(nextDemandas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas });
  };

  // --- Ações de Turmas (Com Validações de Conflito) ---
  const addTurma = (turmaData: Omit<Turma, 'id'>) => {
    // 1. Checar sobreposição de Sala
    const conflitoSala = checkRoomConflict(
      turmaData.salaId,
      turmaData.data,
      turmaData.horarioInicio,
      turmaData.horarioFim
    );

    if (conflitoSala) {
      return {
        success: false,
        error: `CONFLITO DE SALA: A sala "${turmaData.salaNome}" já está reservada para a turma "${conflitoSala.nomeTurma}" no horário das ${conflitoSala.horarioInicio} às ${conflitoSala.horarioFim} no dia ${turmaData.data}.`
      };
    }

    // 2. Checar sobreposição de Multiplicador
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

    // Atualizar status das demandas vinculadas
    const nextDemandas = demandas.map(d => {
      if (turmaData.demandaIds.includes(d.id)) {
        return {
          ...d,
          status: 'Agendado' as const,
          turmaAgendadaId: newTurmaId
        };
      }
      return d;
    });

    setTurmas(nextTurmas);
    setDemandas(nextDemandas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas });

    return { success: true, turma: newTurma };
  };

  const updateTurma = (id: string, updates: Partial<Turma>) => {
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

    const nextTurmas = turmas.map(t => t.id === id ? { ...t, ...updates } : t);
    setTurmas(nextTurmas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas: nextTurmas });
    return { success: true };
  };

  const deleteTurma = (id: string) => {
    const targetTurma = turmas.find(t => t.id === id);
    const nextTurmas = turmas.filter(t => t.id !== id);

    // Liberar demandas associadas
    let nextDemandas = demandas;
    if (targetTurma && targetTurma.demandaIds.length > 0) {
      nextDemandas = demandas.map(d => {
        if (targetTurma.demandaIds.includes(d.id)) {
          return {
            ...d,
            status: 'Novo' as const,
            turmaAgendadaId: undefined
          };
        }
        return d;
      });
      setDemandas(nextDemandas);
    }

    setTurmas(nextTurmas);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas });
  };

  // --- Ações de Multiplicadores ---
  const addMultiplicador = (multiplicadorData: Omit<Multiplicador, 'id'>) => {
    const newMult: Multiplicador = {
      ...multiplicadorData,
      id: `mult-${Date.now()}`
    };
    const nextMults = [...multiplicadores, newMult];
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas });
  };

  const updateMultiplicador = (id: string, updates: Partial<Multiplicador>) => {
    const nextMults = multiplicadores.map(m => m.id === id ? { ...m, ...updates } : m);
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas });
  };

  const deleteMultiplicador = (id: string) => {
    const nextMults = multiplicadores.filter(m => m.id !== id);
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas });
  };

  // --- Ações de Salas ---
  const addSala = (salaData: Omit<SalaTreinamento, 'id'>) => {
    const newSala: SalaTreinamento = {
      ...salaData,
      id: `sala-${Date.now()}`
    };
    const nextSalas = [...salas, newSala];
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas });
  };

  const updateSala = (id: string, updates: Partial<SalaTreinamento>) => {
    const nextSalas = salas.map(s => s.id === id ? { ...s, ...updates } : s);
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas });
  };

  const deleteSala = (id: string) => {
    const nextSalas = salas.filter(s => s.id !== id);
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas });
  };

  const resetToInitialData = () => {
    setMultiplicadores(INITIAL_MULTIPLICADORES);
    setCelulas(INITIAL_CELULAS);
    setSalas(INITIAL_SALAS);
    setDemandas(INITIAL_DEMANDAS);
    setTurmas(INITIAL_TURMAS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        multiplicadores,
        celulas,
        salas,
        demandas,
        turmas,
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        isDarkMode,
        setIsDarkMode,
        isFirebaseConnected,
        firebaseConfig,
        setFirebaseConfig,
        addDemanda,
        updateDemanda,
        deleteDemanda,
        addTurma,
        updateTurma,
        deleteTurma,
        addMultiplicador,
        updateMultiplicador,
        deleteMultiplicador,
        addSala,
        updateSala,
        deleteSala,
        checkRoomConflict,
        checkTrainerConflict,
        resetToInitialData
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
