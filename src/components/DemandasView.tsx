import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FileText, 
  List, 
  LayoutGrid, 
  Clock, 
  UserCheck, 
  Building2,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Demanda, Prioridade, StatusDemanda, TipoDemanda } from '../types';

interface DemandasViewProps {
  onOpenNovaDemanda: () => void;
  onEditDemanda: (demanda: Demanda) => void;
}

export const DemandasView: React.FC<DemandasViewProps> = ({
  onOpenNovaDemanda,
  onEditDemanda
}) => {
  const { demandas, deleteDemanda, updateDemanda } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');

  const [selectedDemandaModal, setSelectedDemandaModal] = useState<Demanda | null>(null);

  // Filtragem de demandas
  const filteredDemandas = demandas.filter(d => {
    const query = searchQuery.toLowerCase();
    const matchQuery = 
      d.id.toLowerCase().includes(query) ||
      d.tema.toLowerCase().includes(query) ||
      d.celulaNome.toLowerCase().includes(query) ||
      d.supervisor.toLowerCase().includes(query);

    const matchTipo = filterTipo === 'todos' || d.tipo === filterTipo;
    const matchStatus = filterStatus === 'todos' || d.status === filterStatus;
    const matchPrioridade = filterPrioridade === 'todos' || d.prioridade === filterPrioridade;

    return matchQuery && matchTipo && matchStatus && matchPrioridade;
  });

  const getPriorityBadge = (p: Prioridade) => {
    switch (p) {
      case 'Urgente': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
      case 'Alta': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold';
      case 'Média': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold';
      case 'Baixa': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium';
    }
  };

  const getStatusBadge = (s: StatusDemanda) => {
    switch (s) {
      case 'Novo': return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'Em Planejamento': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'Agendado': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Em Execução': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse';
      case 'Finalizado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Cancelado': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 line-through';
    }
  };

  const statusList: StatusDemanda[] = ['Novo', 'Em Planejamento', 'Agendado', 'Em Execução', 'Finalizado', 'Cancelado'];

  return (
    <div className="space-y-3">
      
      {/* Controles de Filtros e Visualização */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 shadow-2xs space-y-2.5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Busca por texto */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID, tema, célula ou supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            {/* Toggle Lista x Kanban */}
            <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('lista')}
                className={`p-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'lista'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visão em Lista / Tabela"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visão Kanban por Status"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Botão Cadastrar Demanda */}
            <button
              onClick={onOpenNovaDemanda}
              className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Solicitação</span>
            </button>
          </div>

        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex items-center space-x-1 text-slate-500 font-semibold text-[11px]">
            <Filter className="w-3 h-3" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="Reciclagem">Reciclagem</option>
            <option value="Sinergia">Sinergia</option>
            <option value="Alinhamento">Alinhamento</option>
            <option value="Novatos">Novatos</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="todos">Todos os Status</option>
            <option value="Novo">Novo</option>
            <option value="Em Planejamento">Em Planejamento</option>
            <option value="Agendado">Agendado</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={filterPrioridade}
            onChange={(e) => setFilterPrioridade(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="todos">Todas as Prioridades</option>
            <option value="Urgente">Urgente</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          <span className="text-slate-400 ml-auto">
            Exibindo <strong>{filteredDemandas.length}</strong> de <strong>{demandas.length}</strong>
          </span>

        </div>

      </div>

      {/* Visão 1: Tabela em Lista */}
      {viewMode === 'lista' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <th className="p-3">ID / Tema</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Célula Solicitante</th>
                  <th className="p-3">Operadores</th>
                  <th className="p-3">Prazo SLA</th>
                  <th className="p-3">Prioridade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDemandas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Nenhuma solicitação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredDemandas.map(d => (
                    <tr 
                      key={d.id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3">
                        <div 
                          onClick={() => setSelectedDemandaModal(d)}
                          className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {d.id} - {d.tema}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          Supervisor: {d.supervisor} | Origem: {d.origem}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {d.tipo}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {d.celulaNome}
                      </td>

                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                        {d.qtdOperadores} ops
                      </td>

                      <td className="p-3 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {d.prazoLimite}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getPriorityBadge(d.prioridade)}`}>
                          {d.prioridade}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${getStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setSelectedDemandaModal(d)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Detalhes da solicitação"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditDemanda(d)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Editar demanda"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Excluir a solicitação ${d.id}?`)) {
                              deleteDemanda(d.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Excluir demanda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visão 2: Kanban por Status */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {statusList.map(st => {
            const items = filteredDemandas.filter(d => d.status === st);

            return (
              <div 
                key={st}
                className="bg-slate-100/70 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{st}</span>
                  <span className="bg-slate-200 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[300px]">
                  {items.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDemandaModal(d)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.id}</span>
                        <span className={`px-1.5 py-0.5 rounded ${getPriorityBadge(d.prioridade)}`}>
                          {d.prioridade}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {d.tema}
                      </h4>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {d.celulaNome} • <strong>{d.qtdOperadores} ops</strong>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                        <span>Prazo: {d.prazoLimite}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Demanda */}
      {selectedDemandaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedDemandaModal.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDemandaModal.tema}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDemandaModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Tipo:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.tipo}</strong>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Célula:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.celulaNome}</strong>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Supervisor:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.supervisor}</strong>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Gerente:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.gerente}</strong>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Qtd. Operadores:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.qtdOperadores} pessoas</strong>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block">Prazo limite:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedDemandaModal.prazoLimite}</strong>
              </div>
            </div>

            {/* Lista Nominal de Operadores */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Lista Nominal de Participantes ({selectedDemandaModal.listaOperadores.length}):
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl max-h-36 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 font-mono space-y-1">
                {selectedDemandaModal.listaOperadores.map((op, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-slate-400">{idx + 1}.</span>
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDemandaModal.observacoes && (
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-semibold">Observações:</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                  {selectedDemandaModal.observacoes}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDemandaModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
