import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function Dashboard() {
  const [condoName, setCondoName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCondo() {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }

        // Buscar o documento diretamente usando o ID do usuário
        const condoRef = doc(db, 'condominios', user.uid);
        const condoDoc = await getDoc(condoRef);

        if (condoDoc.exists()) {
          setCondoName(condoDoc.data().nome);
        } else {
          setError('Dados do condomínio não encontrados');
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados do condomínio');
      } finally {
        setLoading(false);
      }
    }

    fetchCondo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return <Container sx={{ mt: 4 }}>Carregando...</Container>;
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button onClick={handleLogout} variant="contained" color="primary">
          Voltar para Login
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            Bem-vindo ao condomínio {condoName}
          </Typography>
        </Grid>
        <Grid item>
          <Button onClick={handleLogout} variant="outlined" color="primary">
            Sair
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Reclamações</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Manutenções Futuras</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Inadimplentes</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item>
          <Button component={Link} to="/reclamacoes" variant="contained">
            Reclamações
          </Button>
        </Grid>
        <Grid item>
          <Button component={Link} to="/manutencoes" variant="contained">
            Manutenções
          </Button>
        </Grid>
        <Grid item>
          <Button component={Link} to="/inadimplentes" variant="contained">
            Inadimplentes
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;