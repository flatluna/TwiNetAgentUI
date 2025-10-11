import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TwinDiaryAgent from '@/components/TwinDiaryAgent';
import { Badge } from '@/components/ui/badge';
import { FileText, Play, User, Globe, Clock, Tag, ExternalLink, BookOpen, Eye } from 'lucide-react';
import ReactDOM from 'react-dom';

// Local interfaces matching backend shape
interface IndexAI { IndexNumero: string; Titulo: string; Pagina: number }
interface PreguntaQuizAI { Pregunta: string; Opciones: string[]; RespuestaCorrecta: string; Explicacion: string }
interface CapituloCreadoAI { Titulo: string; Objetivos: string[]; Contenido: string; Ejemplos: string[]; Resumen: string; Pagina: number; Quizes: PreguntaQuizAI[] }
interface CursoCreadoAI { Indice: IndexAI[]; NombreClase: string; Descripcion: string; Capitulos: CapituloCreadoAI[]; DuracionEstimada: string; Etiquetas: string[]; TwinID: string; id: string }

const DetallesCursoAIPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const curso: CursoCreadoAI | null = (location.state as any)?.cursoAI || (location.state as any)?.curso || null;
  const cursosInternetRaw: any = (location.state as any)?.CursosInternet || (location.state as any)?.cursosInternet || (curso as any)?.CursosInternet || null;
  // normalize possible naming differences coming from backend C# models
  const cursosInternet = React.useMemo(() => {
    if (!cursosInternetRaw) return null;
    const ci = cursosInternetRaw;
    return {
      // backend may send variants: cursosEncontrados, cursosEcontrados (typo), CursosEcontrados, etc.
      cursosEncontrados: ci.cursosEncontrados || ci.cursosEcontrados || ci.CursosEcontrados || ci.CursosEncontrados || [],
      htmlDetalles: ci.htmlDetalles || ci.HtmlDetalles || ci.HtmlDetalle || '',
      respuesta: ci.respuesta || ci.Respuesta || '',
      resumen: ci.resumen || ci.Resumen || '',
      puntosClaves: ci.puntosClaves || ci.PuntosClaves || [],
      // enlaces might be an array of strings or an object; normalize to array when possible
      enlaces: Array.isArray(ci.enlaces) ? ci.enlaces : Array.isArray(ci.Enlaces) ? ci.Enlaces : (ci.enlaces ? [ci.enlaces] : []),
      accionesRecomendadas: ci.accionesRecomendadas || ci.AccionesRecomendadas || [],
    };
  }, [cursosInternetRaw]);
  const [activeTab, setActiveTab] = React.useState<'contenido' | 'cursosInternet'>('contenido');
  const [modalCourse, setModalCourse] = useState<any | null>(null);

  if (!curso) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-3">No se encontró información del curso</h2>
          <p className="text-gray-600 mb-6">Esta página espera recibir el objeto completo del curso en location.state (cursoAI).</p>
          <div className="flex justify-center">
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  const indice = Array.isArray(curso.Indice) ? curso.Indice : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          <button className="underline" onClick={() => navigate('/mi-conocimiento/cursos/ai')}>Cursos AI</button>
          <span className="mx-2">/</span>
          <span className="font-medium">{curso.NombreClase}</span>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/mi-conocimiento/cursos/ai')}>Volver a Cursos AI</Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Left: Index */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              <button className={`px-3 py-1 rounded ${activeTab === 'contenido' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('contenido')}>Contenido</button>
              <button className={`px-3 py-1 rounded ${activeTab === 'cursosInternet' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('cursosInternet')}>Cursos del internet</button>
            </div>
          </div>

          {activeTab === 'cursosInternet' && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Cursos del internet</h3>
                  {!cursosInternet && <div className="text-sm text-gray-600">No hay datos de CursosInternet disponibles en el estado de navegación.</div>}

                  {cursosInternet && (
                    <div className="space-y-6">
                      {/* htmlDetalles */}
                      {cursosInternet.htmlDetalles ? (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cursosInternet.htmlDetalles }} />
                      ) : null}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          {cursosInternet.resumen && <div className="text-sm text-gray-700 mb-3">{cursosInternet.resumen}</div>}

                          {Array.isArray(cursosInternet.puntosClaves) && (
                            <div className="mb-3">
                              <h4 className="font-semibold">Puntos clave</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {cursosInternet.puntosClaves.map((p: string, idx: number) => <li key={idx}>{p}</li>)}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(cursosInternet.cursosEncontrados) && (
                            <div>
                              <h4 className="font-semibold mb-2">Cursos encontrados</h4>
                              <p className="text-xs text-gray-500 mb-3">Haz clic en "Ver detalles" en cada tarjeta para abrir un modal con la información completa y los enlaces.</p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cursosInternet.cursosEncontrados.map((c: any, i: number) => (
                                      <Card key={i} className="overflow-hidden rounded-lg shadow-lg transform hover:scale-102 transition bg-gradient-to-br from-white to-gray-50">
                                        <div className="p-4 md:p-6 flex flex-col items-center text-center">
                                          <div className="w-5 h-5 md:w-10 md:h-10 bg-gradient-to-br from-rose-400 to-yellow-300 rounded-lg flex items-center justify-center text-white mb-3">
                                            <BookOpen className="w-3 h-3 md:w-5 md:h-5" />
                                          </div>

                                          <div className="w-full">
                                            <div className="text-lg font-semibold text-gray-900">{c.nombreClase || c.NombreClase}</div>

                                            <div className="mt-4 flex items-center justify-center gap-3">
                                              <Button size="sm" variant="default" onClick={() => setModalCourse(c)} className="flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                Ver detalles
                                              </Button>
                                              {c.enlaces?.enlaceClase && (
                                                <a href={c.enlaces.enlaceClase} target="_blank" rel="noreferrer" className="text-sm text-purple-600 flex items-center gap-1"><ExternalLink className="w-4 h-4"/>Ir al curso</a>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                            </div>
                          )}
                        </div>

                        <aside className="p-4 bg-gray-50 rounded-lg">
                          {Array.isArray(cursosInternet.enlaces) && (
                            <div className="mb-3">
                              <h4 className="font-semibold">Enlaces</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {cursosInternet.enlaces.map((e: string, idx: number) => <li key={idx}><a href={e} target="_blank" rel="noreferrer" className="text-purple-600 underline">{e}</a></li>)}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(cursosInternet.accionesRecomendadas) && (
                            <div>
                              <h4 className="font-semibold">Acciones recomendadas</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {cursosInternet.accionesRecomendadas.map((a: string, idx: number) => <li key={idx}>{a}</li>)}
                              </ul>
                            </div>
                          )}
                        </aside>
                      </div>
                      {/* Debug panel to inspect raw payload when troubleshooting */}
                      <div className="mt-4">
                        <details className="bg-gray-50 p-3 rounded" data-testid="debug-cursosinternet">
                          <summary className="cursor-pointer font-medium text-sm text-gray-700">DEBUG: raw CursosInternet / location.state</summary>
                          <pre className="mt-2 text-xs text-gray-700 overflow-auto max-h-64">
{JSON.stringify({ locationState: (location as any).state, cursosInternetRaw }, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
            </div>
          )}
          
          {activeTab === 'contenido' && (
            <>
          <Card className="mb-6 overflow-hidden border-0 shadow-xl">
            {/* Header con gradient */}
            <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
            
            <CardHeader className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200 font-medium px-3 py-1">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
                      Generado por IA
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {curso.NombreClase}
                  </CardTitle>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {curso.Descripcion}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{curso.Capitulos?.length ?? 0}</div>
                  <div className="text-xs text-green-600 font-medium">Capítulos</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-bold text-blue-700 leading-tight line-clamp-2 min-h-[2.5rem]">
                    {curso.DuracionEstimada || 'No especificada'}
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">Duración</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {Array.isArray(curso.Etiquetas) ? curso.Etiquetas.length : 0}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">Etiquetas</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700">IA</div>
                  <div className="text-xs text-purple-600 font-medium">Instructor</div>
                </div>
              </div>

              {/* Etiquetas */}
              {curso.Etiquetas && Array.isArray(curso.Etiquetas) && curso.Etiquetas.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Etiquetas del curso</h4>
                  <div className="flex flex-wrap gap-2">
                    {curso.Etiquetas.map((etiqueta, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:from-purple-50 hover:to-blue-50 hover:border-purple-200 transition-all"
                      >
                        {etiqueta}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Índice del curso
                </h3>
                <div className="space-y-3">
                  {indice.map((item, idx) => (
                    <Card key={item.IndexNumero + '-' + idx} className="p-4 hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mr-3">
                              {item.IndexNumero}
                            </span>
                            {item.Titulo}
                          </div>
                          <div className="text-xs text-gray-500 ml-9">Página {item.Pagina}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                            onClick={() => {
                              const cap = (curso.Capitulos || [])[idx] || null;
                              navigate(`/mi-conocimiento/cursosAI/${curso.id}/capitulos/${idx}/ai-detalle`, { state: { cursoAI: curso, capitulo: cap, esAI: true, from: location.pathname } });
                            }}
                          >
                            <Play className="w-4 h-4 mr-1"/> Ir al capítulo
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optionally show full chapter list below */}
          <div className="grid gap-4">
            {(curso.Capitulos || []).map((cap, i) => (
              <Card key={cap.Titulo + '-' + i} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{cap.Titulo}</div>
                    {cap.Resumen && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{cap.Resumen}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/mi-conocimiento/cursosAI/${curso.id}/capitulos/${i}/ai-detalle`, { state: { cursoAI: curso, capitulo: cap, esAI: true } })}>Ver</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
  </>) }
  </div>

      {/* Inline modal for course details */}
      {modalCourse && (
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setModalCourse(null)} />
            <div className="relative bg-white w-11/12 max-w-3xl rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-start justify-between p-3 md:p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-rose-400 to-yellow-300 rounded flex items-center justify-center text-white"><BookOpen className="w-3 h-3 md:w-4 md:h-4"/></div>
                    <div>
                      <div className="text-base md:text-lg font-bold">{modalCourse.nombreClase || modalCourse.NombreClase}</div>
                      <div className="text-sm text-gray-500">{modalCourse.plataforma || modalCourse.Plataforma}  {modalCourse.instructor || modalCourse.Instructor}</div>
                    </div>
                  </div>
                <div>
                  <button className="text-gray-500 hover:text-gray-900" onClick={() => setModalCourse(null)}>Cerrar ✕</button>
                </div>
              </div>

              <div className="p-4 max-h-[70vh] overflow-auto space-y-4">
                {modalCourse.loQueAprendere && (
                  <section>
                    <h3 className="text-sm font-semibold">Descripción</h3>
                    <p className="text-sm text-gray-700 mt-1">{modalCourse.loQueAprendere || modalCourse.LoQueAprendere}</p>
                  </section>
                )}

                {modalCourse.objetivosdeAprendizaje && (
                  <section>
                    <h3 className="text-sm font-semibold">Objetivos de aprendizaje</h3>
                    <p className="text-sm text-gray-700 mt-1">{Array.isArray(modalCourse.objetivosdeAprendizaje) ? modalCourse.objetivosdeAprendizaje.join('; ') : modalCourse.objetivosdeAprendizaje}</p>
                  </section>
                )}

                {(modalCourse.requisitos || modalCourse.Prerequisitos || modalCourse.prerequisitos) && (
                  <section>
                    <h3 className="text-sm font-semibold">Requisitos / Prerrequisitos</h3>
                    <p className="text-sm text-gray-700 mt-1">{modalCourse.requisitos || modalCourse.Prerequisitos || modalCourse.prerequisitos}</p>
                  </section>
                )}

                {modalCourse.habilidadesCompetencias && (
                  <section>
                    <h3 className="text-sm font-semibold">Habilidades / Competencias</h3>
                    <p className="text-sm text-gray-700 mt-1">{modalCourse.habilidadesCompetencias || modalCourse.HabilidadesCompetencias}</p>
                  </section>
                )}

                {modalCourse.enlaces && (
                  <section>
                    <h3 className="text-sm font-semibold">Enlaces</h3>
                    <div className="mt-1 flex flex-col gap-2">
                      {modalCourse.enlaces.enlaceClase && (
                        <a href={modalCourse.enlaces.enlaceClase} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Ir al curso</a>
                      )}
                      {modalCourse.enlaces.enlacePlataforma && (
                        <a href={modalCourse.enlaces.enlacePlataforma} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Página de la plataforma</a>
                      )}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-semibold">Metadatos</h3>
                  <div className="mt-1 text-sm text-gray-700 grid grid-cols-2 gap-2">
                    <div><strong>Duración:</strong> {modalCourse.duracion || modalCourse.Duracion || '-'}</div>
                    <div><strong>Precio:</strong> {modalCourse.precio || modalCourse.Precio || 'Gratis/No disponible'}</div>
                    <div><strong>Idioma:</strong> {modalCourse.idioma || modalCourse.Idioma || '-'}</div>
                    <div><strong>Fechas:</strong> {modalCourse.fechaInicio || modalCourse.FechaInicio ? `${modalCourse.fechaInicio || modalCourse.FechaInicio}${modalCourse.fechaFin || modalCourse.FechaFin ? ' — ' + (modalCourse.fechaFin || modalCourse.FechaFin) : ''}` : '-'}</div>
                  </div>
                </section>
              </div>

              <div className="p-4 border-t flex justify-end">
                <Button onClick={() => setModalCourse(null)}>Cerrar</Button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}

        {/* Right: Twin Agent */}
  <aside className="w-full md:w-96">
          <div className="sticky top-20">
            <TwinDiaryAgent cursoId={curso.id} courseName={curso.NombreClase} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DetallesCursoAIPage;
