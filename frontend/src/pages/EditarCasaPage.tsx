import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";
import { useMsal } from "@azure/msal-react";
import { useAgentCreateHome, HomeData } from "@/services/casaAgentApiService";
import { 
    ArrowLeft,
    Save,
    X,
    DollarSign,
    Calendar,
    Ruler,
    Users,
    Building,
    Loader2,
    Upload,
    FileImage,
    Trash2
} from "lucide-react";

interface FormData {
    nombre: string;
    tipo: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
    latitud?: number;
    longitud?: number;
    areaTotal: number;
    habitaciones: number;
    banos: number;
    medioBanos: number;
    pisos: number;
    anoConstruction: number;
    valorEstimado: number;
    impuestosPrediales: number;
    hoaFee: number;
    fechaInicio: string;
    tipoPropiedad: string;
    descripcion: string;
    caracteristicasTerreno: string[];
    fotos: string[];
    esPrincipal: boolean;
    calefaccion: string;
    aireAcondicionado: string;
    tipoEstacionamiento: string;
    espaciosEstacionamiento: number;
    vecindario: string;
    aspectosPositivos: string[];
    aspectosNegativos: string[];
    tieneHOA: boolean;
}

const EditarCasaPage: React.FC = () => {
    const navigate = useNavigate();
    const { homeId } = useParams<{ homeId: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accounts } = useMsal();
    const { obtenerCasaPorId, actualizarCasa } = useAgentCreateHome();
    
    const twinId = accounts[0]?.localAccountId;
    
    const [casa, setCasa] = useState<FormData>({
        nombre: '',
        tipo: 'actual',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: 'Estados Unidos',
        latitud: undefined,
        longitud: undefined,
        areaTotal: 0,
        habitaciones: 0,
        banos: 0,
        medioBanos: 0,
        pisos: 1,
        anoConstruction: new Date().getFullYear(),
        valorEstimado: 0,
        impuestosPrediales: 0,
        hoaFee: 0,
        fechaInicio: new Date().toISOString().split('T')[0],
        tipoPropiedad: 'casa',
        descripcion: '',
        caracteristicasTerreno: [],
        fotos: [],
        esPrincipal: false,
        calefaccion: '',
        aireAcondicionado: '',
        tipoEstacionamiento: '',
        espaciosEstacionamiento: 0,
        vecindario: '',
        aspectosPositivos: [],
        aspectosNegativos: [],
        tieneHOA: false
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
    const [nuevoAspectoPositivo, setNuevoAspectoPositivo] = useState('');
    const [nuevoAspectoNegativo, setNuevoAspectoNegativo] = useState('');

    // Opciones para los selects
    const tiposCasa = [
        { value: 'actual', label: 'Actual' },
        { value: 'pasado', label: 'Pasado' },
        { value: 'mudanza', label: 'Mudanza' },
        { value: 'inversion', label: 'Inversión' },
        { value: 'vacacional', label: 'Vacacional' }
    ];

    const tiposPropiedad = [
        { value: 'casa', label: 'Casa' },
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'condominio', label: 'Condominio' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'duplex', label: 'Dúplex' },
        { value: 'otro', label: 'Otro' }
    ];

    const tiposEstacionamiento = [
        { value: '', label: 'Seleccionar...' },
        { value: 'garage', label: 'Garage' },
        { value: 'cochera', label: 'Cochera' },
        { value: 'estacionamiento', label: 'Estacionamiento asignado' },
        { value: 'calle', label: 'En la calle' },
        { value: 'ninguno', label: 'Ninguno' }
    ];

    const sistemasCalaeccion = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Gas Natural', label: 'Gas Natural' },
        { value: 'Eléctrica', label: 'Eléctrica' },
        { value: 'Solar', label: 'Solar' },
        { value: 'Bomba de calor', label: 'Bomba de calor' },
        { value: 'Ninguna', label: 'Ninguna' }
    ];

    const sistemasAire = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Central', label: 'Central' },
        { value: 'Ventana', label: 'Ventana' },
        { value: 'Mini Split', label: 'Mini Split' },
        { value: 'Ninguno', label: 'Ninguno' }
    ];

    // Cargar datos de la casa al montar el componente
    useEffect(() => {
        const cargarCasa = async () => {
            if (!twinId || !homeId) {
                console.warn('⚠️ No hay twinId o homeId disponible');
                setCargando(false);
                return;
            }

            try {
                console.log('🏠 Cargando casa para editar:', { twinId, homeId });
                const casaEncontrada = await obtenerCasaPorId(twinId, homeId);
                
                if (casaEncontrada) {
                    console.log('✅ Casa encontrada:', casaEncontrada);
                    mapearHomeDataAFormData(casaEncontrada);
                } else {
                    console.warn('⚠️ Casa no encontrada');
                    alert('Casa no encontrada');
                    navigate('/mi-patrimonio/casas');
                }
            } catch (error) {
                console.error('❌ Error al cargar casa:', error);
                alert('Error al cargar la casa');
                navigate('/mi-patrimonio/casas');
            } finally {
                setCargando(false);
            }
        };

        cargarCasa();
    }, [twinId, homeId, obtenerCasaPorId, navigate]);

    // Mapear HomeData a FormData
    const mapearHomeDataAFormData = (homeData: HomeData) => {
        setCasa({
            nombre: `${homeData.direccion}, ${homeData.ciudad}`,
            tipo: homeData.tipo || 'actual',
            direccion: homeData.direccion || '',
            ciudad: homeData.ciudad || '',
            estado: homeData.estado || '',
            codigoPostal: homeData.codigoPostal || '',
            pais: 'Estados Unidos',
            areaTotal: homeData.areaTotal || 0,
            habitaciones: homeData.habitaciones || 0,
            banos: homeData.banos || 0,
            medioBanos: homeData.medioBanos || 0,
            pisos: 1,
            anoConstruction: homeData.anoConstruction || new Date().getFullYear(),
            valorEstimado: homeData.valorEstimado || 0,
            impuestosPrediales: homeData.impuestosPrediales || 0,
            hoaFee: homeData.hoaFee || 0,
            fechaInicio: homeData.fechaInicio || new Date().toISOString().split('T')[0],
            tipoPropiedad: homeData.tipoPropiedad || 'casa',
            descripcion: homeData.descripcion || '',
            caracteristicasTerreno: homeData.caracteristicasTerreno || [],
            fotos: homeData.fotos || [],
            esPrincipal: homeData.esPrincipal || false,
            calefaccion: homeData.calefaccion || '',
            aireAcondicionado: homeData.aireAcondicionado || '',
            tipoEstacionamiento: homeData.tipoEstacionamiento || '',
            espaciosEstacionamiento: homeData.espaciosEstacionamiento || 0,
            vecindario: homeData.vecindario || '',
            aspectosPositivos: homeData.aspectosPositivos || [],
            aspectosNegativos: homeData.aspectosNegativos || [],
            tieneHOA: homeData.tieneHOA || false
        });
    };

    // Mapear FormData a HomeData
    const mapearFormDataAHomeData = (): HomeData => {
        return {
            id: homeId!,
            twinID: twinId!,
            tipo: casa.tipo,
            direccion: casa.direccion,
            ciudad: casa.ciudad,
            estado: casa.estado,
            codigoPostal: casa.codigoPostal,
            fechaInicio: casa.fechaInicio,
            esPrincipal: casa.esPrincipal,
            tipoPropiedad: casa.tipoPropiedad,
            areaTotal: casa.areaTotal,
            habitaciones: casa.habitaciones,
            banos: casa.banos,
            medioBanos: casa.medioBanos,
            anoConstruction: casa.anoConstruction,
            tipoFundacion: '',
            materialConstruction: '',
            calefaccion: casa.calefaccion,
            aireAcondicionado: casa.aireAcondicionado,
            tipoEstacionamiento: casa.tipoEstacionamiento,
            espaciosEstacionamiento: casa.espaciosEstacionamiento,
            caracteristicasTerreno: casa.caracteristicasTerreno,
            valorEstimado: casa.valorEstimado,
            impuestosPrediales: casa.impuestosPrediales,
            hoaFee: casa.hoaFee,
            tieneHOA: casa.tieneHOA,
            vecindario: casa.vecindario,
            descripcion: casa.descripcion,
            aspectosPositivos: casa.aspectosPositivos,
            aspectosNegativos: casa.aspectosNegativos,
            fotos: casa.fotos,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            type: 'home'
        };
    };

    const handleInputChange = (field: keyof FormData, value: any) => {
        setCasa(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGooglePlaceSelected = (placeData: any) => {
        console.log('🗺️ Google Place selected:', placeData);
        
        setCasa(prev => ({
            ...prev,
            direccion: placeData.direccion,
            ciudad: placeData.ciudad,
            estado: placeData.estado,
            codigoPostal: placeData.codigoPostal,
            pais: placeData.pais,
            latitud: placeData.latitud,
            longitud: placeData.longitud
        }));
    };

    const handleFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    setCasa(prev => ({
                        ...prev,
                        fotos: [...prev.fotos, base64]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const eliminarFoto = (index: number) => {
        setCasa(prev => ({
            ...prev,
            fotos: prev.fotos.filter((_, i) => i !== index)
        }));
    };

    const agregarCaracteristica = () => {
        if (nuevaCaracteristica.trim()) {
            setCasa(prev => ({
                ...prev,
                caracteristicasTerreno: [...prev.caracteristicasTerreno, nuevaCaracteristica.trim()]
            }));
            setNuevaCaracteristica('');
        }
    };

    const eliminarCaracteristica = (index: number) => {
        setCasa(prev => ({
            ...prev,
            caracteristicasTerreno: prev.caracteristicasTerreno.filter((_, i) => i !== index)
        }));
    };

    const agregarAspectoPositivo = () => {
        if (nuevoAspectoPositivo.trim()) {
            setCasa(prev => ({
                ...prev,
                aspectosPositivos: [...prev.aspectosPositivos, nuevoAspectoPositivo.trim()]
            }));
            setNuevoAspectoPositivo('');
        }
    };

    const eliminarAspectoPositivo = (index: number) => {
        setCasa(prev => ({
            ...prev,
            aspectosPositivos: prev.aspectosPositivos.filter((_, i) => i !== index)
        }));
    };

    const agregarAspectoNegativo = () => {
        if (nuevoAspectoNegativo.trim()) {
            setCasa(prev => ({
                ...prev,
                aspectosNegativos: [...prev.aspectosNegativos, nuevoAspectoNegativo.trim()]
            }));
            setNuevoAspectoNegativo('');
        }
    };

    const eliminarAspectoNegativo = (index: number) => {
        setCasa(prev => ({
            ...prev,
            aspectosNegativos: prev.aspectosNegativos.filter((_, i) => i !== index)
        }));
    };

    const guardarCambios = async () => {
        if (!casa.direccion.trim() || !casa.ciudad.trim()) {
            alert('Por favor completa la dirección y la ciudad');
            return;
        }

        if (!twinId || !homeId) {
            alert('Error: No se encontró el ID del Twin o de la casa. Por favor recarga la página.');
            return;
        }

        setGuardando(true);
        try {
            console.log('🏠 Actualizando casa:', {
                twinId,
                homeId,
                payload: casa
            });

            const homeData = mapearFormDataAHomeData();
            const resultado = await actualizarCasa(twinId, homeId, homeData);
            
            console.log('✅ Casa actualizada exitosamente:', resultado);
            alert('✅ ¡Casa actualizada exitosamente!');
            navigate('/mi-patrimonio/casas');
        } catch (error) {
            console.error('❌ Error al actualizar la casa:', error);
            alert('❌ Error al actualizar la casa. Por favor intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-700">Cargando casa...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => navigate('/mi-patrimonio/casas')}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver</span>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-800">🏠 Editar Casa</h1>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Información básica */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Información Básica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tipo de casa *
                                </label>
                                <select
                                    value={casa.tipo}
                                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {tiposCasa.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tipo de propiedad
                                </label>
                                <select
                                    value={casa.tipoPropiedad}
                                    onChange={(e) => handleInputChange('tipoPropiedad', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {tiposPropiedad.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={casa.esPrincipal}
                                        onChange={(e) => handleInputChange('esPrincipal', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Es la casa principal</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Ubicación</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección completa *
                                </label>
                                <GoogleAddressAutocompleteModern
                                    value={casa.direccion}
                                    onChange={(value) => handleInputChange('direccion', value)}
                                    onPlaceSelected={handleGooglePlaceSelected}
                                    placeholder="Busca y selecciona la dirección usando Google Places"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                                    <input
                                        type="text"
                                        value={casa.ciudad}
                                        onChange={(e) => handleInputChange('ciudad', e.target.value)}
                                        placeholder="Ciudad"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado/Provincia</label>
                                    <input
                                        type="text"
                                        value={casa.estado}
                                        onChange={(e) => handleInputChange('estado', e.target.value)}
                                        placeholder="Estado o Provincia"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                                    <input
                                        type="text"
                                        value={casa.codigoPostal}
                                        onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                                        placeholder="Código postal"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vecindario</label>
                                    <input
                                        type="text"
                                        value={casa.vecindario}
                                        onChange={(e) => handleInputChange('vecindario', e.target.value)}
                                        placeholder="Nombre del vecindario"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detalles de la propiedad */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🏗️ Detalles de la Propiedad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Ruler className="w-4 h-4" />
                                    <span>Área total (pies²)</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.areaTotal}
                                    onChange={(e) => handleInputChange('areaTotal', Number(e.target.value))}
                                    placeholder="1500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Users className="w-4 h-4" />
                                    <span>Habitaciones</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.habitaciones}
                                    onChange={(e) => handleInputChange('habitaciones', Number(e.target.value))}
                                    placeholder="3"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Baños completos</label>
                                <input
                                    type="number"
                                    value={casa.banos}
                                    onChange={(e) => handleInputChange('banos', Number(e.target.value))}
                                    placeholder="2"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medios baños</label>
                                <input
                                    type="number"
                                    value={casa.medioBanos}
                                    onChange={(e) => handleInputChange('medioBanos', Number(e.target.value))}
                                    placeholder="1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building className="w-4 h-4" />
                                    <span>Año de construcción</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.anoConstruction}
                                    onChange={(e) => handleInputChange('anoConstruction', Number(e.target.value))}
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Fecha de inicio</span>
                                </label>
                                <input
                                    type="date"
                                    value={casa.fechaInicio}
                                    onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sistemas y servicios */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Sistemas y Servicios</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de calefacción</label>
                                <select
                                    value={casa.calefaccion}
                                    onChange={(e) => handleInputChange('calefaccion', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {sistemasCalaeccion.map(sistema => (
                                        <option key={sistema.value} value={sistema.value}>
                                            {sistema.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Aire acondicionado</label>
                                <select
                                    value={casa.aireAcondicionado}
                                    onChange={(e) => handleInputChange('aireAcondicionado', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {sistemasAire.map(sistema => (
                                        <option key={sistema.value} value={sistema.value}>
                                            {sistema.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de estacionamiento</label>
                                <select
                                    value={casa.tipoEstacionamiento}
                                    onChange={(e) => handleInputChange('tipoEstacionamiento', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {tiposEstacionamiento.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Espacios de estacionamiento</label>
                                <input
                                    type="number"
                                    value={casa.espaciosEstacionamiento}
                                    onChange={(e) => handleInputChange('espaciosEstacionamiento', Number(e.target.value))}
                                    placeholder="2"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información financiera */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Información Financiera</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Valor estimado</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.valorEstimado}
                                    onChange={(e) => handleInputChange('valorEstimado', Number(e.target.value))}
                                    placeholder="250000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Impuestos prediales anuales</label>
                                <input
                                    type="number"
                                    value={casa.impuestosPrediales}
                                    onChange={(e) => handleInputChange('impuestosPrediales', Number(e.target.value))}
                                    placeholder="5000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span>HOA Fee mensual</span>
                                        <input
                                            type="checkbox"
                                            checked={casa.tieneHOA}
                                            onChange={(e) => handleInputChange('tieneHOA', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    value={casa.hoaFee}
                                    onChange={(e) => handleInputChange('hoaFee', Number(e.target.value))}
                                    placeholder="150"
                                    disabled={!casa.tieneHOA}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Características del terreno */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🌿 Características del Terreno</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nuevaCaracteristica}
                                    onChange={(e) => setNuevaCaracteristica(e.target.value)}
                                    placeholder="Ej: Jardín grande, Piscina, Patio trasero..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && agregarCaracteristica()}
                                />
                                <Button
                                    type="button"
                                    onClick={agregarCaracteristica}
                                    variant="outline"
                                    size="sm"
                                >
                                    Agregar
                                </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {casa.caracteristicasTerreno.map((caracteristica, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                    >
                                        {caracteristica}
                                        <button
                                            type="button"
                                            onClick={() => eliminarCaracteristica(index)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Aspectos positivos y negativos */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Evaluación de la Propiedad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Aspectos positivos */}
                            <div>
                                <h3 className="text-lg font-medium text-green-700 mb-3">✅ Aspectos Positivos</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={nuevoAspectoPositivo}
                                            onChange={(e) => setNuevoAspectoPositivo(e.target.value)}
                                            placeholder="Ej: Excelente ubicación, buena iluminación..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            onKeyPress={(e) => e.key === 'Enter' && agregarAspectoPositivo()}
                                        />
                                        <Button
                                            type="button"
                                            onClick={agregarAspectoPositivo}
                                            variant="outline"
                                            size="sm"
                                            className="border-green-300 text-green-700 hover:bg-green-50"
                                        >
                                            +
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {casa.aspectosPositivos.map((aspecto, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
                                            >
                                                <span className="text-sm text-green-800">{aspecto}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarAspectoPositivo(index)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Aspectos negativos */}
                            <div>
                                <h3 className="text-lg font-medium text-red-700 mb-3">❌ Aspectos a Mejorar</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={nuevoAspectoNegativo}
                                            onChange={(e) => setNuevoAspectoNegativo(e.target.value)}
                                            placeholder="Ej: Necesita pintura, ruido del tráfico..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            onKeyPress={(e) => e.key === 'Enter' && agregarAspectoNegativo()}
                                        />
                                        <Button
                                            type="button"
                                            onClick={agregarAspectoNegativo}
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                            +
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {casa.aspectosNegativos.map((aspecto, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
                                            >
                                                <span className="text-sm text-red-800">{aspecto}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarAspectoNegativo(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Descripción</h2>
                        <textarea
                            value={casa.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            placeholder="Describe tu propiedad: ubicación en el barrio, características especiales, historia, etc."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Fotos */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📸 Fotos</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {casa.fotos.map((foto, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={foto}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => eliminarFoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="space-y-3">
                                <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Subir fotos</span>
                                    </button>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Formatos soportados: JPG, PNG, GIF (máx. 5MB por imagen)
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/mi-patrimonio/casas')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={guardarCambios}
                            disabled={guardando}
                            className="flex items-center space-x-2"
                        >
                            {guardando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarCasaPage;