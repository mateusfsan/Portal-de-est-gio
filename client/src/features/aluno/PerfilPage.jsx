import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth.jsx';
import { listarMeus } from '../../api/estagios.js';
import Card from '../../components/Card/Card.jsx';
import Avatar from '../../components/Avatar/Avatar.jsx';
import FaseAtualCard from './FaseAtualCard.jsx';
import DocumentosLista from './DocumentosLista.jsx';
import styles from './PerfilPage.module.css';

export default function PerfilPage() {
  const { usuario } = useAuth();
  const { data: estagios, isLoading, error } = useQuery({
    queryKey: ['estagios', 'meus'],
    queryFn: listarMeus,
  });

  if (isLoading) return <Card>Carregando seus estágios…</Card>;
  if (error) return <Card>Erro ao carregar estágios.</Card>;

  // Caso o aluno ainda não tenha estágio criado pelo coordenador.
  if (!estagios?.length) {
    return (
      <div className={styles.shell}>
        <Card>
          <div className={styles.cabecalho}>
            <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} size="lg" />
            <div>
              <h1 className={styles.nome}>{usuario.nome}</h1>
              <div className={styles.metadados}>
                <span>{usuario.email}</span>
                {usuario.ra && <span>RA {usuario.ra}</span>}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <p className={styles.vazio}>
            Você ainda não foi matriculado em nenhum estágio. Procure a
            coordenação.
          </p>
        </Card>
      </div>
    );
  }

  // Caso comum: 1 estágio. Para múltiplos, mostraríamos seletor — fora do
  // escopo desta sub-etapa, usamos o primeiro.
  const estagio = estagios[0];

  return (
    <div className={styles.shell}>
      <Card>
        <div className={styles.cabecalho}>
          <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} size="lg" />
          <div>
            <h1 className={styles.nome}>{usuario.nome}</h1>
            <div className={styles.metadados}>
              <span>{usuario.email}</span>
              {usuario.ra && <span>RA {usuario.ra}</span>}
              <span>
                {estagio.turma.curso.nome} — turma {estagio.turma.periodo}
              </span>
              <span>Estágio na {estagio.empresa.razaoSocial}</span>
            </div>
          </div>
        </div>
      </Card>

      <FaseAtualCard estagioId={estagio.id} />

      <h2 className={styles.tituloSecao}>Documentos</h2>
      <DocumentosLista estagioId={estagio.id} />
    </div>
  );
}
