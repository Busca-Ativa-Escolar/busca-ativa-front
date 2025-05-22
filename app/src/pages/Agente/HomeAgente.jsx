import React from 'react';
import HeaderAgente from './HeaderAgente';
import CasosTable from '../Compartilhadas/Agente&Admin/CasosTable'
import './static/HomeAgente.css';

function HomeAgente() {
    return (
        <div className="home-Agente">
            <HeaderAgente />
            <div className="search-container">
                <CasosTable /> {/* Utilizando o componente CasosTable */}
            </div>
        </div>
    );
}

export default HomeAgente;