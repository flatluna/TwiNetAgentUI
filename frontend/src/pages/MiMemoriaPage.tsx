import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Archive, 
  Brain, 
  Clock, 
  Search, 
  Plus, 
  FileText, 
  Image, 
  Calendar, 
  Tag, 
  Edit3, 
  Trash2, 
  Filter,
  Save,
  X,
  Heart,
  Star,
  MapPin,
  Users,
  Camera,
  Mic,
  BookOpen,
  Lightbulb,
  Target,
  Coffee,
  Smile,
  Bell,
  RefreshCw,
  AlertCircle,
  Loader2,
  Upload,
  ImagePlus,
  Eye,
  Sparkles,
  Palette
} from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import GuardarMemoriaModal from '@/components/GuardarMemoriaModal';
import { memoriaApiService, type GetMemoriasResponse } from '@/services/memoriaApiService';

// Tipos de datos
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
  CreatedAt: string;
  UpdatedAt: string;
  Title?: string | null;
  Description?: string | null;
  ImageAI?: ImageAI;
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

const categorias = [
  { id: 'personal', label: 'Personal', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { id: 'trabajo', label: 'Trabajo', icon: Target, color: 'bg-blue-100 text-blue-600' },
  { id: 'familia', label: 'Familia', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 'aprendizaje', label: 'Aprendizaje', icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'viajes', label: 'Viajes', icon: MapPin, color: 'bg-orange-100 text-orange-600' },
  { id: 'otros', label: 'Otros', icon: Coffee, color: 'bg-gray-100 text-gray-600' }
];

const tiposMemoria = [
  { id: 'evento', label: 'Evento', icon: Calendar },
  { id: 'nota', label: 'Nota', icon: FileText },
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'logro', label: 'Logro', icon: Star },
  { id: 'recordatorio', label: 'Recordatorio', icon: Bell }
];

const MiMemoriaPage: React.FC = () => {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [memoriaEditando, setMemoriaEditando] = useState<Memoria | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActiva, setVistaActiva] = useState<'grid' | 'lista'>('grid');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null); // ID de la memoria que está subiendo foto
  const [estadisticas, setEstadisticas] = useState<GetMemoriasResponse['statistics'] | null>(null);
  const [modalProgreso, setModalProgreso] = useState<{
    visible: boolean;
    progreso: number;
    paso: string;
    memoria: Memoria | null;
  }>({
    visible: false,
    progreso: 0,
    paso: '',
    memoria: null
  });
  
  const [modalDescripcion, setModalDescripcion] = useState<{
    visible: boolean;
    archivo: File | null;
    memoria: Memoria | null;
    descripcion: string;
  }>({
    visible: false,
    archivo: null,
    memoria: null,
    descripcion: ''
  });

  // Función para obtener el Twin ID del usuario autenticado
  const getTwinId = (): string | null => {
    if (accounts && accounts.length > 0) {
      return accounts[0].localAccountId;
    }
    return null;
  };

  // Estado del formulario - YA NO SE NECESITA, SE MANEJA EN EL MODAL
  // const [formulario, setFormulario] = useState({...});

  // Función para cargar memorias desde el servidor
  const cargarMemorias = async () => {
    const twinId = getTwinId();
    if (!twinId) {
      setError('No se pudo identificar el usuario. Por favor, inicia sesión.');
      return;
    }

    setCargando(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando memorias para Twin ID:', twinId);
      const response = await memoriaApiService.obtenerMemorias(twinId);
      
      if (response.success && response.memorias) {
        setMemorias(response.memorias);
        setEstadisticas(response.statistics);
        console.log('✅ Memorias cargadas:', response.memorias);
        console.log('📊 Estadísticas:', response.statistics);
      } else {
        setMemorias([]);
        setEstadisticas(null);
        console.log('📝 No hay memorias para este usuario');
      }
    } catch (error) {
      console.error('❌ Error al cargar memorias:', error);
      setError('Error al cargar las memorias. Por favor, intenta de nuevo.');
      setMemorias([]);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  };

  // Cargar memorias al iniciar y cuando cambie el usuario
  useEffect(() => {
    cargarMemorias();
  }, [accounts]); // Recargar cuando cambien las cuentas de usuario

  // Filtrar memorias
  const memoriasFiltradas = memorias.filter(memoria => {
    const coincideBusqueda = memoria.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                           memoria.contenido.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === 'todas' || memoria.categoria === filtroCategoria;
    const coincideTipo = filtroTipo === 'todos' || memoria.tipo === filtroTipo;
    
    return coincideBusqueda && coincideCategoria && coincideTipo;
  });

  // Manejar guardar memoria desde el modal
  const manejarGuardarMemoria = async () => {
    // El modal maneja el guardado en el servidor
    // Aquí solo cerramos el modal y recargamos la lista
    setMostrarModal(false);
    setMemoriaEditando(null);
    
    // Recargar memorias después de guardar
    await cargarMemorias();
    console.log('✅ Memoria guardada y lista recargada');
  };

  const abrirModalEdicion = (memoria: Memoria) => {
    setMemoriaEditando(memoria);
    setMostrarModal(true);
  };

  const abrirModalNuevo = () => {
    setMemoriaEditando(null);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMemoriaEditando(null);
  };

  const eliminarMemoria = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta memoria?')) {
      return;
    }

    const twinId = getTwinId();
    if (!twinId) {
      setError('No se pudo identificar el usuario para eliminar la memoria.');
      return;
    }

    try {
      console.log('🗑️ Eliminando memoria:', id);
      const response = await memoriaApiService.eliminarMemoria(twinId, id);
      
      if (response.success) {
        console.log('✅ Memoria eliminada exitosamente');
        // Recargar la lista después de eliminar
        await cargarMemorias();
      } else {
        setError('Error al eliminar la memoria: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error al eliminar memoria:', error);
      setError('Error al eliminar la memoria. Por favor, intenta de nuevo.');
    }
  };

  // Función para manejar subida de fotos
  const manejarSubidaFoto = async (memoriaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) {
      console.log('❌ No se seleccionó ningún archivo');
      return;
    }

    console.log('📎 Archivo seleccionado:', {
      name: archivo.name,
      size: archivo.size,
      type: archivo.type,
      lastModified: archivo.lastModified
    });

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (PNG, JPG, JPEG, GIF, WEBP, etc.)');
      return;
    }

    // Validar tamaño (máximo 10MB para coincidir con el backend)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (archivo.size > maxSize) {
      setError('La imagen es demasiado grande. El tamaño máximo es 10MB.');
      return;
    }

    // Buscar la memoria para mostrar en el modal
    const memoria = memorias.find(m => m.id === memoriaId);
    
    // Mostrar modal de descripción
    setModalDescripcion({
      visible: true,
      archivo: archivo,
      memoria: memoria || null,
      descripcion: ''
    });
    
    // Limpiar el input
    event.target.value = '';
  };

  const procesarSubidaFoto = async () => {
    const { archivo, memoria, descripcion } = modalDescripcion;
    
    if (!archivo || !memoria) return;

    const twinId = getTwinId();
    if (!twinId) {
      setError('No se pudo identificar el usuario para subir la foto.');
      return;
    }

    // Cerrar modal de descripción
    setModalDescripcion(prev => ({ ...prev, visible: false }));
    
    setSubiendoFoto(memoria.id);
    setError(null);
    
    // Mostrar modal de progreso
    setModalProgreso({
      visible: true,
      progreso: 0,
      paso: 'Preparando archivo...',
      memoria: memoria
    });

    // Simular pasos de procesamiento de IA
    const pasos = [
      { progreso: 10, paso: 'Subiendo imagen al servidor...', tiempo: 800 },
      { progreso: 25, paso: 'Iniciando análisis de IA...', tiempo: 1000 },
      { progreso: 40, paso: 'Detectando objetos y personas...', tiempo: 1200 },
      { progreso: 55, paso: 'Analizando colores y composición...', tiempo: 1000 },
      { progreso: 70, paso: 'Evaluando contexto emocional...', tiempo: 1200 },
      { progreso: 85, paso: 'Generando descripción detallada...', tiempo: 1000 },
      { progreso: 95, paso: 'Finalizando análisis completo...', tiempo: 800 }
    ];
    
    try {
      console.log('📸 Subiendo foto para memoria:', memoria.id);
      
      // Ejecutar pasos de progreso en paralelo con la subida real
      const progresoPromise = (async () => {
        for (const paso of pasos) {
          await new Promise(resolve => setTimeout(resolve, paso.tiempo));
          setModalProgreso(prev => ({
            ...prev,
            progreso: paso.progreso,
            paso: paso.paso
          }));
        }
      })();
      
      // Ejecutar la subida real con descripción
      const uploadPromise = memoriaApiService.subirFoto(twinId, memoria.id, archivo, descripcion);
      
      // Esperar ambos procesos
      const [, response] = await Promise.all([progresoPromise, uploadPromise]);
      
      // Completar progreso
      setModalProgreso(prev => ({
        ...prev,
        progreso: 100,
        paso: '¡Análisis completado! Guardando resultados...'
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (response.success) {
        console.log('✅ Foto subida exitosamente');
        // Recargar la lista después de subir la foto
        await cargarMemorias();
      } else {
        setError('Error al subir la foto: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error al subir foto:', error);
      setError('Error al subir la foto. Por favor, intenta de nuevo.');
    } finally {
      setSubiendoFoto(null);
      setModalProgreso(prev => ({ ...prev, visible: false }));
    }
  };

  const getIconoCategoria = (categoria: string) => {
    const cat = categorias.find(c => c.id === categoria);
    return cat ? cat.icon : FileText;
  };

  const getColorCategoria = (categoria: string) => {
    const cat = categorias.find(c => c.id === categoria);
    return cat ? cat.color : 'bg-gray-100 text-gray-600';
  };

  const getIconoImportancia = (importancia: string) => {
    switch (importancia) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baja': return '🟢';
      default: return '⚪';
    }
  };

  // Función para extraer texto plano del HTML del contenido
  const extraerTextoPlano = (htmlContent: string) => {
    // Crear un elemento temporal para extraer el texto
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mi Memoria Digital</h1>
              <p className="text-white/80">
                Tu archivo personal de recuerdos, experiencias y momentos importantes
                {estadisticas && (
                  <span className="ml-2 text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm border border-white/30">
                    📊 Datos sincronizados
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Controles superiores */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              onClick={abrirModalNuevo}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={cargando}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Memoria
            </Button>
            
            <Button 
              onClick={cargarMemorias}
              variant="outline"
              disabled={cargando}
              className="flex items-center gap-2"
            >
              {cargando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {cargando ? 'Cargando...' : 'Recargar'}
            </Button>
            
            <Button 
              onClick={() => {
                // Para subir foto general, primero necesitamos crear una memoria
                // Por ahora abrimos el modal para crear memoria
                abrirModalNuevo();
              }}
              variant="outline"
              disabled={cargando}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Subir Foto
            </Button>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar en mis memorias..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-40">
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </Select>
            
            <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-40">
              <option value="todos">Todos los tipos</option>
              {tiposMemoria.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </Select>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error al cargar memorias</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button 
                  onClick={cargarMemorias}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={cargando}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Archive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas?.totalMemorias ?? memorias.length}
                    </p>
                    <p className="text-sm text-gray-600">Memorias Totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas?.memoriasEsteMes ?? memorias.filter(m => {
                        const hoy = new Date();
                        const fechaMemoria = new Date(m.fechaCreacion);
                        return fechaMemoria.getMonth() === hoy.getMonth() && fechaMemoria.getFullYear() === hoy.getFullYear();
                      }).length}
                    </p>
                    <p className="text-sm text-gray-600">Este Mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas?.categoriasUnicas ?? [...new Set(memorias.map(m => m.categoria))].length}
                    </p>
                    <p className="text-sm text-gray-600">Categorías</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas?.memoriasImportantes ?? memorias.filter(m => m.importancia === 'alta').length}
                    </p>
                    <p className="text-sm text-gray-600">Importantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal para guardar/editar memoria */}
        <GuardarMemoriaModal 
          isOpen={mostrarModal}
          onClose={cerrarModal}
          onSave={manejarGuardarMemoria}
          memoriaEditando={memoriaEditando}
          twinId={getTwinId() || ''}
        />

        {/* Lista de memorias */}
        <div className="space-y-6">
          {cargando ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cargando memorias...
                </h3>
                <p className="text-gray-600">
                  Obteniendo tus recuerdos del servidor
                </p>
              </CardContent>
            </Card>
          ) : memoriasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {memorias.length === 0 ? 'Aún no hay memorias' : 'No se encontraron memorias'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {memorias.length === 0 
                    ? 'Comienza a documentar tus experiencias y momentos especiales'
                    : 'Intenta ajustar los filtros o la búsqueda'
                  }
                </p>
                {memorias.length === 0 && !cargando && (
                  <div className="space-y-3">
                    <Button onClick={abrirModalNuevo} className="mr-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear tu primera memoria
                    </Button>
                    <p className="text-xs text-gray-500">
                      💡 Tip: Puedes agregar fotos a tus memorias usando el botón 📷 en cada memoria
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {memoriasFiltradas.map(memoria => {
                const IconoCategoria = getIconoCategoria(memoria.categoria);
                return (
                  <Card key={memoria.id} className="group relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/15 rounded-2xl">
                    <CardHeader className="pb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                      <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${getColorCategoria(memoria.categoria)} shadow-lg backdrop-blur-sm ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300`}>
                            <IconoCategoria className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-blue-200 transition-colors duration-300">{memoria.titulo}</h3>
                            <p className="text-sm text-white/70 mt-1">{memoria.fecha}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-2xl bg-white/10 rounded-full p-2 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                            <span>{getIconoImportancia(memoria.importancia)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-b-2xl" />
                      <div className="relative">
                        <p className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed font-medium">
                          {extraerTextoPlano(memoria.contenido)}
                        </p>
                      
                        {/* Etiquetas */}
                        {memoria.etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {memoria.etiquetas.slice(0, 3).map((etiqueta, index) => (
                              <Badge key={index} className="bg-gradient-to-r from-blue-400/25 to-purple-400/25 text-white border border-white/30 text-xs px-3 py-1 rounded-full backdrop-blur-sm hover:from-blue-400/35 hover:to-purple-400/35 transition-all duration-300">
                                {etiqueta}
                              </Badge>
                            ))}
                            {memoria.etiquetas.length > 3 && (
                              <Badge className="bg-white/10 text-white border border-white/30 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                +{memoria.etiquetas.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      
                        {/* Fotos de la memoria */}
                        {memoria.multimedia && memoria.multimedia.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-1.5 rounded-lg">
                                <Camera className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-white/80 font-medium">
                                {memoria.multimedia.length} foto{memoria.multimedia.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {memoria.multimedia.slice(0, 3).map((fotoUrl, index) => (
                                <div key={index} className="relative aspect-square group/photo">
                                  <img
                                    src={fotoUrl}
                                    alt={`Foto ${index + 1} de ${memoria.titulo}`}
                                    className="w-full h-full object-cover rounded-xl border border-white/20 shadow-lg group-hover/photo:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+PHBhdGggZD0iTTI4IDEySDEydjE2aDE2VjEyeiIgZmlsbD0iI2Q5ZGNlMCIvPjwvc3ZnPg==';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300" />
                                  {(memoria.multimedia?.length || 0) > 3 && index === 2 && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                      <span className="text-white text-sm font-bold bg-white/20 px-2 py-1 rounded-full">
                                        +{(memoria.multimedia?.length || 0) - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      
                        {/* Metadatos adicionales */}
                        <div className="space-y-2 mb-4">
                          {memoria.ubicacion && (
                            <div className="flex items-center gap-2 text-sm text-white/80 bg-white/5 rounded-lg px-3 py-2 backdrop-blur-sm">
                              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1 rounded-lg">
                                <MapPin className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-medium">{memoria.ubicacion}</span>
                            </div>
                          )}
                          {memoria.personas && memoria.personas.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-white/80 bg-white/5 rounded-lg px-3 py-2 backdrop-blur-sm">
                              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded-lg">
                                <Users className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-medium">{memoria.personas.slice(0, 2).join(', ')}</span>
                              {memoria.personas.length > 2 && <span className="text-white/60"> +{memoria.personas.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      
                        {/* Acciones */}
                        <div className="flex gap-2 flex-wrap items-stretch">
                          <Button
                            size="sm"
                            onClick={() => abrirModalEdicion(memoria)}
                            className="flex-1 min-w-20 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          
                          {/* Botón Ver Fotos - Si tiene fotos en photos o multimedia */}
                          {((memoria.photos && memoria.photos.length > 0) || (memoria.multimedia && memoria.multimedia.length > 0)) && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/mi-memoria/${memoria.id}/fotos`)}
                              className="bg-gradient-to-r from-blue-400/25 to-purple-400/25 hover:from-blue-400/35 hover:to-purple-400/35 text-white border border-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                              title={`Ver ${(memoria.photos?.length || memoria.multimedia?.length || 0)} foto${(memoria.photos?.length || memoria.multimedia?.length || 0) > 1 ? 's' : ''}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {memoria.photos?.length || memoria.multimedia?.length || 0}
                            </Button>
                          )}
                        
                          {/* Botón de subir foto */}
                          <div className="relative flex-1 min-w-28" title="Subir foto">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                              onChange={(e) => manejarSubidaFoto(memoria.id, e)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={subiendoFoto === memoria.id}
                              id={`file-input-${memoria.id}`}
                            />
                            <Button
                              size="sm"
                              disabled={subiendoFoto === memoria.id}
                              className="w-full bg-gradient-to-r from-green-400/25 to-emerald-400/25 hover:from-green-400/35 hover:to-emerald-400/35 text-white border border-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                              title={subiendoFoto === memoria.id ? "Subiendo foto..." : "Subir foto"}
                              asChild
                            >
                              <label htmlFor={`file-input-${memoria.id}`} className="cursor-pointer flex items-center justify-center gap-2">
                                {subiendoFoto === memoria.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Subiendo...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImagePlus className="w-4 h-4" />
                                    <span className="text-xs">Foto</span>
                                  </>
                                )}
                              </label>
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => eliminarMemoria(memoria.id)}
                            className="bg-gradient-to-r from-red-400/25 to-pink-400/25 hover:from-red-400/35 hover:to-pink-400/35 text-white border border-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 font-medium min-w-16"
                            title="Eliminar memoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Descripción de Foto */}
      <Dialog open={modalDescripcion.visible} onOpenChange={(open) => !open && setModalDescripcion(prev => ({ ...prev, visible: false }))}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-indigo-900/95 via-purple-700/95 to-pink-800/95 backdrop-blur-xl border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-3">
              <Camera className="w-6 h-6 text-blue-400" />
              Describe tu Foto
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Información de la memoria */}
            {modalDescripcion.memoria && (
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <h4 className="font-semibold text-white text-sm">{modalDescripcion.memoria.titulo}</h4>
                <p className="text-white/70 text-xs">{modalDescripcion.memoria.fecha}</p>
              </div>
            )}
            
            {/* Preview de la imagen si es posible */}
            {modalDescripcion.archivo && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <ImagePlus className="w-4 h-4" />
                  <span>{modalDescripcion.archivo.name}</span>
                </div>
              </div>
            )}
            
            {/* Campo de descripción */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Yo voy a describir tu foto pero ayúdame diciéndome nombres de personas, sus edades, donde están, ciudad, vacaciones, algún evento??? (Opcional)
              </label>
              <Textarea
                value={modalDescripcion.descripcion}
                onChange={(e) => setModalDescripcion(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Ej: María (mi hermana, 25 años) y Juan (mi primo, 30) en Central Park, Nueva York durante nuestras vacaciones de verano..."
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl resize-none"
                rows={3}
              />
              <p className="text-xs text-white/60">
                Estos detalles ayudarán a la IA a crear una descripción más personal y rica en contexto.
              </p>
            </div>
            
            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalDescripcion(prev => ({ ...prev, visible: false }))}
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={procesarSubidaFoto}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Foto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Progreso de IA */}
      <Dialog open={modalProgreso.visible} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-cyan-300" />
                <div className="absolute inset-0 bg-cyan-300/20 rounded-full animate-pulse" />
              </div>
              Análisis de IA en Proceso
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Información de la memoria */}
            {modalProgreso.memoria && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <h4 className="font-semibold text-white mb-1">{modalProgreso.memoria.titulo}</h4>
                <p className="text-white/70 text-sm">{modalProgreso.memoria.fecha}</p>
              </div>
            )}
            
            {/* Barra de progreso */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white/90">
                  {modalProgreso.paso}
                </span>
                <span className="text-sm font-bold text-cyan-300">
                  {modalProgreso.progreso}%
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={modalProgreso.progreso} 
                  className="h-3 bg-white/10 rounded-full overflow-hidden"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${modalProgreso.progreso}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Explicación del proceso */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-400/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/80 leading-relaxed">
                  <p className="font-medium text-white mb-2">¿Por qué toma tiempo?</p>
                  <p>
                    Nuestra IA está realizando un análisis completo de tu imagen, 
                    detectando objetos, personas, colores, emociones y contexto para 
                    crear una descripción rica y detallada que enriquecerá tu memoria.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Iconos de procesos */}
            <div className="flex justify-center space-x-4">
              <div className={`p-2 rounded-full transition-all duration-300 ${modalProgreso.progreso >= 25 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                <Eye className="w-4 h-4" />
              </div>
              <div className={`p-2 rounded-full transition-all duration-300 ${modalProgreso.progreso >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                <Palette className="w-4 h-4" />
              </div>
              <div className={`p-2 rounded-full transition-all duration-300 ${modalProgreso.progreso >= 75 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                <Heart className="w-4 h-4" />
              </div>
              <div className={`p-2 rounded-full transition-all duration-300 ${modalProgreso.progreso >= 95 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MiMemoriaPage;