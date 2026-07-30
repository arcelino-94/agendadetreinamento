import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Trash2, 
  Download, 
  Users, 
  X, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AlinhamentoTabulador, OperadorAlinhamento } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

// Helper function to calculate total training hours string (Presentes * CH)
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

export const TabuladorView: React.FC = () => {
  const { 
    tabulador, 
    addAlinhamentoTabulador, 
    updateAlinhamentoTabulador,
    deleteAlinhamentoTabulador, 
    toggleAlinhamentoStatus,
    celulas,
    getOperadorByLogin
  } = useApp();

  // Selected Month Filter (default 'jul/26')
  const [selectedMonth, setSelectedMonth] = useState('jul/26');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCelula, setSelectedCelula] = useState('todos');

  // Helper to parse item date into 'mon/yy' string
  const getDateMonthKey = (dateStr?: string): string => {
    if (!dateStr) return 'jul/26';
    if (dateStr.includes('/')) return dateStr.toLowerCase();
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const yearStr = parts[0].slice(-2); // '26'
      const monthIdx = parseInt(parts[1], 10) - 1; // 0..11
      const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${monthNames[monthIdx]}/${yearStr}`;
      }
    }
    return dateStr.toLowerCase();
  };

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlinhamentoTabulador | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    treinamento: '',
    solicitante: 'OPERAÇÃO / T&D/BB',
    celula: 'SAC PRIORITÁRIO',
    convocados: 20,
    presentes: 20,
    dispensado: 0,
    cargaHoraria: '0:20:00',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
    status: 'Concluído' as 'Pendente' | 'Concluído'
  });

  // Operators attendance detail modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<AlinhamentoTabulador | null>(null);
  const [opInputLogin, setOpInputLogin] = useState('');
  const [opLookupError, setOpLookupError] = useState<string | null>(null);

  // Delete Password Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Computed metrics
  const filteredTabulador = useMemo(() => {
    return tabulador.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const treinamentoStr = (item.treinamento || (item as any).titulo || '').toLowerCase();
      const solicitanteStr = (item.solicitante || '').toLowerCase();
      const celulaStr = (item.celula || (item as any).segmento || '').toLowerCase();

      const matchSearch = 
        treinamentoStr.includes(q) ||
        solicitanteStr.includes(q) ||
        celulaStr.includes(q);

      const matchCelula = selectedCelula === 'todos' || celulaStr.includes(selectedCelula.toLowerCase());

      const itemMonthKey = getDateMonthKey(item.data);
      const matchMonth = selectedMonth === 'todos' || itemMonthKey === selectedMonth.toLowerCase() || (item.data && item.data.toLowerCase().includes(selectedMonth.toLowerCase()));

      return matchSearch && matchCelula && matchMonth;
    });
  }, [tabulador, searchTerm, selectedCelula, selectedMonth]);

  const totalConvocados = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.convocados || 0), 0), [filteredTabulador]);
  const totalPresentes = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.presentes || 0), 0), [filteredTabulador]);
  const totalDispensado = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.dispensado || 0), 0), [filteredTabulador]);
  const totalPendentes = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.pendentes || (curr.convocados - curr.presentes - curr.dispensado)), 0), [filteredTabulador]);
  const mediaPercentual = useMemo(() => {
    if (totalConvocados === 0) return 0;
    return Math.round((totalPresentes / totalConvocados) * 100);
  }, [totalConvocados, totalPresentes]);

  // Open Add/Edit Modal
  const handleOpenModal = (item?: AlinhamentoTabulador) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        treinamento: item.treinamento,
        solicitante: item.solicitante || 'OPERAÇÃO / T&D/BB',
        celula: item.celula,
        convocados: item.convocados,
        presentes: item.presentes,
        dispensado: item.dispensado,
        cargaHoraria: item.cargaHoraria || '0:20:00',
        data: item.data,
        observacoes: item.observacoes || '',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        treinamento: '',
        solicitante: 'OPERAÇÃO / T&D/BB',
        celula: celulas[0]?.nome || 'SAC PRIORITÁRIO',
        convocados: 20,
        presentes: 20,
        dispensado: 0,
        cargaHoraria: '0:20:00',
        data: new Date().toISOString().split('T')[0],
        observacoes: '',
        status: 'Concluído'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treinamento.trim()) return;

    const convocados = Number(formData.convocados) || 0;
    const presentes = Number(formData.presentes) || 0;
    const dispensado = Number(formData.dispensado) || 0;
    const pendentes = Math.max(0, convocados - presentes - dispensado);
    const percentual = convocados > 0 ? Math.round((presentes / convocados) * 100) : 0;
    const horasTreinamento = calculateHorasTreinamento(presentes, formData.cargaHoraria);

    if (editingItem) {
      updateAlinhamentoTabulador(editingItem.id, {
        treinamento: formData.treinamento,
        solicitante: formData.solicitante,
        celula: formData.celula,
        convocados,
        presentes,
        dispensado,
        pendentes,
        cargaHoraria: formData.cargaHoraria,
        horasTreinamento,
        percentual,
        data: formData.data,
        observacoes: formData.observacoes,
        status: formData.status
      });
    } else {
      addAlinhamentoTabulador({
        treinamento: formData.treinamento,
        solicitante: formData.solicitante,
        celula: formData.celula,
        convocados,
        presentes,
        dispensado,
        pendentes,
        cargaHoraria: formData.cargaHoraria,
        horasTreinamento,
        percentual,
        data: formData.data,
        operadores: [],
        observacoes: formData.observacoes,
        status: formData.status
      });
    }

    setIsModalOpen(false);
  };

  // Add operator by Login BB into detail drawer
  const handleAddOperatorToDetail = () => {
    if (!selectedDetailItem || !opInputLogin.trim()) return;
    const op = getOperadorByLogin(opInputLogin);
    if (!op) {
      setOpLookupError(`Login "${opInputLogin}" não foi encontrado no Quadro de Operadores!`);
      return;
    }

    const currentOps = selectedDetailItem.operadores || [];
    if (currentOps.some(o => o.loginBB.toUpperCase() === op.loginBB.toUpperCase())) {
      setOpLookupError(`O operador ${op.nome} já está nesta lista.`);
      return;
    }

    const newOp: OperadorAlinhamento = {
      loginBB: op.loginBB,
      nome: op.nome,
      matDP: op.matDP,
      supervisor: op.supervisor,
      gerente: op.gerente,
      segmento: op.segmento,
      statusPresenca: 'Presente'
    };

    const updatedOps = [...currentOps, newOp];
    const newConvocados = updatedOps.length;
    const newPresentes = updatedOps.filter(o => o.statusPresenca === 'Presente').length;
    const newDispensado = updatedOps.filter(o => o.statusPresenca === 'Dispensado').length;
    const newPendentes = Math.max(0, newConvocados - newPresentes - newDispensado);
    const newPercentual = newConvocados > 0 ? Math.round((newPresentes / newConvocados) * 100) : 0;
    const newHoras = calculateHorasTreinamento(newPresentes, selectedDetailItem.cargaHoraria);

    const updates = {
      operadores: updatedOps,
      convocados: newConvocados,
      presentes: newPresentes,
      dispensado: newDispensado,
      pendentes: newPendentes,
      percentual: newPercentual,
      horasTreinamento: newHoras
    };

    updateAlinhamentoTabulador(selectedDetailItem.id, updates);
    setSelectedDetailItem({ ...selectedDetailItem, ...updates });
    setOpInputLogin('');
    setOpLookupError(null);
  };

  const handleToggleOperatorPresence = (loginBB: string, newStatus: 'Presente' | 'Dispensado' | 'Pendente') => {
    if (!selectedDetailItem) return;
    const updatedOps = selectedDetailItem.operadores.map(op => {
      if (op.loginBB === loginBB) return { ...op, statusPresenca: newStatus };
      return op;
    });

    const newConvocados = updatedOps.length;
    const newPresentes = updatedOps.filter(o => o.statusPresenca === 'Presente').length;
    const newDispensado = updatedOps.filter(o => o.statusPresenca === 'Dispensado').length;
    const newPendentes = Math.max(0, newConvocados - newPresentes - newDispensado);
    const newPercentual = newConvocados > 0 ? Math.round((newPresentes / newConvocados) * 100) : 0;
    const newHoras = calculateHorasTreinamento(newPresentes, selectedDetailItem.cargaHoraria);

    const updates = {
      operadores: updatedOps,
      convocados: newConvocados,
      presentes: newPresentes,
      dispensado: newDispensado,
      pendentes: newPendentes,
      percentual: newPercentual,
      horasTreinamento: newHoras
    };

    updateAlinhamentoTabulador(selectedDetailItem.id, updates);
    setSelectedDetailItem({ ...selectedDetailItem, ...updates });
  };

  const handleRemoveOperatorFromDetail = (loginBB: string) => {
    if (!selectedDetailItem) return;
    const updatedOps = selectedDetailItem.operadores.filter(op => op.loginBB !== loginBB);

    const newConvocados = updatedOps.length;
    const newPresentes = updatedOps.filter(o => o.statusPresenca === 'Presente').length;
    const newDispensado = updatedOps.filter(o => o.statusPresenca === 'Dispensado').length;
    const newPendentes = Math.max(0, newConvocados - newPresentes - newDispensado);
    const newPercentual = newConvocados > 0 ? Math.round((newPresentes / newConvocados) * 100) : 0;
    const newHoras = calculateHorasTreinamento(newPresentes, selectedDetailItem.cargaHoraria);

    const updates = {
      operadores: updatedOps,
      convocados: newConvocados,
      presentes: newPresentes,
      dispensado: newDispensado,
      pendentes: newPendentes,
      percentual: newPercentual,
      horasTreinamento: newHoras
    };

    updateAlinhamentoTabulador(selectedDetailItem.id, updates);
    setSelectedDetailItem({ ...selectedDetailItem, ...updates });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['TREINAMENTO', 'SOLICITANTE', 'CELULA', 'CONVOCADOS', 'PRESENTES', 'DISPENSADO', 'PENDENTES', 'HORAS TREIN.', 'CH', '% ADERÊNCIA'];
    const rows = filteredTabulador.map(t => [
      `"${(t.treinamento || (t as any).titulo || '').replace(/"/g, '""')}"`,
      `"${(t.solicitante || 'OPERAÇÃO / T&D/BB').replace(/"/g, '""')}"`,
      `"${(t.celula || (t as any).segmento || '').replace(/"/g, '""')}"`,
      t.convocados || 0,
      t.presentes || 0,
      t.dispensado || 0,
      t.pendentes || 0,
      `"${t.horasTreinamento || '0:00:00'}"`,
      `"${t.cargaHoraria || '0:00:00'}"`,
      `"${t.percentual || 0}%"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tabulador_Treinamentos_${selectedMonth.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper status icon renderer matching image
  const renderPercentIcon = (pct: number) => {
    if (pct >= 80) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-2xs" title="100% Aderência / Alta Conclusão">
          ✓
        </span>
      );
    } else if (pct >= 50) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs" title="Aderência Média">
          ➔
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-2xs" title="Baixa Aderência">
          ▼
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Treinamentos</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{filteredTabulador.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Convocados</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalConvocados}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Presentes</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalPresentes}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Dispensados</span>
          <div className="text-xl font-black text-slate-600 dark:text-slate-300 mt-1">{totalDispensado}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pendentes</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{totalPendentes}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Aderência Média</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{mediaPercentual}%</div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto flex-1">
          {/* Search field */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Treinamento, Célula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Month Selector next to Search Field */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Mês:</span>
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-40 px-2.5 py-1.5 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-200 outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
            >
              <option value="jul/26">JULHO 2026 (jul/26)</option>
              <option value="jun/26">JUNHO 2026 (jun/26)</option>
              <option value="mai/26">MAIO 2026 (mai/26)</option>
              <option value="abr/26">ABRIL 2026 (abr/26)</option>
              <option value="mar/26">MARÇO 2026 (mar/26)</option>
              <option value="fev/26">FEVEREIRO 2026 (fev/26)</option>
              <option value="jan/26">JANEIRO 2026 (jan/26)</option>
              <option value="dez/25">DEZEMBRO 2025 (dez/25)</option>
              <option value="nov/25">NOVEMBRO 2025 (nov/25)</option>
              <option value="out/25">OUTUBRO 2025 (out/25)</option>
              <option value="set/25">SETEMBRO 2025 (set/25)</option>
              <option value="ago/25">AGOSTO 2025 (ago/25)</option>
              <option value="jul/25">JULHO 2025 (jul/25)</option>
              <option value="todos">TODOS OS MESES</option>
            </select>
          </div>

          {/* Cell filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Célula:</span>
            <select
              value={selectedCelula}
              onChange={(e) => setSelectedCelula(e.target.value)}
              className="w-full sm:w-48 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="todos">Todas Células ({tabulador.length})</option>
              {celulas.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
            title="Exportar dados do Tabulador para Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET TABLE (EXACT MATCH TO USER IMAGE COLUMNS & DESIGN) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-900 dark:border-indigo-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-indigo-900 dark:bg-slate-950 text-white text-[11px] font-black uppercase tracking-wider border-b-2 border-yellow-400">
                <th className="px-3 py-3 w-80 border-r border-indigo-800/80">TREINAMENTO</th>
                <th className="px-3 py-3 w-44 border-r border-indigo-800/80">SOLICITANTE</th>
                <th className="px-3 py-3 w-48 border-r border-indigo-800/80">CELULA</th>
                <th className="px-2.5 py-3 text-center w-24 border-r border-indigo-800/80">CONVOCADOS</th>
                <th className="px-2.5 py-3 text-center w-24 border-r border-indigo-800/80">PRESENTES</th>
                <th className="px-2.5 py-3 text-center w-24 border-r border-indigo-800/80">DISPENSADO</th>
                <th className="px-2.5 py-3 text-center w-24 border-r border-indigo-800/80">PENDENTES</th>
                <th className="px-3 py-3 text-center w-28 border-r border-indigo-800/80">HORAS TREIN.</th>
                <th className="px-2.5 py-3 text-center w-20 border-r border-indigo-800/80">CH</th>
                <th className="px-2 py-3 text-center w-20 border-r border-indigo-800/80">%</th>
                <th className="px-3 py-3 text-center w-24">AÇÕES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px] font-medium">
              {filteredTabulador.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    Nenhum registro encontrado no Tabulador para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTabulador.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const rowBg = isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/80 dark:bg-slate-800/40';

                  return (
                    <tr 
                      key={item.id} 
                      className={`${rowBg} hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition-colors border-b border-slate-200/80 dark:border-slate-800`}
                    >
                      {/* TREINAMENTO */}
                      <td className="px-3 py-2.5 font-bold text-indigo-950 dark:text-indigo-200 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-6 bg-indigo-600 rounded-full shrink-0"></span>
                          <span className="line-clamp-2 uppercase">{item.treinamento}</span>
                        </div>
                      </td>

                      {/* SOLICITANTE */}
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 font-medium border-r border-slate-200 dark:border-slate-800 uppercase">
                        {item.solicitante || 'OPERAÇÃO / T&D/BB'}
                      </td>

                      {/* CELULA */}
                      <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                          {item.celula}
                        </span>
                      </td>

                      {/* CONVOCADOS */}
                      <td className="px-2.5 py-2.5 text-center font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                        {item.convocados}
                      </td>

                      {/* PRESENTES */}
                      <td className="px-2.5 py-2.5 text-center font-bold text-emerald-700 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                        {item.presentes}
                      </td>

                      {/* DISPENSADO */}
                      <td className="px-2.5 py-2.5 text-center font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {item.dispensado}
                      </td>

                      {/* PENDENTES */}
                      <td className="px-2.5 py-2.5 text-center font-bold text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-950/20">
                        {item.pendentes}
                      </td>

                      {/* HORAS TREIN. */}
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                        {item.horasTreinamento}
                      </td>

                      {/* CH */}
                      <td className="px-2.5 py-2.5 text-center font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {item.cargaHoraria}
                      </td>

                      {/* % ADERÊNCIA WITH STATUS ICON */}
                      <td className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center space-x-1.5 font-black">
                          {renderPercentIcon(item.percentual)}
                          <span className={item.percentual >= 80 ? 'text-emerald-700 dark:text-emerald-400' : item.percentual >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                            {item.percentual}%
                          </span>
                        </div>
                      </td>

                      {/* AÇÕES */}
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedDetailItem(item)}
                            className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                            title="Ver Operadores / Lista de Presença"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                            title="Editar Registro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Excluir Registro"
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

      {/* MODAL CADASTRAR / EDITAR TREINAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form 
            onSubmit={handleSaveForm}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Editar Treinamento no Tabulador' : 'Cadastrar Novo Treinamento no Tabulador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Treinamento / Procedimento:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: APONTAMENTOS DE CARTÃO DENTRO DO SAC"
                  value={formData.treinamento}
                  onChange={(e) => setFormData({ ...formData, treinamento: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold uppercase text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Solicitante:</label>
                  <input
                    type="text"
                    required
                    value={formData.solicitante}
                    onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Célula / Segmento:</label>
                  <select
                    value={formData.celula}
                    onChange={(e) => setFormData({ ...formData, celula: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="TODOS">TODOS</option>
                    {celulas.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Convocados:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.convocados}
                    onChange={(e) => setFormData({ ...formData, convocados: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1">Presentes:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.presentes}
                    onChange={(e) => setFormData({ ...formData, presentes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Dispensados:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dispensado}
                    onChange={(e) => setFormData({ ...formData, dispensado: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Carga Horária (CH):</label>
                  <select
                    value={formData.cargaHoraria}
                    onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="0:15:00">0:15:00 (15 min)</option>
                    <option value="0:20:00">0:20:00 (20 min)</option>
                    <option value="0:30:00">0:30:00 (30 min)</option>
                    <option value="0:45:00">0:45:00 (45 min)</option>
                    <option value="1:00:00">1:00:00 (1 hora)</option>
                    <option value="2:00:00">2:00:00 (2 horas)</option>
                    <option value="4:00:00">4:00:00 (4 horas)</option>
                    <option value="8:00:00">8:00:00 (8 horas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data:</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações:</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Salvar Treinamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL / OPERATOR PRESENCE LIST DRAWER */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  {selectedDetailItem.celula}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 uppercase">
                  {selectedDetailItem.treinamento}
                </h3>
                <p className="text-xs text-slate-500">
                  Solicitante: {selectedDetailItem.solicitante} | CH: {selectedDetailItem.cargaHoraria} | Horas Totais: {selectedDetailItem.horasTreinamento}
                </p>
              </div>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar inside Drawer */}
            <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Convocados</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{selectedDetailItem.convocados}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Presentes</span>
                <span className="text-sm font-black text-emerald-600">{selectedDetailItem.presentes}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Dispensados</span>
                <span className="text-sm font-black text-slate-600 dark:text-slate-300">{selectedDetailItem.dispensado}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-amber-600 uppercase">% Aderência</span>
                <span className="text-sm font-black text-amber-600">{selectedDetailItem.percentual}%</span>
              </div>
            </div>

            {/* Add Operator by Login BB */}
            <div className="space-y-1 shrink-0">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Vincular Operador pelo Login BB (Quadro de Operadores):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Digite o Login BB (ex: C1315137)..."
                  value={opInputLogin}
                  onChange={(e) => {
                    setOpInputLogin(e.target.value);
                    if (opLookupError) setOpLookupError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOperatorToDetail();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddOperatorToDetail}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0"
                >
                  Adicionar
                </button>
              </div>
              {opLookupError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{opLookupError}</p>
              )}
            </div>

            {/* List of Attached Operators */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Lista de Operadores Vinculados (Total: {selectedDetailItem.operadores.length})
              </div>

              {selectedDetailItem.operadores.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  Nenhum operador vinculado individualmente. As métricas acima estão registradas via totais do treinamento.
                </div>
              ) : (
                selectedDetailItem.operadores.map((op) => (
                  <div 
                    key={op.loginBB} 
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{op.loginBB}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{op.nome}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Supervisor: {op.supervisor || 'N/A'} | Célula: {op.segmento || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={op.statusPresenca || 'Presente'}
                        onChange={(e) => handleToggleOperatorPresence(op.loginBB, e.target.value as any)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border ${
                          op.statusPresenca === 'Presente'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : op.statusPresenca === 'Dispensado'
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Presente">Presente</option>
                        <option value="Dispensado">Dispensado</option>
                        <option value="Pendente">Pendente</option>
                      </select>

                      <button
                        onClick={() => handleRemoveOperatorFromDetail(op.loginBB)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Remover operador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Concluído
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <PasswordConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteAlinhamentoTabulador(deletingId);
        }}
        title="Confirmar Exclusão do Tabulador"
        itemDescription="este registro de treinamento"
      />

    </div>
  );
};
