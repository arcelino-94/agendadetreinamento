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
  X,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemFrequenciaNota, AlunoFrequenciaNota } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const FrequenciasNotasView: React.FC = () => {
  const { demandas, celulas, multiplicadores, operadores } = useApp();

  // Local state for Frequencias e Notas items
  const [items, setItems] = useState<ItemFrequenciaNota[]>(() => {
    // Generate initial items from mock demandas of type Sinergia / Novatos / Migração or default mocks
    return [
      {
        id: 'FN-101',
        treinamento: 'FORMAÇÃO DE NOVATOS - SAC CARTÃO 2026.1',
        tipo: 'Novatos',
        celulas: ['SAC CARTÃO'],
        dataInicio: '2026-07-01',
        dataFim: '2026-07-25',
        multiplicador: 'MARIA CLARA DOS SANTOS',
        cargaHoraria: '120h',
        status: 'Concluído',
        criadoEm: new Date().toISOString(),
        alunos: [
          { id: 'aln-1', matDP: '40782', loginBB: 'C1312444', nome: 'MARIA TAYNARA LIMA BRAZ DE MELO', supervisor: 'Thamyres Amorim', gerente: 'Rosana Gomes', celula: 'SAC CARTÃO', frequenciaPercent: 96, notaFinal: 88, statusAprovacao: 'Aprovado' },
          { id: 'aln-2', matDP: '40844', loginBB: 'C1334964', nome: 'SABRINA MIRELLE CAETANO DE OLIVEIRA', supervisor: 'Jaqueline Silva', gerente: 'Girleide Lira', celula: 'SAC CARTÃO', frequenciaPercent: 100, notaFinal: 92, statusAprovacao: 'Aprovado' },
          { id: 'aln-3', matDP: '40546', loginBB: 'C1334914', nome: 'ACIDALIA DE CARVALHO FRANCA', supervisor: 'Gutemberg Costa', gerente: 'Rosana Gomes', celula: 'SAC CARTÃO', frequenciaPercent: 80, notaFinal: 62, statusAprovacao: 'Reprovado' }
        ]
      },
      {
        id: 'FN-102',
        treinamento: 'SINERGIA & MIGRAÇÃO HD N1 -> OUVIDORIA',
        tipo: 'Sinergia',
        celulas: ['HD N1', 'OUVIDORIA'],
        dataInicio: '2026-07-10',
        dataFim: '2026-07-28',
        multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA',
        cargaHoraria: '40h',
        status: 'Em Andamento',
        criadoEm: new Date().toISOString(),
        alunos: [
          { id: 'aln-4', matDP: '28924', loginBB: 'C1286562', nome: 'ADRIANA DE LIMA BARBOSA', supervisor: 'Avani Martir', gerente: 'Girleide Lira', celula: 'OUVIDORIA', frequenciaPercent: 92, notaFinal: 85, statusAprovacao: 'Aprovado' },
          { id: 'aln-5', matDP: '40828', loginBB: 'C1334988', nome: 'RAYANE CRISTINE ALVES DOS SANTOS', supervisor: 'Avani Martir', gerente: 'Girleide Lira', celula: 'OUVIDORIA', frequenciaPercent: 88, notaFinal: 78, statusAprovacao: 'Em Andamento' }
        ]
      },
      {
        id: 'FN-103',
        treinamento: 'MIGRAÇÃO DE CÉLULAS - PRODUTO CONSIGNADO',
        tipo: 'Migração',
        celulas: ['MULTIMEIOS', 'ATA'],
        dataInicio: '2026-07-15',
        dataFim: '2026-07-30',
        multiplicador: 'CARLOS EDUARDO SILVA',
        cargaHoraria: '60h',
        status: 'Em Andamento',
        criadoEm: new Date().toISOString(),
        alunos: [
          { id: 'aln-6', matDP: '36283', loginBB: 'C1274287', nome: 'MICHELE CORREIA CASSIMIRO', supervisor: 'Christiane Ferraz', gerente: 'Rosana Gomes', celula: 'MULTIMEIOS', frequenciaPercent: 95, notaFinal: 90, statusAprovacao: 'Aprovado' },
          { id: 'aln-7', matDP: '36016', loginBB: 'C1296728', nome: 'ANDREA ALVES DA SILVA', supervisor: 'Gleiberson Freitas', gerente: 'Rosana Gomes', celula: 'MULTIMEIOS', frequenciaPercent: 90, notaFinal: 82, statusAprovacao: 'Aprovado' }
        ]
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedYear, setSelectedYear] = useState<string>('TODOS');
  const [activeCourse, setActiveCourse] = useState<ItemFrequenciaNota | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Sub-modals inside active course details
  const [isLancarPresencaOpen, setIsLancarPresencaOpen] = useState(false);
  const [presencaData, setPresencaData] = useState(new Date().toISOString().split('T')[0]);
  const [presencaStatus, setPresencaStatus] = useState<'Presente' | 'Falta' | 'Atestado' | 'TO'>('Presente');

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
  const [newLoginInput, setNewLoginInput] = useState('');

  const handleOpenCourseDetails = (course: ItemFrequenciaNota) => {
    setActiveCourse(course);
    setEditingAlunos([...course.alunos]);
  };

  const handleUpdateStudent = (id: string, field: keyof AlunoFrequenciaNota, val: any) => {
    setEditingAlunos(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: val };
        // Recalculate status
        const freq = typeof updated.frequenciaPercent === 'number' ? updated.frequenciaPercent : 0;
        const nota = typeof updated.notaFinal === 'number' ? updated.notaFinal : 0;
        if (freq >= 85 && nota >= 70) {
          updated.statusAprovacao = 'Aprovado';
        } else if (freq < 75 || nota < 50) {
          updated.statusAprovacao = 'Reprovado';
        } else {
          updated.statusAprovacao = 'Em Andamento';
        }
        return updated;
      }
      return a;
    }));
  };

  const handleAddStudentByLogin = () => {
    if (!newLoginInput.trim()) return;
    const logins = newLoginInput.split(/[\s,;\n]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    
    // Existing logins / matDP set to prevent overwriting existing data
    const existingKeys = new Set(
      editingAlunos.flatMap(a => [a.loginBB.toUpperCase(), a.matDP.toUpperCase()])
    );

    const newStudents: AlunoFrequenciaNota[] = [];
    logins.forEach(login => {
      // Prevent overwriting data that was already logged previously
      if (existingKeys.has(login)) return;

      const op = operadores.find(o => o.loginBB.toUpperCase() === login || o.matDP === login);
      newStudents.push({
        id: `aln-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        matDP: op ? op.matDP : 'N/A',
        loginBB: login,
        nome: op ? op.nome : `OPERADOR ${login}`,
        supervisor: op ? op.supervisor : 'N/A',
        gerente: op ? op.gerente : 'N/A',
        celula: op ? op.segmento : 'GERAL',
        frequenciaPercent: 100,
        notaFinal: 80,
        statusAprovacao: 'Aprovado'
      });
      existingKeys.add(login);
    });

    setEditingAlunos(prev => [...prev, ...newStudents]);
    setNewLoginInput('');
  };

  // Handler for Lançar Presença with Regra do TO
  const handleApplyPresencaInBulk = () => {
    setEditingAlunos(prev => prev.map(aluno => {
      let newFreq = aluno.frequenciaPercent;
      if (presencaStatus === 'Falta') {
        newFreq = Math.max(0, newFreq - 10);
      } else if (presencaStatus === 'Presente') {
        newFreq = Math.min(100, newFreq + 5);
      } else if (presencaStatus === 'TO') {
        // Regra do TO: Se marcado como TO, todas as caixas futuras ficam preenchidas como TO
        newFreq = 0;
      }
      
      const freq = newFreq;
      const nota = aluno.notaFinal;
      let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
      if (presencaStatus === 'TO' || freq < 75 || nota < 50) {
        status = 'Reprovado';
      } else if (freq < 85 || nota < 70) {
        status = 'Em Andamento';
      }

      return {
        ...aluno,
        frequenciaPercent: freq,
        statusAprovacao: status
      };
    }));
    setIsLancarPresencaOpen(false);
  };

  // Handler for Lançar Nota (calculates media final)
  const handleSaveLancarNota = () => {
    setEditingAlunos(prev => prev.map(aluno => {
      const notaDigitada = notaInputMap[aluno.id];
      if (typeof notaDigitada === 'number' && !isNaN(notaDigitada)) {
        // Compute average between existing final grade and new test grade
        const novaNotaFinal = Math.round((aluno.notaFinal + notaDigitada) / 2 * 10) / 10;
        const freq = aluno.frequenciaPercent;
        let status: 'Aprovado' | 'Reprovado' | 'Em Andamento' = 'Aprovado';
        if (freq < 75 || novaNotaFinal < 50) status = 'Reprovado';
        else if (freq < 85 || novaNotaFinal < 70) status = 'Em Andamento';

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
    setItems(prev => prev.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          alunos: editingAlunos
        };
      }
      return c;
    }));
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
            {stats.mediaNota} <span className="text-xs font-normal text-slate-400">/ 100</span>
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
                  onClick={() => setIsLancarPresencaOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lançar Presença</span>
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

            {/* ADD OPERATOR INPUT IN BULK */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Adicionar Operadores por Login ou Matrícula (Importação sem Sobrescrever):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cole logins ex: C1315137 C1286562 C1274287"
                  value={newLoginInput}
                  onChange={(e) => setNewLoginInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddStudentByLogin}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Importar
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                * Dica: Duplo clique na célula de Frequência ou Nota Final permite editar e salva automaticamente.
              </p>
            </div>

            {/* STUDENTS LIST TABLE (WITHOUT CÉLULA COLUMN, REDUCED HEIGHT, NO BOLD) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto min-h-[250px]">
              <table className="w-full text-left text-[10px] whitespace-nowrap">
                <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-1.5 border-r border-slate-700">MATRÍCULA DP</th>
                    <th className="p-1.5 border-r border-slate-700">LOGIN BB</th>
                    <th className="p-1.5 border-r border-slate-700">NOME OPERADOR</th>
                    <th className="p-1.5 border-r border-slate-700">SUPERVISOR</th>
                    <th className="p-1.5 border-r border-slate-700">GERENTE</th>
                    <th className="p-1.5 text-center border-r border-slate-700">FREQUÊNCIA (%)</th>
                    <th className="p-1.5 text-center border-r border-slate-700">MÉDIA DAS NOTAS (0-100)</th>
                    <th className="p-1.5 text-center border-r border-slate-700">STATUS APROVAÇÃO</th>
                    <th className="p-1.5 text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                  {editingAlunos.map((aluno) => {
                    let displayLogin = aluno.loginBB || '';
                    let displayMat = aluno.matDP || '';
                    if (displayMat.toUpperCase().startsWith('C') && !displayLogin.toUpperCase().startsWith('C')) {
                      const tmp = displayLogin;
                      displayLogin = displayMat;
                      displayMat = tmp;
                    }

                    return (
                      <tr key={aluno.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50">
                        <td className="p-1.5 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                          {displayMat || 'N/A'}
                        </td>
                        <td className="p-1.5 font-mono font-normal text-indigo-700 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                          {displayLogin || 'N/A'}
                        </td>
                        <td className="p-1.5 font-normal text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {aluno.nome}
                        </td>
                        <td className="p-1.5 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                          {aluno.supervisor || 'N/A'}
                        </td>
                        <td className="p-1.5 text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {aluno.gerente || 'N/A'}
                        </td>
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
                        <td 
                          className="p-1 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer"
                          onDoubleClick={() => {
                            const val = prompt('Informe a Média das Notas (0-100):', aluno.notaFinal.toString());
                            if (val !== null) {
                              handleUpdateStudent(aluno.id, 'notaFinal', parseFloat(val) || 0);
                            }
                          }}
                          title="Duplo clique para editar média das notas"
                        >
                          <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {aluno.notaFinal}
                          </span>
                        </td>
                        <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aluno.statusAprovacao === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            aluno.statusAprovacao === 'Reprovado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {aluno.statusAprovacao}
                          </span>
                        </td>
                        <td className="p-1 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingAlunos(prev => prev.filter(a => a.id !== aluno.id))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remover operador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {editingAlunos.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        Nenhum operador adicionado ainda nesta turma. Use a caixa acima para adicionar por login.
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

      {/* LANÇAR PRESENÇA MODAL */}
      {isLancarPresencaOpen && activeCourse && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Lançar Presença Diária
              </h3>
              <button onClick={() => setIsLancarPresencaOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Lançamento:</label>
                <input
                  type="date"
                  value={presencaData}
                  onChange={(e) => setPresencaData(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status de Presença:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Presente', 'Falta', 'Atestado', 'TO'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPresencaStatus(status)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        presencaStatus === status
                          ? status === 'Presente' ? 'bg-emerald-600 text-white border-emerald-600' :
                            status === 'Falta' ? 'bg-rose-600 text-white border-rose-600' :
                            status === 'Atestado' ? 'bg-blue-600 text-white border-blue-600' :
                            'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {presencaStatus === 'TO' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                  <p className="font-bold">Regra do TO Ativa:</p>
                  <p>
                    Ao selecionar TO (Treinamento Obrigatório PENDENTE / TO), todas as datas e caixas de frequência futuras desta turma serão preenchidas automaticamente como TO.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLancarPresencaOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyPresencaInBulk}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Aplicar Presença
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
                Lançar Nota de Avaliação / Prova
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
                Lançar Nota dos Operadores (A Média da Nota será atualizada na tabela principal):
              </p>
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {editingAlunos.map(aluno => (
                  <div key={aluno.id} className="flex items-center justify-between p-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{aluno.nome}</p>
                      <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{aluno.loginBB} ({aluno.matDP})</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">Nota:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={notaInputMap[aluno.id] !== undefined ? notaInputMap[aluno.id] : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNotaInputMap(prev => ({
                            ...prev,
                            [aluno.id]: isNaN(val) ? 0 : val
                          }));
                        }}
                        className="w-20 p-1 border border-slate-300 dark:border-slate-700 rounded text-center font-mono font-bold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800"
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
            setItems(prev => prev.filter(c => c.id !== deletingCourseId));
            setDeletingCourseId(null);
          }
        }}
        title="Confirmar Exclusão de Turma / Programa"
        itemDescription="esta turma de Frequência e Notas"
      />

    </div>
  );
};
