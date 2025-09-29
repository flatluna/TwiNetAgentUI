import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Brain, Clock, FileText, BookOpen, User, Lightbulb, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTwinId } from '@/hooks/useTwinId';

interface PreguntaQuiz { pregunta: string; opciones: string[]; respuestaCorrecta: string; explicacion: string }
interface EjemploPractico { Titulo: string; Descripcion: string; Aplicacion: string }
interface CapituloAI {
  id?: string;
  titulo?: string;
  descripcion?: string;
  duracionMinutos?: number;
  puntuacion?: number;
  resumenEjecutivo?: string;
  explicacionProfesorTexto?: string;
  explicacionProfesorHTML?: string;
  transcript?: string;
  notas?: string;
  quiz?: PreguntaQuiz[];
  ejemplos?: EjemploPractico[];
  tags?: string[];
}

const VerDetallesCapituloAIPage: React.FC = () => {
  const { cursoId, capituloId } = useParams<{ cursoId: string; capituloId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { twinId, loading: twinIdLoading } = useTwinId();

  const [capitulo, setCapitulo] = useState<CapituloAI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursoTitulo, setCursoTitulo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('resumen');
  // Quiz state
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<Record<number, string>>({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntaje, setPuntaje] = useState<number | null>(null);
  // Notes / Rich editor state
  const [notasHtml, setNotasHtml] = useState<string>(capitulo?.notas || '');
  const [editandoNotas, setEditandoNotas] = useState<boolean>(false);
  const [guardandoNotas, setGuardandoNotas] = useState<boolean>(false);

  // Safe back navigation: prefer history back, else go to the course's chapters list and preserve cursoAI in location.state, else to Cursos AI
  const handleVolver = () => {
    const state = (location.state as any) || {};
    // If caller provided an explicit `from` route (e.g. came from search/filter), prefer it
    if (state.from) {
      navigate(state.from);
      return;
    }

    // Determine a curso object to preserve when navigating back
    const passedCurso = state.cursoAI || (state as any).cursoAI || (state as any).curso || null;
    const cursoToPreserve = passedCurso && passedCurso.id ? passedCurso : null;

    if (cursoToPreserve) {
      navigate(`/mi-conocimiento/cursosAI/${cursoToPreserve.id}/capitulos`, { state: { cursoAI: cursoToPreserve } });
      return;
    }

    // If we have cursoId param, navigate there without extra fetch (no curso object available)
    if (cursoId) {
      navigate(`/mi-conocimiento/cursosAI/${cursoId}/capitulos`);
      return;
    }

    // Fallback to main Cursos AI index
    navigate('/mi-conocimiento/cursosAI');
  };

  useEffect(() => {
    const load = async () => {
      // prefer chapter passed via navigation state
      const passed = (location.state as any)?.capitulo as CapituloAI | undefined;
      const passedCurso = (location.state as any)?.cursoAI as any;
      if (passed) {
        setCapitulo(passed);
        setCursoTitulo(passedCurso?.nombreClase || passed.titulo || '');
        setLoading(false);
        return;
      }

      if (!cursoId || !capituloId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);
        // minimal fallback/mock for offline
        setCapitulo({ id: capituloId, titulo: `Capítulo ${capituloId}`, descripcion: 'Descripción no disponible' });
      } catch (err) {
        console.error(err);
        setError('Error al cargar capítulo');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cursoId, capituloId, twinId, twinIdLoading, location.state]);

  if (loading || twinIdLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>;
  if (error || !capitulo) return (
    <div className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <p className="text-red-600">{error || 'Capítulo no encontrado'}</p>
      <div className="mt-4"><Button onClick={() => navigate(-1)}>Volver</Button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg"><Brain className="h-8 w-8 text-white" /></div>
              <div>
                <h1 className="text-3xl font-bold">{capitulo.titulo}</h1>
                <p className="text-purple-200">{cursoTitulo}</p>
              </div>
            </div>
            <p className="text-lg mb-6 text-purple-100 max-w-4xl">{capitulo.descripcion}</p>
            <div className="flex gap-4 text-sm"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {capitulo.duracionMinutos ?? '-'}min</div></div>
          </div>
          <div>
            <Button variant="outline" onClick={handleVolver} className="text-white"> <ArrowLeft className="w-4 h-4 mr-2"/> Volver</Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="resumen"><FileText className="w-4 h-4"/> Resumen</TabsTrigger>
            <TabsTrigger value="explicacion"><User className="w-4 h-4"/> Explicación</TabsTrigger>
            <TabsTrigger value="transcript"><BookOpen className="w-4 h-4"/> Transcript</TabsTrigger>
            <TabsTrigger value="notas"><User className="w-4 h-4"/> Mis Notas</TabsTrigger>
            <TabsTrigger value="ejemplos"><Lightbulb className="w-4 h-4"/> Ejemplos</TabsTrigger>
            <TabsTrigger value="quiz"><HelpCircle className="w-4 h-4"/> Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Ejecutivo</CardTitle>
              </CardHeader>
              <CardContent>
                {capitulo.resumenEjecutivo ? (
                  <div className="prose whitespace-pre-wrap">{capitulo.resumenEjecutivo}</div>
                ) : (
                  <p>No hay resumen ejecutivo disponible.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explicacion">
            <Card>
              <CardHeader>
                <CardTitle>Explicación del Profesor</CardTitle>
              </CardHeader>
              <CardContent>
                {capitulo.explicacionProfesorHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: capitulo.explicacionProfesorHTML as string }} />
                ) : capitulo.explicacionProfesorTexto ? (
                  <div className="prose whitespace-pre-wrap">{capitulo.explicacionProfesorTexto}</div>
                ) : (
                  <p>No hay explicación disponible.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                {capitulo.transcript ? <div className="prose whitespace-pre-wrap">{capitulo.transcript}</div> : <p>No hay transcript disponible.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ejemplos">
            <Card>
              <CardHeader>
                <CardTitle>Ejemplos Prácticos</CardTitle>
              </CardHeader>
              <CardContent>
                {capitulo.ejemplos && capitulo.ejemplos.length > 0 ? (
                  <div className="space-y-4">{capitulo.ejemplos.map((e, i) => (
                    <div key={i} className="p-4 border rounded bg-yellow-50"><h4 className="font-semibold">{e.Titulo}</h4><p className="text-sm">{e.Descripcion}</p><p className="text-sm text-gray-600 mt-2">{e.Aplicacion}</p></div>
                  ))}</div>
                ) : (
                  <p>No hay ejemplos disponibles.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                {capitulo.quiz && capitulo.quiz.length > 0 ? (
                  <div className="space-y-4">
                    {capitulo.quiz.map((q, qi) => (
                      <div key={qi} className="p-4 border rounded">
                        <h4 className="font-semibold mb-2">{`Pregunta ${qi + 1}: ${q.pregunta}`}</h4>
                        <div className="space-y-2">
                          {q.opciones.map((o, oi) => {
                            const isSelected = respuestasSeleccionadas[qi] === o;
                            const isCorrect = o === q.respuestaCorrecta;
                            const optionClass = mostrarResultados
                              ? isCorrect
                                ? 'bg-green-50 border-green-300'
                                : isSelected
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-white border-gray-100'
                              : isSelected
                                ? 'bg-indigo-50 border-indigo-300'
                                : 'bg-white border-gray-100';

                            return (
                              <label key={oi} className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${optionClass}`}>
                                <input
                                  type="radio"
                                  name={`pregunta-${qi}`}
                                  value={o}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!mostrarResultados) {
                                      setRespuestasSeleccionadas(prev => ({ ...prev, [qi]: o }));
                                    }
                                  }}
                                  disabled={mostrarResultados}
                                  className="mr-2"
                                />
                                <span className="text-sm">{o}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        onClick={() => {
                          // grade only if all questions answered
                          const total = capitulo.quiz!.length;
                          const answered = Object.keys(respuestasSeleccionadas).length;
                          if (answered < total) {
                            // focus on remaining or just show a message — simple approach: alert
                            // keep minimal UX: set active tab to quiz and return
                            setActiveTab('quiz');
                            alert(`Debes responder las ${total} preguntas antes de calificar. Respondiste ${answered}.`);
                            return;
                          }

                          let correct = 0;
                          capitulo.quiz!.forEach((preg, idx) => {
                            if (respuestasSeleccionadas[idx] === preg.respuestaCorrecta) correct += 1;
                          });
                          setPuntaje(correct);
                          setMostrarResultados(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Calificar
                      </Button>

                      {mostrarResultados && puntaje !== null && (
                        <div className="text-sm text-gray-700">Resultado: <strong>{puntaje}</strong> de <strong>{capitulo.quiz!.length}</strong></div>
                      )}

                      {mostrarResultados && (
                        <Button variant="outline" onClick={() => { setMostrarResultados(false); setRespuestasSeleccionadas({}); setPuntaje(null); }}>
                          Reintentar
                        </Button>
                      )}
                    </div>
                    {/* Per-question explanations shown after grading */}
                    {mostrarResultados && (
                      <div className="mt-6 space-y-4">
                        {capitulo.quiz!.map((preg, idx) => {
                          const selected = respuestasSeleccionadas[idx];
                          const correct = preg.respuestaCorrecta;
                          const ok = selected === correct;
                          return (
                            <div key={idx} className="p-3 border rounded bg-gray-50">
                              <div className="text-sm mb-1 font-medium">{`Pregunta ${idx + 1}: ${preg.pregunta}`}</div>
                              <div className="text-sm">
                                <div>Tu respuesta: <strong>{selected ?? '—'}</strong></div>
                                {!ok && (
                                  <div className="text-sm text-green-700">Respuesta correcta: <strong>{correct}</strong></div>
                                )}
                                {preg.explicacion && (
                                  <div className="mt-2 text-sm text-gray-700">Explicación: {preg.explicacion}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No hay quiz disponible.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notas">
            <Card>
              <CardHeader>
                <CardTitle>Mis Notas</CardTitle>
              </CardHeader>
              <CardContent>
                {!editandoNotas ? (
                  <div>
                    {notasHtml ? (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: notasHtml }} />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Sin notas aún. Haz clic en "Editar" para agregar tus notas.</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <Button onClick={() => { setEditandoNotas(true); }} className="bg-green-600 hover:bg-green-700">Editar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => document.execCommand('bold')}>Negrita</Button>
                      <Button size="sm" variant="ghost" onClick={() => document.execCommand('italic')}>Itálica</Button>
                      <Button size="sm" variant="ghost" onClick={() => document.execCommand('insertUnorderedList')}>Lista</Button>
                      <Button size="sm" variant="ghost" onClick={() => document.execCommand('formatBlock', false, 'blockquote')}>Cita</Button>
                    </div>

                    <div
                      id="editor-notas"
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg bg-white text-sm leading-relaxed"
                      onInput={(e) => setNotasHtml((e.target as HTMLDivElement).innerHTML)}
                      dangerouslySetInnerHTML={{ __html: notasHtml }}
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          setGuardandoNotas(true);
                          // simulate save latency
                          await new Promise(r => setTimeout(r, 500));
                          setGuardandoNotas(false);
                          setEditandoNotas(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {guardandoNotas ? 'Guardando...' : 'Guardar'}
                      </Button>

                      <Button variant="outline" onClick={() => { setEditandoNotas(false); setNotasHtml(capitulo?.notas || ''); }}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default VerDetallesCapituloAIPage;