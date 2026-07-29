export type TipoDemanda = 'Reciclagem' | 'Sinergia' | 'Alinhamento' | 'Novatos';

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type StatusDemanda = 'Novo' | 'Em Planejamento' | 'Agendado' | 'Em Execução' | 'Finalizado' | 'Cancelado';

export type StatusMultiplicador = 'Disponível' | 'Em Treinamento' | 'Férias' | 'Folga' | 'Home Office';

export type StatusSala = 'Livre' | 'Ocupada' | 'Manutenção';

export interface Multiplicador {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  horarioInicio: string; // e.g. "08:00"
  horarioFim: string; // e.g. "17:00"
  especialidades: string[]; // e.g. ["PIX", "Cartão", "Cancelamento"]
  diasFolga: string[]; // e.g. ["Sábado", "Domingo"]
  status: StatusMultiplicador;
  telefone?: string;
  observacoes?: string;
}

export interface CelulaAtendimento {
  id: string;
  nome: string;
  gestor: string;
  operadoresAtivos: number;
}

export interface SalaTreinamento {
  id: string;
  nome: string;
  capacidade: number;
  recursos: string[]; // e.g. ["Projetor", "30 PCs", "Ar Condicionado", "Som"]
  status: StatusSala;
  bloco?: string;
}

export interface Demanda {
  id: string;
  tipo: TipoDemanda;
  origem: string; // e.g. "E-mail Operacional", "Planejamento", "Supervisor"
  supervisor: string;
  gerente: string;
  dataSolicitacao: string; // YYYY-MM-DD
  prazoLimite: string; // YYYY-MM-DD
  prioridade: Prioridade;
  tema: string;
  celulaId: string;
  celulaNome: string;
  qtdOperadores: number;
  listaOperadores: string[]; // Lista de nomes ou matrículas
  status: StatusDemanda;
  observacoes?: string;
  anexos?: string[];
  turmaAgendadaId?: string;
  dataCriacao: string;
}

export interface Turma {
  id: string;
  nomeTurma: string;
  tema: string;
  demandaIds: string[]; // Pode agrupar uma ou mais demandas
  multiplicadorId: string;
  multiplicadorNome: string;
  salaId: string;
  salaNome: string;
  data: string; // YYYY-MM-DD
  horarioInicio: string; // e.g. "09:00"
  horarioFim: string; // e.g. "12:00"
  qtdParticipantes: number;
  celulasNomes: string[];
  status: 'Agendado' | 'Em Execução' | 'Finalizado' | 'Cancelado';
  observacoes?: string;
  tipo: TipoDemanda;
}

export interface SugestaoAgrupamento {
  tema: string;
  demandaIds: string[];
  demandas: Demanda[];
  totalOperadores: number;
  celulas: string[];
  multiplicadoresAptos: Multiplicador[];
  salasAptas: SalaTreinamento[];
  motivo: string;
}

export interface SugestaoEncaixe {
  demanda: Demanda;
  multiplicador: Multiplicador;
  sala: SalaTreinamento;
  dataSugerida: string;
  horarioInicio: string;
  horarioFim: string;
  motivo: string;
}

export interface FirebaseConfigCustom {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseId?: string;
}
