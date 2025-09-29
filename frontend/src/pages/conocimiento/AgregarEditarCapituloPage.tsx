import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Code,
  AlertCircle,
  Loader2,
  Star,
  Tag,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CapituloFormData } from '@/types/conocimiento';
import { useTwinId } from '@/hooks/useTwinId';

const AgregarEditarCapituloPage: React.FC = () => {
  const { cursoId, capituloId } = useParams<{ cursoId: string; capituloId?: string }>();
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  const isEdit = Boolean(capituloId);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursoTitulo, setCursoTitulo] = useState<string>('');
  const [cursoId_display, setCursoId_display] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState<CapituloFormData>({
    titulo: '',
    descripcion: '',
    numeroCapitulo: 1,
    duracionMinutos: undefined,
    transcript: '',
    comentarios: '',
    puntuacion: undefined,
    tags: [],
    notas: ''
  });

  // Estado para tags
  const [tagInput, setTagInput] = useState('');

  // Cargar datos si es edición
  useEffect(() => {
    // Cargar información del curso
    if (cursoId && twinId && !twinIdLoading) {
      const cargarInfoCurso = async () => {
        try {
          const response = await fetch(`/api/twins/${twinId}/cursos/${cursoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const cursoCompleto = await response.json();
            const cursoData = cursoCompleto.curso?.cursoData?.curso;
            if (cursoData) {
              setCursoTitulo(cursoData.nombreClase || 'Curso sin título');
              setCursoId_display(cursoId);
              
              // Si es edición, buscar el capítulo específico
              if (isEdit && capituloId) {
                const capitulosList = cursoData.capitulos || [];
                console.log('🔍 Buscando capítulo con ID:', capituloId, 'en lista:', capitulosList);
                
                const capituloExistente = capitulosList.find((cap: any) => {
                  const generatedId = `cap-${cap.numeroCapitulo}`;
                  const match = cap.id === capituloId || generatedId === capituloId;
                  console.log(`🔍 Comparando: cap.id="${cap.id}", generatedId="${generatedId}", capituloId="${capituloId}", match=${match}`);
                  return match;
                });
                
                if (capituloExistente) {
                  console.log('📝 Cargando datos del capítulo existente:', capituloExistente);
                  
                  // Llenar el formulario con los datos existentes
                  setFormData({
                    titulo: capituloExistente.titulo || '',
                    descripcion: capituloExistente.descripcion || '',
                    numeroCapitulo: capituloExistente.numeroCapitulo || 1,
                    duracionMinutos: capituloExistente.duracionMinutos || undefined,
                    transcript: capituloExistente.transcript || '',
                    comentarios: capituloExistente.comentarios || '',
                    puntuacion: capituloExistente.puntuacion || undefined,
                    tags: capituloExistente.tags || [],
                    notas: capituloExistente.notas || ''
                  });
                } else {
                  console.warn(`⚠️ No se encontró el capítulo con ID: ${capituloId}`);
                  setError(`No se encontró el capítulo solicitado`);
                }
              }
            }
          } else {
            console.warn('No se pudo obtener la información del curso');
            setCursoTitulo('Curso');
            setCursoId_display(cursoId);
          }
        } catch (error) {
          console.warn('Error al cargar información del curso:', error);
          setCursoTitulo('Curso');
          setCursoId_display(cursoId);
          if (isEdit) {
            setError('Error al cargar los datos del capítulo');
          }
        }
      };

      cargarInfoCurso();
    }
  }, [isEdit, capituloId, cursoId, twinId, twinIdLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twinId || !cursoId) {
      setError('Faltan datos necesarios (twinId o cursoId)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        // MODO EDICIÓN: Actualizar capítulo existente usando PUT /api/twins/{twinId}/cursos/{cursoId}
        console.log('🔄 Actualizando capítulo existente...');
        
        // Para actualizar, necesitamos obtener el curso completo y actualizar el capítulo específico
        const getCursoResponse = await fetch(`/api/twins/${twinId}/cursos/${cursoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!getCursoResponse.ok) {
          throw new Error(`Error al obtener curso para actualizar: ${getCursoResponse.status}`);
        }

        const cursoCompleto = await getCursoResponse.json();
        const cursoData = cursoCompleto.curso?.cursoData;
        
        if (!cursoData) {
          throw new Error('No se pudo obtener los datos del curso para actualizar');
        }

        // Actualizar el capítulo específico en la lista
        const capitulosActualizados = (cursoData.curso.capitulos || []).map((cap: any) => {
          const generatedId = `cap-${cap.numeroCapitulo}`;
          const isThisChapter = cap.id === capituloId || generatedId === capituloId;
          
          if (isThisChapter) {
            return {
              ...cap,
              titulo: formData.titulo,
              descripcion: formData.descripcion || '',
              numeroCapitulo: formData.numeroCapitulo,
              duracionMinutos: formData.duracionMinutos || 0,
              transcript: formData.transcript || '',
              notas: formData.notas || '',
              comentarios: formData.comentarios || '',
              puntuacion: formData.puntuacion || 0,
              tags: formData.tags || [],
            };
          }
          return cap;
        });

        // Preparar el payload completo del curso con el capítulo actualizado
        const cursoActualizado = {
          ...cursoData,
          curso: {
            ...cursoData.curso,
            capitulos: capitulosActualizados
          }
        };

        console.log('🚀 Enviando curso actualizado al backend:', cursoActualizado);

        // Llamada al endpoint: PUT /api/twins/{twinId}/cursos/{cursoId}
        const response = await fetch(`/api/twins/${twinId}/cursos/${cursoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cursoActualizado)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Capítulo actualizado exitosamente:', result);
        
      } else {
        // MODO CREACIÓN: Crear nuevo capítulo usando POST /api/twins/{twinId}/cursos/{cursoId}/capitulos
        console.log('➕ Creando nuevo capítulo...');
        
        // Preparar el payload para el backend
        const capituloPayload = {
          titulo: formData.titulo,
          descripcion: formData.descripcion || null,
          numeroCapitulo: formData.numeroCapitulo,
          transcript: formData.transcript || null,
          notas: formData.notas || null,
          comentarios: formData.comentarios || null,
          duracionMinutos: formData.duracionMinutos || null,
          tags: formData.tags || [],
          puntuacion: formData.puntuacion || null,
          cursoId: cursoId,
          twinId: twinId,
          completado: false
        };

        console.log('🚀 Enviando nuevo capítulo al backend:', capituloPayload);

        // Llamada al endpoint: POST /api/twins/{twinId}/cursos/{cursoId}/capitulos
        const response = await fetch(`/api/twins/${twinId}/cursos/${cursoId}/capitulos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(capituloPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Capítulo creado exitosamente:', result);
      }
      
      // Redirigir a la lista de capítulos
      navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos`);
    } catch (error) {
      console.error('❌ Error al guardar capítulo:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al guardar el capítulo. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (twinIdLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Capítulos
        </Button>
        <div className="h-6 w-px bg-gray-300"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Capítulo' : 'Nuevo Capítulo'}
          </h1>
          <div className="mt-1">
            <p className="text-base text-gray-700 font-medium">{cursoTitulo}</p>
            <p className="text-sm text-gray-500">
              ID: {cursoId_display} | {isEdit ? 'Actualiza la información del capítulo' : 'Crea un nuevo capítulo para tu curso'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título del Capítulo *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Introducción a Python"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCapitulo">Número de Capítulo</Label>
                <Input
                  id="numeroCapitulo"
                  type="number"
                  min="1"
                  value={formData.numeroCapitulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroCapitulo: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del capítulo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracionMinutos">Duración Estimada (minutos)</Label>
              <Input
                id="duracionMinutos"
                type="number"
                min="1"
                value={formData.duracionMinutos || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duracionMinutos: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="Ej: 45"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contenido del Capítulo */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido del Capítulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript/Contenido Principal</Label>
              <Textarea
                id="transcript"
                value={formData.transcript || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.value }))}
                placeholder="Contenido principal del capítulo, transcript de video, notas de clase..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentarios">Comentarios del Capítulo</Label>
              <Textarea
                id="comentarios"
                value={formData.comentarios || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, comentarios: e.target.value }))}
                placeholder="Comentarios adicionales, puntos clave, recordatorios..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Mis Notas Personales</Label>
              <Textarea
                id="notas"
                value={formData.notas || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas personales, reflexiones, ideas..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Evaluación y Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluación y Etiquetas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Puntuación */}
            <div className="space-y-2">
              <Label>Mi Puntuación del Capítulo</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`p-1 rounded ${
                      (formData.puntuacion || 0) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, puntuacion: star }))}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
                {formData.puntuacion && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, puntuacion: undefined }))}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.puntuacion && (
                <p className="text-sm text-gray-600">
                  Puntuación: {formData.puntuacion}/5 estrellas
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags && formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar etiqueta..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  disabled={!tagInput.trim()}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            {isEdit && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos/${capituloId}/notebooks`)}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
              >
                <Code className="w-4 h-4 mr-2" />
                Ver Notebooks y Documentos
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(`/mi-conocimiento/cursos/${cursoId}/capitulos`)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.titulo.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Actualizar Capítulo' : 'Crear Capítulo'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgregarEditarCapituloPage;