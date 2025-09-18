import React, { useState } from 'react';
import { 
    Save, 
    Edit, 
    MapPin, 
    Calendar, 
    Users, 
    DollarSign,
    Plane,
    ArrowRight,
    Plus,
    Trash2,
    Move,
    Clock,
    Route
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import viajesApiService, { 
    Viaje, 
    ViajeFormData, 
    ItinerarioViaje,
    SegmentoCiudad,
    ConexionTransporte 
} from '../../../services/viajesApiService';

interface PlaneacionViajeProps {
    viaje: Viaje;
    onActualizar: (viaje: Viaje) => void;
    onAvanzarFase: () => void;
}

export const PlaneacionViajeV2: React.FC<PlaneacionViajeProps> = ({
    viaje,
    onActualizar,
    onAvanzarFase
}) => {
    const [modoPlaneacion, setModoPlaneacion] = useState<'simple' | 'itinerario'>('simple');
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    
    // Estado para formulario simple (un solo destino)
    const [formData, setFormData] = useState<ViajeFormData>({
        tipoViaje: viaje.tipoViaje,
        titulo: viaje.titulo,
        descripcion: viaje.descripcion || '',
        pais: viaje.pais,
        ciudad: viaje.ciudad,
        lugaresVisitados: viaje.lugaresVisitados,
        fechaInicio: viaje.fechaInicio.split('T')[0],
        fechaFin: viaje.fechaFin?.split('T')[0] || '',
        motivoViaje: viaje.motivoViaje,
        acompanantes: viaje.acompanantes,
        medioTransporte: viaje.medioTransporte,
        lugarFavorito: viaje.lugarFavorito || '',
        comidaTypica: viaje.comidaTypica || '',
        experienciaDestacada: viaje.experienciaDestacada || '',
        presupuestoTotal: viaje.presupuestoTotal || 0,
        moneda: viaje.moneda || 'USD',
        calificacionExperiencia: viaje.calificacionExperiencia || 5,
        notas: viaje.notas || ''
    });

    // Estado para itinerario multi-ciudad
    const [itinerario, setItinerario] = useState<ItinerarioViaje>({
        ciudadOrigen: '',
        paisOrigen: '',
        fechaInicioViaje: viaje.fechaInicio.split('T')[0],
        fechaFinViaje: viaje.fechaFin?.split('T')[0] || '',
        duracionTotalDias: 0,
        presupuestoTotal: viaje.presupuestoTotal || 0,
        moneda: viaje.moneda || 'USD',
        ciudades: [],
        conexiones: []
    });

    const [nuevaCiudad, setNuevaCiudad] = useState<SegmentoCiudad>({
        ciudad: '',
        pais: '',
        fechaLlegada: '',
        fechaSalida: '',
        numeroNoches: 1,
        presupuestoHotel: 0,
        presupuestoActividades: 0,
        presupuestoComida: 0,
        notas: '',
        orden: 0
    });

    const [paisesDisponibles] = useState(viajesApiService.getPaisesDisponibles());
    const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);

    // Actualizar ciudades cuando cambia el país
    React.useEffect(() => {
        if (modoPlaneacion === 'simple' && formData.pais) {
            const ciudades = viajesApiService.getCiudadesPorPais(formData.pais);
            setCiudadesDisponibles(ciudades);
        }
    }, [formData.pais, modoPlaneacion]);

    // Calcular duración total del itinerario
    React.useEffect(() => {
        if (itinerario.fechaInicioViaje && itinerario.fechaFinViaje) {
            const inicio = new Date(itinerario.fechaInicioViaje);
            const fin = new Date(itinerario.fechaFinViaje);
            const duracion = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
            setItinerario(prev => ({ ...prev, duracionTotalDias: duracion }));
        }
    }, [itinerario.fechaInicioViaje, itinerario.fechaFinViaje]);

    const agregarCiudad = () => {
        if (nuevaCiudad.ciudad && nuevaCiudad.pais && nuevaCiudad.fechaLlegada && nuevaCiudad.fechaSalida) {
            const ciudadConOrden = {
                ...nuevaCiudad,
                orden: itinerario.ciudades.length
            };
            
            setItinerario(prev => ({
                ...prev,
                ciudades: [...prev.ciudades, ciudadConOrden]
            }));

            // Reset form
            setNuevaCiudad({
                ciudad: '',
                pais: '',
                fechaLlegada: '',
                fechaSalida: '',
                numeroNoches: 1,
                presupuestoHotel: 0,
                presupuestoActividades: 0,
                presupuestoComida: 0,
                notas: '',
                orden: 0
            });
        }
    };

    const eliminarCiudad = (index: number) => {
        setItinerario(prev => ({
            ...prev,
            ciudades: prev.ciudades.filter((_, i) => i !== index).map((ciudad, i) => ({
                ...ciudad,
                orden: i
            }))
        }));
    };

    const calcularPresupuestoTotal = () => {
        if (modoPlaneacion === 'simple') {
            return formData.presupuestoTotal;
        } else {
            return itinerario.ciudades.reduce((total, ciudad) => {
                return total + (ciudad.presupuestoHotel || 0) + 
                      (ciudad.presupuestoActividades || 0) + 
                      (ciudad.presupuestoComida || 0);
            }, 0);
        }
    };

    const guardarCambios = async () => {
        try {
            setGuardando(true);
            
            if (modoPlaneacion === 'simple') {
                const response = await viajesApiService.actualizarViaje(viaje.twinId!, viaje.id!, formData);
                
                if (response.success) {
                    onActualizar(response.data);
                    setEditando(false);
                } else {
                    alert('Error al guardar los cambios');
                }
            } else {
                // TODO: Guardar itinerario complejo
                // Aquí implementaremos la funcionalidad para guardar itinerarios multi-ciudad
                alert('Guardado de itinerarios complejos en desarrollo...');
            }
        } catch (error) {
            console.error('Error guardando cambios:', error);
            alert('Error al guardar los cambios');
        } finally {
            setGuardando(false);
        }
    };

    const handleArrayInputChange = (field: 'acompanantes', value: string) => {
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        setFormData(prev => ({ ...prev, [field]: arrayValue }));
    };

    const validarDatos = () => {
        if (modoPlaneacion === 'simple') {
            return formData.titulo.trim() && 
                   formData.pais && 
                   formData.ciudad && 
                   formData.fechaInicio &&
                   formData.presupuestoTotal &&
                   formData.presupuestoTotal > 0;
        } else {
            return itinerario.ciudadOrigen &&
                   itinerario.fechaInicioViaje &&
                   itinerario.fechaFinViaje &&
                   itinerario.ciudades.length > 0 &&
                   calcularPresupuestoTotal() > 0;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase con selector de modo */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 1: Planeación del Viaje</h2>
                        <p className="text-gray-600 mt-1">
                            Define tu destino, fechas y presupuesto. Elige entre viaje simple o itinerario complejo.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!editando && (
                            <Button
                                onClick={() => setEditando(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Editar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Selector de modo de planeación */}
                <div className="mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setModoPlaneacion('simple')}
                            className={`px-4 py-2 rounded-lg border ${
                                modoPlaneacion === 'simple' 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                    : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                Viaje Simple
                            </div>
                            <p className="text-xs mt-1">Un solo destino</p>
                        </button>
                        <button
                            onClick={() => setModoPlaneacion('itinerario')}
                            className={`px-4 py-2 rounded-lg border ${
                                modoPlaneacion === 'itinerario' 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                    : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Route size={16} />
                                Itinerario Complejo
                            </div>
                            <p className="text-xs mt-1">Múltiples ciudades</p>
                        </button>
                    </div>
                </div>

                {/* Formulario según el modo seleccionado */}
                {modoPlaneacion === 'simple' ? (
                    // MODO SIMPLE - Formulario original mejorado
                    <div>
                        {editando ? (
                            <div className="space-y-6">
                                {/* Información básica */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tipo de Viaje *</label>
                                        <select
                                            value={formData.tipoViaje}
                                            onChange={(e) => setFormData(prev => ({ 
                                                ...prev, 
                                                tipoViaje: e.target.value as any
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="vacaciones">Vacaciones</option>
                                            <option value="turismo">Turismo</option>
                                            <option value="aventura">Aventura</option>
                                            <option value="trabajo">Trabajo</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Título del Viaje *</label>
                                        <input
                                            type="text"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Ej: Vacaciones en París"
                                        />
                                    </div>
                                </div>

                                {/* Destino */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">País *</label>
                                        <select
                                            value={formData.pais}
                                            onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="">Seleccionar país</option>
                                            {paisesDisponibles.map(pais => (
                                                <option key={pais} value={pais}>{pais}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ciudad *</label>
                                        <select
                                            value={formData.ciudad}
                                            onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            disabled={!formData.pais}
                                        >
                                            <option value="">Seleccionar ciudad</option>
                                            {ciudadesDisponibles.map(ciudad => (
                                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha de Fin</label>
                                        <input
                                            type="date"
                                            value={formData.fechaFin}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Presupuesto */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Presupuesto Total *</label>
                                        <input
                                            type="number"
                                            value={formData.presupuestoTotal}
                                            onChange={(e) => setFormData(prev => ({ 
                                                ...prev, 
                                                presupuestoTotal: parseFloat(e.target.value) || 0 
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Moneda</label>
                                        <select
                                            value={formData.moneda}
                                            onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="MXN">MXN</option>
                                            <option value="COP">COP</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Motivo del Viaje</label>
                                    <input
                                        type="text"
                                        value={formData.motivoViaje}
                                        onChange={(e) => setFormData(prev => ({ ...prev, motivoViaje: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Ej: Celebrar aniversario"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Acompañantes</label>
                                    <input
                                        type="text"
                                        value={formData.acompanantes.join(', ')}
                                        onChange={(e) => handleArrayInputChange('acompanantes', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Separar por comas: Juan, María, Pedro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows={3}
                                        placeholder="Describe tu viaje..."
                                    />
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={guardarCambios}
                                        disabled={guardando || !validarDatos()}
                                        className="flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                    <Button
                                        onClick={() => setEditando(false)}
                                        variant="outline"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Vista de solo lectura para modo simple
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Destino</h4>
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-gray-400" />
                                                    <span className="text-lg">{viaje.ciudad}, {viaje.pais}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900">Fechas</h4>
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-gray-400" />
                                                    <span>
                                                        {new Date(viaje.fechaInicio).toLocaleDateString()} 
                                                        {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {viaje.acompanantes.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Acompañantes</h4>
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} className="text-gray-400" />
                                                        <span>{viaje.acompanantes.join(', ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Presupuesto</h4>
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={16} className="text-gray-400" />
                                                    <span className="text-lg font-semibold text-green-600">
                                                        {viaje.presupuestoTotal?.toLocaleString()} {viaje.moneda}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {viaje.descripcion && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                                        <p className="text-gray-600">{viaje.descripcion}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // MODO ITINERARIO COMPLEJO - Nueva funcionalidad
                    <div>
                        {editando ? (
                            <div className="space-y-6">
                                {/* Información básica del itinerario */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ciudad de Origen *</label>
                                        <input
                                            type="text"
                                            value={itinerario.ciudadOrigen}
                                            onChange={(e) => setItinerario(prev => ({ ...prev, ciudadOrigen: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Desde dónde partes"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">País de Origen *</label>
                                        <select
                                            value={itinerario.paisOrigen}
                                            onChange={(e) => setItinerario(prev => ({ ...prev, paisOrigen: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="">Seleccionar país</option>
                                            {paisesDisponibles.map(pais => (
                                                <option key={pais} value={pais}>{pais}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                        <input
                                            type="date"
                                            value={itinerario.fechaInicioViaje}
                                            onChange={(e) => setItinerario(prev => ({ ...prev, fechaInicioViaje: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha de Fin *</label>
                                        <input
                                            type="date"
                                            value={itinerario.fechaFinViaje}
                                            onChange={(e) => setItinerario(prev => ({ ...prev, fechaFinViaje: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Duración calculada */}
                                {itinerario.duracionTotalDias > 0 && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            <Clock size={16} />
                                            <span className="font-medium">
                                                Duración total: {itinerario.duracionTotalDias} días
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Agregar nueva ciudad */}
                                <Card className="p-4 border-dashed border-gray-300">
                                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Plus size={16} />
                                        Agregar Ciudad al Itinerario
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">País</label>
                                            <select
                                                value={nuevaCiudad.pais}
                                                onChange={(e) => setNuevaCiudad(prev => ({ ...prev, pais: e.target.value }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="">Seleccionar país</option>
                                                {paisesDisponibles.map(pais => (
                                                    <option key={pais} value={pais}>{pais}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Ciudad</label>
                                            <input
                                                type="text"
                                                value={nuevaCiudad.ciudad}
                                                onChange={(e) => setNuevaCiudad(prev => ({ ...prev, ciudad: e.target.value }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Nombre de la ciudad"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha Llegada</label>
                                            <input
                                                type="date"
                                                value={nuevaCiudad.fechaLlegada}
                                                onChange={(e) => setNuevaCiudad(prev => ({ ...prev, fechaLlegada: e.target.value }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha Salida</label>
                                            <input
                                                type="date"
                                                value={nuevaCiudad.fechaSalida}
                                                onChange={(e) => setNuevaCiudad(prev => ({ ...prev, fechaSalida: e.target.value }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Noches</label>
                                            <input
                                                type="number"
                                                value={nuevaCiudad.numeroNoches}
                                                onChange={(e) => setNuevaCiudad(prev => ({ 
                                                    ...prev, 
                                                    numeroNoches: parseInt(e.target.value) || 1 
                                                }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Presupuesto Hotel</label>
                                            <input
                                                type="number"
                                                value={nuevaCiudad.presupuestoHotel}
                                                onChange={(e) => setNuevaCiudad(prev => ({ 
                                                    ...prev, 
                                                    presupuestoHotel: parseFloat(e.target.value) || 0 
                                                }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Presupuesto Actividades</label>
                                            <input
                                                type="number"
                                                value={nuevaCiudad.presupuestoActividades}
                                                onChange={(e) => setNuevaCiudad(prev => ({ 
                                                    ...prev, 
                                                    presupuestoActividades: parseFloat(e.target.value) || 0 
                                                }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Presupuesto Comida</label>
                                            <input
                                                type="number"
                                                value={nuevaCiudad.presupuestoComida}
                                                onChange={(e) => setNuevaCiudad(prev => ({ 
                                                    ...prev, 
                                                    presupuestoComida: parseFloat(e.target.value) || 0 
                                                }))}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Notas</label>
                                        <textarea
                                            value={nuevaCiudad.notas}
                                            onChange={(e) => setNuevaCiudad(prev => ({ ...prev, notas: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            rows={2}
                                            placeholder="Notas sobre esta ciudad..."
                                        />
                                    </div>

                                    <Button
                                        onClick={agregarCiudad}
                                        disabled={!nuevaCiudad.ciudad || !nuevaCiudad.pais || !nuevaCiudad.fechaLlegada || !nuevaCiudad.fechaSalida}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Agregar Ciudad
                                    </Button>
                                </Card>

                                {/* Lista de ciudades agregadas */}
                                {itinerario.ciudades.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                            <Route size={16} />
                                            Itinerario Planificado ({itinerario.ciudades.length} ciudades)
                                        </h4>
                                        
                                        {itinerario.ciudades.map((ciudad, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                                {index + 1}
                                                            </div>
                                                            <h5 className="font-medium text-lg">{ciudad.ciudad}, {ciudad.pais}</h5>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Fechas:</span><br />
                                                                {new Date(ciudad.fechaLlegada).toLocaleDateString()} - {new Date(ciudad.fechaSalida).toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Duración:</span><br />
                                                                {ciudad.numeroNoches} noche{ciudad.numeroNoches !== 1 ? 's' : ''}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Presupuesto:</span><br />
                                                                ${((ciudad.presupuestoHotel || 0) + (ciudad.presupuestoActividades || 0) + (ciudad.presupuestoComida || 0)).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        
                                                        {ciudad.notas && (
                                                            <div className="mt-2 text-sm text-gray-600">
                                                                <span className="font-medium">Notas:</span> {ciudad.notas}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <Button
                                                        onClick={() => eliminarCiudad(index)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 ml-4"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                        
                                        {/* Presupuesto total calculado */}
                                        <Card className="p-4 bg-green-50 border-green-200">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-green-800">Presupuesto Total Calculado:</span>
                                                <span className="text-xl font-bold text-green-600">
                                                    ${calcularPresupuestoTotal().toLocaleString()} {itinerario.moneda}
                                                </span>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={guardarCambios}
                                        disabled={guardando || !validarDatos()}
                                        className="flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        {guardando ? 'Guardando...' : 'Guardar Itinerario'}
                                    </Button>
                                    <Button
                                        onClick={() => setEditando(false)}
                                        variant="outline"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Vista de solo lectura para itinerario complejo
                            <div className="space-y-6">
                                <div className="text-center text-gray-500 py-8">
                                    <Route size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">Modo Itinerario Complejo</p>
                                    <p className="text-sm">Haz clic en "Editar" para configurar tu itinerario multi-ciudad</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Acciones de avance */}
            {!editando && validarDatos() && (
                <div className="flex justify-end">
                    <Button
                        onClick={onAvanzarFase}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        Continuar a Bookings
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}

            {!validarDatos() && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800">
                        <strong>Información incompleta:</strong> Para avanzar a la siguiente fase, 
                        completa todos los campos obligatorios (*) y establece un presupuesto válido.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default PlaneacionViajeV2;
