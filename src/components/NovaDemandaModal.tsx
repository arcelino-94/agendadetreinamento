import React, { useState, useEffect } from 'react';
import { X, FileText, Clock, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Demanda, Prioridade, TipoDemanda } from '../types';

function formatShortName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

interface NovaDemandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDemanda?: Demanda | null;
}

export const NovaDemandaModal: React.FC<NovaDemandaModalProps> = ({
  isOpen,
  onClose,
  initialDemanda
}) => {
  const { celulas, multiplicadores, addDemanda, updateDemanda, setActiveTab, operadores } = useApp();

  const [tipo, setTipo] = useState<TipoDemanda>('Alinhamento');
  const [origem, setOrigem] = useState('E-mail Operacional');
  const [solicitante, setSolicitante] = useState('');
  const [prazoLimite, setPrazoLimite] = useState(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [prioridade, setPrioridade] = useState<Prioridade>('Média');
  const [tema, setTema] = useState('');
  const [selectedCelulas, setSelectedCelulas] = useState<string[]>([]);
  const [isTodosCelulas, setIsTodosCelulas] = useState(false);

  const [duracaoValor, setDuracaoValor] = useState(20);
  const [duracaoUnidade, setDuracaoUnidade] = useState<'minutos' | 'horas' | 'dias'>('minutos');

  // Novos campos para NOVATOS, Migração, Sinergia e Retorno LMG
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [selectedMultiplicadorId, setSelectedMultiplicadorId] = useState('');

  const [listaOperadoresText, setListaOperadoresText] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const isPeriodoType = tipo === 'Novatos' || tipo === 'Migração' || tipo === 'Sinergia' || tipo === 'Retorno LMG';

  useEffect(() => {
    if (initialDemanda) {
      setTipo(initialDemanda.tipo);
      setOrigem(initialDemanda.origem);
      setSolicitante(initialDemanda.supervisor || '');
      setPrazoLimite(initialDemanda.prazoLimite);
      setPrioridade(initialDemanda.prioridade);
      setTema(initialDemanda.tema);
      
      if (initialDemanda.celulaIds && initialDemanda.celulaIds.length > 0) {
        setSelectedCelulas(initialDemanda.celulaIds);
        setIsTodosCelulas(initialDemanda.celulaIds.length === celulas.length);
      } else {
        setSelectedCelulas([initialDemanda.celulaId]);
        setIsTodosCelulas(false);
      }

      setDuracaoValor(initialDemanda.duracaoValor || 20);
      setDuracaoUnidade(initialDemanda.duracaoUnidade || 'minutos');
      setDataInicio(initialDemanda.dataInicio || new Date().toISOString().split('T')[0]);
      setDataFim(initialDemanda.dataFim || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setSelectedMultiplicadorId(initialDemanda.multiplicadorId || '');
      setListaOperadoresText(initialDemanda.listaOperadores ? initialDemanda.listaOperadores.join('\n') : '');
      setObservacoes(initialDemanda.observacoes || '');
    } else {
      setTipo('Alinhamento');
      setOrigem('E-mail Operacional');
      setSolicitante('');
      setPrazoLimite(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
      setPrioridade('Média');
      setTema('');
      if (celulas.length > 0) {
        setSelectedCelulas([celulas[0].id]);
      }
      setIsTodosCelulas(false);
      setDuracaoValor(20);
      setDuracaoUnidade('minutos');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setDataFim(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setSelectedMultiplicadorId(multiplicadores.length > 0 ? multiplicadores[0].id : '');
      setListaOperadoresText('');
      setObservacoes('');
    }
  }, [initialDemanda, celulas, multiplicadores, isOpen]);

  if (!isOpen) return null;

  const toggleCelula = (celulaId: string) => {
    if (isTodosCelulas) {
      setIsTodosCelulas(false);
      setSelectedCelulas([celulaId]);
      return;
    }

    if (selectedCelulas.includes(celulaId)) {
      const next = selectedCelulas.filter(id => id !== celulaId);
      setSelectedCelulas(next);
    } else {
      const next = [...selectedCelulas, celulaId];
      setSelectedCelulas(next);
      if (next.length === celulas.length) setIsTodosCelulas(true);
    }
  };

  const handleSelectTodosCelulas = () => {
    if (isTodosCelulas) {
      setIsTodosCelulas(false);
      setSelectedCelulas(celulas.length > 0 ? [celulas[0].id] : []);
    } else {
      setIsTodosCelulas(true);
      setSelectedCelulas(celulas.map(c => c.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse operator logins
    const parsedLogins = listaOperadoresText
      .split('\n')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    let celulaNome = 'TODOS';
    if (!isTodosCelulas && selectedCelulas.length > 0) {
      const names = selectedCelulas.map(id => celulas.find(c => c.id === id)?.nome).filter(Boolean);
      celulaNome = names.join(' + ');
    }

    const firstCelulaId = selectedCelulas[0] || (celulas[0] ? celulas[0].id : 'cel-1');
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate duration in text e.g. "0:20:00" or "20 min"
    const qtdOperadoresCalculated = parsedLogins.length;

    const multObj = multiplicadores.find(m => m.id === selectedMultiplicadorId);
    const multiplicadorNome = multObj ? multObj.nome : '';

    const finalTema = isPeriodoType ? (tema || `${tipo} - ${celulaNome}`) : tema;
    const finalPrazo = isPeriodoType ? dataFim : prazoLimite;

    if (initialDemanda) {
      updateDemanda(initialDemanda.id, {
        tipo,
        origem,
        supervisor: solicitante || 'T&D/BB',
        prazoLimite: finalPrazo,
        prioridade: isPeriodoType ? 'Alta' : prioridade,
        tema: finalTema,
        celulaId: firstCelulaId,
        celulaIds: selectedCelulas,
        celulaNome,
        duracaoValor: isPeriodoType ? undefined : duracaoValor,
        duracaoUnidade: isPeriodoType ? undefined : duracaoUnidade,
        dataInicio: isPeriodoType ? dataInicio : undefined,
        dataFim: isPeriodoType ? dataFim : undefined,
        multiplicadorId: selectedMultiplicadorId,
        multiplicadorNome,
        qtdOperadores: qtdOperadoresCalculated,
        listaOperadores: parsedLogins,
        observacoes
      });
    } else {
      addDemanda({
        tipo,
        origem,
        supervisor: solicitante || 'T&D/BB',
        dataSolicitacao: todayStr,
        prazoLimite: finalPrazo,
        prioridade: isPeriodoType ? 'Alta' : prioridade,
        tema: finalTema,
        celulaId: firstCelulaId,
        celulaIds: selectedCelulas,
        celulaNome,
        duracaoValor: isPeriodoType ? undefined : duracaoValor,
        duracaoUnidade: isPeriodoType ? undefined : duracaoUnidade,
        dataInicio: isPeriodoType ? dataInicio : undefined,
        dataFim: isPeriodoType ? dataFim : undefined,
        multiplicadorId: selectedMultiplicadorId,
        multiplicadorNome,
        qtdOperadores: qtdOperadoresCalculated,
        listaOperadores: parsedLogins,
        status: 'Novo',
        observacoes
      });
    }

    onClose();

    // Route based on demand type
    if (tipo === 'Alinhamento' || tipo === 'Reciclagem') {
      setActiveTab('tabulador');
    } else if (tipo === 'Sinergia' || tipo === 'Migração' || tipo === 'Novatos' || tipo === 'Retorno LMG') {
      setActiveTab('frequencias');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialDemanda ? `Editar Solicitação (${initialDemanda.id})` : 'Nova Solicitação de Treinamento'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Tipo de Treinamento:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoDemanda)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Alinhamento">Alinhamento</option>
                <option value="Reciclagem">Reciclagem</option>
                <option value="Sinergia">Sinergia</option>
                <option value="Migração">Migração</option>
                <option value="Novatos">Novatos</option>
                <option value="Retorno LMG">Retorno LMG</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Solicitante:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: T&D, Qualidade, Operação..."
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* CÉLULA DE ATENDIMENTO MULTI-SELECT */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
              Célula de Atendimento (Selecione uma, várias ou Todos):
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
              <label 
                onClick={handleSelectTodosCelulas}
                className="flex items-center space-x-2 cursor-pointer font-bold text-indigo-700 dark:text-indigo-400 pb-1 border-b border-slate-200/60 dark:border-slate-700/60"
              >
                {isTodosCelulas ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>TODAS AS CÉLULAS</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {celulas.map(c => {
                  const isChecked = isTodosCelulas || selectedCelulas.includes(c.id);
                  return (
                    <label 
                      key={c.id} 
                      onClick={() => toggleCelula(c.id)}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1 rounded transition-colors text-slate-800 dark:text-slate-200"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{c.nome}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {isPeriodoType ? (
            /* Campos Específicos para NOVATOS, MIGRAÇÃO e SINERGIA */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Data Início do Período:
                  </label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Data Fim do Período:
                  </label>
                  <input
                    type="date"
                    required
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Multiplicador Condução do Treinamento:
                </label>
                <select
                  value={selectedMultiplicadorId}
                  onChange={(e) => setSelectedMultiplicadorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="">Selecione o Multiplicador...</option>
                  {multiplicadores
                    .filter(m => m.status !== 'Ausente')
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {formatShortName(m.nome)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            /* Campos Padrão para Alinhamento, Reciclagem, Retorno LMG */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tema / Assunto do Treinamento:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PIX, Regras de Contestação, Novas Rotinas"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Prioridade:
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Duração do Treinamento:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={duracaoValor}
                      onChange={(e) => setDuracaoValor(parseInt(e.target.value) || 1)}
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <select
                      value={duracaoUnidade}
                      onChange={(e) => setDuracaoUnidade(e.target.value as any)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="dias">Dias</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Prazo Limite (SLA):
                  </label>
                  <input
                    type="date"
                    required
                    value={prazoLimite}
                    onChange={(e) => setPrazoLimite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold">
                Lista de Operadores (1 login por linha):
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                (Opcional - pode adicionar depois)
              </span>
            </div>
            <textarea
              rows={4}
              value={listaOperadoresText}
              onChange={(e) => setListaOperadoresText(e.target.value)}
              placeholder="C1315137&#10;C1286562&#10;C1274287&#10;C1276914"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Observações / Instruções:
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Comentários adicionais sobre a necessidade do treinamento..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              {initialDemanda ? 'Atualizar Solicitação' : 'Salvar Solicitação'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

