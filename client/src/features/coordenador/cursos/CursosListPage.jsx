import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as cursosApi from '../../../api/cursos.js';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import s from '../listPage.module.css';

export default function CursosListPage() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(null);     // null | { id?, nome }
  const [removendo, setRemovendo] = useState(null);
  const [erroRemocao, setErroRemocao] = useState(null);

  const { data: cursos, isLoading, error } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.listar,
  });

  const remocao = useMutation({
    mutationFn: (id) => cursosApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      setRemovendo(null);
      setErroRemocao(null);
    },
    onError: (err) => setErroRemocao(err.response?.data?.erro ?? 'falha ao remover'),
  });

  if (isLoading) return <Card>Carregando cursos…</Card>;
  if (error) return <Card>Erro ao carregar cursos.</Card>;

  return (
    <div className={s.shell}>
      <div className={s.header}>
        <div>
          <h1 className={s.titulo}>Cursos</h1>
          <p className={s.subtitulo}>{cursos.length} curso(s) cadastrado(s).</p>
        </div>
        <div className={s.acoes}>
          <Button onClick={() => setEditando({ nome: '' })}>Novo curso</Button>
        </div>
      </div>

      {cursos.length === 0 ? (
        <Card><p className={s.vazio}>Nenhum curso ainda. Clica em "Novo curso" para começar.</p></Card>
      ) : (
        <div className={s.cards}>
          {cursos.map((c) => (
            <Card key={c.id}>
              <h3 className={s.cardTitulo}>{c.nome}</h3>
              <div className={s.cardAcoes}>
                <Link to={`/coordenacao/cursos/${c.id}`}>
                  <Button variant="secondary">Ver fases</Button>
                </Link>
                <Button variant="secondary" onClick={() => setEditando(c)}>Editar</Button>
                <Button variant="danger" onClick={() => setRemovendo(c)}>Deletar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CursoFormModal
        editando={editando}
        onClose={() => setEditando(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['cursos'] });
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!removendo}
        title="Remover curso"
        message={removendo ? `Deletar o curso "${removendo.nome}"? Cursos com fases ou turmas não podem ser removidos.` : ''}
        confirmLabel="Deletar"
        loading={remocao.isPending}
        error={erroRemocao}
        onConfirm={() => remocao.mutate(removendo.id)}
        onClose={() => { setRemovendo(null); setErroRemocao(null); }}
      />
    </div>
  );
}

function CursoFormModal({ editando, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState(null);

  // Hidrata o nome quando o modal abre com um curso pra editar.
  useEffect(() => {
    if (editando) {
      setNome(editando.nome ?? '');
      setErro(null);
    }
  }, [editando]);

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? cursosApi.atualizar(editando.id, { nome })
        : cursosApi.criar({ nome }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar curso' : 'Novo curso'}>
      <form
        className={s.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={s.erro}>{erro}</div>}
        <Input
          id="curso-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex.: Engenharia de Software"
        />
        <div className={s.formActions}>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || nome.trim().length < 2}>
            {mutation.isPending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
