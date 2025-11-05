import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Grid, InputLabel, Select, FormControl, MenuItem } from '@mui/material';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { rota_base } from '../../../constants';

dayjs.extend(customParseFormat);
const cookies = new Cookies();

const CadastroAluno = () => {
  const token = cookies.get('token');
  const permissao = cookies.get('permissao');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Por favor, selecione pelo menos um arquivo Excel.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    setLoading(true);
    try {
      const response = await fetch(rota_base + '/alunoBuscaAtiva', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na requisição');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = contentDisposition.split('filename=')[1].replace(/"/g, '');
        document.body.appendChild(a);
        a.click();
        a.remove();
        navigate('/alunos');
      } else {
        const data = await response.json();
        alert(data.message || data.error);
        navigate('/alunos');
      }
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      alert('Erro ao processar a requisição.');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nome: '',
    turmaTipo: '',
    turma: '',
    RA: '',
    endereco: '',
    faltas: '',
    dataNascimento: dayjs(),
    telefone: '',
    telefone2: '',
    responsavel: '',
    responsavel2: '',
    teg: '',
  });

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
      dataNascimento: date,
    });
  };

  const handleSubmitOne = async (e) => {
    e.preventDefault();

    // 🔹 Validação de nome (sempre obrigatório)
    if (!formData.nome.trim()) {
      alert("Por favor, insira o nome do aluno.");
      return;
    }

    // 🔹 Se o usuário escolheu uma turma (Regular ou EJA), deve escolher a classe
    if (formData.turmaTipo && !formData.turma.trim()) {
      alert("Por favor, selecione a classe correspondente à turma escolhida.");
      return;
    }

    // 🔹 Monta o objeto para envio
    const alunoData = {
      nome: formData.nome.trim(),
      turma: formData.turma.trim(),
      RA: formData.RA.trim(),
      endereco: formData.endereco?.trim() || '',
      faltas: formData.faltas?.trim() || '0',
      dataNascimento: formData.dataNascimento.format('YYYY-MM-DD'),
      telefone: formData.telefone?.trim() || '',
      telefone2: formData.telefone2?.trim() || '',
      responsavel: formData.responsavel?.trim() || '',
      responsavel2: formData.responsavel2?.trim() || '',
      utiliz_teg: formData.teg?.trim() || 'NÃO',
    };

    try {
      const response = await fetch(rota_base + '/alunoBuscaAtivaOne', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(alunoData),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.message || data?.error || 'Erro ao realizar cadastro');
        return;
      }

      alert('Cadastro realizado com sucesso');
      setFormData({
        nome: '',
        turmaTipo: '',
        turma: '',
        RA: '',
        endereco: '',
        telefone: '',
        faltas: '',
        dataNascimento: dayjs(),
        telefone2: '',
        responsavel: '',
        responsavel2: '',
        teg: '',
      });
      navigate('/alunos');
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao realizar cadastro');
    }
  };


  return (
    <div>
      {permissao === 'AGENTE' ? <HeaderAgente /> : <HeaderAdmin />}
      <br />
      <div className='geral'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={1} style={{ paddingLeft: '40px', paddingTop: '3%' }}>
            <Link to="/usuarios" style={{ textDecoration: 'none', color: '#007bff' }}>
              <ArrowBackIcon className="back-arrow" />
            </Link>
          </Grid>
          <Grid item xs={10} style={{ textAlign: 'center' }}>
            <Container maxWidth="md">
              <Box component="form" onSubmit={handleSubmit} className="form-container">
                <Typography component="h1" variant="h5" className="form-title">
                  Cadastro de Alunos via Planilha
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      accept=".xlsx, .xls"
                      id="upload-file"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label htmlFor="upload-file">
                      <Button variant="outlined" component="span" fullWidth sx={{ mt: 2, mb: 2 }}>
                        {files.length > 0 ? `${files.length} arquivos selecionados` : 'Selecionar Arquivos'}
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      className="form-button"
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Enviar Arquivo
                    </Button>
                    {loading && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Carregando...
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </div>

      <div className='geral'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Container maxWidth="md">
              <Box component="form" onSubmit={handleSubmitOne} className="form-container">
                <Typography component="h1" variant="h5" className="form-title">
                  Cadastro Manual de Aluno
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="nome"
                      label="Nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="turma-label">Turma</InputLabel>
                      <Select
                        labelId="turma-label"
                        id="turma"
                        name="turmaTipo"
                        value={formData.turmaTipo || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, turmaTipo: e.target.value, turma: '' });
                        }}
                        label="Turma"
                      >
                        <MenuItem value=""><em>Selecione</em></MenuItem>
                        <MenuItem value="REGULAR">Regular</MenuItem>
                        <MenuItem value="EJA">EJA</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.turmaTipo === 'REGULAR' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="classe-regular-label">Classe</InputLabel>
                        <Select
                          labelId="classe-regular-label"
                          id="classe-regular"
                          name="turma"
                          value={formData.turma}
                          onChange={handleChange}
                          label="Classe"
                        >
                          <MenuItem value=""><em>Selecione</em></MenuItem>
                          {[
                            '1A', '1B', '1C',
                            '2A', '2B', '2C',
                            '3A', '3B', '3C',
                            '4A', '4B', '4C',
                            '5A', '5B', '5C',
                            '6A', '6B', '6C',
                            '7A', '7B', '7C',
                            '8A', '8B', '8C',
                            '9A', '9B', '9C'
                          ].map((turma) => (
                            <MenuItem key={turma} value={turma}>{turma}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.turmaTipo === 'EJA' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="classe-eja-label">Classe</InputLabel>
                        <Select
                          labelId="classe-eja-label"
                          id="classe-eja"
                          name="turma"
                          value={formData.turma}
                          onChange={handleChange}
                          label="Classe"
                        >
                          <MenuItem value=""><em>Selecione</em></MenuItem>
                          {["1A - EJA", "1B - EJA", "1C - EJA",
                          "2A - EJA", "2B - EJA", "2C - EJA",
                          "3A - EJA", "3B - EJA", "3C - EJA",
                          "4A - EJA", "4B - EJA", "4C - EJA",
                          "5A - EJA", "5B - EJA", "5C - EJA",
                          "6A - EJA", "6B - EJA", "6C - EJA",
                          "7A - EJA", "7B - EJA", "7C - EJA",
                          "8A - EJA", "8B - EJA", "8C - EJA",
                          "9A - EJA", "9B - EJA", "9C - EJA"].map((turma) => (
                            <MenuItem key={turma} value={turma}>{turma}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="RA"
                      label="RA"
                      name="RA"
                      value={formData.RA}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="endereco"
                      label="Endereço"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="faltas"
                      label="Faltas"
                      name="faltas"
                      value={formData.faltas}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DateField', 'DateField']}>
                        <DateField
                          label="Data de Nascimento"
                          value={formData.dataNascimento}
                          onChange={handleDateChange}
                          format="DD/MM/YYYY"
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="telefone"
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="telefone2"
                      label="Telefone 2"
                      name="telefone2"
                      value={formData.telefone2}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="responsavel"
                      label="Responsável"
                      name="responsavel"
                      value={formData.responsavel}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="responsavel2"
                      label="Responsável 2"
                      name="responsavel2"
                      value={formData.responsavel2}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="teg-label">Utiliza TEG?</InputLabel>
                      <Select
                        id="teg"
                        name="teg"
                        value={formData.teg}
                        onChange={handleChange}
                        labelId="teg-label"
                      >
                        <MenuItem value=""><em>Nenhum</em></MenuItem>
                        <MenuItem value="NÃO">Não</MenuItem>
                        <MenuItem value="SIM">Sim</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      className="form-button"
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Cadastrar
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default CadastroAluno;
