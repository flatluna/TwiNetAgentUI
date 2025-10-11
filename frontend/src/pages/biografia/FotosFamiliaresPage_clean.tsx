import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Tag, Upload, Camera, Search, Filter, Trash2, Edit3, Download, Loader2, FileText, X, RefreshCw, Bot, ChevronDown, Eye, EyeOff, Palette, Clock, User } from 'lucide-react';
import twinApiService, { ImageAI } from '@/services/twinApiService';
import TwinPhotosAgent from '@/components/TwinPhotosAgent';

interface FormData {
    description: string;
    date_taken: string;
    location: string;
    people_in_photo: string;
    category: string;
    tags: string;
    event_type: string;
}

const FotosFamiliaresPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados principales
    const [photos, setPhotos] = useState<ImageAI[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        description: '',
        date_taken: '',
        location: '',
        people_in_photo: '',
        category: 'familia',
        tags: '',
        event_type: 'general'
    });

    // Estados de filtros
    const [selectedYear, setSelectedYear] = useState<string>('todos');
    const [selectedMonth, setSelectedMonth] = useState<string>('todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('todas');

    // Estados de UI
    const [selectedAiPhoto, setSelectedAiPhoto] = useState<ImageAI | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
    const [showAiProcessingModal, setShowAiProcessingModal] = useState(false);
    const [aiProcessingProgress, setAiProcessingProgress] = useState(0);
    const [aiProcessingStep, setAiProcessingStep] = useState('Preparando análisis...');

    // Twin ID
    const twinId = accounts[0]?.homeAccountId || 'twin-default';

    // Función para extraer año de una fecha
    const getPhotoYear = (dateString: string): string => {
        if (!dateString || dateString === 'Invalid Date') return 'sin fecha';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'sin fecha';
            return date.getFullYear().toString();
        } catch (error) {
            return 'sin fecha';
        }
    };

    // Función para extraer mes de una fecha
    const getPhotoMonth = (dateString: string): string => {
        if (!dateString || dateString === 'Invalid Date') return 'sin fecha';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'sin fecha';
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            return monthNames[date.getMonth()];
        } catch (error) {
            return 'sin fecha';
        }
    };

    // Filtrar fotos
    const filteredPhotos = photos.filter(photo => {
        if (!photo) return false;
        
        try {
            const yearMatch = selectedYear === 'todos' || getPhotoYear(photo.date_taken) === selectedYear;
            const monthMatch = selectedMonth === 'todos' || getPhotoMonth(photo.date_taken) === selectedMonth;
            const categoryMatch = selectedCategory === 'todas' || photo.category === selectedCategory;
            const searchMatch = searchQuery === '' || 
                photo.descripcionGenerica?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                photo.peopleInPhoto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                photo.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                photo.location?.toLowerCase().includes(searchQuery.toLowerCase());

            return yearMatch && monthMatch && categoryMatch && searchMatch;
        } catch (error) {
            console.error('Error filtering photo:', photo, error);
            return false;
        }
    });

    // Cargar fotos
    const loadPhotos = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading family photos for twin:', twinId);
            
            const response = await twinApiService.getFamilyPhotosWithAI(twinId);
            
            if (response.success && response.data?.photos) {
                console.log('✅ Loaded photos:', response.data.photos.length);
                setPhotos(response.data.photos);
            } else {
                console.error('❌ Error loading photos:', response.message);
                setPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error loading photos:', error);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar fotos
    useEffect(() => {
        loadPhotos();
    }, [twinId]);

    // Obtener años únicos
    const getUniqueYears = (): string[] => {
        const years = new Set(photos.map(photo => getPhotoYear(photo.date_taken)));
        return Array.from(years).sort().reverse();
    };

    // Obtener meses únicos para el año seleccionado
    const getUniqueMonths = (): string[] => {
        let photosToCheck = photos;
        if (selectedYear !== 'todos') {
            photosToCheck = photos.filter(photo => getPhotoYear(photo.date_taken) === selectedYear);
        }
        
        const months = new Set(photosToCheck.map(photo => getPhotoMonth(photo.date_taken)));
        const monthOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        return Array.from(months).sort((a, b) => {
            const indexA = monthOrder.indexOf(a);
            const indexB = monthOrder.indexOf(b);
            return indexA - indexB;
        });
    };

    // Simular progreso de IA
    const simulateAiProgress = async () => {
        setShowAiProcessingModal(true);
        setAiProcessingProgress(0);
        
        const steps = [
            'Preparando análisis...',
            'Detectando objetos y personas...',
            'Analizando colores y composición...',
            'Identificando emociones...',
            'Generando descripción...',
            'Creando etiquetas...',
            'Finalizando proceso...'
        ];

        for (let i = 0; i < steps.length; i++) {
            setAiProcessingStep(steps[i]);
            const progress = Math.floor((i + 1) / steps.length * 100);
            setAiProcessingProgress(progress);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        setTimeout(() => {
            setShowAiProcessingModal(false);
            setAiProcessingProgress(0);
        }, 1000);
    };

    // Manejar subida de archivo
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                setShowUploadModal(true);
            } else {
                alert('Por favor selecciona un archivo de imagen válido.');
            }
        }
    };

    // Subir foto
    const handlePhotoUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploadingPhoto(true);

            // Simular progreso de análisis de IA
            await simulateAiProgress();
            
            console.log('📷 Uploading family photo...');

            const photoTime = formData.date_taken.includes('T') ? 
                formData.date_taken.split('T')[1] : '';

            const dateTimeString = photoTime ? 
                `${formData.date_taken} ${photoTime}` : 
                formData.date_taken;

            const metadata = {
                description: formData.description,
                date_taken: dateTimeString,
                time_taken: photoTime || '',
                location: formData.location,
                country: '',
                place: '',
                people_in_photo: formData.people_in_photo,
                category: formData.category,
                tags: formData.tags,
                event_type: formData.event_type
            };

            console.log('🔍 Metadata being sent to backend:', metadata);

            const response = await twinApiService.uploadFamilyPhotoWithMetadata(
                twinId,
                selectedFile,
                metadata
            );

            if (response.success) {
                console.log('✅ Photo uploaded successfully:', response.data);
                alert('¡Foto subida exitosamente! 📸');
                resetForm();
                await loadPhotos(); // Recargar fotos
            } else {
                console.error('❌ Upload failed:', response.message);
                alert(`Error al subir la foto: ${response.message}`);
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert('Error al subir la foto. Por favor intenta de nuevo.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            description: '',
            date_taken: '',
            location: '',
            people_in_photo: '',
            category: 'familia',
            tags: '',
            event_type: 'general'
        });
        setSelectedFile(null);
        setShowUploadModal(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">📸 Fotos Familiares</h1>
                            <p className="text-gray-600">
                                Gestiona y organiza tus recuerdos familiares con análisis IA
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Foto
                            </Button>
                            <Button
                                onClick={loadPhotos}
                                variant="outline"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Layout de dos columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna izquierda - Contenido principal */}
                    <div className="lg:col-span-2">
                        {/* Filtros */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Filter className="w-5 h-5 mr-2" />
                                Filtros
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Búsqueda */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Buscar</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar fotos..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por año */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Año</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setSelectedMonth('todos'); // Reset month when year changes
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="todos">Todos los años</option>
                                        {getUniqueYears().map(year => (
                                            <option key={year} value={year}>
                                                {year !== 'todos' && ` (${photos.filter(p => getPhotoYear(p.date_taken) === year).length})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por mes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mes</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="todos">Todos los meses</option>
                                        {getUniqueMonths().map(month => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por categoría */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Categoría</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="todas">Todas las categorías</option>
                                        <option value="familia">Familia</option>
                                        <option value="vacaciones">Vacaciones</option>
                                        <option value="celebraciones">Celebraciones</option>
                                        <option value="eventos">Eventos</option>
                                        <option value="otros">Otros</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Galería de fotos */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Galería ({filteredPhotos.length} fotos)
                                </h3>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <span className="ml-2 text-gray-600">Cargando fotos...</span>
                                </div>
                            ) : filteredPhotos.length === 0 ? (
                                <div className="text-center py-12">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">No hay fotos disponibles</p>
                                    <p className="text-gray-500 text-sm">
                                        {photos.length === 0 
                                            ? "Sube tu primera foto familiar para comenzar" 
                                            : "Intenta ajustar los filtros para ver más fotos"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPhotos.map((photo, index) => (
                                        <div 
                                            key={photo.id} 
                                            className="group relative bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                setSelectedAiPhoto(photo);
                                                setSelectedPhotoIndex(index);
                                            }}
                                        >
                                            <div className="aspect-square">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.descripcionGenerica || 'Foto familiar'}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            
                                            {/* Overlay con información */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                                                <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                                        {photo.descripcionGenerica || 'Sin descripción'}
                                                    </h4>
                                                    <div className="flex items-center text-xs opacity-90 space-x-3">
                                                        {photo.fecha && (
                                                            <span className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {new Date(photo.fecha).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {photo.location && (
                                                            <span className="flex items-center">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {photo.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Columna derecha - Twin Agent */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <TwinPhotosAgent
                                onPhotoClick={(photo) => {
                                    console.log('Foto seleccionada desde chat:', photo);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Input file oculto */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Modal de subida */}
                {showUploadModal && selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-800">📸 Agregar Foto Familiar</h3>
                                    <Button
                                        onClick={resetForm}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Vista previa de la imagen */}
                                <div className="mb-6">
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Vista previa"
                                        className="w-full max-h-64 object-contain rounded-lg border"
                                    />
                                </div>

                                {/* Formulario */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Descripción</label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Describe qué hay en la foto..."
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.date_taken}
                                                onChange={(e) => setFormData({...formData, date_taken: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Ubicación</label>
                                            <Input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                placeholder="Dónde fue tomada la foto"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Personas en la foto</label>
                                            <Input
                                                type="text"
                                                value={formData.people_in_photo}
                                                onChange={(e) => setFormData({...formData, people_in_photo: e.target.value})}
                                                placeholder="Nombres de las personas"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Categoría</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="familia">Familia</option>
                                                <option value="vacaciones">Vacaciones</option>
                                                <option value="celebraciones">Celebraciones</option>
                                                <option value="eventos">Eventos</option>
                                                <option value="otros">Otros</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Etiquetas</label>
                                            <Input
                                                type="text"
                                                value={formData.tags}
                                                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                                placeholder="cumpleaños, navidad, playa..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tipo de evento</label>
                                            <select
                                                value={formData.event_type}
                                                onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="general">General</option>
                                                <option value="cumpleanos">Cumpleaños</option>
                                                <option value="navidad">Navidad</option>
                                                <option value="vacaciones">Vacaciones</option>
                                                <option value="boda">Boda</option>
                                                <option value="graduacion">Graduación</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                                    <Button
                                        onClick={resetForm}
                                        variant="outline"
                                        disabled={uploadingPhoto}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handlePhotoUpload}
                                        disabled={uploadingPhoto || !formData.date_taken}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {uploadingPhoto ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Subir Foto
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Progreso de Análisis de IA */}
                {showAiProcessingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="mb-4">
                                    <Bot className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                                    <h3 className="text-lg font-semibold text-gray-800">Análisis de IA en progreso</h3>
                                    <p className="text-sm text-gray-600 mt-1">Analizando tu foto para obtener la mejor información</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progreso</span>
                                        <span className="text-sm font-medium text-blue-600">{aiProcessingProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${aiProcessingProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Current Step */}
                                <div className="text-sm text-gray-700 mb-6">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span>{aiProcessingStep}</span>
                                    </div>
                                </div>

                                {/* AI Features List */}
                                <div className="bg-gray-50 rounded-lg p-4 text-left">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3">🎯 Qué está analizando la IA:</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• 👥 Detección de personas y expresiones</li>
                                        <li>• 🏠 Identificación de objetos y lugares</li>
                                        <li>• 🎨 Análisis de colores y composición</li>
                                        <li>• 😊 Reconocimiento de emociones</li>
                                        <li>• 📝 Generación de descripción inteligente</li>
                                        <li>• 🏷️ Creación automática de etiquetas</li>
                                    </ul>
                                </div>

                                <div className="mt-4 text-xs text-gray-500">
                                    Este proceso toma unos segundos y mejorará la búsqueda y organización de tus fotos.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FotosFamiliaresPage;