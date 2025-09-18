import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowLeft, Edit3, Calendar, MapPin, Clock, DollarSign, Plane, Hotel, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Datos de países y ciudades
const paisesYCiudades: Record<string, string[]> = {
    "Estados Unidos": ["Nueva York", "Los Ángeles", "Chicago", "Houston", "Phoenix", "Filadelfia", "San Antonio", "San Diego", "Dallas", "San José", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte"],
    "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "San Luis Potosí", "Aguascalientes", "Hermosillo", "Saltillo", "Mexicali", "Culiacán"],
    "Canadá": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"],
    "Reino Unido": ["Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Leeds", "Edinburgh", "Leicester"],
    "Francia": ["París", "Marsella", "Lyon", "Toulouse", "Niza", "Nantes", "Montpellier", "Estrasburgo", "Burdeos", "Lille"],
    "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"],
    "Italia": ["Roma", "Milán", "Nápoles", "Turín", "Palermo", "Génova", "Bolonia", "Florencia", "Bari", "Catania"],
    "Alemania": ["Berlín", "Hamburgo", "Múnich", "Colonia", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
    "Brasil": ["São Paulo", "Río de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaos", "Curitiba", "Recife", "Goiânia"],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "San Miguel de Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan"],
    "Japón": ["Tokio", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Kyoto", "Saitama"],
    "Australia": ["Sídney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City"]
};

const monedas = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN'];

interface Itinerario {
    id?: string;
    titulo: string;
    twinId: string;
    viajeId: string;
    documentType: string;
    fechaCreacion: string;
    medioTransporte: string;
    tipoAlojamiento: string;
    ciudadOrigen: string;
    paisOrigen: string;
    ciudadDestino: string;
    paisDestino: string;
    fechaInicio: string;
    fechaFin: string;
    presupuestoEstimado: number;
    moneda: string;
    notas?: string;
}

const ItinerarioDetallePage: React.FC = () => {
    const { viajeId, itinerarioId } = useParams<{ viajeId: string; itinerarioId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { accounts } = useMsal();

    // Estados
    const [itinerario, setItinerario] = useState<Itinerario | null>(null);
    const [viaje, setViaje] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estados del modal de edición
    const [mostrandoModalEdicion, setMostrandoModalEdicion] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [paisOrigen, setPaisOrigen] = useState('');
    const [ciudadOrigen, setCiudadOrigen] = useState('');
    const [paisDestino, setPaisDestino] = useState('');
    const [ciudadDestino, setCiudadDestino] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [presupuestoEstimado, setPresupuestoEstimado] = useState('');
    const [monedaSeleccionada, setMonedaSeleccionada] = useState('USD');
    const [medioTransporte, setMedioTransporte] = useState('');
    const [tipoAlojamiento, setTipoAlojamiento] = useState('');
    const [notas, setNotas] = useState('');
    const [guardandoItinerario, setGuardandoItinerario] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [location.state]);

    const cargarDatos = () => {
        try {
            console.log('Parámetros de URL:', { viajeId, itinerarioId });
            
            if (location.state) {
                const { itinerario: itinerarioFromState, viaje: viajeFromState } = location.state;
                console.log('Cargando itinerario desde estado de navegación:', itinerarioFromState);
                
                if (itinerarioFromState) {
                    setItinerario(itinerarioFromState);
                }
                
                if (viajeFromState) {
                    setViaje(viajeFromState);
                }
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos del itinerario');
        } finally {
            setCargando(false);
        }
    };

    const calcularDuracion = (inicio: string, fin: string): string => {
        if (!inicio || !fin) return 'No definida';
        const inicioDate = new Date(inicio);
        const finDate = new Date(fin);
        const diferencia = finDate.getTime() - inicioDate.getTime();
        const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
        if (dias === 0) return '1 día';
        if (dias === 1) return '2 días';
        return `${dias + 1} días`;
    };

    const formatearFecha = (fecha: string): string => {
        if (!fecha) return 'No definida';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const volver = () => {
        const currentViajeId = viajeId || viaje?.id || 'unknown';
        navigate(`/twin-biografia/viajes-vacaciones/viaje-activo/${currentViajeId}`, { 
            state: { 
                viaje: viaje,
                viajeData: viaje,
                itinerarioEditado: itinerario
            } 
        });
    };

    const abrirModalEdicion = () => {
        console.log('Abriendo modal de edición, itinerario:', itinerario);
        if (itinerario) {
            setTitulo(itinerario.titulo || '');
            setPaisOrigen(itinerario.paisOrigen || '');
            setCiudadOrigen(itinerario.ciudadOrigen || '');
            setPaisDestino(itinerario.paisDestino || '');
            setCiudadDestino(itinerario.ciudadDestino || '');
            setFechaInicio(itinerario.fechaInicio || '');
            setFechaFin(itinerario.fechaFin || '');
            setPresupuestoEstimado(itinerario.presupuestoEstimado ? itinerario.presupuestoEstimado.toString() : '');
            setMonedaSeleccionada(itinerario.moneda || 'USD');
            setMedioTransporte(itinerario.medioTransporte || '');
            setTipoAlojamiento(itinerario.tipoAlojamiento || '');
            setNotas(itinerario.notas || '');
            setMostrandoModalEdicion(true);
        }
    };

    const cerrarModalEdicion = () => {
        setMostrandoModalEdicion(false);
    };

    const guardarItinerario = async () => {
        console.log('Guardando itinerario...');
        if (!titulo || !paisDestino || !ciudadDestino || !fechaInicio) {
            alert('Por favor completa al menos el título, destino y fecha de inicio');
            return;
        }

        try {
            setGuardandoItinerario(true);

            const itinerarioActualizado: Itinerario = {
                ...itinerario!,
                titulo,
                paisOrigen,
                ciudadOrigen,
                paisDestino,
                ciudadDestino,
                fechaInicio,
                fechaFin,
                presupuestoEstimado: presupuestoEstimado ? parseFloat(presupuestoEstimado) : 0,
                moneda: monedaSeleccionada,
                medioTransporte,
                tipoAlojamiento,
                notas
            };

            console.log('Itinerario actualizado:', itinerarioActualizado);
            setItinerario(itinerarioActualizado);
            
            // Actualizar el viaje en el contexto si existe
            if (viaje && viaje.itinerarios && Array.isArray(viaje.itinerarios)) {
                const viajeActualizado = {
                    ...viaje,
                    itinerarios: viaje.itinerarios.map((it: any) => 
                        it.id === itinerario!.id ? itinerarioActualizado : it
                    )
                };
                setViaje(viajeActualizado);
            }
            
            cerrarModalEdicion();
            alert('Itinerario actualizado correctamente');

        } catch (error) {
            console.error('Error guardando itinerario:', error);
            alert('Error al guardar el itinerario');
        } finally {
            setGuardandoItinerario(false);
        }
    };

    const ciudadesOrigenDisponibles = paisOrigen ? paisesYCiudades[paisOrigen] || [] : [];
    const ciudadesDestinoDisponibles = paisDestino ? paisesYCiudades[paisDestino] || [] : [];

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando itinerario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={volver} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
            </div>
        );
    }

    if (!itinerario) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No se encontró el itinerario</p>
                    <Button onClick={volver} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        onClick={volver}
                        variant="outline"
                        className="flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Viaje
                    </Button>
                </div>

                {/* Información principal del itinerario */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {itinerario.titulo}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {itinerario.ciudadOrigen && itinerario.paisOrigen 
                                    ? `${itinerario.ciudadOrigen}, ${itinerario.paisOrigen} → ` 
                                    : ''
                                }
                                {itinerario.ciudadDestino}, {itinerario.paisDestino}
                            </p>
                        </div>
                        <Button
                            onClick={abrirModalEdicion}
                            variant="outline"
                            className="flex items-center"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <div>
                                <span className="text-sm text-gray-500">Inicio: </span>
                                <span>{formatearFecha(itinerario.fechaInicio)}</span>
                            </div>
                        </div>
                        {itinerario.fechaFin && (
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                <div>
                                    <span className="text-sm text-gray-500">Fin: </span>
                                    <span>{formatearFecha(itinerario.fechaFin)}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-600" />
                            <span>Duración: {calcularDuracion(itinerario.fechaInicio, itinerario.fechaFin)}</span>
                        </div>
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
                            <span>
                                {itinerario.presupuestoEstimado && itinerario.presupuestoEstimado > 0 
                                    ? `$${itinerario.presupuestoEstimado.toLocaleString()} ${itinerario.moneda || 'USD'}`
                                    : 'Sin presupuesto definido'
                                }
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Plane className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{itinerario.medioTransporte || 'Transporte no especificado'}</span>
                        </div>
                        <div className="flex items-center">
                            <Hotel className="h-4 w-4 mr-2 text-green-600" />
                            <span>{itinerario.tipoAlojamiento || 'Alojamiento no especificado'}</span>
                        </div>
                    </div>
                </div>

                {/* Notas del itinerario */}
                {itinerario.notas && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas del Itinerario</h3>
                        <div className="bg-white p-4 rounded border">
                            <p className="text-gray-600 whitespace-pre-line">{itinerario.notas}</p>
                        </div>
                    </div>
                )}

                {/* Información técnica del itinerario */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">ID del Itinerario: </span>
                            <span className="font-mono">{itinerario.id}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">ID del Viaje: </span>
                            <span className="font-mono">{itinerario.viajeId}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Tipo de Documento: </span>
                            <span>{itinerario.documentType}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Fecha de Creación: </span>
                            <span>{formatearFecha(itinerario.fechaCreacion)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de edición */}
            {mostrandoModalEdicion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Editar Itinerario</h2>
                                <Button
                                    onClick={cerrarModalEdicion}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título del Viaje *
                                    </label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ej: Viaje a Ciudad de México"
                                        required
                                    />
                                </div>

                                {/* Origen */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            País de Origen
                                        </label>
                                        <select
                                            value={paisOrigen}
                                            onChange={(e) => {
                                                setPaisOrigen(e.target.value);
                                                setCiudadOrigen('');
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Selecciona un país</option>
                                            {Object.keys(paisesYCiudades).map(pais => (
                                                <option key={pais} value={pais}>{pais}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ciudad de Origen
                                        </label>
                                        <select
                                            value={ciudadOrigen}
                                            onChange={(e) => setCiudadOrigen(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={!paisOrigen}
                                        >
                                            <option value="">Selecciona una ciudad</option>
                                            {ciudadesOrigenDisponibles.map(ciudad => (
                                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Destino */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            País de Destino *
                                        </label>
                                        <select
                                            value={paisDestino}
                                            onChange={(e) => {
                                                setPaisDestino(e.target.value);
                                                setCiudadDestino('');
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ciudad de Destino *
                                        </label>
                                        <select
                                            value={ciudadDestino}
                                            onChange={(e) => setCiudadDestino(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={!paisDestino}
                                            required
                                        >
                                            <option value="">Selecciona una ciudad</option>
                                            {ciudadesDestinoDisponibles.map(ciudad => (
                                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>

                                {/* Presupuesto y moneda */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Presupuesto Estimado
                                        </label>
                                        <input
                                            type="number"
                                            value={presupuestoEstimado}
                                            onChange={(e) => setPresupuestoEstimado(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Moneda
                                        </label>
                                        <select
                                            value={monedaSeleccionada}
                                            onChange={(e) => setMonedaSeleccionada(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {monedas.map(moneda => (
                                                <option key={moneda} value={moneda}>{moneda}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Transporte y alojamiento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Medio de Transporte
                                        </label>
                                        <select
                                            value={medioTransporte}
                                            onChange={(e) => setMedioTransporte(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Selecciona transporte</option>
                                            <option value="avion">Avión</option>
                                            <option value="auto">Auto</option>
                                            <option value="tren">Tren</option>
                                            <option value="autobus">Autobús</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Alojamiento
                                        </label>
                                        <select
                                            value={tipoAlojamiento}
                                            onChange={(e) => setTipoAlojamiento(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Selecciona alojamiento</option>
                                            <option value="hotel">Hotel</option>
                                            <option value="hostel">Hostel</option>
                                            <option value="airbnb">Airbnb</option>
                                            <option value="casa">Casa de familia/amigos</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas Adicionales
                                    </label>
                                    <textarea
                                        value={notas}
                                        onChange={(e) => setNotas(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                        placeholder="Agrega cualquier información adicional sobre tu itinerario..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-4 pt-6">
                                    <Button
                                        onClick={cerrarModalEdicion}
                                        variant="outline"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={guardarItinerario}
                                        disabled={guardandoItinerario}
                                    >
                                        {guardandoItinerario ? 'Guardando...' : 'Guardar Cambios'}
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

export default ItinerarioDetallePage;
