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

import { NovaDemandaModal } from './components/NovaDemandaModal';
import { NovaTurmaModal } from './components/NovaTurmaModal';
import { TurmaDetalhesModal } from './components/TurmaDetalhesModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';

import { Demanda, Turma } from './types';

export function AppContent() {
  const { activeTab, setActiveTab } = useApp();

  // Modals state
  const [isNovaDemandaOpen, setIsNovaDemandaOpen] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState<Demanda | null>(null);

  const [isNovaTurmaOpen, setIsNovaTurmaOpen] = useState(false);
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
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-3 py-3 gap-3">
        
        {/* Sidebar de Navegação */}
        <Sidebar />

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onNavigate={setActiveTab}
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
            <SalasView />
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

      <TurmaDetalhesModal 
        turma={selectedTurmaDetail}
        onClose={() => setSelectedTurmaDetail(null)}
        onEditTurma={handleEditTurma}
      />

      <FirebaseConfigModal 
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

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
