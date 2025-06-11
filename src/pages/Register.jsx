import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, getDoc, doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [condoName, setCondoName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Criar o usuário
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Atualizar o perfil do usuário
      await updateProfile(userCredential.user, { displayName: name });

      // 3. Criar documento do condomínio usando setDoc com ID conhecido
      const condominioRef = doc(db, "condominios", userCredential.user.uid);
      await setDoc(condominioRef, {
        userId: userCredential.user.uid,
        nome: condoName,
        celular: phone,
        email,
        createdAt: new Date().toISOString()
      });

      toast.success("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (err) {
      console.error("Erro durante o cadastro:", err);
      let errorMessage = "Erro ao cadastrar";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está em uso";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (err.code === "permission-denied") {
        errorMessage = "Erro de permissão ao criar registro";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Cadastro
        </Typography>
        <TextField
          label="Nome"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />
        <TextField
          label="Nome do Condomínio"
          fullWidth
          margin="normal"
          value={condoName}
          onChange={(e) => setCondoName(e.target.value)}
          disabled={loading}
          required
        />
        <TextField
          label="Celular"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          required
        />
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          type="email"
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
        <Button
          component={Link}
          to="/login"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          Voltar
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
