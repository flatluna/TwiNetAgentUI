import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Plus,
    MapPin,
    Calendar,
    DollarSign,
    Plane,
    Hotel,
    Activity,
    BarChart3,
    CheckCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import viajesApiService, { Viaje } from '../../services/viajesApiService';

// Interfaz para un itinerario individual
interface ItinerarioItem {
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
    // Estados de las fases
    planeacionCompleta: boolean;
    bookingCompleto: boolean;
    itinerarioEnCurso: boolean;
    itinerarioCompletado: boolean;
}

export const ViajeItinerariosPage: React.FC = () => {
    const { viajeId } = useParams<{ viajeId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viaje, setViaje] = useState<Viaje | null>(null);
    const [itinerarios, setItinerarios] = useState<ItinerarioItem[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (viajeId && twinId) {
            cargarViaje();
        }
    }, [viajeId, twinId]);

    const cargarViaje = async () => {
        try {
            setCargando(true);
            setError(null);
            
            // Si es un ID temporal, mostrar datos temporales
            if (viajeId?.startsWith('temp_')) {
                const viajeTemp: Viaje = {
                    id: viajeId,
                    twinId: twinId!,
                    fase: 'planeacion' as any,
                    tipoViaje: 'vacaciones',
                    titulo: 'Nuevo Viaje',
                    descripcion: '',
                    pais: '',
                    ciudad: '',
                    lugaresVisitados: [],
                    fechaInicio: new Date().toISOString(),
                    fechaFin: '',
                    motivoViaje: '',
                    acompanantes: [],
                    medioTransporte: 'avion',
                    presupuestoTotal: 0,
                    moneda: 'USD'
                };
                setViaje(viajeTemp);
            } else {
                const response = await viajesApiService.obtenerViaje(twinId!, viajeId!);
                if (response.success) {
                    setViaje(response.data);
                    // Cargar itinerarios asociados (por ahora mock)
                    cargarItinerarios();
                } else {
                    setError('No se pudo cargar el viaje');
                }
            }
        } catch (error) {
            console.error('Error cargando viaje:', error);
            setError('Error al cargar el viaje');
        } finally {
            setCargando(false);
        }
    };

    const cargarItinerarios = () => {
        // Los itinerarios se cargarán del backend cuando esté implementado
        setItinerarios([]);
    };

    const crearNuevoItinerario = () => {
        navigate(`/twin-biografia/viaje-activo/${viajeId}/itinerario/nuevo`);
    };

    const abrirItinerario = (itinerarioId: string, fase: 'planeacion' | 'booking' | 'en-curso') => {
        navigate(`/twin-biografia/viaje-activo/${viajeId}/itinerario/${itinerarioId}/${fase}`);
    };

    const abrirDashboard = () => {
        navigate(`/twin-biografia/viaje-activo/${viajeId}/dashboard`);
    };

    const calcularEstadisticas = () => {
        const total = itinerarios.length;
        const completados = itinerarios.filter(i => i.itinerarioCompletado).length;
        const presupuestoTotal = itinerarios.reduce((sum, i) => sum + i.presupuesto, 0);
        
        return { total, completados, presupuestoTotal };
    };

    const getFaseActual = (itinerario: ItinerarioItem) => {
        if (!itinerario.planeacionCompleta) return 'planeacion';
        if (!itinerario.bookingCompleto) return 'booking';
        if (!itinerario.itinerarioCompletado) return 'en-curso';
        return 'completado';
    };

    const getFaseColor = (fase: string) => {
        switch (fase) {
            case 'planeacion': return 'border-blue-300 bg-blue-50 text-blue-700';
            case 'booking': return 'border-orange-300 bg-orange-50 text-orange-700';
            case 'en-curso': return 'border-green-300 bg-green-50 text-green-700';
            case 'completado': return 'border-purple-300 bg-purple-50 text-purple-700';
            default: return 'border-gray-300 bg-gray-50 text-gray-700';
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando viaje...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !viaje) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-red-600">{error || 'Viaje no encontrado'}</p>
                        <Button 
                            onClick={() => navigate('/twin-biografia/viajes-vacaciones')}
                            className="mt-4"
                        >
                            Volver a Viajes
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = calcularEstadisticas();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate('/twin-biografia/viajes-vacaciones')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {viaje.titulo || 'Nuevo Viaje'}
                            </h1>
                            <p className="text-gray-600">
                                Gestiona los itinerarios de tu viaje
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen general */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Viaje</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Itinerarios</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.completados}</div>
                            <div className="text-sm text-gray-600">Completados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                ${stats.presupuestoTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Presupuesto Total</div>
                        </div>
                        <div className="text-center">
                            <Button
                                onClick={abrirDashboard}
                                className="flex items-center gap-2 mx-auto"
                            >
                                <BarChart3 size={16} />
                                Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Lista de itinerarios */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Itinerarios</h2>
                        <Button
                            onClick={crearNuevoItinerario}
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Nuevo Itinerario
                        </Button>
                    </div>

                    {/* Itinerarios existentes */}
                    {itinerarios.map((itinerario) => (
                        <Card key={itinerario.id} className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {itinerario.titulo}
                                        </h3>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getFaseColor(getFaseActual(itinerario))}`}>
                                            {getFaseActual(itinerario) === 'planeacion' && 'En Planeación'}
                                            {getFaseActual(itinerario) === 'booking' && 'Reservando'}
                                            {getFaseActual(itinerario) === 'en-curso' && 'En Curso'}
                                            {getFaseActual(itinerario) === 'completado' && 'Completado'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
                                </div>
                            </div>

                            {/* Cards de las 3 fases */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Fase 1: Planeación */}
                                <Card 
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                                        getFaseActual(itinerario) === 'planeacion' 
                                            ? 'border-blue-300 bg-blue-50' 
                                            : itinerario.planeacionCompleta 
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200 bg-gray-50'
                                    }`}
                                    onClick={() => abrirItinerario(itinerario.id, 'planeacion')}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={20} className={
                                                itinerario.planeacionCompleta ? 'text-green-600' : 'text-blue-600'
                                            } />
                                            <h4 className="font-medium">Planeación</h4>
                                        </div>
                                        {itinerario.planeacionCompleta ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                        ) : (
                                            <Clock size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Define rutas, actividades y detalles del itinerario
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-medium ${
                                            itinerario.planeacionCompleta ? 'text-green-600' : 'text-blue-600'
                                        }`}>
                                            {itinerario.planeacionCompleta ? 'Completado' : 'Pendiente'}
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                </Card>

                                {/* Fase 2: Booking */}
                                <Card 
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                                        getFaseActual(itinerario) === 'booking' 
                                            ? 'border-orange-300 bg-orange-50' 
                                            : itinerario.bookingCompleto 
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200 bg-gray-50'
                                    }`}
                                    onClick={() => abrirItinerario(itinerario.id, 'booking')}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Hotel size={20} className={
                                                itinerario.bookingCompleto ? 'text-green-600' : 'text-orange-600'
                                            } />
                                            <h4 className="font-medium">Booking</h4>
                                        </div>
                                        {itinerario.bookingCompleto ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                        ) : (
                                            <Clock size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Reserva hoteles, vuelos y actividades
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-medium ${
                                            itinerario.bookingCompleto ? 'text-green-600' : 'text-orange-600'
                                        }`}>
                                            {itinerario.bookingCompleto ? 'Completado' : 'Pendiente'}
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                </Card>

                                {/* Fase 3: Itinerario en Curso */}
                                <Card 
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                                        getFaseActual(itinerario) === 'en-curso' 
                                            ? 'border-green-300 bg-green-50' 
                                            : itinerario.itinerarioCompletado 
                                                ? 'border-purple-300 bg-purple-50'
                                                : 'border-gray-200 bg-gray-50'
                                    }`}
                                    onClick={() => abrirItinerario(itinerario.id, 'en-curso')}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Activity size={20} className={
                                                itinerario.itinerarioCompletado ? 'text-purple-600' : 'text-green-600'
                                            } />
                                            <h4 className="font-medium">En Curso</h4>
                                        </div>
                                        {itinerario.itinerarioCompletado ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                        ) : (
                                            <Clock size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Gestiona actividades día a día durante el viaje
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-medium ${
                                            itinerario.itinerarioCompletado ? 'text-purple-600' : 'text-green-600'
                                        }`}>
                                            {itinerario.itinerarioCompletado ? 'Completado' : 'Pendiente'}
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                </Card>
                            </div>
                        </Card>
                    ))}

                    {/* Card para crear nuevo itinerario */}
                    {itinerarios.length === 0 && (
                        <Card className="p-12 border-dashed border-gray-300 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Plus size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Crea tu primer itinerario
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Comienza planeando un itinerario para tu viaje. Cada itinerario tendrá sus propias fases.
                            </p>
                            <Button
                                onClick={crearNuevoItinerario}
                                className="flex items-center gap-2 mx-auto"
                            >
                                <Plus size={16} />
                                Crear Primer Itinerario
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViajeItinerariosPage;
