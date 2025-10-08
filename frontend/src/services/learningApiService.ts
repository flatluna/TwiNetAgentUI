// Servicio para manejar los aprendizajes conectados con habilidades
import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { SkillData, NewLearning, SkillLearningSearchResult } from './skillsApiService';

const API_BASE_URL = 'http://localhost:7011/api';

export interface LearningData {
  id?: string;
  skillId: string;
  skillName: string;
  name: string;
  content: string;
  dateCreated: string;
  dateUpdated: string;
}

class LearningApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
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
    const twinId = localStorage.getItem('twinId') || sessionStorage.getItem('twinId');
    if (!twinId) {
      throw new Error('Twin ID no encontrado. Usuario no autenticado.');
    }
    return twinId;
  }

  // Obtener todas las habilidades para mostrar en la lista
  async getSkillsForLearning(): Promise<{ id: string; name: string; whatLearned: NewLearning[] }[]> {
    try {
      const twinId = await this.getCurrentTwinId();
      console.log('Getting skills for twinId:', twinId);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills`, {
        method: 'GET',
        headers,
      });

      console.log('Skills response status:', response.status);
      console.log('Skills response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Skills error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Skills API result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
      
      // Manejar diferentes estructuras de respuesta
      let skillsArray: any[] = [];
      
      if (result.success && Array.isArray(result.data)) {
        // Estructura con wrapper de API
        skillsArray = result.data;
      } else if (Array.isArray(result)) {
        // Array directo
        skillsArray = result;
      } else if (result.data && Array.isArray(result.data)) {
        // Estructura alternativa
        skillsArray = result.data;
      } else {
        console.log('No skills found or unexpected structure');
        return [];
      }

      console.log('Processing skills array:', skillsArray);
      
      return skillsArray.map((skill: any) => ({
        id: skill.id || skill.Id || '',
        name: skill.name || skill.Name || '',
        whatLearned: skill.whatLearned || skill.WhatLearned || []
      }));

    } catch (error) {
      console.error('Error al obtener habilidades:', error);
      throw error;
    }
  }

  // Agregar un nuevo aprendizaje a una habilidad
  async addLearningToSkill(skillId: string, learning: Omit<NewLearning, 'id'>): Promise<NewLearning> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      // Primero obtenemos la habilidad actual
      const skillResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'GET',
        headers,
      });

      if (!skillResponse.ok) {
        throw new Error(`Error al obtener habilidad: ${skillResponse.status}`);
      }

      const skillResult = await skillResponse.json();
      console.log('Skill data received:', skillResult);
      console.log('Type of skillResult:', typeof skillResult);
      console.log('skillResult keys:', Object.keys(skillResult));
      
      // Adaptar a la estructura real del backend
      let skill: SkillData;
      
      if (skillResult.success && skillResult.skill) {
        // Nueva estructura: { success: true, skill: {...} }
        skill = {
          id: skillResult.skill.id,
          name: skillResult.skill.Name || skillResult.skill.name,
          category: skillResult.skill.Category || skillResult.skill.category || '',
          level: (skillResult.skill.Level || skillResult.skill.level || 'Principiante') as any,
          description: skillResult.skill.Description || skillResult.skill.description || '',
          experienceYears: skillResult.skill.ExperienceYears || skillResult.skill.experienceYears || 0,
          certifications: skillResult.skill.Certifications || skillResult.skill.certifications || [],
          projects: skillResult.skill.Projects || skillResult.skill.projects || [],
          learningPath: skillResult.skill.LearningPath || skillResult.skill.learningPath || [],
          aiSuggestions: skillResult.skill.AISuggestions || skillResult.skill.aiSuggestions || [],
          tags: skillResult.skill.Tags || skillResult.skill.tags || [],
          dateAdded: skillResult.skill.DateAdded || skillResult.skill.dateAdded || new Date().toISOString().split('T')[0],
          lastUpdated: skillResult.skill.LastUpdated || skillResult.skill.lastUpdated || new Date().toISOString().split('T')[0],
          validated: skillResult.skill.Validated || skillResult.skill.validated || false,
          whatLearned: skillResult.skill.WhatLearned || skillResult.skill.whatLearned || []
        };
      } else if (skillResult.success && skillResult.data) {
        // Estructura con wrapper de API: { success: true, data: {...} }
        skill = skillResult.data;
      } else if (skillResult.id || skillResult.Name || skillResult.name) {
        // Estructura directa del backend
        skill = {
          id: skillResult.id,
          name: skillResult.Name || skillResult.name,
          category: skillResult.Category || skillResult.category || '',
          level: (skillResult.Level || skillResult.level || 'Principiante') as any,
          description: skillResult.Description || skillResult.description || '',
          experienceYears: skillResult.ExperienceYears || skillResult.experienceYears || 0,
          certifications: skillResult.Certifications || skillResult.certifications || [],
          projects: skillResult.Projects || skillResult.projects || [],
          learningPath: skillResult.LearningPath || skillResult.learningPath || [],
          aiSuggestions: skillResult.AISuggestions || skillResult.aiSuggestions || [],
          tags: skillResult.Tags || skillResult.tags || [],
          dateAdded: skillResult.DateAdded || skillResult.dateAdded || new Date().toISOString().split('T')[0],
          lastUpdated: skillResult.LastUpdated || skillResult.lastUpdated || new Date().toISOString().split('T')[0],
          validated: skillResult.Validated || skillResult.validated || false,
          whatLearned: skillResult.WhatLearned || skillResult.whatLearned || []
        };
      } else {
        throw new Error('No se pudo obtener los datos de la habilidad - estructura no reconocida');
      }
      
      console.log('Processed skill:', skill);
      console.log('Skill whatLearned before update:', skill.whatLearned);

      // Crear el nuevo aprendizaje con la estructura exacta que espera el backend
      const newLearning: NewLearning = {
        id: Date.now().toString(),
        name: learning.name,
        content: learning.content,
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString()
      };

      console.log('New learning created:', newLearning);

      // Asegurar que whatLearned existe, si no, inicializar como array vacío
      const currentLearnings = Array.isArray(skill.whatLearned) ? skill.whatLearned : [];
      const updatedWhatLearned = [...currentLearnings, newLearning];
      console.log('Updated whatLearned:', updatedWhatLearned);
      console.log('Current learnings count:', currentLearnings.length);
      console.log('New learnings count:', updatedWhatLearned.length);

      // Actualizar la habilidad con el nuevo aprendizaje
      const updatePayload = {
        id: skill.id,
        TwinID: twinId,
        Name: skill.name,
        Category: skill.category,
        Level: skill.level,
        Description: skill.description,
        ExperienceYears: skill.experienceYears,
        Certifications: skill.certifications || [],
        Projects: skill.projects || [],
        LearningPath: skill.learningPath || [],
        AISuggestions: skill.aiSuggestions || [],
        Tags: skill.tags || [],
        DateAdded: skill.dateAdded,
        LastUpdated: new Date().toISOString().split('T')[0],
        Validated: skill.validated,
        WhatLearned: updatedWhatLearned
      };

      console.log('Update payload:', updatePayload);
      console.log('PUT URL:', `${API_BASE_URL}/twins/${twinId}/skills/${skillId}`);
      console.log('PUT headers:', headers);

      const updateResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload),
      });

      console.log('Update response status:', updateResponse.status);
      console.log('Update response ok:', updateResponse.ok);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.log('Update error response:', errorText);
        throw new Error(`Error al actualizar habilidad: ${updateResponse.status} - ${errorText}`);
      }

      const updateResult = await updateResponse.json();
      console.log('Update result:', updateResult);

      return newLearning;
    } catch (error) {
      console.error('Error al agregar aprendizaje:', error);
      throw error;
    }
  }

  // Actualizar un aprendizaje existente
  async updateLearning(skillId: string, learning: NewLearning): Promise<NewLearning> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🔄 Updating individual learning using specific endpoint:', {
        twinId,
        skillId,
        learningId: learning.id,
        learning
      });

      // Preparar el aprendizaje con la fecha actualizada
      const updatedLearning: NewLearning = {
        ...learning,
        dateUpdated: new Date().toISOString()
      };

      console.log('Updated learning payload:', updatedLearning);

      // Usar el endpoint específico para actualizar solo este aprendizaje
      const updateResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}/learning/${learning.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedLearning),
      });

      console.log('Individual learning update response status:', updateResponse.status);
      console.log('Individual learning update response ok:', updateResponse.ok);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Individual learning update error response:', errorText);
        throw new Error(`Error al actualizar aprendizaje: ${updateResponse.status} - ${errorText}`);
      }

      const updateResult = await updateResponse.json();
      console.log('Individual learning update result:', updateResult);

      return updatedLearning;
    } catch (error) {
      console.error('Error al actualizar aprendizaje:', error);
      throw error;
    }
  }

  // Eliminar un aprendizaje
  async deleteLearning(skillId: string, learningId: string): Promise<void> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      // Obtener la habilidad actual
      const skillResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'GET',
        headers,
      });

      if (!skillResponse.ok) {
        throw new Error(`Error al obtener habilidad: ${skillResponse.status}`);
      }

      const skillResult = await skillResponse.json();
      console.log('Delete - Skill data received:', skillResult);
      console.log('Delete - skillResult.success:', skillResult.success);
      console.log('Delete - skillResult.data:', skillResult.data);
      console.log('Delete - skillResult.skill:', skillResult.skill);
      console.log('Delete - skillResult keys:', Object.keys(skillResult));
      
      // Adaptar a la estructura real del backend
      let skill: SkillData;
      
      if (skillResult.success && skillResult.data) {
        console.log('Delete - Using skillResult.data structure');
        skill = skillResult.data;
      } else if (skillResult.success && skillResult.skill) {
        console.log('Delete - Using skillResult.skill structure');  
        skill = skillResult.skill;
      } else if (skillResult.id || skillResult.Name || skillResult.name) {
        console.log('Delete - Using direct skillResult structure');
        skill = {
          id: skillResult.id,
          name: skillResult.Name || skillResult.name,
          category: skillResult.Category || skillResult.category || '',
          level: (skillResult.Level || skillResult.level || 'Principiante') as any,
          description: skillResult.Description || skillResult.description || '',
          experienceYears: skillResult.ExperienceYears || skillResult.experienceYears || 0,
          certifications: skillResult.Certifications || skillResult.certifications || [],
          projects: skillResult.Projects || skillResult.projects || [],
          learningPath: skillResult.LearningPath || skillResult.learningPath || [],
          aiSuggestions: skillResult.AISuggestions || skillResult.aiSuggestions || [],
          tags: skillResult.Tags || skillResult.tags || [],
          dateAdded: skillResult.DateAdded || skillResult.dateAdded || new Date().toISOString().split('T')[0],
          lastUpdated: skillResult.LastUpdated || skillResult.lastUpdated || new Date().toISOString().split('T')[0],
          validated: skillResult.Validated || skillResult.validated || false,
          whatLearned: skillResult.WhatLearned || skillResult.whatLearned || []
        };
      } else {
        console.error('Delete - Unrecognized skill structure:', skillResult);
        throw new Error('No se pudo obtener los datos de la habilidad - estructura no reconocida');
      }

      // Filtrar el aprendizaje a eliminar
      const currentLearnings = Array.isArray(skill.whatLearned) ? skill.whatLearned : [];
      const updatedWhatLearned = currentLearnings.filter(l => l.id !== learningId);

      // Actualizar la habilidad
      const updatePayload = {
        id: skill.id,
        TwinID: twinId,
        Name: skill.name,
        Category: skill.category,
        Level: skill.level,
        Description: skill.description,
        ExperienceYears: skill.experienceYears,
        Certifications: skill.certifications || [],
        Projects: skill.projects || [],
        LearningPath: skill.learningPath || [],
        AISuggestions: skill.aiSuggestions || [],
        Tags: skill.tags || [],
        DateAdded: skill.dateAdded,
        LastUpdated: new Date().toISOString().split('T')[0],
        Validated: skill.validated,
        WhatLearned: updatedWhatLearned
      };

      const updateResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        throw new Error(`Error al actualizar habilidad: ${updateResponse.status}`);
      }
    } catch (error) {
      console.error('Error al eliminar aprendizaje:', error);
      throw error;
    }
  }

  // Actualizar SearchResults de un aprendizaje específico
  async updateLearningSearchResults(skillId: string, learningId: string, searchResults: any): Promise<NewLearning> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🔄 Updating SearchResults for learning using specific endpoint:', {
        twinId,
        skillId,
        learningId,
        searchResults
      });

      // Obtener el aprendizaje actual primero para mantener los datos existentes
      const skillResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}`, {
        method: 'GET',
        headers,
      });

      if (!skillResponse.ok) {
        throw new Error(`Error al obtener habilidad: ${skillResponse.status}`);
      }

      const skillResult = await skillResponse.json();
      console.log('SearchResults Update - Skill data received:', skillResult);
      
      // Adaptar a la estructura real del backend para obtener el aprendizaje
      let skill: SkillData;
      
      if (skillResult.success && skillResult.data) {
        skill = skillResult.data;
      } else if (skillResult.success && skillResult.skill) {
        skill = skillResult.skill;
      } else if (skillResult.id || skillResult.Name || skillResult.name) {
        skill = {
          id: skillResult.id,
          name: skillResult.Name || skillResult.name,
          category: skillResult.Category || skillResult.category || '',
          level: (skillResult.Level || skillResult.level || 'Principiante') as any,
          description: skillResult.Description || skillResult.description || '',
          experienceYears: skillResult.ExperienceYears || skillResult.experienceYears || 0,
          certifications: skillResult.Certifications || skillResult.certifications || [],
          projects: skillResult.Projects || skillResult.projects || [],
          learningPath: skillResult.LearningPath || skillResult.learningPath || [],
          aiSuggestions: skillResult.AISuggestions || skillResult.aiSuggestions || [],
          tags: skillResult.Tags || skillResult.tags || [],
          dateAdded: skillResult.DateAdded || skillResult.dateAdded || new Date().toISOString().split('T')[0],
          lastUpdated: skillResult.LastUpdated || skillResult.lastUpdated || new Date().toISOString().split('T')[0],
          validated: skillResult.Validated || skillResult.validated || false,
          whatLearned: skillResult.WhatLearned || skillResult.whatLearned || []
        };
      } else {
        throw new Error('No se pudo obtener los datos de la habilidad - estructura no reconocida');
      }

      // Encontrar el aprendizaje específico
      const currentLearnings = Array.isArray(skill.whatLearned) ? skill.whatLearned : [];
      const targetLearning = currentLearnings.find(l => l.id === learningId);

      if (!targetLearning) {
        throw new Error(`No se encontró el aprendizaje con ID: ${learningId}`);
      }

      // Preparar el aprendizaje actualizado con SearchResults
      const updatedLearning: NewLearning = {
        id: targetLearning.id,
        name: targetLearning.name,
        description: targetLearning.description || '',
        content: targetLearning.content,
        dateCreated: targetLearning.dateCreated,
        dateUpdated: new Date().toISOString(),
        searchResults: searchResults
      };

      console.log('Updated learning with SearchResults:', updatedLearning);

      // Usar el endpoint específico para actualizar solo este aprendizaje
      const updateResponse = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/${skillId}/learning/${learningId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedLearning),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error updating learning with SearchResults:', errorText);
        throw new Error(`Error al actualizar aprendizaje con SearchResults: ${updateResponse.status} - ${errorText}`);
      }

      const updateResult = await updateResponse.json();
      console.log('SearchResults update result:', updateResult);

      return updatedLearning;
    } catch (error) {
      console.error('Error al actualizar SearchResults del aprendizaje:', error);
      throw error;
    }
  }

  // Mejorar aprendizaje con AI
  async enhanceLearningWithAI(skillId: string, learningId: string, enhancementRequest: string, skillDescription: string = ''): Promise<any> {
    try {
      const twinId = await this.getCurrentTwinId();
      const headers = await this.getAuthHeaders();

      console.log('🤖 Enhancing learning with AI:', {
        twinId,
        skillId,
        learningId,
        enhancementRequest,
        skillDescription
      });

      // Preparar el SearchQuery combinando la descripción de la habilidad y la solicitud de mejora
      const searchQuery = skillDescription 
        ? `${skillDescription}. ${enhancementRequest}`
        : enhancementRequest;

      // Preparar el payload según la estructura SkillLearningSearchRequest
      const payload = {
        SearchQuery: searchQuery,
        PreferredLanguage: "Spanish"
      };

      console.log('Payload enviado al API:', payload);

      const response = await fetch(`${API_BASE_URL}/twins/${twinId}/skills/search-learning`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Enhancement API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Error al mejorar con AI: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔍 AI Enhancement Result - Estructura completa:', result);
      console.log('🔍 AI Enhancement Result - Tipo:', typeof result);
      console.log('🔍 AI Enhancement Result - Keys:', Object.keys(result || {}));
      
      // Manejar la estructura específica SkillLearningSearchResult
      if (result.Success === false) {
        console.log('❌ API devolvió Success: false');
        console.log('🔍 ErrorMessage:', result.ErrorMessage);
        console.log('🔍 SearchQuery:', result.SearchQuery);
        console.log('🔍 ProcessedAt:', result.ProcessedAt);
        
        // Aún así, verificar si hay recursos en LearningResources
        if (result.LearningResources) {
          console.log('📋 A pesar de Success: false, hay LearningResources disponibles');
          console.log('🔍 Verificando contenido de recursos...');
          const resources = result.LearningResources;
          const hasAnyContent = 
            (resources.cursosOnline && resources.cursosOnline.length > 0) ||
            (resources.librosRecomendados && resources.librosRecomendados.length > 0) ||
            (resources.videosTutoriales && resources.videosTutoriales.length > 0) ||
            (resources.certificaciones && resources.certificaciones.length > 0) ||
            (resources.resumenGeneral && resources.resumenGeneral.trim().length > 0) ||
            (resources.htmlCompleto && resources.htmlCompleto.trim().length > 0);
            
          if (hasAnyContent) {
            console.log('✅ Se encontró contenido útil a pesar de Success: false, continuando...');
          } else {
            console.log('⚠️ Success: false y no hay contenido útil en los recursos');
          }
        }
        
        // Solo lanzar error si hay un ErrorMessage específico Y no hay recursos útiles
        if (result.ErrorMessage && !result.LearningResources) {
          throw new Error(`Error del backend: ${result.ErrorMessage}`);
        } else if (result.ErrorMessage) {
          console.log('⚠️ Hay ErrorMessage pero también LearningResources, continuando con precaución...');
        }
      }
      
      // Investigar la estructura específica de LearningResources
      if (result.LearningResources) {
        console.log('✅ LearningResources encontrado:', result.LearningResources);
        console.log('🔍 LearningResources - Tipo:', typeof result.LearningResources);
        console.log('🔍 LearningResources - Keys:', Object.keys(result.LearningResources || {}));
        
        // Verificar si hay contenido en los arrays
        const resources = result.LearningResources;
        console.log('🔍 Contenido de recursos:');
        console.log('  - cursosOnline:', resources.cursosOnline?.length || 0);
        console.log('  - librosRecomendados:', resources.librosRecomendados?.length || 0);
        console.log('  - videosTutoriales:', resources.videosTutoriales?.length || 0);
        console.log('  - certificaciones:', resources.certificaciones?.length || 0);
        console.log('  - resumenGeneral:', resources.resumenGeneral?.substring(0, 100) || 'vacío');
        console.log('  - htmlCompleto:', resources.htmlCompleto?.substring(0, 100) || 'vacío');
      } else {
        console.log('❌ LearningResources no encontrado en la respuesta');
        console.log('🔍 Propiedades disponibles:', Object.keys(result || {}));
      }

      // Devolver el objeto completo para que se pueda mostrar en el modal de revisión
      return result;

    } catch (error) {
      console.error('Error al mejorar aprendizaje con AI:', error);
      throw error;
    }
  }
}

// Hook para usar el servicio de aprendizajes
export const useLearningApi = () => {
  const { accounts } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const learningApiService = new LearningApiService();

  // Configurar Twin ID desde MSAL
  const configureTwinId = useCallback(() => {
    console.log('Configuring Twin ID, accounts:', accounts);
    if (accounts.length > 0) {
      const account = accounts[0];
      const twinId = account.localAccountId || account.username;
      console.log('Setting twinId:', twinId);
      localStorage.setItem('twinId', twinId);
    } else {
      console.log('No accounts found for Twin ID configuration');
    }
  }, [accounts]);

  const getSkillsForLearning = useCallback(async () => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      const skills = await learningApiService.getSkillsForLearning();
      return skills;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  const addLearningToSkill = useCallback(async (skillId: string, learning: Omit<NewLearning, 'id'>) => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      const newLearning = await learningApiService.addLearningToSkill(skillId, learning);
      return newLearning;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  const updateLearning = useCallback(async (skillId: string, learning: NewLearning) => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      const updatedLearning = await learningApiService.updateLearning(skillId, learning);
      return updatedLearning;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  const deleteLearning = useCallback(async (skillId: string, learningId: string) => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      await learningApiService.deleteLearning(skillId, learningId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  const enhanceLearningWithAI = useCallback(async (skillId: string, learningId: string, enhancementRequest: string, skillDescription?: string) => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      const aiResponse = await learningApiService.enhanceLearningWithAI(skillId, learningId, enhancementRequest, skillDescription);
      return aiResponse;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  const updateLearningSearchResults = useCallback(async (skillId: string, learningId: string, searchResults: any) => {
    setLoading(true);
    setError(null);
    configureTwinId();

    try {
      const updatedLearning = await learningApiService.updateLearningSearchResults(skillId, learningId, searchResults);
      return updatedLearning;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configureTwinId]);

  return {
    loading,
    error,
    getSkillsForLearning,
    addLearningToSkill,
    updateLearning,
    deleteLearning,
    enhanceLearningWithAI,
    updateLearningSearchResults,
  };
};

export default LearningApiService;