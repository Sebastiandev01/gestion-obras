import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Alert, Box } from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectos';
import { materialesService } from '../services/materiales';
import { empleadosService } from '../services/empleados';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    proyectosActivos: 0,
    materialesEnStock: 0,
    empleadosActivos: 0
  });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener proyectos en ejecución
      const proyectos = await proyectosService.getAll();
      const proyectosEjecucion = proyectos.filter(p => p.estado === 'EJE' && p.activo).length;

      // Obtener materiales en stock
      const materiales = await materialesService.getAll();
      const materialesEnStock = materiales.filter(m => m.cantidad > 0).length;

      // Obtener empleados activos
      const empleados = await empleadosService.getAll();
      const empleadosActivos = empleados.filter(e => e.activo).length;

      setStats({
        proyectosActivos: proyectosEjecucion,
        materialesEnStock: materialesEnStock,
        empleadosActivos: empleadosActivos
      });
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '20px' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <AssignmentIcon color="primary" style={{ marginRight: '10px' }} />
                <Typography variant="h6">Proyectos en Ejecución</Typography>
              </Box>
              <Typography variant="h4">{stats.proyectosActivos}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <InventoryIcon color="primary" style={{ marginRight: '10px' }} />
                <Typography variant="h6">Materiales en Stock</Typography>
              </Box>
              <Typography variant="h4">{stats.materialesEnStock}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <PeopleIcon color="primary" style={{ marginRight: '10px' }} />
                <Typography variant="h6">Empleados Activos</Typography>
              </Box>
              <Typography variant="h4">{stats.empleadosActivos}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 