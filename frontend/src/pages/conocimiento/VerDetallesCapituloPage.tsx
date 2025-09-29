import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Clock, 
  CheckCircle2, 
  Star, 
  FileText, 
  Play,
  Volume2,
  Calendar,
  HelpCircle,
  Lightbulb,
  User,
  Loader2,
  AlertCircle,
  Badge as BadgeIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTwinId } from '@/hooks/useTwinId';

// Interfaces para los datos del capítulo AI
interface PreguntaQuiz {
  Pregunta: string;
  Opciones: string[];
  RespuestaCorrecta: string;
  Explicacion: string;
}

interface EjemploPractico {
  Titulo: string;
  Descripcion: string;
  Aplicacion: string;
}

interface CapituloAI {
  id: string;
  TotalTokens: number;
  Titulo: string;
  Descripcion: string;
  NumeroCapitulo: number;
  Transcript: string;
  Notas: string;
  Comentarios: string;
  DuracionMinutos: number;
  Tags: string[];
  Puntuacion: number;
  CursoId: string;
  TwinId: string;
  Completado: boolean;
  ResumenEjecutivo: string;
  ExplicacionProfesorTexto: string;
  ExplicacionProfesorHTML: string;
  Quiz: PreguntaQuiz[];
  Ejemplos: EjemploPractico[];
}

const VerDetallesCapituloPage: React.FC = () => {
  const { cursoId, capituloId } = useParams<{ cursoId: string; capituloId: string }>();
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  
  const [capitulo, setCapitulo] = useState<CapituloAI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursoTitulo, setCursoTitulo] = useState<string>('');
  const [activeTab, setActiveTab] = useState('resumen');

  // Estados para el quiz interactivo
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<{ [key: number]: string }>({});
  const [mostrarResultados, setMostrarResultados] = useState(false);

  useEffect(() => {
    const cargarDetallesCapitulo = async () => {
      if (!cursoId || !capituloId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Cargando detalles del capítulo ${capituloId} del curso ${cursoId}`);
        
        // Obtener información del curso completo (incluye capítulos)
        const cursoResponse = await fetch(`/api/twins/${twinId}/cursos/${cursoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!cursoResponse.ok) {
          throw new Error(`Error al obtener curso: ${cursoResponse.status} ${cursoResponse.statusText}`);
        }

        const cursoCompleto = await cursoResponse.json();
        console.log('📚 Curso completo obtenido:', cursoCompleto);
        
        // Extraer información del curso
        const cursoData = cursoCompleto.curso?.cursoData?.curso;
        if (cursoData) {
          setCursoTitulo(cursoData.nombreClase || 'Curso sin título');
          
          // Buscar el capítulo específico
          const capitulosList = cursoData.capitulos || [];
          const capituloEncontrado = capitulosList.find((cap: any) => 
            cap.id === capituloId || cap.NumeroCapitulo?.toString() === capituloId
          );
          
          if (capituloEncontrado) {
            console.log('📖 Capítulo encontrado:', capituloEncontrado);
            setCapitulo(capituloEncontrado);
          } else {
            throw new Error('Capítulo no encontrado');
          }
        } else {
          throw new Error('Estructura de datos del curso no válida');
        }
        
      } catch (err) {
        console.error('❌ Error al cargar detalles del capítulo:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el capítulo');
      } finally {
        setLoading(false);
      }
    };

    cargarDetallesCapitulo();
  }, [cursoId, capituloId, twinId, twinIdLoading]);

  const handleRespuestaQuiz = (preguntaIndex: number, respuesta: string) => {
    setRespuestasSeleccionadas(prev => ({
      ...prev,
      [preguntaIndex]: respuesta
    }));
  };

  const verificarQuiz = () => {
    setMostrarResultados(true);
  };

  const resetearQuiz = () => {
    setRespuestasSeleccionadas({});
    setMostrarResultados(false);
  };

  const calcularPuntajeQuiz = () => {
    if (!capitulo?.Quiz) return { correctas: 0, total: 0, porcentaje: 0 };
    
    const correctas = capitulo.Quiz.filter((pregunta, index) => 
      respuestasSeleccionadas[index] === pregunta.RespuestaCorrecta
    ).length;
    
    const total = capitulo.Quiz.length;
    const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;
    
    return { correctas, total, porcentaje };
  };

  if (loading || twinIdLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Cargando detalles del capítulo...</span>
        </div>
      </div>
    );
  }

  if (error || !capitulo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-red-600 mb-4">{error || 'Capítulo no encontrado'}</div>
          <Button onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Capítulos
          </Button>
        </div>
      </div>
    );
  }

  const puntajeQuiz = calcularPuntajeQuiz();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos`)}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Capítulo</h1>
          <div className="mt-1">
            <p className="text-lg text-gray-800 font-medium">{cursoTitulo}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                Capítulo {capitulo.NumeroCapitulo}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Brain className="w-3 h-3 mr-1" />
                Generado por AI
              </Badge>
              {capitulo.Completado && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información básica del capítulo */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-purple-600" />
            {capitulo.Titulo}
          </CardTitle>
          {capitulo.Descripcion && (
            <p className="text-gray-600 mt-2">{capitulo.Descripcion}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{capitulo.DuracionMinutos || 0} minutos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{capitulo.Puntuacion ? `${capitulo.Puntuacion}/5` : 'Sin calificar'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>{capitulo.TotalTokens} tokens</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BadgeIcon className="w-4 h-4 text-green-500" />
              <span>{capitulo.Tags?.length || 0} tags</span>
            </div>
          </div>
          
          {/* Tags */}
          {capitulo.Tags && capitulo.Tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {capitulo.Tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs con las 3 secciones */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumen Ejecutivo
          </TabsTrigger>
          <TabsTrigger value="explicacion" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Explicación del Profesor
          </TabsTrigger>
          <TabsTrigger value="ejemplos" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Ejemplos
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Quiz ({capitulo.Quiz?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Resumen Ejecutivo */}
        <TabsContent value="resumen" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {capitulo.ResumenEjecutivo ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {capitulo.ResumenEjecutivo}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay resumen ejecutivo disponible para este capítulo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explicación del Profesor */}
        <TabsContent value="explicacion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Explicación del Profesor
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Volume2 className="w-4 h-4 mr-1" />
                  Escuchar Audio
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Ver Video
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {capitulo.ExplicacionProfesorHTML ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: capitulo.ExplicacionProfesorHTML }}
                />
              ) : capitulo.ExplicacionProfesorTexto ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {capitulo.ExplicacionProfesorTexto}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay explicación del profesor disponible para este capítulo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ejemplos Prácticos */}
        <TabsContent value="ejemplos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Ejemplos Prácticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {capitulo.Ejemplos && capitulo.Ejemplos.length > 0 ? (
                <div className="space-y-6">
                  {capitulo.Ejemplos.map((ejemplo, index) => (
                    <div key={index} className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        {ejemplo.Titulo}
                      </h4>
                      <p className="text-gray-700 mb-3">
                        {ejemplo.Descripcion}
                      </p>
                      <div className="bg-white p-3 rounded border-l-2 border-l-yellow-400">
                        <h5 className="text-sm font-medium text-gray-800 mb-1">💡 Aplicación:</h5>
                        <p className="text-sm text-gray-600">
                          {ejemplo.Aplicacion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay ejemplos prácticos disponibles para este capítulo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Interactivo */}
        <TabsContent value="quiz" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  Quiz Interactivo
                </CardTitle>
                {mostrarResultados && (
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${
                        puntajeQuiz.porcentaje >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : puntajeQuiz.porcentaje >= 60 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {puntajeQuiz.correctas}/{puntajeQuiz.total} ({puntajeQuiz.porcentaje}%)
                    </Badge>
                    <Button variant="outline" size="sm" onClick={resetearQuiz}>
                      Reintentar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {capitulo.Quiz && capitulo.Quiz.length > 0 ? (
                <div className="space-y-6">
                  {capitulo.Quiz.map((pregunta, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {index + 1}. {pregunta.Pregunta}
                      </h4>
                      
                      <div className="space-y-2">
                        {pregunta.Opciones.map((opcion, opcionIndex) => {
                          const isSelected = respuestasSeleccionadas[index] === opcion;
                          const isCorrect = opcion === pregunta.RespuestaCorrecta;
                          const showResult = mostrarResultados;
                          
                          let buttonClass = "w-full text-left p-3 rounded border transition-colors ";
                          
                          if (showResult) {
                            if (isCorrect) {
                              buttonClass += "bg-green-100 border-green-300 text-green-800";
                            } else if (isSelected && !isCorrect) {
                              buttonClass += "bg-red-100 border-red-300 text-red-800";
                            } else {
                              buttonClass += "bg-gray-100 border-gray-200 text-gray-600";
                            }
                          } else {
                            if (isSelected) {
                              buttonClass += "bg-blue-100 border-blue-300 text-blue-800";
                            } else {
                              buttonClass += "bg-white border-gray-200 hover:bg-gray-50 text-gray-700";
                            }
                          }
                          
                          return (
                            <button
                              key={opcionIndex}
                              onClick={() => !mostrarResultados && handleRespuestaQuiz(index, opcion)}
                              disabled={mostrarResultados}
                              className={buttonClass}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + opcionIndex)}
                                </span>
                                <span>{opcion}</span>
                                {showResult && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {mostrarResultados && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
                          <p className="text-sm text-blue-800">
                            <strong>Explicación:</strong> {pregunta.Explicacion}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!mostrarResultados && (
                    <div className="text-center">
                      <Button 
                        onClick={verificarQuiz}
                        disabled={Object.keys(respuestasSeleccionadas).length !== capitulo.Quiz.length}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Verificar Respuestas
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay preguntas de quiz disponibles para este capítulo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerDetallesCapituloPage;