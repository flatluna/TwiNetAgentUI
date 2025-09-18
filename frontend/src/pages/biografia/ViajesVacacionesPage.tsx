import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    Plus, 
    BookOpen,
    ArrowLeft,
    Plane,
    Save,
    RefreshCw,
    Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Interfaz simple para el viaje
interface Viaje {
    id: string;
    titulo: string;
    descripcion: string;
    fechaInicio?: string;
    fechaFin?: string;
    presupuesto?: number;
    moneda?: string;
    status: string; // Puede ser "activo" o "cerrado" (minúsculas del backend)
    estado?: string;
    duracionDias?: number;
    TwinID?: string;
}

export const ViajesVacacionesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    const [viajeActivo, setViajeActivo] = useState<Viaje | null>(null);
    const [totalViajesPasados, setTotalViajesPasados] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [recargando, setRecargando] = useState(false);
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [guardandoViaje, setGuardandoViaje] = useState(false);
    
    // Estados del formulario
    const [tituloViaje, setTituloViaje] = useState('');
    const [descripcionViaje, setDescripcionViaje] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [presupuesto, setPresupuesto] = useState('');
    const [moneda, setMoneda] = useState('USD');
    
    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (twinId) {
            cargarDatos();
        }
    }, [twinId]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            
            // Llamar al endpoint GET /api/twins/{twinId}/travels
            const baseUrl = import.meta.env.DEV 
                ? '' // Usar rutas relativas para que Vite proxy las redirija
                : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

            console.log('Cargando viajes para twinId:', twinId);
            
            const response = await fetch(`${baseUrl}/api/twins/${twinId}/travels`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Si es 404 o error, significa que no hay viajes (primera vez)
                console.log('No hay viajes existentes (primera vez)');
                setViajeActivo(null);
                setTotalViajesPasados(0);
                return;
            }
            
            const viajes = await response.json();
            
            console.log('Viajes cargados:', viajes);
            
            // Verificar si viajes es un array o necesita ser convertido
            let viajesArray;
            if (Array.isArray(viajes)) {
                viajesArray = viajes;
            } else if (viajes && typeof viajes === 'object') {
                // Si es un objeto, podría ser que venga envuelto en alguna propiedad
                viajesArray = viajes.travels || viajes.data || viajes.items || [viajes];
                console.log('Convertido de objeto a array:', viajesArray);
            } else {
                console.log('Formato de respuesta no esperado:', viajes);
                setViajeActivo(null);
                setTotalViajesPasados(0);
                return;
            }
            
            // Si no hay viajes o la respuesta está vacía, es primera vez
            if (!viajesArray || viajesArray.length === 0) {
                console.log('Primera vez - no hay viajes creados');
                setViajeActivo(null);
                setTotalViajesPasados(0);
                return;
            }
            
            console.log('Array de viajes procesado:', viajesArray);
            
            // Buscar el viaje activo (status = "Activo" o "activo")
            const viajeActivo = viajesArray.find((viaje: any) => 
                viaje.status === 'Activo' || viaje.status === 'activo'
            );
            setViajeActivo(viajeActivo || null);
            
            // Contar viajes cerrados (status = "Cerrado" o "cerrado") - pero no los mostramos
            const viajesCerrados = viajesArray.filter((viaje: any) => 
                viaje.status === 'Cerrado' || viaje.status === 'cerrado'
            );
            setTotalViajesPasados(viajesCerrados.length);
            
            console.log('Viaje activo encontrado:', viajeActivo);
            console.log('Total viajes cerrados:', viajesCerrados.length);
            
        } catch (error) {
            console.error('Error cargando datos (probablemente primera vez):', error);
            // Si hay error (probablemente porque no existen viajes), tratar como primera vez
            setViajeActivo(null);
            setTotalViajesPasados(0);
        } finally {
            setCargando(false);
        }
    };

    const recargarViajes = async () => {
        setRecargando(true);
        await cargarDatos();
        setRecargando(false);
    };

    const crearNuevoViaje = () => {
        setMostrandoFormulario(true);
        setTituloViaje('');
        setDescripcionViaje('');
        setFechaInicio('');
        setFechaFin('');
        setPresupuesto('');
        setMoneda('USD');
    };

    const guardarViaje = async () => {
        if (!tituloViaje.trim()) {
            alert('Por favor ingresa un título para el viaje');
            return;
        }

        if (!descripcionViaje.trim()) {
            alert('Por favor ingresa una descripción para el viaje');
            return;
        }

        if (!fechaInicio) {
            alert('Por favor selecciona la fecha de inicio');
            return;
        }

        try {
            setGuardandoViaje(true);
            
            // Llamar directamente al endpoint como especificaste
            const baseUrl = import.meta.env.DEV 
                ? '' // Usar rutas relativas para que Vite proxy las redirija
                : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

            const viajeData = {
                titulo: tituloViaje.trim(),
                descripcion: descripcionViaje.trim(),
                fechaInicio: new Date(fechaInicio).toISOString(),
                fechaFin: fechaFin ? new Date(fechaFin).toISOString() : null,
                presupuesto: presupuesto ? parseFloat(presupuesto) : 0.00,
                moneda: moneda
            };

            console.log('Enviando viaje al backend:', viajeData);
            
            // POST /api/twins/{twinId}/travels
            const response = await fetch(`${baseUrl}/api/twins/${twinId}/travels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(viajeData)
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('Viaje creado exitosamente:', result);
                
                // Recargar datos para obtener la lista actualizada
                await cargarDatos();
                setMostrandoFormulario(false);
                
                // Mostrar mensaje de éxito
                alert('¡Viaje creado exitosamente! Ahora puedes adicionar itinerarios.');
                
            } else {
                throw new Error(result.message || 'Error al crear el viaje');
            }
            
        } catch (error) {
            console.error('Error guardando viaje:', error);
            alert('Error al guardar el viaje. Por favor intenta de nuevo.');
        } finally {
            setGuardandoViaje(false);
        }
    };

    const cancelarCreacion = () => {
        setMostrandoFormulario(false);
        setTituloViaje('');
        setDescripcionViaje('');
        setFechaInicio('');
        setFechaFin('');
        setPresupuesto('');
        setMoneda('USD');
    };

    const irAAdicionarItinerarios = () => {
        if (viajeActivo) {
            console.log('🚀 Navegando a crear itinerarios con viaje:', viajeActivo);
            navigate(`/twin-biografia/viajes-vacaciones/viaje-activo/${viajeActivo.id}`, {
                state: { viajeData: viajeActivo } // Pasar el objeto completo del viaje
            });
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Plane className="text-blue-600" size={28} />
                                    Mis Viajes y Vacaciones
                                </h1>
                                <p className="text-gray-600">Gestiona tus aventuras y experiencias de viaje</p>
                            </div>
                        </div>
                        
                        {/* Botón de reload */}
                        <Button
                            variant="outline"
                            onClick={recargarViajes}
                            disabled={recargando}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={recargando ? 'animate-spin' : ''} />
                            {recargando ? 'Cargando...' : 'Recargar'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card: Viaje Activo, Formulario de Creación o Crear Nuevo */}
                    {viajeActivo ? (
                        // Viaje guardado exitosamente - Mostrar opción de adicionar itinerarios
                        <Card className="p-6 border-2 border-green-200 bg-green-50">
                            <div className="text-center mb-6">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plane size={32} className="text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-green-900 mb-2">Tu Viaje está Activo</h2>
                                <p className="text-green-700 mb-4">Puedes continuar gestionando tu viaje</p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-gray-900 mb-2">{viajeActivo.titulo}</h3>
                                <p className="text-gray-600 text-sm mb-3">{viajeActivo.descripcion}</p>
                                
                                {/* Mostrar duración si está disponible */}
                                {viajeActivo.duracionDias && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={14} />
                                        <span className="font-medium">Duración: {viajeActivo.duracionDias} días</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Información de itinerarios existentes */}
                            {viajeActivo.itinerarios && viajeActivo.itinerarios.length > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <span className="text-sm font-medium">
                                            📋 {viajeActivo.itinerarios.length} itinerario{viajeActivo.itinerarios.length !== 1 ? 's' : ''} creado{viajeActivo.itinerarios.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {viajeActivo.itinerarios.map((it: any, idx: number) => (
                                            <span key={it.id || idx}>
                                                {it.titulo || `Itinerario ${idx + 1}`}
                                                {idx < viajeActivo.itinerarios.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <Button 
                                onClick={irAAdicionarItinerarios}
                                className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                            >
                                <Plus size={20} className="mr-2" />
                                {viajeActivo.itinerarios && viajeActivo.itinerarios.length > 0 
                                    ? `Manejar tus Itinerarios (${viajeActivo.itinerarios.length})`
                                    : 'Adicionar Itinerarios'
                                }
                            </Button>
                        </Card>
                    ) : mostrandoFormulario ? (
                        // Formulario de creación de viaje
                        <Card className="p-6 border-2 border-blue-300">
                            <div className="text-center mb-6">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={32} className="text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Viaje</h2>
                                <p className="text-gray-600">Paso 1: Información básica del viaje</p>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                {/* Título del viaje */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título del Viaje *
                                    </label>
                                    <input
                                        type="text"
                                        value={tituloViaje}
                                        onChange={(e) => setTituloViaje(e.target.value)}
                                        placeholder="Ej: Viaje a París"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Descripción del viaje */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción *
                                    </label>
                                    <textarea
                                        value={descripcionViaje}
                                        onChange={(e) => setDescripcionViaje(e.target.value)}
                                        placeholder="Viaje romántico a la ciudad de la luz..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha Final
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            min={fechaInicio}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Presupuesto y Moneda */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Presupuesto
                                        </label>
                                        <input
                                            type="number"
                                            value={presupuesto}
                                            onChange={(e) => setPresupuesto(e.target.value)}
                                            placeholder="2500.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Moneda
                                        </label>
                                        <select
                                            value={moneda}
                                            onChange={(e) => setMoneda(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="USD">USD - Dólar Estadounidense</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - Libra Esterlina</option>
                                            <option value="JPY">JPY - Yen Japonés</option>
                                            <option value="CAD">CAD - Dólar Canadiense</option>
                                            <option value="AUD">AUD - Dólar Australiano</option>
                                            <option value="CHF">CHF - Franco Suizo</option>
                                            <option value="MXN">MXN - Peso Mexicano</option>
                                            <option value="BRL">BRL - Real Brasileño</option>
                                            <option value="ARS">ARS - Peso Argentino</option>
                                            <option value="COP">COP - Peso Colombiano</option>
                                            <option value="PEN">PEN - Sol Peruano</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    onClick={cancelarCreacion}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={guardarViaje}
                                    disabled={guardandoViaje || !tituloViaje.trim() || !descripcionViaje.trim() || !fechaInicio}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {guardandoViaje ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Guardando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save size={16} />
                                            Guardar Viaje
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        // Botón inicial para crear nuevo viaje
                        <Card className="p-6 border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                            <div className="text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={32} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Nuevo Viaje</h2>
                                <p className="text-gray-600 mb-6">
                                    Comienza a planificar tu próxima aventura
                                </p>
                                <Button 
                                    onClick={crearNuevoViaje}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <Plus size={16} />
                                        Crear Nuevo Viaje
                                    </div>
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Card: Historial de Viajes */}
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => navigate('/twin-biografia/historial-viajes')}>
                        <div className="text-center">
                            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={32} className="text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Historial de Viajes</h2>
                            <p className="text-gray-600 mb-4">
                                Revisa tus aventuras pasadas
                            </p>
                            
                            <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                <div className="text-3xl font-bold text-purple-900">
                                    {totalViajesPasados}
                                </div>
                                <div className="text-sm text-purple-600">
                                    {totalViajesPasados === 1 ? 'Viaje Completado' : 'Viajes Completados'}
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                                {totalViajesPasados > 0 ? 'Haz clic para explorar' : 'Aún no tienes viajes completados'}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Mensaje informativo */}
                {!viajeActivo && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2 mt-1">
                                <Plane size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">¿Cómo funciona?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Solo puedes tener un viaje activo a la vez</li>
                                    <li>• El viaje pasa por 4 fases: Planeación → Bookings → En Curso → Finalizado</li>
                                    <li>• Una vez finalizado, se guarda en tu historial</li>
                                    <li>• Podrás crear un nuevo viaje cuando termines el actual</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViajesVacacionesPage;
