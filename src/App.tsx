import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AgendaGrid } from './components/AgendaGrid';
import { AssistentePlanejamentoView } from './components/AssistentePlanejamentoView';
import { DemandasView } from './components/DemandasView';
import { MatrizEspecialidadesView } from './components/MatrizEspecialidadesView';
import { MultiplicadoresView } from './components/MultiplicadoresView';
import { SalasView } from './components/SalasView';
import { RelatoriosView } from './components/RelatoriosView';
import { TabuladorView } from './components/TabuladorView';
import { FrequenciasNotasView } from './components/FrequenciasNotasView';
import { RastreabilidadeView } from './components/RastreabilidadeView';
import { QuadroOperadoresView } from './components/QuadroOperadoresView';
import { JornadaOperadorView } from './components/JornadaOperadorView';
import { SegurancaView } from './components/SegurancaView';

import { NovaDemandaModal } from './components/NovaDemandaModal';
import { NovaTurmaModal } from './components/NovaTurmaModal';
import { ReservarSalaModal } from './components/ReservarSalaModal';
import { TurmaDetalhesModal } from './components/TurmaDetalhesModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { CloudSyncToast } from './components/CloudSyncToast';
import { LoginModal } from './components/LoginModal';

import { Demanda, Turma } from './types';

export function AppContent() {
  const { activeTab, setActiveTab } = useApp();

  // Modals state
  const [isNovaDemandaOpen, setIsNovaDemandaOpen] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState<Demanda | null>(null);

  const [isNovaTurmaOpen, setIsNovaTurmaOpen] = useState(false);
  const [isReservarSalaOpen, setIsReservarSalaOpen] = useState(false);
  const [novaTurmaPreset, setNovaTurmaPreset] = useState<any>(null);

  const [selectedTurmaDetail, setSelectedTurmaDetail] = useState<Turma | null>(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Triggers
  const handleOpenNovaDemanda = () => {
    setEditingDemanda(null);
    setIsNovaDemandaOpen(true);
  };

  const handleEditDemanda = (demanda: Demanda) => {
    setEditingDemanda(demanda);
    setIsNovaDemandaOpen(true);
  };

  const handleOpenNovaTurma = (preset?: any) => {
    setNovaTurmaPreset(preset || null);
    setIsNovaTurmaOpen(true);
  };

  const handleSelectSlotToSchedule = (type: 'multiplicador' | 'sala', entityId: string, hour: string) => {
    if (type === 'multiplicador') {
      handleOpenNovaTurma({ multiplicadorId: entityId, hour });
    } else {
      handleOpenNovaTurma({ salaId: entityId, hour });
    }
  };

  const handleEditTurma = (turma: Turma) => {
    handleOpenNovaTurma({
      editingTurmaId: turma.id,
      multiplicadorId: turma.multiplicadorId,
      salaId: turma.salaId,
      data: turma.data,
      horarioInicio: turma.horarioInicio,
      horarioFim: turma.horarioFim,
      demandaIds: turma.demandaIds,
      tema: turma.tema,
      nomeTurma: turma.nomeTurma,
      qtdParticipantes: turma.qtdParticipantes,
      celulasNomes: turma.celulasNomes,
      tipo: turma.tipo,
      observacoes: turma.observacoes
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header Fixo */}
      <Header 
        onOpenNovaDemanda={handleOpenNovaDemanda}
        onOpenNovaTurma={() => handleOpenNovaTurma()}
        onOpenReservarSala={() => setIsReservarSalaOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1720px] w-full mx-auto px-2 sm:px-3 py-2 sm:py-3 gap-2 sm:gap-3">
        
        {/* Sidebar de Navegação */}
        <Sidebar />

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onOpenNovaDemanda={handleOpenNovaDemanda}
              onOpenNovaTurma={() => handleOpenNovaTurma()}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaGrid 
              onSelectSlotToSchedule={handleSelectSlotToSchedule}
              onSelectTurmaDetail={(turma) => setSelectedTurmaDetail(turma)}
            />
          )}

          {activeTab === 'assistente' && (
            <AssistentePlanejamentoView 
              onOpenNovaTurmaWithData={(preset) => {
                setActiveTab('agenda');
                handleOpenNovaTurma(preset);
              }}
            />
          )}

          {activeTab === 'demandas' && (
            <DemandasView 
              onOpenNovaDemanda={handleOpenNovaDemanda}
              onEditDemanda={handleEditDemanda}
            />
          )}

          {activeTab === 'matriz' && (
            <MatrizEspecialidadesView />
          )}

          {activeTab === 'multiplicadores' && (
            <MultiplicadoresView />
          )}

          {activeTab === 'salas' && (
            <SalasView 
              onSelectSlotToSchedule={handleSelectSlotToSchedule}
              onSelectTurmaDetail={(turma) => setSelectedTurmaDetail(turma)}
            />
          )}

          {activeTab === 'tabulador' && (
            <TabuladorView />
          )}

          {activeTab === 'frequencias' && (
            <FrequenciasNotasView />
          )}

          {activeTab === 'rastreabilidade' && (
            <RastreabilidadeView />
          )}

          {activeTab === 'quadro' && (
            <QuadroOperadoresView />
          )}

          {activeTab === 'jornada' && (
            <JornadaOperadorView />
          )}

          {activeTab === 'seguranca' && (
            <SegurancaView />
          )}

          {activeTab === 'relatorios' && (
            <RelatoriosView />
          )}
        </main>

      </div>

      {/* Modals Globais */}
      <NovaDemandaModal 
        isOpen={isNovaDemandaOpen}
        onClose={() => setIsNovaDemandaOpen(false)}
        initialDemanda={editingDemanda}
      />

      <NovaTurmaModal 
        isOpen={isNovaTurmaOpen}
        onClose={() => setIsNovaTurmaOpen(false)}
        initialPreset={novaTurmaPreset}
      />

      <ReservarSalaModal 
        isOpen={isReservarSalaOpen}
        onClose={() => setIsReservarSalaOpen(false)}
        onSelectSalaToBook={(preset) => handleOpenNovaTurma(preset)}
      />

      <TurmaDetalhesModal 
        turma={selectedTurmaDetail}
        onClose={() => setSelectedTurmaDetail(null)}
        onEditTurma={handleEditTurma}
      />

      <FirebaseConfigModal 
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Floating Cloud Sync Toast */}
      <CloudSyncToast />

      {/* Modal de Login / Autenticação de Acesso */}
      <LoginModal />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
