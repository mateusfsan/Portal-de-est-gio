import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as empresasApi from '../../../api/empresas.js';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import s from '../listPage.module.css';

export default function EmpresasListPage() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [erroRemocao, setErroRemocao] = useState(null);

  const { data: empresas, isLoading, error } = useQuery({
    queryKey: ['empresas'],
    queryFn: empresasApi.listar,
  });

  const remocao = useMutation({
    mutationFn: (id) => empresasApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      setRemovendo(null);
      setErroRemocao(null);
    },
    onError: (err) => setErroRemocao(err.response?.data?.erro ?? 'falha ao remover'),
  });

  if (isLoading) return <Card>Carregando empresas…</Card>;
  if (error) return <Card>Erro ao carregar empresas.</Card>;

  return (
    <div className={s.shell}>
      <div className={s.header}>
        <div>
          <h1 className={s.titulo}>Empresas</h1>
          <p className={s.subtitulo}>{empresas.length} empresa(s) cadastrada(s).</p>
        </div>
        <div className={s.acoes}>
          <Button
            onClick={() =>
              setEditando({ razaoSocial: '', supervisorNome: '', supervisorEmail: '' })
            }
          >
            Nova empresa
          </Button>
        </div>
      </div>

      {empresas.length === 0 ? (
        <Card><p className={s.vazio}>Nenhuma empresa cadastrada ainda.</p></Card>
      ) : (
        <div className={s.cards}>
          {empresas.map((e) => (
            <Card key={e.id}>
              <h3 className={s.cardTitulo}>{e.razaoSocial}</h3>
              <div className={s.cardMeta}>
                <span>Supervisor: {e.supervisorNome}</span>
                <span>{e.supervisorEmail}</span>
              </div>
              <div className={s.cardAcoes}>
                <Button variant="secondary" onClick={() => setEditando(e)}>Editar</Button>
                <Button variant="danger" onClick={() => setRemovendo(e)}>Deletar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EmpresaFormModal
        editando={editando}
        onClose={() => setEditando(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['empresas'] });
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!removendo}
        title="Remover empresa"
        message={
          removendo
            ? `Deletar "${removendo.razaoSocial}"? Empresas com estágios não podem ser removidas.`
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

function EmpresaFormModal({ editando, onClose, onSuccess }) {
  const [razaoSocial, setRazao] = useState('');
  const [supervisorNome, setSupNome] = useState('');
  const [supervisorEmail, setSupEmail] = useState('');
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setRazao(editando.razaoSocial ?? '');
      setSupNome(editando.supervisorNome ?? '');
      setSupEmail(editando.supervisorEmail ?? '');
      setErro(null);
    }
  }, [editando]);

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () => {
      const dados = { razaoSocial, supervisorNome, supervisorEmail };
      return isEdit ? empresasApi.atualizar(editando.id, dados) : empresasApi.criar(dados);
    },
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  const valido =
    razaoSocial.trim().length >= 2 &&
    supervisorNome.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supervisorEmail);

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar empresa' : 'Nova empresa'}>
      <form
        className={s.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={s.erro}>{erro}</div>}
        <Input
          id="emp-razao"
          label="Razão social"
          value={razaoSocial}
          onChange={(e) => setRazao(e.target.value)}
          required
        />
        <Input
          id="emp-sup-nome"
          label="Nome do supervisor"
          value={supervisorNome}
          onChange={(e) => setSupNome(e.target.value)}
          required
        />
        <Input
          id="emp-sup-email"
          label="Email do supervisor"
          type="email"
          value={supervisorEmail}
          onChange={(e) => setSupEmail(e.target.value)}
          required
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
