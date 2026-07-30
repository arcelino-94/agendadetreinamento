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
  Users,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineAlerts } from '../lib/planningEngine';

interface HeaderProps {
  onOpenNovaDemanda: () => void;
  onOpenNovaTurma: () => void;
  onOpenReservarSala: () => void;
  onOpenFirebaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNovaDemanda,
  onOpenNovaTurma,
  onOpenReservarSala,
  onOpenFirebaseModal
}) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    isDarkMode, 
    setIsDarkMode, 
    isFirebaseConnected,
    demandas,
    setActiveTab
  } = useApp();

  const [showAlerts, setShowAlerts] = useState(false);
  const deadlineAlerts = getDeadlineAlerts(demandas);

  return (
    <header className="bg-gradient-to-r from-purple-800 via-indigo-900 to-blue-900 text-white border-b border-indigo-700/50 sticky top-0 z-30 transition-colors shadow-md">
      <div className="max-w-[1720px] mx-auto px-3">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold shadow-xs">
              <Users className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-bold text-white tracking-tight">
                  T&D Call Center
                </h1>
              </div>
              <p className="text-[10px] text-indigo-200 hidden md:block">
                Controle em tempo real de turmas, salas e multiplicadores
              </p>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Seletor de Data */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 text-xs font-medium text-white">
              <Calendar className="w-3.5 h-3.5 text-indigo-200" />
              <span className="text-[11px] text-indigo-100">Data:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer color-scheme-dark"
              />
            </div>

            {/* Alertas de SLA / Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-slate-900 dark:text-slate-100">
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
              className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title={isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Nova Demanda Button */}
            <button
              onClick={onOpenNovaDemanda}
              className="hidden sm:flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors border border-white/20"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-200" />
              <span>Nova Demanda</span>
            </button>

            {/* Reservar Sala Button */}
            <button
              onClick={onOpenReservarSala}
              className="flex items-center space-x-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Reservar Sala</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

