import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Plus, 
    Edit3, 
    Trash2, 
    Calendar, 
    Clock, 
    MapPin, 
    Phone, 
    Mail, 
    CreditCard, 
    DollarSign,
    Plane,
    Hotel,
    Camera,
    Car,
    Utensils,
    X,
    Save,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Tipos de datos
interface Booking {
    id?: string;
    itinerarioId: string;
    tipo: 'vuelo' | 'hotel' | 'actividad' | 'transporte' | 'restaurante' | 'otro';
    titulo: string;
    descripcion?: string;
    fechaInicio: string;
    fechaFin?: string;
    horaInicio?: string;
    horaFin?: string;
    proveedor: string;
    contacto?: {
        telefono?: string;
        email?: string;
        direccion?: string;
    };
    precio?: number;
    moneda?: string;
    numeroConfirmacion?: string;
    estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
    notas?: string;
    fechaCreacion: string;
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
}

const tiposBooking = [
    { value: 'vuelo', label: 'Vuelo', icon: Plane, color: 'blue' },
    { value: 'hotel', label: 'Hotel', icon: Hotel, color: 'green' },
    { value: 'actividad', label: 'Actividad', icon: Camera, color: 'purple' },
    { value: 'transporte', label: 'Transporte', icon: Car, color: 'orange' },
    { value: 'restaurante', label: 'Restaurante', icon: Utensils, color: 'red' },
    { value: 'otro', label: 'Otro', icon: CreditCard, color: 'gray' }
];

const estadosBooking = [
    { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'confirmado', label: 'Confirmado', color: 'green' },
    { value: 'cancelado', label: 'Cancelado', color: 'red' },
    { value: 'completado', label: 'Completado', color: 'blue' }
];

const monedas = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'MXN', 'BRL', 'ARS'];

const BookingsPage: React.FC = () => {
    const { viajeId, itinerarioId } = useParams<{ viajeId: string; itinerarioId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Estados principales
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [itinerario, setItinerario] = useState<Itinerario | null>(null);
    const [cargando, setCargando] = useState(true);

    // Estados del modal
    const [mostrandoModal, setMostrandoModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [bookingSeleccionado, setBookingSeleccionado] = useState<Booking | null>(null);

    // Estados del formulario
    const [tipo, setTipo] = useState<Booking['tipo']>('vuelo');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [precio, setPrecio] = useState('');
    const [moneda, setMoneda] = useState('USD');
    const [numeroConfirmacion, setNumeroConfirmacion] = useState('');
    const [estado, setEstado] = useState<Booking['estado']>('pendiente');
    const [notas, setNotas] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Filtros
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    useEffect(() => {
        cargarDatos();
    }, [location.state]);

    // Debug: Monitorear cambios en el estado de bookings
    useEffect(() => {
        if (bookings.length > 0) {
            console.log('📊 Bookings cargados:', bookings.map(b => ({ titulo: b.titulo, estado: b.estado })));
        }
    }, [bookings]);

    const recargarDatos = async () => {
        console.log('=== RECARGANDO BOOKINGS ===');
        setCargando(true);
        await cargarDatos();
    };

    // Función de debug para inspeccionar datos
    const debugBookings = () => {
        console.log('🔍 DEBUG MANUAL DE BOOKINGS:');
        console.log('Total bookings:', bookings.length);
        
        if (bookings.length === 0) {
            alert('❌ NO HAY BOOKINGS CARGADOS! El problema está en la carga de datos.');
            return;
        }
        
        let mensaje = `BOOKINGS ENCONTRADOS (${bookings.length}):\n\n`;
        
        bookings.forEach((booking, i) => {
            console.log(`${i + 1}. "${booking.titulo}"`);
            console.log(`   - tipo: "${booking.tipo}" (${typeof booking.tipo})`);
            console.log(`   - estado: "${booking.estado}" (${typeof booking.estado})`);
            console.log(`   - Raw object:`, booking);
            
            mensaje += `${i + 1}. "${booking.titulo}"\n`;
            mensaje += `   Tipo: "${booking.tipo}"\n`;
            mensaje += `   Estado: "${booking.estado}"\n\n`;
        });
        
        // Específicamente buscar el booking de Queretaro
        const queretaro = bookings.find(b => b.titulo?.includes('Queretaro'));
        if (queretaro) {
            mensaje += `🎯 BOOKING QUERETARO ENCONTRADO:\n`;
            mensaje += `   Tipo: "${queretaro.tipo}" (longitud: ${queretaro.tipo?.length})\n`;
            mensaje += `   Estado: "${queretaro.estado}" (longitud: ${queretaro.estado?.length})\n`;
            mensaje += `   Tipo bytes: [${[...queretaro.tipo].map(c => c.charCodeAt(0)).join(', ')}]\n`;
            mensaje += `   Estado bytes: [${[...queretaro.estado].map(c => c.charCodeAt(0)).join(', ')}]\n`;
        }
        
        alert(mensaje);
    };

    const cargarDatos = async () => {
        try {
            console.log('=== CARGANDO DATOS ===');
            console.log('location.state:', location.state);
            console.log('viajeId desde URL:', viajeId);
            console.log('itinerarioId desde URL:', itinerarioId);
            
            // Cargar información del itinerario desde location state
            if (location.state && location.state.itinerario) {
                console.log('Itinerario desde location.state:', location.state.itinerario);
                setItinerario(location.state.itinerario);
            }
            
            // Cargar bookings desde el backend
            
            // Obtener twinId y viajeId del itinerario o location state
            const itinerarioData = location.state?.itinerario;
            let twinId = itinerarioData?.twinId || location.state?.twinId;
            let viajeIdFromData = itinerarioData?.viajeId || location.state?.viajeId || viajeId;

            console.log('Datos obtenidos para API:', { 
                twinId, 
                viajeId: viajeIdFromData, 
                itinerarioId,
                itinerarioData
            });

            if (twinId && viajeIdFromData && itinerarioId) {
                const url = `/api/twins/${twinId}/travels/${viajeIdFromData}/itinerarios/${itinerarioId}/bookings`;
                
                console.log('🔗 Cargando bookings desde:', url);
                
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
                        ok: response.ok,
                        headers: Object.fromEntries(response.headers.entries())
                    });

                    if (response.ok) {
                        const bookingsData = await response.json();
                        console.log('📦 Bookings cargados desde servidor:', bookingsData);
                        
                        // Manejar diferentes estructuras de respuesta del backend
                        if (Array.isArray(bookingsData)) {
                            // Respuesta directa como array
                            console.log('🔍 Debug: Estados de bookings directos:', bookingsData.map((b: any) => ({ id: b.id, titulo: b.titulo, estado: b.estado })));
                            setBookings(bookingsData);
                            console.log('✅ Bookings establecidos correctamente (array directo):', bookingsData.length, 'elementos');
                        } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
                            // Caso en que el backend devuelve { success: true, bookings: [...] }
                            console.log('✅ Bookings cargados desde bookingsData.bookings:', bookingsData.bookings.length, 'elementos');
                            setBookings(bookingsData.bookings);
                            console.log('📊 Información adicional del servidor:', {
                                success: bookingsData.success,
                                totalBookings: bookingsData.totalBookings,
                                message: bookingsData.message
                            });
                        } else if (bookingsData && Array.isArray(bookingsData.data)) {
                            // Caso en que el backend devuelve { data: [...] }
                            console.log('🔍 Debug: Estados de bookings desde data:', bookingsData.data.map((b: any) => ({ id: b.id, titulo: b.titulo, estado: b.estado })));
                            setBookings(bookingsData.data);
                            console.log('✅ Bookings establecidos desde data:', bookingsData.data.length, 'elementos');
                        } else {
                            console.warn('⚠️ Respuesta del servidor no es un array válido:', bookingsData);
                            console.log('🔍 Estructura de respuesta recibida:', Object.keys(bookingsData || {}));
                            setBookings([]);
                        }
                    } else {
                        const errorText = await response.text();
                        console.warn('❌ Error del servidor:', response.status, errorText);
                        console.log('� No se pudieron cargar bookings del backend - mostrando lista vacía');
                        cargarDatosSimulados();
                    }
                } catch (fetchError) {
                    console.error('❌ Error en la petición fetch:', fetchError);
                    console.log('� No se pudo conectar al backend - mostrando lista vacía');
                    cargarDatosSimulados();
                }
            } else {
                console.warn('⚠️ Faltan datos para cargar bookings:', { 
                    twinId, 
                    viajeId: viajeIdFromData, 
                    itinerarioId 
                });
                console.log('� Datos insuficientes - mostrando lista vacía');
                cargarDatosSimulados();
            }
            
        } catch (error) {
            console.error('❌ Error general cargando datos:', error);
            console.log('� Error general - mostrando lista vacía');
            cargarDatosSimulados();
        } finally {
            setCargando(false);
        }
    };

    const cargarDatosSimulados = () => {
        // No cargar datos simulados - usar array vacío
        console.log('🚫 No se cargarán datos simulados - mostrando lista vacía');
        setBookings([]);
    };

    const volver = () => {
        navigate(`/twin-biografia/viajes-vacaciones/viaje-activo/${viajeId}/itinerario-detalle/${itinerarioId}`, {
            state: { itinerario: itinerario }
        });
    };

    const abrirModalCrear = () => {
        limpiarFormulario();
        setModoEdicion(false);
        setMostrandoModal(true);
    };

    const abrirModalEditar = (booking: Booking) => {
        cargarDatosEnFormulario(booking);
        setBookingSeleccionado(booking);
        setModoEdicion(true);
        setMostrandoModal(true);
    };

    const limpiarFormulario = () => {
        setTipo('vuelo');
        setTitulo('');
        setDescripcion('');
        setFechaInicio('');
        setFechaFin('');
        setHoraInicio('');
        setHoraFin('');
        setProveedor('');
        setTelefono('');
        setEmail('');
        setDireccion('');
        setPrecio('');
        setMoneda('USD');
        setNumeroConfirmacion('');
        setEstado('pendiente');
        setNotas('');
    };

    const cargarDatosEnFormulario = (booking: Booking) => {
        setTipo(booking.tipo);
        setTitulo(booking.titulo);
        setDescripcion(booking.descripcion || '');
        setFechaInicio(convertirFechaParaInput(booking.fechaInicio));
        setFechaFin(booking.fechaFin ? convertirFechaParaInput(booking.fechaFin) : '');
        setHoraInicio(booking.horaInicio || '');
        setHoraFin(booking.horaFin || '');
        setProveedor(booking.proveedor);
        setTelefono(booking.contacto?.telefono || '');
        setEmail(booking.contacto?.email || '');
        setDireccion(booking.contacto?.direccion || '');
        setPrecio(booking.precio?.toString() || '0');
        setMoneda(booking.moneda || 'USD');
        setNumeroConfirmacion(booking.numeroConfirmacion || '');
        setEstado(booking.estado);
        setNotas(booking.notas || '');
    };

    const getEstadoConfig = (estado: string) => {
        // Limpiar y normalizar el estado
        const estadoNormalizado = estado?.toString().trim().toLowerCase();
        
        // Buscar configuración que coincida (case-insensitive)
        const config = estadosBooking.find(e => 
            e.value.trim().toLowerCase() === estadoNormalizado
        );
        
        console.log(`🔍 getEstadoConfig: "${estado}" -> normalizado: "${estadoNormalizado}" -> config:`, config);
        
        // Si no se encuentra, devolver configuración por defecto basada en el estado
        if (!config) {
            console.warn(`⚠️ No se encontró configuración para estado: "${estado}"`);
            // Fallback inteligente
            if (estadoNormalizado?.includes('confirm')) {
                return { value: 'confirmado', label: 'Confirmado', color: 'green' };
            } else if (estadoNormalizado?.includes('cancel')) {
                return { value: 'cancelado', label: 'Cancelado', color: 'red' };
            } else if (estadoNormalizado?.includes('complet')) {
                return { value: 'completado', label: 'Completado', color: 'blue' };
            }
        }
        
        return config || estadosBooking[0];
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

    const guardarBooking = async () => {
        if (!titulo || !proveedor || !fechaInicio) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            setGuardando(true);

            // Construir el objeto booking para enviar al backend
            const bookingData: any = {
                // No incluir el ID para nuevos bookings, el backend lo generará
                ...(modoEdicion && bookingSeleccionado?.id && { id: bookingSeleccionado.id }),
                itinerarioId: itinerarioId!,
                tipo,
                titulo,
                descripcion: descripcion || undefined,
                fechaInicio,
                fechaFin: fechaFin || undefined,
                horaInicio: horaInicio || undefined,
                horaFin: horaFin || undefined,
                proveedor,
                contacto: {
                    ...(telefono && { telefono }),
                    ...(email && { email }),
                    ...(direccion && { direccion })
                },
                precio: parseFloat(precio) || 0,
                moneda,
                numeroConfirmacion: numeroConfirmacion || undefined,
                estado,
                notas: notas || undefined
            };

            // Limpiar campos vacíos del objeto contacto
            if (Object.keys(bookingData.contacto).length === 0) {
                delete bookingData.contacto;
            }

            // Intentar obtener twinId y viajeId desde el itinerario primero
            let twinId = itinerario?.twinId;
            let viajeId = itinerario?.viajeId;
            
            // Si no están disponibles en el itinerario, usar los parámetros de URL
            if (!twinId || !viajeId) {
                // Obtener desde los parámetros de URL
                twinId = twinId || location.state?.itinerario?.twinId || new URLSearchParams(window.location.search).get('twinId') || undefined;
                viajeId = viajeId || new URLSearchParams(window.location.search).get('viajeId') || undefined;
                
                // Si aún no están disponibles, usar valores desde location state
                if (!twinId || !viajeId) {
                    const locationState = location.state;
                    twinId = twinId || locationState?.twinId;
                    viajeId = viajeId || locationState?.viajeId;
                }
                
                console.log('Datos obtenidos:', { twinId, viajeId, itinerarioId });
            }

            if (!twinId || !viajeId) {
                console.error('Datos faltantes:', { 
                    twinId, 
                    viajeId, 
                    itinerarioId, 
                    itinerario, 
                    locationState: location.state 
                });
                throw new Error(`Faltan datos necesarios: twinId=${twinId}, viajeId=${viajeId}, itinerarioId=${itinerarioId}`);
            }

            let response;
            let url;

            if (modoEdicion && bookingSeleccionado?.id) {
                // Actualizar booking existente
                url = `/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioId}/bookings/${bookingSeleccionado.id}`;
                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
            } else {
                // Crear nuevo booking
                url = `/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioId}/bookings`;
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const bookingGuardado = await response.json();
            console.log('Booking guardado exitosamente:', bookingGuardado);

            // Actualizar el estado local con la respuesta del servidor
            const bookingCompleto: Booking = {
                ...bookingGuardado,
                fechaCreacion: bookingGuardado.fechaCreacion || new Date().toISOString()
            };

            if (modoEdicion) {
                setBookings(prev => prev.map(b => b.id === bookingSeleccionado!.id ? bookingCompleto : b));
                alert('Booking actualizado correctamente');
            } else {
                setBookings(prev => [...prev, bookingCompleto]);
                alert('Booking creado correctamente');
            }

            setMostrandoModal(false);

        } catch (error) {
            console.error('Error guardando booking:', error);
            alert(`Error al guardar el booking: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setGuardando(false);
        }
    };

    const eliminarBooking = async (booking: Booking) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${booking.titulo}"?`)) {
            return;
        }

        try {
            // Intentar obtener twinId y viajeId desde el itinerario primero
            let twinId = itinerario?.twinId;
            let viajeId = itinerario?.viajeId;
            
            // Si no están disponibles en el itinerario, usar fallbacks
            if (!twinId || !viajeId) {
                twinId = twinId || location.state?.itinerario?.twinId || location.state?.twinId;
                viajeId = viajeId || location.state?.viajeId;
            }

            if (!twinId || !viajeId || !booking.id) {
                console.error('Datos faltantes para eliminar:', { twinId, viajeId, bookingId: booking.id });
                throw new Error(`Faltan datos necesarios: twinId=${twinId}, viajeId=${viajeId}, bookingId=${booking.id}`);
            }

            const url = `/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioId}/bookings/${booking.id}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Actualizar el estado local solo si la eliminación fue exitosa
            setBookings(prev => prev.filter(b => b.id !== booking.id));
            alert('Booking eliminado correctamente');

        } catch (error) {
            console.error('Error eliminando booking:', error);
            alert(`Error al eliminar el booking: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    // Asegurar que bookings siempre sea un array válido
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    
    // Debug logging
    if (!Array.isArray(bookings)) {
        console.error('ERROR: bookings no es un array:', typeof bookings, bookings);
    }
    
    const bookingsFiltrados = bookingsArray.filter(booking => {
        // Filtro de tipo (case-insensitive)
        const cumpleTipo = filtroTipo === 'todos' || 
            booking.tipo?.toString().trim().toLowerCase() === filtroTipo?.toString().trim().toLowerCase();
        
        // Filtro de estado (case-insensitive)
        let cumpleEstado = filtroEstado === 'todos';
        if (!cumpleEstado) {
            const estadoNormalizado = booking.estado?.toString().trim().toLowerCase();
            const filtroNormalizado = filtroEstado?.toString().trim().toLowerCase();
            
            // Comparación principal
            cumpleEstado = estadoNormalizado === filtroNormalizado;
            
            // DEBUGGING: Comparación alternativa si falla la principal
            if (!cumpleEstado) {
                // Probar sin normalización
                const cumpleEstadoDirecto = booking.estado === filtroEstado;
                // Probar solo lowercase
                const cumpleEstadoLower = booking.estado?.toLowerCase() === filtroEstado?.toLowerCase();
                
                console.log(`🔧 DEBUG ESTADO FALLIDO para "${booking.titulo}":`);
                console.log(`   booking.estado: "${booking.estado}" (${typeof booking.estado})`);
                console.log(`   filtroEstado: "${filtroEstado}" (${typeof filtroEstado})`);
                console.log(`   estadoNormalizado: "${estadoNormalizado}"`);
                console.log(`   filtroNormalizado: "${filtroNormalizado}"`);
                console.log(`   cumpleEstadoDirecto: ${cumpleEstadoDirecto}`);
                console.log(`   cumpleEstadoLower: ${cumpleEstadoLower}`);
                console.log(`   cumpleEstadoNormalizado: ${cumpleEstado}`);
                
                // Para prueba temporal, usar la comparación más permisiva
                cumpleEstado = cumpleEstadoDirecto || cumpleEstadoLower;
            }
        }
        
        // Debug para filtros activos
        if (filtroTipo !== 'todos' || filtroEstado !== 'todos') {
            console.log(`🔍 Evaluando "${booking.titulo}": tipo=${cumpleTipo}, estado=${cumpleEstado}, pasa=${cumpleTipo && cumpleEstado}`);
        }
        
        return cumpleTipo && cumpleEstado;
    });

    // ALERT DE DEBUG PARA CASO ESPECÍFICO - TEMPORAL
    if (filtroTipo === 'vuelo' && filtroEstado === 'confirmado') {
        const vuelosConfirmados = bookingsArray.filter(b => b.tipo === 'vuelo' && b.estado === 'confirmado');
        const mensaje = `DEBUGGING:
Filtros: Tipo="${filtroTipo}", Estado="${filtroEstado}"
Bookings totales: ${bookingsArray.length}
Bookings filtrados: ${bookingsFiltrados.length}
Vuelos con estado "confirmado": ${vuelosConfirmados.length}
${bookingsArray[0] ? `Primer booking: tipo="${bookingsArray[0].tipo}", estado="${bookingsArray[0].estado}"` : 'No hay bookings'}`;
        
        console.log(mensaje);
        // alert(mensaje); // REMOVIDO
    }

    // Debug general de filtros
    console.log(`� FILTROS APLICADOS: Tipo="${filtroTipo}", Estado="${filtroEstado}"`);
    console.log(`📊 Bookings totales: ${bookingsArray.length}, Filtrados: ${bookingsFiltrados.length}`);
    
    // Debug detallado de cada booking
    bookingsArray.forEach((booking, index) => {
        console.log(`📋 Booking ${index + 1}: "${booking.titulo}"`);
        console.log(`   tipo: "${booking.tipo}" | estado: "${booking.estado}"`);
        
        const cumpleTipo = filtroTipo === 'todos' || booking.tipo === filtroTipo;
        let cumpleEstado = filtroEstado === 'todos';
        if (!cumpleEstado) {
            const estadoNormalizado = booking.estado?.toString().trim().toLowerCase();
            const filtroNormalizado = filtroEstado?.toString().trim().toLowerCase();
            cumpleEstado = estadoNormalizado === filtroNormalizado;
        }
        
        console.log(`   cumpleTipo: ${cumpleTipo} | cumpleEstado: ${cumpleEstado} | pasa: ${cumpleTipo && cumpleEstado}`);
    });
    
    if (bookingsFiltrados.length === 0 && bookingsArray.length > 0) {
        console.log('❌ No hay bookings que pasen el filtro!');
        if (filtroTipo === 'vuelo' && filtroEstado === 'confirmado') {
            console.log('💡 Específicamente: No se encontraron vuelos confirmados');
            console.log('🔍 Verificando datos del booking:');
            bookingsArray.forEach(b => {
                if (b.tipo === 'vuelo') {
                    console.log(`   Vuelo encontrado: "${b.titulo}" - estado: "${b.estado}"`);
                }
            });
        }
    }

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            green: 'bg-green-100 text-green-800 border-green-200',
            purple: 'bg-purple-100 text-purple-800 border-purple-200',
            orange: 'bg-orange-100 text-orange-800 border-orange-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[color as keyof typeof colors] || colors.gray;
    };

    const getIconoEstado = (estado: string) => {
        switch (estado) {
            case 'confirmado': return <CheckCircle className="h-4 w-4" />;
            case 'cancelado': return <XCircle className="h-4 w-4" />;
            case 'completado': return <CheckCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Button
                            onClick={volver}
                            variant="outline"
                            className="flex items-center mr-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Itinerario
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reservas y Bookings</h1>
                            <p className="text-gray-600">{itinerario?.titulo}</p>
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mt-1">
                                TwinID: {itinerario?.twinId || 'No disponible'} | 
                                ViajeID: {itinerario?.viajeId || viajeId || 'No disponible'} | 
                                ItinerarioID: {itinerario?.id || itinerarioId || 'No disponible'}
                            </div>
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
                            onClick={debugBookings}
                            variant="outline"
                            className="flex items-center bg-yellow-50 border-yellow-300 text-yellow-700"
                        >
                            🔍 Debug
                        </Button>
                        <Button
                            onClick={abrirModalCrear}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Reserva
                        </Button>
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
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="todos">Todos los tipos</option>
                                {tiposBooking.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="todos">Todos los estados</option>
                                {estadosBooking.map(estado => (
                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de Bookings */}
                <div className="grid grid-cols-1 gap-4">
                    {bookingsFiltrados.length === 0 ? (
                        <Card className="p-8 text-center">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
                            <p className="text-gray-600 mb-4">Comienza agregando tu primera reserva para este itinerario</p>
                            <Button onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Primera Reserva
                            </Button>
                        </Card>
                    ) : (
                        bookingsFiltrados.map((booking) => {
                            const tipoConfig = tiposBooking.find(t => t.value === booking.tipo) || tiposBooking[0];
                            const estadoConfig = getEstadoConfig(booking.estado);
                            const IconoTipo = tipoConfig.icon;

                            return (
                                <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-lg mr-4 ${getColorClasses(tipoConfig.color)}`}>
                                                <IconoTipo className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{booking.titulo}</h3>
                                                <p className="text-gray-600">{booking.proveedor}</p>
                                                {booking.descripcion && (
                                                    <p className="text-sm text-gray-500 mt-1">{booking.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses(estadoConfig.color)}`}>
                                                {getIconoEstado(booking.estado)}
                                                <span className="ml-1">{estadoConfig.label}</span>
                                            </span>
                                            <Button
                                                onClick={() => abrirModalEditar(booking)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => eliminarBooking(booking)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{formatearFechaSafe(booking.fechaInicio)}</span>
                                            {booking.fechaFin && (
                                                <span className="mx-1 text-gray-400">
                                                    → {formatearFechaSafe(booking.fechaFin)}
                                                </span>
                                            )}
                                        </div>
                                        {(booking.horaInicio || booking.horaFin) && (
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>
                                                    {booking.horaInicio}
                                                    {booking.horaFin && ` - ${booking.horaFin}`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>${booking.precio?.toLocaleString() || '0'} {booking.moneda || 'USD'}</span>
                                        </div>
                                        {booking.numeroConfirmacion && (
                                            <div className="flex items-center">
                                                <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-mono text-xs">{booking.numeroConfirmacion}</span>
                                            </div>
                                        )}
                                    </div>

                                    {booking.contacto && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                                {booking.contacto.telefono && (
                                                    <div className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {booking.contacto.telefono}
                                                    </div>
                                                )}
                                                {booking.contacto.email && (
                                                    <div className="flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {booking.contacto.email}
                                                    </div>
                                                )}
                                                {booking.contacto.direccion && (
                                                    <div className="flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {booking.contacto.direccion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal de Crear/Editar Booking */}
            {mostrandoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {modoEdicion ? 'Editar Reserva' : 'Nueva Reserva'}
                                </h2>
                                <Button
                                    onClick={() => setMostrandoModal(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Información del Itinerario (solo lectura) */}
                            {itinerario && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Itinerario</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {itinerario.ciudadOrigen && itinerario.paisOrigen && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Origen
                                                </label>
                                                <div className="flex items-center p-2 bg-white rounded border">
                                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {itinerario.ciudadOrigen}, {itinerario.paisOrigen}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {itinerario.ciudadDestino && itinerario.paisDestino && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Destino
                                                </label>
                                                <div className="flex items-center p-2 bg-white rounded border">
                                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {itinerario.ciudadDestino}, {itinerario.paisDestino}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {/* Información básica */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Reserva *
                                        </label>
                                        <select
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value as Booking['tipo'])}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            {tiposBooking.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estado
                                        </label>
                                        <select
                                            value={estado}
                                            onChange={(e) => setEstado(e.target.value as Booking['estado'])}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {estadosBooking.map(estado => (
                                                <option key={estado.value} value={estado.value}>{estado.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ej: Vuelo Madrid - Barcelona"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={2}
                                        placeholder="Detalles adicionales..."
                                    />
                                </div>

                                {/* Fechas y horarios */}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hora de Inicio
                                        </label>
                                        <input
                                            type="time"
                                            value={horaInicio}
                                            onChange={(e) => setHoraInicio(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Proveedor y contacto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proveedor *
                                    </label>
                                    <input
                                        type="text"
                                        value={proveedor}
                                        onChange={(e) => setProveedor(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ej: Iberia, Hotel Marriott, Tours ABC"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="+1-800-123-4567"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="reservas@ejemplo.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número de Confirmación
                                        </label>
                                        <input
                                            type="text"
                                            value={numeroConfirmacion}
                                            onChange={(e) => setNumeroConfirmacion(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="AA123456"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Dirección completa del lugar"
                                    />
                                </div>

                                {/* Precio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Precio
                                        </label>
                                        <input
                                            type="number"
                                            value={precio}
                                            onChange={(e) => setPrecio(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Moneda
                                        </label>
                                        <select
                                            value={moneda}
                                            onChange={(e) => setMoneda(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {monedas.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
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
                                        rows={3}
                                        placeholder="Cualquier información adicional..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-4 pt-6">
                                    <Button
                                        onClick={() => setMostrandoModal(false)}
                                        variant="outline"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={guardarBooking}
                                        disabled={guardando}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear Reserva')}
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

export default BookingsPage;
