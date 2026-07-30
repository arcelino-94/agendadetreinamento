import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Trash2, 
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Multiplicador, StatusMultiplicador } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const MultiplicadoresView: React.FC = () => {
  const { multiplicadores, addMultiplicador, updateMultiplicador, deleteMultiplicador } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMult, setEditingMult] = useState<Multiplicador | null>(null);

  // Modal confirm delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFim, setHorarioFim] = useState('17:00');
  const [especialidadesInput, setEspecialidadesInput] = useState('');
  const [status, setStatus] = useState<StatusMultiplicador>('Disponível');
  const [telefone, setTelefone] = useState('');

  const filtered = multiplicadores.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchQuery = m.nome.toLowerCase().includes(q) || m.especialidades.some(e => e.toLowerCase().includes(q));
    const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const handleOpenModal = (m?: Multiplicador) => {
    if (m) {
      setEditingMult(m);
      setNome(m.nome);
      setEmail(m.email);
      setFoto(m.foto || '');
      setHorarioInicio(m.horarioInicio);
      setHorarioFim(m.horarioFim);
      setEspecialidadesInput(m.especialidades.join(', '));
      setStatus(m.status);
      setTelefone(m.telefone || '');
    } else {
      setEditingMult(null);
      setNome('');
      setEmail('');
      setFoto('');
      setHorarioInicio('08:00');
      setHorarioFim('17:00');
      setEspecialidadesInput('');
      setStatus('Disponível');
      setTelefone('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const especialidades = especialidadesInput.split(',').map(s => s.trim()).filter(Boolean);

    if (editingMult) {
      updateMultiplicador(editingMult.id, {
        nome,
        email,
        foto,
        horarioInicio,
        horarioFim,
        especialidades,
        status,
        telefone
      });
    } else {
      addMultiplicador({
        nome,
        email,
        foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        horarioInicio,
        horarioFim,
        especialidades,
        diasFolga: ['Sábado', 'Domingo'],
        status,
        telefone
      });
    }

    setIsModalOpen(false);
  };

  const getStatusBadge = (st: StatusMultiplicador) => {
    switch (st) {
      case 'Disponível': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
      case 'Em Treinamento': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold';
      case 'Férias': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Folga': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Home Office': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Controles de Busca e Cadastro */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou segmento (ex: SAC, CARTÃO, ATA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="todos">Todos os Status ({multiplicadores.length})</option>
            <option value="Disponível">Disponíveis</option>
            <option value="Em Treinamento">Em Treinamento</option>
            <option value="Férias">Férias</option>
            <option value="Folga">Folga</option>
            <option value="Home Office">Home Office</option>
          </select>

          <button
            onClick={() => handleOpenModal()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Multiplicador</span>
          </button>
        </div>

      </div>

      {/* Grid de Cards de Multiplicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(m => (
          <div 
            key={m.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={m.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={m.nome}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.nome}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {m.email}
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(m.status)}`}>
                  {m.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Jornada: <strong>{m.horarioInicio} às {m.horarioFim}</strong></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-[10px] uppercase">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Segmentos / Células de Atuação:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.especialidades.map((esp, i) => (
                      <span 
                        key={i} 
                        className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">
                Folgas: {m.diasFolga.join(', ')}
              </span>

              <div className="space-x-1">
                <button
                  onClick={() => handleOpenModal(m)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors"
                  title="Editar dados"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingId(m.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Excluir multiplicador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Add/Edit Multiplicador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingMult ? 'Editar Multiplicador' : 'Novo Multiplicador'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">E-mail Corporativo:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Telefone / Ramal:</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Horário Início:</label>
                  <input
                    type="time"
                    required
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Horário Fim:</label>
                  <input
                    type="time"
                    required
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Segmentos / Células de Atuação (separadas por vírgula ou +):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAC, CARTÃO, MULTIMEIOS, ROI"
                  value={especialidadesInput}
                  onChange={(e) => setEspecialidadesInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status Atual:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusMultiplicador)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Em Treinamento">Em Treinamento</option>
                  <option value="Férias">Férias</option>
                  <option value="Folga">Folga</option>
                  <option value="Home Office">Home Office</option>
                </select>
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
                Salvar Multiplicador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <PasswordConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMultiplicador(deletingId);
        }}
        title="Confirmar Exclusão de Multiplicador"
        itemDescription="este multiplicador"
      />

    </div>
  );
};
