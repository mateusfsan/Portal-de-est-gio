import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usuariosApi from '../../../api/usuarios.js';
import { useAuth } from '../../../hooks/useAuth.jsx';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import Avatar from '../../../components/Avatar/Avatar.jsx';
import s from '../listPage.module.css';

const PAPEIS_OPCOES = [
  { value: '', label: 'Todos' },
  { value: 'aluno', label: 'Alunos' },
  { value: 'orientador', label: 'Orientadores' },
  { value: 'coordenador', label: 'Coordenadores' },
];

export default function UsuariosListPage() {
  const queryClient = useQueryClient();
  const { usuario: usuarioLogado } = useAuth();
  const [filtroPapel, setFiltroPapel] = useState('');
  const [editando, setEditando] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [erroRemocao, setErroRemocao] = useState(null);

  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios', filtroPapel || 'todos'],
    queryFn: () => usuariosApi.listar(filtroPapel ? { papel: filtroPapel } : undefined),
  });

  const remocao = useMutation({
    mutationFn: (id) => usuariosApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setRemovendo(null);
      setErroRemocao(null);
    },
    onError: (err) => setErroRemocao(err.response?.data?.erro ?? 'falha ao remover'),
  });

  if (isLoading) return <Card>Carregando usuários…</Card>;
  if (error) return <Card>Erro ao carregar usuários.</Card>;

  return (
    <div className={s.shell}>
      <div className={s.header}>
        <div>
          <h1 className={s.titulo}>Usuários</h1>
          <p className={s.subtitulo}>{usuarios.length} usuário(s) cadastrado(s).</p>
        </div>
        <div className={s.acoes}>
          <Button
            onClick={() =>
              setEditando({ nome: '', email: '', senha: '', papel: 'aluno', ra: '' })
            }
          >
            Novo usuário
          </Button>
        </div>
      </div>

      <Card>
        <div className={s.field}>
          <label htmlFor="filtroPapel" className={s.fieldLabel}>Filtrar por papel</label>
          <select
            id="filtroPapel"
            className={s.select}
            value={filtroPapel}
            onChange={(e) => setFiltroPapel(e.target.value)}
          >
            {PAPEIS_OPCOES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {usuarios.length === 0 ? (
        <Card><p className={s.vazio}>Nenhum usuário encontrado.</p></Card>
      ) : (
        <div className={s.cards}>
          {usuarios.map((u) => (
            <Card key={u.id}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Avatar nome={u.nome} fotoUrl={u.fotoUrl} size="md" />
                <div style={{ flex: 1 }}>
                  <h3 className={s.cardTitulo}>{u.nome}</h3>
                  <div className={s.cardMeta}>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          marginRight: 'var(--space-2)',
                        }}
                      >
                        {u.papel}
                      </span>
                      {u.email}
                    </span>
                    {u.ra && <span>RA {u.ra}</span>}
                  </div>
                </div>
              </div>
              <div className={s.cardAcoes}>
                <Button variant="secondary" onClick={() => setEditando(u)}>Editar</Button>
                <Button
                  variant="danger"
                  onClick={() => setRemovendo(u)}
                  disabled={u.id === usuarioLogado.id}
                >
                  Deletar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UsuarioFormModal
        editando={editando}
        usuarioLogado={usuarioLogado}
        onClose={() => setEditando(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['usuarios'] });
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!removendo}
        title="Remover usuário"
        message={
          removendo
            ? `Deletar "${removendo.nome}"? Usuários com estágios, turmas ou pareceres autorados não podem ser removidos (proteção de auditoria).`
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

function UsuarioFormModal({ editando, usuarioLogado, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState('aluno');
  const [ra, setRa] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setNome(editando.nome ?? '');
      setEmail(editando.email ?? '');
      setSenha('');
      setPapel(editando.papel ?? 'aluno');
      setRa(editando.ra ?? '');
      setNovaSenha('');
      setArquivo(null);
      setErro(null);
    }
  }, [editando]);

  const isEdit = !!editando?.id;
  const isSelfEdit = isEdit && editando.id === usuarioLogado.id;

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? usuariosApi.atualizar(editando.id, {
            nome,
            email,
            papel,
            ra: papel === 'aluno' ? ra : '',
            novaSenha,
            file: arquivo,
          })
        : usuariosApi.criar({ nome, email, senha, papel, ra, file: arquivo }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  function handleArquivo(e) {
    const f = e.target.files?.[0] ?? null;
    setErro(null);
    if (f && !['image/jpeg', 'image/png'].includes(f.type)) {
      setErro(`foto deve ser JPG ou PNG (recebido: ${f.type})`);
      setArquivo(null);
      return;
    }
    if (f && f.size > 2 * 1024 * 1024) {
      setErro(`foto muito grande (${(f.size / 1024 / 1024).toFixed(1)} MB; máximo 2 MB)`);
      setArquivo(null);
      return;
    }
    setArquivo(f);
  }

  // Validações básicas no front antes de chamar a API.
  const baseValido =
    nome.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    papel &&
    (papel !== 'aluno' || ra.trim().length > 0);
  const valido = isEdit
    ? baseValido && (!novaSenha || novaSenha.length >= 8)
    : baseValido && senha.length >= 8;

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar usuário' : 'Novo usuário'}>
      <form
        className={s.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={s.erro}>{erro}</div>}

        <Input
          id="u-nome"
          label="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <Input
          id="u-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!isEdit && (
          <Input
            id="u-senha"
            label="Senha (mín. 8 caracteres)"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        )}

        {isEdit && (
          <Input
            id="u-nova-senha"
            label="Nova senha (deixe em branco para manter a atual)"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="••••••••"
          />
        )}

        <div className={s.field}>
          <label htmlFor="u-papel" className={s.fieldLabel}>Papel</label>
          <select
            id="u-papel"
            className={s.select}
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            disabled={isSelfEdit && papel === 'coordenador'}
            required
          >
            <option value="aluno">aluno</option>
            <option value="orientador">orientador</option>
            <option value="coordenador">coordenador</option>
          </select>
          {isSelfEdit && papel === 'coordenador' && (
            <small style={{ color: 'var(--color-text-muted)' }}>
              Coordenador não pode rebaixar o próprio papel.
            </small>
          )}
        </div>

        {papel === 'aluno' && (
          <Input
            id="u-ra"
            label="RA"
            value={ra}
            onChange={(e) => setRa(e.target.value)}
            required
            placeholder="Ex.: 2026001"
          />
        )}

        <div className={s.field}>
          <label htmlFor="u-foto" className={s.fieldLabel}>
            Foto (opcional · JPG ou PNG, até 2 MB)
          </label>
          <input
            id="u-foto"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleArquivo}
          />
        </div>

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
