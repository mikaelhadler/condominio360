import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'react-toastify';

const CATEGORIAS = [
  'Barulho',
  'Limpeza',
  'Manutenção',
  'Segurança',
  'Área Comum',
  'Outros',
];

const CLOUDINARY_UPLOAD_PRESET = 'condominio360'; // Você precisa criar este preset no Cloudinary
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

function NovaReclamacao({ onClose = () => {}, onSuccess = () => {} }) {
  const [formData, setFormData] = useState({
    apartamento: '',
    categoria: '',
    descricao: '',
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    setError('');
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('A foto deve ter no máximo 5MB');
        return;
      }
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.apartamento || !formData.categoria || !formData.descricao) {
      setError('Por favor, preencha todos os campos obrigatórios');
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      let fotoUrl = null;
      if (foto) {
        toast.info('Fazendo upload da foto...', { autoClose: 2000 });
        fotoUrl = await uploadToCloudinary(foto);
      }

      const reclamacaoData = {
        ...formData,
        status: 'nova',
        dataCriacao: Timestamp.now(),
        userId: user.uid,
        fotoUrl,
      };

      const docRef = await addDoc(collection(db, 'condominios', user.uid, 'reclamacoes'), reclamacaoData);
      console.log('Reclamação criada com sucesso:', docRef.id);
      toast.success('Reclamação registrada com sucesso!');
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar reclamação:', error);
      const errorMessage = error.message || 'Erro ao criar reclamação. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Nova Reclamação
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
          <TextField
            label="Apartamento"
            required
            value={formData.apartamento}
            onChange={(e) => handleChange('apartamento', e.target.value)}
            error={!!error && !formData.apartamento}
          />

          <TextField
            select
            label="Categoria"
            required
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            error={!!error && !formData.categoria}
          >
            {CATEGORIAS.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>
                {categoria}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Descrição"
            required
            multiline
            rows={4}
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            error={!!error && !formData.descricao}
          />

          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="foto-upload"
              type="file"
              onChange={handleFotoChange}
            />
            <label htmlFor="foto-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                Adicionar Foto
              </Button>
            </label>
            {fotoPreview && (
              <Box
                sx={{
                  mt: 1,
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  overflow: 'hidden',
                  borderRadius: 1,
                }}
              >
                <img
                  src={fotoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                  }}
                  onClick={() => {
                    setFoto(null);
                    setFotoPreview(null);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Enviando...' : 'Enviar Reclamação'}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default NovaReclamacao;