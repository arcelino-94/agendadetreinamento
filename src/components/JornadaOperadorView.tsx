import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  UserCheck, 
  UserX, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  FileSpreadsheet,
  Filter,
  Zap,
  CloudOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OpInfo {
  loginBB: string;
  nome: string;
  matDP: string;
  supervisor: string;
  gerente: string;
  segmento: string;
  isAtivoNoQuadro: boolean;
}

export const JornadaOperadorView: React.FC = () => {
  const { operadores, tabulador, celulas, frequenciasNotas, isItemPendingSync } = useApp();

  // Search input state
  const [selectedLogin, setSelectedLogin] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Filters for operator timeline
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Build combined list of all known operators from both Quadro (active) and Tabulador (history)
  const allOperatorsMap = useMemo(() => {
    const map = new Map<string, OpInfo>();

    // 1. Add operators from current Quadro
    operadores.forEach(op => {
      if (op.loginBB) {
        const cleanLogin = op.loginBB.trim().toUpperCase();
        map.set(cleanLogin, {
          loginBB: cleanLogin,
          nome: op.nome || 'Sem Nome',
          matDP: op.matDP || 'N/A',
          supervisor: op.supervisor || 'N/A',
          gerente: op.gerente || 'N/A',
          segmento: op.segmento || 'GERAL',
          isAtivoNoQuadro: true
        });
      }
    });

    // 2. Add historical operators from Tabulador if not already in Quadro
    tabulador.forEach(tab => {
      (tab.operadores || []).forEach(op => {
        if (op.loginBB) {
          const cleanLogin = op.loginBB.trim().toUpperCase();
          if (!map.has(cleanLogin)) {
            map.set(cleanLogin, {
              loginBB: cleanLogin,
              nome: op.nome && op.nome !== 'login não localizado no quadro' ? op.nome : `OPERADOR ${cleanLogin}`,
              matDP: op.matDP || 'N/A',
              supervisor: op.supervisor || 'N/A',
              gerente: op.gerente || 'N/A',
              segmento: op.segmento || tab.celula || 'GERAL',
              isAtivoNoQuadro: false
            });
          }
        }
      });
    });

    // 3. Add historical operators from Frequencias e Notas if not already in map
    if (frequenciasNotas && Array.isArray(frequenciasNotas)) {
      frequenciasNotas.forEach(freq => {
        (freq.alunos || []).forEach(op => {
          if (op.loginBB) {
            const cleanLogin = op.loginBB.trim().toUpperCase();
            if (!map.has(cleanLogin)) {
              map.set(cleanLogin, {
                loginBB: cleanLogin,
                nome: op.nome || `OPERADOR ${cleanLogin}`,
                matDP: op.matDP || 'N/A',
                supervisor: op.supervisor || 'N/A',
                gerente: op.gerente || 'N/A',
                segmento: op.celula || (freq.celulas && freq.celulas[0]) || 'GERAL',
                isAtivoNoQuadro: false
              });
            }
          }
        });
      });
    }

    return map;
  }, [operadores, tabulador]);

  // Convert map to sorted array for search dropdown
  const allOperatorsList = useMemo<OpInfo[]>(() => {
    return (Array.from(allOperatorsMap.values()) as OpInfo[]).sort((a, b) => a.loginBB.localeCompare(b.loginBB));
  }, [allOperatorsMap]);

  // Auto-select first operator if none selected
  const activeOperator = useMemo(() => {
    if (selectedLogin) {
      return allOperatorsMap.get(selectedLogin.trim().toUpperCase());
    }
    return allOperatorsList[0] || null;
  }, [selectedLogin, allOperatorsMap, allOperatorsList]);

  // Filter dropdown suggestions based on search input
  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const q = searchInput.toLowerCase().trim();
    return allOperatorsList.filter(op => 
      op.loginBB.toLowerCase().includes(q) ||
      op.nome.toLowerCase().includes(q) ||
      op.matDP.toLowerCase().includes(q) ||
      op.supervisor.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchInput, allOperatorsList]);

  // Collect all training events for the active operator across Tabulador and Frequencias
  const operatorJourney = useMemo(() => {
    if (!activeOperator) return [];

    const targetLogin = activeOperator.loginBB.toUpperCase();
    const events: Array<{
      id: string;
      data: string;
      horario: string;
      treinamento: string;
      solicitante: string;
      celula: string;
      multiplicador: string;
      local: string;
      statusPresenca: string;
      tipoAusencia?: string;
      cargaHoraria: string;
      tipo: 'Alinhamento' | 'Reciclagem' | 'Sinergia' | 'Novatos' | 'Migração' | 'Outro';
      observacoes?: string;
      frequencia?: number;
      nota?: number;
    }> = [];

    // 1. From Tabulador (Alinhamentos, Reciclagens, Sinergias)
    tabulador.forEach(tab => {
      const matchOp = (tab.operadores || []).find(o => o.loginBB.toUpperCase() === targetLogin);
      if (matchOp) {
        let tipo: 'Alinhamento' | 'Reciclagem' | 'Sinergia' | 'Novatos' | 'Outro' = 'Alinhamento';
        const trainLower = (tab.treinamento || '').toLowerCase();
        if (trainLower.includes('recicl')) tipo = 'Reciclagem';
        else if (trainLower.includes('sinerg')) tipo = 'Sinergia';
        else if (trainLower.includes('novat') || trainLower.includes('integra')) tipo = 'Novatos';

        events.push({
          id: `tab-${tab.id}-${matchOp.loginBB}`,
          data: matchOp.dataPresenca || tab.data,
          horario: matchOp.horario || 'N/A',
          treinamento: tab.treinamento,
          solicitante: tab.solicitante || 'OPERAÇÃO / T&D/BB',
          celula: matchOp.segmento || tab.celula,
          multiplicador: matchOp.multiplicador || 'Sem Multiplicador',
          local: matchOp.local || 'Ilha Operacional',
          statusPresenca: matchOp.statusPresenca || 'Presente',
          tipoAusencia: matchOp.tipoAusencia,
          cargaHoraria: tab.cargaHoraria || '0:20:00',
          tipo,
          observacoes: tab.observacoes
        });
      }
    });

    // 2. From Frequencias e Notas if available
    if (frequenciasNotas && Array.isArray(frequenciasNotas)) {
      frequenciasNotas.forEach(freq => {
        if (freq.alunos && Array.isArray(freq.alunos)) {
          const matchOp = freq.alunos.find(o => o.loginBB && o.loginBB.toUpperCase() === targetLogin);
          if (matchOp) {
            events.push({
              id: `freq-${freq.id}-${matchOp.loginBB}`,
              data: freq.dataInicio || new Date().toISOString().split('T')[0],
              horario: 'N/A',
              treinamento: freq.treinamento || 'Treinamento de Turma',
              solicitante: 'T&D/BB',
              celula: matchOp.celula || freq.celulas[0] || 'GERAL',
              multiplicador: freq.multiplicador || 'T&D',
              local: 'Sala de Treinamento',
              statusPresenca: matchOp.statusAprovacao === 'Reprovado' ? 'Abaixo da Frequência' : (matchOp.frequenciaPercent >= 75 ? 'Presente' : 'Abaixo da Frequência'),
              cargaHoraria: freq.cargaHoraria || '04:00:00',
              tipo: freq.tipo === 'Novatos' ? 'Novatos' : freq.tipo === 'Sinergia' ? 'Sinergia' : 'Outro',
              frequencia: matchOp.frequenciaPercent,
              nota: matchOp.notaFinal
            });
          }
        }
      });
    }

    // Sort chronologically (newest first)
    return events.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [activeOperator, tabulador, frequenciasNotas]);

  // Filtered journey events
  const filteredJourney = useMemo(() => {
    return operatorJourney.filter(e => {
      const matchType = filterType === 'todos' || e.tipo.toLowerCase() === filterType.toLowerCase();
      const matchStatus = filterStatus === 'todos' || e.statusPresenca.toLowerCase() === filterStatus.toLowerCase();
      return matchType && matchStatus;
    });
  }, [operatorJourney, filterType, filterStatus]);

  // Metrics calculations
  const totalTrainings = operatorJourney.length;
  const totalPresentes = operatorJourney.filter(e => e.statusPresenca === 'Presente').length;
  const aderenciaPct = totalTrainings > 0 ? Math.round((totalPresentes / totalTrainings) * 100) : 0;

  // Calculate total hours
  const totalHorasStr = useMemo(() => {
    let totalMinutes = 0;
    operatorJourney.forEach(e => {
      if (e.statusPresenca === 'Presente' && e.cargaHoraria) {
        const parts = e.cargaHoraria.split(':').map(Number);
        if (parts.length >= 2) {
          totalMinutes += (parts[0] || 0) * 60 + (parts[1] || 0);
        }
      }
    });
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  }, [operatorJourney]);

  // List of unique Sinergias the active operator possesses
  const operatorSinergias = useMemo(() => {
    if (!operatorJourney || operatorJourney.length === 0) return [];
    const list: string[] = [];
    operatorJourney.forEach(e => {
      if (e.tipo === 'Sinergia' || e.treinamento.toLowerCase().includes('sinergia')) {
        let title = e.treinamento;
        if (title.toUpperCase().startsWith('SINERGIA - ')) {
          title = title.substring(11);
        } else if (title.toUpperCase().startsWith('SINERGIA ')) {
          title = title.substring(9);
        }
        if (!list.includes(title)) {
          list.push(title);
        }
      }
    });
    return list;
  }, [operatorJourney]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!activeOperator) return;
    const headers = ['DATA', 'HORA', 'TREINAMENTO', 'TIPO', 'SOLICITANTE', 'CELULA', 'MULTIPLICADOR', 'LOCAL', 'STATUS', 'CARGA HORARIA'];
    const rows = filteredJourney.map(e => [
      `"${e.data}"`,
      `"${e.horario}"`,
      `"${e.treinamento.replace(/"/g, '""')}"`,
      `"${e.tipo}"`,
      `"${e.solicitante.replace(/"/g, '""')}"`,
      `"${e.celula.replace(/"/g, '""')}"`,
      `"${e.multiplicador.replace(/"/g, '""')}"`,
      `"${e.local.replace(/"/g, '""')}"`,
      `"${e.statusPresenca}"`,
      `"${e.cargaHoraria}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jornada_Operador_${activeOperator.loginBB}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Jornada do Operador
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                Histórico de Capacitações
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consulte a trajetória completa de treinamentos, alinhamentos, reciclagens e novatos de cada operador.
            </p>
          </div>
        </div>

        {/* SEARCH & SELECT OPERATOR BAR */}
        <div className="relative w-full md:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Digite o Login BB, Nome ou Mat DP..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
            />
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {searchSuggestions.map((op) => (
                <button
                  key={op.loginBB}
                  type="button"
                  onClick={() => {
                    setSelectedLogin(op.loginBB);
                    setSearchInput('');
                  }}
                  className="w-full text-left p-2.5 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-2">{op.loginBB}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{op.nome}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    op.isAtivoNoQuadro ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {op.isAtivoNoQuadro ? 'Ativo' : 'Histórico'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OPERATOR PROFILE & SUMMARY CARD */}
      {activeOperator ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* OPERATOR DETAILS */}
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                  {activeOperator.loginBB.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {activeOperator.nome}
                    </h3>
                    {activeOperator.isAtivoNoQuadro ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                        Ativo no Quadro
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <UserX className="w-3 h-3 mr-1 text-amber-600" />
                        Histórico / Excluído do Quadro
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    <span>Login: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{activeOperator.loginBB}</strong></span>
                    <span>Mat. DP: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeOperator.matDP}</strong></span>
                    <span>Supervisor: <strong className="text-slate-700 dark:text-slate-300">{activeOperator.supervisor}</strong></span>
                    <span>Gerente: <strong className="text-slate-700 dark:text-slate-300">{activeOperator.gerente}</strong></span>
                    <span>Célula: <strong className="text-slate-700 dark:text-slate-300">{activeOperator.segmento}</strong></span>
                  </div>

                  {/* SINERGIAS QUE POSSUI (LOGO ABAIXO DA CÉLULA) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center space-x-1 mr-1">
                      <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-100 dark:fill-purple-900" />
                      <span>Sinergias que Possui:</span>
                    </span>
                    {operatorSinergias.length > 0 ? (
                      operatorSinergias.map((sin, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                          {sin}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 italic">
                        Sem sinergia cadastrada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* QUICK SELECTOR DROPDOWN & ACTIONS */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={activeOperator.loginBB}
                  onChange={(e) => setSelectedLogin(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                >
                  {allOperatorsList.map(op => (
                    <option key={op.loginBB} value={op.loginBB}>
                      {op.loginBB} - {op.nome} {op.isAtivoNoQuadro ? '' : '(Histórico)'}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                  title="Exportar dados da jornada para CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  title="Imprimir Ficha da Jornada"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* METRICS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total de Treinamentos</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">{totalTrainings}</span>
              </div>

              <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Presenças Confirmadas</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{totalPresentes} ({aderenciaPct}%)</span>
              </div>

              <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60">
                <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Horas de Carga Horária</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{totalHorasStr}</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Último Treinamento</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                  {operatorJourney[0] ? `${operatorJourney[0].data} (${operatorJourney[0].treinamento})` : 'Nenhum registro'}
                </span>
              </div>
            </div>
          </div>

          {/* TIMELINE CONTROLS & FILTER BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                <span>Filtrar Tipo:</span>
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-medium"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="alinhamento">Alinhamentos</option>
                <option value="reciclagem">Reciclagens</option>
                <option value="sinergia">Sinergias</option>
                <option value="novatos">Novatos / Integração</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="font-bold text-slate-600 dark:text-slate-300">Status Presença:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="presente">Presente</option>
                <option value="dispensado">Dispensado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* HISTÓRICO / TIMELINE TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <th className="px-3 py-2.5 w-28">Data / Hora</th>
                    <th className="px-3 py-2.5 min-w-48">Treinamento / Tema</th>
                    <th className="px-3 py-2.5 w-28">Tipo</th>
                    <th className="px-3 py-2.5 w-36">Célula / Segmento</th>
                    <th className="px-3 py-2.5 w-36">Multiplicador</th>
                    <th className="px-3 py-2.5 w-28">Local</th>
                    <th className="px-3 py-2.5 w-28 text-center">Presença</th>
                    <th className="px-3 py-2.5 w-24 text-center">Carga Horária</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJourney.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400 italic">
                        Nenhum registro de treinamento encontrado para este operador com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredJourney.map((e) => (
                      <tr key={e.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                          {e.data} <span className="text-[10px] text-slate-400 font-normal">({e.horario})</span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <span>{e.treinamento}</span>
                            {isItemPendingSync(e.id) && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-1 shrink-0" title="Salvo localmente na máquina, pendente de sincronizar no Firestore">
                                <CloudOff className="w-2.5 h-2.5" />
                                <span>Pendente</span>
                              </span>
                            )}
                          </div>
                          {e.frequencia !== undefined && (
                            <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-normal mt-0.5">
                              Freq: {e.frequencia}% | Nota: {e.nota ?? 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            e.tipo === 'Alinhamento' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                            e.tipo === 'Reciclagem' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            e.tipo === 'Sinergia' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {e.tipo}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{e.celula}</td>
                        <td className="px-3 py-2.5 font-medium text-indigo-700 dark:text-indigo-300">{e.multiplicador}</td>
                        <td className="px-3 py-2.5 text-slate-500">{e.local}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            e.statusPresenca === 'Presente' || e.statusPresenca === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            e.statusPresenca === 'Dispensado' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                            e.statusPresenca === 'Reprovado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {e.statusPresenca} {e.tipoAusencia ? `(${e.tipoAusencia})` : ''}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-slate-600 dark:text-slate-400 font-bold">
                          {e.cargaHoraria}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
          Nenhum operador encontrado na base de dados.
        </div>
      )}
    </div>
  );
};
