import { Multiplicador, CelulaAtendimento, SalaTreinamento, Demanda, Turma } from '../types';

export const INITIAL_MULTIPLICADORES: Multiplicador[] = [
  {
    id: 'mult-1',
    nome: 'Carlos Eduardo Silva',
    email: 'carlos.silva@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['PIX', 'Cartão', 'Multimeios Cartão', 'Sistemas Pagamento'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(11) 98765-4321',
    observacoes: 'Especialista em segurança transacional e fraude'
  },
  {
    id: 'mult-2',
    nome: 'Mariana Oliveira Rocha',
    email: 'mariana.rocha@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '14:00',
    horarioFim: '23:00',
    especialidades: ['Multimeios Nuvem', 'Portador', 'Atendimento Empresarial', 'PIX'],
    diasFolga: ['Domingo'],
    status: 'Em Treinamento',
    telefone: '(11) 97654-3210',
    observacoes: 'Turno tarde/noite, foco em migrações de sistemas'
  },
  {
    id: 'mult-3',
    nome: 'Lucas Santos Mendes',
    email: 'lucas.mendes@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['Retenção', 'Cancelamento', 'Técnicas de Negociação', 'SAC VIP'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(11) 96543-2109'
  },
  {
    id: 'mult-4',
    nome: 'Fernanda Costa Lima',
    email: 'fernanda.lima@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '09:00',
    horarioFim: '18:00',
    especialidades: ['ATA', 'Telecobrança', 'Cobrança Amigável', 'Financeiro'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(11) 95432-1098'
  },
  {
    id: 'mult-5',
    nome: 'Rafael Albuquerque',
    email: 'rafael.albuquerque@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '13:00',
    horarioFim: '22:00',
    especialidades: ['Consórcio', 'Ouvidoria', 'Reclame Aqui', 'Backoffice'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Home Office',
    telefone: '(11) 94321-0987'
  },
  {
    id: 'mult-6',
    nome: 'Beatriz Martins Ramos',
    email: 'beatriz.ramos@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['Novatos Onboarding', 'Comunicação Empática', 'Sistemas Basicos'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Em Treinamento',
    telefone: '(11) 93210-9876'
  },
  {
    id: 'mult-7',
    nome: 'Rodrigo Teixeira',
    email: 'rodrigo.teixeira@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '15:00',
    horarioFim: '00:00',
    especialidades: ['Suporte Técnico', 'WhatsApp Care', 'Multimeios Nuvem'],
    diasFolga: ['Segunda', 'Terça'],
    status: 'Disponível',
    telefone: '(11) 92109-8765'
  },
  {
    id: 'mult-8',
    nome: 'Camila Vasconcelos',
    email: 'camila.vasconcelos@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['Fraude', 'Segurança da Informação', 'Backoffice'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Férias',
    telefone: '(11) 91098-7654'
  },
  {
    id: 'mult-9',
    nome: 'Gabriel Pereira',
    email: 'gabriel.pereira@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '10:00',
    horarioFim: '19:00',
    especialidades: ['Novatos Onboarding', 'Portador', 'Retenção'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(11) 90987-6543'
  },
  {
    id: 'mult-10',
    nome: 'Juliana Barbosa',
    email: 'juliana.barbosa@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '14:00',
    horarioFim: '23:00',
    especialidades: ['PIX', 'Financeiro', 'Cancelamento', 'Telecobrança'],
    diasFolga: ['Quarta'],
    status: 'Disponível',
    telefone: '(11) 89876-5432'
  },
  {
    id: 'mult-11',
    nome: 'Thiago Farias',
    email: 'thiago.farias@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['Multimeios Cartão', 'Consórcio', 'Ouvidoria'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Folga',
    telefone: '(11) 88765-4321'
  },
  {
    id: 'mult-12',
    nome: 'Aline Souza Pires',
    email: 'aline.pires@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '09:00',
    horarioFim: '18:00',
    especialidades: ['WhatsApp Care', 'Reclame Aqui', 'SAC VIP'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Disponível',
    telefone: '(11) 87654-3210'
  },
  {
    id: 'mult-13',
    nome: 'Marcelo Ribeiro',
    email: 'marcelo.ribeiro@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '12:00',
    horarioFim: '21:00',
    especialidades: ['Suporte Técnico', 'ATA', 'Multimeios Nuvem'],
    diasFolga: ['Domingo'],
    status: 'Disponível',
    telefone: '(11) 86543-2109'
  },
  {
    id: 'mult-14',
    nome: 'Patricia Mendes Prado',
    email: 'patricia.prado@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '08:00',
    horarioFim: '17:00',
    especialidades: ['Atendimento Empresarial', 'Backoffice', 'Financeiro'],
    diasFolga: ['Sábado', 'Domingo'],
    status: 'Home Office',
    telefone: '(11) 85432-1098'
  },
  {
    id: 'mult-15',
    nome: 'Vinicius Nogueira',
    email: 'vinicius.nogueira@callcenter.com',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    horarioInicio: '14:00',
    horarioFim: '00:00',
    especialidades: ['Sinergia', 'Migração de Células', 'Fraude', 'Cartão'],
    diasFolga: ['Segunda'],
    status: 'Disponível',
    telefone: '(11) 84321-0987'
  }
];

export const INITIAL_CELULAS: CelulaAtendimento[] = [
  { id: 'cel-1', nome: 'Multimeios Cartão', gestor: 'Sérgio Nogueira', operadoresAtivos: 140 },
  { id: 'cel-2', nome: 'Multimeios Nuvem', gestor: 'Carla Dias', operadoresAtivos: 110 },
  { id: 'cel-3', nome: 'Portador', gestor: 'Eduardo Guimarães', operadoresAtivos: 95 },
  { id: 'cel-4', nome: 'ATA', gestor: 'Renata Frota', operadoresAtivos: 80 },
  { id: 'cel-5', nome: 'Telecobrança', gestor: 'Marcos Aurelio', operadoresAtivos: 120 },
  { id: 'cel-6', nome: 'Retenção', gestor: 'Fabiana Rossi', operadoresAtivos: 85 },
  { id: 'cel-7', nome: 'Financeiro', gestor: 'Gustavo Paiva', operadoresAtivos: 75 },
  { id: 'cel-8', nome: 'Cancelamento', gestor: 'Vanessa Camargo', operadoresAtivos: 60 },
  { id: 'cel-9', nome: 'Consórcio', gestor: 'Andreia Sampaio', operadoresAtivos: 50 },
  { id: 'cel-10', nome: 'Reclame Aqui', gestor: 'Luciana Brandão', operadoresAtivos: 35 },
  { id: 'cel-11', nome: 'Sac VIP', gestor: 'Daniel Prado', operadoresAtivos: 40 },
  { id: 'cel-12', nome: 'Fraude', gestor: 'Claudio Miranda', operadoresAtivos: 65 },
  { id: 'cel-13', nome: 'Cobrança Amigável', gestor: 'Paula Neves', operadoresAtivos: 90 },
  { id: 'cel-14', nome: 'Atendimento Empresarial', gestor: 'Roberto Carlos', operadoresAtivos: 70 },
  { id: 'cel-15', nome: 'WhatsApp Care', gestor: 'Fernanda Montenegro', operadoresAtivos: 105 },
  { id: 'cel-16', nome: 'Ouvidoria', gestor: 'Hélio Bicudo', operadoresAtivos: 25 },
  { id: 'cel-17', nome: 'Backoffice', gestor: 'Simone Mendes', operadoresAtivos: 80 },
  { id: 'cel-18', nome: 'Suporte Técnico', gestor: 'Jorge Aragão', operadoresAtivos: 60 }
];

export const INITIAL_SALAS: SalaTreinamento[] = [
  {
    id: 'sala-1',
    nome: 'Sala Alpha (Inovação)',
    capacidade: 25,
    recursos: ['25 PCs', 'Projetor 4K', 'Ar Condicionado', 'Lousa Digital'],
    status: 'Livre',
    bloco: 'Bloco A - 2º Andar'
  },
  {
    id: 'sala-2',
    nome: 'Sala Beta (Performance)',
    capacidade: 20,
    recursos: ['20 PCs', 'Tv 75"', 'Som Integrado', 'Ar Condicionado'],
    status: 'Ocupada',
    bloco: 'Bloco A - 2º Andar'
  },
  {
    id: 'sala-3',
    nome: 'Lab 1 - Digital',
    capacidade: 30,
    recursos: ['30 PCs de Alta Perf.', '2 Projetores', 'System Dual Sound'],
    status: 'Livre',
    bloco: 'Bloco B - Térreo'
  },
  {
    id: 'sala-4',
    nome: 'Lab 2 - Sinergia',
    capacidade: 25,
    recursos: ['25 PCs', 'Smart TV 85"', 'Ar Condicionado'],
    status: 'Livre',
    bloco: 'Bloco B - Térreo'
  },
  {
    id: 'sala-5',
    nome: 'Auditório Master',
    capacidade: 60,
    recursos: ['Projeção Cinema', 'Microfones Sem Fio', 'Som Surround', '60 Poltronas'],
    status: 'Livre',
    bloco: 'Bloco Central'
  },
  {
    id: 'sala-6',
    nome: 'Sala Gamma (Especialização)',
    capacidade: 15,
    recursos: ['15 PCs', 'Quadro Branco', 'Webcam Conferência'],
    status: 'Livre',
    bloco: 'Bloco A - 3º Andar'
  },
  {
    id: 'sala-7',
    nome: 'Sala Delta (Novatos)',
    capacidade: 22,
    recursos: ['22 PCs', 'Projetor HD', 'Ar Condicionado'],
    status: 'Livre',
    bloco: 'Bloco C - 1º Andar'
  },
  {
    id: 'sala-8',
    nome: 'Sala Omega (Express)',
    capacidade: 18,
    recursos: ['18 PCs', 'TV 65"', 'Climatizador'],
    status: 'Livre',
    bloco: 'Bloco C - 1º Andar'
  }
];

const today = new Date().toISOString().split('T')[0];
const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const inFiveDays = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

export const INITIAL_DEMANDAS: Demanda[] = [
  {
    id: 'DEM-1001',
    tipo: 'Reciclagem',
    origem: 'E-mail Operacional (Supervisão)',
    supervisor: 'Ricardo Viana',
    gerente: 'Patricia Camargo',
    dataSolicitacao: today,
    prazoLimite: inTwoDays,
    prioridade: 'Urgente',
    tema: 'PIX',
    celulaId: 'cel-3',
    celulaNome: 'Portador',
    qtdOperadores: 8,
    listaOperadores: ['Ana Paula', 'Bruno Lima', 'Carlos Diniz', 'Daniela Reis', 'Erick Rocha', 'Fabio Junior', 'Gisele Bünd', 'Hugo Gloss'],
    status: 'Novo',
    observacoes: 'Mudança emergencial nas regras de contestação de PIX. Necessário alinhar antes de sexta.',
    anexos: ['https://exemplo.com/manual_pix_v2.pdf'],
    dataCriacao: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'DEM-1002',
    tipo: 'Reciclagem',
    origem: 'E-mail Operacional (Gerência)',
    supervisor: 'Sérgio Nogueira',
    gerente: 'Patricia Camargo',
    dataSolicitacao: today,
    prazoLimite: inTwoDays,
    prioridade: 'Alta',
    tema: 'PIX',
    celulaId: 'cel-1',
    celulaNome: 'Multimeios Cartão',
    qtdOperadores: 10,
    listaOperadores: ['Igor Santos', 'Juliana Paes', 'Katia Abreu', 'Leonardo DiCaprio', 'Marta Silva', 'Neymar Jr', 'Otavio Mesquita', 'Priscila Fantin', 'Quentin T.', 'Ronaldo Fen'],
    status: 'Novo',
    observacoes: 'Novas diretrizes do Banco Central para devolução de PIX em casos de suspeita de fraude.',
    dataCriacao: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'DEM-1003',
    tipo: 'Sinergia',
    origem: 'Planejamento de Tráfego',
    supervisor: 'Carla Dias',
    gerente: 'Marcos Aurelio',
    dataSolicitacao: today,
    prazoLimite: inFiveDays,
    prioridade: 'Média',
    tema: 'Migração de Células',
    celulaId: 'cel-2',
    celulaNome: 'Multimeios Nuvem',
    qtdOperadores: 15,
    listaOperadores: ['Operadores do Turno Tarde selecionados pela gestão'],
    status: 'Em Planejamento',
    observacoes: 'Treinamento de migração de 15 operadores da célula Cartão para Suporte Nuvem.',
    dataCriacao: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'DEM-1004',
    tipo: 'Novatos',
    origem: 'RH / Recrutamento Externo',
    supervisor: 'Beatriz Martins Ramos',
    gerente: 'Claudia Leitte',
    dataSolicitacao: today,
    prazoLimite: inFiveDays,
    prioridade: 'Alta',
    tema: 'Onboarding Turma Julho - Atendimento',
    celulaId: 'cel-15',
    celulaNome: 'WhatsApp Care',
    qtdOperadores: 18,
    listaOperadores: ['Turma de 18 novos contratados do processo seletivo 2026.2'],
    status: 'Agendado',
    observacoes: 'Turma integral de formação de 5 dias em WhatsApp Care e linguagem empática.',
    turmaAgendadaId: 'TURMA-2001',
    dataCriacao: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'DEM-1005',
    tipo: 'Alinhamento',
    origem: 'E-mail Operacional',
    supervisor: 'Fabiana Rossi',
    gerente: 'Marcos Aurelio',
    dataSolicitacao: today,
    prazoLimite: today,
    prioridade: 'Urgente',
    tema: 'Técnicas de Negociação e Descontos',
    celulaId: 'cel-6',
    celulaNome: 'Retenção',
    qtdOperadores: 12,
    listaOperadores: ['Equipe Retenção Turno Manhã'],
    status: 'Agendado',
    observacoes: 'Alinhamento urgente sobre nova alçada de autorização de descontos em taxas.',
    turmaAgendadaId: 'TURMA-2002',
    dataCriacao: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'DEM-1006',
    tipo: 'Reciclagem',
    origem: 'Supervisor Financeiro',
    supervisor: 'Gustavo Paiva',
    gerente: 'Patricia Camargo',
    dataSolicitacao: today,
    prazoLimite: inFiveDays,
    prioridade: 'Baixa',
    tema: 'Sistema CRM - Módulo Estornos',
    celulaId: 'cel-7',
    celulaNome: 'Financeiro',
    qtdOperadores: 6,
    listaOperadores: ['Vitor Hugo', 'Wagner Moura', 'Xuxa Meneghel', 'Yuri Alberto', 'Zico Silva', 'Arthur Aguiar'],
    status: 'Novo',
    observacoes: 'Reciclagem pontual sobre lançamento de notas de estorno manual.',
    dataCriacao: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'TURMA-2001',
    nomeTurma: 'Turma WhatsApp Care Novatos #01',
    tema: 'Onboarding Turma Julho - Atendimento',
    demandaIds: ['DEM-1004'],
    multiplicadorId: 'mult-6',
    multiplicadorNome: 'Beatriz Martins Ramos',
    salaId: 'sala-2',
    salaNome: 'Sala Beta (Performance)',
    data: today,
    horarioInicio: '09:00',
    horarioFim: '13:00',
    qtdParticipantes: 18,
    celulasNomes: ['WhatsApp Care'],
    status: 'Em Execução',
    tipo: 'Novatos',
    observacoes: 'Em andamento na Sala Beta com acompanhamento presencial.'
  },
  {
    id: 'TURMA-2002',
    nomeTurma: 'Alinhamento Retenção - Alçadas de Desconto',
    tema: 'Técnicas de Negociação e Descontos',
    demandaIds: ['DEM-1005'],
    multiplicadorId: 'mult-3',
    multiplicadorNome: 'Lucas Santos Mendes',
    salaId: 'sala-1',
    salaNome: 'Sala Alpha (Inovação)',
    data: today,
    horarioInicio: '14:00',
    horarioFim: '16:00',
    qtdParticipantes: 12,
    celulasNomes: ['Retenção'],
    status: 'Agendado',
    tipo: 'Alinhamento',
    observacoes: 'Agendado para o período da tarde.'
  },
  {
    id: 'TURMA-2003',
    nomeTurma: 'Sinergia Nuvem & Suporte Técnico',
    tema: 'Multimeios Nuvem e Ferramentas',
    demandaIds: [],
    multiplicadorId: 'mult-2',
    multiplicadorNome: 'Mariana Oliveira Rocha',
    salaId: 'sala-3',
    salaNome: 'Lab 1 - Digital',
    data: today,
    horarioInicio: '15:00',
    horarioFim: '18:00',
    qtdParticipantes: 22,
    celulasNomes: ['Multimeios Nuvem', 'Suporte Técnico'],
    status: 'Agendado',
    tipo: 'Sinergia',
    observacoes: 'Treinamento prático nos computadores do Lab 1.'
  }
];
