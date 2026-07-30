import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Users, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SalaTreinamento } from '../types';

interface ReservarSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSalaToBook: (preset: { salaId: string; hour?: string; horarioInicio?: string; horarioFim?: string; data?: string }) => void;
}

export const ReservarSalaModal: React.FC<ReservarSalaModalProps> = ({
  isOpen,
  onClose,
  onSelectSalaToBook
}) => {
  const { salas, turmas, selectedDate } = useApp();
  
  // Real-time clock for display
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); // update every 30s
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Format date and time
  const currentTimeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const currentDateFormatted = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const todayYYYYMMDD = selectedDate || now.toISOString().split('T')[0];

  const currentHourNum = now.getHours();
  const currentMinuteNum = now.getMinutes();

  // Helper to compute room availability spans for today
  const getRoomAvailabilityDetails = (sala: SalaTreinamento) => {
    const turmasHoje = turmas.filter(
      t => t.salaId === sala.id && t.data === todayYYYYMMDD && t.status !== 'Cancelado'
    ).sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));

    // Working hours for rooms: 08:00 to 18:00
    const dayStart = '08:00';
    const dayEnd = '18:00';

    // Current time HH:MM string
    const currentHHMM = `${currentHourNum.toString().padStart(2, '0')}:${currentMinuteNum.toString().padStart(2, '0')}`;

    // Is room currently occupied right now?
    const currentTurma = turmasHoje.find(
      t => currentHHMM >= t.horarioInicio && currentHHMM < t.horarioFim
    );

    // Calculate free time intervals during the day (08:00 - 18:00)
    const freeIntervals: { inicio: string; fim: string; label: string }[] = [];
    let cursor = dayStart;

    turmasHoje.forEach(t => {
      if (t.horarioInicio > cursor) {
        freeIntervals.push({
          inicio: cursor,
          fim: t.horarioInicio,
          label: `Livre das ${cursor} às ${t.horarioInicio}`
        });
      }
      if (t.horarioFim > cursor) {
        cursor = t.horarioFim;
      }
    });

    if (cursor < dayEnd) {
      freeIntervals.push({
        inicio: cursor,
        fim: dayEnd,
        label: `Livre das ${cursor} às ${dayEnd}`
      });
    }

    // Filter intervals that are still upcoming/valid today
    const nextAvailableIntervals = freeIntervals.filter(i => i.fim > currentHHMM);

    return {
      turmasHoje,
      isOccupiedNow: !!currentTurma,
      currentTurma,
      freeIntervals,
      nextAvailableIntervals,
      isFreeAllDay: turmasHoje.length === 0
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold uppercase rounded">
                  Reservar Sala
                </span>
                <span className="text-xs text-slate-400 font-medium">Consulta Instantânea Ao Vivo</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                Disponibilidade de Salas e Horários
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CURRENT DATE & TIME BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-inner border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Dia e Horário Atual Detectado:
              </span>
              <p className="text-sm font-bold text-white capitalize">
                {currentDateFormatted} — <span className="text-amber-300 font-mono text-base">{currentTimeFormatted}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>Data Selecionada no Painel: <strong>{todayYYYYMMDD}</strong></span>
          </div>
        </div>

        {/* ROOMS AVAILABILITY GRID */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Próximas Salas e Horários Livres para Reserva ({salas.length} Salas):</span>
            <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400 font-mono">
              Janela Comercial: 08:00 às 18:00
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {salas.map((sala) => {
              const details = getRoomAvailabilityDetails(sala);

              return (
                <div 
                  key={sala.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                    details.isOccupiedNow 
                      ? 'border-amber-200 dark:border-amber-900/60' 
                      : 'border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  <div className="space-y-2.5">
                    
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          {sala.bloco || 'Prédio Principal'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {sala.nome}
                        </h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center space-x-1 ${
                        details.isOccupiedNow
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {details.isOccupiedNow ? (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" />
                            <span>Ocupada Agora</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Disponível Agora</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Capacity & Resources */}
                    <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Capacidade: <strong>{sala.capacidade} participantes</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {sala.recursos.map((rec, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px]">
                          {rec}
                        </span>
                      ))}
                    </div>

                    {/* Current Status Message */}
                    {details.isOccupiedNow && details.currentTurma && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                        <strong>Em uso agora:</strong> {details.currentTurma.nomeTurma} ({details.currentTurma.horarioInicio} - {details.currentTurma.horarioFim})
                      </div>
                    )}

                    {/* Available Time Slots Range */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Horários Livres Hoje ({todayYYYYMMDD}):
                      </span>

                      {details.isFreeAllDay ? (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
                          <span>Livre o dia inteiro (08:00 às 18:00)</span>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      ) : details.nextAvailableIntervals.length > 0 ? (
                        <div className="space-y-1">
                          {details.nextAvailableIntervals.map((interval, i) => (
                            <div 
                              key={i} 
                              className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                            >
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                <span>{interval.label}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSalaToBook({
                                    salaId: sala.id,
                                    data: todayYYYYMMDD,
                                    horarioInicio: interval.inicio,
                                    horarioFim: interval.fim
                                  });
                                  onClose();
                                }}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5"
                              >
                                <span>Reservar</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Sem horários livres adicionais para o dia de hoje.
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Booking Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const firstInterval = details.nextAvailableIntervals[0] || { inicio: '08:00', fim: '10:00' };
                        onSelectSalaToBook({
                          salaId: sala.id,
                          data: todayYYYYMMDD,
                          horarioInicio: firstInterval.inicio,
                          horarioFim: firstInterval.fim
                        });
                        onClose();
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Reservar {sala.nome} Agora</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
