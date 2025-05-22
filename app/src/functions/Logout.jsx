import React from 'react';
import Cookies from 'universal-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { rota_base  } from '../constants';

const cookies = new Cookies();

const Logout = () => {
    const navigate = useNavigate();
    const token = cookies.get('token');

    const handleLogout = (e) => {
        e.preventDefault();

        fetch(rota_base+'/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to logout');
            }
            cookies.remove('token', { path: '/' });
            navigate('/login');
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
    };

    return (
        <Link to="/logout" onClick={handleLogout}>Logout</Link>
    );
};

export default Logout;
