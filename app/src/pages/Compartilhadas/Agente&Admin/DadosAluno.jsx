import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { Grid, TextField, Button, Paper, Box, Typography, Container, FormControl, MenuItem, InputLabel, Select } from '@mui/material';
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
        data.dataNascimento = dayjs(data.dataNascimento, 'YYYY-MM-DD');
        setAluno(data);
        setEditedAluno(data);
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

    console.log('editedAluno:', editedAluno);
    fetch(rota_base+`/alunoBuscaAtiva/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editedAluno),
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
            <Container maxWidth="md" sx={{marginTop: '6%'}}>
              <Paper sx={{ padding: '25px', margin: '25px' }}>
                {aluno ? (
                  <Box component="form" noValidate autoComplete="off">
                    <br/>
                    <Typography component="h1" variant="h5" className="form-title">
                      Detalhes do Aluno
                    </Typography>
                    <br/>
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
                        <TextField
                          name="turma"
                          label="Turma"
                          variant="outlined"
                          fullWidth
                          value={editedAluno.turma || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            readOnly: !editMode,
                            style: { backgroundColor: editMode ? 'white' : 'inherit' }
                          }}
                        />
                      </Grid>
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
                              format='DD/MM/YYYY'
                              InputProps={{
                                readOnly: !editMode,
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
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel id="teg-label">Utiliza TEG?</InputLabel>
                          <Select
                            id="utiliz_teg"
                            name="utiliz_teg" // Certifique-se de que o nome seja consistente
                            value={editedAluno.utiliz_teg || ''} // Consistência com a chave no estado
                            onChange={handleInputChange}
                            disabled={!editMode} // Use `disabled` para controlar o estado de edição
                            labelId="teg-label"
                          >
                            <MenuItem value=""><em>Nenhum</em></MenuItem>
                            <MenuItem value="NÃO">Não</MenuItem>
                            <MenuItem value="SIM">Sim</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Box sx={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant="contained" component={Link} to="/alunos">Voltar</Button>
                      {editMode ? (
                        <Button variant="contained" onClick={handleSave}>Salvar</Button>
                      ) : (
                        <Button variant="contained" onClick={() => setEditMode(true)}>Editar</Button>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <div>Carregando...</div>
                )}
              </Paper>
            </Container>
          </Grid>
        </Grid>
      </div>
      <br />
    </div>
  );
}

export default DadosAluno;
