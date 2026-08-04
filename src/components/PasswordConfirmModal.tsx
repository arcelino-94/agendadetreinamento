import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemDescription?: string;
}

export const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  itemDescription
}) => {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const hasMasterAccess = currentUser?.role === 'gerente' || !!currentUser?.acessoMaster;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {hasMasterAccess ? (
          <>
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-2xl text-red-600 dark:text-red-400 shrink-0 shadow-2xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                {itemDescription && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Item: <span className="text-slate-700 dark:text-slate-300 font-semibold">{itemDescription}</span>
                  </p>
                )}
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 pt-1">
                  Essa opção não poderá ser desfeita, deseja prosseguir?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/80 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Acesso Restrito
                </h3>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  Procure o gestor para realizar essa ação
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
