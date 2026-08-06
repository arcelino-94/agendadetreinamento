import React, { useState } from 'react';
import { X, Award, Plus, Trash2, Edit2, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { AlunoFrequenciaNota, ItemProvaNota } from '../types';

interface AlunoNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: AlunoFrequenciaNota | null;
  onUpdateProvas: (alunoId: string, provas: ItemProvaNota[], novaNotaFinal: number) => void;
}

export const AlunoNotasModal: React.FC<AlunoNotasModalProps> = ({
  isOpen,
  onClose,
  aluno,
  onUpdateProvas
}) => {
  if (!isOpen || !aluno) return null;

  const currentProvas = aluno.provas || [
    { id: 'prv-1', nomeProva: 'Avaliação Inicial / Prova 1', dataProva: new Date().toLocaleDateString('pt-BR'), nota: aluno.notaFinal }
  ];

  const [provasList, setProvasList] = useState<ItemProvaNota[]>(currentProvas);
  const [novaNome, setNovaNome] = useState('');
  const [novaNota, setNovaNota] = useState('');
  const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);

  // Recalculate average grade from all provas
  const calcularMedia = (list: ItemProvaNota[]): number => {
    if (list.length === 0) return 0;
    const soma = list.reduce((acc, p) => acc + (p.nota || 0), 0);
    return Math.round((soma / list.length) * 10) / 10;
  };

  const mediaAtual = calcularMedia(provasList);

  const handleAddProva = (e: React.FormEvent) => {
    e.preventDefault();
    const valNota = parseFloat(novaNota);
    if (isNaN(valNota) || !novaNome.trim()) return;

    const nova: ItemProvaNota = {
      id: `prv-${Date.now()}`,
      nomeProva: novaNome.trim(),
      dataProva: novaData ? new Date(novaData).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      nota: Math.min(10, Math.max(0, valNota))
    };

    const nextList = [...provasList, nova];
    setProvasList(nextList);
    setNovaNome('');
    setNovaNota('');

    const novaMedia = calcularMedia(nextList);
    onUpdateProvas(aluno.id, nextList, novaMedia);
  };

  const handleDeleteProva = (id: string) => {
    const nextList = provasList.filter(p => p.id !== id);
    setProvasList(nextList);
    const novaMedia = calcularMedia(nextList);
    onUpdateProvas(aluno.id, nextList, novaMedia);
  };

  const handleUpdateNotaIndividual = (id: string, novaNotaVal: number) => {
    const val = Math.min(10, Math.max(0, novaNotaVal));
    const nextList = provasList.map(p => p.id === id ? { ...p, nota: val } : p);
    setProvasList(nextList);
    const novaMedia = calcularMedia(nextList);
    onUpdateProvas(aluno.id, nextList, novaMedia);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/80 rounded-xl text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Histórico de Provas e Avaliações
                </h3>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-black">
                  Média: {mediaAtual.toFixed(1)} / 10
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <strong className="text-slate-800 dark:text-slate-200">{aluno.nome}</strong> • Login: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{aluno.loginBB || aluno.matDP}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center text-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provas List Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Avaliações Registradas ({provasList.length})
          </h4>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {provasList.map((prova, idx) => (
              <div key={prova.id} className="p-3 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{prova.nomeProva}</h5>
                    <p className="text-[10px] text-slate-400">Data: {prova.dataProva || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-slate-400">Nota (0-10):</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={prova.nota}
                      onChange={(e) => handleUpdateNotaIndividual(prova.id, parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 text-center font-mono font-extrabold text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {provasList.length > 1 && (
                    <button
                      onClick={() => handleDeleteProva(prova.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
                      title="Remover esta prova"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Prova Form */}
        <form onSubmit={handleAddProva} className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Lançar Nova Prova / Avaliação para este Operador</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nome da Prova *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Prova 2 - Reteste"
                value={novaNome}
                onChange={(e) => setNovaNome(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nota Obtida (0 a 10) *
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                required
                placeholder="0.0 - 10.0"
                value={novaNota}
                onChange={(e) => setNovaNota(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Prova e Recalcular Média</span>
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-2xs"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
