// Servicio para la API de Memorias
export interface MemoriaRequest {
  twinId: string;
  titulo: string;
  contenido: string;
  categoria: string;
  tipo: string;
  importancia: string;
  ubicacion?: string;
  personas?: string[];
  etiquetas: string[];
  fecha: string;
  multimedia?: string[];
}

export interface MemoriaResponse {
  success: boolean;
  message: string;
  data?: any;
  id?: string;
}

export interface GetMemoriasResponse {
  success: boolean;
  memorias: any[];
  twinId: string;
  totalMemorias: number;
  statistics: {
    totalMemorias: number;
    memoriasEsteMes: number;
    categoriasUnicas: number;
    memoriasImportantes: number;
    memoriasPorCategoria: Record<string, number>;
    memoriasPorTipo: Record<string, number>;
    memoriasPorImportancia: Record<string, number>;
  };
  message: string;
}

class MemoriaApiService {
  private baseUrl = '/api';

  async crearMemoria(twinId: string, memoria: MemoriaRequest): Promise<MemoriaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/twins/${twinId}/memorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoria),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating memoria:', error);
      throw error;
    }
  }

  async actualizarMemoria(twinId: string, memoriaId: string, memoria: MemoriaRequest): Promise<MemoriaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/twins/${twinId}/memorias/${memoriaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoria),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating memoria:', error);
      throw error;
    }
  }

  async obtenerMemorias(twinId: string): Promise<GetMemoriasResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/twins/${twinId}/memorias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // El servidor devuelve directamente el objeto con memorias, statistics, etc.
      return {
        success: data.success || true,
        memorias: data.memorias || [],
        twinId: data.twinId || twinId,
        totalMemorias: data.totalMemorias || 0,
        statistics: data.statistics || {
          totalMemorias: 0,
          memoriasEsteMes: 0,
          categoriasUnicas: 0,
          memoriasImportantes: 0,
          memoriasPorCategoria: {},
          memoriasPorTipo: {},
          memoriasPorImportancia: {}
        },
        message: data.message || 'Memorias obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error getting memorias:', error);
      throw error;
    }
  }

  async eliminarMemoria(twinId: string, memoriaId: string): Promise<MemoriaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/twins/${twinId}/memorias/${memoriaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting memoria:', error);
      throw error;
    }
  }

  async subirFoto(twinId: string, memoriaId: string, archivo: File, descripcion?: string): Promise<MemoriaResponse> {
    try {
      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen (PNG, JPG, JPEG, GIF, WEBP, etc.)');
      }

      // Validar tamaño del archivo (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (archivo.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Tamaño máximo: 10MB');
      }

      // Crear FormData para el archivo
      const formData = new FormData();
      formData.append('photo', archivo, archivo.name);
      
      // Usar descripción proporcionada o 'MiMemoria' como default
      const description = descripcion?.trim() || 'MiMemoria';
      
      // El path debe ser solamente 'MiMemoria', no incluir el nombre del archivo
      const filePath = 'MiMemoria';
      
      // Generar un photoId único
      const photoId = `photo_${memoriaId}_${Date.now()}`;

      console.log('📸 Subiendo foto con AnalyzeMemoriaPhoto:', {
        twinId,
        memoriaId,
        photoId,
        description,
        filePath,
        fileName: archivo.name,
        size: archivo.size,
        type: archivo.type,
        endpoint: `${this.baseUrl}/twins/${twinId}/memorias/${memoriaId}/photos/${photoId}/analyze`
      });

      // Usar el nuevo endpoint: AnalyzeMemoriaPhoto
      // POST /api/twins/{twinId}/memorias/{memoriaId}/photos/{photoId}/analyze
      const response = await fetch(`${this.baseUrl}/twins/${twinId}/memorias/${memoriaId}/photos/${photoId}/analyze`, {
        method: 'POST',
        body: formData,
        // NO establecer Content-Type header - FormData lo hace automáticamente
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Foto subida exitosamente con AnalyzeMemoriaPhoto:', data);
      return data;
    } catch (error) {
      console.error('❌ Error uploading photo with AnalyzeMemoriaPhoto:', error);
      throw error;
    }
  }
}

export const memoriaApiService = new MemoriaApiService();