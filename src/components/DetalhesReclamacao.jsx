import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  MenuItem,
  Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function DetalhesReclamacao({ reclamacao, onClose, onSuccess }) {
  const [resposta, setResposta] = useState(reclamacao.resposta || '');
  const [status, setStatus] = useState(reclamacao.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const reclamacaoRef = doc(db, 'condominios', user.uid, 'reclamacoes', reclamacao.id);
      await updateDoc(reclamacaoRef, {
        resposta,
        status,
        dataResposta: new Date(),
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar reclamação:', error);
      setError('Erro ao atualizar reclamação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Detalhes da Reclamação
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Apartamento
              </Typography>
              <Typography variant="body1">{reclamacao.apartamento}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Categoria
              </Typography>
              <Typography variant="body1">{reclamacao.categoria}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Data
              </Typography>
              <Typography variant="body1">
                {format(reclamacao.dataCriacao, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {reclamacao.status}
              </Typography>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Descrição
            </Typography>
            <Typography variant="body1" paragraph>
              {reclamacao.descricao}
            </Typography>
          </Box>

          {reclamacao.fotoUrl && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Foto
              </Typography>
              <Box
                component="img"
                src={reclamacao.fotoUrl}
                alt="Foto da reclamação"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Resposta da Administração
            </Typography>

            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="nova">Nova</MenuItem>
              <MenuItem value="em andamento">Em Andamento</MenuItem>
              <MenuItem value="respondida">Respondida</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Resposta"
              multiline
              rows={4}
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              error={!!error}
              helperText={error}
            />

            <DialogActions sx={{ px: 0, mt: 2 }}>
              <Button onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Salvando...' : 'Salvar Resposta'}
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </DialogContent>
    </Box>
  );
}

export default DetalhesReclamacao;