import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Star,
  Calendar,
  User,
  MapPin,
  Tag,
  Eye,
  Brain,
  Palette,
  Clock,
  Lightbulb,
  Camera,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Users,
  Package,
  Sun,
  Moon,
  Zap,
  Smile,
  Activity,
  Globe,
  Focus,
  Layers,
  Contrast
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { memoriaApiService } from '@/services/memoriaApiService';

// Interfaces (copiadas de MiMemoriaPage)
interface ImageAI {
  id?: string | null;
  detailsHTML?: string | null;
  descripcionGenerica?: string | null;
  descripcion_visual_detallada?: any;
  contexto_emocional?: any;
  elementos_temporales?: any;
  detalles_memorables?: any;
}

interface Photo {
  id: string;
  ContainerName: string;
  FileName: string;
  Path: string;
  Url: string;
  url?: string; // Alternativa en minúscula
  CreatedAt: string;
  createdAt?: string; // Alternativa en minúscula
  UpdatedAt: string;
  updatedAt?: string; // Alternativa en minúscula
  Title?: string | null;
  Description?: string | null;
  description?: string | null; // Alternativa en minúscula
  ImageAI?: ImageAI;
  imageAI?: ImageAI; // Alternativa en minúscula
}

interface Memoria {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  fecha: string;
  etiquetas: string[];
  importancia: 'alta' | 'media' | 'baja';
  tipo: 'evento' | 'nota' | 'idea' | 'logro' | 'recordatorio';
  ubicacion?: string;
  personas?: string[];
  multimedia?: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
  photos?: Photo[];  // Cambiado de Photos a photos
}

const MemoriaFotosPage: React.FC = () => {
  const { memoriaId } = useParams<{ memoriaId: string }>();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  
  const [memoria, setMemoria] = useState<Memoria | null>(null);
  const [fotoActual, setFotoActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el Twin ID del usuario autenticado
  const getTwinId = (): string | null => {
    if (accounts && accounts.length > 0) {
      return accounts[0].localAccountId;
    }
    return null;
  };

  // Cargar la memoria específica
  useEffect(() => {
    const cargarMemoria = async () => {
      if (!memoriaId) {
        setError('ID de memoria no válido');
        setCargando(false);
        return;
      }

      const twinId = getTwinId();
      if (!twinId) {
        setError('Usuario no autenticado');
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        console.log('🔍 Cargando memoria:', memoriaId);
        
        // Cargar todas las memorias y buscar la específica
        const response = await memoriaApiService.obtenerMemorias(twinId);
        
        if (response.success && response.memorias) {
          const memoriaEncontrada = response.memorias.find(m => m.id === memoriaId);
          
          if (memoriaEncontrada) {
            setMemoria(memoriaEncontrada);
            
            if (!memoriaEncontrada.photos || memoriaEncontrada.photos.length === 0) {
              setError('Esta memoria no tiene fotos disponibles');
            }
          } else {
            setError('Memoria no encontrada');
          }
        } else {
          setError('Error al cargar la memoria');
        }
      } catch (error) {
        console.error('❌ Error al cargar memoria:', error);
        setError('Error al cargar la memoria. Por favor, intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    };

    cargarMemoria();
  }, [memoriaId, accounts]);

  // Función helper para obtener datos de manera robusta
  const getImageAIData = (foto: Photo | undefined) => {
    if (!foto) return null;
    
    // Intentar ambas versiones de casing
    const imageAI = foto.ImageAI || foto.imageAI || (foto as any).imageAi;
    
    return {
      descripcionGenerica: imageAI?.descripcionGenerica || imageAI?.descripcion_generica,
      detailsHTML: imageAI?.detailsHTML || imageAI?.details_html,
      descripcion_visual_detallada: imageAI?.descripcion_visual_detallada,
      contexto_emocional: imageAI?.contexto_emocional,
      elementos_temporales: imageAI?.elementos_temporales,
      detalles_memorables: imageAI?.detalles_memorables
    };
  };

  const fotoSeleccionada = memoria?.photos?.[fotoActual];
  const imageAIData = getImageAIData(fotoSeleccionada);

  const siguienteFoto = () => {
    if (memoria?.photos && fotoActual < memoria.photos.length - 1) {
      setFotoActual(fotoActual + 1);
    }
  };

  const fotoAnterior = () => {
    if (fotoActual > 0) {
      setFotoActual(fotoActual - 1);
    }
  };

  // Manejar teclas de navegación
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        fotoAnterior();
      } else if (e.key === 'ArrowRight') {
        siguienteFoto();
      } else if (e.key === 'Escape') {
        navigate('/mi-memoria');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fotoActual, memoria, navigate]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-white mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Cargando fotos...</h2>
            <p className="text-white/80">Preparando tu memoria visual</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/mi-memoria')} 
              className="bg-slate-700/40 backdrop-blur-sm border-slate-600/50 text-white hover:bg-slate-600/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mis Memorias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!memoria || !memoria.photos || memoria.photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sin fotos</h2>
            <p className="text-white/80 mb-6">Esta memoria no tiene fotos disponibles.</p>
            <Button 
              onClick={() => navigate('/mi-memoria')} 
              className="bg-slate-700/40 backdrop-blur-sm border-slate-600/50 text-white hover:bg-slate-600/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mis Memorias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header con glassmorphism */}
      <div className="bg-slate-800/30 backdrop-blur-lg border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/mi-memoria')}
                variant="outline"
                className="bg-slate-700/40 backdrop-blur-sm border-slate-600/50 text-white hover:bg-slate-600/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <div className="text-white">
                <h1 className="text-2xl font-bold">{memoria.titulo}</h1>
                <p className="text-white/80 text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(memoria.fechaCreacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-700/40 text-slate-200 border-slate-600/50">
                <Camera className="w-3 h-3 mr-1" />
                {memoria.photos.length} foto{memoria.photos.length > 1 ? 's' : ''}
              </Badge>
              <Badge className="bg-slate-700/40 text-slate-200 border-slate-600/50">
                {memoria.categoria}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Columna Izquierda - Foto Principal */}
          <div className="space-y-6">
            {/* Foto Principal */}
            <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={fotoSeleccionada?.url || fotoSeleccionada?.Url}
                    alt={fotoSeleccionada?.Description || `Foto ${fotoActual + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+PHBhdGggZD0iTTI4IDEySDEydjE2aDE2VjEyeiIgZmlsbD0iI2Q5ZGNlMCIvPjwvc3ZnPg==';
                    }}
                  />
                  
                  {/* Controles de navegación */}
                  {memoria.photos.length > 1 && (
                    <>
                      <Button
                        onClick={fotoAnterior}
                        disabled={fotoActual === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={siguienteFoto}
                        disabled={fotoActual === memoria.photos.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {/* Indicador de foto */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {fotoActual + 1} de {memoria.photos.length}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Miniaturas */}
            {memoria.photos.length > 1 && (
              <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {memoria.photos.map((foto: Photo, index: number) => (
                      <button
                        key={foto.id}
                        onClick={() => setFotoActual(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                          index === fotoActual 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
                            : 'hover:ring-1 hover:ring-white/50'
                        }`}
                      >
                        <img
                          src={foto.url || foto.Url}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna Derecha - Análisis de IA */}
          <div className="space-y-6">
            {/* Descripción General */}
            <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-slate-300" />
                  Descripción General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 leading-relaxed">
                  {imageAIData?.descripcionGenerica || 
                   fotoSeleccionada?.Description || 
                   fotoSeleccionada?.description || 
                   'Sin descripción disponible'}
                </p>
              </CardContent>
            </Card>

            {/* Análisis Detallado HTML */}
            {imageAIData?.detailsHTML && (
              <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-slate-300" />
                    Análisis Completo de IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-white/90 leading-relaxed space-y-4"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'rgba(255, 255, 255, 0.9)',
                      background: 'transparent'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: imageAIData.detailsHTML
                        ?.replace(/<style[^>]*>.*?<\/style>/gis, '') // Eliminar CSS
                        ?.replace(/style="[^"]*"/gi, '') // Eliminar estilos inline
                        ?.replace(/class="[^"]*"/gi, '') // Eliminar clases existentes
                        ?.replace(/color:\s*[^;]+;?/gi, '') // Eliminar colores
                        ?.replace(/background[^;]*;?/gi, '') // Eliminar fondos
                        ?.replace(/<h[1-6]([^>]*)>/gi, '<h3 style="color: white; font-weight: 600; font-size: 16px; margin: 16px 0 8px 0; line-height: 1.4;">')
                        ?.replace(/<\/h[1-6]>/gi, '</h3>')
                        ?.replace(/<p([^>]*)>/gi, '<p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 12px; line-height: 1.6;">')
                        ?.replace(/<ul([^>]*)>/gi, '<ul style="color: rgba(255, 255, 255, 0.9); margin: 12px 0; padding-left: 20px; list-style-type: disc;">')
                        ?.replace(/<ol([^>]*)>/gi, '<ol style="color: rgba(255, 255, 255, 0.9); margin: 12px 0; padding-left: 20px; list-style-type: decimal;">')
                        ?.replace(/<li([^>]*)>/gi, '<li style="color: rgba(255, 255, 255, 0.9); margin-bottom: 4px;">')
                        ?.replace(/<strong([^>]*)>/gi, '<strong style="color: white; font-weight: 600;">')
                        ?.replace(/<em([^>]*)>/gi, '<em style="color: rgba(255, 255, 255, 0.8); font-style: italic;">')
                        ?.replace(/<div([^>]*)>/gi, '<div style="margin-bottom: 8px; color: rgba(255, 255, 255, 0.9);">')
                        ?.replace(/📸|🎨|👥|🧩|🏠|🌟|😊|⏰|🌅|✨|🎭/g, '') // Eliminar emojis
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Análisis Visual Detallado */}
            {fotoSeleccionada?.ImageAI?.descripcion_visual_detallada && (
              <>
                {/* Personas y Objetos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personas */}
                  <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-slate-300" />
                        Personas ({fotoSeleccionada.ImageAI.descripcion_visual_detallada.personas?.cantidad || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {fotoSeleccionada.ImageAI.descripcion_visual_detallada.personas?.cantidad > 0 ? (
                        <div className="space-y-2">
                          {fotoSeleccionada.ImageAI.descripcion_visual_detallada.personas.detalles.map((persona: any, index: number) => (
                            <p key={index} className="text-white/80 text-sm">{persona}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/60 text-sm">No hay personas en la imagen</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Objetos */}
                  <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-300" />
                        Objetos ({fotoSeleccionada.ImageAI.descripcion_visual_detallada.objetos?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {fotoSeleccionada.ImageAI.descripcion_visual_detallada.objetos?.map((objeto: any, index: number) => (
                          <div key={index} className="bg-white/5 rounded-md p-2">
                            <Badge className="bg-slate-600/40 text-slate-200 text-xs mb-1">
                              {objeto.tipo?.replace(/_/g, ' ')}
                            </Badge>
                            <p className="text-white/80 text-xs">{objeto.descripcion}</p>
                          </div>
                        )) || <p className="text-white/60 text-sm">Sin objetos identificados</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Paleta de Colores */}
                {fotoSeleccionada.ImageAI.descripcion_visual_detallada.colores && (
                  <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-300" />
                        Análisis de Colores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Paleta Dominante */}
                        <div>
                          <h4 className="text-white/90 font-medium mb-2 text-sm">Paleta Dominante</h4>
                          <div className="flex flex-wrap gap-2">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.colores.paleta_dominante?.map((color: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 bg-white/5 rounded-md p-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-white/30"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-white/80 text-xs">{color.nombre}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Iluminación */}
                        <div>
                          <h4 className="text-white/90 font-medium mb-2 text-sm flex items-center gap-1">
                            <Sun className="w-3 h-3 text-amber-200" />
                            Iluminación
                          </h4>
                          <p className="text-white/80 text-sm">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.colores.iluminacion}
                          </p>
                        </div>
                        
                        {/* Atmósfera */}
                        <div>
                          <h4 className="text-white/90 font-medium mb-2 text-sm flex items-center gap-1">
                            <Activity className="w-3 h-3 text-slate-300" />
                            Atmósfera
                          </h4>
                          <p className="text-white/80 text-sm">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.colores.atmosfera}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Escenario */}
                {fotoSeleccionada.ImageAI.descripcion_visual_detallada.escenario && (
                  <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-300" />
                        Escenario y Ambiente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white/5 rounded-md p-3">
                          <h4 className="text-white/90 font-medium mb-1 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-300" />
                            Ubicación
                          </h4>
                          <p className="text-white/80 text-sm">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.escenario.ubicacion}
                          </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-md p-3">
                          <h4 className="text-white/90 font-medium mb-1 text-sm">Tipo de Lugar</h4>
                          <p className="text-white/80 text-sm">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.escenario.tipo_de_lugar}
                          </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-md p-3">
                          <h4 className="text-white/90 font-medium mb-1 text-sm">Ambiente</h4>
                          <p className="text-white/80 text-sm">
                            {fotoSeleccionada.ImageAI.descripcion_visual_detallada.escenario.ambiente}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Contexto Emocional */}
            {fotoSeleccionada?.ImageAI?.contexto_emocional && (
              <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Smile className="w-5 h-5 text-slate-300" />
                    Contexto Emocional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-md p-3">
                      <h4 className="text-white/90 font-medium mb-1 text-sm">Estado de Ánimo</h4>
                      <p className="text-white/80 text-sm">
                        {fotoSeleccionada.ImageAI.contexto_emocional.estado_de_animo_percibido}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-md p-3">
                      <h4 className="text-white/90 font-medium mb-1 text-sm">Ambiente General</h4>
                      <p className="text-white/80 text-sm">
                        {fotoSeleccionada.ImageAI.contexto_emocional.ambiente_general}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Elementos Temporales */}
            {fotoSeleccionada?.ImageAI?.elementos_temporales && (
              <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-300" />
                    Elementos Temporales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70 text-sm">Época:</span>
                      <span className="text-white/90 text-sm">
                        {fotoSeleccionada.ImageAI.elementos_temporales.epoca_aproximada}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70 text-sm">Estación:</span>
                      <span className="text-white/90 text-sm">
                        {fotoSeleccionada.ImageAI.elementos_temporales.estacion_del_ano}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70 text-sm">Momento:</span>
                      <span className="text-white/90 text-sm">
                        {fotoSeleccionada.ImageAI.elementos_temporales.momento_del_dia}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalles Memorables */}
            {fotoSeleccionada?.ImageAI?.detalles_memorables && (
              <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-300" />
                    Detalles Memorables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Elementos Únicos */}
                    {fotoSeleccionada.ImageAI.detalles_memorables.elementos_unicos_o_especiales?.length > 0 && (
                      <div>
                        <h4 className="text-white/90 font-medium mb-2 text-sm">✨ Elementos Únicos</h4>
                        <ul className="space-y-1">
                          {fotoSeleccionada.ImageAI.detalles_memorables.elementos_unicos_o_especiales.map((elemento: string, index: number) => (
                            <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                              <div className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0"></div>
                              {elemento}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Características Memorables */}
                    {fotoSeleccionada.ImageAI.detalles_memorables.caracteristicas_que_hacen_esta_foto_memorable?.length > 0 && (
                      <div>
                        <h4 className="text-white/90 font-medium mb-2 text-sm">🎯 Características Memorables</h4>
                        <ul className="space-y-1">
                          {fotoSeleccionada.ImageAI.detalles_memorables.caracteristicas_que_hacen_esta_foto_memorable.map((caracteristica: string, index: number) => (
                            <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                              <div className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0"></div>
                              {caracteristica}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Contexto para Recordar */}
                    {fotoSeleccionada.ImageAI.detalles_memorables.contexto_que_puede_ayudar_a_recordar_el_momento && (
                      <div className="bg-white/5 rounded-md p-3">
                        <h4 className="text-white/90 font-medium mb-1 text-sm flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Contexto para Recordar
                        </h4>
                        <p className="text-white/80 text-sm">
                          {fotoSeleccionada.ImageAI.detalles_memorables.contexto_que_puede_ayudar_a_recordar_el_momento}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información de la Memoria */}
            <Card className="bg-slate-800/30 backdrop-blur-lg border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-300" />
                  Información de la Memoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-md p-3">
                    <h4 className="text-white/90 font-medium mb-1 text-sm">Contenido</h4>
                    <p className="text-white/80 text-sm">{memoria.contenido}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-md p-3">
                      <h4 className="text-white/90 font-medium mb-1 text-sm">Categoría</h4>
                      <Badge className="bg-indigo-500/30 text-indigo-100">
                        {memoria.categoria}
                      </Badge>
                    </div>
                    
                    <div className="bg-white/5 rounded-md p-3">
                      <h4 className="text-white/90 font-medium mb-1 text-sm">Tipo</h4>
                      <Badge className="bg-slate-600/40 text-slate-200">
                        {memoria.tipo}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-md p-3">
                    <h4 className="text-white/90 font-medium mb-1 text-sm">Subida</h4>
                    <p className="text-white/80 text-sm">
                      {new Date(fotoSeleccionada?.CreatedAt || fotoSeleccionada?.createdAt || memoria.fechaCreacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoriaFotosPage;