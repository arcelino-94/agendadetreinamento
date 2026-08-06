import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Award,
  Building2, 
  BarChart3,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  History,
  CloudUpload,
  CloudDownload,
  Loader2,
  CloudCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineAlerts } from '../lib/planningEngine';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    demandas, 
    multiplicadores, 
    salas, 
    tabulador, 
    operadores,
    rastreabilidades = [],
    forceSaveToCloud,
    forceReloadFromCloud,
    isSaving,
    saveStatus
  } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const deadlineAlerts = getDeadlineAlerts(demandas);
  const pendingCount = demandas.filter(d => d.status === 'Novo' || d.status === 'Em Planejamento').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'agenda',
      label: 'Agenda dos Multiplicadores',
      icon: CalendarRange,
      badge: null
    },
    {
      id: 'assistente',
      label: 'Assistente T&D',
      icon: Sparkles,
      badge: deadlineAlerts.length > 0 ? (
        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
          {deadlineAlerts.length}
        </span>
      ) : null
    },
    {
      id: 'demandas',
      label: 'Fila de Reciclagens',
      icon: FileText,
      badge: pendingCount > 0 ? (
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
          {pendingCount}
        </span>
      ) : null
    },
    {
      id: 'matriz',
      label: 'Células de Atendimento',
      icon: Award,
      badge: null
    },
    {
      id: 'multiplicadores',
      label: 'Multiplicadores',
      icon: UserCheck,
      badge: (
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          {multiplicadores.length}
        </span>
      )
    },
    {
      id: 'salas',
      label: 'Salas Treinamento',
      icon: Building2,
      badge: (
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          {salas.length}
        </span>
      )
    },
    {
      id: 'tabulador',
      label: 'Tabulador',
      icon: ClipboardList,
      badge: (
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          {tabulador.length}
        </span>
      )
    },
    {
      id: 'frequencias',
      label: 'Frequências e Notas',
      icon: GraduationCap,
      badge: null
    },
    {
      id: 'rastreabilidade',
      label: 'Rastreabilidade',
      icon: FileSpreadsheet,
      badge: (
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          {rastreabilidades.length}
        </span>
      )
    },
    {
      id: 'quadro',
      label: 'Quadro (Operadores)',
      icon: Users,
      badge: (
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          {operadores.length}
        </span>
      )
    },
    {
      id: 'jornada',
      label: 'Jornada do Operador',
      icon: History,
      badge: null
    },
    {
      id: 'seguranca',
      label: 'Segurança',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'relatorios',
      label: 'Relatórios & KPIs',
      icon: BarChart3,
      badge: null
    }
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE NAVIGATION BAR (Visible only on < md) */}
      <div className="md:hidden w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-2xs mb-2 space-y-2">
        {/* Dropdown Selector & Drawer Toggle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-lg p-2 pr-8 appearance-none focus:outline-hidden"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-2.5 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-2.5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center space-x-1 shrink-0 shadow-2xs"
          >
            <span>Módulos ({navItems.length})</span>
          </button>
        </div>

        {/* Horizontal Scroll Pill Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="whitespace-nowrap text-[11px]">{item.label}</span>
                {item.badge && <span className="ml-0.5">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE GRID MODAL (All 13 Modules) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>Todas as Funcionalidades ({navItems.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Selecione qualquer módulo do sistema</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                      {item.badge}
                    </div>
                    <span className="text-xs font-bold leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Visible on md and larger) */}
      <aside className={`hidden md:block sticky top-[3.75rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto no-scrollbar transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0 self-start p-2 shadow-2xs z-20 ${
        isCollapsed ? 'w-14' : 'w-full lg:w-56'
      }`}>
        {/* Botão de Ocultar/Mostrar Sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 p-1 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-20"
          title={isCollapsed ? "Expandir Menu" : "Ocultar Menu"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Menu de Gestão
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!isCollapsed && <span className="truncate text-[11px] font-bold">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
