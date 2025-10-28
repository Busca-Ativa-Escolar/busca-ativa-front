import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import HeaderAdmin from './HeaderAdmin';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import './static/Dashboard.css';
import { rota_base } from '../../constants';

// Ícones MUI
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SummarizeIcon from '@mui/icons-material/Summarize';

export default function Dashboard() {
  const [casos, setCasos] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [turmaData, setTurmaData] = useState([]);
  const [statusResumo, setStatusResumo] = useState({ abertos: 0, finalizados: 0, total: 0 });
  const cookies = new Cookies();
  const token = cookies.get('token');

  useEffect(() => {
    const fetchCases = () => {
      const url = `${rota_base}/casos`;

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao buscar casos');
          return response.json();
        })
        .then(data => {
          setCasos(data.caso);
          processCaseData(data.caso);
        })
        .catch(error => console.error('Erro:', error.message));
    };

    fetchCases();
  }, [token]);

  const processCaseData = (casos) => {
    const urgenciaCounts = { 'ALTA': 0, 'MEDIA': 0, 'BAIXA': 0, 'INDEFINIDA': 0 };
    const turmaCounts = {};
    let abertos = 0;
    let finalizados = 0;

    casos.forEach(caso => {
      if (caso.status === 'EM ABERTO') abertos++;
      else if (caso.status === 'FINALIZADO') finalizados++;

      // Contagem por urgência
      if (caso.urgencia && urgenciaCounts[caso.urgencia] !== undefined) {
        urgenciaCounts[caso.urgencia]++;
      } else {
        urgenciaCounts['INDEFINIDA']++;
      }

      // Casos por turma
      const turma = caso.aluno?.turma || 'Indefinida';
      if (!turmaCounts[turma]) turmaCounts[turma] = { abertos: 0, finalizados: 0 };
      if (caso.status === 'EM ABERTO') turmaCounts[turma].abertos++;
      else if (caso.status === 'FINALIZADO') turmaCounts[turma].finalizados++;
    });

    setStatusResumo({
      abertos,
      finalizados,
      total: abertos + finalizados
    });

    const urgenciaData = Object.keys(urgenciaCounts).map(key => ({
      name: key,
      value: urgenciaCounts[key]
    }));

    const turmaData = Object.keys(turmaCounts).map(key => ({
      name: key,
      abertos: turmaCounts[key].abertos,
      finalizados: turmaCounts[key].finalizados
    }));

    setUrgenciaData(urgenciaData);
    setTurmaData(turmaData);
  };

  const prioridadeConfig = {
    'ALTA': { color: '#dc3545', icon: <PriorityHighIcon fontSize="large" /> },
    'MEDIA': { color: '#ffc107', icon: <ReportProblemIcon fontSize="large" /> },
    'BAIXA': { color: '#28a745', icon: <CheckCircleIcon fontSize="large" /> },
    'INDEFINIDA': { color: '#6c757d', icon: <HelpOutlineIcon fontSize="large" /> }
  };

  return (
    <div>
      <HeaderAdmin />
      <Container className="dashboard">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              fontWeight="bold"
              textTransform="uppercase"
              color="#333"
            >
              Dashboard
            </Typography>
          </Grid>

          {/* Indicadores de Status */}
          <Grid item xs={12}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#007bff', color: 'white' }}>
                  <PendingActionsIcon fontSize="large" />
                  <Typography variant="h6">Casos em Aberto</Typography>
                  <Typography variant="h3">{statusResumo.abertos}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#28a745', color: 'white' }}>
                  <AssignmentTurnedInIcon fontSize="large" />
                  <Typography variant="h6">Casos Finalizados</Typography>
                  <Typography variant="h3">{statusResumo.finalizados}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#6c63ff', color: 'white' }}>
                  <SummarizeIcon fontSize="large" />
                  <Typography variant="h6">Total de Casos</Typography>
                  <Typography variant="h3">{statusResumo.total}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Prioridades dos Casos - Somente Números */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>
                Prioridade dos Casos
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {urgenciaData.map((item, i) => {
                  const config = prioridadeConfig[item.name] || prioridadeConfig['INDEFINIDA'];
                  return (
                    <Grid item xs={6} sm={3} key={i}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          backgroundColor: config.color,
                          color: 'white'
                        }}
                      >
                        {config.icon}
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="h4">{item.value}</Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Casos por Turma - Gráfico de Barras */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>
                Casos por Turma (Abertos x Finalizados)
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: turmaData.map(item => item.name) }]}
                  series={[
                    { data: turmaData.map(item => item.abertos), label: 'Em Aberto', color: '#007bff' },
                    { data: turmaData.map(item => item.finalizados), label: 'Finalizados', color: '#28a745' }
                  ]}
                  width={700}
                  height={400}
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
