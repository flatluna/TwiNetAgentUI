// services/casaAgentApiService.ts
// Servicio para conectar con el endpoint AI del backend para crear casas

import { useCallback } from 'react';

export interface HomeData {
  id: string;
  twinID: string;
  tipo: string; // actual, pasado, mudanza
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD | null
  esPrincipal: boolean;
  
  // Información de la propiedad
  tipoPropiedad: string; // casa, apartamento, condominio, townhouse, otro
  areaTotal: number; // pies cuadrados
  habitaciones: number;
  banos: number;
  medioBanos: number;
  
  // Información de construcción
  anoConstruction: number;
  tipoFundacion: string;
  materialConstruction: string;
  
  // Sistemas y características
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
  fechaCreacion: string;
  fechaActualizacion: string;
  type: string;
  
  // Análisis AI
  aiAnalysis?: any;
}

export interface GetHomesResponse {
  twinId: string;
  count: number;
  homes: HomeData[];
}

export interface AgentCreateHomeRequest {
  // Campos requeridos básicos
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  tipo: 'actual' | 'pasado' | 'inversion' | 'vacacional';
  tipoPropiedad: 'casa' | 'apartamento' | 'condominio' | 'townhouse' | 'duplex' | 'mansion' | 'cabana' | 'otro';
  fechaInicio: string; // ISO date format
  
  // Características físicas básicas
  areaTotal: number;
  areaConstruida: number;
  areaTerreno: number;
  habitaciones: number;
  banos: number;
  medioBanos: number;
  pisos: number;
  anoConstructorcion: number;
  
  // Descripción para procesamiento AI
  descripcion: string;
  
  // Metadata
  esPrincipal: boolean;
  
  // Campos opcionales que el AI puede procesar
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

export interface AgentCreateHomeResponse {
  success: boolean;
  twinId: string;
  operation: string;
  homeData?: HomeData;
  homesData?: HomeData[]; // Para cuando se obtienen múltiples casas
  aiResponse?: {
    confidence: number;
    suggestedImprovements: string[];
    marketAnalysis?: {
      estimatedValue: number;
      comparableProperties: Array<{
        address: string;
        price: number;
        similarity: number;
      }>;
    };
  };
  error?: string;
  validationInfo?: {
    isValid: boolean;
    validationErrors: string[];
    enrichmentSuggestions: string[];
    propertyInsights: string[];
    estimatedValueRange?: {
      min: number;
      max: number;
    };
    neighborhoodScore?: number;
  };
  processingTimeMs: number;
  processedAt: string;
}

class CasaAgentApiService {
  private baseUrl = '/api/twins';

  /**
   * Actualizar una casa existente usando el endpoint PUT del backend
   */
  async updateHome(twinId: string, homeId: string, homeData: HomeData): Promise<{ success: boolean; homeData?: HomeData; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${twinId}/lugares-vivienda/${homeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación aquí
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(homeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        homeData: result.homeData
      };
    } catch (error) {
      console.error('❌ Error al actualizar casa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener casas/hogares por TwinId usando el endpoint real del backend
   */
  async getHomesByTwinId(twinId: string, filters?: {
    tipo?: string;
    ciudad?: string;
    estado?: string;
    esPrincipal?: boolean;
  }): Promise<GetHomesResponse> {
    try {
      let url = `${this.baseUrl}/${twinId}/lugares-vivienda`;
      
      // Agregar filtros si se proporcionan
      if (filters) {
        const searchParams = new URLSearchParams();
        if (filters.tipo) searchParams.append('tipo', filters.tipo);
        if (filters.ciudad) searchParams.append('ciudad', filters.ciudad);
        if (filters.estado) searchParams.append('estado', filters.estado);
        if (filters.esPrincipal !== undefined) searchParams.append('esPrincipal', filters.esPrincipal.toString());
        
        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación aquí
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetHomesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener casas:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva casa usando el endpoint AI del backend
   */
  async agentCreateHome(twinId: string, casaData: AgentCreateHomeRequest): Promise<AgentCreateHomeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${twinId}/homes/agent/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(casaData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al crear casa con AI');
      }

      return result;
    } catch (error) {
      console.error('Error al crear casa con AI:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las casas de un twin
   */
  async getCasasByTwinId(twinId: string): Promise<AgentCreateHomeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${twinId}/homes`, {
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

  private getAuthToken(): string {
    // Implementar según tu sistema de autenticación
    // Por ejemplo, desde localStorage, sessionStorage, etc.
    return localStorage.getItem('authToken') || '';
  }
}

// Función para mapear los datos del formulario frontend al formato del backend AI
export function mapFormDataToAgentRequest(formData: any): AgentCreateHomeRequest {
  return {
    // Campos requeridos
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

// Hook personalizado para usar en los componentes
export function useAgentCreateHome() {
  const casaService = new CasaAgentApiService();

  const crearCasaConIA = async (formData: any, twinId: string) => {
    try {
      // Validar datos antes de enviar
      if (!formData.nombre || !formData.direccion || !formData.ciudad) {
        throw new Error('Campos requeridos faltantes');
      }

      if (!twinId) {
        throw new Error('TwinId es requerido');
      }

      // Mapear datos del formulario
      const casaRequest = mapFormDataToAgentRequest(formData);

      console.log('🏠 Enviando datos al AI backend:', {
        twinId,
        endpoint: `/api/twins/${twinId}/homes/agent/create`,
        payload: casaRequest
      });

      // Enviar al backend AI
      const response = await casaService.agentCreateHome(twinId, casaRequest);

      if (response.success && response.homeData) {
        console.log('✅ Casa creada exitosamente con AI:', response.homeData);
        
        // Log AI processing details if available
        if (response.aiResponse) {
          console.log('🤖 Detalles de procesamiento AI:', response.aiResponse);
        }
        
        // Log validation info if available
        if (response.validationInfo) {
          console.log('📊 Información de validación:', response.validationInfo);
        }
        
        return response.homeData;
      } else {
        throw new Error(response.error || 'Error al crear casa con AI');
      }
    } catch (error) {
      console.error('❌ Error al crear casa con AI:', error);
      throw error;
    }
  };

  const obtenerCasas = useCallback(async (twinId: string, filters?: {
    tipo?: string;
    ciudad?: string;
    estado?: string;
    esPrincipal?: boolean;
  }) => {
    try {
      if (!twinId) {
        throw new Error('TwinId es requerido');
      }

      console.log('🏠 Obteniendo casas desde backend para twin:', twinId, filters ? 'con filtros:' : 'sin filtros', filters);
      
      const response = await casaService.getHomesByTwinId(twinId, filters);
      
      console.log('✅ Casas obtenidas desde backend:', response);
      return response.homes || [];
    } catch (error) {
      console.error('❌ Error al obtener casas desde backend:', error);
      throw error;
    }
  }, []);

  const actualizarCasa = useCallback(async (twinId: string, homeId: string, homeData: HomeData) => {
    try {
      if (!twinId || !homeId) {
        throw new Error('TwinId y HomeId son requeridos');
      }

      console.log('🏠 Actualizando casa en backend:', {
        twinId,
        homeId,
        payload: homeData
      });

      const response = await casaService.updateHome(twinId, homeId, homeData);
      
      if (response.success && response.homeData) {
        console.log('✅ Casa actualizada exitosamente:', response.homeData);
        return response.homeData;
      } else {
        throw new Error(response.error || 'Error al actualizar casa');
      }
    } catch (error) {
      console.error('❌ Error al actualizar casa:', error);
      throw error;
    }
  }, []);

  // Función para subir múltiples fotos de una casa
  const subirFotosCasa = useCallback(async (twinId: string, homeId: string, files: FileList) => {
    try {
      console.log('📸 Subiendo fotos para casa:', { twinId, homeId, fileCount: files.length });

      // Validar que todos los archivos sean imágenes
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const invalidFiles = Array.from(files).filter(file => !validImageTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        throw new Error(`Archivos no válidos: ${invalidFiles.map(f => f.name).join(', ')}. Solo se permiten imágenes.`);
      }

      const urlsSubidas: string[] = [];

      // Subir cada archivo individualmente usando simple-upload-photo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('photo', file);

        console.log(`📸 Subiendo archivo ${i + 1}/${files.length}:`, file.name);

        const response = await fetch(`/api/twins/${twinId}/simple-upload-photo/homes/${homeId}/photos`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const uploadResult = await response.json();
          console.log(`✅ Archivo ${i + 1} subido:`, uploadResult);
          
          // Extraer la URL del resultado
          const photoUrl = uploadResult.photoUrl || uploadResult.url || uploadResult.filePath;
          if (photoUrl) {
            urlsSubidas.push(photoUrl);
          } else {
            console.warn(`⚠️ Archivo ${file.name} subido pero sin URL en respuesta:`, uploadResult);
          }
        } else {
          const errorData = await response.text();
          console.error(`❌ Error subiendo archivo ${file.name}:`, response.status, errorData);
        }
      }

      // Retornar resultado similar al backend esperado
      return {
        Success: urlsSubidas.length > 0,
        TwinId: twinId,
        HomeId: homeId,
        TotalPhotos: files.length,
        SuccessfulUploads: urlsSubidas.length,
        FailedUploads: files.length - urlsSubidas.length,
        Results: urlsSubidas.map(url => ({ photoUrl: url, success: true })),
        Message: `${urlsSubidas.length} foto(s) subida(s) exitosamente`
      };
    } catch (error) {
      console.error('❌ Error al subir fotos:', error);
      throw error;
    }
  }, []);

  // Función para subir seguro de casa
  const subirSeguroCasa = useCallback(async (twinId: string, homeId: string, file: File) => {
    try {
      console.log('🏠🛡️ Subiendo seguro para casa:', { twinId, homeId, fileName: file.name });

      // Validar que sea un archivo válido (PDF, imagen, etc.)
      const validFileTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validFileTypes.includes(file.type)) {
        throw new Error(`Archivo no válido: ${file.name}. Solo se permiten PDF, imágenes o documentos de Word.`);
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('🏠🛡️ Enviando archivo de seguro:', file.name);

      const response = await fetch(`/api/twins/${twinId}/${homeId}/upload-home-insurance/insurance`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploadResult = await response.json();
        console.log('✅ Seguro de casa subido exitosamente:', uploadResult);
        
        return {
          Success: true,
          TwinId: twinId,
          HomeId: homeId,
          FileName: file.name,
          FileUrl: uploadResult.fileUrl || uploadResult.url || uploadResult.filePath,
          Message: 'Seguro de casa subido exitosamente'
        };
      } else {
        const errorData = await response.text();
        console.error('❌ Error subiendo seguro:', response.status, errorData);
        throw new Error(`Error al subir seguro: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Error al subir seguro de casa:', error);
      throw error;
    }
  }, []);

  // Función para subir documentos de hipoteca
  const subirHipotecaCasa = useCallback(async (twinId: string, homeId: string, file: File) => {
    try {
      console.log('🏠💰 Subiendo hipoteca para casa:', { twinId, homeId, fileName: file.name });

      // Validar que sea un archivo válido (PDF, imagen, etc.)
      const validFileTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validFileTypes.includes(file.type)) {
        throw new Error(`Archivo no válido: ${file.name}. Solo se permiten PDF, imágenes o documentos de Word.`);
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('🏠💰 Enviando archivo de hipoteca:', file.name);

      const response = await fetch(`/api/twins/${twinId}/${homeId}/upload-home-mortgage/mortgage`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploadResult = await response.json();
        console.log('✅ Hipoteca de casa subida exitosamente:', uploadResult);
        
        return {
          Success: true,
          TwinId: twinId,
          HomeId: homeId,
          FileName: file.name,
          FileUrl: uploadResult.fileUrl || uploadResult.url || uploadResult.filePath,
          Message: 'Hipoteca de casa subida exitosamente'
        };
      } else {
        const errorData = await response.text();
        console.error('❌ Error subiendo hipoteca:', response.status, errorData);
        throw new Error(`Error al subir hipoteca: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Error al subir hipoteca de casa:', error);
      throw error;
    }
  }, []);

  // Función para obtener lista de hipotecas
  const obtenerListaHipotecas = useCallback(async (twinId: string, homeId: string) => {
    try {
      console.log('🏠💰 Obteniendo lista de hipotecas:', { twinId, homeId });

      const response = await fetch(`/api/twins/${twinId}/${homeId}/mortgage-list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const hipotecas = await response.json();
        console.log('✅ Lista de hipotecas obtenida:', hipotecas);
        return hipotecas;
      } else {
        const errorData = await response.text();
        console.error('❌ Error obteniendo lista de hipotecas:', response.status, errorData);
        throw new Error(`Error al obtener hipotecas: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Error al obtener lista de hipotecas:', error);
      throw error;
    }
  }, []);

  // Función para obtener una casa específica por ID
  const obtenerCasaPorId = useCallback(async (twinId: string, homeId: string): Promise<HomeData> => {
    try {
      console.log('🏠 Obteniendo casa específica:', { twinId, homeId });

      const response = await fetch(`/api/twins/${twinId}/homeid/${homeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta del endpoint:', data);
      
      // Extraer el objeto home de la respuesta
      const casa = data.home;
      console.log('✅ Casa obtenida:', casa);
      
      return casa;
    } catch (error) {
      console.error('❌ Error al obtener casa por ID:', error);
      throw error;
    }
  }, []);

  return { crearCasaConIA, obtenerCasas, obtenerCasaPorId, actualizarCasa, subirFotosCasa, subirSeguroCasa, subirHipotecaCasa, obtenerListaHipotecas };
}

// Exportar instancia del servicio
export default new CasaAgentApiService();
