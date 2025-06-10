import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [condoName, setCondoName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await addDoc(collection(db, 'condominios'), {
        userId: userCredential.user.uid,
        nome: condoName,
        celular: phone,
        email
      });
      toast.success('Cadastro realizado');
      navigate('/');
    } catch (err) {
      toast.error('Erro ao cadastrar');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Cadastro</Typography>
        <TextField label="Nome" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Nome do Condomínio" fullWidth margin="normal" value={condoName} onChange={(e) => setCondoName(e.target.value)} />
        <TextField label="Celular" fullWidth margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Senha" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Cadastrar</Button>
        <Button component={Link} to="/login" fullWidth sx={{ mt: 2 }}>Voltar</Button>
      </Box>
    </Container>
  );
}

export default Register;
