import { Multiplicador, CelulaAtendimento, SalaTreinamento, Demanda, Turma, OperadorQuadro, AlinhamentoTabulador } from '../types';

export const INITIAL_CELULAS: CelulaAtendimento[] = [
  { id: 'cel-1', nome: 'ROI', gestor: 'Jefferson Luiz', operadoresAtivos: 35 },
  { id: 'cel-2', nome: 'OUVIDORIA', gestor: 'Girleide Lira', operadoresAtivos: 42 },
  { id: 'cel-3', nome: 'MULTIMEIOS', gestor: 'Rosana Gomes', operadoresAtivos: 110 },
  { id: 'cel-4', nome: 'FRAUDE', gestor: 'Fabiana Soares', operadoresAtivos: 38 },
  { id: 'cel-5', nome: 'SAC PRIORITARIO', gestor: 'Girleide Lira', operadoresAtivos: 45 },
  { id: 'cel-6', nome: 'SAC CARTAO', gestor: 'Girleide Lira', operadoresAtivos: 40 },
  { id: 'cel-7', nome: 'BKO - ROI + Ativo QC', gestor: 'Eduina Maciel', operadoresAtivos: 15 },
  { id: 'cel-8', nome: 'BKO - Triagem BB Atende', gestor: 'Eduina Maciel', operadoresAtivos: 12 },
  { id: 'cel-9', nome: 'CARTAO PORTADOR', gestor: 'Jeyse Araujo', operadoresAtivos: 85 },
  { id: 'cel-10', nome: 'BKO - RETAGUARDA PORTADOR', gestor: 'Eduina Maciel', operadoresAtivos: 10 },
  { id: 'cel-11', nome: 'ATA', gestor: 'Jefferson Luiz', operadoresAtivos: 55 },
  { id: 'cel-12', nome: 'Célula de Segurança', gestor: 'Girleide Lira', operadoresAtivos: 20 },
  { id: 'cel-13', nome: 'BB JAPAO - INGLES', gestor: 'Fabiana Soares', operadoresAtivos: 8 },
  { id: 'cel-14', nome: 'HELP DESK N2', gestor: 'Fabiana Soares', operadoresAtivos: 25 },
  { id: 'cel-15', nome: 'TELECOBRANÇA', gestor: 'Jeyse Araujo', operadoresAtivos: 30 },
  { id: 'cel-16', nome: 'MULTIMEIOS FILA ALTA RENDA', gestor: 'Meison Rodrigues', operadoresAtivos: 18 },
  { id: 'cel-17', nome: 'BB JAPAO Português', gestor: 'Fabiana Soares', operadoresAtivos: 14 },
  { id: 'cel-18', nome: 'HELP DESK N1 + Portador', gestor: 'Fabiana Soares', operadoresAtivos: 28 },
  { id: 'cel-19', nome: 'BB JAPAO - ESPANHOL', gestor: 'Fabiana Soares', operadoresAtivos: 10 }
];

export const INITIAL_MULTIPLICADORES: Multiplicador[] = [
  {
    id: 'mult-1',
    nome: 'BRUNA THAIS DA SILVA SANTOS',
    email: 'bruna.santos@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1001'
  },
  {
    id: 'mult-2',
    nome: 'KELLY CARNEIRO DA SILVA LEMOS',
    email: 'kelly.lemos@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1002'
  },
  {
    id: 'mult-3',
    nome: 'JOSE ANDERSON DA SILVA',
    email: 'jose.anderson@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO', 'Célula de Segurança'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1003'
  },
  {
    id: 'mult-4',
    nome: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA',
    email: 'jose.leandro@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['CARTAO PORTADOR', 'MULTIMEIOS', 'ROI', 'ATA'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1004'
  },
  {
    id: 'mult-5',
    nome: 'MARIA DE LOURDES CORREIA DE SOUZA',
    email: 'maria.lourdes@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['CARTAO PORTADOR', 'MULTIMEIOS', 'ATA', 'TELECOBRANÇA'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1005'
  },
  {
    id: 'mult-6',
    nome: 'TAYNARA DA SILVA RAMOS LIBERATO',
    email: 'taynara.liberato@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1006'
  },
  {
    id: 'mult-7',
    nome: 'GEOVANNE FERREIRA DE ARCELINO',
    email: 'geovanne.arcelino@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['CARTAO PORTADOR', 'MULTIMEIOS', 'ATA', 'TELECOBRANÇA'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1007'
  },
  {
    id: 'mult-8',
    nome: 'RAFAEL OLIVEIRA DE MENDONCA',
    email: 'rafael.mendonca@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO', 'ROI'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1008'
  },
  {
    id: 'mult-9',
    nome: 'ROSANA VALERIA DA SILVA',
    email: 'rosana.valeria@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['CARTAO PORTADOR', 'MULTIMEIOS', 'ATA', 'TELECOBRANÇA'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1009'
  },
  {
    id: 'mult-10',
    nome: 'MATEUS HONORIO DA SILVA',
    email: 'mateus.honorio@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['GERAL'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Ausente',
    observacoes: 'Afastado',
    telefone: '(81) 98765-1010'
  },
  {
    id: 'mult-11',
    nome: 'PRISCILA DA SILVA ALMEIDA',
    email: 'priscila.almeida@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['CARTAO PORTADOR', 'MULTIMEIOS', 'ATA', 'TELECOBRANÇA'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1011'
  },
  {
    id: 'mult-12',
    nome: 'BEATRIZ FERREIRA BARBOSA',
    email: 'beatriz.barbosa@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'BB JAPAO - INGLES', 'BB JAPAO Português', 'BB JAPAO - ESPANHOL'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1012'
  },
  {
    id: 'mult-13',
    nome: 'CLAUDIA MIRANDA DA SILVA',
    email: 'claudia.miranda@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['SAC PRIORITARIO', 'SAC CARTAO'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(81) 98765-1013'
  },
  {
    id: 'mult-14',
    nome: 'ROOD CORREIA DA SILVA',
    email: 'rood.correia@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['GERAL'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Ausente',
    observacoes: 'Afastado',
    telefone: '(81) 98765-1014'
  },
  {
    id: 'mult-15',
    nome: 'ROSEANE GONDINHO DANTAS',
    email: 'roseane.dantas@callcenter.com',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['GERAL'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Ausente',
    observacoes: 'Afastado',
    telefone: '(81) 98765-1015'
  }
];

export const INITIAL_SALAS: SalaTreinamento[] = [
  { id: 'sala-1', nome: 'Sala 1', capacidade: 30, recursos: ['30 PCs', 'Projetor', 'Ar Condicionado'], status: 'Livre', bloco: 'Prédio Principal - Térreo' },
  { id: 'sala-2', nome: 'Sala 2', capacidade: 25, recursos: ['25 PCs', 'TV 75"', 'Ar Condicionado'], status: 'Livre', bloco: 'Prédio Principal - Térreo' },
  { id: 'sala-3', nome: 'Sala 3', capacidade: 30, recursos: ['30 PCs', 'Som', 'Projetor HD'], status: 'Livre', bloco: 'Prédio Principal - 1º Andar' },
  { id: 'sala-4', nome: 'Sala 4', capacidade: 25, recursos: ['25 PCs', 'Smart TV', 'Lousa'], status: 'Livre', bloco: 'Prédio Principal - 1º Andar' },
  { id: 'sala-5', nome: 'Sala 5', capacidade: 40, recursos: ['40 PCs', 'Projetor 4K', 'Som'], status: 'Livre', bloco: 'Prédio Anexo - Térreo' },
  { id: 'sala-6', nome: 'Sala 6', capacidade: 20, recursos: ['20 PCs', 'Webcam', 'Ar Condicionado'], status: 'Livre', bloco: 'Prédio Anexo - 1º Andar' },
  { id: 'sala-7', nome: 'Sala 7', capacidade: 25, recursos: ['25 PCs', 'Projetor', 'Ar Condicionado'], status: 'Livre', bloco: 'Prédio Anexo - 1º Andar' },
  { id: 'sala-8', nome: 'Sala 8', capacidade: 20, recursos: ['20 PCs', 'TV 65"', 'Ar Condicionado'], status: 'Livre', bloco: 'Prédio Anexo - 2º Andar' }
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_DEMANDAS: Demanda[] = [
  {
    id: 'DEM-1001',
    tipo: 'Reciclagem',
    origem: 'Supervisão Operacional',
    supervisor: 'Rafael Pereira',
    gerente: 'Jefferson Luiz',
    dataSolicitacao: today,
    prazoLimite: today,
    prioridade: 'Alta',
    tema: 'Novos Procedimentos ROI & Contestações',
    celulaId: 'cel-1',
    celulaNome: 'ROI',
    qtdOperadores: 5,
    listaOperadores: ['C1315137', 'C1334875', 'C1323781', 'C1334973', 'C1334833'],
    status: 'Novo',
    dataCriacao: new Date().toISOString()
  },
  {
    id: 'DEM-1002',
    tipo: 'Alinhamento',
    origem: 'Qualidade Operacional',
    supervisor: 'Avani Martir',
    gerente: 'Girleide Lira',
    dataSolicitacao: today,
    prazoLimite: today,
    prioridade: 'Urgente',
    tema: 'Alinhamento de Postura Ouvidoria',
    celulaId: 'cel-2',
    celulaNome: 'OUVIDORIA',
    qtdOperadores: 4,
    listaOperadores: ['C1286562', 'C1334988', 'C1334971', 'C1335027'],
    status: 'Em Planejamento',
    dataCriacao: new Date().toISOString()
  }
];

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'TURMA-2001',
    nomeTurma: 'Turma ROI Manhã - Sala 1',
    tema: 'Novos Procedimentos ROI & Contestações',
    demandaIds: ['DEM-1001'],
    multiplicadorId: 'mult-4',
    multiplicadorNome: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA',
    salaId: 'sala-1',
    salaNome: 'Sala 1',
    data: today,
    horarioInicio: '08:00',
    horarioFim: '12:00',
    qtdParticipantes: 15,
    celulasNomes: ['ROI'],
    status: 'Em Execução',
    tipo: 'Reciclagem',
    observacoes: 'Turma em andamento até meio dia na Sala 1.'
  },
  {
    id: 'TURMA-2002',
    nomeTurma: 'Treinamento Multimeios Tarde - Sala 1',
    tema: 'Atendimento Multimeios e Canais',
    demandaIds: [],
    multiplicadorId: 'mult-7',
    multiplicadorNome: 'GEOVANNE FERREIRA DE ARCELINO',
    salaId: 'sala-1',
    salaNome: 'Sala 1',
    data: today,
    horarioInicio: '13:00',
    horarioFim: '17:00',
    qtdParticipantes: 20,
    celulasNomes: ['MULTIMEIOS'],
    status: 'Agendado',
    tipo: 'Sinergia',
    observacoes: 'Sala 1 livre a partir de meio dia para esta turma.'
  }
];

export const INITIAL_TABULADOR: AlinhamentoTabulador[] = [
  {
    id: 'TAB-101',
    treinamento: 'APONTAMENTOS DE CARTÃO DENTRO DO SAC',
    solicitante: 'OPERAÇÃO / T&D/BB',
    celula: 'SAC PRIORITÁRIO',
    convocados: 5,
    presentes: 5,
    dispensado: 0,
    pendentes: 0,
    horasTreinamento: '1:40:00',
    cargaHoraria: '0:20:00',
    percentual: 100,
    data: today,
    operadores: [
      { loginBB: 'C1315137', nome: 'CINTIA RAYANE BATISTA DA SILVA', matDP: '29347', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'SAC PRIORITÁRIO', multiplicador: 'BRUNA THAIS DA SILVA SANTOS', local: 'Ilha Operacional', statusPresenca: 'Presente', dataPresenca: today, horario: '08:00' },
      { loginBB: 'C1286562', nome: 'CARLOS HENRIQUE PEREIRA', matDP: '28441', supervisor: 'Ana Paula Silva', gerente: 'Jefferson Luiz', segmento: 'SAC PRIORITÁRIO', multiplicador: 'BRUNA THAIS DA SILVA SANTOS', local: 'Ilha Operacional', statusPresenca: 'Presente', dataPresenca: today, horario: '08:00' },
      { loginBB: 'C1274287', nome: 'MARIANA COSTA SANTOS', matDP: '27990', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'SAC PRIORITÁRIO', multiplicador: 'KELLY CARNEIRO DA SILVA LEMOS', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '09:00' },
      { loginBB: 'C1276914', nome: 'JULIANA MARTINS DE OLIVEIRA', matDP: '28012', supervisor: 'Marcos Vinicius', gerente: 'Jefferson Luiz', segmento: 'SAC PRIORITÁRIO', multiplicador: 'KELLY CARNEIRO DA SILVA LEMOS', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '09:00' },
      { loginBB: 'C1290045', nome: 'RODRIGO ALVES FERREIRA', matDP: '28910', supervisor: 'Ana Paula Silva', gerente: 'Jefferson Luiz', segmento: 'SAC PRIORITÁRIO', multiplicador: 'TAYNARA DA SILVA RAMOS LIBERATO', local: 'Ilha Operacional', statusPresenca: 'Presente', dataPresenca: today, horario: '10:00' }
    ],
    status: 'Concluído',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'TAB-102',
    treinamento: 'FORMULÁRIO ROTINA 88223 / 17825',
    solicitante: 'OPERAÇÃO / T&D/BB',
    celula: 'HD N1',
    convocados: 6,
    presentes: 4,
    dispensado: 1,
    pendentes: 1,
    horasTreinamento: '1:20:00',
    cargaHoraria: '0:20:00',
    percentual: 67,
    data: today,
    operadores: [
      { loginBB: 'C1315137', nome: 'CINTIA RAYANE BATISTA DA SILVA', matDP: '29347', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 2', statusPresenca: 'Presente', dataPresenca: today, horario: '09:30' },
      { loginBB: 'C1286562', nome: 'CARLOS HENRIQUE PEREIRA', matDP: '28441', supervisor: 'Ana Paula Silva', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 2', statusPresenca: 'Presente', dataPresenca: today, horario: '09:30' },
      { loginBB: 'C1274287', nome: 'MARIANA COSTA SANTOS', matDP: '27990', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'GEOVANNE FERREIRA DE ARCELINO', local: 'Sala 2', statusPresenca: 'Presente', dataPresenca: today, horario: '10:30' },
      { loginBB: 'C1276914', nome: 'JULIANA MARTINS DE OLIVEIRA', matDP: '28012', supervisor: 'Marcos Vinicius', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'GEOVANNE FERREIRA DE ARCELINO', local: 'Sala 2', statusPresenca: 'Presente', dataPresenca: today, horario: '10:30' },
      { loginBB: 'C1290045', nome: 'RODRIGO ALVES FERREIRA', matDP: '28910', supervisor: 'Ana Paula Silva', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 2', statusPresenca: 'Dispensado', tipoAusencia: 'TO', dataPresenca: today, horario: '09:30' },
      { loginBB: 'C1299901', nome: 'FERNANDA LIMA BARBOSA', matDP: '29102', supervisor: 'Marcos Vinicius', gerente: 'Jefferson Luiz', segmento: 'HELP DESK N1', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 2', statusPresenca: 'Pendente', tipoAusencia: 'Atestado', dataPresenca: today, horario: '09:30' }
    ],
    status: 'Concluído',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'TAB-103',
    treinamento: 'ABERTURA MANUAL DE FICHA ARES',
    solicitante: 'OPERAÇÃO / T&D/BB',
    celula: 'ROI',
    convocados: 4,
    presentes: 4,
    dispensado: 0,
    pendentes: 0,
    horasTreinamento: '4:00:00',
    cargaHoraria: '1:00:00',
    percentual: 100,
    data: today,
    operadores: [
      { loginBB: 'C1315137', nome: 'CINTIA RAYANE BATISTA DA SILVA', matDP: '29347', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'ROI', multiplicador: 'RAFAEL OLIVEIRA DE MENDONCA', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '14:00' },
      { loginBB: 'C1286562', nome: 'CARLOS HENRIQUE PEREIRA', matDP: '28441', supervisor: 'Ana Paula Silva', gerente: 'Jefferson Luiz', segmento: 'ROI', multiplicador: 'RAFAEL OLIVEIRA DE MENDONCA', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '14:00' },
      { loginBB: 'C1274287', nome: 'MARIANA COSTA SANTOS', matDP: '27990', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', segmento: 'ROI', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '15:00' },
      { loginBB: 'C1276914', nome: 'JULIANA MARTINS DE OLIVEIRA', matDP: '28012', supervisor: 'Marcos Vinicius', gerente: 'Jefferson Luiz', segmento: 'ROI', multiplicador: 'JOSE LEANDRO DE ALBUQUERQUE BRAGA', local: 'Sala 1', statusPresenca: 'Presente', dataPresenca: today, horario: '15:00' }
    ],
    status: 'Concluído',
    criadoEm: new Date().toISOString()
  }
];

// Operadores em lote pré-carregados do arquivo fornecido pelo usuário
export const INITIAL_OPERADORES: OperadorQuadro[] = [
  { id: 'op-1', matDP: '29347', loginBB: 'C1315137', nome: 'CINTIA RAYANE BATISTA DA SILVA', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', horarioEntrada: '06:15:00', segmento: 'ROI' },
  { id: 'op-2', matDP: '28924', loginBB: 'C1286562', nome: 'ADRIANA DE LIMA BARBOSA', supervisor: 'Avani Martir', gerente: 'Girleide Lira', horarioEntrada: '06:20:00', segmento: 'OUVIDORIA' },
  { id: 'op-3', matDP: '36283', loginBB: 'C1274287', nome: 'MICHELE CORREIA CASSIMIRO', supervisor: 'Christiane Ferraz', gerente: 'Rosana Gomes', horarioEntrada: '07:55:00', segmento: 'MULTIMEIOS' },
  { id: 'op-4', matDP: '36597', loginBB: 'C1276914', nome: 'WILLIAM FERREIRA DO NASCIMENTO SANTOS', supervisor: 'Renata Albuquerque', gerente: 'Fabiana Soares', horarioEntrada: '07:00:00', segmento: 'FRAUDE' },
  { id: 'op-5', matDP: '38100', loginBB: 'C1288458', nome: 'GABRIELA JOANA DE ANDRE', supervisor: 'Keline Silva', gerente: 'Girleide Lira', horarioEntrada: '06:00:00', segmento: 'SAC PRIORITARIO' },
  { id: 'op-6', matDP: '36016', loginBB: 'C1296728', nome: 'ANDREA ALVES DA SILVA', supervisor: 'Gleiberson Freitas', gerente: 'Rosana Gomes', horarioEntrada: '07:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-7', matDP: '37048', loginBB: 'C1312494', nome: 'ISABELLA FERNANDA DE LIMA FIGUEIREDO DA COSTA', supervisor: 'Jaqueline Silva', gerente: 'Girleide Lira', horarioEntrada: '07:30:00', segmento: 'SAC CARTAO' },
  { id: 'op-8', matDP: '36298', loginBB: 'C1334875', nome: 'WESLLEY LUCAS SILVA DE ARAUJO', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'ROI' },
  { id: 'op-9', matDP: '37293', loginBB: 'C1312429', nome: 'ANA BEATRIZ DA SILVA NASCIMENTO', supervisor: 'Sheyla Marinho', gerente: 'Eduina Maciel', horarioEntrada: '09:45:00', segmento: 'BKO - ROI + Ativo QC' },
  { id: 'op-10', matDP: '29403', loginBB: 'C1287020', nome: 'WESLY RANGEL DIAS DA SILVA', supervisor: 'Sheyla Marinho', gerente: 'Eduina Maciel', horarioEntrada: '13:20:00', segmento: 'BKO - Triagem BB Atende' },
  { id: 'op-11', matDP: '36253', loginBB: 'C1273185', nome: 'ELIZANGELA FERREIRA DA SILVA', supervisor: 'Claudio Bezerra', gerente: 'Fabiana Soares', horarioEntrada: '12:50:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-12', matDP: '36248', loginBB: 'C1275708', nome: 'DIOGO DA SILVA SANTANA', supervisor: 'Renata Albuquerque', gerente: 'Fabiana Soares', horarioEntrada: '07:00:00', segmento: 'FRAUDE' },
  { id: 'op-13', matDP: '38485', loginBB: 'C1299658', nome: 'WESLLEN DA SILVA LAURENTINO', supervisor: 'Sheyla Marinho', gerente: 'Eduina Maciel', horarioEntrada: '10:00:00', segmento: 'BKO - RETAGUARDA PORTADOR' },
  { id: 'op-14', matDP: '40782', loginBB: 'C1312444', nome: 'MARIA TAYNARA LIMA BRAZ DE MELO', supervisor: 'Thamyres Amorim', gerente: 'Rosana Gomes', horarioEntrada: '06:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-15', matDP: '40844', loginBB: 'C1334964', nome: 'SABRINA MIRELLE CAETANO DE OLIVEIRA', supervisor: 'Jaqueline Silva', gerente: 'Girleide Lira', horarioEntrada: '06:20:00', segmento: 'SAC CARTAO' },
  { id: 'op-16', matDP: '40546', loginBB: 'C1334914', nome: 'ACIDALIA DE CARVALHO FRANCA', supervisor: 'Gutemberg Costa', gerente: 'Rosana Gomes', horarioEntrada: '07:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-17', matDP: '40828', loginBB: 'C1334988', nome: 'RAYANE CRISTINE ALVES DOS SANTOS', supervisor: 'Avani Martir', gerente: 'Girleide Lira', horarioEntrada: '06:20:00', segmento: 'OUVIDORIA' },
  { id: 'op-18', matDP: '40678', loginBB: 'C1334919', nome: 'GRAZYELE MEDEIROS DE OLIVEIRA', supervisor: 'Jeane Silva', gerente: 'Jeyse Araujo', horarioEntrada: '06:20:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-19', matDP: '40609', loginBB: 'C1335004', nome: 'CHARLES EDUARDO PEREIRA DOS SANTOS', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'OUVIDORIA' },
  { id: 'op-20', matDP: '40733', loginBB: 'C1334926', nome: 'KALLYANDRA MAYRA ALMEIDA DE FARIAS', supervisor: 'Gutemberg Costa', gerente: 'Rosana Gomes', horarioEntrada: '07:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-21', matDP: '40700', loginBB: 'C1323781', nome: 'JESSICA FERNANDA DE ANDRADE COUTINHO', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', horarioEntrada: '07:30:00', segmento: 'ROI' },
  { id: 'op-22', matDP: '40656', loginBB: 'C1334918', nome: 'FELICIA CLAUDIA SANTANA DE OLIVEIRA', supervisor: 'Thamyres Amorim', gerente: 'Rosana Gomes', horarioEntrada: '06:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-23', matDP: '40785', loginBB: 'C1334901', nome: 'MARIANNA VITORIA DA SILVA SANTOS', supervisor: 'Gutemberg Costa', gerente: 'Rosana Gomes', horarioEntrada: '07:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-24', matDP: '40801', loginBB: 'C1334906', nome: 'MIKAELLA ELAYNE HENRIQUE FURTADO DA SILVA', supervisor: 'Renata Albuquerque', gerente: 'Fabiana Soares', horarioEntrada: '07:00:00', segmento: 'FRAUDE' },
  { id: 'op-25', matDP: '40788', loginBB: 'C1334908', nome: 'MATEUS JANUARIO DA CONCEICAO', supervisor: 'Renata Albuquerque', gerente: 'Fabiana Soares', horarioEntrada: '07:00:00', segmento: 'FRAUDE' },
  { id: 'op-26', matDP: '40852', loginBB: 'C1334930', nome: 'STEFANY LETICIA ALMEIDA CARDOSO DA SILVA', supervisor: 'Teresa Silva', gerente: 'Meison Rodrigues', horarioEntrada: '09:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-27', matDP: '40727', loginBB: 'C1334852', nome: 'JOSIVAN RODRIGUES DE BRITO', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-28', matDP: '40774', loginBB: 'C1323907', nome: 'MARIA DE FATIMA DE LIMA', supervisor: 'Thamyres Amorim', gerente: 'Rosana Gomes', horarioEntrada: '06:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-29', matDP: '40557', loginBB: 'C1331272', nome: 'ALANNY KAREN VIEIRA DE ARAUJO', supervisor: 'Gutemberg Costa', gerente: 'Rosana Gomes', horarioEntrada: '07:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-30', matDP: '40697', loginBB: 'C1334958', nome: 'JARBAS CORREIA URBANO', supervisor: 'Jeane Silva', gerente: 'Jeyse Araujo', horarioEntrada: '06:20:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-31', matDP: '40681', loginBB: 'C1334973', nome: 'HARLENE NIVIA DIAS DE BRITO', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', horarioEntrada: '06:20:00', segmento: 'ROI' },
  { id: 'op-32', matDP: '40610', loginBB: 'C1334971', nome: 'CHRISTIANO VICTOR DA SILVA OLIVEIRA', supervisor: 'Avani Martir', gerente: 'Girleide Lira', horarioEntrada: '08:00:00', segmento: 'OUVIDORIA' },
  { id: 'op-33', matDP: '40673', loginBB: 'C1335027', nome: 'GIRLAYNE DE DEUS CAMPOS', supervisor: 'Avani Martir', gerente: 'Girleide Lira', horarioEntrada: '07:30:00', segmento: 'OUVIDORIA' },
  { id: 'op-34', matDP: '40601', loginBB: 'C1334890', nome: 'CAIO CEZAR LIMA DE ALMEIDA DA PAZ', supervisor: 'Renata Albuquerque', gerente: 'Fabiana Soares', horarioEntrada: '07:00:00', segmento: 'FRAUDE' },
  { id: 'op-35', matDP: '40933', loginBB: 'C1334833', nome: 'MARCELO AUGUSTO DE OLIVEIRA SANTOS', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'ROI' },
  { id: 'op-36', matDP: '40831', loginBB: 'C1334873', nome: 'REBECA MARIA DE LIMA NEVES', supervisor: 'Helio Macena', gerente: 'Girleide Lira', horarioEntrada: '13:40:00', segmento: 'ATA' },
  { id: 'op-37', matDP: '40544', loginBB: 'C1334843', nome: 'ABNER PATRICK DA SILVA ROCHA', supervisor: 'Maria Eduarda', gerente: 'Jefferson Luiz', horarioEntrada: '13:20:00', segmento: 'SAC CARTAO' },
  { id: 'op-38', matDP: '40619', loginBB: 'C1334826', nome: 'DAIANE DE LIMA MELO', supervisor: 'Jaqueline Silva', gerente: 'Girleide Lira', horarioEntrada: '06:20:00', segmento: 'Célula de Segurança' },
  { id: 'op-39', matDP: '40818', loginBB: 'C1334838', nome: 'PABLO VICTOR DOS SANTOS SILVA', supervisor: 'Miketillin Oliveira', gerente: 'Girleide Lira', horarioEntrada: '15:20:00', segmento: 'ROI' },
  { id: 'op-40', matDP: '40820', loginBB: 'C1335019', nome: 'PATRICIA CRISTINA ALMEIDA SEPULVEDA', supervisor: 'Matheus Marques', gerente: 'Rosana Gomes', horarioEntrada: '08:10:00', segmento: 'MULTIMEIOS' },
  { id: 'op-41', matDP: '40871', loginBB: 'C1335035', nome: 'VANESSA CRISTINA BARBOSA DOS SANTOS', supervisor: 'Gabriela Souza', gerente: 'Meison Rodrigues', horarioEntrada: '09:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-42', matDP: '40631', loginBB: 'C1335038', nome: 'DIOGO ANTONIO ALMEIDA DE MELO', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'ROI' },
  { id: 'op-43', matDP: '40768', loginBB: 'C1335031', nome: 'MARCOS NASCIMENTO RIBEIRO MOREIRA', supervisor: 'Girlene Cavalcanti', gerente: 'Meison Rodrigues', horarioEntrada: '13:00:00', segmento: 'MULTIMEIOS' },
  { id: 'op-44', matDP: '40805', loginBB: 'C1335018', nome: 'MONICA PEREIRA FELIX', supervisor: 'Jeane Silva', gerente: 'Jeyse Araujo', horarioEntrada: '06:20:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-45', matDP: '40758', loginBB: 'C1335015', nome: 'MAGNUN FARIAS FERREIRA', supervisor: 'Maria Moura', gerente: 'Fabiana Soares', horarioEntrada: '00:00:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-46', matDP: '40658', loginBB: 'C1335025', nome: 'FILIPE ALBUQUERQUE REIS', supervisor: 'Romario Gomes', gerente: 'Fabiana Soares', horarioEntrada: '20:40:00', segmento: 'BB JAPAO - INGLES' },
  { id: 'op-47', matDP: '40679', loginBB: 'C1335028', nome: 'GUILHERME FRANCISCO DA SILVA', supervisor: 'Catarine Santos', gerente: 'Jefferson Luiz', horarioEntrada: '17:40:00', segmento: 'OUVIDORIA' },
  { id: 'op-48', matDP: '41219', loginBB: 'C1335818', nome: 'VERONICA SEVERINA DA SILVA', supervisor: 'Jeane Silva', gerente: 'Jeyse Araujo', horarioEntrada: '06:20:00', segmento: 'CARTAO PORTADOR' },
  { id: 'op-49', matDP: '40755', loginBB: 'C1335669', nome: 'LUCIANA MARIA PEREIRA DA SILVA', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', horarioEntrada: '06:10:00', segmento: 'ROI' },
  { id: 'op-50', matDP: '40781', loginBB: 'C1335670', nome: 'MARIA LUZIANA FERNANDES DA SILVA', supervisor: 'Rafael Pereira', gerente: 'Jefferson Luiz', horarioEntrada: '06:20:00', segmento: 'ROI' }
];
