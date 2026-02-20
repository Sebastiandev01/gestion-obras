import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import api from '../services/api';

const ProyectosDebug = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Iniciando prueba de API...');
        
        // Verificar token
        const token = localStorage.getItem('token');
        console.log('Token en localStorage:', token ? 'existe' : 'no existe');
        
        // Probar llamada a la API
        console.log('Haciendo llamada a /api/proyectos/');
        const response = await api.get('/api/proyectos/');
        console.log('Respuesta de API:', response);
        
        setData(response.data);
      } catch (err: any) {
        console.error('Error completo:', err);
        setError(`Error: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  const handleLogin = async () => {
    try {
      console.log('Intentando login...');
      const response = await api.post('/api/auth/login/', {
        username: 'admin',
        password: 'admin123'
      });
      console.log('Login response:', response.data);
      
      const { access } = response.data;
      localStorage.setItem('token', access);
      console.log('Token guardado');
      
      // Recargar la página
      window.location.reload();
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(`Error en login: ${err.message || 'Error desconocido'}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Debug - Proyectos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Revisa la consola del navegador para ver los logs detallados
        </Alert>
      )}
      
      <Button variant="contained" onClick={handleLogin} sx={{ mb: 2 }}>
        Forzar Login
      </Button>
      
      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Datos recibidos:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default ProyectosDebug;
