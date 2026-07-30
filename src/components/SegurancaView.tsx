import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SegurancaView: React.FC = () => {
  const { securityPassword, setSecurityPassword } = useApp();

  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setNewPassConfirmInput] = useState('');

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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
    setMsg({ type: 'success', text: 'Senha de segurança alterada com sucesso!' });
    setCurrentPassInput('');
    setNewPassInput('');
    setNewPassConfirmInput('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Segurança & Controle de Acesso</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie a senha de autorização para confirmação de exclusões no sistema
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>Regra de Exclusão Segura</span>
          </div>
          <p>
            Qualquer tentativa de excluir salas, multiplicadores, demandas, turmas, alinhamentos ou operadores exige obrigatoriamente a validação desta senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
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
    </div>
  );
};
