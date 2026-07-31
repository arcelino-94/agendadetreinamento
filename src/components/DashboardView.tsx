import React from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  Building2, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectSmartGroupings, generateSmartSlots, getDeadlineAlerts } from '../lib/planningEngine';

interface DashboardViewProps {
  onOpenNovaDemanda: () => void;
  onOpenNovaTurma: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNovaDemanda, onOpenNovaTurma }) => {
  const { demandas, turmas, multiplicadores, salas, setActiveTab, selectedDate } = useApp();

  // Métricas Principais
  const pendentes = demandas.filter(d => d.status === 'Novo' || d.status === 'Em Planejamento');
  const turmasHoje = turmas.filter(t => t.data === selectedDate && t.status !== 'Cancelado');
  const multiplicadoresAtivos = multiplicadores.filter(m => m.status === 'Ativo');
  const salasLivres = salas.filter(s => s.status === 'Livre');
  const alertasPrazo = getDeadlineAlerts(demandas);

  // Recomendações
  const agrupamentos = detectSmartGroupings(demandas, multiplicadoresAtivos, salas);
  const encaixes = generateSmartSlots(demandas, multiplicadoresAtivos, salas, turmas);

  // Tipos de demanda contagem
  const demandasPorTipo = {
    Reciclagem: demandas.filter(d => d.tipo === 'Reciclagem').length,
    Sinergia: demandas.filter(d => d.tipo === 'Sinergia').length,
    Alinhamento: demandas.filter(d => d.tipo === 'Alinhamento').length,
    Novatos: demandas.filter(d => d.tipo === 'Novatos').length,
  };

  return (
    <div className="space-y-3">
      
      {/* Grid de Cards de Métricas (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        
        {/* Card 1: Pedidos Pendentes */}
        <div 
          onClick={() => setActiveTab('demandas')}
          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <span>Demandas Pendentes</span>
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{pendentes.length}</span>
            <span className="text-[10px] text-slate-500">pedidos</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>{demandasPorTipo.Reciclagem} Reciclagens</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center">
              Ver lista <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Turmas Hoje */}
        <div 
          onClick={() => setActiveTab('agenda')}
          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <span>Turmas de Hoje</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{turmasHoje.length}</span>
            <span className="text-[10px] text-slate-500">turmas</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Data: {selectedDate}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              Grade <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Multiplicadores Ativos */}
        <div 
          onClick={() => setActiveTab('multiplicadores')}
          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <span>Instrutores Ativos</span>
            <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{multiplicadoresAtivos.length}</span>
            <span className="text-[10px] text-slate-500">instrutores</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Cadastrados no sistema</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center">
              Gestão <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Salas de Treinamento */}
        <div 
          onClick={() => setActiveTab('salas')}
          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <span>Salas Livres</span>
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{salasLivres.length}</span>
            <span className="text-[10px] text-slate-500">de {salas.length} salas</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>{salas.filter(s => s.status === 'Ocupada').length} ocupadas</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center">
              Ver salas <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 5: Pedidos Críticos / SLA */}
        <div 
          onClick={() => setActiveTab('assistente')}
          className={`p-3 rounded-lg border shadow-2xs transition-all cursor-pointer group ${
            alertasPrazo.length > 0 
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 hover:border-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 dark:text-rose-400">
            <span>Alertas SLA</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-rose-700 dark:text-rose-400 font-mono">{alertasPrazo.length}</span>
            <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">críticos</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-400">
            <span>Prazo Iminente</span>
            <span className="font-bold flex items-center">
              Resolver <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Seção Central: Assistente de Recomendação em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Painel do Assistente de Planejamento (2 Colunas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/80 rounded-md text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Assistente Inteligente de Agrupamento
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Otimizador de turmas por redundância de temas e vagas de salas
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('assistente')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center space-x-1"
            >
              <span>Ver todos ({agrupamentos.length})</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {agrupamentos.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nenhum agrupamento pendente!
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Todos os pedidos idênticos foram unificados em turmas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {agrupamentos.slice(0, 3).map((ag, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        Tema: {ag.tema}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-mono">
                        {ag.totalOperadores} ops
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {ag.motivo}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                      <span>Células: <strong>{ag.celulas.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Instrutores: <strong>{ag.multiplicadoresAptos.map(m => m.nome.split(' ')[0]).join(', ')}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('assistente')}
                    className="shrink-0 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                  >
                    <span>Criar Turma Unificada</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribuição por Tipo de Treinamento */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Distribuição por Tipo
          </h3>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                <span>Reciclagem</span>
                <span className="font-mono">{demandasPorTipo.Reciclagem} pedidos</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (demandasPorTipo.Reciclagem / Math.max(1, demandas.length)) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                <span>Sinergia (Migrações)</span>
                <span className="font-mono">{demandasPorTipo.Sinergia} pedidos</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (demandasPorTipo.Sinergia / Math.max(1, demandas.length)) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                <span>Alinhamento Rápido</span>
                <span className="font-mono">{demandasPorTipo.Alinhamento} pedidos</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (demandasPorTipo.Alinhamento / Math.max(1, demandas.length)) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                <span>Novatos (Onboarding)</span>
                <span className="font-mono">{demandasPorTipo.Novatos} pedidos</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-violet-600 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (demandasPorTipo.Novatos / Math.max(1, demandas.length)) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setActiveTab('relatorios')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Ver relatório completo de KPIs &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Turmas do Dia / Cronograma Atual */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Cronograma de Treinamentos de Hoje ({selectedDate})</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Turmas ativas e agendadas com multiplicador e sala física alocados
            </p>
          </div>

          <button
            onClick={() => setActiveTab('agenda')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Abrir Grade Interativa &rarr;
          </button>
        </div>

        {turmasHoje.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md space-y-1">
            <Calendar className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Nenhuma turma agendada para a data {selectedDate}.
            </p>
            <button
              onClick={onOpenNovaTurma}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              + Agendar primeira turma de hoje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {turmasHoje.map(turma => (
              <div 
                key={turma.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
                    {turma.tipo}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {turma.horarioInicio} - {turma.horarioFim}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {turma.nomeTurma}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Tema: {turma.tema}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[9px] text-slate-400">Multiplicador:</span>
                    <strong className="text-slate-800 dark:text-slate-200 truncate block">
                      {turma.multiplicadorNome}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400">Sala:</span>
                    <strong className="text-slate-800 dark:text-slate-200 truncate block">
                      {turma.salaNome}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
