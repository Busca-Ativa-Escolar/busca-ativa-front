import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { BarChart } from '@mui/x-charts/BarChart';
import HeaderAdmin from './HeaderAdmin';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import './static/Dashboard.css';
import { rota_base } from '../../constants';

// Ícones
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Dashboard() {
  const [casos, setCasos] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [turmaData, setTurmaData] = useState([]);
  const [percentuais, setPercentuais] = useState({ geral: 0, ano: 0, turma: 0 });
  const [error, setError] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get('token');

  const COLORS = ['#007bff', '#28a745', '#dc3545', '#6c757d'];

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
          if (!response.ok) throw new Error('Failed to fetch cases');
          return response.json();
        })
        .then(data => {
          setCasos(data.caso);
          processCaseData(data.caso);
        })
        .catch(error => setError(error.message));
    };

    fetchCases();
  }, [token]);

  const processCaseData = (casos) => {
    // Contagem apenas de casos válidos (em aberto / finalizado)
    const statusCounts = { 'EM ABERTO': 0, 'FINALIZADO': 0 };
    const urgenciaCounts = { 'ALTA': 0, 'MEDIA': 0, 'BAIXA': 0, 'INDEFINIDA': 0 };
    const turmaCounts = {};

    casos.forEach(caso => {
      if (caso.status === 'EM ABERTO' || caso.status === 'FINALIZADO') {
        statusCounts[caso.status]++;
      }

      if (caso.urgencia && urgenciaCounts[caso.urgencia] !== undefined) {
        urgenciaCounts[caso.urgencia]++;
      } else {
        urgenciaCounts['INDEFINIDA']++;
      }

      const turma = caso.aluno?.turma || 'Indefinida';
      if (!turmaCounts[turma]) turmaCounts[turma] = 0;
      turmaCounts[turma]++;
    });

    const statusData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    const urgenciaData = Object.keys(urgenciaCounts).map(key => ({
      name: key,
      value: urgenciaCounts[key]
    }));

    const turmaData = Object.keys(turmaCounts).map(key => ({
      name: key,
      value: turmaCounts[key]
    }));

    // % de alunos sem busca ativa
    const totalCasos = casos.length;
    const semBA = casos.filter(c => c.tipo !== 'BUSCA ATIVA').length;
    const geral = totalCasos ? ((semBA / totalCasos) * 100).toFixed(1) : 0;

    const anoAgrupado = {};
    casos.forEach(c => {
      const ano = c.aluno?.turma ? c.aluno.turma.charAt(0) : 'Indefinido';
      if (!anoAgrupado[ano]) anoAgrupado[ano] = { total: 0, semBA: 0 };
      anoAgrupado[ano].total++;
      if (c.tipo !== 'BUSCA ATIVA') anoAgrupado[ano].semBA++;
    });
    const percentualAno = Object.keys(anoAgrupado).map(ano => ({
      ano,
      perc: ((anoAgrupado[ano].semBA / anoAgrupado[ano].total) * 100).toFixed(1)
    }));

    const percentualTurma = Object.keys(turmaCounts).map(turma => {
      const total = turmaCounts[turma];
      const semBA = casos.filter(c => c.aluno?.turma === turma && c.tipo !== 'BUSCA ATIVA').length;
      return { turma, perc: ((semBA / total) * 100).toFixed(1) };
    });

    setStatusData(statusData);
    setUrgenciaData(urgenciaData);
    setTurmaData(turmaData);
    setPercentuais({
      geral,
      ano: percentualAno.length ? (percentualAno.reduce((a, b) => a + parseFloat(b.perc), 0) / percentualAno.length).toFixed(1) : 0,
      turma: percentualTurma.length ? (percentualTurma.reduce((a, b) => a + parseFloat(b.perc), 0) / percentualTurma.length).toFixed(1) : 0,
    });
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
      <Container className='dashboard'>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" textTransform="uppercase" color="#333">
              Dashboard
            </Typography>
          </Grid>

          {/* Indicadores de % sem busca ativa */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingDownIcon color="error" fontSize="large" />
                  <Typography variant="h6">% Sem Busca Ativa - Geral</Typography>
                  <Typography variant="h3" color="primary">{percentuais.geral}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingFlatIcon color="warning" fontSize="large" />
                  <Typography variant="h6">% Sem Busca Ativa - Por Ano</Typography>
                  <Typography variant="h3" color="primary">{percentuais.ano}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingUpIcon color="success" fontSize="large" />
                  <Typography variant="h6">% Sem Busca Ativa - Por Turma</Typography>
                  <Typography variant="h3" color="primary">{percentuais.turma}%</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Total de Casos */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total de Casos: {casos.length}</Typography>
            </Paper>
          </Grid>

          {/* Gráfico de Pizza: Status dos Casos */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>Status dos Casos (Proporção)</Typography>
              <PieChart width={300} height={300}>
                <Pie dataKey="value" data={statusData} cx={200} cy={150} outerRadius={80} label={(entry) => entry.name}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'EM ABERTO' ? '#007bff' : '#28a745'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend align="center" verticalAlign="bottom" />
              </PieChart>
            </Paper>
          </Grid>

          {/* NOVO Gráfico de Barras: Casos Abertos vs Finalizados */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>Casos Abertos x Finalizados</Typography>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: statusData.map(item => item.name) }]}
                  series={[{ data: statusData.map(item => item.value), color: '#007bff' }]}
                  width={400}
                  height={300}
                />
              </div>
            </Paper>
          </Grid>

          {/* Prioridades em número + ícones */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>Prioridade dos Casos</Typography>
              <Grid container spacing={2} justifyContent="center">
                {urgenciaData.map((item, i) => {
                  const config = prioridadeConfig[item.name] || prioridadeConfig['INDEFINIDA'];
                  return (
                    <Grid item xs={6} sm={3} key={i}>
                      <Paper elevation={3} sx={{
                        p: 2,
                        backgroundColor: config.color,
                        color: 'white'
                      }}>
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

          {/* Casos por Turma */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" mb={2}>Casos por Turma</Typography>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: turmaData.map(item => item.name) }]}
                  series={[{ data: turmaData.map(item => item.value) }]}
                  width={600}
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
