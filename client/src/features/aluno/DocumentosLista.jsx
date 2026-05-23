import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listarPorEstagio, upload } from '../../api/documentos.js';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import styles from './DocumentosLista.module.css';

const MIMES_OK = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const TAMANHO_MAX_MB = 10;

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DocumentosLista({ estagioId }) {
  const queryClient = useQueryClient();
  const [tipoEnvio, setTipoEnvio] = useState(null); // { id, nome } quando modal aberto

  const { data: porTipo, isLoading, error } = useQuery({
    queryKey: ['documentos', 'estagio', estagioId],
    queryFn: () => listarPorEstagio(estagioId),
    enabled: !!estagioId,
  });

  if (isLoading) return <Card>Carregando documentos…</Card>;
  if (error) return <Card>Erro ao carregar documentos.</Card>;
  if (!porTipo?.length) return <Card>Este curso ainda não tem tipos de documento configurados.</Card>;

  return (
    <>
      <div className={styles.lista}>
        {porTipo.map((p) => (
          <TipoCard
            key={p.tipoDocumento.id}
            tipo={p.tipoDocumento}
            versoes={p.versoes}
            onEnviar={() => setTipoEnvio(p.tipoDocumento)}
          />
        ))}
      </div>

      <UploadModal
        tipo={tipoEnvio}
        estagioId={estagioId}
        onClose={() => setTipoEnvio(null)}
        onSuccess={() => {
          // Invalidar tudo que muda com um novo upload:
          // - lista de documentos do estágio (nova versão aparece)
          // - fase atual (envio sozinho não muda, mas aprovação subsequente sim,
          //   então fica consistente quando o orientador atuar)
          queryClient.invalidateQueries({ queryKey: ['documentos', 'estagio', estagioId] });
          queryClient.invalidateQueries({ queryKey: ['estagios', estagioId, 'fase-atual'] });
          setTipoEnvio(null);
        }}
      />
    </>
  );
}

function TipoCard({ tipo, versoes, onEnviar }) {
  const ultima = versoes[0]; // já vem em ordem desc
  const podeEnviar = !ultima || ultima.status === 'reprovado';
  const statusBadge = ultima ? ultima.status : 'pendente';

  return (
    <Card>
      <div className={styles.tipoHeader}>
        <h3 className={styles.tipoNome}>
          {tipo.nome}
          <span className={`${styles.obrigatorio} ${tipo.obrigatorio ? '' : styles.opcional}`}>
            {tipo.obrigatorio ? 'obrigatório' : 'opcional'}
          </span>
        </h3>
        <StatusBadge status={statusBadge} />
      </div>

      {versoes.length === 0 ? (
        <p className={styles.semVersoes}>Nenhuma versão enviada ainda.</p>
      ) : (
        <ul className={styles.versoes} style={{ listStyle: 'none', padding: 0 }}>
          {versoes.map((v) => (
            <li key={v.id}>
              <div className={styles.versao}>
                <span className={styles.versaoLabel}>v{v.versao}</span>
                <StatusBadge status={v.status} />
                <span className={styles.versaoMeta}>{formatarData(v.enviadoEm)}</span>
                <a className={styles.link} href={v.arquivoUrl} target="_blank" rel="noreferrer">
                  ver arquivo
                </a>
              </div>
              {v.pareceres?.[0] && (
                <div
                  className={`${styles.parecer} ${
                    v.pareceres[0].decisao === 'aprovado' ? styles.parecerAprovado : ''
                  }`}
                >
                  <span className={styles.parecerAutor}>
                    {v.pareceres[0].autor.nome}:
                  </span>
                  <span className={styles.parecerComentario}>{v.pareceres[0].comentario}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {podeEnviar && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button onClick={onEnviar}>
            {versoes.length === 0 ? 'Enviar documento' : 'Reenviar (nova versão)'}
          </Button>
        </div>
      )}
    </Card>
  );
}

function UploadModal({ tipo, estagioId, onClose, onSuccess }) {
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState(null);

  const mutation = useMutation({
    mutationFn: () => upload({ estagioId, tipoDocumentoId: tipo.id, file: arquivo }),
    onSuccess,
    onError: (err) => setErro(err.response?.data?.erro ?? 'falha no upload'),
  });

  function handleSelect(e) {
    const f = e.target.files?.[0];
    setErro(null);
    if (!f) return setArquivo(null);
    if (!MIMES_OK.has(f.type)) {
      setErro(`tipo de arquivo não permitido (${f.type}). Aceitos: PDF, JPG, PNG.`);
      setArquivo(null);
      return;
    }
    if (f.size > TAMANHO_MAX_MB * 1024 * 1024) {
      setErro(`arquivo muito grande (${(f.size / 1024 / 1024).toFixed(1)} MB). Máximo: ${TAMANHO_MAX_MB} MB.`);
      setArquivo(null);
      return;
    }
    setArquivo(f);
  }

  return (
    <Modal open={!!tipo} onClose={onClose} title={tipo ? `Enviar: ${tipo.nome}` : ''}>
      <div className={styles.modalCorpo}>
        {erro && <div className={styles.modalErro}>{erro}</div>}
        <input
          type="file"
          accept=".pdf,image/jpeg,image/png"
          onChange={handleSelect}
        />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Aceitos: PDF, JPG, PNG. Até {TAMANHO_MAX_MB} MB.
        </p>
        <div className={styles.modalAcoes}>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!arquivo || mutation.isPending}
          >
            {mutation.isPending ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
