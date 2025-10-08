import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, User, Calendar, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import twinApiService, { TwinProfileResponse } from "@/services/twinApiService";
import { useTwinId } from "@/hooks/useTwinId";

const MisTwinsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isReloading, setIsReloading] = useState(false);
    const [twins, setTwins] = useState<TwinProfileResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { twinId, loading: twinIdLoading, error: twinIdError } = useTwinId();

    // Function to load twins from the backend using real TwinId
    const loadTwins = async () => {
        if (!twinId) {
            console.error('❌ No TwinId available to load twins');
            setError('No se pudo obtener el identificador del usuario');
            setIsLoading(false);
            return;
        }

        try {
            console.log('🔄 Loading twins for TwinId:', twinId);
            const response = await twinApiService.getTwinProfilesByTwinId(twinId);
            
            console.log('📊 Raw API Response:', response);
            
            if (response.success && response.data) {
                console.log('✅ Response data:', response.data);
                console.log('📝 Response structure:', {
                    success: response.data.success,
                    totalCount: response.data.totalCount,
                    twinId: response.data.twinId,
                    message: response.data.message,
                    profilesType: typeof response.data.profiles,
                    profiles: response.data.profiles
                });
                
                // Backend returns profiles as a single object, not an array
                if (response.data.success && response.data.profiles && response.data.totalCount > 0) {
                    // We have a profile, put it in an array for the UI
                    const profile = response.data.profiles;
                    console.log('📋 Profile received:', profile);
                    console.log('📋 Setting twins array with one profile:', [profile]);
                    setTwins([profile]);
                    setError(null);
                } else if (response.data.success === false || response.data.totalCount === 0) {
                    // No profiles found or backend returned success: false
                    console.log('📭 No profiles found:', response.data.message);
                    setTwins([]);
                    setError(null); // Not an error, just no twins yet
                } else {
                    console.log('⚠️ Unexpected response structure:', response.data);
                    setTwins([]);
                    setError(null);
                }
            } else {
                setError(response.error || 'Error al cargar twins');
                setTwins([]);
            }
        } catch (error) {
            console.error('❌ Error loading twins:', error);
            setError('Error de conexión al cargar twins');
            setTwins([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load twins when twinId becomes available
    useEffect(() => {
        console.log('📋 useEffect triggered - twinId:', twinId, 'loading:', twinIdLoading, 'error:', twinIdError);
        
        if (twinIdLoading) {
            console.log('⏳ Still loading twinId...');
            return;
        }
        
        if (twinIdError) {
            console.error('❌ TwinId error:', twinIdError);
            setError(twinIdError);
            setIsLoading(false);
            return;
        }
        
        if (twinId) {
            console.log('✅ TwinId available, loading twins:', twinId);
            loadTwins();
        } else {
            console.error('❌ No twinId available');
            setError('No se pudo autenticar el usuario');
            setIsLoading(false);
        }
    }, [twinId, twinIdLoading, twinIdError]);

    const handleReload = async () => {
        setIsReloading(true);
        console.log('🔄 Manual reload triggered');
        try {
            await loadTwins();
        } finally {
            setIsReloading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Tus Twins Digitales</h2>
                        <p className="text-gray-600">Gestiona y visualiza todos tus Twins</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={handleReload}
                            disabled={isReloading}
                            variant="outline"
                            className={`flex items-center gap-2 ${isReloading ? 'cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                            {isReloading ? 'Recargando...' : 'Recargar'}
                        </Button>
                        <Button onClick={() => navigate("/crear-twin")}>
                            Crear Nuevo Twin
                        </Button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Cargando Twins...
                        </h2>
                        <p className="text-gray-600">
                            Obteniendo la lista de tus Twins digitales
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                            Error al cargar Twins
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {error}
                        </p>
                        <Button onClick={handleReload} disabled={isReloading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
                            Reintentar
                        </Button>
                    </div>
                ) : !Array.isArray(twins) || twins.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No tienes Twins aún
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Crea tu primer Twin digital para comenzar
                        </p>
                        <Button 
                            onClick={() => navigate("/crear-twin")}
                            size="lg"
                        >
                            Crear mi Primer Twin
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {twins.map((twin, index) => {
                            const uniqueKey = `${twin.twinId || twin.id || 'unknown'}-${index}`;
                            return (
                                <div 
                                    key={uniqueKey}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        console.log('🖱️ Twin clicked:', twin);
                                    }}
                                >
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="bg-blue-100 rounded-full p-3">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {twin.twinName || `${twin.firstName} ${twin.lastName}`}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Twin Digital
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {twin.email && (
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{twin.email}</span>
                                            </div>
                                        )}
                                        {twin.dateOfBirth && (
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>Nacido: {new Date(twin.dateOfBirth).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {(twin.birthCity || twin.birthCountry) && (
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{twin.birthCity}{twin.birthCity && twin.birthCountry ? ', ' : ''}{twin.birthCountry}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            Creado: {new Date(twin.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisTwinsPage;
