import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Trash2, 
  Award,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Multiplicador, StatusMultiplicador } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

export const MultiplicadoresView: React.FC = () => {
  const { multiplicadores, celulas, addMultiplicador, updateMultiplicador, deleteMultiplicador, currentUser } = useApp();

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
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusMultiplicador>('Ativo');
  const [senha, setSenha] = useState('123456');
  const [acessoMaster, setAcessoMaster] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [isCelulasDropdownOpen, setIsCelulasDropdownOpen] = useState(false);

  const filtered = multiplicadores.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchQuery = m.nome.toLowerCase().includes(q) || m.especialidades.some(e => e.toLowerCase().includes(q));
    const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const toggleEspecialidade = (nomeCelula: string) => {
    if (selectedEspecialidades.includes(nomeCelula)) {
      setSelectedEspecialidades(selectedEspecialidades.filter(s => s !== nomeCelula));
    } else {
      setSelectedEspecialidades([...selectedEspecialidades, nomeCelula]);
    }
  };

  const selectAllCelulas = () => {
    setSelectedEspecialidades(celulas.map(c => c.nome));
  };

  const clearAllCelulas = () => {
    setSelectedEspecialidades([]);
  };

  const handleOpenModal = (m?: Multiplicador) => {
    setIsCelulasDropdownOpen(false);
    setShowSenha(false);
    if (m) {
      setEditingMult(m);
      setNome(m.nome);
      setEmail(m.email || '');
      setFoto(m.foto || '');
      setHorarioInicio(m.horarioInicio);
      setHorarioFim(m.horarioFim);
      setSelectedEspecialidades(m.especialidades || []);
      setStatus(m.status === 'Disponível' ? 'Ativo' : m.status);
      setSenha(m.senha || '123456');
      setAcessoMaster(!!m.acessoMaster);
    } else {
      setEditingMult(null);
      setNome('');
      setEmail('');
      setFoto('');
      setHorarioInicio('08:00');
      setHorarioFim('17:00');
      setSelectedEspecialidades([]);
      setStatus('Ativo');
      setSenha('123456');
      setAcessoMaster(false);
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
    const especialidades = selectedEspecialidades;
    const finalEmail = email.trim() || `${nome.toLowerCase().replace(/\s+/g, '.')}@empresa.com`;

    if (editingMult) {
      updateMultiplicador(editingMult.id, {
        nome,
        email: finalEmail,
        foto,
        horarioInicio,
        horarioFim,
        especialidades,
        status,
        ...(currentUser?.role === 'gerente' ? { senha, acessoMaster } : {})
      });
    } else {
      addMultiplicador({
        nome,
        email: finalEmail,
        foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        horarioInicio,
        horarioFim,
        especialidades,
        diasFolga: ['Sábado', 'Domingo'],
        status,
        senha: senha || '123456',
        acessoMaster
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
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {m.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {m.acessoMaster && currentUser?.role === 'gerente' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Master
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(m.status)}`}>
                    {m.status === 'Disponível' ? 'Ativo' : m.status}
                  </span>
                </div>
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

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xs">
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
                  placeholder="ex: Bruna Santos"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden text-xs"
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
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1">
                  Segmentos / Células de Atuação:
                </label>

                {/* Menu Suspenso (Dropdown) com tamanho 11px */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCelulasDropdownOpen(!isCelulasDropdownOpen)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-[11px] font-semibold text-slate-900 dark:text-white flex items-center justify-between hover:border-indigo-400 focus:outline-hidden transition-all shadow-2xs"
                  >
                    <span className="truncate pr-2">
                      {selectedEspecialidades.length === 0
                        ? 'Selecione as células...'
                        : `${selectedEspecialidades.length} célula(s) selecionada(s) (${selectedEspecialidades.join(', ')})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCelulasDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>

                  {isCelulasDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {selectedEspecialidades.length} de {celulas.length} selecionada(s)
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={selectAllCelulas}
                            className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold rounded text-[11px] hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                          >
                            + Selecionar Todas
                          </button>
                          <button
                            type="button"
                            onClick={clearAllCelulas}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>

                      <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                        {celulas.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-2 text-center">Nenhuma célula cadastrada em Células de Atendimento.</p>
                        ) : (
                          celulas.map(c => {
                            const isSelected = selectedEspecialidades.includes(c.nome);
                            return (
                              <div
                                key={c.id}
                                onClick={() => toggleEspecialidade(c.nome)}
                                className={`flex items-center space-x-2.5 p-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="truncate">{c.nome}</span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCelulasDropdownOpen(false)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition-colors shadow-2xs"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Login:</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden text-xs"
                />
              </div>

              {/* CAMPO DE SENHA DO MULTIPLICADOR */}
              {currentUser?.role === 'gerente' ? (
                <div className="p-3 bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-900 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Cadastrar / Alterar Senha de Acesso:</span>
                    </label>
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Gerente Master
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Defina a senha de acesso..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-10 py-1.5 font-bold text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    * Apenas o Gerente pode visualizar, cadastrar e alterar a senha de todos os multiplicadores.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Senha de Acesso Protegida</span>
                    <span>Apenas o <strong>GERENTE</strong> tem permissão para cadastrar, alterar e visualizar as senhas dos multiplicadores.</span>
                  </div>
                </div>
              )}

              {/* CAMPO LIBERAR ACESSO MASTER (APENAS PARA O GERENTE) */}
              {currentUser?.role === 'gerente' && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acessoMaster}
                      onChange={(e) => setAcessoMaster(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Liberar Acesso Master
                    </span>
                  </label>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 pl-6">
                    Ao marcar esta opção, o multiplicador terá acesso completo às funções de Gerente ao logar com sua própria senha, e os registros de auditoria continuarão salvos em seu nome.
                  </p>
                </div>
              )}

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
