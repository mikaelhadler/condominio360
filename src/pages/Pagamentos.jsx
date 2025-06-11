import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '../components/Sidebar';
import ConfiguracaoPagamento from '../components/ConfiguracaoPagamento';
import HistoricoPagamentos from '../components/HistoricoPagamentos';
import NovoPagamento from '../components/NovoPagamento';
import EstatisticasPagamentos from '../components/EstatisticasPagamentos';
import GraficoPagamentos from '../components/GraficoPagamentos';
import { toast } from 'react-toastify';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pagamentos-tabpanel-${index}`}
      aria-labelledby={`pagamentos-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Pagamentos() {
  const [moradores, setMoradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMorador, setSelectedMorador] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openHistoricoDialog, setOpenHistoricoDialog] = useState(false);
  const [openNovoPagamentoDialog, setOpenNovoPagamentoDialog] = useState(false);
  const [comprovante, setComprovante] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    carregarMoradores();
  }, []);

  async function carregarMoradores() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const moradoresRef = collection(db, 'condominios', user.uid, 'moradores');
      const pagamentosRef = collection(db, 'condominios', user.uid, 'pagamentos');

      // Buscar moradores
      const moradoresSnapshot = await getDocs(moradoresRef);
      const moradoresData = moradoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar últimos pagamentos
      const pagamentosSnapshot = await getDocs(query(pagamentosRef, orderBy('dataPagamento', 'desc')));
      const pagamentosData = pagamentosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Combinar dados
      const moradoresComPagamentos = moradoresData.map(morador => {
        const ultimoPagamento = pagamentosData.find(p => p.moradorId === morador.id);
        const status = calcularStatusPagamento(ultimoPagamento);
        return {
          ...morador,
          ultimoPagamento,
          status
        };
      });

      setMoradores(moradoresComPagamentos);
    } catch (error) {
      console.error('Erro ao carregar moradores:', error);
      toast.error('Erro ao carregar dados dos moradores');
    } finally {
      setLoading(false);
    }
  }

  const calcularStatusPagamento = (ultimoPagamento) => {
    if (!ultimoPagamento) return 'atrasado';

    const dataPagamento = ultimoPagamento.dataPagamento.toDate();
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    return dataPagamento > umMesAtras ? 'em dia' : 'atrasado';
  };

  const handleUploadComprovante = async () => {
    if (!comprovante || !selectedMorador) return;

    try {
      setUploadLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Upload do comprovante
      const storageRef = ref(storage, `comprovantes/${user.uid}/${selectedMorador.id}/${comprovante.name}`);
      await uploadBytes(storageRef, comprovante);
      const comprovanteUrl = await getDownloadURL(storageRef);

      // Registrar pagamento
      const pagamentosRef = collection(db, 'condominios', user.uid, 'pagamentos');
      await addDoc(pagamentosRef, {
        moradorId: selectedMorador.id,
        dataPagamento: Timestamp.now(),
        comprovanteUrl,
        observacao,
        status: 'confirmado'
      });

      // Atualizar status do morador
      const moradorRef = doc(db, 'condominios', user.uid, 'moradores', selectedMorador.id);
      await updateDoc(moradorRef, {
        ultimoPagamento: Timestamp.now()
      });

      toast.success('Comprovante enviado com sucesso!');
      setOpenUploadDialog(false);
      setComprovante(null);
      setObservacao('');
      carregarMoradores();
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      toast.error('Erro ao enviar comprovante');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setComprovante(file);
    }
  };

  const getStatusColor = (status) => {
    return status === 'em dia' ? 'success' : 'error';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
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
              Pagamentos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedMorador(null);
                setOpenNovoPagamentoDialog(true);
              }}
            >
              Novo Pagamento
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Lista de Pagamentos" />
              <Tab label="Configurações" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <EstatisticasPagamentos moradores={moradores} />
            <GraficoPagamentos />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Apartamento</TableCell>
                    <TableCell>Morador</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Último Pagamento</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moradores.map((morador) => (
                    <TableRow key={morador.id}>
                      <TableCell>{morador.apartamento}</TableCell>
                      <TableCell>{morador.nome}</TableCell>
                      <TableCell>
                        <Chip
                          label={morador.status === 'em dia' ? 'Em dia' : 'Atrasado'}
                          color={getStatusColor(morador.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {morador.ultimoPagamento
                          ? format(morador.ultimoPagamento.dataPagamento.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : 'Nenhum pagamento registrado'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMorador(morador);
                            setOpenUploadDialog(true);
                          }}
                          title="Enviar comprovante"
                        >
                          <UploadIcon />
                        </IconButton>
                        {morador.ultimoPagamento?.comprovanteUrl && (
                          <IconButton
                            size="small"
                            onClick={() => window.open(morador.ultimoPagamento.comprovanteUrl, '_blank')}
                            title="Ver comprovante"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMorador(morador);
                            setOpenHistoricoDialog(true);
                          }}
                          title="Ver histórico"
                        >
                          <HistoryIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMorador(morador);
                            setOpenNovoPagamentoDialog(true);
                          }}
                          title="Novo pagamento"
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ConfiguracaoPagamento />
          </TabPanel>
        </Container>
      </Box>

      {/* Dialog de Upload de Comprovante */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Enviar Comprovante - Apto {selectedMorador?.apartamento}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Selecionar Comprovante
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {comprovante && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Arquivo selecionado: {comprovante.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observação"
                multiline
                rows={3}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleUploadComprovante}
            variant="contained"
            disabled={!comprovante || uploadLoading}
          >
            {uploadLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico de Pagamentos */}
      <HistoricoPagamentos
        morador={selectedMorador}
        open={openHistoricoDialog}
        onClose={() => setOpenHistoricoDialog(false)}
      />

      {/* Dialog de Novo Pagamento */}
      <NovoPagamento
        morador={selectedMorador}
        open={openNovoPagamentoDialog}
        onClose={() => setOpenNovoPagamentoDialog(false)}
        onSuccess={carregarMoradores}
      />
    </Box>
  );
}

export default Pagamentos;