import React from 'react';
import HeaderAdmin from './HeaderAdmin';
import CasosTable from '../Compartilhadas/Agente&Admin/CasosTable'
import './static/HomeAdmin.css';

function HomeAdmin() {
    return (
        <div className="home-admin">
            <HeaderAdmin />
            <div className="search-container">
                <CasosTable /> {/* Utilizando o componente CasosTable */}
            </div>
        </div>
    );
}

export default HomeAdmin;