import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar,
  Award,
  Clock,
  ExternalLink,
  Star,
  Plus,
  BookOpen,
  Building,
  Edit,
  Eye,
  Loader2,
  User,
  RefreshCw,
  FileText,
  Brain,
  Upload,
  AlertCircle,
  BookOpenCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CursoStatus, CursoType } from '@/types/conocimiento';
import { useNavigate } from 'react-router-dom';
import { useTwinId } from '@/hooks/useTwinId';
import { obtenerCursosDelBackend, obtenerCursosAIDelBackend } from '@/services/courseService';

interface CursosSectionProps {
  searchTerm?: string;
}

// Interfaz temporal para mapear DetalleCurso a Curso
interface CursoMapeado {
  id: string;
  twinId: string;
  titulo: string;
  institucion: string;
  instructor: string;
  tipo: CursoType;
  status: CursoStatus;
  fechaInicio: string;
  fechaFin?: string;
  duracionHoras: number;
  calificacion?: number;
  certificado: boolean;
  urlCertificado?: string;
  descripcion: string;
  categorias: string[];
  prerequisitos: string[];
  habilidadesAdquiridas: string[];
  notas?: string;
  idioma: string;
  tags: string[];
  esPublico: boolean;
  createdAt: string;
  updatedAt: string;
  progreso?: number;
}

const CursosSection: React.FC<CursosSectionProps> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading, error: twinIdError } = useTwinId();
  
  const [cursos, setCursos] = useState<CursoMapeado[]>([]);
  const [cursosAI, setCursosAI] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para mapear curso del backend a CursoMapeado
  const mapearCursoBackend = (cursoBackend: any, index: number): CursoMapeado => {
    // El curso viene dentro de cursoData.curso
    const detalle = cursoBackend.cursoData?.curso || {};
    
    const extraerHoras = (duracion: string): number => {
      const match = duracion.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    return {
      id: cursoBackend.cursoId || cursoBackend.id || `curso-${index}`,
      twinId: cursoBackend.twinId || twinId || '',
      titulo: detalle.nombreClase || 'Curso sin título',
      institucion: detalle.plataforma || 'Sin institución',
      instructor: detalle.instructor || 'Sin instructor',
      tipo: CursoType.ONLINE, // Por defecto online
      status: CursoStatus.COMPLETADO, // Por defecto completado
      fechaInicio: detalle.fechaInicio || cursoBackend.createdAt || new Date().toISOString(),
      fechaFin: detalle.fechaFin,
      duracionHoras: extraerHoras(detalle.duracion || '0'),
      certificado: true, // Asumir que tiene certificado
      descripcion: detalle.loQueAprendere || '',
      categorias: detalle.categoria ? [detalle.categoria] : [],
      prerequisitos: detalle.requisitos ? detalle.requisitos.split(', ') : [],
      habilidadesAdquiridas: detalle.habilidadesCompetencias ? detalle.habilidadesCompetencias.split(', ') : [],
      notas: detalle.notasPersonales || '',
      idioma: detalle.idioma || 'Español',
      tags: detalle.etiquetas ? detalle.etiquetas.split(', ') : [],
      esPublico: true,
      createdAt: cursoBackend.createdAt || new Date().toISOString(),
      updatedAt: cursoBackend.updatedAt || new Date().toISOString()
    };
  };

  // Función para cargar cursos del backend
  const cargarCursos = async () => {
    if (!twinId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando cursos para TwinId:', twinId);
      
      // Cargar cursos normales y CursosAI en paralelo
      const [responseCursos, responseCursosAI] = await Promise.allSettled([
        obtenerCursosDelBackend(twinId),
        obtenerCursosAIDelBackend(twinId)
      ]);
      
      // Procesar cursos normales
      if (responseCursos.status === 'fulfilled') {
        console.log('🔍 Respuesta cursos normales:', responseCursos.value);
        
        if (responseCursos.value.success && responseCursos.value.cursos && Array.isArray(responseCursos.value.cursos)) {
          const cursosMapeados = responseCursos.value.cursos.map(mapearCursoBackend);
          setCursos(cursosMapeados);
          console.log('✅ Cursos normales cargados y mapeados:', cursosMapeados);
        } else {
          setCursos([]);
          console.log('📝 No se encontraron cursos normales o formato incorrecto');
        }
      } else {
        console.error('❌ Error al cargar cursos normales:', responseCursos.reason);
        setCursos([]);
      }

      // Procesar CursosAI
      if (responseCursosAI.status === 'fulfilled') {
        console.log('🤖 Respuesta CursosAI:', responseCursosAI.value);
        
        if (responseCursosAI.value.success && responseCursosAI.value.cursos && Array.isArray(responseCursosAI.value.cursos)) {
          setCursosAI(responseCursosAI.value.cursos);
          console.log('✅ CursosAI cargados:', responseCursosAI.value.cursos);
        } else {
          setCursosAI([]);
          console.log('🤖 No se encontraron CursosAI o formato incorrecto');
        }
      } else {
        console.error('❌ Error al cargar CursosAI:', responseCursosAI.reason);
        setCursosAI([]);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error general al cargar cursos:', errorMessage);
      setCursos([]);
      setCursosAI([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar cursos al montar el componente o cuando cambie el twinId
  useEffect(() => {
    if (twinId) {
      cargarCursos();
    }
  }, [twinId]);

  const [filtroStatus, setFiltroStatus] = useState<CursoStatus | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<CursoType | 'TODOS'>('TODOS');

  // Combinar y filtrar todos los cursos (normales + AI) 
  const todosCursosFiltrados = [
    // Cursos normales mapeados con tipo 'normal'
    ...cursos
      .filter(curso => {
        const matchesSearch = searchTerm === '' || 
          curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.categorias.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = filtroStatus === 'TODOS' || curso.status === filtroStatus;
        const matchesTipo = filtroTipo === 'TODOS' || curso.tipo === filtroTipo;
        
        return matchesSearch && matchesStatus && matchesTipo;
      })
      .map(curso => ({ ...curso, tipoCurso: 'normal' as const })),
    
    // CursosAI mapeados con tipo 'ai'
    ...cursosAI
      .filter(cursoAI => {
        const matchesSearch = searchTerm === '' || 
          cursoAI.nombreClase?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cursoAI.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cursoAI.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cursoAI.etiquetas?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
      .map(cursoAI => ({ ...cursoAI, tipoCurso: 'ai' as const }))
  ];

  // Estadísticas
  const stats = {
    total: cursos.length + cursosAI.length,
    completados: cursos.filter(c => c.status === CursoStatus.COMPLETADO).length,
    enProgreso: cursos.filter(c => c.status === CursoStatus.EN_PROGRESO).length,
    planificados: cursos.filter(c => c.status === CursoStatus.PLANIFICADO).length,
    horasTotal: cursos.reduce((total, curso) => total + curso.duracionHoras, 0),
    certificados: cursos.filter(c => c.certificado && c.status === CursoStatus.COMPLETADO).length,
    cursosAI: cursosAI.length
  };

  const getStatusColor = (status: CursoStatus) => {
    switch (status) {
      case CursoStatus.COMPLETADO:
        return 'bg-green-100 text-green-800';
      case CursoStatus.EN_PROGRESO:
        return 'bg-blue-100 text-blue-800';
      case CursoStatus.PLANIFICADO:
        return 'bg-yellow-100 text-yellow-800';
      case CursoStatus.ABANDONADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: CursoType) => {
    switch (tipo) {
      case CursoType.ONLINE:
        return <ExternalLink className="w-4 h-4" />;
      case CursoType.PRESENCIAL:
        return <Building className="w-4 h-4" />;
      case CursoType.HIBRIDO:
        return <BookOpen className="w-4 h-4" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para renderizar una tarjeta de CursoAI
  const renderCursoAICard = (cursoAI: any, index: number) => {
    const extraerHoras = (duracion: string): number => {
      const match = duracion?.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const horas = extraerHoras(cursoAI.duracion || '0');
    const categorias = cursoAI.etiquetas ? cursoAI.etiquetas.split(', ').slice(0, 3) : [];
    
    return (
      <Card key={`ai-${cursoAI.id || index}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Curso AI
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {cursoAI.nombreClase || 'Curso AI sin título'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <ExternalLink className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">{cursoAI.plataforma || 'AI Platform'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{cursoAI.instructor || 'Twin Class AI'}</span>
          </div>

          {/* Duración */}
          {horas > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{horas} horas</span>
            </div>
          )}

          {/* Categoría */}
          {cursoAI.categoria && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{cursoAI.categoria}</span>
            </div>
          )}

          {/* Precio */}
          {cursoAI.precio && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-600">{cursoAI.precio}</span>
            </div>
          )}

          {/* Etiquetas */}
          <div className="flex flex-wrap gap-1">
            {categorias.map((etiqueta: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs border-purple-200 text-purple-700">
                {etiqueta.trim()}
              </Badge>
            ))}
            {cursoAI.etiquetas && cursoAI.etiquetas.split(', ').length > 3 && (
              <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                +{cursoAI.etiquetas.split(', ').length - 3}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          {cursoAI.loQueAprendere && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {cursoAI.loQueAprendere}
            </p>
          )}

          {/* Información del archivo */}
          {(cursoAI.NombreArchivo || cursoAI.NumeroPaginas) && (
            <div className="bg-purple-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Documento base</span>
              </div>
              {cursoAI.NombreArchivo && (
                <p className="text-xs text-purple-700">{cursoAI.NombreArchivo}</p>
              )}
              {cursoAI.NumeroPaginas && (
                <p className="text-xs text-purple-700">{cursoAI.NumeroPaginas} páginas</p>
              )}
              {cursoAI.TieneIndice && cursoAI.PaginaInicioIndice && (
                <p className="text-xs text-purple-700">
                  Índice: págs. {cursoAI.PaginaInicioIndice}
                  {cursoAI.PaginaFinIndice && cursoAI.PaginaFinIndice !== cursoAI.PaginaInicioIndice 
                    ? ` - ${cursoAI.PaginaFinIndice}` 
                    : ''
                  }
                </p>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => navigate(`/mi-conocimiento/cursosAI/editar/${cursoAI.id}`)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => navigate(`/mi-conocimiento/cursosAI/detalles/${cursoAI.id}`, {
                  state: { cursoAI: cursoAI, esAI: true }
                })}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalles
              </Button>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200"
              onClick={() => {
                console.log('🚀 Navegando a capítulos de CursoAI:', cursoAI);
                console.log('📚 Capítulos del CursoAI:', cursoAI.capitulos);
                navigate(`/mi-conocimiento/cursosAI/${cursoAI.id}/capitulos`, {
                  state: { cursoAI: cursoAI, esAI: true }
                });
              }}
            >
              <BookOpenCheck className="w-4 h-4 mr-1" />
              Ver Capítulos ({cursoAI.capitulos?.length || 0})
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Manejo de estados de carga
  if (twinIdLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span className="text-gray-600">Cargando información del usuario...</span>
      </div>
    );
  }

  if (twinIdError || !twinId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Error de autenticación</h3>
        <p className="text-gray-500 mb-4">
          {twinIdError || 'No se pudo identificar al usuario'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
        <Button
          variant="outline" 
          size="sm"
          onClick={cargarCursos}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error de carga */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Error al cargar cursos</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarCursos}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-gray-600">Cargando cursos...</span>
        </div>
      )}

      {/* Estadísticas */}
      {!loading && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Cursos</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.enProgreso}</div>
            <div className="text-sm text-gray-600">En Progreso</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.planificados}</div>
            <div className="text-sm text-gray-600">Planificados</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.horasTotal}</div>
            <div className="text-sm text-gray-600">Horas Total</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.certificados}</div>
            <div className="text-sm text-gray-600">Certificados</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.cursosAI}</div>
            <div className="text-sm text-purple-700 font-medium">Cursos AI</div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filtros y búsqueda */}
      {!loading && (
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as CursoStatus | 'TODOS')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value={CursoStatus.COMPLETADO}>Completados</option>
            <option value={CursoStatus.EN_PROGRESO}>En Progreso</option>
            <option value={CursoStatus.PLANIFICADO}>Planificados</option>
            <option value={CursoStatus.ABANDONADO}>Abandonados</option>
          </select>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as CursoType | 'TODOS')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value={CursoType.ONLINE}>Online</option>
            <option value={CursoType.PRESENCIAL}>Presencial</option>
            <option value={CursoType.HIBRIDO}>Híbrido</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/mi-conocimiento/cursos/agregar')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Curso
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/mi-conocimiento/cursos/agregar-documento')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Agregar Curso con Documento
          </Button>
          
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/mi-conocimiento/cursos/agregar-ai')}
          >
            <Brain className="w-4 h-4 mr-2" />
            Agregar Curso con AI
          </Button>
        </div>
      </div>
      )}

      {/* Lista combinada de cursos */}
      {!loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todosCursosFiltrados.map((item, index) => {
          // Renderizar CursoAI
          if (item.tipoCurso === 'ai') {
            return renderCursoAICard(item, index);
          }
          
          // Renderizar curso normal
          const curso = item as CursoMapeado & { tipoCurso: 'normal' };
          return (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {curso.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getTipoIcon(curso.tipo)}
                      <span className="text-sm text-gray-600">{curso.institucion}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getStatusColor(curso.status)}>
                      {curso.status.replace('_', ' ')}
                    </Badge>
                    {curso.certificado && curso.status === CursoStatus.COMPLETADO && (
                      <Award className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{curso.instructor}</span>
                </div>

                {/* Duración y progreso */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{curso.duracionHoras} horas</span>
                  {curso.progreso && (
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${curso.progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{curso.progreso}%</span>
                    </div>
                  )}
                </div>

                {/* Fechas */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatearFecha(curso.fechaInicio)}
                    {curso.fechaFin && ` - ${formatearFecha(curso.fechaFin)}`}
                  </span>
                </div>

                {/* Calificación */}
                {curso.calificacion && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{curso.calificacion}/5.0</span>
                  </div>
                )}

                {/* Categorías */}
                <div className="flex flex-wrap gap-1">
                  {curso.categorias.slice(0, 3).map((categoria) => (
                    <Badge key={categoria} variant="outline" className="text-xs">
                      {categoria}
                    </Badge>
                  ))}
                  {curso.categorias.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{curso.categorias.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Descripción */}
                {curso.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {curso.descripcion}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/mi-conocimiento/cursos/editar/${curso.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/mi-conocimiento/cursos/detalles/${curso.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    {curso.urlCertificado && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/mi-conocimiento/cursos/${curso.id}/capitulos`)}
                  >
                    <BookOpenCheck className="w-4 h-4 mr-1" />
                    Ver Capítulos
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Mensaje si no hay cursos */}
      {!loading && todosCursosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron cursos' : 'No tienes cursos registrados'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Comienza agregando cursos tradicionales o genera cursos con AI desde documentos'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/mi-conocimiento/cursos/agregar')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Curso
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/mi-conocimiento/cursos/agregar-documento')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Crear Curso con AI
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosSection;