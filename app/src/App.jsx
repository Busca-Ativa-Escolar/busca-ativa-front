import { useState, useEffect } from 'react'
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';

// Páginas Gerais
import Login from './pages/Login'

// Páginas do Admin
import HomeAdmin from './pages/Admin/HomeAdmin'
import Dashboard from './pages/Admin/Dashboard'
import UserControl from './pages/Admin/UserControl';
import CadastroUsuario from './pages/Admin/CadastroUsuario';

// Páginas do Professor
import HomeProfessor from './pages/Professor/HomeProfessor'
import AdicionarTarefa from './pages/Professor/Tarefas'

// Páginas do Agente
import HomeAgente from './pages/Agente/HomeAgente'

// Páginas Compartilhadas
import CadastroAluno from './pages/Compartilhadas/Agente&Admin/CadastroAluno';
import ListaAluno from './pages/Compartilhadas/Agente&Admin/ListaAluno';
import DadosAluno from './pages/Compartilhadas/Agente&Admin/DadosAluno';
import Casos from './pages/Compartilhadas/Agente&Admin/Casos';
import Pendencias from './pages/Compartilhadas/Agente&Admin/Pendencias';
import AlterarSenha from './pages/Compartilhadas/Agente&Admin/AlterarSenha';

// Funções
import EstaAutenticado from './functions/EstaAutenticado';
import NaoEncontrado from './functions/NaoEncontrado';
import permissaoUser from './functions/PermissaoUser';

function App() {  
  const [permissao, setPermissao] = useState(null);
  const [verificandoPermissao, setVerificandoPermissao] = useState(true); 

  useEffect(() => {
    const verificarPermissao = async () => {
      const permissaoUsuario = await permissaoUser(); 
      console.log('Permissão do usuário:', permissaoUsuario);
      setPermissao(permissaoUsuario);
      setVerificandoPermissao(false);
    };    
    verificarPermissao();
  }, []);

  if (verificandoPermissao) {
    return <div></div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={permissao === null ? <Navigate to="/login" /> : <Navigate to="/home" />}
        />

        <Route path="/login" element={<Login />} />

        <Route element={<EstaAutenticado/>} >
          {permissao === 'ADMIN' && (
            // Colocar as páginas do admin aqui
            <>
            <Route path="/home" element={<HomeAdmin />} />
            <Route path="/usuarios" element={<UserControl />} />
            <Route path="/usuarios/criar" element={<CadastroUsuario />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/alunos" element={<ListaAluno />} />
            <Route path="/alunos/:id" element={<DadosAluno />} />
            <Route path="/alunos/criar" element={<CadastroAluno />} />
            <Route path="/casos/:id" element={<Casos />} />
            <Route path="/tarefas/:id" element={<AdicionarTarefa />} />
            <Route path="/pendencias" element={<Pendencias />} />
            <Route path="/alterar-senha" element={<AlterarSenha />} />

            </>
          )}

          {permissao === 'PROFESSOR' && (
            // Colocar as páginas do professor aqui
            <>
            <Route path="/home" element={<HomeProfessor />} />
            <Route path="/tarefas/:id" element={<AdicionarTarefa />} />
            <Route path="/alterar-senha" element={<AlterarSenha />} />
            </>
          )}

          {permissao === 'AGENTE' && (
            // Colocar as páginas do agente aqui  
            <>
            <Route path="/home" element={<HomeAgente />} />
            <Route path="/alunos" element={<ListaAluno />} />
            <Route path="/alunos/:id" element={<DadosAluno />} />
            <Route path="/alunos/criar" element={<CadastroAluno />} />
            <Route path="/casos/:id" element={<Casos />} />
            <Route path="/pendencias" element={<Pendencias />} />
            <Route path="/alterar-senha" element={<AlterarSenha />} />
            <Route path="/tarefas/:id" element={<AdicionarTarefa />} />g
            </>
          )}

        </Route>


        <Route path="*" element={<NaoEncontrado />} />

      </Routes>
    </>
  )
}

export default App;