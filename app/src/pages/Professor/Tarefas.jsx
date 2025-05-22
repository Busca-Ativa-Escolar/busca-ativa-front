import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderProfessor from './HeaderProfessor';
import HeaderAgente from '../Agente/HeaderAgente'
import HeaderAdmin from '../Admin/HeaderAdmin';
import Cookies from 'universal-cookie';
import { TextField, Button, Container, Typography, Card, CardContent, CardActions, IconButton, Select, MenuItem, InputLabel, Box, Paper, FormControl, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox, Grid } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import './static/Tarefas.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import { rota_base } from '../../constants';



const cookies = new Cookies();

function Tarefas() {
    const [aluno, setAluno] = useState({});
    const [tarefas, setTarefas] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [dataFinal, setDataFinal] = useState(dayjs());
    const [status, setStatus] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const token = cookies.get('token');
    const permissao = cookies.get('permissao');
    const { id } = useParams();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (editingTaskId) {
            editarTarefa();
        } else {
            adicionarTarefa();
        }
    };

    useEffect(() => {
        fetchAluno();
    }, [id]);

    const fetchAluno = () => {
        fetch(rota_base+`/alunoBuscaAtiva/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch aluno');
            }
            return response.json();
        })
        .then(data => {
            setAluno(data);
            setTarefas(data.tarefas || []);
        })
        .catch(error => {
            console.error('Error fetching aluno:', error);
        });
    };

    const adicionarTarefa = () => {
        const novaTarefa = {
            titulo: titulo,
            observacoes: observacoes,
            status: 'Em andamento',
            dataFinal: dataFinal,
        };

        fetch(rota_base+`/tarefas/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novaTarefa)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add task');
            }
            return response.json();
        })
        .then(data => {
            setTarefas([...tarefas, data]);
            setTitulo('');
            setObservacoes('');
            setDataFinal(dayjs());
            setShowAddTask(false);
            fetchAluno();
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    };

    const editarTarefa = () => {
        const tarefaAtualizada = {
            titulo: titulo,
            observacoes: observacoes,
            status: status,
            dataFinal: dataFinal
        };

        fetch(rota_base+`/tarefas/${id}/${editingTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tarefaAtualizada)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            return response.json();
        })
        .then(data => {
            setTarefas(tarefas.map(tarefa => tarefa._id === editingTaskId ? data : tarefa));
            setTitulo('');
            setObservacoes('');
            setDataFinal(dayjs());
            setEditingTaskId(null);
            setShowAddTask(false);
            fetchAluno();
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
    };

    const deleteTarefa = (tarefaId) => {
        fetch(rota_base+`/tarefas/${id}/${tarefaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete tarefa');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            fetchAluno();
        })
        .catch(error => {
            console.error('Error deleting tarefa:', error);
        });
    };

    const startEditing = (tarefa) => {
        setTitulo(tarefa.titulo);
        setObservacoes(tarefa.observacoes);
        setStatus(tarefa.status);
        setDataFinal(dayjs(tarefa.dataFinal));
        setEditingTaskId(tarefa._id);
        setShowAddTask(true);
    };

    const cancelEditing = () => {
        setTitulo('');
        setObservacoes('');
        setStatus('');
        setDataFinal(dayjs());
        setEditingTaskId(null);
        setShowAddTask(false);
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleStatusFilterChange = (event) => {
        const { value } = event.target;
        setStatusFilter((prev) => 
            prev.includes(value) ? prev.filter((status) => status !== value) : [...prev, value]
        );
    };

    const filteredTarefas = tarefas.filter(tarefa => 
        tarefa.titulo && tarefa.titulo.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter.length === 0 || statusFilter.includes(tarefa.status))
    );
    

    return (
        <div>
            {permissao === 'PROFESSOR' && <HeaderProfessor />}
            {permissao === 'AGENTE' && <HeaderAgente />}
            {permissao === 'ADMIN' && <HeaderAdmin />}
            <div className='user-control'>
                <Container>
                    <Box className="tarefas-header">
                        <Button variant="contained" color="secondary" onClick={() => window.history.back()}>
                            Voltar
                        </Button>
                        <Typography variant="h4" component="h1" align="center" style={{ flex: 1, textAlign: 'center' }}>
                            Tarefas
                        </Typography>
                    </Box>
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                        Informações do aluno
                    </Typography>
                    <Box className="aluno-info-container" display="flex" justifyContent="space-between">
                        <Paper elevation={3} className="aluno-info-item">
                            <Typography variant="h6" align="left">
                                Nome: {aluno.nome}
                            </Typography>
                        </Paper>
                        <Paper elevation={3} className="aluno-info-item">
                            <Typography variant="h6" align="left">
                                Turma: {aluno.turma}
                            </Typography>
                        </Paper>
                        <Paper elevation={3} className="aluno-info-item">
                            <Typography variant="h6" align="left">
                                RA: {aluno.RA}
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className="search-filter-container">
                        <TextField
                            label="Buscar por Matéria"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ marginBottom: '20px' }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FilterListIcon />}
                            onClick={handleOpenDialog}
                            style={{ marginLeft: '10px', marginBottom: '20px' }}
                        >
                            Filtros
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            if (editingTaskId) {
                                cancelEditing();
                            } else {
                                setShowAddTask(!showAddTask);
                            }
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        {showAddTask ? 'Cancelar' : 'Adicionar Tarefa'}
                    </Button>
                    <Typography variant="h6" component="h2" align="center" gutterBottom>
                        Lista de tarefas do aluno
                    </Typography>
                    {showAddTask && (
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                
                                    <TextField
                                        label="Matéria"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        style={{ marginBottom: '20px' }}
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                        <DateField
                                            label="Prazo Final"
                                            value={dataFinal}
                                            onChange={(newValue) => setDataFinal(newValue)}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <TextField
                                    label="Tarefa"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    style={{ marginBottom: '20px' }}
                                    />
                                </Grid>
                            </Grid>
                            {editingTaskId && (
                                <>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        fullWidth
                                        displayEmpty
                                        style={{ marginBottom: '20px' }}
                                    >
                                        <MenuItem value="Em andamento">Em andamento</MenuItem>
                                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                                    </Select>
                                    

                                </>
                            )}
                            <Button type="submit" variant="contained" color="primary" startIcon={editingTaskId ? <SaveIcon /> : null}>
                                {editingTaskId ? 'Salvar' : 'Enviar'}
                            </Button>
                        </form>
                    )}
                    <Box className="tarefas-container">
                        {filteredTarefas.length > 0 ? (
                            filteredTarefas.slice().reverse().map((tarefa, index) => (
                                <Card key={index} style={{ marginBottom: '20px' }}>
                                    <CardContent>
                                        <Typography variant='h6'>Matéria: {tarefa.titulo}</Typography>
                                        <Typography variant='h6'>Tarefa:</Typography>
                                        <Paper elevation={2} className="tarefa-container">
                                            <Typography variant='body1'>{tarefa.observacoes}</Typography>
                                        </Paper>
                                        <Typography variant='h6'>Prazo Final: {dayjs(tarefa.dataFinal).format('DD/MM/YYYY')}</Typography>
                                        <Typography 
                                            variant='h6' 
                                            className="status" 
                                            style={{ color: tarefa.status === 'Finalizado' ? 'green' : tarefa.status === 'Em andamento' ? 'orange' :'red' }}
                                        >
                                            {tarefa.status}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            color="primary"
                                            onClick={() => startEditing(tarefa)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => deleteTarefa(tarefa._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            ))
                        ) : (
                            <Typography variant='h6'>O aluno não possui nenhuma tarefa no momento</Typography>
                        )}
                    </Box>
                    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                        <DialogTitle>Filtros</DialogTitle>
                        <DialogContent>
                            <FormControl component="fieldset">
                                <FormControlLabel
                                    control={<Checkbox checked={statusFilter.includes('Em andamento')} onChange={handleStatusFilterChange} value="Em andamento" />}
                                    label="Em andamento"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={statusFilter.includes('Finalizado')} onChange={handleStatusFilterChange} value="Finalizado" />}
                                    label="Finalizado"
                                />
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary">
                                Fechar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </div>
        </div>
    );
}

export default Tarefas;
