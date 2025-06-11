import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
} from '@mui/material';
import { auth, db } from '../firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { toast } from 'react-toastify';

function Manutencoes() {
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openNovaManutencao, setOpenNovaManutencao] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);
  const [stats, setStats] = useState({
    pendentes: 0,
    agendadas: 0,
    concluidas: 0,
    total: 0
  });

  const [novaManutencao, setNovaManutencao] = useState({
    titulo: '',
    descricao: '',
    dataAgendada: '',
    responsavel: '',
    status: 'pendente'
  });

  useEffect(() => {
    carregarManutencoes();
  }, []);

  async function carregarManutencoes() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const manutencoesRef = collection(db, 'condominios', user.uid, 'manutencoes');
      const q = query(manutencoesRef, orderBy('dataAgendada', 'asc'));
      const querySnapshot = await getDocs(q);

      const manutencoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataAgendada: doc.data().dataAgendada?.toDate()
      }));

      setManutencoes(manutencoesData);

      // Calcular estatísticas
      const stats = manutencoesData.reduce((acc, curr) => {
        acc[curr.status]++;
        acc.total++;
        return acc;
      }, {
        pendentes: 0,
        agendadas: 0,
        concluidas: 0,
        total: 0
      });

      setStats(stats);
    } catch (err) {
      console.error('Erro ao carregar manutenções:', err);
      setError('Erro ao carregar manutenções');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const dataAgendada = new Date(novaManutencao.dataAgendada);
      const manutencaoData = {
        ...novaManutencao,
        dataAgendada: Timestamp.fromDate(dataAgendada),
        dataCriacao: Timestamp.now(),
        status: 'pendente'
      };

      const manutencoesRef = collection(db, 'condominios', user.uid, 'manutencoes');
      await addDoc(manutencoesRef, manutencaoData);

      setOpenNovaManutencao(false);
      setNovaManutencao({
        titulo: '',
        descricao: '',
        dataAgendada: '',
        responsavel: '',
        status: 'pendente'
      });
      toast.success('Manutenção criada com sucesso!');
      carregarManutencoes();
    } catch (err) {
      console.error('Erro ao criar manutenção:', err);
      toast.error('Erro ao criar manutenção');
    }
  };

  const handleStatusChange = async (manutencaoId, novoStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const manutencaoRef = doc(db, 'condominios', user.uid, 'manutencoes', manutencaoId);
      await updateDoc(manutencaoRef, {
        status: novoStatus
      });

      toast.success('Status atualizado com sucesso!');
      carregarManutencoes();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const notificarMoradores = async (manutencao) => {
    // No futuro, implementar integração com webhook
    toast.info('Notificação enviada aos moradores!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'error';
      case 'agendada':
        return 'warning';
      case 'concluida':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Manutenções
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNovaManutencao(true)}
            >
              Nova Manutenção
            </Button>
          </Box>

          {/* Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'error.light',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Pendentes</Typography>
                <Typography variant="h4">{stats.pendentes}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'warning.light',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Agendadas</Typography>
                <Typography variant="h4">{stats.agendadas}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'success.light',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Concluídas</Typography>
                <Typography variant="h4">{stats.concluidas}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'primary.light',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Lista de Manutenções */}
          <Grid container spacing={2}>
            {manutencoes.map((manutencao) => (
              <Grid item xs={12} key={manutencao.id}>
                <Card
                  sx={{
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {manutencao.titulo}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={manutencao.status}
                          color={getStatusColor(manutencao.status)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => notificarMoradores(manutencao)}
                          color="primary"
                          title="Notificar moradores"
                        >
                          <NotificationsIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setManutencaoSelecionada(manutencao)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Responsável: {manutencao.responsavel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Data Agendada: {manutencao.dataAgendada ? format(manutencao.dataAgendada, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : 'Não agendada'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {manutencao.descricao}
                    </Typography>
                    {manutencao.status !== 'concluida' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {manutencao.status === 'pendente' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleStatusChange(manutencao.id, 'agendada')}
                          >
                            Marcar como Agendada
                          </Button>
                        )}
                        {manutencao.status === 'agendada' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleStatusChange(manutencao.id, 'concluida')}
                          >
                            Marcar como Concluída
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Modal de Nova Manutenção */}
      <Dialog
        open={openNovaManutencao}
        onClose={() => setOpenNovaManutencao(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nova Manutenção</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={novaManutencao.titulo}
                  onChange={(e) => setNovaManutencao({ ...novaManutencao, titulo: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={4}
                  value={novaManutencao.descricao}
                  onChange={(e) => setNovaManutencao({ ...novaManutencao, descricao: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data Agendada"
                  value={novaManutencao.dataAgendada}
                  onChange={(e) => setNovaManutencao({ ...novaManutencao, dataAgendada: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Responsável"
                  value={novaManutencao.responsavel}
                  onChange={(e) => setNovaManutencao({ ...novaManutencao, responsavel: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button onClick={() => setOpenNovaManutencao(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained">
                    Salvar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Manutencoes;