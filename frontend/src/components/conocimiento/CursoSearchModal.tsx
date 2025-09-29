import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Globe, 
  DollarSign, 
  Calendar, 
  Award,
  BookOpen,
  User,
  Building,
  Tag,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetalleCurso } from '@/types/conocimiento';

interface CursoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursos: DetalleCurso[];
  onSelectCurso: (curso: DetalleCurso) => void;
  isLoading?: boolean;
}

const CursoSearchModal: React.FC<CursoSearchModalProps> = ({
  isOpen,
  onClose,
  cursos,
  onSelectCurso,
  isLoading = false
}) => {
  const [selectedCurso, setSelectedCurso] = useState<DetalleCurso | null>(null);

  if (!isOpen) return null;

  const handleSelectCurso = (curso: DetalleCurso) => {
    setSelectedCurso(curso);
    onSelectCurso(curso);
    onClose();
  };

  const formatPrecio = (precio: string) => {
    if (!precio || precio.toLowerCase().includes('gratis') || precio.toLowerCase().includes('free')) {
      return { text: 'Gratis', color: 'text-green-600' };
    }
    return { text: precio, color: 'text-gray-900' };
  };

  const formatDuracion = (duracion: string) => {
    if (!duracion) return 'No especificada';
    return duracion;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resultados de Búsqueda</h2>
              <p className="text-blue-100 text-sm">
                {cursos.length} {cursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Buscando cursos...</p>
              </div>
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron cursos</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cursos.map((curso, index) => {
                const precio = formatPrecio(curso.precio);
                
                return (
                  <Card 
                    key={index} 
                    className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 cursor-pointer"
                    onClick={() => handleSelectCurso(curso)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
                          {curso.nombreClase}
                        </CardTitle>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCurso(curso);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Seleccionar
                        </Button>
                      </div>
                      
                      {/* Instructor y Plataforma */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{curso.instructor || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{curso.plataforma || 'No especificada'}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Información principal */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuracion(curso.duracion)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${precio.color}`}>
                            {precio.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {curso.idioma || 'No especificado'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {curso.categoria || 'General'}
                          </span>
                        </div>
                      </div>

                      {/* Fechas */}
                      {(curso.fechaInicio || curso.fechaFin) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {curso.fechaInicio && curso.fechaFin 
                              ? `${curso.fechaInicio} - ${curso.fechaFin}`
                              : curso.fechaInicio || curso.fechaFin}
                          </span>
                        </div>
                      )}

                      {/* Lo que aprenderé */}
                      {curso.loQueAprendere && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Lo que aprenderás:
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {curso.loQueAprendere}
                          </p>
                        </div>
                      )}

                      {/* Requisitos */}
                      {curso.requisitos && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {curso.requisitos}
                          </p>
                        </div>
                      )}

                      {/* Enlaces */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {curso.enlaces?.enlaceClase && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(curso.enlaces.enlaceClase, '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver Curso
                          </Button>
                        )}
                        {curso.enlaces?.enlaceInstructor && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(curso.enlaces.enlaceInstructor, '_blank');
                            }}
                          >
                            <User className="w-3 h-3 mr-1" />
                            Instructor
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Selecciona un curso para autocompletar el formulario
          </p>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CursoSearchModal;