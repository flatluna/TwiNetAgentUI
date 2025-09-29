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
  Languages,
  
  Eye,
  Edit,
  
  Send,
  X,
  Trash2,
  Circle,
  Minimize2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTwinId } from '../../hooks/useTwinId';

interface CursoAI {
  id: string;
  nombreClase: string;
  instructor?: string;
  plataforma?: string;
  duracion?: string;
  idioma?: string;
  categoria?: string;
  precio?: string;
  fechaInicio?: string;
  descripcion?: string;
  twinId: string;
}

interface CapituloAI {
  id: string;
  nombreCapitulo: string;
  descripcion?: string;
  estado: 'no-empezado' | 'en-progreso' | 'terminado';
  puntuacion?: number;
  tiempoEnMinutos?: number;
  fechaCreacion?: string;
  fechaUltimaActividad?: string;
  recursos?: RecursoCapitulo[];
}

interface RecursoCapitulo {
  id: string;
  nombre: string;
  tipo: 'video' | 'lectura' | 'ejercicio' | 'quiz' | 'descarga';
  url?: string;
  duracionMinutos?: number;
}

interface Estadisticas {
  totalCapitulos: number;
  capitulosCompletados: number;
  capitulosEnProgreso: number;
  tiempoTotalMinutos: number;
  puntuacionPromedio: number;
}

interface CourseQuestionRequest {
  question: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CapitulosCursoAIPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  const location = useLocation();
  // Accept either `curso` (legacy) or `cursoAI` passed in navigation state
  const passedCurso = ((location.state as any)?.curso || (location.state as any)?.cursoAI) as CursoAI | undefined;

  const [cursoAI, setCursoAI] = useState<CursoAI | null>(null);
  const [capitulos, setCapitulos] = useState<CapituloAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el agente TwinCurso - Floating Mode
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy tu asistente TwinCurso AI. Puedo ayudarte con cualquier pregunta sobre este curso. ¿En qué puedo asistirte?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const obtenerDatosCurso = async () => {
      if (!cursoId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);

        // Si el curso fue pasado por navegación, úsalo directamente
        if (passedCurso && passedCurso.id === cursoId) {
          setCursoAI(passedCurso);

          // Si el curso pasado ya contiene capítulos, úsalos y evita llamar al backend
          if (Array.isArray((passedCurso as any).capitulos) && (passedCurso as any).capitulos.length > 0) {
            setCapitulos((passedCurso as any).capitulos);
            setLoading(false);
            return;
          }
        } else {
          // Fallback: obtener detalles del curso desde el backend
          const cursosResponse = await fetch(`/api/twins/${twinId}/cursos`);
          if (!cursosResponse.ok) throw new Error('Error al cargar cursos');
          const cursosData = await cursosResponse.json();

          const cursoEncontrado = cursosData.cursos.find((c: CursoAI) => c.id === cursoId);
          if (cursoEncontrado) {
            setCursoAI(cursoEncontrado);
          }
        }

        // Obtener capítulos (ruta relativa) sólo si no vinieron en el objeto pasado
        const capitulosResponse = await fetch(`/api/twins/${twinId}/cursos/${cursoId}/capitulos`);
        if (!capitulosResponse.ok) throw new Error('Error al cargar capítulos');
        const capitulosData = await capitulosResponse.json();

        if (capitulosData.capitulos) {
          setCapitulos(capitulosData.capitulos);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('Error al cargar los datos del curso');
      } finally {
        setLoading(false);
      }
    };

    obtenerDatosCurso();
  }, [cursoId, twinId, twinIdLoading, passedCurso]);

  const stats: Estadisticas = {
    totalCapitulos: capitulos.length,
    capitulosCompletados: capitulos.filter(cap => cap.estado === 'terminado').length,
    capitulosEnProgreso: capitulos.filter(cap => cap.estado === 'en-progreso').length,
    tiempoTotalMinutos: capitulos.reduce((total, cap) => total + (cap.tiempoEnMinutos || 0), 0),
    puntuacionPromedio: capitulos.filter(cap => cap.puntuacion).reduce((acc, cap, _, arr) => acc + (cap.puntuacion || 0) / arr.length, 0) || 0
  };

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  const formatTextToHTML = (text: string): string => {
    if (!text) return '';
    
    return text
      .split('\n\n')
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        
        // Procesar listas
        if (paragraph.includes('- ') || paragraph.includes('* ')) {
          const listItems = paragraph.split('\n')
            .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
            .map(line => line.replace(/^[\s-*]+/, '').trim())
            .map(item => `<li>${item}</li>`)
            .join('');
          return `<ul class="list-disc ml-4 mb-2">${listItems}</ul>`;
        }
        
        // Procesar texto normal con formato
        let formattedParagraph = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return `<p class="mb-2">${formattedParagraph}</p>`;
      })
      .filter(paragraph => paragraph !== '')
      .join('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = currentMessage.trim();
    if (!question.trim() || !twinId || !cursoId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:5173/api/twins/${twinId}/cursos/${cursoId}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question } as CourseQuestionRequest),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'Lo siento, no pude procesar tu pregunta.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: '¡Hola! Soy tu asistente TwinCurso AI. Puedo ayudarte con cualquier pregunta sobre este curso. ¿En qué puedo asistirte?',
        timestamp: new Date()
      }
    ]);
  };

  const renderPuntuacion = (puntuacion?: number) => {
    if (!puntuacion || puntuacion === 0) return <span className="text-gray-400">Sin calificar</span>;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < puntuacion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({puntuacion}/5)</span>
      </div>
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'terminado': return 'bg-green-100 text-green-800';
      case 'en-progreso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'terminado': return 'Completado';
      case 'en-progreso': return 'En progreso';
      default: return 'No iniciado';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !cursoAI) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el curso</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
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

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
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
      </div>

      {/* Lista de capítulos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Capítulos del Curso ({capitulos.length})
        </h2>

        {capitulos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay capítulos disponibles</h3>
              <p className="text-gray-500">Este curso aún no tiene capítulos registrados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {capitulos.map((capitulo) => (
              <Card key={capitulo.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0">
                          {capitulo.estado === 'terminado' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : capitulo.estado === 'en-progreso' ? (
                            <Play className="h-5 w-5 text-orange-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{capitulo.nombreCapitulo}</h3>
                        <Badge className={`${getEstadoColor(capitulo.estado)} text-xs`}>
                          {getEstadoTexto(capitulo.estado)}
                        </Badge>
                      </div>

                      {capitulo.descripcion && (
                        <p className="text-gray-600 mb-3 ml-8">{capitulo.descripcion}</p>
                      )}

                      <div className="flex items-center gap-6 ml-8 text-sm text-gray-500">
                        {capitulo.tiempoEnMinutos && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatearTiempo(capitulo.tiempoEnMinutos)}</span>
                          </div>
                        )}
                        {capitulo.fechaUltimaActividad && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Última actividad: {new Date(capitulo.fechaUltimaActividad).toLocaleDateString()}</span>
                          </div>
                        )}
                        {capitulo.recursos && capitulo.recursos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{capitulo.recursos.length} recursos</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {renderPuntuacion(capitulo.puntuacion)}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante del agente TwinCurso */}
      {!chatVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setChatVisible(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Brain className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}

      {/* Chat modal del agente TwinCurso */}
      {chatVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
            {/* Header del chat */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">TwinCurso AI</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatMinimized(!chatMinimized)}
                  className="text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatVisible(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            {!chatMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.type === 'user' ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div 
                            className="text-sm"
                            dangerouslySetInnerHTML={{ 
                              __html: formatTextToHTML(message.content) 
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          TwinCurso está escribiendo...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapitulosCursoAIPage;