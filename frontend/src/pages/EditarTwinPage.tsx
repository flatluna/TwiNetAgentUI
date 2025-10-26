import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import twinApiService from "@/services/twinApiService";
import { useTwinId } from "@/hooks/useTwinId";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";

// Data constants
const COUNTRIES = ["Estados Unidos", "México", "España", "Argentina", "Colombia", "Chile", "Perú", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Panamá", "República Dominicana", "Cuba", "Puerto Rico"];
const NATIONALITIES = ["Estadounidense", "Mexicana", "Española", "Argentina", "Colombiana", "Chilena", "Peruana", "Venezolana", "Ecuatoriana", "Boliviana", "Paraguaya", "Uruguaya", "Costarricense", "Guatemalteca", "Hondureña", "Salvadoreña", "Nicaragüense", "Panameña", "Dominicana", "Cubana", "Puertorriqueña"];
const GENDERS = ["Masculino", "Femenino", "Otro", "Prefiero no decir"];
const OCCUPATIONS = ["Estudiante", "Profesional", "Empresario", "Jubilado", "Empleado", "Independiente", "Ama de casa", "Otro"];

const LANGUAGES = [
    "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués",
    "Mandarín", "Japonés", "Coreano", "Árabe", "Ruso", "Holandés",
    "Sueco", "Noruego", "Danés", "Finlandés", "Polaco", "Checo",
    "Húngaro", "Griego", "Turco", "Hindi", "Tailandés", "Vietnamita",
    "Hebreo", "Catalán", "Euskera", "Gallego", "Quechua", "Guaraní"
];

const INTERESTS = [
    "Lectura", "Deportes", "Música", "Cine", "Viajes", "Cocina",
    "Fotografía", "Arte", "Tecnología", "Jardinería", "Bailar",
    "Yoga", "Senderismo", "Gaming", "Escritura", "Pintura",
    "Teatro", "Historia", "Ciencia", "Filosofía", "Meditación",
    "Voluntariado", "Coleccionismo", "Artesanías", "Astronomía"
];

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
    { value: "sobrino", label: "Sobrino" },
    { value: "sobrina", label: "Sobrina" }
];

const EditarTwinPage: React.FC = () => {
    const navigate = useNavigate();
    const { twinId: familyId } = useParams<{ twinId: string }>(); // This is actually the familyId to edit
    const { twinId: currentUserTwinId, loading: twinIdLoading, error: twinIdError } = useTwinId(); // Current user's twinId
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        dateOfBirth: "",
        birthCountry: "",
        birthCity: "",
        nationality: "",
        gender: "",
        occupation: "",
        interests: [] as string[],
        languages: [] as string[],
        familyRelation: "",
        privacyLevel: "privado",
        accountManagement: "mi_cuenta",
        twinName: ""
    });

    // Load twin data on component mount
    useEffect(() => {
        const loadTwinData = async () => {
            if (!familyId) {
                setError("ID de twin no proporcionado");
                setIsLoading(false);
                return;
            }

            if (twinIdLoading) {
                console.log('⏳ Still loading current user twinId...');
                return;
            }

            if (twinIdError) {
                console.error('❌ TwinId error:', twinIdError);
                setError(twinIdError);
                setIsLoading(false);
                return;
            }

            if (!currentUserTwinId) {
                setError("No se pudo autenticar el usuario");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                // Use getFamilyById to get specific family member data
                const response = await twinApiService.getFamilyById(currentUserTwinId, familyId);
                console.log('Twin data loaded:', response);
                
                if (response.success && response.data) {
                    const twin = response.data;
                    console.log('📋 Loaded twin data:', twin);
                    
                    // Extract address components if available
                    let addressComponents = {
                        address: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: ""
                    };
                    
                    if (twin.direccionCompleta) {
                        // Parse address from direccionCompleta
                        const addressParts = twin.direccionCompleta.split(', ');
                        addressComponents.address = twin.direccionCompleta;
                        // Try to extract components from the full address
                        if (addressParts.length >= 2) {
                            addressComponents.city = addressParts[addressParts.length - 4] || "";
                            addressComponents.state = addressParts[addressParts.length - 3] || "";
                            addressComponents.zipCode = addressParts[addressParts.length - 2] || "";
                            addressComponents.country = addressParts[addressParts.length - 1] || "";
                        }
                    }
                    
                    setFormData({
                        firstName: twin.nombre || twin.firstName || "",
                        lastName: twin.apellido || twin.lastName || "",
                        email: twin.email || "",
                        phone: twin.telefono || twin.numeroCelular || twin.phoneNumber || "",
                        address: addressComponents.address,
                        city: addressComponents.city,
                        state: addressComponents.state,
                        zipCode: addressComponents.zipCode,
                        country: addressComponents.country,
                        dateOfBirth: twin.fechaNacimiento || twin.dateOfBirth || "",
                        birthCountry: twin.paisNacimiento || "",
                        birthCity: "",
                        nationality: twin.nacionalidad || "",
                        gender: twin.genero || "",
                        occupation: twin.ocupacion || "",
                        interests: twin.intereses || [], // This should now load correctly
                        languages: twin.idiomas || [], // This should now load correctly
                        familyRelation: twin.parentesco || twin.relationshipType || "",
                        privacyLevel: "privado",
                        accountManagement: "mi_cuenta",
                        twinName: twin.nombreTwin || `${twin.nombre || twin.firstName || ""} ${twin.apellido || twin.lastName || ""}`.trim()
                    });
                    
                    console.log('✅ Form data populated with:', {
                        interests: twin.intereses || [],
                        languages: twin.idiomas || [],
                        address: addressComponents.address
                    });
                } else {
                    setError(response.error || "No se pudo cargar la información del twin");
                }
            } catch (error) {
                console.error('Error loading twin data:', error);
                setError("Error al cargar los datos del twin");
            } finally {
                setIsLoading(false);
            }
        };

        loadTwinData();
    }, [familyId, currentUserTwinId, twinIdLoading, twinIdError]);

    // Auto-update twinName when firstName or lastName changes
    useEffect(() => {
        if (formData.firstName || formData.lastName) {
            const newTwinName = `${formData.firstName} ${formData.lastName}`.trim();
            if (newTwinName !== formData.twinName) {
                setFormData(prev => ({
                    ...prev,
                    twinName: newTwinName
                }));
            }
        }
    }, [formData.firstName, formData.lastName]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user starts editing
        setError(null);
        setSuccessMessage(null);
    };

    const handleInterestToggle = (interest: string) => {
        const currentInterests = formData.interests || [];
        const isSelected = currentInterests.includes(interest);
        
        const newInterests = isSelected 
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];
        
        setFormData(prev => ({
            ...prev,
            interests: newInterests
        }));
        setError(null);
        setSuccessMessage(null);
    };

    const handleLanguageToggle = (language: string) => {
        const currentLanguages = formData.languages || [];
        const isSelected = currentLanguages.includes(language);
        
        const newLanguages = isSelected 
            ? currentLanguages.filter(l => l !== language)
            : [...currentLanguages, language];
        
        setFormData(prev => ({
            ...prev,
            languages: newLanguages
        }));
        setError(null);
        setSuccessMessage(null);
    };

    const handlePlaceSelected = (placeData: {
        direccion: string;
        ciudad: string;
        estado: string;
        codigoPostal: string;
        pais: string;
        telefono?: string;
        website?: string;
        latitud?: number;
        longitud?: number;
    }) => {
        console.log('Place selected:', placeData);
        setFormData(prev => ({
            ...prev,
            address: placeData.direccion,
            city: placeData.ciudad,
            state: placeData.estado,
            zipCode: placeData.codigoPostal,
            country: placeData.pais
        }));
        setError(null);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        if (!familyId || !currentUserTwinId) {
            setError("ID de twin no válido o usuario no autenticado");
            return;
        }

        // Basic validation
        if (!formData.firstName.trim()) {
            setError("El nombre es requerido");
            return;
        }

        if (!formData.lastName.trim()) {
            setError("El apellido es requerido");
            return;
        }

        if (!formData.familyRelation.trim()) {
            setError("La relación familiar es requerida");
            return;
        }

        if (!formData.twinName.trim()) {
            setError("El nombre del Twin es requerido");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);
            
            // Create comprehensive notes with all additional information
            const addressInfo = [
                formData.address,
                formData.city,
                formData.state,
                formData.zipCode,
                formData.country
            ].filter(Boolean).join(', ');

            // Prepare the data for update using the exact FamilyData class structure from backend
            const updateData = {
                // Campos básicos existentes actualizados
                Parentesco: formData.familyRelation,
                Nombre: formData.firstName,
                Apellido: formData.lastName,
                Email: formData.email,
                Telefono: formData.phone,
                FechaNacimiento: formData.dateOfBirth,
                
                // Nuevos campos agregados del formulario
                NombreTwin: formData.twinName,
                DireccionCompleta: addressInfo,
                PaisNacimiento: formData.birthCountry,
                Nacionalidad: formData.nationality,
                Genero: formData.gender,
                Ocupacion: formData.occupation,
                Intereses: formData.interests,
                Idiomas: formData.languages,
                
                // Campos existentes mantenidos (por compatibilidad)
                NumeroCelular: formData.phone,
                
                // Legacy fields for backward compatibility (lowercase)
                parentesco: formData.familyRelation,
                nombre: formData.firstName,
                apellido: formData.lastName,
                email: formData.email,
                telefono: formData.phone,
                fechaNacimiento: formData.dateOfBirth,
                nombreTwin: formData.twinName,
                direccionCompleta: addressInfo,
                paisNacimiento: formData.birthCountry,
                nacionalidad: formData.nationality,
                genero: formData.gender,
                ocupacion: formData.occupation,
                intereses: formData.interests,
                idiomas: formData.languages,
                numeroCelular: formData.phone,
                
                // Additional legacy fields
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                phoneNumber: formData.phone,
                relationshipType: formData.familyRelation,
                address: addressInfo
            };
            
            console.log('🔍 Current form data:', formData);
            console.log('📤 Updating family member with data:', updateData);
            console.log('🎯 Using twinId:', currentUserTwinId, 'familyId:', familyId);
            
            // Use the new updateFamilyMemberWithFamilyData method for complete data structure
            const response = await twinApiService.updateFamilyMemberWithFamilyData(currentUserTwinId, familyId, updateData);
            
            if (response.success) {
                setSuccessMessage("¡Twin actualizado exitosamente!");
                
                // Redirect back to MisTwinsPage after a short delay
                setTimeout(() => {
                    navigate("/mis-twins");
                }, 2000);
            } else {
                setError(response.error || "Error al actualizar el twin");
            }
            
        } catch (error) {
            console.error('Error updating twin:', error);
            setError("Error al actualizar el twin. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/mis-twins");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Cargando datos del twin...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Mis Twins
                    </Button>
                    
                    <h1 className="text-3xl font-bold text-gray-900">Editar Twin</h1>
                    <p className="text-gray-600 mt-2">
                        Actualiza la información de tu twin digital
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-md">
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Edit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Family Relation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relación Familiar *
                            </label>
                            <select
                                value={formData.familyRelation}
                                onChange={(e) => handleInputChange("familyRelation", e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Selecciona la relación</option>
                                {FAMILY_RELATIONS.map(relation => (
                                    <option key={relation.value} value={relation.value}>
                                        {relation.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Twin Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Twin *
                            </label>
                            <Input
                                value={formData.twinName}
                                onChange={(e) => handleInputChange("twinName", e.target.value)}
                                placeholder="Ej: MamáMaria2024"
                                required
                            />
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    placeholder="Ingresa el nombre"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellido *
                                </label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    placeholder="Ingresa el apellido"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Nacimiento
                                </label>
                                <Input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Google Address Autocomplete */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección Completa *
                            </label>
                            <GoogleAddressAutocompleteModern
                                value={formData.address}
                                onChange={(value) => handleInputChange("address", value)}
                                onPlaceSelected={handlePlaceSelected}
                                placeholder="Busca y selecciona tu dirección"
                                className="w-full"
                            />
                            {formData.city && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p><strong>Ciudad:</strong> {formData.city}</p>
                                    {formData.state && <p><strong>Estado:</strong> {formData.state}</p>}
                                    {formData.zipCode && <p><strong>Código Postal:</strong> {formData.zipCode}</p>}
                                    {formData.country && <p><strong>País:</strong> {formData.country}</p>}
                                </div>
                            )}
                        </div>

                        {/* Country, Nationality, Gender, Occupation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    País de Nacimiento
                                </label>
                                <select
                                    value={formData.birthCountry}
                                    onChange={(e) => handleInputChange("birthCountry", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar país</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nacionalidad
                                </label>
                                <select
                                    value={formData.nationality}
                                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar nacionalidad</option>
                                    {NATIONALITIES.map(nationality => (
                                        <option key={nationality} value={nationality}>
                                            {nationality}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Género
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange("gender", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar género</option>
                                    {GENDERS.map(gender => (
                                        <option key={gender} value={gender}>
                                            {gender}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ocupación
                                </label>
                                <select
                                    value={formData.occupation}
                                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar ocupación</option>
                                    {OCCUPATIONS.map(occupation => (
                                        <option key={occupation} value={occupation}>
                                            {occupation}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Intereses
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {INTERESTS.map(interest => (
                                    <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.interests.includes(interest)}
                                            onChange={() => handleInterestToggle(interest)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{interest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Idiomas
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                {LANGUAGES.map(language => (
                                    <label key={language} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.languages.includes(language)}
                                            onChange={() => handleLanguageToggle(language)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{language}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !formData.firstName || !formData.lastName}
                                className="flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                            
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditarTwinPage;