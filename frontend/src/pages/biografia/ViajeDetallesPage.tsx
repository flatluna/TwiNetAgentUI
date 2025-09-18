import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FaseIndicator } from '../../components/FaseIndicator';
import viajesApiService, { Viaje, FaseViaje } from '../../services/viajesApiService';

// Componentes para cada fase (los crearemos después)
import { PlaneacionViaje } from './fases/PlaneacionViaje';
import { BookingsViaje } from './fases/BookingsViaje';
import { ActividadesDiarias } from './fases/ActividadesDiarias';
import { DashboardFinal } from './fases/DashboardFinal';

export const ViajeDetallesPage: React.FC = () => {
    const { viajeId } = useParams<{ viajeId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viaje, setViaje] = useState<Viaje | null>(null);
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
            const response = await viajesApiService.getViajeById(twinId!, viajeId!);
            
            if (response.success) {
                setViaje(response.data);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error('Error cargando viaje:', error);
            setError('Error al cargar el viaje');
        } finally {
            setCargando(false);
        }
    };

    const cambiarFase = async (nuevaFase: FaseViaje) => {
        if (!viaje || !twinId) return;

        try {
            const response = await viajesApiService.avanzarFaseViaje(twinId, viaje.id!, nuevaFase);
            
            if (response.success) {
                setViaje(prev => prev ? { ...prev, fase: nuevaFase } : null);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error('Error cambiando fase:', error);
            setError('Error al cambiar la fase del viaje');
        }
    };

    const actualizarViaje = (viajeActualizado: Viaje) => {
        setViaje(viajeActualizado);
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando viaje...</p>
                </div>
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

    const renderFaseActual = () => {
        switch (viaje.fase) {
            case FaseViaje.PLANEACION:
                return (
                    <PlaneacionViaje 
                        viaje={viaje}
                        onActualizar={actualizarViaje}
                        onAvanzarFase={() => cambiarFase(FaseViaje.BOOKINGS)}
                    />
                );
            case FaseViaje.BOOKINGS:
                return (
                    <BookingsViaje 
                        viaje={viaje}
                        onActualizar={actualizarViaje}
                        onAvanzarFase={() => cambiarFase(FaseViaje.EN_CURSO)}
                    />
                );
            case FaseViaje.EN_CURSO:
                return (
                    <ActividadesDiarias 
                        viaje={viaje}
                        onActualizar={actualizarViaje}
                        onAvanzarFase={() => cambiarFase(FaseViaje.FINALIZADO)}
                    />
                );
            case FaseViaje.FINALIZADO:
                return (
                    <DashboardFinal 
                        viaje={viaje}
                    />
                );
            default:
                return <div>Fase no reconocida</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                <h1 className="text-2xl font-bold text-gray-900">{viaje.titulo}</h1>
                                <p className="text-sm text-gray-600">
                                    {viaje.ciudad}, {viaje.pais} • {new Date(viaje.fechaInicio).toLocaleDateString()}
                                    {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Indicador de Fases */}
                <FaseIndicator 
                    faseActual={viaje.fase}
                    onCambiarFase={cambiarFase}
                />

                {/* Error Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button 
                            onClick={() => setError(null)}
                            className="text-red-600 text-sm underline mt-1"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {/* Contenido de la Fase Actual */}
                {renderFaseActual()}
            </div>
        </div>
    );
};
