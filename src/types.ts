export type TipoDemanda = 'Reciclagem' | 'Sinergia' | 'Alinhamento' | 'Novatos' | 'Migração' | 'Retorno LMG';

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type StatusDemanda = 'Novo' | 'Em Planejamento' | 'Agendado' | 'Em Execução' | 'Finalizado' | 'Cancelado';

export type StatusMultiplicador = 'Ativo' | 'Férias' | 'Ausente' | 'Folga' | 'Disponível' | 'Em Treinamento' | 'Home Office';

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
  supervisor: string; // Solicitante / Área
  gerente?: string;
  dataSolicitacao: string; // YYYY-MM-DD
  prazoLimite: string; // YYYY-MM-DD
  prioridade: Prioridade;
  tema: string;
  celulaId: string;
  celulaIds?: string[]; // IDs de múltiplas células quando selecionadas
  celulaNome: string;
  duracaoValor?: number;
  duracaoUnidade?: 'minutos' | 'horas' | 'dias';
  qtdOperadores: number;
  listaOperadores: string[]; // Lista de nomes ou matrículas (Logins C...)
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

export interface OperadorQuadro {
  id: string;
  matDP: string;
  loginBB: string;
  nome: string;
  supervisor: string;
  gerente: string;
  horarioEntrada: string;
  segmento: string;
}

export interface OperadorAlinhamento {
  loginBB: string;
  nome: string;
  matDP?: string;
  supervisor?: string;
  gerente?: string;
  horarioEntrada?: string;
  segmento?: string;
  dataPresenca?: string;
  horario?: string;
  multiplicador?: string;
  local?: string;
  statusPresenca?: 'Presente' | 'Dispensado' | 'Pendente';
  tipoAusencia?: string; // e.g., 'Atestado', 'Férias', 'ABS', 'TO', 'INSS', 'LMG'
}

export interface AlinhamentoTabulador {
  id: string;
  treinamento: string;     // Nome/Título do treinamento
  solicitante: string;     // e.g. "OPERAÇÃO / T&D/BB"
  celula: string;          // e.g. "SAC PRIORITÁRIO", "HD N1", "ROI"
  convocados: number;
  presentes: number;
  dispensado: number;
  pendentes: number;       // Convocados - Presentes - Dispensado
  horasTreinamento: string;// e.g. "7:40:00"
  cargaHoraria: string;    // CH e.g. "0:20:00"
  percentual: number;      // % de aproveitamento/aderência
  data: string;
  operadores: OperadorAlinhamento[];
  observacoes?: string;
  status: 'Pendente' | 'Concluído';
  criadoEm: string;
}

export interface AlunoFrequenciaNota {
  id: string;
  matDP: string;
  loginBB: string;
  nome: string;
  supervisor: string;
  gerente: string;
  celula: string;
  frequenciaPercent: number;
  notaFinal: number;
  statusAprovacao: 'Aprovado' | 'Reprovado' | 'Em Andamento';
  observacoes?: string;
}

export interface ItemFrequenciaNota {
  id: string;
  demandaId?: string;
  treinamento: string;
  tipo: 'Sinergia' | 'Migração' | 'Novatos' | 'Retorno LMG';
  celulas: string[];
  dataInicio: string;
  dataFim: string;
  multiplicador: string;
  cargaHoraria: string;
  alunos: AlunoFrequenciaNota[];
  status: 'Em Andamento' | 'Concluído';
  criadoEm: string;
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
