import React, { useState, useEffect } from 'react';
import { 
    Calendar,
    Plus,
    BookOpen,
    DollarSign,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { RegistroDiarioModal } from '../../../components/RegistroDiarioModal';
import viajesApiService, { 
    Viaje, 
    RegistroDiario
} from '../../../services/viajesApiService';

interface ActividadesDiariasProps {
    viaje: Viaje;
    onActualizar?: (viaje: Viaje) => void;
    onAvanzarFase: () => void;
}

export const ActividadesDiarias: React.FC<ActividadesDiariasProps> = ({
    viaje,
    onAvanzarFase
}) => {
    const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
    const [fechasViaje, setFechasViaje] = useState<string[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    // const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Generar fechas del viaje
        const fechas = viajesApiService.generarFechasViaje(viaje.fechaInicio, viaje.fechaFin);
        setFechasViaje(fechas);
        
        // Cargar registros existentes
        cargarRegistrosDiarios();
    }, []);

    const cargarRegistrosDiarios = async () => {
        try {
            setCargando(true);
            const registros = await viajesApiService.getRegistrosDiarios(viaje.twinId!, viaje.id!);
            setRegistrosDiarios(registros);
        } catch (error) {
            console.error('Error cargando registros diarios:', error);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalRegistro = (fecha: string) => {
        // setFechaSeleccionada(fecha); // La fecha se usará en futuras versiones
        console.log('Abriendo modal para fecha:', fecha);
        setModalAbierto(true);
    };

    const guardarRegistro = async (_registro: RegistroDiario) => {
        await cargarRegistrosDiarios();
        setModalAbierto(false);
    };

    const getRegistroPorFecha = (fecha: string) => {
        return registrosDiarios.find(r => r.fecha === fecha);
    };

    const calcularGastosTotales = () => {
        return registrosDiarios.reduce((total, registro) => {
            return total + (registro.gastosTotalDia || 0);
        }, 0);
    };

    const calcularProgreso = () => {
        const diasConRegistro = registrosDiarios.length;
        const totalDias = fechasViaje.length;
        return totalDias > 0 ? (diasConRegistro / totalDias) * 100 : 0;
    };

    const puedeFinalizarViaje = () => {
        // Debe tener al menos 50% de los días registrados
        return calcularProgreso() >= 50;
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 3: Viaje en Curso</h2>
                        <p className="text-gray-600 mt-1">
                            Registra las actividades y gastos de cada día de tu viaje
                        </p>
                    </div>
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-orange-800">
                            <strong>Progreso:</strong> {registrosDiarios.length}/{fechasViaje.length} días
                        </p>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Días registrados</span>
                        <span>{Math.round(calcularProgreso())}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calcularProgreso()}%` }}
                        />
                    </div>
                </div>

                {/* Resumen de gastos */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Presupuesto Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {viaje.presupuestoTotal?.toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-orange-600">Gastado en Actividades</p>
                        <p className="text-lg font-semibold text-orange-900">
                            {calcularGastosTotales().toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                        (viaje.presupuestoTotal || 0) - calcularGastosTotales() >= 0 
                            ? 'bg-green-50' 
                            : 'bg-red-50'
                    }`}>
                        <p className={`text-sm ${
                            (viaje.presupuestoTotal || 0) - calcularGastosTotales() >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                        }`}>
                            Disponible
                        </p>
                        <p className={`text-lg font-semibold ${
                            (viaje.presupuestoTotal || 0) - calcularGastosTotales() >= 0 
                                ? 'text-green-900' 
                                : 'text-red-900'
                        }`}>
                            {((viaje.presupuestoTotal || 0) - calcularGastosTotales()).toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Calendario de días del viaje */}
            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-orange-600" />
                    Registro Diario de Actividades
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fechasViaje.map((fecha, index) => {
                        const registro = getRegistroPorFecha(fecha);
                        const tieneRegistro = !!registro;
                        const fechaObj = new Date(fecha);
                        
                        return (
                            <div
                                key={fecha}
                                className={`
                                    border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                                    ${tieneRegistro 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-200 hover:border-orange-300'
                                    }
                                `}
                                onClick={() => abrirModalRegistro(fecha)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium">
                                            Día {index + 1}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {fechaObj.toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {tieneRegistro && (
                                        <CheckCircle size={20} className="text-green-500" />
                                    )}
                                </div>

                                {tieneRegistro ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1 text-sm">
                                            <BookOpen size={14} className="text-gray-400" />
                                            <span>{registro.actividades.length} actividades</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <DollarSign size={14} className="text-gray-400" />
                                            <span>{(registro.gastosTotalDia || 0).toLocaleString()} {viaje.moneda}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Plus size={14} />
                                        <span>Registrar actividades</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Resumen de estadísticas */}
            {registrosDiarios.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Estadísticas del Viaje</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {registrosDiarios.reduce((total, r) => total + r.actividades.length, 0)}
                            </p>
                            <p className="text-sm text-gray-600">Actividades Totales</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {Math.round(calcularGastosTotales() / registrosDiarios.length).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Gasto Promedio/Día</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {registrosDiarios.filter(r => r.actividades.some(a => a.tipo === 'museo')).length}
                            </p>
                            <p className="text-sm text-gray-600">Días con Museos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {registrosDiarios.filter(r => r.actividades.some(a => a.tipo === 'tour')).length}
                            </p>
                            <p className="text-sm text-gray-600">Días con Tours</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Acciones de avance */}
            {puedeFinalizarViaje() && (
                <div className="flex justify-end">
                    <Button
                        onClick={onAvanzarFase}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        Finalizar Viaje
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}

            {!puedeFinalizarViaje() && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800">
                        <strong>Registros incompletos:</strong> Para finalizar el viaje, 
                        debes registrar al menos el 50% de los días ({Math.ceil(fechasViaje.length * 0.5)} días).
                    </p>
                </Card>
            )}

            {/* Modal de registro diario */}
            {modalAbierto && (
                <RegistroDiarioModal
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    twinId={viaje.twinId!}
                    viajeId={viaje.id!}
                    viaje={{
                        titulo: viaje.titulo,
                        fechaInicio: viaje.fechaInicio,
                        fechaFin: viaje.fechaFin
                    }}
                    onSave={guardarRegistro}
                />
            )}

            {/* Loading indicator */}
            {cargando && (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            )}
        </div>
    );
};
