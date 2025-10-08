// courseService.ts - Servicio para manejo de cursos
import { DetalleCurso, Curso } from '@/types/conocimiento';

// Configuración de API
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Usar proxy de Vite en desarrollo
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

console.log('📚 CourseService - API_BASE_URL configured as:', API_BASE_URL || 'RELATIVE PATHS (using Vite proxy)');

// Interfaces para el POST
export interface CursoSeleccionado {
  nombreClase: string;
  instructor: string;
  plataforma: string;
  categoria: string;
  duracion: string;
  requisitos: string;
  loQueAprendere: string;
  precio: string;
  recursos: string;
  idioma: string;
  // Propiedad adicional usada por algunos backends (capitalized)
  Idioma?: string;
  fechaInicio: string;
  fechaFin: string;
  objetivosdeAprendizaje: string;
  habilidadesCompetencias: string;
  prerequisitos: string;
  // Nuevos campos agregados
  etiquetas: string;
  notasPersonales: string;
  enlaces: {
    enlaceClase: string;
    enlaceInstructor: string;
    enlacePlataforma: string;
    enlaceCategoria: string;
  };
}

export interface MetadatosCurso {
  fechaSeleccion: string;
  estadoCurso: string;
  origenBusqueda: string;
  consultaOriginal: string;
  etiquetas?: string;
  notasPersonales?: string;
}

export interface CrearCursoRequest {
  curso: CursoSeleccionado;
  metadatos: MetadatosCurso;
  cursoId?: string;
  twinId?: string;
}

export interface CrearCursoResponse {
  success: boolean;
  message: string;
  data: {
    cursoId: string;
    twinId: string;
    fechaCreacion: string;
    estado: string;
  };
  processingTimeMs: number;
}

// Función para enviar curso al backend
export async function crearCursoEnBackend(
  twinId: string, 
  curso: DetalleCurso, 
  consultaOriginal: string,
  etiquetas: string = '',
  notasPersonales: string = ''
): Promise<CrearCursoResponse> {
  
  // Validar que el twinId no sea vacío o un valor por defecto
  if (!twinId || twinId === 'default-twin-id' || twinId.trim() === '') {
    throw new Error('ID de usuario inválido. No se puede proceder sin el TwinId real del usuario.');
  }
  
  const requestBody: CrearCursoRequest = {
    curso: {
      nombreClase: curso.nombreClase || '',
      instructor: curso.instructor || '',
      plataforma: curso.plataforma || '',
      categoria: curso.categoria || '',
      duracion: curso.duracion || '',
      requisitos: curso.requisitos || '',
      loQueAprendere: curso.loQueAprendere || '',
      precio: curso.precio || '',
      recursos: curso.recursos || '',
      idioma: curso.idioma || 'Español',
        Idioma: curso.idioma || 'Español',
      fechaInicio: curso.fechaInicio || '',
      fechaFin: curso.fechaFin || '',
      objetivosdeAprendizaje: curso.objetivosdeAprendizaje || '',
      habilidadesCompetencias: curso.habilidadesCompetencias || '',
      prerequisitos: curso.prerequisitos || '',
      // Campos adicionales - estos vendrán del formulario del usuario
      etiquetas: etiquetas || '', // Etiquetas del formulario
      notasPersonales: notasPersonales || '', // Notas del formulario
      enlaces: {
        enlaceClase: curso.enlaces?.enlaceClase || '',
        enlaceInstructor: curso.enlaces?.enlaceInstructor || '',
        enlacePlataforma: curso.enlaces?.enlacePlataforma || '',
        enlaceCategoria: curso.enlaces?.enlaceCategoria || ''
      }
    },
    metadatos: {
      fechaSeleccion: new Date().toISOString(),
      estadoCurso: 'seleccionado',
      origenBusqueda: 'ia_search',
      consultaOriginal: consultaOriginal
    }
  };

  console.log('Enviando curso al backend:', requestBody);

  const response = await fetch(`/api/twins/${twinId}/cursos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error al crear curso:', errorText);
    throw new Error(`Error al guardar curso: ${response.status} ${response.statusText}`);
  }

  const result: CrearCursoResponse = await response.json();
  console.log('Respuesta del backend al crear curso:', result);
  
  return result;
}

// Interfaces para el GET de cursos
export interface GetCursosResponse {
  success: boolean;
  cursos: any[]; // Array de cursos del backend
  count: number;
  twinId: string;
  retrievedAt: string;
}

// Función para obtener todos los cursos del usuario
export async function obtenerCursosDelBackend(twinId: string): Promise<GetCursosResponse> {
  // Validar que el twinId no sea vacío o un valor por defecto
  if (!twinId || twinId === 'default-twin-id' || twinId.trim() === '') {
    throw new Error('ID de usuario inválido. No se puede obtener los cursos sin el TwinId real del usuario.');
  }

  console.log('🔍 Obteniendo cursos del backend para TwinId:', twinId);

  const response = await fetch(`/api/twins/${twinId}/cursos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al obtener cursos:', errorText);
    throw new Error(`Error al obtener cursos: ${response.status} ${response.statusText}`);
  }

  const result: GetCursosResponse = await response.json();
  console.log('✅ Cursos obtenidos del backend:', result);
  
  return result;
}

// Función para obtener CursosAI del usuario
export async function obtenerCursosAIDelBackend(twinId: string): Promise<GetCursosResponse> {
  // Validar que el twinId no sea vacío o un valor por defecto
  if (!twinId || twinId === 'default-twin-id' || twinId.trim() === '') {
    throw new Error('ID de usuario inválido. No se puede obtener los cursos AI sin el TwinId real del usuario.');
  }

  console.log('🔍 Obteniendo CursosAI del backend para TwinId:', twinId);

  const response = await fetch(`/api/twins/${twinId}/cursosAI`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al obtener CursosAI:', errorText);
    throw new Error(`Error al obtener CursosAI: ${response.status} ${response.statusText}`);
  }

  const result: GetCursosResponse = await response.json();
  console.log('✅ CursosAI obtenidos del backend:', result);
  
  return result;
}

// Función para actualizar un curso existente
export async function actualizarCursoEnBackend(
  twinId: string,
  cursoId: string, 
  curso: DetalleCurso, 
  consultaOriginal: string,
  etiquetas: string = '',
  notasPersonales: string = ''
): Promise<CrearCursoResponse> {
  
  // Validar que el twinId y cursoId no sean vacíos
  if (!twinId || twinId === 'default-twin-id' || twinId.trim() === '') {
    throw new Error('ID de usuario inválido. No se puede proceder sin el TwinId real del usuario.');
  }

  if (!cursoId || cursoId.trim() === '') {
    throw new Error('ID de curso inválido. No se puede actualizar el curso.');
  }

  console.log('🔄 Actualizando curso en backend:', { twinId, cursoId });

  const requestBody: CrearCursoRequest = {
    curso: {
      nombreClase: curso.nombreClase || '',
      instructor: curso.instructor || '',
      plataforma: curso.plataforma || '',
      categoria: curso.categoria || '',
      duracion: curso.duracion || '',
      requisitos: curso.requisitos || '',
      loQueAprendere: curso.loQueAprendere || '',
      precio: curso.precio || '',
      recursos: curso.recursos || '',
      idioma: curso.idioma || 'Español',
  Idioma: curso.idioma || 'Español',
      fechaInicio: curso.fechaInicio || '',
      fechaFin: curso.fechaFin || '',
      objetivosdeAprendizaje: curso.objetivosdeAprendizaje || '',
      habilidadesCompetencias: curso.habilidadesCompetencias || '',
      prerequisitos: curso.prerequisitos || '',
      etiquetas: curso.etiquetas || etiquetas || '',
      notasPersonales: curso.notasPersonales || notasPersonales || '',
      enlaces: curso.enlaces || {
        enlaceClase: '',
        enlaceInstructor: '',
        enlacePlataforma: '',
        enlaceCategoria: ''
      }
    },
    metadatos: {
      fechaSeleccion: new Date().toISOString(),
      estadoCurso: 'actualizado',
      origenBusqueda: 'manual_edit',
      consultaOriginal: consultaOriginal || 'Edición manual',
      etiquetas: etiquetas,
      notasPersonales: notasPersonales
    },
    cursoId: cursoId,
    twinId: twinId
  };

  console.log('📤 Enviando actualización de curso:', requestBody);

  const response = await fetch(`/api/twins/${twinId}/cursos/${cursoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al actualizar curso:', errorText);
    throw new Error(`Error al actualizar curso: ${response.status} ${response.statusText}`);
  }

  const result: CrearCursoResponse = await response.json();
  console.log('✅ Curso actualizado exitosamente:', result);
  
  return result;
}

/**
 * Obtiene los detalles completos de un curso específico del backend
 */
export const obtenerDetalleCurso = async (twinId: string, cursoId: string): Promise<DetalleCurso> => {
  console.log('📖 Obteniendo detalles del curso:', { twinId, cursoId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/cursos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al obtener cursos del twin:', errorText);
      throw new Error(`Error al obtener cursos: ${response.status} ${response.statusText}`);
    }

    const cursosResponse = await response.json();
    console.log('✅ Respuesta de cursos del backend:', cursosResponse);

    // Buscar el curso específico en la lista de cursos
    if (cursosResponse.success && cursosResponse.cursos && Array.isArray(cursosResponse.cursos)) {
      const cursoEncontrado = cursosResponse.cursos.find((curso: any) => 
        curso.cursoId === cursoId || curso.id === cursoId
      );

      if (!cursoEncontrado) {
        throw new Error(`Curso con ID ${cursoId} no encontrado`);
      }

      console.log('✅ Curso encontrado:', cursoEncontrado);

      // Mapear la respuesta del backend a nuestro formato DetalleCurso
      const cursoData = cursoEncontrado.cursoData?.curso || {};
      
      return {
        nombreClase: cursoData.nombreClase || 'Curso sin título',
        instructor: cursoData.instructor || 'Instructor no especificado',
        plataforma: cursoData.plataforma || 'Plataforma no especificada',
        categoria: cursoData.categoria || 'Sin categoría',
        duracion: cursoData.duracion || '0 horas',
        requisitos: cursoData.requisitos || 'Sin requisitos especificados',
        loQueAprendere: cursoData.loQueAprendere || 'Información no disponible',
        precio: cursoData.precio || 'No especificado',
        recursos: cursoData.recursos || 'Recursos no especificados',
        idioma: cursoData.idioma || 'No especificado',
        fechaInicio: cursoData.fechaInicio || 'No especificada',
        fechaFin: cursoData.fechaFin || 'No especificada',
        objetivosdeAprendizaje: cursoData.objetivosdeAprendizaje || 'No especificados',
        habilidadesCompetencias: cursoData.habilidadesCompetencias || 'No especificadas',
        prerequisitos: cursoData.prerequisitos || 'No especificados',
        etiquetas: cursoData.etiquetas || '',
        notasPersonales: cursoData.notasPersonales || cursoData.NotasPersonales || '',
        htmlDetails: cursoData.htmlDetails || cursoData.textoDetails || '', // Usar htmlDetails o textoDetails
        enlaces: {
          enlaceClase: cursoData.enlaces?.enlaceClase || '',
          enlaceInstructor: cursoData.enlaces?.enlaceInstructor || '',
          enlacePlataforma: cursoData.enlaces?.enlacePlataforma || '',
          enlaceCategoria: cursoData.enlaces?.enlaceCategoria || ''
        }
      };
    } else {
      throw new Error('Formato de respuesta inválido del servidor');
    }
  } catch (error) {
    console.error('❌ Error en obtenerDetalleCurso:', error);
    throw error;
  }
}