import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Star, 
  FileText, 
  Code, 
  Edit,
  Play,
  Volume2,
  Calendar,
  Tag,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CapituloCurso, CapituloStats } from '@/types/conocimiento';
import { useTwinId } from '@/hooks/useTwinId';

const CapitulosCursoPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { twinId, loading: twinIdLoading } = useTwinId();
  
  const [capitulos, setCapitulos] = useState<CapituloCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursoTitulo, setCursoTitulo] = useState<string>('');
  const [cursoId_display, setCursoId_display] = useState<string>('');
  const [isCursoAI, setIsCursoAI] = useState(false);

  const stats: CapituloStats = {
    totalCapitulos: capitulos.length,
    capitulosCompletados: capitulos.filter(c => c.completado).length,
    capitulosEnProgreso: capitulos.filter(c => !c.completado).length,
    tiempoTotalEstudiado: capitulos.reduce((total, c) => total + (c.tiempoEstudiado || 0), 0),
    puntuacionPromedio: capitulos.length > 0 
      ? capitulos.filter(c => c.puntuacion).reduce((sum, c) => sum + (c.puntuacion || 0), 0) / capitulos.filter(c => c.puntuacion).length
      : 0,
    notebooksCreados: capitulos.reduce((total, c) => total + c.notebooks.length, 0),
    documentosSubidos: capitulos.reduce((total, c) => total + c.documentos.length, 0),
    transcriptsDisponibles: capitulos.filter(c => c.transcript && c.transcript.trim().length > 0).length
  };

  // Cargar curso y capítulos desde el backend
  useEffect(() => {
    const cargarCursoYCapitulos = async () => {
      if (!cursoId || !twinId || twinIdLoading) return;

      try {
        setLoading(true);
        setError(null);
        
        // Verificar si se pasaron datos por estado desde la navegación
        const estadoNavegacion = location.state as { cursoAI?: any, esAI?: boolean };
        
        if (estadoNavegacion && estadoNavegacion.esAI && estadoNavegacion.cursoAI) {
          // Usar datos que ya se cargaron, no hacer nueva llamada
          console.log('🔄 Usando datos de CursoAI pasados por navegación');
          const cursoAI = estadoNavegacion.cursoAI;
          setIsCursoAI(true);
          setCursoTitulo(cursoAI.nombreClase || 'CursoAI sin título');
          setCursoId_display(cursoId);
          
          // Usar capítulos del CursoAI
          const capitulosList = cursoAI.capitulos || [];
          console.log('📋 Capítulos de CursoAI:', capitulosList);
          
          // Mapear capítulos del CursoAI al formato del frontend
          const capitulosMapeados = capitulosList.map((cap: any) => ({
            id: cap.id || `cap-${cap.NumeroCapitulo}`,
            titulo: cap.Titulo || '',
            descripcion: cap.Descripcion || '',
            numeroCapitulo: cap.NumeroCapitulo || 0,
            duracionMinutos: cap.DuracionMinutos || 0,
            transcript: cap.Transcript || '',
            notas: cap.Notas || '',
            comentarios: cap.Comentarios || '',
            puntuacion: cap.Puntuacion || 0,
            tags: cap.Tags || [],
            completado: cap.Completado || false,
            fechaCreacion: new Date().toISOString(),
            notebooks: [],
            documentos: [],
            tiempoEstudiado: 0
          }));
          
          console.log('🔄 Capítulos mapeados:', capitulosMapeados);
          setCapitulos(capitulosMapeados);
          setLoading(false);
          return;
        }
        
        console.log(`🔍 Cargando curso ${cursoId} para twin ${twinId}`);
        
        // Detectar si es un CursoAI basado en la URL (fallback si no se pasaron datos)
        const isAI = window.location.pathname.includes('/cursosAI/');
        setIsCursoAI(isAI);
        
        if (isAI) {
          // Cargar CursoAI desde el endpoint específico (solo si no se pasaron datos)
          console.log('⚠️ Cargando CursoAI desde backend - no se encontraron datos en navegación');
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
            const cursoAIEncontrado = cursosAIResponse.cursos.find((c: any) => c.id === cursoId);
            
            if (cursoAIEncontrado) {
              setCursoTitulo(cursoAIEncontrado.nombreClase || 'CursoAI sin título');
              setCursoId_display(cursoId);
              
              // Extraer capítulos del CursoAI
              const capitulosList = cursoAIEncontrado.capitulos || [];
              console.log('📋 Capítulos de CursoAI encontrados:', capitulosList);
              
              // Mapear capítulos del CursoAI al formato del frontend
              const capitulosMapeados = capitulosList.map((cap: any) => ({
                id: cap.id || `cap-${cap.NumeroCapitulo}`,
                titulo: cap.Titulo || '',
                descripcion: cap.Descripcion || '',
                numeroCapitulo: cap.NumeroCapitulo || 0,
                duracionMinutos: cap.DuracionMinutos || 0,
                transcript: cap.Transcript || '',
                notas: cap.Notas || '',
                comentarios: cap.Comentarios || '',
                puntuacion: cap.Puntuacion || 0,
                tags: cap.Tags || [],
                completado: cap.Completado || false,
                fechaCreacion: new Date().toISOString(),
                notebooks: [],
                documentos: [],
                tiempoEstudiado: 0
              }));
              
              console.log('🔄 Capítulos mapeados:', capitulosMapeados);
              setCapitulos(capitulosMapeados);
            } else {
              throw new Error('CursoAI no encontrado');
            }
          } else {
            throw new Error('Formato de respuesta inválido para CursosAI');
          }
        } else {
          // Obtener información del curso completo (incluye capítulos) - curso normal
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
          
          // Extraer información del curso - nueva estructura del backend
          const cursoData = cursoCompleto.curso?.cursoData?.curso;
          if (cursoData) {
            setCursoTitulo(cursoData.nombreClase || 'Curso sin título');
            setCursoId_display(cursoId);
            
            // Extraer capítulos del curso
            const capitulosList = cursoData.capitulos || [];
            console.log('📋 Capítulos encontrados:', capitulosList);
            
            // Mapear capítulos del backend al formato del frontend
            const capitulosMapeados = capitulosList.map((cap: any) => ({
              id: cap.id || `cap-${cap.numeroCapitulo}`,
              titulo: cap.titulo || '',
              descripcion: cap.descripcion || '',
              numeroCapitulo: cap.numeroCapitulo || 0,
              duracionMinutos: cap.duracionMinutos || 0,
              transcript: cap.transcript || '',
              notas: cap.notas || '',
              comentarios: cap.comentarios || '',
              puntuacion: cap.puntuacion || 0,
              tags: cap.tags || [],
              completado: cap.completado || false,
              fechaCreacion: new Date().toISOString(),
              notebooks: [],
              documentos: [],
              tiempoEstudiado: 0
            }));
            
            console.log('🔄 Capítulos mapeados:', capitulosMapeados);
            setCapitulos(capitulosMapeados);
          } else {
            throw new Error('Estructura de datos del curso no válida');
          }
        }
        
      } catch (err) {
        console.error('❌ Error al cargar curso y capítulos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    cargarCursoYCapitulos();
  }, [cursoId, twinId, twinIdLoading, location.state]);

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  const renderRating = (puntuacion?: number) => {
    if (!puntuacion) return <span className="text-gray-400">Sin calificar</span>;
    
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
          <span className="text-lg">Cargando capítulos...</span>
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/mi-conocimiento/cursos')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Capítulos del Curso</h1>
          <div className="mt-1">
            <p className="text-lg text-gray-800 font-medium">{cursoTitulo}</p>
            <p className="text-sm text-gray-500">ID: {cursoId_display}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/agregar`)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Capítulo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCapitulos}</div>
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
            <div className="text-2xl font-bold text-purple-600">{formatearTiempo(stats.tiempoTotalEstudiado)}</div>
            <div className="text-sm text-gray-600">Tiempo estudiado</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.puntuacionPromedio.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Puntuación promedio</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.notebooksCreados}</div>
            <div className="text-sm text-gray-600">Notebooks</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-teal-600">{stats.documentosSubidos}</div>
            <div className="text-sm text-gray-600">Documentos</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.transcriptsDisponibles}</div>
            <div className="text-sm text-gray-600">Transcripts</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Capítulos */}
      {capitulos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay capítulos aún</h3>
            <p className="text-gray-500 mb-6">
              Comienza agregando el primer capítulo a tu curso.
            </p>
            <Button 
              onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/agregar`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Capítulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {capitulos.map((capitulo) => (
            <Card key={capitulo.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Capítulo {capitulo.numeroCapitulo}
                      </Badge>
                      {capitulo.completado && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {capitulo.titulo}
                    </h3>
                    {capitulo.descripcion && (
                      <p className="text-gray-600 text-sm">
                        {capitulo.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/${capitulo.id}/editar`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/${capitulo.id}/notebooks`)}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Notebooks
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                      onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/${capitulo.id}/detalles`, {
                        state: { 
                          capitulo, 
                          cursoTitulo, 
                          esAI: isCursoAI 
                        }
                      })}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Detalles
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{capitulo.duracionMinutos ? `${capitulo.duracionMinutos}min` : 'Sin especificar'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(capitulo.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    {renderRating(capitulo.puntuacion)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Code className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{capitulo.notebooks.length}</span>
                    <span className="text-gray-600">Notebooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{capitulo.documentos.length}</span>
                    <span className="text-gray-600">Documentos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-600">
                      {capitulo.transcript && capitulo.transcript.trim().length > 0 ? 'Con transcript' : 'Sin transcript'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600">
                      {capitulo.comentarios && capitulo.comentarios.trim().length > 0 ? 'Con comentarios' : 'Sin comentarios'}
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

                {capitulo.notas && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Mis Notas:</h4>
                    <p className="text-sm text-gray-600">{capitulo.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CapitulosCursoPage;