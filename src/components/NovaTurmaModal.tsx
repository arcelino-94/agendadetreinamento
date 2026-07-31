import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, Building2, Users, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TipoDemanda, Turma } from '../types';

interface NovaTurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreset?: {
    editingTurmaId?: string;
    multiplicadorId?: string;
    salaId?: string;
    hour?: string;
    data?: string;
    demandaIds?: string[];
    tema?: string;
    nomeTurma?: string;
    qtdParticipantes?: number;
    celulasNomes?: string[];
    tipo?: TipoDemanda;
    observacoes?: string;
    horarioInicio?: string;
    horarioFim?: string;
  } | null;
}

export const NovaTurmaModal: React.FC<NovaTurmaModalProps> = ({
  isOpen,
  onClose,
  initialPreset
}) => {
  const { 
    multiplicadores, 
    salas, 
    demandas, 
    addTurma, 
    updateTurma,
    selectedDate, 
    checkRoomConflict, 
    checkTrainerConflict 
  } = useApp();

  const [editingTurmaId, setEditingTurmaId] = useState<string | null>(null);
  const [nomeTurma, setNomeTurma] = useState('');
  const [tema, setTema] = useState('');
  const [data, setData] = useState(selectedDate);
  const [horarioInicio, setHorarioInicio] = useState('09:00');
  const [horarioFim, setHorarioFim] = useState('11:00');
  const [multiplicadorId, setMultiplicadorId] = useState('');
  const [salaId, setSalaId] = useState('');
  const [tipo, setTipo] = useState<TipoDemanda>('Reciclagem');
  const [qtdParticipantes, setQtdParticipantes] = useState(15);
  const [selectedDemandaIds, setSelectedDemandaIds] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');

  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPreset) {
      if (initialPreset.editingTurmaId) setEditingTurmaId(initialPreset.editingTurmaId);
      else setEditingTurmaId(null);

      if (initialPreset.multiplicadorId) setMultiplicadorId(initialPreset.multiplicadorId);
      if (initialPreset.salaId) setSalaId(initialPreset.salaId);
      if (initialPreset.data) setData(initialPreset.data);
      else setData(selectedDate);

      if (initialPreset.horarioInicio) setHorarioInicio(initialPreset.horarioInicio);
      else if (initialPreset.hour) {
        setHorarioInicio(initialPreset.hour);
        const startH = parseInt(initialPreset.hour.split(':')[0]);
        const endH = Math.min(23, startH + 2);
        setHorarioFim(`${endH < 10 ? '0' : ''}${endH}:00`);
      }

      if (initialPreset.horarioFim) setHorarioFim(initialPreset.horarioFim);
      if (initialPreset.demandaIds) setSelectedDemandaIds(initialPreset.demandaIds);
      if (initialPreset.tema) setTema(initialPreset.tema);
      if (initialPreset.nomeTurma) setNomeTurma(initialPreset.nomeTurma);
      if (initialPreset.qtdParticipantes) setQtdParticipantes(initialPreset.qtdParticipantes);
      if (initialPreset.tipo) setTipo(initialPreset.tipo);
      if (initialPreset.observacoes) setObservacoes(initialPreset.observacoes);
    } else {
      setEditingTurmaId(null);
      setData(selectedDate);
      if (multiplicadores.length > 0) setMultiplicadorId(multiplicadores[0].id);
      if (salas.length > 0) setSalaId(salas[0].id);
    }
  }, [initialPreset, selectedDate, multiplicadores, salas]);

  // Efeito para Checagem de Conflito em Tempo Real
  useEffect(() => {
    if (!salaId || !multiplicadorId || !data || !horarioInicio || !horarioFim) {
      setConflictError(null);
      return;
    }

    const conflitoSala = checkRoomConflict(salaId, data, horarioInicio, horarioFim, editingTurmaId || undefined);
    if (conflitoSala) {
      const salaObj = salas.find(s => s.id === salaId);
      setConflictError(`CONFLITO DE SALA: A sala "${salaObj?.nome}" já está reservada para a turma "${conflitoSala.nomeTurma}" das ${conflitoSala.horarioInicio} às ${conflitoSala.horarioFim}. Escolha outra sala ou horário!`);
      return;
    }

    const conflitoInstrutor = checkTrainerConflict(multiplicadorId, data, horarioInicio, horarioFim, editingTurmaId || undefined);
    if (conflitoInstrutor) {
      const multObj = multiplicadores.find(m => m.id === multiplicadorId);
      setConflictError(`CONFLITO DE MULTIPLICADOR: O instrutor "${multObj?.nome}" já possui a turma "${conflitoInstrutor.nomeTurma}" agendada no horário das ${conflitoInstrutor.horarioInicio} às ${conflitoInstrutor.horarioFim}.`);
      return;
    }

    setConflictError(null);
  }, [salaId, multiplicadorId, data, horarioInicio, horarioFim, checkRoomConflict, checkTrainerConflict, salas, multiplicadores, editingTurmaId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictError) {
      alert('Resolva o conflito de agendamento antes de salvar!');
      return;
    }

    const multObj = multiplicadores.find(m => m.id === multiplicadorId) || multiplicadores[0];
    const salaObj = salas.find(s => s.id === salaId) || salas[0];

    const demandasVinculadas = demandas.filter(d => selectedDemandaIds.includes(d.id));
    const celulasNomes = Array.from(new Set(demandasVinculadas.map(d => d.celulaNome)));

    if (editingTurmaId) {
      const result = updateTurma(editingTurmaId, {
        nomeTurma: nomeTurma || `Turma: ${tema}`,
        tema,
        demandaIds: selectedDemandaIds,
        multiplicadorId: multObj.id,
        multiplicadorNome: multObj.nome,
        salaId: salaObj.id,
        salaNome: salaObj.nome,
        data,
        horarioInicio,
        horarioFim,
        qtdParticipantes,
        celulasNomes: celulasNomes.length > 0 ? celulasNomes : ['Operação Call Center'],
        tipo,
        observacoes
      });

      if (result.success) {
        onClose();
      } else {
        setConflictError(result.error || 'Erro ao atualizar turma');
      }
    } else {
      const result = addTurma({
        nomeTurma: nomeTurma || `Turma: ${tema}`,
        tema,
        demandaIds: selectedDemandaIds,
        multiplicadorId: multObj.id,
        multiplicadorNome: multObj.nome,
        salaId: salaObj.id,
        salaNome: salaObj.nome,
        data,
        horarioInicio,
        horarioFim,
        qtdParticipantes,
        celulasNomes: celulasNomes.length > 0 ? celulasNomes : ['Operação Call Center'],
        status: 'Agendado',
        tipo,
        observacoes
      });

      if (result.success) {
        onClose();
      } else {
        setConflictError(result.error || 'Erro ao salvar turma');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Agendar Nova Turma de Treinamento
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Alerta de Conflito Estrito */}
        {conflictError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start space-x-2 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{conflictError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Nome Identificador da Turma:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Turma PIX - Células Cartão & Portador #01"
              value={nomeTurma}
              onChange={(e) => setNomeTurma(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Tema / Assunto:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: PIX, Novo Script"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Tipo de Treinamento:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoDemanda)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Reciclagem">Reciclagem</option>
                <option value="Sinergia">Sinergia</option>
                <option value="Alinhamento">Alinhamento</option>
                <option value="Novatos">Novatos</option>
                <option value="Migração">Migração</option>
                <option value="Retorno LMG">Retorno LMG</option>
              </select>
            </div>
          </div>

          {/* Seleção do Multiplicador e Sala */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Multiplicador (Instrutor):
              </label>
              <select
                value={multiplicadorId}
                onChange={(e) => setMultiplicadorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              >
                {multiplicadores
                  .filter(m => m.status === 'Ativo' || m.status === 'Disponível')
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Sala de Treinamento:
              </label>
              <select
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              >
                {salas.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nome} (Cap. {s.capacidade} ops)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Horários */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Data do Treinamento:
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Horário Início:
              </label>
              <input
                type="time"
                required
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Horário Fim:
              </label>
              <input
                type="time"
                required
                value={horarioFim}
                onChange={(e) => setHorarioFim(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Quantidade de Participantes Esperados:
            </label>
            <input
              type="number"
              min={1}
              required
              value={qtdParticipantes}
              onChange={(e) => setQtdParticipantes(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Vínculo com Solicitações Pendentes */}
          {demandas.length > 0 && (
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Vincular Solicitações Pendentes (opcional):
              </label>
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto space-y-1">
                {demandas.filter(d => d.status !== 'Finalizado' && d.status !== 'Cancelado').map(dem => (
                  <label key={dem.id} className="flex items-center space-x-2 text-[11px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDemandaIds.includes(dem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDemandaIds([...selectedDemandaIds, dem.id]);
                        } else {
                          setSelectedDemandaIds(selectedDemandaIds.filter(id => id !== dem.id));
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dem.id}</span>
                    <span className="text-slate-500 truncate">[{dem.celulaNome}] {dem.tema} ({dem.qtdOperadores} ops)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!conflictError}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              Salvar e Confirmar Turma
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
