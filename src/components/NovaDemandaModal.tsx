import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Demanda, Prioridade, TipoDemanda } from '../types';

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
  const { celulas, addDemanda, updateDemanda } = useApp();

  const [tipo, setTipo] = useState<TipoDemanda>('Reciclagem');
  const [origem, setOrigem] = useState('E-mail Operacional (Supervisão)');
  const [supervisor, setSupervisor] = useState('');
  const [gerente, setGerente] = useState('');
  const [prazoLimite, setPrazoLimite] = useState(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [prioridade, setPrioridade] = useState<Prioridade>('Média');
  const [tema, setTema] = useState('');
  const [celulaId, setCelulaId] = useState('');
  const [qtdOperadores, setQtdOperadores] = useState(10);
  const [listaOperadoresText, setListaOperadoresText] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (initialDemanda) {
      setTipo(initialDemanda.tipo);
      setOrigem(initialDemanda.origem);
      setSupervisor(initialDemanda.supervisor);
      setGerente(initialDemanda.gerente);
      setPrazoLimite(initialDemanda.prazoLimite);
      setPrioridade(initialDemanda.prioridade);
      setTema(initialDemanda.tema);
      setCelulaId(initialDemanda.celulaId);
      setQtdOperadores(initialDemanda.qtdOperadores);
      setListaOperadoresText(initialDemanda.listaOperadores.join('\n'));
      setObservacoes(initialDemanda.observacoes || '');
    } else {
      setTipo('Reciclagem');
      setOrigem('E-mail Operacional (Supervisão)');
      setSupervisor('');
      setGerente('');
      setPrazoLimite(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
      setPrioridade('Média');
      setTema('');
      if (celulas.length > 0) setCelulaId(celulas[0].id);
      setQtdOperadores(10);
      setListaOperadoresText('Operador 1\nOperador 2\nOperador 3');
      setObservacoes('');
    }
  }, [initialDemanda, celulas, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const celulaObj = celulas.find(c => c.id === celulaId) || celulas[0];
    const listaOperadores = listaOperadoresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const todayStr = new Date().toISOString().split('T')[0];

    if (initialDemanda) {
      updateDemanda(initialDemanda.id, {
        tipo,
        origem,
        supervisor,
        gerente,
        prazoLimite,
        prioridade,
        tema,
        celulaId: celulaObj.id,
        celulaNome: celulaObj.nome,
        qtdOperadores,
        listaOperadores,
        observacoes
      });
    } else {
      addDemanda({
        tipo,
        origem,
        supervisor,
        gerente,
        dataSolicitacao: todayStr,
        prazoLimite,
        prioridade,
        tema,
        celulaId: celulaObj.id,
        celulaNome: celulaObj.nome,
        qtdOperadores,
        listaOperadores,
        status: 'Novo',
        observacoes
      });
    }

    onClose();
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Reciclagem">Reciclagem (Atualização de Veteranos)</option>
                <option value="Sinergia">Sinergia (Migração de Células)</option>
                <option value="Alinhamento">Alinhamento Rápido</option>
                <option value="Novatos">Novatos (Onboarding Integrado)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Célula de Atendimento:
              </label>
              <select
                value={celulaId}
                onChange={(e) => setCelulaId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-hidden"
              >
                {celulas.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} (Gestor: {c.gestor})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Tema / Assunto:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: PIX, Regras de Contestação"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Supervisor Solicitante:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Ricardo Viana"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Gerente Responsável:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Patricia Camargo"
                value={gerente}
                onChange={(e) => setGerente(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Qtd. Operadores:
              </label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={qtdOperadores}
                onChange={(e) => setQtdOperadores(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Lista Nominal de Operadores (1 nome/matrícula por linha):
            </label>
            <textarea
              rows={3}
              value={listaOperadoresText}
              onChange={(e) => setListaOperadoresText(e.target.value)}
              placeholder="Ana Silva&#10;Bruno Lima&#10;Carlos Souza"
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
              placeholder="Comentários adicionais sobre a necessidade de reciclagem..."
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
