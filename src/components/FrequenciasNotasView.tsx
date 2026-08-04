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
  CloudOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemFrequenciaNota, AlunoFrequenciaNota, PresencaDiariaItem } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const FrequenciasNotasView: React.FC = () => {
  const { 
    frequenciasNotas: items = [], 
    updateFrequenciaNota, 
    deleteFrequenciaNota, 
    addFrequenciaNota,
    demandas, 
    celulas, 
    multiplicadores, 
    operadores,
    isItemPendingSync
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedYear, setSelectedYear] = useState<string>('TODOS');
  const [activeCourse, setActiveCourse] = useState<ItemFrequenciaNota | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Daily presence expandable grid state inside active course details
  const [isPresencaGridOpen, setIsPresencaGridOpen] = useState(false);
  const [trainingDaysCount, setTrainingDaysCount] = useState(20);
  const [dateOffsetIndex, setDateOffsetIndex] = useState(0);

  const [isLancarNotaOpen, setIsLancarNotaOpen] = useState(false);
  const [nomeProvaInput, setNomeProvaInput] = useState('Prova 1');
  const [dataProvaInput, setDataProvaInput] = useState(new Date().toISOString().split('T')[0]);
  const [notaInputMap, setNotaInputMap] = useState<Record<string, number>>({});

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = item.treinamento.toLowerCase().includes(q) ||
        item.multiplicador.toLowerCase().includes(q) ||
        item.celulas.some(c => c.toLowerCase().includes(q));
      const matchTipo = selectedTipo === 'todos' || item.tipo === selectedTipo;

      // Month/Year filter matching
      let matchMonth = true;
      let matchYear = true;

      const dateStr = item.dataInicio || item.criadoEm;
      if (dateStr) {
        const d = new Date(dateStr);
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

  // Edit student grades in active course modal
  const [editingAlunos, setEditingAlunos] = useState<AlunoFrequenciaNota[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ matDP: string; loginBB: string; nome: string }>({
    matDP: '',
    loginBB: '',
    nome: ''
  });

  const generatedDates = useMemo(() => {
    if (!activeCourse) return [];
    const start = activeCourse.dataInicio ? new Date(activeCourse.dataInicio) : new Date();
    const dates: { fullDate: string; label: string }[] = [];
    for (let i = 0; i < trainingDaysCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;
      dates.push({ fullDate: dateStr, label });
    }
    return dates;
  }, [activeCourse, trainingDaysCount]);

  const visibleDates = useMemo(() => {
    return generatedDates.slice(dateOffsetIndex, dateOffsetIndex + 10);
  }, [generatedDates, dateOffsetIndex]);

  const handleOpenCourseDetails = (course: ItemFrequenciaNota) => {
    setActiveCourse(course);
    setEditingAlunos([...course.alunos]);
    setEditingRowId(null);
    setIsPresencaGridOpen(false);
    setDateOffsetIndex(0);
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
        // Recalculate status for 0-10 grade scale
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
        const currentItem = currentDiario[dateKey] || { frequencia: '', horaExtra: '', obs: '' };
        const updatedItem = { ...currentItem, [field]: value };
        const updatedDiario = { ...currentDiario, [dateKey]: updatedItem };

        // Recalculate frequency % based on 'P' vs total recorded entries
        const entries = Object.values(updatedDiario) as PresencaDiariaItem[];
        const filledEntries = entries.filter(e => e.frequencia && e.frequencia !== '');
        const totalDays = filledEntries.length;
        const presentDays = filledEntries.filter(e => e.frequencia === 'P').length;
        const newFreqPercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : a.frequenciaPercent;

        let status = a.statusAprovacao;
        if (newFreqPercent < 75 || a.notaFinal < 5.0) status = 'Reprovado';
        else if (newFreqPercent >= 85 && a.notaFinal >= 7.0) status = 'Aprovado';
        else status = 'Em Andamento';

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'P': return 'bg-emerald-600 text-white font-black';
      case 'FI': return 'bg-rose-600 text-white font-black';
      case 'FJ': return 'bg-amber-600 text-white font-black';
      case 'DRS': return 'bg-slate-600 text-white font-black';
      case 'BH': return 'bg-slate-700 text-white font-black';
      case 'DAY OFF': return 'bg-yellow-500 text-slate-900 font-black';
      case 'FERIADO': return 'bg-purple-600 text-white font-black';
      case 'A': return 'bg-blue-600 text-white font-black';
      case 'TO': return 'bg-orange-600 text-white font-black';
      default: return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-bold border border-slate-300 dark:border-slate-700';
    }
  };

  // Handler for Lançar Nota (calculates media final on 0-10 scale)
  const handleSaveLancarNota = () => {
    setEditingAlunos(prev => prev.map(aluno => {
      const notaDigitada = notaInputMap[aluno.id];
      if (typeof notaDigitada === 'number' && !isNaN(notaDigitada)) {
        // Compute average between existing final grade and new test grade
        const novaNotaFinal = Math.round(((aluno.notaFinal + notaDigitada) / 2) * 10) / 10;
        const freq = aluno.frequenciaPercent;
        let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
        if (freq < 75 || novaNotaFinal < 5.0) status = 'Reprovado';
        else if (freq < 85 || novaNotaFinal < 7.0) status = 'Em Andamento';

        return {
          ...aluno,
          notaFinal: novaNotaFinal,
          statusAprovacao: status
        };
      }
      return aluno;
    }));
    setIsLancarNotaOpen(false);
    setNotaInputMap({});
  };

  const handleSaveCourseChanges = () => {
    if (!activeCourse) return;
    updateFrequenciaNota(activeCourse.id, {
      alunos: editingAlunos
    });
    setActiveCourse(null);
  };

  const handleExportCSV = (course: ItemFrequenciaNota) => {
    const headers = ['MAT_DP', 'LOGIN_BB', 'NOME', 'SUPERVISOR', 'GERENTE', 'CELULA', 'FREQUENCIA_%', 'NOTA_FINAL', 'STATUS'];
    const rows = course.alunos.map(a => [
      `"${a.matDP}"`,
      `"${a.loginBB}"`,
      `"${a.nome.replace(/"/g, '""')}"`,
      `"${a.supervisor.replace(/"/g, '""')}"`,
      `"${a.gerente.replace(/"/g, '""')}"`,
      `"${a.celula.replace(/"/g, '""')}"`,
      `${a.frequenciaPercent}%`,
      `${a.notaFinal}`,
      `"${a.statusAprovacao}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `boletim_${course.treinamento.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      course.tipo === 'Novatos' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                      course.tipo === 'Sinergia' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {course.tipo}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{course.id}</span>
                    {isItemPendingSync(course.id) && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-1 shrink-0" title="Salvo localmente na máquina, pendente de sincronizar no Firestore">
                        <CloudOff className="w-2.5 h-2.5" />
                        <span>Pendente de sincronizar</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {course.treinamento}
                  </h3>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Células: <strong>{course.celulas.join(', ')}</strong></span>
                    <span>•</span>
                    <span>Multiplicador: <strong>{course.multiplicador}</strong></span>
                    <span>•</span>
                    <span>Período: <strong>{course.dataInicio} à {course.dataFim}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => handleExportCSV(course)}
                    className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Boletim CSV</span>
                  </button>

                  <button
                    onClick={() => handleOpenCourseDetails(course)}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Lançar Frequência & Notas</span>
                  </button>

                  <button
                    onClick={() => setDeletingCourseId(course.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors"
                    title="Excluir este programa/turma"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Boletim de Frequência & Notas
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeCourse.treinamento}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAddOperatorRow}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  title="Acrescentar mais uma linha para operador"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Linha</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPresencaGridOpen(prev => !prev)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-colors ${
                    isPresencaGridOpen ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  title="Abrir/fechar lançamento de presença diária"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isPresencaGridOpen ? 'Fechar Presença' : 'Lançar Presença'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLancarNotaOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Lançar Nota</span>
                </button>

                <button
                  onClick={() => setActiveCourse(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DAILY PRESENCE 10-DAY NAVIGATION BAR */}
            {isPresencaGridOpen && (
              <div className="p-2.5 bg-indigo-50/90 dark:bg-slate-800/90 rounded-xl border border-indigo-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Lançamento Diário de Presença (10 dias por visualização)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Exibindo dias {dateOffsetIndex + 1} a {Math.min(dateOffsetIndex + 10, generatedDates.length)} de {generatedDates.length}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={dateOffsetIndex === 0}
                    onClick={() => setDateOffsetIndex(prev => Math.max(0, prev - 10))}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    title="Ver 10 dias anteriores"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    disabled={dateOffsetIndex + 10 >= generatedDates.length}
                    onClick={() => setDateOffsetIndex(prev => Math.min(generatedDates.length - 10, prev + 10))}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    title="Ver próximos 10 dias"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrainingDaysCount(prev => prev + 10)}
                    className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold transition-colors shadow-2xs"
                    title="Estender o treinamento em +10 dias"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ 10 Dias</span>
                  </button>
                </div>
              </div>
            )}

            {/* STUDENTS LIST TABLE */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto min-h-[250px]">
              <table className="w-full text-left text-[10px] whitespace-nowrap">
                <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-1.5 border-r border-slate-700 w-32">MATRÍCULA DP</th>
                    <th className="p-1.5 border-r border-slate-700 w-32">LOGIN BB</th>
                    <th className="p-1.5 border-r border-slate-700 min-w-[200px]">NOME OPERADOR</th>
                    <th className="p-1.5 border-r border-slate-700 min-w-[150px]">OBSERVAÇÃO</th>
                    <th className="p-1.5 text-center border-r border-slate-700 w-28">FREQUÊNCIA (%)</th>
                    <th className="p-1.5 text-center border-r border-slate-700 w-36">MÉDIA DAS NOTAS (0-10)</th>
                    <th className="p-1.5 text-center border-r border-slate-700 w-28">STATUS APROVAÇÃO</th>
                    <th className="p-1.5 text-center w-28">AÇÃO</th>
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

                    return (
                      <React.Fragment key={aluno.id}>
                        <tr className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50">
                          {/* MATRÍCULA DP */}
                          <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDraft.matDP}
                                onChange={(e) => setEditDraft(prev => ({ ...prev, matDP: e.target.value }))}
                                className="w-full px-2 py-1 border border-indigo-500 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Matrícula DP"
                              />
                            ) : (
                              <span className="font-mono text-slate-600 dark:text-slate-400">
                                {displayMat || 'N/A'}
                              </span>
                            )}
                          </td>

                          {/* LOGIN BB */}
                          <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDraft.loginBB}
                                onChange={(e) => setEditDraft(prev => ({ ...prev, loginBB: e.target.value }))}
                                className="w-full px-2 py-1 border border-indigo-500 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Login BB"
                              />
                            ) : (
                              <span className="font-mono font-normal text-indigo-700 dark:text-indigo-400">
                                {displayLogin || 'N/A'}
                              </span>
                            )}
                          </td>

                          {/* NOME OPERADOR */}
                          <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDraft.nome}
                                onChange={(e) => setEditDraft(prev => ({ ...prev, nome: e.target.value }))}
                                className="w-full px-2 py-1 border border-indigo-500 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Nome do Operador"
                              />
                            ) : (
                              <span className="font-normal text-slate-900 dark:text-white">
                                {aluno.nome}
                              </span>
                            )}
                          </td>

                          {/* OBSERVAÇÃO */}
                          <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              value={aluno.observacoes || ''}
                              onChange={(e) => handleUpdateStudent(aluno.id, 'observacoes', e.target.value)}
                              placeholder="Observação..."
                              className="w-full px-2 py-0.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded bg-transparent text-slate-800 dark:text-slate-200 text-[11px] font-medium outline-none"
                            />
                          </td>

                          {/* FREQUÊNCIA (%) */}
                          <td 
                            className="p-1 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer"
                            onDoubleClick={() => {
                              const val = prompt('Informe a Frequência % (0-100):', aluno.frequenciaPercent.toString());
                              if (val !== null) {
                                handleUpdateStudent(aluno.id, 'frequenciaPercent', parseFloat(val) || 0);
                              }
                            }}
                            title="Duplo clique para editar frequência"
                          >
                            <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {aluno.frequenciaPercent}%
                            </span>
                          </td>

                          {/* MÉDIA DAS NOTAS (0-10) */}
                          <td 
                            className="p-1 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer"
                            onDoubleClick={() => {
                              const val = prompt('Informe a Média das Notas (0-10):', aluno.notaFinal.toString());
                              if (val !== null) {
                                handleUpdateStudent(aluno.id, 'notaFinal', parseFloat(val) || 0);
                              }
                            }}
                            title="Duplo clique para editar média das notas (0-10)"
                          >
                            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {aluno.notaFinal}
                            </span>
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

                          {/* AÇÃO (EDITAR / SALVAR / EXCLUIR) */}
                          <td className="p-1 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveRow(aluno.id)}
                                  className="flex items-center space-x-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-xs transition-colors"
                                  title="Salvar edição da linha"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Salvar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelRowEdit}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRow(aluno)}
                                  className="flex items-center space-x-1 px-2 py-0.5 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors text-[10px] font-bold"
                                  title="Editar Matrícula, Login e Nome"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Editar</span>
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
                            )}
                          </td>
                        </tr>

                        {/* 4 EXPANDABLE DAILY PRESENCE ROWS FOR THIS OPERATOR */}
                        {isPresencaGridOpen && (
                          <tr className="bg-indigo-50/20 dark:bg-slate-900/40">
                            <td colSpan={8} className="p-2.5 border-b border-indigo-100 dark:border-slate-800">
                              <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 p-2.5 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    Presença & Apontamentos: <span className="text-indigo-600 dark:text-indigo-300 font-extrabold">{aluno.nome}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    (Altere a frequência, hora extra ou observação e as alterações são salvas no boletim)
                                  </span>
                                </div>

                                <div className="space-y-1.5 overflow-x-auto">
                                  <div className="grid grid-cols-11 gap-1 min-w-[750px] items-center text-[10px]">
                                    {/* ROW 1: DATA */}
                                    <div className="font-extrabold text-slate-600 dark:text-slate-300 uppercase py-1 px-1 bg-slate-100 dark:bg-slate-700/60 rounded">
                                      DATA
                                    </div>
                                    {visibleDates.map(d => (
                                      <div key={`dt-${d.fullDate}`} className="bg-slate-800 text-white font-bold text-center py-1 rounded">
                                        {d.label}
                                      </div>
                                    ))}

                                    {/* ROW 2: FREQUÊNCIA */}
                                    <div className="font-extrabold text-slate-600 dark:text-slate-300 uppercase py-1 px-1 bg-slate-100 dark:bg-slate-700/60 rounded">
                                      FREQUÊNCIA
                                    </div>
                                    {visibleDates.map(d => {
                                      const currentItem = aluno.presencaDiaria?.[d.fullDate] || { frequencia: '', horaExtra: '', obs: '' };
                                      const status = currentItem.frequencia || '';
                                      return (
                                        <select
                                          key={`freq-${d.fullDate}`}
                                          value={status}
                                          onChange={(e) => handleUpdateDailyRecord(aluno.id, d.fullDate, 'frequencia', e.target.value)}
                                          className={`w-full py-1 text-center font-black rounded border-0 text-[10px] cursor-pointer focus:outline-none ${getStatusStyle(status)}`}
                                        >
                                          <option value="" className="bg-white text-slate-400 font-bold">- (Em branco)</option>
                                          <option value="P" className="bg-white text-slate-900 font-bold">P (Presente)</option>
                                          <option value="FI" className="bg-white text-rose-700 font-bold">FI (Falta Inj.)</option>
                                          <option value="FJ" className="bg-white text-amber-700 font-bold">FJ (Falta Just.)</option>
                                          <option value="DRS" className="bg-white text-slate-700 font-bold">DRS</option>
                                          <option value="BH" className="bg-white text-slate-700 font-bold">BH</option>
                                          <option value="DAY OFF" className="bg-white text-amber-700 font-bold">DAY OFF</option>
                                          <option value="FERIADO" className="bg-white text-purple-700 font-bold">FERIADO</option>
                                          <option value="A" className="bg-white text-blue-700 font-bold">A (Atestado)</option>
                                          <option value="TO" className="bg-white text-orange-700 font-bold">TO (Treinam. Obrig.)</option>
                                        </select>
                                      );
                                    })}

                                    {/* ROW 3: HORA EXTRA */}
                                    <div className="font-extrabold text-slate-600 dark:text-slate-300 uppercase py-1 px-1 bg-slate-100 dark:bg-slate-700/60 rounded">
                                      HORA EXTRA
                                    </div>
                                    {visibleDates.map(d => {
                                      const currentItem = aluno.presencaDiaria?.[d.fullDate] || { frequencia: '', horaExtra: '', obs: '' };
                                      return (
                                        <input
                                          key={`he-${d.fullDate}`}
                                          type="text"
                                          placeholder="00:00"
                                          value={currentItem.horaExtra || ''}
                                          onChange={(e) => handleUpdateDailyRecord(aluno.id, d.fullDate, 'horaExtra', e.target.value)}
                                          className="w-full text-center py-1 px-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px] focus:ring-1 focus:ring-indigo-500"
                                        />
                                      );
                                    })}

                                    {/* ROW 4: OBS (Hover to view full text) */}
                                    <div className="font-extrabold text-slate-600 dark:text-slate-300 uppercase py-1 px-1 bg-slate-100 dark:bg-slate-700/60 rounded">
                                      OBS
                                    </div>
                                    {visibleDates.map(d => {
                                      const currentItem = aluno.presencaDiaria?.[d.fullDate] || { frequencia: '', horaExtra: '', obs: '' };
                                      return (
                                        <input
                                          key={`obs-${d.fullDate}`}
                                          type="text"
                                          placeholder="Obs..."
                                          value={currentItem.obs || ''}
                                          title={currentItem.obs || 'Passar o mouse para ver completo'}
                                          onChange={(e) => handleUpdateDailyRecord(aluno.id, d.fullDate, 'obs', e.target.value)}
                                          className="w-full py-1 px-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-normal truncate whitespace-nowrap overflow-hidden focus:ring-1 focus:ring-indigo-500"
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {editingAlunos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
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
                Lançar Nota dos Operadores (Nota de 0 a 10. A Média será recalcula na tabela):
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

    </div>
  );
};
