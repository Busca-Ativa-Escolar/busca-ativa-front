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
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ComputerIcon from "@mui/icons-material/Computer";
import "./static/AlunosTable.css";
import { rota_base } from "../../constants";

const columns = [
  { id: "nome", label: "Nome", minWidth: 100 },
  { id: "turma", label: "Turma", minWidth: 100 },
  { id: "RA", label: "R.A", minWidth: 100 },
  { id: "tarefas", label: "TAREFAS", minWidth: 170 },
];

function AlunosTable() {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasses, setFilterClasses] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoEnsino, setTipoEnsino] = useState("");
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(rota_base + "/alunoBuscaAtiva", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch alunos");
        return response.json();
      })
      .then((data) => {
        setAlunos(data);
        setFilteredAlunos(data);
      })
      .catch((error) => console.error("Error fetching alunos:", error));
  }, [token]);

  useEffect(() => {
    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    let results = alunos.filter((aluno) => {
      const nomeMatch =
        normalize(aluno.nome).includes(normalize(searchTerm)) ||
        (aluno.RA && normalize(String(aluno.RA)).includes(normalize(searchTerm)));

      const turmaUpper = (aluno.turma || "").toUpperCase();

      if (tipoEnsino === "EJA" && !turmaUpper.includes("EJA")) return false;
      if (tipoEnsino === "REGULAR" && turmaUpper.includes("EJA")) return false;

      const classeMatch =
        filterClasses.length === 0 ||
        filterClasses.some((cls) => turmaUpper.includes(cls.toUpperCase()));

      return nomeMatch && classeMatch;
    });

    if (sortOption === "nameAsc") {
      results.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortOption === "nameDesc") {
      results.sort((a, b) => b.nome.localeCompare(a.nome));
    }

    setFilteredAlunos(results);
  }, [searchTerm, sortOption, filterClasses, tipoEnsino, alunos]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleClearFilters = () => {
    setTipoEnsino("");
    setFilterClasses([]);
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

  const ejaClasses = [
    "1A - EJA", "1B - EJA", "1C - EJA",
    "2A - EJA", "2B - EJA", "2C - EJA",
    "3A - EJA", "3B - EJA", "3C - EJA",
    "4A - EJA", "4B - EJA", "4C - EJA",
    "5A - EJA", "5B - EJA", "5C - EJA",
    "6A - EJA", "6B - EJA", "6C - EJA",
    "7A - EJA", "7B - EJA", "7C - EJA",
    "8A - EJA", "8B - EJA", "8C - EJA",
    "9A - EJA", "9B - EJA", "9C - EJA"
  ];

  return (
    <div>
      <div
        className="filter-container"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h4" fontWeight="bold" textTransform="uppercase" style={{ paddingLeft: "20px" }}>
          Controle de Tarefas
        </Typography>

        <div className="filter-box" style={{ display: "flex", alignItems: "center" }}>
          <TextField
            label="Nome ou RA"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            style={{ marginRight: "10px", width: "300px" }}
          />
          <FormControl variant="outlined" size="small" style={{ marginRight: "10px" }}>
            <InputLabel>Ordenar Por</InputLabel>
            <Select value={sortOption} onChange={handleSortChange} label="Ordenar Por">
              <MenuItem value=""><em>Nada</em></MenuItem>
              <MenuItem value="nameAsc">Nome (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Nome (Z-A)</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" size="small" onClick={handleOpenDialog}>
            Filtros
          </Button>
        </div>
      </div>

      {/* Modal de filtros */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <div className="filter-section">
            <div className="filter-group">
              <h4>Turma:</h4>
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
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

      {/* Tabela */}
      <Paper className="table-container">
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} sx={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlunos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((aluno) => (
                  <TableRow hover key={aluno._id}>
                    {columns.map((column) => {
                      if (column.id === "tarefas") {
                        return (
                          <TableCell key={column.id} align="center">
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => navigate(`/tarefas/${aluno._id}`)}
                              startIcon={<ComputerIcon />}
                            >
                              TAREFAS
                            </Button>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={column.id} align="center">
                          {aluno[column.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredAlunos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </Paper>
    </div>
  );
}

export default AlunosTable;
