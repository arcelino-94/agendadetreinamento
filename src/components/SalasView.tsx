import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Tv, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SalaTreinamento, StatusSala } from '../types';

export const SalasView: React.FC = () => {
  const { salas, addSala, updateSala, deleteSala, turmas, selectedDate } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<SalaTreinamento | null>(null);

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState<number>(20);
  const [recursosInput, setRecursosInput] = useState('');
  const [bloco, setBloco] = useState('Bloco A');
  const [status, setStatus] = useState<StatusSala>('Livre');

  const handleOpenModal = (s?: SalaTreinamento) => {
    if (s) {
      setEditingSala(s);
      setNome(s.nome);
      setCapacidade(s.capacidade);
      setRecursosInput(s.recursos.join(', '));
      setBloco(s.bloco || 'Bloco A');
      setStatus(s.status);
    } else {
      setEditingSala(null);
      setNome('');
      setCapacidade(20);
      setRecursosInput('Projetor, Ar Condicionado, 20 PCs');
      setBloco('Bloco A');
      setStatus('Livre');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const recursos = recursosInput.split(',').map(r => r.trim()).filter(Boolean);

    if (editingSala) {
      updateSala(editingSala.id, {
        nome,
        capacidade,
        recursos,
        bloco,
        status
      });
    } else {
      addSala({
        nome,
        capacidade,
        recursos,
        bloco,
        status
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Salas de Treinamento & Infraestrutura ({salas.length} cadastradas)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerenciamento de capacidade física e equipamentos das salas corporativas de T&D
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Sala</span>
        </button>
      </div>

      {/* Grid de Salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salas.map(s => {
          // Turmas agendadas hoje para esta sala
          const turmasHojeSala = turmas.filter(t => t.salaId === s.id && t.data === selectedDate && t.status !== 'Cancelado');

          return (
            <div 
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      {s.bloco || 'Bloco Central'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.nome}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'Livre' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    s.status === 'Ocupada' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Capacidade:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{s.capacidade} participantes</strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block font-semibold">Equipamentos:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.recursos.map((rec, i) => (
                        <span 
                          key={i}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]"
                        >
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ocupação em tempo real para o dia selecionado */}
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ocupação em {selectedDate}:</span>
                  </span>

                  {turmasHojeSala.length === 0 ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Sem turmas agendadas hoje (100% Livre).
                    </p>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {turmasHojeSala.map(t => (
                        <div 
                          key={t.id}
                          className="p-2 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 text-[11px]"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.nomeTurma}</div>
                          <div className="text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                            <span>{t.horarioInicio} - {t.horarioFim}</span>
                            <span>{t.qtdParticipantes} ops</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-1">
                <button
                  onClick={() => handleOpenModal(s)}
                  className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Editar sala"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir a sala ${s.nome}?`)) {
                      deleteSala(s.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Excluir sala"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Sala */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingSala ? 'Editar Sala' : 'Nova Sala de Treinamento'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome da Sala:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sala Alpha (Inovação)"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Capacidade (Participantes):</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={capacidade}
                    onChange={(e) => setCapacidade(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Bloco / Localização:</label>
                  <input
                    type="text"
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                    placeholder="Ex: Bloco A - 2º Andar"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Recursos / Equipamentos (separados por vírgula):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 25 PCs, Projetor 4K, Ar Condicionado, Som"
                  value={recursosInput}
                  onChange={(e) => setRecursosInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Status da Sala:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusSala)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Livre">Livre</option>
                  <option value="Ocupada">Ocupada</option>
                  <option value="Manutenção">Em Manutenção</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Salvar Sala
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
