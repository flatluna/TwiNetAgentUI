import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, Calendar, Users } from 'lucide-react';
import TwinPhotosAgent from '@/components/TwinPhotosAgent';
import { useTwinId } from '@/hooks/useTwinId';
import twinApiService, { ImageAI } from '@/services/twinApiService';

const TwinFotosAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const { twinId, loading: twinIdLoading } = useTwinId();
    const [photos, setPhotos] = useState<ImageAI[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar fotos para mostrar estadísticas
    const loadPhotosStats = async () => {
        if (!twinId || twinIdLoading) {
            return;
        }

        try {
            setLoading(true);
            const response = await twinApiService.getFamilyPhotosWithAI(twinId);
            
            if (response.success && response.data?.photos) {
                setPhotos(response.data.photos);
            } else {
                setPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error loading photos stats:', error);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!twinIdLoading && twinId) {
            loadPhotosStats();
        }
    }, [twinId, twinIdLoading]);

    // Calcular estadísticas
    const totalPhotos = photos.length;
    const photosWithCategory = photos.filter(photo => (photo as any).category).length;
    const currentYear = new Date().getFullYear();
    const photosThisYear = photos.filter(photo => {
        if (!photo.fecha) return false;
        try {
            const photoYear = new Date(photo.fecha).getFullYear();
            return photoYear === currentYear;
        } catch {
            return false;
        }
    }).length;

    const uniqueYears = new Set(photos.map(photo => {
        if (!photo.fecha) return null;
        try {
            return new Date(photo.fecha).getFullYear();
        } catch {
            return null;
        }
    }).filter(year => year !== null)).size;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => navigate('/fotos-familiares')}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver a Galería</span>
                            </Button>
                            
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Camera className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        Twin Fotos Familiares - Agente IA
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Pregunta sobre tus fotos usando inteligencia artificial
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Estadísticas e Instrucciones - Lateral */}
                    <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
                        {/* Estadísticas de fotos */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                                📊 Estadísticas
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                    <div className="p-1 bg-blue-100 rounded-full">
                                        <Image className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-blue-900">
                                            {loading ? '...' : totalPhotos}
                                        </div>
                                        <div className="text-xs text-blue-700">Fotos Totales</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                    <div className="p-1 bg-green-100 rounded-full">
                                        <Calendar className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-green-900">
                                            {loading ? '...' : photosThisYear}
                                        </div>
                                        <div className="text-xs text-green-700">Este Año</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                                    <div className="p-1 bg-purple-100 rounded-full">
                                        <Users className="w-3 h-3 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-purple-900">
                                            {loading ? '...' : uniqueYears}
                                        </div>
                                        <div className="text-xs text-purple-700">Años Diferentes</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                                    <div className="p-1 bg-orange-100 rounded-full">
                                        <Camera className="w-3 h-3 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-orange-900">
                                            {loading ? '...' : photosWithCategory}
                                        </div>
                                        <div className="text-xs text-orange-700">Con Categoría</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instrucciones de uso */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 sticky top-4">
                            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                                💡 Cómo usar el Agente
                            </h3>
                            <div className="space-y-3 text-xs text-gray-700">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">🔍 Ejemplos de búsquedas:</h4>
                                    <ul className="space-y-1 list-disc list-inside pl-2">
                                        <li>"Fotos de vacaciones en la playa"</li>
                                        <li>"Imágenes de cumpleaños de 2023"</li>
                                        <li>"Fotos familiares en casa"</li>
                                        <li>"Viajes a Alaska"</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">🤖 El agente puede:</h4>
                                    <ul className="space-y-1 list-disc list-inside pl-2">
                                        <li>Buscar fotos por contenido</li>
                                        <li>Encontrar por fecha y ubicación</li>
                                        <li>Identificar personas y objetos</li>
                                        <li>Responder sobre recuerdos</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agente de IA - Ocupa 3/4 del ancho y más altura */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[800px]">
                            <TwinPhotosAgent
                                onPhotoClick={(photo) => {
                                    console.log('Foto seleccionada desde agente:', photo);
                                    // Opcional: Navegar de vuelta a galería con foto seleccionada
                                    // navigate('/fotos-familiares', { state: { selectedPhoto: photo } });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinFotosAgentPage;