import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado');
      navigate('/login');
    } catch (err) {
      toast.error('Erro ao enviar email');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Recuperar Senha</Typography>
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Enviar</Button>
        <Button component={Link} to="/login" fullWidth sx={{ mt: 2 }}>Voltar</Button>
      </Box>
    </Container>
  );
}

export default ResetPassword;
