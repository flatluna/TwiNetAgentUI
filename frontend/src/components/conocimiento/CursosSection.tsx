import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar,
  Award,
  Clock,
  ExternalLink,
  Star,
  Plus,
  Search,
  Filter,
  BookOpen,
  Building,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Curso, CursoStatus, CursoType } from '@/types/conocimiento';

interface CursosSectionProps {
  searchTerm?: string;
}

const CursosSection: React.FC<CursosSectionProps> = ({ searchTerm = '' }) => {
  const [cursos] = useState<Curso[]>([
    {
      id: '1',
      titulo: 'React Avanzado con TypeScript',
      institucion: 'Platzi',
      instructor: 'Nicolas Molina',
      tipo: CursoType.ONLINE,
      status: CursoStatus.COMPLETADO,
      fechaInicio: '2024-01-15',
      fechaFin: '2024-03-15',
      duracionHoras: 40,
      calificacion: 4.8,
      certificado: true,
      urlCertificado: 'https://platzi.com/certificates/react-typescript',
      descripcion: 'Curso completo de React con TypeScript, hooks avanzados, patrones de diseño y mejores prácticas.',
      categorias: ['Frontend', 'JavaScript', 'React'],
      habilidadesAdquiridas: ['React Hooks', 'TypeScript', 'State Management', 'Testing'],
      notas: 'Excelente curso para profundizar en React. Los ejercicios prácticos fueron muy útiles.',
      createdAt: '2024-03-15T10:30:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      titulo: 'Machine Learning con Python',
      institucion: 'Coursera - Stanford University',
      instructor: 'Andrew Ng',
      tipo: CursoType.ONLINE,
      status: CursoStatus.EN_PROGRESO,
      fechaInicio: '2024-09-01',
      fechaFin: undefined,
      duracionHoras: 60,
      progreso: 65,
      calificacion: 5.0,
      certificado: false,
      descripcion: 'Introducción completa al Machine Learning con implementaciones prácticas en Python.',
      categorias: ['Machine Learning', 'Python', 'Data Science'],
      habilidadesAdquiridas: ['Supervised Learning', 'Neural Networks', 'Python', 'Scikit-learn'],
      notas: 'Curso muy completo, Andrew Ng explica los conceptos de manera muy clara.',
      createdAt: '2024-09-01T09:00:00Z',
      updatedAt: '2024-09-15T14:20:00Z'
    },
    {
      id: '3',
      titulo: 'Taller de Liderazgo Ejecutivo',
      institucion: 'IESE Business School',
      instructor: 'María García',
      tipo: CursoType.PRESENCIAL,
      status: CursoStatus.PLANIFICADO,
      fechaInicio: '2024-11-01',
      fechaFin: '2024-11-03',
      duracionHoras: 24,
      certificado: true,
      descripcion: 'Taller intensivo de 3 días sobre liderazgo ejecutivo y gestión de equipos.',
      categorias: ['Liderazgo', 'Management', 'Soft Skills'],
      habilidadesAdquiridas: ['Liderazgo', 'Comunicación', 'Gestión de Equipos'],
      notas: 'Muy recomendado por colegas. Esperando con interés.',
      createdAt: '2024-09-20T16:45:00Z',
      updatedAt: '2024-09-20T16:45:00Z'
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<CursoStatus | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<CursoType | 'TODOS'>('TODOS');

  // Filtrar cursos
  const cursosFiltrados = cursos.filter(curso => {
    const matchesSearch = searchTerm === '' || 
      curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.categorias.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filtroStatus === 'TODOS' || curso.status === filtroStatus;
    const matchesTipo = filtroTipo === 'TODOS' || curso.tipo === filtroTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Estadísticas
  const stats = {
    total: cursos.length,
    completados: cursos.filter(c => c.status === CursoStatus.COMPLETADO).length,
    enProgreso: cursos.filter(c => c.status === CursoStatus.EN_PROGRESO).length,
    planificados: cursos.filter(c => c.status === CursoStatus.PLANIFICADO).length,
    horasTotal: cursos.reduce((total, curso) => total + curso.duracionHoras, 0),
    certificados: cursos.filter(c => c.certificado && c.status === CursoStatus.COMPLETADO).length
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

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      </div>

      {/* Filtros y búsqueda */}
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

        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Curso
        </Button>
      </div>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosFiltrados.map((curso) => (
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
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalles
                </Button>
                {curso.urlCertificado && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay cursos */}
      {cursosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron cursos' : 'No tienes cursos registrados'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Comienza agregando los cursos que has tomado o planeas tomar'
            }
          </p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Curso
          </Button>
        </div>
      )}
    </div>
  );
};

export default CursosSection;