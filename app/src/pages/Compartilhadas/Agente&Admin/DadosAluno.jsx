import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { Grid, TextField, Button, Paper, Box, Typography, Container, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import './static/DadosAluno.css';
import { rota_base } from '../../../constants';

dayjs.extend(customParseFormat);
const cookies = new Cookies();

function DadosAluno() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAluno, setEditedAluno] = useState({});
  const token = cookies.get('token');
  const permissao = cookies.get('permissao');

  useEffect(() => {
    fetchAluno();
  }, [id]);

  const fetchAluno = () => {
    fetch(rota_base + `/alunoBuscaAtiva/${id}`, {
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
        data.dataNascimento = dayjs(data.dataNascimento, 'YYYY-MM-DD');
        const tipo = data.turma.includes('EJA') ? 'EJA' : 'REGULAR';
        setAluno({ ...data, turmaTipo: tipo });
        setEditedAluno({ ...data, turmaTipo: tipo });
      })
      .catch(error => {
        console.error('Error fetching aluno:', error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAluno(prevAluno => ({
      ...prevAluno,
      [name]: value,
    }));
  };

  const handleInputDateChange = (date) => {
    setEditedAluno(prevAluno => ({
      ...prevAluno,
      dataNascimento: date,
    }));
  };

  const handleSave = () => {
    const alunoToSave = { ...editedAluno };
    alunoToSave.dataNascimento = dayjs(alunoToSave.dataNascimento).format('YYYY-MM-DD');

    fetch(rota_base + `/alunoBuscaAtiva/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(alunoToSave),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save aluno changes');
        }
        setEditMode(false);
        fetchAluno();
      })
      .catch(error => {
        console.error('Error saving aluno changes:', error);
      });
  };

  return (
    <div>
      {permissao === 'AGENTE' ? <HeaderAgente /> : <HeaderAdmin />}
      <br />
      <div className='geral'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Container maxWidth="md" sx={{ marginTop: '6%' }}>
              <Paper sx={{ padding: '25px', margin: '25px' }}>
                {aluno ? (
                  <Box component="form" noValidate autoComplete="off">
                    <br />
                    <Typography component="h1" variant="h5" className="form-title">
                      Detalhes do Aluno
                    </Typography>
                    <br />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="nome"
                          label="Nome"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.nome || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel id="turmaTipo-label">Turma</InputLabel>
                          <Select
                            labelId="turmaTipo-label"
                            name="turmaTipo"
                            value={editedAluno.turmaTipo || ''}
                            onChange={(e) => {
                              setEditedAluno({
                                ...editedAluno,
                                turmaTipo: e.target.value,
                                turma: ''
                              });
                            }}
                            label="Turma"
                            disabled={!editMode}
                            style={{ backgroundColor: editMode ? 'white' : 'inherit' }}
                          >
                            <MenuItem value="REGULAR">Regular</MenuItem>
                            <MenuItem value="EJA">EJA</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {editedAluno.turmaTipo === 'REGULAR' && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="classe-regular-label">Classe</InputLabel>
                            <Select
                              labelId="classe-regular-label"
                              name="turma"
                              value={editedAluno.turma || ''}
                              onChange={handleInputChange}
                              label="Classe"
                              disabled={!editMode}
                              style={{ backgroundColor: editMode ? 'white' : 'inherit' }}
                            >
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

                      {editedAluno.turmaTipo === 'EJA' && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="classe-eja-label">Classe</InputLabel>
                            <Select
                              labelId="classe-eja-label"
                              name="turma"
                              value={editedAluno.turma || ''}
                              onChange={handleInputChange}
                              label="Classe"
                              disabled={!editMode}
                              style={{ backgroundColor: editMode ? 'white' : 'inherit' }}
                            >
                              {['EJA-1A', 'EJA-1B', 'EJA-1C',
                            'EJA-2A', 'EJA-2B', 'EJA-2C',
                            'EJA-3A', 'EJA-3B', 'EJA-3C',
                            'EJA-4A', 'EJA-4B', 'EJA-4C',
                            'EJA-5A', 'EJA-5B', 'EJA-5C',
                            'EJA-6A', 'EJA-6B', 'EJA-6C',
                            'EJA-7A', 'EJA-7B', 'EJA-7C',
                            'EJA-8A', 'EJA-8B', 'EJA-8C',
                            'EJA-9A', 'EJA-9B', 'EJA-9C'].map((turma) => (
                                <MenuItem key={turma} value={turma}>{turma}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="RA"
                          label="RA"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.RA || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="endereco"
                          label="Endereço"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.endereco || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="faltas"
                          label="Faltas"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.faltas || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DateField', 'DateField']}>
                            <DateField
                              label="Data de Nascimento"
                              value={editedAluno.dataNascimento}
                              onChange={handleInputDateChange}
                              format="DD/MM/YYYY"
                              readOnly={!editMode}
                              InputProps={{
                                style: { backgroundColor: editMode ? 'white' : 'inherit' }
                              }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="telefone"
                          label="Telefone"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.telefone || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="telefone2"
                          label="Telefone 2"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.telefone2 || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="responsavel"
                          label="Responsável"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.responsavel || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="responsavel2"
                          label="Responsável 2"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.responsavel2 || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <br />
                    <div style={{ textAlign: 'center' }}>
                      {editMode ? (
                        <Button variant="contained" color="primary" onClick={handleSave}>
                          Salvar
                        </Button>
                      ) : (
                        <Button variant="contained" onClick={() => setEditMode(true)}>
                          Editar
                        </Button>
                      )}
                    </div>
                  </Box>
                ) : (
                  <Typography>Carregando...</Typography>
                )}
              </Paper>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default DadosAluno;
