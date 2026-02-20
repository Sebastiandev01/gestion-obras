import api from './api';
import { AxiosError } from 'axios';

export interface Asistencia {
  id: number;
  usuario: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    rol: string;
  };
  fecha: string;
  hora: string;
  tipo: 'ENT' | 'SAL';
  ubicacion?: string;
  observaciones?: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

export interface AsistenciaCreate {
  tipo: 'ENT' | 'SAL';
  ubicacion?: string;
  observaciones?: string;
  usuario_id?: number;
  fecha?: string;
  hora?: string;
}

// ✅ Función auxiliar para obtener fecha y hora en timezone de Bogotá
export const getBogotaDateTime = (): { fecha: string; hora: string } => {
  const now = new Date();
  
  // Usar UTC offset de Bogotá (UTC-5)
  const bogotaOffset = -5; // horas
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const bogotaTime = new Date(utcTime + bogotaOffset * 60 * 60 * 1000);
  
  const year = bogotaTime.getFullYear();
  const month = String(bogotaTime.getMonth() + 1).padStart(2, '0');
  const day = String(bogotaTime.getDate()).padStart(2, '0');
  const fecha = `${year}-${month}-${day}`;

  const hours = String(bogotaTime.getHours()).padStart(2, '0');
  const minutes = String(bogotaTime.getMinutes()).padStart(2, '0');
  const seconds = String(bogotaTime.getSeconds()).padStart(2, '0');
  const hora = `${hours}:${minutes}:${seconds}`;

  return { fecha, hora };
};

// ✅ Función auxiliar para obtener solo la fecha de hoy en Bogotá
export const getHoyBogota = (): string => {
  const { fecha } = getBogotaDateTime();
  return fecha;
};

export const asistenciaService = {
  // ✅ Obtener todos los registros
  getAll: async (): Promise<Asistencia[]> => {
    try {
      console.log('🔍 Llamando a GET /api/asistencia/registros/');
      const response = await api.get('/api/asistencia/registros/');
      console.log('✅ GET exitoso. Datos recibidos:', response.data);
      
      // El backend devuelve estructura paginada: {count, next, previous, results}
      // Extraer el array de results
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Fallback: si es un array directo, retornarlo
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Error al obtener asistencias:', error);
      if (error instanceof AxiosError) {
        console.error('Detalles Axios:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      throw error;
    }
  },

  // ✅ Obtener un registro por ID
  getById: async (id: number): Promise<Asistencia> => {
    try {
      const response = await api.get<Asistencia>(`/api/asistencia/registros/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asistencia por ID:', error);
      throw error;
    }
  },

    // ✅ CORREGIDO: Crear un nuevo registro
  create: async (data: AsistenciaCreate): Promise<Asistencia> => {
    try {
      // NO ENVIAR FECHA NI HORA - Dejar que el backend las calcule
      // El backend usa timezone.localtime() en America/Bogota
      const dataToSend = {
        tipo: data.tipo, // IMPORTANTE: tipo es requerido
        ubicacion: data.ubicacion || null,
        observaciones: data.observaciones || null,
      };

      console.log('📤 Enviando POST a /api/asistencia/registros/');
      console.log('📦 Payload completo:', JSON.stringify(dataToSend, null, 2));

      const response = await api.post('/api/asistencia/registros/', dataToSend);
      
      console.log('✅ POST exitoso. Respuesta:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en create:', error);
      
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        console.error('📊 Detalles del error Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Log más detallado del error
        if (errorData) {
          console.error('🔴 Respuesta del servidor:', errorData);
          if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            console.error('🔴 MENSAJE DE ERROR:', errorData.non_field_errors[0]);
          }
        }
      }
      
      throw error;
    }
  },
  // ✅ Actualizar un registro
  update: async (id: number, data: Partial<Asistencia>): Promise<Asistencia> => {
    try {
      const response = await api.put(`/api/asistencia/registros/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      throw error;
    }
  },

  // ✅ Eliminar un registro
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/asistencia/registros/${id}/`);
    } catch (error) {
      console.error('Error al eliminar asistencia:', error);
      throw error;
    }
  },

  // ✅ Obtener resumen
  getResumen: async (fechaInicio?: string, fechaFin?: string): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await api.get('/api/asistencia/resumen/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de asistencia:', error);
      throw error;
    }
  },

  // ✅ Registros con filtros
  getRegistrosAdmin: async (usuarioId?: number, fechaInicio?: string, fechaFin?: string): Promise<Asistencia[]> => {
    try {
      const params = new URLSearchParams();
      if (usuarioId) params.append('usuario_id', usuarioId.toString());
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await api.get<Asistencia[]>('/api/asistencia/registros/', { params });
      // El backend devuelve estructura paginada: {count, next, previous, results}
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener registros admin:', error);
      throw error;
    }
  },

  // ✅ Método para marcar entrada/salida rápida
  marcarAsistencia: async (tipo: 'ENT' | 'SAL', ubicacion?: string, observaciones?: string): Promise<Asistencia> => {
    try {
      const data: AsistenciaCreate = {
        tipo,
        ubicacion,
        observaciones,
      };
      
      const response = await api.post('/api/asistencia/registros/', data);
      return response.data;
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      throw error;
    }
  },

  // ✅ Aprobar/rechazar asistencia
  cambiarEstado: async (id: number, estado: 'APROBADO' | 'RECHAZADO', motivo?: string): Promise<Asistencia> => {
    try {
      const response = await api.patch(`/api/asistencia/registros/${id}/`, {
        estado,
        observaciones: motivo ? `Estado cambiado: ${motivo}` : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de asistencia:', error);
      throw error;
    }
  },

  // ✅ Obtener asistencias por usuario
  getByUsuario: async (usuarioId: number): Promise<Asistencia[]> => {
    try {
      const response = await api.get<Asistencia[]>(`/api/asistencia/registros/?usuario_id=${usuarioId}`);
      // El backend devuelve estructura paginada: {count, next, previous, results}
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener asistencias por usuario:', error);
      throw error;
    }
  },

    // ✅ NUEVO: Obtener registros del día actual
  getRegistrosHoy: async (): Promise<Asistencia[]> => {
    try {
      console.log('📅 Obteniendo registros de hoy...');
      
      // Solo obtener los registros del usuario actual
      const response = await api.get<Asistencia[]>('/api/asistencia/registros/');
      
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Registros encontrados:', data.length);
      
      // Filtrar solo los de hoy usando la fecha de Bogotá
      const hoy = getHoyBogota();
      const registrosHoy = data.filter(r => r.fecha === hoy);
      
      console.log('✅ Registros de hoy (Bogotá):', registrosHoy.length, 'Fecha:', hoy);
      return registrosHoy;
    } catch (error) {
      console.error('Error al obtener registros de hoy:', error);
      throw error;
    }
  },
  // ✅ NUEVO: Verificar si ya hay registro hoy
  verificarRegistroHoy: async (): Promise<{ENT: boolean, SAL: boolean}> => {
    try {
      const registros = await asistenciaService.getRegistrosHoy();
      
      // Asegurar que registros es un array
      const registrosArray = Array.isArray(registros) ? registros : [];
      
      return {
        ENT: registrosArray.some(r => r.tipo === 'ENT'),
        SAL: registrosArray.some(r => r.tipo === 'SAL')
      };
    } catch (error) {
      console.error('Error al verificar registro hoy:', error);
      return { ENT: false, SAL: false };
    }
  }
};