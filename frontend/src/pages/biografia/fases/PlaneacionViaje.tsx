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

export const PlaneacionViaje: React.FC<PlaneacionViajeProps> = ({
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
        return formData.titulo.trim() && 
               formData.pais && 
               formData.ciudad && 
               formData.fechaInicio &&
               formData.presupuestoTotal &&
               formData.presupuestoTotal > 0;
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 1: Planeación del Viaje</h2>
                        <p className="text-gray-600 mt-1">
                            Define los detalles básicos de tu viaje y establece el presupuesto inicial
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!editando ? (
                            <Button
                                variant="outline"
                                onClick={() => setEditando(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Editar
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditando(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={guardarCambios}
                                    disabled={guardando || !validarDatos()}
                                    className="flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {editando ? (
                    // Formulario de edición
                    <div className="space-y-6">
                        {/* Información básica */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título del Viaje *</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full p-3 border rounded-md"
                                    placeholder="Ej: Vacaciones en Europa"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Viaje</label>
                                <select
                                    value={formData.tipoViaje}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tipoViaje: e.target.value as any }))}
                                    className="w-full p-3 border rounded-md"
                                >
                                    <option value="vacaciones">Vacaciones</option>
                                    <option value="turismo">Turismo</option>
                                    <option value="aventura">Aventura</option>
                                    <option value="trabajo">Trabajo</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Destino */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">País *</label>
                                <select
                                    value={formData.pais}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value, ciudad: '' }))}
                                    className="w-full p-3 border rounded-md"
                                >
                                    <option value="">Seleccionar país</option>
                                    {paisesDisponibles.map(pais => (
                                        <option key={pais} value={pais}>{pais}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ciudad *</label>
                                <select
                                    value={formData.ciudad}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                                    className="w-full p-3 border rounded-md"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Fin</label>
                                <input
                                    type="date"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                                    className="w-full p-3 border rounded-md"
                                    min={formData.fechaInicio}
                                />
                            </div>
                        </div>

                        {/* Presupuesto */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Presupuesto Total *</label>
                                <input
                                    type="number"
                                    value={formData.presupuestoTotal}
                                    onChange={(e) => setFormData(prev => ({ ...prev, presupuestoTotal: parseFloat(e.target.value) || 0 }))}
                                    className="w-full p-3 border rounded-md"
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Moneda</label>
                                <select
                                    value={formData.moneda}
                                    onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
                                    className="w-full p-3 border rounded-md"
                                >
                                    <option value="USD">USD - Dólares</option>
                                    <option value="EUR">EUR - Euros</option>
                                    <option value="MXN">MXN - Pesos Mexicanos</option>
                                    <option value="CAD">CAD - Dólares Canadienses</option>
                                    <option value="GBP">GBP - Libras Esterlinas</option>
                                </select>
                            </div>
                        </div>

                        {/* Acompañantes */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Acompañantes</label>
                            <input
                                type="text"
                                value={formData.acompanantes.join(', ')}
                                onChange={(e) => handleArrayInputChange('acompanantes', e.target.value)}
                                className="w-full p-3 border rounded-md"
                                placeholder="Separar con comas: María, José, Familia"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full p-3 border rounded-md"
                                rows={3}
                                placeholder="Describe tu viaje..."
                            />
                        </div>
                    </div>
                ) : (
                    // Vista de solo lectura
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Información básica */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">Información Básica</h4>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{viaje.ciudad}, {viaje.pais}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>
                                                {new Date(viaje.fechaInicio).toLocaleDateString()}
                                                {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                        {viaje.acompanantes.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Users size={16} className="text-gray-400" />
                                                <span>{viaje.acompanantes.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Presupuesto */}
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
