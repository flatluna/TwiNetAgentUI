import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Lock,
    MapPin,
    Calendar,
    DollarSign,
    Plane,
    Hotel,
    Activity,
    BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import viajesApiService, { Viaje, FaseViaje } from '../../services/viajesApiService';

// Importar los componentes de cada fase
import PlaneacionViajeCard from './fases/PlaneacionViajeCard';
import { BookingsViaje } from './fases/BookingsViaje';
import { ActividadesDiarias } from './fases/ActividadesDiarias';
import { DashboardFinal } from './fases/DashboardFinal';

export const ViajeActivoPage: React.FC = () => {
    const { viajeId } = useParams<{ viajeId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viaje, setViaje] = useState<Viaje | null>(null);
    const [faseExpandida, setFaseExpandida] = useState<FaseViaje | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (viajeId && twinId) {
            cargarViaje();
        }
    }, [viajeId, twinId]);

    useEffect(() => {
        // Auto-expandir la fase actual cuando se carga el viaje
        if (viaje && !faseExpandida) {
            setFaseExpandida(viaje.fase);
        }
    }, [viaje, faseExpandida]);

    const cargarViaje = async () => {
        try {
            setCargando(true);
            setError(null);
            
            // Verificar si es un ID temporal (para viaje nuevo)
            if (viajeId?.startsWith('nuevo-')) {
                console.log('ID temporal detectado, creando viaje nuevo...');
                
                // Crear un viaje temporal para trabajar en las fases
                const viajeNuevo: Viaje = {
                    id: viajeId,
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
                    moneda: 'USD',
                    fechaCreacion: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString()
                };
                
                setViaje(viajeNuevo);
                return;
            }
            
            // Para viajes existentes, cargar desde el API
            const response = await viajesApiService.getViajeById(twinId!, viajeId!);
            setViaje(response.data);
            
        } catch (error) {
            console.error('Error cargando viaje:', error);
            setError('No se pudo cargar el viaje');
        } finally {
            setCargando(false);
        }
    };

    const actualizarViaje = async (viajeActualizado: Viaje) => {
        // Si es un viaje temporal, solo actualizar el estado local
        if (viajeActualizado.id?.startsWith('nuevo-')) {
            console.log('Actualizando viaje temporal localmente...');
            setViaje(viajeActualizado);
            return;
        }
        
        // Para viajes reales, actualizar en el servidor también
        try {
            const response = await viajesApiService.actualizarViaje(
                twinId!, 
                viajeActualizado.id!, 
                viajeActualizado
            );
            setViaje(response.data);
        } catch (error) {
            console.error('Error actualizando viaje:', error);
            // Actualizar localmente aunque falle el servidor
            setViaje(viajeActualizado);
        }
    };

    const avanzarFase = async (nuevaFase: FaseViaje) => {
        if (!viaje) return;
        
        try {
            // Si es un viaje temporal y estamos avanzando desde la planeación,
            // primero crear el viaje real en el servidor
            if (viaje.id?.startsWith('nuevo-') && viaje.fase === FaseViaje.PLANEACION) {
                console.log('Creando viaje real en el servidor...');
                
                // Crear el viaje real
                const viajeParaCrear = {
                    ...viaje,
                    id: undefined // Quitar el ID temporal
                };
                
                const response = await viajesApiService.crearViaje(twinId!, viajeParaCrear);
                
                if (response.success && response.data.id) {
                    console.log('Viaje creado exitosamente con ID:', response.data.id);
                    
                    // Actualizar el viaje con el ID real y la nueva fase
                    const viajeConIdReal = {
                        ...response.data,
                        fase: nuevaFase
                    };
                    
                    // Avanzar la fase en el servidor
                    const responseAvance = await viajesApiService.avanzarFaseViaje(twinId!, response.data.id, nuevaFase);
                    setViaje(responseAvance.data);
                    setFaseExpandida(nuevaFase);
                    
                    // Actualizar la URL con el ID real
                    window.history.replaceState(null, '', `/twin-biografia/viaje-activo/${response.data.id}`);
                    
                    return;
                } else {
                    throw new Error('No se pudo crear el viaje en el servidor');
                }
            }
            
            // Para viajes reales, avanzar fase normalmente
            const response = await viajesApiService.avanzarFaseViaje(twinId!, viaje.id!, nuevaFase);
            setViaje(response.data);
            setFaseExpandida(nuevaFase);
            
        } catch (error) {
            console.error('Error avanzando fase:', error);
            alert('Error al avanzar la fase del viaje');
        }
    };

    const toggleFase = (fase: FaseViaje) => {
        if (faseExpandida === fase) {
            setFaseExpandida(null);
        } else {
            setFaseExpandida(fase);
        }
    };

    const getFaseEstado = (fase: FaseViaje) => {
        if (!viaje) return 'blocked';
        
        const fases = [FaseViaje.PLANEACION, FaseViaje.BOOKINGS, FaseViaje.EN_CURSO, FaseViaje.FINALIZADO];
        const faseActualIndex = fases.indexOf(viaje.fase);
        const faseCheckIndex = fases.indexOf(fase);
        
        if (faseCheckIndex < faseActualIndex) return 'completed';
        if (faseCheckIndex === faseActualIndex) return 'current';
        return 'blocked';
    };

    const getFaseIcon = (fase: FaseViaje, estado: string) => {
        const iconProps = { size: 24 };
        
        if (estado === 'completed') {
            return <CheckCircle {...iconProps} className="text-green-600" />;
        }
        
        if (estado === 'blocked') {
            return <Lock {...iconProps} className="text-gray-400" />;
        }
        
        // Estado 'current'
        switch (fase) {
            case FaseViaje.PLANEACION:
                return <MapPin {...iconProps} className="text-blue-600" />;
            case FaseViaje.BOOKINGS:
                return <Hotel {...iconProps} className="text-orange-600" />;
            case FaseViaje.EN_CURSO:
                return <Activity {...iconProps} className="text-green-600" />;
            case FaseViaje.FINALIZADO:
                return <BarChart3 {...iconProps} className="text-purple-600" />;
            default:
                return <Clock {...iconProps} className="text-gray-600" />;
        }
    };

    const getFaseConfig = (fase: FaseViaje) => {
        switch (fase) {
            case FaseViaje.PLANEACION:
                return {
                    titulo: 'Planeación del Viaje',
                    descripcion: 'Configura los detalles básicos, destino y presupuesto',
                    color: 'blue'
                };
            case FaseViaje.BOOKINGS:
                return {
                    titulo: 'Reservas y Bookings',
                    descripcion: 'Gestiona hoteles, vuelos y otras reservaciones',
                    color: 'orange'
                };
            case FaseViaje.EN_CURSO:
                return {
                    titulo: 'Viaje en Curso',
                    descripcion: 'Registra actividades diarias y gastos del viaje',
                    color: 'green'
                };
            case FaseViaje.FINALIZADO:
                return {
                    titulo: 'Viaje Finalizado',
                    descripcion: 'Revisa el resumen y análisis completo del viaje',
                    color: 'purple'
                };
            default:
                return { titulo: '', descripcion: '', color: 'gray' };
        }
    };

    const renderFaseContent = (fase: FaseViaje) => {
        if (!viaje || faseExpandida !== fase) return null;
        
        switch (fase) {
            case FaseViaje.PLANEACION:
                return (
                    <PlaneacionViajeCard 
                        viaje={viaje}
                        onActualizar={actualizarViaje}
                        onAvanzarFase={() => avanzarFase(FaseViaje.BOOKINGS)}
                    />
                );
            case FaseViaje.BOOKINGS:
                return (
                    <BookingsViaje 
                        viaje={viaje}
                        onActualizar={actualizarViaje}
                        onAvanzarFase={() => avanzarFase(FaseViaje.EN_CURSO)}
                    />
                );
            case FaseViaje.EN_CURSO:
                return (
                    <ActividadesDiarias 
                        viaje={viaje}
                        onAvanzarFase={() => avanzarFase(FaseViaje.FINALIZADO)}
                    />
                );
            case FaseViaje.FINALIZADO:
                return (
                    <DashboardFinal 
                        viaje={viaje}
                    />
                );
            default:
                return null;
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !viaje) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Viaje no encontrado'}</p>
                    <Button onClick={() => navigate('/twin-biografia/viajes-vacaciones')}>
                        <ArrowLeft size={16} className="mr-2" />
                        Volver a Viajes
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia/viajes-vacaciones')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Plane className="text-blue-600" size={28} />
                                    {viaje.titulo}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {viaje.ciudad}, {viaje.pais}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {viaje.fechaInicio ? 
                                            new Date(viaje.fechaInicio).toLocaleDateString() : 
                                            'Fecha no definida'
                                        }
                                        {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                                    </span>
                                    {viaje.presupuestoTotal && (
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={14} />
                                            {viaje.presupuestoTotal.toLocaleString()} {viaje.moneda}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Cards de Fases */}
                <div className="space-y-4">
                    {[FaseViaje.PLANEACION, FaseViaje.BOOKINGS, FaseViaje.EN_CURSO, FaseViaje.FINALIZADO].map((fase) => {
                        const estado = getFaseEstado(fase);
                        const config = getFaseConfig(fase);
                        const isExpandida = faseExpandida === fase;
                        const puedeAcceder = estado === 'current' || estado === 'completed';
                        
                        return (
                            <Card 
                                key={fase}
                                className={`transition-all duration-200 ${
                                    isExpandida ? 'ring-2 ring-blue-500' : ''
                                } ${
                                    puedeAcceder ? 'cursor-pointer hover:shadow-md' : 'opacity-60'
                                }`}
                            >
                                {/* Header de la Fase */}
                                <div 
                                    className="p-6 border-b"
                                    onClick={() => puedeAcceder && toggleFase(fase)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center
                                                ${estado === 'completed' ? 'bg-green-100' :
                                                  estado === 'current' ? `bg-${config.color}-100` :
                                                  'bg-gray-100'}
                                            `}>
                                                {getFaseIcon(fase, estado)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {config.titulo}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {config.descripcion}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {/* Estado Badge */}
                                            <div className={`
                                                px-3 py-1 rounded-full text-xs font-medium
                                                ${estado === 'completed' ? 'bg-green-100 text-green-800' :
                                                  estado === 'current' ? `bg-${config.color}-100 text-${config.color}-800` :
                                                  'bg-gray-100 text-gray-600'}
                                            `}>
                                                {estado === 'completed' ? 'Completado' :
                                                 estado === 'current' ? 'Actual' :
                                                 'Bloqueado'}
                                            </div>
                                            
                                            {/* Expand/Collapse indicator */}
                                            {puedeAcceder && (
                                                <div className={`
                                                    transform transition-transform duration-200
                                                    ${isExpandida ? 'rotate-180' : ''}
                                                `}>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido de la Fase */}
                                {isExpandida && (
                                    <div className="p-6">
                                        {renderFaseContent(fase)}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Info adicional */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-2 mt-1">
                            <Plane size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-900 mb-1">Progreso del Viaje</h3>
                            <p className="text-sm text-blue-800">
                                Haz clic en cada fase para expandir y gestionar los detalles. 
                                Solo puedes acceder a la fase actual y las fases completadas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
