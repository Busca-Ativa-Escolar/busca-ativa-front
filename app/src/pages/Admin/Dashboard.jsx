import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import HeaderAdmin from "./HeaderAdmin";
import Cookies from "universal-cookie";
import "./static/Dashboard.css";
import { rota_base } from "../../constants";

import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SummarizeIcon from "@mui/icons-material/Summarize";

export default function Dashboard() {
  const [casos, setCasos] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [turmaData, setTurmaData] = useState([]);
  const [regularData, setRegularData] = useState([]);
  const [ejaData, setEjaData] = useState([]);
  const [geralData, setGeralData] = useState([]);
  const [statusResumo, setStatusResumo] = useState({
    abertos: 0,
    finalizados: 0,
    indefinidos: 0,
    total: 0,
    percAbertos: 0,
    percFinalizados: 0,
    percIndefinidos: 0,
  });

  const cookies = new Cookies();
  const token = cookies.get("token");

  useEffect(() => {
    fetch(`${rota_base}/casos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar casos");
        return res.json();
      })
      .then((data) => {
        setCasos(data.caso);
        processCaseData(data.caso);
      })
      .catch((err) => console.error("Erro:", err.message));
  }, [token]);

  const processCaseData = (casos) => {
    const urgenciaCounts = { ALTA: 0, MEDIA: 0, BAIXA: 0, INDEFINIDA: 0 };
    const turmaCounts = {};
    const regularCounts = {};
    const ejaCounts = {};
    let abertos = 0;
    let finalizados = 0;
    let indefinidos = 0;

    casos.forEach((caso) => {
      const status = (caso.status || "").trim().toUpperCase();
      const turma = caso.aluno?.turma || "Indefinida";
      const urgencia = (caso.urgencia || "").trim().toUpperCase();

      if (status === "EM ABERTO") abertos++;
      else if (status === "FINALIZADO") finalizados++;
      else indefinidos++;

      if (urgenciaCounts[urgencia] !== undefined) urgenciaCounts[urgencia]++;
      else urgenciaCounts["INDEFINIDA"]++;

      if (!turmaCounts[turma])
        turmaCounts[turma] = { abertos: 0, finalizados: 0, indefinidos: 0 };
      if (status === "EM ABERTO") turmaCounts[turma].abertos++;
      else if (status === "FINALIZADO") turmaCounts[turma].finalizados++;
      else turmaCounts[turma].indefinidos++;

      if (turma.toUpperCase().includes("EJ")) {
        if (!ejaCounts[turma])
          ejaCounts[turma] = { abertos: 0, finalizados: 0, indefinidos: 0 };
        if (status === "EM ABERTO") ejaCounts[turma].abertos++;
        else if (status === "FINALIZADO") ejaCounts[turma].finalizados++;
        else ejaCounts[turma].indefinidos++;
      } else {
        if (!regularCounts[turma])
          regularCounts[turma] = { abertos: 0, finalizados: 0, indefinidos: 0 };
        if (status === "EM ABERTO") regularCounts[turma].abertos++;
        else if (status === "FINALIZADO") regularCounts[turma].finalizados++;
        else regularCounts[turma].indefinidos++;
      }
    });

    const total = abertos + finalizados + indefinidos;
    const percAbertos = total ? ((abertos / total) * 100).toFixed(1) : 0;
    const percFinalizados = total ? ((finalizados / total) * 100).toFixed(1) : 0;
    const percIndefinidos = total ? ((indefinidos / total) * 100).toFixed(1) : 0;

    setStatusResumo({
      abertos,
      finalizados,
      indefinidos,
      total,
      percAbertos,
      percFinalizados,
      percIndefinidos,
    });

    setUrgenciaData(
      Object.keys(urgenciaCounts).map((key) => ({
        name: key,
        value: urgenciaCounts[key],
      }))
    );

    setTurmaData(
      Object.keys(turmaCounts).map((key) => ({
        name: key,
        ...turmaCounts[key],
      }))
    );

    setRegularData(
      Object.keys(regularCounts).map((key) => ({
        name: key,
        ...regularCounts[key],
      }))
    );

    setEjaData(
      Object.keys(ejaCounts).map((key) => ({
        name: key,
        ...ejaCounts[key],
      }))
    );
    // 🔹 Totalizar casos por categoria (Regular vs EJA)
    let totalRegular = 0;
    let totalEJA = 0;
    let totalRegularFinalizados = 0;
    let totalEJAFinalizados = 0;
    let totalRegularAbertos = 0;
    let totalEJAAbertos = 0;
    let totalRegularIndefinidos = 0;
    let totalEJAIndefinidos = 0;

    // Somar totais consolidados
    Object.keys(regularCounts).forEach(key => {
      totalRegular += (regularCounts[key].abertos + regularCounts[key].finalizados + regularCounts[key].indefinidos);
      totalRegularAbertos += regularCounts[key].abertos;
      totalRegularFinalizados += regularCounts[key].finalizados;
      totalRegularIndefinidos += regularCounts[key].indefinidos;
    });

    Object.keys(ejaCounts).forEach(key => {
      totalEJA += (ejaCounts[key].abertos + ejaCounts[key].finalizados + ejaCounts[key].indefinidos);
      totalEJAAbertos += ejaCounts[key].abertos;
      totalEJAFinalizados += ejaCounts[key].finalizados;
      totalEJAIndefinidos += ejaCounts[key].indefinidos;
    });

    // 🔹 Consolidar em um dataset novo
    const geralData = [
      {
        name: "Regular",
        abertos: totalRegularAbertos,
        finalizados: totalRegularFinalizados,
        indefinidos: totalRegularIndefinidos
      },
      {
        name: "EJA",
        abertos: totalEJAAbertos,
        finalizados: totalEJAFinalizados,
        indefinidos: totalEJAIndefinidos
      }
    ];

    setGeralData(geralData);

  };

  const prioridadeConfig = {
    ALTA: { color: "#dc3545", icon: <PriorityHighIcon fontSize="large" /> },
    MEDIA: { color: "#ffc107", icon: <ReportProblemIcon fontSize="large" /> },
    BAIXA: { color: "#28a745", icon: <CheckCircleIcon fontSize="large" /> },
    INDEFINIDA: { color: "#6c757d", icon: <HelpOutlineIcon fontSize="large" /> },
  };

  const renderChart = (title, data) => (
    <Grid item xs={12}>
      <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h5" mb={2}>
          {title}
        </Typography>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BarChart
            xAxis={[{ scaleType: "band", data: data.map((d) => d.name) }]}
            series={[
              { data: data.map((d) => d.abertos), label: "Em Aberto", color: "#007bff" },
              { data: data.map((d) => d.finalizados), label: "Finalizados", color: "#28a745" },
              { data: data.map((d) => d.indefinidos), label: "Sem Status", color: "#6c757d" },
            ]}
            width={750}
            height={400}
          />
        </div>
      </Paper>
    </Grid>
  );

  return (
    <div>
      <HeaderAdmin />
      <Container className="dashboard">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" textTransform="uppercase" color="#333">
              Dashboard
            </Typography>
          </Grid>

          {/* Indicadores de Status */}
          <Grid item xs={12}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#007bff", color: "white" }}>
                  <PendingActionsIcon fontSize="large" />
                  <Typography variant="h6">Em Aberto</Typography>
                  <Typography variant="h3">{statusResumo.abertos}</Typography>
                  <Typography variant="subtitle2">({statusResumo.percAbertos}% do total)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#28a745", color: "white" }}>
                  <AssignmentTurnedInIcon fontSize="large" />
                  <Typography variant="h6">Finalizados</Typography>
                  <Typography variant="h3">{statusResumo.finalizados}</Typography>
                  <Typography variant="subtitle2">({statusResumo.percFinalizados}% do total)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#6c757d", color: "white" }}>
                  <ErrorOutlineIcon fontSize="large" />
                  <Typography variant="h6">Sem Status</Typography>
                  <Typography variant="h3">{statusResumo.indefinidos}</Typography>
                  <Typography variant="subtitle2">({statusResumo.percIndefinidos}% do total)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#6c63ff", color: "white" }}>
                  <SummarizeIcon fontSize="large" />
                  <Typography variant="h6">Total de Casos</Typography>
                  <Typography variant="h3">{statusResumo.total}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Prioridades dos Casos */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" mb={2}>
                Prioridade dos Casos
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {urgenciaData.map((item, i) => {
                  const config = prioridadeConfig[item.name] || prioridadeConfig["INDEFINIDA"];
                  return (
                    <Grid item xs={6} sm={3} key={i}>
                      <Paper elevation={3} sx={{ p: 2, backgroundColor: config.color, color: "white" }}>
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

          {/* Gráficos */}
          {renderChart("Casos por Turma (Regular)", regularData)}
          {renderChart("Casos por Turma (EJA)", ejaData)}
          {renderChart("Comparativo Geral (Regular x EJA)", geralData)}
        </Grid>
      </Container>
    </div>
  );
}
