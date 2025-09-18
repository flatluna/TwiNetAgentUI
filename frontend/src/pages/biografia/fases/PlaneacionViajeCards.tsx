import React, { useState } from 'react';
import { 
    Plus, 
    MapPin, 
    Calendar, 
    DollarSign,
    Edit,
    ArrowRight,
    Clock,
    Route,
    Plane,
    Hotel,
    Activity,
    CheckCircle,
    Lock
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import viajesApiService, { 
    Viaje, 
    ItinerarioViaje,
    SegmentoCiudad,
    FaseViaje 
} from '../../../services/viajesApiService';

interface PlaneacionViajeCardsProps {
    viaje: Viaje;
    onActualizar: (viaje: Viaje) => void;
    onAvanzarFase: () => void;
}

interface ItinerarioConFases extends ItinerarioViaje {
    faseActual: 'planificacion' | 'reservas' | 'en_curso' | 'completado';
    progreso: number; // 0-100
}

export const PlaneacionViajeCards: React.FC<PlaneacionViajeCardsProps> = ({
    viaje,
    onActualizar,
    onAvanzarFase
}) => {
    const [itinerarios, setItinerarios] = useState<ItinerarioConFases[]>([]);
    const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);
    const [nuevoItinerario, setNuevoItinerario] = useState({
        titulo: '',
        ciudadOrigen: '',
        paisOrigen: '',
        ciudadDestino: '',
        paisDestino: '',
        fechaInicio: '',
        fechaFin: '',
        presupuesto: 0,
        descripcion: ''
    });

    const [paisesDisponibles] = useState(viajesApiService.getPaisesDisponibles());

    const crearNuevoItinerario = () => {
        if (nuevoItinerario.titulo && nuevoItinerario.ciudadOrigen && nuevoItinerario.ciudadDestino) {
            const duracion = Math.ceil(
                (new Date(nuevoItinerario.fechaFin).getTime() - new Date(nuevoItinerario.fechaInicio).getTime()) 
                / (1000 * 60 * 60 * 24)
            );

            const itinerario: ItinerarioConFases = {
                id: `temp-${Date.now()}`,
                viajeId: viaje.id,
                ciudadOrigen: nuevoItinerario.ciudadOrigen,
                paisOrigen: nuevoItinerario.paisOrigen,
                fechaInicioViaje: nuevoItinerario.fechaInicio,
                fechaFinViaje: nuevoItinerario.fechaFin,
                duracionTotalDias: duracion,
                presupuestoTotal: nuevoItinerario.presupuesto,
                moneda: viaje.moneda || 'USD',
                ciudades: [{
                    ciudad: nuevoItinerario.ciudadDestino,
                    pais: nuevoItinerario.paisDestino,
                    fechaLlegada: nuevoItinerario.fechaInicio,
                    fechaSalida: nuevoItinerario.fechaFin,
                    numeroNoches: duracion,
                    presupuestoHotel: 0,
                    presupuestoActividades: 0,
                    presupuestoComida: 0,
                    notas: nuevoItinerario.descripcion,
                    orden: 0
                }],
                conexiones: [],
                faseActual: 'planificacion',
                progreso: 25
            };

            setItinerarios(prev => [...prev, itinerario]);
            setMostrarFormularioNuevo(false);
            setNuevoItinerario({
                titulo: '',
                ciudadOrigen: '',
                paisOrigen: '',
                ciudadDestino: '',
                paisDestino: '',
                fechaInicio: '',
                fechaFin: '',
                presupuesto: 0,
                descripcion: ''
            });
        }
    };

    const avanzarFaseItinerario = (itinerarioId: string) => {
        setItinerarios(prev => prev.map(it => {
            if (it.id === itinerarioId) {
                let nuevaFase = it.faseActual;
                let nuevoProgreso = it.progreso;

                switch (it.faseActual) {
                    case 'planificacion':
                        nuevaFase = 'reservas';
                        nuevoProgreso = 50;
                        break;
                    case 'reservas':
                        nuevaFase = 'en_curso';
                        nuevoProgreso = 75;
                        break;
                    case 'en_curso':
                        nuevaFase = 'completado';
                        nuevoProgreso = 100;
                        break;
                }

                return { ...it, faseActual: nuevaFase, progreso: nuevoProgreso };
            }
            return it;
        }));
    };

    const getFaseInfo = (fase: string) => {
        switch (fase) {
            case 'planificacion':
                return {
                    nombre: 'Planificación',
                    icono: <Route size={16} />,
                    color: 'text-blue-600 bg-blue-50 border-blue-200'
                };
            case 'reservas':
                return {
                    nombre: 'Reservas',
                    icono: <Hotel size={16} />,
                    color: 'text-orange-600 bg-orange-50 border-orange-200'
                };
            case 'en_curso':
                return {
                    nombre: 'En Curso',
                    icono: <Activity size={16} />,
                    color: 'text-purple-600 bg-purple-50 border-purple-200'
                };
            case 'completado':
                return {
                    nombre: 'Completado',
                    icono: <CheckCircle size={16} />,
                    color: 'text-green-600 bg-green-50 border-green-200'
                };
            default:
                return {
                    nombre: 'Planificación',
                    icono: <Route size={16} />,
                    color: 'text-blue-600 bg-blue-50 border-blue-200'
                };
        }
    };

    const validarDatos = () => {
        return itinerarios.length > 0 && itinerarios.some(it => it.progreso >= 25);
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 1: Planeación del Viaje</h2>
                        <p className="text-gray-600 mt-1">
                            Crea itinerarios independientes. Cada itinerario tendrá sus propias fases de planificación, reservas y seguimiento.
                        </p>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                {itinerarios.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Route size={20} className="text-blue-600" />
                                <div>
                                    <p className="text-sm text-blue-600">Total Itinerarios</p>
                                    <p className="text-xl font-bold text-blue-700">{itinerarios.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <DollarSign size={20} className="text-green-600" />
                                <div>
                                    <p className="text-sm text-green-600">Presupuesto Total</p>
                                    <p className="text-xl font-bold text-green-700">
                                        ${itinerarios.reduce((sum, it) => sum + (it.presupuestoTotal || 0), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-purple-600" />
                                <div>
                                    <p className="text-sm text-purple-600">Total Días</p>
                                    <p className="text-xl font-bold text-purple-700">
                                        {itinerarios.reduce((sum, it) => sum + (it.duracionTotalDias || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} className="text-orange-600" />
                                <div>
                                    <p className="text-sm text-orange-600">Completados</p>
                                    <p className="text-xl font-bold text-orange-700">
                                        {itinerarios.filter(it => it.faseActual === 'completado').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Botón para crear nuevo itinerario */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Itinerarios del Viaje</h3>
                <Button
                    onClick={() => setMostrarFormularioNuevo(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Crear Itinerario
                </Button>
            </div>

            {/* Formulario para nuevo itinerario */}
            {mostrarFormularioNuevo && (
                <Card className="p-6 border-dashed border-blue-300 bg-blue-50">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Plus size={16} />
                        Crear Nuevo Itinerario
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Título del Itinerario *</label>
                            <input
                                type="text"
                                value={nuevoItinerario.titulo}
                                onChange={(e) => setNuevoItinerario(prev => ({ ...prev, titulo: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Ej: París - Roma - Barcelona"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">De: País de Origen *</label>
                                <select
                                    value={nuevoItinerario.paisOrigen}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, paisOrigen: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Seleccionar país</option>
                                    {paisesDisponibles.map(pais => (
                                        <option key={pais} value={pais}>{pais}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">De: Ciudad de Origen *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.ciudadOrigen}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, ciudadOrigen: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ciudad desde donde partes"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">A: País de Destino *</label>
                                <select
                                    value={nuevoItinerario.paisDestino}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, paisDestino: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Seleccionar país</option>
                                    {paisesDisponibles.map(pais => (
                                        <option key={pais} value={pais}>{pais}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">A: Ciudad de Destino *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.ciudadDestino}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, ciudadDestino: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ciudad de destino principal"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    value={nuevoItinerario.fechaInicio}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha de Fin *</label>
                                <input
                                    type="date"
                                    value={nuevoItinerario.fechaFin}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, fechaFin: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Presupuesto Estimado</label>
                            <input
                                type="number"
                                value={nuevoItinerario.presupuesto}
                                onChange={(e) => setNuevoItinerario(prev => ({ 
                                    ...prev, 
                                    presupuesto: parseFloat(e.target.value) || 0 
                                }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Descripción</label>
                            <textarea
                                value={nuevoItinerario.descripcion}
                                onChange={(e) => setNuevoItinerario(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                                placeholder="Describe este itinerario..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={crearNuevoItinerario}
                                disabled={!nuevoItinerario.titulo || !nuevoItinerario.ciudadOrigen || !nuevoItinerario.ciudadDestino}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Crear Itinerario
                            </Button>
                            <Button
                                onClick={() => setMostrarFormularioNuevo(false)}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Lista de itinerarios creados */}
            {itinerarios.length === 0 && !mostrarFormularioNuevo && (
                <Card className="p-12 text-center">
                    <Route size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay itinerarios creados</h3>
                    <p className="text-gray-600 mb-4">
                        Crea tu primer itinerario para comenzar a planificar tu viaje
                    </p>
                    <Button
                        onClick={() => setMostrarFormularioNuevo(true)}
                        className="flex items-center gap-2 mx-auto"
                    >
                        <Plus size={16} />
                        Crear Primer Itinerario
                    </Button>
                </Card>
            )}

            {/* Cards de itinerarios */}
            <div className="grid grid-cols-1 gap-6">
                {itinerarios.map((itinerario, index) => {
                    const faseInfo = getFaseInfo(itinerario.faseActual);
                    
                    return (
                        <Card key={itinerario.id} className="p-6 hover:shadow-lg transition-shadow">
                            {/* Header del itinerario */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {itinerario.ciudades[0]?.ciudad || 'Itinerario sin nombre'}
                                        </h4>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${faseInfo.color}`}>
                                            <div className="flex items-center gap-1">
                                                {faseInfo.icono}
                                                {faseInfo.nombre}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{itinerario.ciudadOrigen} → {itinerario.ciudades[0]?.ciudad}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(itinerario.fechaInicioViaje).toLocaleDateString()} - 
                                                {new Date(itinerario.fechaFinViaje).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{itinerario.duracionTotalDias} días</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-green-600 mb-2">
                                        <DollarSign size={16} />
                                        ${itinerario.presupuestoTotal?.toLocaleString()} {itinerario.moneda}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Progreso: {itinerario.progreso}%
                                    </div>
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${itinerario.progreso}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Fases del itinerario */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                {['planificacion', 'reservas', 'en_curso', 'completado'].map((fase, faseIndex) => {
                                    const faseInfoItem = getFaseInfo(fase);
                                    const esFaseActual = itinerario.faseActual === fase;
                                    const esFaseCompletada = ['planificacion', 'reservas', 'en_curso', 'completado'].indexOf(itinerario.faseActual) > faseIndex;
                                    const esFaseBloqueada = ['planificacion', 'reservas', 'en_curso', 'completado'].indexOf(itinerario.faseActual) < faseIndex;

                                    return (
                                        <div
                                            key={fase}
                                            className={`p-3 rounded-lg border text-center ${
                                                esFaseActual 
                                                    ? faseInfoItem.color
                                                    : esFaseCompletada 
                                                        ? 'text-green-600 bg-green-50 border-green-200'
                                                        : 'text-gray-400 bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                {esFaseCompletada ? <CheckCircle size={14} /> : esFaseBloqueada ? <Lock size={14} /> : faseInfoItem.icono}
                                            </div>
                                            <p className="text-xs font-medium">{faseInfoItem.nombre}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Acciones del itinerario */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Edit size={14} />
                                    Editar
                                </Button>
                                
                                {itinerario.faseActual !== 'completado' && (
                                    <Button
                                        onClick={() => avanzarFaseItinerario(itinerario.id!)}
                                        size="sm"
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <ArrowRight size={14} />
                                        Avanzar Fase
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Acciones de avance de fase principal */}
            {validarDatos() && (
                <div className="flex justify-end">
                    <Button
                        onClick={onAvanzarFase}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        Continuar a Bookings Generales
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}

            {!validarDatos() && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800">
                        <strong>Información incompleta:</strong> Crea al menos un itinerario para avanzar a la siguiente fase del viaje.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default PlaneacionViajeCards;
