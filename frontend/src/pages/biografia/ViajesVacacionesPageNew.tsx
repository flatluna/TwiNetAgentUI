import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    Plus, 
    BookOpen,
    ArrowLeft,
    Plane,
    MapPin,
    Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import viajesApiService, { Viaje, FaseViaje } from '../../services/viajesApiService';

export const ViajesVacacionesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viajeActivo, setViajeActivo] = useState<Viaje | null>(null);
    const [totalViajesPasados, setTotalViajesPasados] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [creandoViaje, setCreandoViaje] = useState(false);
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (twinId) {
            cargarDatos();
        }
    }, [twinId]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            
            // Buscar viaje activo (no finalizado)
            const response = await viajesApiService.getViajes(twinId!);
            const viajes = response.data || [];
            const activo = viajes.find((v: Viaje) => v.fase !== FaseViaje.FINALIZADO);
            setViajeActivo(activo || null);
            
            // Contar viajes finalizados
            const finalizados = viajes.filter((v: Viaje) => v.fase === FaseViaje.FINALIZADO);
            setTotalViajesPasados(finalizados.length);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setCargando(false);
        }
    };

    const crearNuevoViaje = async () => {
        try {
            setCreandoViaje(true);
            
            const nuevoViaje: Partial<Viaje> = {
                twinId: twinId!,
                fase: FaseViaje.PLANEACION,
                tipoViaje: 'vacaciones',
                titulo: 'Nuevo Viaje',
                descripcion: '',
                pais: '',
                ciudad: '',
                lugaresVisitados: [],
                fechaInicio: new Date().toISOString().split('T')[0],
                motivoViaje: '',
                acompanantes: [],
                medioTransporte: 'avion',
                presupuestoTotal: 0,
                moneda: 'USD'
            };
            
            const viajeCreado = await viajesApiService.crearViaje(twinId!, nuevoViaje as Viaje);
            
            // Navegar directamente a la página del viaje activo
            navigate(`/twin-biografia/viaje-activo/${viajeCreado.data.id}`);
            
        } catch (error) {
            console.error('Error creando viaje:', error);
            alert('Error al crear el viaje');
        } finally {
            setCreandoViaje(false);
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Plane className="text-blue-600" size={28} />
                                    Mis Viajes y Vacaciones
                                </h1>
                                <p className="text-gray-600">Gestiona tus aventuras y experiencias de viaje</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card: Viaje Activo o Crear Nuevo */}
                    {viajeActivo ? (
                        <Card className="p-6 border-2 border-green-200 bg-green-50">
                            <div className="text-center mb-4">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plane size={32} className="text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-green-900 mb-2">Viaje Activo</h2>
                                <p className="text-green-700">Tienes un viaje en progreso</p>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin size={16} className="text-green-600" />
                                    <span className="font-medium">{viajeActivo.titulo}</span>
                                </div>
                                {viajeActivo.ciudad && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>{viajeActivo.ciudad}, {viajeActivo.pais}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={16} />
                                    <span>{new Date(viajeActivo.fechaInicio).toLocaleDateString()}</span>
                                    {viajeActivo.fechaFin && (
                                        <span> - {new Date(viajeActivo.fechaFin).toLocaleDateString()}</span>
                                    )}
                                </div>
                                
                                {/* Indicador de fase actual */}
                                <div className="mt-4 p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Fase Actual:</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            viajeActivo.fase === FaseViaje.PLANEACION ? 'bg-blue-500' :
                                            viajeActivo.fase === FaseViaje.BOOKINGS ? 'bg-orange-500' :
                                            viajeActivo.fase === FaseViaje.EN_CURSO ? 'bg-green-500' :
                                            'bg-purple-500'
                                        }`}></div>
                                        <span className="text-sm font-medium capitalize">
                                            {viajeActivo.fase.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => navigate(`/twin-biografia/viaje-activo/${viajeActivo.id}`)}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Continuar Viaje
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-6 border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                            <div className="text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={32} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Nuevo Viaje</h2>
                                <p className="text-gray-600 mb-6">
                                    Comienza a planificar tu próxima aventura
                                </p>
                                <Button 
                                    onClick={crearNuevoViaje}
                                    disabled={creandoViaje}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {creandoViaje ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Plus size={16} />
                                            Crear Nuevo Viaje
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Card: Historial de Viajes */}
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => navigate('/twin-biografia/historial-viajes')}>
                        <div className="text-center">
                            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={32} className="text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Historial de Viajes</h2>
                            <p className="text-gray-600 mb-4">
                                Revisa tus aventuras pasadas
                            </p>
                            
                            <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                <div className="text-3xl font-bold text-purple-900">
                                    {totalViajesPasados}
                                </div>
                                <div className="text-sm text-purple-600">
                                    {totalViajesPasados === 1 ? 'Viaje Completado' : 'Viajes Completados'}
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                                {totalViajesPasados > 0 ? 'Haz clic para explorar' : 'Aún no tienes viajes completados'}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Mensaje informativo */}
                {!viajeActivo && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2 mt-1">
                                <Plane size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">¿Cómo funciona?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Solo puedes tener un viaje activo a la vez</li>
                                    <li>• El viaje pasa por 4 fases: Planeación → Bookings → En Curso → Finalizado</li>
                                    <li>• Una vez finalizado, se guarda en tu historial</li>
                                    <li>• Podrás crear un nuevo viaje cuando termines el actual</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
