import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  FileCheck,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
  Save,
  UserPlus,
  PlusCircle,
  CloudOff,
  Zap,
  Check,
  Layers,
  Sparkles,
  Pencil,
  DoorOpen,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemFrequenciaNota, AlunoFrequenciaNota, PresencaDiariaItem, ItemProvaNota, DossieOperador } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';
import { AlunoPresencaCalendarModal } from './AlunoPresencaCalendarModal';
import { AlunoNotasModal } from './AlunoNotasModal';
import { AlunoDossieModal } from './AlunoDossieModal';
import { handleExportExcelDossie } from '../utils/excelExport';

const parseLocalDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const clean = dateStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
    }
  }
  if (clean.includes('-')) {
    const parts = clean.split('T')[0].split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
    }
  }
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const FrequenciasNotasView: React.FC = () => {
  const { 
    frequenciasNotas: items = [], 
    updateFrequenciaNota, 
    deleteFrequenciaNota, 
    addFrequenciaNota,
    demandas, 
    celulas, 
    multiplicadores, 
    salas,
    operadores,
    isItemPendingSync,
    setActiveTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedYear, setSelectedYear] = useState<string>('TODOS');
  const [activeCourse, setActiveCourse] = useState<ItemFrequenciaNota | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Edit course metadata state (Pencil icon on main card)
  const [editingCourseMetadata, setEditingCourseMetadata] = useState<ItemFrequenciaNota | null>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    treinamento: '',
    tipo: 'Sinergia' as 'Sinergia' | 'Migração' | 'Novatos' | 'Retorno LMG',
    multiplicador: '',
    horarioTreinamento: '',
    salaId: '',
    salaNome: '',
    dataInicio: '',
    dataFim: '',
    listaOperadoresText: ''
  });

  // Global editing state for table rows inside Launch modal
  const [isEditingAllRows, setIsEditingAllRows] = useState(false);

  // Modals for individual student details
  const [selectedAlunoCalendar, setSelectedAlunoCalendar] = useState<{ aluno: AlunoFrequenciaNota; course: ItemFrequenciaNota } | null>(null);
  const [selectedAlunoNotas, setSelectedAlunoNotas] = useState<{ aluno: AlunoFrequenciaNota; course: ItemFrequenciaNota } | null>(null);
  const [selectedAlunoDossie, setSelectedAlunoDossie] = useState<{ aluno: AlunoFrequenciaNota; course: ItemFrequenciaNota } | null>(null);

  // Daily presence expandable grid state inside active course details
  const [isPresencaGridOpen, setIsPresencaGridOpen] = useState(false);
  const [trainingDaysCount, setTrainingDaysCount] = useState(25);
  const [dateOffsetIndex, setDateOffsetIndex] = useState(0);

  // Bulk presence entry states
  const [selectedBulkDateKey, setSelectedBulkDateKey] = useState<string>('');
  const [bulkHoraExtraInput, setBulkHoraExtraInput] = useState<string>('');
  const [bulkObsInput, setBulkObsInput] = useState<string>('');
  const [presenceViewMode, setPresenceViewMode] = useState<'lote' | 'matriz'>('lote');

  // Calendar Modal & Training Extension states
  const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false);
  const [calendarNavDate, setCalendarNavDate] = useState<Date>(new Date());
  const [pendingExtensionDate, setPendingExtensionDate] = useState<string | null>(null);
  const [customXDaysInput, setCustomXDaysInput] = useState<number>(5);

  const [isLancarNotaOpen, setIsLancarNotaOpen] = useState(false);
  const [nomeProvaInput, setNomeProvaInput] = useState('Prova 1');
  const [dataProvaInput, setDataProvaInput] = useState(new Date().toISOString().split('T')[0]);
  const [notaInputMap, setNotaInputMap] = useState<Record<string, number>>({});

  // Edit student list state
  const [editingAlunos, setEditingAlunos] = useState<AlunoFrequenciaNota[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ matDP: string; loginBB: string; nome: string }>({
    matDP: '',
    loginBB: '',
    nome: ''
  });

  // Filtered items - SORTED FROM MOST RECENT TO OLDEST
  const filteredItems = useMemo(() => {
    const list = items.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = item.treinamento.toLowerCase().includes(q) ||
        item.multiplicador.toLowerCase().includes(q) ||
        item.celulas.some(c => c.toLowerCase().includes(q));
      const matchTipo = selectedTipo === 'todos' || item.tipo === selectedTipo;

      let matchMonth = true;
      let matchYear = true;

      const dateStr = item.dataInicio || item.criadoEm;
      if (dateStr) {
        const d = parseLocalDate(dateStr);
        const hasDate = !isNaN(d.getTime());
        const itemMonth = hasDate ? (d.getMonth() + 1).toString() : '';
        const itemYear = hasDate ? d.getFullYear().toString() : '';

        if (selectedMonth === 'EM_BRANCO') {
          matchMonth = !itemMonth;
        } else if (selectedMonth !== 'TODOS') {
          matchMonth = itemMonth === selectedMonth;
        }

        if (selectedYear === 'EM_BRANCO') {
          matchYear = !itemYear;
        } else if (selectedYear !== 'TODOS') {
          matchYear = itemYear === selectedYear;
        }
      } else {
        if (selectedMonth === 'EM_BRANCO') matchMonth = true;
        else if (selectedMonth !== 'TODOS') matchMonth = false;

        if (selectedYear === 'EM_BRANCO') matchYear = true;
        else if (selectedYear !== 'TODOS') matchYear = false;
      }

      return matchSearch && matchTipo && matchMonth && matchYear;
    });

    // Sort: Most recent to oldest
    return list.sort((a, b) => {
      const timeA = a.criadoEm ? new Date(a.criadoEm).getTime() : parseLocalDate(a.dataInicio).getTime();
      const timeB = b.criadoEm ? new Date(b.criadoEm).getTime() : parseLocalDate(b.dataInicio).getTime();
      return timeB - timeA;
    });
  }, [items, searchTerm, selectedTipo, selectedMonth, selectedYear]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalCursos = filteredItems.length;
    let totalAlunos = 0;
    let sumFreq = 0;
    let sumNota = 0;
    let totalAprovados = 0;

    filteredItems.forEach(c => {
      totalAlunos += c.alunos.length;
      c.alunos.forEach(a => {
        sumFreq += a.frequenciaPercent;
        sumNota += a.notaFinal;
        if (a.statusAprovacao === 'Aprovado') totalAprovados++;
      });
    });

    const mediaFreq = totalAlunos > 0 ? Math.round(sumFreq / totalAlunos) : 0;
    const mediaNota = totalAlunos > 0 ? (sumNota / totalAlunos).toFixed(1) : '0.0';
    const taxaAprovacao = totalAlunos > 0 ? Math.round((totalAprovados / totalAlunos) * 100) : 0;

    return { totalCursos, totalAlunos, mediaFreq, mediaNota, taxaAprovacao };
  }, [filteredItems]);

  // Generate course dates aligned strictly with course dataInicio and dataFim
  const generatedDates = useMemo(() => {
    if (!activeCourse) return [];
    const start = parseLocalDate(activeCourse.dataInicio);
    const end = parseLocalDate(activeCourse.dataFim || activeCourse.dataInicio);

    const daysBetween = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const totalDaysToGenerate = Math.max(daysBetween, trainingDaysCount);

    const dates: { fullDate: string; label: string; dayOfWeek: string; formattedFull: string; isProgrammed: boolean }[] = [];
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < totalDaysToGenerate; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;
      const dayOfWeek = daysOfWeek[d.getDay()];
      const formattedFull = `${dd}/${mm}/${yyyy} (${dayOfWeek})`;
      const isProgrammed = i < daysBetween;
      dates.push({ fullDate: dateStr, label, dayOfWeek, formattedFull, isProgrammed });
    }
    return dates;
  }, [activeCourse, trainingDaysCount]);

  // Calendar days grid calculation for Date Selection Modal
  const calendarDaysGrid = useMemo(() => {
    if (!activeCourse) return [];
    const year = calendarNavDate.getFullYear();
    const month = calendarNavDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDaysInMonth = lastDay.getDate();

    const startProg = parseLocalDate(activeCourse.dataInicio);
    const endProg = parseLocalDate(activeCourse.dataFim || activeCourse.dataInicio);
    startProg.setHours(0,0,0,0);
    endProg.setHours(23,59,59,999);

    const grid: ({ dateStr: string; dayNum: number; isProgrammed: boolean; isSelected: boolean } | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDateObj = new Date(year, month, d);
      const yyyy = curDateObj.getFullYear();
      const mm = String(curDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(curDateObj.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isProgrammed = curDateObj >= startProg && curDateObj <= endProg;
      const isSelected = dateStr === selectedBulkDateKey;

      grid.push({ dateStr, dayNum: d, isProgrammed, isSelected });
    }

    return grid;
  }, [calendarNavDate, activeCourse, selectedBulkDateKey]);

  const handleCalendarDayClick = (dateStr: string, isProgrammed: boolean) => {
    if (isProgrammed) {
      setSelectedBulkDateKey(dateStr);
      setIsDateCalendarOpen(false);
    } else {
      setPendingExtensionDate(dateStr);
    }
  };

  const confirmExtensionAndSelectDate = (dateStr: string) => {
    if (!activeCourse) return;
    const currentEnd = parseLocalDate(activeCourse.dataFim || activeCourse.dataInicio);
    const selectedDateObj = parseLocalDate(dateStr);

    let newEndStr = activeCourse.dataFim;
    if (selectedDateObj > currentEnd) {
      const yyyy = selectedDateObj.getFullYear();
      const mm = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDateObj.getDate()).padStart(2, '0');
      newEndStr = `${yyyy}-${mm}-${dd}`;
    }

    const updated = {
      ...activeCourse,
      dataFim: newEndStr
    };
    setActiveCourse(updated);
    updateFrequenciaNota(activeCourse.id, { dataFim: newEndStr });

    const start = parseLocalDate(activeCourse.dataInicio);
    const newDaysBetween = Math.max(1, Math.round((parseLocalDate(newEndStr).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setTrainingDaysCount(newDaysBetween);

    setSelectedBulkDateKey(dateStr);
    setPendingExtensionDate(null);
    setIsDateCalendarOpen(false);
  };

  const handleAddXDaysToCourse = (extraDays: number) => {
    if (!activeCourse || extraDays <= 0) return;
    const currentEnd = parseLocalDate(activeCourse.dataFim || activeCourse.dataInicio);
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + extraDays);
    const yyyy = newEnd.getFullYear();
    const mm = String(newEnd.getMonth() + 1).padStart(2, '0');
    const dd = String(newEnd.getDate()).padStart(2, '0');
    const newEndStr = `${yyyy}-${mm}-${dd}`;

    const updated = {
      ...activeCourse,
      dataFim: newEndStr
    };

    setActiveCourse(updated);
    updateFrequenciaNota(activeCourse.id, { dataFim: newEndStr });

    const start = parseLocalDate(activeCourse.dataInicio);
    const newDaysBetween = Math.max(1, Math.round((newEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setTrainingDaysCount(newDaysBetween);
  };

  const visibleDates = useMemo(() => {
    return generatedDates.slice(dateOffsetIndex, dateOffsetIndex + 10);
  }, [generatedDates, dateOffsetIndex]);

  const handleOpenCourseDetails = (course: ItemFrequenciaNota) => {
    setActiveCourse(course);
    setEditingAlunos([...course.alunos]);
    setEditingRowId(null);
    setIsEditingAllRows(false);
    setIsPresencaGridOpen(false);
    setDateOffsetIndex(0);

    const start = parseLocalDate(course.dataInicio);
    const end = parseLocalDate(course.dataFim || course.dataInicio);
    const numDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setTrainingDaysCount(numDays);

    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const startKey = `${yyyy}-${mm}-${dd}`;
    setSelectedBulkDateKey(startKey);
    setCalendarNavDate(start);
  };

  const handleOpenEditCourseMetadata = (course: ItemFrequenciaNota) => {
    setEditingCourseMetadata(course);
    const opsText = course.alunos.map(a => `${a.matDP || ''}\t${a.loginBB || ''}\t${a.nome}`).join('\n');
    setEditCourseForm({
      treinamento: course.treinamento,
      tipo: course.tipo,
      multiplicador: course.multiplicador,
      horarioTreinamento: course.horarioTreinamento || '14:00 às 20:20',
      salaId: course.salaId || '',
      salaNome: course.salaNome || '',
      dataInicio: course.dataInicio || '',
      dataFim: course.dataFim || '',
      listaOperadoresText: opsText
    });
  };

  const handleSaveCourseMetadata = () => {
    if (!editingCourseMetadata) return;

    const lines = editCourseForm.listaOperadoresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    let updatedAlunos = editingCourseMetadata.alunos;
    if (lines.length > 0) {
      updatedAlunos = lines.map((line, idx) => {
        let parsedMat = '';
        let parsedLogin = '';
        let parsedNome = '';

        const tabSplit = line.split('\t').map(s => s.trim()).filter(Boolean);
        if (tabSplit.length >= 3) {
          parsedMat = tabSplit[0];
          parsedLogin = tabSplit[1];
          parsedNome = tabSplit.slice(2).join(' ');
        } else if (tabSplit.length === 2) {
          parsedMat = tabSplit[0];
          parsedNome = tabSplit[1];
        } else {
          parsedNome = line;
        }

        const existing = editingCourseMetadata.alunos.find(a => 
          (parsedLogin && a.loginBB?.toUpperCase() === parsedLogin.toUpperCase()) ||
          (parsedMat && a.matDP?.toUpperCase() === parsedMat.toUpperCase()) ||
          (parsedNome && a.nome.toUpperCase() === parsedNome.toUpperCase())
        );

        if (existing) {
          return {
            ...existing,
            matDP: parsedMat || existing.matDP,
            loginBB: parsedLogin || existing.loginBB,
            nome: parsedNome || existing.nome
          };
        }

        return {
          id: `aln-${editingCourseMetadata.id}-${idx}`,
          matDP: parsedMat || 'N/A',
          loginBB: parsedLogin || 'N/A',
          nome: parsedNome || line,
          supervisor: 'N/A',
          gerente: 'N/A',
          celula: editingCourseMetadata.celulas[0] || 'GERAL',
          frequenciaPercent: 100,
          notaFinal: 10,
          statusAprovacao: 'Em Andamento'
        };
      });
    }

    const selectedSala = salas.find(s => s.id === editCourseForm.salaId);
    const finalSalaNome = editCourseForm.salaNome || selectedSala?.nome || '';

    updateFrequenciaNota(editingCourseMetadata.id, {
      treinamento: editCourseForm.treinamento,
      tipo: editCourseForm.tipo,
      multiplicador: editCourseForm.multiplicador,
      horarioTreinamento: editCourseForm.horarioTreinamento,
      salaId: editCourseForm.salaId || undefined,
      salaNome: finalSalaNome || undefined,
      dataInicio: editCourseForm.dataInicio,
      dataFim: editCourseForm.dataFim,
      alunos: updatedAlunos
    });

    setEditingCourseMetadata(null);
  };

  const handleAddOperatorRow = () => {
    const newId = `aln-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newStudent: AlunoFrequenciaNota = {
      id: newId,
      matDP: '',
      loginBB: '',
      nome: 'NOVO OPERADOR',
      supervisor: 'N/A',
      gerente: 'N/A',
      celula: activeCourse ? (activeCourse.celulas[0] || 'GERAL') : 'GERAL',
      frequenciaPercent: 100,
      notaFinal: 8.0,
      statusAprovacao: 'Aprovado',
      presencaDiaria: {}
    };
    setEditingAlunos(prev => [...prev, newStudent]);
    setEditingRowId(newId);
    setEditDraft({ matDP: '', loginBB: '', nome: 'NOVO OPERADOR' });
  };

  const handleStartEditRow = (aluno: AlunoFrequenciaNota) => {
    setEditingRowId(aluno.id);
    setEditDraft({
      matDP: aluno.matDP || '',
      loginBB: aluno.loginBB || '',
      nome: aluno.nome || ''
    });
  };

  const handleSaveRow = (id: string) => {
    setEditingAlunos(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          matDP: editDraft.matDP,
          loginBB: editDraft.loginBB,
          nome: editDraft.nome
        };
      }
      return a;
    }));
    setEditingRowId(null);
  };

  const handleCancelRowEdit = () => {
    setEditingRowId(null);
  };

  const handleUpdateStudent = (id: string, field: keyof AlunoFrequenciaNota, val: any) => {
    setEditingAlunos(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: val };
        const freq = typeof updated.frequenciaPercent === 'number' ? updated.frequenciaPercent : 0;
        const nota = typeof updated.notaFinal === 'number' ? updated.notaFinal : 0;
        if (freq >= 85 && nota >= 7.0) {
          updated.statusAprovacao = 'Aprovado';
        } else if (freq < 75 || nota < 5.0) {
          updated.statusAprovacao = 'Reprovado';
        } else {
          updated.statusAprovacao = 'Em Andamento';
        }
        return updated;
      }
      return a;
    }));
  };

  const handleUpdateDailyRecord = (
    alunoId: string, 
    dateKey: string, 
    field: 'frequencia' | 'horaExtra' | 'obs', 
    value: string
  ) => {
    setEditingAlunos(prev => prev.map(a => {
      if (a.id === alunoId) {
        const currentDiario = a.presencaDiaria || {};
        const updatedDiario = { ...currentDiario };
        const currentItem = currentDiario[dateKey] || { frequencia: '', horaExtra: '', obs: '' };
        const previousFreq = (currentItem.frequencia || '').toUpperCase();
        const normVal = value.toUpperCase();

        if (field === 'frequencia') {
          if (normVal === 'TO' || normVal === 'FINALIZADO') {
            const valToSet = normVal === 'TO' ? 'TO' : 'FINALIZADO';
            const startIndex = generatedDates.findIndex(d => d.fullDate === dateKey);
            if (startIndex !== -1) {
              for (let i = startIndex; i < generatedDates.length; i++) {
                const dKey = generatedDates[i].fullDate;
                const existing = updatedDiario[dKey] || { frequencia: '', horaExtra: '', obs: '' };
                updatedDiario[dKey] = { ...existing, frequencia: valToSet };
              }
            } else {
              updatedDiario[dateKey] = { ...currentItem, frequencia: valToSet };
            }
          } else if (
            (previousFreq === 'TO' && normVal !== 'TO') ||
            (previousFreq === 'FINALIZADO' && normVal !== 'FINALIZADO')
          ) {
            // User is removing or changing TO or FINALIZADO
            const startIndex = generatedDates.findIndex(d => d.fullDate === dateKey);
            if (startIndex !== -1) {
              // Update current dateKey to new value
              updatedDiario[dateKey] = { ...currentItem, frequencia: value };
              // Clear subsequent dates that were set to previousFreq
              for (let i = startIndex + 1; i < generatedDates.length; i++) {
                const dKey = generatedDates[i].fullDate;
                const existing = updatedDiario[dKey];
                if (existing && (existing.frequencia || '').toUpperCase() === previousFreq) {
                  updatedDiario[dKey] = { ...existing, frequencia: '' };
                }
              }
            } else {
              updatedDiario[dateKey] = { ...currentItem, frequencia: value };
            }
          } else {
            updatedDiario[dateKey] = { ...currentItem, [field]: value };
          }
        } else {
          updatedDiario[dateKey] = { ...currentItem, [field]: value };
        }

        const hasTO = Object.values(updatedDiario).some(item => (item.frequencia || '').toUpperCase() === 'TO');
        const hasFinalizado = Object.values(updatedDiario).some(item => (item.frequencia || '').toUpperCase() === 'FINALIZADO');

        // Recalculate frequency % (FI, FJ, TO, FINALIZADO do not count as present; TO & FINALIZADO excluded from active days)
        const entries = (Object.values(updatedDiario) as PresencaDiariaItem[]).filter(e => e.frequencia && e.frequencia !== '');
        const activeEntries = entries.filter(e => {
          const f = (e.frequencia || '').toUpperCase();
          return f !== 'FINALIZADO';
        });
        const totalDays = activeEntries.length;
        const presentDays = activeEntries.filter(e => {
          const f = (e.frequencia || '').toUpperCase();
          return f !== 'FI' && f !== 'FJ' && f !== 'TO';
        }).length;
        const newFreqPercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : a.frequenciaPercent;

        let status = a.statusAprovacao;
        if (hasTO) {
          status = 'Desligado (TO)' as any;
        } else if (hasFinalizado || (newFreqPercent >= 85 && a.notaFinal >= 7.0)) {
          status = a.notaFinal >= 5.0 ? 'Aprovado' : 'Reprovado';
        } else if (newFreqPercent < 75 || a.notaFinal < 5.0) {
          status = 'Reprovado';
        } else {
          status = 'Em Andamento';
        }

        return {
          ...a,
          presencaDiaria: updatedDiario,
          frequenciaPercent: newFreqPercent,
          statusAprovacao: status
        };
      }
      return a;
    }));
  };

  // Bulk Apply presence status to ALL operators for the selected date
  const handleBulkApplyPresence = (dateKey: string, status: string) => {
    if (!dateKey) return;
    setEditingAlunos(prev => prev.map(a => {
      const currentDiario = a.presencaDiaria || {};
      const updatedDiario = { ...currentDiario };
      const currentItem = currentDiario[dateKey] || { frequencia: '', horaExtra: '', obs: '' };
      const previousFreq = (currentItem.frequencia || '').toUpperCase();
      const normStatus = status.toUpperCase();

      if (normStatus === 'TO' || normStatus === 'FINALIZADO') {
        const valToSet = normStatus === 'TO' ? 'TO' : 'FINALIZADO';
        const startIndex = generatedDates.findIndex(d => d.fullDate === dateKey);
        if (startIndex !== -1) {
          for (let i = startIndex; i < generatedDates.length; i++) {
            const dKey = generatedDates[i].fullDate;
            const existing = updatedDiario[dKey] || { frequencia: '', horaExtra: '', obs: '' };
            updatedDiario[dKey] = { ...existing, frequencia: valToSet };
          }
        } else {
          updatedDiario[dateKey] = { ...currentItem, frequencia: valToSet };
        }
      } else if (
        (previousFreq === 'TO' && normStatus !== 'TO') ||
        (previousFreq === 'FINALIZADO' && normStatus !== 'FINALIZADO')
      ) {
        const startIndex = generatedDates.findIndex(d => d.fullDate === dateKey);
        if (startIndex !== -1) {
          updatedDiario[dateKey] = { ...currentItem, frequencia: status };
          for (let i = startIndex + 1; i < generatedDates.length; i++) {
            const dKey = generatedDates[i].fullDate;
            const existing = updatedDiario[dKey];
            if (existing && (existing.frequencia || '').toUpperCase() === previousFreq) {
              updatedDiario[dKey] = { ...existing, frequencia: '' };
            }
          }
        } else {
          updatedDiario[dateKey] = { ...currentItem, frequencia: status };
        }
      } else {
        updatedDiario[dateKey] = { ...currentItem, frequencia: status };
      }

      const hasTO = Object.values(updatedDiario).some(item => (item.frequencia || '').toUpperCase() === 'TO');
      const hasFinalizado = Object.values(updatedDiario).some(item => (item.frequencia || '').toUpperCase() === 'FINALIZADO');

      const entries = (Object.values(updatedDiario) as PresencaDiariaItem[]).filter(e => e.frequencia && e.frequencia !== '');
      const activeEntries = entries.filter(e => (e.frequencia || '').toUpperCase() !== 'FINALIZADO');
      const totalDays = activeEntries.length;
      const presentDays = activeEntries.filter(e => {
        const f = (e.frequencia || '').toUpperCase();
        return f !== 'FI' && f !== 'FJ' && f !== 'TO';
      }).length;
      const newFreqPercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : a.frequenciaPercent;

      let statusAp = a.statusAprovacao;
      if (hasTO) {
        statusAp = 'Desligado (TO)' as any;
      } else if (hasFinalizado || (newFreqPercent >= 85 && a.notaFinal >= 7.0)) {
        statusAp = a.notaFinal >= 5.0 ? 'Aprovado' : 'Reprovado';
      } else if (newFreqPercent < 75 || a.notaFinal < 5.0) {
        statusAp = 'Reprovado';
      } else {
        statusAp = 'Em Andamento';
      }

      return {
        ...a,
        presencaDiaria: updatedDiario,
        frequenciaPercent: newFreqPercent,
        statusAprovacao: statusAp
      };
    }));
  };

  const handleBulkApplyHoraExtra = (dateKey: string, horaExtra: string) => {
    if (!dateKey) return;
    setEditingAlunos(prev => prev.map(a => {
      const currentDiario = a.presencaDiaria || {};
      const currentItem = currentDiario[dateKey] || { frequencia: '', horaExtra: '', obs: '' };
      const updatedItem = { ...currentItem, horaExtra };
      return {
        ...a,
        presencaDiaria: { ...currentDiario, [dateKey]: updatedItem }
      };
    }));
  };

  const handleBulkApplyObs = (dateKey: string, obs: string) => {
    if (!dateKey) return;
    setEditingAlunos(prev => prev.map(a => {
      const currentDiario = a.presencaDiaria || {};
      const currentItem = currentDiario[dateKey] || { frequencia: '', horaExtra: '', obs: '' };
      const updatedItem = { ...currentItem, obs };
      return {
        ...a,
        presencaDiaria: { ...currentDiario, [dateKey]: updatedItem }
      };
    }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'P': return 'bg-emerald-600 text-white font-black';
      case 'FI': return 'bg-rose-600 text-white font-black';
      case 'FJ': return 'bg-amber-600 text-white font-black';
      case 'DRS': return 'bg-slate-600 text-white font-black';
      case 'BH': return 'bg-slate-700 text-white font-black';
      case 'DAY OFF': return 'bg-yellow-500 text-slate-900 font-black';
      case 'FERIADO': return 'bg-purple-600 text-white font-black';
      case 'FINALIZADO':
      case 'Finalizado': return 'bg-indigo-600 text-white font-black';
      case 'A': return 'bg-blue-600 text-white font-black';
      case 'TO': return 'bg-slate-700 text-amber-300 font-black border border-amber-500/40';
      default: return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-bold border border-slate-300 dark:border-slate-700';
    }
  };

  // Handler for Lançar Nota (calculates media final on 0-10 scale)
  const handleSaveLancarNota = () => {
    setEditingAlunos(prev => prev.map(aluno => {
      const notaDigitada = notaInputMap[aluno.id];
      if (typeof notaDigitada === 'number' && !isNaN(notaDigitada)) {
        const novaNotaFinal = Math.round(((aluno.notaFinal + notaDigitada) / 2) * 10) / 10;
        const freq = aluno.frequenciaPercent;
        let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
        if (freq < 75 || novaNotaFinal < 5.0) status = 'Reprovado';
        else if (freq < 85 || novaNotaFinal < 7.0) status = 'Em Andamento';

        const novasProvas = [...(aluno.provas || [])];
        novasProvas.push({
          id: `prv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          nomeProva: nomeProvaInput || 'Avaliação',
          dataProva: dataProvaInput ? new Date(dataProvaInput).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          nota: notaDigitada
        });

        return {
          ...aluno,
          notaFinal: novaNotaFinal,
          statusAprovacao: status,
          provas: novasProvas
        };
      }
      return aluno;
    }));
    setIsLancarNotaOpen(false);
    setNotaInputMap({});
  };

  const handleUpdateProvasFromModal = (alunoId: string, novasProvas: ItemProvaNota[], novaNotaFinal: number) => {
    setEditingAlunos(prev => prev.map(a => {
      if (a.id === alunoId) {
        const freq = a.frequenciaPercent;
        let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
        if (freq < 75 || novaNotaFinal < 5.0) status = 'Reprovado';
        else if (freq < 85 || novaNotaFinal < 7.0) status = 'Em Andamento';

        return {
          ...a,
          provas: novasProvas,
          notaFinal: novaNotaFinal,
          statusAprovacao: status
        };
      }
      return a;
    }));

    // If viewing outside active course, update course state directly
    if (selectedAlunoNotas && selectedAlunoNotas.course) {
      const targetCourse = items.find(c => c.id === selectedAlunoNotas.course.id);
      if (targetCourse) {
        const updatedAlunos = targetCourse.alunos.map(a => {
          if (a.id === alunoId) {
            const freq = a.frequenciaPercent;
            let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
            if (freq < 75 || novaNotaFinal < 5.0) status = 'Reprovado';
            else if (freq < 85 || novaNotaFinal < 7.0) status = 'Em Andamento';
            return {
              ...a,
              provas: novasProvas,
              notaFinal: novaNotaFinal,
              statusAprovacao: status
            };
          }
          return a;
        });
        updateFrequenciaNota(targetCourse.id, { alunos: updatedAlunos });
      }
    }
  };

  const handleSaveCourseChanges = () => {
    if (!activeCourse) return;
    updateFrequenciaNota(activeCourse.id, {
      alunos: editingAlunos
    });
    setActiveCourse(null);
  };

  const handleSaveDossie = (alunoId: string, dossie: DossieOperador) => {
    setEditingAlunos(prev => prev.map(a => a.id === alunoId ? { ...a, dossie } : a));
    
    if (selectedAlunoDossie) {
      const targetCourseId = selectedAlunoDossie.course.id;
      const targetCourse = items.find(c => c.id === targetCourseId);
      if (targetCourse) {
        const updatedAlunos = targetCourse.alunos.map(a => a.id === alunoId ? { ...a, dossie } : a);
        updateFrequenciaNota(targetCourse.id, { alunos: updatedAlunos });
      }
      setSelectedAlunoDossie(prev => prev ? { ...prev, aluno: { ...prev.aluno, dossie } } : null);
    }
  };

  const handleExportCSV = (course: ItemFrequenciaNota) => {
    handleExportExcelDossie(course);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-indigo-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600/50 rounded-xl border border-indigo-400/30 backdrop-blur-xs">
            <GraduationCap className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Frequências e Notas</h1>
            <p className="text-xs text-indigo-200 mt-0.5">
              Gestão de presença, avaliações e boletins dos programas de Sinergia, Migração e Novatos
            </p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Turmas Ativas</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalCursos}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Alunos</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalAlunos}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Média Frequência</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.mediaFreq}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Média de Notas</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.mediaNota} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Aprovação</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {stats.taxaAprovacao}%
          </div>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative min-w-56 flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por curso, multiplicador ou célula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Programa:</span>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="todos">Todos os Programas</option>
              <option value="Novatos">Novatos</option>
              <option value="Sinergia">Sinergia</option>
              <option value="Migração">Migração</option>
              <option value="Retorno LMG">Retorno LMG</option>
            </select>
          </div>

          {/* MONTH PICKLIST */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
            >
              <option value="TODOS">TODOS OS MESES</option>
              <option value="1">Janeiro (01)</option>
              <option value="2">Fevereiro (02)</option>
              <option value="3">Março (03)</option>
              <option value="4">Abril (04)</option>
              <option value="5">Maio (05)</option>
              <option value="6">Junho (06)</option>
              <option value="7">Julho (07)</option>
              <option value="8">Agosto (08)</option>
              <option value="9">Setembro (09)</option>
              <option value="10">Outubro (10)</option>
              <option value="11">Novembro (11)</option>
              <option value="12">Dezembro (12)</option>
            </select>
          </div>

          {/* YEAR PICKLIST */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
            >
              <option value="TODOS">TODOS OS ANOS</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* COURSES LIST CARDS */}
      <div className="space-y-3">
        {filteredItems.map(course => {
          const totalAlunos = course.alunos.length;
          const aprovados = course.alunos.filter(a => a.statusAprovacao === 'Aprovado').length;
          const reprovados = course.alunos.filter(a => a.statusAprovacao === 'Reprovado').length;
          const avgNota = totalAlunos > 0 ? (course.alunos.reduce((a, b) => a + b.notaFinal, 0) / totalAlunos).toFixed(1) : '0';
          const avgFreq = totalAlunos > 0 ? Math.round(course.alunos.reduce((a, b) => a + b.frequenciaPercent, 0) / totalAlunos) : 0;

          return (
            <div 
              key={course.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                {/* Top Row: Badges on Left, Fixed Buttons on Right */}
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                      course.tipo === 'Novatos' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                      course.tipo === 'Sinergia' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {course.tipo}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0">{course.id}</span>
                    {isItemPendingSync(course.id) && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-1 shrink-0" title="Salvo localmente na máquina, pendente de sincronizar no Firestore">
                        <CloudOff className="w-2.5 h-2.5" />
                        <span>Pendente</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleExportExcelDossie(course)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
                      title="Exportar planilha Excel completa com Dossiê dos Operadores, Frequências e Notas"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">Dossiê</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCourseDetails(course)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
                    >
                      <FileCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">Lançar Frequências e Notas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditCourseMetadata(course)}
                      className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Editar Informações do Treinamento (Multiplicador, Operadores, Horário, Sala)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingCourseId(course.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Excluir este programa/turma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                  {course.treinamento}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Células: <strong>{course.celulas.join(', ')}</strong></span>
                  <span>•</span>
                  <span>Multiplicador: <strong>{course.multiplicador}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>Horário: <strong>{course.horarioTreinamento || '14:00 às 20:20'}</strong></span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center space-x-1">
                    <DoorOpen className="w-3 h-3 text-emerald-500" />
                    <span>Sala: <strong>{course.salaNome || 'Sala de Treinamento'}</strong></span>
                  </span>
                  <span>•</span>
                  <span>Período: <strong>{course.dataInicio} à {course.dataFim}</strong></span>
                </div>
              </div>

              {/* COURSE QUICK METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Convocados</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalAlunos} Operadores</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Média de Frequência</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{avgFreq}% Frequência</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Média Nota Prova</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{avgNota} pts</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Aprovados / Reprovados</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-600">{aprovados} Ap.</span> / <span className="text-rose-600">{reprovados} Rep.</span>
                  </span>
                </div>
              </div>

            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-sm">Nenhum programa de Novatos, Sinergia ou Migração encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">Ao cadastrar uma Nova Demanda nestes tipos, os lançamentos de notas aparecerão aqui.</p>
          </div>
        )}
      </div>

      {/* EDIT COURSE FREQUENCY AND GRADES MODAL */}
      {activeCourse && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* STICKY TOP HEADER & BULK CONTROL BAR */}
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 pt-1 pb-3 space-y-3 border-b border-slate-200 dark:border-slate-800 -mx-6 px-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Boletim de Frequência & Notas • {activeCourse.tipo}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {activeCourse.treinamento}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Data de Início oficial: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeCourse.dataInicio}</strong> • Término: {activeCourse.dataFim} {activeCourse.horarioTreinamento ? `• Horário: ${activeCourse.horarioTreinamento}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAllRows(prev => !prev)}
                    className={`p-2 rounded-xl transition-colors shadow-2xs cursor-pointer ${
                      isEditingAllRows 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={isEditingAllRows ? "Concluir edição de todas as linhas" : "Editar todas as linhas de operadores"}
                  >
                    {isEditingAllRows ? <CheckCircle2 className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPresencaGridOpen(prev => !prev)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    title="Abrir/fechar lançamento de presença diária"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isPresencaGridOpen ? 'Ocultar Lançamento Diário' : 'Lançar Presença Diária'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLancarNotaOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Lançar Prova / Nota</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer opacity-90"
                    title="Rastreabilidade (Recurso em breve)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                    <span>Rastreabilidade</span>
                  </button>

                  <button
                    onClick={() => setActiveCourse(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SOBER ELEGANT DAILY PRESENCE ENTRY & BULK FILL BAR */}
              {isPresencaGridOpen && (
                <div className="bg-slate-800 dark:bg-slate-850 rounded-xl p-3 text-white shadow-sm border border-slate-700/80 space-y-2.5">
                  
                  {/* TOP CONTROL BAR: DATE SELECTOR & BULK FILL BUTTON */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-700/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Data do Lançamento:</span>
                      </span>

                      {/* Small Calendar trigger button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBulkDateKey) {
                            setCalendarNavDate(parseLocalDate(selectedBulkDateKey));
                          } else if (activeCourse) {
                            setCalendarNavDate(parseLocalDate(activeCourse.dataInicio));
                          }
                          setIsDateCalendarOpen(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                      >
                        <span>{generatedDates.find(d => d.fullDate === selectedBulkDateKey)?.formattedFull || selectedBulkDateKey}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
                        para todos:
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'P')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar Presença (P) para TODOS"
                        >
                          Presença
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'FI')}
                          className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar Falta Injustificada (FI) para todos"
                        >
                          FI
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'FJ')}
                          className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar Falta Justificada (FJ) para todos"
                        >
                          FJ
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'DRS')}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar DSR para todos"
                        >
                          DSR
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'BH')}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar Banco de Horas (BH) para todos"
                        >
                          BH
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkApplyPresence(selectedBulkDateKey, 'FERIADO')}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Marcar Feriado para todos"
                        >
                          Feriado
                        </button>
                      </div>
                    </div>

                    {/* MODE SWITCHER (POR DIA / TODO O PERÍODO) WITH EXTENSION INPUT */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {presenceViewMode === 'matriz' && (
                        <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 mr-1">
                          <span className="text-[10px] text-slate-300 font-bold">Prorrogar:</span>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={customXDaysInput}
                            onChange={(e) => setCustomXDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs font-bold text-white"
                            title="Digite quantos dias a mais deseja prorrogar"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddXDaysToCourse(customXDaysInput)}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            title={`Adicionar +${customXDaysInput} dias ao treinamento`}
                          >
                            + {customXDaysInput}d
                          </button>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-300 font-medium">Visualização:</span>
                      <button
                        type="button"
                        onClick={() => setPresenceViewMode('lote')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          presenceViewMode === 'lote' ? 'bg-slate-700 text-white shadow-2xs' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Por dia
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresenceViewMode('matriz')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          presenceViewMode === 'matriz' ? 'bg-slate-700 text-white shadow-2xs' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Todo o Período
                      </button>
                    </div>
                  </div>

                  {/* BULK HORA EXTRA & OBS INPUTS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/90 p-2 rounded-lg border border-slate-700/80">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-300">Hora Extra em Lote:</span>
                        <input
                          type="text"
                          placeholder="Ex: 01:00"
                          value={bulkHoraExtraInput}
                          onChange={(e) => setBulkHoraExtraInput(e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-white font-mono text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleBulkApplyHoraExtra(selectedBulkDateKey, bulkHoraExtraInput)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-md transition-colors"
                        >
                          Aplicar HE
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-300">Obs em Lote:</span>
                        <input
                          type="text"
                          placeholder="Liberação antecipada"
                          value={bulkObsInput}
                          onChange={(e) => setBulkObsInput(e.target.value)}
                          className="w-44 px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-white text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleBulkApplyObs(selectedBulkDateKey, bulkObsInput)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-md transition-colors"
                        >
                          Aplicar Obs
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* STUDENTS LIST TABLE */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto min-h-[250px]">
              <table className="w-full text-left text-[10px] whitespace-nowrap">
                <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-r border-slate-700 w-28">MATRÍCULA DP</th>
                    <th className="p-2 border-r border-slate-700 w-28">LOGIN BB</th>
                    <th className="p-2 border-r border-slate-700 min-w-[200px]">NOME OPERADOR</th>

                    {/* IF PRESENCE OPEN IN LOTE MODE: DISPLAY SPECIFIC SELECTED DATE COLUMNS */}
                    {isPresencaGridOpen && presenceViewMode === 'lote' && (
                      <>
                        <th className="p-2 text-center border-r border-slate-700 bg-indigo-900 text-amber-300 min-w-[220px]">
                          FREQUÊNCIA NO DIA ({generatedDates.find(d => d.fullDate === selectedBulkDateKey)?.label || 'HOJE'})
                        </th>
                        <th className="p-2 text-center border-r border-slate-700 w-24">HORA EXTRA</th>
                        <th className="p-2 border-r border-slate-700 min-w-[140px]">OBS. DO DIA</th>
                      </>
                    )}

                    {/* IF PRESENCE OPEN IN MATRIZ MODE (TODO O PERÍODO): DISPLAY ALL GENERATED DATE HEADERS */}
                    {isPresencaGridOpen && presenceViewMode === 'matriz' && (
                      generatedDates.map(d => (
                        <th key={`hdr-${d.fullDate}`} className="p-1 text-center border-r border-slate-700 min-w-[55px] bg-slate-900 text-amber-300">
                          <div>{d.label}</div>
                          <div className="text-[8px] font-normal text-slate-400">{d.dayOfWeek}</div>
                        </th>
                      ))
                    )}

                    {!isPresencaGridOpen && (
                      <th className="p-2 border-r border-slate-700 min-w-[150px]">OBSERVAÇÃO GERAL</th>
                    )}

                    <th className="p-2 text-center border-r border-slate-700 w-28">FREQUÊNCIA (%)</th>
                    <th className="p-2 text-center border-r border-slate-700 w-36">MÉDIA DAS NOTAS (0-10)</th>
                    <th className="p-2 text-center border-r border-slate-700 w-28">STATUS APROVAÇÃO</th>
                    <th className="p-2 text-center w-28">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                  {editingAlunos.map((aluno) => {
                    const isEditing = editingRowId === aluno.id;

                    let displayLogin = aluno.loginBB || '';
                    let displayMat = aluno.matDP || '';
                    if (displayMat.toUpperCase().startsWith('C') && !displayLogin.toUpperCase().startsWith('C')) {
                      const tmp = displayLogin;
                      displayLogin = displayMat;
                      displayMat = tmp;
                    }

                    const currentDiarioItem = aluno.presencaDiaria?.[selectedBulkDateKey] || { frequencia: '', horaExtra: '', obs: '' };

                    return (
                      <tr key={aluno.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50">
                        {/* MATRÍCULA DP */}
                        <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                          {isEditingAllRows || isEditing ? (
                            <input
                              type="text"
                              value={aluno.matDP || ''}
                              onChange={(e) => handleUpdateStudent(aluno.id, 'matDP', e.target.value)}
                              className="w-full px-1.5 py-1 border border-indigo-400 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-hidden"
                              placeholder="Matrícula"
                            />
                          ) : (
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              {displayMat || 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* LOGIN BB */}
                        <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                          {isEditingAllRows || isEditing ? (
                            <input
                              type="text"
                              value={aluno.loginBB || ''}
                              onChange={(e) => handleUpdateStudent(aluno.id, 'loginBB', e.target.value)}
                              className="w-full px-1.5 py-1 border border-indigo-400 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold focus:outline-hidden"
                              placeholder="Login BB"
                            />
                          ) : (
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                              {displayLogin || 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* NOME OPERADOR */}
                        <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                          {isEditingAllRows || isEditing ? (
                            <input
                              type="text"
                              value={aluno.nome || ''}
                              onChange={(e) => handleUpdateStudent(aluno.id, 'nome', e.target.value)}
                              className="w-full px-1.5 py-1 border border-indigo-400 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden"
                              placeholder="Nome do Operador"
                            />
                          ) : (
                            <span className="font-bold text-slate-900 dark:text-white">
                              {aluno.nome}
                            </span>
                          )}
                        </td>

                        {/* MODE 1: LOTE (FOCUSED SINGLE-DATE COLUMNS FOR EASY TOGGLING) */}
                        {isPresencaGridOpen && presenceViewMode === 'lote' && (
                          <>
                            {/* FREQUÊNCIA PILLS */}
                            <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', 'P')}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${
                                    currentDiarioItem.frequencia === 'P' 
                                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-100'
                                  }`}
                                  title="Presente"
                                >
                                  P
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', 'FI')}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${
                                    currentDiarioItem.frequencia === 'FI' 
                                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-rose-100'
                                  }`}
                                  title="Falta Injustificada"
                                >
                                  FI
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', 'FJ')}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${
                                    currentDiarioItem.frequencia === 'FJ' 
                                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-100'
                                  }`}
                                  title="Falta Justificada"
                                >
                                  FJ
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', 'DRS')}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${
                                    currentDiarioItem.frequencia === 'DRS' || currentDiarioItem.frequencia === 'DSR'
                                      ? 'bg-slate-700 text-white shadow-xs ring-2 ring-slate-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                  title="DSR / Descanso Semanal Remunerado"
                                >
                                  DSR
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', 'BH')}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${
                                    currentDiarioItem.frequencia === 'BH' 
                                      ? 'bg-slate-700 text-white shadow-xs ring-2 ring-slate-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                  title="Banco de Horas"
                                >
                                  BH
                                </button>

                                <select
                                  value={currentDiarioItem.frequencia || ''}
                                  onChange={(e) => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'frequencia', e.target.value)}
                                  className="py-1 px-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                >
                                  <option value="">Mais...</option>
                                  <option value="DAY OFF">DAY OFF (Aniversário)</option>
                                  <option value="TO">TO</option>
                                  <option value="FINALIZADO">Finalizado</option>
                                </select>
                              </div>
                            </td>

                            {/* HORA EXTRA */}
                            <td className="p-1 border-r border-slate-100 dark:border-slate-800">
                              <input
                                type="text"
                                placeholder="00:00"
                                value={currentDiarioItem.horaExtra || ''}
                                onChange={(e) => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'horaExtra', e.target.value)}
                                className="w-full text-center py-1 px-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px] focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>

                            {/* OBSERVAÇÃO DO DIA */}
                            <td className="p-1 border-r border-slate-100 dark:border-slate-800">
                              <input
                                type="text"
                                placeholder="Obs do dia..."
                                value={currentDiarioItem.obs || ''}
                                onChange={(e) => handleUpdateDailyRecord(aluno.id, selectedBulkDateKey, 'obs', e.target.value)}
                                className="w-full py-1 px-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-normal focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                          </>
                        )}

                        {/* MODE 2: MATRIZ (TODO O PERÍODO: EXIBE TODOS OS DIAS DO TREINAMENTO) */}
                        {isPresencaGridOpen && presenceViewMode === 'matriz' && (
                          generatedDates.map(d => {
                            const item = aluno.presencaDiaria?.[d.fullDate] || { frequencia: '', horaExtra: '', obs: '' };
                            return (
                              <td key={`mat-${d.fullDate}`} className="p-1 text-center border-r border-slate-100 dark:border-slate-800">
                                <select
                                  value={item.frequencia || ''}
                                  onChange={(e) => handleUpdateDailyRecord(aluno.id, d.fullDate, 'frequencia', e.target.value)}
                                  className={`w-full py-1 text-center font-black rounded border-0 text-[10px] cursor-pointer focus:outline-none ${getStatusStyle(item.frequencia || '')}`}
                                >
                                  <option value="" className="bg-white text-slate-400 font-bold">-</option>
                                  <option value="P" className="bg-white text-slate-900 font-bold">P</option>
                                  <option value="FI" className="bg-white text-rose-700 font-bold">FI</option>
                                  <option value="FJ" className="bg-white text-amber-700 font-bold">FJ</option>
                                  <option value="DRS" className="bg-white text-slate-700 font-bold">DSR</option>
                                  <option value="BH" className="bg-white text-slate-700 font-bold">BH</option>
                                  <option value="DAY OFF" className="bg-white text-slate-700 font-bold">DAY OFF</option>
                                  <option value="FERIADO" className="bg-white text-purple-700 font-bold">FERIADO</option>
                                  <option value="TO" className="bg-white text-amber-700 font-bold">TO</option>
                                  <option value="FINALIZADO" className="bg-white text-indigo-700 font-bold">FINALIZADO</option>
                                </select>
                              </td>
                            );
                          })
                        )}

                        {!isPresencaGridOpen && (
                          <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              value={aluno.observacoes || ''}
                              onChange={(e) => handleUpdateStudent(aluno.id, 'observacoes', e.target.value)}
                              placeholder="Observação..."
                              className="w-full px-2 py-0.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded bg-transparent text-slate-800 dark:text-slate-200 text-[11px] font-medium outline-none"
                            />
                          </td>
                        )}

                        {/* FREQUÊNCIA (%) - CLICK TO OPEN MINI-CALENDAR MODAL */}
                        <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setSelectedAlunoCalendar({ aluno, course: activeCourse })}
                            className="font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer text-[11px] flex items-center justify-center space-x-1 mx-auto"
                            title="Clique para ver o Calendário de Presenças completo"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{aluno.frequenciaPercent}%</span>
                          </button>
                        </td>

                        {/* MÉDIA DAS NOTAS (0-10) - CLICK TO OPEN EVALUATIONS MODAL */}
                        <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setSelectedAlunoNotas({ aluno, course: activeCourse })}
                            className="font-mono font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer text-[11px] flex items-center justify-center space-x-1 mx-auto"
                            title="Clique para ver o Histórico de Provas e Avaliações"
                          >
                            <Award className="w-3 h-3 text-amber-500" />
                            <span>{aluno.notaFinal}</span>
                          </button>
                        </td>

                        {/* STATUS APROVAÇÃO */}
                        <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aluno.statusAprovacao === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            aluno.statusAprovacao === 'Reprovado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {aluno.statusAprovacao}
                          </span>
                        </td>

                        {/* AÇÃO */}
                        <td className="p-1 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              type="button"
                              onClick={() => setSelectedAlunoDossie({ aluno, course: activeCourse })}
                              className="flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded transition-colors text-[10px] font-extrabold shadow-2xs"
                              title="Abrir / Preencher Dossiê do Colaborador (Foto, Vivências em Sala, Avaliações)"
                            >
                              <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Dossiê</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingAlunos(prev => prev.filter(a => a.id !== aluno.id))}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                              title="Remover operador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {editingAlunos.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-400">
                        Nenhum operador cadastrado nesta turma.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCourse(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCourseChanges}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Salvar Boletim
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LANÇAR NOTA MODAL */}
      {isLancarNotaOpen && activeCourse && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Lançar Nota de Avaliação / Prova (Escala 0 a 10)
              </h3>
              <button onClick={() => setIsLancarNotaOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Identificação da Prova:</label>
                <input
                  type="text"
                  placeholder="Ex: Nº Prova 1"
                  value={nomeProvaInput}
                  onChange={(e) => setNomeProvaInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data da Prova:</label>
                <input
                  type="date"
                  value={dataProvaInput}
                  onChange={(e) => setDataProvaInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lançar Nota dos Operadores (Nota de 0 a 10. A Média será recalculada na tabela):
              </p>
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {editingAlunos.map(aluno => (
                  <div key={aluno.id} className="flex items-center justify-between p-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{aluno.nome}</p>
                      <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{aluno.loginBB} ({aluno.matDP})</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">Nota (0-10):</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="0.0 - 10.0"
                        value={notaInputMap[aluno.id] !== undefined ? notaInputMap[aluno.id] : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNotaInputMap(prev => ({
                            ...prev,
                            [aluno.id]: isNaN(val) ? 0 : val
                          }));
                        }}
                        className="w-24 p-1 border border-slate-300 dark:border-slate-700 rounded text-center font-mono font-bold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLancarNotaOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveLancarNota}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Calcular e Lançar Média
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MINI CALENDAR MODAL */}
      <AlunoPresencaCalendarModal
        isOpen={selectedAlunoCalendar !== null}
        onClose={() => setSelectedAlunoCalendar(null)}
        aluno={selectedAlunoCalendar?.aluno || null}
        treinamentoNome={selectedAlunoCalendar?.course.treinamento || ''}
        dataInicio={selectedAlunoCalendar?.course.dataInicio}
        dataFim={selectedAlunoCalendar?.course.dataFim}
        onUpdateDailyStatus={(alunoId, dateKey, status) => {
          handleUpdateDailyRecord(alunoId, dateKey, 'frequencia', status);
          if (selectedAlunoCalendar) {
            setSelectedAlunoCalendar(prev => prev ? {
              ...prev,
              aluno: {
                ...prev.aluno,
                presencaDiaria: {
                  ...(prev.aluno.presencaDiaria || {}),
                  [dateKey]: {
                    ...(prev.aluno.presencaDiaria?.[dateKey] || { frequencia: '', horaExtra: '', obs: '' }),
                    frequencia: status
                  }
                }
              }
            } : null);
          }
        }}
      />

      {/* STUDENT EVALUATIONS MODAL */}
      <AlunoNotasModal
        isOpen={selectedAlunoNotas !== null}
        onClose={() => setSelectedAlunoNotas(null)}
        aluno={selectedAlunoNotas?.aluno || null}
        onUpdateProvas={handleUpdateProvasFromModal}
      />

      {/* STUDENT DOSSIÊ MODAL */}
      {selectedAlunoDossie && selectedAlunoDossie.aluno && (
        <AlunoDossieModal
          aluno={selectedAlunoDossie.aluno}
          nomeTreinamento={selectedAlunoDossie.course.treinamento}
          onClose={() => setSelectedAlunoDossie(null)}
          onSaveDossie={handleSaveDossie}
        />
      )}

      {/* MODAL PARA EDITAR INFORMAÇÕES DO TREINAMENTO (Pencil Icon) */}
      {editingCourseMetadata && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Editar Informações do Treinamento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourseMetadata(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nome do Treinamento:
                </label>
                <input
                  type="text"
                  value={editCourseForm.treinamento}
                  onChange={(e) => setEditCourseForm(prev => ({ ...prev, treinamento: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Multiplicador:
                  </label>
                  <select
                    value={editCourseForm.multiplicador}
                    onChange={(e) => setEditCourseForm(prev => ({ ...prev, multiplicador: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                  >
                    <option value="">Selecione o Multiplicador...</option>
                    {multiplicadores.map(m => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Horário do Treinamento:
                  </label>
                  <input
                    type="text"
                    value={editCourseForm.horarioTreinamento}
                    onChange={(e) => setEditCourseForm(prev => ({ ...prev, horarioTreinamento: e.target.value }))}
                    placeholder="Ex: 14:00 às 20:20"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Sala de Treinamento:
                  </label>
                  <select
                    value={editCourseForm.salaId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const found = salas.find(s => s.id === id);
                      setEditCourseForm(prev => ({ ...prev, salaId: id, salaNome: found ? found.nome : prev.salaNome }));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                  >
                    <option value="">Selecione a Sala...</option>
                    {salas.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} ({s.capacidade} lug.)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Data Início:
                  </label>
                  <input
                    type="date"
                    value={editCourseForm.dataInicio}
                    onChange={(e) => setEditCourseForm(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Data Término:
                  </label>
                  <input
                    type="date"
                    value={editCourseForm.dataFim}
                    onChange={(e) => setEditCourseForm(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Lista de Operadores (Um por linha - Matrícula | Login BB | Nome):
                </label>
                <textarea
                  rows={4}
                  value={editCourseForm.listaOperadoresText}
                  onChange={(e) => setEditCourseForm(prev => ({ ...prev, listaOperadoresText: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="Ex: 52792&#9;C1234567&#9;HIGOR COUTINHO DE OLIVEIRA"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingCourseMetadata(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCourseMetadata}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETE COURSE */}
      <PasswordConfirmModal
        isOpen={deletingCourseId !== null}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={() => {
          if (deletingCourseId) {
            deleteFrequenciaNota(deletingCourseId);
            setDeletingCourseId(null);
          }
        }}
        title="Confirmar Exclusão de Turma / Programa"
        itemDescription="esta turma de Frequência e Notas"
      />

      {/* SMALL CALENDAR MODAL FOR DATE SELECTION */}
      {isDateCalendarOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-4 space-y-3 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Data do Lançamento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDateCalendarOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Período programado: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeCourse.dataInicio} à {activeCourse.dataFim}</strong>.
            </p>

            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCalendarNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 capitalize">
                {calendarNavDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => setCalendarNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 text-center gap-1 text-[10px] font-bold text-slate-400 pb-1">
              <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDaysGrid.map((dayItem, idx) => {
                if (!dayItem) {
                  return <div key={`blank-${idx}`} />;
                }
                const { dateStr, dayNum, isProgrammed, isSelected } = dayItem;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleCalendarDayClick(dateStr, isProgrammed)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 font-extrabold scale-105'
                        : isProgrammed 
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 hover:border-amber-300 border border-transparent'
                    }`}
                  >
                    <span>{dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span>Programado</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                <span>Clique para prorrogar</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXTENSION DIALOG */}
      {pendingExtensionDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prorrogar Treinamento?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicionar mais um dia de treinamento
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              A data selecionada está fora do período programado original do treinamento. Deseja adicionar este dia extra e prorrogar o treinamento?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPendingExtensionDate(null)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmExtensionAndSelectDate(pendingExtensionDate)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Confirmar e Lançar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
