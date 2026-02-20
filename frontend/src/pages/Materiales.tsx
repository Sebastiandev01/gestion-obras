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
  TablePagination,
  CircularProgress,
  Alert,  
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
 
} from '@mui/icons-material';

// Importar el servicio real
import { Material, CategoriaMaterial, Proveedor, materialesService } from '../services/materiales';

// Definición de tipos
type UnidadMedida = {
  value: string;
  label: string;
};

// Tipo para el formulario
type MaterialFormData = {
  codigo: string;
  nombre: string;
  categoria: number | null;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: Material['unidad_medida'];
  precio_unitario: number;
  ubicacion: string;
  proveedor: number | null;
  descripcion: string;
};

const StatusChip = ({ status }: { status: Material['estado_stock'] }) => {
  const config = {
    'Disponible': { color: 'success' as const, icon: <CheckCircleIcon /> },
    'Bajo': { color: 'warning' as const, icon: <WarningIcon /> },
    'Crítico': { color: 'error' as const, icon: <WarningIcon /> },
    'Agotado': { color: 'error' as const, icon: <WarningIcon /> },
  }[status || 'Disponible'];

  return (
    <Chip
      icon={config.icon}
      label={status || 'Desconocido'}
      color={config.color}
      size="small"
    />
  );
};

const unidadesMedida: UnidadMedida[] = [
  { value: 'un', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'g', label: 'Gramos' },
  { value: 'l', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'm', label: 'Metros' },
  { value: 'cm', label: 'Centímetros' },
  { value: 'm2', label: 'Metros cuadrados' },
  { value: 'm3', label: 'Metros cúbicos' },
  { value: 'pkg', label: 'Paquetes' },
];

// Función auxiliar para asegurar arrays
const ensureArray = <T,>(data: any, fallback: T[] = []): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
  }
  
  console.warn('ensureArray: No es un array, usando fallback', data);
  return fallback;
};

const Materiales = () => {
  // Estados principales
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Filtros
  const [filterCategoria, setFilterCategoria] = useState<number | ''>('');
  const [filterProveedor, setFilterProveedor] = useState<number | ''>('');
  const [filterEstado, setFilterEstado] = useState<string | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el diálogo de formulario
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    codigo: '',
    nombre: '',
    categoria: null,
    cantidad: 0,
    stock_minimo: 0,
    unidad_medida: 'un',
    precio_unitario: 0,
    ubicacion: '',
    proveedor: null,
    descripcion: ''
  });
  const [formErrors, setFormErrors] = useState({
    codigo: false,
    nombre: false,
    categoria: false,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Estados para el diálogo de categoría
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [categoriaFormData, setCategoriaFormData] = useState<Omit<CategoriaMaterial, 'id'>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    color: '#000000',
    orden: 0,
    activa: true
  });
  const [categoriaLoading, setCategoriaLoading] = useState(false);

  // Cargar datos desde la API
  const loadData = async () => {
    try {
      console.log('🚀 Iniciando carga de datos...');
      setLoading(true);
      setError(null);
      
      // Cargar materiales, categorías y proveedores en paralelo
      const [materialesData, categoriasData, proveedoresData] = await Promise.all([
        materialesService.getAll(),
        materialesService.getCategorias(),
        materialesService.getProveedores()
      ]);
      
      console.log('📊 Datos recibidos:', {
        materiales: materialesData,
        categorias: categoriasData,
        proveedores: proveedoresData
      });
      
      // Asegurar que siempre sean arrays
      setMateriales(ensureArray<Material>(materialesData, []));
      setCategorias(ensureArray<CategoriaMaterial>(categoriasData, []));
      setProveedores(ensureArray<Proveedor>(proveedoresData, []));
      
      console.log('✅ Datos cargados exitosamente');
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filterCategoria !== '') params.categoria = filterCategoria;
      if (filterProveedor !== '') params.proveedor = filterProveedor;
      if (filterEstado !== '') params.estado_stock = filterEstado;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const materialesData = await materialesService.getAll(params);
      setMateriales(ensureArray<Material>(materialesData, []));
      setPage(0);
    } catch (err) {
      console.error('Error en búsqueda de materiales:', err);
      setError(err instanceof Error ? err.message : 'Error al buscar materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setFilterCategoria('');
    setFilterProveedor('');
    setFilterEstado('');
    setSearchTerm('');
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      categoria: null,
      cantidad: 0,
      stock_minimo: 0,
      unidad_medida: 'un',
      precio_unitario: 0,
      ubicacion: '',
      proveedor: null,
      descripcion: ''
    });
    setFormErrors({
      codigo: false,
      nombre: false,
      categoria: false,
    });
  };

  // Manejar apertura del diálogo
  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        codigo: material.codigo,
        nombre: material.nombre,
        categoria: material.categoria,
        cantidad: material.cantidad,
        stock_minimo: material.stock_minimo,
        unidad_medida: material.unidad_medida,
        precio_unitario: material.precio_unitario,
        ubicacion: material.ubicacion || '',
        proveedor: material.proveedor,
        descripcion: material.descripcion || ''
      });
    } else {
      setEditingMaterial(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  // Manejar cierre del diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaterial(null);
    resetForm();
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors = {
      codigo: false,
      nombre: false,
      categoria: false,
    };
    
    let isValid = true;
    let errorMessage = '';

    // Validar que el código no esté vacío
    if (!formData.codigo.trim()) {
      errors.codigo = true;
      errorMessage = 'El código es requerido';
      isValid = false;
    } 
    // Validar formato del código
    else if (!/^[A-Za-z0-9-]+$/.test(formData.codigo.trim())) {
      errors.codigo = true;
      errorMessage = 'El código solo puede contener letras, números y guiones';
      isValid = false;
    }
    // Validar que el nombre no esté vacío
    else if (!formData.nombre.trim()) {
      errors.nombre = true;
      errorMessage = 'El nombre es requerido';
      isValid = false;
    }
    // Validar que se seleccione una categoría
    else if (formData.categoria === null) {
      errors.categoria = true;
      errorMessage = 'La categoría es requerida';
      isValid = false;
    }
    // Validar que la cantidad sea un número válido
    else if (isNaN(formData.cantidad) || formData.cantidad < 0) {
      errorMessage = 'La cantidad debe ser un número positivo';
      isValid = false;
    }
    // Validar que el stock mínimo sea un número válido
    else if (isNaN(formData.stock_minimo) || formData.stock_minimo < 0) {
      errorMessage = 'El stock mínimo debe ser un número positivo';
      isValid = false;
    }
    // Validar que el precio sea un número válido
    else if (isNaN(formData.precio_unitario) || formData.precio_unitario < 0) {
      errorMessage = 'El precio unitario debe ser un número positivo';
      isValid = false;
    }

    setFormErrors(errors);
    if (errorMessage) {
      setError(errorMessage);
    }
    
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      
      // Crear objeto de datos para enviar al servicio
      const materialData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        categoria: formData.categoria,
        cantidad: formData.cantidad,
        stock_minimo: formData.stock_minimo,
        unidad_medida: formData.unidad_medida,
        precio_unitario: formData.precio_unitario,
        ubicacion: formData.ubicacion.trim(),
        proveedor: formData.proveedor,
        descripcion: formData.descripcion.trim()
      };
      
      if (editingMaterial) {
        // Actualizar material existente
        const updatedMaterial = await materialesService.update(editingMaterial.id, materialData);
        setMateriales(prev => prev.map(m => m.id === editingMaterial.id ? updatedMaterial : m));
        setSuccessMessage('Material actualizado correctamente');
      } else {
        const newMaterial = await materialesService.create(materialData);
        setMateriales(prev => [...prev, newMaterial]);
        setSuccessMessage('Material creado correctamente');
      }

      
      handleCloseDialog();
      // Recargar datos para asegurar sincronización
      await loadData();
    } catch (err) {
      console.error('Error al guardar material:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el material');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Manejar eliminación de material
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este material?')) {
      return;
    }

    try {
      setLoading(true);
      await materialesService.delete(id);
      setMateriales(prev => prev.filter(m => m.id !== id));
      setSuccessMessage('Material eliminado correctamente');
      setError(null);
    } catch (err) {
      console.error('Error al eliminar material:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el material');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del diálogo de categoría
  const handleCloseCategoriaDialog = () => {
    setOpenCategoriaDialog(false);
  };

  // Manejar envío del formulario de categoría
  const handleSubmitCategoria = async () => {
    if (!categoriaFormData.nombre.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setCategoriaLoading(true);
      const newCategoria = await materialesService.createCategoria(categoriaFormData);
      setCategorias(prev => [...prev, newCategoria]);
      setSuccessMessage('Categoría creada correctamente');
      handleCloseCategoriaDialog();
    } catch (err) {
      console.error('Error al crear categoría:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la categoría');
    } finally {
      setCategoriaLoading(false);
    }
  };

  // Manejar apertura del diálogo de categoría
  const handleOpenCategoriaDialog = () => {
    setCategoriaFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      color: '#000000',
      orden: 0,
      activa: true
    });
    setOpenCategoriaDialog(true);
  };

  // Cerrar mensajes de éxito/error
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Filtrar categorías activas - CORREGIDO CON PROTECCIÓN
  const categoriasActivas = Array.isArray(categorias) 
    ? categorias.filter(c => c && c.activa === true)
    : [];

  console.log('🔄 Estado actual:', {
    materialesCount: materiales.length,
    categoriasCount: categorias.length,
    categoriasActivasCount: categoriasActivas.length,
    proveedoresCount: proveedores.length,
    loading,
    error
  });

  // Mostrar estado de carga
  if (loading && materiales.length === 0 && categorias.length === 0 && !openDialog) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando materiales...
        </Typography>
      </Box>
    );
  }

  // Mostrar error si no hay datos
  if (error && !openDialog && materiales.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadData}>
          Reintentar carga
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Mensaje de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={handleCloseSuccessMessage}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Mensaje de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={handleCloseError}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Header con título y botones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Materiales
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            onClick={handleResetFilters}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Limpiar
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCategoriaDialog}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Nueva Categoría
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            aria-label="Agregar nuevo material"
            disabled={loading}
          >
            Nuevo Material
          </Button>
        
        </Box>
      </Box>

      {/* Sección de filtros y búsqueda */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <TextField
          label="Buscar por código o nombre"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ej: CONC-001 o Hormigón..."
          sx={{ minWidth: 250 }}
          disabled={loading}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value as number | '')}
            label="Categoría"
            disabled={loading}
          >
            <MenuItem value="">Todas</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Proveedor</InputLabel>
          <Select
            value={filterProveedor}
            onChange={(e) => setFilterProveedor(e.target.value as number | '')}
            label="Proveedor"
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            {proveedores.map((prov) => (
              <MenuItem key={prov.id} value={prov.id}>{prov.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={loading}
        >
          Buscar
        </Button>
      </Box>

      {/* Tabla de materiales */}
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tabla-materiales">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materiales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay materiales registrados
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 1 }}
                    >
                      Crear primer material
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                materiales
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((material) => (
                    <TableRow 
                      key={material.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {material.codigo}
                        </Typography>
                      </TableCell>
                      <TableCell>{material.nombre}</TableCell>
                      <TableCell>
                        <Chip 
                          label={material.categoria_nombre || 'Sin categoría'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {material.cantidad} {material.unidad_medida}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={material.estado_stock} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(material)}
                          aria-label="Editar material"
                          size="small"
                          disabled={loading}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(material.id)}
                          aria-label="Eliminar material"
                          size="small"
                          disabled={loading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={materiales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Diálogo de Material */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código *"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                error={formErrors.codigo}
                helperText={formErrors.codigo ? 'El código es requerido' : ''}
                margin="normal"
                required
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                error={formErrors.nombre}
                helperText={formErrors.nombre ? 'El nombre es requerido' : ''}
                margin="normal"
                required
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={formErrors.categoria} required>
                <InputLabel>Categoría *</InputLabel>
                <Select
                  value={formData.categoria || ''}
                  label="Categoría *"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      categoria: value === '' ? null : Number(value)
                    });
                  }}
                  disabled={submitLoading}
                >
                  <MenuItem value="">
                    <em>Seleccione una categoría</em>
                  </MenuItem>
                  {categoriasActivas.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoria && (
                  <FormHelperText>La categoría es requerida</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={formData.proveedor || ''}
                  label="Proveedor"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      proveedor: value === '' ? null : Number(value)
                    });
                  }}
                  disabled={submitLoading}
                >
                  <MenuItem value="">
                    <em>Seleccione un proveedor</em>
                  </MenuItem>
                  {Array.isArray(proveedores) && proveedores.map((proveedor) => (
                    <MenuItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({
                    ...formData, 
                    unidad_medida: e.target.value as Material['unidad_medida']
                  })}
                  label="Unidad de Medida"
                  disabled={submitLoading}
                >
                  {unidadesMedida.map((unidad) => (
                    <MenuItem key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({
                  ...formData, 
                  cantidad: Number(e.target.value)
                })}
                margin="normal"
                inputProps={{ 
                  min: 0,
                  step: "0.01"
                }}
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({
                  ...formData, 
                  stock_minimo: Number(e.target.value)
                })}
                margin="normal"
                inputProps={{ 
                  min: 0,
                  step: "0.01"
                }}
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio Unitario"
                type="number"
                value={formData.precio_unitario}
                onChange={(e) => setFormData({
                  ...formData, 
                  precio_unitario: Number(e.target.value)
                })}
                margin="normal"
                inputProps={{ 
                  min: 0,
                  step: "0.01"
                }}
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ubicación"
                value={formData.ubicacion}
                onChange={(e) => setFormData({
                  ...formData, 
                  ubicacion: e.target.value
                })}
                margin="normal"
                disabled={submitLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({
                  ...formData, 
                  descripcion: e.target.value
                })}
                margin="normal"
                multiline
                rows={3}
                disabled={submitLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} disabled={submitLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de categoría */}
      <Dialog open={openCategoriaDialog} onClose={handleCloseCategoriaDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Categoría</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código"
                value={categoriaFormData.codigo}
                onChange={(e) => setCategoriaFormData({ ...categoriaFormData, codigo: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Orden"
                type="number"
                value={categoriaFormData.orden}
                onChange={(e) => setCategoriaFormData({ 
                  ...categoriaFormData, 
                  orden: parseInt(e.target.value) || 0 
                })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre *"
                value={categoriaFormData.nombre}
                onChange={(e) => setCategoriaFormData({ ...categoriaFormData, nombre: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={categoriaFormData.descripcion}
                onChange={(e) => setCategoriaFormData({ ...categoriaFormData, descripcion: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Color</InputLabel>
                <Select
                  value={categoriaFormData.color}
                  onChange={(e) => setCategoriaFormData({ 
                    ...categoriaFormData, 
                    color: e.target.value 
                  })}
                  label="Color"
                >
                  <MenuItem value="#000000">Negro</MenuItem>
                  <MenuItem value="#808080">Gris</MenuItem>
                  <MenuItem value="#4169E1">Azul</MenuItem>
                  <MenuItem value="#8B4513">Marrón</MenuItem>
                  <MenuItem value="#FF6347">Rojo</MenuItem>
                  <MenuItem value="#FFD700">Dorado</MenuItem>
                  <MenuItem value="#228B22">Verde</MenuItem>
                  <MenuItem value="#FF69B4">Rosado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={categoriaFormData.activa ? 'true' : 'false'}
                  onChange={(e) => setCategoriaFormData({ 
                    ...categoriaFormData, 
                    activa: e.target.value === 'true' 
                  })}
                  label="Estado"
                >
                  <MenuItem value="true">Activa</MenuItem>
                  <MenuItem value="false">Inactiva</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseCategoriaDialog} disabled={categoriaLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitCategoria} 
            variant="contained" 
            disabled={categoriaLoading}
            startIcon={categoriaLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {categoriaLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Materiales;