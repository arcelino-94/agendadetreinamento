import React, { useState } from 'react';
import { X, Camera, Save, UserCheck, FileText, CheckCircle, Upload, Trash2, Award, Calendar } from 'lucide-react';
import { AlunoFrequenciaNota, DossieOperador, NivelClassificacao } from '../types';

interface AlunoDossieModalProps {
  aluno: AlunoFrequenciaNota;
  nomeTreinamento?: string;
  onClose: () => void;
  onSaveDossie: (alunoId: string, dossie: DossieOperador) => void;
}

const CLASSIFICACOES: NivelClassificacao[] = ['ÓTIMO', 'BOM', 'REGULAR', 'RUIM'];

export const AlunoDossieModal: React.FC<AlunoDossieModalProps> = ({
  aluno,
  nomeTreinamento,
  onClose,
  onSaveDossie,
}) => {
  const [dossie, setDossie] = useState<DossieOperador>(aluno.dossie || {});
  const [isSaved, setIsSaved] = useState(false);

  const handleRatingChange = (field: keyof DossieOperador, value: NivelClassificacao) => {
    setDossie(prev => ({
      ...prev,
      [field]: prev[field] === value ? '' : value // toggle if clicked again
    }));
  };

  const handleTextChange = (field: keyof DossieOperador, value: string) => {
    setDossie(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Foto muito grande! Por favor escolha uma imagem de até 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDossie(prev => ({ ...prev, fotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setDossie(prev => ({ ...prev, fotoUrl: undefined }));
  };

  const handleSave = () => {
    const updated: DossieOperador = {
      ...dossie,
      atualizadoEm: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    onSaveDossie(aluno.id, updated);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const getRatingBadgeClass = (current: NivelClassificacao | undefined, option: NivelClassificacao) => {
    const isSelected = current === option;
    if (!isSelected) {
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
    switch (option) {
      case 'ÓTIMO':
        return 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-xs ring-2 ring-emerald-400';
      case 'BOM':
        return 'bg-blue-600 text-white font-extrabold border-blue-600 shadow-xs ring-2 ring-blue-400';
      case 'REGULAR':
        return 'bg-amber-600 text-white font-extrabold border-amber-600 shadow-xs ring-2 ring-amber-400';
      case 'RUIM':
        return 'bg-rose-600 text-white font-extrabold border-rose-600 shadow-xs ring-2 ring-rose-400';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl p-5 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Dossiê do Colaborador / Operador
                </h3>
                {dossie.atualizadoEm && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    Salvo em {dossie.atualizadoEm}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <strong className="text-slate-900 dark:text-slate-100">{aluno.nome}</strong> • Login BB: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{aluno.loginBB || aluno.matDP}</span> • Célula: {aluno.celula} {nomeTreinamento ? `• ${nomeTreinamento}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center text-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* TOP CARD: Operator Photo & Quick Stats */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Foto Upload & Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {dossie.fotoUrl ? (
                  <img
                    src={dossie.fotoUrl}
                    alt={aluno.nome}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <Camera className="w-7 h-7 mb-0.5" />
                    <span className="text-[9px] font-extrabold uppercase text-center px-1">Sem Foto</span>
                  </div>
                )}

                <label
                  htmlFor={`upload-photo-${aluno.id}`}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shadow-md transition-all active:scale-95"
                  title="Carregar ou alterar foto do colaborador"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    id={`upload-photo-${aluno.id}`}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {dossie.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-all"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{aluno.nome}</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Matrícula DP: <strong className="font-mono text-slate-700 dark:text-slate-300">{aluno.matDP}</strong></span>
                  <span>|</span>
                  <span>Supervisor: <strong className="text-slate-700 dark:text-slate-300">{aluno.supervisor || '-'}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Foto utilizada para identificação no dossiê de sala e relatórios de acompanhamento.
                </div>
              </div>
            </div>

            {/* Quick Badges: Presença & Média Provas */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center min-w-[100px]">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Frequência</span>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-center space-x-1">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{aluno.frequenciaPercent}%</span>
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-xl text-center min-w-[100px]">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Média Notas</span>
                <span className="text-lg font-black text-amber-800 dark:text-amber-300 flex items-center justify-center space-x-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{aluno.notaFinal}</span>
                </span>
              </div>
            </div>
          </div>

          {/* MAIN FORM BANNER */}
          <div className="bg-indigo-600 dark:bg-indigo-950/90 text-white p-2.5 rounded-xl text-center font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center space-x-2">
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Vivências analisadas em sala - Classifique: ÓTIMO / BOM / REGULAR / RUIM</span>
          </div>

          {/* SECTION 1: CONHECIMENTO TÉCNICO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>💻 Conhecimento Técnico</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Items */}
              <div className="space-y-3">
                {/* PLATAFORMA BB */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">PLATAFORMA BB</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`pbb-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('plataformaBB', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.plataformaBB, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SISBB */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">SISBB</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`sisbb-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('sisbb', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.sisbb, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domínio no Computador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Domínio no Computador</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`pc-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('dominioComputador', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.dominioComputador, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Observações Conhecimento Técnico */}
              <div className="flex flex-col justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações (Conhecimento Técnico)
                </label>
                <textarea
                  rows={4}
                  value={dossie.obsTecnico || ''}
                  onChange={(e) => handleTextChange('obsTecnico', e.target.value)}
                  placeholder="Escreva detalhes sobre o desempenho técnico, facilidade com ferramentas, navegação nos sistemas BB..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPORTAMENTO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>🤝 Comportamento em Sala</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Items */}
              <div className="space-y-3">
                {/* Fluência Verbal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fluência Verbal</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`fv-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('fluenciaVerbal', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.fluenciaVerbal, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cordialidade */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cordialidade</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`cord-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('cordialidade', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.cordialidade, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relacionamento Interpessoal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Relacionamento Interpessoal</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`rel-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('relacionamentoInterpessoal', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.relacionamentoInterpessoal, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pontualidade */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pontualidade</span>
                  <div className="flex items-center space-x-1">
                    {CLASSIFICACOES.map(opt => (
                      <button
                        key={`pont-${opt}`}
                        type="button"
                        onClick={() => handleRatingChange('pontualidade', opt)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${getRatingBadgeClass(dossie.pontualidade, opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Observações Comportamento */}
              <div className="flex flex-col justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações (Comportamento)
                </label>
                <textarea
                  rows={5}
                  value={dossie.obsComportamento || ''}
                  onChange={(e) => handleTextChange('obsComportamento', e.target.value)}
                  placeholder="Escreva detalhes sobre o engajamento, dicção, postura no treinamento, cumprimento de horários..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: OUTRAS CONSIDERAÇÕES */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              📝 Outras Considerações Gerais
            </h4>
            <textarea
              rows={4}
              value={dossie.outrasConsideracoes || ''}
              onChange={(e) => handleTextChange('outrasConsideracoes', e.target.value)}
              placeholder="Digite aqui recomendações para a operação, feedback final do multiplicador, virtudes e pontos de atenção para a gestão..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
              isSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Dossiê Salvo!' : 'Salvar Dossiê'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
