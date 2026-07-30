import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Calendar,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RelatoriosView: React.FC = () => {
  const { demandas, turmas, multiplicadores, celulas, tabulador } = useApp();

  const [filterCelula, setFilterCelula] = useState<string>('todas');
  const [filterMultiplicador, setFilterMultiplicador] = useState<string>('todos');

  // Cálculos de Relatórios
  const totalOperadoresTreinados = turmas
    .filter(t => t.status === 'Finalizado' || t.status === 'Em Execução')
    .reduce((acc, curr) => acc + curr.qtdParticipantes, 0);

  const totalHorasMinistradas = turmas
    .filter(t => t.status !== 'Cancelado')
    .reduce((acc, t) => {
      const start = parseInt(t.horarioInicio.split(':')[0]);
      const end = parseInt(t.horarioFim.split(':')[0]);
      return acc + (end - start);
    }, 0);

  // Horas por Multiplicador
  const horasPorMultiplicador = multiplicadores.map(m => {
    const turmasMult = turmas.filter(t => t.multiplicadorId === m.id && t.status !== 'Cancelado');
    const horas = turmasMult.reduce((acc, t) => {
      const start = parseInt(t.horarioInicio.split(':')[0]);
      const end = parseInt(t.horarioFim.split(':')[0]);
      return acc + (end - start);
    }, 0);

    // Cálculo Alinhamento / Reciclagem: duração do alinhamento * quantidade de operadores alinhados pelo multiplicador
    let alinhamentoSec = 0;
    const nameClean = m.nome.toLowerCase().trim();

    tabulador.forEach(item => {
      const chParts = (item.cargaHoraria || '0:20:00').split(':').map(p => parseInt(p, 10) || 0);
      const chSeconds = (chParts[0] || 0) * 3600 + (chParts[1] || 0) * 60 + (chParts[2] || 0);

      (item.operadores || []).forEach(op => {
        if (op.statusPresenca === 'Presente') {
          const opMulti = (op.multiplicador || '').toLowerCase().trim();
          if (opMulti && (opMulti === nameClean || nameClean.includes(opMulti) || opMulti.includes(nameClean))) {
            alinhamentoSec += chSeconds;
          }
        }
      });
    });

    const hAlign = Math.floor(alinhamentoSec / 3600);
    const mAlign = Math.floor((alinhamentoSec % 3600) / 60);
    const alinhamentoFormatted = `${hAlign}h ${mAlign.toString().padStart(2, '0')}m`;

    return {
      id: m.id,
      nome: m.nome,
      qtdTurmas: turmasMult.length,
      horas,
      alinhamentoHoras: alinhamentoFormatted,
      alinhamentoSec,
      status: m.status
    };
  }).sort((a, b) => (b.horas + b.alinhamentoSec / 3600) - (a.horas + a.alinhamentoSec / 3600));

  // Treinamentos por Célula
  const treinamentosPorCelula = celulas.map(c => {
    const demandasCelula = demandas.filter(d => d.celulaId === c.id || d.celulaNome === c.nome);
    const turmasCelula = turmas.filter(t => t.celulasNomes.includes(c.nome));

    return {
      id: c.id,
      nome: c.nome,
      demandasCount: demandasCelula.length,
      turmasCount: turmasCelula.length,
      gestor: c.gestor
    };
  }).sort((a, b) => b.turmasCount - a.turmasCount);

  // Exportar Relatório em CSV
  const handleExportCSV = () => {
    const headers = ['ID_Turma', 'Nome_Turma', 'Tema', 'Multiplicador', 'Sala', 'Data', 'Horario', 'Qtd_Operadores', 'Status'];
    const rows = turmas.map(t => [
      t.id,
      `"${t.nomeTurma}"`,
      `"${t.tema}"`,
      `"${t.multiplicadorNome}"`,
      `"${t.salaNome}"`,
      t.data,
      `"${t.horarioInicio}-${t.horarioFim}"`,
      t.qtdParticipantes,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_treinamentos_td_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Topo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Indicadores & Relatórios Gerenciais de T&D</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidado de horas ministradas, adesão por célula e volumetria de capacitados
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-slate-400 text-xs font-medium">Total de Operadores Capacitados</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalOperadoresTreinados} <span className="text-xs text-slate-500 font-normal">atendentes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-slate-400 text-xs font-medium">Horas Ministradas de Treinamento</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalHorasMinistradas}h <span className="text-xs text-slate-500 font-normal">acumuladas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-slate-400 text-xs font-medium">Turmas Agendadas e Concluídas</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {turmas.filter(t => t.status !== 'Cancelado').length} <span className="text-xs text-slate-500 font-normal">turmas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-slate-400 text-xs font-medium">Taxa de Eficiência de Atendimento (SLA)</span>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            94.8% <span className="text-xs text-slate-500 font-normal">no prazo</span>
          </div>
        </div>
      </div>

      {/* Relatório 1: Carga Horária por Multiplicador */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Horas Ministradas e Turmas por Multiplicador
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Multiplicador</th>
                <th className="p-3">Status Atual</th>
                <th className="p-3">Turmas Ministradas</th>
                <th className="p-3">Horas Acumuladas</th>
                <th className="p-3 text-indigo-700 dark:text-indigo-300">Alinhamento/ Reciclagem</th>
                <th className="p-3">Barra de Carga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {horasPorMultiplicador.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{item.nome}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3 font-semibold">{item.qtdTurmas} turmas</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{item.horas} horas</td>
                  <td className="p-3 font-black text-amber-600 dark:text-amber-400">{item.alinhamentoHoras}</td>
                  <td className="p-3 w-48">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (item.horas / 20) * 100)}%` }} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatório 2: Demandas por Célula de Atendimento */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Volume de Treinamentos Solicitados por Célula (18 Células)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {treinamentosPorCelula.map(c => (
            <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{c.nome}</h4>
                <p className="text-[11px] text-slate-400">Gestor: {c.gestor}</p>
              </div>
              <div className="text-right">
                <span className="block font-bold text-indigo-600 dark:text-indigo-400">{c.turmasCount} turmas</span>
                <span className="text-[10px] text-slate-500">{c.demandasCount} pedidos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
