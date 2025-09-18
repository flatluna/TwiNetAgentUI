import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Star,
    Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import viajesApiService, { Viaje, FaseViaje } from '../../services/viajesApiService';

export const HistorialViajesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viajesFinalizados, setViajesFinalizados] = useState<Viaje[]>([]);
    const [cargando, setCargando] = useState(true);
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (twinId) {
            cargarViajesFinalizados();
        }
    }, [twinId]);

    const cargarViajesFinalizados = async () => {
        try {
            setCargando(true);
            const response = await viajesApiService.getViajes(twinId!);
            const viajes = response.data || [];
            const finalizados = viajes.filter((v: Viaje) => v.fase === FaseViaje.FINALIZADO);
            setViajesFinalizados(finalizados);
        } catch (error) {
            console.error('Error cargando viajes finalizados:', error);
        } finally {
            setCargando(false);
        }
    };

    const verDetalle = (viaje: Viaje) => {
        navigate(`/twin-biografia/viaje-activo/${viaje.id}`);
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
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
                                <h1 className="text-2xl font-bold text-gray-900">Historial de Viajes</h1>
                                <p className="text-gray-600">Revisa tus aventuras completadas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {viajesFinalizados.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Aún no tienes viajes completados
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Cuando finalices tu primer viaje, aparecerá aquí para que puedas revisar todos los detalles.
                        </p>
                        <Button
                            onClick={() => navigate('/twin-biografia/viajes-vacaciones')}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Crear Primer Viaje
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {viajesFinalizados.map((viaje) => (
                            <Card 
                                key={viaje.id} 
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => verDetalle(viaje)}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {viaje.titulo}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MapPin size={14} />
                                                <span>{viaje.ciudad}, {viaje.pais}</span>
                                            </div>
                                        </div>
                                        {viaje.calificacionExperiencia && (
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="text-yellow-500" />
                                                <span className="text-sm font-medium">
                                                    {viaje.calificacionExperiencia}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(viaje.fechaInicio).toLocaleDateString()}
                                                {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                        
                                        {viaje.presupuestoTotal && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <DollarSign size={14} />
                                                <span>
                                                    {viaje.presupuestoTotal.toLocaleString()} {viaje.moneda}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {viaje.descripcion && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {viaje.descripcion}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                                Completado
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {viaje.duracionDias} días
                                            </span>
                                        </div>
                                        
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex items-center gap-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                verDetalle(viaje);
                                            }}
                                        >
                                            <Eye size={14} />
                                            Ver
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {viajesFinalizados.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            {viajesFinalizados.length} {viajesFinalizados.length === 1 ? 'viaje completado' : 'viajes completados'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
