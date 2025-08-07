import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import { twinApiService } from "@/services/twinApiService";
import { 
    User,
    Mail,
    Calendar,
    FileText,
    Save,
    ArrowLeft,
    Edit3,
    CheckCircle,
    Loader2,
    Camera,
    Upload,
    X
} from "lucide-react";

// Lista de países y ciudades
const COUNTRIES_CITIES = {
    "Estados Unidos": [
        "Nueva York", "Los Ángeles", "Chicago", "Houston", "Phoenix", "Filadelfia", 
        "San Antonio", "San Diego", "Dallas", "San José", "Austin", "Jacksonville", 
        "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianápolis", 
        "Seattle", "Denver", "Boston", "El Paso", "Detroit", "Nashville", "Memphis",
        "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque",
        "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs",
        "Miami", "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis",
        "Tampa", "Arlington", "New Orleans", "Wichita", "Cleveland", "Bakersfield"
    ],
    "México": [
        "Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", 
        "Juárez", "Torreón", "Querétaro", "San Luis Potosí", "Mérida", "Mexicali", 
        "Aguascalientes", "Cuernavaca", "Saltillo", "Hermosillo", "Culiacán", "Morelia",
        "Villahermosa", "Veracruz", "Chihuahua", "Tampico", "Campeche", "Cancún",
        "Durango", "Oaxaca", "Tuxtla Gutiérrez", "Pachuca", "Toluca", "Reynosa",
        "Matamoros", "Ensenada", "Xalapa", "Mazatlán", "Coatzacoalcos", "La Paz",
        "Nuevo Laredo", "Acapulco", "Tlaxcala", "Irapuato", "Celaya", "Ciudad Victoria"
    ]
};

const COUNTRIES = Object.keys(COUNTRIES_CITIES);

// Lista de nacionalidades
const NATIONALITIES = [
    "Estadounidense",
    "Mexicana",
    "Canadiense",
    "Española",
    "Francesa",
    "Alemana",
    "Italiana",
    "Británica",
    "Holandesa",
    "Suiza",
    "Brasileña",
    "Argentina",
    "Colombiana",
    "Peruana",
    "Chilena",
    "Venezolana",
    "Japonesa",
    "China",
    "India",
    "Coreana",
    "Australiana",
    "Rusa"
];

// Lista de ocupaciones
const OCCUPATIONS = [
    "Desarrollador de Software",
    "Médico",
    "Enfermero/a",
    "Profesor/a",
    "Ingeniero",
    "Abogado/a",
    "Contador/a",
    "Diseñador Gráfico",
    "Arquitecto/a",
    "Psicólogo/a",
    "Administrador de Empresas",
    "Vendedor/a",
    "Consultor/a",
    "Estudiante",
    "Freelancer",
    "Emprendedor/a",
    "Jubilado/a",
    "Ama de Casa",
    "Otro"
];

// Lista de intereses y hobbies
const INTERESTS = [
    "Música", "Deportes", "Lectura", "Viajes", "Cine", "Fotografía",
    "Cocina", "Arte", "Tecnología", "Videojuegos", "Baile", "Ejercicio",
    "Naturaleza", "Historia", "Ciencia", "Moda", "Jardinería", "Escritura",
    "Teatro", "Yoga", "Meditación", "Idiomas", "Coleccionismo", "Pesca",
    "Camping", "Surf", "Escalada", "Pintura", "Costura", "Mecánica"
];

// Lista de idiomas
const LANGUAGES = [
    "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués",
    "Mandarín", "Japonés", "Coreano", "Árabe", "Ruso", "Holandés",
    "Sueco", "Noruego", "Danés", "Finlandés", "Polaco", "Checo",
    "Húngaro", "Griego", "Turco", "Hindi", "Tailandés", "Vietnamita",
    "Hebreo", "Catalán", "Euskera", "Gallego", "Quechua", "Guaraní"
];

interface DatosPersonales {
    // Foto del Twin
    profilePhoto?: string;
    
    // Información Básica
    firstName: string;
    middleName?: string;
    lastName: string;
    nickname?: string;
    
    // Información de Contacto
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    
    // Información Personal
    dateOfBirth: string;
    birthCountry: string;
    birthCity: string;
    nationality: string;
    gender: string;
    maritalStatus: string;
    
    // Información Adicional
    occupation: string;
    company?: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodType?: string;
    height?: string;
    weight?: string;
    
    // Identificación
    documentType: string;
    documentNumber: string;
    passportNumber?: string;
    socialSecurityNumber?: string;
    
    // Redes Sociales y Web
    website?: string;
    linkedIn?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    
    // Biografía Personal
    personalBio?: string;
    interests?: string[];
    languages?: string[];
}

const DatosPersonalesPage: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    
    // Estados para manejo de foto
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const autocompleteServiceRef = useRef<any>(null);
    const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCbH7BdKombRuTBAOavP3zX4T8pw5eIVxo";
    
    // ID del twin que vamos a cargar y editar
    const TWIN_ID = "TestTwin2024";

    const [datos, setDatos] = useState<DatosPersonales>({
        profilePhoto: "",
        firstName: "",
        middleName: "",
        lastName: "",
        nickname: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        dateOfBirth: "",
        birthCountry: "",
        birthCity: "",
        nationality: "",
        gender: "",
        maritalStatus: "",
        occupation: "",
        company: "",
        emergencyContact: "",
        emergencyPhone: "",
        bloodType: "",
        height: "",
        weight: "",
        documentType: "",
        documentNumber: "",
        passportNumber: "",
        socialSecurityNumber: "",
        website: "",
        linkedIn: "",
        facebook: "",
        instagram: "",
        twitter: "",
        personalBio: "",
        interests: [],
        languages: []
    });

    useEffect(() => {
        // Inicializar Google Maps
        GoogleMapsLoader.getInstance({ apiKey, libraries: ["places"] }).load().then(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
                autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            }
        });
        
        // Cargar datos del twin desde la API
        loadTwinData();
    }, [apiKey]);

    const loadTwinData = async () => {
        setIsLoading(true);
        setLoadError(null);
        
        try {
            console.log(`🔄 Cargando datos del twin: ${TWIN_ID}`);
            const response = await twinApiService.getTwin(TWIN_ID);
            
            if (response.success && response.data) {
                const twinData = response.data;
                console.log('✅ Datos del twin cargados:', twinData);
                
                // Mapear los datos del twin al formato del componente
                setDatos({
                    profilePhoto: twinData.profilePhoto || "",
                    firstName: twinData.firstName || "",
                    middleName: twinData.middleName || "",
                    lastName: twinData.lastName || "",
                    nickname: twinData.nickname || "",
                    email: twinData.email || "",
                    phone: twinData.phone || "",
                    address: twinData.address || "",
                    city: twinData.city || "",
                    state: twinData.state || "",
                    country: twinData.country || "",
                    zipCode: twinData.zipCode || "",
                    dateOfBirth: twinData.dateOfBirth || "",
                    birthCountry: twinData.birthCountry || "",
                    birthCity: twinData.birthCity || "",
                    nationality: twinData.nationality || "",
                    gender: twinData.gender || "",
                    maritalStatus: twinData.maritalStatus || "",
                    occupation: twinData.occupation || "",
                    company: "",
                    emergencyContact: "",
                    emergencyPhone: "",
                    bloodType: "",
                    height: "",
                    weight: "",
                    documentType: "",
                    documentNumber: "",
                    passportNumber: "",
                    socialSecurityNumber: "",
                    website: "",
                    linkedIn: "",
                    facebook: "",
                    instagram: "",
                    twitter: "",
                    personalBio: twinData.personalBio || "",
                    interests: twinData.interests || [],
                    languages: twinData.languages || []
                });
                
                // SIEMPRE verificar primero el Data Lake para obtener la foto más reciente
                console.log('📸 Verificando foto más reciente en Data Lake usando proxy del backend...');
                try {
                    // Usar URL del proxy directamente para obtener la foto más reciente
                    const proxyUrl = twinApiService.getTwinPhotoProxyUrl(TWIN_ID);
                    console.log('🔄 URL del proxy generada:', proxyUrl);
                    
                    // Verificar si el proxy tiene una imagen disponible haciendo una HEAD request
                    const proxyResponse = await fetch(proxyUrl, { method: 'HEAD' });
                    if (proxyResponse.ok) {
                        setPhotoPreview(proxyUrl);
                        setDatos(prev => ({ ...prev, profilePhoto: proxyUrl }));
                        console.log('✅ Foto más reciente cargada desde proxy del backend');
                    } else {
                        console.log('📸 No se encontró foto en Data Lake, usando foto del perfil si existe...');
                        
                        // Solo usar la foto del perfil de Cosmos DB si no hay nada en Data Lake
                        if (twinData.profilePhoto) {
                            setPhotoPreview(twinData.profilePhoto);
                            console.log('📸 Usando foto del perfil de Cosmos DB como fallback:', twinData.profilePhoto);
                        } else {
                            console.log('📸 No hay foto disponible en ninguna fuente');
                        }
                    }
                } catch (photoError) {
                    console.error('❌ Error al cargar foto desde proxy del backend:', photoError);
                    console.log('📸 Intentando método fallback con SAS token de Data Lake...');
                    
                    // Fallback: usar el método anterior del Data Lake con SAS token
                    try {
                        const photoResponse = await twinApiService.getTwinPhotoUrl(TWIN_ID);
                        if (photoResponse.success && photoResponse.data?.photo_url) {
                            console.log('📸 URL obtenida desde Data Lake con SAS token:', photoResponse.data.photo_url);
                            setPhotoPreview(photoResponse.data.photo_url);
                            setDatos(prev => ({ ...prev, profilePhoto: photoResponse.data?.photo_url ?? prev.profilePhoto }));
                            console.log('✅ Foto cargada desde Data Lake con SAS token (fallback)');
                        } else {
                            console.log('📸 No se encontró foto en Data Lake, usando foto del perfil si existe...');
                            
                            // Último fallback: usar la foto del perfil de Cosmos DB
                            if (twinData.profilePhoto) {
                                setPhotoPreview(twinData.profilePhoto);
                                console.log('📸 Usando foto del perfil de Cosmos DB como último fallback:', twinData.profilePhoto);
                            } else {
                                console.log('📸 No hay foto disponible en ninguna fuente');
                            }
                        }
                    } catch (fallbackError) {
                        console.error('❌ Error en fallback de Data Lake:', fallbackError);
                        
                        // Último fallback: usar la foto del perfil de Cosmos DB
                        if (twinData.profilePhoto) {
                            setPhotoPreview(twinData.profilePhoto);
                            console.log('📸 Usando foto del perfil de Cosmos DB después de errores:', twinData.profilePhoto);
                        }
                    }
                }
                
                // Actualizar ciudades disponibles si hay país de nacimiento
                if (twinData.birthCountry && COUNTRIES_CITIES[twinData.birthCountry as keyof typeof COUNTRIES_CITIES]) {
                    setAvailableCities(COUNTRIES_CITIES[twinData.birthCountry as keyof typeof COUNTRIES_CITIES]);
                }
                
            } else {
                setLoadError(response.error || 'Error al cargar los datos del twin');
                console.error('❌ Error al cargar twin:', response.error);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setLoadError(errorMessage);
            console.error('❌ Error al cargar datos del twin:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAddressSuggestions = (input: string) => {
        if (!autocompleteServiceRef.current || !input || input.length < 3) {
            setAddressSuggestions([]);
            return;
        }
        setAddressLoading(true);
        autocompleteServiceRef.current.getPlacePredictions({ input }, (predictions: any[]) => {
            setAddressSuggestions(predictions || []);
            setAddressLoading(false);
        });
    };

    const extractAddressComponents = (placeId: string) => {
        setIsAutoCompleting(true);
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        
        service.getDetails({
            placeId: placeId,
            fields: ['address_components', 'formatted_address']
        }, (place: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                const components = place.address_components;
                let city = '';
                let state = '';
                let country = '';
                let zipCode = '';
                
                components.forEach((component: any) => {
                    const types = component.types;
                    
                    if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    } else if (types.includes('country')) {
                        country = component.long_name;
                    } else if (types.includes('postal_code')) {
                        zipCode = component.long_name;
                    }
                });
                
                // Actualizar todos los campos relacionados con la dirección
                setDatos(prev => ({
                    ...prev,
                    address: place.formatted_address,
                    city: city,
                    state: state,
                    country: country,
                    zipCode: zipCode
                }));
            }
            setIsAutoCompleting(false);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: value }));
        
        if (name === "address") {
            fetchAddressSuggestions(value);
        }
        
        // Actualizar ciudades disponibles cuando cambie el país de nacimiento
        if (name === "birthCountry") {
            const cities = COUNTRIES_CITIES[value as keyof typeof COUNTRIES_CITIES] || [];
            setAvailableCities(cities);
            // Limpiar la ciudad seleccionada si cambió el país
            setDatos(prev => ({ ...prev, birthCity: "" }));
        }
    };

    // Función para manejar la selección múltiple de intereses
    const handleInterestToggle = (interest: string) => {
        if (!isEditing) return;
        
        setDatos(prev => {
            const currentInterests = prev.interests || [];
            const isSelected = currentInterests.includes(interest);
            
            if (isSelected) {
                // Remover interés
                return {
                    ...prev,
                    interests: currentInterests.filter(i => i !== interest)
                };
            } else {
                // Agregar interés
                return {
                    ...prev,
                    interests: [...currentInterests, interest]
                };
            }
        });
    };

    // Función para manejar la selección múltiple de idiomas
    const handleLanguageToggle = (language: string) => {
        if (!isEditing) return;
        
        setDatos(prev => {
            const currentLanguages = prev.languages || [];
            const isSelected = currentLanguages.includes(language);
            
            if (isSelected) {
                // Remover idioma
                return {
                    ...prev,
                    languages: currentLanguages.filter(l => l !== language)
                };
            } else {
                // Agregar idioma
                return {
                    ...prev,
                    languages: [...currentLanguages, language]
                };
            }
        });
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setAddressSuggestions([]);
        // Extraer componentes de la dirección y actualizar campos automáticamente
        extractAddressComponents(suggestion.place_id);
    };

    // Funciones para manejar la foto del twin
    const handlePhotoClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setPhotoError('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setPhotoError('La imagen no puede ser mayor a 5MB');
            return;
        }

        setPhotoError(null);
        setIsUploadingPhoto(true);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPhotoPreview(result);
            setDatos(prev => ({ ...prev, profilePhoto: result }));
            setIsUploadingPhoto(false);
        };
        reader.onerror = () => {
            setPhotoError('Error al cargar la imagen');
            setIsUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        if (!isEditing) return;
        setPhotoPreview(null);
        setDatos(prev => ({ ...prev, profilePhoto: "" }));
        setPhotoError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            console.log('💾 Guardando datos del twin...');
            
            // Si hay una foto nueva (base64), subirla primero al Data Lake
            let photoUrl = datos.profilePhoto;
            if (photoPreview && photoPreview.startsWith('data:image/')) {
                console.log('📸 Subiendo foto nueva al Data Lake...');
                
                // Detectar extensión del archivo
                const fileExtension = photoPreview.split(';')[0].split('/')[1] || 'jpg';
                
                try {
                    const photoUploadResponse = await twinApiService.uploadTwinPhoto(
                        TWIN_ID, 
                        photoPreview, 
                        fileExtension
                    );
                    
                    if (photoUploadResponse.success && photoUploadResponse.data) {
                        photoUrl = photoUploadResponse.data.photo_url;
                        console.log('✅ Foto subida exitosamente:', photoUrl);
                    } else {
                        console.error('❌ Error al subir la foto:', photoUploadResponse.error);
                        // Continuar con el guardado de datos sin la foto
                        photoUrl = "";
                    }
                } catch (photoError) {
                    console.error('❌ Error al subir la foto:', photoError);
                    // Continuar con el guardado de datos sin la foto
                    photoUrl = "";
                }
            }
            
            // Mapear los datos del componente al formato de la API
            const updateData = {
                firstName: datos.firstName,
                lastName: datos.lastName,
                email: datos.email,
                phone: datos.phone,
                address: datos.address,
                dateOfBirth: datos.dateOfBirth,
                birthCountry: datos.birthCountry,
                birthCity: datos.birthCity,
                nationality: datos.nationality,
                gender: datos.gender,
                occupation: datos.occupation,
                // Eliminar duplicados de los arrays
                interests: [...new Set(datos.interests || [])], // Elimina duplicados
                languages: [...new Set(datos.languages || [])], // Elimina duplicados
                // Campos adicionales que agregamos al modelo
                middleName: datos.middleName,
                nickname: datos.nickname,
                city: datos.city,
                state: datos.state,
                country: datos.country,
                zipCode: datos.zipCode,
                maritalStatus: datos.maritalStatus,
                personalBio: datos.personalBio,
                // Incluir la URL de la foto (desde Data Lake o existente)
                profilePhoto: photoUrl,
                // Incluir otros campos que estén en el modelo del twin
                countryId: "MX" // Usar MX para México basado en los datos del twin
            };
            
            console.log('📤 Datos a enviar:', updateData);
            console.log('📸 Foto incluida:', datos.profilePhoto ? 'Sí' : 'No');
            
            const response = await twinApiService.updateTwin(TWIN_ID, updateData);
            
            if (response.success) {
                console.log('✅ Datos guardados exitosamente');
                setIsSaved(true);
                setIsEditing(false);
                setTimeout(() => setIsSaved(false), 3000);
                
                // También guardar en localStorage como respaldo
                localStorage.setItem('datosPersonales', JSON.stringify(datos));
            } else {
                console.error('❌ Error al guardar:', response.error);
                alert(`Error al guardar los datos: ${response.error}`);
            }
        } catch (error) {
            console.error('❌ Error al guardar datos del twin:', error);
            alert('Error al guardar los datos. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateCompleteness = () => {
        const totalFields = Object.keys(datos).length;
        const filledFields = Object.values(datos).filter(value => value && value.toString().trim() !== '').length;
        return Math.round((filledFields / totalFields) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Pantalla de carga */}
                {isLoading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600">Cargando datos del twin {TWIN_ID}...</p>
                        </div>
                    </div>
                )}

                {/* Pantalla de error */}
                {loadError && !isLoading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                                <h2 className="text-red-800 font-semibold mb-2">Error al cargar datos</h2>
                                <p className="text-red-600 mb-4">{loadError}</p>
                                <Button 
                                    onClick={loadTwinData}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                    Reintentar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido principal - solo se muestra si no hay carga ni error */}
                {!isLoading && !loadError && (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Button
                                        onClick={() => navigate("/twin-biografia")}
                                        variant="outline"
                                        size="sm"
                                        className="mr-4"
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Volver
                                    </Button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800">Datos Personales</h1>
                                        <p className="text-gray-600">Twin ID: {TWIN_ID} - Tu información personal completa</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    {/* Indicador de progreso */}
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${calculateCompleteness() > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {calculateCompleteness()}%
                                        </div>
                                        <div className="text-xs text-gray-500">Completado</div>
                                    </div>
                                    
                                    {/* Botones de acción */}
                                    {!isEditing ? (
                                        <Button onClick={() => setIsEditing(true)} className="bg-blue-600">
                                            <Edit3 size={16} className="mr-2" />
                                            Editar
                                        </Button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <Button onClick={() => setIsEditing(false)} variant="outline">
                                                Cancelar
                                            </Button>
                                            <Button onClick={handleSave} className="bg-green-600">
                                                <Save size={16} className="mr-2" />
                                                Guardar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Indicador de guardado */}
                            {isSaved && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                                    <CheckCircle size={16} className="mr-2" />
                                    Datos guardados exitosamente
                                </div>
                            )}
                        </div>

                        {/* Formulario */}
                        <div className="space-y-8">
                            {/* Foto del Perfil */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-6">
                                    <Camera className="w-5 h-5 text-indigo-600 mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-800">Foto del Perfil</h2>
                                </div>
                                
                                <div className="flex flex-col items-center space-y-4">
                                    {/* Preview de la foto */}
                                    <div className="relative">
                                        {photoPreview || datos.profilePhoto ? (
                                            <div className="relative">
                                                <img
                                                    src={photoPreview || datos.profilePhoto}
                                                    alt="Foto del perfil"
                                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                                    onError={(e) => {
                                                        console.error('❌ Error cargando imagen:', photoPreview || datos.profilePhoto);
                                                        setPhotoError('Error al cargar la imagen. Puede ser un problema temporal de conexión.');
                                                    }}
                                                    onLoad={() => {
                                                        console.log('✅ Imagen cargada correctamente:', photoPreview || datos.profilePhoto);
                                                        setPhotoError(null);
                                                    }}
                                                />
                                                {isEditing && (
                                                    <button
                                                        onClick={handleRemovePhoto}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                        title="Eliminar foto"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                                <User size={48} className="text-gray-500" />
                                            </div>
                                        )}
                                        
                                        {/* Indicador de carga */}
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Botón de upload */}
                                    {isEditing && (
                                        <div className="text-center">
                                            <button
                                                onClick={handlePhotoClick}
                                                disabled={isUploadingPhoto}
                                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors mx-auto"
                                            >
                                                <Upload size={16} />
                                                <span>
                                                    {photoPreview || datos.profilePhoto ? 'Cambiar Foto' : 'Subir Foto'}
                                                </span>
                                            </button>
                                            
                                            {/* Input file oculto */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                            
                                            <p className="text-xs text-gray-500 mt-2">
                                                JPG, PNG o WEBP. Máximo 5MB.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Botón de upload visible incluso cuando no esté editando */}
                                    {!isEditing && !photoPreview && !datos.profilePhoto && (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">
                                                📷 Activa el modo edición para subir una foto
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Error de foto */}
                                    {photoError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                            {photoError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información Básica */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-6">
                                    <User className="w-5 h-5 text-blue-600 mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-800">Información Básica</h2>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={datos.firstName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Tu nombre"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Segundo Nombre</label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={datos.middleName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Segundo nombre"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Apellido *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={datos.lastName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Tu apellido"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Apodo/Sobrenombre</label>
                                        <input
                                            type="text"
                                            name="nickname"
                                            value={datos.nickname}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="¿Cómo te dicen?"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-6">
                                    <Mail className="w-5 h-5 text-green-600 mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-800">Información de Contacto</h2>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={datos.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="ejemplo@correo.com"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Teléfono *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={datos.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="+1 234 567 8900"
                                            className="w-full border rounded px-3 py-2 border-gray-300 disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DatosPersonalesPage;
