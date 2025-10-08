// Servicio para manejar las operaciones de habilidades con el backend
import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';

// URL base de la API - configurada para backend local
const API_BASE_URL = 'http://localhost:7011/api';

// Interfaces para los recursos de aprendizaje
export interface CursoOnline {
  titulo: string;
  plataforma: string;
  url: string;
  duracion: string;
  nivel: string;
  precio: string;
  calificacion?: number;
}

export interface LibroRecomendado {
  titulo: string;
  autor: string;
  editorial?: string;
  isbn?: string;
  descripcion: string;
  nivel: string;
}

export interface VideoTutorial {
  titulo: string;
  canal: string;
  url: string;
  duracion: string;
  descripcion: string;
}

export interface SitioEducativo {
  nombre: string;
  url: string;
  descripcion: string;
  tipo: string;
}

export interface HerramientaPractica {
  nombre: string;
  url?: string;
  descripcion: string;
  tipo: string;
}

export interface Certificacion {
  nombre: string;
  proveedor: string;
  url?: string;
  duracion: string;
  costo: string;
  descripcion: string;
}

export interface ComunidadAprendizaje {
  nombre: string;
  plataforma: string;
  url: string;
  descripcion: string;
  miembros?: string;
}

export interface PasoAprendizaje {
  paso: number;
  titulo: string;
  descripcion: string;
  duracionEstimada: string;
  recursos: string[];
}

export interface SkillLearningResources {
  topicoAprendizaje: string;
  cursosOnline: CursoOnline[];
  librosRecomendados: LibroRecomendado[];
  videosTutoriales: VideoTutorial[];
  sitiosEducativos: SitioEducativo[];
  herramientasPractica: HerramientaPractica[];
  certificaciones: Certificacion[];
  comunidades: ComunidadAprendizaje[];
  rutaAprendizaje: PasoAprendizaje[];
  palabrasClave: string[];
  resumenGeneral: string;
  htmlCompleto: string;
}

export interface SkillLearningSearchResult {
  learningResources?: SkillLearningResources;
  processedAt?: string;
  searchQuery?: string;
}

export interface NewLearning {
  id?: string;
  name: string;
  description?: string;
  content: string;
  dateCreated: string;
  dateUpdated: string;
  searchResults?: SkillLearningSearchResult;
}

export interface SkillData {
  id?: string;
  name: string;
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  description: string;
  experienceYears: number;
  certifications: string[];
  projects: string[];
  learningPath: string[];
  aiSuggestions: string[];
  tags: string[];
  dateAdded: string;
  lastUpdated: string;
  validated: boolean;
  whatLearned: NewLearning[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  message?: string;
}

class SkillsApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Aquí deberías obtener el token de autenticación
    // Por ejemplo, desde localStorage, sessionStorage, o un context
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async getCurrentTwinId(): Promise<string> {
    // Obtener el Twin ID del usuario actual
    // Esto puede venir de localStorage, un context, o una llamada al backend
    const twinId = localStorage.getItem('currentTwinId') || sessionStorage.getItem('currentTwinId');
    
    if (!twinId) {
      throw new Error('No se pudo obtener el Twin ID del usuario. Por favor, inicia sesión nuevamente.');
    }

    return twinId;
  }

  /**
   * Crear una nueva habilidad
   */
  async createSkill(skillData: Omit<SkillData, 'id'>): Promise<ApiResponse<SkillData>> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🚀 Enviando nueva habilidad para Twin:', twinId);
      console.log('📦 Datos de la habilidad:', skillData);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: skillData.name,
          category: skillData.category,
          level: skillData.level,
          description: skillData.description,
          experienceYears: skillData.experienceYears,
          certifications: skillData.certifications,
          projects: skillData.projects,
          learningPath: skillData.learningPath,
          aiSuggestions: skillData.aiSuggestions || [],
          tags: skillData.tags,
          dateAdded: skillData.dateAdded,
          lastUpdated: skillData.lastUpdated,
          validated: skillData.validated
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Error al crear habilidad:', responseData);
        return {
          success: false,
          errorMessage: responseData.errorMessage || `Error HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ Habilidad creada exitosamente:', responseData);

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message || 'Habilidad creada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error de red al crear habilidad:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Obtener todas las habilidades del usuario
   */
  async getSkills(): Promise<ApiResponse<SkillData[]>> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('📋 Obteniendo habilidades para Twin:', twinId);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills`, {
        method: 'GET',
        headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Error al obtener habilidades:', responseData);
        return {
          success: false,
          errorMessage: responseData.errorMessage || `Error HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data: responseData.skills || responseData.data || responseData || [],
        message: 'Habilidades obtenidas exitosamente'
      };

    } catch (error) {
      console.error('❌ Error de red al obtener habilidades:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Actualizar una habilidad existente
   */
  async updateSkill(skillId: string, skillData: SkillData): Promise<ApiResponse<SkillData>> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('✏️ Actualizando habilidad:', skillId, 'para Twin:', twinId);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(skillData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          errorMessage: responseData.errorMessage || `Error HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: 'Habilidad actualizada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error al actualizar habilidad:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Eliminar una habilidad
   */
  async deleteSkill(skillId: string): Promise<ApiResponse<void>> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🗑️ Eliminando habilidad:', skillId, 'para Twin:', twinId);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const responseData = await response.json();
        return {
          success: false,
          errorMessage: responseData.errorMessage || `Error HTTP ${response.status}`
        };
      }

      return {
        success: true,
        message: 'Habilidad eliminada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error al eliminar habilidad:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Obtener mejoras con IA para las habilidades
   */
  async getAIEnhancements(skillIds: string[]): Promise<ApiResponse<any[]>> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🤖 Solicitando mejoras IA para habilidades:', skillIds);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/ai-enhancement`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          skillIds,
          includeCertificationSuggestions: true,
          includeCareerPathSuggestions: true,
          includeMarketTrends: true,
          includeLearningResources: true
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          errorMessage: responseData.errorMessage || `Error HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: 'Mejoras de IA generadas exitosamente'
      };

    } catch (error) {
      console.error('❌ Error al obtener mejoras IA:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Validar configuración de Twin ID
   */
  async validateTwinConfiguration(): Promise<{ isValid: boolean; twinId?: string; error?: string }> {
    try {
      const twinId = await this.getCurrentTwinId();
      
      // Verificar que el Twin ID sea válido (puedes agregar más validaciones aquí)
      if (!twinId || twinId.length < 5) {
        return {
          isValid: false,
          error: 'Twin ID inválido o no configurado'
        };
      }

      return {
        isValid: true,
        twinId
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Error al validar configuración'
      };
    }
  }

  /**
   * Configurar Twin ID manualmente (útil para testing)
   */
  setTwinId(twinId: string): void {
    localStorage.setItem('currentTwinId', twinId);
    console.log('🔧 Twin ID configurado:', twinId);
  }
}

// Exportar instancia singleton del servicio
export const skillsApiService = new SkillsApiService();

// Hook personalizado para usar el servicio de habilidades con estado reactivo
export const useSkillsApi = () => {
  const { accounts } = useMsal();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el TwinId real del usuario autenticado
  const getTwinId = (): string | null => {
    const account = accounts[0];
    if (account?.localAccountId) {
      return account.localAccountId;
    }
    return null;
  };

  // Función para cargar habilidades
  const loadSkills = useCallback(async () => {
    const twinId = getTwinId();
    if (!twinId) {
      setError('No se pudo obtener el Twin ID del usuario autenticado');
      setSkills([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Usar directamente el API con el Twin ID real
      const headers = await skillsApiService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills`, {
        method: 'GET',
        headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Error al obtener habilidades:', responseData);
        setError(responseData.errorMessage || `Error HTTP ${response.status}`);
        setSkills([]);
        return;
      }

      // Extraer el array de skills de la respuesta
      const skillsData = responseData.skills || responseData.data || responseData || [];
      const finalSkillsArray = Array.isArray(skillsData) ? skillsData : [];
      setSkills(finalSkillsArray);

    } catch (err) {
      setError('Error de conexión');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [accounts]); // Depende de accounts para obtener el twinId

  // Función para crear habilidad
  const createSkill = useCallback(async (skillData: Omit<SkillData, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const twinId = getTwinId();
    if (!twinId) {
      const errorMsg = 'No se pudo obtener el Twin ID del usuario autenticado';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    
    try {
      const skillWithDates = {
        ...skillData,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      console.log('🚀 Enviando nueva habilidad para Twin:', twinId);
      console.log('📦 Datos de la habilidad:', skillWithDates);

      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills`, {
        method: 'POST',
        headers,
        body: JSON.stringify(skillWithDates)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Error al crear habilidad:', responseData);
        const errorMsg = responseData.errorMessage || `Error HTTP ${response.status}: ${response.statusText}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Habilidad creada exitosamente:', responseData);

      // Agregar la nueva habilidad al estado
      const newSkill = responseData.data || responseData;
      setSkills((prev: SkillData[]) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [...prevArray, newSkill];
      });

      return {
        success: true,
        data: newSkill,
        message: responseData.message || 'Habilidad creada exitosamente'
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accounts]); // Depende de accounts para obtener el twinId

  // Función para actualizar habilidad
  const updateSkill = useCallback(async (skillId: string, skillData: Omit<SkillData, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const twinId = getTwinId();
    if (!twinId) {
      const errorMsg = 'No se pudo obtener el Twin ID del usuario autenticado';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    
    try {
      const skillWithDates = {
        ...skillData,
        id: skillId,
        dateAdded: new Date().toISOString(), // Esto debería venir del original, pero para simplificar
        lastUpdated: new Date().toISOString()
      };

      console.log('✏️ Actualizando habilidad:', skillId, 'para Twin:', twinId);

      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(skillWithDates)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.errorMessage || `Error HTTP ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Actualizar la habilidad en el estado
      const updatedSkill = responseData.data || responseData;
      setSkills((prev: SkillData[]) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map((skill: SkillData) => 
          skill.id === skillId ? updatedSkill : skill
        );
      });

      return {
        success: true,
        data: updatedSkill,
        message: responseData.message || 'Habilidad actualizada exitosamente'
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accounts]); // Depende de accounts para obtener el twinId

  // Función para eliminar habilidad
  const deleteSkill = useCallback(async (skillId: string) => {
    const twinId = getTwinId();
    if (!twinId) {
      const errorMsg = 'No se pudo obtener el Twin ID del usuario autenticado';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando habilidad:', skillId, 'para Twin:', twinId);

      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const responseData = await response.json();
        const errorMsg = responseData.errorMessage || `Error HTTP ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Eliminar la habilidad del estado
      setSkills((prev: SkillData[]) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter((skill: SkillData) => skill.id !== skillId);
      });

      return {
        success: true,
        message: 'Habilidad eliminada exitosamente'
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accounts]); // Depende de accounts para obtener el twinId

  return {
    skills,
    loading,
    error,
    loadSkills,
    createSkill,
    updateSkill,
    deleteSkill
  };
};