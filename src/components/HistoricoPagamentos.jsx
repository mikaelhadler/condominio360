import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth } from '../firebase';
import { buscarPagamentosPorMorador } from '../services/pagamentoService';
import { toast } from 'react-toastify';

function HistoricoPagamentos({ morador, open, onClose }) {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && morador) {
      carregarHistorico();
    }
  }, [open, morador]);

  async function carregarHistorico() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !morador) return;

      const historico = await buscarPagamentosPorMorador(user.uid, morador.id);
      setPagamentos(historico);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de pagamentos');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'atrasado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'atrasado':
        return 'Atrasado';
      default:
        return status;
    }
  };

  if (!morador) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Histórico de Pagamentos - Apto {morador.apartamento}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Observação</TableCell>
                  <TableCell>Comprovante</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum pagamento registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentos.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell>
                        {format(pagamento.dataPagamento.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {pagamento.valor
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(pagamento.valor)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(pagamento.status)}
                          color={getStatusColor(pagamento.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {pagamento.observacao || '-'}
                      </TableCell>
                      <TableCell>
                        {pagamento.comprovanteUrl ? (
                          <IconButton
                            size="small"
                            onClick={() => window.open(pagamento.comprovanteUrl, '_blank')}
                            title="Ver comprovante"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HistoricoPagamentos;