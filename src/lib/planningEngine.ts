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

    // Se houver múltiplos pedidos ou pedidos com mais de 5 operadores
    const temaOriginal = listaDemandas[0].tema;
    const totalOperadores = listaDemandas.reduce((acc, curr) => acc + curr.qtdOperadores, 0);
    const celulasUnicas = Array.from(new Set(listaDemandas.map(d => d.celulaNome)));

    // Encontrar multiplicadores aptos que possuem o tema nas especialidades
    const multiplicadoresAptos = multiplicadores.filter(m => {
      if (m.status === 'Férias' || m.status === 'Folga') return false;
      return m.especialidades.some(esp => 
        normalizeText(esp).includes(normalizeText(temaOriginal)) ||
        normalizeText(temaOriginal).includes(normalizeText(esp))
      );
    });

    // Encontrar salas com capacidade adequada
    const salasAptas = salas.filter(s => s.capacidade >= totalOperadores && s.status !== 'Manutenção');

    let motivo = '';
    if (listaDemandas.length > 1) {
      motivo = `Identificados ${listaDemandas.length} pedidos distintos para o tema "${temaOriginal}" abrangendo as células (${celulasUnicas.join(', ')}). Unificar otimizará a carga horária e alocação de sala.`;
    } else {
      motivo = `Pedido para "${temaOriginal}" da célula ${celulasUnicas[0]} com ${totalOperadores} operadores pronto para formação de turma.`;
    }

    sugestoes.push({
      tema: temaOriginal,
      demandaIds: listaDemandas.map(d => d.id),
      demandas: listaDemandas,
      totalOperadores,
      celulas: celulasUnicas,
      multiplicadoresAptos: multiplicadoresAptos.length > 0 ? multiplicadoresAptos : multiplicadores,
      salasAptas,
      motivo
    });
  });

  return sugestoes;
}

/**
 * Gera sugestões automáticas de encaixe de horários (Multiplicador + Sala)
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

  pendentes.forEach(demanda => {
    // 1. Encontrar multiplicador adequado
    const multiplicadorApto = multiplicadores.find(m => {
      if (m.status !== 'Disponível' && m.status !== 'Home Office') return false;
      return m.especialidades.some(esp => normalizeText(esp).includes(normalizeText(demanda.tema)) || normalizeText(demanda.tema).includes(normalizeText(esp)));
    }) || multiplicadores.find(m => m.status === 'Disponível');

    if (!multiplicadorApto) return;

    // 2. Encontrar sala com capacidade suficiente
    const salaApta = salas.find(s => s.capacidade >= demanda.qtdOperadores && s.status !== 'Manutenção');
    if (!salaApta) return;

    // 3. Definir horário padrão baseado na jornada do multiplicador (ex: 09:00 - 11:00 ou 14:00 - 16:00)
    let horarioInicio = '09:00';
    let horarioFim = '11:00';

    if (multiplicadorApto.horarioInicio >= '13:00') {
      horarioInicio = '14:00';
      horarioFim = '16:00';
    }

    // Verificar se sala/multiplicador já está ocupado nesse horário
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
        motivo: `Otimização do prazo (${demanda.prazoLimite}): ${multiplicadorApto.nome} possui especialidade em ${demanda.tema} e a ${salaApta.nome} (cap. ${salaApta.capacidade}) está livre.`
      });
    }
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
