import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TwinDiaryAgent from '@/components/TwinDiaryAgent';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, BookOpen } from 'lucide-react';

type CapituloAI = {
  id?: string;
  numeroCapitulo?: number;
  titulo?: string;
  descripcion?: string;
  duracionMinutos?: number;
  puntuacion?: number;
  resumenEjecutivo?: string;
  totalTokens?: number;
};

type CursoAIState = {
  cursoAI?: {
    id?: string;
    nombreClase?: string;
    capitulos?: CapituloAI[];
    instructor?: string;
    categorias?: string[];
  };
};

// Service to fetch CursosAI when arriving via direct link
import { obtenerCursosAIDelBackend } from '@/services/courseService';

const VerCapitulosAIPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const state = (location.state || {}) as CursoAIState;
  const cursoAIFromState = state.cursoAI || (state as any).curso || null;

  const [cursoAI, setCursoAI] = React.useState<any | null>(cursoAIFromState);
  const [loading, setLoading] = React.useState<boolean>(!cursoAIFromState);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If we already have curso from navigation state, nothing to do
    if (cursoAIFromState) return;

    const cursoId = params.cursoId;
    if (!cursoId) {
      setError('No se proporcionó información del curso y no hay cursoId en la URL.');
      setLoading(false);
      return;
    }

    // Attempt to fetch CursosAI and find the one with cursoId
    const twinId = (window as any).TWIN_ID || 'default-twin-id';
    setLoading(true);
    obtenerCursosAIDelBackend(twinId)
      .then((resp) => {
        if (resp && resp.cursos && Array.isArray(resp.cursos)) {
          const found = resp.cursos.find((c: any) => c.id === cursoId || c.cursoId === cursoId);
          if (found) {
            setCursoAI(found);
            setError(null);
          } else {
            setError(`Curso con id ${cursoId} no encontrado.`);
          }
        } else {
          setError('Respuesta inválida al solicitar CursosAI.');
        }
      })
      .catch((err) => {
        console.error('Error cargando CursosAI:', err);
        setError(String(err?.message || err));
      })
      .finally(() => setLoading(false));
  }, [cursoAIFromState, params.cursoId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-3">Cargando curso...</h2>
          <p className="text-gray-600 mb-6">Por favor espera mientras cargamos la información del curso.</p>
        </div>
      </div>
    );
  }

  if (!cursoAI) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-3">No se proporcionó información del curso</h2>
          <p className="text-gray-600 mb-6">Navega desde la sección de Cursos AI y selecciona "Ver capítulos" sobre un curso para ver sus capítulos aquí.</p>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div>
            <Button onClick={() => navigate('/mi-conocimiento/cursosAI')}>Volver a Cursos AI</Button>
          </div>
        </div>
      </div>
    );
  }

  const capitulos: CapituloAI[] = Array.isArray(cursoAI.capitulos) ? cursoAI.capitulos : [];

  const [chatVisible, setChatVisible] = useState<boolean>(true);


  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Capítulos — {cursoAI.nombreClase}</h1>
          {cursoAI.instructor && <p className="text-sm text-gray-600">Instructor: {cursoAI.instructor}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge>{capitulos.length} capítulos</Badge>
          <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
          <Button variant="ghost" onClick={() => setChatVisible(v => !v)} className="ml-2">{chatVisible ? 'Ocultar Agente' : 'Mostrar Agente'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: cards */}
        <div className={`${chatVisible ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {capitulos.map((cap: CapituloAI, idx: number) => (
              <Card key={cap.id || `${idx}-${cap.titulo || 'cap'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold truncate">
                          {cap.titulo || (cap.id ? `ID: ${cap.id}` : (cap.numeroCapitulo ? `Capítulo ${cap.numeroCapitulo}` : `Capítulo ${idx + 1}`))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeof cap.puntuacion === 'number' && (
                        <div className="flex items-center text-sm text-yellow-600 gap-1">
                          <Star className="w-4 h-4" /> {cap.puntuacion}
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{cap.descripcion || cap.resumenEjecutivo || 'Sin descripción disponible.'}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{cap.duracionMinutos ? `${cap.duracionMinutos} min` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{cap.totalTokens ?? '—'} tokens</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate(`/mi-conocimiento/cursosAI/${cursoAI.id}/capitulos/${cap.id}/detalles` , { state: { cursoAI, capitulo: cap } })}>
                        Ver detalles
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                        Copiar enlace
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: TwinCurso sidebar */}
        {chatVisible && (
          <aside className="lg:col-span-4">
            <div className="sticky top-20">
              <TwinDiaryAgent cursoId={cursoAI.id} courseName={cursoAI.nombreClase} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default VerCapitulosAIPage;
