import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [condoName, setCondoName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    reclamacoesNovas: 0,
    reclamacoesEmAndamento: 0,
    reclamacoesRespondidas: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }

        // Buscar dados do condomínio
        const condoRef = doc(db, 'condominios', user.uid);
        const condoDoc = await getDoc(condoRef);
        if (condoDoc.exists()) {
          setCondoName(condoDoc.data().nome);
        }

        // Buscar estatísticas de reclamações
        const reclamacoesRef = collection(db, 'condominios', user.uid, 'reclamacoes');

        // Reclamações novas
        const novasQuery = query(reclamacoesRef, where('status', '==', 'nova'));
        const novasSnapshot = await getDocs(novasQuery);

        // Reclamações em andamento
        const andamentoQuery = query(reclamacoesRef, where('status', '==', 'em andamento'));
        const andamentoSnapshot = await getDocs(andamentoQuery);

        // Reclamações respondidas
        const respondidasQuery = query(reclamacoesRef, where('status', '==', 'respondida'));
        const respondidasSnapshot = await getDocs(respondidasQuery);

        setStats({
          reclamacoesNovas: novasSnapshot.size,
          reclamacoesEmAndamento: andamentoSnapshot.size,
          reclamacoesRespondidas: respondidasSnapshot.size,
        });

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados do condomínio');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCardClick = (status = '') => {
    navigate(`/reclamacoes${status ? `?status=${status}` : ''}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar condoName={condoName} />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </Box>
    );
  }

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
          <Typography
            variant="h4"
            sx={{
              mb: 6,
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            Visão Geral
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: '0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                    bgcolor: 'error.light',
                    '& .MuiTypography-root': {
                      color: 'white',
                    },
                  },
                }}
                onClick={() => handleCardClick('nova')}
              >
                <Typography variant="h6" color="error" gutterBottom>
                  Novas Reclamações
                </Typography>
                <Typography variant="h3" color="error" sx={{ my: 3 }}>
                  {stats.reclamacoesNovas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reclamações aguardando análise
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: '0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                    bgcolor: 'warning.light',
                    '& .MuiTypography-root': {
                      color: 'white',
                    },
                  },
                }}
                onClick={() => handleCardClick('em andamento')}
              >
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Em Andamento
                </Typography>
                <Typography variant="h3" color="warning.main" sx={{ my: 3 }}>
                  {stats.reclamacoesEmAndamento}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reclamações sendo tratadas
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: '0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                    bgcolor: 'success.light',
                    '& .MuiTypography-root': {
                      color: 'white',
                    },
                  },
                }}
                onClick={() => handleCardClick('respondida')}
              >
                <Typography variant="h6" color="success.main" gutterBottom>
                  Respondidas
                </Typography>
                <Typography variant="h3" color="success.main" sx={{ my: 3 }}>
                  {stats.reclamacoesRespondidas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reclamações finalizadas
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 4 }}>
              Atividades Recentes
            </Typography>
            <Paper sx={{ p: 4 }}>
              <Typography color="text.secondary">
                Nenhuma atividade recente para exibir.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;