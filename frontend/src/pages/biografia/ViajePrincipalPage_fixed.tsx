import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Plus,
    MapPin,
    Calendar,
    DollarSign,
    Edit,
    Save,
    Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import viajesApiService, { Viaje } from '../../services/viajesApiService';

// Datos de países y ciudades
const paisesYCiudades: Record<string, string[]> = {
  'Estados Unidos': ['Nueva York', 'Los Ángeles', 'Chicago', 'Miami', 'Las Vegas', 'San Francisco', 'Boston', 'Washington D.C.', 'Orlando', 'Seattle'],
  'España': ['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Bilbao', 'Málaga', 'Granada', 'Toledo', 'Santiago de Compostela', 'San Sebastián'],
  'Francia': ['París', 'Lyon', 'Marsella', 'Niza', 'Toulouse', 'Burdeos', 'Lille', 'Nantes', 'Estrasburgo', 'Montpellier'],
  'Italia': ['Roma', 'Milán', 'Venecia', 'Florencia', 'Nápoles', 'Turín', 'Palermo', 'Génova', 'Bolonia', 'Verona'],
  'Reino Unido': ['Londres', 'Manchester', 'Liverpool', 'Birmingham', 'Glasgow', 'Edimburgo', 'Bristol', 'Leeds', 'Sheffield', 'Newcastle'],
  'Alemania': ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  'Japón': ['Tokio', 'Osaka', 'Kioto', 'Yokohama', 'Kobe', 'Nagoya', 'Sapporo', 'Fukuoka', 'Hiroshima', 'Sendai'],
  'China': ['Pekín', 'Shanghái', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xian', 'Suzhou', 'Nanjing'],
  'Brasil': ['São Paulo', 'Río de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  'México': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'],
  'Canadá': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec', 'Hamilton', 'Kitchener'],
  'Australia': ['Sídney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaida', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'],
  'Rusia': ['Moscú', 'San Petersburgo', 'Novosibirsk', 'Yekaterimburgo', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov del Don'],
  'Turquía': ['Estambul', 'Ankara', 'Esmirna', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin'],
  'Tailandia': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Ayutthaya', 'Sukhothai', 'Chiang Rai', 'Hua Hin', 'Koh Samui'],
  'Países Bajos': ['Ámsterdam', 'Rotterdam', 'La Haya', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'],
  'Suiza': ['Zúrich', 'Ginebra', 'Basilea', 'Lausana', 'Berna', 'Winterthur', 'Lucerna', 'St. Gallen', 'Lugano', 'Biel'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué']
};

// Interfaz para un itinerario
interface Itinerario {
    id: string;
    titulo: string;
    descripcion: string;
    ciudadOrigen: string;
    paisOrigen: string;
    ciudadDestino: string;
    paisDestino: string;
    fechaInicio: string;
    fechaFin: string;
    medioTransporte: string;
    presupuestoEstimado?: number;
    moneda?: string;
    tipoAlojamiento?: string;
    notas?: string;
    fechaCreacion: string;
}

export const ViajePrincipalPage: React.FC = () => {
    const { viajeId } = useParams<{ viajeId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viaje, setViaje] = useState<Viaje | null>(null);
    const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
    const [editandoViaje, setEditandoViaje] = useState(false);
    const [mostrarFormItinerario, setMostrarFormItinerario] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para ciudades dinámicas
    const [ciudadesOrigen, setCiudadesOrigen] = useState<string[]>([]);
    const [ciudadesDestino, setCiudadesDestino] = useState<string[]>([]);
    
    const [formViaje, setFormViaje] = useState({
        titulo: '',
        descripcion: ''
    });

    const [nuevoItinerario, setNuevoItinerario] = useState({
        titulo: '',
        descripcion: '',
        ciudadOrigen: '',
        paisOrigen: '',
        ciudadDestino: '',
        paisDestino: '',
        fechaInicio: '',
        fechaFin: '',
        medioTransporte: 'avion',
        presupuestoEstimado: '',
        moneda: 'USD',
        tipoAlojamiento: '',
        notas: ''
    });

    // Función para manejar cambio de país de origen
    const handlePaisOrigenChange = (pais: string) => {
        setNuevoItinerario(prev => ({
            ...prev,
            paisOrigen: pais,
            ciudadOrigen: '' // Reset ciudad cuando cambia el país
        }));
        setCiudadesOrigen(paisesYCiudades[pais] || []);
    };

    // Función para manejar cambio de país de destino
    const handlePaisDestinoChange = (pais: string) => {
        setNuevoItinerario(prev => ({
            ...prev,
            paisDestino: pais,
            ciudadDestino: '' // Reset ciudad cuando cambia el país
        }));
        setCiudadesDestino(paisesYCiudades[pais] || []);
    };

    const cargarItinerarios = async () => {
        try {
            // Mock de itinerarios para desarrollo
            const mockItinerarios: Itinerario[] = [
                {
                    id: '1',
                    titulo: 'Madrid a París',
                    descripcion: 'Viaje en tren por Europa',
                    ciudadOrigen: 'Madrid',
                    paisOrigen: 'España',
                    ciudadDestino: 'París',
                    paisDestino: 'Francia',
                    fechaInicio: '2024-07-15',
                    fechaFin: '2024-07-22',
                    medioTransporte: 'tren',
                    presupuestoEstimado: 1500,
                    moneda: 'EUR',
                    tipoAlojamiento: 'hotel',
                    notas: 'Visita a museos y lugares históricos',
                    fechaCreacion: new Date().toISOString()
                }
            ];
            setItinerarios(mockItinerarios);
        } catch (error) {
            console.error('Error cargando itinerarios:', error);
        }
    };

    const cargarViaje = async () => {
        try {
            setCargando(true);
            
            const twinId = accounts[0]?.localAccountId;
            if (!twinId || !viajeId) {
                console.log('TwinId o ViajeId no disponible, usando datos mock');
                // Crear viaje temporal para desarrollo
                const viajeTemp: Viaje = {
                    id: viajeId!,
                    twinId: twinId!,
                    fase: 'planeacion' as any,
                    tipoViaje: 'vacaciones',
                    titulo: 'Mi Viaje a Europa',
                    descripcion: 'Un viaje increíble por las principales ciudades europeas',
                    pais: '',
                    ciudad: '',
                    lugaresVisitados: [],
                    fechaInicio: new Date().toISOString(),
                    fechaFin: '',
                    motivoViaje: '',
                    acompanantes: [],
                    medioTransporte: 'avion',
                    presupuestoTotal: 0,
                    moneda: 'USD'
                };
                setViaje(viajeTemp);
                setFormViaje({
                    titulo: viajeTemp.titulo,
                    descripcion: viajeTemp.descripcion || ''
                });
                cargarItinerarios();
            } else {
                // Cargar viaje real del backend
                const viajeTemp: Viaje = {
                    id: viajeId!,
                    twinId: twinId!,
                    fase: 'planeacion' as any,
                    tipoViaje: 'vacaciones',
                    titulo: 'Mi Viaje a Europa',
                    descripcion: 'Un viaje increíble por las principales ciudades europeas',
                    pais: '',
                    ciudad: '',
                    lugaresVisitados: [],
                    fechaInicio: new Date().toISOString(),
                    fechaFin: '',
                    motivoViaje: '',
                    acompanantes: [],
                    medioTransporte: 'avion',
                    presupuestoTotal: 0,
                    moneda: 'USD'
                };
                setViaje(viajeTemp);
                setFormViaje({
                    titulo: viajeTemp.titulo,
                    descripcion: viajeTemp.descripcion || ''
                });
                cargarItinerarios();
            }
        } catch (error) {
            console.error('Error cargando viaje:', error);
            setError('Error al cargar el viaje');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarViaje();
    }, [viajeId, accounts]);

    const guardarViaje = async () => {
        try {
            if (!viaje) return;
            
            const viajeActualizado = {
                ...viaje,
                titulo: formViaje.titulo,
                descripcion: formViaje.descripcion
            };
            
            setViaje(viajeActualizado);
            setEditandoViaje(false);
            
            // TODO: Aquí iría la llamada al backend para guardar el viaje
            console.log('Viaje guardado:', viajeActualizado);
        } catch (error) {
            console.error('Error guardando viaje:', error);
            setError('Error al guardar el viaje');
        }
    };

    const agregarItinerario = async () => {
        try {
            if (!nuevoItinerario.titulo || !nuevoItinerario.ciudadOrigen || !nuevoItinerario.paisOrigen || 
                !nuevoItinerario.ciudadDestino || !nuevoItinerario.paisDestino || !nuevoItinerario.fechaInicio || 
                !nuevoItinerario.fechaFin) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            const itinerario: Itinerario = {
                id: Date.now().toString(),
                titulo: nuevoItinerario.titulo,
                descripcion: nuevoItinerario.descripcion || '',
                ciudadOrigen: nuevoItinerario.ciudadOrigen,
                paisOrigen: nuevoItinerario.paisOrigen,
                ciudadDestino: nuevoItinerario.ciudadDestino,
                paisDestino: nuevoItinerario.paisDestino,
                fechaInicio: nuevoItinerario.fechaInicio,
                fechaFin: nuevoItinerario.fechaFin,
                medioTransporte: nuevoItinerario.medioTransporte,
                presupuestoEstimado: parseFloat(nuevoItinerario.presupuestoEstimado) || undefined,
                moneda: nuevoItinerario.moneda,
                tipoAlojamiento: nuevoItinerario.tipoAlojamiento,
                notas: nuevoItinerario.notas,
                fechaCreacion: new Date().toISOString()
            };

            setItinerarios(prev => [...prev, itinerario]);
            
            // Reset form
            setNuevoItinerario({
                titulo: '',
                descripcion: '',
                ciudadOrigen: '',
                paisOrigen: '',
                ciudadDestino: '',
                paisDestino: '',
                fechaInicio: '',
                fechaFin: '',
                medioTransporte: 'avion',
                presupuestoEstimado: '',
                moneda: 'USD',
                tipoAlojamiento: '',
                notas: ''
            });
            setCiudadesOrigen([]);
            setCiudadesDestino([]);
            setMostrarFormItinerario(false);
            
            console.log('Itinerario agregado:', itinerario);
        } catch (error) {
            console.error('Error agregando itinerario:', error);
            setError('Error al agregar el itinerario');
        }
    };

    const eliminarItinerario = (id: string) => {
        setItinerarios(prev => prev.filter(it => it.id !== id));
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Cargando viaje...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => navigate('/biografia/viajes-vacaciones')}>
                        Volver a Viajes
                    </Button>
                </div>
            </div>
        );
    }

    if (!viaje) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Viaje no encontrado</p>
                    <Button onClick={() => navigate('/biografia/viajes-vacaciones')}>
                        Volver a Viajes
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header con botón de regreso */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    onClick={() => navigate('/biografia/viajes-vacaciones')}
                    variant="outline"
                    size="sm"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Volver a Viajes
                </Button>
            </div>

            <div className="space-y-6">
                {/* Card de información del viaje */}
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="p-6 flex justify-between items-start">
                        <div className="flex-1">
                            {editandoViaje ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-blue-100">
                                            Título del Viaje
                                        </label>
                                        <input
                                            type="text"
                                            value={formViaje.titulo}
                                            onChange={(e) => setFormViaje(prev => ({ 
                                                ...prev, 
                                                titulo: e.target.value 
                                            }))}
                                            className="w-full px-3 py-2 rounded-lg text-gray-900"
                                            placeholder="Nombre de tu viaje"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-blue-100">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={formViaje.descripcion}
                                            onChange={(e) => setFormViaje(prev => ({ 
                                                ...prev, 
                                                descripcion: e.target.value 
                                            }))}
                                            className="w-full px-3 py-2 rounded-lg text-gray-900"
                                            rows={3}
                                            placeholder="Describe tu viaje..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={guardarViaje}
                                            variant="outline"
                                            className="text-blue-600 border-white hover:bg-white"
                                        >
                                            <Save size={16} className="mr-2" />
                                            Guardar
                                        </Button>
                                        <Button
                                            onClick={() => setEditandoViaje(false)}
                                            variant="outline"
                                            className="text-blue-600 border-white hover:bg-white"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-3xl font-bold mb-3">{viaje.titulo}</h1>
                                    <p className="text-blue-100 text-lg">{viaje.descripcion}</p>
                                </div>
                            )}
                        </div>
                        
                        {!editandoViaje && (
                            <Button
                                onClick={() => setEditandoViaje(true)}
                                variant="outline"
                                className="text-blue-600 border-white hover:bg-white ml-4"
                            >
                                <Edit size={16} />
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Card para adicionar itinerario */}
                <Card className="p-6 border-dashed border-gray-300">
                    {!mostrarFormItinerario ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Plus size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Adicionar Itinerario
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Crea un nuevo itinerario para tu viaje. Cada itinerario tendrá sus propias fases de planeación.
                            </p>
                            <Button
                                onClick={() => setMostrarFormItinerario(true)}
                                className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-700"
                            >
                                <Plus size={16} />
                                Crear Itinerario
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Nuevo Itinerario</h3>
                                <Button
                                    onClick={() => setMostrarFormItinerario(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Cancelar
                                </Button>
                            </div>

                            {/* Título del itinerario */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Título del Itinerario *</label>
                                <input
                                    type="text"
                                    value={nuevoItinerario.titulo}
                                    onChange={(e) => setNuevoItinerario(prev => ({ 
                                        ...prev, 
                                        titulo: e.target.value 
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Madrid - París"
                                />
                            </div>

                            {/* Origen y Destino con combos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">📍 Origen</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">País *</label>
                                            <select
                                                value={nuevoItinerario.paisOrigen}
                                                onChange={(e) => handlePaisOrigenChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Seleccionar país...</option>
                                                {Object.keys(paisesYCiudades).map(pais => (
                                                    <option key={pais} value={pais}>{pais}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ciudad *</label>
                                            <select
                                                value={nuevoItinerario.ciudadOrigen}
                                                onChange={(e) => setNuevoItinerario(prev => ({ 
                                                    ...prev, 
                                                    ciudadOrigen: e.target.value 
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={!nuevoItinerario.paisOrigen}
                                            >
                                                <option value="">
                                                    {nuevoItinerario.paisOrigen ? 'Seleccionar ciudad...' : 'Primero selecciona un país'}
                                                </option>
                                                {ciudadesOrigen.map(ciudad => (
                                                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">🎯 Destino</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">País *</label>
                                            <select
                                                value={nuevoItinerario.paisDestino}
                                                onChange={(e) => handlePaisDestinoChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Seleccionar país...</option>
                                                {Object.keys(paisesYCiudades).map(pais => (
                                                    <option key={pais} value={pais}>{pais}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ciudad *</label>
                                            <select
                                                value={nuevoItinerario.ciudadDestino}
                                                onChange={(e) => setNuevoItinerario(prev => ({ 
                                                    ...prev, 
                                                    ciudadDestino: e.target.value 
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={!nuevoItinerario.paisDestino}
                                            >
                                                <option value="">
                                                    {nuevoItinerario.paisDestino ? 'Seleccionar ciudad...' : 'Primero selecciona un país'}
                                                </option>
                                                {ciudadesDestino.map(ciudad => (
                                                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                    <input
                                        type="date"
                                        value={nuevoItinerario.fechaInicio}
                                        onChange={(e) => setNuevoItinerario(prev => ({ 
                                            ...prev, 
                                            fechaInicio: e.target.value 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Fecha de Fin *</label>
                                    <input
                                        type="date"
                                        value={nuevoItinerario.fechaFin}
                                        onChange={(e) => setNuevoItinerario(prev => ({ 
                                            ...prev, 
                                            fechaFin: e.target.value 
                                        }))}
                                        min={nuevoItinerario.fechaInicio}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Transporte y Presupuesto */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Medio de Transporte</label>
                                    <select
                                        value={nuevoItinerario.medioTransporte}
                                        onChange={(e) => setNuevoItinerario(prev => ({ 
                                            ...prev, 
                                            medioTransporte: e.target.value 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="avion">✈️ Avión</option>
                                        <option value="tren">🚄 Tren</option>
                                        <option value="auto">🚗 Auto</option>
                                        <option value="bus">🚌 Bus</option>
                                        <option value="barco">🚢 Barco</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Presupuesto Estimado</label>
                                    <input
                                        type="number"
                                        value={nuevoItinerario.presupuestoEstimado}
                                        onChange={(e) => setNuevoItinerario(prev => ({ 
                                            ...prev, 
                                            presupuestoEstimado: e.target.value 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Moneda</label>
                                    <select
                                        value={nuevoItinerario.moneda}
                                        onChange={(e) => setNuevoItinerario(prev => ({ 
                                            ...prev, 
                                            moneda: e.target.value 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="COP">COP</option>
                                        <option value="MXN">MXN</option>
                                    </select>
                                </div>
                            </div>

                            {/* Alojamiento */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tipo de Alojamiento</label>
                                <select
                                    value={nuevoItinerario.tipoAlojamiento}
                                    onChange={(e) => setNuevoItinerario(prev => ({ 
                                        ...prev, 
                                        tipoAlojamiento: e.target.value 
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar alojamiento...</option>
                                    <option value="hotel">🏨 Hotel</option>
                                    <option value="hostal">🏠 Hostal</option>
                                    <option value="apartamento">🏢 Apartamento</option>
                                    <option value="casa">🏡 Casa</option>
                                    <option value="camping">⛺ Camping</option>
                                </select>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Notas Adicionales</label>
                                <textarea
                                    value={nuevoItinerario.notas}
                                    onChange={(e) => setNuevoItinerario(prev => ({ 
                                        ...prev, 
                                        notas: e.target.value 
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Añade cualquier información adicional sobre este itinerario..."
                                />
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={agregarItinerario}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Save size={16} className="mr-2" />
                                    Guardar Itinerario
                                </Button>
                                <Button
                                    onClick={() => setMostrarFormItinerario(false)}
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Lista de itinerarios existentes */}
                {itinerarios.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Itinerarios del Viaje</h3>
                        {itinerarios.map((itinerario) => (
                            <Card key={itinerario.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                                            {itinerario.titulo}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-blue-500" />
                                                <span>{itinerario.ciudadOrigen}, {itinerario.paisOrigen} → {itinerario.ciudadDestino}, {itinerario.paisDestino}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-green-500" />
                                                <span>{itinerario.fechaInicio} - {itinerario.fechaFin}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-yellow-500" />
                                                <span>
                                                    {itinerario.presupuestoEstimado 
                                                        ? `${itinerario.presupuestoEstimado} ${itinerario.moneda}` 
                                                        : 'Sin presupuesto'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                            <span>🚗 {itinerario.medioTransporte}</span>
                                            {itinerario.tipoAlojamiento && (
                                                <span>🏨 {itinerario.tipoAlojamiento}</span>
                                            )}
                                        </div>
                                        {itinerario.notas && (
                                            <p className="mt-2 text-sm text-gray-600">{itinerario.notas}</p>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => eliminarItinerario(itinerario.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViajePrincipalPage;
