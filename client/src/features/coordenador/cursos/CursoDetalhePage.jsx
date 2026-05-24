import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as cursosApi from '../../../api/cursos.js';
import * as fasesApi from '../../../api/fases.js';
import * as tiposApi from '../../../api/tipos.js';
import Card from '../../../components/Card/Card.jsx';
import Button from '../../../components/Button/Button.jsx';
import Input from '../../../components/Input/Input.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import listStyles from '../listPage.module.css';
import s from './CursoDetalhePage.module.css';

export default function CursoDetalhePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const cursoKey = ['cursos', id];

  const { data: curso, isLoading, error } = useQuery({
    queryKey: cursoKey,
    queryFn: () => cursosApi.buscarPorId(id),
  });

  // Estado dos modais (uma única fonte de UI por tipo de ação)
  const [editandoFase, setEditandoFase] = useState(null);
  const [removendoFase, setRemovendoFase] = useState(null);
  const [editandoTipo, setEditandoTipo] = useState(null); // { faseId, id?, nome, obrigatorio }
  const [removendoTipo, setRemovendoTipo] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const reorderMutation = useMutation({
    mutationFn: (ordens) => fasesApi.reordenar(id, ordens),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cursoKey }),
    onError: (err) => setErroAcao(err.response?.data?.erro ?? 'falha ao reordenar'),
  });

  const removeFaseMutation = useMutation({
    mutationFn: (faseId) => fasesApi.remover(faseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursoKey });
      setRemovendoFase(null);
      setErroAcao(null);
    },
    onError: (err) => setErroAcao(err.response?.data?.erro ?? 'falha ao remover fase'),
  });

  const removeTipoMutation = useMutation({
    mutationFn: (tipoId) => tiposApi.remover(tipoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursoKey });
      setRemovendoTipo(null);
      setErroAcao(null);
    },
    onError: (err) => setErroAcao(err.response?.data?.erro ?? 'falha ao remover tipo'),
  });

  if (isLoading) return <Card>Carregando curso…</Card>;
  if (error) return <Card>Erro ao carregar curso.</Card>;

  // Troca a fase do índice `i` com o vizinho `dir` ('up' ou 'down').
  function mover(i, dir) {
    const fases = curso.fases;
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= fases.length) return;
    const a = fases[i], b = fases[j];
    reorderMutation.mutate([
      { id: a.id, ordem: b.ordem },
      { id: b.id, ordem: a.ordem },
    ]);
  }

  const proximaOrdem = (curso.fases?.at(-1)?.ordem ?? 0) + 1;

  return (
    <div className={listStyles.shell}>
      <div>
        <Link to="/coordenacao/cursos" className={s.voltar}>← Voltar para cursos</Link>
        <h1 className={listStyles.titulo}>{curso.nome}</h1>
        <p className={listStyles.subtitulo}>
          {curso.fases.length} fase(s) configurada(s).
        </p>
      </div>

      {erroAcao && <div className={listStyles.erro}>{erroAcao}</div>}

      {curso.fases.length === 0 ? (
        <Card><p className={s.semFases}>Nenhuma fase. Clica em "+ Nova fase" para começar.</p></Card>
      ) : (
        <div className={listStyles.cards} style={{ gridTemplateColumns: '1fr' }}>
          {curso.fases.map((fase, i) => (
            <Card key={fase.id}>
              <div className={s.faseHeader}>
                <h2 className={s.faseNome}>
                  {fase.nome}
                  <span className={s.ordem}>ordem {fase.ordem}</span>
                </h2>
                <div className={s.botoesIcone}>
                  <button
                    type="button"
                    className={s.iconeButton}
                    aria-label="Mover para cima"
                    disabled={i === 0 || reorderMutation.isPending}
                    onClick={() => mover(i, 'up')}
                  >↑</button>
                  <button
                    type="button"
                    className={s.iconeButton}
                    aria-label="Mover para baixo"
                    disabled={i === curso.fases.length - 1 || reorderMutation.isPending}
                    onClick={() => mover(i, 'down')}
                  >↓</button>
                  <Button variant="secondary" onClick={() => setEditandoFase(fase)}>Editar</Button>
                  <Button variant="danger" onClick={() => setRemovendoFase(fase)}>Deletar</Button>
                </div>
              </div>

              {fase.tipos?.length ? (
                <ul className={s.tiposLista} style={{ listStyle: 'none', padding: 0 }}>
                  {fase.tipos.map((tipo) => (
                    <li key={tipo.id} className={s.tipoLinha}>
                      <div className={s.tipoMeta}>
                        <span>{tipo.nome}</span>
                        <span className={`${s.badgeObrig} ${tipo.obrigatorio ? '' : s.badgeOpc}`}>
                          {tipo.obrigatorio ? 'obrigatório' : 'opcional'}
                        </span>
                      </div>
                      <div className={s.tipoAcoes}>
                        <button
                          type="button"
                          className={s.tipoButton}
                          onClick={() => setEditandoTipo({ ...tipo, faseId: fase.id })}
                        >Editar</button>
                        <button
                          type="button"
                          className={`${s.tipoButton} ${s.tipoButtonDanger}`}
                          onClick={() => setRemovendoTipo(tipo)}
                        >Deletar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={s.semTipos}>Nenhum tipo de documento ainda.</p>
              )}

              <div className={s.faseAcoes}>
                <Button
                  variant="secondary"
                  onClick={() => setEditandoTipo({ faseId: fase.id, nome: '', obrigatorio: true })}
                >
                  + Novo tipo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div>
        <Button onClick={() => setEditandoFase({ nome: '', ordem: proximaOrdem })}>
          + Nova fase
        </Button>
      </div>

      <FaseFormModal
        cursoId={id}
        editando={editandoFase}
        onClose={() => setEditandoFase(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: cursoKey });
          setEditandoFase(null);
        }}
      />

      <TipoFormModal
        editando={editandoTipo}
        onClose={() => setEditandoTipo(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: cursoKey });
          setEditandoTipo(null);
        }}
      />

      <ConfirmModal
        open={!!removendoFase}
        title="Remover fase"
        message={removendoFase ? `Deletar a fase "${removendoFase.nome}"? Não é possível se houver tipos de documento configurados.` : ''}
        confirmLabel="Deletar"
        loading={removeFaseMutation.isPending}
        error={erroAcao}
        onConfirm={() => removeFaseMutation.mutate(removendoFase.id)}
        onClose={() => { setRemovendoFase(null); setErroAcao(null); }}
      />

      <ConfirmModal
        open={!!removendoTipo}
        title="Remover tipo de documento"
        message={removendoTipo ? `Deletar "${removendoTipo.nome}"? Não é possível se já houver documentos enviados deste tipo (regra de imutabilidade do histórico).` : ''}
        confirmLabel="Deletar"
        loading={removeTipoMutation.isPending}
        error={erroAcao}
        onConfirm={() => removeTipoMutation.mutate(removendoTipo.id)}
        onClose={() => { setRemovendoTipo(null); setErroAcao(null); }}
      />
    </div>
  );
}

function FaseFormModal({ cursoId, editando, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setNome(editando.nome ?? '');
      setOrdem(editando.ordem ?? 1);
      setErro(null);
    }
  }, [editando]);

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? fasesApi.atualizar(editando.id, { nome })
        : fasesApi.criar(cursoId, { nome, ordem }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar fase' : 'Nova fase'}>
      <form
        className={listStyles.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={listStyles.erro}>{erro}</div>}
        <Input
          id="fase-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex.: Fase 1 — Plano"
        />
        {!isEdit && (
          <Input
            id="fase-ordem"
            label="Ordem"
            type="number"
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            min={1}
            required
          />
        )}
        <div className={listStyles.formActions}>
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

function TipoFormModal({ editando, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [obrigatorio, setObrigatorio] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (editando) {
      setNome(editando.nome ?? '');
      setObrigatorio(editando.obrigatorio ?? true);
      setErro(null);
    }
  }, [editando]);

  const isEdit = !!editando?.id;
  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? tiposApi.atualizar(editando.id, { nome, obrigatorio })
        : tiposApi.criar(editando.faseId, { nome, obrigatorio }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha ao salvar'),
  });

  return (
    <Modal open={!!editando} onClose={onClose} title={isEdit ? 'Editar tipo' : 'Novo tipo de documento'}>
      <form
        className={listStyles.form}
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        {erro && <div className={listStyles.erro}>{erro}</div>}
        <Input
          id="tipo-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex.: Plano de Estágio"
        />
        <label className={listStyles.checkboxField}>
          <input
            type="checkbox"
            checked={obrigatorio}
            onChange={(e) => setObrigatorio(e.target.checked)}
          />
          Documento obrigatório para fechar a fase
        </label>
        <div className={listStyles.formActions}>
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
