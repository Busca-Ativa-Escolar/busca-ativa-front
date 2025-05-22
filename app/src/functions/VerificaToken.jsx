import Cookies from 'universal-cookie';
import { rota_base } from '../constants';

const cookies = new Cookies();

const VerificaToken = async () => {
  try {
    const token = cookies.get('token');

    if (token) {
      const response = await fetch(rota_base + '/verificar-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Token válido. Autorizado');
        return true;
      } else {
        const data = await response.json();
        console.log('Falha na autenticação:', data.message);
        return false;
      }
    } else {
      console.log('Token não encontrado');
      return false;
    }
  } catch (error) {
    console.error('Erro durante a verificação de autenticação:', error);
    return false;
  }
};

export default VerificaToken;