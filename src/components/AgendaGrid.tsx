import React, { useState } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Info,
  Layers,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Multiplicador, Turma, TipoDemanda } from '../types';

interface AgendaGridProps {
  onSelectSlotToSchedule: (type: 'multiplicador' | 'sala', entityId: string, hour: string, date?: string) => void;
  onSelectTurmaDetail: (turma: Turma) => void;
  onOpenNovaDemanda?: () => void;
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

export const AgendaGrid: React.FC<AgendaGridProps> = ({
  onSelectSlotToSchedule,
  onSelectTurmaDetail,
  onOpenNovaDemanda
}) => {
  const { 
    multiplicadores, 
    turmas, 
    selectedDate, 
    setSelectedDate,
    currentUser
  } = useApp();

  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('todos');

  // Checagem de permissão Master / Gerente
  const isMaster = currentUser?.role === 'gerente' || !!currentUser?.acessoMaster;

  // Encontrar o multiplicador do usuário logado
  const myMultiplicador = multiplicadores.find(m => 
    m.id === currentUser?.multiplicadorId || 
    m.nome.toLowerCase() === currentUser?.nome?.toLowerCase() ||
    (currentUser?.login && m.nome.toLowerCase().includes(currentUser.login.toLowerCase()))
  );

  // Lista de multiplicadores permitida por permissão
  const multiplicadoresAtivos = multiplicadores.filter(m => m.status !== 'Ausente' && m.status !== 'Férias');
  
  const multiplicadoresPermitidos = isMaster
    ? multiplicadoresAtivos
    : (myMultiplicador ? [myMultiplicador] : multiplicadoresAtivos.slice(0, 1));

  const multiplicadoresExibidos = filterSpecialty === 'todos' 
    ? multiplicadoresPermitidos 
    : multiplicadoresPermitidos.filter(m => m.especialidades.includes(filterSpecialty));

  const todasEspecialidades = Array.from(new Set(multiplicadoresAtivos.flatMap(m => m.especialidades)));

  // Filtragem de turmas por permissão
  const turmasPermitidas = turmas.filter(t => {
    if (t.status === 'Cancelado') return false;
    if (isMaster) return true;
    return (
      t.multiplicadorId === myMultiplicador?.id ||
      t.multiplicadorNome.toLowerCase() === myMultiplicador?.nome.toLowerCase() ||
      t.multiplicadorNome.toLowerCase() === currentUser?.nome.toLowerCase()
    );
  });

  // Navegação de Dias / Semanas / Meses
  const handlePrev = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'dia') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'dia') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

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

  const weekDays = getWeekDates(selectedDate);
  const monthDays = getMonthDays(selectedDate);

  const [currYear, currMonth] = selectedDate.split('-').map(Number);
  const currentMonthName = MONTH_NAMES[currMonth - 1];

  return (
    <div className="space-y-4 pb-12">
      
      {/* Banner de permissão e controles superiores */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
        
        {/* Banner de Nível de Acesso */}
        {!isMaster && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Perfil Restrito (Multiplicador):</strong> Você está visualizando exclusivamente as suas próprias demandas e cronogramas. Inclusão de novas demandas é permitida para você mesmo.
              </span>
            </div>
            <span className="font-bold px-2 py-0.5 bg-amber-200 dark:bg-amber-900 rounded text-[11px] shrink-0">
              {myMultiplicador?.nome || currentUser?.nome}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Seletor de Modo de Visão: Dia, Semana, Mês */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('dia')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'dia'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Grade Diária</span>
            </button>

            <button
              onClick={() => setViewMode('semana')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'semana'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Visão Semanal</span>
            </button>

            <button
              onClick={() => setViewMode('mes')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'mes'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Visão Mensal</span>
            </button>
          </div>

          {/* Navegação de Datas */}
          <div className="flex flex-wrap items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
              {viewMode === 'semana' && (
                <span>Semana ({weekDays[0].shortLabel} a {weekDays[6].shortLabel})</span>
              )}
              {viewMode === 'mes' && (
                <span>{currentMonthName} de {currYear}</span>
              )}
              {viewMode === 'dia' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                />
              )}
            </div>

            <button
              onClick={handleNext}
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

        {/* Legenda e Filtro de Especialidade (para Masters) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Legenda de Treinamentos:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600 text-white font-medium text-[11px]">
              Novatos
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white font-medium text-[11px]">
              Reciclagem
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-semibold text-[11px]">
              Sinergia
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-600 text-white font-medium text-[11px]">
              Alinhamento
            </span>
          </div>

          {isMaster && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Filtrar Especialidade:</span>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="todos">Todas ({todasEspecialidades.length})</option>
                {todasEspecialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* ----------------- MODO 1: VISÃO SEMANAL ----------------- */}
      {viewMode === 'semana' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map(day => {
            const turmasDoDiaSemana = turmasPermitidas.filter(t => t.data === day.dateStr);

            return (
              <div 
                key={day.dateStr}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                  day.isToday 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 dark:border-slate-800'
                } p-3 shadow-2xs flex flex-col justify-between space-y-3 min-h-[320px]`}
              >
                <div className="space-y-2">
                  
                  {/* Cabeçalho do Dia */}
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-bold uppercase block ${day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                        {day.dayName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {day.shortLabel}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        const multId = myMultiplicador ? myMultiplicador.id : (multiplicadoresExibidos[0]?.id || '');
                        onSelectSlotToSchedule('multiplicador', multId, '09:00', day.dateStr);
                      }}
                      className="p-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      title={`Agendar para ${day.shortLabel}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lista de Turmas do Dia */}
                  {turmasDoDiaSemana.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-[11px] italic">
                      Sem agendamentos
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {turmasDoDiaSemana.map(t => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTurmaDetail(t)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-transform hover:scale-[1.02] space-y-1.5 ${getBadgeStyle(t.tipo)}`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-90 font-mono">
                            <span>{t.horarioInicio} - {t.horarioFim}</span>
                            <span className="font-bold">{t.tipo}</span>
                          </div>

                          <h5 className="font-bold text-xs leading-snug line-clamp-2">
                            {t.nomeTurma}
                          </h5>

                          <div className="text-[10px] opacity-90 space-y-0.5">
                            <p className="truncate">👤 {t.multiplicadorNome}</p>
                            <p className="truncate">🏢 {t.salaNome}</p>
                            <p className="font-mono">👥 {t.qtdParticipantes} participantes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-medium text-center">
                  {turmasDoDiaSemana.length} {turmasDoDiaSemana.length === 1 ? 'demanda' : 'demandas'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODO 2: VISÃO MENSAL ----------------- */}
      {viewMode === 'mes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <div>SEG</div>
            <div>TER</div>
            <div>QUA</div>
            <div>QUI</div>
            <div>SEX</div>
            <div>SÁB</div>
            <div>DOM</div>
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-slate-200 dark:border-slate-800">
            {monthDays.map((mDay, idx) => {
              const turmasDay = turmasPermitidas.filter(t => t.data === mDay.dateStr);

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

                      {mDay.isCurrentMonth && (
                        <button
                          onClick={() => {
                            const multId = myMultiplicador ? myMultiplicador.id : (multiplicadoresExibidos[0]?.id || '');
                            onSelectSlotToSchedule('multiplicador', multId, '09:00', mDay.dateStr);
                          }}
                          className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold cursor-pointer"
                          title="Agendar neste dia"
                        >
                          +
                        </button>
                      )}
                    </div>

                    {/* Turmas do Dia em Pílulas */}
                    <div className="space-y-1">
                      {turmasDay.slice(0, 3).map(t => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTurmaDetail(t)}
                          className={`p-1 rounded text-[10px] font-medium truncate cursor-pointer ${getBadgeStyle(t.tipo)}`}
                          title={`${t.nomeTurma} (${t.horarioInicio}-${t.horarioFim})`}
                        >
                          <span className="font-mono font-bold">{t.horarioInicio}</span> {t.nomeTurma}
                        </div>
                      ))}

                      {turmasDay.length > 3 && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                          +{turmasDay.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {turmasDay.length > 0 && (
                    <div className="text-[9px] font-mono font-bold text-slate-400 text-right">
                      {turmasDay.length} turmas
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ----------------- MODO 3: GRADE DIÁRIA POR HORÁRIO ----------------- */}
      {viewMode === 'dia' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1100px]">
              
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 w-56 min-w-[220px] text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    Multiplicador / Instrutor
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
                {multiplicadoresExibidos.map((m: Multiplicador) => {
                  const turmasDoDia = turmasPermitidas.filter(t => t.data === selectedDate);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      
                      {/* Coluna Fixa do Instrutor */}
                      <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={m.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={m.nome}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {m.nome}
                            </h4>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className={`w-2 h-2 rounded-full ${
                                m.status === 'Disponível' ? 'bg-emerald-500' :
                                m.status === 'Em Treinamento' ? 'bg-indigo-500' :
                                m.status === 'Férias' ? 'bg-amber-500' : 'bg-slate-400'
                              }`} />
                              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                {m.horarioInicio}-{m.horarioFim} • {m.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Células de Horário */}
                      {HOURS.map(hour => {
                        const turmasMatching = turmasDoDia.filter(t => {
                          if (t.multiplicadorId !== m.id) return false;
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
                            {turmasMatching.length > 0 ? (
                              turmasMatching.map(t => (
                                <div
                                  key={t.id}
                                  onClick={() => onSelectTurmaDetail(t)}
                                  className={`p-1.5 rounded-lg border text-[10px] font-medium cursor-pointer transition-transform hover:scale-[1.02] ${getBadgeStyle(t.tipo)}`}
                                  title={`Turma: ${t.nomeTurma}\nTema: ${t.tema}\nSala: ${t.salaNome}\nHorário: ${t.horarioInicio} - ${t.horarioFim}`}
                                >
                                  <div className="font-bold truncate">{t.nomeTurma}</div>
                                  <div className="text-[9px] opacity-90 truncate">{t.salaNome}</div>
                                  <div className="text-[9px] font-mono opacity-80">{t.horarioInicio}-{t.horarioFim} ({t.qtdParticipantes} ops)</div>
                                </div>
                              ))
                            ) : (
                              <button
                                onClick={() => onSelectSlotToSchedule('multiplicador', m.id, hour, selectedDate)}
                                className="w-full h-full rounded-lg hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all group cursor-pointer"
                                title={`Agendar turma com ${m.nome} às ${hour}`}
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

    </div>
  );
};
