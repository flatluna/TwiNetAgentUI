import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  GraduationCap, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  ExternalLink,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/types/conocimiento';
import { DetalleCurso } from '@/types/conocimiento';
import { actualizarCursoEnBackend, obtenerCursosDelBackend } from '@/services/courseService';
import { useTwinId } from '@/hooks/useTwinId';

const EditarCursoPage: React.FC = () => {
  const navigate = useNavigate();
  const { cursoId } = useParams<{ cursoId: string }>();
  const { twinId, loading: twinIdLoading, error: twinIdError } = useTwinId();
  
  const [loading, setLoading] = useState(false);
  const [loadingCurso, setLoadingCurso] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<Course>>({
    twinId: '',
    title: '',
    institution: '',
    instructor: '',
    description: '',
    category: '',
    platform: '',
    language: 'Español',
    durationHours: 0,
    price: 0,
    currency: 'USD',
    startDate: '',
    endDate: '',
    courseMaterials: [],
    prerequisites: [],
    learningObjectives: [],
    skills: [],
    notes: '',
    tags: [],
    // Campos específicos del backend
    requisitos: '',
    recursos: '',
    loQueAprendere: '',
    // Nuevos campos
    objetivosdeAprendizaje: '',
    habilidadesCompetencias: '',
    prerequisitos: '',
    etiquetas: '',
    notasPersonales: '',
    enlaceClase: '',
    enlaceInstructor: '',
    enlacePlataforma: '',
    enlaceCategoria: ''
  });

  // Función para cargar los datos del curso
  const cargarCurso = async () => {
    if (!twinId || !cursoId) return;
    
    setLoadingCurso(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando curso para editar:', { twinId, cursoId });
      const response = await obtenerCursosDelBackend(twinId);
      
      if (response.success && response.cursos) {
        // Buscar el curso específico por ID
        const cursoEncontrado = response.cursos.find(c => 
          c.cursoId === cursoId || c.id === cursoId
        );
        
        if (cursoEncontrado) {
          // Mapear los datos del backend al formulario
          const detalle = cursoEncontrado.cursoData?.curso || {};
          
          setFormData({
            twinId: cursoEncontrado.twinId || twinId,
            title: detalle.nombreClase || '',
            institution: detalle.plataforma || '',
            instructor: detalle.instructor || '',
            description: detalle.loQueAprendere || '',
            category: detalle.categoria || '',
            platform: detalle.plataforma || '',
            language: detalle.idioma || 'Español',
            durationHours: parseInt(detalle.duracion?.match(/(\d+)/)?.[1] || '0'),
            startDate: detalle.fechaInicio || '',
            endDate: detalle.fechaFin || '',
            prerequisites: detalle.requisitos ? detalle.requisitos.split(', ') : [],
            objetivosdeAprendizaje: detalle.objetivosdeAprendizaje || '',
            habilidadesCompetencias: detalle.habilidadesCompetencias || '',
            prerequisitos: detalle.prerequisitos || '',
            etiquetas: detalle.etiquetas || '',
            notasPersonales: detalle.notasPersonales || '',
            enlaceClase: detalle.enlaces?.enlaceClase || '',
            enlaceInstructor: detalle.enlaces?.enlaceInstructor || '',
            enlacePlataforma: detalle.enlaces?.enlacePlataforma || '',
            enlaceCategoria: detalle.enlaces?.enlaceCategoria || '',
            price: parseFloat(detalle.precio?.replace(/[^\d.]/g, '') || '0'),
            courseMaterials: detalle.recursos ? detalle.recursos.split(', ') : []
          });
          
          console.log('✅ Curso cargado para edición:', detalle);
        } else {
          throw new Error('Curso no encontrado');
        }
      } else {
        throw new Error('No se pudo obtener los datos del curso');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error al cargar curso:', errorMessage);
    } finally {
      setLoadingCurso(false);
    }
  };

  // Cargar curso al montar el componente
  useEffect(() => {
    if (twinId && cursoId) {
      cargarCurso();
    }
  }, [twinId, cursoId]);

  const handleInputChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCourse = async () => {
    if (!twinId || !cursoId) {
      setError('Faltan datos necesarios para actualizar el curso');
      return;
    }

    setLoading(true);
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

      console.log('Actualizando curso en backend:', cursoParaBackend);

      // Validar que tengamos el TwinId real del usuario
      if (!twinId) {
        throw new Error('No se pudo obtener el ID del usuario. Por favor, recarga la página e intenta nuevamente.');
      }

      // Llamar al backend para actualizar el curso
      const result = await actualizarCursoEnBackend(
        twinId, 
        cursoId,
        cursoParaBackend, 
        `Edición del curso: ${formData.title}`,
        formData.etiquetas || '',
        formData.notasPersonales || ''
      );

      if (result.success) {
        console.log('✅ Curso actualizado exitosamente');
        setSuccess(true);
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/mi-conocimiento/cursos');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error desconocido al actualizar');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error al actualizar curso:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de estados del TwinId
  if (twinIdLoading || loadingCurso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {twinIdLoading ? 'Cargando información del usuario...' : 'Cargando datos del curso...'}
          </p>
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

  if (error && !loadingCurso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al Cargar Curso</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={cargarCurso} className="mr-4">
            Reintentar
          </Button>
          <Button variant="outline" onClick={() => navigate('/mi-conocimiento/cursos')}>
            Volver a Cursos
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Curso actualizado exitosamente!</h2>
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
            onClick={() => navigate('/mi-conocimiento/cursos')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
            <p className="text-gray-600 mt-1">
              Modifica los datos de tu curso
            </p>
          </div>
        </div>

        {/* Error de actualización */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error al actualizar</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Información del Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: React Avanzado con TypeScript"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institución/Plataforma *
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Platzi, Coursera, Universidad X"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor
                </label>
                <input
                  type="text"
                  value={formData.instructor || ''}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Nicolas Molina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Programación, Diseño, Marketing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe lo que aprenderás en este curso..."
              />
            </div>

            {/* Detalles del curso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  value={formData.durationHours || 0}
                  onChange={(e) => handleInputChange('durationHours', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={formData.language || 'Español'}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Francés">Francés</option>
                  <option value="Portugués">Portugués</option>
                  <option value="Alemán">Alemán</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Campos adicionales del backend */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Información Adicional
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">Objetivos</span>
                    Objetivos de Aprendizaje
                  </label>
                  <textarea
                    value={formData.objetivosdeAprendizaje || ''}
                    onChange={(e) => handleInputChange('objetivosdeAprendizaje', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Qué objetivos específicos tiene este curso?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">Habilidades</span>
                    Habilidades y Competencias
                  </label>
                  <textarea
                    value={formData.habilidadesCompetencias || ''}
                    onChange={(e) => handleInputChange('habilidadesCompetencias', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Qué habilidades desarrollarás?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs mr-2">Requisitos</span>
                    Prerequisitos
                  </label>
                  <textarea
                    value={formData.prerequisitos || ''}
                    onChange={(e) => handleInputChange('prerequisitos', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Qué conocimientos previos se necesitan?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas
                    </label>
                    <input
                      type="text"
                      value={formData.etiquetas || ''}
                      onChange={(e) => handleInputChange('etiquetas', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="react, javascript, frontend"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Personales
                    </label>
                    <textarea
                      value={formData.notasPersonales || ''}
                      onChange={(e) => handleInputChange('notasPersonales', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tus notas y comentarios sobre el curso"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                Enlaces Relacionados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace del Curso
                  </label>
                  <input
                    type="url"
                    value={formData.enlaceClase || ''}
                    onChange={(e) => handleInputChange('enlaceClase', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace del Instructor
                  </label>
                  <input
                    type="url"
                    value={formData.enlaceInstructor || ''}
                    onChange={(e) => handleInputChange('enlaceInstructor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace de la Plataforma
                  </label>
                  <input
                    type="url"
                    value={formData.enlacePlataforma || ''}
                    onChange={(e) => handleInputChange('enlacePlataforma', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace de la Categoría
                  </label>
                  <input
                    type="url"
                    value={formData.enlaceCategoria || ''}
                    onChange={(e) => handleInputChange('enlaceCategoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/mi-conocimiento/cursos')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveCourse}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarCursoPage;