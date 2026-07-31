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
  const [foto, setFoto] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFim, setHorarioFim] = useState('17:00');
  const [especialidadesInput, setEspecialidadesInput] = useState('');
  const [status, setStatus] = useState<StatusMultiplicador>('Ativo');

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
      setFoto(m.foto || '');
      setHorarioInicio(m.horarioInicio);
      setHorarioFim(m.horarioFim);
      setEspecialidadesInput(m.especialidades.join(', '));
      setStatus(m.status === 'Disponível' ? 'Ativo' : m.status);
    } else {
      setEditingMult(null);
      setNome('');
      setFoto('');
      setHorarioInicio('08:00');
      setHorarioFim('17:00');
      setEspecialidadesInput('');
      setStatus('Ativo');
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const especialidades = especialidadesInput.split(',').map(s => s.trim()).filter(Boolean);

    if (editingMult) {
      updateMultiplicador(editingMult.id, {
        nome,
        foto,
        horarioInicio,
        horarioFim,
        especialidades,
        status
      });
    } else {
      addMultiplicador({
        nome,
        email: `${nome.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        horarioInicio,
        horarioFim,
        especialidades,
        diasFolga: ['Sábado', 'Domingo'],
        status
      });
    }

    setIsModalOpen(false);
  };

  const getStatusBadge = (st: StatusMultiplicador) => {
    switch (st) {
      case 'Ativo':
      case 'Disponível':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
      case 'Férias':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold';
      case 'Ausente':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
      case 'Folga':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold';
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
            <option value="Ativo">Ativo</option>
            <option value="Férias">Férias</option>
            <option value="Ausente">Ausente</option>
            <option value="Folga">Folga</option>
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

      {/* Grid de Cards de Multiplicadores (4 blocos por linha) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(m => (
          <div 
            key={m.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={m.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={m.nome}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {m.nome}
                    </h3>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${getStatusBadge(m.status)}`}>
                  {m.status === 'Disponível' ? 'Ativo' : m.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Jornada: <strong>{m.horarioInicio} às {m.horarioFim}</strong></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-[10px] uppercase">
                    <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Segmentos / Células:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.especialidades.map((esp, i) => (
                      <span 
                        key={i} 
                        className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700"
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
                Folga: Sáb / Dom
              </span>

              <div className="space-x-1">
                <button
                  onClick={() => handleOpenModal(m)}
                  className="p-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                  title="Editar dados"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingId(m.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
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

              {/* Upload Foto de Perfil */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Foto de Perfil:</label>
                <div className="flex items-center space-x-3">
                  {foto ? (
                    <img src={foto} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 font-bold text-[10px]">
                      Foto
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem..."
                      value={foto}
                      onChange={(e) => setFoto(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-slate-900 dark:text-white focus:outline-hidden text-[11px]"
                    />
                  </div>
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
                  Segmentos / Células de Atuação (separadas por vírgula):
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
                  value={status === 'Disponível' ? 'Ativo' : status}
                  onChange={(e) => setStatus(e.target.value as StatusMultiplicador)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Folga">Folga</option>
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
