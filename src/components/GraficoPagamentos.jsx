import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { auth } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function GraficoPagamentos() {
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dados, setDados] = useState({
    pagosNoMes: Array(12).fill(0),
    atrasadosNoMes: Array(12).fill(0),
  });

  useEffect(() => {
    carregarDados();
  }, [ano]);

  async function carregarDados() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const pagamentosRef = collection(db, 'condominios', user.uid, 'pagamentos');
      const pagamentosSnapshot = await getDocs(
        query(
          pagamentosRef,
          where('ano', '==', ano)
        )
      );

      const dadosPorMes = {
        pagosNoMes: Array(12).fill(0),
        atrasadosNoMes: Array(12).fill(0),
      };

      pagamentosSnapshot.docs.forEach(doc => {
        const pagamento = doc.data();
        const mes = pagamento.mes - 1; // Ajustar para índice 0-based

        if (pagamento.status === 'confirmado') {
          dadosPorMes.pagosNoMes[mes]++;
        } else if (pagamento.status === 'atrasado') {
          dadosPorMes.atrasadosNoMes[mes]++;
        }
      });

      setDados(dadosPorMes);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
      toast.error('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pagamentos por Mês',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const data = {
    labels: meses,
    datasets: [
      {
        label: 'Pagamentos em Dia',
        data: dados.pagosNoMes,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Pagamentos Atrasados',
        data: dados.atrasadosNoMes,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Evolução dos Pagamentos</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            value={ano}
            label="Ano"
            onChange={(e) => setAno(e.target.value)}
          >
            {anos.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Line options={options} data={data} />
      )}
    </Paper>
  );
}

export default GraficoPagamentos;