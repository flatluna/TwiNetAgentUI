import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, Edit3, Trash2, RefreshCw, Calendar, Clock, 
    MapPin, User, AlertCircle, CheckCircle, XCircle, Star, Sun,
    Moon, Coffee, Utensils, Camera, ShoppingBag, Music, Mountain, X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Tipos de actividades
const tiposActividad = [
    { value: 'desayuno', label: 'Desayuno', icon: Coffee, color: 'orange' },
    { value: 'almuerzo', label: 'Almuerzo', icon: Utensils, color: 'green' },
    { value: 'cena', label: 'Cena', icon: Moon, color: 'purple' },
    { value: 'visita', label: 'Visita Turística', icon: Camera, color: 'blue' },
    { value: 'compras', label: 'Compras', icon: ShoppingBag, color: 'pink' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: Music, color: 'indigo' },
    { value: 'deportes', label: 'Deportes/Aventura', icon: Mountain, color: 'red' },
    { value: 'descanso', label: 'Descanso', icon: Sun, color: 'yellow' },
    { value: 'otro', label: 'Otro', icon: Star, color: 'gray' }
];

const prioridadActividad = [
    { value: 'baja', label: 'Baja', color: 'gray' },
    { value: 'media', label: 'Media', color: 'yellow' },
    { value: 'alta', label: 'Alta', color: 'orange' },
    { value: 'imprescindible', label: 'Imprescindible', color: 'red' }
];

const estadosActividad = [
    { value: 'planificada', label: 'Planificada', color: 'blue' },
    { value: 'confirmada', label: 'Confirmada', color: 'green' },
    { value: 'en_progreso', label: 'En Progreso', color: 'yellow' },
    { value: 'completada', label: 'Completada', color: 'purple' },
    { value: 'cancelada', label: 'Cancelada', color: 'red' }
];

// Tipos de datos
interface ActividadDiaria {
    id?: string;
    itinerarioId: string;
    fecha: string;
    horaInicio: string;
    horaFin?: string;
    titulo: string;
    descripcion?: string;
    tipo: 'desayuno' | 'almuerzo' | 'cena' | 'visita' | 'compras' | 'entretenimiento' | 'deportes' | 'descanso' | 'otro';
    ubicacion?: string;
    direccion?: string;
    coordenadas?: {
        latitud: number;
        longitud: number;
    };
    prioridad: 'baja' | 'media' | 'alta' | 'imprescindible';
    estado: 'planificada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada';
    duracionEstimada?: number; // en minutos
    costoEstimado?: number;
    moneda?: string;
    notas?: string;
    participantes?: string[];
    recordatorios?: boolean;
    fechaCreacion: string;
    fechaActualizacion?: string;
}

interface Itinerario {
    id: string;
    titulo: string;
    viajeId: string;
    twinId: string;
    ciudadOrigen?: string;
    paisOrigen?: string;
    ciudadDestino?: string;
    paisDestino?: string;
    fechaInicio: string;
    fechaFin: string;
}

const ActividadesDiariasPage: React.FC = () => {
    const { viajeId, itinerarioId } = useParams<{ viajeId: string; itinerarioId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Estados principales
    const [actividades, setActividades] = useState<ActividadDiaria[]>([]);
    const [itinerario, setItinerario] = useState<Itinerario | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados del modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [actividadEditando, setActividadEditando] = useState<ActividadDiaria | null>(null);

    // Estados del formulario
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipo, setTipo] = useState<ActividadDiaria['tipo']>('visita');
    const [ubicacion, setUbicacion] = useState('');
    const [direccion, setDireccion] = useState('');
    const [prioridad, setPrioridad] = useState<ActividadDiaria['prioridad']>('media');
    const [estado, setEstado] = useState<ActividadDiaria['estado']>('planificada');
    const [duracionEstimada, setDuracionEstimada] = useState('');
    const [costoEstimado, setCostoEstimado] = useState('');
    const [moneda, setMoneda] = useState('USD');
    const [notas, setNotas] = useState('');

    // Estados de filtros
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroFecha, setFiltroFecha] = useState<string>('todas');

    useEffect(() => {
        cargarDatos();
    }, [location.state]);

    const recargarDatos = async () => {
        console.log('=== RECARGANDO ACTIVIDADES ===');
        setCargando(true);
        await cargarDatos();
    };

    const cargarDatos = async () => {
        try {
            console.log('=== CARGANDO ACTIVIDADES DIARIAS ===');
            console.log('location.state:', location.state);
            console.log('viajeId desde URL:', viajeId);
            console.log('itinerarioId desde URL:', itinerarioId);
            
            // Cargar información del itinerario desde location state
            if (location.state && location.state.itinerario) {
                console.log('Itinerario desde location.state:', location.state.itinerario);
                setItinerario(location.state.itinerario);
            }
            
            // Cargar actividades desde el backend
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            
            // Obtener twinId y viajeId del itinerario o location state
            const itinerarioData = location.state?.itinerario;
            let twinId = itinerarioData?.twinId || location.state?.twinId;
            let viajeIdFromData = itinerarioData?.viajeId || location.state?.viajeId || viajeId;

            console.log('Datos obtenidos para API:', { 
                twinId, 
                viajeId: viajeIdFromData, 
                itinerarioId,
                itinerarioData,
                baseUrl
            });

            if (twinId && viajeIdFromData && itinerarioId) {
                const url = `${baseUrl}/api/twins/${twinId}/travels/${viajeIdFromData}/itinerarios/${itinerarioId}/actividades-diarias`;
                
                console.log('🔗 Cargando actividades desde:', url);
                
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    console.log('📡 Respuesta del servidor:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });

                    if (response.ok) {
                        const actividadesData = await response.json();
                        console.log('📦 Actividades cargadas desde servidor:', actividadesData);
                        
                        // Manejar diferentes estructuras de respuesta del backend
                        if (Array.isArray(actividadesData)) {
                            setActividades(actividadesData);
                            console.log('✅ Actividades establecidas correctamente (array directo):', actividadesData.length, 'elementos');
                        } else if (actividadesData && Array.isArray(actividadesData.actividades)) {
                            setActividades(actividadesData.actividades);
                            console.log('✅ Actividades establecidas desde actividadesData.actividades:', actividadesData.actividades.length, 'elementos');
                        } else if (actividadesData && Array.isArray(actividadesData.data)) {
                            setActividades(actividadesData.data);
                            console.log('✅ Actividades establecidas desde data:', actividadesData.data.length, 'elementos');
                        } else {
                            console.warn('⚠️ Respuesta del servidor no es un array válido:', actividadesData);
                            cargarDatosSimulados();
                        }
                    } else {
                        const errorText = await response.text();
                        console.warn('❌ Error del servidor:', response.status, errorText);
                        cargarDatosSimulados();
                    }
                } catch (fetchError) {
                    console.error('❌ Error en la petición fetch:', fetchError);
                    cargarDatosSimulados();
                }
            } else {
                console.warn('⚠️ Faltan datos necesarios. Cargando datos simulados.');
                console.log('Datos faltantes:', { twinId, viajeId: viajeIdFromData, itinerarioId });
                cargarDatosSimulados();
            }
        } catch (error) {
            console.error('❌ Error general cargando actividades:', error);
            cargarDatosSimulados();
        } finally {
            setCargando(false);
        }
    };

    const cargarDatosSimulados = () => {
        console.log('📋 Cargando datos simulados de actividades...');
        
        const actividadesSimuladas: ActividadDiaria[] = [
            {
                id: 'act1',
                itinerarioId: itinerarioId || '',
                fecha: '2025-10-17',
                horaInicio: '08:00',
                horaFin: '09:00',
                titulo: 'Desayuno en el hotel',
                descripcion: 'Desayuno buffet continental',
                tipo: 'desayuno',
                ubicacion: 'Hotel Marriott',
                direccion: 'Centro Histórico, Querétaro',
                prioridad: 'media',
                estado: 'confirmada',
                duracionEstimada: 60,
                costoEstimado: 25,
                moneda: 'USD',
                notas: 'Incluido en la reserva del hotel',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 'act2',
                itinerarioId: itinerarioId || '',
                fecha: '2025-10-17',
                horaInicio: '10:00',
                horaFin: '12:00',
                titulo: 'Visita al Centro Histórico',
                descripcion: 'Tour guiado por el centro histórico de Querétaro',
                tipo: 'visita',
                ubicacion: 'Centro Histórico de Querétaro',
                direccion: 'Plaza de Armas, Querétaro, Qro.',
                prioridad: 'alta',
                estado: 'planificada',
                duracionEstimada: 120,
                costoEstimado: 15,
                moneda: 'USD',
                notas: 'Llevar cámara fotográfica',
                fechaCreacion: new Date().toISOString()
            }
        ];
        
        setActividades(actividadesSimuladas);
        console.log('✅ Datos simulados cargados:', actividadesSimuladas.length, 'actividades');
    };

    const abrirModalNuevo = () => {
        limpiarFormulario();
        setModalAbierto(true);
    };

    const abrirModalEditar = (actividad: ActividadDiaria) => {
        setActividadEditando(actividad);
        cargarDatosEnFormulario(actividad);
        setModalAbierto(true);
    };

    const limpiarFormulario = () => {
        setActividadEditando(null);
        setFecha('');
        setHoraInicio('');
        setHoraFin('');
        setTitulo('');
        setDescripcion('');
        setTipo('visita');
        setUbicacion('');
        setDireccion('');
        setPrioridad('media');
        setEstado('planificada');
        setDuracionEstimada('');
        setCostoEstimado('');
        setMoneda('USD');
        setNotas('');
    };

    const cargarDatosEnFormulario = (actividad: ActividadDiaria) => {
        setFecha(convertirFechaParaInput(actividad.fecha));
        setHoraInicio(actividad.horaInicio);
        setHoraFin(actividad.horaFin || '');
        setTitulo(actividad.titulo);
        setDescripcion(actividad.descripcion || '');
        setTipo(actividad.tipo);
        setUbicacion(actividad.ubicacion || '');
        setDireccion(actividad.direccion || '');
        setPrioridad(actividad.prioridad);
        setEstado(actividad.estado);
        setDuracionEstimada(actividad.duracionEstimada?.toString() || '');
        setCostoEstimado(actividad.costoEstimado?.toString() || '');
        setMoneda(actividad.moneda || 'USD');
        setNotas(actividad.notas || '');
    };

    const convertirFechaParaInput = (fechaISO: string): string => {
        if (!fechaISO) return '';
        try {
            const fecha = new Date(fechaISO);
            return fecha.toISOString().split('T')[0];
        } catch (error) {
            return '';
        }
    };

    const formatearFechaSafe = (fechaISO: string): string => {
        if (!fechaISO) return 'Fecha no disponible';
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return 'Fecha no válida';
            return fecha.toLocaleDateString('es-ES');
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const guardarActividad = async () => {
        if (!titulo || !fecha || !horaInicio) {
            alert('Por favor completa los campos obligatorios (título, fecha, hora de inicio)');
            return;
        }

        try {
            const actividadData: ActividadDiaria = {
                id: actividadEditando?.id,
                itinerarioId: itinerarioId || '',
                fecha: `${fecha}T00:00:00`,
                horaInicio,
                horaFin: horaFin || undefined,
                titulo,
                descripcion: descripcion || undefined,
                tipo,
                ubicacion: ubicacion || undefined,
                direccion: direccion || undefined,
                prioridad,
                estado,
                duracionEstimada: duracionEstimada ? parseInt(duracionEstimada) : undefined,
                costoEstimado: costoEstimado ? parseFloat(costoEstimado) : undefined,
                moneda: moneda || 'USD',
                notas: notas || undefined,
                fechaCreacion: actividadEditando?.fechaCreacion || new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            console.log('💾 Guardando actividad:', actividadData);

            // Simular guardado exitoso por ahora
            if (actividadEditando) {
                // Editar existente
                setActividades(prev => prev.map(act => 
                    act.id === actividadEditando.id ? { ...actividadData, id: actividadEditando.id } : act
                ));
                console.log('✅ Actividad editada:', actividadData);
            } else {
                // Crear nueva
                const nuevaActividad = { ...actividadData, id: Date.now().toString() };
                setActividades(prev => [...prev, nuevaActividad]);
                console.log('✅ Nueva actividad creada:', nuevaActividad);
            }

            setModalAbierto(false);
            limpiarFormulario();
        } catch (error) {
            console.error('❌ Error guardando actividad:', error);
            alert('Error al guardar la actividad. Inténtalo de nuevo.');
        }
    };

    const eliminarActividad = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            try {
                setActividades(prev => prev.filter(act => act.id !== id));
                console.log('✅ Actividad eliminada:', id);
            } catch (error) {
                console.error('❌ Error eliminando actividad:', error);
                alert('Error al eliminar la actividad. Inténtalo de nuevo.');
            }
        }
    };

    // Filtrar actividades
    const actividadesArray = Array.isArray(actividades) ? actividades : [];
    
    const actividadesFiltradas = actividadesArray.filter(actividad => {
        const cumpleTipo = filtroTipo === 'todos' || 
            actividad.tipo?.toString().trim().toLowerCase() === filtroTipo?.toString().trim().toLowerCase();
        
        const cumpleEstado = filtroEstado === 'todos' || 
            actividad.estado?.toString().trim().toLowerCase() === filtroEstado?.toString().trim().toLowerCase();
        
        let cumpleFecha = filtroFecha === 'todas';
        if (!cumpleFecha && filtroFecha) {
            const fechaActividad = actividad.fecha?.split('T')[0];
            cumpleFecha = fechaActividad === filtroFecha;
        }
        
        return cumpleTipo && cumpleEstado && cumpleFecha;
    });

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            green: 'bg-green-100 text-green-800 border-green-200',
            purple: 'bg-purple-100 text-purple-800 border-purple-200',
            orange: 'bg-orange-100 text-orange-800 border-orange-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            pink: 'bg-pink-100 text-pink-800 border-pink-200',
            indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
        return colors[color as keyof typeof colors] || colors.gray;
    };

    const getIconoEstado = (estado: string) => {
        switch (estado) {
            case 'confirmada': return <CheckCircle className="h-4 w-4" />;
            case 'completada': return <CheckCircle className="h-4 w-4" />;
            case 'cancelada': return <XCircle className="h-4 w-4" />;
            case 'en_progreso': return <Clock className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    // Obtener fechas únicas para el filtro
    const fechasUnicas = [...new Set(actividadesArray.map(act => act.fecha?.split('T')[0]).filter(Boolean))].sort();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate(-1)}
                                variant="outline"
                                className="mr-4 flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Actividades Diarias</h1>
                                <p className="text-gray-600">
                                    {itinerario ? `${itinerario.titulo} - ${itinerario.ciudadDestino}` : 'Gestiona las actividades día a día'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={recargarDatos}
                                variant="outline"
                                className="flex items-center"
                                disabled={cargando}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
                                {cargando ? 'Cargando...' : 'Recargar'}
                            </Button>
                            <Button
                                onClick={abrirModalNuevo}
                                className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Actividad
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="todos">Todos los tipos</option>
                                {tiposActividad.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="todos">Todos los estados</option>
                                {estadosActividad.map(estado => (
                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                            <select
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="todas">Todas las fechas</option>
                                {fechasUnicas.map(fecha => (
                                    <option key={fecha} value={fecha}>
                                        {formatearFechaSafe(`${fecha}T00:00:00`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de Actividades */}
                <div className="space-y-4">
                    {cargando ? (
                        <Card className="p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">Cargando actividades...</p>
                            </div>
                        </Card>
                    ) : actividadesFiltradas.length === 0 ? (
                        <Card className="p-8">
                            <div className="text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {actividadesArray.length === 0 ? 'No hay actividades' : 'No hay actividades que coincidan con los filtros'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {actividadesArray.length === 0 ? 'Comienza agregando tu primera actividad diaria.' : 'Intenta ajustar los filtros o agregar nuevas actividades.'}
                                </p>
                                <Button onClick={abrirModalNuevo} className="bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Actividad
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        actividadesFiltradas.map((actividad) => {
                            const tipoConfig = tiposActividad.find(t => t.value === actividad.tipo) || tiposActividad[0];
                            const estadoConfig = estadosActividad.find(e => e.value === actividad.estado) || estadosActividad[0];
                            const prioridadConfig = prioridadActividad.find(p => p.value === actividad.prioridad) || prioridadActividad[0];
                            const IconoTipo = tipoConfig.icon;

                            return (
                                <Card key={actividad.id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-lg mr-4 ${getColorClasses(tipoConfig.color)}`}>
                                                <IconoTipo className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{actividad.titulo}</h3>
                                                <p className="text-gray-600">{actividad.ubicacion}</p>
                                                {actividad.descripcion && (
                                                    <p className="text-sm text-gray-500 mt-1">{actividad.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses(estadoConfig.color)}`}>
                                                {getIconoEstado(actividad.estado)}
                                                <span className="ml-1">{estadoConfig.label}</span>
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses(prioridadConfig.color)}`}>
                                                {prioridadConfig.label}
                                            </span>
                                            <Button
                                                onClick={() => abrirModalEditar(actividad)}
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => eliminarActividad(actividad.id!)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{formatearFechaSafe(actividad.fecha)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>
                                                {actividad.horaInicio}
                                                {actividad.horaFin && ` - ${actividad.horaFin}`}
                                            </span>
                                        </div>
                                        {actividad.direccion && (
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="truncate">{actividad.direccion}</span>
                                            </div>
                                        )}
                                    </div>

                                    {actividad.notas && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 italic">{actividad.notas}</p>
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Modal para crear/editar actividad */}
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
                                </h2>
                                <Button
                                    onClick={() => setModalAbierto(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Básica</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título *
                                        </label>
                                        <input
                                            type="text"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="ej. Visita al museo"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            rows={3}
                                            placeholder="Descripción detallada de la actividad"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Actividad
                                        </label>
                                        <select
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value as ActividadDiaria['tipo'])}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            {tiposActividad.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Prioridad
                                            </label>
                                            <select
                                                value={prioridad}
                                                onChange={(e) => setPrioridad(e.target.value as ActividadDiaria['prioridad'])}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                {prioridadActividad.map(prioridad => (
                                                    <option key={prioridad.value} value={prioridad.value}>{prioridad.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Estado
                                            </label>
                                            <select
                                                value={estado}
                                                onChange={(e) => setEstado(e.target.value as ActividadDiaria['estado'])}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                {estadosActividad.map(estado => (
                                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Horario y ubicación */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Horario y Ubicación</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha *
                                        </label>
                                        <input
                                            type="date"
                                            value={fecha}
                                            onChange={(e) => setFecha(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hora de Inicio *
                                            </label>
                                            <input
                                                type="time"
                                                value={horaInicio}
                                                onChange={(e) => setHoraInicio(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hora de Fin
                                            </label>
                                            <input
                                                type="time"
                                                value={horaFin}
                                                onChange={(e) => setHoraFin(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ubicación
                                        </label>
                                        <input
                                            type="text"
                                            value={ubicacion}
                                            onChange={(e) => setUbicacion(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="ej. Museo Nacional"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Dirección completa"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duración (min)
                                            </label>
                                            <input
                                                type="number"
                                                value={duracionEstimada}
                                                onChange={(e) => setDuracionEstimada(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="120"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Costo Estimado
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={costoEstimado}
                                                onChange={(e) => setCostoEstimado(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Moneda
                                            </label>
                                            <select
                                                value={moneda}
                                                onChange={(e) => setMoneda(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                {['USD', 'EUR', 'MXN', 'CAD', 'GBP'].map(moneda => (
                                                    <option key={moneda} value={moneda}>{moneda}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas Adicionales
                                </label>
                                <textarea
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    rows={3}
                                    placeholder="Notas, recordatorios o información adicional"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={() => setModalAbierto(false)}
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={guardarActividad}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {actividadEditando ? 'Actualizar' : 'Crear'} Actividad
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActividadesDiariasPage;
