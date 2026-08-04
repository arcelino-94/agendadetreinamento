import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export function LoginModal() {
  const { 
    loginAsMultiplicador, 
    currentUser 
  } = useApp();

  const [loginInput, setLoginInput] = useState<string>('');
  const [passInput, setPassInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (currentUser) {
    return null; // Já autenticado
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginAsMultiplicador(loginInput, passInput);
    if (!res.success) {
      setErrorMsg(res.error || 'Login ou senha incorretos.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner de Topo */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-5 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center p-2.5 bg-white/10 rounded-2xl mb-2 backdrop-blur-xs border border-white/20 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Sistema T&D Call Center
          </h1>
          <p className="text-xs text-indigo-100 mt-0.5">
            Identifique-se para registrar suas ações no sistema
          </p>
        </div>

        {/* Formulário de Login Único */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Campo Login */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Login
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Login ou E-mail"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar no Sistema</span>
          </button>
        </form>

        {/* Rodapé descritivo */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-center border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          Auditoria ativada: todas as edições registrarão seu usuário.
        </div>
      </div>
    </div>
  );
}
