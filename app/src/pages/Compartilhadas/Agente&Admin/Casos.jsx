import { Button, Container, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Box, Popper, Checkbox, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import { DataGrid } from '@mui/x-data-grid'
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import { useParams } from 'react-router-dom';
import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import { rota_base } from '../../../constants';


const cookies = new Cookies();

export default function Casos() {

    //Inicializas as variáveis que serão usado no componente
    const { id } = useParams();
    const permissao = cookies.get('permissao');
    const [idAluno, setIdAluno] = useState();
    const [isIdAlunoLoaded, setIsIdAlunoLoaded] = useState(false)
    const [dataAluno, setDataAluno] = useState();
    const [dataCasos, setDataCasos] = useState([]);
    const [urgencia, setUrgencia] = useState('');
    const [status, setStatus] = useState('');
    const [ligacoes, setLigacoes] = useState([])
    const [visitas, setVisitas] = useState([])
    const [atendimentos, setAtendimentos] = useState([])
    const token = cookies.get('token');
    const [selectedRowsLig, setSelectedRowsLig] = useState([]);
    const [selectedRowsVis, setSelectedRowsVis] = useState([]);
    const [selectedRowsAtendimento, setSelectedRowsAtendimento] = useState([]);
    const [selectedRowsTarefas, setSelectedRowsTarefas] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [anchorLig, setAnchorLig] = useState(null);
    const [anchorVis, setAnchorVis] = useState(null);
    const [anchorAtendimento, setAnchorAtendimento] = useState(null);
    const openLig = Boolean(anchorLig);
    const openVis = Boolean(anchorVis);
    const openAtendimento = Boolean(anchorAtendimento);
    const [selectedYear, setSelectedYear] = useState([dayjs().year()]);
    const [tarefas, setTarefas] = useState([]);


    //Criação das colunas para a tabela de ligacoes
    const columnsLig = [
        { field: 'data', headerName: 'Data', width: 200 },
        { field: 'abae', headerName: 'ABAE Responsável', width: 200 },
        { field: 'telefone', headerName: 'Telefone', width: 200 },
        { field: 'observacao', headerName: 'Observações', width: 200 },
    ];
      
    //Criação das linhas para a tabela de visitas
    const rowsLig = ligacoes.map((lig, index) => ({
        id: index,
        data: lig.data ? new Date(lig.data).toLocaleDateString('pt-BR') : '',
        abae: lig.abae,
        telefone: lig.telefone,
        observacao:lig.observacao
    }));

    //Criação das colunas para a tabela de visitas
    const columnsVis = [
        { field: 'data', headerName: 'Data', width: 200 },
        { field: 'abae', headerName: 'ABAE Responsável', width: 200 },
        { field: 'observacao', headerName: 'Observações', width: 200 },
      ];
    
    //Criação das linhas para a tabela de visitas
    const rowsVis = visitas.map((vis, index) => ({
        id: index,
        data: vis.data ? new Date(vis.data).toLocaleDateString('pt-BR') : '',
        abae: vis.abae,
        observacao:vis.observacao
    }));

    //Criação das colunas para a tabela de atendimentos
    const columnsAtendimento = [
        { field: 'data', headerName: 'Data', width: 200 }, 
        { field: 'func', headerName: 'Feito por', width: 200 },
        { field: 'responsavel', headerName: 'Responsável', width: 200 },
        { field: 'observacao', headerName: 'Observações', width: 200 },
    ];
    
    //Criação das linhas para a tabela de atendimentos
    const rowsAtendimento = atendimentos.map((atendimento, index) => ({
        id: index,
        data: atendimento.data ? new Date(atendimento.data).toLocaleDateString('pt-BR') : '',
        func: atendimento.func,
        responsavel: atendimento.responsavel,
        observacao: atendimento.observacao,
    }));

    const columnsTarefas = [
        { field: 'titulo', headerName: 'Matéria', width: 200 },
        { field: 'status', headerName: 'Status', width: 200 },
        { field: 'dataFinal', headerName: 'Data de Entrega', width: 200 },
        { field: 'observacoes', headerName: 'Descrição', width: 200 },
    ];

    const rowsTarefas = tarefas.map((tarefa, index) => ({
        id: index,
        titulo: tarefa.titulo,
        status: tarefa.status,
        dataFinal: tarefa.dataFinal ? new Date(tarefa.dataFinal).toLocaleDateString('pt-BR') : '',
        observacoes: tarefa.observacoes,
    }));




    const handleYearChange = (event) => {
        const value = event.target.value;
        setSelectedYear(value);
    };


    const filterDataByYear = (data, year) => {
        return data.filter(item => {
            const date = dayjs(item.data, 'DD/MM/YYYY');
            const itemYear = date.year();
            return year.includes(itemYear);
        });
    };

    const [valueTabs, setValueTabs] = useState(0);


    const [formData, setFormData] = useState({
        abae: '',
        data: dayjs(),
        telefone: '',
        observacao: '',
        func: '',
        responsavel: '',
    });


    useEffect(() => {
        loadUsuario();
        loadIdAluno();
    }, [id]);

    useEffect(() => {
        if (isIdAlunoLoaded){
            loadCasos();
            loadAluno();
        }
    }, [idAluno, isIdAlunoLoaded]);

    function loadIdAluno(){
        fetch(rota_base+`/alunoBuscaAtiva/caso/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json())
        .then(data => {
            setIdAluno(data._id)
            setIsIdAlunoLoaded(true)
        })
        .catch(response => {
            alert('Erro ao achar o aluno!');
            alert(response.status);
        });
    }



    function loadCasos() {
        if (!isIdAlunoLoaded){
            return;
        }
        fetch(rota_base+`/casos?aluno_id=${idAluno}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            setDataCasos(data.caso[0]);
            setStatus(data.caso[0].status)
            setUrgencia(data.caso[0].urgencia)
            setLigacoes(data.caso[0].ligacoes)
            setVisitas(data.caso[0].visitas)
            setAtendimentos(data.caso[0].atendimentos)
            
            
        })
        .catch(response => {
            alert('Erro ao achar os casos do aluno!');
            alert(response.status);
        });
    }
    
    function loadAluno() {
        if (!isIdAlunoLoaded){
            return;
        }
        fetch(rota_base+`/alunoBuscaAtiva/${idAluno}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                data.dataNascimento = new Date(data.dataNascimento).toLocaleDateString('pt-BR');
                setDataAluno(data);
                setTarefas(data.tarefas);
            })
            .catch(response => {
                alert('Erro ao achar aluno!');
                alert(response.status);
            });
    }

    

    function loadUsuario(){

        fetch(rota_base+'/usuarios-dados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:   JSON.stringify({"token": token})
        }).then(response => response.json())
        .then(data => {
            console.log(data)
            setUsuario(data.nome)
            console.log(usuario)
        })

    }



    function gerarRealatorio() {
        console.log(usuario)
        fetch(rota_base+'/casos/gerar-relatorio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "dre": "DRE-IP",
                "unidade_escolar": "EMEF - LUIZ GONZAGA DO NASCIMENTO JUNIOR - GONZAGUINHA",
                "endereco": "Das Laranjeiras, 1029 - IPIRANGA",
                "contato": dataAluno.telefone,
                "turma": dataAluno.turma,
                "estudante": dataAluno.nome,
                "ra": dataAluno.RA,
                "usuario": usuario,
                "ligacoes": selectedRowsLig,
                "visitas": selectedRowsVis,
                "atendimentos": selectedRowsAtendimento,
                "tarefas": selectedRowsTarefas
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
        setSelectedRowsLig([]);
        setSelectedRowsVis([]);
        setSelectedRowsAtendimento([]);
        setSelectedRowsTarefas([]);
    }
    

    
    function clickSU(newStatus, newUrgencia) {
        const casoData = {
            urgencia: newUrgencia,
            status: newStatus,
        }
   

        fetch(rota_base+'/casos/' + dataCasos._id , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(casoData),
        }).then(response => {
            if (!response.ok){
              throw new Error('Erro ao atualizar informações do caso');
            }
            alert('Informações atualizadas com sucesso');
    
        }).catch(response => {
            alert('Erro ao atualizar informações do caso');
            alert(response.status);
        })
    }
    

    
    const handleSubmitLig = async (e) => {
        e.preventDefault();
        const casoData = {
            abae: formData.abae,
            data: formData.data,
            telefone: formData.telefone,
            observacao: formData.observacao,
            ligacao: true,
            visita: false,

        };
        try {
            const response = await fetch(rota_base+'/casos/' + dataCasos._id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(casoData),
            });

            if (!response.ok) {
                throw new Error('Erro no cadastramento do caso');
            }

            const data = await response.json();
            console.log('Cadastro realizado com sucesso:', data);
            alert('Cadastro realizado com sucesso');
            setFormData({
                abae: '',
                data: dayjs(),
                telefone: '',
                observacao: '',

            });
            loadCasos()
            loadAluno()
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar o caso');
        }
    };

    const handleSubmitVis = async (e) => {
        e.preventDefault();
        const casoData = {
            abae: formData.abae,
            data: formData.data,
            observacao: formData.observacao,
            visita: true,
            ligacao:false

        };
        try {
            const response = await fetch(rota_base+'/casos/' + dataCasos._id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(casoData),
            });

            if (!response.ok) {
                throw new Error('Erro no cadastramento do caso');
            }

            const data = await response.json();
            console.log('Cadastro realizado com sucesso:', data);
            alert('Cadastro realizado com sucesso');
            setFormData({
                abae: '',
                data: dayjs(),
                observacao: '',

            });
            loadCasos()
            loadAluno()
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar o caso');
        }
    };

    const handleSubmitAtendimento = async (e) => {
        e.preventDefault();
        const casoData = {
            func: formData.func,
            data: formData.data,
            responsavel: formData.responsavel,
            observacao: formData.observacao,
            atendimento: true,
        };
        try {
            const response = await fetch(rota_base+'/casos/' + dataCasos._id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(casoData),
            });
    
            if (!response.ok) {
                throw new Error('Erro no cadastramento do caso');
            }
    
            const data = await response.json();
            console.log('Cadastro realizado com sucesso:', data);
            alert('Cadastro realizado com sucesso');
            setFormData({
                abae: '',
                data: dayjs(),
                observacao: '',
            });
            loadCasos();
            loadAluno();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar o caso');
        }
    };
    



    function clickAtendimento(event) {
        setAnchorAtendimento(anchorAtendimento ? null : event.currentTarget);
    }


    function clickLigacao(event) {
        setAnchorLig(anchorLig ? null : event.currentTarget);
    }

    function clickVisita(event) {
        setAnchorVis(anchorVis ? null : event.currentTarget);
    }

    const handleCloseVis = () => {
        setAnchorVis(null);
    };

    const handleCloseAten = () => {
        setAnchorAtendimento(null);
    };

    const handleCloseLig = () => {
        setAnchorLig(null);
    };

    const handleChangeStatus = (event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        clickSU(newStatus, urgencia);
    };

    const handleChangeUrgencia = (event) => {
        const newUrgencia = event.target.value
        setUrgencia(newUrgencia);
        clickSU(status, newUrgencia)
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            data: date,
        });
    };

    
    const handleChangeTabs = (event, newValue) => {
      setValueTabs(newValue);
    }

    return (
        <div className='card'>
            {permissao === 'AGENTE' ? <HeaderAgente /> : <HeaderAdmin />}
            <Grid container columnSpacing={2} rowSpacing={1}>
                <Grid item xs={12} style={{ textAlign: "center", paddingTop: "50px" }}>
                    Informações do Aluno
                </Grid>
                <Grid item xs={12} style={{ paddingTop: "40px", margin: "0px 100px" }}>
                    <Grid container spacing={2} style={{ textAlign: "center", border: "1px solid black", borderRadius: "10px" }}>
                        <Grid item xs={4}>Nome: {dataAluno?.nome}</Grid>
                        <Grid item xs={4}>Turma: {dataAluno?.turma}</Grid>
                        <Grid item xs={4}>Data de Nascimento: {dataAluno?.dataNascimento}</Grid>
                        <Grid item xs={4}>RA: {dataAluno?.RA}</Grid>
                        <Grid item xs={4}>Endereço: {dataAluno?.endereco}</Grid>
                        <Grid item xs={4}>Telefone: {dataAluno?.telefone}</Grid>
                        
                    </Grid>
                </Grid>
                <Grid item xs={12} style={{ textAlign: "center", paddingTop: "50px", margin: "0px 100px" }}>
                    <Grid container spacing={2} style={{ textAlign: "center", border: "1px solid black", borderRadius: "10px" }}>
                        <Grid item xs={12} style={{ textAlign: "center" }}>Ficha do Aluno</Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="status-select-label">Status</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    id="status-select"
                                    label="Status"
                                    value={status}
                                    onChange={handleChangeStatus}
                                    defaultValue={dataCasos.status}
                                >
                                    <MenuItem value={"FINALIZADO"}>Finalizado</MenuItem>
                                    <MenuItem value={"EM ABERTO"}>Em aberto</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="urgencia-select-label">Urgência</InputLabel>
                                <Select
                                    labelId="urgencia-select-label"
                                    id="urgencia-select"
                                    label="Urgência"
                                    value={urgencia}
                                    onChange={handleChangeUrgencia}
                                    defaultValue={dataCasos.urgencia}
                                >
                                    <MenuItem value={"BAIXA"}>Baixa</MenuItem>
                                    <MenuItem value={"MEDIA"}>Média</MenuItem>
                                    <MenuItem value={"ALTA"}>Alta</MenuItem>
                                    <MenuItem value={"INDEFINIDA"}>Indefinida</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <Button onClick={clickLigacao}>Adicionar Ligação</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button onClick={clickVisita}>Adicionar Visita</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button onClick={clickAtendimento}>Adicionar Atendimento aos Pais</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Popper open={openLig} anchorEl={anchorLig} placement="bottom" modifiers={[{ name: 'offset', options: { offset: [0, 40] } }]} >
                                <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }} style={{borderRadius:"10px"}}>
                                    <Button 
                                        onClick={handleCloseLig} 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '10px', 
                                            right: '10px', 
                                            background: 'none', 
                                            border: 'none', 
                                            fontSize: '30px', 
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        &times;
                                    </Button>
                                    
                                    <Grid container item xs={12} style={{ alignContent: "rigth", background: "lightgrey", borderRadius: "10px", padding: "10px" }}>
                                        <Container maxWidth="xs">
                                            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography component="h1" variant="h5">
                                                    Informações sobre a ligação
                                                </Typography>
                                                <Box component="form" onSubmit={handleSubmitLig} sx={{ mt: 3 }}>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="abae"
                                                        label="ABAE Responsável"
                                                        name="abae"
                                                        value={formData.abae}
                                                        onChange={handleChange}
                                                        autoComplete="ABAE Responsável"
                                                    />
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                                        <DateField
                                                            label="Data da Ligação"
                                                            value={formData.data}
                                                            onChange={(newDate) => handleDateChange(newDate)}
                                                        />
                                                    </LocalizationProvider>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="telefone"
                                                        label="Telefone"
                                                        name="telefone"
                                                        value={formData.telefone}
                                                        onChange={handleChange}
                                                        autoComplete="Telefone"
                                                    />
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="observacao"
                                                        label="Observação"
                                                        name="observacao"
                                                        value={formData.observacao}
                                                        onChange={handleChange}
                                                        autoComplete="Observação"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        fullWidth
                                                        variant="contained"
                                                        sx={{ mt: 3, mb: 2 }}
                                                    >
                                                        Salvar
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Container>
                                    </Grid>
                                </Box>
                            </Popper>
                        </Grid>
                        <Grid item xs={12}>
                            <Popper open={openVis} anchorEl={anchorVis} placement="bottom" modifiers={[{ name: 'offset', options: { offset: [0, 40] } }]}>
                                <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }} style={{borderRadius:"10px"}} >
                                    <Button 
                                        onClick={handleCloseVis} 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '10px', 
                                            right: '10px', 
                                            background: 'none', 
                                            border: 'none', 
                                            fontSize: '30px', 
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        &times;
                                    </Button>

                                    <Grid container item xs={12} style={{ alignContent: "rigth", background: "lightgrey", borderRadius: "10px", padding: "10px" }}>
                                        <Container maxWidth="xs">
                                            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography component="h1" variant="h5">
                                                    Informações sobre a visita
                                                </Typography>
                                                <Box component="form" onSubmit={handleSubmitVis} sx={{ mt: 3 }}>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="abae"
                                                        label="ABAE Responsável"
                                                        name="abae"
                                                        value={formData.abae}
                                                        onChange={handleChange}
                                                        autoComplete="ABAE Responsável"
                                                    />
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                                        <DateField
                                                            label="Data da Visita"
                                                            value={formData.data}
                                                            onChange={(newDate) => handleDateChange(newDate)}
                                                        />
                                                    </LocalizationProvider>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="observacao"
                                                        label="Observação"
                                                        name="observacao"
                                                        value={formData.observacao}
                                                        onChange={handleChange}
                                                        autoComplete="Observação"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        fullWidth
                                                        variant="contained"
                                                        sx={{ mt: 3, mb: 2 }}
                                                    >
                                                        Salvar
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Container>
                                    </Grid>
                                </Box>
                            </Popper>
                        </Grid>
                        <Grid item xs={12}>
                            <Popper open={openAtendimento} anchorEl={anchorAtendimento} placement="bottom" modifiers={[{ name: 'offset', options: { offset: [0, 40] } }]} >
                                <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }} style={{borderRadius:"10px"}}>
                                    <Button 
                                    onClick={handleCloseAten} 
                                    style={{ 
                                        position: 'absolute', 
                                        top: '10px', 
                                        right: '10px', 
                                        background: 'none', 
                                        border: 'none', 
                                        fontSize: '30px', 
                                        cursor: 'pointer' 
                                    }}
                                    >
                                    &times;
                                    </Button>
                                    <Grid container item xs={12} style={{ alignContent: "rigth", background: "lightgrey", borderRadius: "10px", padding: "10px" }}>
                                        <Container maxWidth="xs">
                                            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography component="h1" variant="h5">
                                                    Informações sobre o Atendimento aos Pais
                                                </Typography>
                                                <Box component="form" onSubmit={handleSubmitAtendimento} sx={{ mt: 3 }}>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="func"
                                                        label="Atendimento feito por"
                                                        name="func"
                                                        value={formData.func}
                                                        onChange={handleChange}
                                                        autoComplete="Atendimento feito por"
                                                    />
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                                                        <DateField
                                                            label="Data do Atendimento"
                                                            value={formData.data}
                                                            onChange={(newDate) => handleDateChange(newDate)}
                                                        />
                                                    </LocalizationProvider>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="responsavel"
                                                        label="Responsável Presente"
                                                        name="responsavel"
                                                        value={formData.responsavel}
                                                        onChange={handleChange}
                                                        autoComplete="Responsável Presente"
                                                    />
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="observacao"
                                                        label="Observação"
                                                        name="observacao"
                                                        value={formData.observacao}
                                                        onChange={handleChange}
                                                        autoComplete="Observação"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        fullWidth
                                                        variant="contained"
                                                        sx={{ mt: 3, mb: 2 }}
                                                    >
                                                        Salvar
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Container>
                                    </Grid>
                                </Box>
                            </Popper>
                        </Grid>

                        <Grid item xs={12} style={{ textAlign: "center" }}>Histórico da Busca Ativa</Grid>
                        <Grid item xs={3} style={{ textAlign: "center", padding: "10px" }}>
                            <FormControl fullWidth>
                                <InputLabel id="year-select-label">Anos</InputLabel>
                                <Select
                                    labelId="year-select-label"
                                    id="year-select"
                                    multiple
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {[...Array(10)].map((_, index) => {
                                        const year = dayjs().year() - index;
                                        return (
                                            <MenuItem key={year} value={year}>
                                                <Checkbox checked={selectedYear.indexOf(year) > -1} />
                                                <ListItemText primary={year} />
                                            </MenuItem>
                                        );
                                    })}
                                    
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} style={{ textAlign: "center" }}>
                            <Button onClick={gerarRealatorio}>Gerar Relatório</Button>
                        </Grid>

                        <Grid container item xs={12} >
                            <TabContext value={valueTabs}>
                                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                <TabList onChange={handleChangeTabs} aria-label="tabs example">
                                    <Tab label="Ligação" value="0" />
                                    <Tab label="Visita" value="1" />
                                    <Tab label="Atendimento aos Pais" value="2" />
                                    <Tab label="Tarefas" value="3" />
                                </TabList>
                                </Box>
                                <TabPanel value="0" >
                                    
                                    <Box sx={{ height: 400, width: "100%"}}>
                                        <DataGrid rows={filterDataByYear(rowsLig, selectedYear)} columns={columnsLig} pageSize={5} checkboxSelection
                                        onRowSelectionModelChange={(ids) => {
                                            const auxselectedRowsLig = (ids.map((id) => rowsLig.find((row) => row.id === id)));
                                            setSelectedRowsLig(auxselectedRowsLig);
[]                                          }}
                                        rowSelectionModel={selectedRowsLig.map((row) => row.id)}
                                        />
                                    </Box>
                                </TabPanel>
                                <TabPanel value="1">
                                
                                    <Box sx={{ height: 400, width: "100%"}}>
                                        <DataGrid rows={filterDataByYear(rowsVis, selectedYear)} columns={columnsVis} pageSize={5} checkboxSelection
                                        onRowSelectionModelChange={(ids) => {
                                            const auxselectedRowsVis = ids.map((id) => rowsVis.find((row) => row.id === id));
                                            setSelectedRowsVis(auxselectedRowsVis);
                                            console.log(selectedRowsVis);
                                            
[]                                          }}
                                            
                                            rowSelectionModel={selectedRowsVis.map((row) => row.id)}
                                        />
                                    </Box>
                                </TabPanel>
                                <TabPanel value="2">
                                    
                                    <Box sx={{ height: 400, width: "100%" }}>
                                        <DataGrid rows={filterDataByYear(rowsAtendimento, selectedYear)} columns={columnsAtendimento} pageSize={5} checkboxSelection
                                        onRowSelectionModelChange={(ids) => {
                                            const auxselectedRowsAtendimento= ids.map((id) => rowsAtendimento.find((row) => row.id === id));
                                            setSelectedRowsAtendimento(auxselectedRowsAtendimento);
                                            console.log(selectedRowsAtendimento);
[]                                          }}
                                            rowSelectionModel={selectedRowsAtendimento.map((row) => row.id)}
                                         />
                                         
                                    </Box>
                                </TabPanel>
                                <TabPanel value="3">
                                    
                                    <Box sx={{ height: 400, width: "100%" }}>
                                        <DataGrid rows={filterDataByYear(rowsTarefas, selectedYear)} columns={columnsTarefas} pageSize={5} checkboxSelection
                                        onRowSelectionModelChange={(ids) => {
                                            const auxselectedRowsTarefa= ids.map((id) => rowsTarefas.find((row) => row.id === id));
                                            selectedRowsTarefas(auxselectedRowsTarefa);
                                            console.log(selectedRowsAtendimento);
[]                                          }}
                                            rowSelectionModel={selectedRowsTarefas.map((row) => row.id)}
                                         />
                                    </Box>
                                </TabPanel>
                            </TabContext>
                        </Grid>
                    </Grid>
                    
                </Grid>
            </Grid>
        </div>
    );
}
