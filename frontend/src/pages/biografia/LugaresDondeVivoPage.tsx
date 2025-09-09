import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Plus, 
    Home, 
    MapPin, 
    Calendar, 
    Eye, 
    Trash2, 
    Save,
    X,
    Bed,
    Bath,
    Ruler,
    Building,
    Star,
    Clock,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import lugaresApiService, { LugarVivienda, LugarViviendaFormData } from '@/services/lugaresApiService';

// Declarar tipos globales para Google Maps
declare global {
    interface Window {
        google: any;
    }
}

// Opciones para los combo boxes
const OPCIONES_CALEFACCION = [
    { value: '', label: 'Seleccionar...' },
    { value: 'Gas Natural', label: 'Gas Natural' },
    { value: 'Eléctrica', label: 'Eléctrica' },
    { value: 'Propano', label: 'Propano' },
    { value: 'Radiadores', label: 'Radiadores' },
    { value: 'Bomba de Calor', label: 'Bomba de Calor' },
    { value: 'Calefacción Central', label: 'Calefacción Central' },
    { value: 'Calentadores de Ambiente', label: 'Calentadores de Ambiente' },
    { value: 'Suelo Radiante', label: 'Suelo Radiante' },
    { value: 'Leña/Biomasa', label: 'Leña/Biomasa' },
    { value: 'Sin Calefacción', label: 'Sin Calefacción' },
    { value: 'Otro', label: 'Otro' }
];

const OPCIONES_AIRE_ACONDICIONADO = [
    { value: '', label: 'Seleccionar...' },
    { value: 'Central', label: 'Central' },
    { value: 'Ventana', label: 'Ventana' },
    { value: 'Split/Mini-Split', label: 'Split/Mini-Split' },
    { value: 'Portátil', label: 'Portátil' },
    { value: 'Evaporativo', label: 'Evaporativo' },
    { value: 'Geotérmico', label: 'Geotérmico' },
    { value: 'Ducto/Conductos', label: 'Ducto/Conductos' },
    { value: 'Sin Aire Acondicionado', label: 'Sin Aire Acondicionado' },
    { value: 'Otro', label: 'Otro' }
];

const OPCIONES_ESTACIONAMIENTO = [
    { value: '', label: 'Seleccionar...' },
    { value: 'Garaje Adjunto', label: 'Garaje Adjunto' },
    { value: 'Garaje Separado', label: 'Garaje Separado' },
    { value: 'Cochera Cubierta', label: 'Cochera Cubierta' },
    { value: 'Cochera Descubierta', label: 'Cochera Descubierta' },
    { value: 'Entrada de Auto', label: 'Entrada de Auto (Driveway)' },
    { value: 'Estacionamiento en Calle', label: 'Estacionamiento en Calle' },
    { value: 'Estacionamiento Subterráneo', label: 'Estacionamiento Subterráneo' },
    { value: 'Estacionamiento Asignado', label: 'Estacionamiento Asignado' },
    { value: 'Sin Estacionamiento', label: 'Sin Estacionamiento' },
    { value: 'Otro', label: 'Otro' }
];

const LugaresDondeVivoPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const [lugares, setLugares] = useState<LugarVivienda[]>([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [lugarEditando, setLugarEditando] = useState<LugarVivienda | null>(null);
    const [tipoActivo, setTipoActivo] = useState<'actual' | 'pasado' | 'mudanza' | 'todos'>('todos');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener twinId del usuario autenticado
    const twinId = accounts[0]?.localAccountId;

    // Referencias para Google Autocomplete
    const addressInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);

    // API Key de Google Maps
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    // Formulario para nuevo lugar/edición
    const [formulario, setFormulario] = useState<Partial<LugarVivienda>>({
        tipo: 'actual',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        fechaInicio: '',
        esPrincipal: false,
        tipoPropiedad: 'casa',
        areaTotal: 0,
        habitaciones: 0,
        banos: 0,
        medioBanos: 0,
        anoConstruction: new Date().getFullYear(),
        tipoFundacion: '',
        materialConstruction: '',
        calefaccion: '',
        aireAcondicionado: '',
        tipoEstacionamiento: '',
        espaciosEstacionamiento: 0,
        caracteristicasTerreno: [],
        tieneHOA: false,
        vecindario: '',
        descripcion: '',
        aspectosPositivos: [],
        aspectosNegativos: [],
        fotos: []
    });

    const resetFormulario = () => {
        setFormulario({
            tipo: tipoActivo === 'todos' ? 'actual' : tipoActivo,
            direccion: '',
            ciudad: '',
            estado: '',
            codigoPostal: '',
            fechaInicio: '',
            esPrincipal: false,
            tipoPropiedad: 'casa',
            areaTotal: 0,
            habitaciones: 0,
            banos: 0,
            medioBanos: 0,
            anoConstruction: new Date().getFullYear(),
            tipoFundacion: '',
            materialConstruction: '',
            calefaccion: '',
            aireAcondicionado: '',
            tipoEstacionamiento: '',
            espaciosEstacionamiento: 0,
            caracteristicasTerreno: [],
            tieneHOA: false,
            vecindario: '',
            descripcion: '',
            aspectosPositivos: [],
            aspectosNegativos: [],
            fotos: []
        });
    };

    const abrirModalNuevo = (tipo: 'actual' | 'pasado' | 'mudanza') => {
        console.log('🏠 Abriendo modal para tipo:', tipo);
        setTipoActivo(tipo);
        setModoEdicion(false);
        setLugarEditando(null);
        resetFormulario();
        setFormulario(prev => ({ ...prev, tipo }));
        setMostrarModal(true);
        console.log('✅ Modal abierto, mostrarModal:', true);
    };

    // Función para inicializar Google Autocomplete
    const initializeAddressAutocomplete = () => {
        if (!addressInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
            console.error('❌ Prerequisites not met for autocomplete initialization');
            return;
        }
        
        try {
            console.log('🔄 Initializing Google Places Autocomplete...');
            
            // Crear autocomplete
            autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address']
                // Omitimos componentRestrictions para permitir direcciones internacionales
            });
            
            console.log('✅ Google Places Autocomplete created');
            
            // Listener para cuando el usuario selecciona una dirección
            autocompleteRef.current.addListener('place_changed', () => {
                console.log('📍 Place changed event triggered');
                const place = autocompleteRef.current.getPlace();
                
                if (place && place.address_components) {
                    console.log('📍 Place details:', place);
                    
                    let city = '';
                    let state = '';
                    let zipCode = '';
                    
                    place.address_components.forEach((component: any) => {
                        const types = component.types;
                        
                        if (types.includes('locality')) {
                            city = component.long_name;
                        } else if (types.includes('administrative_area_level_1')) {
                            state = component.long_name;
                        } else if (types.includes('postal_code')) {
                            zipCode = component.long_name;
                        }
                    });
                    
                    // Actualizar todos los campos automáticamente
                    const newData = {
                        direccion: place.formatted_address || place.name || addressInputRef.current?.value || '',
                        ciudad: city,
                        estado: state,
                        codigoPostal: zipCode
                    };
                    
                    console.log('📍 Updating address data:', newData);
                    
                    setFormulario(prev => ({
                        ...prev,
                        ...newData
                    }));
                } else {
                    console.log('❌ No address components found in place');
                }
            });
            
            console.log('✅ Google Places Autocomplete fully initialized');
            
        } catch (error) {
            console.error('❌ Error initializing autocomplete:', error);
        }
    };

    // useEffect para cargar Google Maps cuando se abre el modal
    useEffect(() => {
        if (mostrarModal) {
            const loadGoogleMaps = async () => {
                try {
                    console.log('🔄 Loading Google Maps API...');
                    await GoogleMapsLoader.getInstance({ apiKey, libraries: ["places"] }).load();
                    console.log('✅ Google Maps loaded successfully');
                    
                    // Esperar un momento para que el input se renderice
                    setTimeout(() => {
                        initializeAddressAutocomplete();
                    }, 100);
                } catch (error) {
                    console.error('❌ Error loading Google Maps:', error);
                }
            };

            loadGoogleMaps();
        }

        // Cleanup autocomplete cuando se cierra el modal
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [mostrarModal, apiKey]);

    const cerrarModal = () => {
        console.log('❌ Cerrando modal');
        setMostrarModal(false);
        setModoEdicion(false);
        setLugarEditando(null);
        resetFormulario();
        console.log('✅ Modal cerrado, mostrarModal:', false);
    };

    const guardarLugar = async () => {
        if (!formulario.direccion || !formulario.ciudad || !twinId) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const lugarData: LugarViviendaFormData = {
                ...formulario,
                tipo: tipoActivo === 'todos' ? 'actual' : tipoActivo,
                caracteristicasTerreno: formulario.caracteristicasTerreno || [],
                aspectosPositivos: formulario.aspectosPositivos || [],
                aspectosNegativos: formulario.aspectosNegativos || [],
                fotos: formulario.fotos || [],
                twinId
            } as LugarViviendaFormData;

            let response;
            
            if (modoEdicion && lugarEditando?.id) {
                console.log('🔄 Actualizando lugar existente:', lugarEditando.id);
                response = await lugaresApiService.updateLugar(twinId, lugarEditando.id, lugarData);
            } else {
                console.log('➕ Creando nuevo lugar');
                response = await lugaresApiService.createLugar(twinId, lugarData);
            }

            if (response.success && response.data) {
                console.log('✅ Lugar guardado exitosamente:', response.data);
                
                // Recargar todos los datos desde el backend
                await cargarLugares();

                cerrarModal();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error guardando lugar:', error);
            setError('Error al guardar el lugar de vivienda');
            alert('Error al guardar el lugar. Por favor intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // const handleGooglePlaceSelected = (placeData: {
    //     direccion: string;
    //     ciudad: string;
    //     estado: string;
    //     codigoPostal: string;
    //     pais: string;
    //     latitud?: number;
    //     longitud?: number;
    // }) => {
    //     console.log('🏠 Google place selected in form:', placeData);
        
    //     setFormulario(prev => ({
    //         ...prev,
    //         direccion: placeData.direccion,
    //         ciudad: placeData.ciudad,
    //         estado: placeData.estado,
    //         codigoPostal: placeData.codigoPostal
    //     }));
    // };

    const eliminarLugar = async (lugar: LugarVivienda) => {
        if (!twinId || !lugar.id) {
            alert('Error: No se puede eliminar el lugar');
            return;
        }

        if (!confirm(`¿Está seguro de que desea eliminar "${lugar.direccion}"?`)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🗑️ Eliminando lugar:', lugar.id);
            const response = await lugaresApiService.deleteLugar(twinId, lugar.id);
            
            if (response.success) {
                console.log('✅ Lugar eliminado exitosamente');
                
                // Recargar todos los datos desde el backend
                await cargarLugares();
            } else {
                throw new Error('Error al eliminar el lugar');
            }
        } catch (error) {
            console.error('❌ Error eliminando lugar:', error);
            setError('Error al eliminar el lugar de vivienda');
            alert('Error al eliminar el lugar. Por favor intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const obtenerLugaresPorTipo = (tipo: 'actual' | 'pasado' | 'mudanza' | 'todos') => {
        if (tipo === 'todos') {
            return lugares;
        }
        return lugares.filter(l => l.tipo === tipo);
    };

    // ============= FUNCIONES CRUD API =============
    
    // Función para cargar lugares del backend
    const cargarLugares = async () => {
        if (!twinId) {
            setError('No se pudo identificar el usuario');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🏠 Cargando lugares para twin:', twinId);
            const response = await lugaresApiService.getLugaresByTwinId(twinId);
            
            if (response.success && response.data) {
                setLugares(response.data);
                console.log('✅ Lugares cargados exitosamente:', response.data);
            } else {
                console.log('ℹ️ No se encontraron lugares o respuesta vacía');
                setLugares([]);
            }
        } catch (error) {
            console.error('❌ Error cargando lugares:', error);
            setError('Error al cargar los lugares de vivienda');
            setLugares([]);
        } finally {
            setIsLoading(false);
        }
    };

    const marcarComoPrincipal = async (lugar: LugarVivienda) => {
        if (!twinId || !lugar.id || lugar.tipo !== 'actual') {
            return;
        }

        setIsLoading(true);

        try {
            console.log('⭐ Marcando como principal:', lugar.id);
            const response = await lugaresApiService.marcarComoPrincipal(twinId, lugar.id);
            
            if (response.success && response.data) {
                console.log('✅ Lugar marcado como principal');
                
                // Actualizar la lista local
                setLugares(prev => prev.map(l => ({
                    ...l,
                    esPrincipal: l.id === lugar.id
                })));
            }
        } catch (error) {
            console.error('❌ Error marcando como principal:', error);
            alert('Error al marcar como vivienda principal.');
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect para cargar lugares al montar el componente
    useEffect(() => {
        if (twinId) {
            cargarLugares();
        }
    }, [twinId]);

    // Manejar tecla ESC para cerrar modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && mostrarModal) {
                console.log('⌨️ ESC presionado, cerrando modal');
                cerrarModal();
            }
        };

        if (mostrarModal) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevenir scroll del fondo
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset'; // Restaurar scroll
        };
    }, [mostrarModal]);

    const formatearPrecio = (precio?: number) => {
        if (!precio) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(precio);
    };

    const formatearArea = (area: number) => {
        return new Intl.NumberFormat('en-US').format(area) + ' sqft';
    };

    const renderTarjetaLugar = (lugar: LugarVivienda) => {
        // Determinar el color y icono basado en el tipo
        const getEstiloTipo = (tipo: string) => {
            switch (tipo) {
                case 'actual':
                    return {
                        color: 'text-green-600',
                        bg: 'bg-green-50',
                        border: 'border-green-200',
                        icon: Home,
                        label: 'Actual'
                    };
                case 'pasado':
                    return {
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        border: 'border-blue-200',
                        icon: Clock,
                        label: 'Pasado'
                    };
                case 'mudanza':
                    return {
                        color: 'text-purple-600',
                        bg: 'bg-purple-50',
                        border: 'border-purple-200',
                        icon: Clock,
                        label: 'Mudanza'
                    };
                default:
                    return {
                        color: 'text-gray-600',
                        bg: 'bg-gray-50',
                        border: 'border-gray-200',
                        icon: Home,
                        label: 'General'
                    };
            }
        };

        const estilo = getEstiloTipo(lugar.tipo);
        const IconoTipo = estilo.icon;

        return (
            <Card key={lugar.id} className={`p-6 hover:shadow-lg transition-shadow border-l-4 ${estilo.border}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <IconoTipo className={estilo.color} size={20} />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {lugar.direccion}
                            </h3>
                            <span className={`${estilo.bg} ${estilo.color} text-xs px-2 py-1 rounded-full font-medium`}>
                                {estilo.label}
                            </span>
                            {lugar.esPrincipal && lugar.tipo === 'actual' && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Star size={12} />
                                    Principal
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin size={16} />
                            <span>{lugar.ciudad}, {lugar.estado} {lugar.codigoPostal}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <Calendar size={16} />
                            <span>
                                {lugar.fechaInicio} {lugar.fechaFin && `- ${lugar.fechaFin}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {lugar.tipo === 'actual' && !lugar.esPrincipal && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => marcarComoPrincipal(lugar)}
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                disabled={isLoading}
                                title="Marcar como vivienda principal"
                            >
                                <Star size={16} />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/twin-biografia/lugares/${lugar.id}`)}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            <Eye size={16} />
                            Detalles
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarLugar(lugar)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isLoading}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                {/* Información básica de la propiedad */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Bed size={16} className="text-gray-500" />
                        <span>{lugar.habitaciones} habitaciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath size={16} className="text-gray-500" />
                        <span>{lugar.banos} baños</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Ruler size={16} className="text-gray-500" />
                        <span>{formatearArea(lugar.areaTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        <span>{lugar.anoConstruction}</span>
                    </div>
                </div>

                {/* Información financiera */}
                {(lugar.valorEstimado || lugar.impuestosPrediales || lugar.hoaFee) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                        {lugar.valorEstimado && (
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-green-600" />
                                <div>
                                    <span className="text-gray-600">Valor estimado:</span>
                                    <div className="font-semibold">{formatearPrecio(lugar.valorEstimado)}</div>
                                </div>
                            </div>
                        )}
                        {lugar.impuestosPrediales && (
                            <div>
                                <span className="text-gray-600">Impuestos anuales:</span>
                                <div className="font-semibold">{formatearPrecio(lugar.impuestosPrediales)}</div>
                            </div>
                        )}
                        {lugar.hoaFee && (
                            <div>
                                <span className="text-gray-600">HOA mensual:</span>
                                <div className="font-semibold">{formatearPrecio(lugar.hoaFee)}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sistemas y características */}
                {(lugar.calefaccion || lugar.aireAcondicionado || lugar.tipoEstacionamiento) && (
                    <div className="text-sm text-gray-600">
                        <div className="flex flex-wrap gap-4">
                            {lugar.calefaccion && (
                                <span>• Calefacción: {lugar.calefaccion}</span>
                            )}
                            {lugar.aireAcondicionado && (
                                <span>• A/C: {lugar.aireAcondicionado}</span>
                            )}
                            {lugar.tipoEstacionamiento && (
                                <span>• Estacionamiento: {lugar.tipoEstacionamiento}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Descripción */}
                {lugar.descripcion && (
                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <strong>Descripción:</strong> {lugar.descripcion}
                    </div>
                )}
            </Card>
        );
    };

    // Funciones para formatear valores

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
                                    <Home className="text-blue-600" />
                                    Lugares donde Vivo
                                </h1>
                                <p className="text-gray-600">Gestiona información completa sobre tus viviendas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegación por pestañas */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { key: 'actual', label: 'Donde Vivo Hoy', icon: Home, count: obtenerLugaresPorTipo('actual').length },
                                { key: 'pasado', label: 'Lugares del Pasado', icon: Calendar, count: obtenerLugaresPorTipo('pasado').length },
                                { key: 'mudanza', label: 'Mudanzas', icon: MapPin, count: obtenerLugaresPorTipo('mudanza').length }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setTipoActivo(tab.key as any)}
                                    className={`${
                                        tipoActivo === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Contenido de las pestañas */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {tipoActivo === 'actual' && 'Donde Vivo Actualmente'}
                                {tipoActivo === 'pasado' && 'Lugares donde Viví en el Pasado'}
                                {tipoActivo === 'mudanza' && 'Historial de Mudanzas'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={cargarLugares}
                                    disabled={isLoading}
                                    className="flex items-center gap-2"
                                    title="Actualizar lista"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    ) : (
                                        <ArrowLeft className="rotate-180" size={16} />
                                    )}
                                    Actualizar
                                </Button>
                                <Button
                                    onClick={() => abrirModalNuevo(tipoActivo === 'todos' ? 'actual' : tipoActivo)}
                                    className="flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    <Plus size={20} />
                                    Agregar {tipoActivo === 'actual' ? 'Vivienda Actual' : tipoActivo === 'pasado' ? 'Lugar del Pasado' : tipoActivo === 'mudanza' ? 'Mudanza' : 'Casa'}
                                </Button>
                            </div>
                        </div>

                        {/* Indicadores de estado */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <X className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <div className="mt-2 text-sm text-red-700">{error}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center gap-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    Cargando lugares...
                                </div>
                            </div>
                        )}

                        {/* Lista de lugares */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {obtenerLugaresPorTipo(tipoActivo).map(renderTarjetaLugar)}
                        </div>

                        {obtenerLugaresPorTipo(tipoActivo).length === 0 && (
                            <div className="text-center py-12">
                                <Home className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No hay lugares registrados
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comienza agregando información sobre tu vivienda.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => abrirModalNuevo(tipoActivo === 'todos' ? 'actual' : tipoActivo)}>
                                        <Plus size={20} className="mr-2" />
                                        Agregar Primer Lugar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para agregar/editar lugar */}
            {mostrarModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={(e) => {
                        // Solo cerrar si se hace click en el overlay, no en el contenido del modal
                        if (e.target === e.currentTarget) {
                            console.log('🖱️ Click en overlay, cerrando modal');
                            cerrarModal();
                        }
                    }}
                >
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-semibold">
                                {modoEdicion ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}
                            </h2>
                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500">Presiona ESC para cerrar</span>
                                <Button 
                                    variant="outline" 
                                    onClick={cerrarModal}
                                    className="p-2 hover:bg-red-50 hover:border-red-300"
                                >
                                    <X size={20} className="text-gray-600 hover:text-red-600" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información básica */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dirección *
                                        </label>
                                        <input
                                            ref={addressInputRef}
                                            type="text"
                                            value={formulario.direccion || ''}
                                            onChange={(e) => setFormulario({...formulario, direccion: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Comienza a escribir para autocompletar con Google"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            ✨ Google Autocomplete habilitado - Escribe para ver sugerencias
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ciudad *
                                        </label>
                                        <input
                                            type="text"
                                            value={formulario.ciudad || ''}
                                            onChange={(e) => setFormulario({...formulario, ciudad: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Austin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            value={formulario.estado || ''}
                                            onChange={(e) => setFormulario({...formulario, estado: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="TX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Código Postal
                                        </label>
                                        <input
                                            type="text"
                                            value={formulario.codigoPostal || ''}
                                            onChange={(e) => setFormulario({...formulario, codigoPostal: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="78634"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha de Inicio
                                        </label>
                                        <input
                                            type="date"
                                            value={formulario.fechaInicio || ''}
                                            onChange={(e) => setFormulario({...formulario, fechaInicio: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {formulario.tipo !== 'actual' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha de Fin
                                            </label>
                                            <input
                                                type="date"
                                                value={formulario.fechaFin || ''}
                                                onChange={(e) => setFormulario({...formulario, fechaFin: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Características de la propiedad */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Características de la Propiedad</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Propiedad
                                        </label>
                                        <select
                                            value={formulario.tipoPropiedad || 'casa'}
                                            onChange={(e) => setFormulario({...formulario, tipoPropiedad: e.target.value as any})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="casa">Casa</option>
                                            <option value="apartamento">Apartamento</option>
                                            <option value="condominio">Condominio</option>
                                            <option value="townhouse">Townhouse</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Área Total (sqft)
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.areaTotal || ''}
                                            onChange={(e) => setFormulario({...formulario, areaTotal: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2130"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Año de Construcción
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.anoConstruction || ''}
                                            onChange={(e) => setFormulario({...formulario, anoConstruction: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2016"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Habitaciones
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.habitaciones || ''}
                                            onChange={(e) => setFormulario({...formulario, habitaciones: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Baños Completos
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.banos || ''}
                                            onChange={(e) => setFormulario({...formulario, banos: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Medios Baños
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.medioBanos || ''}
                                            onChange={(e) => setFormulario({...formulario, medioBanos: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sistemas y características */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Sistemas y Características</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Calefacción
                                        </label>
                                        <select
                                            value={formulario.calefaccion || ''}
                                            onChange={(e) => setFormulario({...formulario, calefaccion: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {OPCIONES_CALEFACCION.map(opcion => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Aire Acondicionado
                                        </label>
                                        <select
                                            value={formulario.aireAcondicionado || ''}
                                            onChange={(e) => setFormulario({...formulario, aireAcondicionado: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {OPCIONES_AIRE_ACONDICIONADO.map(opcion => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Estacionamiento
                                        </label>
                                        <select
                                            value={formulario.tipoEstacionamiento || ''}
                                            onChange={(e) => setFormulario({...formulario, tipoEstacionamiento: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {OPCIONES_ESTACIONAMIENTO.map(opcion => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Espacios de Estacionamiento
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.espaciosEstacionamiento || ''}
                                            onChange={(e) => setFormulario({...formulario, espaciosEstacionamiento: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información financiera */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Financiera</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Valor Estimado ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.valorEstimado || ''}
                                            onChange={(e) => setFormulario({...formulario, valorEstimado: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="412000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Impuestos Prediales Anuales ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.impuestosPrediales || ''}
                                            onChange={(e) => setFormulario({...formulario, impuestosPrediales: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="9540"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cuota HOA Mensual ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formulario.hoaFee || ''}
                                            onChange={(e) => setFormulario({...formulario, hoaFee: Number(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="33"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formulario.tieneHOA || false}
                                            onChange={(e) => setFormulario({...formulario, tieneHOA: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-900">Tiene HOA (Asociación de Propietarios)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción y Notas
                                </label>
                                <textarea
                                    value={formulario.descripcion || ''}
                                    onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe las características especiales, recuerdos, aspectos que te gustaban o no..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 p-6 border-t">
                            <Button variant="outline" onClick={cerrarModal} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button onClick={guardarLugar} className="flex items-center gap-2" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LugaresDondeVivoPage;
