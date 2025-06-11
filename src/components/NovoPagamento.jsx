import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { auth } from '../firebase';
import {
  buscarConfiguracaoPagamento,
  registrarPagamento,
} from '../services/pagamentoService';
import { toast } from 'react-toastify';

function NovoPagamento({ morador, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState(null);
  const [pagamento, setPagamento] = useState({
    valor: 0,
    metodoPagamento: 'pix',
    observacao: '',
  });

  useEffect(() => {
    if (open && morador) {
      carregarConfiguracao();
    }
  }, [open, morador]);

  async function carregarConfiguracao() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const configData = await buscarConfiguracaoPagamento(user.uid);
      setConfig(configData);
      setPagamento(prev => ({
        ...prev,
        valor: configData.valorPadrao
      }));
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração de pagamentos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!morador || !config) return;

    try {
      setSubmitting(true);
      const user = auth.currentUser;
      if (!user) return;

      const hoje = new Date();
      const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), config.diaVencimento);

      await registrarPagamento(user.uid, {
        moradorId: morador.id,
        valor: pagamento.valor,
        metodoPagamento: pagamento.metodoPagamento,
        observacao: pagamento.observacao,
        status: 'confirmado',
        dataPagamento: hoje,
        dataVencimento,
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear()
      });

      toast.success('Pagamento registrado com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    } finally {
      setSubmitting(false);
    }
  }

  if (!morador) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Novo Pagamento - Apto {morador.apartamento}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valor (R$)"
                  type="number"
                  value={pagamento.valor}
                  onChange={(e) =>
                    setPagamento({ ...pagamento, valor: Number(e.target.value) })
                  }
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Método de Pagamento</InputLabel>
                  <Select
                    value={pagamento.metodoPagamento}
                    onChange={(e) =>
                      setPagamento({ ...pagamento, metodoPagamento: e.target.value })
                    }
                    label="Método de Pagamento"
                  >
                    <MenuItem value="pix">PIX</MenuItem>
                    <MenuItem value="boleto">Boleto</MenuItem>
                    <MenuItem value="transferencia">Transferência</MenuItem>
                    <MenuItem value="dinheiro">Dinheiro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {pagamento.metodoPagamento === 'pix' && config?.pixKey && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Chave PIX: {config.pixKey}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tipo: {config.pixType}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observação"
                  multiline
                  rows={3}
                  value={pagamento.observacao}
                  onChange={(e) =>
                    setPagamento({ ...pagamento, observacao: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || submitting || !pagamento.valor}
          >
            {submitting ? 'Registrando...' : 'Registrar Pagamento'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default NovoPagamento;