import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import { twinApiService, type TwinProfileData } from "@/services/twinApiService";

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

// Relaciones familiares
const FAMILY_RELATIONS = [
    { value: "esposo", label: "Esposo" },
    { value: "esposa", label: "Esposa" },
    { value: "pareja", label: "Pareja" },
    { value: "padre", label: "Padre" },
    { value: "madre", label: "Madre" },
    { value: "hijo", label: "Hijo" },
    { value: "hija", label: "Hija" },
    { value: "hermano", label: "Hermano" },
    { value: "hermana", label: "Hermana" },
    { value: "abuelo", label: "Abuelo" },
    { value: "abuela", label: "Abuela" },
    { value: "nieto", label: "Nieto" },
    { value: "nieta", label: "Nieta" },
    { value: "tio", label: "Tío" },
    { value: "tia", label: "Tía" },
    { value: "primo", label: "Primo" },
    { value: "prima", label: "Prima" },
    { value: "otro", label: "Otro familiar" }
];

// Niveles de privacidad
const PRIVACY_LEVELS = [
    { value: "familiar", label: "Familiar", description: "Toda la familia puede ver este Twin" },
    { value: "privado", label: "Solo yo", description: "Solo tú puedes ver este Twin" },
    { value: "especifico", label: "Específico", description: "Solo personas específicas pueden ver este Twin" }
];

// Tipos de gestión de cuenta
const ACCOUNT_MANAGEMENT = [
    { value: "mi_cuenta", label: "Usar mi cuenta", description: "Este Twin será gestionado desde tu cuenta" },
    { value: "cuenta_propia", label: "Tiene cuenta propia", description: "Esta persona tiene su propia cuenta TwinAgent" },
    { value: "sin_cuenta", label: "Sin cuenta", description: "Esta persona no tiene cuenta (ideal para niños)" }
];

interface TwinProfile {
    id: string;
    
    // Datos principales del Twin Familiar
    twinName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    countryId: string;
    
    // Configuración familiar
    familyRelation: string;
    privacyLevel: string;
    accountManagement: string;
    specificViewers?: string[]; // emails de personas específicas
    
    // Datos personales
    dateOfBirth: string;
    birthCountry: string;
    birthCity: string;
    nationality: string;
    gender: string;
    occupation: string;
    
    // Preferencias
    interests: string[];
    languages: string[];
    
    // Configuración de cuenta asociada
    existingAccountEmail?: string; // email de cuenta existente
}

const TwinHomePage: React.FC = () => {
    const navigate = useNavigate();
    
    // Debug: Verificar que los datos están cargados
    console.log("🏁 COUNTRIES_CITIES:", COUNTRIES_CITIES);
    console.log("🌍 COUNTRIES:", COUNTRIES);
    
    const [profile, setProfile] = useState<TwinProfile>({
        id: "",
        twinName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        countryId: "",
        familyRelation: "", // Relación familiar requerida
        privacyLevel: "privado", // Default to private
        accountManagement: "mi_cuenta", // Default to my account
        dateOfBirth: "",
        birthCountry: "",
        birthCity: "",
        nationality: "",
        gender: "",
        occupation: "",
        interests: [],
        languages: []
    });
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isCreatingTwin, setIsCreatingTwin] = useState(false);
    const [errors, setErrors] = useState<Partial<TwinProfile>>({});
    
    // Estados adicionales para la gestión familiar
    const [specificViewerEmails, setSpecificViewerEmails] = useState<string[]>([]);
    const [newViewerEmail, setNewViewerEmail] = useState("");
    
    const autocompleteServiceRef = useRef<any>(null);
    const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "YOUR_API_KEY_HERE";

    useEffect(() => {
        GoogleMapsLoader.getInstance({ apiKey, libraries: ["places"] }).load().then(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
                autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            }
        });
    }, [apiKey]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name as keyof TwinProfile]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        
        if (name === "address") {
            fetchAddressSuggestions(value);
        }
        
        // Actualizar ciudades disponibles cuando cambie el país de nacimiento
        if (name === "birthCountry") {
            const cities = COUNTRIES_CITIES[value as keyof typeof COUNTRIES_CITIES] || [];
            setAvailableCities(cities);
            // Limpiar la ciudad seleccionada si cambió el país
            setProfile(prev => ({ ...prev, birthCity: "" }));
        }
    };

    // Función para manejar la selección múltiple de intereses
    const handleInterestToggle = (interest: string) => {
        const currentInterests = profile.interests || [];
        const isSelected = currentInterests.includes(interest);
        
        if (isSelected) {
            // Remover interés
            setProfile(prev => ({
                ...prev,
                interests: currentInterests.filter(i => i !== interest)
            }));
        } else {
            // Agregar interés
            setProfile(prev => ({
                ...prev,
                interests: [...currentInterests, interest]
            }));
        }
    };

    // Función para manejar la selección múltiple de idiomas
    const handleLanguageToggle = (language: string) => {
        const currentLanguages = profile.languages || [];
        const isSelected = currentLanguages.includes(language);
        
        if (isSelected) {
            // Remover idioma
            setProfile(prev => ({
                ...prev,
                languages: currentLanguages.filter(l => l !== language)
            }));
        } else {
            // Agregar idioma
            setProfile(prev => ({
                ...prev,
                languages: [...currentLanguages, language]
            }));
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setProfile(prev => ({ ...prev, address: suggestion.description }));
        setAddressSuggestions([]);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<TwinProfile> = {};

        // Validar nombre del Twin (obligatorio)
        if (!profile.twinName.trim()) {
            newErrors.twinName = "El nombre de tu Twin es obligatorio";
        } else if (profile.twinName.trim().length < 3) {
            newErrors.twinName = "El nombre de tu Twin debe tener al menos 3 caracteres";
        } else if (!/^[a-zA-Z0-9_-]+$/.test(profile.twinName.trim())) {
            newErrors.twinName = "El nombre de tu Twin solo puede contener letras, números, guiones y guiones bajos";
        }

        // Validar nombre
        if (!profile.firstName.trim()) {
            newErrors.firstName = "El nombre es obligatorio";
        }

        // Validar apellido
        if (!profile.lastName.trim()) {
            newErrors.lastName = "El apellido es obligatorio";
        }

        // Validar email
        if (!profile.email.trim()) {
            newErrors.email = "El email es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
            newErrors.email = "El formato del email no es válido";
        }

        // Validar teléfono
        if (!profile.phone.trim()) {
            newErrors.phone = "El teléfono es obligatorio";
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(profile.phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = "El formato del teléfono no es válido";
        }

        // Validar dirección
        if (!profile.address.trim()) {
            newErrors.address = "La dirección es obligatoria";
        }

        // Validar fecha de nacimiento
        if (!profile.dateOfBirth) {
            newErrors.dateOfBirth = "La fecha de nacimiento es obligatoria";
        } else {
            const birthDate = new Date(profile.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13 || age > 120) {
                newErrors.dateOfBirth = "La edad debe estar entre 13 y 120 años";
            }
        }

        // Validar país de nacimiento
        if (!profile.birthCountry) {
            newErrors.birthCountry = "El país de nacimiento es obligatorio";
        }

        // Validar ciudad de nacimiento
        if (!profile.birthCity) {
            newErrors.birthCity = "La ciudad de nacimiento es obligatoria";
        }

        // Validar nacionalidad
        if (!profile.nationality) {
            newErrors.nationality = "La nacionalidad es obligatoria";
        }

        // Validar género
        if (!profile.gender) {
            newErrors.gender = "El género es obligatorio";
        }

        // Validar ocupación
        if (!profile.occupation.trim()) {
            newErrors.occupation = "La ocupación es obligatoria";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateTwin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsCreatingTwin(true);

        try {
            // Prepare twin data for API
            const twinData: TwinProfileData = {
                twinName: profile.twinName,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                dateOfBirth: profile.dateOfBirth,
                birthCountry: profile.birthCountry,
                birthCity: profile.birthCity,
                nationality: profile.nationality,
                gender: profile.gender,
                occupation: profile.occupation,
                interests: profile.interests,
                languages: profile.languages,
                countryId: profile.countryId || 'ES' // Default to Spain if not set
            };
            
            console.log("🚀 Creating twin with data:", twinData);
            
            // Call API to create twin
            const response = await twinApiService.createTwin(twinData);
            
            if (response.success && response.data) {
                console.log("✅ Twin created successfully:", response.data);
                alert(`¡Twin creado exitosamente! 
                
Nombre: ${response.data.firstName} ${response.data.lastName}
Email: ${response.data.email}
ID: ${response.data.id}
                
Redirigiendo a la página principal...`);
                
                // Navigate back to home after successful creation
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } else {
                console.error("❌ Error creating twin:", response.error);
                alert(`Error al crear el Twin: ${response.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("❌ Unexpected error:", error);
            alert(`Error inesperado al crear el Twin: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsCreatingTwin(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-foreground heading-clear-dark mb-2">Crear Twin Familiar</h1>
                    <p className="text-muted-foreground text-clear-dark">Completa la información para crear el Twin digital de tu familiar</p>
                </div>

                {/* Formulario principal sin modal */}
                <div className="bg-card rounded-lg shadow-lg p-8 border">
                    <div className="space-y-4">
                        {/* Relación Familiar - Primer campo */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-purple-700">
                                <strong>Relación Familiar *</strong>
                            </label>
                            <select
                                name="familyRelation"
                                value={profile.familyRelation}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.familyRelation ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Selecciona la relación</option>
                                {FAMILY_RELATIONS.map(relation => (
                                    <option key={relation.value} value={relation.value}>
                                        {relation.label}
                                    </option>
                                ))}
                            </select>
                            {errors.familyRelation && <p className="text-red-500 text-xs mt-1">{errors.familyRelation}</p>}
                            <p className="text-muted-foreground text-clear-dark text-xs mt-1">
                                ¿Cuál es su relación contigo?
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-purple-700">
                                <strong>Nombre de tu Twin *</strong>
                            </label>
                            <input
                                type="text"
                                name="twinName"
                                value={profile.twinName}
                                onChange={handleChange}
                                placeholder="Elige un nombre único para el Twin (ej: MamáMaria2024)"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.twinName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.twinName && <p className="text-red-500 text-xs mt-1">{errors.twinName}</p>}
                            <p className="text-muted-foreground text-clear-dark text-xs mt-1">Este será su identificador único. Solo letras, números, guiones y guiones bajos.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre</label>
                            <input
                                type="text"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                placeholder="Ingresa el nombre"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.firstName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Apellido</label>
                            <input
                                type="text"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                placeholder="Ingresa el apellido"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.lastName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>

                        {/* Configuración de Gestión de Cuenta */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-purple-700">
                                <strong>Gestión de Cuenta *</strong>
                            </label>
                            <select
                                name="accountManagement"
                                value={profile.accountManagement}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            >
                                {ACCOUNT_MANAGEMENT.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} - {option.description}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground text-clear-dark text-xs mt-1">
                                ¿Cómo se gestionará este Twin?
                            </p>
                        </div>

                        {profile.accountManagement === "cuenta_propia" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email de la Cuenta Existente
                                </label>
                                <input
                                    type="email"
                                    name="existingAccountEmail"
                                    value={profile.existingAccountEmail || ""}
                                    onChange={handleChange}
                                    placeholder="Ingresa el email de su cuenta TwinAgent"
                                    className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                                />
                                <p className="text-muted-foreground text-clear-dark text-xs mt-1">
                                    Email de la cuenta TwinAgent de esta persona
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                placeholder="ejemplo@correo.com"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.email ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.phone ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        {/* Configuración de Privacidad - Solo para Twins familiares y de patrimonio */}
                        {(profile.twinType === "familia" || profile.twinType === "patrimonio") && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-700 mb-3">Configuración de Privacidad</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-purple-700">
                                        <strong>Nivel de Privacidad *</strong>
                                    </label>
                                    <select
                                        name="privacyLevel"
                                        value={profile.privacyLevel}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                                    >
                                        {PRIVACY_LEVELS.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label} - {level.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {profile.privacyLevel === "especifico" && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium mb-1">
                                            Personas con Acceso
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={newViewerEmail}
                                                    onChange={(e) => setNewViewerEmail(e.target.value)}
                                                    placeholder="Email de la persona"
                                                    className="flex-1 border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newViewerEmail && !specificViewerEmails.includes(newViewerEmail)) {
                                                            setSpecificViewerEmails([...specificViewerEmails, newViewerEmail]);
                                                            setProfile(prev => ({ 
                                                                ...prev, 
                                                                specificViewers: [...(prev.specificViewers || []), newViewerEmail] 
                                                            }));
                                                            setNewViewerEmail("");
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                            
                                            {specificViewerEmails.length > 0 && (
                                                <div className="space-y-1">
                                                    {specificViewerEmails.map((email, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-purple-100 px-3 py-2 rounded">
                                                            <span className="text-sm">{email}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedEmails = specificViewerEmails.filter((_, i) => i !== index);
                                                                    setSpecificViewerEmails(updatedEmails);
                                                                    setProfile(prev => ({ 
                                                                        ...prev, 
                                                                        specificViewers: updatedEmails 
                                                                    }));
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">Dirección</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="Ingresa tu dirección"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.address ? 'border-red-500' : 'border-border'}`}
                                autoComplete="off"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            {addressLoading && (
                                <div className="absolute left-0 right-0 bg-card border-t border-border px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
                            )}
                            {addressSuggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 bg-card border border-border rounded shadow-lg z-10 mt-1">
                                    {addressSuggestions.map(suggestion => (
                                        <li
                                            key={suggestion.place_id}
                                            className="px-3 py-2 cursor-pointer hover:bg-muted text-sm text-foreground text-clear-dark"
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                        >
                                            {suggestion.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Datos Personales */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profile.dateOfBirth}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.dateOfBirth ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                        </div>
                        {/* DEBUG: País de Nacimiento */}
                        <div>
                            <label className="block text-sm font-medium mb-1">🌍 País de Nacimiento *</label>
                            <select
                                name="birthCountry"
                                value={profile.birthCountry}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark dark:text-white dark:bg-gray-800 ${errors.birthCountry ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Selecciona país de nacimiento</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                            {errors.birthCountry && <p className="text-red-500 text-xs mt-1">{errors.birthCountry}</p>}
                            <p className="text-xs text-blue-500 mt-1">DEBUG: Países disponibles: {COUNTRIES.length}</p>
                        </div>
                        {/* DEBUG: Ciudad de Nacimiento */}
                        <div>
                            <label className="block text-sm font-medium mb-1">🏙️ Ciudad de Nacimiento *</label>
                            <select
                                name="birthCity"
                                value={profile.birthCity}
                                onChange={handleChange}
                                disabled={!profile.birthCountry}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark dark:text-white dark:bg-gray-800 ${errors.birthCity ? 'border-red-500' : 'border-border'} ${!profile.birthCountry ? 'bg-muted cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {profile.birthCountry ? 'Selecciona ciudad de nacimiento' : 'Primero selecciona un país'}
                                </option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {errors.birthCity && <p className="text-red-500 text-xs mt-1">{errors.birthCity}</p>}
                            <p className="text-xs text-green-500 mt-1">DEBUG: Ciudades disponibles: {availableCities.length} | País seleccionado: {profile.birthCountry}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">🇺🇳 Nacionalidad</label>
                            <select
                                name="nationality"
                                value={profile.nationality}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark dark:text-white dark:bg-gray-800 ${errors.nationality ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Selecciona nacionalidad</option>
                                {NATIONALITIES.map(nationality => (
                                    <option key={nationality} value={nationality}>{nationality}</option>
                                ))}
                            </select>
                            {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Género</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark dark:text-white dark:bg-gray-800 ${errors.gender ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Selecciona género</option>
                                <option value="masculino">Masculino</option>
                                <option value="femenino">Femenino</option>
                                <option value="no-binario">No binario</option>
                                <option value="prefiero-no-decir">Prefiero no decir</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3">🎯 Intereses y Hobbies</label>
                            <div className="border rounded px-3 py-3 bg-gray-50 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {INTERESTS.map(interest => (
                                        <label key={interest} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={(profile.interests || []).includes(interest)}
                                                onChange={() => handleInterestToggle(interest)}
                                                className="rounded border-border text-blue-600 focus:ring-blue-500 dark:text-blue-400"
                                            />
                                            <span className="text-sm text-foreground text-clear-dark">{interest}</span>
                                        </label>
                                    ))}
                                </div>
                                {(profile.interests || []).length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-muted-foreground text-clear-dark">Seleccionados ({(profile.interests || []).length}):</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {(profile.interests || []).map(interest => (
                                                <span key={interest} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">💼 Ocupación</label>
                            <select
                                name="occupation"
                                value={profile.occupation}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark dark:text-white dark:bg-gray-800 ${errors.occupation ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Selecciona ocupación</option>
                                {OCCUPATIONS.map(occupation => (
                                    <option key={occupation} value={occupation}>{occupation}</option>
                                ))}
                            </select>
                            {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3">🌐 Idiomas</label>
                            <div className="border rounded px-3 py-3 bg-gray-50 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {LANGUAGES.map(language => (
                                        <label key={language} className="flex items-center space-x-2 cursor-pointer hover:bg-green-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={(profile.languages || []).includes(language)}
                                                onChange={() => handleLanguageToggle(language)}
                                                className="rounded border-border text-green-600 focus:ring-green-500 dark:text-green-400"
                                            />
                                            <span className="text-sm text-foreground text-clear-dark">{language}</span>
                                        </label>
                                    ))}
                                </div>
                                {(profile.languages || []).length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-muted-foreground text-clear-dark">Idiomas seleccionados ({(profile.languages || []).length}):</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {(profile.languages || []).map(language => (
                                                <span key={language} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    {language}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                            </>
                        )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-end mt-8 space-x-4">
                        <Button 
                            onClick={() => navigate("/")} 
                            variant="outline"
                            size="lg"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleCreateTwin}
                            size="lg"
                            disabled={isCreatingTwin}
                        >
                            {isCreatingTwin ? "Creando Twin..." : "Crear Twin"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinHomePage;
