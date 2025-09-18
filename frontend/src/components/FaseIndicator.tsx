import React from 'react';
import { 
    MapPin, 
    Calendar, 
    CreditCard, 
    Plane, 
    BookOpen, 
    BarChart3,
    CheckCircle,
    Circle,
    ArrowRight
} from 'lucide-react';
import { FaseViaje } from '../services/viajesApiService';

interface FaseIndicatorProps {
    faseActual: FaseViaje;
    onCambiarFase?: (nuevaFase: FaseViaje) => void;
    soloLectura?: boolean;
}

const FASES_CONFIG = [
    {
        fase: FaseViaje.PLANEACION,
        nombre: 'Planeación',
        descripcion: 'Información básica del viaje',
        icono: MapPin,
        color: 'blue'
    },
    {
        fase: FaseViaje.BOOKINGS,
        nombre: 'Bookings',
        descripcion: 'Hoteles, vuelos y reservas',
        icono: CreditCard,
        color: 'green'
    },
    {
        fase: FaseViaje.EN_CURSO,
        nombre: 'En Curso',
        descripcion: 'Actividades diarias',
        icono: BookOpen,
        color: 'orange'
    },
    {
        fase: FaseViaje.FINALIZADO,
        nombre: 'Finalizado',
        descripcion: 'Dashboard de costos',
        icono: BarChart3,
        color: 'purple'
    }
];

export const FaseIndicator: React.FC<FaseIndicatorProps> = ({
    faseActual,
    onCambiarFase,
    soloLectura = false
}) => {
    const getFaseIndex = (fase: FaseViaje) => {
        return FASES_CONFIG.findIndex(f => f.fase === fase);
    };

    const faseActualIndex = getFaseIndex(faseActual);

    const handleFaseClick = (fase: FaseViaje) => {
        if (!soloLectura && onCambiarFase) {
            const faseIndex = getFaseIndex(fase);
            // Solo permitir avanzar a la siguiente fase o navegar a fases anteriores
            if (faseIndex <= faseActualIndex + 1) {
                onCambiarFase(fase);
            }
        }
    };

    return (
        <div className="w-full bg-white border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Fases del Viaje</h3>
            
            <div className="flex items-center justify-between">
                {FASES_CONFIG.map((faseConfig, index) => {
                    const IconComponent = faseConfig.icono;
                    const esFaseActual = faseConfig.fase === faseActual;
                    const esFaseCompletada = index < faseActualIndex;
                    const esFaseDisponible = index <= faseActualIndex + 1;
                    
                    return (
                        <div key={faseConfig.fase} className="flex items-center">
                            {/* Círculo de fase */}
                            <div
                                className={`
                                    relative flex flex-col items-center cursor-pointer transition-all duration-200
                                    ${!soloLectura && esFaseDisponible ? 'hover:scale-105' : ''}
                                `}
                                onClick={() => handleFaseClick(faseConfig.fase)}
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                                    ${esFaseActual 
                                        ? `bg-${faseConfig.color}-500 border-${faseConfig.color}-500 text-white shadow-lg` 
                                        : esFaseCompletada 
                                            ? `bg-green-500 border-green-500 text-white`
                                            : esFaseDisponible
                                                ? `border-${faseConfig.color}-300 text-${faseConfig.color}-500 hover:bg-${faseConfig.color}-50`
                                                : 'border-gray-300 text-gray-400'
                                    }
                                `}>
                                    {esFaseCompletada ? (
                                        <CheckCircle size={20} />
                                    ) : (
                                        <IconComponent size={20} />
                                    )}
                                </div>
                                
                                {/* Información de la fase */}
                                <div className="mt-2 text-center">
                                    <div className={`
                                        text-sm font-medium
                                        ${esFaseActual 
                                            ? `text-${faseConfig.color}-600` 
                                            : esFaseCompletada 
                                                ? 'text-green-600'
                                                : esFaseDisponible
                                                    ? 'text-gray-700'
                                                    : 'text-gray-400'
                                        }
                                    `}>
                                        {faseConfig.nombre}
                                    </div>
                                    <div className="text-xs text-gray-500 max-w-20 leading-tight">
                                        {faseConfig.descripcion}
                                    </div>
                                </div>
                            </div>

                            {/* Flecha de conexión */}
                            {index < FASES_CONFIG.length - 1 && (
                                <div className="flex-1 mx-4">
                                    <div className={`
                                        h-0.5 w-full transition-all duration-200
                                        ${index < faseActualIndex 
                                            ? 'bg-green-500' 
                                            : index === faseActualIndex 
                                                ? `bg-${faseConfig.color}-500`
                                                : 'bg-gray-300'
                                        }
                                    `} />
                                    <ArrowRight 
                                        size={16} 
                                        className={`
                                            mx-auto -mt-2 transition-all duration-200
                                            ${index < faseActualIndex 
                                                ? 'text-green-500' 
                                                : index === faseActualIndex 
                                                    ? `text-${faseConfig.color}-500`
                                                    : 'text-gray-300'
                                            }
                                        `} 
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Información adicional de la fase actual */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    {React.createElement(FASES_CONFIG[faseActualIndex].icono, { size: 16 })}
                    <span className="font-medium">
                        Fase Actual: {FASES_CONFIG[faseActualIndex].nombre}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    {FASES_CONFIG[faseActualIndex].descripcion}
                </p>
            </div>
        </div>
    );
};
