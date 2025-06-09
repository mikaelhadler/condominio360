import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso');
      navigate('/');
    } catch (err) {
      toast.error('Erro ao efetuar login');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Senha" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Entrar</Button>
        <Button component={Link} to="/register" fullWidth sx={{ mt: 2 }}>Cadastrar</Button>
        <Button component={Link} to="/reset" fullWidth sx={{ mt: 2 }}>Esqueci a senha</Button>
      </Box>
    </Container>
  );
}

export default Login;
