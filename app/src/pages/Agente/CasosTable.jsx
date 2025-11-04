import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, MenuItem, Select, InputLabel,
  FormControl, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Checkbox, FormControlLabel, Typography
} from '@mui/material';
import { Icon } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ContactsIcon from '@mui/icons-material/Contacts';
import WarningIcon from '@mui/icons-material/Warning';
import ArticleIcon from '@mui/icons-material/Article';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { rota_base } from '../../constants';
import './static/CasosTable.css';

const columns = [
  { id: 'aluno', label: 'ALUNO', minWidth: 100, format: (aluno) => aluno.nome.toUpperCase(), Icon: ContactsIcon },
  { id: 'turma', label: 'TURMA', minWidth: 100, Icon: GroupsIcon },
  { id: 'status', label: 'STATUS', minWidth: 100, Icon: FeedbackIcon },
  { id: 'urgencia', label: 'PRIORIDADE', minWidth: 100, Icon: WarningIcon },
  { id: 'actions', label: 'AÇÕES', minWidth: 170, Icon: ArticleIcon }
];

const urgencyOrder = { 'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3, 'NÃO INFORMADO': 0 };

function CasosTable() {
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYears, setFilterYears] = useState([]);
  const [filterClasses, setFilterClasses] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const cookies = new Cookies();
  const token = cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(rota_base + '/casos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch cases');
        return response.json();
      })
      .then(data => {
        setCasos(data.caso);
        setFilteredCasos(data.caso);
      })
      .catch(error => console.error(error));
  }, [token]);

  useEffect(() => {
    let results = casos.filter(caso =>
      caso.aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterYears.length === 0 || filterYears.some(year => caso.aluno.turma.startsWith(year))) &&
      (filterClasses.length === 0 || filterClasses.some(cls => caso.aluno.turma.endsWith(cls))) &&
      (filterUrgency.length === 0 || filterUrgency.some(urgency => caso.urgencia.toLowerCase() === urgency.toLowerCase()))
    );

    if (sortOption === "nameAsc") results.sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome));
    else if (sortOption === "nameDesc") results.sort((a, b) => b.aluno.nome.localeCompare(a.aluno.nome));
    else if (sortOption === "urgencyHighToLow") results.sort((a, b) => urgencyOrder[b.urgencia] - urgencyOrder[a.urgencia]);
    else if (sortOption === "urgencyLowToHigh") results.sort((a, b) => urgencyOrder[a.urgencia] - urgencyOrder[b.urgencia]);

    setFilteredCasos(results);
  }, [searchTerm, sortOption, filterYears, filterClasses, filterUrgency, casos]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleYearChange = (e) => {
    const { value } = e.target;
    setFilterYears(prev => prev.includes(value) ? prev.filter(y => y !== value) : [...prev, value]);
  };
  const handleClassChange = (e) => {
    const { value } = e.target;
    setFilterClasses(prev => prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]);
  };
  const handleUrgencyChange = (e) => {
    const { value } = e.target;
    setFilterUrgency(prev => prev.includes(value) ? prev.filter(u => u !== value) : [...prev, value]);
  };

  const handleViewClick = (id) => navigate(`/paginaAluno/${id}`);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // ==== BADGES ====
  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge status-nenhum">SEM STATUS</span>;
    const s = status.toUpperCase();
    if (s === "EM ABERTO") return <span className="status-badge status-aberto">EM ABERTO</span>;
    if (s === "FINALIZADO") return <span className="status-badge status-finalizado">FINALIZADO</span>;
    return <span className="status-badge status-nenhum">{s}</span>;
  };

  const getUrgenciaBadge = (urgencia) => {
    if (!urgencia) return <span className="urgencia-badge urgencia-indefinida">INDEFINIDA</span>;
    const u = urgencia.toUpperCase();
    if (u === "ALTA") return <span className="urgencia-badge urgencia-alta">ALTA</span>;
    if (u === "MEDIA") return <span className="urgencia-badge urgencia-media">MÉDIA</span>;
    if (u === "BAIXA") return <span className="urgencia-badge urgencia-baixa">BAIXA</span>;
    return <span className="urgencia-badge urgencia-indefinida">{u}</span>;
  };

  return (
    <div>
      <div className='title' style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" component="h4" sx={{ mb: 1, textAlign: "center", fontWeight: "bold", textTransform: "uppercase", pl: "2%" }}>
          Controle de Casos
        </Typography>
        <div className="filter-container">
          <div className="filter-box">
            <TextField label="Busque Pelo Nome" variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange} className="compact-input" />
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
            <Button variant="contained" size="small" onClick={handleOpenDialog}>Filtros</Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <div className="filter-section">
            <div className="filter-group">
              <h4>Ano:</h4>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(year => (
                <FormControlLabel key={year} control={<Checkbox checked={filterYears.includes(year)} onChange={handleYearChange} value={year} />} label={`${year}° Ano`} />
              ))}
            </div>
            <div className="filter-group">
              <h4>Turma:</h4>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(cls => (
                <FormControlLabel key={cls} control={<Checkbox checked={filterClasses.includes(cls)} onChange={handleClassChange} value={cls} />} label={cls} />
              ))}
            </div>
            <div className="filter-group">
              <h4>Prioridade:</h4>
              {['BAIXA', 'MEDIA', 'ALTA', 'NÃO INFORMADO'].map(urgency => (
                <FormControlLabel key={urgency} control={<Checkbox checked={filterUrgency.includes(urgency)} onChange={handleUrgencyChange} value={urgency} />} label={urgency.charAt(0).toUpperCase() + urgency.slice(1)} />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>

      <Paper className="table-container">
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell key={column.id} align="center" className="header-cell">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {column.Icon && <Icon component={column.Icon} sx={{ fontSize: 18, mr: 1 }} />}
                      {column.label}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCasos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((caso) => (
                <TableRow hover key={caso._id}>
                  {columns.map((column) => {
                    let value;
                    if (column.id === 'turma') value = caso.aluno.turma;
                    else if (column.id === 'status') value = getStatusBadge(caso.status);
                    else if (column.id === 'urgencia') value = getUrgenciaBadge(caso.urgencia);
                    else if (column.id === 'actions') {
                      value = (
                        <Button variant="contained" color="primary" onClick={() => handleViewClick(caso._id)}>
                          Visualizar ficha
                        </Button>
                      );
                    } else if (column.id === 'aluno') value = column.format ? column.format(caso.aluno) : caso.aluno.nome;
                    else value = caso[column.id];
                    return <TableCell key={column.id} align="center">{value}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[10, 25, 100]} component="div" count={filteredCasos.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Paper>
    </div>
  );
}

export default CasosTable;
