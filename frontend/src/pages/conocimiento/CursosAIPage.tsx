import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import CursoAIPageCard from '@/components/conocimiento/CursoAIPageCard';
import { Button } from '@/components/ui/button';
import { useTwinId } from '@/hooks/useTwinId';

// Local TS interfaces matching backend CursoCreadoAI classes
interface IndexAI { IndexNumero: string; Titulo: string; Pagina: number }
interface PreguntaQuizAI { Pregunta: string; Opciones: string[]; RespuestaCorrecta: string; Explicacion: string }
interface CapituloCreadoAI { Titulo: string; Objetivos: string[]; Contenido: string; Ejemplos: string[]; Resumen: string; Pagina: number; Quizes: PreguntaQuizAI[] }
interface CursoCreadoAI { Indice: IndexAI[]; NombreClase: string; Descripcion: string; Capitulos: CapituloCreadoAI[]; DuracionEstimada: string; Etiquetas: string[]; TwinID: string; id: string }

const CursosAIPage: React.FC = () => {
  const navigate = useNavigate();
  const { twinId, loading: twinLoading } = useTwinId();

  const [cursosAI, setCursosAI] = useState<CursoCreadoAI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch for this page: GET /twins/{twinId}/cursos/agent/build
    const fetchCursosBuild = async () => {
      if (!twinId) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/twins/${twinId}/cursos/agent/build`, { method: 'GET' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data && data.success && Array.isArray(data.cursos)) {
          setCursosAI(data.cursos as CursoCreadoAI[]);
        } else {
          setCursosAI([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Error al cargar cursos AI construidos');
        setCursosAI([]);
      } finally {
        setLoading(false);
      }
    };

    if (!twinLoading) {
      fetchCursosBuild();
    }
  }, [twinId, twinLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cursos AI</h1>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/mi-conocimiento/cursos/agregar-ai')}><Brain className="w-4 h-4 mr-2"/>Agregar Curso con AI</Button>
        </div>

        {/* TwinCursos agent placeholder specific to AI-generated courses */}
        <div className="mb-6 p-4 border rounded bg-white">
          <h2 className="text-lg font-medium mb-2">TwinCursos - Agente</h2>
          <p className="text-sm text-gray-600 mb-3">Interroga al agente sobre cursos creados por IA (p. ej. "Resume el curso Z").</p>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-3 py-2" placeholder="Escribe tu pregunta..." />
            <Button>Preguntar</Button>
          </div>
        </div>

        {/* Render AI-built cursos with a dedicated card component (do not change other pages) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursosAI.map((c, idx) => (
            <CursoAIPageCard key={c.id ?? idx} curso={c} />
          ))}
        </div>
        {/* Keep CursosSection available but do not use it on this page for AI rendering to avoid altering other views */}
        {/* <CursosSection onlyTipo="ai" externalCursosAI={cursosAI ?? undefined} /> */}

        {loading && <div className="text-sm text-gray-500 mt-3">Cargando cursos AI...</div>}
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default CursosAIPage;
