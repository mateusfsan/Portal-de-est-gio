import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as estagiosApi from '../../../api/estagios.js';
import * as turmasApi from '../../../api/turmas.js';
import * as empresasApi from '../../../api/empresas.js';
import * as usuariosApi from '../../../api/usuarios.js';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import s from '../listPage.module.css';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}
function toDateInput(iso) {
  // input type="date" exige YYYY-MM-DD
  return new Date(iso).toISOString().slice(0, 10);
}

export default function EstagiosListPage() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [erroRemocao, setErroRemocao] = useState(null);

  const { data: estagios, isLoading, error } = useQuery({
    queryKey: ['estagios', 'todos'],
    queryFn: () => estagiosApi.listarTodos(),
  });

  const remocao = useMutation({
    mutationFn: (id) => estagiosApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estagios'] });
      setRemovendo(null);
      setErroRemocao(null);
    },
    onError: (err) => setErroRemocao(err.response?.data?.erro ?? 'falha ao remover'),
  });

  if (isLoading) return <Card>Carregando estágios…</Card>;
  if (error) return <Card>Erro ao carregar estágios.</Card>;

  return (
    <div className={s.shell}>
      <div className={s.header}>
        <div>
          <h1 className={s.titulo}>Estágios</h1>
          <p className={s.subtitulo}>{estagios.length} estágio(s) cadastrado(s).</p>
        </div>
        <div className={s.acoes}>
          <Button
            onClick={() =>
              setEditando({ alunoId: '', turmaId: '', empresaId: '', inicio: toDateInput(new Date()) })
            }
          >
            Novo estágio
          </Button>
        </div>
      </div>

      {estagios.length === 0 ? (
        <Card><p className={s.vazio}>Nenhum estágio cadastrado ainda.</p></Card>
      ) : (
        <div className={s.cards}>
          {estagios.map((e) => (
            <Card key={e.id}>
              <h3 className={s.cardTitulo}>{e.aluno.nome}</h3>
              <div className={s.cardMeta}>
                {e.aluno.ra && <span>RA {e.aluno.ra}</span>}
                <span>{e.turma.curso.nome} — {e.turma.periodo}</span>
                <span>Empresa: {e.empresa.razaoSocial}</span>
                <span>Início: {formatarData(e.inicio)}</span>
              </div>
              <div className={s.cardAcoes}>
                <Button variant="secondary" onClick={() => setEditando(e)}>Editar</Button>
                <Button variant="danger" onClick={() => setRemovendo(e)}>Deletar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EstagioFormModal
        editando={editando}
        onClose={() => setEditando(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['estagios'] });
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!removendo}
        title="Remover estágio"
        message={
          removendo
            ? `Deletar o estágio de ${removendo.aluno.nome}? Estágios com documentos não podem ser removidos.`
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

function EstagioFormModal({ editando, onClose, onSuccess }) {
  const [alunoId, setAlunoId] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [inicio, setInicio] = useState('');
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setAlunoId(editando.alunoId ?? '');
      setTurmaId(editando.turmaId ?? '');
      setEmpresaId(editando.empresaId ?? '');
      setInicio(editando.inicio ? toDateInput(editando.inicio) : '');
      setErro(null);
    }
  }, [editando]);

  // Dropdowns só carregam quando o modal abre.
  const alunosQ = useQuery({
    queryKey: ['usuarios', 'aluno'],
    queryFn: () => usuariosApi.listar({ papel: 'aluno' }),
    enabled: !!editando,
  });
  const turmasQ = useQuery({
    queryKey: ['turmas'],
    queryFn: () => turmasApi.listar(),
    enabled: !!editando,
  });
  const empresasQ = useQuery({
    queryKey: ['empresas'],
    queryFn: empresasApi.listar,
    enabled: !!editando,
  });

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? estagiosApi.atualizar(editando.id, { empresaId, inicio })
        : estagiosApi.criar({ alunoId, turmaId, empresaId, inicio }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  const valido = isEdit
    ? empresaId && inicio
    : alunoId && turmaId && empresaId && inicio;

  const carregandoDropdowns = alunosQ.isLoading || turmasQ.isLoading || empresasQ.isLoading;

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar estágio' : 'Novo estágio'}>
      <form
        className={s.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={s.erro}>{erro}</div>}

        <div className={s.field}>
          <label htmlFor="e-aluno" className={s.fieldLabel}>Aluno</label>
          <select
            id="e-aluno"
            className={s.select}
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            disabled={isEdit || alunosQ.isLoading}
            required
          >
            <option value="">Selecione…</option>
            {(alunosQ.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}{u.ra ? ` (RA ${u.ra})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label htmlFor="e-turma" className={s.fieldLabel}>Turma</label>
          <select
            id="e-turma"
            className={s.select}
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            disabled={isEdit || turmasQ.isLoading}
            required
          >
            <option value="">Selecione…</option>
            {(turmasQ.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.curso?.nome ? `${t.curso.nome} — ` : ''}{t.periodo}
              </option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label htmlFor="e-empresa" className={s.fieldLabel}>Empresa</label>
          <select
            id="e-empresa"
            className={s.select}
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            disabled={empresasQ.isLoading}
            required
          >
            <option value="">Selecione…</option>
            {(empresasQ.data ?? []).map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.razaoSocial}</option>
            ))}
          </select>
        </div>

        <Input
          id="e-inicio"
          label="Data de início"
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          required
        />

        <div className={s.formActions}>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || carregandoDropdowns || !valido}>
            {mutation.isPending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
