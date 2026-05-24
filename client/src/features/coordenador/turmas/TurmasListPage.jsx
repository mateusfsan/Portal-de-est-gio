import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as turmasApi from '../../../api/turmas.js';
import * as cursosApi from '../../../api/cursos.js';
import * as usuariosApi from '../../../api/usuarios.js';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import s from '../listPage.module.css';

export default function TurmasListPage() {
  const queryClient = useQueryClient();
  const [filtroCurso, setFiltroCurso] = useState('');
  const [editando, setEditando] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [erroRemocao, setErroRemocao] = useState(null);

  const cursosQ = useQuery({ queryKey: ['cursos'], queryFn: cursosApi.listar });
  const turmasQ = useQuery({
    queryKey: ['turmas', filtroCurso || 'todos'],
    queryFn: () => turmasApi.listar(filtroCurso ? { cursoId: filtroCurso } : undefined),
  });

  const remocao = useMutation({
    mutationFn: (id) => turmasApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setRemovendo(null);
      setErroRemocao(null);
    },
    onError: (err) => setErroRemocao(err.response?.data?.erro ?? 'falha ao remover'),
  });

  if (cursosQ.isLoading || turmasQ.isLoading) return <Card>Carregando…</Card>;
  if (cursosQ.error || turmasQ.error) return <Card>Erro ao carregar.</Card>;

  return (
    <div className={s.shell}>
      <div className={s.header}>
        <div>
          <h1 className={s.titulo}>Turmas</h1>
          <p className={s.subtitulo}>{turmasQ.data.length} turma(s).</p>
        </div>
        <div className={s.acoes}>
          <Button onClick={() => setEditando({ cursoId: '', orientadorId: '', periodo: '' })}>
            Nova turma
          </Button>
        </div>
      </div>

      <Card>
        <div className={s.field}>
          <label htmlFor="filtroCurso" className={s.fieldLabel}>Filtrar por curso</label>
          <select
            id="filtroCurso"
            className={s.select}
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            <option value="">Todos</option>
            {cursosQ.data.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </Card>

      {turmasQ.data.length === 0 ? (
        <Card><p className={s.vazio}>Nenhuma turma encontrada.</p></Card>
      ) : (
        <div className={s.cards}>
          {turmasQ.data.map((t) => (
            <Card key={t.id}>
              <h3 className={s.cardTitulo}>{t.periodo}</h3>
              <div className={s.cardMeta}>
                <span>Curso: {t.curso.nome}</span>
                <span>Orientador: {t.orientador.nome}</span>
              </div>
              <div className={s.cardAcoes}>
                <Button variant="secondary" onClick={() => setEditando(t)}>Editar</Button>
                <Button variant="danger" onClick={() => setRemovendo(t)}>Deletar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TurmaFormModal
        editando={editando}
        cursos={cursosQ.data}
        onClose={() => setEditando(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['turmas'] });
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!removendo}
        title="Remover turma"
        message={
          removendo
            ? `Deletar turma ${removendo.periodo} de ${removendo.curso?.nome}? Turmas com estágios não podem ser removidas.`
            : ''
        }
        confirmLabel="Deletar"
        loading={remocao.isPending}
        error={erroRemocao}
        onConfirm={() => remocao.mutate(removendo.id)}
        onClose={() => { setRemovendo(null); setErroRemocao(null); }}
      />
    </div>
  );
}

function TurmaFormModal({ editando, cursos, onClose, onSuccess }) {
  const [cursoId, setCursoId] = useState('');
  const [orientadorId, setOrientadorId] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setCursoId(editando.cursoId ?? '');
      setOrientadorId(editando.orientadorId ?? '');
      setPeriodo(editando.periodo ?? '');
      setErro(null);
    }
  }, [editando]);

  // Lista de orientadores só carrega quando o modal está aberto.
  const orientQ = useQuery({
    queryKey: ['usuarios', 'orientador'],
    queryFn: () => usuariosApi.listar({ papel: 'orientador' }),
    enabled: !!editando,
  });

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? turmasApi.atualizar(editando.id, { orientadorId, periodo })
        : turmasApi.criar({ cursoId, orientadorId, periodo }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  const valido = isEdit
    ? orientadorId && periodo.trim().length >= 4
    : cursoId && orientadorId && periodo.trim().length >= 4;

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar turma' : 'Nova turma'}>
      <form
        className={s.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={s.erro}>{erro}</div>}
        <div className={s.field}>
          <label htmlFor="t-curso" className={s.fieldLabel}>Curso</label>
          <select
            id="t-curso"
            className={s.select}
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Selecione…</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label htmlFor="t-orient" className={s.fieldLabel}>Orientador</label>
          <select
            id="t-orient"
            className={s.select}
            value={orientadorId}
            onChange={(e) => setOrientadorId(e.target.value)}
            required
            disabled={orientQ.isLoading}
          >
            <option value="">Selecione…</option>
            {(orientQ.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
            ))}
          </select>
        </div>
        <Input
          id="t-periodo"
          label="Período (ex.: 2026/1)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          required
          placeholder="2026/1"
        />
        <div className={s.formActions}>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || !valido}>
            {mutation.isPending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
