import { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Container,
  CircularProgress,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { nominaService, type NominaResponse } from '../services/nomina';
import { empleadosService } from '../services/empleados';
import { useSnackbar } from 'notistack';

type Empleado = {
  id: number;
  nombre: string;
};

const NominaPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Estados para la tabla
  const [nominas, setNominas] = useState<NominaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [nominaDetalle, setNominaDetalle] = useState<NominaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    empleado_id: '',
    periodo: '',
    dias_trabajados: '',
    sueldo_base: '',
    horas_extras: '0',
    bonificaciones: '0',
    deducciones: '0',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    cargarNominas();
    cargarEmpleados();
  }, []);

  const cargarNominas = async () => {
    try {
      setLoading(true);
      const data = await nominaService.getAll();
      console.log('NÓMINAS:', data);
      
      // Manejar respuesta paginada
      const nominas = Array.isArray(data) ? data : (data.results ? data.results : []);
      setNominas(nominas);
    } catch (err) {
      console.error(err);
      setError('Error al cargar nóminas');
      enqueueSnackbar('Error al cargar nóminas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const data = await empleadosService.getAll();
      // Mapear datos de empleados
      const empleadosFormateados = data.map(emp => ({
        id: emp.id,
        nombre: emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
      }));
      setEmpleados(empleadosFormateados);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      enqueueSnackbar('Error al cargar empleados', { variant: 'error' });
    }
  };

  const handleOpenDialog = (nomina?: NominaResponse) => {
    if (nomina) {
      // Editar
      setEditingId(nomina.id);
      setFormData({
        empleado_id: nomina.empleado_id.toString(),
        periodo: nomina.periodo,
        dias_trabajados: nomina.dias_trabajados.toString(),
        sueldo_base: nomina.sueldo_base.toString(),
        horas_extras: nomina.horas_extras.toString(),
        bonificaciones: nomina.bonificaciones.toString(),
        deducciones: nomina.deducciones.toString(),
      });
    } else {
      // Crear nueva
      setEditingId(null);
      setFormData({
        empleado_id: '',
        periodo: '',
        dias_trabajados: '',
        sueldo_base: '',
        horas_extras: '0',
        bonificaciones: '0',
        deducciones: '0',
      });
    }
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.empleado_id) {
      setFormError('Seleccione un empleado');
      return false;
    }
    if (!formData.periodo) {
      setFormError('Ingrese el período (YYYY-MM)');
      return false;
    }
    if (!/^\d{4}-\d{2}$/.test(formData.periodo)) {
      setFormError('Formato de período inválido. Use YYYY-MM');
      return false;
    }
    if (!formData.dias_trabajados || parseFloat(formData.dias_trabajados) <= 0) {
      setFormError('Días trabajados deben ser mayor a 0');
      return false;
    }
    if (!formData.sueldo_base || parseFloat(formData.sueldo_base) <= 0) {
      setFormError('Sueldo base debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const handleSaveForm = async () => {
    if (!validateForm()) return;

    try {
      setSavingForm(true);
      setFormError(null);

      const payload = {
        empleado_id: parseInt(formData.empleado_id),
        periodo: formData.periodo,
        dias_trabajados: parseFloat(formData.dias_trabajados),
        sueldo_base: parseFloat(formData.sueldo_base),
        horas_extras: parseFloat(formData.horas_extras) || 0,
        bonificaciones: parseFloat(formData.bonificaciones) || 0,
        deducciones: parseFloat(formData.deducciones) || 0,
      };

      if (editingId) {
        // Actualizar
        await nominaService.update(editingId, payload);
        enqueueSnackbar('Nómina actualizada exitosamente', { variant: 'success' });
      } else {
        // Crear
        await nominaService.create(payload);
        enqueueSnackbar('Nómina creada exitosamente', { variant: 'success' });
      }

      handleCloseDialog();
      cargarNominas();
    } catch (err: any) {
      console.error('Error al guardar nómina:', err);
      setFormError(err.message || 'Error al guardar la nómina');
      enqueueSnackbar(err.message || 'Error al guardar la nómina', { variant: 'error' });
    } finally {
      setSavingForm(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta nómina?')) {
      return;
    }

    try {
      await nominaService.delete(id);
      enqueueSnackbar('Nómina eliminada exitosamente', { variant: 'success' });
      cargarNominas();
    } catch (err: any) {
      console.error('Error al eliminar nómina:', err);
      enqueueSnackbar(err.message || 'Error al eliminar la nómina', { variant: 'error' });
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await nominaService.update(id, { estado: 'Pagado' });
      enqueueSnackbar('Nómina marcada como pagada', { variant: 'success' });
      cargarNominas();
    } catch (err: any) {
      console.error('Error al marcar como pagada:', err);
      enqueueSnackbar(err.message || 'Error al procesar', { variant: 'error' });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calcular total estimado
  const calcularTotal = () => {
    const sueldo = parseFloat(formData.sueldo_base) || 0;
    const extras = parseFloat(formData.horas_extras) || 0;
    const bonif = parseFloat(formData.bonificaciones) || 0;
    const dedu = parseFloat(formData.deducciones) || 0;
    return (sueldo + extras + bonif - dedu).toFixed(2);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Nóminas
        </Typography>

        {error ? (
          <Paper sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nueva Nómina
              </Button>
              <Button variant="outlined" startIcon={<ExcelIcon />}>
                Exportar Excel
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Días</TableCell>
                    <TableCell>Sueldo</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nominas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay nóminas registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    nominas.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell>{n.empleado ?? '—'}</TableCell>
                        <TableCell>{n.periodo}</TableCell>
                        <TableCell>{n.dias_trabajados}</TableCell>
                        <TableCell>
                          ${Number(n.sueldo_base).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ${Number(n.total).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={n.estado}
                            color={getEstadoColor(n.estado) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalle">
                            <IconButton
                              onClick={() => {
                                setNominaDetalle(n);
                                setOpenDetalle(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton onClick={() => handleOpenDialog(n)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleDelete(n.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          {n.estado === 'Pendiente' && (
                            <Tooltip title="Marcar como pagada">
                              <IconButton onClick={() => handleMarkAsPaid(n.id)}>
                                <PaymentIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="PDF">
                            <IconButton>
                              <PdfIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* DIALOG DETALLE */}
        <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalle de Nómina</DialogTitle>
          <DialogContent>
            {nominaDetalle && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Empleado:</b></Typography>
                    <Typography>{nominaDetalle.empleado}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Período:</b></Typography>
                    <Typography>{nominaDetalle.periodo}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Días Trabajados:</b></Typography>
                    <Typography>{nominaDetalle.dias_trabajados}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Sueldo Base:</b></Typography>
                    <Typography>${Number(nominaDetalle.sueldo_base).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Horas Extras:</b></Typography>
                    <Typography>${Number(nominaDetalle.horas_extras).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Bonificaciones:</b></Typography>
                    <Typography>${Number(nominaDetalle.bonificaciones).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Deducciones:</b></Typography>
                    <Typography>${Number(nominaDetalle.deducciones).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Total:</b></Typography>
                    <Typography variant="h6" color="primary">
                      ${Number(nominaDetalle.total).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Chip
                      label={nominaDetalle.estado}
                      color={getEstadoColor(nominaDetalle.estado) as any}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG CREAR/EDITAR */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Editar Nómina' : 'Nueva Nómina'}</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Empleado */}
              <FormControl fullWidth>
                <InputLabel>Empleado</InputLabel>
                <Select
                  name="empleado_id"
                  value={formData.empleado_id}
                  onChange={handleInputChange}
                  label="Empleado"
                >
                  <MenuItem value="">Seleccione un empleado</MenuItem>
                  {empleados.map(emp => (
                    <MenuItem key={emp.id} value={emp.id.toString()}>
                      {emp.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Período */}
              <TextField
                label="Período"
                name="periodo"
                value={formData.periodo}
                onChange={handleInputChange}
                placeholder="YYYY-MM"
                helperText="Formato: YYYY-MM (ej: 2026-01)"
              />

              {/* Días Trabajados */}
              <TextField
                label="Días Trabajados"
                name="dias_trabajados"
                type="number"
                value={formData.dias_trabajados}
                onChange={handleInputChange}
                inputProps={{ step: '0.5', min: '0', max: '31' }}
              />

              {/* Sueldo Base */}
              <TextField
                label="Sueldo Base"
                name="sueldo_base"
                type="number"
                value={formData.sueldo_base}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />

              {/* Horas Extras */}
              <TextField
                label="Horas Extras"
                name="horas_extras"
                type="number"
                value={formData.horas_extras}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />

              {/* Bonificaciones */}
              <TextField
                label="Bonificaciones"
                name="bonificaciones"
                type="number"
                value={formData.bonificaciones}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />

              {/* Deducciones */}
              <TextField
                label="Deducciones"
                name="deducciones"
                type="number"
                value={formData.deducciones}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />

              {/* Total Estimado */}
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Typography color="textSecondary">Total Estimado</Typography>
                  <Typography variant="h5" color="primary">
                    ${calcularTotal()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={savingForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveForm}
              variant="contained"
              disabled={savingForm}
              startIcon={savingForm ? <CircularProgress size={20} /> : undefined}
            >
              {savingForm ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default NominaPage;
