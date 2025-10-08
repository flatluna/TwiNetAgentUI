import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, ExternalLink, FileText, Play, Image, Globe, MessageCircle, X, Maximize2 } from 'lucide-react';
import TwinDiaryAgent from '@/components/TwinDiaryAgent';

// Interfaces para SearchCapitulo
interface ImagenEducativa {
  titulo?: string;
  url?: string;
  descripcion?: string;
  fuente?: string;
}

interface VideoEducativo {
  titulo?: string;
  url?: string;
  descripcion?: string;
  duracion?: string;
  plataforma?: string;
}

interface LinkUtil {
  titulo?: string;
  url?: string;
  descripcion?: string;
  tipo?: string;
}

interface DocumentoReferencia {
  titulo?: string;
  url?: string;
  tipo?: string;
  descripcion?: string;
  autor?: string;
}

interface SitioEspecializado {
  nombre?: string;
  url?: string;
  descripcion?: string;
  categoria?: string;
}

interface CursoCapituloBusqueda {
  tituloCapitulo?: string;
  imagenesEducativas?: ImagenEducativa[];
  videosEducativos?: VideoEducativo[];
  linksUtiles?: LinkUtil[];
  documentosReferencia?: DocumentoReferencia[];
  sitiosEspecializados?: SitioEspecializado[];
  palabrasClave?: string[];
  resumenRecursos?: string;
  htmlRecursos?: string;
}

interface PreguntaQuizAI { Pregunta: string; Opciones?: string[] | null; RespuestaCorrecta: string; Explicacion: string }
interface CapituloCreadoAI { 
  Titulo: string; 
  Objetivos?: string[]; 
  Contenido?: string; 
  ContenidoHTML?: string;
  Ejemplos?: string[]; 
  Resumen?: string; 
  Pagina?: number; 
  Quizes?: PreguntaQuizAI[];
  SearchCapitulo?: CursoCapituloBusqueda;
}

const VerCapituloAIDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const capFromState: CapituloCreadoAI | null = (location.state as any)?.capitulo || null;
  const cursoFromState: any = (location.state as any)?.cursoAI || (location.state as any)?.curso || null;
  // Obtener CursosInternet del curso completo
  const cursosInternet: any = cursoFromState?.cursosInternet || cursoFromState?.CursosInternet || (location.state as any)?.CursosInternet || (location.state as any)?.cursosInternet || null;

  // Try to derive capitulo from params + curso when not provided directly
  const capitulo: CapituloCreadoAI | null = useMemo(() => {
    if (capFromState) return capFromState;

    // Prefer resolving by capId if route param is provided (newer approach)
    const capId = (params as any).capId as string | undefined;
    if (cursoFromState && capId && Array.isArray(cursoFromState.Capitulos)) {
      const found = cursoFromState.Capitulos.find((c: any) => (c.id && c.id.toString() === capId.toString()) || (c.Id && c.Id.toString() === capId.toString()));
      if (found) return found as CapituloCreadoAI;
    }

    // Fallback: try numeric capIdx (legacy)
    if (cursoFromState && params.capIdx !== undefined) {
      const idx = Number(params.capIdx);
      if (!isNaN(idx) && Array.isArray(cursoFromState.Capitulos) && cursoFromState.Capitulos[idx]) {
        return cursoFromState.Capitulos[idx] as CapituloCreadoAI;
      }
    }

    return null;
  }, [capFromState, cursoFromState, params.capIdx, (params as any).capId]);

  // Unificar acceso a SearchCapitulo (puede estar con mayúscula o minúscula)
  const searchCapitulo = capitulo?.SearchCapitulo || (capitulo as any)?.searchCapitulo || null;

  // Calculate current chapter index and navigation
  const currentChapterIndex = useMemo(() => {
    if (!cursoFromState || !Array.isArray(cursoFromState.Capitulos) || !capitulo) return -1;
    return cursoFromState.Capitulos.findIndex((cap: any) => cap.Titulo === capitulo.Titulo);
  }, [cursoFromState, capitulo]);

  const totalChapters = cursoFromState?.Capitulos?.length || 0;
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex >= 0 && currentChapterIndex < totalChapters - 1;

  const navigateToChapter = (index: number) => {
    if (!cursoFromState || !cursoFromState.Capitulos || !cursoFromState.Capitulos[index]) return;
    const targetChapter = cursoFromState.Capitulos[index];
    navigate(`/mi-conocimiento/cursosAI/${cursoFromState.id}/capitulos/${index}/ai-detalle`, {
      state: {
        cursoAI: cursoFromState,
        capitulo: targetChapter,
        esAI: true,
        from: location.pathname
      }
    });
  };

  // Tab UI: contenido y recursos
  const [activeTab, setActiveTab] = useState<'contenido' | 'recursos'>('contenido');

  // Twin Cursos modal state
  const [isTwinModalOpen, setIsTwinModalOpen] = useState(false);

  // Quiz state: selected answers and results per quiz index
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, { correct: boolean; revealed: boolean }>>({});

  if (!capitulo && !cursosInternet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-3">Capítulo no encontrado</h2>
          <p className="text-gray-600 mb-6">Esta página intenta leer el capítulo desde <code>location.state.capitulo</code>. Si vienes desde la página de overview, el capítulo debería pasarse en el estado de navegación. También intento recuperar el capítulo usando la ruta (capIdx) si está disponible.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  const quizzes = capitulo?.Quizes || [];

  const handleSelect = (quizIdx: number, value: string) => {
    setSelectedAnswers(prev => ({ ...prev, [quizIdx]: value }));
  };

  const handleGrade = (quizIdx: number) => {
    const selected = selectedAnswers[quizIdx];
    if (!selected) return;
    const correctRaw = (quizzes[quizIdx]?.RespuestaCorrecta || '').toString().trim();
    const isCorrect = selected.toString().trim() === correctRaw;
    setQuizResults(prev => ({ ...prev, [quizIdx]: { correct: isCorrect, revealed: true } }));
  };

  const revealAnswer = (quizIdx: number) => {
    setQuizResults(prev => ({ ...prev, [quizIdx]: { correct: false, revealed: true } }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>Volver</Button>
          <h1 className="text-lg font-semibold">{capitulo ? capitulo.Titulo : 'Detalle del capítulo'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 rounded transition-all ${activeTab === 'contenido' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('contenido')}>Contenido</button>
          <button className={`px-3 py-1 rounded transition-all ${activeTab === 'recursos' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('recursos')}>Recursos</button>
        </div>
      </div>

      {/* Navigation buttons */}
      {currentChapterIndex >= 0 && totalChapters > 1 && (
        <div className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            {hasPrevious ? (
              <Button
                onClick={() => navigateToChapter(currentChapterIndex - 1)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            ) : (
              <Button disabled variant="outline" className="opacity-50">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Capítulo {currentChapterIndex + 1} de {totalChapters}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasNext ? (
              <Button
                onClick={() => navigateToChapter(currentChapterIndex + 1)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button disabled variant="outline" className="opacity-50">
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Layout responsivo: Desktop = 2 columnas, Mobile = 1 columna + botón flotante */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna principal - Contenido del capítulo */}
        <div className="xl:col-span-2">
          {activeTab === 'contenido' && capitulo && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{capitulo.Titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              {capitulo.Objetivos && capitulo.Objetivos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">Objetivos</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {capitulo.Objetivos.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}

              {capitulo.Resumen && (
                <div className="mb-4">
                  <h4 className="font-semibold">Resumen</h4>
                  <p className="text-sm text-gray-700">{capitulo.Resumen}</p>
                </div>
              )}

              {capitulo.ContenidoHTML && (
                <div className="mb-4">
                  <h4 className="font-semibold">Contenido</h4>
                  <div className="prose max-w-none text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: capitulo.ContenidoHTML }} />
                </div>
              )}

              {capitulo.Ejemplos && capitulo.Ejemplos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">Ejemplos</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {capitulo.Ejemplos.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quizzes del capítulo</h3>
            {quizzes.length === 0 && (
              <div className="text-sm text-gray-600">No hay quizzes definidos para este capítulo.</div>
            )}

            {quizzes.map((q, qi) => (
              <Card key={qi} className="p-4">
                <CardContent>
                  <div className="font-medium mb-2">{q.Pregunta}</div>

                  {q.Opciones && q.Opciones.length > 0 ? (
                    <div className="space-y-2">
                      {q.Opciones.map((opt, oi) => (
                        <label key={oi} className={`flex items-center gap-3 p-2 rounded border ${selectedAnswers[qi] === opt ? 'border-purple-600 bg-purple-50' : 'border-transparent'}`}>
                          <input type="radio" name={`quiz-${qi}`} value={opt} checked={selectedAnswers[qi] === opt} onChange={() => handleSelect(qi, opt)} />
                          <span className="text-sm text-gray-800">{opt}</span>
                        </label>
                      ))}

                      <div className="mt-3 flex items-center gap-2">
                        <Button onClick={() => handleGrade(qi)}>Calificar</Button>
                        <Button variant="ghost" onClick={() => { setSelectedAnswers(prev => ({ ...prev, [qi]: '' })); setQuizResults(prev => ({ ...prev, [qi]: { correct: false, revealed: false } })); }}>Reset</Button>
                      </div>

                      {quizResults[qi] && quizResults[qi].revealed && (
                        <div className={`mt-3 p-3 rounded ${quizResults[qi].correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                          {quizResults[qi].correct ? <div className="font-medium">Respuesta correcta ✅</div> : <div className="font-medium">Respuesta incorrecta ❌</div>}
                          <div className="mt-2 text-sm">{q.Explicacion}</div>
                          <div className="mt-1 text-xs text-gray-500">Respuesta esperada: {q.RespuestaCorrecta}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">(Respuesta abierta)</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button onClick={() => revealAnswer(qi)}>Mostrar respuesta</Button>
                      </div>
                      {quizResults[qi] && quizResults[qi].revealed && (
                        <div className="mt-3 p-3 rounded bg-gray-50 border border-gray-200 text-gray-800">
                          <div className="font-medium">Respuesta esperada</div>
                          <div className="mt-2 text-sm">{q.RespuestaCorrecta}</div>
                          <div className="mt-2 text-sm text-gray-600">{q.Explicacion}</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

          {activeTab === 'recursos' && (searchCapitulo || cursosInternet) && (
            <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                Recursos de aprendizaje
              </CardTitle>
              {searchCapitulo?.resumenRecursos && (
                <p className="text-gray-600 mt-2">{searchCapitulo.resumenRecursos}</p>
              )}
              {cursosInternet?.resumen && (
                <p className="text-gray-600 mt-2">{cursosInternet.resumen}</p>
              )}
            </CardHeader>
            <CardContent>
              {/* Palabras clave */}
              {searchCapitulo?.palabrasClave && searchCapitulo.palabrasClave.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Palabras clave
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchCapitulo.palabrasClave.map((palabra: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {palabra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HTML de recursos desde SearchCapitulo */}
              {searchCapitulo?.htmlRecursos && (
                <div className="mb-6">
                  <div 
                    className="prose max-w-none text-sm [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:no-underline [&_a]:font-medium [&_a]:transition-colors [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mb-3 [&_h3]:mt-4 [&_h4]:text-base [&_h4]:font-medium [&_h4]:text-gray-600 [&_h4]:mb-2 [&_h4]:mt-3" 
                    dangerouslySetInnerHTML={{ __html: searchCapitulo.htmlRecursos }} 
                  />
                </div>
              )}

              {/* HTML de recursos desde CursosInternet */}
              {cursosInternet?.htmlDetalles && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Cursos encontrados en Internet
                  </h4>
                  <div 
                    className="prose max-w-none text-sm [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:no-underline [&_a]:font-medium [&_a]:transition-colors [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mb-3 [&_h3]:mt-4 [&_h4]:text-base [&_h4]:font-medium [&_h4]:text-gray-600 [&_h4]:mb-2 [&_h4]:mt-3" 
                    dangerouslySetInnerHTML={{ __html: cursosInternet.htmlDetalles }} 
                  />
                </div>
              )}

              {/* Lista de cursos de Internet estructurada */}
              {cursosInternet?.cursosEncontrados && cursosInternet.cursosEncontrados.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    Cursos disponibles ({cursosInternet.cursosEncontrados.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cursosInternet.cursosEncontrados.map((curso: any, i: number) => (
                      <div key={i} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1">{curso.nombreClase}</h5>
                            {curso.instructor && (
                              <p className="text-xs text-gray-600 mb-1">👨‍🏫 {curso.instructor}</p>
                            )}
                            {curso.plataforma && (
                              <p className="text-xs text-gray-600 mb-1">🏫 {curso.plataforma}</p>
                            )}
                            {curso.categoria && (
                              <p className="text-xs text-gray-600 mb-1">📂 {curso.categoria}</p>
                            )}
                            {curso.duracion && (
                              <p className="text-xs text-gray-600 mb-1">⏱️ {curso.duracion}</p>
                            )}
                            {curso.precio && (
                              <p className="text-xs text-gray-600 mb-1">💰 {curso.precio}</p>
                            )}
                            {curso.idioma && (
                              <p className="text-xs text-gray-600 mb-2">🌐 {curso.idioma}</p>
                            )}
                            
                            {curso.loQueAprendere && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-700">Lo que aprenderé:</p>
                                <p className="text-xs text-gray-600">{curso.loQueAprendere}</p>
                              </div>
                            )}

                            {curso.enlaces && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {curso.enlaces.enlaceClase && (
                                  <a 
                                    href={curso.enlaces.enlaceClase} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium bg-green-100 px-2 py-1 rounded"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Ver curso
                                  </a>
                                )}
                                {curso.enlaces.enlaceInstructor && (
                                  <a 
                                    href={curso.enlaces.enlaceInstructor} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-100 px-2 py-1 rounded"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Instructor
                                  </a>
                                )}
                                {curso.enlaces.enlacePlataforma && (
                                  <a 
                                    href={curso.enlaces.enlacePlataforma} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-100 px-2 py-1 rounded"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Plataforma
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Puntos clave desde CursosInternet */}
              {cursosInternet?.puntosClaves && cursosInternet.puntosClaves.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Puntos clave
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {cursosInternet.puntosClaves.map((punto: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">{punto}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enlaces adicionales desde CursosInternet */}
              {cursosInternet?.enlaces && cursosInternet.enlaces.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-orange-600" />
                    Enlaces adicionales
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {cursosInternet.enlaces.map((enlace: string, i: number) => (
                      <a 
                        key={i}
                        href={enlace} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium p-2 bg-orange-50 rounded border hover:shadow-sm transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {enlace}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones recomendadas desde CursosInternet */}
              {cursosInternet?.accionesRecomendadas && cursosInternet.accionesRecomendadas.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Acciones recomendadas
                  </h4>
                  <ul className="list-decimal list-inside space-y-2">
                    {cursosInternet.accionesRecomendadas.map((accion: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 bg-indigo-50 p-2 rounded border-l-4 border-indigo-400">{accion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Imágenes educativas */}
          {capitulo?.SearchCapitulo?.imagenesEducativas && capitulo.SearchCapitulo.imagenesEducativas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-green-600" />
                  Imágenes educativas ({capitulo.SearchCapitulo.imagenesEducativas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capitulo.SearchCapitulo.imagenesEducativas.map((imagen, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                      {imagen.url && (
                        <img 
                          src={imagen.url} 
                          alt={imagen.titulo || `Imagen educativa ${i + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="p-3">
                        <h5 className="font-medium text-sm mb-1">{imagen.titulo || `Imagen ${i + 1}`}</h5>
                        {imagen.descripcion && (
                          <p className="text-xs text-gray-600 mb-2">{imagen.descripcion}</p>
                        )}
                        {imagen.fuente && (
                          <p className="text-xs text-gray-500">Fuente: {imagen.fuente}</p>
                        )}
                        {imagen.url && (
                          <a 
                            href={imagen.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver original
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Videos educativos */}
          {capitulo?.SearchCapitulo?.videosEducativos && capitulo.SearchCapitulo.videosEducativos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-600" />
                  Videos educativos ({capitulo.SearchCapitulo.videosEducativos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capitulo.SearchCapitulo.videosEducativos.map((video, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-pink-50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{video.titulo || `Video ${i + 1}`}</h5>
                          {video.descripcion && (
                            <p className="text-xs text-gray-600 mb-2">{video.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            {video.duracion && <span>⏱️ {video.duracion}</span>}
                            {video.plataforma && <span>📺 {video.plataforma}</span>}
                          </div>
                          {video.url && (
                            <a 
                              href={video.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ver video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links útiles */}
          {capitulo?.SearchCapitulo?.linksUtiles && capitulo.SearchCapitulo.linksUtiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  Enlaces útiles ({capitulo.SearchCapitulo.linksUtiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {capitulo.SearchCapitulo.linksUtiles.map((link, i) => (
                    <div key={i} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-blue-50">
                      <h5 className="font-medium text-sm mb-1">{link.titulo || `Enlace ${i + 1}`}</h5>
                      {link.descripcion && (
                        <p className="text-xs text-gray-600 mb-2">{link.descripcion}</p>
                      )}
                      {link.tipo && (
                        <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs mb-2">
                          {link.tipo}
                        </span>
                      )}
                      {link.url && (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visitar enlace
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos de referencia */}
          {capitulo?.SearchCapitulo?.documentosReferencia && capitulo.SearchCapitulo.documentosReferencia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Documentos de referencia ({capitulo.SearchCapitulo.documentosReferencia.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {capitulo.SearchCapitulo.documentosReferencia.map((doc, i) => (
                    <div key={i} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-orange-50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{doc.titulo || `Documento ${i + 1}`}</h5>
                          {doc.descripcion && (
                            <p className="text-xs text-gray-600 mb-2">{doc.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            {doc.tipo && <span>📄 {doc.tipo}</span>}
                            {doc.autor && <span>👤 {doc.autor}</span>}
                          </div>
                          {doc.url && (
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ver documento
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sitios especializados */}
          {capitulo?.SearchCapitulo?.sitiosEspecializados && capitulo.SearchCapitulo.sitiosEspecializados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Sitios especializados ({capitulo.SearchCapitulo.sitiosEspecializados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capitulo.SearchCapitulo.sitiosEspecializados.map((sitio, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{sitio.nombre || `Sitio ${i + 1}`}</h5>
                          {sitio.descripcion && (
                            <p className="text-xs text-gray-600 mb-2">{sitio.descripcion}</p>
                          )}
                          {sitio.categoria && (
                            <span className="inline-block px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs mb-2">
                              {sitio.categoria}
                            </span>
                          )}
                          {sitio.url && (
                            <a 
                              href={sitio.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Visitar sitio
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay recursos */}
      {activeTab === 'recursos' && !searchCapitulo && !cursosInternet && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recursos disponibles</h3>
            <p className="text-gray-600">Los recursos de búsqueda para este capítulo aún no han sido generados.</p>
          </CardContent>
        </Card>
      )}
        </div>

        {/* Columna secundaria - Twin Agent (solo visible en desktop XL) */}
        <div className="hidden xl:block xl:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Twin Cursos
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTwinModalOpen(true)}
                    className="ml-auto"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Pregunta al agente inteligente sobre este capítulo
                </p>
              </CardHeader>
              <CardContent>
                {capitulo && cursoFromState && (
                  <TwinDiaryAgent 
                    cursoId={cursoFromState.id} 
                    courseName={cursoFromState.NombreClase || cursoFromState.nombreClase || 'Curso'}
                    capituloId={(capitulo as any)?.id || (capitulo as any)?.Id || params.capIdx}
                    twinId={cursoFromState.TwinID}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Botón flotante para móviles/tablets */}
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold">Twin Cursos</h2>
                <span className="text-sm text-gray-500">
                  - {capitulo?.Titulo || 'Capítulo'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTwinModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex-1 p-4 overflow-hidden">
              <p className="text-sm text-gray-600 mb-4">
                Pregunta al agente inteligente sobre este capítulo específico
              </p>
              {capitulo && cursoFromState && (
                <div className="h-full">
                  <TwinDiaryAgent 
                    cursoId={cursoFromState.id} 
                    courseName={cursoFromState.NombreClase || cursoFromState.nombreClase || 'Curso'}
                    capituloId={(capitulo as any)?.id || (capitulo as any)?.Id || params.capIdx}
                    twinId={cursoFromState.TwinID}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CursosInternet moved to course overview page (DetallesCursoAIPage) */}
    </div>
  );
};

export default VerCapituloAIDetail;
