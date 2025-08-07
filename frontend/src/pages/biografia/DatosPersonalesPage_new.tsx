import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService, type TwinProfileResponse } from "@/services/twinApiService";
import { 
    User,
    Mail,
    Save,
    ArrowLeft,
    Loader2
} from "lucide-react";

const DatosPersonalesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [twinProfile, setTwinProfile] = useState<TwinProfileResponse | null>(null);
    
    // ID del twin que vamos a cargar y editar (usar el del usuario autenticado)
    const TWIN_ID = msalUser?.localAccountId || null;

    // Estados del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        birthCountry: '',
        birthCity: '',
        nationality: '',
        gender: '',
        occupation: '',
        personalBio: '',
        interests: [] as string[],
        languages: [] as string[]
    });

    useEffect(() => {
        // Solo cargar si tenemos un usuario autenticado
        if (!msalUser || !TWIN_ID) {
            setLoadError('Usuario no autenticado. Por favor, inicia sesión.');
            setIsLoading(false);
            return;
        }

        loadTwinData();
    }, [msalUser, TWIN_ID]);

    const loadTwinData = async () => {
        if (!TWIN_ID) {
            setLoadError('No se pudo identificar el Twin del usuario.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setLoadError(null);
        
        try {
            console.log(`🔄 Cargando datos del twin: ${TWIN_ID}`);
            // Usar getTwinByIdentifier que determina automáticamente si es UUID o nombre
            const response = await twinApiService.getTwinByIdentifier(TWIN_ID);
            
            if (response.success && response.data) {
                const twinData = response.data;
                console.log('✅ Datos del twin cargados:', twinData);
                
                setTwinProfile(twinData);
                
                // Mapear los datos del twin al formulario
                setFormData({
                    firstName: twinData.firstName || '',
                    lastName: twinData.lastName || '',
                    email: twinData.email || '',
                    phone: twinData.phone || '',
                    address: twinData.address || '',
                    dateOfBirth: twinData.dateOfBirth || '',
                    birthCountry: twinData.birthCountry || '',
                    birthCity: twinData.birthCity || '',
                    nationality: twinData.nationality || '',
                    gender: twinData.gender || '',
                    occupation: twinData.occupation || '',
                    personalBio: twinData.personalBio || '',
                    interests: twinData.interests || [],
                    languages: twinData.languages || []
                });
                
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

    const handleSave = async () => {
        if (!TWIN_ID) {
            alert('No se pudo identificar el Twin del usuario.');
            return;
        }

        setIsSaving(true);
        
        try {
            console.log('💾 Guardando datos del twin...');
            
            // Preparar datos para actualizar
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                birthCountry: formData.birthCountry,
                birthCity: formData.birthCity,
                nationality: formData.nationality,
                gender: formData.gender,
                occupation: formData.occupation,
                personalBio: formData.personalBio,
                interests: formData.interests,
                languages: formData.languages
            };
            
            console.log('📤 Datos a enviar:', updateData);

            // Usar updateTwinById que espera un UUID
            const response = await twinApiService.updateTwinById(TWIN_ID, updateData);
            
            if (response.success) {
                console.log('✅ Datos guardados exitosamente');
                setIsEditing(false);
                // Recargar los datos para asegurar sincronización
                await loadTwinData();
                alert('Datos guardados exitosamente');
            } else {
                console.error('❌ Error al guardar:', response.error);
                alert(`Error al guardar los datos: ${response.error}`);
            }
        } catch (error) {
            console.error('❌ Error al guardar datos del twin:', error);
            alert('Error al guardar los datos. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Mostrar loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                            <p className="text-gray-600">Cargando datos del perfil...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar error
    if (loadError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-4">
                                <p className="text-lg font-semibold">Error al cargar los datos</p>
                                <p className="text-sm mt-2">{loadError}</p>
                            </div>
                            <Button onClick={() => navigate('/')} className="mt-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <User className="h-8 w-8" />
                                <div>
                                    <h1 className="text-2xl font-bold">Datos Personales</h1>
                                    <p className="text-blue-100">
                                        Twin: {twinProfile?.twinName} | {twinProfile?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            {isSaving ? 'Guardando...' : 'Guardar'}
                                        </Button>
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            variant="outline"
                                            className="text-white border-white hover:bg-white hover:text-blue-600"
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-white text-blue-600 hover:bg-blue-50"
                                    >
                                        Editar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Básica */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    Información Básica
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.firstName || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.lastName || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Mail className="h-4 w-4 inline mr-1" />
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.email || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.phone || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.address || 'No especificado'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Información Personal */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    Información Personal
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Nacimiento
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">
                                            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'No especificado'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        País de Nacimiento
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.birthCountry}
                                            onChange={(e) => handleInputChange('birthCountry', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.birthCountry || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ciudad de Nacimiento
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.birthCity}
                                            onChange={(e) => handleInputChange('birthCity', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.birthCity || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nacionalidad
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.nationality}
                                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.nationality || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Género
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Otro">Otro</option>
                                            <option value="Prefiero no decir">Prefiero no decir</option>
                                        </select>
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.gender || 'No especificado'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ocupación
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.occupation}
                                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md">{formData.occupation || 'No especificado'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Biografía Personal */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                                Biografía Personal
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={formData.personalBio}
                                    onChange={(e) => handleInputChange('personalBio', e.target.value)}
                                    rows={4}
                                    placeholder="Cuéntanos sobre ti..."
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                                    {formData.personalBio || 'No hay biografía disponible'}
                                </div>
                            )}
                        </div>

                        {/* Intereses y Idiomas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                                    Intereses
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {formData.interests.length > 0 ? (
                                        formData.interests.map((interest, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No hay intereses especificados</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                                    Idiomas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {formData.languages.length > 0 ? (
                                        formData.languages.map((language, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                            >
                                                {language}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No hay idiomas especificados</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatosPersonalesPage;
