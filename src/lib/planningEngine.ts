import { Demanda, Multiplicador, SalaTreinamento, Turma, SugestaoAgrupamento, SugestaoEncaixe } from '../types';

/**
 * Normaliza textos para comparação flexível de temas e especialidades
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se dois horários [start1, end1] e [start2, end2] se sobrepõem
 */
export function isOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Analisa demandas pendentes e encontra agrupamentos inteligentes por tema
 */
export function detectSmartGroupings(
  demandas: Demanda[],
  multiplicadores: Multiplicador[],
  salas: SalaTreinamento[]
): SugestaoAgrupamento[] {
  const pendentes = demandas.filter(d => d.status === 'Novo' || d.status === 'Em Planejamento');
  
  // Agrupar por tema normalizado
  const gruposPorTema: { [key: string]: Demanda[] } = {};

  pendentes.forEach(d => {
    const normTema = normalizeText(d.tema);
    if (!gruposPorTema[normTema]) {
      gruposPorTema[normTema] = [];
    }
    gruposPorTema[normTema].push(d);
  });

  const sugestoes: SugestaoAgrupamento[] = [];

  Object.entries(gruposPorTema).forEach(([_normTema, listaDemandas]) => {
    if (listaDemandas.length < 1) return;

    const temaOriginal = listaDemandas[0].tema;
    const totalOperadores = listaDemandas.reduce((acc, curr) => acc + curr.qtdOperadores, 0);
    const celulasUnicas = Array.from(new Set(listaDemandas.map(d => d.celulaNome)));

    // Multiplicadores ativos (qualquer um exceto Ausente ou Férias)
    const multiplicadoresAtivos = multiplicadores.filter(m => m.status !== 'Ausente' && m.status !== 'Férias');

    // Encontrar multiplicadores aptos por Célula de Atendimento ou Tema/Especialidade
    // Independente do horário de trabalho (sem filtrar por turno)
    const multiplicadoresAptos = multiplicadoresAtivos.filter(m => {
      // Verifica se a especialidade do multiplicador coincide com a Célula do pedido ou Tema do treinamento
      const matchesTemaOuCelula = m.especialidades.some(esp => {
        const normEsp = normalizeText(esp);
        const normTema = normalizeText(temaOriginal);
        const isGeral = normEsp === 'geral';
        
        const cellMatch = celulasUnicas.some(cel => {
          const normCel = normalizeText(cel);
          return normEsp.includes(normCel) || normCel.includes(normEsp);
        });

        const temaMatch = normEsp.includes(normTema) || normTema.includes(normEsp);

        return isGeral || cellMatch || temaMatch;
      });

      return matchesTemaOuCelula;
    });

    // Se nenhum filtro restritivo bater, considera todos os ativos como aptos para que a operação escolha
    const listaFinalMultiplicadores = multiplicadoresAptos.length > 0 ? multiplicadoresAptos : multiplicadoresAtivos;

    // Encontrar salas com capacidade adequada
    const salasAptas = salas.filter(s => s.capacidade >= totalOperadores && s.status !== 'Manutenção');

    let motivo = '';
    if (listaDemandas.length > 1) {
      motivo = `Identificados ${listaDemandas.length} pedidos distintos para o tema "${temaOriginal}" nas células (${celulasUnicas.join(', ')}). Unificar otimizará a alocação de instrutores e salas.`;
    } else {
      motivo = `Solicitação de treinamento para "${temaOriginal}" da célula ${celulasUnicas[0]} (${totalOperadores} ops) pronta para agendamento.`;
    }

    sugestoes.push({
      tema: temaOriginal,
      demandaIds: listaDemandas.map(d => d.id),
      demandas: listaDemandas,
      totalOperadores,
      celulas: celulasUnicas,
      multiplicadoresAptos: listaFinalMultiplicadores,
      salasAptas,
      motivo
    });
  });

  return sugestoes;
}

/**
 * Gera sugestões automáticas de encaixe de horários (Multiplicadores Aptos + Sala)
 */
export function generateSmartSlots(
  demandas: Demanda[],
  multiplicadores: Multiplicador[],
  salas: SalaTreinamento[],
  turmasExistentes: Turma[]
): SugestaoEncaixe[] {
  const pendentes = demandas.filter(d => (d.status === 'Novo' || d.status === 'Em Planejamento') && !d.turmaAgendadaId);
  const sugestoes: SugestaoEncaixe[] = [];

  const targetDate = new Date().toISOString().split('T')[0];
  const multiplicadoresAtivos = multiplicadores.filter(m => m.status !== 'Ausente' && m.status !== 'Férias');

  pendentes.forEach(demanda => {
    // 1. Encontrar TODOS os multiplicadores aptos para a Célula/Tema da demanda (independente do horário de trabalho)
    const aptos = multiplicadoresAtivos.filter(m => {
      return m.especialidades.some(esp => {
        const normEsp = normalizeText(esp);
        const normTema = normalizeText(demanda.tema);
        const normCel = normalizeText(demanda.celulaNome);
        return normEsp === 'geral' || normEsp.includes(normCel) || normCel.includes(normEsp) || normEsp.includes(normTema) || normTema.includes(normEsp);
      });
    });

    const candidadosMult = aptos.length > 0 ? aptos : multiplicadoresAtivos;

    // 2. Encontrar sala com capacidade suficiente
    const salaApta = salas.find(s => s.capacidade >= demanda.qtdOperadores && s.status !== 'Manutenção') || salas[0];
    if (!salaApta) return;

    // Para cada multiplicador apto, sugerir encaixe independente do turno de trabalho
    candidadosMult.forEach(multiplicadorApto => {
      let horarioInicio = '09:00';
      let horarioFim = '11:00';

      const conflitoSala = turmasExistentes.some(t => 
        t.data === targetDate && 
        t.salaId === salaApta.id && 
        t.status !== 'Cancelado' &&
        isOverlapping(t.horarioInicio, t.horarioFim, horarioInicio, horarioFim)
      );

      const conflitoMultiplicador = turmasExistentes.some(t => 
        t.data === targetDate && 
        t.multiplicadorId === multiplicadorApto.id && 
        t.status !== 'Cancelado' &&
        isOverlapping(t.horarioInicio, t.horarioFim, horarioInicio, horarioFim)
      );

      if (!conflitoSala && !conflitoMultiplicador) {
        sugestoes.push({
          demanda,
          multiplicador: multiplicadorApto,
          sala: salaApta,
          dataSugerida: targetDate,
          horarioInicio,
          horarioFim,
          motivo: `Instrutor apto para a célula ${demanda.celulaNome} (${demanda.tema}). Sala ${salaApta.nome} (cap. ${salaApta.capacidade}) disponível.`
        });
      }
    });
  });

  return sugestoes;
}

/**
 * Retorna demandas em situação de alerta de prazo (atrasadas ou vencendo hoje/amanhã)
 */
export function getDeadlineAlerts(demandas: Demanda[]): Demanda[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return demandas.filter(d => {
    if (d.status === 'Finalizado' || d.status === 'Cancelado' || d.turmaAgendadaId) {
      return false;
    }
    return d.prazoLimite <= tomorrow || d.prioridade === 'Urgente';
  });
}
