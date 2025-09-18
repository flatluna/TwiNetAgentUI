import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMsal } from "@azure/msal-react";
import TwinDiaryAgent from "@/components/TwinDiaryAgent";
import {
    ArrowLeft,
    Plus,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Clock,
    BookOpen,
    MapPin,
    Star,
    RefreshCw,
    Image,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Users
} from "lucide-react";
import { LegacyDiaryEntry, processApiResponse } from '@/utils/diaryMigration';

// Interfaz extendida para incluir datos adicionales del backend
interface ExtendedDiaryEntry extends LegacyDiaryEntry {
    sasUrl?: string;
    diaryIndex?: {
        success: boolean;
        executiveSummary: string;
        detailedHtmlReport: string;
        processingTimeMs: number;
        analyzedAt: string;
        insights?: string[];
        alerts?: string[];
        totalDiscrepancy?: number;
        confidenceLevel?: string;
    };
    latitud?: number;
    longitud?: number;
    pais?: string;
    ciudad?: string;
    estado?: string;
    telefono?: string;
    website?: string;
}

const DiarioListPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const twinId = accounts[0]?.localAccountId;

    const [diarios, setDiarios] = useState<ExtendedDiaryEntry[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarDiarios();
    }, [twinId]);

    const cargarDiarios = async () => {
        if (!twinId) {
            setError('No se encontró el ID del usuario');
            setCargando(false);
            return;
        }

        try {
            setCargando(true);
            console.log('📔 Cargando diarios para Twin ID:', twinId);
            
            const response = await fetch(`/api/twins/${twinId}/diary`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📔 Respuesta del backend:', data);
                
                // El backend puede retornar directamente un array o un objeto con propiedades
                let entries: ExtendedDiaryEntry[] = [];
                
                console.log('📔 Datos de respuesta raw:', data);
                console.log('📔 Tipo de data:', typeof data);
                console.log('📔 data.entries:', data.entries);
                
                if (Array.isArray(data)) {
                    // Procesar array directo con datos extendidos
                    entries = data.map(item => {
                        const baseEntry = processApiResponse([item])[0] as ExtendedDiaryEntry;
                        // Agregar campos extendidos del backend
                        return {
                            ...baseEntry,
                            sasUrl: item.sasUrl,
                            diaryIndex: item.diaryIndex,
                            latitud: item.latitud,
                            longitud: item.longitud,
                            pais: item.pais,
                            ciudad: item.ciudad,
                            estado: item.estado,
                            telefono: item.telefono,
                            website: item.website
                        };
                    });
                } else {
                    // Usar la función de migración para procesar la respuesta
                    const baseEntries = processApiResponse(data);
                    entries = baseEntries.map(entry => entry as ExtendedDiaryEntry);
                }
                
                console.log('📔 Entradas procesadas:', entries);
                console.log('📔 Número de entradas:', entries.length);
                if (entries.length > 0) {
                    console.log('📔 Primera entrada:', entries[0]);
                }
                setDiarios(entries);
                console.log('📔 Estado actualizado, diarios.length será:', entries.length);
            } else {
                const errorText = await response.text();
                console.error('📔 Error del servidor:', errorText);
                setError(`Error al cargar los diarios: ${response.status}`);
            }
        } catch (error) {
            console.error('Error cargando diarios:', error);
            setError('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    const eliminarDiario = async (diarioId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este diario?')) {
            return;
        }

        try {
            console.log('📔 Eliminando diario - Twin ID:', twinId, 'Diary ID:', diarioId);
            
            const response = await fetch(`/api/twins/${twinId}/diary/${diarioId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDiarios(prev => prev.filter(d => d.id !== diarioId));
                alert('✅ Diario eliminado exitosamente');
                console.log('📔 Diario eliminado correctamente');
            } else {
                const errorText = await response.text();
                console.error('📔 Error del servidor:', errorText);
                alert(`❌ Error al eliminar el diario: ${response.status}`);
            }
        } catch (error) {
            console.error('📔 Error eliminando diario:', error);
            alert('❌ Error de conexión');
        }
    };

    const getActivityIcon = (tipo: string) => {
        const iconMap: { [key: string]: any } = {
            'trabajo': '💼',
            'social': '👥',
            'viaje': '✈️',
            'hogar': '🏠',
            'compras': '🛍️',
            'comida': '🍽️',
            'ejercicio': '💪',
            'estudio': '📚',
            'entretenimiento': '🎭',
            'juegos': '🎮',
            'llamada': '📞',
            'salud': '🏥',
            'otros': '⭐'
        };
        return iconMap[tipo] || '📝';
    };

    const formatearFecha = (fecha: string) => {
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const truncarTexto = (texto: string, maxLength: number = 100) => {
        if (!texto) return '';
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando diarios...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/biografia')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <BookOpen className="text-blue-600" size={32} />
                                Mi Diario Personal
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona tus entradas del diario personal y chatea con tu asistente IA
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={cargarDiarios}
                            disabled={cargando}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
                            {cargando ? 'Cargando...' : 'Recargar'}
                        </Button>
                        <Button
                            onClick={() => navigate('/biografia/diario-personal/crear')}
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Crear Nuevo Diario
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {/* Layout de dos columnas - Responsive */}
                <div className="grid grid-cols-1 xl:grid-cols-5 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda: Lista de diarios - Más pequeña en pantallas grandes */}
                    <div className="xl:col-span-2 lg:col-span-1 order-2 lg:order-1">
                        {/* Diarios Grid */}
                        {(() => {
                            console.log('🎨 Renderizando, diarios.length:', diarios.length);
                            console.log('🎨 Estado diarios:', diarios);
                            return null;
                        })()}
                        {diarios.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                                <BookOpen size={64} className="text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    No tienes diarios aún
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Comienza a documentar tu vida creando tu primer diario
                                </p>
                                <Button
                                    onClick={() => navigate('/biografia/diario-personal/crear')}
                                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={16} />
                                    Crear Mi Primer Diario
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {diarios.map((diario) => (
                                    <div
                                        key={diario.id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Header - Más compacto */}
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{getActivityIcon(diario.tipoActividad)}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-base leading-tight">
                                                            {diario.nombreActividad || 'Sin título'}
                                                        </h3>
                                                        <p className="text-blue-100 text-xs capitalize">
                                                            {diario.tipoActividad || 'Sin categoría'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {diario.valoracion && (
                                                    <div className="flex items-center gap-1">
                                                        <Star size={14} className="text-yellow-300" fill="currentColor" />
                                                        <span className="text-xs">{diario.valoracion}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Imagen SAS si existe - Más pequeña */}
                                        {diario.sasUrl && (
                                            <div className="relative">
                                                <img 
                                                    src={diario.sasUrl} 
                                                    alt={diario.nombreActividad}
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                                    <Image size={10} />
                                                    Foto
                                                </div>
                                            </div>
                                        )}

                                        {/* Card Body - Más compacto */}
                                        <div className="p-3">
                                            <div className="space-y-2">
                                                {/* Fecha y Hora - Más compacto */}
                                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>{formatearFecha(diario.fecha)}</span>
                                                    </div>
                                                    {diario.hora && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            <span>{diario.hora}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Ubicación - Más compacto */}
                                                {(diario.ubicacion || diario.camposExtra?.ciudad || diario.camposExtra?.pais) && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <MapPin size={12} />
                                                        <span className="truncate">
                                                            {diario.ubicacion && diario.ubicacion}
                                                            {!diario.ubicacion && diario.camposExtra?.ciudad && diario.camposExtra?.pais && 
                                                                `${diario.camposExtra.ciudad}, ${diario.camposExtra.pais}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Participantes - Más compacto */}
                                                {diario.participantes && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Users size={12} />
                                                        <span className="truncate">{diario.participantes}</span>
                                                    </div>
                                                )}

                                                {/* Descripción - Más corta */}
                                                <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                                                    {truncarTexto(diario.descripcion, 80)}
                                                </p>

                                                {/* Estado emocional y detalles específicos - Solo los más importantes */}
                                                <div className="flex flex-wrap gap-1 text-xs">
                                                    {diario.camposExtra?.costoComida && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                            <DollarSign size={8} className="inline mr-1" />
                                                            ${diario.camposExtra.costoComida}
                                                        </span>
                                                    )}
                                                    {diario.camposExtra?.restauranteLugar && (
                                                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs truncate max-w-24">
                                                            �️ {diario.camposExtra.restauranteLugar}
                                                        </span>
                                                    )}
                                                    {diario.camposExtra?.calificacionComida && (
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                            ⭐ {diario.camposExtra.calificacionComida}/5
                                                        </span>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                        {/* Card Actions - Más compactos */}
                                        <div className="px-3 pb-3">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/biografia/diario-personal/ver/${diario.id}`)}
                                                    className="flex-1 flex items-center gap-1 text-xs py-1 px-2 h-7"
                                                >
                                                    <Eye size={12} />
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/biografia/diario-personal/editar/${diario.id}`)}
                                                    className="flex-1 flex items-center gap-1 text-xs py-1 px-2 h-7"
                                                >
                                                    <Edit size={12} />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => eliminarDiario(diario.id)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs py-1 px-2 h-7"
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Columna derecha: Twin Diary Agent - Más grande */}
                    <div className="xl:col-span-3 lg:col-span-2 order-1 lg:order-2">
                        <div className="sticky top-4 h-[calc(100vh-6rem)]">
                            <TwinDiaryAgent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiarioListPage;
