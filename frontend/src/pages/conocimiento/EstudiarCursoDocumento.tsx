import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Award, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Users, 
  Globe,
  Brain,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  Star,
  Trophy,
  Timer,
  Tag,
  MessageCircle,
  X
} from 'lucide-react';
import { obtenerCursosAIDelBackend } from '@/services/courseService';
import { useTwinId } from '@/hooks/useTwinId';
import TwinDiaryAgentMaximizable from '@/components/TwinDiaryAgentMaximizable';

// Interfaces
interface CapituloCursoAI {
  Titulo: string;
  Descripcion: string;
  NumeroCapitulo: number;
  TotalTokens: number;
  transcript: string;
  duracionMinutos: number;
  resumenEjecutivo: string;
  tags: string[];
  ejemplos: Array<{
    titulo: string;
    descripcion: string;
    aplicacion: string;
  }>;
  quiz: Array<{
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: string;
    explicacion: string;
  }>;
  explicacionProfesorHTML: string;
  explicacionProfesorTexto: string;
  notas: string;
  comentarios: string;
  puntuacion: number;
  completado: boolean;
}

interface CursoAI {
  id: string;
  nombre: string;
  nombreClase: string;
  descripcion: string;
  instructor: string;
  categoria: string;
  duracion: string;
  idioma: string;
  capitulos: CapituloCursoAI[];
  objetivosdeAprendizaje: string;
  loQueAprendere: string;
  habilidadesCompetencias: string;
  prerequisitos: string;
  recursos: string;
  etiquetas: string;
  precio: string;
  numeroPaginas: number;
  fechaCreacion: string;
  htmlDetails: string;
  textoDetails: string;
  notasPersonales: string;
}

// Helper function to safely render HTML content
const sanitizeAndRenderHTML = (htmlContent: string) => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div'],
    ALLOWED_ATTR: ['class', 'style']
  });
};

// Helper function to extract plain text from HTML content
const extractPlainText = (htmlContent: string) => {
  if (!htmlContent) return '';
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
    const plainText = tempDiv.textContent || tempDiv.innerText || htmlContent;
    return plainText;
  } catch (error) {
    console.error('Error extracting plain text:', error);
    return htmlContent || '';
  }
};

const EstudiarCursoDocumento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { twinId } = useTwinId();
  
  const [curso, setCurso] = useState<CursoAI | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: string}>({});
  const [showQuizResults, setShowQuizResults] = useState<{[key: string]: boolean}>({});
  const [isTwinModalOpen, setIsTwinModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  useEffect(() => {
    const loadCurso = async () => {
      if (!twinId || !id) return;
      
      try {
        setLoading(true);
        console.log('🔍 Cargando curso AI para estudio:', { twinId, id });
        
        const response = await obtenerCursosAIDelBackend(twinId);
        console.log('✅ Respuesta de cursos AI:', response);
        
        if (response.success && response.cursos) {
          const cursoEncontrado = response.cursos.find((c: any) => c.id === id);
          if (cursoEncontrado) {
            console.log('✅ Curso encontrado:', cursoEncontrado);
            setCurso(cursoEncontrado);
            
            // Inicializar capítulos completados desde localStorage
            const savedProgress = localStorage.getItem(`curso-${id}-progress`);
            if (savedProgress) {
              setCompletedChapters(JSON.parse(savedProgress));
            }
          } else {
            console.error('❌ Curso no encontrado con ID:', id);
          }
        }
      } catch (error) {
        console.error('❌ Error cargando curso:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurso();
  }, [twinId, id]);

  const markChapterCompleted = (chapterIndex: number) => {
    const newCompleted = [...completedChapters];
    if (!newCompleted.includes(chapterIndex)) {
      newCompleted.push(chapterIndex);
      setCompletedChapters(newCompleted);
      localStorage.setItem(`curso-${id}-progress`, JSON.stringify(newCompleted));
    }
  };

  const calculateProgress = () => {
    if (!curso?.capitulos) return 0;
    return Math.round((completedChapters.length / curso.capitulos.length) * 100);
  };

  const handleQuizAnswer = (questionIndex: number, selectedAnswer: string) => {
    const questionKey = `${currentChapterIndex}-${questionIndex}`;
    setQuizAnswers(prev => ({
      ...prev,
      [questionKey]: selectedAnswer
    }));
  };

  const showQuizResult = (questionIndex: number) => {
    const questionKey = `${currentChapterIndex}-${questionIndex}`;
    setShowQuizResults(prev => ({
      ...prev,
      [questionKey]: true
    }));
  };

  const resetQuizForChapter = () => {
    const chapterKeys = Object.keys(quizAnswers).filter(key => key.startsWith(`${currentChapterIndex}-`));
    const newAnswers = { ...quizAnswers };
    const newResults = { ...showQuizResults };
    
    chapterKeys.forEach(key => {
      delete newAnswers[key];
      delete newResults[key];
    });
    
    setQuizAnswers(newAnswers);
    setShowQuizResults(newResults);
  };

  const startChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setActiveTab('study');
    resetQuizForChapter(); // Reset quiz when starting a new chapter
  };

  const nextChapter = () => {
    if (curso && currentChapterIndex < curso.capitulos.length - 1) {
      markChapterCompleted(currentChapterIndex);
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center p-8">
          <CardContent>
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Curso no encontrado</h3>
            <p className="text-gray-600 mb-4">No se pudo cargar el curso solicitado.</p>
            <Button onClick={() => navigate('/mi-conocimiento/cursos/documento')}>
              Volver a Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapter = curso.capitulos[currentChapterIndex];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header del Curso */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/mi-conocimiento/cursos/documento')}>
            Cursos AI
          </Button>
          <ArrowRight className="w-4 h-4" />
          <span>Estudiar Curso</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(curso.nombreClase) }} />
            <div className="text-lg text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(curso.descripcion) }} />
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {curso.instructor}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {curso.duracion}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {curso.idioma}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {curso.capitulos?.length || 0} capítulos
              </div>
            </div>
          </div>
          
          <div className="lg:w-80">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progreso del Curso</span>
                <span className="text-sm text-gray-600">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="mb-3" />
              <div className="text-xs text-gray-600">
                {completedChapters.length} de {curso.capitulos?.length || 0} capítulos completados
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Descripción
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Capítulos
          </TabsTrigger>
          <TabsTrigger value="study" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Estudiar
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Progreso
          </TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Información del Curso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Información del Curso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Lo que aprenderás:</h4>
                    <p className="text-gray-600">{curso.loQueAprendere}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Objetivos de Aprendizaje:</h4>
                    <p className="text-gray-600">{curso.objetivosdeAprendizaje}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Habilidades y Competencias:</h4>
                    <p className="text-gray-600">{curso.habilidadesCompetencias}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Prerequisitos y Recursos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Requisitos y Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Prerequisitos:</h4>
                    <p className="text-gray-600">{curso.prerequisitos}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Recursos Incluidos:</h4>
                    <p className="text-gray-600">{curso.recursos}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar con Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categoría</span>
                    <Badge variant="secondary">{curso.categoria}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Páginas</span>
                    <span className="font-semibold">{curso.numeroPaginas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio</span>
                    <span className="font-semibold text-green-600">{curso.precio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fecha Creación</span>
                    <span className="text-sm">{new Date(curso.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Etiquetas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Etiquetas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {curso.etiquetas.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Acción rápida */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-blue-800 mb-2">¿Listo para empezar?</h4>
                  <Button 
                    onClick={() => setActiveTab('chapters')} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Ver Capítulos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Chapters */}
        <TabsContent value="chapters" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Capítulos del Curso</h2>
              <Badge variant="secondary" className="text-sm">
                {curso.capitulos?.length || 0} capítulos
              </Badge>
            </div>

            <div className="grid gap-4">
              {(curso.capitulos || []).map((capitulo, index) => (
                <Card 
                  key={index} 
                  className={`transition-all hover:shadow-md ${
                    completedChapters.includes(index) ? 'border-green-200 bg-green-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {completedChapters.includes(index) ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">
                            Capítulo {index + 1}: <span dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(capitulo.Titulo) }} />
                          </h3>
                        </div>
                        
                        <div className="text-gray-600 mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(capitulo.Descripcion) }} />
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {capitulo.duracionMinutos} min
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {capitulo.TotalTokens} tokens
                          </div>
                          {capitulo.quiz && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {capitulo.quiz.length} preguntas
                            </div>
                          )}
                          {capitulo.puntuacion && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {capitulo.puntuacion}/5
                            </div>
                          )}
                        </div>

                        {/* Tags del capítulo */}
                        {capitulo.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {capitulo.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          onClick={() => startChapter(index)}
                          size="sm"
                          className={completedChapters.includes(index) ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {completedChapters.includes(index) ? 'Revisar' : 'Estudiar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Study */}
        <TabsContent value="study" className="mt-6">
          {currentChapter ? (
            <div className="space-y-6">
              {/* Header del Capítulo */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-800 mb-1">
                        Capítulo {currentChapterIndex + 1}: <span dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(currentChapter.titulo) }} />
                      </h2>
                      <div className="text-blue-600" dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(currentChapter.descripcion) }} />
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {currentChapter.duracionMinutos} min
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {currentChapter.duracionMinutos} minutos
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {currentChapter.totalTokens} tokens
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {currentChapter.puntuacion}/5
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Contenido Principal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Contenido del Capítulo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Resumen Ejecutivo:</h4>
                        <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(currentChapter.resumenEjecutivo) }} />
                      </div>
                      
                      {/* Botón para ver el transcript original */}
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => setIsTranscriptModalOpen(true)}
                        >
                          <FileText className="w-4 h-4" />
                          Ver Texto Original Completo
                        </Button>

                        <Dialog open={isTranscriptModalOpen} onOpenChange={setIsTranscriptModalOpen}>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                            <DialogHeader className="relative">
                              <DialogTitle className="flex items-center gap-2 pr-8">
                                <FileText className="w-5 h-5" />
                                Texto Original - Capítulo {currentChapterIndex + 1}: <span dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(currentChapter.titulo) }} />
                              </DialogTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-8 w-8 p-0"
                                onClick={() => setIsTranscriptModalOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogHeader>
                            <div className="overflow-y-auto max-h-[60vh] p-4 bg-gray-50 rounded-lg">
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                                {currentChapter.transcript}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Explicación del Profesor */}
                  {currentChapter.explicacionProfesorHTML && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-600" />
                          Explicación del Profesor
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: currentChapter.explicacionProfesorHTML }}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Ejemplos */}
                  {currentChapter.ejemplos && currentChapter.ejemplos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          Ejemplos Prácticos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {currentChapter.ejemplos.map((ejemplo, index) => (
                          <div key={index} className="border-l-4 border-yellow-400 pl-4">
                            <h4 className="font-semibold text-gray-800 mb-2">{ejemplo.titulo}</h4>
                            <p className="text-gray-600 mb-2">{ejemplo.descripcion}</p>
                            <p className="text-sm text-gray-500 italic">{ejemplo.aplicacion}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quiz Interactivo */}
                  {currentChapter.quiz && currentChapter.quiz.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Evaluación del Capítulo ({currentChapter.quiz.length} preguntas)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {currentChapter.quiz.map((pregunta, questionIndex) => {
                          const questionKey = `${currentChapterIndex}-${questionIndex}`;
                          const selectedAnswer = quizAnswers[questionKey];
                          const showResult = showQuizResults[questionKey];
                          const isCorrect = selectedAnswer === pregunta.respuestaCorrecta;
                          
                          return (
                            <div key={questionIndex} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                              <div className="flex items-start justify-between mb-4">
                                <h4 className="font-semibold text-gray-800 text-lg">
                                  Pregunta {questionIndex + 1}: {pregunta.pregunta}
                                </h4>
                                {showResult && (
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-3 mb-4">
                                {pregunta.opciones.map((opcion, opIndex) => {
                                  const optionLetter = opcion.charAt(0); // A), B), C), D)
                                  const isSelected = selectedAnswer === optionLetter;
                                  const isCorrectOption = optionLetter === pregunta.respuestaCorrecta;
                                  
                                  let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                                  
                                  if (showResult) {
                                    if (isCorrectOption) {
                                      buttonClass += "bg-green-100 border-green-400 text-green-800";
                                    } else if (isSelected && !isCorrectOption) {
                                      buttonClass += "bg-red-100 border-red-400 text-red-800";
                                    } else {
                                      buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                                    }
                                  } else {
                                    if (isSelected) {
                                      buttonClass += "bg-blue-100 border-blue-400 text-blue-800 shadow-md";
                                    } else {
                                      buttonClass += "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700";
                                    }
                                  }
                                  
                                  return (
                                    <button
                                      key={opIndex}
                                      onClick={() => !showResult && handleQuizAnswer(questionIndex, optionLetter)}
                                      disabled={showResult}
                                      className={buttonClass}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                                          showResult && isCorrectOption 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : showResult && isSelected && !isCorrectOption
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : isSelected 
                                            ? 'bg-blue-500 border-blue-500 text-white' 
                                            : 'border-gray-400 text-gray-600'
                                        }`}>
                                          {optionLetter.replace(')', '')}
                                        </div>
                                        <span className="flex-1">{opcion.substring(3)}</span>
                                        {showResult && isCorrectOption && (
                                          <div className="text-green-600">✓</div>
                                        )}
                                        {showResult && isSelected && !isCorrectOption && (
                                          <div className="text-red-600">✗</div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {!showResult && selectedAnswer && (
                                <div className="flex justify-center">
                                  <Button 
                                    onClick={() => showQuizResult(questionIndex)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                                  >
                                    Verificar Respuesta
                                  </Button>
                                </div>
                              )}
                              
                              {showResult && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
                                    <div>
                                      <strong className="text-blue-800">Explicación:</strong>
                                      <p className="text-blue-700 mt-1">{pregunta.explicacion}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Resumen del Quiz */}
                        {currentChapter.quiz.every((_, index) => showQuizResults[`${currentChapterIndex}-${index}`]) && (
                          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                            <h5 className="text-lg font-semibold text-blue-800 mb-3">📊 Resultado del Quiz</h5>
                            {(() => {
                              const totalQuestions = currentChapter.quiz.length;
                              const correctAnswers = currentChapter.quiz.filter((pregunta, index) => 
                                quizAnswers[`${currentChapterIndex}-${index}`] === pregunta.respuestaCorrecta
                              ).length;
                              const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                              
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-700">Respuestas Correctas:</span>
                                    <span className="font-bold text-blue-800">{correctAnswers} de {totalQuestions}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-700">Puntuación:</span>
                                    <span className={`font-bold text-lg ${
                                      percentage >= 80 ? 'text-green-600' : 
                                      percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {percentage}%
                                    </span>
                                  </div>
                                  <Progress value={percentage} className="mt-2" />
                                  <div className={`text-sm mt-2 ${
                                    percentage >= 80 ? 'text-green-700' : 
                                    percentage >= 60 ? 'text-yellow-700' : 'text-red-700'
                                  }`}>
                                    {percentage >= 80 ? '🎉 ¡Excelente trabajo!' : 
                                     percentage >= 60 ? '👍 Buen trabajo, pero puedes mejorar' : 
                                     '📚 Te recomendamos revisar el contenido nuevamente'}
                                  </div>
                                  <div className="flex gap-2 mt-4">
                                    <Button 
                                      onClick={resetQuizForChapter}
                                      variant="outline"
                                      size="sm"
                                    >
                                      🔄 Reintentar Quiz
                                    </Button>
                                    {percentage >= 70 && (
                                      <Button 
                                        onClick={() => markChapterCompleted(currentChapterIndex)}
                                        className="bg-green-600 hover:bg-green-700"
                                        size="sm"
                                      >
                                        ✅ Marcar Capítulo Completado
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Navegación */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Navegación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={prevChapter} 
                        disabled={currentChapterIndex === 0}
                        variant="outline"
                        className="w-full"
                      >
                        ← Capítulo Anterior
                      </Button>
                      
                      <Button 
                        onClick={() => markChapterCompleted(currentChapterIndex)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar Completado
                      </Button>
                      
                      <Button 
                        onClick={nextChapter} 
                        disabled={currentChapterIndex === (curso.capitulos?.length || 0) - 1}
                        className="w-full"
                      >
                        Siguiente Capítulo →
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Notas del Capítulo */}
                  {(currentChapter.notas || currentChapter.comentarios) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Notas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentChapter.notas && (
                          <div>
                            <p className="text-sm text-gray-600">{currentChapter.notas}</p>
                          </div>
                        )}
                        {currentChapter.comentarios && (
                          <div>
                            <h5 className="font-medium text-gray-800 mb-1">Comentarios:</h5>
                            <p className="text-sm text-gray-600">{currentChapter.comentarios}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Tags del Capítulo */}
                  {currentChapter.tags && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Temas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {currentChapter.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Twin Cursos Agent */}
                  <Card className="hidden xl:block bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Twin Cursos
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Pregunta al agente inteligente sobre este curso y capítulo
                      </p>
                    </CardHeader>
                    <CardContent>
                      {curso && currentChapter && (
                        <TwinDiaryAgentMaximizable 
                          cursoId={curso.id} 
                          courseName={curso.nombreClase || 'Curso'}
                          capituloId={currentChapter.numeroCapitulo.toString()}
                          capituloTitulo={currentChapter.titulo || `Capítulo ${currentChapter.numeroCapitulo}`}
                          capituloTranscript={currentChapter.transcript || ''}
                          twinId={twinId!}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Selecciona un Capítulo</h3>
                <p className="text-gray-600 mb-4">Ve a la sección de Capítulos para comenzar a estudiar.</p>
                <Button onClick={() => setActiveTab('chapters')}>
                  Ver Capítulos
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Progress */}
        <TabsContent value="progress" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{calculateProgress()}%</div>
                  <div className="text-sm text-gray-600">Progreso Total</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{completedChapters.length}</div>
                  <div className="text-sm text-gray-600">Capítulos Completados</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{(curso.capitulos?.length || 0) - completedChapters.length}</div>
                  <div className="text-sm text-gray-600">Capítulos Restantes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {curso.capitulos?.reduce((total, cap) => total + (cap.duracionMinutos || 0), 0) || 0} min
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Progreso detallado por capítulo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Progreso Detallado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(curso.capitulos || []).map((capitulo, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      {completedChapters.includes(index) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          Capítulo {index + 1}: {capitulo.titulo}
                        </div>
                        <div className="text-sm text-gray-600">
                          {capitulo.duracionMinutos} minutos • {capitulo.totalTokens} tokens
                        </div>
                      </div>
                      
                      <Badge variant={completedChapters.includes(index) ? "default" : "secondary"}>
                        {completedChapters.includes(index) ? "Completado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-blue-700">
                  {calculateProgress() === 0 && (
                    <p>• Comienza por el primer capítulo para establecer las bases.</p>
                  )}
                  {calculateProgress() > 0 && calculateProgress() < 50 && (
                    <p>• ¡Buen progreso! Continúa con el siguiente capítulo.</p>
                  )}
                  {calculateProgress() >= 50 && calculateProgress() < 100 && (
                    <p>• ¡Vas muy bien! Ya estás en la segunda mitad del curso.</p>
                  )}
                  {calculateProgress() === 100 && (
                    <p>• ¡Felicitaciones! Has completado todo el curso.</p>
                  )}
                  <p>• Revisa los capítulos completados para reforzar el aprendizaje.</p>
                  <p>• Practica con los ejemplos proporcionados en cada capítulo.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botón flotante Twin Cursos para móviles/tablets */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsTwinModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-14 h-14"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Modal de Twin Cursos para pantallas pequeñas */}
      {isTwinModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Twin Cursos</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTwinModalOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex-1 p-4 overflow-hidden">
              <p className="text-sm text-gray-600 mb-4">
                Pregunta al agente inteligente sobre este curso y capítulo específico
              </p>
              {curso && currentChapter && (
                <div className="h-full">
                  <TwinDiaryAgentMaximizable 
                    cursoId={curso.id} 
                    courseName={curso.nombreClase || 'Curso'}
                    capituloId={currentChapter.numeroCapitulo.toString()}
                    capituloTitulo={currentChapter.titulo || `Capítulo ${currentChapter.numeroCapitulo}`}
                    capituloTranscript={currentChapter.transcript || ''}
                    twinId={twinId!}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudiarCursoDocumento;