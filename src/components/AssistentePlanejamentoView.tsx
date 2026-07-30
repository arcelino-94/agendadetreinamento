import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Check,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectSmartGroupings, generateSmartSlots, getDeadlineAlerts } from '../lib/planningEngine';
import { SugestaoAgrupamento, SugestaoEncaixe } from '../types';

interface AssistentePlanejamentoViewProps {
  onOpenNovaTurmaWithData?: (initialData: any) => void;
}

export const AssistentePlanejamentoView: React.FC<AssistentePlanejamentoViewProps> = ({
  onOpenNovaTurmaWithData
}) => {
  const { demandas, multiplicadores, salas, turmas, addTurma } = useApp();

  const [selectedTab, setSelectedTab] = useState<'agrupamentos' | 'encaixes' | 'alertas'>('agrupamentos');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Análises do motor
  const agrupamentos = detectSmartGroupings(demandas, multiplicadores, salas);
  const encaixes = generateSmartSlots(demandas, multiplicadores, salas, turmas);
  const alertas = getDeadlineAlerts(demandas);

  // Executar criação de turma em 1 clique para agrupamento
  const handleAprovarAgrupamento = (group: SugestaoAgrupamento) => {
    const defaultMult = group.multiplicadoresAptos[0] || multiplicadores[0];
    const defaultSala = group.salasAptas[0] || salas[0];

    if (onOpenNovaTurmaWithData) {
      onOpenNovaTurmaWithData({
        tema: group.tema,
        nomeTurma: `Turma Unificada: ${group.tema} (${group.celulas.join(' + ')})`,
        demandaIds: group.demandaIds,
        multiplicadorId: defaultMult?.id || '',
        salaId: defaultSala?.id || '',
        qtdParticipantes: group.totalOperadores,
        celulasNomes: group.celulas
      });
    }
  };

  // Executar aprovação de encaixe automático em 1 clique
  const handleAprovarEncaixe = (slot: SugestaoEncaixe) => {
    const res = addTurma({
      nomeTurma: `Turma Encaixe: ${slot.demanda.tema}`,
      tema: slot.demanda.tema,
      demandaIds: [slot.demanda.id],
      multiplicadorId: slot.multiplicador.id,
      multiplicadorNome: slot.multiplicador.nome,
      salaId: slot.sala.id,
      salaNome: slot.sala.nome,
      data: slot.dataSugerida,
      horarioInicio: slot.horarioInicio,
      horarioFim: slot.horarioFim,
      qtdParticipantes: slot.demanda.qtdOperadores,
      celulasNomes: [slot.demanda.celulaNome],
      status: 'Agendado',
      tipo: slot.demanda.tipo,
      observacoes: slot.motivo
    });

    if (res.success) {
      setSuccessMsg(`Turma agendada com sucesso para ${slot.demanda.tema}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header do Assistente */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assistente Inteligente de Planejamento T&D
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Motor de otimização automatizada para cruzamento de especialidades de multiplicadores, capacidade física de salas e agrupamento de pedidos.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 animate-pulse">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs de Navegação Interna */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedTab('agrupamentos')}
          className={`px-3 py-1.5 font-bold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
            selectedTab === 'agrupamentos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Agrupamento Inteligente ({agrupamentos.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('encaixes')}
          className={`px-3 py-1.5 font-bold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
            selectedTab === 'encaixes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sugestões de Encaixe ({encaixes.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('alertas')}
          className={`px-3 py-1.5 font-bold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
            selectedTab === 'alertas'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertas de SLA ({alertas.length})</span>
        </button>
      </div>

      {/* Conteúdo da Aba 1: Agrupamento Inteligente */}
      {selectedTab === 'agrupamentos' && (
        <div className="space-y-3">
          {agrupamentos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nenhuma duplicidade de pedido encontrada
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                O motor analisa continuamente novas solicitações. Quando houver temas idênticos em células diferentes, eles aparecerão aqui recomendando unificação.
              </p>
            </div>
          ) : (
            agrupamentos.map((group, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-md">
                        Tema: {group.tema}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Total: {group.totalOperadores} operadores
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {group.motivo}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAprovarAgrupamento(group)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Turma Unificada</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                    <span className="text-slate-400 font-semibold block mb-0.5 text-[10px] uppercase">Células Solicitantes:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {group.celulas.join(', ')}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                    <span className="text-slate-400 font-semibold block mb-0.5 text-[10px] uppercase">Multiplicadores Aptos:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {group.multiplicadoresAptos.map(m => m.nome).join(', ')}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                    <span className="text-slate-400 font-semibold block mb-0.5 text-[10px] uppercase">Salas Disponíveis:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {group.salasAptas.map(s => `${s.nome} (cap. ${s.capacidade})`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Encaixes Automáticos */}
      {selectedTab === 'encaixes' && (
        <div className="space-y-3">
          {encaixes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nenhum encaixe pendente
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Todas as solicitações possuem turma agendada ou aguardam novas vagas.
              </p>
            </div>
          ) : (
            encaixes.map((slot, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {slot.demanda.tipo}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {slot.demanda.id} - {slot.demanda.tema}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {slot.motivo}
                  </p>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Multiplicador: <strong>{slot.multiplicador.nome}</strong></span>
                    <span>Sala: <strong>{slot.sala.nome}</strong></span>
                    <span>Horário: <strong>{slot.horarioInicio} às {slot.horarioFim}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleAprovarEncaixe(slot)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0"
                >
                  Confirmar e Criar Turma
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Conteúdo da Aba 3: Alertas de SLA */}
      {selectedTab === 'alertas' && (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                SLA em 100%! Nenhum pedido em atraso.
              </h3>
            </div>
          ) : (
            alertas.map(d => (
              <div 
                key={d.id}
                className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {d.prioridade}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {d.id} - {d.tema}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Célula {d.celulaNome} | {d.qtdOperadores} ops | Supervisor: {d.supervisor}
                  </p>
                  <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                    Prazo Limite: {d.prazoLimite}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
