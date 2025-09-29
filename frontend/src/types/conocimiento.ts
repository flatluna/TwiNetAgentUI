// types/conocimiento.ts
// Tipos para la gestión del conocimiento personal

export interface Book {
  id: string;
  titulo: string;
  autor: string;
  isbn?: string;
  fechaLectura?: string;
  fechaInicio?: string;
  fechaFin?: string;
  genero: string;
  paginas?: number;
  editorial?: string;
  añoPublicacion?: number;
  idioma: string;
  formato: 'Físico' | 'Digital' | 'Audiolibro';
  estado: 'Por leer' | 'Leyendo' | 'Terminado' | 'Abandonado';
  calificacion?: number; // 1-5 estrellas
  portada?: string; // URL de la imagen de portada
  notas: BookNote[];
  opiniones: string;
  recomendado: boolean;
  tags: string[];
  ubicacion?: string; // Dónde está físicamente el libro
  prestado?: boolean;
  prestadoA?: string;
  fechaPrestamo?: string;
  descripcion?: string; // Agregado para almacenar descripción de IA
  detailHTMLReport?: string; // Agregado para almacenar reporte HTML detallado
  createdAt: string;
  updatedAt: string;
  // Campo opcional para almacenar datos originales de IA
  datosIA?: BookAIResponse;
}

export interface BookNote {
  id: string;
  bookId: string;
  tipo: 'Nota' | 'Cita' | 'Reflexión' | 'Resumen' | 'Pregunta' | 'Conexión';
  titulo: string; // "Mi reflexión sobre el personaje principal"
  contenido: string; // El texto de la nota
  capitulo?: string; // "Capítulo 5" o "Introducción"
  pagina?: number; // 127 (opcional)
  ubicacion?: string; // "Mitad del capítulo" o "Final del libro"
  fecha: string;
  tags: string[]; // ["importante", "relectura", "concepto-clave"]
  destacada: boolean; // Para marcar notas importantes
  color?: string; // Para categorización visual
}

export interface BookStats {
  totalLibros: number;
  librosPorLeer: number;
  librosLeyendo: number;
  librosTerminados: number;
  librosAbandonados: number;
  paginasLeidas: number;
  promedioCalificacion: number;
  generosPreferidos: { genero: string; cantidad: number }[];
  autoresPreferidos: { autor: string; cantidad: number }[];
  librosEsteMes: number;
  librosEsteAño: number;
}

export interface BookFilter {
  estado?: string;
  genero?: string;
  calificacion?: number;
  año?: number;
  autor?: string;
  tags?: string[];
  busqueda?: string;
}

export interface BookFormData {
  titulo: string;
  autor: string;
  isbn?: string;
  fechaInicio?: string;
  fechaFin?: string;
  genero: string;
  paginas?: number;
  editorial?: string;
  añoPublicacion?: number;
  idioma: string;
  formato: 'Físico' | 'Digital' | 'Audiolibro';
  estado: 'Por leer' | 'Leyendo' | 'Terminado' | 'Abandonado';
  calificacion?: number;
  portada?: string;
  opiniones: string;
  recomendado: boolean;
  tags: string[];
  ubicacion?: string;
}

// Constantes para opciones
export const BOOK_GENRES = [
  'Ficción',
  'No ficción',
  'Biografía',
  'Historia',
  'Ciencia',
  'Tecnología',
  'Negocios',
  'Autoayuda',
  'Filosofía',
  'Psicología',
  'Arte',
  'Literatura',
  'Misterio',
  'Romance',
  'Fantasía',
  'Ciencia ficción',
  'Terror',
  'Aventura',
  'Infantil',
  'Juvenil',
  'Educativo',
  'Religioso',
  'Político',
  'Económico',
  'Salud',
  'Cocina',
  'Viajes',
  'Deportes',
  'Música',
  'Otro'
];

export const BOOK_LANGUAGES = [
  'Español',
  'Inglés',
  'Francés',
  'Alemán',
  'Italiano',
  'Portugués',
  'Japonés',
  'Chino',
  'Ruso',
  'Árabe',
  'Otro'
];

export const BOOK_FORMATS = ['Físico', 'Digital', 'Audiolibro'] as const;

export const BOOK_STATES = ['Por leer', 'Leyendo', 'Terminado', 'Abandonado'] as const;

export const NOTE_TYPES = ['Nota', 'Cita', 'Reflexión', 'Resumen'] as const;

// ============================================================================
// INTERFACES PARA DATOS DE IA (del backend)
// ============================================================================

export interface BookAIResponse {
  INFORMACIÓN_TÉCNICA: InformacionTecnica;
  RESEÑAS_CRÍTICAS: ReseñasCriticas;
  CONTENIDO_Y_TESIS_PRINCIPAL: ContenidoYtesisPrincipal;
  RECEPCIÓN_GENERAL: RecepcionGeneral;
  INFORMACIÓN_PRÁCTICA: InformacionPractica;
  DescripcionAI: string;
  detailHTMLReport: string;
}

export interface InformacionTecnica {
  Título_original: string;
  Título_en_español: string;
  Autor: string;
  Idioma_original: string;
  Primera_publicación: string;
  Editorial_principal: string;
  ISBN: string[];
  Páginas: string;
  Formatos: string[];
  Duración_audiolibro: string;
  Fecha_de_publicación: string;
  Portada: string;
}

export interface ReseñasCriticas {
  Bestseller_internacional: string;
  Evaluación: string;
  Elogios: string[];
  The_New_York_Times?: Critica;
  The_Guardian?: Critica;
  Reseñas_Académicas?: ReseñaAcademica;
}

export interface Critica {
  Lo_positivo: string;
  Lo_crítico: string;
  Conclusión: string;
}

export interface ReseñaAcademica {
  Recepción_mixta: string;
  Críticas_recurrentes: string;
  Evaluación: string;
}

export interface ContenidoYtesisPrincipal {
  Idea_central: string;
  Obras_clave?: string;
  Tecnologías_clave?: string[];
  Conceptos_principales: string[];
}

export interface RecepcionGeneral {
  Aspectos_elogiados: string[];
  Aspectos_criticados: string[];
  Recomendación: string;
}

export interface InformacionPractica {
  Precio_orientativo: PrecioOrientativo;
  portadaURL: string[];
  Disponibilidad: string[];
  Público_recomendado: string;
  Traducciones: string;
}

export interface PrecioOrientativo {
  Tapa_dura: string;
  Rústica: string;
  eBook: string;
}

// Función helper para convertir datos de IA a Book
export function mapBookAIResponseToBook(aiResponse: BookAIResponse, userInput: Partial<Book> = {}): Partial<Book> {
  const info = aiResponse.INFORMACIÓN_TÉCNICA;
  const contenido = aiResponse.CONTENIDO_Y_TESIS_PRINCIPAL;
  const recepcion = aiResponse.RECEPCIÓN_GENERAL;
  
  return {
    id: '', // Se generará al guardar
    titulo: info.Título_en_español || info.Título_original,
    autor: info.Autor,
    isbn: '', // No viene en la respuesta IA
    añoPublicacion: parseInt(info.Primera_publicación) || undefined,
    editorial: info.Editorial_principal,
    paginas: parseInt(info.Páginas) || undefined,
    idioma: info.Idioma_original || 'Español',
    genero: contenido.Tecnologías_clave?.[0] || 'General', // Tomar el primer elemento
    calificacion: undefined, // Lo define el usuario
    fechaLectura: undefined, // Lo define el usuario
    fechaInicio: undefined, // Lo define el usuario
    fechaFin: undefined, // Lo define el usuario
    estado: 'Por leer', // Por defecto
    formato: info.Formatos?.includes('Digital') ? 'Digital' : 
             info.Formatos?.includes('Audiolibro') ? 'Audiolibro' : 'Físico',
    ubicacion: undefined, // Lo define el usuario
    portada: undefined, // No viene en la respuesta IA
    descripcion: contenido.Idea_central,
    notas: [], // Vacío inicialmente
    opiniones: recepcion.Recomendación || '',
    recomendado: recepcion.Aspectos_elogiados?.length > recepcion.Aspectos_criticados?.length,
    tags: [...(contenido.Tecnologías_clave || []), ...(contenido.Conceptos_principales || [])],
    prestado: false,
    prestadoA: undefined,
    fechaPrestamo: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Datos adicionales de IA que podemos guardar como metadata
    datosIA: aiResponse,
    ...userInput // Override con datos del usuario
  };
}

// ============================================================================
// INTERFACES PARA BÚSQUEDA DE CURSOS (BACKEND API)
// ============================================================================

export interface DetalleCurso {
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
  fechaInicio: string;
  fechaFin: string;
  enlaces: EnlacesCurso;
  // Nuevos campos agregados
  objetivosdeAprendizaje: string;
  habilidadesCompetencias: string;
  prerequisitos: string;
  // Campos adicionales del formulario
  etiquetas?: string;
  notasPersonales?: string;
  // Campo para análisis HTML completo
  htmlDetails?: string;
}

export interface EnlacesCurso {
  enlaceClase: string;
  enlaceInstructor: string;
  enlacePlataforma: string;
  enlaceCategoria: string;
}

// ============================================================================
// CURSOS
// ============================================================================

// Interfaces para la respuesta del backend de búsqueda de cursos
export interface Enlaces {
  enlaceClase: string;
  enlaceInstructor: string;
  enlacePlataforma: string;
  enlaceCategoria: string;
}

export interface DetalleCurso {
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
  fechaInicio: string;
  fechaFin: string;
  enlaces: Enlaces;
  // Nuevos campos agregados
  objetivosdeAprendizaje: string;
  habilidadesCompetencias: string;
  prerequisitos: string;
  // Campos adicionales del formulario
  etiquetas?: string;
  notasPersonales?: string;
}

export interface CursoBusqueda {
  cursosEcontrados: DetalleCurso[];  // Nombre exacto del backend (sin 'n')
  htmlDetalles: string;
  respuesta: string;
  resumen: string;
  puntosClaves: string[];
  enlaces: string[];
  accionesRecomendadas: string[];
}

export interface CourseSearchResponse {
  success: boolean;
  data: {
    question: string;
    searchResults: CursoBusqueda;  // Cambiado de cursoBusquedaResults a searchResults
    enhancedAnswer: string;
    summary: string;
    keyInsights: string[];
    recommendedActions: string[];
    disclaimer: string;
  };
  twinId: string;
  processingTimeMs: number;
  processedAt: string;
  message: string;
}

export interface Curso {
  id: string;
  twinId: string; // ID del Twin usuario asociado
  titulo: string;
  institucion: string;
  instructor: string;
  tipo: CursoType;
  status: CursoStatus;
  fechaInicio: string;
  fechaFin?: string;
  duracionHoras: number;
  progreso?: number; // 0-100 para cursos en progreso
  calificacion?: number; // 1-5 estrellas
  calificacionOficial?: string; // nota oficial del curso
  certificado: boolean;
  urlCertificado?: string;
  creditos?: number;
  descripcion?: string;
  categorias: string[];
  prerequisitos: string[];
  habilidadesAdquiridas: string[];
  proyectosRealizados?: string[];
  notas: string;
  precio?: number;
  esGratuito?: boolean;
  plataforma?: string; // Coursera, Udemy, etc.
  urlCurso?: string;
  idioma: string;
  nivelDificultad?: number; // 1-5
  recomendadoPor?: string;
  valoracion: {
    contenido?: number;
    instructor?: number;
    produccion?: number;
    utilidad?: number;
  };
  tags: string[];
  esPublico: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CursoStatus {
  PLANIFICADO = 'PLANIFICADO',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADO = 'COMPLETADO',
  PAUSADO = 'PAUSADO',
  ABANDONADO = 'ABANDONADO',
  CERTIFICADO = 'CERTIFICADO'
}

export enum CursoType {
  ONLINE = 'ONLINE',
  PRESENCIAL = 'PRESENCIAL',
  HIBRIDO = 'HIBRIDO',
  AUTOESTUDIO = 'AUTOESTUDIO'
}

export interface CursoNote {
  id: string;
  cursoId: string;
  titulo: string;
  contenido: string;
  leccion?: string;
  modulo?: string;
  tipo: CursoNoteType;
  tags: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export enum CursoNoteType {
  APUNTE = 'APUNTE',
  RESUMEN = 'RESUMEN',
  EJERCICIO = 'EJERCICIO',
  PROYECTO = 'PROYECTO',
  REFLEXION = 'REFLEXION',
  DUDA = 'DUDA'
}

export interface CursoStats {
  totalCursos: number;
  cursosCompletados: number;
  cursosEnProgreso: number;
  cursosPlanificados: number;
  horasInvertidas: number;
  certificadosObtenidos: number;
  cursosEsteAno: number;
  plataformasFavoritas: { [key: string]: number };
  categoriasFavoritas: { [key: string]: number };
  calificacionPromedio: number;
  cursosConNotas: number;
  cursosGratuitos: number;
  cursosPagados: number;
  inversionTotal: number;
}

// Interface adicional para compatibilidad con sistemas externos
export interface Course {
  id: string;
  twinId?: string; // ID del Twin usuario asociado
  title: string;
  institution?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  status?: 'completed' | 'in-progress' | 'planned';
  certificate?: boolean;
  certificateUrl?: string;
  description?: string;
  skills?: string[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours?: number;
  grade?: string | number;
  platform?: string;
  language?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales útiles
  instructor?: string;
  price?: number;
  currency?: string;
  rating?: number;
  completionPercentage?: number;
  notes?: string;
  category?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  courseMaterials?: string[];
  enrollmentDate?: string;
  favorited?: boolean;
  // Campos específicos del backend
  requisitos?: string; // Requisitos del curso
  recursos?: string; // Recursos disponibles
  loQueAprendere?: string; // Lo que se aprenderá
  enlaceClase?: string; // Enlace al curso
  enlaceInstructor?: string; // Enlace del instructor
  enlacePlataforma?: string; // Enlace de la plataforma
  enlaceCategoria?: string; // Enlace de la categoría
  // Nuevos campos del backend
  objetivosdeAprendizaje?: string; // Objetivos de aprendizaje
  habilidadesCompetencias?: string; // Habilidades y competencias
  prerequisitos?: string; // Prerequisitos como string único
  // Campos adicionales del formulario
  etiquetas?: string; // Etiquetas del usuario
  notasPersonales?: string; // Notas personales del usuario
}

// ============================================================================
// CAPÍTULOS DE CURSOS
// ============================================================================

export interface CapituloCurso {
  id: string;
  cursoId: string;
  twinId: string;
  titulo: string;
  descripcion?: string;
  numeroCapitulo: number;
  duracionMinutos?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Contenido del capítulo
  transcript?: string; // Transcript del capítulo/clase
  notebooks: NotebookCapitulo[]; // Código/notebooks del capítulo
  comentarios?: string; // Mis comentarios sobre el capítulo
  puntuacion?: number; // Mi score del capítulo (1-5)
  documentos: DocumentoCapitulo[]; // PDFs y otros documentos
  completado: boolean;
  fechaCompletado?: string;
  tiempoEstudiado?: number; // Tiempo en minutos estudiado
  tags?: string[];
  notas?: string; // Notas adicionales
}

export interface NotebookCapitulo {
  id: string;
  capituloId: string;
  titulo: string;
  descripcion?: string;
  lenguaje: 'python' | 'javascript' | 'typescript' | 'sql' | 'r' | 'julia' | 'markdown' | 'other';
  contenido: string; // Código del notebook
  archivos?: ArchivoNotebook[]; // Archivos adicionales (.py, .js, .ipynb, etc.)
  fechaCreacion: string;
  fechaActualizacion: string;
  ejecutable: boolean;
  estado: 'draft' | 'working' | 'completed' | 'error';
}

export interface ArchivoNotebook {
  id: string;
  notebookId: string;
  nombreArchivo: string;
  extension: string;
  tamanoBytes: number;
  urlArchivo: string; // URL para descargar/acceder al archivo
  tipoMime: string;
  fechaSubida: string;
}

export interface DocumentoCapitulo {
  id: string;
  capituloId: string;
  titulo: string;
  descripcion?: string;
  tipoDocumento: 'pdf' | 'word' | 'powerpoint' | 'excel' | 'image' | 'video' | 'audio' | 'other';
  tamanoBytes: number;
  urlArchivo: string; // URL para descargar/acceder al archivo
  fechaSubida: string;
  tags?: string[];
  notas?: string;
}

export interface CapituloStats {
  totalCapitulos: number;
  capitulosCompletados: number;
  capitulosEnProgreso: number;
  tiempoTotalEstudiado: number; // minutos
  puntuacionPromedio: number;
  notebooksCreados: number;
  documentosSubidos: number;
  transcriptsDisponibles: number;
}

// Interfaces para formularios
export interface CapituloFormData {
  titulo: string;
  descripcion?: string;
  numeroCapitulo: number;
  duracionMinutos?: number;
  transcript?: string;
  comentarios?: string;
  puntuacion?: number;
  tags?: string[];
  notas?: string;
}

export interface NotebookFormData {
  titulo: string;
  descripcion?: string;
  lenguaje: 'python' | 'javascript' | 'typescript' | 'sql' | 'r' | 'julia' | 'markdown' | 'other';
  contenido: string;
  ejecutable: boolean;
  estado: 'draft' | 'working' | 'completed' | 'error';
}

export interface DocumentoFormData {
  titulo: string;
  descripcion?: string;
  tipoDocumento: 'pdf' | 'word' | 'powerpoint' | 'excel' | 'image' | 'video' | 'audio' | 'other';
  archivo: File;
  tags?: string[];
  notas?: string;
}