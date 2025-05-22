import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import './static/CasosTable.css';
import { Icon } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ContactsIcon from '@mui/icons-material/Contacts';
import WarningIcon from '@mui/icons-material/Warning';
import ArticleIcon from '@mui/icons-material/Article';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Typography from '@mui/material/Typography';
import { rota_base } from '../../../constants';

const columns = [
    { id: 'aluno', label: 'ALUNO', minWidth: 100, format: (aluno) => aluno.nome.toUpperCase(), Icon: ContactsIcon },
    { id: 'turma', label: 'TURMA', minWidth: 100, Icon: GroupsIcon },
    { id: 'status', label: 'STATUS', minWidth: 100,  Icon: FeedbackIcon},
    { id: 'urgencia', label: 'PRIORIDADE', minWidth: 100,  Icon: WarningIcon },
    { id: 'actions', label: 'AÇÕES', minWidth: 170 , Icon: ArticleIcon}
];

const urgencyOrder = { 'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3, 'NÃO INFORMADO': 0 };

function CasosTable() {
    const [casos, setCasos] = useState([]);
    const [filteredCasos, setFilteredCasos] = useState([]);
    const [error, setError] = useState(null);
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
        fetch(rota_base+'/casos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cases');
            }
            return response.json();
        })
        .then(data => {
            setCasos(data.caso);
            setFilteredCasos(data.caso);
        })
        .catch(error => {
            setError(error.message);
        });
    }, [token]);

    useEffect(() => {
        let results = casos.filter(caso => 
            caso.aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterYears.length === 0 || filterYears.some(year => caso.aluno.turma.startsWith(year))) &&
            (filterClasses.length === 0 || filterClasses.some(cls => caso.aluno.turma.endsWith(cls))) &&
            (filterUrgency.length === 0 || filterUrgency.some(urgency => caso.urgencia.toLowerCase() === urgency.toLowerCase()))
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
    }, [searchTerm, sortOption, filterYears, filterClasses, filterUrgency, casos]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
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

    const handleUrgencyChange = (event) => {
        const { value } = event.target;
        setFilterUrgency(prev =>
            prev.includes(value) ? prev.filter(urgency => urgency !== value) : [...prev, value]
        );
    };

    const handleViewClick = (id) => {
        navigate(`/casos/${id}`);
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

    return (
        <div>
            <div className='title' style={{ display: "flex", justifyContent: "space-between" }}>
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
                            <Select
                                value={sortOption}
                                onChange={handleSortChange}
                                label="Ordenar Por"
                            >
                                <MenuItem value=""><em>Nada</em></MenuItem>
                                <MenuItem value="nameAsc">Nome (A-Z)</MenuItem>
                                <MenuItem value="nameDesc">Nome (Z-A)</MenuItem>
                                <MenuItem value="urgencyHighToLow">Prioridade (Alta - Baixa)</MenuItem>
                                <MenuItem value="urgencyLowToHigh">Prioridade (Baixa - Alta)</MenuItem>
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
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
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
                        <div className="filter-group">
                            <h4>Prioridade:</h4>
                            {['BAIXA', 'MEDIA', 'ALTA', 'INDEFINIDA'].map(urgency => (
                                <FormControlLabel
                                    key={urgency}
                                    control={<Checkbox checked={filterUrgency.includes(urgency)} onChange={handleUrgencyChange} value={urgency} />}
                                    label={urgency.charAt(0).toUpperCase() + urgency.slice(1)}
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
            <Paper className="table-container">
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                    
                    <TableHead>
                        <TableRow className="table-header">
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align="center"
                                    style={{ minWidth: column.minWidth }}
                                    className="header-cell"
                                    sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0', color: '#333' }}
                                >
                                    <div className="icon-label" style={{ paddingTop: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div className='icon' style={{ paddingRight: "3px", lineHeight: "0" }}>
                                            {column.Icon && <Icon component={column.Icon} sx={{ fontSize: 18 }} />}
                                        </div>
                                        <div>{column.label}</div>
                                    </div>
                                    {column.items && column.items.length > 0 && (
                                        <div className="column-items">
                                            {column.items.map(item => (
                                                <div key={item}>{item}</div>
                                            ))}
                                        </div>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                        <TableBody>
                            {filteredCasos
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((caso, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={caso._id}>
                                            {columns.map((column) => {
                                                let value;
                                                if (column.id === 'turma') {
                                                    value = caso.aluno.turma;
                                                } else if (column.id === 'actions') {
                                                    value = (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleViewClick(caso._id)}
                                                        >
                                                            Visualizar ficha
                                                        </Button>
                                                    );
                                                } else {
                                                    value = column.id === 'index' ? index + page * rowsPerPage : caso[column.id];
                                                }

                                                // Determine class names for status and urgency
                                                const classNames = [];
                                                if (column.id === 'status') {
                                                    classNames.push('status', value.toLowerCase());
                                                } else if (column.id === 'urgencia') {
                                                    classNames.push('urgencia', value.toLowerCase());
                                                } else if (column.id === 'actions') {
                                                    classNames.push('actions');
                                                } else if (column.id === 'turma') {
                                                    classNames.push('turma');
                                                }

                                                var isStatus = column.id === 'status';
                                                var isUrgency = column.id === 'urgencia';
                                                return (
                                                    <TableCell key={column.id} align="center" className={classNames.join(' ')}>
                                                        {(() => {
                                                            if (isStatus && value === 'EM ABERTO') {
                                                                return <div className="status-dot-aberto">{value}</div>;
                                                            } else if (isStatus && value === 'FINALIZADO') {
                                                                return <div className="status-dot-finalizado">{value}</div>;
                                                            } else if (isUrgency && value === 'ALTA') {
                                                                return <div className="urgency-dot-alta">{value}</div>;
                                                            } else if (isUrgency && value === 'MEDIA') {
                                                                return <div className="urgency-dot-media">{value}</div>;
                                                            } else if (isUrgency && value === 'BAIXA') {
                                                                return <div className="urgency-dot-baixa">{value}</div>;
                                                            } else if (isUrgency && value === 'NÃO INFORMADO') {
                                                                return <div className="urgency-dot-nao-informado">{value}</div>;

                                                            } else if (column.format && typeof value === 'object') {
                                                                return column.format(value);
                                                            } else {
                                                                return value;
                                                            }
                                                        })()}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
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