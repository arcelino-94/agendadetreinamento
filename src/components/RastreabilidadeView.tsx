import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building2, 
  GraduationCap, 
  Edit2, 
  Trash2, 
  Calendar, 
  Download, 
  Printer, 
  BookOpen, 
  CheckSquare, 
  X, 
  UserCheck, 
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CronogramaRastreabilidade, ItemConteudoRastreabilidade } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const RastreabilidadeView: React.FC = () => {
  const { 
    rastreabilidades = [], 
    addRastreabilidade, 
    updateRastreabilidade, 
    deleteRastreabilidade,
    addConteudoRastreabilidade,
    updateConteudoRastreabilidade,
    deleteConteudoRastreabilidade,
    celulas = [],
    frequenciasNotas = [],
    multiplicadores = []
  } = useApp();

  // Selected Cronograma State
  const [selectedCronogramaId, setSelectedCronogramaId] = useState<string>(() => {
    return rastreabilidades.length > 0 ? rastreabilidades[0].id : '';
  });

  const activeCronograma = useMemo(() => {
    return rastreabilidades.find(r => r.id === selectedCronogramaId) || rastreabilidades[0] || null;
  }, [rastreabilidades, selectedCronogramaId]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Realizado' | 'Pendente' | 'Sábado'>('todos');

  // Modals state
  const [isNovoCronogramaOpen, setIsNovoCronogramaOpen] = useState(false);
  const [isNovoConteudoOpen, setIsNovoConteudoOpen] = useState(false);
  const [editingConteudo, setEditingConteudo] = useState<ItemConteudoRastreabilidade | null>(null);
  const [deletingConteudoId, setDeletingConteudoId] = useState<string | null>(null);
  const [deletingCronogramaId, setDeletingCronogramaId] = useState<string | null>(null);

  // Form State - Novo Cronograma
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTipo, setNovoTipo] = useState<'celula' | 'turma'>('celula');
  const [novoRefId, setNovoRefId] = useState('');
  const [novoInstrutor, setNovoInstrutor] = useState('');

  // Form State - Conteúdo
  const [cntConteudo, setCntConteudo] = useState('');
  const [cntRotina, setCntRotina] = useState('-');
  const [cntCargaHoraria, setCntCargaHoraria] = useState('00:30');
  const [cntRecursos, setCntRecursos] = useState('PORTAL DE INFORMAÇÕES');
  const [cntRealizado, setCntRealizado] = useState(new Date().toLocaleDateString('pt-BR'));
  const [cntStatus, setCntStatus] = useState<'Realizado' | 'Pendente' | 'Sábado'>('Realizado');

  // Calculate CH Totals (converts HH:MM strings to total minutes)
  const stats = useMemo(() => {
    if (!activeCronograma || !activeCronograma.conteudos) {
      return { totalItens: 0, realizados: 0, totalMinutos: 0, minutosRealizados: 0, percent: 0 };
    }

    const totalItens = activeCronograma.conteudos.length;
    let realizados = 0;
    let totalMinutos = 0;
    let minutosRealizados = 0;

    activeCronograma.conteudos.forEach(item => {
      // Parse CH (e.g. "00:30", "01:30")
      const parts = (item.cargaHoraria || '00:00').split(':').map(p => parseInt(p, 10) || 0);
      const mins = (parts[0] || 0) * 60 + (parts[1] || 0);
      totalMinutos += mins;

      const isDone = item.status === 'Realizado' || (item.realizado && item.realizado !== 'PENDENTE' && item.realizado !== 'SÁBADO');
      if (isDone) {
        realizados += 1;
        minutosRealizados += mins;
      }
    });

    const percent = totalItens > 0 ? Math.round((realizados / totalItens) * 100) : 0;

    return { totalItens, realizados, totalMinutos, minutosRealizados, percent };
  }, [activeCronograma]);

  // Format Total Minutes to HH:MM format
  const formatMinutesToHHMM = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;
  };

  // Filtered contents list
  const filteredConteudos = useMemo(() => {
    if (!activeCronograma || !activeCronograma.conteudos) return [];

    return activeCronograma.conteudos.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = item.conteudo.toLowerCase().includes(q) ||
        (item.rotina || '').toLowerCase().includes(q) ||
        (item.recursos || '').toLowerCase().includes(q) ||
        (item.realizado || '').toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === 'Realizado') {
        matchStatus = item.status === 'Realizado' || (!!item.realizado && item.realizado !== 'SÁBADO' && item.realizado !== 'PENDENTE');
      } else if (statusFilter === 'Sábado') {
        matchStatus = item.status === 'Sábado' || item.realizado === 'SÁBADO';
      } else if (statusFilter === 'Pendente') {
        matchStatus = item.status === 'Pendente' || !item.realizado || item.realizado === 'PENDENTE';
      }

      return matchSearch && matchStatus;
    });
  }, [activeCronograma, searchTerm, statusFilter]);

  // Handle open modal for new/edit contenido
  const handleOpenConteudoModal = (item?: ItemConteudoRastreabilidade) => {
    if (item) {
      setEditingConteudo(item);
      setCntConteudo(item.conteudo);
      setCntRotina(item.rotina || '-');
      setCntCargaHoraria(item.cargaHoraria || '00:30');
      setCntRecursos(item.recursos || 'PORTAL DE INFORMAÇÕES');
      setCntRealizado(item.realizado || '');
      setCntStatus((item.status as any) || 'Realizado');
    } else {
      setEditingConteudo(null);
      setCntConteudo('');
      setCntRotina('-');
      setCntCargaHoraria('00:30');
      setCntRecursos('PORTAL DE INFORMAÇÕES');
      setCntRealizado(new Date().toLocaleDateString('pt-BR'));
      setCntStatus('Realizado');
    }
    setIsNovoConteudoOpen(true);
  };

  const handleSubmitConteudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntConteudo.trim() || !activeCronograma) return;

    if (editingConteudo) {
      updateConteudoRastreabilidade(activeCronograma.id, editingConteudo.id, {
        conteudo: cntConteudo,
        rotina: cntRotina,
        cargaHoraria: cntCargaHoraria,
        recursos: cntRecursos,
        realizado: cntRealizado,
        status: cntStatus
      });
    } else {
      const nextOrdem = (activeCronograma.conteudos?.length || 0) + 1;
      addConteudoRastreabilidade(activeCronograma.id, {
        ordem: nextOrdem,
        conteudo: cntConteudo,
        rotina: cntRotina,
        cargaHoraria: cntCargaHoraria,
        recursos: cntRecursos,
        realizado: cntRealizado,
        status: cntStatus
      });
    }

    setIsNovoConteudoOpen(false);
  };

  const handleCreateCronograma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    let refNome = '';
    if (novoTipo === 'celula') {
      const cel = celulas.find(c => c.id === novoRefId);
      refNome = cel ? cel.nome : 'Célula';
    } else {
      const tr = frequenciasNotas.find(f => f.id === novoRefId);
      refNome = tr ? tr.treinamento : 'Turma';
    }

    const created = addRastreabilidade({
      titulo: novoTitulo,
      tipo: novoTipo,
      refId: novoRefId || 'geral',
      refNome,
      instrutor: novoInstrutor || 'MULTIPLICADOR T&D',
      conteudos: [
        { id: `cnt-${Date.now()}-1`, ordem: 1, conteudo: 'PREENCHIMENTO PLANILHA ACESSOS', rotina: '-', cargaHoraria: '00:10', recursos: 'FORMS', realizado: new Date().toLocaleDateString('pt-BR'), status: 'Realizado' },
        { id: `cnt-${Date.now()}-2`, ordem: 2, conteudo: 'CONCEITOS BANCÁRIOS E FERRAMENTAS', rotina: '76974', cargaHoraria: '01:00', recursos: 'PORTAL DE INFORMAÇÕES', realizado: new Date().toLocaleDateString('pt-BR'), status: 'Realizado' }
      ]
    });

    setSelectedCronogramaId(created.id);
    setIsNovoCronogramaOpen(false);
    setNovoTitulo('');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!activeCronograma) return;

    const headers = ['ORDEM', 'CONTEÚDO', 'ROTINA', 'CARGA HORÁRIA (CH)', 'RECURSOS', 'REALIZADO'];
    const rows = activeCronograma.conteudos.map(c => [
      c.ordem,
      `"${c.conteudo.replace(/"/g, '""')}"`,
      `"${(c.rotina || '-').replace(/"/g, '""')}"`,
      `"${c.cargaHoraria}"`,
      `"${(c.recursos || '-').replace(/"/g, '""')}"`,
      `"${(c.realizado || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rastreabilidade_${activeCronograma.refNome.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl text-red-600 dark:text-red-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rastreabilidade</h1>
              <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs px-2 py-0.5 rounded-full font-bold">
                Cronograma de Treinamento
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestão e controle do cronograma de disciplinas, carga horária e execução das Células e Treinamentos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsNovoCronogramaOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Novo Cronograma</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            title="Exportar Planilha Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            title="Imprimir Relatório de Rastreabilidade"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Selector of Active Cronograma */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Selecione a Rastreabilidade:
            </span>
            <select
              value={selectedCronogramaId}
              onChange={(e) => setSelectedCronogramaId(e.target.value)}
              className="flex-1 max-w-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              {rastreabilidades.map(r => (
                <option key={r.id} value={r.id}>
                  {r.titulo} ({r.refNome})
                </option>
              ))}
            </select>
          </div>

          {activeCronograma && (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-500">Instrutor:</span>
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200/80">
                {activeCronograma.instrutor || 'GEOVANNE ARCELINO'}
              </span>
              <button
                onClick={() => setDeletingCronogramaId(activeCronograma.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Excluir este cronograma"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      {activeCronograma && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Célula / Turma</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[170px]" title={activeCronograma.refNome}>
                {activeCronograma.refNome}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tipo: {activeCronograma.tipo === 'celula' ? 'Célula de Atendimento' : 'Turma de Capacitação'}
              </p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/60 rounded-xl text-red-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total de Conteúdos</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {stats.totalItens} <span className="text-xs font-normal text-slate-400">módulos</span>
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {stats.realizados} concluídos ({stats.percent}%)
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Carga Horária (CH)</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatMinutesToHHMM(stats.totalMinutos)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Realizado: {formatMinutesToHHMM(stats.minutosRealizados)}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Progresso Geral</p>
                <span className="text-xs font-bold text-emerald-600">{stats.percent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {stats.realizados} de {stats.totalItens} tópicos finalizados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      {activeCronograma && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          {/* Table Header Bar & Search */}
          <div className="bg-red-700 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <h2 className="text-base font-bold tracking-tight uppercase">
                CRONOGRAMA DE RASTREABILIDADE - {activeCronograma.titulo}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleOpenConteudoModal()}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white text-red-800 hover:bg-red-50 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Tópico</span>
              </button>
            </div>
          </div>

          {/* Search & Filter sub-bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conteúdo, rotina, recursos ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-500">Filtrar:</span>
              {(['todos', 'Realizado', 'Pendente', 'Sábado'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st 
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Spreadsheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 text-center w-12 border-r border-slate-200 dark:border-slate-700">#</th>
                  <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">CONTEÚDO</th>
                  <th className="p-2.5 text-center w-24 border-r border-slate-200 dark:border-slate-700">ROTINA</th>
                  <th className="p-2.5 text-center w-24 border-r border-slate-200 dark:border-slate-700">CH (Horaria)</th>
                  <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">RECURSOS</th>
                  <th className="p-2.5 text-center w-36 border-r border-slate-200 dark:border-slate-700">REALIZADO</th>
                  <th className="p-2.5 text-center w-20">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredConteudos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhum tópico de conteúdo encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredConteudos.map((item, idx) => {
                    const isSaturday = item.realizado === 'SÁBADO' || item.status === 'Sábado';
                    const isDone = item.status === 'Realizado' || (!!item.realizado && !isSaturday && item.realizado !== 'PENDENTE');

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isSaturday ? 'bg-amber-50/70 dark:bg-amber-950/30' : ''
                        }`}
                      >
                        {/* Ordem */}
                        <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">
                          {item.ordem || idx + 1}
                        </td>

                        {/* Conteúdo */}
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                          {item.conteudo}
                        </td>

                        {/* Rotina (Código) */}
                        <td className="p-2.5 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                          {item.rotina || '-'}
                        </td>

                        {/* CH */}
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                          {item.cargaHoraria}
                        </td>

                        {/* Recursos */}
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium border-r border-slate-200 dark:border-slate-800">
                          <span className="inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {item.recursos || '-'}
                          </span>
                        </td>

                        {/* Realizado / Status Badge */}
                        <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                          {isSaturday ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-400 text-slate-900 font-extrabold rounded text-[11px] uppercase tracking-wider shadow-2xs">
                              SÁBADO
                            </span>
                          ) : isDone ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{item.realizado || 'CONCLUÍDO'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium rounded text-[11px]">
                              <span>PENDENTE</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenConteudoModal(item)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                              title="Editar tópico"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingConteudoId(item.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              title="Excluir tópico"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CRONOGRAMA */}
      {isNovoCronogramaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Nova Rastreabilidade</h3>
              </div>
              <button
                onClick={() => setIsNovoCronogramaOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCronograma} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Cronograma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CRONOGRAMA DE TREINAMENTO INICIAL - CÉLULA FRAUDE"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vincular A *
                  </label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="celula">Célula de Atendimento</option>
                    <option value="turma">Turma (Frequências e Notas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {novoTipo === 'celula' ? 'Selecione a Célula' : 'Selecione o Treinamento'}
                  </label>
                  <select
                    value={novoRefId}
                    onChange={(e) => setNovoRefId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Selecionar --</option>
                    {novoTipo === 'celula'
                      ? celulas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)
                      : frequenciasNotas.map(f => <option key={f.id} value={f.id}>{f.treinamento}</option>)
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instrutor / Multiplicador Responsável
                </label>
                <select
                  value={novoInstrutor}
                  onChange={(e) => setNovoInstrutor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="">GEOVANNE FERREIRA DE ARCELINO</option>
                  {multiplicadores.map(m => (
                    <option key={m.id} value={m.nome}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNovoCronogramaOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-2xs"
                >
                  Criar Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO / EDITAR TÓPICO DE CONTEÚDO */}
      {isNovoConteudoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingConteudo ? 'Editar Tópico' : 'Adicionar Tópico ao Cronograma'}
                </h3>
              </div>
              <button
                onClick={() => setIsNovoConteudoOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitConteudo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Conteúdo / Disciplina *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NORMATIVO SARB ou PLATAFORMA BB"
                  value={cntConteudo}
                  onChange={(e) => setCntConteudo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Rotina
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 76974 ou -"
                    value={cntRotina}
                    onChange={(e) => setCntRotina(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Carga Horária (CH) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 00:30 ou 01:30"
                    value={cntCargaHoraria}
                    onChange={(e) => setCntCargaHoraria(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recursos Didáticos / Ferramentas Utilizadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: PORTAL DE INFORMAÇÕES, PPT+VÍDEO, FORMS, SISBB"
                  value={cntRecursos}
                  onChange={(e) => setCntRecursos(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status / Data Realizado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 04/08/2026, SÁBADO, PENDENTE"
                    value={cntRealizado}
                    onChange={(e) => setCntRealizado(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria do Status
                  </label>
                  <select
                    value={cntStatus}
                    onChange={(e) => setCntStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Realizado">Realizado / Concluído</option>
                    <option value="Sábado">Sábado (Destacado Amarelo)</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNovoConteudoOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-2xs"
                >
                  {editingConteudo ? 'Salvar Alterações' : 'Adicionar Tópico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      <PasswordConfirmModal
        isOpen={!!deletingConteudoId}
        onClose={() => setDeletingConteudoId(null)}
        onConfirm={() => {
          if (activeCronograma && deletingConteudoId) {
            deleteConteudoRastreabilidade(activeCronograma.id, deletingConteudoId);
            setDeletingConteudoId(null);
          }
        }}
        title="Excluir Tópico do Cronograma"
        description="Esta ação removerá o tópico do cronograma de rastreabilidade. Digite a senha gerencial para confirmar."
      />

      <PasswordConfirmModal
        isOpen={!!deletingCronogramaId}
        onClose={() => setDeletingCronogramaId(null)}
        onConfirm={() => {
          if (deletingCronogramaId) {
            deleteRastreabilidade(deletingCronogramaId);
            setDeletingCronogramaId(null);
            if (rastreabilidades.length > 1) {
              const remaining = rastreabilidades.filter(r => r.id !== deletingCronogramaId);
              setSelectedCronogramaId(remaining[0].id);
            }
          }
        }}
        title="Excluir Cronograma Completo"
        description="Esta ação excluirá permanentemente todo este cronograma de rastreabilidade. Digite a senha gerencial para confirmar."
      />
    </div>
  );
};
