// Servicio para la API de Google Search
export interface GoogleSearchRequest {
  UserPrompt: string;
  MaxResults?: number;
  Language?: string;
  RequestId?: string;
  Metadata?: Record<string, any>;
}

export interface Url {
  Type: string;
  Template: string;
}

export interface Request {
  Title: string;
  TotalResults: string;
  SearchTerms: string;
  Count: number;
  StartIndex: number;
  InputEncoding: string;
  OutputEncoding: string;
  Safe: string;
  Cx: string;
}

export interface NextPage extends Request {}

export interface Queries {
  Request: Request[];
  NextPage?: NextPage[];
}

export interface Context {
  Title: string;
}

export interface SearchInformation {
  SearchTime: number;
  FormattedSearchTime: string;
  TotalResults: string;
  FormattedTotalResults: string;
}

export interface Spelling {
  CorrectedQuery?: string;
  HtmlCorrectedQuery?: string;
}

export interface HCard {
  fn?: string;
}

export interface MetaTag {
  referrer?: string;
  'og:image'?: string;
  'theme-color'?: string;
  'og:image:width'?: string;
  'og:type'?: string;
  viewport?: string;
  'og:title'?: string;
  'og:image:height'?: string;
  'format-detection'?: string;
  'og:description'?: string;
  'twitter:card'?: string;
  'og:site_name'?: string;
  'twitter:site'?: string;
  'twitter:image'?: string;
  'apple-itunes-app'?: string;
  'application-name'?: string;
  'apple-mobile-web-app-title'?: string;
  google?: string;
  'og:locale'?: string;
  'og:url'?: string;
  'mobile-web-app-capable'?: string;
  moddate?: string;
  creator?: string;
  creationdate?: string;
  producer?: string;
}

export interface CseThumbnail {
  src: string;
  width: string;
  height: string;
}

export interface CseImage {
  src: string;
}

export interface PageMap {
  hcard?: HCard[];
  metatags?: MetaTag[];
  cse_thumbnail?: CseThumbnail[];
  cse_image?: CseImage[];
}

export interface Item {
  Kind: string;
  Title: string;
  HtmlTitle: string;
  Link: string;
  DisplayLink: string;
  Snippet: string;
  HtmlSnippet: string;
  FormattedUrl: string;
  HtmlFormattedUrl: string;
  PageMap?: PageMap;
}

export interface GoogleSearchResults {
  Kind: string;
  ResponseHTML: string;
  Url: Url;
  Queries: Queries;
  Context: Context;
  SearchInformation: SearchInformation;
  Spelling?: Spelling;
  Items: Item[];
}

export interface SimpleSearchItem {
  Title: string;
  Link: string;
  Snippet: string;
  DisplayLink: string;
  Images: string[];
}

export interface SimpleGoogleSearchData {
  TotalResults: string;
  SearchTime: string;
  Results: SimpleSearchItem[];
}

export interface GoogleSearchResponse {
  Success: boolean;
  UserPrompt: string;
  SearchResults: GoogleSearchResults;
  ProcessingTimeMs: number;
  ProcessedAt: string;
  RequestId: string;
  Disclaimer: string;
  Error?: string;
}

class GoogleSearchApiService {
  private baseUrl = '/api';

  async searchGoogle(request: GoogleSearchRequest): Promise<GoogleSearchResponse> {
    try {
      console.log('🔍 Iniciando Google Search:', request);

      const response = await fetch(`${this.baseUrl}/googleservices/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserPrompt: request.UserPrompt,
          RequestId: request.RequestId || `google_search_${Date.now()}`,
          Metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            location: window.location.href,
            searchType: 'google',
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

      const data: GoogleSearchResponse = await response.json();
      console.log('✅ Google Search completada:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en Google Search:', error);
      throw error;
    }
  }

  // Método auxiliar para generar ID de request único
  generateRequestId(): string {
    return `google_search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método auxiliar para preparar metadata por defecto
  prepareDefaultMetadata(additionalMetadata?: Record<string, any>): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
      searchType: 'google',
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      ...additionalMetadata
    };
  }

  // Método auxiliar para extraer imágenes de un Item
  extractImages(item: Item): string[] {
    const images: string[] = [];
    
    // Extraer de PageMap
    if (item.PageMap) {
      // Imágenes de CSE thumbnail
      if (item.PageMap.cse_thumbnail) {
        item.PageMap.cse_thumbnail.forEach(thumb => {
          if (thumb.src) images.push(thumb.src);
        });
      }
      
      // Imágenes de CSE image
      if (item.PageMap.cse_image) {
        item.PageMap.cse_image.forEach(img => {
          if (img.src) images.push(img.src);
        });
      }
      
      // Imágenes de metatags
      if (item.PageMap.metatags) {
        item.PageMap.metatags.forEach(meta => {
          if (meta['og:image']) images.push(meta['og:image']);
          if (meta['twitter:image']) images.push(meta['twitter:image']);
        });
      }
    }
    
    return [...new Set(images)]; // Eliminar duplicados
  }

  // Método auxiliar para simplificar los resultados
  simplifyResults(googleResults: GoogleSearchResults): SimpleGoogleSearchData {
    return {
      TotalResults: googleResults.SearchInformation?.TotalResults || "0",
      SearchTime: googleResults.SearchInformation?.FormattedSearchTime || "0",
      Results: googleResults.Items?.map(item => ({
        Title: item.Title || "",
        Link: item.Link || "",
        Snippet: item.Snippet || "",
        DisplayLink: item.DisplayLink || "",
        Images: this.extractImages(item)
      })) || []
    };
  }
}

export const googleSearchApiService = new GoogleSearchApiService();