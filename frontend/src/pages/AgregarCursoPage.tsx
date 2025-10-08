import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Award, 
  BookOpen,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building,
  User,
  DollarSign,
  Target,
  Bookmark,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types/conocimiento';
import { DetalleCurso, CourseSearchResponse } from '@/types/conocimiento';
import { crearCursoEnBackend } from '@/services/courseService';
import { useTwinId } from '@/hooks/useTwinId';
import CourseSearchModal from '@/components/conocimiento/CourseSearchModal';
import AISearchLoadingModal from '@/components/conocimiento/AISearchLoadingModal';

interface SearchResult {
  id: string;
  title: string;
  institution: string;
  platform: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  language: string;
  imageUrl: string;
  skills: string[];
  certificate: boolean;
  rating?: number;
  price?: number;
  instructor?: string;
  category?: string;
}

const AgregarCursoPage: React.FC = () => {
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading, error: twinIdError } = useTwinId();
  
  // Estados para búsqueda online
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SearchResult | null>(null);
  
  // Estados para el modal y búsqueda del backend
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [cursosEncontrados, setCursosEncontrados] = useState<DetalleCurso[]>([]);
  const [showAISearchModal, setShowAISearchModal] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<Course>>({
    twinId: '',
    title: '',
    institution: '',
    instructor: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    certificate: false,
    certificateUrl: '',
    description: '',
    skills: [],
    level: 'Beginner',
    durationHours: 0,
    grade: '',
    platform: '',
    language: 'Español',
    tags: [],
    imageUrl: '',
    price: 0,
    currency: 'USD',
    rating: 0,
    completionPercentage: 0,
    notes: '',
    category: '',
    prerequisites: [],
    learningObjectives: [],
    courseMaterials: [],
    enrollmentDate: '',
    favorited: false,
    // Campos específicos del backend
    requisitos: '',
    recursos: '',
    loQueAprendere: '',
    enlaceClase: '',
    enlaceInstructor: '',
    enlacePlataforma: '',
    enlaceCategoria: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Función para buscar cursos online con IA
  const handleSearchCourse = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowAISearchModal(true); // Mostrar modal de búsqueda con IA
    setError(null);
    
    try {
      // Llamada real al backend - endpoint POST para búsqueda inteligente
      const url = `/api/twins/search/${twinId || 'default-twin-id'}`;
      console.log('Haciendo petición POST a:', url);
      
      const requestBody = {
        Question: searchQuery.trim()  // Asegurar que no hay espacios extra
      };
      
      console.log('Body de la petición:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        // Intentar obtener más detalles del error
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error en la búsqueda de cursos: ${response.status} ${response.statusText}`);
      }

      const result: CourseSearchResponse = await response.json();
      
      console.log('Respuesta completa del backend:', result);
      
      // Verificar si la respuesta es válida y tiene contenido útil
      if (!result || !result.data) {
        setError('🤷‍♂️ La búsqueda se completó pero no recibimos información útil. Intenta con términos de búsqueda más específicos o diferentes.');
        return;
      }
      
      // Verificar si todos los campos importantes están vacíos o nulos
      const dataIsEmpty = !result.data.searchResults || 
                         (typeof result.data.searchResults === 'object' && 
                          Object.values(result.data.searchResults).every(value => 
                            !value || 
                            value === null || 
                            value === undefined || 
                            (typeof value === 'string' && (value.trim() === '' || value.toLowerCase() === 'null')) ||
                            (Array.isArray(value) && value.length === 0)
                          ));
      
      if (dataIsEmpty) {
        setError('🔍 La búsqueda no encontró cursos específicos que coincidan con tu consulta. Te sugerimos:\n\n• Usar términos más específicos (ej: "JavaScript ES6 para principiantes")\n• Buscar por nombre de tecnología o habilidad específica\n• Intentar en inglés si buscas contenido técnico\n• Verificar la ortografía de tu consulta');
        return;
      }
      
      // Manejo robusto de diferentes estructuras de respuesta
      if (result.success && result.data?.searchResults) {
        const searchResults = result.data.searchResults;
        let cursosParaMostrar: DetalleCurso[] = [];
        
        // Opción 1: searchResults tiene cursosEcontrados directamente
        if (searchResults.cursosEcontrados && Array.isArray(searchResults.cursosEcontrados)) {
          console.log('Cursos encontrados en backend:', searchResults.cursosEcontrados.length);
          console.log('Array de cursos:', searchResults.cursosEcontrados);
          
          // Filtrar cursos que tengan al menos información básica válida
          cursosParaMostrar = searchResults.cursosEcontrados.filter(curso => 
            curso && 
            curso.nombreClase && 
            curso.nombreClase.trim() !== '' &&
            curso.nombreClase.toLowerCase() !== 'null' &&
            curso.nombreClase.toLowerCase() !== 'undefined'
          );
          
          console.log('Cursos después del filtro:', cursosParaMostrar.length);
        }
        // Opción 2: searchResults es un array de cursos
        else if (Array.isArray(searchResults)) {
          cursosParaMostrar = searchResults.filter(curso => 
            curso && 
            curso.nombreClase && 
            curso.nombreClase.trim() !== '' &&
            curso.nombreClase.toLowerCase() !== 'null' &&
            curso.nombreClase.toLowerCase() !== 'undefined'
          );
        }
        // Opción 3: searchResults tiene otra estructura - intentar convertir solo si hay información útil
        else if (searchResults && typeof searchResults === 'object') {
          console.log('Estructura no reconocida de searchResults:', searchResults);
          // Solo crear un curso simulado si hay información realmente útil
          if ((searchResults.respuesta && searchResults.respuesta.trim() && searchResults.respuesta.toLowerCase() !== 'null') ||
              (searchResults.resumen && searchResults.resumen.trim() && searchResults.resumen.toLowerCase() !== 'null') ||
              (searchResults.puntosClaves && Array.isArray(searchResults.puntosClaves) && searchResults.puntosClaves.length > 0)) {
            
            cursosParaMostrar = [{
              nombreClase: 'Información encontrada sobre tu búsqueda',
              instructor: 'Información recopilada con IA',
              plataforma: 'Búsqueda web',
              categoria: 'General',
              duracion: '0 horas',
              requisitos: '',
              loQueAprendere: searchResults.puntosClaves?.join(', ') || searchResults.resumen || 'Información encontrada con IA',
              precio: 'Información disponible',
              recursos: searchResults.enlaces?.join(', ') || '',
              idioma: 'Español',
              fechaInicio: new Date().toISOString().split('T')[0],
              fechaFin: new Date().toISOString().split('T')[0],
              // Nuevos campos requeridos
              objetivosdeAprendizaje: searchResults.resumen || '',
              habilidadesCompetencias: searchResults.puntosClaves?.join(', ') || '',
              prerequisitos: '',
              enlaces: {
                enlaceClase: '',
                enlaceInstructor: '',
                enlacePlataforma: '',
                enlaceCategoria: ''
              }
            }];
          }
        }
        
        if (cursosParaMostrar.length > 0) {
          setCursosEncontrados(cursosParaMostrar);
          setShowSearchModal(true);
        } else {
          console.log('No se encontraron cursos en la respuesta del backend');
          setError('😔 Lo sentimos, no encontramos cursos específicos que coincidan con tu búsqueda. Intenta con términos diferentes o más específicos como "curso JavaScript principiantes" o "Python data science".');
        }
      } else {
        // Verificar si hay al menos información general en la respuesta
        if (result.data?.enhancedAnswer || result.data?.summary) {
          setError('📚 Encontramos información relacionada con tu búsqueda, pero no cursos específicos disponibles en este momento. Te sugerimos buscar directamente en plataformas como Coursera, Udemy, o edX.');
        } else {
          setError('🔍 No encontramos información sobre cursos relacionados con tu búsqueda. Por favor, intenta con términos más específicos o verifica la ortografía.');
        }
      }
      
    } catch (err) {
      console.error('Error en búsqueda:', err);
      
      // Mostrar mensaje de error específico según el tipo de problema
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('🌐 No pudimos conectar con el servicio de búsqueda inteligente. Por favor, verifica tu conexión a internet e intenta nuevamente en unos momentos.');
        } else if (err.message.includes('400')) {
          setError('❗ Tu consulta de búsqueda necesita ser más específica. Intenta describir mejor el tipo de curso que buscas, por ejemplo: "curso de programación Python para principiantes".');
        } else if (err.message.includes('404')) {
          setError('🔧 El servicio de búsqueda no está disponible temporalmente. Por favor, intenta más tarde o busca cursos manualmente en tu plataforma favorita.');
        } else if (err.message.includes('500')) {
          setError('⚠️ Hay un problema temporal con nuestro servicio de búsqueda. Nuestro equipo ya está trabajando para solucionarlo. Intenta nuevamente en unos minutos.');
        } else {
          setError(`🤔 Ocurrió un problema inesperado durante la búsqueda: ${err.message}. Por favor, intenta con una consulta diferente.`);
        }
      } else {
        setError('❓ Algo salió mal durante la búsqueda. Por favor, verifica tu consulta e intenta nuevamente.');
      }
    } finally {
      setIsSearching(false);
      setShowAISearchModal(false); // Ocultar modal de búsqueda
    }
  };

  // Función para seleccionar un curso del backend
  const handleSelectSearchResult = (course: SearchResult) => {
    setSelectedCourse(course);
    setFormData({
      ...formData,
      twinId: twinId || 'default-twin-id', // Asegurar que el twinId se mantenga
      title: course.title,
      institution: course.institution,
      instructor: course.instructor,
      platform: course.platform,
      description: course.description,
      level: course.level,
      durationHours: course.durationHours,
      language: course.language,
      imageUrl: course.imageUrl,
      skills: course.skills || [],
      certificate: course.certificate || false,
      rating: course.rating || 0,
      price: course.price || 0,
      category: course.category || ''
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Función para seleccionar un curso del backend (solo mapear, NO guardar)
  const handleSelectCursoBackend = (curso: DetalleCurso) => {
    console.log('✅ TwinId real del usuario:', twinId);
    console.log('Curso seleccionado del modal, mapeando al formulario:', curso);
    
    // Solo mapear el curso al formulario para que el usuario lo revise
    mapCursoToForm(curso);
    
    // Cerrar el modal
    setShowSearchModal(false);
    
    // Mostrar mensaje informativo
    setError('📝 Curso cargado en el formulario. Revisa los campos y haz clic en "Agregar Curso" para guardarlo.');
    
    // Scroll hacia arriba para que vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función auxiliar para mapear curso a formulario (para edición adicional)
  const mapCursoToForm = (curso: DetalleCurso) => {
    // Extraer duración en horas del string
    const extractDurationHours = (duracion: string): number => {
      if (!duracion) return 0;
      const hoursMatch = duracion.match(/(\d+)\s*h/i);
      const weeksMatch = duracion.match(/(\d+)\s*semanas?/i);
      const monthsMatch = duracion.match(/(\d+)\s*mes(?:es)?/i);
      
      if (hoursMatch) return parseInt(hoursMatch[1]);
      if (weeksMatch) return parseInt(weeksMatch[1]) * 40; // Aprox 40 horas por semana
      if (monthsMatch) return parseInt(monthsMatch[1]) * 160; // Aprox 160 horas por mes
      return 0;
    };

    // Extraer precio numérico
    const extractPrice = (precio: string): number => {
      if (!precio || precio.toLowerCase().includes('gratis') || precio.toLowerCase().includes('free')) {
        return 0;
      }
      const priceMatch = precio.match(/(\d+)/);
      return priceMatch ? parseInt(priceMatch[1]) : 0;
    };

    // Mapear datos del backend al formulario
    setFormData({
      ...formData,
      twinId: twinId || 'default-twin-id',
      title: curso.nombreClase || '',
      institution: curso.plataforma || '',
      instructor: curso.instructor || '',
      platform: curso.plataforma || '',
      description: curso.loQueAprendere || '',
      durationHours: extractDurationHours(curso.duracion),
      language: curso.idioma || 'Español',
      price: extractPrice(curso.precio),
      category: curso.categoria || '',
      startDate: curso.fechaInicio || '',
      endDate: curso.fechaFin || '',
      // Parsear datos a arrays donde corresponde
      prerequisites: curso.requisitos ? curso.requisitos.split(',').map(s => s.trim()).filter(s => s) : [],
      courseMaterials: curso.recursos ? curso.recursos.split(',').map(s => s.trim()).filter(s => s) : [],
      learningObjectives: curso.loQueAprendere ? [curso.loQueAprendere] : [],
      status: 'planned',
      certificate: true, // Asumir que sí por defecto
      level: 'Intermediate', // Por defecto
      // Mapear enlaces del backend si existen
      enlaceClase: curso.enlaces?.enlaceClase || '',
      enlaceInstructor: curso.enlaces?.enlaceInstructor || '',
      enlacePlataforma: curso.enlaces?.enlacePlataforma || '',
      enlaceCategoria: curso.enlaces?.enlaceCategoria || '',
      // Mapear nuevos campos del backend
      objetivosdeAprendizaje: curso.objetivosdeAprendizaje || '',
      habilidadesCompetencias: curso.habilidadesCompetencias || '',
      prerequisitos: curso.prerequisitos || curso.requisitos || '', // Usar prerequisitos o requisitos como fallback
      // Mantener etiquetas y notas existentes del formulario si las hay
      etiquetas: curso.etiquetas || formData.etiquetas || '',
      notasPersonales: curso.notasPersonales || formData.notasPersonales || ''
    });
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof Course, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Función para guardar el curso en el backend
  const handleSaveCourse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.title?.trim()) {
        throw new Error('El título del curso es obligatorio');
      }
      if (!formData.institution?.trim()) {
        throw new Error('La institución es obligatoria');
      }

      // Crear objeto DetalleCurso a partir de los datos del formulario
      const cursoParaBackend: DetalleCurso = {
        nombreClase: formData.title || '',
        instructor: formData.instructor || '',
        plataforma: formData.platform || formData.institution || '',
        categoria: formData.category || '',
        duracion: formData.durationHours ? `${formData.durationHours} horas` : '',
        requisitos: Array.isArray(formData.prerequisites) ? formData.prerequisites.join(', ') : '',
        loQueAprendere: formData.description || '',
        precio: formData.price ? `$${formData.price} ${formData.currency || 'USD'}` : 'No especificado',
        recursos: Array.isArray(formData.courseMaterials) ? formData.courseMaterials.join(', ') : '',
        idioma: formData.language || 'Español',
        fechaInicio: formData.startDate || '',
        fechaFin: formData.endDate || '',
        objetivosdeAprendizaje: formData.objetivosdeAprendizaje || '',
        habilidadesCompetencias: formData.habilidadesCompetencias || '',
        prerequisitos: formData.prerequisitos || '',
        etiquetas: formData.etiquetas || '',
        notasPersonales: formData.notasPersonales || '',
        enlaces: {
          enlaceClase: formData.enlaceClase || '',
          enlaceInstructor: formData.enlaceInstructor || '',
          enlacePlataforma: formData.enlacePlataforma || '',
          enlaceCategoria: formData.enlaceCategoria || ''
        }
      };

      console.log('💾 Guardando curso en backend con datos completos:', cursoParaBackend);
      console.log('🎯 TwinId real que se enviará:', twinId);

      // Validar que tengamos el TwinId real del usuario
      if (!twinId) {
        throw new Error('No se pudo obtener el ID del usuario. Por favor, recarga la página e intenta nuevamente.');
      }

      // Llamar al backend para guardar el curso
      const result = await crearCursoEnBackend(
        twinId, 
        cursoParaBackend, 
        searchQuery || `Curso: ${formData.title}`,
        formData.etiquetas || '',
        formData.notasPersonales || ''
      );

      if (result.success) {
        console.log('Curso guardado exitosamente:', result);
        setSuccess(true);
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/mi-conocimiento/cursos');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al guardar el curso');
      }
      
    } catch (err) {
      console.error('Error al guardar curso:', err);
      setError(`❌ ${err instanceof Error ? err.message : 'Error al guardar el curso'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de estados del TwinId
  if (twinIdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  if (twinIdError || !twinId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-6">
            {twinIdError || 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.'}
          </p>
          <Button onClick={() => window.location.reload()} className="mr-4">
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Curso agregado exitosamente!</h2>
          <p className="text-gray-600 mb-4">Redirigiendo a la página de cursos...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/mi-conocimiento/cursos')}
            className="flex items-center gap-2 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Cursos
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              Agregar Nuevo Curso
            </h1>
            <p className="text-gray-600 mt-2">
              Registra un nuevo curso en tu trayectoria de aprendizaje y desarrollo profesional
            </p>
          </div>
        </div>

        {/* Búsqueda Online */}
        <Card className="mb-8 border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Search className="w-5 h-5" />
              Buscar Curso Online
            </CardTitle>
            <p className="text-sm text-blue-600">
              Busca información de cursos disponibles en plataformas como Coursera, Udemy, edX, Khan Academy, etc.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ej: React, Machine Learning, Digital Marketing, Python, Data Science..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Limpiar error cuando el usuario empiece a escribir
                    if (error && e.target.value.trim().length > 0) {
                      setError(null);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCourse()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={handleSearchCourse}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isSearching ? 'Buscando...' : 'Buscar Cursos'}
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Cursos encontrados ({searchResults.length})
                </h4>
                {searchResults.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => handleSelectSearchResult(course)}
                  >
                    <div className="flex gap-5">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-24 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-gray-900 text-lg leading-tight">{course.title}</h5>
                          <div className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            {course.rating}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {course.institution}
                          <span className="text-gray-400">•</span>
                          <User className="w-4 h-4" />
                          {course.instructor}
                        </p>
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.durationHours}h
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.language}
                          </Badge>
                          {course.certificate && (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              <Award className="w-3 h-3 mr-1" />
                              Certificado
                            </Badge>
                          )}
                          {course.price && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${course.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="self-start">
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Curso seleccionado */}
            {selectedCourse && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Curso seleccionado: {selectedCourse.title}</span>
                </div>
                <p className="text-sm text-green-600">
                  La información del curso se ha cargado en el formulario. Puedes editarla y agregar información adicional según necesites.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario Principal */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Información Principal */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Información Principal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Título */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del Curso *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Curso Completo de React.js 2025"
                    />
                  </div>

                  {/* Institución */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institución *
                    </label>
                    <input
                      type="text"
                      value={formData.institution || ''}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Universidad, Academia, Plataforma"
                    />
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={formData.instructor || ''}
                      onChange={(e) => handleInputChange('instructor', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del instructor principal"
                    />
                  </div>

                  {/* Plataforma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plataforma
                    </label>
                    <select
                      value={formData.platform || ''}
                      onChange={(e) => handleInputChange('platform', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar plataforma</option>
                      <option value="Coursera">Coursera</option>
                      <option value="Udemy">Udemy</option>
                      <option value="edX">edX</option>
                      <option value="Khan Academy">Khan Academy</option>
                      <option value="LinkedIn Learning">LinkedIn Learning</option>
                      <option value="Skillshare">Skillshare</option>
                      <option value="MasterClass">MasterClass</option>
                      <option value="Platzi">Platzi</option>
                      <option value="Domestika">Domestika</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Desarrollo Web">Desarrollo Web</option>
                      <option value="Programación">Programación</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Diseño">Diseño</option>
                      <option value="Marketing Digital">Marketing Digital</option>
                      <option value="Negocios">Negocios</option>
                      <option value="Idiomas">Idiomas</option>
                      <option value="Fotografía">Fotografía</option>
                      <option value="Música">Música</option>
                      <option value="Salud y Bienestar">Salud y Bienestar</option>
                      <option value="Desarrollo Personal">Desarrollo Personal</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el contenido del curso, objetivos y qué aprenderás..."
                  />
                </div>
              </div>

              {/* Enlaces y Recursos */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  Enlaces y Recursos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Link del Curso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enlace del Curso
                    </label>
                    <input
                      type="url"
                      value={formData.enlaceClase || ''}
                      onChange={(e) => handleInputChange('enlaceClase', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.plataforma.com/curso..."
                    />
                  </div>

                  {/* Link del Instructor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enlace del Instructor
                    </label>
                    <input
                      type="url"
                      value={formData.enlaceInstructor || ''}
                      onChange={(e) => handleInputChange('enlaceInstructor', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.plataforma.com/instructor..."
                    />
                  </div>

                  {/* Link de la Plataforma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enlace de la Plataforma
                    </label>
                    <input
                      type="url"
                      value={formData.enlacePlataforma || ''}
                      onChange={(e) => handleInputChange('enlacePlataforma', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.plataforma.com..."
                    />
                  </div>

                  {/* URL de la Imagen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de la Imagen del Curso
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Detalles del Curso */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Detalles del Curso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Nivel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Dificultad
                    </label>
                    <select
                      value={formData.level || 'Beginner'}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Beginner">Principiante</option>
                      <option value="Intermediate">Intermedio</option>
                      <option value="Advanced">Avanzado</option>
                    </select>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      value={formData.durationHours || ''}
                      onChange={(e) => handleInputChange('durationHours', Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={formData.language || 'Español'}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {/* Top 10 idiomas - valores como nombre legible para compatibilidad con el resto del formulario */}
                      <option value="Español">Español</option>
                      <option value="English">English</option>
                      <option value="中文">中文 (Chinese)</option>
                      <option value="हिन्दी">हिन्दी (Hindi)</option>
                      <option value="العربية">العربية (Arabic)</option>
                      <option value="Français">Français</option>
                      <option value="Русский">Русский (Russian)</option>
                      <option value="Português">Português</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="日本語">日本語 (Japanese)</option>
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Curso
                    </label>
                    <select
                      value={formData.status || 'planned'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="planned">Planificado</option>
                      <option value="in-progress">En Progreso</option>
                      <option value="completed">Completado</option>
                    </select>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', Number(e.target.value))}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={formData.currency || 'USD'}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="COP">COP</option>
                        <option value="MXN">MXN</option>
                        <option value="Free">Gratis</option>
                      </select>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tu Calificación (1-5)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.rating || ''}
                        onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                        className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= (formData.rating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => handleInputChange('rating', star)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas y Progreso */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Fechas y Progreso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Fecha de Inscripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inscripción
                    </label>
                    <input
                      type="date"
                      value={formData.enrollmentDate || ''}
                      onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Fecha de Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Fecha de Finalización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Porcentaje de Completación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progreso (%)
                    </label>
                    <input
                      type="number"
                      value={formData.completionPercentage || ''}
                      onChange={(e) => handleInputChange('completionPercentage', Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Calificación Oficial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación Oficial / Nota
                  </label>
                  <input
                    type="text"
                    value={formData.grade || ''}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: A+, 95/100, Aprobado con Distinción"
                  />
                </div>
              </div>

              {/* Certificación */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Certificación
                </h3>

                <div className="space-y-4">
                  {/* Checkbox de Certificado */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="certificate"
                      checked={formData.certificate || false}
                      onChange={(e) => handleInputChange('certificate', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                      Este curso otorga certificado de finalización
                    </label>
                  </div>

                  {/* URL del Certificado */}
                  {formData.certificate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL del Certificado
                      </label>
                      <input
                        type="url"
                        value={formData.certificateUrl || ''}
                        onChange={(e) => handleInputChange('certificateUrl', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Habilidades y Competencias */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Target className="w-5 h-5 text-red-600" />
                  Habilidades y Competencias
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  {/* Habilidades y Competencias */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habilidades que Desarrollarás
                    </label>
                    <textarea
                      value={formData.habilidadesCompetencias || ''}
                      onChange={(e) => handleInputChange('habilidadesCompetencias', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: React.js, Problem Solving, Team Collaboration"
                    />
                  </div>

                  {/* Prerequisitos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prerequisitos
                    </label>
                    <textarea
                      value={formData.prerequisitos || ''}
                      onChange={(e) => handleInputChange('prerequisitos', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Conocimientos básicos de JavaScript. No requiere experiencia previa. Dispositivo móvil o computadora para realizar el curso."
                    />
                  </div>

                  {/* Objetivos de Aprendizaje */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos de Aprendizaje
                    </label>
                    <textarea
                      value={formData.objetivosdeAprendizaje || ''}
                      onChange={(e) => handleInputChange('objetivosdeAprendizaje', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Crear aplicaciones web completas con React, dominar conceptos de programación funcional"
                    />
                  </div>
                </div>
              </div>

              {/* Tags y Notas */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Bookmark className="w-5 h-5 text-pink-600" />
                  Etiquetas y Notas Personales
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <textarea
                    value={formData.etiquetas || ''}
                    onChange={(e) => handleInputChange('etiquetas', e.target.value)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: frontend, javascript, web-development, 2025"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Personales
                  </label>
                  <textarea
                    value={formData.notasPersonales || ''}
                    onChange={(e) => handleInputChange('notasPersonales', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escribe tus notas personales sobre este curso..."
                  />
                </div>

                {/* Marcado como Favorito */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="favorited"
                    checked={formData.favorited || false}
                    onChange={(e) => handleInputChange('favorited', e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="favorited" className="text-sm font-medium text-gray-700">
                    Marcar como curso favorito ⭐
                  </label>
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-red-800 font-semibold mb-2">No se pudieron encontrar cursos</h4>
                      <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => navigate('/mi-conocimiento/cursos')}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveCourse}
                  disabled={isLoading || !formData.title?.trim() || !formData.institution?.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Guardando Curso...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Agregar Curso
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de búsqueda con IA */}
      <AISearchLoadingModal
        isOpen={showAISearchModal}
        searchQuery={searchQuery}
      />

      {/* Modal de resultados de búsqueda */}
      <CourseSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        courses={cursosEncontrados}
        searchQuery={searchQuery}
        onSelectCourse={handleSelectCursoBackend}
        isLoading={isSearching}
      />
    </div>
  );
};

export default AgregarCursoPage;