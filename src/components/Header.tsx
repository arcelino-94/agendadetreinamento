import React, { useState } from 'react';
import { 
  Calendar, 
  PlusCircle, 
  Sparkles, 
  Database, 
  Sun, 
  Moon, 
  Clock, 
  Bell, 
  CheckCircle2,
  Users,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineAlerts } from '../lib/planningEngine';

interface HeaderProps {
  onOpenNovaDemanda: () => void;
  onOpenNovaTurma: () => void;
  onOpenFirebaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNovaDemanda,
  onOpenNovaTurma,
  onOpenFirebaseModal
}) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    isDarkMode, 
    setIsDarkMode, 
    isFirebaseConnected,
    demandas,
    setActiveTab,
    resetToInitialData
  } = useApp();

  const [showAlerts, setShowAlerts] = useState(false);
  const deadlineAlerts = getDeadlineAlerts(demandas);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-2xs">
      <div className="max-w-[1720px] mx-auto px-3">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  T&D Call Center
                </h1>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60 uppercase tracking-wide">
                  High Density
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block">
                Controle em tempo real de turmas, salas e multiplicadores
              </p>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Seletor de Data */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px]">Data:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Status do Firebase / Sincronização */}
            <button
              onClick={onOpenFirebaseModal}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Status da Sincronização em Nuvem (Firebase Firestore)"
            >
              <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden md:inline text-[11px] font-semibold">
                {isFirebaseConnected ? 'Firestore Conectado' : 'Sinc. Local'}
              </span>
            </button>

            {/* Alertas de SLA / Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Alertas de Prazos e SLA"
              >
                <Bell className="w-4 h-4" />
                {deadlineAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {deadlineAlerts.length}
                  </span>
                )}
              </button>

              {/* Popover de Alertas */}
              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Alertas de SLA ({deadlineAlerts.length})</span>
                    </h3>
                    <button
                      onClick={() => setShowAlerts(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Fechar
                    </button>
                  </div>

                  <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 space-y-1.5">
                    {deadlineAlerts.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                        Nenhum pedido atrasado ou próximo do vencimento!
                      </p>
                    ) : (
                      deadlineAlerts.map(dem => (
                        <div key={dem.id} className="pt-1.5 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                              {dem.id} - {dem.tema}
                            </span>
                            <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-1 py-0.5 rounded text-[9px] font-bold">
                              Prazo: {dem.prazoLimite}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Célula: {dem.celulaNome} | {dem.qtdOperadores} ops
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {deadlineAlerts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setShowAlerts(false);
                          setActiveTab('assistente');
                        }}
                        className="w-full py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded text-center transition-colors flex items-center justify-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ver no Assistente de Planejamento</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title={isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm('Deseja restaurar os dados iniciais de demonstração (15 multiplicadores, 18 células, 8 salas)?')) {
                  resetToInitialData();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Restaurar dados de teste iniciais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Nova Demanda Button */}
            <button
              onClick={onOpenNovaDemanda}
              className="hidden sm:flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Nova Demanda</span>
            </button>

            {/* Criar Turma Button */}
            <button
              onClick={onOpenNovaTurma}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-2xs hover:shadow-indigo-500/20"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Agendar Turma</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
