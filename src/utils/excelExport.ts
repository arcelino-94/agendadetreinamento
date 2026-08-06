import * as XLSX from 'xlsx';
import { ItemFrequenciaNota } from '../types';

export const handleExportExcelDossie = (course: ItemFrequenciaNota) => {
  const wb = XLSX.utils.book_new();

  // Generate date headers for total training period (25 days)
  const start = course.dataInicio ? new Date(course.dataInicio) : new Date();
  const datesList: string[] = [];
  for (let i = 0; i < 25; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    datesList.push(`${yyyy}-${mm}-${dd}`);
  }

  // --- SHEET 1: FREQUÊNCIAS E NOTAS (RESUMO DA TURMA) ---
  const headersSheet1 = [
    'MAT_DP',
    'LOGIN_BB',
    'NOME_OPERADOR',
    'SUPERVISOR',
    'GERENTE',
    'CELULA',
    'FREQUENCIA_%',
    'MEDIA_NOTAS',
    'STATUS_APROVACAO',
    'DOSSIE_PREENCHIDO',
    'FOTO_DOSSIE',
    'PROVAS_E_NOTAS',
    ...datesList.map(d => `FREQ_${d}`)
  ];

  const rowsSheet1 = course.alunos.map(a => {
    const dossie = a.dossie || {};
    const hasDossie = dossie.plataformaBB || dossie.fluenciaVerbal || dossie.outrasConsideracoes ? 'SIM' : 'NÃO';
    const hasFoto = dossie.fotoUrl ? 'SIM' : 'NÃO';
    const provasStr = (a.provas || []).map(p => `${p.nomeProva}: ${p.nota}`).join(' | ');
    const freqCols = datesList.map(d => a.presencaDiaria?.[d]?.frequencia || '');

    return [
      a.matDP,
      a.loginBB || '',
      a.nome,
      a.supervisor || '',
      a.gerente || '',
      a.celula || '',
      `${a.frequenciaPercent}%`,
      a.notaFinal,
      a.statusAprovacao,
      hasDossie,
      hasFoto,
      provasStr,
      ...freqCols
    ];
  });

  const ws1Data = [
    [`TURMA: ${course.treinamento}`, `TIPO: ${course.tipo}`, `MULTIPLICADOR: ${course.multiplicador}`, `PERÍODO: ${course.dataInicio} à ${course.dataFim}`],
    [''],
    headersSheet1,
    ...rowsSheet1
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);

  // Set column widths for Sheet 1
  ws1['!cols'] = [
    { wch: 15 }, // MAT_DP
    { wch: 15 }, // LOGIN_BB
    { wch: 30 }, // NOME
    { wch: 20 }, // SUPERVISOR
    { wch: 20 }, // GERENTE
    { wch: 15 }, // CELULA
    { wch: 15 }, // FREQ %
    { wch: 12 }, // MEDIA NOTAS
    { wch: 18 }, // STATUS
    { wch: 18 }, // DOSSIE
    { wch: 12 }, // FOTO
    { wch: 35 }, // PROVAS
    ...datesList.map(() => ({ wch: 10 }))
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Frequências e Notas');

  // --- SHEETS 2+: ONE SHEET PER OPERATOR FOR DETAILED DOSSIÊ ---
  const sheetNameCounts: Record<string, number> = {};

  course.alunos.forEach((aluno, idx) => {
    const dossie = aluno.dossie || {};
    
    // Clean name for sheet title (Excel limit is 31 chars and no special chars)
    let rawName = `${idx + 1}. ${aluno.nome.split(' ')[0]} ${aluno.nome.split(' ').pop() || ''}`;
    let cleanName = rawName.replace(/[:\\/?*\[\]]/g, '').trim().substring(0, 30);
    if (sheetNameCounts[cleanName]) {
      sheetNameCounts[cleanName] += 1;
      cleanName = `${cleanName.substring(0, 27)}(${sheetNameCounts[cleanName]})`;
    } else {
      sheetNameCounts[cleanName] = 1;
    }

    const provasStr = (aluno.provas || []).map(p => `• ${p.nomeProva}: ${p.nota} pts`).join('\n') || 'Nenhuma prova registrada.';

    const aoaAluno = [
      ['DOSSIÊ DO COLABORADOR / OPERADOR - FICHA INDIVIDUAL'],
      [''],
      ['NOME COMPLETO:', aluno.nome],
      ['MATRÍCULA DP:', aluno.matDP, 'LOGIN BB:', aluno.loginBB || 'N/A'],
      ['CÉLULA:', aluno.celula, 'SUPERVISOR:', aluno.supervisor || 'N/A', 'GERENTE:', aluno.gerente || 'N/A'],
      ['TREINAMENTO:', course.treinamento, 'PROGRAMA:', course.tipo],
      ['PERÍODO:', `${course.dataInicio} à ${course.dataFim}`, 'MULTIPLICADOR:', course.multiplicador],
      [''],
      ['DESEMPENHO GERAL NO TREINAMENTO'],
      ['FREQUÊNCIA ACUMULADA:', `${aluno.frequenciaPercent}%`],
      ['MÉDIA FINAL DAS NOTAS:', aluno.notaFinal],
      ['STATUS DE APROVAÇÃO:', aluno.statusAprovacao],
      ['HISTÓRICO DE PROVAS:', provasStr],
      [''],
      ['VIVÊNCIAS ANALISADAS EM SALA - AVALIAÇÃO (ÓTIMO / BOM / REGULAR / RUIM)'],
      [''],
      ['1. CONHECIMENTO TÉCNICO', 'CLASSIFICAÇÃO'],
      ['PLATAFORMA BB:', dossie.plataformaBB || 'NÃO AVALIADO'],
      ['SISBB:', dossie.sisbb || 'NÃO AVALIADO'],
      ['DOMÍNIO NO COMPUTADOR:', dossie.dominioComputador || 'NÃO AVALIADO'],
      ['OBSERVAÇÕES TÉCNICAS:', dossie.obsTecnico || 'Sem observações técnicas.'],
      [''],
      ['2. COMPORTAMENTO EM SALA', 'CLASSIFICAÇÃO'],
      ['FLUÊNCIA VERBAL:', dossie.fluenciaVerbal || 'NÃO AVALIADO'],
      ['CORDIALIDADE:', dossie.cordialidade || 'NÃO AVALIADO'],
      ['RELACIONAMENTO INTERPESSOAL:', dossie.relacionamentoInterpessoal || 'NÃO AVALIADO'],
      ['PONTUALIDADE:', dossie.pontualidade || 'NÃO AVALIADO'],
      ['OBSERVAÇÕES COMPORTAMENTO:', dossie.obsComportamento || 'Sem observações comportamentais.'],
      [''],
      ['3. OUTRAS CONSIDERAÇÕES GERAIS'],
      [dossie.outrasConsideracoes || 'Sem considerações adicionais.'],
      [''],
      ['FOTO REGISTRADA:', dossie.fotoUrl ? 'SIM (Foto salva no sistema de Dossiê)' : 'NÃO POSSUI FOTO'],
      ['DATA DE ATUALIZAÇÃO DO DOSSIÊ:', dossie.atualizadoEm || 'Não registrado']
    ];

    const wsAluno = XLSX.utils.aoa_to_sheet(aoaAluno);
    wsAluno['!cols'] = [
      { wch: 30 },
      { wch: 35 },
      { wch: 20 },
      { wch: 25 }
    ];

    XLSX.utils.book_append_sheet(wb, wsAluno, cleanName);
  });

  const fileName = `Dossie_Turma_${course.treinamento.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
