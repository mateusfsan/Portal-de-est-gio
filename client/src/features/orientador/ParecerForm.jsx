import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { darParecer } from '../../api/documentos.js';
import Modal from '../../components/Modal/Modal.jsx';
import Button from '../../components/Button/Button.jsx';
import Input from '../../components/Input/Input.jsx';

const MIN_COMENTARIO = 3;

/**
 * Form de parecer (aprovar ou reprovar). Recebe um documento da fila
 * e a `decisao` pré-escolhida pelo botão clicado.
 *
 * @param {{
 *   documento: object | null,
 *   decisao: 'aprovado' | 'reprovado' | null,
 *   onClose: () => void,
 * }} props
 */
export default function ParecerForm({ documento, decisao, onClose }) {
  const [comentario, setComentario] = useState('');
  const [erroInline, setErroInline] = useState(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => darParecer({ documentoId: documento.id, decisao, comentario }),
    onSuccess: () => {
      // Item sai da fila; se o aluno estiver olhando o próprio perfil
      // em outra aba, refletirá no próximo refetch.
      queryClient.invalidateQueries({ queryKey: ['fila'] });
      setComentario('');
      setErroInline(null);
      onClose();
    },
    onError: (err) => setErroInline(err.response?.data?.erro ?? 'falha ao enviar parecer'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (comentario.trim().length < MIN_COMENTARIO) {
      setErroInline(`comentário deve ter pelo menos ${MIN_COMENTARIO} caracteres`);
      return;
    }
    mutation.mutate();
  }

  function handleClose() {
    setComentario('');
    setErroInline(null);
    onClose();
  }

  const titulo =
    decisao === 'aprovado' ? 'Aprovar documento' : 'Reprovar documento';
  const labelBotao = decisao === 'aprovado' ? 'Confirmar aprovação' : 'Confirmar reprovação';
  const variantBotao = decisao === 'aprovado' ? 'primary' : 'danger';

  return (
    <Modal open={!!(documento && decisao)} onClose={handleClose} title={titulo}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {erroInline && (
          <div
            style={{
              backgroundColor: 'var(--status-reprovado-bg)',
              color: 'var(--status-reprovado-text)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {erroInline}
          </div>
        )}
        <Input
          id="comentario"
          label="Comentário (obrigatório)"
          as="textarea"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={
            decisao === 'aprovado'
              ? 'Ex.: documento conforme, sem ressalvas.'
              : 'Ex.: falta a assinatura do supervisor na página 2.'
          }
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="secondary" onClick={handleClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant={variantBotao} disabled={mutation.isPending}>
            {mutation.isPending ? 'Enviando…' : labelBotao}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
