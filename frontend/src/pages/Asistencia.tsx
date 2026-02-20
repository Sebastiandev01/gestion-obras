import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { asistenciaService, getHoyBogota } from '../services/asistencia';
import type { Asistencia } from '../services/asistencia';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';

const AsistenciaPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState<'ENT' | 'SAL'>('ENT');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registrosHoy, setRegistrosHoy] = useState<{ ENT?: boolean; SAL?: boolean }>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Debe iniciar sesión', { variant: 'error' });
      navigate('/login');
      return;
    }
    cargarAsistencias();
  }, [navigate, enqueueSnackbar]);

  // Actualizar estado de registros hoy cuando cambian las asistencias
  useEffect(() => {
    if (asistencias.length > 0) {
      // Usar la función helper para obtener la fecha de Bogotá
      const hoy = getHoyBogota();
      const hoyRegistros = asistencias.filter(a => a.fecha === hoy);
      
      const estado = {
        ENT: hoyRegistros.some(a => a.tipo === 'ENT'),
        SAL: hoyRegistros.some(a => a.tipo === 'SAL')
      };
      
      setRegistrosHoy(estado);
      
      // Si ya hay ENT pero no SAL, seleccionar SAL por defecto
      if (estado.ENT && !estado.SAL) {
        setTipoRegistro('SAL');
      }
    }
  }, [asistencias]);

  // En cargarAsistencias
  const cargarAsistencias = async () => {
  try {
    setLoading(true);
    const data = await asistenciaService.getAll();
    setAsistencias(Array.isArray(data) ? data : []);
    
    // Verificar registros de hoy
    const estadoHoy = await asistenciaService.verificarRegistroHoy();
    setRegistrosHoy(estadoHoy);
    
  } catch (err) {
    console.error(err);
    enqueueSnackbar('Error al cargar asistencias', { variant: 'error' });
  } finally {
    setLoading(false);
  }
};
   const handleRegistrarAsistencia = async () => {
    if (!tipoRegistro) {
      setError('Seleccione el tipo de registro');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Validación en frontend antes de enviar
      if (tipoRegistro === 'ENT' && registrosHoy.ENT) {
        enqueueSnackbar('Ya registraste entrada hoy', { variant: 'warning' });
        setTipoRegistro('SAL');
        setSaving(false);
        return;
      }
      
      if (tipoRegistro === 'SAL' && registrosHoy.SAL) {
        enqueueSnackbar('Ya registraste salida hoy', { variant: 'warning' });
        setSaving(false);
        return;
      }
      
      if (tipoRegistro === 'SAL' && !registrosHoy.ENT) {
        enqueueSnackbar('Primero debes registrar entrada', { variant: 'warning' });
        setTipoRegistro('ENT');
        setSaving(false);
        return;
      }

      // NO envíar fecha ni hora - el backend las calcula automáticamente
      const payload = {
        tipo: tipoRegistro,
        ubicacion: ubicacion || undefined,
        observaciones: observaciones || undefined,
      };

      console.log('📋 Enviando payload:', payload);
      
      const resultado = await asistenciaService.create(payload);
      console.log('✅ Registro creado:', resultado);

      enqueueSnackbar('Asistencia registrada exitosamente', { variant: 'success' });

      setOpenDialog(false);
      setUbicacion('');
      setObservaciones('');
      setTipoRegistro('ENT');
      setError(null);
      
      // Actualizar estado local inmediatamente
      setRegistrosHoy(prev => ({
        ...prev,
        [tipoRegistro]: true
      }));

      // Agregar el nuevo registro a la lista localmente
      setAsistencias(prev => [resultado, ...prev]);

      // Recargar datos del servidor para asegurar sincronización
      console.log('🔄 Recargando asistencias desde el servidor...');
      await cargarAsistencias();

    } catch (err: any) {
      console.error('❌ Error detallado:', err);
      
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        
        // Manejo específico de error de validación
        if (err.response.status === 400) {
          let mensajeError = 'Error al registrar asistencia';
          
          // Manejo de non_field_errors (errores de validación general)
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            mensajeError = data.non_field_errors[0];
          } else if (data.error) {
            mensajeError = data.error;
          } else if (typeof data === 'string') {
            mensajeError = data;
          }
          
          console.error('Mensaje de error:', mensajeError);
          enqueueSnackbar(mensajeError, { variant: 'warning' });
          
          // Si es error de ENT duplicada, cambiar automáticamente a SAL
          if (mensajeError.includes('ENT') && tipoRegistro === 'ENT') {
            console.log('🔄 Cambiando a SAL automáticamente...');
            // Recargar para actualizar el estado
            await cargarAsistencias();
            setTipoRegistro('SAL');
            setOpenDialog(true);
          } else if (mensajeError.includes('SAL') && tipoRegistro === 'SAL') {
            console.log('🔄 Recargando datos...');
            await cargarAsistencias();
          }
          
          return;
        }

        if (err.response.status === 401) {
          enqueueSnackbar('Sesión expirada', { variant: 'error' });
          navigate('/login');
          return;
        }
      }

      enqueueSnackbar(
        err.response?.data?.detail || 'Error al registrar asistencia', 
        { variant: 'error' }
      );
    } finally {
      setSaving(false);
    }
  };
  const asistenciasFiltradas = asistencias.filter((a) => {
    if (!a.usuario) return false;
    const nombre = `${a.usuario.first_name ?? ''} ${a.usuario.last_name ?? ''}`;
    return nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const colorPorTipo = (tipo: string) =>
    tipo === 'ENT' ? 'success' : tipo === 'SAL' ? 'info' : 'default';

  const iconoPorTipo = (tipo: string) =>
    tipo === 'ENT' ? <CheckCircleIcon /> : <AccessTimeIcon />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Asistencia</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {registrosHoy.ENT && (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Entrada registrada" 
              color="success" 
              size="small" 
              variant="outlined"
            />
          )}
          {registrosHoy.SAL && (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Salida registrada" 
              color="info" 
              size="small" 
              variant="outlined"
            />
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={registrosHoy.ENT && registrosHoy.SAL}
          >
            {registrosHoy.ENT && registrosHoy.SAL 
              ? 'Asistencia completa' 
              : 'Registrar Asistencia'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Entradas</Typography>
              <Typography variant="h4">
                {asistencias.filter(a => a.tipo === 'ENT').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Salidas</Typography>
              <Typography variant="h4">
                {asistencias.filter(a => a.tipo === 'SAL').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TextField
        fullWidth
        placeholder="Buscar empleado..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Observaciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistenciasFiltradas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.usuario
                      ? `${a.usuario.first_name ?? ''} ${a.usuario.last_name ?? ''}`
                      : '—'}
                  </TableCell>
                  <TableCell>{new Date(a.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{a.hora}</TableCell>
                  <TableCell>
                    <Chip
                      icon={iconoPorTipo(a.tipo)}
                      label={a.tipo === 'ENT' ? 'Entrada' : 'Salida'}
                      color={colorPorTipo(a.tipo) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {a.ubicacion && (
                      <Chip
                        icon={<LocationIcon />}
                        label={a.ubicacion}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>{a.observaciones || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Asistencia</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipoRegistro}
              label="Tipo"
              onChange={(e) => setTipoRegistro(e.target.value as 'ENT' | 'SAL')}
            >
              <MenuItem value="ENT" disabled={registrosHoy.ENT}>
                Entrada {registrosHoy.ENT && '(Ya registrada)'}
              </MenuItem>
              <MenuItem value="SAL" disabled={registrosHoy.SAL}>
                Salida {registrosHoy.SAL && '(Ya registrada)'}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Ubicación"
            sx={{ mt: 3 }}
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Oficina central, Teletrabajo, etc."
          />

          <TextField
            fullWidth
            label="Observaciones"
            multiline
            rows={3}
            sx={{ mt: 3 }}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales..."
          />
          
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleRegistrarAsistencia}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsistenciaPage;