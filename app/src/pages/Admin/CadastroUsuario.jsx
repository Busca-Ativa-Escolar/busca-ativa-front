import React, { useState } from 'react';
import { TextField, Button, MenuItem, Typography, Container, Box, Grid } from '@mui/material';
import HeaderAdmin from './HeaderAdmin';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './static/Cadastro.css';
import { rota_base } from '../../constants';

const cookies = new Cookies();

const RegisterForm = () => {
  const token = cookies.get('token');
  const [senha, setSenha] = useState('');
  const [formData, setFormData] = useState({
    nomeusuario: '',
    nome: '',
    permissoes: 'professor',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      nomeusuario: formData.nomeusuario,
      nome: formData.nome,
      permissao: formData.permissoes,
    };

    try {
      const response = await fetch(`${rota_base}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na requisição');
      }

      const data = await response.json();
      setSenha(data.senha);
      alert('Cadastro realizado com sucesso');
      setFormData({ nomeusuario: '', nome: '', permissoes: 'professor' });
    } catch (error) {
      console.error('Erro:', error);
      alert(error);
    }
  };

  return (
    <div>
      <HeaderAdmin />
      <div className='geral'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={1} style={{ paddingLeft: "40px", paddingTop: "3%" }}>
            <Link to="/usuarios" style={{ textDecoration: 'none', color: "#007bff" }}>
              <ArrowBackIcon className="back-arrow" />
            </Link>
          </Grid>
          <Grid item xs={10} style={{ textAlign: 'center' }}>
            <br />
            <Container maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Cadastro</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="nomeusuario"
                    label="Nome de Usuário"
                    name="nomeusuario"
                    value={formData.nomeusuario}
                    onChange={handleChange}
                    autoComplete="nomeusuario"
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="nome"
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    autoComplete="nome"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    select
                    label="Permissões"
                    name="permissoes"
                    value={formData.permissoes}
                    onChange={handleChange}
                  >
                    <MenuItem value="professor">Professor</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="agente">Agente/Funcionário</MenuItem>
                  </TextField>
                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Cadastrar
                  </Button>
                </Box>
                {senha && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f3f3f3', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body1">Cadastro realizado com sucesso!</Typography>
                    <Typography variant="body2">Sua senha gerada é:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{senha}</Typography>
                  </Box>
                )}
              </Box>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default RegisterForm;
