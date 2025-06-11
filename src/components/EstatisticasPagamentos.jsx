import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

function EstatisticasPagamentos({ moradores }) {
  const totalMoradores = moradores.length;
  const moradoresEmDia = moradores.filter(m => m.status === 'em dia').length;
  const moradoresAtrasados = totalMoradores - moradoresEmDia;
  const percentualEmDia = (moradoresEmDia / totalMoradores) * 100;

  const cards = [
    {
      title: 'Moradores em Dia',
      value: moradoresEmDia,
      total: totalMoradores,
      icon: <TrendingUpIcon sx={{ color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Moradores em Atraso',
      value: moradoresAtrasados,
      total: totalMoradores,
      icon: <TrendingDownIcon sx={{ color: 'error.main' }} />,
      color: 'error.main',
    },
    {
      title: 'Taxa de Adimplência',
      value: `${percentualEmDia.toFixed(1)}%`,
      icon: <AttachMoneyIcon sx={{ color: 'primary.main' }} />,
      color: 'primary.main',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: 1,
                opacity: 0.2,
                transform: 'scale(1.5)',
              }}
            >
              {card.icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                mb: 1,
                color: card.color,
                fontWeight: 'bold',
              }}
            >
              {card.value}
            </Typography>
            {card.total && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={(card.value / card.total) * 100}
                  sx={{
                    mt: 1,
                    mb: 0.5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: card.color,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  {card.value} de {card.total} moradores
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default EstatisticasPagamentos;