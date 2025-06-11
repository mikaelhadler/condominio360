import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
import { auth } from '../firebase';
import {
  buscarConfiguracaoPagamento,
  salvarConfiguracaoPagamento,
} from '../services/pagamentoService';
import { toast } from 'react-toastify';

function ConfiguracaoPagamento() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    valorPadrao: 0,
    diaVencimento: 10,
    pixKey: '',
    pixType: 'cpf',
    webhookUrl: '',
  });

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  async function carregarConfiguracao() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const configData = await buscarConfiguracaoPagamento(user.uid);
      setConfig(configData);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração de pagamentos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      await salvarConfiguracaoPagamento(user.uid, config);
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Configurações de Pagamento
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Valor Padrão da Taxa (R$)"
              type="number"
              value={config.valorPadrao}
              onChange={(e) =>
                setConfig({ ...config, valorPadrao: Number(e.target.value) })
              }
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dia do Vencimento"
              type="number"
              value={config.diaVencimento}
              onChange={(e) =>
                setConfig({ ...config, diaVencimento: Number(e.target.value) })
              }
              InputProps={{ inputProps: { min: 1, max: 31 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Chave PIX</InputLabel>
              <Select
                value={config.pixType}
                onChange={(e) =>
                  setConfig({ ...config, pixType: e.target.value })
                }
                label="Tipo de Chave PIX"
              >
                <MenuItem value="cpf">CPF</MenuItem>
                <MenuItem value="cnpj">CNPJ</MenuItem>
                <MenuItem value="email">E-mail</MenuItem>
                <MenuItem value="telefone">Telefone</MenuItem>
                <MenuItem value="aleatoria">Chave Aleatória</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Chave PIX"
              value={config.pixKey}
              onChange={(e) =>
                setConfig({ ...config, pixKey: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL do Webhook (Opcional)"
              value={config.webhookUrl}
              onChange={(e) =>
                setConfig({ ...config, webhookUrl: e.target.value })
              }
              helperText="URL para receber notificações de pagamento"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Salvar Configurações
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default ConfiguracaoPagamento;