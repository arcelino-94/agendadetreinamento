import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SalaTreinamento } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const SalasView: React.FC = () => {
  const { salas, addSala, updateSala, deleteSala, turmas, selectedDate } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<SalaTreinamento | null>(null);

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState<number>(30);
  const [recursosInput, setRecursosInput] = useState('');
  const [localizacao, setLocalizacao] = useState('Prédio Principal');

  // Deletion Modal Password
  const [deletingSalaId, setDeletingSalaId] = useState<string | null>(null);

  const handleOpenModal = (s?: SalaTreinamento) => {
    if (s) {
      setEditingSala(s);
      setNome(s.nome);
      setCapacidade(s.capacidade);
      setRecursosInput(s.recursos.join(', '));
      setLocalizacao(s.bloco || 'Prédio Principal');
    } else {
      setEditingSala(null);
      setNome(`Sala ${salas.length + 1}`);
      setCapacidade(30);
      setRecursosInput('Projetor, Ar Condicionado, 30 PCs');
      setLocalizacao('Prédio Principal');
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
        bloco: localizacao
      });
    } else {
      addSala({
        nome,
        capacidade,
        recursos,
        bloco: localizacao,
        status: 'Livre'
      });
    }

    setIsModalOpen(false);
  };

  // Helper para verificar disponibilidade LIVE em relação ao horário atual/meio-dia
  const getLiveRoomStatus = (salaId: string) => {
    const turmasHoje = turmas.filter(
      t => t.salaId === salaId && t.data === selectedDate && t.status !== 'Cancelado'
    );

    if (turmasHoje.length === 0) {
      return { status: 'Livre', text: 'Livre o dia todo', color: 'emerald' };
    }

    // Checar se há turma até meio-dia (<= 12:00) vs depois (> 12:00)
    const currentHour = new Date().getHours();
    
    // Se a consulta for para simular/visualizar o estado do dia:
    const turmaManha = turmasHoje.find(t => t.horarioInicio < '12:00' && t.horarioFim <= '13:00');
    const turmaTarde = turmasHoje.find(t => t.horarioInicio >= '12:00');

    if (turmaManha && currentHour < 12) {
      return { 
        status: 'Ocupada', 
        text: `Ocupada até 12:00 (${turmaManha.nomeTurma})`, 
        color: 'amber' 
      };
    }

    if (turmaTarde && currentHour >= 12) {
      return { 
        status: 'Ocupada', 
        text: `Ocupada à tarde (${turmaTarde.nomeTurma})`, 
        color: 'amber' 
      };
    }

    if (turmaManha && currentHour >= 12 && !turmaTarde) {
      return { 
        status: 'Livre', 
        text: `Livre agora (Teve turma até 12:00)`, 
        color: 'emerald' 
      };
    }

    return { 
      status: 'Ocupada', 
      text: `Turmas Agendadas (${turmasHoje.length})`, 
      color: 'amber' 
    };
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Salas de Treinamento ao Vivo ({salas.length} Salas)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ocupação LIVE em tempo real de acordo com os agendamentos. Status automático (ex: ocupada até 12:00, livre à tarde).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Sala</span>
        </button>
      </div>

      {/* Grid de Salas 1 a 8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salas.map(s => {
          const live = getLiveRoomStatus(s.id);
          const turmasHojeSala = turmas.filter(t => t.salaId === s.id && t.data === selectedDate && t.status !== 'Cancelado');

          return (
            <div 
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {s.bloco || 'Prédio Principal'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.nome}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    live.color === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {live.status}
                  </span>
                </div>

                {/* Status Ao Vivo Banner */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Status LIVE:</span>
                    <strong className={live.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}>
                      {live.text}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Capacidade:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{s.capacidade} participantes</strong>
                  </div>
                </div>

                {/* Equipamentos */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Equipamentos:</span>
                  <div className="flex flex-wrap gap-1">
                    {s.recursos.map((rec, i) => (
                      <span 
                        key={i}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Calendário/Linha do Tempo de Ocupação no dia */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    <span>Grade do Dia ({selectedDate}):</span>
                  </span>

                  {turmasHojeSala.length === 0 ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Livre o dia inteiro.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {turmasHojeSala.map(t => (
                        <div 
                          key={t.id}
                          className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-200/60 dark:border-indigo-800/60 text-[11px]"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.nomeTurma}</div>
                          <div className="text-slate-500 dark:text-slate-400 flex justify-between font-mono text-[10px]">
                            <span>{t.horarioInicio} - {t.horarioFim}</span>
                            <span>{t.qtdParticipantes} ops</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-1">
                <button
                  onClick={() => handleOpenModal(s)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Editar sala"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingSalaId(s.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
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
            className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingSala ? 'Editar Sala' : 'Nova Sala de Treinamento'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nome da Sala:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sala 1"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Capacidade (Participantes):</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={capacidade}
                    onChange={(e) => setCapacidade(parseInt(e.target.value) || 20)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Localização:</label>
                  <input
                    type="text"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Ex: Prédio Principal - Térreo"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Recursos / Equipamentos (separados por vírgula):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 30 PCs, Projetor, Ar Condicionado"
                  value={recursosInput}
                  onChange={(e) => setRecursosInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Salvar Sala
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <PasswordConfirmModal
        isOpen={deletingSalaId !== null}
        onClose={() => setDeletingSalaId(null)}
        onConfirm={() => {
          if (deletingSalaId) deleteSala(deletingSalaId);
        }}
        title="Confirmar Exclusão de Sala"
        itemDescription="esta sala de treinamento"
      />

    </div>
  );
};
