import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  User,
  Globe,
  FileText,
  CheckCircle2,
  Play,
  Brain,
  Loader2,
  AlertCircle,
  Languages,
  Eye,
  Edit,
  Circle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTwinId } from '../../hooks/useTwinId';
import '../twin-home/TwinHomePage.css';

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
  twinId?: string;
  // optional capitulos if passed in navigation state
  capitulos?: CapituloAI[];
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

const CapitulosCursoAIPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  const location = useLocation();

  const passedCurso = ((location.state as any)?.curso || (location.state as any)?.cursoAI) as CursoAI | undefined;

  const [cursoAI, setCursoAI] = useState<CursoAI | null>(passedCurso || null);
  const [capitulos, setCapitulos] = useState<CapituloAI[]>(passedCurso?.capitulos || []);
  const [loading, setLoading] = useState<boolean>(!passedCurso);
  const [error, setError] = useState<string | null>(null);

  // UI for chapter expansion and quiz
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'quiz'>('details');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, { correct: boolean; submitted: boolean }>>({});

  useEffect(() => {
    const load = async () => {
      if (!cursoId || !twinId || twinIdLoading) return;
      try {
        setLoading(true);
        if (!cursoAI) {
          // try to fetch course list and find the course
          const resp = await fetch(`/api/twins/${twinId}/cursos`);
          if (!resp.ok) throw new Error('Error fetching cursos');
          const data = await resp.json();
          const found = data.cursos?.find((c: any) => c.id === cursoId);
          if (found) setCursoAI(found);
        }

        // fetch chapters
        const capsResp = await fetch(`/api/twins/${twinId}/cursos/${cursoId}/capitulos`);
        if (capsResp.ok) {
          const capsJson = await capsResp.json();
          if (Array.isArray(capsJson.capitulos)) setCapitulos(capsJson.capitulos);
        }
      } catch (e) {
        console.error(e);
        setError('Error al cargar datos del curso');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, twinId, twinIdLoading]);

  const stats = {
    totalCapitulos: capitulos.length,
    capitulosCompletados: capitulos.filter(c => c.estado === 'terminado').length,
    capitulosEnProgreso: capitulos.filter(c => c.estado === 'en-progreso').length,
    tiempoTotalMinutos: capitulos.reduce((s, c) => s + (c.tiempoEnMinutos || 0), 0),
    puntuacionPromedio: (capitulos.reduce((acc, c) => acc + (c.puntuacion || 0), 0) / (capitulos.length || 1)) || 0
  };

  const formatearTiempo = (minutos: number) => {
    if (!minutos) return '0min';
    if (minutos < 60) return `${minutos}min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}min`;
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

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
  if (error || !cursoAI) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Error al cargar el curso</h2>
        <p className="text-gray-600">{error || 'Curso no encontrado'}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2"/>Volver</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <h1 className="text-2xl font-bold">{cursoAI.nombreClase}</h1>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-purple-100 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4"/>Instructor: {cursoAI.instructor || 'No especificado'}</div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4"/>Plataforma: {cursoAI.plataforma || 'No especificado'}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>Duración: {cursoAI.duracion || 'No especificado'}</div>
              <div className="flex items-center gap-2"><Languages className="h-4 w-4"/>Idioma: {cursoAI.idioma || 'No especificado'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="text-white border-white hover:bg-white hover:text-purple-600">
              <ArrowLeft className="h-4 w-4 mr-2"/>Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="text-center"><div className="text-2xl font-bold text-purple-600">{stats.totalCapitulos}</div><div className="text-sm text-gray-600">Total</div></CardContent></Card>
            <Card><CardContent className="text-center"><div className="text-2xl font-bold text-green-600">{stats.capitulosCompletados}</div><div className="text-sm text-gray-600">Completados</div></CardContent></Card>
            <Card><CardContent className="text-center"><div className="text-2xl font-bold text-orange-600">{stats.capitulosEnProgreso}</div><div className="text-sm text-gray-600">En progreso</div></CardContent></Card>
            <Card><CardContent className="text-center"><div className="text-2xl font-bold text-blue-600">{formatearTiempo(stats.tiempoTotalMinutos)}</div><div className="text-sm text-gray-600">Duración total</div></CardContent></Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-purple-600"/>Capítulos del Curso ({capitulos.length})</h2>

            {capitulos.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4"/><h3 className="text-lg font-semibold text-gray-600 mb-2">No hay capítulos disponibles</h3></CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {capitulos.map(cap => (
                  <Card key={cap.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0">{cap.estado === 'terminado' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : cap.estado === 'en-progreso' ? <Play className="h-5 w-5 text-orange-600" /> : <Circle className="h-5 w-5 text-gray-400" />}</div>
                            <h3 className="text-lg font-semibold">{cap.nombreCapitulo}</h3>
                            <Badge className={`${getEstadoColor(cap.estado)} text-xs`}>{getEstadoTexto(cap.estado)}</Badge>
                          </div>

                          {cap.descripcion && <p className="text-gray-600 mb-3 ml-8">{cap.descripcion}</p>}

                          <div className="flex items-center gap-6 ml-8 text-sm text-gray-500">
                            {cap.tiempoEnMinutos && <div className="flex items-center gap-1"><Clock className="h-4 w-4"/>{formatearTiempo(cap.tiempoEnMinutos)}</div>}
                            {cap.fechaUltimaActividad && <div className="flex items-center gap-1"><Calendar className="h-4 w-4"/>{new Date(cap.fechaUltimaActividad).toLocaleDateString()}</div>}
                            {cap.recursos && cap.recursos.length > 0 && <div className="flex items-center gap-1"><FileText className="h-4 w-4"/>{cap.recursos.length} recursos</div>}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-gray-500">{cap.puntuacion ? `${cap.puntuacion}/5` : 'Sin calificar'}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setExpandedChapterId(prev => prev === cap.id ? null : cap.id);
                              setActiveTab('details');
                            }}><Eye className="h-4 w-4 mr-1"/>Ver</Button>
                            <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1"/>Editar</Button>
                          </div>
                        </div>
                      </div>

                      {expandedChapterId === cap.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button className={`px-3 py-1 rounded ${activeTab === 'details' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('details')}>Detalles</button>
                              <button className={`px-3 py-1 rounded ${activeTab === 'quiz' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('quiz')}>Quiz</button>
                            </div>
                            <div className="text-sm text-gray-500">Capítulo expandido</div>
                          </div>

                          {activeTab === 'details' && (
                            <div className="text-sm text-gray-700 space-y-3">
                              {cap.descripcion && <p>{cap.descripcion}</p>}
                              {cap.recursos && cap.recursos.length > 0 && (
                                <ul className="list-disc ml-5">
                                  {cap.recursos.map(r => <li key={r.id} className="text-sm text-gray-600">{r.nombre} — {r.tipo}{r.url ? ` (${r.url})` : ''}</li>)}
                                </ul>
                              )}
                            </div>
                          )}

                          {activeTab === 'quiz' && (
                            <div className="mt-3">
                              <div className="bg-gray-50 p-4 rounded">
                                <div className="text-sm text-gray-700 mb-3 font-medium">Pregunta</div>
                                <div className="mb-3 text-gray-800">¿Qué proceso transforma el maíz para producir masa con mejores propiedades nutritivas y de sabor?</div>

                                <div className="space-y-2">
                                  {['a) Fermentación', 'b) Nixtamalización', 'c) Deshidratación', 'd) Molienda en crudo'].map(opt => (
                                    <label key={opt} className={`flex items-center gap-3 p-2 rounded border ${selectedAnswers[cap.id] === opt ? 'border-purple-600 bg-purple-50' : 'border-transparent'}`}>
                                      <input type="radio" name={`quiz-${cap.id}`} value={opt} checked={selectedAnswers[cap.id] === opt} onChange={e => setSelectedAnswers(prev => ({ ...prev, [cap.id]: e.target.value }))} />
                                      <span className="text-sm text-gray-800">{opt}</span>
                                    </label>
                                  ))}
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                  <Button onClick={() => {
                                    const selected = selectedAnswers[cap.id];
                                    if (!selected) return;
                                    const correct = selected.trim() === 'b) Nixtamalización';
                                    setQuizResults(prev => ({ ...prev, [cap.id]: { correct, submitted: true } }));
                                  }}>Calificar</Button>
                                  <Button variant="ghost" onClick={() => { setSelectedAnswers(prev => ({ ...prev, [cap.id]: '' })); setQuizResults(prev => ({ ...prev, [cap.id]: { correct: false, submitted: false } })); }}>Reset</Button>
                                </div>

                                {quizResults[cap.id] && quizResults[cap.id].submitted && (
                                  <div className={`mt-3 p-3 rounded ${quizResults[cap.id].correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                    {quizResults[cap.id].correct ? <div className="font-medium">Respuesta correcta ✅</div> : <div className="font-medium">Respuesta incorrecta ❌</div>}
                                    <div className="mt-2 text-sm">La nixtamalización es el tratamiento con cal que mejora la disponibilidad de nutrientes y textura del maíz para masa.</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="h-[600px] flex flex-col sticky top-20">
            <CardHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/public/Logo.png" alt="TwinAgent Logo" className="w-10 h-10 rounded-md object-cover" />
                  <div>
                    <div className="text-sm font-semibold">TwinAgent</div>
                    <div className="text-xs text-gray-400">TwinCurso — Asistente del curso</div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="p-4 border-b">
              <div className="text-sm font-semibold">{cursoAI.nombreClase}</div>
              <div className="text-xs text-gray-500">Instructor: {cursoAI.instructor || 'Twin Class AI'}</div>
              <div className="mt-2 flex items-center gap-2"><Badge>{capitulos.length} capítulos</Badge></div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-sm font-semibold px-2">Table of Contents</div>
              <div className="space-y-2">
                {capitulos.map((cap, idx) => (
                    <div key={cap.id || idx} className="p-3 border rounded-lg bg-white flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium flex items-center gap-3"><span className="inline-block w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-center leading-6 font-semibold">{idx + 1}</span>{cap.nombreCapitulo}</div>
                        <div className="text-xs text-gray-500">{cap.descripcion ? cap.descripcion.slice(0, 80) + (cap.descripcion.length > 80 ? '...' : '') : ''}</div>
                      </div>
                      <div className="flex flex-col gap-2 ml-3">
                        <Button size="sm" variant="outline" onClick={() => { setExpandedChapterId(cap.id); setActiveTab('details'); }}>Ver detalles</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CapitulosCursoAIPage;