// ===== SERVICIO API PARA EJERCICIOS Y ACTIVIDAD FÍSICA =====

import React from 'react';
import { 
    ActividadEjercicio, 
    CrearActividadRequest, 
    ActualizarActividadRequest,
    FiltrosActividadRequest,
    ActividadResponse,
    ListaActividadesResponse,
    EstadisticasActividadResponse,
    TipoActividad
} from '@/types/ejercicio.types';

// ===== CONFIGURACIÓN BASE =====
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const EJERCICIOS_ENDPOINT = `${API_BASE_URL}/ejercicios`;

// ===== CLASE PRINCIPAL DEL SERVICIO =====
export class EjercicioApiService {
    
    // ===== MÉTODO AUXILIAR PARA REQUESTS =====
    private async makeRequest<T>(
        url: string, 
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en request:', error);
            throw error;
        }
    }

    // ===== 1. CREAR NUEVA ACTIVIDAD =====
    async crearActividad(request: CrearActividadRequest): Promise<ActividadResponse> {
        const url = `${EJERCICIOS_ENDPOINT}`;
        
        // Validar campos obligatorios
        this.validarCamposObligatorios(request);
        
        // Agregar timestamps
        const actividadCompleta = {
            ...request,
            id: this.generarId(),
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            activo: true,
            sincronizado: false
        };

        return this.makeRequest<ActividadResponse>(url, {
            method: 'POST',
            body: JSON.stringify(actividadCompleta),
        });
    }

    // ===== 2. OBTENER ACTIVIDAD POR ID =====
    async obtenerActividad(id: string, twinId: string): Promise<ActividadResponse> {
        const url = `${EJERCICIOS_ENDPOINT}/${id}?twinId=${twinId}`;
        return this.makeRequest<ActividadResponse>(url);
    }

    // ===== 3. ACTUALIZAR ACTIVIDAD =====
    async actualizarActividad(request: ActualizarActividadRequest): Promise<ActividadResponse> {
        const url = `${EJERCICIOS_ENDPOINT}/${request.id}`;
        
        const actividadActualizada = {
            ...request,
            fechaActualizacion: new Date().toISOString()
        };

        return this.makeRequest<ActividadResponse>(url, {
            method: 'PUT',
            body: JSON.stringify(actividadActualizada),
        });
    }

    // ===== 4. ELIMINAR ACTIVIDAD (SOFT DELETE) =====
    async eliminarActividad(id: string, twinId: string): Promise<ActividadResponse> {
        const url = `${EJERCICIOS_ENDPOINT}/${id}`;
        return this.makeRequest<ActividadResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ twinId }),
        });
    }

    // ===== 5. LISTAR ACTIVIDADES CON FILTROS =====
    async listarActividades(filtros: FiltrosActividadRequest): Promise<ListaActividadesResponse> {
        const queryParams = new URLSearchParams();
        
        // Agregar filtros como query parameters
        Object.entries(filtros).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v.toString()));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        const url = `${EJERCICIOS_ENDPOINT}?${queryParams.toString()}`;
        return this.makeRequest<ListaActividadesResponse>(url);
    }

    // ===== 6. OBTENER ESTADÍSTICAS =====
    async obtenerEstadisticas(
        twinId: string, 
        fechaInicio?: string, 
        fechaFin?: string
    ): Promise<EstadisticasActividadResponse> {
        const queryParams = new URLSearchParams({ twinId });
        
        if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
        if (fechaFin) queryParams.append('fechaFin', fechaFin);

        const url = `${EJERCICIOS_ENDPOINT}/estadisticas?${queryParams.toString()}`;
        return this.makeRequest<EstadisticasActividadResponse>(url);
    }

    // ===== 7. OBTENER ACTIVIDADES DEL DÍA =====
    async obtenerActividadesDelDia(twinId: string, fecha?: string): Promise<ListaActividadesResponse> {
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
        
        return this.listarActividades({
            twinId,
            fechaInicio: fechaConsulta,
            fechaFin: fechaConsulta,
            ordenarPor: 'fechaCreacion',
            ordenDireccion: 'desc'
        });
    }

    // ===== 8. OBTENER ACTIVIDADES DE LA SEMANA =====
    async obtenerActividadesSemana(twinId: string): Promise<ListaActividadesResponse> {
        const hoy = new Date();
        const primerDiaSemana = new Date(hoy);
        primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
        
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);

        return this.listarActividades({
            twinId,
            fechaInicio: primerDiaSemana.toISOString().split('T')[0],
            fechaFin: ultimoDiaSemana.toISOString().split('T')[0],
            ordenarPor: 'fecha',
            ordenDireccion: 'desc'
        });
    }

    // ===== 9. BUSCAR ACTIVIDADES =====
    async buscarActividades(
        twinId: string, 
        termino: string, 
        limite: number = 20
    ): Promise<ListaActividadesResponse> {
        return this.listarActividades({
            twinId,
            busqueda: termino,
            limite,
            ordenarPor: 'fechaCreacion',
            ordenDireccion: 'desc'
        });
    }

    // ===== 10. DUPLICAR ACTIVIDAD =====
    async duplicarActividad(actividadId: string, twinId: string, nuevaFecha?: string): Promise<ActividadResponse> {
        // Primero obtener la actividad original
        const actividadOriginal = await this.obtenerActividad(actividadId, twinId);
        
        if (!actividadOriginal.exito) {
            throw new Error('No se pudo obtener la actividad original');
        }

        // Crear nueva actividad basada en la original
        const { id: _id, fechaCreacion, fechaActualizacion, activo, sincronizado, ...actividadBase } = actividadOriginal.actividad;
        
        const nuevaActividad: CrearActividadRequest = {
            ...actividadBase,
            tipoActividad: actividadBase.tipoActividad as TipoActividad,
            fecha: nuevaFecha || new Date().toISOString().split('T')[0],
            notas: `Duplicado de actividad del ${actividadOriginal.actividad.fecha}. ${actividadOriginal.actividad.notas || ''}`
        };

        return this.crearActividad(nuevaActividad);
    }

    // ===== 11. EXPORTAR ACTIVIDADES =====
    async exportarActividades(
        twinId: string, 
        formato: 'json' | 'csv' | 'excel' = 'json',
        filtros?: Partial<FiltrosActividadRequest>
    ): Promise<Blob> {
        const queryParams = new URLSearchParams({ 
            twinId, 
            formato,
            ...filtros as any
        });

        const url = `${EJERCICIOS_ENDPOINT}/exportar?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': formato === 'json' ? 'application/json' : 
                         formato === 'csv' ? 'text/csv' : 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

        if (!response.ok) {
            throw new Error(`Error al exportar: ${response.statusText}`);
        }

        return response.blob();
    }

    // ===== 12. IMPORTAR ACTIVIDADES =====
    async importarActividades(
        twinId: string, 
        archivo: File,
        formato: 'json' | 'csv' = 'json'
    ): Promise<{ exito: boolean; mensaje: string; actividadesImportadas: number }> {
        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('twinId', twinId);
        formData.append('formato', formato);

        const url = `${EJERCICIOS_ENDPOINT}/importar`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error al importar: ${response.statusText}`);
        }

        return response.json();
    }

    // ===== MÉTODOS AUXILIARES =====

    private generarId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    private validarCamposObligatorios(request: CrearActividadRequest): void {
        const camposObligatorios = ['twinId', 'fecha', 'tipoActividad', 'duracionMinutos', 'intensidad'];
        
        for (const campo of camposObligatorios) {
            if (!request[campo as keyof CrearActividadRequest]) {
                throw new Error(`El campo ${campo} es obligatorio`);
            }
        }

        // Validaciones específicas
        if (request.duracionMinutos < 1) {
            throw new Error('La duración debe ser al menos 1 minuto');
        }

        if (request.fecha > new Date().toISOString().split('T')[0]) {
            throw new Error('La fecha no puede ser futura');
        }
    }

    // ===== MÉTODO PARA MODO OFFLINE (LOCALSTORAGE) =====
    private getLocalStorageKey(twinId: string): string {
        return `ejercicios_${twinId}`;
    }

    async guardarEnLocal(twinId: string, actividades: ActividadEjercicio[]): Promise<void> {
        try {
            const key = this.getLocalStorageKey(twinId);
            localStorage.setItem(key, JSON.stringify(actividades));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            throw new Error('No se pudo guardar en almacenamiento local');
        }
    }

    async cargarDeLocal(twinId: string): Promise<ActividadEjercicio[]> {
        try {
            const key = this.getLocalStorageKey(twinId);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error cargando de localStorage:', error);
            return [];
        }
    }

    async sincronizarConServidor(twinId: string): Promise<{ exito: boolean; mensaje: string }> {
        try {
            // Obtener datos locales no sincronizados
            const actividadesLocales = await this.cargarDeLocal(twinId);
            const noSincronizadas = actividadesLocales.filter(a => !a.sincronizado);

            // Enviar al servidor
            const promesas = noSincronizadas.map(actividad => 
                this.crearActividad(actividad as CrearActividadRequest)
            );

            await Promise.all(promesas);

            // Marcar como sincronizadas
            const actividadesActualizadas = actividadesLocales.map(a => ({
                ...a,
                sincronizado: true
            }));

            await this.guardarEnLocal(twinId, actividadesActualizadas);

            return {
                exito: true,
                mensaje: `${noSincronizadas.length} actividades sincronizadas exitosamente`
            };

        } catch (error) {
            console.error('Error en sincronización:', error);
            return {
                exito: false,
                mensaje: 'Error al sincronizar con el servidor'
            };
        }
    }
}

// ===== INSTANCIA SINGLETON =====
export const ejercicioApiService = new EjercicioApiService();

// ===== HOOKS PERSONALIZADOS PARA REACT =====
export const useEjercicios = (twinId: string) => {
    const [actividades, setActividades] = React.useState<ActividadEjercicio[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const cargarActividades = async (filtros?: Partial<FiltrosActividadRequest>) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await ejercicioApiService.listarActividades({
                twinId,
                ...filtros
            });
            
            if (response.exito) {
                setActividades(response.actividades);
            } else {
                setError('Error al cargar actividades');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return {
        actividades,
        loading,
        error,
        cargarActividades,
        crearActividad: ejercicioApiService.crearActividad.bind(ejercicioApiService),
        actualizarActividad: ejercicioApiService.actualizarActividad.bind(ejercicioApiService),
        eliminarActividad: ejercicioApiService.eliminarActividad.bind(ejercicioApiService)
    };
};

// ===== CONFIGURACIÓN DE ENDPOINTS PARA BACKEND =====
export const ENDPOINTS_BACKEND = {
    // ===== RUTAS PRINCIPALES =====
    BASE: '/api/ejercicios',
    
    // ===== CRUD BÁSICO =====
    CREATE: 'POST /api/ejercicios',
    GET_BY_ID: 'GET /api/ejercicios/:id',
    UPDATE: 'PUT /api/ejercicios/:id',
    DELETE: 'DELETE /api/ejercicios/:id',
    LIST: 'GET /api/ejercicios',
    
    // ===== ESTADÍSTICAS =====
    ESTADISTICAS: 'GET /api/ejercicios/estadisticas',
    ESTADISTICAS_DIARIAS: 'GET /api/ejercicios/estadisticas/diarias',
    ESTADISTICAS_SEMANALES: 'GET /api/ejercicios/estadisticas/semanales',
    ESTADISTICAS_MENSUALES: 'GET /api/ejercicios/estadisticas/mensuales',
    
    // ===== BÚSQUEDA Y FILTROS =====
    BUSCAR: 'GET /api/ejercicios/buscar',
    FILTRAR_POR_TIPO: 'GET /api/ejercicios/tipo/:tipoActividad',
    FILTRAR_POR_FECHA: 'GET /api/ejercicios/fecha/:fecha',
    FILTRAR_POR_RANGO: 'GET /api/ejercicios/rango/:fechaInicio/:fechaFin',
    
    // ===== IMPORTACIÓN Y EXPORTACIÓN =====
    EXPORTAR: 'GET /api/ejercicios/exportar',
    IMPORTAR: 'POST /api/ejercicios/importar',
    
    // ===== OPERACIONES ESPECIALES =====
    DUPLICAR: 'POST /api/ejercicios/:id/duplicar',
    SINCRONIZAR: 'POST /api/ejercicios/sincronizar',
    
    // ===== REPORTES =====
    REPORTE_MENSUAL: 'GET /api/ejercicios/reportes/mensual',
    REPORTE_ANUAL: 'GET /api/ejercicios/reportes/anual',
    TENDENCIAS: 'GET /api/ejercicios/tendencias'
};
