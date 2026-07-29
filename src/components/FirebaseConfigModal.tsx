import React from 'react';
import { X, Database, ShieldCheck, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isFirebaseConnected, syncStatus } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sincronização em Tempo Real (Firebase Firestore)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Estado da Sincronização: {syncStatus === 'synced' ? 'Ativo & Sincronizado' : 'Gravando Local'}</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              O sistema utiliza persistência local redundante e sincronização automática multi-abas via BroadcastChannel e Firestore API.
            </p>
          </div>

          <div className="space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span>Modo Multiusuário Simultâneo:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Ativado</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span>Sincronização entre Abas:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Ativo (BroadcastChannel)</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span>Coleção Firestore:</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">/treinamentos_td</strong>
            </div>
          </div>

        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
