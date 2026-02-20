import api from './api';

export interface CategoriaMaterial {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  orden: number;
  activa: boolean;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Material {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: number | null;
  categoria_nombre?: string;
  cantidad: number;
  unidad_medida: 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm' | 'm2' | 'm3' | 'un' | 'pkg';
  precio_unitario: number;
  stock_minimo: number;
  estado_stock?: 'Agotado' | 'Crítico' | 'Bajo' | 'Disponible';
  ubicacion: string;
  proveedor: number | null;
  proveedor_nombre?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipo para crear un material (sin campos auto-generados)
export type MaterialCreate = Omit<Material, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre' | 'proveedor_nombre'>;

// Función para manejar errores de la API
function handleApiError(error: any, operation: string): never {
  console.error(`Error al ${operation}:`, error);
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 403) {
      throw new Error('No tienes permisos para realizar esta operación');
    }

    if (status === 400) {
      const errorMessage = typeof data === 'object' ? Object.values(data).flat().join(', ') : data;
      throw new Error(`Error de validación: ${errorMessage}`);
    }

    if (status === 404) {
      throw new Error('El recurso solicitado no fue encontrado');
    }

    throw new Error(`Error del servidor (${status}): ${data.detail || 'Error desconocido'}`);
  }

  if (error.request) {
    throw new Error('No se pudo conectar con el servidor. Por favor, verifica tu conexión');
  }

  throw new Error(`Error al ${operation}: ${error.message}`);
}

// Función auxiliar para asegurar que siempre obtenemos un array
function ensureArray<T>(data: any, fallback: T[] = []): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si es un objeto con propiedad 'results' (APIs paginadas)
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }
  
  // Si es un objeto con propiedad 'data'
  if (data && typeof data === 'object' && Array.isArray(data.data)) {
    return data.data;
  }
  
  console.warn('ensureArray: Los datos no son un array, devolviendo valor por defecto:', data);
  return fallback;
}

// Función para normalizar categorías (en caso de que el backend use nombres diferentes)
function normalizeCategoria(categoria: any): CategoriaMaterial {
  return {
    id: categoria.id || 0,
    codigo: categoria.codigo || `CAT-${(categoria.id || 0).toString().padStart(3, '0')}`,
    nombre: categoria.nombre || categoria.name || '',
    descripcion: categoria.descripcion || categoria.description || '',
    color: categoria.color || '#000000',
    orden: categoria.orden || categoria.order || 0,
    activa: categoria.activa !== undefined ? categoria.activa : 
            categoria.activo !== undefined ? categoria.activo : 
            categoria.active !== undefined ? categoria.active : true
  };
}

export const materialesService = {
  // getAll acepta parámetros opcionales para búsqueda y filtros
  getAll: async (params?: { search?: string; categoria?: number | string; proveedor?: number | string; estado_stock?: string; page?: number; page_size?: number }): Promise<Material[]> => {
    try {
      const qs = new URLSearchParams();
      if (params) {
        if (params.search) qs.append('search', String(params.search));
        if (params.categoria !== undefined && params.categoria !== null) qs.append('categoria', String(params.categoria));
        if (params.proveedor !== undefined && params.proveedor !== null) qs.append('proveedor', String(params.proveedor));
        if (params.estado_stock) qs.append('estado_stock', String(params.estado_stock));
        if (params.page !== undefined) qs.append('page', String(params.page));
        if (params.page_size !== undefined) qs.append('page_size', String(params.page_size));
      }

      const url = qs.toString() ? `/api/materiales/materiales/?${qs.toString()}` : '/api/materiales/materiales/';
      const response = await api.get(url);
      return ensureArray<Material>(response.data, []);
    } catch (error) {
      throw handleApiError(error, 'obtener materiales');
    }
  },

  getById: async (id: number): Promise<Material> => {
    try {
      const response = await api.get<Material>(`/api/materiales/materiales/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'obtener material');
    }
  },

  create: async (material: MaterialCreate): Promise<Material> => {
    try {
      console.log('🔄 Enviando material para creación:', material);
      
      // Asegurarnos de que la categoría y proveedor sean números o null
      const materialData = {
        ...material,
        categoria: material.categoria ? Number(material.categoria) : null,
        proveedor: material.proveedor ? Number(material.proveedor) : null
      };
      
      console.log('📦 Datos procesados para POST:', materialData);
      
      const response = await api.post<Material>('/api/materiales/materiales/', materialData);
      console.log('✅ Material creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'crear material');
    }
  },

  update: async (id: number, material: Partial<Material>): Promise<Material> => {
    try {
      console.log('🔄 Actualizando material ID:', id, 'con datos:', material);
      
      // Asegurarnos de que la categoría y proveedor sean números o null
      const materialData = {
        ...material,
        categoria: material.categoria !== undefined ? (material.categoria ? Number(material.categoria) : null) : undefined,
        proveedor: material.proveedor !== undefined ? (material.proveedor ? Number(material.proveedor) : null) : undefined
      };
      
      const response = await api.put<Material>(`/api/materiales/materiales/${id}/`, materialData);
      console.log('✅ Material actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'actualizar material');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      console.log('🔄 Eliminando material ID:', id);
      await api.delete(`/api/materiales/materiales/${id}/`);
      console.log('✅ Material eliminado exitosamente');
    } catch (error) {
      throw handleApiError(error, 'eliminar material');
    }
  },

  getCategorias: async (): Promise<CategoriaMaterial[]> => {
    try {
      console.log('🔄 Obteniendo categorías...');
      const response = await api.get('/api/materiales/categorias/');
      console.log('📦 Respuesta de categorías:', response.data);
      
      const rawData = response.data;
      const arrayData = ensureArray<any>(rawData, []);
      
      // Normalizar cada categoría
      const normalizedCategorias = arrayData.map(normalizeCategoria);
      console.log('✅ Categorías normalizadas:', normalizedCategorias);
      
      return normalizedCategorias;
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      return [];
    }
  },

  createCategoria: async (categoria: Omit<CategoriaMaterial, 'id'>): Promise<CategoriaMaterial> => {
    try {
      console.log('🔄 Creando categoría:', categoria);
      const response = await api.post<CategoriaMaterial>('/api/materiales/categorias/', categoria);
      console.log('✅ Categoría creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'crear categoría');
    }
  },

  getProveedores: async (): Promise<Proveedor[]> => {
    try {
      console.log('🔄 Obteniendo proveedores...');
      const response = await api.get('/api/materiales/proveedores/');
      console.log('📦 Respuesta de proveedores:', response.data);
      
      return ensureArray<Proveedor>(response.data, []);
    } catch (error) {
      console.error('❌ Error al obtener proveedores:', error);
      return [];
    }
  },

  createProveedor: async (proveedor: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    try {
      console.log('🔄 Creando proveedor:', proveedor);
      const response = await api.post<Proveedor>('/api/materiales/proveedores/', proveedor);
      console.log('✅ Proveedor creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'crear proveedor');
    }
  },

  getEstadisticas: async (): Promise<any> => {
    try {
      console.log('🔄 Obteniendo estadísticas...');
      const response = await api.get('/api/materiales/estadisticas/');
      console.log('📦 Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  getEstadoDisplay: (estado: Material['estado_stock']): string => {
    return estado || 'Desconocido';
  }
};