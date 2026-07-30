import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Award,
  Building2, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDeadlineAlerts } from '../lib/planningEngine';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, demandas, multiplicadores, salas } = useApp();
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
      label: 'Matriz Competências',
      icon: Award,
      badge: (
        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
          Novo
        </span>
      )
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
      id: 'relatorios',
      label: 'Relatórios & KPIs',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-full lg:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shrink-0 self-start p-2 shadow-2xs">
      <div className="space-y-0.5">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Navegação Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate text-[11px]">{item.label}</span>
              </div>
              {item.badge}
            </button>
          );
        })}
      </div>

      {/* Mini Widget Informativo no Rodapé do Sidebar */}
      <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200/80 dark:border-slate-700/60 space-y-1">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Regra Anti-Conflito</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          Bloqueio automático de choque de horários em salas e instrutores.
        </p>
      </div>
    </aside>
  );
};
