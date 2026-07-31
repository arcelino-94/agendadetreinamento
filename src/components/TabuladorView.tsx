import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
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
  FileSpreadsheet,
  UserPlus,
  Filter,
  Printer,
  ChevronDown,
  RotateCcw
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

// Reusable Excel-style Multi-Select Checkbox Dropdown Filter Component
interface ExcelMultiSelectFilterProps {
  label: string;
  options: string[];
  selectedValues: string[]; // Empty array [] means ALL selected (no filter applied)
  onChange: (newSelected: string[]) => void;
  align?: 'left' | 'right';
  className?: string;
}

const ExcelMultiSelectFilter: React.FC<ExcelMultiSelectFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  align = 'left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isFiltered = selectedValues.length > 0 && !selectedValues.includes('__ALL__');
  const isNoneSelected = selectedValues.length === 1 && selectedValues[0] === '__NONE__';

  const visibleOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, search]);

  const handleToggleSelectAll = () => {
    if (isFiltered || isNoneSelected) {
      onChange([]); // select all
    } else {
      onChange(['__NONE__']); // unselect all
    }
  };

  const handleToggleOption = (opt: string) => {
    if (!isFiltered && !isNoneSelected) {
      // Currently all options are selected. Unchecking this option means selecting all EXCEPT this option
      const newSelected = options.filter(o => o !== opt);
      onChange(newSelected);
      return;
    }

    if (isNoneSelected) {
      // Nothing was selected. Checking this option selects only this option
      onChange([opt]);
      return;
    }

    if (selectedValues.includes(opt)) {
      // Remove option
      const newSelected = selectedValues.filter(o => o !== opt);
      if (newSelected.length === 0) {
        onChange(['__NONE__']); // none selected
      } else {
        onChange(newSelected);
      }
    } else {
      // Add option
      const newSelected = [...selectedValues, opt];
      if (newSelected.length >= options.length) {
        onChange([]); // all selected
      } else {
        onChange(newSelected);
      }
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearch('');
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left text-[10px] font-extrabold uppercase px-2 py-1.5 rounded flex items-center justify-between space-x-1 border transition-all ${
          isFiltered || isNoneSelected
            ? 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600 shadow-xs'
            : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'
        }`}
      >
        <span className="truncate">{label}</span>
        <div className="flex items-center space-x-1 shrink-0">
          {(isFiltered || isNoneSelected) && (
            <span className="bg-amber-500 text-slate-950 px-1 py-0.2 rounded text-[9px] font-black">
              {isNoneSelected ? 0 : selectedValues.length}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${isFiltered || isNoneSelected ? 'text-amber-600 dark:text-amber-300' : 'text-slate-300'}`} />
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1 ${align === 'right' ? 'right-0' : 'left-0'} z-50 w-64 bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl shadow-2xl p-2.5 text-slate-900 dark:text-white text-xs space-y-2`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black">
            <span className="text-indigo-900 dark:text-indigo-300 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Filtrar {label}</span>
            </span>
            {(isFiltered || isNoneSelected) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-amber-600 hover:underline text-[10px] font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Search inside Dropdown */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder={`Pesquisar ${label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[11px] pl-7 pr-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Options with Checkboxes */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-medium text-[11px]">
            <label className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer font-bold border-b border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                checked={!isFiltered && !isNoneSelected}
                onChange={handleToggleSelectAll}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>(Selecionar Tudo)</span>
            </label>

            {visibleOptions.map((opt) => {
              const isChecked = (!isFiltered && !isNoneSelected) || selectedValues.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer truncate"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleOption(opt)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="truncate">{opt}</span>
                </label>
              );
            })}

            {visibleOptions.length === 0 && (
              <p className="p-2 text-slate-400 italic text-center text-[10px]">
                Nenhuma opção encontrada
              </p>
            )}
          </div>

          {/* Close Footer */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] shadow-xs"
            >
              OK / Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TabuladorView: React.FC = () => {
  const { 
    tabulador, 
    addAlinhamentoTabulador, 
    updateAlinhamentoTabulador,
    deleteAlinhamentoTabulador, 
    celulas,
    multiplicadores,
    operadores,
    getOperadorByLogin
  } = useApp();

  // Selected Month and Year Picklists (default '07' / '2026')
  const [selectedMonthNum, setSelectedMonthNum] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCelula, setSelectedCelula] = useState('todos');

  // Main Tabulador Table Column Multi-Select Filters
  const [tabFilterTreinamento, setTabFilterTreinamento] = useState<string[]>([]);
  const [tabFilterSolicitante, setTabFilterSolicitante] = useState<string[]>([]);
  const [tabFilterCelula, setTabFilterCelula] = useState<string[]>([]);
  const [tabFilterConvocados, setTabFilterConvocados] = useState<string[]>([]);
  const [tabFilterPresentes, setTabFilterPresentes] = useState<string[]>([]);
  const [tabFilterDispensado, setTabFilterDispensado] = useState<string[]>([]);
  const [tabFilterPendentes, setTabFilterPendentes] = useState<string[]>([]);
  const [tabFilterHorasTrein, setTabFilterHorasTrein] = useState<string[]>([]);
  const [tabFilterCH, setTabFilterCH] = useState<string[]>([]);
  const [tabFilterPercentual, setTabFilterPercentual] = useState<string[]>([]);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlinhamentoTabulador | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    treinamento: '',
    solicitante: 'OPERAÇÃO / T&D/BB',
    celula: 'SAC PRIORITÁRIO',
    selectedCelulas: ['SAC PRIORITÁRIO'] as string[],
    convocados: 20,
    presentes: 20,
    dispensado: 0,
    cargaHoraria: '0:20:00',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
    status: 'Concluído' as 'Pendente' | 'Concluído'
  });

  // Modal 1: Dedicated Full Alignment Details Table View
  const [viewingFullAlignment, setViewingFullAlignment] = useState<AlinhamentoTabulador | null>(null);

  // Excel-style Multi-Select Checkbox Column Filters inside viewingFullAlignment
  const [colFilterLogin, setColFilterLogin] = useState<string[]>([]);
  const [colFilterNome, setColFilterNome] = useState<string[]>([]);
  const [colFilterSupervisor, setColFilterSupervisor] = useState<string[]>([]);
  const [colFilterGerente, setColFilterGerente] = useState<string[]>([]);
  const [colFilterSegmento, setColFilterSegmento] = useState<string[]>([]);
  const [colFilterMultiplicador, setColFilterMultiplicador] = useState<string[]>([]);
  const [colFilterLocal, setColFilterLocal] = useState<string[]>([]);
  const [colFilterStatus, setColFilterStatus] = useState<string[]>([]);

  // Reset alignment column filters when opening a new alignment
  useEffect(() => {
    if (viewingFullAlignment) {
      setColFilterLogin([]);
      setColFilterNome([]);
      setColFilterSupervisor([]);
      setColFilterGerente([]);
      setColFilterSegmento([]);
      setColFilterMultiplicador([]);
      setColFilterLocal([]);
      setColFilterStatus([]);
    }
  }, [viewingFullAlignment?.id]);

  // Modal 2: Bulk Include Operators ("Incluir em Massa") Modal
  const [bulkIncludeItem, setBulkIncludeItem] = useState<AlinhamentoTabulador | null>(null);
  const [bulkLoginsText, setBulkLoginsText] = useState('');
  const [bulkData, setBulkData] = useState(new Date().toISOString().split('T')[0]);
  const [bulkMultiplicador, setBulkMultiplicador] = useState(multiplicadores[0]?.nome || 'JOSE LEANDRO');
  const [bulkHora, setBulkHora] = useState('09:00');
  const [bulkLocal, setBulkLocal] = useState('Ilha Operacional');
  const [bulkStatus, setBulkStatus] = useState<'Presente' | 'Pendente' | 'Dispensado'>('Presente');
  const [bulkTipoAusencia, setBulkTipoAusencia] = useState('');

  // Delete Password Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Options for Main Tabulador Table Filters
  const optionsTabTreinamento = useMemo(() => Array.from(new Set(tabulador.map(t => t.treinamento).filter(Boolean))).sort(), [tabulador]);
  const optionsTabSolicitante = useMemo(() => Array.from(new Set(tabulador.map(t => t.solicitante || 'OPERAÇÃO / T&D/BB'))).sort(), [tabulador]);
  const optionsTabCelula = useMemo(() => Array.from(new Set(tabulador.map(t => t.celula).filter(Boolean))).sort(), [tabulador]);
  const optionsTabConvocados = useMemo(() => Array.from(new Set(tabulador.map(t => String(t.convocados)))).sort(), [tabulador]);
  const optionsTabPresentes = useMemo(() => Array.from(new Set(tabulador.map(t => String(t.presentes)))).sort(), [tabulador]);
  const optionsTabDispensado = useMemo(() => Array.from(new Set(tabulador.map(t => String(t.dispensado)))).sort(), [tabulador]);
  const optionsTabPendentes = useMemo(() => Array.from(new Set(tabulador.map(t => String(t.pendentes)))).sort(), [tabulador]);
  const optionsTabHorasTrein = useMemo(() => Array.from(new Set(tabulador.map(t => t.horasTreinamento || '0:00:00'))).sort(), [tabulador]);
  const optionsTabCH = useMemo(() => Array.from(new Set(tabulador.map(t => t.cargaHoraria || '0:00:00'))).sort(), [tabulador]);
  const optionsTabPercentual = useMemo(() => Array.from(new Set(tabulador.map(t => `${t.percentual}%`))).sort(), [tabulador]);

  // Computed filtered Tabulador list
  const filteredTabulador = useMemo(() => {
    return tabulador.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const treinamentoStr = (item.treinamento || '').toLowerCase();
      const solicitanteStr = (item.solicitante || '').toLowerCase();
      const celulaStr = (item.celula || '').toLowerCase();

      const matchSearch = 
        treinamentoStr.includes(q) ||
        solicitanteStr.includes(q) ||
        celulaStr.includes(q);

      const matchCelula = selectedCelula === 'todos' || celulaStr.includes(selectedCelula.toLowerCase());

      // Date parsing for month and year picklists
      let itemMonth = '';
      let itemYear = '';
      if (item.data) {
        if (item.data.includes('-')) {
          const parts = item.data.split('-');
          itemYear = parts[0];
          itemMonth = parts[1]?.padStart(2, '0') || '';
        } else if (item.data.includes('/')) {
          const [mStr, yStr] = item.data.toLowerCase().split('/');
          const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const idx = monthNames.indexOf(mStr);
          if (idx >= 0) itemMonth = (idx + 1).toString().padStart(2, '0');
          if (yStr) itemYear = yStr.length === 2 ? `20${yStr}` : yStr;
        }
      }

      const matchMonth = selectedMonthNum === 'todos' || 
        (selectedMonthNum === 'em_branco' ? !itemMonth : itemMonth === selectedMonthNum);

      const matchYear = selectedYear === 'todos' || 
        (selectedYear === 'em_branco' ? !itemYear : itemYear === selectedYear);

      const matchTabTrein = tabFilterTreinamento.length === 0 || tabFilterTreinamento.includes(item.treinamento);
      const matchTabSolic = tabFilterSolicitante.length === 0 || tabFilterSolicitante.includes(item.solicitante || 'OPERAÇÃO / T&D/BB');
      const matchTabCel = tabFilterCelula.length === 0 || tabFilterCelula.includes(item.celula);
      const matchTabConv = tabFilterConvocados.length === 0 || tabFilterConvocados.includes(String(item.convocados));
      const matchTabPres = tabFilterPresentes.length === 0 || tabFilterPresentes.includes(String(item.presentes));
      const matchTabDisp = tabFilterDispensado.length === 0 || tabFilterDispensado.includes(String(item.dispensado));
      const matchTabPend = tabFilterPendentes.length === 0 || tabFilterPendentes.includes(String(item.pendentes));
      const matchTabHoras = tabFilterHorasTrein.length === 0 || tabFilterHorasTrein.includes(item.horasTreinamento || '0:00:00');
      const matchTabCH = tabFilterCH.length === 0 || tabFilterCH.includes(item.cargaHoraria || '0:00:00');
      const matchTabPct = tabFilterPercentual.length === 0 || tabFilterPercentual.includes(`${item.percentual}%`);

      return matchSearch && matchCelula && matchMonth && matchYear && matchTabTrein && matchTabSolic && matchTabCel && matchTabConv && matchTabPres && matchTabDisp && matchTabPend && matchTabHoras && matchTabCH && matchTabPct;
    });
  }, [
    tabulador, 
    searchTerm, 
    selectedCelula, 
    selectedMonthNum, 
    selectedYear,
    tabFilterTreinamento, 
    tabFilterSolicitante, 
    tabFilterCelula, 
    tabFilterConvocados,
    tabFilterPresentes,
    tabFilterDispensado,
    tabFilterPendentes,
    tabFilterHorasTrein,
    tabFilterCH,
    tabFilterPercentual
  ]);

  // Options for Viewing Operators Modal
  const opList = useMemo(() => viewingFullAlignment?.operadores || [], [viewingFullAlignment]);

  const optionsLogin = useMemo(() => Array.from(new Set(opList.map(o => o.loginBB).filter(Boolean))).sort(), [opList]);
  const optionsNome = useMemo(() => Array.from(new Set(opList.map(o => o.nome).filter(Boolean))).sort(), [opList]);
  const optionsSupervisor = useMemo(() => Array.from(new Set(opList.map(o => o.supervisor || 'N/A'))).sort(), [opList]);
  const optionsGerente = useMemo(() => Array.from(new Set(opList.map(o => o.gerente || 'N/A'))).sort(), [opList]);
  const optionsSegmento = useMemo(() => Array.from(new Set(opList.map(o => o.segmento || viewingFullAlignment?.celula || 'N/A'))).sort(), [opList, viewingFullAlignment]);
  const optionsMultiplicador = useMemo(() => Array.from(new Set(opList.map(o => o.multiplicador || 'T&D/BB'))).sort(), [opList]);
  const optionsLocal = useMemo(() => Array.from(new Set(opList.map(o => o.local || 'Ilha Operacional'))).sort(), [opList]);

  // Collected Status Options including standard statuses and custom absence types (Atestado, Férias, etc.)
  const optionsStatus = useMemo(() => {
    const set = new Set<string>();
    opList.forEach(o => {
      if (o.statusPresenca) set.add(o.statusPresenca);
      if (o.tipoAusencia) set.add(o.tipoAusencia);
    });
    ['Presente', 'Pendente', 'Dispensado', 'Atestado', 'Férias', 'ABS', 'TO', 'INSS', 'LMG'].forEach(s => set.add(s));
    return Array.from(set).sort();
  }, [opList]);

  // Filtered operators for Full Alignment View (Supporting Excel Multi-Select Checkboxes)
  const filteredAlignmentOperators = useMemo(() => {
    if (!viewingFullAlignment) return [];
    return (viewingFullAlignment.operadores || []).filter(op => {
      const opLogin = op.loginBB || '';
      const opNome = op.nome || '';
      const opSup = op.supervisor || 'N/A';
      const opGer = op.gerente || 'N/A';
      const opSeg = op.segmento || viewingFullAlignment.celula || 'N/A';
      const opMulti = op.multiplicador || 'T&D/BB';
      const opLocal = op.local || 'Ilha Operacional';
      const opStatus = op.statusPresenca || 'Presente';
      const opAusencia = op.tipoAusencia || '';

      const matchLogin = colFilterLogin.length === 0 || colFilterLogin.includes('__NONE__') ? colFilterLogin.length === 0 : colFilterLogin.includes(opLogin) || colFilterLogin.includes(op.matDP || '');
      const matchNome = colFilterNome.length === 0 || colFilterNome.includes('__NONE__') ? colFilterNome.length === 0 : colFilterNome.includes(opNome);
      const matchSup = colFilterSupervisor.length === 0 || colFilterSupervisor.includes('__NONE__') ? colFilterSupervisor.length === 0 : colFilterSupervisor.includes(opSup);
      const matchGer = colFilterGerente.length === 0 || colFilterGerente.includes('__NONE__') ? colFilterGerente.length === 0 : colFilterGerente.includes(opGer);
      const matchSeg = colFilterSegmento.length === 0 || colFilterSegmento.includes('__NONE__') ? colFilterSegmento.length === 0 : colFilterSegmento.includes(opSeg);
      const matchMulti = colFilterMultiplicador.length === 0 || colFilterMultiplicador.includes('__NONE__') ? colFilterMultiplicador.length === 0 : colFilterMultiplicador.includes(opMulti);
      const matchLocal = colFilterLocal.length === 0 || colFilterLocal.includes('__NONE__') ? colFilterLocal.length === 0 : colFilterLocal.includes(opLocal);

      let matchStatus = true;
      if (colFilterStatus.length > 0) {
        if (colFilterStatus.includes('__NONE__')) {
          matchStatus = false;
        } else {
          matchStatus = 
            colFilterStatus.includes(opStatus) ||
            (opAusencia !== '' && colFilterStatus.includes(opAusencia));
        }
      }

      return matchLogin && matchNome && matchSup && matchGer && matchSeg && matchMulti && matchLocal && matchStatus;
    });
  }, [
    viewingFullAlignment, 
    colFilterLogin, 
    colFilterNome, 
    colFilterSupervisor, 
    colFilterGerente, 
    colFilterSegmento, 
    colFilterMultiplicador, 
    colFilterLocal, 
    colFilterStatus
  ]);

  // Overall metrics
  const totalConvocados = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.convocados || 0), 0), [filteredTabulador]);
  const totalPresentes = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.presentes || 0), 0), [filteredTabulador]);
  const totalDispensado = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.dispensado || 0), 0), [filteredTabulador]);
  const totalPendentes = useMemo(() => filteredTabulador.reduce((acc, curr) => acc + (curr.pendentes || (curr.convocados - curr.presentes - curr.dispensado)), 0), [filteredTabulador]);
  const mediaPercentual = useMemo(() => {
    if (totalConvocados === 0) return 0;
    return Math.round((totalPresentes / totalConvocados) * 100);
  }, [totalConvocados, totalPresentes]);

  // Handle Edit/Save Form
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
        presentes: 0,
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

  // Bulk Add Operators ("Incluir em Massa")
  const handleOpenBulkInclude = (item: AlinhamentoTabulador) => {
    setBulkIncludeItem(item);
    setBulkLoginsText('');
    setBulkData(item.data || new Date().toISOString().split('T')[0]);
    setBulkMultiplicador(multiplicadores[0]?.nome || 'MARIA CLARA');
    setBulkHora('09:00');
    setBulkLocal('Ilha Operacional');
    setBulkStatus('Pendente');
    setBulkTipoAusencia('Atestado');
  };

  const handleExecuteBulkInclude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkIncludeItem || !bulkLoginsText.trim()) return;

    const logins = bulkLoginsText
      .split(/[\s,;\n]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const existingOps = bulkIncludeItem.operadores || [];
    const newOps: OperadorAlinhamento[] = [...existingOps];

    logins.forEach(login => {
      const opQuadro = getOperadorByLogin(login);
      // Check existing entry for same login if updating
      const index = newOps.findIndex(o => o.loginBB.toUpperCase() === login);
      
      const newOpEntry: OperadorAlinhamento = {
        loginBB: login,
        nome: opQuadro ? opQuadro.nome : 'login não localizado no quadro',
        matDP: opQuadro ? opQuadro.matDP : (index >= 0 ? newOps[index].matDP : 'N/A'),
        supervisor: opQuadro ? opQuadro.supervisor : (index >= 0 ? newOps[index].supervisor : 'N/A'),
        gerente: opQuadro ? opQuadro.gerente : (index >= 0 ? newOps[index].gerente : 'N/A'),
        segmento: opQuadro ? opQuadro.segmento : (index >= 0 ? newOps[index].segmento : bulkIncludeItem.celula),
        dataPresenca: bulkData,
        horario: bulkHora,
        multiplicador: bulkMultiplicador || 'Sem Multiplicador',
        local: bulkLocal,
        statusPresenca: bulkStatus,
        tipoAusencia: bulkStatus !== 'Presente' ? bulkTipoAusencia : undefined
      };

      if (index >= 0) {
        newOps[index] = newOpEntry;
      } else {
        newOps.push(newOpEntry);
      }
    });

    const newConvocados = newOps.length;
    const newPresentes = newOps.filter(o => o.statusPresenca === 'Presente').length;
    const newDispensado = newOps.filter(o => o.statusPresenca === 'Dispensado').length;
    const newPendentes = Math.max(0, newConvocados - newPresentes - newDispensado);
    const newPercentual = newConvocados > 0 ? Math.round((newPresentes / newConvocados) * 100) : 0;
    const newHoras = calculateHorasTreinamento(newPresentes, bulkIncludeItem.cargaHoraria);

    updateAlinhamentoTabulador(bulkIncludeItem.id, {
      operadores: newOps,
      convocados: newConvocados,
      presentes: newPresentes,
      dispensado: newDispensado,
      pendentes: newPendentes,
      percentual: newPercentual,
      horasTreinamento: newHoras
    });

    setBulkIncludeItem(null);
  };

  // Export CSV for single alignment operators
  const handleExportAlignmentCSV = () => {
    if (!viewingFullAlignment) return;
    const headers = ['MAT_DP', 'LOGIN_BB', 'NOME', 'SUPERVISOR', 'GERENTE', 'CELULA', 'DATA', 'HORA', 'MULTIPLICADOR', 'LOCAL', 'STATUS', 'MOTIVO_AUSENCIA'];
    const rows = filteredAlignmentOperators.map(op => {
      let displayLogin = op.loginBB || '';
      let displayMat = op.matDP || '';
      if (displayMat.toUpperCase().startsWith('C') && !displayLogin.toUpperCase().startsWith('C')) {
        const tmp = displayLogin;
        displayLogin = displayMat;
        displayMat = tmp;
      }

      return [
        `"${displayMat || 'N/A'}"`,
        `"${displayLogin}"`,
        `"${op.nome.replace(/"/g, '""')}"`,
        `"${(op.supervisor || '').replace(/"/g, '""')}"`,
        `"${(op.gerente || '').replace(/"/g, '""')}"`,
        `"${(op.segmento || '').replace(/"/g, '""')}"`,
        `"${op.dataPresenca || viewingFullAlignment.data}"`,
        `"${op.horario || 'N/A'}"`,
        `"${(op.multiplicador || 'T&D/BB').replace(/"/g, '""')}"`,
        `"${(op.local || 'Ilha').replace(/"/g, '""')}"`,
        `"${op.statusPresenca || 'Presente'}"`,
        `"${(op.tipoAusencia || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Alinhamento_${viewingFullAlignment.treinamento.replace(/\s+/g, '_')}_Operadores.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for whole Tabulador
  const handleExportTabuladorCSV = () => {
    const headers = ['TREINAMENTO', 'SOLICITANTE', 'CELULA', 'CONVOCADOS', 'PRESENTES', 'DISPENSADO', 'PENDENTES', 'HORAS TREIN.', 'CH', '% ADERÊNCIA'];
    const rows = filteredTabulador.map(t => [
      `"${(t.treinamento || '').replace(/"/g, '""')}"`,
      `"${(t.solicitante || 'OPERAÇÃO / T&D/BB').replace(/"/g, '""')}"`,
      `"${(t.celula || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `Tabulador_Treinamentos_${selectedMonthNum}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPercentIcon = (pct: number) => {
    if (pct >= 80) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-2xs">
          ✓
        </span>
      );
    } else if (pct >= 50) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
          ➔
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-2xs">
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

          {/* Month & Year Selectors next to Search Field */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Período:</span>
            </span>

            {/* Mês Picklist */}
            <select
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(e.target.value)}
              className="px-2 py-1.5 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-200 outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
            >
              <option value="todos">TODOS OS MESES</option>
              <option value="01">01 - JANEIRO</option>
              <option value="02">02 - FEVEREIRO</option>
              <option value="03">03 - MARÇO</option>
              <option value="04">04 - ABRIL</option>
              <option value="05">05 - MAIO</option>
              <option value="06">06 - JUNHO</option>
              <option value="07">07 - JULHO</option>
              <option value="08">08 - AGOSTO</option>
              <option value="09">09 - SETEMBRO</option>
              <option value="10">10 - OUTUBRO</option>
              <option value="11">11 - NOVEMBRO</option>
              <option value="12">12 - DEZEMBRO</option>
              <option value="em_branco">MÊS EM BRANCO</option>
            </select>

            {/* Ano Picklist */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2 py-1.5 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-200 outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
            >
              <option value="todos">TODOS OS ANOS</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2027">2027</option>
              <option value="em_branco">ANO EM BRANCO</option>
            </select>
          </div>

          {/* Cell filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Célula:</span>
            <select
              value={selectedCelula}
              onChange={(e) => setSelectedCelula(e.target.value)}
              className="w-full sm:w-44 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
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
            onClick={handleExportTabuladorCSV}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
            title="Exportar dados do Tabulador para Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET TABLE - COMPACT WITHOUT HORIZONTAL OVERFLOW */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-900 dark:border-indigo-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse font-sans text-[11px]">
            <thead>
              <tr className="bg-indigo-900 dark:bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider border-b-2 border-yellow-400">
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Treinamento"
                    options={optionsTabTreinamento}
                    selectedValues={tabFilterTreinamento}
                    onChange={setTabFilterTreinamento}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Solicitante"
                    options={optionsTabSolicitante}
                    selectedValues={tabFilterSolicitante}
                    onChange={setTabFilterSolicitante}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Célula"
                    options={optionsTabCelula}
                    selectedValues={tabFilterCelula}
                    onChange={setTabFilterCelula}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Convocados"
                    options={optionsTabConvocados}
                    selectedValues={tabFilterConvocados}
                    onChange={setTabFilterConvocados}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Presentes"
                    options={optionsTabPresentes}
                    selectedValues={tabFilterPresentes}
                    onChange={setTabFilterPresentes}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Dispensado"
                    options={optionsTabDispensado}
                    selectedValues={tabFilterDispensado}
                    onChange={setTabFilterDispensado}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Pendentes"
                    options={optionsTabPendentes}
                    selectedValues={tabFilterPendentes}
                    onChange={setTabFilterPendentes}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="Horas Trein."
                    options={optionsTabHorasTrein}
                    selectedValues={tabFilterHorasTrein}
                    onChange={setTabFilterHorasTrein}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="CH"
                    options={optionsTabCH}
                    selectedValues={tabFilterCH}
                    onChange={setTabFilterCH}
                  />
                </th>
                <th className="px-1.5 py-1.5 border-r border-indigo-800/80">
                  <ExcelMultiSelectFilter
                    label="%"
                    options={optionsTabPercentual}
                    selectedValues={tabFilterPercentual}
                    onChange={setTabFilterPercentual}
                  />
                </th>
                <th className="px-2 py-1.5 text-center shrink-0 font-extrabold uppercase">AÇÕES</th>
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
                      {/* TREINAMENTO - CLICKABLE TO OPEN DEDICATED FULL TABLE */}
                      <td className="px-3 py-2.5 font-bold border-r border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => setViewingFullAlignment(item)}
                          className="flex items-center space-x-2 text-left text-indigo-900 dark:text-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-400 group transition-colors"
                          title="Clique para abrir a Tabela Completa de Operadores com Filtros Excel"
                        >
                          <span className="w-1.5 h-6 bg-indigo-600 group-hover:bg-amber-500 rounded-full shrink-0 transition-colors"></span>
                          <span className="line-clamp-2 uppercase group-hover:underline font-extrabold">{item.treinamento}</span>
                        </button>
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

                      {/* AÇÕES (INCLUIR EM MASSA BUTTON) */}
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenBulkInclude(item)}
                            className="flex items-center space-x-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shadow-2xs transition-colors"
                            title="Incluir Operadores em Massa neste Alinhamento"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Incluir</span>
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

      {/* DEDICATED FULL TABLE MODAL FOR SINGLE ALIGNMENT (CLICKING TITLE) */}
      {viewingFullAlignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-[96vw] max-w-[1720px] h-[92vh] flex flex-col overflow-hidden">
            
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-indigo-950 uppercase">
                    {viewingFullAlignment.celula}
                  </span>
                  <span className="text-xs text-indigo-200 font-mono">CH: {viewingFullAlignment.cargaHoraria}</span>
                </div>
                <h2 className="text-lg font-black tracking-tight mt-1 uppercase">
                  {viewingFullAlignment.treinamento}
                </h2>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Solicitante: <strong>{viewingFullAlignment.solicitante}</strong> | Horas Totais Treinadas: <strong>{viewingFullAlignment.horasTreinamento}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={handleExportAlignmentCSV}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/20"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Exportar Lista (CSV)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => setViewingFullAlignment(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* METRICS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-800/80 p-3 text-center border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Convocados</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{viewingFullAlignment.convocados}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Presentes</span>
                <span className="text-base font-black text-emerald-600">{viewingFullAlignment.presentes}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Dispensados</span>
                <span className="text-base font-black text-slate-600 dark:text-slate-300">{viewingFullAlignment.dispensado}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-amber-600 uppercase">Pendentes</span>
                <span className="text-base font-black text-amber-600">{viewingFullAlignment.pendentes}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-indigo-600 uppercase">% Aderência</span>
                <span className="text-base font-black text-indigo-600">{viewingFullAlignment.percentual}%</span>
              </div>
            </div>

            {/* EXCEL-STYLE DEDICATED TABLE WITH HEADER FILTERS */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase border-b border-slate-700">
                      <th className="p-1.5 border-r border-slate-700">
                        MATRÍCULA DP
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="LOGIN BB"
                          options={optionsLogin}
                          selectedValues={colFilterLogin}
                          onChange={setColFilterLogin}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="NOME OPERADOR"
                          options={optionsNome}
                          selectedValues={colFilterNome}
                          onChange={setColFilterNome}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="SUPERVISOR"
                          options={optionsSupervisor}
                          selectedValues={colFilterSupervisor}
                          onChange={setColFilterSupervisor}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="GERENTE"
                          options={optionsGerente}
                          selectedValues={colFilterGerente}
                          onChange={setColFilterGerente}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="SEGMENTO"
                          options={optionsSegmento}
                          selectedValues={colFilterSegmento}
                          onChange={setColFilterSegmento}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="MULTIPLICADOR"
                          options={optionsMultiplicador}
                          selectedValues={colFilterMultiplicador}
                          onChange={setColFilterMultiplicador}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700">
                        <ExcelMultiSelectFilter
                          label="LOCAL"
                          options={optionsLocal}
                          selectedValues={colFilterLocal}
                          onChange={setColFilterLocal}
                        />
                      </th>
                      <th className="p-1.5 border-r border-slate-700 text-center text-slate-300 font-extrabold uppercase">DATA / HORA</th>
                      <th className="p-1.5 text-center">
                        <ExcelMultiSelectFilter
                          label="STATUS PRESENÇA"
                          options={optionsStatus}
                          selectedValues={colFilterStatus}
                          onChange={setColFilterStatus}
                          align="right"
                        />
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {filteredAlignmentOperators.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                          Nenhum operador corresponde aos filtros aplicados nesta consulta.
                        </td>
                      </tr>
                    ) : (
                      filteredAlignmentOperators.map((op, idx) => {
                        let displayLogin = op.loginBB || '';
                        let displayMat = op.matDP || '';
                        if (displayMat.toUpperCase().startsWith('C') && !displayLogin.toUpperCase().startsWith('C')) {
                          const tmp = displayLogin;
                          displayLogin = displayMat;
                          displayMat = tmp;
                        }

                        return (
                          <tr key={`${displayLogin}-${idx}`} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/60">
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">
                              {displayMat || 'N/A'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                              {displayLogin || 'N/A'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                              {op.nome}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                              {op.supervisor || 'N/A'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 text-slate-500">
                              {op.gerente || 'N/A'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 text-slate-600">
                              {op.segmento || viewingFullAlignment.celula}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 font-medium text-indigo-800 dark:text-indigo-300">
                              {op.multiplicador || 'T&D/BB'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700">
                              {op.local || 'Ilha Operacional'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                              {op.dataPresenca || viewingFullAlignment.data} {op.horario || ''}
                            </td>
                            <td className="p-1.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                op.statusPresenca === 'Presente' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                op.statusPresenca === 'Dispensado' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {op.statusPresenca || 'Presente'} {op.tipoAusencia ? `(${op.tipoAusencia})` : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs shrink-0">
              <span className="text-slate-500 font-semibold">
                Exibindo {filteredAlignmentOperators.length} de {(viewingFullAlignment.operadores || []).length} operadores vinculados
              </span>
              <button
                onClick={() => setViewingFullAlignment(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
              >
                Fechar Tabela
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BULK INCLUDE OPERATORS MODAL ("INCLUIR EM MASSA") */}
      {bulkIncludeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleExecuteBulkInclude}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  Inclusão em Massa de Operadores
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                  {bulkIncludeItem.treinamento}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkIncludeItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cole os Logins dos Operadores (1 por linha ou separados por espaço/vírgula):
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="C1315137&#10;C1286562&#10;C1274287&#10;C1276914"
                  value={bulkLoginsText}
                  onChange={(e) => setBulkLoginsText(e.target.value)}
                  className="w-full p-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pelo prefixo "C" o sistema busca automaticamente os dados completos do operador (Supervisor, Gerente, Célula, Mat DP) no Quadro!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data do Alinhamento:
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horário de Realização:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 09:00"
                    value={bulkHora}
                    onChange={(e) => setBulkHora(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Multiplicador Responsável:
                  </label>
                  <select
                    value={bulkMultiplicador}
                    onChange={(e) => setBulkMultiplicador(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Sem Multiplicador">Sem Multiplicador</option>
                    {multiplicadores.map(m => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                    <option value="T&D / SUPORTE">T&D / SUPORTE GENERALISTA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Local / Lugar:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 1, Ilha Operacional"
                    value={bulkLocal}
                    onChange={(e) => setBulkLocal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status da Presença:
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Presente">Presente</option>
                    <option value="Pendente">Pendente (Atestado, Férias, ABS)</option>
                    <option value="Dispensado">Dispensado (TO, INSS, LMG)</option>
                  </select>
                </div>

                {bulkStatus === 'Pendente' && (
                  <div>
                    <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1">
                      Motivo Pendência:
                    </label>
                    <select
                      value={bulkTipoAusencia}
                      onChange={(e) => setBulkTipoAusencia(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-amber-700"
                    >
                      <option value="Atestado">Atestado Médico</option>
                      <option value="Férias">Férias</option>
                      <option value="ABS">ABS (Falta Injustificada)</option>
                    </select>
                  </div>
                )}

                {bulkStatus === 'Dispensado' && (
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Motivo Dispensa:
                    </label>
                    <select
                      value={bulkTipoAusencia}
                      onChange={(e) => setBulkTipoAusencia(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800"
                    >
                      <option value="TO">TO (Treinamento Ocupado)</option>
                      <option value="INSS">INSS</option>
                      <option value="LMG">LMG (Licença Maternidade/Gesta)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBulkIncludeItem(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirmar e Incluir Operadores
              </button>
            </div>

          </form>
        </div>
      )}

      {/* EDIT MODAL */}
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
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold uppercase text-slate-900 dark:text-white"
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
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Célula / Segmento:</label>
                  <input
                    type="text"
                    required
                    value={formData.celula}
                    onChange={(e) => setFormData({ ...formData, celula: e.target.value })}
                    placeholder="Ex: SAC PRIORITÁRIO ou Selecione abaixo"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, celula: 'TODAS AS CÉLULAS' })}
                      className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold rounded hover:bg-indigo-200"
                    >
                      + TODAS
                    </button>
                    {celulas.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (formData.celula === 'TODOS' || formData.celula === 'TODAS AS CÉLULAS') {
                            setFormData({ ...formData, celula: c.nome });
                          } else if (formData.celula.includes(c.nome)) {
                            // toggle off
                            const parts = formData.celula.split(', ').filter(p => p !== c.nome);
                            setFormData({ ...formData, celula: parts.join(', ') || 'TODAS' });
                          } else {
                            setFormData({
                              ...formData,
                              celula: formData.celula ? `${formData.celula}, ${c.nome}` : c.nome
                            });
                          }
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                          formData.celula.includes(c.nome) 
                            ? 'bg-indigo-600 text-white font-bold' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>
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
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white"
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
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Dispensados:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dispensado}
                    onChange={(e) => setFormData({ ...formData, dispensado: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Carga Horária (CH):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 0:20:00"
                    value={formData.cargaHoraria}
                    onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-1 mt-1">
                    {['0:15:00', '0:20:00', '0:30:00', '1:00:00', '2:00:00'].map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setFormData({ ...formData, cargaHoraria: ch })}
                        className="text-[9px] px-1 py-0.5 bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 font-mono rounded"
                      >
                        {ch.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data:</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações:</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
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

      {/* CONFIRMATION MODAL FOR DELETE */}
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
