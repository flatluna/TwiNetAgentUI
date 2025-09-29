import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Clock, DollarSign, Globe, User, BookOpen, Target, Award, Tag, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { obtenerDetalleCurso } from '@/services/courseService';
import { DetalleCurso } from '@/types/conocimiento';
import { useTwinId } from '@/hooks/useTwinId';

const DetallesCursoPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { twinId, loading: twinIdLoading } = useTwinId();
  
  const [curso, setCurso] = useState<DetalleCurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCursoAI, setIsCursoAI] = useState(false);

  useEffect(() => {
    const cargarDetalleCurso = async () => {
      if (!cursoId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);
        
        // Verificar si se pasaron datos por estado desde la navegación
        const estadoNavegacion = location.state as { cursoAI?: any, esAI?: boolean };
        
        if (estadoNavegacion && estadoNavegacion.esAI && estadoNavegacion.cursoAI) {
          // Usar datos que ya se cargaron, no hacer nueva llamada
          console.log('� Usando datos de CursoAI pasados por navegación');
          const cursoAI = estadoNavegacion.cursoAI;
          setIsCursoAI(true);
          
          // Mapear CursoAI a formato DetalleCurso
          const cursoMapeado: DetalleCurso = {
            nombreClase: cursoAI.nombreClase || 'CursoAI sin título',
            instructor: cursoAI.instructor || 'Twin Class AI',
            plataforma: cursoAI.plataforma || 'AI Platform',
            categoria: cursoAI.categoria || 'Sin categoría',
            duracion: cursoAI.duracion || '0 horas',
            requisitos: cursoAI.requisitos || 'Sin requisitos',
            loQueAprendere: cursoAI.loQueAprendere || 'Sin descripción',
            precio: cursoAI.precio || 'Gratuito',
            recursos: cursoAI.recursos || 'Recursos generados por AI',
            idioma: cursoAI.idioma || 'Español',
            fechaInicio: cursoAI.fechaInicio || '',
            fechaFin: cursoAI.fechaFin || '',
            objetivosdeAprendizaje: cursoAI.objetivosdeAprendizaje || '',
            habilidadesCompetencias: cursoAI.habilidadesCompetencias || '',
            prerequisitos: cursoAI.prerequisitos || '',
            etiquetas: cursoAI.etiquetas || '',
            notasPersonales: cursoAI.NotasPersonales || '',
            htmlDetails: cursoAI.htmlDetails || '',
            enlaces: {
              enlaceClase: '',
              enlaceInstructor: '',
              enlacePlataforma: '',
              enlaceCategoria: ''
            }
          };
          setCurso(cursoMapeado);
          setLoading(false);
          return;
        }

        console.log('�🔍 Cargando detalles del curso con TwinID real:', { twinId, cursoId });
        
        // Detectar si es un CursoAI basado en la URL (fallback si no se pasaron datos)
        const isAI = window.location.pathname.includes('/cursosAI/');
        setIsCursoAI(isAI);
        
        if (isAI) {
          // Cargar CursoAI desde el endpoint específico (solo si no se pasaron datos)
          console.log('⚠️ Cargando CursoAI desde backend - no se encontraron datos en navegación');
          const response = await fetch(`/api/twins/${twinId}/cursosAI`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`Error al obtener CursosAI: ${response.status} ${response.statusText}`);
          }

          const cursosAIResponse = await response.json();
          
          if (cursosAIResponse.success && cursosAIResponse.cursos) {
            const cursoAIEncontrado = cursosAIResponse.cursos.find((c: any) => c.id === cursoId);
            
            if (cursoAIEncontrado) {
              // Mapear CursoAI a formato DetalleCurso
              const cursoMapeado: DetalleCurso = {
                nombreClase: cursoAIEncontrado.nombreClase || 'CursoAI sin título',
                instructor: cursoAIEncontrado.instructor || 'Twin Class AI',
                plataforma: cursoAIEncontrado.plataforma || 'AI Platform',
                categoria: cursoAIEncontrado.categoria || 'Sin categoría',
                duracion: cursoAIEncontrado.duracion || '0 horas',
                requisitos: cursoAIEncontrado.requisitos || 'Sin requisitos',
                loQueAprendere: cursoAIEncontrado.loQueAprendere || 'Sin descripción',
                precio: cursoAIEncontrado.precio || 'Gratuito',
                recursos: cursoAIEncontrado.recursos || 'Recursos generados por AI',
                idioma: cursoAIEncontrado.idioma || 'Español',
                fechaInicio: cursoAIEncontrado.fechaInicio || '',
                fechaFin: cursoAIEncontrado.fechaFin || '',
                objetivosdeAprendizaje: cursoAIEncontrado.objetivosdeAprendizaje || '',
                habilidadesCompetencias: cursoAIEncontrado.habilidadesCompetencias || '',
                prerequisitos: cursoAIEncontrado.prerequisitos || '',
                etiquetas: cursoAIEncontrado.etiquetas || '',
                notasPersonales: cursoAIEncontrado.NotasPersonales || '',
                htmlDetails: cursoAIEncontrado.htmlDetails || '',
                enlaces: {
                  enlaceClase: '',
                  enlaceInstructor: '',
                  enlacePlataforma: '',
                  enlaceCategoria: ''
                }
              };
              setCurso(cursoMapeado);
            } else {
              throw new Error('CursoAI no encontrado');
            }
          } else {
            throw new Error('Formato de respuesta inválido para CursosAI');
          }
        } else {
          // Usar datos reales del backend con el TwinID del usuario autenticado (curso normal)
          const detalleCurso = await obtenerDetalleCurso(twinId, cursoId);
          setCurso(detalleCurso);
        }
      } catch (err) {
        console.error('❌ Error al cargar detalles del curso:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`No se pudieron cargar los detalles del curso: ${errorMessage}`);
        setCurso(null);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalleCurso();
  }, [cursoId, twinId, twinIdLoading, location.state]);

  if (loading || twinIdLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando detalles del curso...</div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Curso no encontrado'}</div>
          <Button onClick={() => navigate('/mi-conocimiento/cursos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
        </div>
      </div>
    );
  }

  const renderHTMLContent = (htmlContent: string) => {
    // Si el contenido viene envuelto en ```html, extraerlo
    const htmlMatch = htmlContent.match(/```html\n([\s\S]*?)\n```/);
    const htmlToRender = htmlMatch ? htmlMatch[1] : htmlContent;
    
    if (htmlToRender && htmlToRender.trim().length > 0) {
      return (
        <div 
          className="w-full bg-white rounded-lg border"
          dangerouslySetInnerHTML={{ __html: htmlToRender }}
          style={{
            maxWidth: '100%',
            overflow: 'auto'
          }}
        />
      );
    }
    
    // Fallback: mostrar información básica si no hay HTML
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay análisis HTML disponible para este curso.</p>
        <p className="text-sm mt-2">La información detallada está disponible en las otras pestañas.</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/mi-conocimiento/cursos')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{curso.nombreClase}</h1>
            {isCursoAI && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Curso AI
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 mt-1">por {curso.instructor}</p>
        </div>
        <Button 
          onClick={() => navigate(`/mi-conocimiento/cursos/editar/${cursoId}`)}
          variant="outline"
        >
          Editar Curso
        </Button>
      </div>

      <Tabs defaultValue="analisis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analisis">Análisis Completo</TabsTrigger>
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="enlaces">Enlaces</TabsTrigger>
        </TabsList>

        {/* Pestaña de Análisis Completo (HTML Details) */}
        <TabsContent value="analisis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Análisis Educativo Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {curso.htmlDetails && renderHTMLContent(curso.htmlDetails)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Información Básica */}
        <TabsContent value="informacion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Información del Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Plataforma</label>
                    <p className="text-sm mt-1 font-medium">{curso.plataforma}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoría</label>
                    <p className="text-sm mt-1">{curso.categoria}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duración</label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {curso.duracion}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio</label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {curso.precio}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Idioma</label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {curso.idioma}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Instructor</label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {curso.instructor}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600">Fechas</label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      Inicio: {curso.fechaInicio}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      Fin: {curso.fechaFin}
                    </div>
                  </div>
                </div>

                {/* Etiquetas y Notas Personales */}
                {(curso.etiquetas || curso.notasPersonales) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {curso.etiquetas && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            Etiquetas
                          </label>
                          <div className="mt-1">
                            <Badge variant="secondary">{curso.etiquetas}</Badge>
                          </div>
                        </div>
                      )}
                      
                      {curso.notasPersonales && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Notas Personales
                          </label>
                          <p className="text-sm mt-1 p-2 bg-gray-50 rounded border">{curso.notasPersonales}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Lo que Aprenderé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Lo que Aprenderé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contenido del Curso</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{curso.loQueAprendere}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                  <p className="text-sm text-gray-700">{curso.requisitos}</p>
                </div>

                {curso.prerequisitos && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Prerrequisitos</h4>
                      <p className="text-sm text-gray-700">{curso.prerequisitos}</p>
                    </div>
                  </>
                )}

                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recursos Incluidos</h4>
                  <p className="text-sm text-gray-700">{curso.recursos}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Objetivos y Competencias */}
        <TabsContent value="objetivos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {curso.objetivosdeAprendizaje ? (
                  <p className="text-sm text-gray-700 leading-relaxed">{curso.objetivosdeAprendizaje}</p>
                ) : (
                  <p className="text-sm text-gray-500">No se han definido objetivos específicos</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Habilidades y Competencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {curso.habilidadesCompetencias ? (
                  <p className="text-sm text-gray-700 leading-relaxed">{curso.habilidadesCompetencias}</p>
                ) : (
                  <p className="text-sm text-gray-500">No se han definido habilidades específicas</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Enlaces */}
        <TabsContent value="enlaces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Enlaces Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {curso.enlaces && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curso.enlaces.enlaceClase && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Enlace a la Clase</h4>
                      <a 
                        href={curso.enlaces.enlaceClase}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir al curso
                      </a>
                    </div>
                  )}

                  {curso.enlaces.enlaceInstructor && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Perfil del Instructor</h4>
                      <a 
                        href={curso.enlaces.enlaceInstructor}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver perfil
                      </a>
                    </div>
                  )}

                  {curso.enlaces.enlacePlataforma && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Plataforma</h4>
                      <a 
                        href={curso.enlaces.enlacePlataforma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir a la plataforma
                      </a>
                    </div>
                  )}

                  {curso.enlaces.enlaceCategoria && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Categoría</h4>
                      <a 
                        href={curso.enlaces.enlaceCategoria}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Explorar categoría
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetallesCursoPage;