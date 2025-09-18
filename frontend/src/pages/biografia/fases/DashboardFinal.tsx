import React, { useState, useEffect } from 'react';
import { 
    TrendingUp,
    DollarSign,
    MapPin,
    Calendar,
    Award,
    Download,
    Share2,
    Star,
    BarChart3,
    PieChart
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import viajesApiService, { 
    Viaje, 
    RegistroDiario,
    DashboardCostos 
} from '../../../services/viajesApiService';

interface DashboardFinalProps {
    viaje: Viaje;
}

export const DashboardFinal: React.FC<DashboardFinalProps> = ({
    viaje
}) => {
    const [dashboard, setDashboard] = useState<DashboardCostos | null>(null);
    const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            setCargando(true);
            
            // Cargar registros diarios
            const registros = await viajesApiService.getRegistrosDiarios(viaje.twinId!, viaje.id!);
            setRegistrosDiarios(registros);
            
            // Generar dashboard de costos
            const dashboardData = await viajesApiService.generarDashboardCostos(viaje.twinId!, viaje.id!);
            setDashboard(dashboardData);
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setCargando(false);
        }
    };

    const calcularEstadisticas = () => {
        const totalDias = registrosDiarios.length;
        const totalActividades = registrosDiarios.reduce((total, r) => total + r.actividades.length, 0);
        const actividadesPorTipo = registrosDiarios.reduce((acc, r) => {
            r.actividades.forEach(a => {
                acc[a.tipo] = (acc[a.tipo] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);

        const gastoPromedioDia = dashboard ? dashboard.totalGastado / totalDias : 0;
        
        return {
            totalDias,
            totalActividades,
            actividadesPorTipo,
            gastoPromedioDia,
            actividadMasComun: Object.entries(actividadesPorTipo).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
        };
    };

    const exportarInforme = () => {
        const datos = {
            viaje,
            dashboard,
            registrosDiarios,
            estadisticas: calcularEstadisticas()
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `viaje-${viaje.titulo.replace(/\s+/g, '-')}-informe.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const compartirViaje = () => {
        if (navigator.share) {
            navigator.share({
                title: `Mi viaje a ${viaje.ciudad}`,
                text: `He completado mi viaje a ${viaje.ciudad}. ¡Fue increíble!`,
                url: window.location.href
            });
        } else {
            // Fallback para navegadores sin soporte
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const estadisticas = calcularEstadisticas();

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Award size={32} className="text-purple-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-purple-900 mb-2">
                        ¡Viaje Completado!
                    </h2>
                    <p className="text-purple-700">
                        Tu aventura en <strong>{viaje.ciudad}</strong> ha terminado.
                        Aquí tienes el resumen completo de tu experiencia.
                    </p>
                </div>

                <div className="flex justify-center gap-4">
                    <Button 
                        onClick={exportarInforme}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Exportar Informe
                    </Button>
                    <Button 
                        onClick={compartirViaje}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <Share2 size={16} />
                        Compartir Viaje
                    </Button>
                </div>
            </Card>

            {/* Resumen del viaje */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-600" />
                    Resumen del Viaje
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-50 p-4 rounded-lg mb-2">
                            <Calendar size={24} className="text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-900">{estadisticas.totalDias}</p>
                            <p className="text-sm text-blue-600">Días de Viaje</p>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="bg-green-50 p-4 rounded-lg mb-2">
                            <Star size={24} className="text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-900">{estadisticas.totalActividades}</p>
                            <p className="text-sm text-green-600">Actividades Realizadas</p>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="bg-orange-50 p-4 rounded-lg mb-2">
                            <TrendingUp size={24} className="text-orange-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-orange-900">{estadisticas.actividadMasComun}</p>
                            <p className="text-sm text-orange-600">Actividad Favorita</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Dashboard de costos */}
            {dashboard && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Costos totales */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-green-600" />
                            Análisis de Costos
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Presupuesto Planificado</span>
                                <span className="font-semibold">
                                    {viaje.presupuestoTotal?.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Total Gastado</span>
                                <span className="font-semibold text-orange-600">
                                    {dashboard.totalGastado.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Hoteles</span>
                                <span className="font-medium">
                                    {dashboard.costosHoteles.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Vuelos</span>
                                <span className="font-medium">
                                    {dashboard.costosVuelos.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Actividades Diarias</span>
                                <span className="font-medium">
                                    {dashboard.costosActividades.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-t bg-gray-50 px-4 rounded-lg">
                                <span className="font-semibold">Diferencia</span>
                                <span className={`font-bold ${
                                    dashboard.diferencia >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {dashboard.diferencia >= 0 ? '+' : ''}{dashboard.diferencia.toLocaleString()} {viaje.moneda}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Estadísticas de actividades */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-600" />
                            Actividades por Tipo
                        </h3>
                        
                        <div className="space-y-3">
                            {Object.entries(estadisticas.actividadesPorTipo)
                                .sort(([,a], [,b]) => b - a)
                                .map(([tipo, cantidad]) => (
                                <div key={tipo} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="capitalize">{tipo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ 
                                                    width: `${(cantidad / estadisticas.totalActividades) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-8">{cantidad}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Gasto promedio por día:</strong> {' '}
                                {estadisticas.gastoPromedioDia.toLocaleString()} {viaje.moneda}
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Evaluación del viaje */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-purple-600" />
                    Evaluación del Viaje
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                            {dashboard ? (dashboard.diferencia >= 0 ? 'Dentro' : 'Excedido') : 'N/A'}
                        </div>
                        <p className="text-sm text-green-700">Presupuesto</p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            {Math.round((estadisticas.totalActividades / estadisticas.totalDias) * 10) / 10}
                        </div>
                        <p className="text-sm text-blue-700">Actividades/Día</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                            {registrosDiarios.length > 0 ? 'Completo' : 'Incompleto'}
                        </div>
                        <p className="text-sm text-purple-700">Registro</p>
                    </div>
                </div>
            </Card>

            {/* Galería de recuerdos (placeholder) */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recuerdos del Viaje</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">Foto {i}</span>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Las fotos y documentos del viaje se mostrarían aquí
                </p>
            </Card>
        </div>
    );
};
