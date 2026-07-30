import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Multiplicador, 
  CelulaAtendimento, 
  SalaTreinamento, 
  Demanda, 
  Turma, 
  FirebaseConfigCustom,
  OperadorQuadro,
  AlinhamentoTabulador
} from '../types';
import { 
  INITIAL_MULTIPLICADORES, 
  INITIAL_CELULAS, 
  INITIAL_SALAS, 
  INITIAL_DEMANDAS, 
  INITIAL_TURMAS,
  INITIAL_OPERADORES,
  INITIAL_TABULADOR
} from '../data/mockData';
import { isOverlapping } from '../lib/planningEngine';
import { DEFAULT_FIREBASE_CONFIG, saveStateToFirestore, subscribeToFirestore } from '../lib/firebase';

interface AppContextType {
  multiplicadores: Multiplicador[];
  celulas: CelulaAtendimento[];
  salas: SalaTreinamento[];
  demandas: Demanda[];
  turmas: Turma[];
  operadores: OperadorQuadro[];
  tabulador: AlinhamentoTabulador[];
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
  deleteAlinhamentoTabulador: (id: string) => void;
  toggleAlinhamentoStatus: (id: string) => void;

  // Validation
  checkRoomConflict: (salaId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;
  checkTrainerConflict: (multiplicadorId: string, data: string, horarioInicio: string, horarioFim: string, excludeTurmaId?: string) => Turma | null;

  // Reset
  resetToInitialData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'td_callcenter_data_v2';
const BROADCAST_CHANNEL = 'td_callcenter_broadcast_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [securityPassword, setSecurityPasswordState] = useState<string>('123456');

  // Entities state
  const [multiplicadores, setMultiplicadores] = useState<Multiplicador[]>([]);
  const [celulas, setCelulas] = useState<CelulaAtendimento[]>([]);
  const [salas, setSalas] = useState<SalaTreinamento[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [operadores, setOperadores] = useState<OperadorQuadro[]>([]);
  const [tabulador, setTabulador] = useState<AlinhamentoTabulador[]>([]);

  // Firebase
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigCustom | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

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
      } else {
        setMultiplicadores(INITIAL_MULTIPLICADORES);
        setCelulas(INITIAL_CELULAS);
        setSalas(INITIAL_SALAS);
        setDemandas(INITIAL_DEMANDAS);
        setTurmas(INITIAL_TURMAS);
        setOperadores(INITIAL_OPERADORES);
        setTabulador(INITIAL_TABULADOR);
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

  // 2. Salvar no LocalStorage, Firestore e Broadcast
  const persistAndNotify = useCallback((data: {
    multiplicadores: Multiplicador[];
    celulas: CelulaAtendimento[];
    salas: SalaTreinamento[];
    demandas: Demanda[];
    turmas: Turma[];
    operadores: OperadorQuadro[];
    tabulador: AlinhamentoTabulador[];
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
        if (data.operadores) setOperadores(data.operadores);
        if (data.tabulador) setTabulador(data.tabulador);
      }
    }, firebaseConfig || DEFAULT_FIREBASE_CONFIG);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isFirebaseConnected, firebaseConfig]);

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
    const newId = `DEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDemanda: Demanda = {
      ...demandaData,
      id: newId,
      dataCriacao: new Date().toISOString()
    };

    const nextDemandas = [newDemanda, ...demandas];

    // Auto create tabulador entry for new demand
    const convocados = demandaData.qtdOperadores || 0;
    const newTabuladorItem: AlinhamentoTabulador = {
      id: `TAB-${newId}`,
      treinamento: demandaData.tema || 'TREINAMENTO SEM TÍTULO',
      solicitante: `OPERAÇÃO (${demandaData.supervisor || 'T&D/BB'})`,
      celula: demandaData.celulaNome || 'SAC PRIORITÁRIO',
      convocados,
      presentes: convocados,
      dispensado: 0,
      pendentes: 0,
      horasTreinamento: '0:20:00',
      cargaHoraria: '0:20:00',
      percentual: 100,
      data: demandaData.dataSolicitacao || new Date().toISOString().split('T')[0],
      operadores: (demandaData.listaOperadores || []).map(opName => ({
        loginBB: 'N/A',
        nome: opName,
        statusPresenca: 'Presente'
      })),
      observacoes: demandaData.observacoes || '',
      status: 'Concluído',
      criadoEm: new Date().toISOString()
    };

    const nextTabulador = [newTabuladorItem, ...tabulador];

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador });
    return newDemanda;
  };

  const updateDemanda = (id: string, updates: Partial<Demanda>) => {
    const nextDemandas = demandas.map(d => d.id === id ? { ...d, ...updates } : d);

    const nextTabulador = tabulador.map(t => {
      if (t.id === `TAB-${id}`) {
        const convocados = updates.qtdOperadores !== undefined ? updates.qtdOperadores : t.convocados;
        return {
          ...t,
          treinamento: updates.tema !== undefined ? updates.tema : t.treinamento,
          celula: updates.celulaNome !== undefined ? updates.celulaNome : t.celula,
          convocados,
          presentes: convocados,
          observacoes: updates.observacoes !== undefined ? updates.observacoes : t.observacoes
        };
      }
      return t;
    });

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador });
  };

  const deleteDemanda = (id: string) => {
    const nextDemandas = demandas.filter(d => d.id !== id);
    const nextTabulador = tabulador.filter(t => t.id !== `TAB-${id}`);

    setDemandas(nextDemandas);
    setTabulador(nextTabulador);
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas, operadores, tabulador: nextTabulador });
  };

  // --- Ações de Turmas ---
  const addTurma = (turmaData: Omit<Turma, 'id'>) => {
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
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas, operadores, tabulador });

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
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas: nextTurmas, operadores, tabulador });
    return { success: true };
  };

  const deleteTurma = (id: string) => {
    const targetTurma = turmas.find(t => t.id === id);
    const nextTurmas = turmas.filter(t => t.id !== id);

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
    persistAndNotify({ multiplicadores, celulas, salas, demandas: nextDemandas, turmas: nextTurmas, operadores, tabulador });
  };

  // --- Ações de Multiplicadores ---
  const addMultiplicador = (multiplicadorData: Omit<Multiplicador, 'id'>) => {
    const newMult: Multiplicador = {
      ...multiplicadorData,
      id: `mult-${Date.now()}`
    };
    const nextMults = [...multiplicadores, newMult];
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  const updateMultiplicador = (id: string, updates: Partial<Multiplicador>) => {
    const nextMults = multiplicadores.map(m => m.id === id ? { ...m, ...updates } : m);
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  const deleteMultiplicador = (id: string) => {
    const nextMults = multiplicadores.filter(m => m.id !== id);
    setMultiplicadores(nextMults);
    persistAndNotify({ multiplicadores: nextMults, celulas, salas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Células ---
  const addCelula = (celulaData: Omit<CelulaAtendimento, 'id'>) => {
    const newCel: CelulaAtendimento = {
      ...celulaData,
      id: `cel-${Date.now()}`
    };
    const nextCelulas = [...celulas, newCel];
    setCelulas(nextCelulas);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  const updateCelula = (id: string, updates: Partial<CelulaAtendimento>) => {
    const nextCelulas = celulas.map(c => c.id === id ? { ...c, ...updates } : c);
    setCelulas(nextCelulas);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  const deleteCelula = (id: string) => {
    const nextCelulas = celulas.filter(c => c.id !== id);
    setCelulas(nextCelulas);
    persistAndNotify({ multiplicadores, celulas: nextCelulas, salas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Salas ---
  const addSala = (salaData: Omit<SalaTreinamento, 'id'>) => {
    const newSala: SalaTreinamento = {
      ...salaData,
      id: `sala-${Date.now()}`
    };
    const nextSalas = [...salas, newSala];
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  const updateSala = (id: string, updates: Partial<SalaTreinamento>) => {
    const nextSalas = salas.map(s => s.id === id ? { ...s, ...updates } : s);
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  const deleteSala = (id: string) => {
    const nextSalas = salas.filter(s => s.id !== id);
    setSalas(nextSalas);
    persistAndNotify({ multiplicadores, celulas, salas: nextSalas, demandas, turmas, operadores, tabulador });
  };

  // --- Ações de Operadores ---
  const addOperador = (opData: Omit<OperadorQuadro, 'id'>) => {
    const newOp: OperadorQuadro = {
      ...opData,
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
    };
    const nextOp = [newOp, ...operadores];
    setOperadores(nextOp);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const updateOperador = (id: string, updates: Partial<OperadorQuadro>) => {
    const nextOp = operadores.map(o => o.id === id ? { ...o, ...updates } : o);
    setOperadores(nextOp);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const deleteOperador = (id: string) => {
    const nextOp = operadores.filter(o => o.id !== id);
    setOperadores(nextOp);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: nextOp, tabulador });
  };

  const bulkSetOperadores = (novosOperadores: OperadorQuadro[]) => {
    setOperadores(novosOperadores);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores: novosOperadores, tabulador });
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
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab });
  };

  const updateAlinhamentoTabulador = (id: string, updates: Partial<AlinhamentoTabulador>) => {
    const nextTab = tabulador.map(t => t.id === id ? { ...t, ...updates } : t);
    setTabulador(nextTab);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab });
  };

  const deleteAlinhamentoTabulador = (id: string) => {
    const nextTab = tabulador.filter(t => t.id !== id);
    setTabulador(nextTab);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab });
  };

  const toggleAlinhamentoStatus = (id: string) => {
    const nextTab = tabulador.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: (t.status === 'Pendente' ? 'Concluído' : 'Pendente') as 'Pendente' | 'Concluído'
        };
      }
      return t;
    });
    setTabulador(nextTab);
    persistAndNotify({ multiplicadores, celulas, salas, demandas, turmas, operadores, tabulador: nextTab });
  };

  const resetToInitialData = () => {
    setMultiplicadores(INITIAL_MULTIPLICADORES);
    setCelulas(INITIAL_CELULAS);
    setSalas(INITIAL_SALAS);
    setDemandas(INITIAL_DEMANDAS);
    setTurmas(INITIAL_TURMAS);
    setOperadores(INITIAL_OPERADORES);
    setTabulador(INITIAL_TABULADOR);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    persistAndNotify({
      multiplicadores: INITIAL_MULTIPLICADORES,
      celulas: INITIAL_CELULAS,
      salas: INITIAL_SALAS,
      demandas: INITIAL_DEMANDAS,
      turmas: INITIAL_TURMAS,
      operadores: INITIAL_OPERADORES,
      tabulador: INITIAL_TABULADOR
    });
  };

  const clearAllData = () => {
    setMultiplicadores([]);
    setCelulas([]);
    setSalas([]);
    setDemandas([]);
    setTurmas([]);
    setOperadores([]);
    setTabulador([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    persistAndNotify({
      multiplicadores: [],
      celulas: [],
      salas: [],
      demandas: [],
      turmas: [],
      operadores: [],
      tabulador: []
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
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        isDarkMode,
        setIsDarkMode,
        isFirebaseConnected,
        firebaseConfig,
        setFirebaseConfig,
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
        deleteAlinhamentoTabulador,
        toggleAlinhamentoStatus,
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
