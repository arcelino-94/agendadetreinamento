import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CloudSyncToast: React.FC = () => {
  const { saveStatus, lastSyncTime, isFirebaseConnected, hasPendingSync, pendingSyncCount, retrySync } = useApp();

  if (saveStatus === 'idle' && !isFirebaseConnected && !hasPendingSync) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none transition-all duration-300 space-y-2">
      {hasPendingSync && (
        <div className="pointer-events-auto flex items-center space-x-3 bg-amber-950/95 text-amber-100 px-4 py-3 rounded-xl shadow-2xl border border-amber-500/50 backdrop-blur-md animate-fade-in">
          <CloudOff className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-300">
              {pendingSyncCount} registro(s) pendente(s) de sincronização
            </div>
            <p className="text-[10px] text-amber-200/80">
              Seus registros estão salvos na máquina e visíveis no app. O sistema tentará salvar na nuvem automaticamente.
            </p>
          </div>
          <button
            onClick={() => retrySync()}
            className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg border border-amber-400/40 transition flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tentar agora</span>
          </button>
        </div>
      )}

      {saveStatus === 'saving' && !hasPendingSync && (
        <div className="pointer-events-auto flex items-center space-x-3 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 backdrop-blur-md animate-bounce-short">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-200 flex items-center space-x-1">
              <span>Salvando informações...</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Sincronizando edições com todas as máquinas em tempo real
            </p>
          </div>
        </div>
      )}

      {saveStatus === 'saved' && !hasPendingSync && (
        <div className="pointer-events-auto flex items-center space-x-3 bg-emerald-950/95 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-300">
              Informações salvas!
            </div>
            <p className="text-[10px] text-emerald-200/80">
              Atualizado na nuvem {lastSyncTime ? `às ${lastSyncTime}` : 'agora'}
            </p>
          </div>
        </div>
      )}

      {saveStatus === 'error' && !hasPendingSync && (
        <div className="pointer-events-auto flex items-center space-x-3 bg-rose-950/95 text-rose-100 px-4 py-3 rounded-xl shadow-2xl border border-rose-500/40 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-rose-300">
              Atenção na sincronização
            </div>
            <p className="text-[10px] text-rose-200/80">
              Verifique a conexão. Tentando reconectar...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
