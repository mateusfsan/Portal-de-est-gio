import { prisma } from './prisma.js';
import { AppError } from './appError.js';

/**
 * Calcula a fase atual de um estágio de forma DERIVADA (CLAUDE.md 2.4).
 * Nunca persistimos esse valor — sempre recalculamos a partir do estado
 * atual dos documentos. Persistir geraria duas fontes de verdade.
 *
 * Algoritmo (CLAUDE.md 2.4 + 2.5):
 *   1. Carrega todas as fases do curso da turma do estágio, ordenadas por ordem,
 *      cada uma com seus tipos (só os obrigatórios entram na contagem) e os
 *      documentos do estágio para esse tipo.
 *   2. Uma fase é "completa" quando TODOS os tipos `obrigatorio=true` dela
 *      têm pelo menos UM documento com status='aprovado' no estágio.
 *      Tipos não-obrigatórios nunca travam o avanço.
 *   3. Encontra a maior ordem completa (chame de N).
 *   4. Retorna a fase de ordem N+1 como "atual". Se todas as fases estão
 *      completas, retorna null (estágio concluído).
 *
 * A função busca tudo em UMA query (com includes encadeados) — fica linear
 * em fases × tipos, o que é trivial para a escala esperada (dezenas de cada).
 *
 * @param {string} estagioId
 * @returns {Promise<{
 *   faseAtual: {id: string, ordem: number, nome: string} | null,
 *   faseCompletada: {id: string, ordem: number, nome: string} | null,
 *   totalFases: number,
 *   progressoFaseAtual: {aprovados: number, totalObrigatorios: number} | null
 * }>}
 */
export async function calcularFaseAtual(estagioId) {
  const estagio = await prisma.estagio.findUnique({
    where: { id: estagioId },
    select: {
      id: true,
      turma: {
        select: {
          curso: {
            select: {
              fases: {
                orderBy: { ordem: 'asc' },
                select: {
                  id: true,
                  ordem: true,
                  nome: true,
                  tipos: {
                    select: { id: true, obrigatorio: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!estagio) throw new AppError('estágio não encontrado', 404);

  const fases = estagio.turma.curso.fases;
  const totalFases = fases.length;

  // Carrega só os documentos APROVADOS do estágio — únicos que contam para fechar fase.
  // Trazemos só `tipoDocumentoId` que é o que precisamos para casar com `tipos`.
  const aprovados = await prisma.documento.findMany({
    where: { estagioId, status: 'aprovado' },
    select: { tipoDocumentoId: true },
  });
  const tiposAprovadosSet = new Set(aprovados.map((d) => d.tipoDocumentoId));

  // Determina se cada fase está "completa".
  const fasesComStatus = fases.map((f) => {
    const obrigatorios = f.tipos.filter((t) => t.obrigatorio);
    const aprovadosNessaFase = obrigatorios.filter((t) => tiposAprovadosSet.has(t.id));
    return {
      ...f,
      completa: obrigatorios.length > 0
        ? aprovadosNessaFase.length === obrigatorios.length
        : true, // fase sem tipo obrigatório está sempre "completa"
      aprovados: aprovadosNessaFase.length,
      totalObrigatorios: obrigatorios.length,
    };
  });

  // Maior fase completa (a última `completa: true` na ordem) determina a próxima.
  let maiorCompletaIdx = -1;
  for (let i = 0; i < fasesComStatus.length; i++) {
    if (fasesComStatus[i].completa) maiorCompletaIdx = i;
    else break; // ao primeiro hole, paramos — fase atual é a primeira não-completa
  }

  const faseCompletada =
    maiorCompletaIdx >= 0
      ? selectMin(fasesComStatus[maiorCompletaIdx])
      : null;
  const faseAtualObj =
    maiorCompletaIdx + 1 < fasesComStatus.length
      ? fasesComStatus[maiorCompletaIdx + 1]
      : null;

  return {
    faseAtual: faseAtualObj ? selectMin(faseAtualObj) : null,
    faseCompletada,
    totalFases,
    progressoFaseAtual: faseAtualObj
      ? { aprovados: faseAtualObj.aprovados, totalObrigatorios: faseAtualObj.totalObrigatorios }
      : null,
  };
}

function selectMin(f) {
  return { id: f.id, ordem: f.ordem, nome: f.nome };
}
