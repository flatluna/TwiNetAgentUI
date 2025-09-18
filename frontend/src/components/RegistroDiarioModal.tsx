import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    X, 
    Save, 
    Upload, 
    Trash2, 
    FileText, 
    Image, 
    DollarSign,
    Clock,
    MapPin,
    Star,
    Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import viajesApiService, { RegistroDiario, ActividadDiaria } from '../services/viajesApiService';

interface RegistroDiarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    twinId: string;
    viajeId: string;
    viaje: { titulo: string; fechaInicio: string; fechaFin?: string; };
    onSave: (registro: RegistroDiario) => void;
}

const TIPOS_ACTIVIDAD = [
    { value: 'desayuno', label: 'Desayuno', icon: '🍳' },
    { value: 'almuerzo', label: 'Almuerzo', icon: '🍽️' },
    { value: 'cena', label: 'Cena', icon: '🍽️' },
    { value: 'museo', label: 'Museo', icon: '🏛️' },
    { value: 'tour', label: 'Tour', icon: '🚌' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'transporte', label: 'Transporte', icon: '🚗' },
    { value: 'hotel', label: 'Hotel', icon: '🏨' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎭' },
    { value: 'otro', label: 'Otro', icon: '📝' }
];

export const RegistroDiarioModal: React.FC<RegistroDiarioModalProps> = ({
    isOpen,
    onClose,
    twinId,
    viajeId,
    viaje,
    onSave
}) => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
    const [registro, setRegistro] = useState<RegistroDiario>({
        fecha: '',
        actividades: [],
        gastosTotalDia: 0,
        moneda: 'USD',
        notas: ''
    });

    const [nuevaActividad, setNuevaActividad] = useState<ActividadDiaria>({
        nombre: '',
        tipo: 'otro',
        lugar: '',
        direccion: '',
        horaInicio: '',
        horaFin: '',
        costo: 0,
        moneda: 'USD',
        descripcion: '',
        calificacion: 5,
        archivosAdjuntos: []
    });

    const [mostrarFormularioActividad, setMostrarFormularioActividad] = useState(false);
    const [editandoActividad, setEditandoActividad] = useState<number | null>(null);
    const [archivoSubiendo, setArchivoSubiendo] = useState(false);

    // Cargar fechas disponibles y seleccionar la primera al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const fechas = viajesApiService.generarFechasViaje(viaje.fechaInicio, viaje.fechaFin);
            setFechasDisponibles(fechas);
            
            // Seleccionar la primera fecha disponible
            if (fechas.length > 0) {
                setFechaSeleccionada(fechas[0]);
                setRegistro(prev => ({ ...prev, fecha: fechas[0] }));
            }
        }
    }, [isOpen, viaje]);

    // Cargar registro existente cuando cambia la fecha seleccionada
    useEffect(() => {
        if (fechaSeleccionada) {
            cargarRegistroDiario();
        }
    }, [fechaSeleccionada]);

    // Calcular gastos totales cuando cambian las actividades
    useEffect(() => {
        const total = registro.actividades.reduce((sum, actividad) => sum + (actividad.costo || 0), 0);
        setRegistro(prev => ({ ...prev, gastosTotalDia: total }));
    }, [registro.actividades]);

    const cargarRegistroDiario = async () => {
        try {
            const actividades = await viajesApiService.getActividadesPorDia(twinId, viajeId, fechaSeleccionada);
            if (actividades.length > 0) {
                setRegistro(prev => ({ ...prev, actividades }));
            }
        } catch (error) {
            console.error('Error cargando registro diario:', error);
        }
    };

    const agregarActividad = () => {
        // Validar actividad
        const validacion = viajesApiService.validarActividadDiaria(nuevaActividad);
        if (!validacion.valida) {
            alert(`Error: ${validacion.errores.join(', ')}`);
            return;
        }

        const actividad = { ...nuevaActividad, id: Date.now().toString() };
        
        if (editandoActividad !== null) {
            // Editar actividad existente
            const actividadesActualizadas = [...registro.actividades];
            actividadesActualizadas[editandoActividad] = actividad;
            setRegistro(prev => ({ ...prev, actividades: actividadesActualizadas }));
            setEditandoActividad(null);
        } else {
            // Agregar nueva actividad
            setRegistro(prev => ({
                ...prev,
                actividades: [...prev.actividades, actividad]
            }));
        }

        // Reset formulario
        setNuevaActividad({
            nombre: '',
            tipo: 'otro',
            lugar: '',
            direccion: '',
            horaInicio: '',
            horaFin: '',
            costo: 0,
            moneda: 'USD',
            descripcion: '',
            calificacion: 5,
            archivosAdjuntos: []
        });
        setMostrarFormularioActividad(false);
    };

    const editarActividad = (index: number) => {
        setNuevaActividad(registro.actividades[index]);
        setEditandoActividad(index);
        setMostrarFormularioActividad(true);
    };

    const eliminarActividad = (index: number) => {
        const actividadesActualizadas = registro.actividades.filter((_, i) => i !== index);
        setRegistro(prev => ({ ...prev, actividades: actividadesActualizadas }));
    };

    const subirArchivo = async (actividadIndex: number, file: File) => {
        setArchivoSubiendo(true);
        try {
            const archivo = await viajesApiService.uploadArchivoAdjunto(twinId, viajeId, fechaSeleccionada, actividadIndex, file);
            if (archivo) {
                const actividadesActualizadas = [...registro.actividades];
                if (!actividadesActualizadas[actividadIndex].archivosAdjuntos) {
                    actividadesActualizadas[actividadIndex].archivosAdjuntos = [];
                }
                actividadesActualizadas[actividadIndex].archivosAdjuntos!.push(archivo);
                setRegistro(prev => ({ ...prev, actividades: actividadesActualizadas }));
            }
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            alert('Error al subir el archivo');
        } finally {
            setArchivoSubiendo(false);
        }
    };

    const eliminarArchivo = async (actividadIndex: number, archivoIndex: number) => {
        const actividad = registro.actividades[actividadIndex];
        const archivo = actividad.archivosAdjuntos?.[archivoIndex];
        
        if (archivo?.id) {
            const eliminado = await viajesApiService.deleteArchivoAdjunto(twinId, viajeId, fechaSeleccionada, actividadIndex, archivo.id);
            if (eliminado) {
                const actividadesActualizadas = [...registro.actividades];
                actividadesActualizadas[actividadIndex].archivosAdjuntos = 
                    actividadesActualizadas[actividadIndex].archivosAdjuntos?.filter((_, i) => i !== archivoIndex) || [];
                setRegistro(prev => ({ ...prev, actividades: actividadesActualizadas }));
            }
        }
    };

    const guardarRegistro = async () => {
        try {
            const registroGuardado = await viajesApiService.saveRegistroDiario(twinId, viajeId, fechaSeleccionada, registro);
            if (registroGuardado) {
                onSave(registroGuardado);
                onClose();
            } else {
                alert('Error al guardar el registro');
            }
        } catch (error) {
            console.error('Error guardando registro:', error);
            alert('Error al guardar el registro');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">{viaje.titulo}</h2>
                        <p className="text-sm text-gray-500">Registro de actividades diarias</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Selector de fecha */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Seleccionar día del viaje:</label>
                        <select
                            value={fechaSeleccionada}
                            onChange={(e) => {
                                setFechaSeleccionada(e.target.value);
                                setRegistro(prev => ({ ...prev, fecha: e.target.value }));
                            }}
                            className="w-full p-2 border rounded-md"
                        >
                            {fechasDisponibles.map((fecha, index) => (
                                <option key={fecha} value={fecha}>
                                    Día {index + 1} - {new Date(fecha).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Lista de actividades */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Actividades del día</h3>
                            <Button 
                                onClick={() => setMostrarFormularioActividad(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Agregar Actividad
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {registro.actividades.map((actividad, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {TIPOS_ACTIVIDAD.find(t => t.value === actividad.tipo)?.icon}
                                            </span>
                                            <h4 className="font-medium">{actividad.nombre}</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => editarActividad(index)}
                                            >
                                                <Edit size={14} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => eliminarActividad(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {actividad.lugar}
                                        </div>
                                        {actividad.horaInicio && (
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {actividad.horaInicio} - {actividad.horaFin}
                                            </div>
                                        )}
                                        {actividad.costo && actividad.costo > 0 && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {actividad.costo} {actividad.moneda}
                                            </div>
                                        )}
                                        {actividad.calificacion && (
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-yellow-400" />
                                                {actividad.calificacion}/5
                                            </div>
                                        )}
                                    </div>

                                    {actividad.descripcion && (
                                        <p className="text-sm text-gray-600 mb-3">{actividad.descripcion}</p>
                                    )}

                                    {/* Archivos adjuntos */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Archivos:</span>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf,.gif"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) subirArchivo(index, file);
                                                }}
                                                className="hidden"
                                                id={`file-${index}`}
                                            />
                                            <label htmlFor={`file-${index}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={archivoSubiendo}
                                                    className="cursor-pointer"
                                                    type="button"
                                                >
                                                    <Upload size={12} />
                                                    {archivoSubiendo ? 'Subiendo...' : 'Subir'}
                                                </Button>
                                            </label>
                                        </div>

                                        {actividad.archivosAdjuntos && actividad.archivosAdjuntos.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {actividad.archivosAdjuntos.map((archivo, archivoIndex) => (
                                                    <div key={archivoIndex} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                                                        {archivo.tipo === 'foto' ? <Image size={12} /> : <FileText size={12} />}
                                                        <span>{archivo.nombre}</span>
                                                        <button
                                                            onClick={() => eliminarArchivo(index, archivoIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Formulario para nueva actividad */}
                    {mostrarFormularioActividad && (
                        <Card className="p-4 mb-6 border-2 border-blue-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">
                                    {editandoActividad !== null ? 'Editar Actividad' : 'Nueva Actividad'}
                                </h4>
                                <button
                                    onClick={() => {
                                        setMostrarFormularioActividad(false);
                                        setEditandoActividad(null);
                                        setNuevaActividad({
                                            nombre: '',
                                            tipo: 'otro',
                                            lugar: '',
                                            direccion: '',
                                            horaInicio: '',
                                            horaFin: '',
                                            costo: 0,
                                            moneda: 'USD',
                                            descripcion: '',
                                            calificacion: 5,
                                            archivosAdjuntos: []
                                        });
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        value={nuevaActividad.nombre}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, nombre: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                        placeholder="Ej: Visita al Louvre"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                                    <select
                                        value={nuevaActividad.tipo}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, tipo: e.target.value as any }))}
                                        className="w-full p-2 border rounded"
                                    >
                                        {TIPOS_ACTIVIDAD.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.icon} {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Lugar *</label>
                                    <input
                                        type="text"
                                        value={nuevaActividad.lugar}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, lugar: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                        placeholder="Ej: Museo del Louvre"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Costo</label>
                                    <input
                                        type="number"
                                        value={nuevaActividad.costo}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, costo: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-2 border rounded"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Hora inicio</label>
                                    <input
                                        type="time"
                                        value={nuevaActividad.horaInicio}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, horaInicio: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Hora fin</label>
                                    <input
                                        type="time"
                                        value={nuevaActividad.horaFin}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, horaFin: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Descripción</label>
                                    <textarea
                                        value={nuevaActividad.descripcion}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, descripcion: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                        rows={2}
                                        placeholder="Descripción de la actividad..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Calificación</label>
                                    <select
                                        value={nuevaActividad.calificacion}
                                        onChange={(e) => setNuevaActividad(prev => ({ ...prev, calificacion: parseInt(e.target.value) }))}
                                        className="w-full p-2 border rounded"
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>
                                                {num} estrella{num > 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMostrarFormularioActividad(false);
                                        setEditandoActividad(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={agregarActividad}>
                                    {editandoActividad !== null ? 'Actualizar' : 'Agregar'} Actividad
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Resumen de gastos y notas */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <Card className="p-4">
                            <h4 className="font-medium mb-2">Gastos del día</h4>
                            <div className="text-2xl font-bold text-green-600">
                                {registro.gastosTotalDia?.toLocaleString()} {registro.moneda}
                            </div>
                        </Card>

                        <div>
                            <label className="block text-sm font-medium mb-1">Notas del día</label>
                            <textarea
                                value={registro.notas}
                                onChange={(e) => setRegistro(prev => ({ ...prev, notas: e.target.value }))}
                                className="w-full p-2 border rounded"
                                rows={3}
                                placeholder="Notas generales del día..."
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={guardarRegistro} className="flex items-center gap-2">
                            <Save size={16} />
                            Guardar Registro
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
