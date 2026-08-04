import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  FilterX,
  Search,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperadorQuadro } from '../types';

export const QuadroOperadoresView: React.FC = () => {
  const { operadores, bulkSetOperadores, celulas, quadroLastUpdated } = useApp();

  // Excel-style Column Filters State
  const [filters, setFilters] = useState({
    matDP: '',
    loginBB: '',
    nome: '',
    supervisor: '',
    gerente: '',
    horarioEntrada: '',
    segmento: ''
  });

  // Modal Importar Em Lote
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawTsvText, setRawTsvText] = useState('');

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      matDP: '',
      loginBB: '',
      nome: '',
      supervisor: '',
      gerente: '',
      horarioEntrada: '',
      segmento: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(val => (val as string).trim() !== '');

  // Extract unique segments for dropdown
  const uniqueSegmentos = useMemo(() => {
    const set = new Set<string>();
    celulas.forEach(c => set.add(c.nome));
    operadores.forEach(op => {
      if (op.segmento) set.add(op.segmento);
    });
    return Array.from(set).sort();
  }, [celulas, operadores]);

  // Simultaneous multi-column filtering
  const filteredOperadores = useMemo(() => {
    return operadores.filter(op => {
      const matchMatDP = op.matDP.toLowerCase().includes(filters.matDP.toLowerCase().trim());
      const matchLoginBB = op.loginBB.toLowerCase().includes(filters.loginBB.toLowerCase().trim());
      const matchNome = op.nome.toLowerCase().includes(filters.nome.toLowerCase().trim());
      const matchSupervisor = op.supervisor.toLowerCase().includes(filters.supervisor.toLowerCase().trim());
      const matchGerente = op.gerente.toLowerCase().includes(filters.gerente.toLowerCase().trim());
      const matchEntrada = op.horarioEntrada.toLowerCase().includes(filters.horarioEntrada.toLowerCase().trim());
      const matchSegmento = !filters.segmento || op.segmento.toLowerCase() === filters.segmento.toLowerCase();

      return matchMatDP && matchLoginBB && matchNome && matchSupervisor && matchGerente && matchEntrada && matchSegmento;
    });
  }, [operadores, filters]);

  // Import / Update Handler - Resets previous operators and saves ONLY newly uploaded active operators
  const handleProcessImport = () => {
    if (!rawTsvText.trim()) return;
    const lines = rawTsvText.trim().split('\n');
    const parsedOps: OperadorQuadro[] = [];

    lines.forEach((line, idx) => {
      // Ignore header row if present
      if (idx === 0 && (line.toLowerCase().includes('mat') || line.toLowerCase().includes('login') || line.toLowerCase().includes('nome'))) {
        return;
      }
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 3) {
        parsedOps.push({
          id: `op-act-${Date.now()}-${idx}`,
          matDP: parts[0] || 'N/A',
          loginBB: (parts[1] || 'N/A').toUpperCase(),
          nome: parts[2] || 'Sem Nome',
          supervisor: parts[3] || 'N/A',
          gerente: parts[4] || 'N/A',
          horarioEntrada: parts[5] || '08:00:00',
          segmento: parts[6] || 'GERAL'
        });
      }
    });

    if (parsedOps.length > 0) {
      // Replaces completely with newly parsed active operators
      bulkSetOperadores(parsedOps);
      setIsImportModalOpen(false);
      setRawTsvText('');
      alert(`Quadro zerado e atualizado com sucesso! Total de ${parsedOps.length} operadores ativos registrados.`);
    } else {
      alert('Nenhum operador válido encontrado. Certifique-se de colar os dados no formato Excel/TSV (separados por TAB).');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Quadro de Operadores Ativos
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                {operadores.length} Ativos
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Base oficial da operação. Atualize via cola/arquivo a qualquer momento para zerar e carregar a base vigente.
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Última atualização do Quadro: <strong>{quadroLastUpdated}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
            >
              <FilterX className="w-3.5 h-3.5 text-amber-500" />
              <span>Limpar Filtros</span>
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Atualizar via Arquivo/Cole (Excel)</span>
          </button>
        </div>
      </div>

      {/* Info Notice Bar */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-lg p-2.5 px-3.5 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Filtros Excel Ativos:</strong> Use a primeira linha da tabela para pesquisar por múltiplos campos simultaneamente.
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
          Exibindo {filteredOperadores.length} de {operadores.length} registros
        </span>
      </div>

      {/* Tabela de Operadores com Filtros no Cabeçalho (Estilo Excel) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Títulos das Colunas */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="px-3 py-2.5 w-28">Mat. DP</th>
                <th className="px-3 py-2.5 w-32">Login BB</th>
                <th className="px-3 py-2.5">Nome do Operador</th>
                <th className="px-3 py-2.5 w-44">Supervisor</th>
                <th className="px-3 py-2.5 w-44">Gerente</th>
                <th className="px-3 py-2.5 w-28">Entrada</th>
                <th className="px-3 py-2.5 w-48">Segmento / Célula</th>
              </tr>

              {/* Linha de Filtros Múltiplos Simultâneos (Excel Style) */}
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.matDP}
                    onChange={(e) => handleFilterChange('matDP', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.loginBB}
                    onChange={(e) => handleFilterChange('loginBB', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Filtrar Nome..."
                    value={filters.nome}
                    onChange={(e) => handleFilterChange('nome', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Filtrar Supervisor..."
                    value={filters.supervisor}
                    onChange={(e) => handleFilterChange('supervisor', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Filtrar Gerente..."
                    value={filters.gerente}
                    onChange={(e) => handleFilterChange('gerente', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Entrada..."
                    value={filters.horarioEntrada}
                    onChange={(e) => handleFilterChange('horarioEntrada', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1.5">
                  <select
                    value={filters.segmento}
                    onChange={(e) => handleFilterChange('segmento', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">Todas Células</option>
                    {uniqueSegmentos.map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredOperadores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                    Nenhum operador corresponde aos filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOperadores.map((op) => (
                  <tr key={op.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400">{op.matDP}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{op.loginBB}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">{op.nome}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{op.supervisor}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{op.gerente}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400">{op.horarioEntrada}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {op.segmento}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Importação em Lote - Atualização do Quadro com ZERAR Base */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Atualizar Quadro por Cola/Arquivo (Excel / TSV)</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  Atenção: A cada atualização a base anterior é zerada e substituída apenas com os operadores ativos colados.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cole as colunas diretamente do Excel na ordem abaixo (separadas por TAB):
              <br />
              <code className="inline-block mt-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                Mat. DP | Login BB | Nome | Supervisor | Gerente | Horário Entrada | Segmento
              </code>
            </p>

            <textarea
              rows={11}
              value={rawTsvText}
              onChange={(e) => setRawTsvText(e.target.value)}
              placeholder="Cole aqui as linhas da sua planilha..."
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Zerar e Salvar Operadores Ativos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
