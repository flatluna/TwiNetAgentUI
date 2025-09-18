import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft,
    MapPin,
    Hotel,
    Activity,
    Calendar,
    CheckCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Interfaz para el itinerario
interface ItinerarioDetalle {
    id: string;
    nombre: string;
    descripcion: string;
    fechaCreacion: string;
    // Estados de las fases
    planeacionCompleta: boolean;
    reservasCompletas: boolean;
    enCursoCompletado: boolean;
}

export const ItinerarioPage: React.FC = () => {
    const { viajeId, itinerarioId } = useParams<{ viajeId: string; itinerarioId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [itinerario, setItinerario] = useState<ItinerarioDetalle | null>(null);
    const [cargando, setCargando] = useState(true);
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (viajeId && itinerarioId && twinId) {
            cargarItinerario();
        }
    }, [viajeId, itinerarioId, twinId]);

    const cargarItinerario = async () => {
        try {
            setCargando(true);
            
            // Los datos del itinerario se cargarán del backend cuando esté implementado
            // Por ahora creamos un itinerario básico basado en el ID
            const itinerarioBasico: ItinerarioDetalle = {
                id: itinerarioId!,
                nombre: `Itinerario ${itinerarioId}`,
                descripcion: 'Descripción del itinerario',
                fechaCreacion: new Date().toISOString().split('T')[0],
                planeacionCompleta: false,
                reservasCompletas: false,
                enCursoCompletado: false
            };
            
            setItinerario(itinerarioBasico);
        } catch (error) {
            console.error('Error cargando itinerario:', error);
        } finally {
            setCargando(false);
        }
    };

    const abrirFase = (fase: 'planear' | 'reservas' | 'en-curso') => {
        navigate(`/twin-biografia/viaje/${viajeId}/itinerario/${itinerarioId}/${fase}`);
    };

    const regresarAViaje = () => {
        navigate(`/twin-biografia/viaje-activo/${viajeId}`);
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando itinerario...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!itinerario) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-red-600">Itinerario no encontrado</p>
                        <Button 
                            onClick={regresarAViaje}
                            className="mt-4"
                        >
                            Regresar al Viaje
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={regresarAViaje}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Regresar
                    </Button>
                </div>

                {/* Card del itinerario */}
                <Card className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <MapPin size={24} />
                        <h1 className="text-2xl font-bold">{itinerario.nombre}</h1>
                    </div>
                    <p className="text-green-100 text-lg mb-3">{itinerario.descripcion}</p>
                    <div className="flex items-center gap-2 text-sm text-green-100">
                        <Calendar size={16} />
                        <span>Creado el {new Date(itinerario.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                </Card>

                {/* Título de las fases */}
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Fases del Itinerario</h2>
                    <p className="text-gray-600">Completa cada fase para organizar tu itinerario</p>
                </div>

                {/* Las 3 Cards de las fases */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Fase 1: Planear */}
                    <Card 
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                            itinerario.planeacionCompleta 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-blue-300 bg-blue-50 hover:border-blue-400'
                        }`}
                        onClick={() => abrirFase('planear')}
                    >
                        <div className="text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                itinerario.planeacionCompleta 
                                    ? 'bg-green-200 text-green-700' 
                                    : 'bg-blue-200 text-blue-700'
                            }`}>
                                <MapPin size={32} />
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Planear</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Define rutas, destinos, fechas y actividades para este itinerario
                            </p>
                            
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {itinerario.planeacionCompleta ? (
                                    <>
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-green-600 font-medium text-sm">Completado</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="text-blue-600 font-medium text-sm">Pendiente</span>
                                    </>
                                )}
                            </div>
                            
                            <Button 
                                className={`w-full ${
                                    itinerario.planeacionCompleta 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {itinerario.planeacionCompleta ? 'Ver Planeación' : 'Comenzar a Planear'}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </Card>

                    {/* Fase 2: Reservas */}
                    <Card 
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                            itinerario.reservasCompletas 
                                ? 'border-green-300 bg-green-50' 
                                : itinerario.planeacionCompleta
                                    ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                                    : 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                        onClick={() => itinerario.planeacionCompleta && abrirFase('reservas')}
                    >
                        <div className="text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                itinerario.reservasCompletas 
                                    ? 'bg-green-200 text-green-700' 
                                    : itinerario.planeacionCompleta
                                        ? 'bg-orange-200 text-orange-700'
                                        : 'bg-gray-200 text-gray-500'
                            }`}>
                                <Hotel size={32} />
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservas</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Reserva hoteles, vuelos, transporte y actividades
                            </p>
                            
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {itinerario.reservasCompletas ? (
                                    <>
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-green-600 font-medium text-sm">Completado</span>
                                    </>
                                ) : itinerario.planeacionCompleta ? (
                                    <>
                                        <Clock size={16} className="text-orange-600" />
                                        <span className="text-orange-600 font-medium text-sm">Disponible</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="text-gray-500 font-medium text-sm">Bloqueado</span>
                                    </>
                                )}
                            </div>
                            
                            <Button 
                                className={`w-full ${
                                    itinerario.reservasCompletas 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : itinerario.planeacionCompleta
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!itinerario.planeacionCompleta}
                            >
                                {itinerario.reservasCompletas ? 'Ver Reservas' : 'Hacer Reservas'}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </Card>

                    {/* Fase 3: En Curso */}
                    <Card 
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                            itinerario.enCursoCompletado 
                                ? 'border-green-300 bg-green-50' 
                                : itinerario.reservasCompletas
                                    ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
                                    : 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                        onClick={() => itinerario.reservasCompletas && abrirFase('en-curso')}
                    >
                        <div className="text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                itinerario.enCursoCompletado 
                                    ? 'bg-green-200 text-green-700' 
                                    : itinerario.reservasCompletas
                                        ? 'bg-purple-200 text-purple-700'
                                        : 'bg-gray-200 text-gray-500'
                            }`}>
                                <Activity size={32} />
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">En Curso</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Registra actividades, gastos y experiencias día a día
                            </p>
                            
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {itinerario.enCursoCompletado ? (
                                    <>
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-green-600 font-medium text-sm">Completado</span>
                                    </>
                                ) : itinerario.reservasCompletas ? (
                                    <>
                                        <Clock size={16} className="text-purple-600" />
                                        <span className="text-purple-600 font-medium text-sm">Disponible</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="text-gray-500 font-medium text-sm">Bloqueado</span>
                                    </>
                                )}
                            </div>
                            
                            <Button 
                                className={`w-full ${
                                    itinerario.enCursoCompletado 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : itinerario.reservasCompletas
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!itinerario.reservasCompletas}
                            >
                                {itinerario.enCursoCompletado ? 'Ver Registros' : 'Iniciar Viaje'}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Información adicional */}
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800 text-sm">
                        <strong>Nota:</strong> Debes completar cada fase en orden. Primero planea tu itinerario, 
                        luego haz las reservas y finalmente registra tu viaje en curso.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default ItinerarioPage;
