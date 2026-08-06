export type TipoDemanda = 'Reciclagem' | 'Sinergia' | 'Alinhamento' | 'Novatos' | 'Migração' | 'Retorno LMG';

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type StatusDemanda = 'Novo' | 'Em Planejamento' | 'Agendado' | 'Em Execução' | 'Finalizado' | 'Cancelado';

export type StatusMultiplicador = 'Ativo' | 'Férias' | 'Ausente' | 'Folga' | 'Disponível' | 'Em Treinamento' | 'Home Office';

export type StatusSala = 'Livre' | 'Ocupada' | 'Manutenção';

export interface Multiplicador {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  acessoMaster?: boolean;
  foto?: string;
  horarioInicio: string; // e.g. "08:00"
  horarioFim: string; // e.g. "17:00"
  especialidades: string[]; // e.g. ["PIX", "Cartão", "Cancelamento"]
  diasFolga: string[]; // e.g. ["Sábado", "Domingo"]
  status: StatusMultiplicador;
  telefone?: string;
  observacoes?: string;
}

export interface UserSession {
  role: 'gerente' | 'multiplicador';
  multiplicadorId?: string;
  nome: string;
  login?: string;
  acessoMaster?: boolean;
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
  gerente?: string | null;
  dataSolicitacao: string; // YYYY-MM-DD
  prazoLimite: string; // YYYY-MM-DD
  prioridade: Prioridade;
  tema: string;
  celulaId: string;
  celulaIds?: string[]; // IDs de múltiplas células quando selecionadas
  celulaNome: string;
  duracaoValor?: number | null;
  duracaoUnidade?: 'minutos' | 'horas' | 'dias' | null;
  qtdOperadores: number;
  listaOperadores: string[]; // Lista de nomes ou matrículas (Logins C...)
  status: StatusDemanda;
  observacoes?: string | null;
  anexos?: string[];
  turmaAgendadaId?: string | null;
  dataCriacao: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  multiplicadorId?: string | null;
  multiplicadorNome?: string | null;
  horarioTreinamento?: string | null;
  salaId?: string | null;
  salaNome?: string | null;
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
  tipoAusencia?: string | null; // e.g., 'Atestado', 'Férias', 'ABS', 'TO', 'INSS', 'LMG'
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

export interface PresencaDiariaItem {
  frequencia?: string; // e.g. 'P', 'FI', 'FJ', 'DRS', 'BH', 'DAY OFF', 'FERIADO', 'TO'
  horaExtra?: string;  // e.g. '02:00'
  obs?: string;        // e.g. 'Operador chegou de 15:00 (20min atrasado)'
}

export interface ItemProvaNota {
  id: string;
  nomeProva: string;
  dataProva?: string;
  nota: number;
}

export type NivelClassificacao = 'ÓTIMO' | 'BOM' | 'REGULAR' | 'RUIM' | '';

export interface DossieOperador {
  fotoUrl?: string;
  // Conhecimento Técnico
  plataformaBB?: NivelClassificacao;
  sisbb?: NivelClassificacao;
  dominioComputador?: NivelClassificacao;
  obsTecnico?: string;
  // Comportamento
  fluenciaVerbal?: NivelClassificacao;
  cordialidade?: NivelClassificacao;
  relacionamentoInterpessoal?: NivelClassificacao;
  pontualidade?: NivelClassificacao;
  obsComportamento?: string;
  // Outras considerações
  outrasConsideracoes?: string;
  atualizadoEm?: string;
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
  presencaDiaria?: Record<string, PresencaDiariaItem>; // Key: YYYY-MM-DD or date index string
  provas?: ItemProvaNota[];
  dossie?: DossieOperador;
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
  horarioTreinamento?: string;
  salaId?: string;
  salaNome?: string;
  cargaHoraria: string;
  alunos: AlunoFrequenciaNota[];
  status: 'Em Andamento' | 'Concluído';
  criadoEm: string;
}

export interface ItemConteudoRastreabilidade {
  id: string;
  ordem: number;
  conteudo: string;     // e.g. "PREENCHIMENTO PLANILHA ACESSOS"
  rotina?: string;      // e.g. "76974"
  cargaHoraria: string; // CH e.g. "00:10", "00:50", "01:30"
  recursos?: string;    // e.g. "FORMS", "PPT+VÍDEO", "PORTAL DE INFORMAÇÕES"
  realizado?: string;   // e.g. "01/08/2026", "SÁBADO", "REALIZADO", "PENDENTE"
  status?: 'Realizado' | 'Pendente' | 'Sábado' | 'Em Andamento';
  observacoes?: string;
}

export interface CronogramaRastreabilidade {
  id: string;
  titulo: string;        // e.g. "Cronograma de Treinamento - Cartão Portador"
  tipo: 'celula' | 'turma' | 'geral';
  refId: string;         // celulaId or frequenciaNotaId
  refNome: string;       // celulaNome or treinamentoNome
  instrutor?: string;
  conteudos: ItemConteudoRastreabilidade[];
  dataInicio?: string;
  dataFim?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  acao: 'Inclusão' | 'Alteração' | 'Exclusão';
  modulo: string;
  descricao: string;
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
