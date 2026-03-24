import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectos';
import { materialesService } from '../services/materiales';
import { empleadosService } from '../services/empleados';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    proyectosTotales: 0,
    materialesTotales: 0,
    empleadosTotales: 0,
    proyectosEjecucion: 0,
  });

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const proyectos = await proyectosService.getAll();
        const materiales = await materialesService.getAll();
        const empleados = await empleadosService.getAll();

        const proyectosEjecucion = proyectos.filter(p => p.estado === 'EJE' && p.activo).length;

        setStats({
          proyectosTotales: proyectos.length,
          materialesTotales: materiales.length,
          empleadosTotales: empleados.length,
          proyectosEjecucion,
        });
      } catch (err: any) {
        console.error('Error cargando estadísticas:', err);
        setError(err.message || 'Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    cargarStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress 
          sx={{
            color: '#667eea',
            filter: 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.3))',
          }}
          size={60}
        />
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

  const StatCard = ({ icon: Icon, title, value, color, delay }: any) => (
    <Card
      sx={{
        animation: `slideUp 0.6s ease-out ${delay}s both`,
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardContent sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#999', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <Icon sx={{ fontSize: 32, color, opacity: 0.8 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
          <TrendingUpIcon sx={{ fontSize: 16 }} />
          <span>Actualizado</span>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ padding: '30px', animation: 'fadeIn 0.5s ease-in' }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 1,
            animation: 'slideDown 0.6s ease-out',
            '@keyframes slideDown': {
              from: { opacity: 0, transform: 'translateY(-20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          📊 Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#999' }}>
          Bienvenido a tu panel de control de gestión de obras
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard 
            icon={AssignmentIcon} 
            title="Proyectos Totales" 
            value={stats.proyectosTotales}
            color="#667eea"
            delay={0.1}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard 
            icon={InventoryIcon} 
            title="Materiales Totales" 
            value={stats.materialesTotales}
            color="#764ba2"
            delay={0.2}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard 
            icon={PeopleIcon} 
            title="Empleados Totales" 
            value={stats.empleadosTotales}
            color="#f59e0b"
            delay={0.3}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard 
            icon={TrendingUpIcon} 
            title="En Ejecución" 
            value={stats.proyectosEjecucion}
            color="#10b981"
            delay={0.4}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 