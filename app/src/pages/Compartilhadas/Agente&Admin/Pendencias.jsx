import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Link, useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import ContactsIcon from '@mui/icons-material/Contacts';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ComputerIcon from '@mui/icons-material/Computer';

import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import './static/ListaAluno.css';
import { rota_base } from '../../../constants';



const columns = [
  { id: 'nome', label: 'NOME', minWidth: 100 },
  { id: 'turma', label: 'TURMA', minWidth: 100 },
  { id: 'RA', label: 'RA', minWidth: 100 },
  { id: 'view', label: 'VISUALIZAR DADOS', minWidth: 150 },
  { id: 'tarefa', label: 'TAREFA', minWidth: 100 },
  { id: 'delete', label: 'DELETAR', minWidth: 100 },
];

function createData(id, nome, turma, RA) {
  return { id, nome, turma, RA };
}

const cookies = new Cookies();

function Pendencias() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYears, setFilterYears] = useState([]);
  const [filterClasses, setFilterClasses] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const token = cookies.get('token');
  const permissao = cookies.get('permissao');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch(rota_base+'/alunoBuscaAtiva/incompleto', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      })
      .then(data => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };

  useEffect(() => {
    let results = users.filter(user =>
      (user.nome.toLowerCase().includes(searchTerm.toLowerCase()) || user.RA && String(user.RA).includes(searchTerm)) &&
      (filterYears.length === 0 || filterYears.some(year => user.turma.startsWith(year))) &&
      (filterClasses.length === 0 || filterClasses.some(cls => user.turma.endsWith(cls)))
    );

    if (sortOption === "nameAsc") {
      results.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortOption === "nameDesc") {
      results.sort((a, b) => b.nome.localeCompare(a.nome));
    }

    setFilteredUsers(results);
  }, [searchTerm, filterYears, filterClasses, sortOption, users]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleYearChange = (event) => {
    const { value } = event.target;
    setFilterYears(prev =>
      prev.includes(value) ? prev.filter(year => year !== value) : [...prev, value]
    );
  };

  const handleClassChange = (event) => {
    const { value } = event.target;
    setFilterClasses(prev =>
      prev.includes(value) ? prev.filter(cls => cls !== value) : [...prev, value]
    );
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleView = (id) => {
    navigate(`/alunos/${id}`);
  };

  const handleTarefa = (id) => {
    navigate(`/tarefas/${id}`);
  };

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
  
    fetch(rota_base+`/alunoBuscaAtiva/${selectedUserId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        setUsers(users.filter(user => user._id !== selectedUserId));
        handleCloseDeleteDialog();
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows = filteredUsers.map(user => {
    return createData(user._id, user.nome, user.turma, user.RA);
  });

  return (
    <div className='user-control'>
      {permissao === 'AGENTE' ? <HeaderAgente /> : <HeaderAdmin />}
      <div className='title'>
        <Typography 
          variant="h4" 
          component="h4" 
          style={{ 
            marginBottom: '10px', 
            textAlign: 'center', 
            fontFamily: 'Roboto, sans-serif', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            paddingLeft: "2%"
          }}
        >
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
      <Dialog className='tabela-aluno' open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <div className="filter-section">
            <div className="filter-group">
              <h4>Ano:</h4>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(year => (
                <FormControlLabel
                  key={year}
                  control={<Checkbox checked={filterYears.includes(year)} onChange={handleYearChange} value={year} />}
                  label={`${year}° Ano`}
                />
              ))}
            </div>
            <div className="filter-group">
              <h4>Turma:</h4>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(cls => (
                <FormControlLabel
                  key={cls}
                  control={<Checkbox checked={filterClasses.includes(cls)} onChange={handleClassChange} value={cls} />}
                  label={cls}
                />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      <Paper className="tabela-aluno">
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0', color: '#333' }}
                  >
                    {column.id === 'RA' ? (
                      <div className='icon-admin'>
                        <ContactsIcon />
                        {column.label}
                      </div>
                    ) : column.id === "turma" ? (
                      <div className="icon-email">
                        <GroupsIcon />
                        {column.label}
                      </div>
                    ) : column.id === "nome" ? (
                      <div className="icon-nome">
                        <BadgeIcon />
                        {column.label}
                      </div>
                    ) : column.id === "view" ? (
                      <div className="icon-edit">
                        <TextSnippetIcon />
                        {column.label}
                      </div>
                    ): column.id === "tarefa" ? (
                      <div className="icon-tarefa">
                        <TextSnippetIcon />
                        {column.label}
                      </div>
                    ) : column.id === "delete" ? (
                      <div className="icon-delete">
                        <DeleteIcon />
                        {column.label}
                      </div>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow 
                    hover 
                    role="checkbox" 
                    tabIndex={-1} 
                    key={row.id} 
                    sx={{ backgroundColor: index % 2 === 0 ? 'white' : '#f0f0f0' }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === 'view' ? (
                            <Button 
                              variant="contained" 
                              color="primary" 
                              style={{ backgroundColor: '#007bff', color: 'white' }}
                              startIcon={<ComputerIcon />}
                              onClick={() => handleView(row.id)}
                            >
                              Visualizar dados
                            </Button>
                          ) : column.id === 'tarefa' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              style={{ backgroundColor: '#007bff', color: 'white' }}
                              startIcon={<TextSnippetIcon />}
                              onClick={() => handleTarefa(row.id)}
                            >
                              Ver Tarefas
                            </Button>
                          ) : column.id === 'delete' ? (
                            <Button 
                              variant="contained" 
                              className='delete-button'
                              startIcon={<DeleteIcon />}
                              onClick={() => handleConfirmDelete(row.id)}
                              sx = {{ backgroundColor: 'red', color: 'white' }}
                            >
                              Deletar
                            </Button>
                          ) : (
                            value
                          )}
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
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este aluno?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Pendencias;
