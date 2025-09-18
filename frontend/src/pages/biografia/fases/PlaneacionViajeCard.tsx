import React, { useState } from 'react';
import { 
    Save, 
    Edit, 
    MapPin, 
    Calendar, 
    Users, 
    DollarSign,
    Plus,
    ArrowRight,
    CheckCircle,
    Clock,
    Plane,
    Hotel,
    Activity,
    BarChart3,
    Trash2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import viajesApiService, { 
    Viaje, 
    ViajeFormData,
    FaseViaje
} from '../../../services/viajesApiService';

// Interfaz para un itinerario individual
interface ItinerarioIndividual {
    id: string;
    titulo: string;
    ciudadOrigen: string;
    paisOrigen: string;
    ciudadDestino: string;
    paisDestino: string;
    fechaInicio: string;
    fechaFin: string;
    presupuesto: number;
    moneda: string;
    fase: 'planeacion' | 'reservas' | 'en_curso' | 'finalizado';
    descripcion?: string;
    // Datos específicos por fase
    planCompleto?: boolean;
    reservasCompletadas?: boolean;
    viajeIniciado?: boolean;
    viajeCompletado?: boolean;
}

interface PlaneacionViajeCardProps {
    viaje: Viaje;
    onActualizar: (viaje: Viaje) => void;
    onAvanzarFase: () => void;
}

export const PlaneacionViajeCard: React.FC<PlaneacionViajeCardProps> = ({
    viaje,
    onActualizar,
    onAvanzarFase
}) => {
    const [itinerarios, setItinerarios] = useState<ItinerarioIndividual[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    
    // Estado para nuevo itinerario
    const [nuevoItinerario, setNuevoItinerario] = useState<Partial<ItinerarioIndividual>>({
        titulo: '',
        ciudadOrigen: '',
        paisOrigen: '',
        ciudadDestino: '',
        paisDestino: '',
        fechaInicio: '',
        fechaFin: '',
        presupuesto: 0,
        moneda: 'USD',
        fase: 'planeacion',
        descripcion: ''
    });

    const [paisesDisponibles] = useState(viajesApiService.getPaisesDisponibles());

    const crearNuevoItinerario = () => {
        if (nuevoItinerario.titulo && nuevoItinerario.ciudadOrigen && nuevoItinerario.ciudadDestino) {
            const itinerario: ItinerarioIndividual = {
                id: `itin_${Date.now()}`,
                titulo: nuevoItinerario.titulo!,
                ciudadOrigen: nuevoItinerario.ciudadOrigen!,
                paisOrigen: nuevoItinerario.paisOrigen!,
                ciudadDestino: nuevoItinerario.ciudadDestino!,
                paisDestino: nuevoItinerario.paisDestino!,
                fechaInicio: nuevoItinerario.fechaInicio!,
                fechaFin: nuevoItinerario.fechaFin!,
                presupuesto: nuevoItinerario.presupuesto || 0,
                moneda: nuevoItinerario.moneda || 'USD',
                fase: 'planeacion',
                descripcion: nuevoItinerario.descripcion,
                planCompleto: false,
                reservasCompletadas: false,
                viajeIniciado: false,
                viajeCompletado: false
            };

            setItinerarios(prev => [...prev, itinerario]);
            setMostrarFormulario(false);
            
            // Reset form
            setNuevoItinerario({
                titulo: '',
                ciudadOrigen: '',
                paisOrigen: '',
                ciudadDestino: '',
                paisDestino: '',
                fechaInicio: '',
                fechaFin: '',
                presupuesto: 0,
                moneda: 'USD',
                fase: 'planeacion',
                descripcion: ''
            });
        }
    };

    const eliminarItinerario = (id: string) => {
        setItinerarios(prev => prev.filter(itin => itin.id !== id));
    };

    const avanzarFaseItinerario = (id: string) => {
        setItinerarios(prev => prev.map(itin => {
            if (itin.id === id) {
                switch (itin.fase) {
                    case 'planeacion':
                        return { ...itin, fase: 'reservas', planCompleto: true };
                    case 'reservas':
                        return { ...itin, fase: 'en_curso', reservasCompletadas: true };
                    case 'en_curso':
                        return { ...itin, fase: 'finalizado', viajeCompletado: true };
                    default:
                        return itin;
                }
            }
            return itin;
        }));
    };

    const getFaseIcon = (fase: string) => {
        switch (fase) {
            case 'planeacion': return <MapPin size={16} />;
            case 'reservas': return <Hotel size={16} />;
            case 'en_curso': return <Activity size={16} />;
            case 'finalizado': return <BarChart3 size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getFaseColor = (fase: string) => {
        switch (fase) {
            case 'planeacion': return 'border-blue-300 bg-blue-50 text-blue-700';
            case 'reservas': return 'border-orange-300 bg-orange-50 text-orange-700';
            case 'en_curso': return 'border-green-300 bg-green-50 text-green-700';
            case 'finalizado': return 'border-purple-300 bg-purple-50 text-purple-700';
            default: return 'border-gray-300 bg-gray-50 text-gray-700';
        }
    };

    const getFaseTexto = (fase: string) => {
        switch (fase) {
            case 'planeacion': return 'Planeación';
            case 'reservas': return 'Reservas';
            case 'en_curso': return 'En Curso';
            case 'finalizado': return 'Finalizado';
            default: return 'Pendiente';
        }
    };

    const calcularPresupuestoTotal = () => {
        return itinerarios.reduce((total, itin) => total + itin.presupuesto, 0);
    };

    const validarDatos = () => {
        return itinerarios.length > 0 && itinerarios.every(itin => itin.planCompleto);
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 1: Planeación del Viaje</h2>
                        <p className="text-gray-600 mt-1">
                            Crea itinerarios independientes para tu viaje. Cada itinerario tiene sus propias fases.
                        </p>
                    </div>
                </div>

                {/* Resumen general */}
                {itinerarios.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{itinerarios.length}</div>
                                <div className="text-sm text-gray-600">Itinerarios</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    ${calcularPresupuestoTotal().toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Presupuesto Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {itinerarios.filter(i => i.planCompleto).length}/{itinerarios.length}
                                </div>
                                <div className="text-sm text-gray-600">Completos</div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Lista de itinerarios existentes */}
            {itinerarios.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Itinerarios del Viaje</h3>
                    
                    {itinerarios.map((itinerario) => (
                        <Card key={itinerario.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {itinerario.titulo}
                                        </h4>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getFaseColor(itinerario.fase)}`}>
                                            <div className="flex items-center gap-1">
                                                {getFaseIcon(itinerario.fase)}
                                                {getFaseTexto(itinerario.fase)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Plane size={14} />
                                            <span>{itinerario.ciudadOrigen}, {itinerario.paisOrigen}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{itinerario.ciudadDestino}, {itinerario.paisDestino}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(itinerario.fechaInicio).toLocaleDateString()} - {new Date(itinerario.fechaFin).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} />
                                            <span className="font-medium text-green-600">
                                                ${itinerario.presupuesto.toLocaleString()} {itinerario.moneda}
                                            </span>
                                        </div>
                                    </div>

                                    {itinerario.descripcion && (
                                        <p className="mt-2 text-sm text-gray-600">{itinerario.descripcion}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {itinerario.fase !== 'finalizado' && (
                                        <Button
                                            onClick={() => avanzarFaseItinerario(itinerario.id)}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            {itinerario.fase === 'planeacion' && 'Ir a Reservas'}
                                            {itinerario.fase === 'reservas' && 'Iniciar Viaje'}
                                            {itinerario.fase === 'en_curso' && 'Finalizar'}
                                            <ArrowRight size={14} />
                                        </Button>
                                    )}
                                    
                                    <Button
                                        onClick={() => eliminarItinerario(itinerario.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            {/* Fases internas del itinerario */}
                            <div className="mt-4 flex gap-2">
                                <div className={`flex-1 p-3 rounded-lg border-2 ${
                                    itinerario.fase === 'planeacion' 
                                        ? 'border-blue-300 bg-blue-50' 
                                        : itinerario.planCompleto 
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {itinerario.planCompleto ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} />}
                                        Plan
                                    </div>
                                </div>
                                <div className={`flex-1 p-3 rounded-lg border-2 ${
                                    itinerario.fase === 'reservas' 
                                        ? 'border-orange-300 bg-orange-50' 
                                        : itinerario.reservasCompletadas 
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {itinerario.reservasCompletadas ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} />}
                                        Reservas
                                    </div>
                                </div>
                                <div className={`flex-1 p-3 rounded-lg border-2 ${
                                    itinerario.fase === 'en_curso' 
                                        ? 'border-green-300 bg-green-50' 
                                        : itinerario.viajeIniciado 
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {itinerario.viajeIniciado ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} />}
                                        En Curso
                                    </div>
                                </div>
                                <div className={`flex-1 p-3 rounded-lg border-2 ${
                                    itinerario.fase === 'finalizado' 
                                        ? 'border-purple-300 bg-purple-50' 
                                        : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {itinerario.viajeCompletado ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} />}
                                        Dashboard
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Card para crear nuevo itinerario */}
            <Card className="p-6 border-dashed border-gray-300">
                {!mostrarFormulario ? (
                    <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Plus size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nuevo Itinerario</h3>
                        <p className="text-gray-600 mb-4">
                            Crea un nuevo itinerario para tu viaje. Cada uno tendrá sus propias fases de planeación.
                        </p>
                        <Button
                            onClick={() => setMostrarFormulario(true)}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} />
                            Crear Itinerario
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Nuevo Itinerario</h3>
                            <Button
                                onClick={() => setMostrarFormulario(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancelar
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Título del Itinerario *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.titulo}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ej: París - Roma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Presupuesto *</label>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">País de Origen *</label>
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
                                <label className="block text-sm font-medium mb-2">Ciudad de Origen *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.ciudadOrigen}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, ciudadOrigen: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ciudad de partida"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">País de Destino *</label>
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
                                <label className="block text-sm font-medium mb-2">Ciudad de Destino *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.ciudadDestino}
                                    onChange={(e) => setNuevoItinerario(prev => ({ ...prev, ciudadDestino: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ciudad de destino"
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
                                <Save size={16} />
                                Crear Itinerario
                            </Button>
                        </div>
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

            {itinerarios.length > 0 && !validarDatos() && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800">
                        <strong>Planificación incompleta:</strong> Para avanzar a la siguiente fase, 
                        completa la planeación de todos los itinerarios.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default PlaneacionViajeCard;
