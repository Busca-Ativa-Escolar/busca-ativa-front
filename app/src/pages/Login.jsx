import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { Button, TextField, Container, Typography, Alert, Grid, Box } from '@mui/material';
import HeaderLogin from './HeaderLogin';
import { useNavigate } from 'react-router-dom';
import logo from '../components/img/logo.png';
import './static/Login.css'; 
import { rota_base } from '../constants';


export default function Login() {
  const cookies = new Cookies();
  const [nomeusuario, setNomeusuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(rota_base + "/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nomeusuario, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        cookies.set("token", data.token, { path: "/" });
        window.location.href = "/home";
      } else {
        const errorData = await response.json();
        console.log(errorData);
        setError("Credenciais não conferem. Confirme seu usuario e senha.");
      }
    } catch (error) {
      console.log(error);
      setError("Ocorreu um erro ao tentar fazer login.");
    }
  };

  return (
    <div>
      <HeaderLogin />
      <div className='login-container'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={5} style={{textAlign:'center'}}>
            <img src={logo} alt="Logo Busca Ativa" style={{  width: 350, height: 300 }} />
            <Typography variant="h6" component="h6" style={{textAlign: 'justify', paddingLeft:"10%"}}>A Busca Ativa Escolar é uma iniciativa do UNICEF, Undime, Congemas e Conasems que ajuda governos a identificar e reintegrar crianças fora da escola. Utilizando uma metodologia social e uma ferramenta tecnológica, facilita o planejamento de políticas públicas com dados concretos. Reúne áreas como Educação, Saúde e Assistência Social, melhorando a comunicação e o acompanhamento dos casos. A ferramenta é acessível em qualquer dispositivo, auxiliando na gestão das informações sobre cada criança.</Typography>
          </Grid>
          <Grid item xs={2} style={{textAlign:'center'}}>
            <Box className="box-divider"></Box>
          </Grid>
          <Grid item xs={5} style={{alignItems:"center", justifyContent:"center", paddingRight:'90px', marginTop: '20px', paddingTop:'15vh'}}>
            <Container>
              <div className='login-wrapper'>
                <div className='login-text'>
                  <Typography variant="h4" component="h1" id="login-text">Login</Typography>
                  <form onSubmit={handleSubmit} style={{opacity:"0.9", backgroundColor:"white"}}>
                    <TextField
                      fullWidth
                      type="nomeusuario"
                      name="nomeusuario"
                      label="Nome de usuário"
                      value={nomeusuario}
                      onChange={(e) => setNomeusuario(e.target.value)}
                      placeholder="Digite seu usuário"
                      variant="outlined"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      type="password"
                      name="password"
                      label="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      variant="outlined"
                      margin="normal"
                    />
                    <div className='login-button'>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        style = {{marginTop: '10%'}}
                      >
                        Entrar
                      </Button>
                    </div>
                    {error && <Alert severity="error" className='Alert'>{error}</Alert>}
                  </form>
                </div>
              </div>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
