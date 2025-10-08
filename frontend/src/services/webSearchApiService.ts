// Servicio para la API de Web Search
export interface WebSearchRequest {
  UserPrompt: string;
  MaxResults?: number;
  Language?: string;
  IncludeImages?: boolean;
  RequestId?: string;
  Metadata?: Record<string, any>;
}

export interface ResultadoBusqueda {
  Titulo: string;
  Contenido: string;
  Fuente: string;
  Url: string;
  Relevancia: string;
  FechaPublicacion: string;
  Precios: string;
  Categoria: string;
  Fotos: string[];
}

export interface LinkFuente {
  Titulo: string;
  Url: string;
  Descripcion: string;
  TipoFuente: string;
  Confiabilidad: string;
}

export interface DatosEspecificos {
  Fechas: string[];
  Numeros: string[];
  Estadisticas: string[];
  Precios: string[];
  Ubicaciones: string[];
}

export interface AnalisisContexto {
  Tendencias: string;
  Impacto: string;
  Perspectivas: string;
  Actualidad: string;
}

export interface SearchResults {
  ResumenEjecutivo: string;
  HtmlDetalles: string;
  ResultadosBusqueda: ResultadoBusqueda[];
  LinksYFuentes: LinkFuente[];
  DatosEspecificos: DatosEspecificos;
  AnalisisContexto: AnalisisContexto;
  Recomendaciones: string[];
  PalabrasClave: string[];
  NivelConfianza: string;
  Metadatos: Record<string, any>;
}

export interface WebSearchResponse {
  Success: boolean;
  UserPrompt: string;
  SearchResults: SearchResults;
  ProcessingTimeMs: number;
  ProcessedAt: string;
  RequestId: string;
  Disclaimer: string;
  Error?: string;
}

class WebSearchApiService {
  private baseUrl = '/api';

  async searchWeb(request: WebSearchRequest): Promise<WebSearchResponse> {
    try {
      console.log('🔍 Iniciando búsqueda web:', request);

      const response = await fetch(`${this.baseUrl}/webservices/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserPrompt: request.UserPrompt,
          RequestId: request.RequestId || `search_${Date.now()}`,
          Metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            location: window.location.href,
            searchType: 'web',
            ...request.Metadata
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data: WebSearchResponse = await response.json();
      console.log('✅ Búsqueda web completada:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en búsqueda web:', error);
      throw error;
    }
  }

  // Método auxiliar para generar ID de request único
  generateRequestId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método auxiliar para preparar metadata por defecto
  prepareDefaultMetadata(additionalMetadata?: Record<string, any>): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
      searchType: 'web',
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      ...additionalMetadata
    };
  }
}

export const webSearchApiService = new WebSearchApiService();