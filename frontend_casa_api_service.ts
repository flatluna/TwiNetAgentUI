// services/casaApiService.ts
// Este archivo muestra cómo el frontend debe enviar los datos al backend

export interface CreateCasaRequest {
  // Campos requeridos
  twinId: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  tipo: 'actual' | 'pasado' | 'inversion' | 'vacacional';
  tipoPropiedad: 'casa' | 'apartamento' | 'condominio' | 'townhouse' | 'duplex' | 'mansion' | 'cabana' | 'otro';
  fechaInicio: string; // ISO date format
  areaTotal: number;
  areaConstruida: number;
  areaTerreno: number;
  habitaciones: number;
  banos: number;
  medioBanos: number;
  pisos: number;
  anoConstructorcion: number;
  descripcion: string;
  esPrincipal: boolean;

  // Campos opcionales
  fechaCompra?: string;
  fechaVenta?: string;
  fechaFin?: string;
  
  // Características especiales
  tieneGaraje?: boolean;
  espaciosGaraje?: number;
  tienePiscina?: boolean;
  tieneJardin?: boolean;
  tieneSotano?: boolean;
  tieneAtico?: boolean;
  tieneTerraza?: boolean;
  tieneBalcon?: boolean;
  
  // Sistemas y servicios
  calefaccion?: string;
  aireAcondicionado?: string;
  tipoAgua?: string;
  sistemaElectrico?: string;
  internet?: string;
  sistemaSeguridad?: string;
  
  // Información financiera
  valorCompra?: number;
  valorActual?: number;
  valorEstimado?: number;
  impuestosPrediales?: number;
  seguroAnual?: number;
  hoaFee?: number;
  serviciosPublicos?: number;
  
  // Ubicación y entorno
  vecindario?: string;
  colegiosCercanos?: string[];
  transportePublico?: string;
  comerciosCercanos?: string[];
  
  // Estado y condición
  estadoGeneral?: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_reparaciones';
  ultimaRenovacion?: string;
  reparacionesPendientes?: string[];
  mejoras?: string[];
  
  // Información adicional
  aspectosPositivos?: string[];
  aspectosNegativos?: string[];
  recuerdosEspeciales?: string[];
  
  // Multimedia
  fotos?: string[];
  documentos?: string[];
}

export interface CasaResponse {
  id: string;
  twinId: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  tipo: 'actual' | 'pasado' | 'inversion' | 'vacacional';
  tipoPropiedad: 'casa' | 'apartamento' | 'condominio' | 'townhouse' | 'duplex' | 'mansion' | 'cabana' | 'otro';
  
  // Fechas
  fechaCompra?: string;
  fechaVenta?: string;
  fechaInicio: string;
  fechaFin?: string;
  
  // Características físicas
  areaTotal: number;
  areaConstruida: number;
  areaTerreno: number;
  habitaciones: number;
  banos: number;
  medioBanos: number;
  pisos: number;
  anoConstructorcion: number;
  
  // Características especiales
  tieneGaraje: boolean;
  espaciosGaraje: number;
  tienePiscina: boolean;
  tieneJardin: boolean;
  tieneSotano: boolean;
  tieneAtico: boolean;
  tieneTerraza: boolean;
  tieneBalcon: boolean;
  
  // Sistemas y servicios
  calefaccion?: string;
  aireAcondicionado?: string;
  tipoAgua?: string;
  sistemaElectrico?: string;
  internet?: string;
  sistemaSeguridad?: string;
  
  // Información financiera
  valorCompra?: number;
  valorActual?: number;
  valorEstimado?: number;
  impuestosPrediales?: number;
  seguroAnual?: number;
  hoaFee?: number;
  serviciosPublicos?: number;
  
  // Ubicación y entorno
  vecindario?: string;
  colegiosCercanos: string[];
  transportePublico?: string;
  comerciosCercanos: string[];
  
  // Estado y condición
  estadoGeneral: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_reparaciones';
  ultimaRenovacion?: string;
  reparacionesPendientes: string[];
  mejoras: string[];
  
  // Información adicional
  descripcion?: string;
  aspectosPositivos: string[];
  aspectosNegativos: string[];
  recuerdosEspeciales: string[];
  
  // Multimedia
  fotos: string[];
  documentos: string[];
  
  // Metadata
  esPrincipal: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  total?: number;
}

class CasaApiService {
  private baseUrl = '/api/casas';

  /**
   * Crear una nueva casa
   */
  async createCasa(casaData: CreateCasaRequest): Promise<ApiResponse<CasaResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(casaData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al crear casa');
      }

      return result;
    } catch (error) {
      console.error('Error al crear casa:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las casas de un twin
   */
  async getCasasByTwinId(twinId: string): Promise<ApiResponse<CasaResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?twinId=${encodeURIComponent(twinId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al obtener casas');
      }

      return result;
    } catch (error) {
      console.error('Error al obtener casas:', error);
      throw error;
    }
  }

  /**
   * Obtener una casa específica
   */
  async getCasaById(id: string): Promise<ApiResponse<CasaResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al obtener casa');
      }

      return result;
    } catch (error) {
      console.error('Error al obtener casa:', error);
      throw error;
    }
  }

  /**
   * Actualizar una casa existente
   */
  async updateCasa(id: string, casaData: CreateCasaRequest): Promise<ApiResponse<CasaResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(casaData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al actualizar casa');
      }

      return result;
    } catch (error) {
      console.error('Error al actualizar casa:', error);
      throw error;
    }
  }

  /**
   * Eliminar una casa
   */
  async deleteCasa(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al eliminar casa');
      }

      return result;
    } catch (error) {
      console.error('Error al eliminar casa:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    // Implementar según tu sistema de autenticación
    // Por ejemplo, desde localStorage, sessionStorage, etc.
    return localStorage.getItem('authToken') || '';
  }
}

// Función para mapear los datos del formulario frontend al formato del backend
export function mapFormDataToCreateRequest(formData: any, twinId: string): CreateCasaRequest {
  return {
    // Campos requeridos
    twinId,
    nombre: formData.nombre || '',
    direccion: formData.direccion || '',
    ciudad: formData.ciudad || '',
    estado: formData.estado || '',
    codigoPostal: formData.codigoPostal || '',
    pais: formData.pais || 'Estados Unidos',
    tipo: formData.tipo || 'actual',
    tipoPropiedad: formData.tipoPropiedad || 'casa',
    fechaInicio: formData.fechaInicio || new Date().toISOString().split('T')[0],
    areaTotal: Number(formData.areaTotal) || 0,
    areaConstruida: Number(formData.areaConstruida) || 0,
    areaTerreno: Number(formData.areaTerreno) || 0,
    habitaciones: Number(formData.habitaciones) || 0,
    banos: Number(formData.banos) || 0,
    medioBanos: Number(formData.medioBanos) || 0,
    pisos: Number(formData.pisos) || 1,
    anoConstructorcion: Number(formData.anoConstructorcion) || new Date().getFullYear(),
    descripcion: formData.descripcion || '',
    esPrincipal: formData.esPrincipal || false,

    // Campos opcionales
    fechaCompra: formData.fechaCompra || undefined,
    fechaVenta: formData.fechaVenta || undefined,
    fechaFin: formData.fechaFin || undefined,

    // Características especiales
    tieneGaraje: formData.tieneGaraje || false,
    espaciosGaraje: Number(formData.espaciosGaraje) || 0,
    tienePiscina: formData.tienePiscina || false,
    tieneJardin: formData.tieneJardin || false,
    tieneSotano: formData.tieneSotano || false,
    tieneAtico: formData.tieneAtico || false,
    tieneTerraza: formData.tieneTerraza || false,
    tieneBalcon: formData.tieneBalcon || false,

    // Sistemas y servicios
    calefaccion: formData.calefaccion || undefined,
    aireAcondicionado: formData.aireAcondicionado || undefined,
    tipoAgua: formData.tipoAgua || undefined,
    sistemaElectrico: formData.sistemaElectrico || undefined,
    internet: formData.internet || undefined,
    sistemaSeguridad: formData.sistemaSeguridad || undefined,

    // Información financiera
    valorCompra: formData.valorCompra ? Number(formData.valorCompra) : undefined,
    valorActual: formData.valorActual ? Number(formData.valorActual) : undefined,
    valorEstimado: formData.valorEstimado ? Number(formData.valorEstimado) : undefined,
    impuestosPrediales: formData.impuestosPrediales ? Number(formData.impuestosPrediales) : undefined,
    seguroAnual: formData.seguroAnual ? Number(formData.seguroAnual) : undefined,
    hoaFee: formData.hoaFee ? Number(formData.hoaFee) : undefined,
    serviciosPublicos: formData.serviciosPublicos ? Number(formData.serviciosPublicos) : undefined,

    // Ubicación y entorno
    vecindario: formData.vecindario || undefined,
    colegiosCercanos: Array.isArray(formData.colegiosCercanos) ? formData.colegiosCercanos.filter(Boolean) : [],
    transportePublico: formData.transportePublico || undefined,
    comerciosCercanos: Array.isArray(formData.comerciosCercanos) ? formData.comerciosCercanos.filter(Boolean) : [],

    // Estado y condición
    estadoGeneral: formData.estadoGeneral || 'bueno',
    ultimaRenovacion: formData.ultimaRenovacion || undefined,
    reparacionesPendientes: Array.isArray(formData.reparacionesPendientes) ? formData.reparacionesPendientes.filter(Boolean) : [],
    mejoras: Array.isArray(formData.mejoras) ? formData.mejoras.filter(Boolean) : [],

    // Información adicional
    aspectosPositivos: Array.isArray(formData.aspectosPositivos) ? formData.aspectosPositivos.filter(Boolean) : [],
    aspectosNegativos: Array.isArray(formData.aspectosNegativos) ? formData.aspectosNegativos.filter(Boolean) : [],
    recuerdosEspeciales: Array.isArray(formData.recuerdosEspeciales) ? formData.recuerdosEspeciales.filter(Boolean) : [],

    // Multimedia
    fotos: Array.isArray(formData.fotos) ? formData.fotos.filter(Boolean) : [],
    documentos: Array.isArray(formData.documentos) ? formData.documentos.filter(Boolean) : []
  };
}

// Ejemplo de uso en el componente CrearCasaPage
export function useCrearCasa() {
  const casaService = new CasaApiService();

  const crearCasa = async (formData: any, twinId: string) => {
    try {
      // Validar datos antes de enviar
      if (!formData.nombre || !formData.direccion || !formData.ciudad) {
        throw new Error('Campos requeridos faltantes');
      }

      // Mapear datos del formulario
      const casaRequest = mapFormDataToCreateRequest(formData, twinId);

      // Enviar al backend
      const response = await casaService.createCasa(casaRequest);

      if (response.success && response.data) {
        console.log('Casa creada exitosamente:', response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Error al crear casa');
      }
    } catch (error) {
      console.error('Error al crear casa:', error);
      throw error;
    }
  };

  return { crearCasa };
}

// Exportar instancia del servicio
export default new CasaApiService();

/* EJEMPLO DE PAYLOAD JSON QUE SE ENVIARÁ AL BACKEND */

const ejemploPayload: CreateCasaRequest = {
  // Campos requeridos
  "twinId": "user123",
  "nombre": "Casa Principal Teravista",
  "direccion": "18625 Schultz Lane",
  "ciudad": "Round Rock", 
  "estado": "Texas",
  "codigoPostal": "78664",
  "pais": "Estados Unidos",
  "tipo": "actual",
  "tipoPropiedad": "casa",
  "fechaInicio": "2018-06-15",
  "areaTotal": 2130,
  "areaConstruida": 2130,
  "areaTerreno": 7500,
  "habitaciones": 4,
  "banos": 3,
  "medioBanos": 1,
  "pisos": 2,
  "anoConstructorcion": 2016,
  "descripcion": "Hermosa casa de dos pisos en el vecindario de Teravista. Cocina renovada, jardín grande y excelente ubicación.",
  "esPrincipal": true,

  // Campos opcionales
  "fechaCompra": "2018-06-15",
  "tieneGaraje": true,
  "espaciosGaraje": 2,
  "tienePiscina": false,
  "tieneJardin": true,
  "tieneSotano": false,
  "tieneAtico": true,
  "tieneTerraza": true,
  "tieneBalcon": false,
  "calefaccion": "Gas Natural",
  "aireAcondicionado": "Central",
  "tipoAgua": "Municipal",
  "sistemaElectrico": "220V",
  "internet": "Fibra Óptica",
  "sistemaSeguridad": "ADT",
  "valorCompra": 412000,
  "valorActual": 485000,
  "valorEstimado": 490000,
  "impuestosPrediales": 9540,
  "seguroAnual": 1800,
  "hoaFee": 33,
  "serviciosPublicos": 180,
  "vecindario": "Teravista",
  "colegiosCercanos": ["Teravista Elementary", "Canyon Vista Middle School"],
  "transportePublico": "Capital Metro Bus",
  "comerciosCercanos": ["H-E-B", "Target", "Home Depot"],
  "estadoGeneral": "muy_bueno",
  "ultimaRenovacion": "2022-03-01",
  "reparacionesPendientes": ["Pintar habitación principal"],
  "mejoras": ["Renovación de cocina 2022", "Nuevo sistema HVAC 2021"],
  "aspectosPositivos": ["Cocina renovada", "Jardín grande", "Excelente vecindario", "Cerca de colegios"],
  "aspectosNegativos": ["Necesita pintura en algunas habitaciones"],
  "recuerdosEspeciales": ["Primera casa propia", "Navidades familiares", "Fiestas de cumpleaños en el jardín"],
  "fotos": [],
  "documentos": []
};
