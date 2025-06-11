import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NovaReclamacao from '../components/NovaReclamacao';
import DetalhesReclamacao from '../components/DetalhesReclamacao';
import AddIcon from '@mui/icons-material/Add';

function Reclamacoes() {
  const [condoName, setCondoName] = useState('');
  const [reclamacoes, setReclamacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroApartamento, setFiltroApartamento] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    novas: 0,
    emAndamento: 0,
    respondidas: 0
  });
  const [openNovaReclamacao, setOpenNovaReclamacao] = useState(false);
  const [reclamacaoSelecionada, setReclamacaoSelecionada] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFiltroStatus(statusParam);
    }
  }, [location]);

  useEffect(() => {
    async function fetchReclamacoes() {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }

        const reclamacoesRef = collection(db, 'condominios', user.uid, 'reclamacoes');

        // Primeiro, buscar todas as reclamações para estatísticas
        const novasQuery = await getDocs(query(reclamacoesRef, where('status', '==', 'nova')));
        const andamentoQuery = await getDocs(query(reclamacoesRef, where('status', '==', 'em andamento')));
        const respondidasQuery = await getDocs(query(reclamacoesRef, where('status', '==', 'respondida')));

        setStats({
          novas: novasQuery.size,
          emAndamento: andamentoQuery.size,
          respondidas: respondidasQuery.size,
          total: novasQuery.size + andamentoQuery.size + respondidasQuery.size
        });

        // Agora, buscar as reclamações filtradas
        let q = query(reclamacoesRef, orderBy('dataCriacao', 'desc'));

        if (filtroStatus) {
          q = query(q, where('status', '==', filtroStatus));
        }
        if (filtroApartamento) {
          q = query(q, where('apartamento', '==', filtroApartamento));
        }
        if (filtroData) {
          const dataFiltro = new Date(filtroData);
          dataFiltro.setHours(0, 0, 0, 0);
          const dataFimFiltro = new Date(filtroData);
          dataFimFiltro.setHours(23, 59, 59, 999);
          q = query(q, where('dataCriacao', '>=', dataFiltro), where('dataCriacao', '<=', dataFimFiltro));
        }

        const querySnapshot = await getDocs(q);
        const reclamacoesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dataCriacao: doc.data().dataCriacao.toDate()
        }));

        setReclamacoes(reclamacoesData);
      } catch (err) {
        console.error('Erro ao buscar reclamações:', err);
        setError('Erro ao carregar reclamações');
      } finally {
        setLoading(false);
      }
    }

    fetchReclamacoes();
  }, [filtroStatus, filtroData, filtroApartamento]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'nova':
        return 'error';
      case 'em andamento':
        return 'warning';
      case 'respondida':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleVerDetalhes = (reclamacao) => {
    setReclamacaoSelecionada(reclamacao);
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar condoName={condoName} />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar condoName={condoName} />
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
              Reclamações
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNovaReclamacao(true)}
            >
              Nova Reclamação
            </Button>
          </Box>

          {/* Resumo de Estatísticas */}
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
                <Typography variant="h6">Novas</Typography>
                <Typography variant="h4">{stats.novas}</Typography>
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
                <Typography variant="h6">Em Andamento</Typography>
                <Typography variant="h4">{stats.emAndamento}</Typography>
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
                <Typography variant="h6">Respondidas</Typography>
                <Typography variant="h4">{stats.respondidas}</Typography>
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

          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="nova">Nova</MenuItem>
                <MenuItem value="em andamento">Em Andamento</MenuItem>
                <MenuItem value="respondida">Respondida</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                fullWidth
                label="Data"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Apartamento"
                value={filtroApartamento}
                onChange={(e) => setFiltroApartamento(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Lista de Reclamações */}
          <Grid container spacing={2}>
            {loading ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Carregando...</Typography>
                </Paper>
              </Grid>
            ) : reclamacoes.length > 0 ? (
              reclamacoes.map((reclamacao) => (
                <Grid item xs={12} key={reclamacao.id}>
                  <Card
                    sx={{
                      display: 'flex',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  >
                    {reclamacao.imagemUrl && (
                      <CardMedia
                        component="img"
                        sx={{
                          width: 200,
                          height: 200,
                          objectFit: 'cover',
                        }}
                        image={reclamacao.imagemUrl}
                        alt="Imagem da reclamação"
                      />
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            Apartamento {reclamacao.apartamento}
                          </Typography>
                          <Box>
                            <Chip
                              label={reclamacao.status}
                              color={getStatusColor(reclamacao.status)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalhes(reclamacao)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {format(reclamacao.dataCriacao, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {reclamacao.descricao}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Nenhuma reclamação encontrada com os filtros selecionados.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Modal de Nova Reclamação */}
      <Dialog
        open={openNovaReclamacao}
        onClose={() => setOpenNovaReclamacao(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nova Reclamação</DialogTitle>
        <DialogContent>
          <NovaReclamacao
            onClose={() => setOpenNovaReclamacao(false)}
            onSuccess={() => {
              setOpenNovaReclamacao(false);
              window.location.reload();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Reclamação */}
      <Dialog
        open={Boolean(reclamacaoSelecionada)}
        onClose={() => setReclamacaoSelecionada(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes da Reclamação</DialogTitle>
        <DialogContent>
          {reclamacaoSelecionada && (
            <DetalhesReclamacao
              reclamacao={reclamacaoSelecionada}
              onClose={() => setReclamacaoSelecionada(null)}
              onSuccess={() => {
                setReclamacaoSelecionada(null);
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Reclamacoes;