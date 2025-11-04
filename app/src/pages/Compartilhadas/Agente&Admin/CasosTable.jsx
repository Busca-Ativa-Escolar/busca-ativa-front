import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Chip,
  Box,
  OutlinedInput,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { Icon } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import ContactsIcon from "@mui/icons-material/Contacts";
import WarningIcon from "@mui/icons-material/Warning";
import ArticleIcon from "@mui/icons-material/Article";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { rota_base } from "../../../constants";
import "./static/CasosTable.css";

const columns = [
  { id: "aluno", label: "ALUNO", minWidth: 100, format: (aluno) => aluno.nome.toUpperCase(), Icon: ContactsIcon },
  { id: "turma", label: "TURMA", minWidth: 100, Icon: GroupsIcon },
  { id: "status", label: "STATUS", minWidth: 100, Icon: FeedbackIcon },
  { id: "urgencia", label: "PRIORIDADE", minWidth: 100, Icon: WarningIcon },
  { id: "actions", label: "AÇÕES", minWidth: 170, Icon: ArticleIcon },
];

const urgencyOrder = { BAIXA: 1, MEDIA: 2, ALTA: 3, INDEFINIDA: 0 };

function CasosTable() {
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasses, setFilterClasses] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoEnsino, setTipoEnsino] = useState("");
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(rota_base + "/casos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch cases");
        return response.json();
      })
      .then((data) => {
        setCasos(data.caso);
        setFilteredCasos(data.caso);
      })
      .catch((error) => setError(error.message));
  }, [token]);

  useEffect(() => {
    let results = casos.filter(
      (caso) =>
        caso.aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterClasses.length === 0 ||
          filterClasses.some(
            (cls) => caso.aluno.turma.toUpperCase() === cls.toUpperCase()
          )) &&
        (filterUrgency.length === 0 ||
          filterUrgency.some(
            (urgency) =>
              caso.urgencia &&
              caso.urgencia.toLowerCase() === urgency.toLowerCase()
          ))
    );

    if (sortOption === "nameAsc") {
      results.sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome));
    } else if (sortOption === "nameDesc") {
      results.sort((a, b) => b.aluno.nome.localeCompare(a.aluno.nome));
    } else if (sortOption === "urgencyHighToLow") {
      results.sort((a, b) => urgencyOrder[b.urgencia] - urgencyOrder[a.urgencia]);
    } else if (sortOption === "urgencyLowToHigh") {
      results.sort((a, b) => urgencyOrder[a.urgencia] - urgencyOrder[b.urgencia]);
    }

    setFilteredCasos(results);
  }, [searchTerm, sortOption, filterClasses, filterUrgency, casos]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleSortChange = (event) => setSortOption(event.target.value);
  const handleUrgencyChange = (event) => {
    const { value } = event.target;
    setFilterUrgency((prev) =>
      prev.includes(value)
        ? prev.filter((urgency) => urgency !== value)
        : [...prev, value]
    );
  };

  const handleViewClick = (id) => navigate(`/casos/${id}`);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleClearFilters = () => {
    setTipoEnsino("");
    setFilterClasses([]);
    setFilterUrgency([]);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const regularClasses = [
    "1A", "1B", "1C",
    "2A", "2B", "2C",
    "3A", "3B", "3C",
    "4A", "4B", "4C",
    "5A", "5B", "5C",
    "6A", "6B", "6C",
    "7A", "7B", "7C",
    "8A", "8B", "8C",
    "9A", "9B", "9C",
  ];

  const ejaClasses = ["EJA-1A", "EJA-1B", "EJA-1C",
                            "EJA-2A", "EJA-2B", "EJA-2C",
                            "EJA-3A", "EJA-3B", "EJA-3C",
                            "EJA-4A", "EJA-4B", "EJA-4C",
                            "EJA-5A", "EJA-5B", "EJA-5C",
                            "EJA-6A", "EJA-6B", "EJA-6C",
                            "EJA-7A", "EJA-7B", "EJA-7C",
                            "EJA-8A", "EJA-8B", "EJA-8C",
                            "EJA-9A", "EJA-9B", "EJA-9C"];

  const getStatusBadge = (status) => {
    const base = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "white",
    };

    if (status === "EM ABERTO")
      return <span style={{ ...base, backgroundColor: "#007bff" }}>{status}</span>;
    if (status === "FINALIZADO")
      return <span style={{ ...base, backgroundColor: "#28a745" }}>{status}</span>;
    return <span style={{ ...base, backgroundColor: "#6c757d" }}>SEM STATUS</span>;
  };

  const getUrgenciaBadge = (urgencia) => {
    const base = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "white",
    };

    switch (urgencia?.toUpperCase()) {
      case "ALTA":
        return <span style={{ ...base, backgroundColor: "#dc3545" }}>ALTA</span>;
      case "MEDIA":
        return <span style={{ ...base, backgroundColor: "#ffc107", color: "#212529" }}>MÉDIA</span>;
      case "BAIXA":
        return <span style={{ ...base, backgroundColor: "#28a745" }}>BAIXA</span>;
      default:
        return <span style={{ ...base, backgroundColor: "#6c757d" }}>INDEFINIDA</span>;
    }
  };

  return (
    <div>
      <div className="title" style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h4"
          component="h4"
          style={{
            marginBottom: "10px",
            textAlign: "center",
            fontFamily: "Roboto, sans-serif",
            fontWeight: "bold",
            textTransform: "uppercase",
            paddingLeft: "2%",
          }}
        >
          Controle de Casos
        </Typography>
        <div className="filter-container">
          <div className="filter-box">
            <TextField
              label="Busque Pelo Nome"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              className="compact-input"
            />
            <FormControl variant="outlined" size="small" className="compact-input">
              <InputLabel>Ordenar Por</InputLabel>
              <Select value={sortOption} onChange={handleSortChange} label="Ordenar Por">
                <MenuItem value=""><em>Nada</em></MenuItem>
                <MenuItem value="nameAsc">Nome (A-Z)</MenuItem>
                <MenuItem value="nameDesc">Nome (Z-A)</MenuItem>
                <MenuItem value="urgencyHighToLow">Prioridade (Alta - Baixa)</MenuItem>
                <MenuItem value="urgencyLowToHigh">Prioridade (Baixa - Alta)</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" size="small" onClick={handleOpenDialog}>
              Filtros
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <div className="filter-section">
            <div className="filter-group">
              <h4>Turma:</h4>
              <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
                <InputLabel id="tipo-ensino-label">Turma</InputLabel>
                <Select
                  labelId="tipo-ensino-label"
                  value={tipoEnsino}
                  onChange={(e) => {
                    setTipoEnsino(e.target.value);
                    setFilterClasses([]);
                  }}
                  label="Turma"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="REGULAR">Regular</MenuItem>
                  <MenuItem value="EJA">EJA</MenuItem>
                </Select>
              </FormControl>
            </div>

            {tipoEnsino && (
              <div className="filter-group">
                <h4>Classe:</h4>
                <FormControl fullWidth size="small">
                  <InputLabel id="classe-select-label">Classe</InputLabel>
                  <Select
                    labelId="classe-select-label"
                    multiple
                    value={filterClasses}
                    onChange={(e) => setFilterClasses(e.target.value)}
                    input={<OutlinedInput label="Classe" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {(tipoEnsino === "REGULAR" ? regularClasses : ejaClasses).map((turma) => (
                      <MenuItem key={turma} value={turma}>
                        <Checkbox checked={filterClasses.includes(turma)} />
                        {turma}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            <div className="filter-group">
              <h4>Prioridade:</h4>
              {["BAIXA", "MEDIA", "ALTA", "INDEFINIDA"].map((urgency) => (
                <FormControlLabel
                  key={urgency}
                  control={
                    <Checkbox
                      checked={filterUrgency.includes(urgency)}
                      onChange={handleUrgencyChange}
                      value={urgency}
                    />
                  }
                  label={urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase()}
                />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters} color="error">
            Limpar Filtros
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Paper className="table-container">
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="center"
                    style={{ minWidth: column.minWidth }}
                    sx={{ fontWeight: "bold", backgroundColor: "#f0f0f0", color: "#333" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {column.Icon && <Icon component={column.Icon} sx={{ fontSize: 18, mr: 1 }} />}
                      {column.label}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCasos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((caso) => (
                  <TableRow hover key={caso._id}>
                    {columns.map((column) => {
                      let value;
                      if (column.id === "turma") value = caso.aluno.turma;
                      else if (column.id === "status") value = getStatusBadge(caso.status);
                      else if (column.id === "urgencia") value = getUrgenciaBadge(caso.urgencia);
                      else if (column.id === "actions") {
                        value = (
                          <Button variant="contained" color="primary" onClick={() => handleViewClick(caso._id)}>
                            Visualizar ficha
                          </Button>
                        );
                      } else if (column.id === "aluno") value = caso.aluno.nome;
                      else value = caso[column.id];
                      return <TableCell key={column.id} align="center">{value}</TableCell>;
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredCasos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

export default CasosTable;
