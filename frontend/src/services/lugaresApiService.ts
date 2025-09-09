/**
 * API service para lugares de vivienda
 */

// En desarrollo, usar proxy de Vite (rutas relativas /api)
// En producción, usar la URL completa
const API_BASE_URL = import.meta.env.DEV 
    ? '' // Usar rutas relativas para que Vite proxy las redirija
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

console.log('🏠 LugaresApiService - API_BASE_URL configured as:', API_BASE_URL || 'RELATIVE PATHS (using Vite proxy)');

const API_KEY = import.meta.env.VITE_API_KEY || '';

// Interfaz para los datos de lugar de vivienda
export interface LugarVivienda {
    id?: string;
    tipo: 'actual' | 'pasado' | 'mudanza';
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    fechaInicio: string;
    fechaFin?: string;
    esPrincipal: boolean;
    
    // Información básica de la propiedad
    tipoPropiedad: 'casa' | 'apartamento' | 'condominio' | 'townhouse' | 'otro';
    areaTotal: number;
    habitaciones: number;
    banos: number;
    medioBanos: number;
    
    // Información de construcción
    anoConstruction: number;
    tipoFundacion: string;
    materialConstruction: string;
    
    // Características interiores
    calefaccion: string;
    aireAcondicionado: string;
    
    // Estacionamiento
    tipoEstacionamiento: string;
    espaciosEstacionamiento: number;
    
    // Información de terreno
    areaTerreno?: number;
    caracteristicasTerreno: string[];
    
    // Información financiera
    valorEstimado?: number;
    impuestosPrediales?: number;
    hoaFee?: number;
    tieneHOA: boolean;
    
    // Ubicación y vecindario
    vecindario: string;
    walkScore?: number;
    bikeScore?: number;
    
    // Información adicional
    descripcion: string;
    razonMudanza?: string;
    aspectosPositivos: string[];
    aspectosNegativos: string[];
    fotos: string[];
    
    // Metadatos
    twinId?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

// Tipo para crear/actualizar lugar (sin campos readonly)
export type LugarViviendaFormData = Omit<LugarVivienda, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// Tipo para respuesta del backend
export interface LugarViviendaResponse {
    success: boolean;
    data: LugarVivienda;
    message?: string;
}

export interface LugaresViviendaListResponse {
    success: boolean;
    data: LugarVivienda[];
    message?: string;
}

class LugaresApiService {
    private BASE_PATH = '/api/twins';

    // Función helper para hacer requests HTTP
    private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
        const fullUrl = `${API_BASE_URL}${url}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        console.log(`🔄 Making request to: ${fullUrl}`);
        console.log('📋 Request config:', config);

        try {
            const response = await fetch(fullUrl, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Response data:', data);
            return data;
        } catch (error) {
            console.error('❌ Request failed:', error);
            throw error;
        }
    }

    // Obtener todos los lugares de vivienda de un twin
    async getLugaresByTwinId(twinId: string): Promise<LugaresViviendaListResponse> {
        console.log('🏠 Obteniendo lugares de vivienda para twin:', twinId);
        
        try {
            const response = await this.makeRequest<{twinId: string, count: number, homes: LugarVivienda[]}>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda`
            );
            
            console.log('✅ Lugares obtenidos exitosamente:', response);
            
            // Adaptar la respuesta del backend a nuestra interfaz
            return {
                success: true,
                data: response.homes || [],
                message: `Se encontraron ${response.count} lugares`
            };
        } catch (error) {
            console.error('❌ Error obteniendo lugares:', error);
            return {
                success: false,
                data: [],
                message: 'Error al obtener lugares de vivienda'
            };
        }
    }

    // Obtener lugares por tipo
    async getLugaresByTipo(twinId: string, tipo: 'actual' | 'pasado' | 'mudanza'): Promise<LugaresViviendaListResponse> {
        console.log(`🏠 Obteniendo lugares de tipo "${tipo}" para twin:`, twinId);
        
        try {
            const data = await this.makeRequest<LugaresViviendaListResponse>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda?tipo=${tipo}`
            );
            
            console.log('✅ Lugares obtenidos exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo lugares:', error);
            throw error;
        }
    }

    // Crear nuevo lugar de vivienda
    async createLugar(twinId: string, lugarData: LugarViviendaFormData): Promise<LugarViviendaResponse> {
        console.log('🏠 Creando nuevo lugar de vivienda:', lugarData);
        
        try {
            const data = await this.makeRequest<LugarViviendaResponse>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda`,
                {
                    method: 'POST',
                    body: JSON.stringify(lugarData)
                }
            );
            
            console.log('✅ Lugar creado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando lugar:', error);
            throw error;
        }
    }

    // Actualizar lugar de vivienda existente
    async updateLugar(twinId: string, lugarId: string, lugarData: Partial<LugarViviendaFormData>): Promise<LugarViviendaResponse> {
        console.log('🏠 Actualizando lugar de vivienda:', lugarId, lugarData);
        
        try {
            const data = await this.makeRequest<LugarViviendaResponse>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda/${lugarId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(lugarData)
                }
            );
            
            console.log('✅ Lugar actualizado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error actualizando lugar:', error);
            throw error;
        }
    }

    // Eliminar lugar de vivienda
    async deleteLugar(twinId: string, lugarId: string): Promise<{success: boolean; message?: string}> {
        console.log('🏠 Eliminando lugar de vivienda:', lugarId);
        
        try {
            const data = await this.makeRequest<{success: boolean; message?: string}>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda/${lugarId}`,
                {
                    method: 'DELETE'
                }
            );
            
            console.log('✅ Lugar eliminado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error eliminando lugar:', error);
            throw error;
        }
    }

    // Obtener lugar específico por ID
    async getLugarById(twinId: string, lugarId: string): Promise<LugarViviendaResponse> {
        console.log('🏠 Obteniendo lugar específico:', lugarId);
        
        try {
            const data = await this.makeRequest<LugarVivienda>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda/${lugarId}`
            );
            
            console.log('✅ Lugar obtenido exitosamente:', data);
            return {
                success: true,
                data,
                message: 'Lugar obtenido exitosamente'
            };
        } catch (error) {
            console.error('❌ Error obteniendo lugar:', error);
            return {
                success: false,
                data: {} as LugarVivienda,
                message: 'Error al obtener el lugar'
            };
        }
    }

    // Marcar lugar como principal (solo para lugares actuales)
    async marcarComoPrincipal(twinId: string, lugarId: string): Promise<LugarViviendaResponse> {
        console.log('🏠 Marcando lugar como principal:', lugarId);
        
        try {
            const data = await this.makeRequest<LugarViviendaResponse>(
                `${this.BASE_PATH}/${twinId}/lugares-vivienda/${lugarId}/principal`,
                {
                    method: 'PATCH'
                }
            );
            
            console.log('✅ Lugar marcado como principal:', data);
            return data;
        } catch (error) {
            console.error('❌ Error marcando lugar como principal:', error);
            throw error;
        }
    }
}

// Exportar instancia única
export const lugaresApiService = new LugaresApiService();
export default lugaresApiService;
