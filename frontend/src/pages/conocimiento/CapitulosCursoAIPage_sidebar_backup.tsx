import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star, 
  Calendar,
  User,
  Globe,
  Tag,
  DollarSign,
  FileText,
  CheckCircle2,
  Play,
  Brain,
  Loader2,
  AlertCircle,
  Badge as BadgeIcon,
  Link,
  Target,
  Award,
  Languages,
  BookMarked,
  Plus,
  Eye,
  Edit,
  Code,
  Send,
  X,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTwinId } from '@/hooks/useTwinId';

// Interfaces para CursoAI con estructura completa
interface Enlaces {
  sitioWeb?: string;
  video?: string;
  certificacion?: string;
}

interface CapituloAI {
  id: string;
  titulo: string;
  descripcion: string;
  numeroCapitulo: number;
  duracionMinutos: number;
  transcript: string;
  notas: string;
  comentarios: string;
  puntuacion: number;
  tags: string[];
  completado: boolean;
  resumenEjecutivo: string;
  explicacionProfesorHTML: string;
  Quiz: any[];
  Ejemplos: any[];
}

interface CursoAI {
  id: string;
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
  objetivosdeAprendizaje: string;
  habilidadesCompetencias: string;
  prerequisitos: string;
  enlaces: Enlaces;
  etiquetas: string;
  notasPersonales: string;
  htmlDetails: string;
  textoDetails: string;
  capitulos: CapituloAI[];
  nombre?: string;
  descripcion?: string;
  pathArchivo: string;
  twinID: string;
  fechaCreacion: string;
  fechaUltimaModificacion?: string;
  notas?: string;
  numeroPaginas?: number;
  tieneIndice: boolean;
  paginaInicioIndice?: number;
  paginaFinIndice?: number;
  nombreArchivo: string;
  tipoArchivo: string;
  tamanoArchivo: number;
}

interface CapituloStats {
  totalCapitulos: number;
  capitulosCompletados: number;
  capitulosEnProgreso: number;
  tiempoTotalMinutos: number;
  puntuacionPromedio: number;
  conTranscript: number;
  conNotas: number;
}

// Interfaces para el agente TwinCurso
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  loading?: boolean;
}

interface CourseQuestionRequest {
  Question: string;
}

const CapitulosCursoAIPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { twinId, loading: twinIdLoading } = useTwinId();
  
  const [cursoAI, setCursoAI] = useState<CursoAI | null>(null);
  const [capitulos, setCapitulos] = useState<CapituloAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el agente TwinCurso - Sidebar Mode
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy TwinCurso, tu asistente de IA para este curso. Puedo ayudarte con preguntas sobre el contenido, conceptos, ejercicios y cualquier duda que tengas. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const stats: CapituloStats = {
    totalCapitulos: capitulos.length,
    capitulosCompletados: capitulos.filter(c => c.completado).length,
    capitulosEnProgreso: capitulos.filter(c => !c.completado).length,
    tiempoTotalMinutos: capitulos.reduce((total, c) => total + (c.duracionMinutos || 0), 0),
    puntuacionPromedio: capitulos.length > 0 
      ? capitulos.filter(c => c.puntuacion > 0).reduce((sum, c) => sum + c.puntuacion, 0) / capitulos.filter(c => c.puntuacion > 0).length
      : 0,
    conTranscript: capitulos.filter(c => c.transcript && c.transcript.trim().length > 0).length,
    conNotas: capitulos.filter(c => c.notas && c.notas.trim().length > 0).length
  };

  // Cargar CursoAI y capítulos desde el backend
  useEffect(() => {
    const cargarCursoAIYCapitulos = async () => {
      if (!cursoId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);
        setError(null);
        
        // Verificar si se pasaron datos por estado desde la navegación
        const estadoNavegacion = location.state as { cursoAI?: CursoAI, esAI?: boolean };
        
        if (estadoNavegacion && estadoNavegacion.esAI && estadoNavegacion.cursoAI) {
          // Usar datos que ya se cargaron, no hacer nueva llamada
          console.log('🔄 Usando datos de CursoAI pasados por navegación');
          const cursoData = estadoNavegacion.cursoAI;
          
          // Asegurar que cada capítulo tenga un ID válido
          console.log('🔍 Datos originales del curso:', cursoData);
          console.log('📚 Capítulos originales:', cursoData.capitulos);
          
            const capitulosConId = (cursoData.capitulos || []).map((cap: any, index: number) => {
              console.log(`🔍 Procesando capítulo ${index}:`, cap);
              return {
                ...cap,
                id: cap.id || `cap-${Date.now()}-${index}-${cap.numeroCapitulo || index + 1}`
              };
            });          console.log('📋 Capítulos procesados con IDs:', capitulosConId.map((c: any) => ({ 
            id: c.id, 
            titulo: c.titulo, 
            numero: c.numeroCapitulo, 
            descripcion: c.descripcion?.substring(0, 50) + '...',
            completo: c
          })));
          
          setCursoAI({ ...cursoData, capitulos: capitulosConId });
          setCapitulos(capitulosConId);
          setLoading(false);
          return;
        }
        
        console.log(`🔍 Cargando CursoAI ${cursoId} para twin ${twinId}`);
        
        // Cargar CursoAI desde el endpoint específico
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
          const cursoAIEncontrado = cursosAIResponse.cursos.find((c: CursoAI) => c.id === cursoId);
          
          if (cursoAIEncontrado) {
            // Asegurar que cada capítulo tenga un ID válido
            console.log('🔍 CursoAI encontrado:', cursoAIEncontrado);
            console.log('📚 Capítulos del backend:', cursoAIEncontrado.capitulos);
            
            const capitulosConId = (cursoAIEncontrado.capitulos || []).map((cap: any, index: number) => {
              console.log(`🔍 Procesando capítulo del backend ${index}:`, cap);
              return {
                ...cap,
                id: cap.id || `cap-${Date.now()}-${index}-${cap.numeroCapitulo || index + 1}`
              };
            });
            
            console.log('📋 Capítulos cargados desde backend con IDs:', capitulosConId.map((c: any) => ({ id: c.id, titulo: c.titulo, numero: c.numeroCapitulo })));
            
            const cursoConCapitulosId = { ...cursoAIEncontrado, capitulos: capitulosConId };
            setCursoAI(cursoConCapitulosId);
            setCapitulos(capitulosConId);
          } else {
            throw new Error('CursoAI no encontrado');
          }
        } else {
          throw new Error('Formato de respuesta inválido para CursosAI');
        }
        
      } catch (err) {
        console.error('❌ Error al cargar CursoAI y capítulos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    cargarCursoAIYCapitulos();
  }, [cursoId, twinId, twinIdLoading, location.state]);

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  // Función para convertir texto plano a HTML formateado
  const formatTextToHTML = (text: string): string => {
    if (!text) return '';
    
    return text
      // Convertir saltos de línea dobles a párrafos
      .split('\n\n')
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        
        let formattedParagraph = paragraph.trim()
          // Convertir **texto** a <strong>texto</strong>
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Convertir *texto* a <em>texto</em>
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // Convertir saltos de línea simples a <br>
          .replace(/\n/g, '<br>')
          // Convertir listas con - o * a HTML
          .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
          // Convertir números de lista 1. 2. etc. a HTML
          .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        
        // Envolver elementos de lista en <ul> o <ol>
        if (formattedParagraph.includes('<li>')) {
          // Determinar si es lista numerada o con viñetas
          if (paragraph.match(/^\d+\./m)) {
            formattedParagraph = `<ol>${formattedParagraph}</ol>`;
          } else {
            formattedParagraph = `<ul>${formattedParagraph}</ul>`;
          }
        } else {
          // Envolver párrafos normales
          formattedParagraph = `<p>${formattedParagraph}</p>`;
        }
        
        return formattedParagraph;
      })
      .filter(p => p)
      .join('');
  };

  // Función para enviar pregunta al agente TwinCurso
  const sendMessageToTwinCurso = async (question: string) => {
    if (!question.trim() || !twinId || !cursoId) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: question,
      isUser: true,
      timestamp: new Date()
    };

    // Agregar mensaje de loading del agente
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const requestBody: CourseQuestionRequest = {
        Question: question
      };

      console.log('🤖 Enviando pregunta a TwinCurso:', {
        twinId,
        cursoId,
        question: question.substring(0, 100) + '...'
      });

      const response = await fetch(`/api/twins/${twinId}/cursos/${cursoId}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('🤖 Respuesta completa de TwinCurso:', responseData);

      // Extraer la respuesta del AI desde la estructura del backend
      let aiAnswer = responseData.success && responseData.answer 
        ? responseData.answer 
        : 'Lo siento, no pude procesar tu pregunta correctamente.';

      // Convertir texto plano a HTML mejorado
      aiAnswer = formatTextToHTML(aiAnswer);

      // Reemplazar mensaje de loading con la respuesta
      setMessages(prev => prev.map(msg => 
        msg.loading ? {
          ...msg,
          content: aiAnswer,
          loading: false
        } : msg
      ));

    } catch (error) {
      console.error('❌ Error al comunicarse con TwinCurso:', error);
      
      // Reemplazar mensaje de loading con error
      setMessages(prev => prev.map(msg => 
        msg.loading ? {
          ...msg,
          content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta nuevamente.',
          loading: false
        } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // Función para manejar envío de mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !isTyping) {
      sendMessageToTwinCurso(currentMessage);
    }
  };

  // Función para limpiar la conversación
  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content: '¡Hola! Soy TwinCurso, tu asistente de IA para este curso. Puedo ayudarte con preguntas sobre el contenido, conceptos, ejercicios y cualquier duda que tengas. ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setCurrentMessage('');
    console.log('🗑️ Conversación con TwinCurso limpiada');
  };

  const renderRating = (puntuacion?: number) => {
    if (!puntuacion || puntuacion === 0) return <span className="text-gray-400">Sin calificar</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < puntuacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm ml-1">({puntuacion}/5)</span>
      </div>
    );
  };

  if (loading || twinIdLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Cargando capítulos del CursoAI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => navigate('/mi-conocimiento/cursos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
        </div>
      </div>
    );
  }

  if (!cursoAI) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 mb-4">CursoAI no encontrado</div>
          <Button onClick={() => navigate('/mi-conocimiento/cursos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header con información del CursoAI */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8" />
              <h1 className="text-2xl font-bold">{cursoAI.nombreClase}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-purple-100 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Instructor: {cursoAI.instructor || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Plataforma: {cursoAI.plataforma || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Duración: {cursoAI.duracion || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>Idioma: {cursoAI.idioma || 'No especificado'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón para toggle del sidebar del agente */}
            <Button
              onClick={() => setChatVisible(!chatVisible)}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-600 flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">TwinCurso AI</span>
              {chatVisible ? <X className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="text-white border-white hover:bg-white hover:text-purple-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Información adicional del curso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {cursoAI.categoria && (
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Tag className="h-4 w-4" />
              <span>Categoría: {cursoAI.categoria}</span>
            </div>
          )}
          {cursoAI.precio && (
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Precio: {cursoAI.precio}</span>
            </div>
          )}
          {cursoAI.fechaInicio && (
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Inicio: {cursoAI.fechaInicio}</span>
            </div>
          )}
        </div>
      </div>

      {/* Layout principal con dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna principal - Capítulos */}
        <div className={`${chatVisible ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.totalCapitulos}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.capitulosCompletados}</div>
                <div className="text-sm text-gray-600">Completados</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.capitulosEnProgreso}</div>
                <div className="text-sm text-gray-600">En progreso</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{formatearTiempo(stats.tiempoTotalMinutos)}</div>
                <div className="text-sm text-gray-600">Duración total</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.puntuacionPromedio.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Puntuación</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-indigo-600">{stats.conTranscript}</div>
                <div className="text-sm text-gray-600">Con transcript</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-600">{stats.conNotas}</div>
                <div className="text-sm text-gray-600">Con notas</div>
              </CardContent>
            </Card>
          </div>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCapitulos}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.capitulosCompletados}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.capitulosEnProgreso}</div>
            <div className="text-sm text-gray-600">En progreso</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatearTiempo(stats.tiempoTotalMinutos)}</div>
            <div className="text-sm text-gray-600">Duración total</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.puntuacionPromedio.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Puntuación</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.conTranscript}</div>
            <div className="text-sm text-gray-600">Con transcript</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-teal-600">{stats.conNotas}</div>
            <div className="text-sm text-gray-600">Con notas</div>
          </CardContent>
        </Card>
      </div>

          {/* Lista de capítulos */}
          {capitulos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin capítulos disponibles</h3>
                <p className="text-gray-500">Este CursoAI aún no tiene capítulos definidos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Capítulos ({capitulos.length})
                </h2>
              </div>

              {capitulos.map((capitulo) => (
                <Card key={capitulo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                            {capitulo.numeroCapitulo}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{capitulo.titulo || `Capítulo ${capitulo.numeroCapitulo}`}</CardTitle>
                            {capitulo.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{capitulo.descripcion}</p>
                            )}
                          </div>
                        </div>
                        {capitulo.completado && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                          onClick={() => navigate(`/mi-conocimiento/cursosAI/${cursoId}/capitulos/${capitulo.id}/detalles`, {
                            state: { 
                              capitulo, 
                              cursoTitulo: cursoAI.nombreClase, 
                              esAI: true 
                            }
                          })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{capitulo.duracionMinutos ? `${capitulo.duracionMinutos}min` : 'Sin especificar'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {renderRating(capitulo.puntuacion)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>
                          {capitulo.transcript && capitulo.transcript.trim().length > 0 ? 'Con transcript' : 'Sin transcript'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookMarked className="w-4 h-4 text-green-600" />
                        <span>
                          {capitulo.notas && capitulo.notas.trim().length > 0 ? 'Con notas' : 'Sin notas'}
                        </span>
                      </div>
                    </div>

                    {capitulo.tags && capitulo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {capitulo.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {capitulo.resumenEjecutivo && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Resumen Ejecutivo:</h4>
                        <p className="text-sm text-purple-600">{capitulo.resumenEjecutivo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar del Agente TwinCurso */}
        {chatVisible && (
          <div className="lg:col-span-4">
            <Card className="h-[calc(100vh-300px)] flex flex-col">
              {/* Header del sidebar */}
              <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">TwinCurso</CardTitle>
                      <p className="text-sm text-purple-200">Asistente de IA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearConversation}
                      className="text-white hover:bg-purple-500 w-8 h-8 p-0"
                      title="Limpiar conversación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatVisible(false)}
                      className="text-white hover:bg-purple-500 w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Área de mensajes */}
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {message.loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Procesando tu pregunta...</span>
                        </div>
                      ) : (
                        <div>
                          {message.isUser ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div 
                              className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800"
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                          )}
                          <p className={`text-xs mt-2 opacity-70 ${
                            message.isUser ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Input de mensaje */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Pregúntame sobre el curso..."
                    disabled={isTyping}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Pregunta sobre conceptos, ejercicios o dudas del curso
                    </div>
                    <Button
                      type="submit"
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapitulosCursoAIPage;