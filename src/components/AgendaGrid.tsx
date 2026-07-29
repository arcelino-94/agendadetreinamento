import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Multiplicador, SalaTreinamento, Turma, TipoDemanda } from '../types';

interface AgendaGridProps {
  onSelectSlotToSchedule: (type: 'multiplicador' | 'sala', entityId: string, hour: string) => void;
  onSelectTurmaDetail: (turma: Turma) => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
  '20:00', '21:00', '22:00', '23:00'
];

export const AgendaGrid: React.FC<AgendaGridProps> = ({
  onSelectSlotToSchedule,
  onSelectTurmaDetail
}) => {
  const { 
    multiplicadores, 
    salas, 
    turmas, 
    selectedDate, 
    setSelectedDate 
  } = useApp();

  const [gridMode, setGridMode] = useState<'multiplicadores' | 'salas'>('multiplicadores');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('todos');

  // Navegação de dias
  const handlePrevDay = () => {
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() - 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Turmas do dia selecionado
  const turmasDoDia = turmas.filter(t => t.data === selectedDate && t.status !== 'Cancelado');

  // Estilização dos blocos por Tipo de Treinamento
  const getBadgeStyle = (tipo: TipoDemanda) => {
    switch (tipo) {
      case 'Reciclagem':
        return 'bg-indigo-600 text-white border-indigo-700 shadow-xs';
      case 'Sinergia':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
      case 'Alinhamento':
        return 'bg-amber-600 text-white border-amber-700 shadow-xs';
      case 'Novatos':
        return 'bg-violet-600 text-white border-violet-700 shadow-xs';
      default:
        return 'bg-slate-700 text-white border-slate-800';
    }
  };

  // Filtragem de multiplicadores por especialidade
  const filteredMultiplicadores = filterSpecialty === 'todos' 
    ? multiplicadores 
    : multiplicadores.filter(m => m.especialidades.includes(filterSpecialty));

  // Todas as especialidades cadastradas
  const todasEspecialidades = Array.from(new Set(multiplicadores.flatMap(m => m.especialidades)));

  return (
    <div className="space-y-4">
      
      {/* Controles de Topo e Navegação */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Seletor do Modo de Visão: Multiplicador vs Sala */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
            <button
              onClick={() => setGridMode('multiplicadores')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gridMode === 'multiplicadores'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Grade por Multiplicador ({multiplicadores.length})</span>
            </button>

            <button
              onClick={() => setGridMode('salas')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gridMode === 'salas'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Ocupação por Sala ({salas.length})</span>
            </button>
          </div>

          {/* Navegação de Data */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handlePrevDay}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors"
            >
              Hoje
            </button>
          </div>

        </div>

        {/* Legenda dos Tipos de Treinamento e Filtro por Especialidade */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Legenda:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-600 text-white font-medium text-[11px]">
              Reciclagem
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white font-medium text-[11px]">
              Sinergia
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-600 text-white font-medium text-[11px]">
              Alinhamento
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-violet-600 text-white font-medium text-[11px]">
              Novatos
            </span>
          </div>

          {gridMode === 'multiplicadores' && (
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

      {/* Grade Matriz Visual Interativa */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[1100px]">
            
            {/* Cabecalho da Grade (Eixo Horizontal: Horarios) */}
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 w-56 min-w-[220px] text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                  {gridMode === 'multiplicadores' ? 'Multiplicador / Instrutor' : 'Sala de Treinamento'}
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

            {/* Corpo da Grade (Eixo Vertical: Multiplicadores ou Salas) */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              
              {gridMode === 'multiplicadores' ? (
                // --- VISÃO POR MULTIPLICADOR ---
                filteredMultiplicadores.map((m: Multiplicador) => {
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
                        // Buscar turmas deste multiplicador que cobrem este horário
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
                              // Célula Livre -> Botão para agendar
                              <button
                                onClick={() => onSelectSlotToSchedule('multiplicador', m.id, hour)}
                                className="w-full h-full rounded-lg hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all group"
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
                })
              ) : (
                // --- VISÃO POR SALA DE TREINAMENTO ---
                salas.map((s: SalaTreinamento) => {
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
                            <span className={s.status === 'Livre' ? 'text-emerald-600' : 'text-amber-600'}>
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
                                  onClick={() => onSelectTurmaDetail(t)}
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
                                onClick={() => onSelectSlotToSchedule('sala', s.id, hour)}
                                className="w-full h-full rounded-lg hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all group"
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
                })
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
