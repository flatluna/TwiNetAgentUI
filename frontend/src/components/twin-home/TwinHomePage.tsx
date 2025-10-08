import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import { twinApiService, type TwinProfileData } from "@/services/twinApiService";

// Datos básicos (simulados mientras encontramos los archivos correctos)
const COUNTRIES = ["Estados Unidos", "México", "España", "Argentina", "Colombia", "Chile", "Perú", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Panamá", "República Dominicana", "Cuba", "Puerto Rico"];
const NATIONALITIES = ["Estadounidense", "Mexicana", "Española", "Argentina", "Colombiana", "Chilena", "Peruana", "Venezolana", "Ecuatoriana", "Boliviana", "Paraguaya", "Uruguaya", "Costarricense", "Guatemalteca", "Hondureña", "Salvadoreña", "Nicaragüense", "Panameña", "Dominicana", "Cubana", "Puertorriqueña"];
const GENDERS = ["Masculino", "Femenino", "Otro", "Prefiero no decir"];
const OCCUPATIONS = ["Estudiante", "Profesional", "Empresario", "Jubilado", "Empleado", "Independiente", "Ama de casa", "Otro"];
const COUNTRIES_CITIES: Record<string, string[]> = {
    "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
    "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza"],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"]
};

// Lista de idiomas
const LANGUAGES = [
    "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués",
    "Mandarín", "Japonés", "Coreano", "Árabe", "Ruso", "Holandés",
    "Sueco", "Noruego", "Danés", "Finlandés", "Polaco", "Checo",
    "Húngaro", "Griego", "Turco", "Hindi", "Tailandés", "Vietnamita",
    "Hebreo", "Catalán", "Euskera", "Gallego", "Quechua", "Guaraní"
];

// Lista de intereses/hobbies comunes
const INTERESTS = [
    "Lectura", "Deportes", "Música", "Cine", "Viajes", "Cocina",
    "Fotografía", "Arte", "Tecnología", "Jardinería", "Bailar",
    "Yoga", "Senderismo", "Gaming", "Escritura", "Pintura",
    "Teatro", "Historia", "Ciencia", "Filosofía", "Meditación",
    "Voluntariado", "Coleccionismo", "Artesanías", "Astronomía"
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
    { value: "privado", label: "Solo yo", description: "Solo tú puedes ver este Twin" },
    { value: "familiar", label: "Familiar", description: "Toda la familia puede ver este Twin" },
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
    twinName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    countryId: string;
    familyRelation: string;
    privacyLevel: string;
    accountManagement: string;
    specificViewers?: string[];
    dateOfBirth: string;
    birthCountry: string;
    birthCity: string;
    nationality: string;
    gender: string;
    occupation: string;
    interests: string[];
    languages: string[];
    existingAccountEmail?: string;
}

const TwinHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    // Función para obtener el Twin ID del usuario actual
    const getTwinId = (): string | null => {
        try {
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                return account.localAccountId; // Usar el ID de la cuenta de MSAL
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting Twin ID:', error);
            return null;
        }
    };
    
    const [profile, setProfile] = useState<TwinProfile>({
        id: "",
        twinName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        countryId: "",
        familyRelation: "",
        privacyLevel: "privado",
        accountManagement: "mi_cuenta",
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        
        if (errors[name as keyof TwinProfile]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        
        if (name === "birthCountry") {
            const cities = COUNTRIES_CITIES[value as keyof typeof COUNTRIES_CITIES] || [];
            setAvailableCities(cities);
            setProfile(prev => ({ ...prev, birthCity: "" }));
        }
    };

    const handleInterestToggle = (interest: string) => {
        const currentInterests = profile.interests || [];
        const isSelected = currentInterests.includes(interest);
        
        const newInterests = isSelected 
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];
        
        setProfile(prev => ({ ...prev, interests: newInterests }));
    };

    const handleLanguageToggle = (language: string) => {
        const currentLanguages = profile.languages || [];
        const isSelected = currentLanguages.includes(language);
        
        const newLanguages = isSelected 
            ? currentLanguages.filter(l => l !== language)
            : [...currentLanguages, language];
        
        setProfile(prev => ({ ...prev, languages: newLanguages }));
    };

    const validateForm = () => {
        const newErrors: Partial<TwinProfile> = {};

        if (!profile.twinName?.trim()) newErrors.twinName = "El nombre del Twin es requerido";
        if (!profile.firstName?.trim()) newErrors.firstName = "El nombre es requerido";
        if (!profile.lastName?.trim()) newErrors.lastName = "El apellido es requerido";
        if (!profile.familyRelation?.trim()) newErrors.familyRelation = "La relación familiar es requerida";
        if (!profile.email?.trim()) newErrors.email = "El email es requerido";
        if (!profile.address?.trim()) newErrors.address = "La dirección es requerida";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsCreatingTwin(true);
        try {
            // Obtener el Twin ID del usuario actual
            const currentTwinId = getTwinId();
            if (!currentTwinId) {
                alert('Error: No se pudo identificar el usuario actual.');
                return;
            }

            const twinData: TwinProfileData = {
                twinId: currentTwinId, // Incluir el twinId en los datos
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
                countryId: profile.countryId
            };

            console.log('� Creating twin profile with data:', twinData);

            const result = await twinApiService.createTwin(twinData);
            if (result.success) {
                console.log('✅ Twin familiar creado exitosamente:', result.data);
                navigate("/mis-twins");
            } else {
                console.error('❌ Error creando Twin familiar:', result.error);
                alert('Error creando el Twin familiar. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('❌ Error inesperado:', error);
            alert('Error inesperado. Por favor intenta de nuevo.');
        } finally {
            setIsCreatingTwin(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-foreground heading-clear-dark mb-2">
                        Crear Twin Familiar
                    </h1>
                    <p className="text-muted-foreground text-clear-dark">
                        Completa la información para crear el Twin digital de tu familiar
                    </p>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-8 border">
                    <div className="space-y-4">
                        {/* Relación Familiar */}
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
                        </div>

                        {/* Nombre del Twin */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-purple-700">
                                <strong>Nombre del Twin *</strong>
                            </label>
                            <input
                                type="text"
                                name="twinName"
                                value={profile.twinName}
                                onChange={handleChange}
                                placeholder="Ej: MamáMaria2024"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.twinName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.twinName && <p className="text-red-500 text-xs mt-1">{errors.twinName}</p>}
                        </div>

                        {/* Gestión de Cuenta */}
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
                                    placeholder="Email de su cuenta TwinAgent"
                                    className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                                />
                            </div>
                        )}

                        {/* Configuración de Privacidad */}
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
                                                        specificViewers: [...specificViewerEmails, newViewerEmail] 
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
                                        <div className="mt-2 space-y-1">
                                            {specificViewerEmails.map((email, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                                                    <span className="text-sm">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newEmails = specificViewerEmails.filter((_, i) => i !== index);
                                                            setSpecificViewerEmails(newEmails);
                                                            setProfile(prev => ({ ...prev, specificViewers: newEmails }));
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Datos Personales */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                placeholder="Nombre"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.firstName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Apellido *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                placeholder="Apellido"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.lastName ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
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
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Dirección *</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="Dirección completa"
                                className={`w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark ${errors.address ? 'border-red-500' : 'border-border'}`}
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profile.dateOfBirth}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">País de Nacimiento</label>
                            <select
                                name="birthCountry"
                                value={profile.birthCountry}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            >
                                <option value="">Seleccionar país</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {availableCities.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Ciudad de Nacimiento</label>
                                <select
                                    name="birthCity"
                                    value={profile.birthCity}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                                >
                                    <option value="">Seleccionar ciudad</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Nacionalidad</label>
                            <select
                                name="nationality"
                                value={profile.nationality}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            >
                                <option value="">Seleccionar nacionalidad</option>
                                {NATIONALITIES.map(nationality => (
                                    <option key={nationality} value={nationality}>{nationality}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Género</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            >
                                <option value="">Seleccionar género</option>
                                {GENDERS.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ocupación</label>
                            <select
                                name="occupation"
                                value={profile.occupation}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-background text-foreground text-clear-dark border-border"
                            >
                                <option value="">Seleccionar ocupación</option>
                                {OCCUPATIONS.map(occupation => (
                                    <option key={occupation} value={occupation}>{occupation}</option>
                                ))}
                            </select>
                        </div>

                        {/* Intereses */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Intereses</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {INTERESTS.map(interest => (
                                    <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={profile.interests.includes(interest)}
                                            onChange={() => handleInterestToggle(interest)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{interest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Idiomas */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Idiomas</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {LANGUAGES.map(language => (
                                    <label key={language} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={profile.languages.includes(language)}
                                            onChange={() => handleLanguageToggle(language)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{language}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end mt-8 space-x-4">
                        <Button 
                            onClick={() => navigate("/")} 
                            variant="outline"
                            size="lg"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={isCreatingTwin}
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isCreatingTwin ? "Creando Twin..." : "Crear Twin Familiar"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinHomePage;
