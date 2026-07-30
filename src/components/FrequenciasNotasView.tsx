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
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemFrequenciaNota, AlunoFrequenciaNota } from '../types';

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
  const [activeCourse, setActiveCourse] = useState<ItemFrequenciaNota | null>(null);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = item.treinamento.toLowerCase().includes(q) ||
        item.multiplicador.toLowerCase().includes(q) ||
        item.celulas.some(c => c.toLowerCase().includes(q));
      const matchTipo = selectedTipo === 'todos' || item.tipo === selectedTipo;
      return matchSearch && matchTipo;
    });
  }, [items, searchTerm, selectedTipo]);

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
    
    const newStudents: AlunoFrequenciaNota[] = [];
    logins.forEach(login => {
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
    });

    setEditingAlunos(prev => [...prev, ...newStudents]);
    setNewLoginInput('');
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por curso, multiplicador ou célula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Programa:</span>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full sm:w-44 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="todos">Todos os Programas</option>
              <option value="Novatos">Novatos (Onboarding)</option>
              <option value="Sinergia">Sinergia</option>
              <option value="Migração">Migração</option>
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
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Boletim de Frequência & Notas
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeCourse.treinamento}
                </h2>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ADD OPERATOR INPUT IN BULK */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Adicionar Operador por Login / Matrícula (C1234567):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cole ou digite logins ex: C1315137 C1286562 C1274287"
                  value={newLoginInput}
                  onChange={(e) => setNewLoginInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddStudentByLogin}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Adicionar Operadores
                </button>
              </div>
            </div>

            {/* STUDENTS LIST TABLE */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-2.5">MAT DP / LOGIN</th>
                    <th className="p-2.5">NOME OPERADOR</th>
                    <th className="p-2.5">SUPERVISOR / CÉLULA</th>
                    <th className="p-2.5 text-center">FREQUÊNCIA (%)</th>
                    <th className="p-2.5 text-center">NOTA PROVA (0-100)</th>
                    <th className="p-2.5 text-center">STATUS</th>
                    <th className="p-2.5 text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {editingAlunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">{aluno.loginBB}</span>
                        <span className="block text-[10px]">DP: {aluno.matDP}</span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                        {aluno.nome}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        <span>{aluno.supervisor}</span>
                        <span className="block text-[10px] text-slate-400">{aluno.celula}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={aluno.frequenciaPercent}
                          onChange={(e) => handleUpdateStudent(aluno.id, 'frequenciaPercent', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={aluno.notaFinal}
                          onChange={(e) => handleUpdateStudent(aluno.id, 'notaFinal', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-center font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          aluno.statusAprovacao === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          aluno.statusAprovacao === 'Reprovado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {aluno.statusAprovacao}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingAlunos(prev => prev.filter(a => a.id !== aluno.id))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remover operador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {editingAlunos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
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
                Salvar Frequências & Notas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
