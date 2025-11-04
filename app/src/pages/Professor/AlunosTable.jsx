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
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import ContactsIcon from "@mui/icons-material/Contacts";
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
  const [error, setError] = useState(null);
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
      .catch((error) => setError(error.message));
  }, [token]);

  useEffect(() => {
    let results = alunos.filter(
      (aluno) =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterClasses.length === 0 ||
          filterClasses.some(
            (cls) => aluno.turma.toUpperCase() === cls.toUpperCase()
          ))
    );

    if (sortOption === "nameAsc") {
      results.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortOption === "nameDesc") {
      results.sort((a, b) => b.nome.localeCompare(a.nome));
    }

    setFilteredAlunos(results);
  }, [searchTerm, sortOption, filterClasses, alunos]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleSortChange = (event) => setSortOption(event.target.value);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleClearFilters = () => {
    setTipoEnsino("");
    setFilterClasses([]);
  };

  const handleViewClick = (id) => navigate(`/alunos/${id}`);
  const handleAddTaskClick = (id) => navigate(`/tarefas/${id}`);

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

  const ejaClasses = ["EJA1", "EJA2"];

  return (
    <div>
      <div className="filter-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          variant="h4"
          component="h4"
          style={{
            marginBottom: "10px",
            fontFamily: "Roboto, sans-serif",
            fontWeight: "bold",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            paddingLeft: "20px",
          }}
        >
          Controle de Tarefas
        </Typography>

        <div className="filter-box" style={{ display: "flex", alignItems: "center" }}>
          <TextField
            label="Nome"
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
            <Select
              value={sortOption}
              onChange={handleSortChange}
              label="Ordenar Por"
            >
              <MenuItem value=""><em>Nada</em></MenuItem>
              <MenuItem value="nameAsc">Nome (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Nome (Z-A)</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            onClick={handleOpenDialog}
            style={{ color: "white", width: "80px", height: "38px" }}
          >
            Filtros
          </Button>
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
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: "#f0f0f0",
                      fontWeight: "bold",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlunos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((aluno, index) => (
                  <TableRow hover key={aluno._id}>
                    {columns.map((column) => {
                      let value = aluno[column.id];
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
                          {column.format ? column.format(value) : value}
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

export default AlunosTable;
