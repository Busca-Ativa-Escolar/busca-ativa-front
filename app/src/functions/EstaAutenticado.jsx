import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import VerificaToken from './VerificaToken'; 

export default function EstaAutenticado() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const checkLogin = useCallback(async () => {
    const authenticated = await VerificaToken();

    if (authenticated) {
      setIsAuthenticated(true);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  return isAuthenticated ? <Outlet /> : null;
}