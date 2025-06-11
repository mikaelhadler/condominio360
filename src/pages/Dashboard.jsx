import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Dashboard() {
  const [condoName, setCondoName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCondo() {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, 'condominios'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCondoName(snapshot.docs[0].data().nome);
      }
      setLoading(false);
    }

    fetchCondo();
  }, []);

  if (loading) {
    return <Container sx={{ mt: 4 }}>Carregando...</Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao condomínio {condoName}
      </Typography>
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
