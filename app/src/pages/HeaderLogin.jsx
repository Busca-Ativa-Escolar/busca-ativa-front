import React from 'react';
import './static/Header.css';
import logoBranco from '../components/img/logoBranco.png';

const HeaderLogin = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logoBranco} alt="Logo" className="logo" />
        <h1>Busca Ativa Escolar</h1>
      </div>

    </header>
  );
};

export default HeaderLogin;
