import React from 'react';
import { 
  X, 
  Clock, 
  User, 
  Building, 
  Tag, 
  BookOpen, 
  DollarSign,
  Calendar,
  Globe,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetalleCurso } from '@/types/conocimiento';

interface CourseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: DetalleCurso[];
  searchQuery: string;
  onSelectCourse: (course: DetalleCurso) => void;
  isLoading?: boolean;
}

const CourseSearchModal: React.FC<CourseSearchModalProps> = ({
  isOpen,
  onClose,
  courses,
  searchQuery,
  onSelectCourse,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const formatPrice = (priceStr: string) => {
    if (!priceStr || priceStr.toLowerCase().includes('gratis') || priceStr.toLowerCase().includes('free')) {
      return 'Gratis';
    }
    return priceStr;
  };

  const formatDuration = (durationStr: string) => {
    return durationStr || 'No especificada';
  };

  const handleSelectCourse = (course: DetalleCurso) => {
    onSelectCourse(course);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Resultados de Búsqueda</h2>
              <p className="text-blue-100 mt-1">
                Búsqueda: "{searchQuery}" • {courses.length} curso(s) encontrado(s)
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Buscando cursos online...</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron cursos</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {course.nombreClase}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{course.plataforma}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Instructor */}
                    {course.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{course.instructor}</span>
                      </div>
                    )}

                    {/* Categoría */}
                    {course.categoria && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <Badge variant="outline" className="text-xs">
                          {course.categoria}
                        </Badge>
                      </div>
                    )}

                    {/* Duración */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDuration(course.duracion)}</span>
                    </div>

                    {/* Idioma */}
                    {course.idioma && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{course.idioma}</span>
                      </div>
                    )}

                    {/* Precio */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-green-600">
                        {formatPrice(course.precio)}
                      </span>
                    </div>

                    {/* Fechas */}
                    {course.fechaInicio && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Inicio: {course.fechaInicio}
                          {course.fechaFin && ` - Fin: ${course.fechaFin}`}
                        </span>
                      </div>
                    )}

                    {/* Lo que aprenderé - preview */}
                    {course.loQueAprendere && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium mb-1">Lo que aprenderás:</p>
                        <p className="text-xs text-blue-700 line-clamp-3">
                          {course.loQueAprendere}
                        </p>
                      </div>
                    )}

                    {/* Objetivos de Aprendizaje */}
                    {course.objetivosdeAprendizaje && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-800 font-medium mb-1">Objetivos de Aprendizaje:</p>
                        <p className="text-xs text-green-700 line-clamp-3">
                          {course.objetivosdeAprendizaje}
                        </p>
                      </div>
                    )}

                    {/* Habilidades y Competencias */}
                    {course.habilidadesCompetencias && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-800 font-medium mb-1">Habilidades y Competencias:</p>
                        <p className="text-xs text-purple-700 line-clamp-3">
                          {course.habilidadesCompetencias}
                        </p>
                      </div>
                    )}

                    {/* Prerequisitos */}
                    {course.prerequisitos && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-800 font-medium mb-1">Prerequisitos:</p>
                        <p className="text-xs text-orange-700 line-clamp-3">
                          {course.prerequisitos}
                        </p>
                      </div>
                    )}

                    {/* Enlaces */}
                    <div className="flex gap-2 flex-wrap">
                      {course.enlaces?.enlaceClase && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(course.enlaces.enlaceClase, '_blank');
                          }}
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Ver Curso
                        </Button>
                      )}
                      {course.enlaces?.enlaceInstructor && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(course.enlaces.enlaceInstructor, '_blank');
                          }}
                        >
                          <User className="w-3 h-3 mr-1" />
                          Instructor
                        </Button>
                      )}
                    </div>

                    {/* Botón de selección */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleSelectCourse(course)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Seleccionar Este Curso
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSearchModal;