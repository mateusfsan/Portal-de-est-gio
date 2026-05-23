import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { listar as listarCursos } from '../../api/cursos.js';
import { listar as listarTurmas } from '../../api/turmas.js';
import { listarTodos as listarTodosEstagios, faseAtual } from '../../api/estagios.js';
import Card from '../../components/Card/Card.jsx';
import styles from './DashboardPage.module.css';

const CHAVE_CONCLUIDO = '__concluido__';

export default function DashboardPage() {
  const [cursoId, setCursoId] = useState('');
  const [turmaId, setTurmaId] = useState('');

  const cursosQ = useQuery({ queryKey: ['cursos'], queryFn: listarCursos });
  const turmasQ = useQuery({
    queryKey: ['turmas', cursoId || 'todos'],
    queryFn: () => listarTurmas(cursoId ? { cursoId } : undefined),
  });
  const estagiosQ = useQuery({
    queryKey: ['estagios', 'todos', turmaId || 'todos'],
    // Backend só filtra por turmaId/alunoId; cursoId é resolvido em
    // memória abaixo (filtramos pelos estagios cuja turma.cursoId bate).
    queryFn: () => listarTodosEstagios(turmaId ? { turmaId } : undefined),
  });

  const estagiosFiltrados = useMemo(() => {
    if (!estagiosQ.data) return [];
    if (!cursoId) return estagiosQ.data;
    return estagiosQ.data.filter((e) => e.turma.cursoId === cursoId);
  }, [estagiosQ.data, cursoId]);

  // Para cada estágio, dispara a query de fase atual. TanStack Query
  // dedupa e cacheia por chave automaticamente.
  const fasesAtuaisQs = useQueries({
    queries: estagiosFiltrados.map((e) => ({
      queryKey: ['estagios', e.id, 'fase-atual'],
      queryFn: () => faseAtual(e.id),
    })),
  });

  // Agrupa por fase atual (ou "concluído"). Faz isso só quando todas as
  // queries de fase terminaram para evitar renderizar um agrupamento parcial.
  const grupos = useMemo(() => {
    if (fasesAtuaisQs.some((q) => q.isLoading)) return null;
    const map = new Map();
    estagiosFiltrados.forEach((est, i) => {
      const fa = fasesAtuaisQs[i].data;
      const chave = fa?.faseAtual ? fa.faseAtual.id : CHAVE_CONCLUIDO;
      const rotulo = fa?.faseAtual
        ? `${fa.faseAtual.nome} (fase ${fa.faseAtual.ordem})`
        : 'Estágio concluído';
      const ordem = fa?.faseAtual?.ordem ?? Infinity;
      if (!map.has(chave)) {
        map.set(chave, { chave, rotulo, ordem, itens: [] });
      }
      map.get(chave).itens.push({ estagio: est, faseAtual: fa });
    });
    return [...map.values()].sort((a, b) => a.ordem - b.ordem);
  }, [estagiosFiltrados, fasesAtuaisQs]);

  if (cursosQ.isLoading || estagiosQ.isLoading) return <Card>Carregando…</Card>;
  if (cursosQ.error || estagiosQ.error) return <Card>Erro ao carregar dashboard.</Card>;

  const totalEstagios = estagiosFiltrados.length;

  return (
    <div className={styles.shell}>
      <div>
        <h1 className={styles.titulo}>Dashboard</h1>
        <p className={styles.subtitulo}>
          {totalEstagios === 0
            ? 'Nenhum estágio encontrado com os filtros atuais.'
            : `${totalEstagios} estágio(s) agrupados pela fase atual.`}
        </p>
      </div>

      <Card>
        <div className={styles.filtros}>
          <div className={styles.filtroCampo}>
            <label htmlFor="filtroCurso" className={styles.filtroLabel}>Curso</label>
            <select
              id="filtroCurso"
              className={styles.select}
              value={cursoId}
              onChange={(e) => {
                setCursoId(e.target.value);
                setTurmaId(''); // turmas dependem do curso; resetar
              }}
            >
              <option value="">Todos</option>
              {cursosQ.data.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className={styles.filtroCampo}>
            <label htmlFor="filtroTurma" className={styles.filtroLabel}>Turma</label>
            <select
              id="filtroTurma"
              className={styles.select}
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              disabled={turmasQ.isLoading}
            >
              <option value="">Todas</option>
              {(turmasQ.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.curso?.nome ? `${t.curso.nome} — ` : ''}{t.periodo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {grupos === null ? (
        <Card>Calculando fases…</Card>
      ) : grupos.length === 0 ? (
        <Card><p className={styles.vazio}>Nenhum estágio para mostrar.</p></Card>
      ) : (
        <div className={styles.grupos}>
          {grupos.map((g) => (
            <section key={g.chave}>
              <div className={styles.grupoHeader}>
                <h2 className={styles.grupoNome}>{g.rotulo}</h2>
                <span className={styles.grupoContagem}>{g.itens.length} aluno(s)</span>
              </div>
              <div className={styles.cards}>
                {g.itens.map(({ estagio, faseAtual }) => (
                  <AlunoCard key={estagio.id} estagio={estagio} faseAtual={faseAtual} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function AlunoCard({ estagio, faseAtual }) {
  const concluido = faseAtual?.faseAtual === null;
  const p = faseAtual?.progressoFaseAtual;
  const pct = concluido
    ? 100
    : p
      ? Math.round((p.aprovados / Math.max(p.totalObrigatorios, 1)) * 100)
      : 0;

  return (
    <Card tight>
      <div className={styles.cardAluno}>
        <h3 className={styles.alunoNome}>{estagio.aluno.nome}</h3>
        <div className={styles.alunoMeta}>
          {estagio.aluno.ra && <span>RA {estagio.aluno.ra}</span>}
          <span>{estagio.turma.curso.nome}</span>
          <span>Turma {estagio.turma.periodo} · {estagio.empresa.razaoSocial}</span>
        </div>
        <div className={styles.progresso}>
          <div className={styles.barraTrack}>
            <div
              className={`${styles.barraFill} ${concluido ? styles.concluidoFill : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span>
            {concluido
              ? 'concluído'
              : p
                ? `${p.aprovados}/${p.totalObrigatorios}`
                : '—'}
          </span>
        </div>
      </div>
    </Card>
  );
}
