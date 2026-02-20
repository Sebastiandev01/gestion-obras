import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CardMedia,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { proyectosService, Proyecto, EstadoProyecto } from '../services/proyectos';
import { AxiosError } from 'axios';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const Proyectos = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [formData, setFormData] = useState<Partial<Proyecto>>({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'PLAN',
    presupuesto: 0,
    activo: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoProyecto | ''>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const estados: EstadoProyecto[] = ['PLAN', 'EJE', 'SUS', 'COM', 'CAN'];

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/proyectos/');
      
      // DRF puede devolver { results: [] } o []
      const data = response.data.results ?? response.data;

      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setProyectos(data);
      } else {
        console.error('Datos no válidos:', data);
        setProyectos([]);
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('Error al cargar los proyectos');
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedEstado) {
        params.append('estado', selectedEstado);
      }
      if (dateRange.startDate) {
        params.append('fecha_inicio', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('fecha_fin', dateRange.endDate);
      }

      const url = params.toString() ? `/api/proyectos/?${params.toString()}` : '/api/proyectos/';
      const response = await api.get(url);
      
      const data = response.data.results ?? response.data;
      
      if (Array.isArray(data)) {
        setProyectos(data);
      } else {
        console.error('Datos no válidos en búsqueda:', data);
        setProyectos([]);
      }
    } catch (err) {
      console.error('Error al buscar proyectos:', err);
      setError('Error al buscar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEstado('');
    setDateRange({ startDate: '', endDate: '' });
    loadProyectos();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (proyecto?: Proyecto) => {
    if (proyecto) {
      setEditingProyecto(proyecto);
      setFormData({
        ...proyecto,
        fecha_inicio: proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toISOString().split('T')[0] : '',
        fecha_fin: proyecto.fecha_fin ? new Date(proyecto.fecha_fin).toISOString().split('T')[0] : ''
      });
      setPreviewUrl(proyecto.foto_url || null);
      setSelectedFile(null);
    } else {
      setEditingProyecto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'PLAN',
        presupuesto: 0,
        activo: true
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProyecto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'PLAN',
      presupuesto: 0,
      activo: true
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null); // Limpiar errores al cerrar
  };

  const handleSubmit = async () => {
    try {
      // Validaciones mejoradas
      const errors: string[] = [];
      if (!formData.nombre?.trim()) {
        errors.push('El nombre del proyecto es requerido');
      }
      if (!formData.fecha_inicio) {
        errors.push('La fecha de inicio es requerida');
      }
      if (formData.fecha_fin && new Date(formData.fecha_fin) < new Date(formData.fecha_inicio!)) {
        errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
      if (formData.presupuesto !== undefined && formData.presupuesto < 0) {
        errors.push('El presupuesto no puede ser negativo');
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }

      // Preparar FormData para enviar
      const formDataToSend = new FormData();
      
      // Agregar campos del formulario
      formDataToSend.append('nombre', formData.nombre || '');
      formDataToSend.append('descripcion', formData.descripcion || '');
      formDataToSend.append('estado', formData.estado || 'PLAN');
      formDataToSend.append('activo', formData.activo?.toString() || 'true');
      formDataToSend.append('presupuesto', formData.presupuesto?.toString() || '0');
      
      // Formatear fechas
      if (formData.fecha_inicio) {
        formDataToSend.append('fecha_inicio', new Date(formData.fecha_inicio).toISOString().split('T')[0]);
      }
      
      if (formData.fecha_fin) {
        formDataToSend.append('fecha_fin', new Date(formData.fecha_fin).toISOString().split('T')[0]);
      }
      
      // Agregar archivo si existe
      if (selectedFile) {
        formDataToSend.append('foto', selectedFile);
      } else if (editingProyecto && !previewUrl && editingProyecto.foto_url) {
        // Si estamos editando y se eliminó la foto
        formDataToSend.append('foto', '');
      }

      if (editingProyecto) {
        await proyectosService.update(editingProyecto.id, formDataToSend);
      } else {
        await proyectosService.create(formDataToSend);
      }

      handleCloseDialog();
      await loadProyectos();
    } catch (err) {
      console.error('Error al guardar proyecto:', err);
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('\n');
          setError(`Error al guardar el proyecto:\n${errorMessages}`);
        } else {
          setError(`Error al guardar el proyecto: ${errorData}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al guardar el proyecto. Por favor, intente nuevamente.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este proyecto?')) {
      try {
        await proyectosService.delete(id);
        enqueueSnackbar('Proyecto eliminado exitosamente', { variant: 'success' });
        await loadProyectos();
      } catch (err) {
        console.error('Error al eliminar proyecto:', err);
        
        if (err instanceof AxiosError) {
          const statusCode = err.response?.status;
          const errorData = err.response?.data;
          
          if (statusCode === 403) {
            setError('No tiene permisos para eliminar este proyecto. Solo el responsable o administrador pueden hacerlo.');
            enqueueSnackbar('No tiene permisos para eliminar este proyecto', { variant: 'error' });
          } else if (statusCode === 404) {
            setError('El proyecto no existe o ya fue eliminado.');
            enqueueSnackbar('El proyecto no existe', { variant: 'error' });
            await loadProyectos(); // Recargar la lista
          } else if (statusCode === 500) {
            const errorMsg = typeof errorData === 'object' && errorData?.error ? errorData.error : 'Error interno del servidor';
            setError(`Error al eliminar: ${errorMsg}`);
            enqueueSnackbar(`Error: ${errorMsg}`, { variant: 'error' });
          } else {
            const errorMsg = typeof errorData === 'object' && errorData?.error ? errorData.error : 'Error al eliminar el proyecto';
            setError(errorMsg);
            enqueueSnackbar(errorMsg, { variant: 'error' });
          }
        } else if (err instanceof Error) {
          setError(err.message);
          enqueueSnackbar(err.message, { variant: 'error' });
        } else {
          setError('Error desconocido al eliminar el proyecto');
          enqueueSnackbar('Error desconocido', { variant: 'error' });
        }
      }
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EJE':
        return 'success';
      case 'PLAN':
      case 'SUS':
        return 'warning';
      case 'COM':
        return 'info';
      case 'CAN':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No definida';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o descripción"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Estado"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value as EstadoProyecto)}
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {proyectosService.getEstadoDisplay(estado)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Box>

      {proyectos.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No hay proyectos registrados
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {proyectos.map((proyecto) => (
            <Grid item xs={12} sm={6} md={4} key={proyecto.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {proyecto.foto_url && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={proyecto.foto_url}
                    alt={proyecto.nombre}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {proyecto.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {proyecto.descripcion}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<CalendarIcon />}
                      label={`Inicio: ${formatDate(proyecto.fecha_inicio)}`}
                      size="small"
                    />
                    {proyecto.fecha_fin && (
                      <Chip
                        icon={<CalendarIcon />}
                        label={`Fin: ${formatDate(proyecto.fecha_fin)}`}
                        size="small"
                      />
                    )}
                    <Chip
                      icon={<MoneyIcon />}
                      label={`Presupuesto: $${proyecto.presupuesto?.toLocaleString() || '0'}`}
                      size="small"
                    />
                    <Chip
                      label={proyectosService.getEstadoDisplay(proyecto.estado)}
                      color={getEstadoColor(proyecto.estado) as any}
                      size="small"
                    />
                  </Box>
                  {proyecto.responsable_info && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        Responsable: {proyecto.responsable_info.nombre}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(proyecto)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(proyecto.id)}
                    title="Eliminar"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    size="small"
                    startIcon={<AssignmentIcon />}
                    onClick={() => {
                      // TODO: Implementar vista de detalles
                      console.log('Ver detalles del proyecto:', proyecto.id);
                    }}
                  >
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre *"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  error={!formData.nombre?.trim()}
                  helperText={!formData.nombre?.trim() ? 'El nombre es requerido' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Inicio *"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!formData.fecha_inicio}
                  helperText={!formData.fecha_inicio ? 'La fecha de inicio es requerida' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Finalización"
                  value={formData.fecha_fin || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoProyecto })}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {proyectosService.getEstadoDisplay(estado)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Presupuesto"
                  value={formData.presupuesto}
                  onChange={(e) => setFormData({ ...formData, presupuesto: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: '$',
                  }}
                  inputProps={{
                    min: 0,
                    step: 0.01
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoIcon />}
                  >
                    {previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {previewUrl && (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Preview"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  )}
                  {editingProyecto && previewUrl && selectedFile === null && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        // Marcar para eliminar la foto existente
                      }}
                    >
                      Eliminar Foto
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProyecto ? 'Guardar Cambios' : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Proyectos;