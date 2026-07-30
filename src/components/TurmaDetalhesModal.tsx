import React from 'react';
import { X, CheckCircle, XCircle, Users, Building2, Calendar, Clock, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Turma } from '../types';

interface TurmaDetalhesModalProps {
  turma: Turma | null;
  onClose: () => void;
  onEditTurma?: (turma: Turma) => void;
}

export const TurmaDetalhesModal: React.FC<TurmaDetalhesModalProps> = ({
  turma,
  onClose,
  onEditTurma
}) => {
  const { updateTurma, deleteTurma } = useApp();

  if (!turma) return null;

  const handleConcluir = () => {
    updateTurma(turma.id, { status: 'Finalizado' });
    onClose();
  };

  const handleCancelar = () => {
    updateTurma(turma.id, { status: 'Cancelado' });
    onClose();
  };

  const handleExcluir = () => {
    if (confirm(`Remover a turma ${turma.nomeTurma}?`)) {
      deleteTurma(turma.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {turma.id}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {turma.nomeTurma}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Tema:</span>
              <strong className="text-slate-900 dark:text-white block font-bold">{turma.tema}</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Status Atual:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {turma.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Multiplicador:</span>
              <strong className="text-slate-900 dark:text-white block font-bold">{turma.multiplicadorNome}</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Sala:</span>
              <strong className="text-slate-900 dark:text-white block font-bold">{turma.salaNome}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Data e Horário:</span>
              <strong className="text-slate-900 dark:text-white block font-bold">{turma.data} ({turma.horarioInicio} às {turma.horarioFim})</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Qtd. Participantes:</span>
              <strong className="text-slate-900 dark:text-white block font-bold">{turma.qtdParticipantes} operadores</strong>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-slate-400 block font-medium">Células Atendidas:</span>
            <p className="font-bold text-slate-900 dark:text-white">{turma.celulasNomes.join(', ')}</p>
          </div>

          {turma.observacoes && (
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400 block font-medium">Observações:</span>
              <p className="text-slate-700 dark:text-slate-300">{turma.observacoes}</p>
            </div>
          )}

        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExcluir}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>

            {onEditTurma && (
              <button
                onClick={() => {
                  const target = turma;
                  onClose();
                  onEditTurma(target);
                }}
                className="px-3 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <span>Editar Dados</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {turma.status !== 'Finalizado' && (
              <button
                onClick={handleConcluir}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar Concluído</span>
              </button>
            )}

            {turma.status !== 'Cancelado' && (
              <button
                onClick={handleCancelar}
                className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancelar Turma
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
