import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Check, 
  X, 
  Filter, 
  Plus, 
  Download, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MatrizEspecialidadesView: React.FC = () => {
  const { multiplicadores, updateMultiplicador } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todas');
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);

  // Mapear todas as especialidades únicas do sistema
  const defaultSpecialties = [
    'PIX',
    'Cartão',
    'Multimeios Cartão',
    'Multimeios Nuvem',
    'Portador',
    'ATA',
    'Telecobrança',
    'Retenção',
    'Cancelamento',
    'Financeiro',
    'Consórcio',
    'Reclame Aqui',
    'SAC VIP',
    'Fraude',
    'Novatos Onboarding',
    'Suporte Técnico',
    'Backoffice',
    'Ouvidoria'
  ];

  const allSpecialties = Array.from(
    new Set([...defaultSpecialties, ...multiplicadores.flatMap(m => m.especialidades)])
  ).sort();

  // Filtrar multiplicadores por busca
  const filteredMultipliers = multiplicadores.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchName = m.nome.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchSpec = selectedSpecialty === 'todas' || m.especialidades.includes(selectedSpecialty);
    return matchName && matchSpec;
  });

  // Toggle de aptidão rápida na matriz
  const handleToggleSpecialty = (mId: string, currentSpecs: string[], specToToggle: string) => {
    const exists = currentSpecs.includes(specToToggle);
    let updatedSpecs: string[];
    if (exists) {
      updatedSpecs = currentSpecs.filter(s => s !== specToToggle);
    } else {
      updatedSpecs = [...currentSpecs, specToToggle];
    }
    updateMultiplicador(mId, { especialidades: updatedSpecs });
  };

  // Exportar para CSV (Compatível com Excel e SharePoint Lists)
  const handleExportCSV = () => {
    const header = ['ID', 'Multiplicador', 'Horario', ...allSpecialties].join(';');
    const rows = multiplicadores.map(m => {
      const specStatus = allSpecialties.map(spec => m.especialidades.includes(spec) ? 'SIM' : 'NAO');
      return [m.id, `"${m.nome}"`, `"${m.horarioInicio}-${m.horarioFim}"`, ...specStatus].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriz_Especialidades_TD_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // estatísticas
  const topSpecialty = allSpecialties.reduce((acc, spec) => {
    const count = multiplicadores.filter(m => m.especialidades.includes(spec)).length;
    return count > acc.count ? { name: spec, count } : acc;
  }, { name: '-', count: 0 });

  return (
    <div className="space-y-4">
      
      {/* Banner da Matriz de Competências */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matriz Operacional de Habilidades T&D</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Mapeamento de Competências da Equipe de Instrução
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl">
              Identifique instantaneamente quais multiplicadores dominam os processos de Call Center (PIX, Cartão, Nuvem, Portador, ATA, Telecobrança) para direcionamento de demandas sem gargalos.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
              title="Exportar dados da matriz em CSV para Excel/SharePoint"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas de Cobertura */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total de Multiplicadores</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center space-x-2">
            <span>{multiplicadores.length}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Especialidades Mapeadas</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center space-x-2">
            <span>{allSpecialties.length}</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Maior Cobertura</span>
          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
            {topSpecialty.name} ({topSpecialty.count} instrutores)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Média p/ Instrutor</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
            {(multiplicadores.reduce((sum, m) => sum + m.especialidades.length, 0) / (multiplicadores.length || 1)).toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">temas</span>
          </div>
        </div>
      </div>

      {/* Controles e Filtros da Tabela Matriz */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Campo de Busca por Multiplicador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar multiplicador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          {/* Filtro por Especialidade Específica */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="todas">Todas as Especialidades ({allSpecialties.length})</option>
              {allSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Dica de Uso */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            <strong>Dica Operacional:</strong> Clique diretamente sobre qualquer célula da grade para ativar ou desativar a certificação do multiplicador no tema.
          </span>
        </div>
      </div>

      {/* Grade Matriz Cruzada (Multiplicador x Especialidades) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 min-w-[220px] border-r border-slate-200 dark:border-slate-700">
                  Multiplicador / Horário
                </th>
                {allSpecialties.map(spec => (
                  <th 
                    key={spec}
                    className="p-2.5 text-center min-w-[100px] border-r border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider"
                  >
                    {spec}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredMultipliers.length === 0 ? (
                <tr>
                  <td colSpan={allSpecialties.length + 1} className="p-8 text-center text-slate-500">
                    Nenhum multiplicador encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredMultipliers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Coluna do Multiplicador */}
                    <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={m.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={m.nome}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {m.nome}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {m.horarioInicio}-{m.horarioFim} • {m.especialidades.length} aptas
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Células de Especialidades */}
                    {allSpecialties.map(spec => {
                      const isCertified = m.especialidades.includes(spec);

                      return (
                        <td 
                          key={spec}
                          onClick={() => handleToggleSpecialty(m.id, m.especialidades, spec)}
                          className="p-2 text-center border-r border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
                          title={`Clique para ${isCertified ? 'remover' : 'adicionar'} especialidade ${spec} para ${m.nome}`}
                        >
                          {isCertified ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 text-xs font-mono">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
