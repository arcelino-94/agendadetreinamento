import React from 'react';
import { X, Calendar, CheckCircle2, XCircle, AlertTriangle, Clock, Award, ShieldAlert, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlunoFrequenciaNota, PresencaDiariaItem } from '../types';

interface AlunoPresencaCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: AlunoFrequenciaNota | null;
  treinamentoNome: string;
  dataInicio?: string;
  dataFim?: string;
  onUpdateDailyStatus?: (alunoId: string, dateKey: string, status: string) => void;
}

const parseLocalDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const clean = dateStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
    }
  }
  if (clean.includes('-')) {
    const parts = clean.split('T')[0].split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
    }
  }
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const AlunoPresencaCalendarModal: React.FC<AlunoPresencaCalendarModalProps> = ({
  isOpen,
  onClose,
  aluno,
  treinamentoNome,
  dataInicio,
  dataFim,
  onUpdateDailyStatus
}) => {
  if (!isOpen || !aluno) return null;

  const presencas = aluno.presencaDiaria || {};

  // Build calendar days array based on course dataInicio to dataFim (or 25 days default)
  const start = parseLocalDate(dataInicio);
  const totalDaysCount = 25; // default 25 training days
  const calendarDays: { dateKey: string; dayNum: number; monthLabel: string; dayOfWeek: string; record?: PresencaDiariaItem }[] = [];

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  for (let i = 0; i < totalDaysCount; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dayNum = d.getDate();
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
    const dayOfWeek = daysOfWeek[d.getDay()];
    calendarDays.push({
      dateKey,
      dayNum,
      monthLabel,
      dayOfWeek,
      record: presencas[dateKey]
    });
  }

  // Count summaries
  let countP = 0;
  let countFI = 0;
  let countFJ = 0;
  let countDayOff = 0;
  let countAtestado = 0;
  let countOutros = 0;

  (Object.values(presencas) as PresencaDiariaItem[]).forEach(item => {
    const st = item.frequencia;
    if (st === 'P') countP++;
    else if (st === 'FI') countFI++;
    else if (st === 'FJ') countFJ++;
    else if (st === 'DAY OFF' || st === 'DRS' || st === 'BH' || st === 'FERIADO') countDayOff++;
    else if (st === 'A') countAtestado++;
    else if (st) countOutros++;
  });

  const getStatusBadgeStyle = (st?: string) => {
    switch (st) {
      case 'P':
        return 'bg-emerald-600 text-white font-black';
      case 'FI':
        return 'bg-rose-600 text-white font-black';
      case 'FJ':
        return 'bg-amber-600 text-white font-black';
      case 'DAY OFF':
      case 'DRS':
      case 'BH':
        return 'bg-slate-700 text-white font-black';
      case 'FERIADO':
        return 'bg-purple-600 text-white font-black';
      case 'A':
        return 'bg-blue-600 text-white font-black';
      case 'TO':
        return 'bg-orange-600 text-white font-black';
      default:
        return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-bold border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl p-4 shadow-2xl space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Calendário de Frequência do Operador
                </h3>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {aluno.frequenciaPercent}% Presença
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">{aluno.nome}</strong> • Login BB: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{aluno.loginBB || aluno.matDP}</span> • Célula: {aluno.celula}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center text-xs transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Summary Badges Bar (4 cards: P, FI, FJ, Folgas/DSR) */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-1.5 rounded-lg text-center">
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">Presenças (P)</span>
            <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">{countP} d</span>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-1.5 rounded-lg text-center">
            <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 block uppercase">Faltas Inj. (FI)</span>
            <span className="text-sm font-black text-rose-800 dark:text-rose-300">{countFI} d</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-1.5 rounded-lg text-center">
            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block uppercase">Faltas Just. (FJ)</span>
            <span className="text-sm font-black text-amber-800 dark:text-amber-300">{countFJ} d</span>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg text-center">
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 block uppercase">Folgas / DSR</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{countDayOff} d</span>
          </div>
        </div>

        {/* Mini Calendar Days Grid */}
        <div>
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
            {calendarDays.map(item => {
              const status = item.record?.frequencia || '';
              return (
                <div
                  key={item.dateKey}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center flex flex-col items-center justify-between shadow-2xs space-y-0.5 hover:border-indigo-400 transition-all"
                >
                  <div className="flex items-center justify-between w-full text-[8px] font-mono text-slate-400">
                    <span>{item.dayOfWeek}</span>
                    <span>{item.dayNum}/{item.monthLabel}</span>
                  </div>

                  {onUpdateDailyStatus ? (
                    <select
                      value={status}
                      onChange={(e) => onUpdateDailyStatus(aluno.id, item.dateKey, e.target.value)}
                      className={`w-full text-center py-0.5 rounded text-[9px] font-black cursor-pointer border-0 ${getStatusBadgeStyle(status)}`}
                    >
                      <option value="" className="bg-white text-slate-400 font-bold">-</option>
                      <option value="P" className="bg-white text-slate-900 font-bold">P</option>
                      <option value="FI" className="bg-white text-rose-700 font-bold">FI</option>
                      <option value="FJ" className="bg-white text-amber-700 font-bold">FJ</option>
                      <option value="DRS" className="bg-white text-slate-700 font-bold">DSR</option>
                      <option value="BH" className="bg-white text-slate-700 font-bold">BH</option>
                      <option value="DAY OFF" className="bg-white text-slate-700 font-bold">DAY OFF</option>
                      <option value="FERIADO" className="bg-white text-purple-700 font-bold">FERIADO</option>
                    </select>
                  ) : (
                    <span className={`w-full py-0.5 rounded text-[9px] text-center font-black ${getStatusBadgeStyle(status)}`}>
                      {status || '-'}
                    </span>
                  )}

                  {item.record?.horaExtra && (
                    <span className="text-[8px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      HE:{item.record.horaExtra}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
