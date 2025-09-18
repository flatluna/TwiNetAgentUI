import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Plus,
    MapPin,
    Calendar,
    DollarSign,
    Edit,
    Save,
    Trash2,
    Eye,
    X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Viaje } from '../../services/viajesApiService';

// Datos de países y ciudades (Ampliado con 52 ciudades de Estados Unidos)
const paisesYCiudades: Record<string, string[]> = {
    "Estados Unidos": [
        "Nueva York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", 
        "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", 
        "Indianapolis", "Seattle", "Denver", "Washington DC", "Boston", "El Paso", "Nashville", "Detroit", 
        "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", 
        "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Omaha", 
        "Raleigh", "Miami", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Arlington", "Tampa", 
        "New Orleans", "Wichita", "Cleveland", "Bakersfield"
    ],
    "Canadá": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Quebec City", "Winnipeg"],
    "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún", "Puerto Vallarta", "Mérida", "Playa del Carmen"],
    "España": ["Madrid", "Barcelona", "Sevilla", "Valencia", "Bilbao", "Granada", "Santander"],
    "Francia": ["París", "Lyon", "Marsella", "Niza", "Toulouse", "Burdeos", "Nantes"],
    "Italia": ["Roma", "Milán", "Venecia", "Florencia", "Nápoles", "Turín", "Bolonia"],
    "Reino Unido": ["Londres", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Edinburgh", "Bristol"],
    "Alemania": ["Berlín", "Múnich", "Hamburgo", "Colonia", "Frankfurt", "Stuttgart", "Düsseldorf"],
    "Japón": ["Tokio", "Osaka", "Kioto", "Hiroshima", "Nagoya", "Yokohama", "Fukuoka"],
    "Australia": ["Sídney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Darwin"],
    "Brasil": ["São Paulo", "Río de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Recife", "Manaus"],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Salta", "Bariloche"],
    "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Temuco", "Iquique", "Punta Arenas"],
    "Colombia": ["Bogotá", "Medellín", "Cali", "Cartagena", "Barranquilla", "Santa Marta", "Bucaramanga"],
    "Perú": ["Lima", "Cusco", "Arequipa", "Trujillo", "Chiclayo", "Iquitos", "Piura"],
    "China": ["Pekín", "Shanghái", "Guangzhou", "Shenzhen", "Tianjin", "Wuhan", "Chengdu"],
    "India": ["Nueva Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"],
    "Tailandia": ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Hua Hin", "Koh Samui"],
    "Grecia": ["Atenas", "Tesalónica", "Mykonos", "Santorini", "Creta", "Rodas", "Corfú"],
    "Turquía": ["Estambul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", "Gaziantep"]
};

const MONEDAS = [
    { codigo: 'USD', nombre: 'Dólar Estadounidense' },
    { codigo: 'EUR', nombre: 'Euro' },
    { codigo: 'MXN', nombre: 'Peso Mexicano' },
    { codigo: 'CAD', nombre: 'Dólar Canadiense' },
    { codigo: 'GBP', nombre: 'Libra Esterlina' },
    { codigo: 'JPY', nombre: 'Yen Japonés' },
    { codigo: 'AUD', nombre: 'Dólar Australiano' },
    { codigo: 'BRL', nombre: 'Real Brasileño' },
    { codigo: 'ARS', nombre: 'Peso Argentino' },
    { codigo: 'CLP', nombre: 'Peso Chileno' },
    { codigo: 'COP', nombre: 'Peso Colombiano' },
    { codigo: 'PEN', nombre: 'Sol Peruano' },
    { codigo: 'CNY', nombre: 'Yuan Chino' },
    { codigo: 'INR', nombre: 'Rupia India' },
    { codigo: 'THB', nombre: 'Baht Tailandés' },
    { codigo: 'TRY', nombre: 'Lira Turca' }
];

interface Itinerario {
    id?: number;
    pais: string;
    ciudad: string;
    fechaInicio: string;
    fechaFin: string;
    presupuesto: number;
    moneda: string;
    actividades: string;
    notas: string;
}

const ViajePrincipalPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId } = useParams<{ viajeId: string }>();
    
    // Estados principales
    const [viaje, setViaje] = useState<Viaje | null>(null);
    const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    
    // Estados del formulario de itinerario
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [itinerarioEnEdicion, setItinerarioEnEdicion] = useState<Itinerario | null>(null);
    const [paisSeleccionado, setPaisSeleccionado] = useState('');
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [presupuesto, setPresupuesto] = useState('');
    const [monedaSeleccionada, setMonedaSeleccionada] = useState('USD');
    const [actividades, setActividades] = useState('');
    const [notas, setNotas] = useState('');
    const [guardandoItinerario, setGuardandoItinerario] = useState(false);

    // Estados del modal de detalle
    const [mostrandoDetalle, setMostrandoDetalle] = useState(false);
    const [itinerarioDetalle, setItinerarioDetalle] = useState<Itinerario | null>(null);

    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        cargarViaje();
    }, [location.state, twinId]);

    const cargarViaje = async () => {
        try {
            setCargando(true);
            
            // Prioridad 1: Estado de navegación
            const viajeFromState = location.state?.viaje || location.state?.viajeData;
            const itinerarioEditado = location.state?.itinerarioEditado;
            
            if (viajeFromState) {
                console.log('Cargando viaje desde estado de navegación:', viajeFromState);
                setViaje(viajeFromState);
                
                // Cargar itinerarios del viaje
                if (viajeFromState.itinerarios && Array.isArray(viajeFromState.itinerarios)) {
                    let itinerariosActualizados = [...viajeFromState.itinerarios];
                    
                    // Si hay un itinerario editado, actualizarlo en la lista
                    if (itinerarioEditado) {
                        console.log('Aplicando cambios del itinerario editado:', itinerarioEditado);
                        itinerariosActualizados = itinerariosActualizados.map(it => 
                            it.id === itinerarioEditado.id ? itinerarioEditado : it
                        );
                    }
                    
                    setItinerarios(itinerariosActualizados);
                } else {
                    setItinerarios([]);
                }
            } else {
                // Fallback: datos mock para pruebas
                console.log('No se encontró viaje en estado de navegación, usando datos mock');
                const viajeDemo: Viaje = {
                    id: "999",
                    fase: 'planeacion' as any,
                    tipoViaje: 'vacaciones',
                    titulo: "Mi Viaje",
                    descripcion: "Viaje de demostración",
                    pais: "",
                    ciudad: "",
                    lugaresVisitados: [],
                    fechaInicio: new Date().toISOString(),
                    fechaFin: undefined,
                    motivoViaje: "",
                    acompanantes: [],
                    medioTransporte: 'otro',
                    itinerarios: []
                };
                setViaje(viajeDemo);
                setItinerarios([]);
            }
        } catch (error) {
            console.error('Error cargando viaje:', error);
            setError('Error al cargar el viaje');
        } finally {
            setCargando(false);
        }
    };

    const volver = () => {
        navigate('/twin-biografia/viajes-vacaciones');
    };

    const limpiarFormulario = () => {
        setItinerarioEnEdicion(null);
        setPaisSeleccionado('');
        setCiudadSeleccionada('');
        setFechaInicio('');
        setFechaFin('');
        setPresupuesto('');
        setMonedaSeleccionada('USD');
        setActividades('');
        setNotas('');
    };

    const mostrarFormulario = () => {
        limpiarFormulario();
        setMostrandoFormulario(true);
    };

    const ocultarFormulario = () => {
        setMostrandoFormulario(false);
        limpiarFormulario();
    };

    const editarItinerario = (itinerario: Itinerario) => {
        setItinerarioEnEdicion(itinerario);
        setPaisSeleccionado(itinerario.pais);
        setCiudadSeleccionada(itinerario.ciudad);
        setFechaInicio(itinerario.fechaInicio);
        setFechaFin(itinerario.fechaFin);
        setPresupuesto(itinerario.presupuesto.toString());
        setMonedaSeleccionada(itinerario.moneda);
        setActividades(itinerario.actividades);
        setNotas(itinerario.notas);
        setMostrandoFormulario(true);
    };

    const eliminarItinerario = (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este itinerario?')) {
            const itinerariosActualizados = itinerarios.filter(itinerario => itinerario.id !== id);
            setItinerarios(itinerariosActualizados);
            
            // Actualizar también el estado del viaje para mantener sincronía
            if (viaje) {
                const viajeActualizado = {
                    ...viaje,
                    itinerarios: itinerariosActualizados
                };
                setViaje(viajeActualizado);
            }
        }
    };

    const guardarItinerario = async () => {
        // Validaciones básicas
        if (!paisSeleccionado || !ciudadSeleccionada || !fechaInicio) {
            alert('Por favor completa al menos el país, ciudad y fecha de inicio');
            return;
        }

        try {
            setGuardandoItinerario(true);

            const nuevoItinerario: Itinerario = {
                id: itinerarioEnEdicion?.id || Date.now(),
                pais: paisSeleccionado,
                ciudad: ciudadSeleccionada,
                fechaInicio,
                fechaFin,
                presupuesto: presupuesto ? parseFloat(presupuesto) : 0,
                moneda: monedaSeleccionada,
                actividades,
                notas
            };

            // Intentar guardar en el backend
            try {
                const baseUrl = import.meta.env.DEV 
                    ? '' 
                    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

                const response = await fetch(`${baseUrl}/api/itinerarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        twinId: twinId,
                        viajeId: viaje?.id,
                        ...nuevoItinerario
                    })
                });

                if (!response.ok) {
                    console.warn('Error en API, guardando localmente');
                }
            } catch (apiError) {
                console.warn('API no disponible, guardando localmente:', apiError);
            }

            // Actualizar estado local
            let itinerariosActualizados;
            if (itinerarioEnEdicion) {
                itinerariosActualizados = itinerarios.map(item => 
                    item.id === itinerarioEnEdicion.id ? nuevoItinerario : item
                );
                setItinerarios(itinerariosActualizados);
            } else {
                itinerariosActualizados = [...itinerarios, nuevoItinerario];
                setItinerarios(itinerariosActualizados);
            }

            // Actualizar también el estado del viaje para mantener sincronía
            if (viaje) {
                const viajeActualizado = {
                    ...viaje,
                    itinerarios: itinerariosActualizados
                };
                setViaje(viajeActualizado);
            }

            ocultarFormulario();
            alert(itinerarioEnEdicion ? 'Itinerario actualizado' : 'Itinerario agregado');

        } catch (error) {
            console.error('Error guardando itinerario:', error);
            alert('Error al guardar el itinerario');
        } finally {
            setGuardandoItinerario(false);
        }
    };

    const abrirModalDetalle = (itinerario: Itinerario) => {
        setItinerarioDetalle(itinerario);
        setMostrandoDetalle(true);
    };

    const irADetalleItinerario = (itinerario: Itinerario) => {
        const currentViajeId = viajeId || viaje?.id || 'unknown';
        const itinerarioId = itinerario.id || 'new';
        
        navigate(`/twin-biografia/viajes-vacaciones/viaje-activo/${currentViajeId}/itinerario-detalle/${itinerarioId}`, {
            state: {
                itinerario: itinerario,
                viaje: viaje
            }
        });
    };

    const cerrarModalDetalle = () => {
        setMostrandoDetalle(false);
        setItinerarioDetalle(null);
    };

    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'Sin especificar';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const ciudadesDisponibles = paisSeleccionado ? paisesYCiudades[paisSeleccionado] || [] : [];

    // Lógica para el título del botón
    const tituloBoton = itinerarios.length > 0 ? "Manejar tus Itinerarios" : "Adicionar Itinerario";

    if (cargando) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Cargando viaje...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={volver}
                        variant="outline"
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Viajes
                    </Button>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {viaje?.titulo || 'Mi Viaje'}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {viaje?.descripcion || 'Gestiona tus itinerarios de viaje'}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                <span>Inicio: {viaje?.fechaInicio ? formatearFecha(viaje.fechaInicio) : 'Por definir'}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                <span>Fin: {viaje?.fechaFin ? formatearFecha(viaje.fechaFin) : 'Por definir'}</span>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
                                <span>Itinerarios: {itinerarios.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón principal */}
                <div className="mb-6">
                    <Button
                        onClick={mostrarFormulario}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {tituloBoton}
                    </Button>
                </div>

                {/* Lista de itinerarios */}
                {itinerarios.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {itinerarios.map((itinerario) => (
                            <Card 
                                key={itinerario.id} 
                                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => irADetalleItinerario(itinerario)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
                                            {itinerario.ciudad}
                                        </h3>
                                        <p className="text-gray-600 text-sm">{itinerario.pais}</p>
                                    </div>
                                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => abrirModalDetalle(itinerario)}
                                            title="Vista rápida"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => editarItinerario(itinerario)}
                                            title="Editar"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => eliminarItinerario(itinerario.id!)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                                        <span>{formatearFecha(itinerario.fechaInicio)}</span>
                                        {itinerario.fechaFin && (
                                            <span className="text-gray-500"> - {formatearFecha(itinerario.fechaFin)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-2 text-green-600" />
                                        <span>${itinerario.presupuesto} {itinerario.moneda}</span>
                                    </div>
                                    {itinerario.actividades && (
                                        <div className="flex items-start">
                                            <MapPin className="h-3 w-3 mr-2 text-red-600 mt-0.5" />
                                            <span className="text-gray-600 line-clamp-2">{itinerario.actividades}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Haz clic para gestionar</span>
                                        <span>Bookings • Actividades</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Mensaje cuando no hay itinerarios */}
                {itinerarios.length === 0 && !mostrandoFormulario && (
                    <div className="text-center py-12">
                        <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No hay itinerarios todavía
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Comienza agregando tu primer destino al viaje
                        </p>
                        <Button
                            onClick={mostrarFormulario}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Primer Itinerario
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal de formulario */}
            {mostrandoFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {itinerarioEnEdicion ? 'Editar Itinerario' : 'Nuevo Itinerario'}
                                </h2>
                                <Button
                                    onClick={ocultarFormulario}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* País */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        País *
                                    </label>
                                    <select
                                        value={paisSeleccionado}
                                        onChange={(e) => {
                                            setPaisSeleccionado(e.target.value);
                                            setCiudadSeleccionada('');
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Selecciona un país</option>
                                        {Object.keys(paisesYCiudades).map(pais => (
                                            <option key={pais} value={pais}>{pais}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ciudad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ciudad *
                                    </label>
                                    <select
                                        value={ciudadSeleccionada}
                                        onChange={(e) => setCiudadSeleccionada(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={!paisSeleccionado}
                                        required
                                    >
                                        <option value="">Selecciona una ciudad</option>
                                        {ciudadesDisponibles.map(ciudad => (
                                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha de inicio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Fecha de fin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Presupuesto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Presupuesto
                                    </label>
                                    <input
                                        type="number"
                                        value={presupuesto}
                                        onChange={(e) => setPresupuesto(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Moneda */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Moneda
                                    </label>
                                    <select
                                        value={monedaSeleccionada}
                                        onChange={(e) => setMonedaSeleccionada(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {MONEDAS.map(moneda => (
                                            <option key={moneda.codigo} value={moneda.codigo}>
                                                {moneda.codigo} - {moneda.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Campos de texto largo */}
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Actividades Planeadas
                                    </label>
                                    <textarea
                                        value={actividades}
                                        onChange={(e) => setActividades(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Describe las actividades que planeas hacer..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas Adicionales
                                    </label>
                                    <textarea
                                        value={notas}
                                        onChange={(e) => setNotas(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Cualquier información adicional..."
                                    />
                                </div>
                            </div>

                            {/* Botones del modal */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <Button
                                    onClick={ocultarFormulario}
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={guardarItinerario}
                                    disabled={guardandoItinerario}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {guardandoItinerario ? 'Guardando...' : (itinerarioEnEdicion ? 'Actualizar' : 'Guardar')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalle */}
            {mostrandoDetalle && itinerarioDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Detalles del Itinerario
                                </h2>
                                <Button
                                    onClick={cerrarModalDetalle}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Información básica */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Destino</h3>
                                        <p className="text-gray-600">{itinerarioDetalle.ciudad}, {itinerarioDetalle.pais}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Presupuesto</h3>
                                        <p className="text-gray-600">${itinerarioDetalle.presupuesto} {itinerarioDetalle.moneda}</p>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Fecha de Inicio</h3>
                                        <p className="text-gray-600">{formatearFecha(itinerarioDetalle.fechaInicio)}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Fecha de Fin</h3>
                                        <p className="text-gray-600">{formatearFecha(itinerarioDetalle.fechaFin)}</p>
                                    </div>
                                </div>

                                {/* Actividades */}
                                {itinerarioDetalle.actividades && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Actividades Planeadas</h3>
                                        <p className="text-gray-600 whitespace-pre-line">{itinerarioDetalle.actividades}</p>
                                    </div>
                                )}

                                {/* Notas */}
                                {itinerarioDetalle.notas && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
                                        <p className="text-gray-600 whitespace-pre-line">{itinerarioDetalle.notas}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={cerrarModalDetalle}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViajePrincipalPage;
