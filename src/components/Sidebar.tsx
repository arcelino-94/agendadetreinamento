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
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineAlerts } from '../lib/planningEngine';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, demandas, multiplicadores, salas, tabulador, operadores } = useApp();
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
      label: 'Agenda de Capacidade',
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
      label: 'Fila de Demandas',
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

  return (
    <>
      {/* MOBILE HORIZONTAL SCROLL NAVIGATION (Visible only on < md) */}
      <div className="md:hidden w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs mb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
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

      {/* DESKTOP SIDEBAR (Visible on md and larger) */}
      <aside className={`hidden md:block relative transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0 self-start p-2 shadow-2xs ${
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
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
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

        {!isCollapsed && (
          <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Regra Anti-Conflito</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Bloqueio automático de choque de horários em salas e instrutores.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
