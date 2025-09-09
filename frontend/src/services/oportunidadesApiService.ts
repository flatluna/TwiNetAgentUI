// En desarrollo, usar rutas relativas para aprovechar el proxy de Vite
// En producción, usar la URL completa
const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:7011'
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

const API_KEY = import.meta.env.VITE_API_KEY || '';

// Interfaz para la respuesta del API de oportunidades
export interface ApiResponse {
    Success: boolean;
    Message: string;
    UsuarioId: string;
    TotalOpportunities: number;
    Opportunities: OportunidadEmpleo[];
    ProcessedAt: string;
    Stats: any;
}

export interface OportunidadEmpleo {
    id?: string;
    empresa: string;
    puesto: string;
    descripcion: string;
    responsabilidades: string;
    habilidadesRequeridas: string;
    salario: string;
    beneficios: string;
    ubicacion: string;
    fechaAplicacion: string;
    estado: 'aplicado' | 'entrevista' | 'esperando' | 'rechazado' | 'aceptado' | 'interesado';
    URLCompany?: string;
    contactoNombre?: string;
    contactoEmail?: string;
    contactoTelefono?: string;
    notas?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

class OportunidadesApiService {
    private baseUrl = `${API_BASE_URL}/api`;

    private async makeRequest<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Crear nueva oportunidad de empleo
    async createJobOpportunity(twinId: string, opportunity: Omit<OportunidadEmpleo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<OportunidadEmpleo> {
        const url = `${this.baseUrl}/twins/${twinId}/opportunities`;
        
        return this.makeRequest<OportunidadEmpleo>(url, {
            method: 'POST',
            body: JSON.stringify(opportunity),
        });
    }

    // Obtener todas las oportunidades de un twin
    async getJobOpportunities(twinId: string): Promise<ApiResponse> {
        const url = `${this.baseUrl}/twins/${twinId}/opportunities`;
        
        return this.makeRequest<ApiResponse>(url, {
            method: 'GET',
        });
    }

    // Obtener una oportunidad específica
    async getJobOpportunity(twinId: string, opportunityId: string): Promise<OportunidadEmpleo> {
        const url = `${this.baseUrl}/twins/${twinId}/opportunities/${opportunityId}`;
        
        return this.makeRequest<OportunidadEmpleo>(url, {
            method: 'GET',
        });
    }

    // Actualizar una oportunidad existente
    async updateJobOpportunity(twinId: string, opportunityId: string, opportunity: Partial<OportunidadEmpleo>): Promise<OportunidadEmpleo> {
        const url = `${this.baseUrl}/twins/${twinId}/opportunities/${opportunityId}`;
        
        return this.makeRequest<OportunidadEmpleo>(url, {
            method: 'PUT',
            body: JSON.stringify(opportunity),
        });
    }

    // Eliminar una oportunidad
    async deleteJobOpportunity(twinId: string, opportunityId: string): Promise<void> {
        const url = `${this.baseUrl}/twins/${twinId}/opportunities/${opportunityId}`;
        
        return this.makeRequest<void>(url, {
            method: 'DELETE',
        });
    }
}

export const oportunidadesApiService = new OportunidadesApiService();
