import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { memoriaApiService, type MemoriaRequest } from '@/services/memoriaApiService';
import { 
  Save, 
  X, 
  Heart,
  Target,
  Users,
  BookOpen,
  Lightbulb,
  MapPin,
  Coffee,
  Calendar,
  FileText,
  Star,
  Bell,
  Tag,
  Plus,
  Minus,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Tipos de datos
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
}

const categorias = [
  { id: 'personal', label: 'Personal', icon: Heart, color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { id: 'trabajo', label: 'Trabajo', icon: Target, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'familia', label: 'Familia', icon: Users, color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 'aprendizaje', label: 'Aprendizaje', icon: BookOpen, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { id: 'viajes', label: 'Viajes', icon: MapPin, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'otros', label: 'Otros', icon: Coffee, color: 'bg-gray-100 text-gray-600 border-gray-200' }
];

const tiposMemoria = [
  { id: 'evento', label: 'Evento', icon: Calendar, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'nota', label: 'Nota', icon: FileText, color: 'bg-slate-100 text-slate-600' },
  { id: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-amber-100 text-amber-600' },
  { id: 'logro', label: 'Logro', icon: Star, color: 'bg-orange-100 text-orange-600' },
  { id: 'recordatorio', label: 'Recordatorio', icon: Bell, color: 'bg-red-100 text-red-600' }
];

interface GuardarMemoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memoria: Omit<Memoria, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  memoriaEditando?: Memoria | null;
  twinId: string; // Agregamos twinId para la API
}

const GuardarMemoriaModal: React.FC<GuardarMemoriaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memoriaEditando,
  twinId
}) => {
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    titulo: '',
    contenido: '',
    categoria: '',
    tipo: 'nota' as 'evento' | 'nota' | 'idea' | 'logro' | 'recordatorio',
    importancia: 'media' as 'alta' | 'media' | 'baja',
    ubicacion: '',
    personas: '',
    etiquetas: ''
  });

  const [etiquetasArray, setEtiquetasArray] = useState<string[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string>('');

  // Cargar datos si estamos editando
  useEffect(() => {
    if (memoriaEditando) {
      setFormulario({
        titulo: memoriaEditando.titulo,
        contenido: memoriaEditando.contenido,
        categoria: memoriaEditando.categoria,
        tipo: memoriaEditando.tipo,
        importancia: memoriaEditando.importancia,
        ubicacion: memoriaEditando.ubicacion || '',
        personas: memoriaEditando.personas?.join(', ') || '',
        etiquetas: memoriaEditando.etiquetas.join(', ')
      });
      setEtiquetasArray(memoriaEditando.etiquetas);
    } else {
      limpiarFormulario();
    }
  }, [memoriaEditando, isOpen]);

  const limpiarFormulario = () => {
    setFormulario({
      titulo: '',
      contenido: '',
      categoria: '',
      tipo: 'nota',
      importancia: 'media',
      ubicacion: '',
      personas: '',
      etiquetas: ''
    });
    setEtiquetasArray([]);
    setNuevaEtiqueta('');
    setErrores({});
    setErrorServidor('');
    setEnviando(false);
  };

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio';
    }

    if (!formulario.contenido.trim()) {
      nuevosErrores.contenido = 'El contenido es obligatorio';
    }

    if (!formulario.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !etiquetasArray.includes(nuevaEtiqueta.trim())) {
      setEtiquetasArray(prev => [...prev, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetasArray(prev => prev.filter(e => e !== etiqueta));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrores({});
    setErrorServidor('');
    
    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);

    try {
      const personasArray = formulario.personas
        .split(',')
        .map(persona => persona.trim())
        .filter(persona => persona);

      const memoriaRequest: MemoriaRequest = {
        twinId: twinId,
        titulo: formulario.titulo,
        contenido: formulario.contenido,
        categoria: formulario.categoria,
        tipo: formulario.tipo,
        importancia: formulario.importancia,
        ubicacion: formulario.ubicacion,
        personas: personasArray,
        etiquetas: etiquetasArray,
        fecha: new Date().toLocaleDateString(),
        multimedia: []
      };

      let response;
      
      if (memoriaEditando) {
        // Actualizar memoria existente
        response = await memoriaApiService.actualizarMemoria(twinId, memoriaEditando.id, memoriaRequest);
      } else {
        // Crear nueva memoria
        response = await memoriaApiService.crearMemoria(twinId, memoriaRequest);
      }

      if (response.success) {
        // Éxito: crear memoria completa para el callback
        const memoriaCompleta = {
          ...memoriaRequest,
          multimedia: memoriaRequest.multimedia || []
        };
        
        onSave(memoriaCompleta);
        
        // Solo cerrar si fue exitoso
        onClose();
        limpiarFormulario();
      } else {
        setErrorServidor(response.message || 'Error desconocido del servidor');
      }

    } catch (error: any) {
      console.error('Error guardando memoria:', error);
      setErrorServidor(
        error.message || 
        'Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentar.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const manejarCancelar = () => {
    if (!enviando) {
      onClose();
      limpiarFormulario();
    }
  };

  const getCategoriaInfo = (categoriaId: string) => {
    return categorias.find(cat => cat.id === categoriaId) || categorias[0];
  };

  const getTipoInfo = (tipoId: string) => {
    return tiposMemoria.find(tipo => tipo.id === tipoId) || tiposMemoria[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={manejarCancelar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {memoriaEditando ? 'Editar Memoria' : 'Nueva Memoria'}
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                Guarda tus pensamientos, experiencias y momentos importantes
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={manejarEnvio} className="space-y-6">
          {/* Mensaje de error del servidor */}
          {errorServidor && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error al guardar</h4>
                <p className="text-sm text-red-700 mt-1">{errorServidor}</p>
              </div>
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Principal - Título y Contenido */}
            <div className="lg:col-span-2 space-y-4">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-sm font-medium">
                  Título *
                </Label>
                <Input
                  id="titulo"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Dale un título memorable a tu memoria..."
                  className={errores.titulo ? 'border-red-500' : ''}
                />
                {errores.titulo && (
                  <p className="text-red-500 text-xs">{errores.titulo}</p>
                )}
              </div>

              {/* Contenido con Rich Editor */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Contenido *
                </Label>
                <div className={`border rounded-lg ${errores.contenido ? 'border-red-500' : 'border-gray-200'}`}>
                  <RichTextEditor
                    value={formulario.contenido}
                    onChange={(content) => setFormulario(prev => ({ ...prev, contenido: content }))}
                    placeholder="Escribe aquí tu memoria... Puedes usar formato rico para resaltar partes importantes, crear listas, agregar enlaces y más."
                    minHeight="250px"
                  />
                </div>
                {errores.contenido && (
                  <p className="text-red-500 text-xs">{errores.contenido}</p>
                )}
              </div>
            </div>

            {/* Columna Lateral - Metadatos */}
            <div className="space-y-4">
              {/* Categoría */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoría *</Label>
                <Select 
                  value={formulario.categoria} 
                  onChange={(e) => setFormulario(prev => ({ ...prev, categoria: e.target.value }))}
                  className={errores.categoria ? 'border-red-500' : ''}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </Select>
                {errores.categoria && (
                  <p className="text-red-500 text-xs">{errores.categoria}</p>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo</Label>
                <Select 
                  value={formulario.tipo} 
                  onChange={(e) => setFormulario(prev => ({ ...prev, tipo: e.target.value as any }))}
                >
                  {tiposMemoria.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                  ))}
                </Select>
              </div>

              {/* Importancia */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Importancia</Label>
                <Select 
                  value={formulario.importancia} 
                  onChange={(e) => setFormulario(prev => ({ ...prev, importancia: e.target.value as any }))}
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </Select>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ubicación</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    value={formulario.ubicacion}
                    onChange={(e) => setFormulario(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="¿Dónde ocurrió?"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Personas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Personas</Label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    value={formulario.personas}
                    onChange={(e) => setFormulario(prev => ({ ...prev, personas: e.target.value }))}
                    placeholder="Juan, María, Pedro..."
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Separa los nombres con comas</p>
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Etiquetas</Label>
            
            {/* Agregar nueva etiqueta */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  placeholder="Agregar etiqueta..."
                  className="pl-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarEtiqueta();
                    }
                  }}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={agregarEtiqueta}
                disabled={!nuevaEtiqueta.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Lista de etiquetas */}
            {etiquetasArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {etiquetasArray.map((etiqueta, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <span>{etiqueta}</span>
                    <button
                      type="button"
                      onClick={() => eliminarEtiqueta(etiqueta)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Vista previa de categoría y tipo seleccionados */}
          {(formulario.categoria || formulario.tipo) && (
            <div className="flex gap-2">
              {formulario.categoria && (
                <Badge className={getCategoriaInfo(formulario.categoria).color}>
                  {React.createElement(getCategoriaInfo(formulario.categoria).icon, { 
                    className: "w-3 h-3 mr-1" 
                  })}
                  {getCategoriaInfo(formulario.categoria).label}
                </Badge>
              )}
              {formulario.tipo && (
                <Badge className={getTipoInfo(formulario.tipo).color}>
                  {React.createElement(getTipoInfo(formulario.tipo).icon, { 
                    className: "w-3 h-3 mr-1" 
                  })}
                  {getTipoInfo(formulario.tipo).label}
                </Badge>
              )}
            </div>
          )}
        </form>

        <DialogFooter className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={manejarCancelar}
            disabled={enviando}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={manejarEnvio}
            disabled={enviando}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {memoriaEditando ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {memoriaEditando ? 'Actualizar Memoria' : 'Guardar Memoria'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuardarMemoriaModal;