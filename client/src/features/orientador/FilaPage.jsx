import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarFila } from '../../api/documentos.js';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import ParecerForm from './ParecerForm.jsx';
import styles from './FilaPage.module.css';

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FilaPage() {
  const { data: fila, isLoading, error } = useQuery({
    queryKey: ['fila'],
    queryFn: () => listarFila('enviado'),
  });

  // Estado do modal: o documento selecionado e a decisão (aprovado/reprovado)
  // que o orientador escolheu ao clicar no botão.
  const [selecao, setSelecao] = useState({ documento: null, decisao: null });

  if (isLoading) return <Card>Carregando fila…</Card>;
  if (error) return <Card>Erro ao carregar fila de análise.</Card>;

  return (
    <div className={styles.shell}>
      <div>
        <h1 className={styles.titulo}>Fila de análise</h1>
        <p className={styles.subtitulo}>
          {fila.length === 0
            ? 'Nenhum documento aguardando análise no momento.'
            : `${fila.length} documento(s) aguardando análise (mais antigos primeiro).`}
        </p>
      </div>

      {fila.length > 0 && (
        <div className={styles.lista}>
          {fila.map((doc) => (
            <Card key={doc.id}>
              <div className={styles.item}>
                <div className={styles.linhaPrincipal}>
                  <div>
                    <h2 className={styles.aluno}>{doc.estagio.aluno.nome}</h2>
                    <span className={styles.alunoMeta}>
                      RA {doc.estagio.aluno.ra} · turma {doc.estagio.turma.periodo}
                    </span>
                  </div>
                  <div className={styles.acoes}>
                    <Button
                      onClick={() => setSelecao({ documento: doc, decisao: 'aprovado' })}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setSelecao({ documento: doc, decisao: 'reprovado' })}
                    >
                      Reprovar
                    </Button>
                  </div>
                </div>
                <div className={styles.tipoLabel}>
                  {doc.tipoDocumento.nome}
                  <span className={styles.versao}>v{doc.versao}</span>
                </div>
                <div className={styles.metadados}>
                  <span>Enviado em {formatarData(doc.enviadoEm)}</span>
                  <a className={styles.link} href={doc.arquivoUrl} target="_blank" rel="noreferrer">
                    Ver arquivo
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ParecerForm
        documento={selecao.documento}
        decisao={selecao.decisao}
        onClose={() => setSelecao({ documento: null, decisao: null })}
      />
    </div>
  );
}
