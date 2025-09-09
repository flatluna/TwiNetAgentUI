import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Plus,
    Calendar,
    Activity,
    Target,
    Edit,
    Trash2,
    Save,
    X,
    Search,
    Dumbbell,
    Timer,
    Zap,
    MapPin
} from "lucide-react";

// Tipos de datos
interface ActividadEjercicio {
    id: string;
    fecha: string;
    tipoActividad: string;
    duracionMinutos: number;
    intensidad: 'baja' | 'moderada' | 'alta';
    calorias?: number;
    pasos?: number;
    distanciaKm?: number;
    frecuenciaCardiacaPromedio?: number;
    frecuenciaCardiacaMaxima?: number;
    ubicacion?: string;
    notas?: string;
    ejerciciosDetalle?: EjercicioDetalle[];
    // Nuevos campos agregados
    nivelEsfuerzo?: number; // Escala 1-10
    hidratacionMl?: number; // Cantidad de agua en ml
    clima?: string; // Condiciones climáticas
    fechaCreacion: string;
    fechaActualizacion: string;
}

interface EjercicioDetalle {
    nombre: string;
    series?: number;
    repeticiones?: number;
    peso?: number;
    tiempoSegundos?: number;
}

const EjercicioActividadPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    // Estados principales
    const [actividades, setActividades] = useState<ActividadEjercicio[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [actividadEditando, setActividadEditando] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Estados para filtros
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Estado para nueva actividad
    const [nuevaActividad, setNuevaActividad] = useState<Partial<ActividadEjercicio>>({
        fecha: new Date().toISOString().split('T')[0],
        tipoActividad: '',
        duracionMinutos: 30,
        intensidad: 'moderada',
        calorias: 0,
        pasos: 0,
        distanciaKm: 0,
        frecuenciaCardiacaPromedio: 0,
        frecuenciaCardiacaMaxima: 0,
        ubicacion: '',
        nivelEsfuerzo: 5,
        hidratacionMl: 0,
        clima: '',
        notas: ''
    });

    // Listas predefinidas
    const tiposActividad = [
        'Caminar', 'Correr', 'Ciclismo', 'Natación', 'Gimnasio', 'Yoga', 'Pilates',
        'Futbol', 'Basketball', 'Tenis', 'Boxeo', 'Escalada', 'Baile', 'Hiking',
        'Spinning', 'Crossfit', 'Cardio', 'Pesas', 'Funcional', 'Stretching',
        'Remo', 'Golf', 'Esquí', 'Surf', 'Voleibol', 'Otro'
    ];

    const ubicaciones = [
        'Casa', 'Gimnasio', 'Parque', 'Calle/Barrio', 'Playa', 'Montaña',
        'Club deportivo', 'Piscina', 'Centro de entrenamiento', 'Otro'
    ];

    const condicionesClimaticas = [
        'Soleado', 'Parcialmente nublado', 'Nublado', 'Lluvioso', 'Tormenta',
        'Nevado', 'Ventoso', 'Caluroso', 'Frío', 'Húmedo', 'Seco',
        'Interior (clima controlado)', 'Otro'
    ];

    const getCurrentTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Cargar actividades desde localStorage
    useEffect(() => {
        cargarActividades();
    }, []);

    const cargarActividades = () => {
        setLoading(true);
        try {
            const twinId = getCurrentTwinId();
            const key = `ejercicios_${twinId}`;
            const actividadesGuardadas = localStorage.getItem(key);
            
            if (actividadesGuardadas) {
                const actividades = JSON.parse(actividadesGuardadas);
                setActividades(actividades);
            }
        } catch (error) {
            console.error('Error cargando actividades:', error);
        } finally {
            setLoading(false);
        }
    };

    const guardarActividades = (nuevasActividades: ActividadEjercicio[]) => {
        const twinId = getCurrentTwinId();
        const key = `ejercicios_${twinId}`;
        localStorage.setItem(key, JSON.stringify(nuevasActividades));
        setActividades(nuevasActividades);
    };

    const crearActividad = () => {
        if (!nuevaActividad.tipoActividad || !nuevaActividad.duracionMinutos) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const actividad: ActividadEjercicio = {
            id: Date.now().toString(),
            fecha: nuevaActividad.fecha || new Date().toISOString().split('T')[0],
            tipoActividad: nuevaActividad.tipoActividad,
            duracionMinutos: nuevaActividad.duracionMinutos,
            intensidad: nuevaActividad.intensidad || 'moderada',
            calorias: nuevaActividad.calorias,
            pasos: nuevaActividad.pasos,
            distanciaKm: nuevaActividad.distanciaKm,
            frecuenciaCardiacaPromedio: nuevaActividad.frecuenciaCardiacaPromedio,
            frecuenciaCardiacaMaxima: nuevaActividad.frecuenciaCardiacaMaxima,
            ubicacion: nuevaActividad.ubicacion,
            nivelEsfuerzo: nuevaActividad.nivelEsfuerzo,
            hidratacionMl: nuevaActividad.hidratacionMl,
            clima: nuevaActividad.clima,
            notas: nuevaActividad.notas,
            ejerciciosDetalle: nuevaActividad.ejerciciosDetalle || [],
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };

        const nuevasActividades = [...actividades, actividad];
        guardarActividades(nuevasActividades);
        
        // Resetear formulario
        setNuevaActividad({
            fecha: new Date().toISOString().split('T')[0],
            tipoActividad: '',
            duracionMinutos: 30,
            intensidad: 'moderada',
            calorias: 0,
            pasos: 0,
            distanciaKm: 0,
            frecuenciaCardiacaPromedio: 0,
            frecuenciaCardiacaMaxima: 0,
            ubicacion: '',
            nivelEsfuerzo: 5,
            hidratacionMl: 0,
            clima: '',
            notas: ''
        });
        
        setModalAbierto(false);
    };

    const editarActividad = (id: string) => {
        const actividad = actividades.find(a => a.id === id);
        if (actividad) {
            setNuevaActividad(actividad);
            setActividadEditando(id);
            setModoEdicion(true);
            setModalAbierto(true);
        }
    };

    const guardarEdicion = () => {
        if (!actividadEditando) return;

        const actividadActualizada: ActividadEjercicio = {
            ...(nuevaActividad as ActividadEjercicio),
            id: actividadEditando,
            fechaActualizacion: new Date().toISOString()
        };

        const nuevasActividades = actividades.map(a => 
            a.id === actividadEditando ? actividadActualizada : a
        );
        
        guardarActividades(nuevasActividades);
        cancelarEdicion();
    };

    const eliminarActividad = (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            const nuevasActividades = actividades.filter(a => a.id !== id);
            guardarActividades(nuevasActividades);
        }
    };

    const cancelarEdicion = () => {
        setModalAbierto(false);
        setModoEdicion(false);
        setActividadEditando(null);
        setNuevaActividad({
            fecha: new Date().toISOString().split('T')[0],
            tipoActividad: '',
            duracionMinutos: 30,
            intensidad: 'moderada',
            calorias: 0,
            pasos: 0,
            distanciaKm: 0,
            frecuenciaCardiacaPromedio: 0,
            frecuenciaCardiacaMaxima: 0,
            ubicacion: '',
            nivelEsfuerzo: 5,
            hidratacionMl: 0,
            clima: '',
            notas: ''
        });
    };

    // Filtros
    const actividadesFiltradas = actividades.filter(actividad => {
        const coincideBusqueda = busqueda === '' || 
            actividad.tipoActividad.toLowerCase().includes(busqueda.toLowerCase()) ||
            (actividad.ubicacion && actividad.ubicacion.toLowerCase().includes(busqueda.toLowerCase())) ||
            (actividad.notas && actividad.notas.toLowerCase().includes(busqueda.toLowerCase()));
        
        const coincideTipo = filtroTipo === '' || actividad.tipoActividad === filtroTipo;
        
        const coincideFecha = filtroFecha === '' || 
            actividad.fecha.startsWith(filtroFecha);
        
        return coincideBusqueda && coincideTipo && coincideFecha;
    });

    // Estadísticas
    const hoy = new Date().toISOString().split('T')[0];
    const actividadesHoy = actividades.filter(a => a.fecha === hoy);
    const minutosHoy = actividadesHoy.reduce((total, a) => total + a.duracionMinutos, 0);
    const pasosHoy = actividadesHoy.reduce((total, a) => total + (a.pasos || 0), 0);
    const caloriasHoy = actividadesHoy.reduce((total, a) => total + (a.calorias || 0), 0);

    const getIntensidadColor = (intensidad: string) => {
        switch (intensidad) {
            case 'baja': return 'bg-green-100 text-green-800';
            case 'moderada': return 'bg-yellow-100 text-yellow-800';
            case 'alta': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatearDuracion = (minutos: number) => {
        if (minutos < 60) return `${minutos}m`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={20} />
                                Volver a Biografía
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <Activity size={28} className="text-green-600" />
                                    Ejercicio y Actividad Física
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setModalAbierto(true)}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Nueva Actividad
                        </Button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Actividades Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{actividadesHoy.length}</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tiempo Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{formatearDuracion(minutosHoy)}</p>
                            </div>
                            <Timer className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pasos Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{pasosHoy.toLocaleString()}</p>
                            </div>
                            <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Calorías Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{caloriasHoy}</p>
                            </div>
                            <Zap className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Filtros y búsqueda */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder="Buscar por actividad, ubicación o notas..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <input
                                    type="month"
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todos los tipos</option>
                                    {tiposActividad.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de actividades */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="ml-2 text-gray-600">Cargando actividades...</span>
                            </div>
                        ) : actividadesFiltradas.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay actividades registradas</h3>
                                <p className="text-gray-500 mb-4">Comienza registrando tu primera actividad física</p>
                                <Button
                                    onClick={() => setModalAbierto(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Agregar Primera Actividad
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {actividadesFiltradas.map((actividad) => (
                                    <div key={actividad.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Dumbbell size={20} className="text-green-600" />
                                                    <h3 className="font-semibold text-gray-800">{actividad.tipoActividad}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensidadColor(actividad.intensidad)}`}>
                                                        {actividad.intensidad}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        <span>{new Date(actividad.fecha).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Timer size={16} />
                                                        <span>{formatearDuracion(actividad.duracionMinutos)}</span>
                                                    </div>
                                                    {actividad.calorias && actividad.calorias > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <Zap size={16} />
                                                            <span>{actividad.calorias} kcal</span>
                                                        </div>
                                                    )}
                                                    {actividad.ubicacion && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={16} />
                                                            <span>{actividad.ubicacion}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nuevos campos */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                                    {actividad.nivelEsfuerzo && (
                                                        <div>
                                                            <span className="font-medium">Esfuerzo:</span> {actividad.nivelEsfuerzo}/10
                                                        </div>
                                                    )}
                                                    {actividad.hidratacionMl && actividad.hidratacionMl > 0 && (
                                                        <div>
                                                            <span className="font-medium">Hidratación:</span> {actividad.hidratacionMl}ml
                                                        </div>
                                                    )}
                                                    {actividad.clima && (
                                                        <div>
                                                            <span className="font-medium">Clima:</span> {actividad.clima}
                                                        </div>
                                                    )}
                                                </div>

                                                {actividad.notas && (
                                                    <p className="text-sm text-gray-600 italic">{actividad.notas}</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => editarActividad(actividad.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => eliminarActividad(actividad.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal responsive para nueva actividad */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Plus size={28} className="text-green-600" />
                                    {modoEdicion ? 'Editar Actividad' : 'Nueva Actividad'}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelarEdicion}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Campos básicos */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                                        <input
                                            type="date"
                                            value={nuevaActividad.fecha}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, fecha: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Actividad *</label>
                                        <select
                                            value={nuevaActividad.tipoActividad}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, tipoActividad: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar actividad</option>
                                            {tiposActividad.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos) *</label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.duracionMinutos}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, duracionMinutos: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Intensidad y métricas */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Intensidad</label>
                                        <select
                                            value={nuevaActividad.intensidad}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, intensidad: e.target.value as 'baja' | 'moderada' | 'alta'})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="baja">Baja</option>
                                            <option value="moderada">Moderada</option>
                                            <option value="alta">Alta</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Calorías</label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.calorias}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, calorias: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pasos</label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.pasos}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, pasos: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Distancia (km)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={nuevaActividad.distanciaKm}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, distanciaKm: parseFloat(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Frecuencia cardíaca */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">FC Promedio</label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.frecuenciaCardiacaPromedio}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, frecuenciaCardiacaPromedio: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                            max="220"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">FC Máxima</label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.frecuenciaCardiacaMaxima}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, frecuenciaCardiacaMaxima: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                            max="220"
                                        />
                                    </div>
                                </div>

                                {/* Ubicación y nuevos campos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                                        <select
                                            value={nuevaActividad.ubicacion}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, ubicacion: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar ubicación</option>
                                            {ubicaciones.map(ubicacion => (
                                                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nivel de Esfuerzo (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.nivelEsfuerzo}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, nivelEsfuerzo: parseInt(e.target.value) || 5})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="1"
                                            max="10"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">1=Muy fácil, 10=Máximo esfuerzo</p>
                                    </div>
                                </div>

                                {/* Hidratación y clima */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hidratación (ml)
                                        </label>
                                        <input
                                            type="number"
                                            value={nuevaActividad.hidratacionMl}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, hidratacionMl: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            min="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Agua consumida durante la actividad</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Condiciones Climáticas
                                        </label>
                                        <select
                                            value={nuevaActividad.clima}
                                            onChange={(e) => setNuevaActividad({...nuevaActividad, clima: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar clima</option>
                                            {condicionesClimaticas.map(clima => (
                                                <option key={clima} value={clima}>{clima}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Notas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        value={nuevaActividad.notas || ''}
                                        onChange={(e) => setNuevaActividad({...nuevaActividad, notas: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Cómo te sentiste, logros, observaciones..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={modoEdicion ? guardarEdicion : crearActividad}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <Save size={16} className="mr-2" />
                                        {modoEdicion ? 'Guardar Cambios' : 'Crear Actividad'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={cancelarEdicion}
                                    >
                                        <X size={16} className="mr-2" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EjercicioActividadPage;
