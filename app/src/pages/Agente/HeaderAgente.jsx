import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoBranco from '../../components/img/logoBranco.png';
import Logout from '../../functions/Logout';
import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { rota_base } from '../../constants';

const cookies = new Cookies();

const HeaderAgente = () => {
  const location = useLocation();
  
  const token = cookies.get('token');
  const [pendencias, setPendencias] = useState(0);

  useEffect(() => {
    loadPendencias();
  }, [pendencias]);

  const loadPendencias = () => {
      fetch(rota_base+'/alunoBuscaAtiva/pendencias', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro a acessar pendencias');
          }
          return response.json();
        })
        .then(data => {
          setPendencias(data.pendencias);
        })
        .catch(error => {
          console.error('Erro a buscar pendencias:', error);
        });
    };


  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logoBranco} alt="Logo" className="logo" />
        <h1>Busca Ativa Escolar</h1>
      </div>
      <nav>
        <ul>
        <li className={getLinkClass('/home')}>
          <Link to="/home">Home</Link>
        </li>
        <li className={getLinkClass('/alunos')}>
            <Link to="/alunos">Alunos</Link>
        </li>
        <li className={getLinkClass('/pendencias')} style={{ position: 'relative' }}>
            <Link to="/pendencias">Pendências</Link>
            {pendencias > 0 && <span className="notificacao"></span>}
        </li>
        <li className={getLinkClass('/alterar-senha')}>
          <Link to="/alterar-senha">Alterar Senha</Link>
        </li>
        <li>
          <Logout />
        </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderAgente;
