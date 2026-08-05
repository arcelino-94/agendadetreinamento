import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SalaTreinamento, Turma, TipoDemanda } from '../types';
import { PasswordConfirmModal } from './PasswordConfirmModal';

interface SalasViewProps {
  onSelectSlotToSchedule?: (type: 'multiplicador' | 'sala', entityId: string, hour: string) => void;
  onSelectTurmaDetail?: (turma: Turma) => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
  '20:00', '21:00', '22:00', '23:00'
];

function getWeekDates(centerDateStr: string) {
  const d = new Date(centerDateStr + 'T12:00:00');
  const day = d.getDay();
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMon));
  
  const days = [];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({
      dateStr,
      dayName: dayNames[i],
      shortLabel: `${dd}/${mm}`,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    });
  }
  return days;
}

function getMonthDays(centerDateStr: string) {
  const [yearStr, monthStr] = centerDateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDay = firstDay.getDay();
  const startOffset = (startDay + 6) % 7; 
  
  const days = [];
  
  for (let i = startOffset - 1; i >= 0; i--) {
    const prev = new Date(year, month, -i);
    const yyyy = prev.getFullYear();
    const mm = String(prev.getMonth() + 1).padStart(2, '0');
    const dd = String(prev.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({
      dateStr,
      dayNum: prev.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    });
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const curr = new Date(year, month, i);
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    });
  }
  
  const total = days.length;
  const remaining = (7 - (total % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const next = new Date(year, month + 1, i);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    });
  }
  
  return days;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const SalasView: React.FC<SalasViewProps> = ({
  onSelectSlotToSchedule,
  onSelectTurmaDetail
}) => {
  const { salas, addSala, updateSala, deleteSala, turmas, selectedDate, setSelectedDate } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'ocupacao'>('cards');
  const [ocupacaoViewMode, setOcupacaoViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<SalaTreinamento | null>(null);

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState<number>(30);
  const [recursosInput, setRecursosInput] = useState('');
  const [localizacao, setLocalizacao] = useState('Prédio Principal');

  // Deletion Modal Password
  const [deletingSalaId, setDeletingSalaId] = useState<string | null>(null);

  // Navegação de datas para a Ocupação de Sala
  const handlePrevNav = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (ocupacaoViewMode === 'dia') {
      d.setDate(d.getDate() - 1);
    } else if (ocupacaoViewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextNav = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (ocupacaoViewMode === 'dia') {
      d.setDate(d.getDate() + 1);
    } else if (ocupacaoViewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const turmasDoDia = turmas.filter(t => t.data === selectedDate && t.status !== 'Cancelado');

  const getBadgeStyle = (tipo: TipoDemanda) => {
    switch (tipo) {
      case 'Novatos':
        return 'bg-blue-600 text-white border-blue-700 shadow-xs';
      case 'Reciclagem':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
      case 'Sinergia':
        return 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-semibold';
      case 'Alinhamento':
        return 'bg-purple-600 text-white border-purple-700 shadow-xs';
      default:
        return 'bg-slate-700 text-white border-slate-800';
    }
  };

  const handleOpenModal = (s?: SalaTreinamento) => {
    if (s) {
      setEditingSala(s);
      setNome(s.nome);
      setCapacidade(s.capacidade);
      setRecursosInput(s.recursos.join(', '));
      setLocalizacao(s.bloco || 'Prédio Principal');
    } else {
      setEditingSala(null);
      setNome(`Sala ${salas.length + 1}`);
      setCapacidade(30);
      setRecursosInput('Projetor, Ar Condicionado, 30 PCs');
      setLocalizacao('Prédio Principal');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const recursos = recursosInput.split(',').map(r => r.trim()).filter(Boolean);

    if (editingSala) {
      updateSala(editingSala.id, {
        nome,
        capacidade,
        recursos,
        bloco: localizacao
      });
    } else {
      addSala({
        nome,
        capacidade,
        recursos,
        bloco: localizacao,
        status: 'Livre'
      });
    }

    setIsModalOpen(false);
  };

  // Helper para verificar disponibilidade LIVE em relação ao horário atual/meio-dia
  const getLiveRoomStatus = (salaId: string) => {
    const turmasHoje = turmas.filter(
      t => t.salaId === salaId && t.data === selectedDate && t.status !== 'Cancelado'
    );

    if (turmasHoje.length === 0) {
      return { status: 'Livre', text: 'Livre o dia todo', color: 'emerald' };
    }

    const currentHour = new Date().getHours();
    
    const turmaManha = turmasHoje.find(t => t.horarioInicio < '12:00' && t.horarioFim <= '13:00');
    const turmaTarde = turmasHoje.find(t => t.horarioInicio >= '12:00');

    if (turmaManha && currentHour < 12) {
      return { 
        status: 'Ocupada', 
        text: `Ocupada até 12:00 (${turmaManha.nomeTurma})`, 
        color: 'amber' 
      };
    }

    if (turmaTarde && currentHour >= 12) {
      return { 
        status: 'Ocupada', 
        text: `Ocupada à tarde (${turmaTarde.nomeTurma})`, 
        color: 'amber' 
      };
    }

    if (turmaManha && currentHour >= 12 && !turmaTarde) {
      return { 
        status: 'Livre', 
        text: `Livre agora (Teve turma até 12:00)`, 
        color: 'emerald' 
      };
    }

    return { 
      status: 'Ocupada', 
      text: `Turmas Agendadas (${turmasHoje.length})`, 
      color: 'amber' 
    };
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner & Subtab Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Salas de Treinamento e Ocupação</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie as salas de treinamento e acompanhe a grade de ocupação por horários e dias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subtab Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('cards')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Salas Cadastradas ({salas.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ocupacao')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'ocupacao'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Grade de Ocupação de Sala</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Sala</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CARDS DE SALAS */}
      {activeSubTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {salas.map(s => {
            const live = getLiveRoomStatus(s.id);
            const turmasHojeSala = turmas.filter(t => t.salaId === s.id && t.data === selectedDate && t.status !== 'Cancelado');

            return (
              <div 
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {s.bloco || 'Prédio Principal'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {s.nome}
                      </h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      live.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {live.status}
                    </span>
                  </div>

                  {/* Status Ao Vivo Banner */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Status LIVE:</span>
                      <strong className={live.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}>
                        {live.text}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Capacidade:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{s.capacidade} participantes</strong>
                    </div>
                  </div>

                  {/* Equipamentos */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Equipamentos:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.recursos.map((rec, i) => (
                        <span 
                          key={i}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700"
                        >
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Calendário/Linha do Tempo de Ocupação no dia */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3 text-indigo-500" />
                      <span>Grade do Dia ({selectedDate}):</span>
                    </span>

                    {turmasHojeSala.length === 0 ? (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Livre o dia inteiro.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {turmasHojeSala.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => onSelectTurmaDetail && onSelectTurmaDetail(t)}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
                          >
                            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.nomeTurma}</div>
                            <div className="text-slate-500 dark:text-slate-400 flex justify-between font-mono text-[10px]">
                              <span>{t.horarioInicio} - {t.horarioFim}</span>
                              <span>{t.qtdParticipantes} ops</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-1">
                  <button
                    onClick={() => handleOpenModal(s)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar sala"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSalaId(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                    title="Excluir sala"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: GRADE INTERATIVA DE OCUPAÇÃO POR SALA */}
      {activeSubTab === 'ocupacao' && (
        <div className="space-y-4">
          
          {/* Top Control Bar for View Mode and Navigation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Seletor de Visão de Ocupação: Diária, Semanal, Mensal */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setOcupacaoViewMode('dia')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  ocupacaoViewMode === 'dia'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Grade Diária</span>
              </button>

              <button
                onClick={() => setOcupacaoViewMode('semana')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  ocupacaoViewMode === 'semana'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Visão Semanal</span>
              </button>

              <button
                onClick={() => setOcupacaoViewMode('mes')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  ocupacaoViewMode === 'mes'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Visão Mensal</span>
              </button>
            </div>

            {/* Controles de Navegação de Data */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevNav}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                {ocupacaoViewMode === 'semana' && (
                  <span>Semana ({getWeekDates(selectedDate)[0].shortLabel} a {getWeekDates(selectedDate)[6].shortLabel})</span>
                )}
                {ocupacaoViewMode === 'mes' && (
                  <span>{MONTH_NAMES[parseInt(selectedDate.split('-')[1], 10) - 1]} de {selectedDate.split('-')[0]}</span>
                )}
                {ocupacaoViewMode === 'dia' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                  />
                )}
              </div>

              <button
                onClick={handleNextNav}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Hoje
              </button>
            </div>
          </div>

          {/* 1. GRADE DIÁRIA POR HORÁRIOS */}
          {ocupacaoViewMode === 'dia' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 w-56 min-w-[220px] text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Sala de Treinamento
                      </th>
                      {HOURS.map(hour => (
                        <th 
                          key={hour}
                          className="p-2 text-center text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 min-w-[80px] border-r border-slate-100 dark:border-slate-800"
                        >
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salas.map((s: SalaTreinamento) => {
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          
                          {/* Coluna Fixa da Sala */}
                          <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {s.nome}
                                </h4>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                                <span>Capacidade: <strong>{s.capacidade} ops</strong></span>
                                <span>•</span>
                                <span className={s.status === 'Livre' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                  {s.status}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Células de Horário por Sala */}
                          {HOURS.map(hour => {
                            const turmasNaSala = turmasDoDia.filter(t => {
                              if (t.salaId !== s.id) return false;
                              const hMin = parseInt(hour.split(':')[0]);
                              const startMin = parseInt(t.horarioInicio.split(':')[0]);
                              const endMin = parseInt(t.horarioFim.split(':')[0]);
                              return hMin >= startMin && hMin < endMin;
                            });

                            return (
                              <td 
                                key={hour} 
                                className="p-1 border-r border-slate-100 dark:border-slate-800/80 relative h-16 align-top"
                              >
                                {turmasNaSala.length > 0 ? (
                                  turmasNaSala.map(t => (
                                    <div
                                      key={t.id}
                                      onClick={() => onSelectTurmaDetail && onSelectTurmaDetail(t)}
                                      className={`p-1.5 rounded-lg border text-[10px] font-medium cursor-pointer transition-transform hover:scale-[1.02] ${getBadgeStyle(t.tipo)}`}
                                      title={`Turma: ${t.nomeTurma}\nInstrutor: ${t.multiplicadorNome}\nHorário: ${t.horarioInicio} - ${t.horarioFim}`}
                                    >
                                      <div className="font-bold truncate">{t.nomeTurma}</div>
                                      <div className="text-[9px] opacity-90 truncate">{t.multiplicadorNome}</div>
                                      <div className="text-[9px] font-mono opacity-80">{t.horarioInicio}-{t.horarioFim}</div>
                                    </div>
                                  ))
                                ) : (
                                  <button
                                    onClick={() => onSelectSlotToSchedule && onSelectSlotToSchedule('sala', s.id, hour)}
                                    className="w-full h-full rounded-lg hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all group cursor-pointer"
                                    title={`Agendar ${s.nome} às ${hour}`}
                                  >
                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                  </button>
                                )}
                              </td>
                            );
                          })}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. VISÃO SEMANAL DE OCUPAÇÃO DE SALAS */}
          {ocupacaoViewMode === 'semana' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 w-52 min-w-[200px] text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Sala de Treinamento
                      </th>
                      {getWeekDates(selectedDate).map(day => (
                        <th 
                          key={day.dateStr}
                          className={`p-2 text-center text-xs font-bold border-r border-slate-100 dark:border-slate-800 ${
                            day.isToday ? 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div>{day.dayName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{day.shortLabel}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salas.map((s: SalaTreinamento) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {s.nome}
                            </h4>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Capacidade: <strong>{s.capacidade} ops</strong>
                          </div>
                        </td>

                        {getWeekDates(selectedDate).map(day => {
                          const turmasNaSala = turmas.filter(t => t.salaId === s.id && t.data === day.dateStr && t.status !== 'Cancelado');

                          return (
                            <td 
                              key={day.dateStr}
                              className="p-1.5 border-r border-slate-100 dark:border-slate-800/80 align-top min-w-[120px] h-20"
                            >
                              {turmasNaSala.length > 0 ? (
                                <div className="space-y-1">
                                  {turmasNaSala.map(t => (
                                    <div
                                      key={t.id}
                                      onClick={() => onSelectTurmaDetail && onSelectTurmaDetail(t)}
                                      className={`p-1.5 rounded-lg border text-[10px] font-medium cursor-pointer transition-transform hover:scale-[1.02] ${getBadgeStyle(t.tipo)}`}
                                    >
                                      <div className="font-bold truncate">{t.nomeTurma}</div>
                                      <div className="text-[9px] opacity-90 truncate">{t.multiplicadorNome}</div>
                                      <div className="text-[9px] font-mono opacity-80">{t.horarioInicio}-{t.horarioFim}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  onClick={() => onSelectSlotToSchedule && onSelectSlotToSchedule('sala', s.id, '09:00')}
                                  className="w-full h-full rounded-lg hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all group cursor-pointer text-[10px] font-bold"
                                  title={`Agendar ${s.nome} em ${day.shortLabel}`}
                                >
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. VISÃO MENSAL DE OCUPAÇÃO DE SALAS */}
          {ocupacaoViewMode === 'mes' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <div>SEG</div>
                <div>TER</div>
                <div>QUA</div>
                <div>QUI</div>
                <div>SEX</div>
                <div>SÁB</div>
                <div>DOM</div>
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                {getMonthDays(selectedDate).map((mDay, idx) => {
                  const turmasDay = turmas.filter(t => t.data === mDay.dateStr && t.status !== 'Cancelado');

                  return (
                    <div 
                      key={idx}
                      className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                        !mDay.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700' : 'bg-white dark:bg-slate-900'
                      } ${mDay.isToday ? 'ring-2 ring-indigo-500/30' : ''}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            mDay.isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {mDay.dayNum}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {turmasDay.slice(0, 3).map(t => (
                            <div
                              key={t.id}
                              onClick={() => onSelectTurmaDetail && onSelectTurmaDetail(t)}
                              className={`p-1 rounded text-[10px] font-medium truncate cursor-pointer ${getBadgeStyle(t.tipo)}`}
                              title={`${t.salaNome}: ${t.nomeTurma} (${t.horarioInicio}-${t.horarioFim})`}
                            >
                              <span className="font-bold">{t.salaNome}:</span> {t.nomeTurma}
                            </div>
                          ))}

                          {turmasDay.length > 3 && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                              +{turmasDay.length - 3} salas ocupadas
                            </span>
                          )}
                        </div>
                      </div>

                      {turmasDay.length > 0 && (
                        <div className="text-[9px] font-mono font-bold text-slate-400 text-right">
                          {turmasDay.length} agendamento(s)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modal Add/Edit Sala */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingSala ? 'Editar Sala' : 'Nova Sala de Treinamento'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nome da Sala:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sala 1"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Capacidade (Participantes):</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={capacidade}
                    onChange={(e) => setCapacidade(parseInt(e.target.value) || 20)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Localização:</label>
                  <input
                    type="text"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Ex: Prédio Principal - Térreo"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Recursos / Equipamentos (separados por vírgula):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 30 PCs, Projetor, Ar Condicionado"
                  value={recursosInput}
                  onChange={(e) => setRecursosInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Salvar Sala
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <PasswordConfirmModal
        isOpen={deletingSalaId !== null}
        onClose={() => setDeletingSalaId(null)}
        onConfirm={() => {
          if (deletingSalaId) deleteSala(deletingSalaId);
        }}
        title="Confirmar Exclusão de Sala"
        itemDescription="esta sala de treinamento"
      />

    </div>
  );
};
