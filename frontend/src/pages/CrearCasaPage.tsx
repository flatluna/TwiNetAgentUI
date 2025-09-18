import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";
import { useMsal } from "@azure/msal-react";
import { useAgentCreateHome } from "@/services/casaAgentApiService";
import { 
    ArrowLeft,
    Save,
    Camera,
    X,
    DollarSign,
    Calendar,
    Ruler,
    Users,
    Building,
    Loader2
} from "lucide-react";

interface Casa {
    id: string;
    nombre: string;
    tipo: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
    latitud?: number;
    longitud?: number;
    metroCuadrados: number;
    numeroHabitaciones: number;
    numeroBanos: number;
    numeroPisos: number;
    anioConstruccion: number;
    valorCompra: number;
    valorActual: number;
    fechaCompra: string;
    estadoPropiedad: string;
    tipoPropiedad: string;
    descripcion: string;
    caracteristicas: string[];
    servicios: string[];
    fotos: string[];
    documentos: string[];
    fechaCreacion: string;
}

const CrearCasaPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accounts } = useMsal();
    const { crearCasaConIA } = useAgentCreateHome();
    
    const twinId = accounts[0]?.localAccountId;
    
    const [casa, setCasa] = useState<Casa>({
        id: '',
        nombre: '',
        tipo: 'casa',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: '',
        latitud: undefined,
        longitud: undefined,
        metroCuadrados: 0,
        numeroHabitaciones: 0,
        numeroBanos: 0,
        numeroPisos: 1,
        anioConstruccion: new Date().getFullYear(),
        valorCompra: 0,
        valorActual: 0,
        fechaCompra: new Date().toISOString().split('T')[0],
        estadoPropiedad: 'excelente',
        tipoPropiedad: 'propia',
        descripcion: '',
        caracteristicas: [],
        servicios: [],
        fotos: [],
        documentos: [],
        fechaCreacion: new Date().toISOString()
    });

    const [guardando, setGuardando] = useState(false);

    // Opciones para los selects
    const tiposCasa = [
        { value: 'casa', label: 'Casa' },
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'condominio', label: 'Condominio' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'duplex', label: 'Dúplex' },
        { value: 'estudio', label: 'Estudio' },
        { value: 'loft', label: 'Loft' },
        { value: 'cabana', label: 'Cabaña' },
        { value: 'otro', label: 'Otro' }
    ];

    const estadosPropiedad = [
        { value: 'excelente', label: 'Excelente' },
        { value: 'muy_bueno', label: 'Muy Bueno' },
        { value: 'bueno', label: 'Bueno' },
        { value: 'regular', label: 'Regular' },
        { value: 'necesita_reparaciones', label: 'Necesita Reparaciones' }
    ];

    const tiposPropiedad = [
        { value: 'propia', label: 'Propia' },
        { value: 'alquilada', label: 'Alquilada' },
        { value: 'familiar', label: 'Familiar' },
        { value: 'prestada', label: 'Prestada' },
        { value: 'otro', label: 'Otro' }
    ];

    const caracteristicasDisponibles = [
        'Piscina', 'Jardín', 'Garage', 'Balcón', 'Terraza', 'Chimenea', 
        'Walk-in Closet', 'Oficina', 'Gym', 'Lavandería', 'Bodega',
        'Cuarto de servicio', 'Jacuzzi', 'Sauna', 'Biblioteca',
        'Sala de juegos', 'Home theater', 'Bar', 'Desayunador',
        'Patio trasero', 'Patio delantero', 'Roof garden'
    ];

    const serviciosDisponibles = [
        'Agua', 'Luz', 'Gas', 'Internet', 'Cable/TV', 'Teléfono',
        'Seguridad 24/7', 'Portería', 'Ascensor', 'Generador eléctrico',
        'Aire acondicionado central', 'Calefacción central',
        'Sistema de alarma', 'Cámaras de seguridad', 'Citófono',
        'Mantenimiento incluido', 'Limpieza incluida'
    ];

    const handleInputChange = (field: keyof Casa, value: any) => {
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

    const toggleCaracteristica = (caracteristica: string) => {
        setCasa(prev => ({
            ...prev,
            caracteristicas: prev.caracteristicas.includes(caracteristica)
                ? prev.caracteristicas.filter(c => c !== caracteristica)
                : [...prev.caracteristicas, caracteristica]
        }));
    };

    const toggleServicio = (servicio: string) => {
        setCasa(prev => ({
            ...prev,
            servicios: prev.servicios.includes(servicio)
                ? prev.servicios.filter(s => s !== servicio)
                : [...prev.servicios, servicio]
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

    const guardarCasa = async () => {
        if (!casa.nombre.trim() || !casa.direccion.trim()) {
            alert('Por favor completa el nombre y la dirección');
            return;
        }

        if (!twinId) {
            alert('Error: No se encontró el ID del Twin. Por favor inicia sesión nuevamente.');
            return;
        }

        setGuardando(true);
        try {
            console.log('🏠 Enviando casa al backend AI:', {
                twinId,
                payload: casa
            });

            // Mapear los datos del formulario al formato requerido por el backend AI
            const casaData = {
                nombre: casa.nombre,
                direccion: casa.direccion,
                ciudad: casa.ciudad,
                estado: casa.estado,
                codigoPostal: casa.codigoPostal,
                pais: casa.pais || 'Estados Unidos',
                tipo: 'actual', // Default to actual
                tipoPropiedad: casa.tipoPropiedad === 'casa' ? 'casa' : 
                               casa.tipoPropiedad === 'apartamento' ? 'apartamento' :
                               casa.tipoPropiedad === 'condominio' ? 'condominio' : 'casa',
                fechaInicio: casa.fechaCompra || new Date().toISOString().split('T')[0],
                areaTotal: casa.metroCuadrados,
                areaConstruida: casa.metroCuadrados, // Assuming same for now
                areaTerreno: casa.metroCuadrados * 1.2, // Estimate
                habitaciones: casa.numeroHabitaciones,
                banos: casa.numeroBanos,
                medioBanos: 0, // Default
                pisos: casa.numeroPisos,
                anoConstructorcion: casa.anioConstruccion,
                descripcion: casa.descripcion,
                esPrincipal: false, // Default
                
                // Campos opcionales
                fechaCompra: casa.fechaCompra,
                valorCompra: casa.valorCompra,
                valorActual: casa.valorActual,
                estadoGeneral: casa.estadoPropiedad === 'Excelente' ? 'excelente' :
                              casa.estadoPropiedad === 'Muy Bueno' ? 'muy_bueno' :
                              casa.estadoPropiedad === 'Bueno' ? 'bueno' : 'bueno',
                
                // Mapear características
                tieneGaraje: casa.caracteristicas.includes('Garaje'),
                espaciosGaraje: casa.caracteristicas.includes('Garaje') ? 2 : 0,
                tienePiscina: casa.caracteristicas.includes('Piscina'),
                tieneJardin: casa.caracteristicas.includes('Jardín'),
                tieneSotano: casa.caracteristicas.includes('Sótano'),
                tieneAtico: casa.caracteristicas.includes('Ático'),
                tieneTerraza: casa.caracteristicas.includes('Terraza'),
                tieneBalcon: casa.caracteristicas.includes('Balcón'),
                
                // Mapear servicios
                calefaccion: casa.servicios.includes('Calefacción') ? 'Central' : undefined,
                aireAcondicionado: casa.servicios.includes('Aire Acondicionado') ? 'Central' : undefined,
                internet: casa.servicios.includes('Internet') ? 'Fibra Óptica' : undefined,
                sistemaSeguridad: casa.servicios.includes('Seguridad') ? 'Alarma' : undefined,
                
                // Multimedia
                fotos: casa.fotos,
                documentos: casa.documentos
            };

            // Llamar al backend AI
            const resultado = await crearCasaConIA(casaData, twinId);
            
            console.log('✅ Casa creada exitosamente con AI:', resultado);
            
            // Mostrar información del procesamiento AI si está disponible
            if (resultado.aiProcessingDetails) {
                console.log('🤖 Detalles AI:', resultado.aiProcessingDetails);
                
                let aiMessage = '✅ ¡Casa guardada exitosamente con AI!';
                if (resultado.aiProcessingDetails.confidence) {
                    aiMessage += `\n🎯 Confianza AI: ${(resultado.aiProcessingDetails.confidence * 100).toFixed(1)}%`;
                }
                if (resultado.aiProcessingDetails.marketAnalysis?.estimatedValue) {
                    aiMessage += `\n💰 Valor estimado por AI: $${resultado.aiProcessingDetails.marketAnalysis.estimatedValue.toLocaleString()}`;
                }
                alert(aiMessage);
            } else {
                alert('✅ ¡Casa guardada exitosamente!');
            }
            
            navigate('/mi-patrimonio/casas');
        } catch (error) {
            console.error('❌ Error al guardar la casa con AI:', error);
            alert('❌ Error al guardar la casa. Por favor intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-800">🏠 Agregar Nueva Casa</h1>
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
                                    Nombre de la propiedad *
                                </label>
                                <input
                                    type="text"
                                    value={casa.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    placeholder="Ej: Casa principal, Apartamento centro, Casa de playa..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tipo de propiedad
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <span>Metros cuadrados</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.metroCuadrados}
                                    onChange={(e) => handleInputChange('metroCuadrados', Number(e.target.value))}
                                    placeholder="150"
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
                                    value={casa.numeroHabitaciones}
                                    onChange={(e) => handleInputChange('numeroHabitaciones', Number(e.target.value))}
                                    placeholder="3"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
                                <input
                                    type="number"
                                    value={casa.numeroBanos}
                                    onChange={(e) => handleInputChange('numeroBanos', Number(e.target.value))}
                                    placeholder="2"
                                    min="0"
                                    step="0.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building className="w-4 h-4" />
                                    <span>Pisos</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.numeroPisos}
                                    onChange={(e) => handleInputChange('numeroPisos', Number(e.target.value))}
                                    placeholder="1"
                                    min="1"
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
                                    <span>Valor de compra</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.valorCompra}
                                    onChange={(e) => handleInputChange('valorCompra', Number(e.target.value))}
                                    placeholder="250000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Valor actual estimado</span>
                                </label>
                                <input
                                    type="number"
                                    value={casa.valorActual}
                                    onChange={(e) => handleInputChange('valorActual', Number(e.target.value))}
                                    placeholder="300000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Fecha de compra</span>
                                </label>
                                <input
                                    type="date"
                                    value={casa.fechaCompra}
                                    onChange={(e) => handleInputChange('fechaCompra', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado y tipo de propiedad */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🏠 Estado y Propiedad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado de la propiedad</label>
                                <select
                                    value={casa.estadoPropiedad}
                                    onChange={(e) => handleInputChange('estadoPropiedad', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {estadosPropiedad.map(estado => (
                                        <option key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de propiedad</label>
                                <select
                                    value={casa.tipoPropiedad}
                                    onChange={(e) => handleInputChange('tipoPropiedad', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {tiposPropiedad.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Año de construcción</label>
                                <input
                                    type="number"
                                    value={casa.anioConstruccion}
                                    onChange={(e) => handleInputChange('anioConstruccion', Number(e.target.value))}
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Características */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ Características</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {caracteristicasDisponibles.map(caracteristica => (
                                <label
                                    key={caracteristica}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        casa.caracteristicas.includes(caracteristica)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={casa.caracteristicas.includes(caracteristica)}
                                        onChange={() => toggleCaracteristica(caracteristica)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-medium">{caracteristica}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Servicios */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Servicios</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {serviciosDisponibles.map(servicio => (
                                <label
                                    key={servicio}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        casa.servicios.includes(servicio)
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={casa.servicios.includes(servicio)}
                                        onChange={() => toggleServicio(servicio)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-medium">{servicio}</span>
                                </label>
                            ))}
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
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => eliminarFoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Agregar fotos</span>
                        </button>
                        
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
                            onClick={guardarCasa}
                            disabled={guardando}
                            className="flex items-center space-x-2"
                        >
                            {guardando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{guardando ? 'Procesando con AI...' : 'Guardar Casa con AI'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearCasaPage;
