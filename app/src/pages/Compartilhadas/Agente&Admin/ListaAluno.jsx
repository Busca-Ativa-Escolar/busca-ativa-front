import React, { useEffect, useState } from "react";
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
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Chip,
  Box,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import ComputerIcon from "@mui/icons-material/Computer";
import HeaderAdmin from "../../Admin/HeaderAdmin";
import HeaderAgente from "../../Agente/HeaderAgente";
import "./static/ListaAluno.css";
import { rota_base } from "../../../constants";

const columns = [
  { id: "nome", label: "NOME", minWidth: 100 },
  { id: "turma", label: "TURMA", minWidth: 100 },
  { id: "RA", label: "RA", minWidth: 100 },
  { id: "view", label: "VISUALIZAR DADOS", minWidth: 150 },
  { id: "tarefa", label: "TAREFA", minWidth: 100 },
  { id: "delete", label: "DELETAR", minWidth: 100 },
];

function createData(id, nome, turma, RA) {
  return { id, nome, turma, RA };
}

const cookies = new Cookies();

function ListaAluno() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasses, setFilterClasses] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoEnsino, setTipoEnsino] = useState("");
  const token = cookies.get("token");
  const permissao = cookies.get("permissao");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(rota_base + "/alunoBuscaAtiva/completo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, [token]);

  useEffect(() => {
    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    let results = users.filter((user) => {
      const nomeMatch =
        normalize(user.nome).includes(normalize(searchTerm)) ||
        (user.RA && normalize(String(user.RA)).includes(normalize(searchTerm)));

      const turmaUpper = (user.turma || "").toUpperCase();

      if (tipoEnsino === "EJA" && !turmaUpper.includes("EJA")) {
        return false;
      }

      if (tipoEnsino === "REGULAR" && turmaUpper.includes("EJA")) {
        return false;
      }

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

    setFilteredUsers(results);
  }, [searchTerm, sortOption, filterClasses, tipoEnsino, users]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleSortChange = (event) => setSortOption(event.target.value);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleClearFilters = () => {
    setTipoEnsino("");
    setFilterClasses([]);
  };

  const handleView = (id) => navigate(`/alunos/${id}`);
  const handleTarefa = (id) => navigate(`/tarefas/${id}`);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const handleConfirmDelete = (id) => {
    setSelectedUserId(id);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUserId(null);
  };
  const handleDelete = () => {
    if (!selectedUserId) return;
    fetch(rota_base + `/alunoBuscaAtiva/${selectedUserId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete user");
        setUsers(users.filter((user) => user._id !== selectedUserId));
        handleCloseDeleteDialog();
      })
      .catch((error) => console.error("Error deleting user:", error));
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

  const ejaClasses = [
    "1A - EJA", "1B - EJA", "1C - EJA",
    "2A - EJA", "2B - EJA", "2C - EJA",
    "3A - EJA", "3B - EJA", "3C - EJA",
    "4A - EJA", "4B - EJA", "4C - EJA",
    "5A - EJA", "5B - EJA", "5C - EJA",
    "6A - EJA", "6B - EJA", "6C - EJA",
    "7A - EJA", "7B - EJA", "7C - EJA",
    "8A - EJA", "8B - EJA", "8C - EJA",
    "9A - EJA", "9B - EJA", "9C - EJA",
  ];

  const rows = filteredUsers.map((user) =>
    createData(user._id, user.nome, user.turma, user.RA)
  );

  return (
    <div className="user-control">
      {permissao === "AGENTE" ? <HeaderAgente /> : <HeaderAdmin />}
      <div className="title">
        <Typography variant="h4" component="h4" className="title-text">
          Controle de Alunos
        </Typography>
        <div className="filter-container">
          <div className="filter-box">
            <TextField
              label="Busque pelo nome ou RA"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              className="compact-input"
            />
            <FormControl variant="outlined" size="small" className="compact-input">
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
              className="button"
              onClick={handleOpenDialog}
            >
              Filtros
            </Button>
          </div>
        </div>
      </div>
      {/* Dialog de Filtros */}
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
      {/* Tabela */}
      <Paper className="tabela-aluno">
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
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      if (column.id === "view")
                        return (
                          <TableCell align="center" key={column.id}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleView(row.id)}
                              startIcon={<ComputerIcon />}
                            >
                              Visualizar dados
                            </Button>
                          </TableCell>
                        );
                      if (column.id === "tarefa")
                        return (
                          <TableCell align="center" key={column.id}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleTarefa(row.id)}
                              startIcon={<TextSnippetIcon />}
                            >
                              Ver Tarefas
                            </Button>
                          </TableCell>
                        );
                      if (column.id === "delete")
                        return (
                          <TableCell align="center" key={column.id}>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleConfirmDelete(row.id)}
                              startIcon={<DeleteIcon />}
                            >
                              Excluir
                            </Button>
                          </TableCell>
                        );
                      return <TableCell key={column.id}>{value}</TableCell>;
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <div className="button-container">
        <Link to="/alunos/criar" className="create-user">
          <Button variant="contained" disableElevation>
            Criar novo aluno
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ListaAluno;
