import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, CloudCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CloudSyncToast: React.FC = () => {
  const { saveStatus, lastSyncTime, isFirebaseConnected } = useApp();

  if (saveStatus === 'idle' && !isFirebaseConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none transition-all duration-300">
      {saveStatus === 'saving' && (
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

      {saveStatus === 'saved' && (
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

      {saveStatus === 'error' && (
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
