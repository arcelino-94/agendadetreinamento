import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Users, 
  Edit2, 
  Trash2, 
  Building2,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CelulaAtendimento } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const MatrizEspecialidadesView: React.FC = () => {
  const { celulas, addCelula, updateCelula, deleteCelula, operadores } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCelula, setEditingCelula] = useState<CelulaAtendimento | null>(null);

  const [nome, setNome] = useState('');
  const [gestor, setGestor] = useState('');
  const [operadoresAtivos, setOperadoresAtivos] = useState(30);

  // Modal confirm delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenModal = (c?: CelulaAtendimento) => {
    if (c) {
      setEditingCelula(c);
      setNome(c.nome);
      setGestor(c.gestor);
      setOperadoresAtivos(c.operadoresAtivos);
    } else {
      setEditingCelula(null);
      setNome('');
      setGestor('Girleide Lira');
      setOperadoresAtivos(30);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingCelula) {
      updateCelula(editingCelula.id, {
        nome,
        gestor,
        operadoresAtivos
      });
    } else {
      addCelula({
        nome,
        gestor,
        operadoresAtivos
      });
    }

    setIsModalOpen(false);
  };

  const filteredCelulas = celulas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gestor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Células de Atendimento ({celulas.length} Células)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mapeamento das 19 células de atendimento da operação para direcionamento e capacitação
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Célula</span>
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar célula ou gestor responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid das Células */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredCelulas.map((c) => {
          // Quantidade de operadores no Quadro vinculados a esta célula (com normalização estrita de caracteres)
          const cleanStr = (str: string) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') : '';
          const cleanCell = cleanStr(c.nome);

          const matchingOps = operadores.filter(o => {
            const cleanSeg = cleanStr(o.segmento);
            if (!cleanSeg) return false;
            return cleanSeg === cleanCell || cleanSeg.includes(cleanCell) || cleanCell.includes(cleanSeg);
          });

          // Extrai todos os gerentes únicos dos operadores desta célula
          const gerentesQuadro = Array.from(new Set(
            matchingOps
              .map(o => o.gerente?.trim())
              .filter((g): g is string => Boolean(g && g !== 'N/A' && g !== '-' && g !== ''))
          ));

          const gestoresDisplay = gerentesQuadro.length > 0 
            ? gerentesQuadro.join(', ') 
            : (c.gestor || 'Extraído do Quadro');

          const totalOpsDisplay = matchingOps.length;

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    CÉLULA
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Editar Nome da Célula"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Excluir Célula"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {c.nome}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                  Gerente(s): <strong className="text-slate-800 dark:text-slate-200">{gestoresDisplay}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Operadores no Quadro:</span>
                </span>
                <strong className="text-slate-900 dark:text-white font-mono font-bold">
                  {totalOpsDisplay} ops
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar / Editar Célula */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingCelula ? 'Editar Célula de Atendimento' : 'Cadastrar Nova Célula'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Célula
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAC PRIORITARIO"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Dados do Quadro de Operadores
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Os Gerentes e a contagem de Operadores são extraídos e atualizados automaticamente em tempo real a partir do Quadro de Operadores.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirm delete */}
      <PasswordConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteCelula(deletingId);
        }}
        title="Confirmar Exclusão de Célula"
        itemDescription="esta célula de atendimento"
      />
    </div>
  );
};
