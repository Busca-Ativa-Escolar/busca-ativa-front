import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Typography, Container, Box, Grid } from '@mui/material';
import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import HeaderProfessor from '../../Professor/HeaderProfessor';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { rota_base } from '../../../constants';

const cookies = new Cookies();

const AlterarSenha = () => {

  const token = cookies.get('token');
  const [usuario, setUsuario] = useState('');
  const permissao = cookies.get('permissao');

  
  useEffect(() => {
    loadUsuario();
  }, [usuario]);

  const [formData, setFormData] = useState({
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


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
              console.log(data);
              setUsuario(data._id);
          })
  
  }
    
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      alert('Senhas não coincidem!');
      return;
    }

    const userData = {
      password: formData.senha,
    };

    try {
      const response = await fetch(rota_base+`/usuarios/senha/${usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      console.log('Cadastro realizado com sucesso:', data);
      alert('Cadastro realizado com sucesso');
      setFormData({
        senha: '',
        confirmarSenha: '',
      });
    } catch (error) {
      console.log("usuario", usuario);
      console.error('Erro:', error);
      alert('Erro a atualizar senha');
    }
  };

  return (
    
    <div >
      {permissao === 'AGENTE' && <HeaderAgente />}
      {permissao === 'PROFESSOR' && <HeaderProfessor />}
      {permissao === 'ADMIN' && <HeaderAdmin />}
      
      <div className='geral'>
      <Grid container spacing={2} className="login-container">
          <Grid item xs={1} style={{paddingLeft:"40px", paddingTop:"3%" }}>
            <Link to="/usuarios" style={{ textDecoration: 'none', color:"#007bff" }}>
              <ArrowBackIcon className="back-arrow" />
            </Link>
          </Grid>
        <Grid item xs={10} style={{textAlign:'center'}}>
          <br/>
          
          <Container maxWidth="xs">
              <Box
              sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
              }}
              >
              <Typography component="h1" variant="h5">
                  Atualizar Senha
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                  <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="senha"
                  label="Senha"
                  type="password"
                  id="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  autoComplete="current-password"
                  />
                  <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmarSenha"
                  label="Confirmar Senha"
                  type="password"
                  id="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  autoComplete="confirm-password"
                  />
                  <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  >
                  Atualizar
                  </Button>
              </Box>
              </Box>
          </Container>
        </Grid>
      </Grid>
      </div>
    </div>
  );
};

export default AlterarSenha;
