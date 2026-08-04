import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Check, 
  AlertTriangle, 
  History, 
  Search, 
  Filter, 
  Trash2, 
  User, 
  Tag, 
  FileText 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SegurancaView: React.FC = () => {
  const { 
    securityPassword, 
    setSecurityPassword, 
    auditLogs, 
    clearAuditLogs,
    addAuditLog,
    currentUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'senha' | 'logs'>('senha');

  // Senha State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setNewPassConfirmInput] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logs Filter State
  const [logSearch, setLogSearch] = useState('');
  const [filterAcao, setFilterAcao] = useState<string>('todas');
  const [filterModulo, setFilterModulo] = useState<string>('todos');

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (currentPassInput !== securityPassword) {
      setMsg({ type: 'error', text: 'Senha atual incorreta! A senha padrão inicial é 123456.' });
      return;
    }

    if (!newPassInput.trim()) {
      setMsg({ type: 'error', text: 'A nova senha não pode estar em branco.' });
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setMsg({ type: 'error', text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setSecurityPassword(newPassInput.trim());
    addAuditLog('Alteração', 'Segurança', 'Senha de segurança alterada com sucesso.');
    setMsg({ type: 'success', text: 'Senha de segurança alterada com sucesso!' });
    setCurrentPassInput('');
    setNewPassInput('');
    setNewPassConfirmInput('');
  };

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const q = logSearch.toLowerCase();
    const matchSearch = 
      log.descricao.toLowerCase().includes(q) ||
      log.usuario.toLowerCase().includes(q) ||
      log.modulo.toLowerCase().includes(q) ||
      log.timestamp.toLowerCase().includes(q);

    const matchAcao = filterAcao === 'todas' || log.acao === filterAcao;
    const matchModulo = filterModulo === 'todos' || log.modulo === filterModulo;

    return matchSearch && matchAcao && matchModulo;
  });

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'Inclusão':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'Alteração':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'Exclusão':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      
      {/* Guia / Tabs de Navegação no Topo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('senha')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'senha'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Senha de Segurança</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Log</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo Guia 1: Senha de Segurança */}
      {activeSubTab === 'senha' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Segurança & Controle de Acesso</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie as credenciais e parâmetros de segurança do sistema
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Regra de Exclusão Segura</span>
            </div>
            <p>
              Qualquer tentativa de excluir salas, multiplicadores, demandas, turmas, alinhamentos ou operadores exige obrigatoriamente permissão de Gerente ou Acesso Master liberado.
            </p>
          </div>

          <form onSubmit={handleSubmitPassword} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha Atual (padrão inicial: 123456)
              </label>
              <input
                type="password"
                required
                value={currentPassInput}
                onChange={(e) => setCurrentPassInput(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassInput}
                  onChange={(e) => setNewPassConfirmInput(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200'
                }`}
              >
                {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Alterar Senha de Segurança
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conteúdo Guia 2: Histórico de Log */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Histórico de Auditoria & Alterações
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rastreabilidade completa de todas as inclusões, alterações e exclusões efetuadas por usuários e multiplicadores.
                </p>
              </div>
            </div>

            {auditLogs.length > 0 && (
              <button
                onClick={() => {
                  const hasMaster = currentUser?.role === 'gerente' || !!currentUser?.acessoMaster;
                  if (!hasMaster) {
                    alert('Procure o gestor para realizar essa ação');
                    return;
                  }
                  if (window.confirm('Essa opção não poderá ser desfeita, deseja prosseguir?')) {
                    clearAuditLogs();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>

          {/* Filtros de Logs */}
          <div className="flex flex-col md:flex-row items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
            
            {/* Campo de busca */}
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por usuário, ação, descrição ou data..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              {/* Filtro por Ação */}
              <select
                value={filterAcao}
                onChange={(e) => setFilterAcao(e.target.value)}
                className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="todas">Todas as Ações</option>
                <option value="Inclusão">Inclusão</option>
                <option value="Alteração">Alteração</option>
                <option value="Exclusão">Exclusão</option>
              </select>

              {/* Filtro por Módulo */}
              <select
                value={filterModulo}
                onChange={(e) => setFilterModulo(e.target.value)}
                className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="todos">Todos os Módulos</option>
                <option value="Fila de Reciclagens">Fila de Reciclagens</option>
                <option value="Agenda de Capacidade">Agenda de Capacidade</option>
                <option value="Multiplicadores">Multiplicadores</option>
                <option value="Células de Atendimento">Células de Atendimento</option>
                <option value="Salas Treinamento">Salas Treinamento</option>
                <option value="Quadro (Operadores)">Quadro (Operadores)</option>
                <option value="Tabulador de Presença">Tabulador de Presença</option>
                <option value="Frequências e Notas">Frequências e Notas</option>
                <option value="Segurança">Segurança</option>
              </select>
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Módulo</th>
                  <th className="py-2.5 px-3">Descrição da Alteração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{log.usuario}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getAcaoBadge(log.acao)}`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {log.modulo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">
                        {log.descricao}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      Nenhum registro de log encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
            Exibindo <strong>{filteredLogs.length}</strong> de <strong>{auditLogs.length}</strong> registros do histórico de auditoria.
          </div>

        </div>
      )}

    </div>
  );
};
