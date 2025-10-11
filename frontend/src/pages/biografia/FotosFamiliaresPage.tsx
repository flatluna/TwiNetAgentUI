import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService, ImageAI } from "@/services/twinApiService";
import { 
    Upload, 
    Camera, 
    Users, 
    Calendar, 
    MapPin, 
    Trash2,
    Edit,
    Eye,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Wand2,
    Info,
    RefreshCw,
    Clock
} from "lucide-react";

interface FamilyPhoto {
    photo_id: string;
    photo_url: string;
    description?: string;
    date_taken: string;
    location?: string;
    country?: string;
    place?: string;
    people_in_photo?: string;
    tags?: string;
    category: 'familia' | 'eventos' | 'vacaciones' | 'celebraciones' | 'cotidiano';
    uploaded_at?: string;
    file_size?: number;
    filename?: string;
    display_url?: string;
}

interface PhotoFormData {
    description: string;
    date_taken: string;
    location: string;
    country: string;
    place: string;
    people_in_photo: string;
    tags: string;
    category: 'familia' | 'eventos' | 'vacaciones' | 'celebraciones' | 'cotidiano';
    event_type: string;
}

const FotosFamiliaresPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<FamilyPhoto[]>([]);
    const [aiPhotos, setAiPhotos] = useState<ImageAI[]>([]);
    const [selectedAiPhoto, setSelectedAiPhoto] = useState<ImageAI | null>(null);
    const [showAiPhotoModal, setShowAiPhotoModal] = useState(false);
    const [loadingAiPhotos, setLoadingAiPhotos] = useState(false);
    const [refreshingAllPhotos, setRefreshingAllPhotos] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('todas');
    const [selectedYear, setSelectedYear] = useState<string>('todos');
    const [selectedMonth, setSelectedMonth] = useState<string>('todos');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCarousel, setShowCarousel] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [photoMetadata, setPhotoMetadata] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAiProcessingModal, setShowAiProcessingModal] = useState(false);
    const [aiProcessingProgress, setAiProcessingProgress] = useState(0);
    const [aiProcessingStep, setAiProcessingStep] = useState('');
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PhotoFormData>({
        description: '',
        date_taken: new Date().toISOString().split('T')[0],
        location: '',
        country: '',
        place: '',
        people_in_photo: '',
        tags: '',
        category: 'familia',
        event_type: 'general'
    });
    const [photoTime, setPhotoTime] = useState<string>('');

    // Get Twin ID from authentication
    const getTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            const twinId = accounts[0].localAccountId;
            console.log('🆔 TwinId obtenido:', twinId);
            return twinId;
        }
        console.log('❌ No hay cuentas disponibles para obtener TwinId');
        return null;
    };

    // Función para procesar y reorganizar el HTML del análisis de IA
    const processAiAnalysisHTML = (htmlContent: string): string => {
        if (!htmlContent) return htmlContent;
        
        try {
            // Crear un parser DOM temporal
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Buscar y extraer la sección de "Ambiente y colores"
            const ambientSection = Array.from(doc.querySelectorAll('h3, h4, h5, h6')).find(el => 
                el.textContent?.includes('Ambiente y colores') ||
                el.textContent?.includes('Paleta sugerida') || 
                el.textContent?.includes('Colores')
            );
            
            let ambientContent = '';
            if (ambientSection) {
                // Extraer toda la sección de ambiente y colores (incluyendo el siguiente párrafo/div)
                let currentElement = ambientSection;
                let elementsToMove = [currentElement];
                
                while (currentElement.nextElementSibling && 
                       !currentElement.nextElementSibling.matches('h1, h2, h3, h4, h5, h6')) {
                    currentElement = currentElement.nextElementSibling;
                    elementsToMove.push(currentElement);
                }
                
                // Crear el contenido a mover
                ambientContent = elementsToMove.map(el => el.outerHTML).join('');
                
                // Remover elementos originales
                elementsToMove.forEach(el => el.remove());
                
                // Insertar la nueva sección de poesía en su lugar
                const poetryHTML = `
                    <h4>🎭 Poesía</h4>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 0.75rem; color: white; margin: 1rem 0;">
                        <div style="text-align: center; font-style: italic; line-height: 1.8; font-size: 0.95rem;">
                            <p style="margin: 0.5rem 0;">Bajo la nieve Ángeles talló senderos de calor</p>
                            <p style="margin: 0.5rem 0;">La pala cantó historias de manos que cuidan el hogar</p>
                            <p style="margin: 0.5rem 0;">Una luz en la ventana prometía regreso y abrigo</p>
                            <p style="margin: 0.5rem 0;">En cada huella queda el latido suave de la familia</p>
                        </div>
                    </div>
                `;
                
                // Insertar la poesía donde estaba la sección de ambiente
                const insertPoint = ambientSection.parentNode;
                if (insertPoint && insertPoint instanceof Element) {
                    insertPoint.insertAdjacentHTML('beforeend', poetryHTML);
                }
            }
            
            // Agregar la sección de "Ambiente y colores" al final
            if (ambientContent) {
                const body = doc.body;
                body.insertAdjacentHTML('beforeend', ambientContent);
            }
            
            return doc.body.innerHTML;
        } catch (error) {
            console.error('Error procesando HTML de IA:', error);
            return htmlContent; // Retornar contenido original si hay error
        }
    };

    // Load family photos on component mount
    useEffect(() => {
        console.log('📊 Estado de accounts:', accounts);
        console.log('📊 Número de cuentas:', accounts?.length);
        loadFamilyPhotos();
        loadFamilyPhotosWithAI();
    }, []);

    const loadFamilyPhotos = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        try {
            console.log('🔄 Cargando fotos familiares para Twin:', twinId);
            
            const response = await twinApiService.getFamilyPhotos(twinId);
            
            if (response.success && response.data && response.data.photos) {
                console.log('📋 Estructura de datos de foto del backend:', response.data.photos[0]);
                
                const photosWithUrls = response.data.photos.map(photo => {
                    // Cast temporal para manejar la diferencia entre tipos y estructura real
                    const photoData = photo as any;
                    return {
                        photo_id: photoData.id,
                        photo_url: photoData.url || photoData.photoUrl, // El backend devuelve 'url'
                        description: photoData.descripcionGenerica || photoData.description || '',
                        date_taken: photoData.fecha || photoData.dateTaken || '',
                        location: photoData.location || '',
                        country: photoData.country || '',
                        place: photoData.place || '',
                        people_in_photo: photoData.peopleInPhoto || '',
                        tags: photoData.tags || '',
                        category: (photoData.category?.toLowerCase() || 'familia') as 'familia' | 'eventos' | 'vacaciones' | 'celebraciones' | 'cotidiano',
                        uploaded_at: photoData.uploadDate || '',
                        file_size: photoData.fileSize || 0,
                        filename: photoData.fileName || '',
                        display_url: photoData.url || photoData.photoUrl // También usar 'url' aquí
                    };
                });
                setPhotos(photosWithUrls);
                console.log('✅ Fotos familiares cargadas:', photosWithUrls.length);
            } else {
                console.error('❌ Error cargando fotos familiares:', response.error);
                setPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error en loadFamilyPhotos:', error);
            setPhotos([]);
        }
    };

    const loadFamilyPhotosWithAI = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        try {
            setLoadingAiPhotos(true);
            console.log('🤖 Cargando fotos familiares con análisis de IA para Twin:', twinId);
            
            const response = await twinApiService.getFamilyPhotosWithAI(twinId);
            
            if (response.success && response.data && response.data.photos) {
                setAiPhotos(response.data.photos);
                console.log('✅ Fotos con IA cargadas:', response.data.photos.length);
            } else {
                console.error('❌ Error cargando fotos con IA:', response.error);
                setAiPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error en loadFamilyPhotosWithAI:', error);
            setAiPhotos([]);
        } finally {
            setLoadingAiPhotos(false);
        }
    };

    const categories = [
        { id: 'todas', label: 'Todas las Fotos', color: 'bg-gray-500' },
        { id: 'familia', label: 'Familia', color: 'bg-blue-500' },
        { id: 'eventos', label: 'Eventos Especiales', color: 'bg-purple-500' },
        { id: 'vacaciones', label: 'Vacaciones', color: 'bg-green-500' },
        { id: 'celebraciones', label: 'Celebraciones', color: 'bg-yellow-500' },
        { id: 'cotidiano', label: 'Vida Cotidiana', color: 'bg-pink-500' }
    ];

    const getPhotoYear = (dateString: string): string => {
        if (!dateString || dateString === '') return 'unknown';
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            return isNaN(year) ? 'unknown' : year.toString();
        } catch (error) {
            console.log('Error parsing date:', dateString, error);
            return 'unknown';
        }
    };

    const getPhotoMonth = (dateString: string): string => {
        if (!dateString || dateString === '') return 'unknown';
        try {
            const date = new Date(dateString);
            const month = date.getMonth() + 1; // Mes 1-12
            return isNaN(month) ? 'unknown' : month.toString();
        } catch (error) {
            console.log('Error parsing date for month:', dateString, error);
            return 'unknown';
        }
    };

    const filteredPhotos = React.useMemo(() => {
        console.log('🔍 Aplicando filtros:', { 
            selectedCategory, 
            selectedYear,
            selectedMonth,
            totalPhotos: photos.length 
        });
        
        if (photos.length === 0) {
            console.log('📸 No hay fotos para filtrar');
            return [];
        }
        
        const filtered = photos.filter((photo) => {
            if (!photo) return false;
            const categoryMatch = selectedCategory === 'todas' || photo.category === selectedCategory;
            const yearMatch = selectedYear === 'todos' || getPhotoYear(photo.date_taken) === selectedYear;
            const monthMatch = selectedMonth === 'todos' || getPhotoMonth(photo.date_taken) === selectedMonth;
            
            return categoryMatch && yearMatch && monthMatch;
        });
        
        console.log(`✅ Filtrado completado: ${filtered.length}/${photos.length} fotos`);
        return filtered;
    }, [photos, selectedCategory, selectedYear, selectedMonth]);

    // Navegación con teclado para el carrusel
    useEffect(() => {
        if (!showCarousel) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Escape':
                    setShowCarousel(false);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    if (filteredPhotos.length > 1) {
                        setCurrentPhotoIndex(prev => 
                            prev === 0 ? filteredPhotos.length - 1 : prev - 1
                        );
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (filteredPhotos.length > 1) {
                        setCurrentPhotoIndex(prev => 
                            prev === filteredPhotos.length - 1 ? 0 : prev + 1
                        );
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showCarousel, filteredPhotos.length]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleRefreshPhotos = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Refrescando fotos familiares...');
            await loadFamilyPhotos();
            await loadFamilyPhotosWithAI();
            console.log('✅ Fotos refrescadas exitosamente');
        } catch (error) {
            console.error('❌ Error refrescando fotos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            // Extraer metadatos
            const metadata = await extractPhotoMetadata(file);
            setPhotoMetadata(metadata);
            
            // Auto-rellenar fecha si está disponible
            if (metadata.lastModified) {
                const dateStr = metadata.lastModified.toISOString().split('T')[0];
                const timeStr = metadata.lastModified.toTimeString().split(' ')[0];
                setFormData(prev => ({
                    ...prev,
                    date_taken: dateStr
                }));
                setPhotoTime(timeStr);
            }
            
            setShowUploadModal(true);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhotoTime(e.target.value);
    };

    const handleSavePhoto = async () => {
        if (!selectedFile) return;

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        try {
            setIsLoading(true);
            setShowAiProcessingModal(true);
            
            // Simular progreso de análisis de IA
            await simulateAiProgress();
            
            console.log('📷 Uploading family photo...');

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

            if (response.success && response.data) {
                console.log('✅ Photo uploaded successfully:', response.data);
                
                // Completar el progreso al 100% cuando recibimos la respuesta
                setAiProcessingProgress(100);
                setAiProcessingStep('¡Análisis completado!');
                
                // Esperar un momento para mostrar el progreso completo
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const newPhoto: FamilyPhoto = {
                    photo_id: response.data.photo_id,
                    photo_url: response.data.photo_url,
                    description: formData.description,
                    date_taken: dateTimeString,
                    location: formData.location,
                    country: '',
                    place: '',
                    people_in_photo: formData.people_in_photo,
                    tags: formData.tags,
                    category: formData.category,
                    uploaded_at: new Date().toISOString(),
                    file_size: response.data.size_bytes || selectedFile.size,
                    filename: response.data.filename || selectedFile.name,
                    display_url: response.data.photo_url
                };

                setPhotos(prev => [...prev, newPhoto]);
                resetForm();
                setShowUploadModal(false);
                setShowAiProcessingModal(false);
                
                // Recargar fotos para obtener el análisis de IA actualizado
                await loadFamilyPhotosWithAI();
            } else {
                console.error('❌ Error uploading photo:', response.error);
                // En caso de error, mostrar mensaje de error en el progreso
                setAiProcessingProgress(100);
                setAiProcessingStep('❌ Error en el análisis');
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('Error al subir la foto: ' + response.error);
            }
        } catch (error) {
            console.error('❌ Error in handleSavePhoto:', error);
            // En caso de excepción, mostrar mensaje de error en el progreso
            setAiProcessingProgress(100);
            setAiProcessingStep('❌ Error en el análisis');
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Error al subir la foto. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
            setShowAiProcessingModal(false);
        }
    };

    // Simular el progreso del análisis de IA
    const simulateAiProgress = async () => {
        const steps = [
            { progress: 0, step: 'Inicializando análisis de IA...' },
            { progress: 15, step: 'Analizando composición de la imagen...' },
            { progress: 30, step: 'Detectando objetos y personas...' },
            { progress: 45, step: 'Reconociendo emociones y expresiones...' },
            { progress: 60, step: 'Analizando colores y iluminación...' },
            { progress: 75, step: 'Generando descripción inteligente...' },
            { progress: 90, step: 'Finalizando análisis...' },
            // No incluimos 100% aquí - se completará cuando recibamos la respuesta
        ];

        for (const { progress, step } of steps) {
            setAiProcessingProgress(progress);
            setAiProcessingStep(step);
            await new Promise(resolve => setTimeout(resolve, 600)); // 600ms por paso
        }
        
        // Mantener en 90% mientras esperamos la respuesta real
        setAiProcessingStep('Tu Twin está procesando la foto con IA...');
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setPhotoTime('');
        setPhotoMetadata(null);
        setFormData({
            description: '',
            date_taken: new Date().toISOString().split('T')[0],
            location: '',
            country: '',
            place: '',
            people_in_photo: '',
            tags: '',
            category: 'familia',
            event_type: 'general'
        });
    };

    // Función para extraer metadatos EXIF de la imagen
    const extractPhotoMetadata = (file: File): Promise<any> => {
        return new Promise((resolve) => {
            // Crear una imagen para obtener dimensiones
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                try {
                    // Información básica del archivo
                    const basicInfo = {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        lastModified: new Date(file.lastModified),
                        dimensions: {
                            width: img.width,
                            height: img.height
                        },
                        aspectRatio: (img.width / img.height).toFixed(2),
                        // En una implementación real, aquí usarías una librería como exif-js o piexifjs
                        // para extraer metadatos EXIF completos como:
                        // camera: "Canon EOS R5",
                        // settings: "f/2.8, 1/500s, ISO 200",
                        // gps: { lat: 19.4326, lng: -99.1332 },
                        // dateTaken: new Date(exifData.DateTime)
                    };
                    
                    // Limpiar la URL temporal
                    URL.revokeObjectURL(url);
                    resolve(basicInfo);
                } catch (error) {
                    console.error('Error extrayendo metadatos:', error);
                    URL.revokeObjectURL(url);
                    resolve({
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        lastModified: new Date(file.lastModified)
                    });
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    lastModified: new Date(file.lastModified)
                });
            };
            
            img.src = url;
        });
    };

    // Función para formatear el tamaño del archivo
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Función para formatear la fecha de manera legible
    const formatDate = (date: Date): string => {
        if (!date || isNaN(date.getTime())) return 'No disponible';
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener años únicos de las fotos
    const getUniqueYears = (): string[] => {
        const years = new Set(photos.map(photo => getPhotoYear(photo.date_taken)));
        return ['todos', ...Array.from(years).sort((a, b) => {
            if (a === 'sin fecha') return 1;
            if (b === 'sin fecha') return -1;
            return parseInt(b) - parseInt(a); // Años más recientes primero
        })];
    };

    // Obtener meses únicos de las fotos del año seleccionado
    const getUniqueMonths = (): string[] => {
        let photosToCheck = photos;
        
        // Si hay un año seleccionado, filtrar por ese año
        if (selectedYear !== 'todos') {
            photosToCheck = photos.filter(photo => getPhotoYear(photo.date_taken) === selectedYear);
        }
        
        const months = new Set(photosToCheck.map(photo => getPhotoMonth(photo.date_taken)));
        const monthNumbers = Array.from(months).sort((a, b) => {
            if (a === 'sin fecha') return 1;
            if (b === 'sin fecha') return -1;
            return parseInt(a) - parseInt(b); // Enero a Diciembre
        });
        
        return ['todos', ...monthNumbers];
    };

    // Función para obtener nombre del mes
    const getMonthName = (monthNum: string): string => {
        if (monthNum === 'todos') return 'Todos los meses';
        if (monthNum === 'sin fecha') return 'Sin fecha';
        
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const num = parseInt(monthNum);
        return months[num - 1] || monthNum;
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
                                Sube y organiza las fotos que cuentan la historia de tu familia
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={() => navigate("/twin-biografia")}
                                className="flex items-center space-x-2"
                            >
                                <span>←</span>
                                <span>Volver a Biografía</span>
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                multiple={false}
                            />
                            <Button 
                                onClick={handleRefreshPhotos}
                                disabled={isLoading}
                                variant="outline"
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                <span>{isLoading ? 'Actualizando...' : 'Refresh'}</span>
                            </Button>
                            <Button 
                                onClick={triggerFileInput}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Upload size={16} />
                                <span>Subir Fotos</span>
                            </Button>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Camera className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold text-gray-800">{photos.length}</h3>
                                    <p className="text-sm text-gray-600">Total Fotos</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-green-100">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {new Set(photos
                                            .map(p => p.people_in_photo)
                                            .filter(Boolean)
                                            .flatMap(p => p!.split(',').map(person => person.trim()))
                                            .filter(person => person.length > 0)
                                        ).size}
                                    </h3>
                                    <p className="text-sm text-gray-600">Personas</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-purple-100">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {new Set(photos
                                            .filter(p => p.date_taken)
                                            .map(p => {
                                                const year = getPhotoYear(p.date_taken);
                                                return year !== 'unknown' ? year : null;
                                            })
                                            .filter(Boolean)
                                        ).size}
                                    </h3>
                                    <p className="text-sm text-gray-600">Años</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-yellow-100">
                                    <MapPin className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {new Set(photos
                                            .map(p => p.location)
                                            .filter(Boolean)
                                            .filter(loc => loc!.trim().length > 0)
                                        ).size}
                                    </h3>
                                    <p className="text-sm text-gray-600">Lugares</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros</h3>
                        
                        {/* Filtros por categoría */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Por categoría:</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === category.id
                                                ? `${category.color} text-white`
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category.label}
                                        {category.id !== 'todas' && (
                                            <span className="ml-1">
                                                ({photos.filter(p => p.category === category.id).length})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtros por año y mes con combo boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Combo box de años */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Año:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        // Reset month filter when year changes
                                        if (e.target.value !== selectedYear) {
                                            setSelectedMonth('todos');
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {getUniqueYears().map(year => (
                                        <option key={year} value={year}>
                                            {year === 'todos' ? 'Todos los años' : year}
                                            {year !== 'todos' && ` (${photos.filter(p => getPhotoYear(p.date_taken) === year).length})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Combo box de meses */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Mes:</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    disabled={selectedYear === 'todos'}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    {getUniqueMonths().map(month => (
                                        <option key={month} value={month}>
                                            {getMonthName(month)}
                                            {month !== 'todos' && selectedYear !== 'todos' && (
                                                ` (${photos.filter(p => 
                                                    getPhotoYear(p.date_taken) === selectedYear && 
                                                    getPhotoMonth(p.date_taken) === month
                                                ).length})`
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón para ver carrusel de fotos filtradas */}
                {filteredPhotos.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <button
                            onClick={() => {
                                setCurrentPhotoIndex(0);
                                setShowCarousel(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                            </svg>
                            Ver todas las fotos en carrusel ({filteredPhotos.length} foto{filteredPhotos.length !== 1 ? 's' : ''})
                        </button>
                    </div>
                )}

                {/* Galería de fotos */}
                {filteredPhotos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">📷</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {selectedCategory === 'todas' ? 'No hay fotos aún' : 'No hay fotos con los filtros seleccionados'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Comienza subiendo tus primeras fotos familiares para crear recuerdos digitales
                        </p>
                        <Button 
                            onClick={triggerFileInput}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Upload className="mr-2" size={16} />
                            Subir Primera Foto
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {filteredPhotos.map((photo, index) => (
                            <div key={photo.photo_id || index} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                                <div className="aspect-square relative overflow-hidden">
                                    <img 
                                        src={photo.display_url || photo.photo_url} 
                                        alt={photo.description || `Foto ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
                                            {photo.category}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button 
                                            onClick={() => {
                                                setCurrentPhotoIndex(index);
                                                setShowCarousel(true);
                                            }}
                                            className="p-3 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-lg"
                                            title="Ver en grande"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-3">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2 line-clamp-1">
                                        {photo.description || 'Sin descripción'}
                                    </h4>
                                    
                                    <div className="space-y-1 mb-3">
                                        {photo.date_taken && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>
                                                    {photo.date_taken === 'Invalid Date' || photo.date_taken === 'unknown' 
                                                        ? 'Sin fecha' 
                                                        : new Date(photo.date_taken).toLocaleDateString()
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {photo.people_in_photo && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Users className="h-3 w-3 mr-1" />
                                                <span className="line-clamp-1">{photo.people_in_photo}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-1">
                                            <button 
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const aiPhoto = aiPhotos.find(ai => ai.fileName === photo.filename);
                                                if (aiPhoto) {
                                                    setSelectedAiPhoto(aiPhoto);
                                                    setShowAiPhotoModal(true);
                                                } else {
                                                    alert('No hay análisis de IA disponible para esta foto');
                                                }
                                            }}
                                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                                            title="Ver análisis de IA"
                                        >
                                            <Wand2 size={12} className="inline mr-1" />
                                            IA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de subida */}
                {showUploadModal && selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-800">📸 Agregar Foto Familiar</h3>
                                    <div className="flex items-center space-x-2">
                                        {/* Botón para tomar foto con cámara */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // En una implementación futura se puede agregar acceso a cámara web
                                                alert("Función de cámara web próximamente. Por ahora usa 'Seleccionar archivo'.");
                                            }}
                                            className="flex items-center space-x-1"
                                        >
                                            <Camera size={16} />
                                            <span>Cámara</span>
                                        </Button>
                                        
                                        {/* Botón para cambiar archivo */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            className="flex items-center space-x-1"
                                        >
                                            <Upload size={16} />
                                            <span>Cambiar archivo</span>
                                        </Button>
                                        
                                        <button 
                                            onClick={() => {
                                                setShowUploadModal(false);
                                                resetForm();
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-full"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Preview de la imagen */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Vista Previa</h4>
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                                            <div className="flex flex-col space-y-1">
                                                <div>
                                                    <div className="text-lg">📁</div>
                                                    <div className="font-medium text-gray-800">{selectedFile.name}</div>
                                                </div>
                                                
                                                <div>
                                                    <div className="text-lg">📊</div>
                                                    <div>{formatFileSize(selectedFile.size)}</div>
                                                </div>
                                                
                                                <div>
                                                    <div className="text-lg">📷</div>
                                                    <div>{photoMetadata?.fileType || selectedFile.type}</div>
                                                </div>
                                                
                                                {photoMetadata?.lastModified && (
                                                    <div>
                                                        <div className="text-lg">📅</div>
                                                        <div>Modificado: {formatDate(photoMetadata.lastModified)}</div>
                                                    </div>
                                                )}
                                                
                                                {photoMetadata?.dimensions && (
                                                    <div>
                                                        <div className="text-lg">�</div>
                                                        <div>{photoMetadata.dimensions.width} × {photoMetadata.dimensions.height} px</div>
                                                    </div>
                                                )}
                                                
                                                {photoMetadata?.aspectRatio && (
                                                    <div>
                                                        <div className="text-lg">📏</div>
                                                        <div>Relación: {photoMetadata.aspectRatio}:1</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Formulario de metadatos */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Información de la Foto</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleFormChange}
                                                    rows={3}
                                                    placeholder="Describe qué está pasando en la foto..."
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Fecha y hora tomada *</label>
                                                
                                                {/* Botones de acceso rápido */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const now = new Date();
                                                            const dateStr = now.toISOString().split('T')[0];
                                                            const timeStr = now.toTimeString().split(' ')[0];
                                                            
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                date_taken: dateStr
                                                            }));
                                                            setPhotoTime(timeStr);
                                                        }}
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <Clock size={14} />
                                                        <span>Ahora</span>
                                                    </Button>
                                                    
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const yesterday = new Date();
                                                            yesterday.setDate(yesterday.getDate() - 1);
                                                            const dateStr = yesterday.toISOString().split('T')[0];
                                                            
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                date_taken: dateStr
                                                            }));
                                                        }}
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <Calendar size={14} />
                                                        <span>Ayer</span>
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Intentar extraer fecha de metadatos EXIF
                                                            if (selectedFile) {
                                                                const reader = new FileReader();
                                                                reader.onload = () => {
                                                                    // En una implementación real, aquí usarías una librería como exif-js
                                                                    // Por ahora, usamos la fecha de modificación del archivo
                                                                    const fileDate = new Date(selectedFile.lastModified);
                                                                    const dateStr = fileDate.toISOString().split('T')[0];
                                                                    const timeStr = fileDate.toTimeString().split(' ')[0];
                                                                    
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        date_taken: dateStr
                                                                    }));
                                                                    setPhotoTime(timeStr);
                                                                };
                                                                reader.readAsArrayBuffer(selectedFile);
                                                            }
                                                        }}
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <Camera size={14} />
                                                        <span>Del archivo</span>
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Fecha:</label>
                                                        <input
                                                            type="date"
                                                            name="date_taken"
                                                            value={formData.date_taken}
                                                            onChange={handleFormChange}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Hora (opcional):</label>
                                                        <input
                                                            type="time"
                                                            step="1"
                                                            value={photoTime}
                                                            onChange={handleTimeChange}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ubicación</label>
                                                <div className="flex gap-2 mb-2">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleFormChange}
                                                            placeholder="Ej: México, Playa de Cancún | España, Madrid..."
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (navigator.geolocation) {
                                                                navigator.geolocation.getCurrentPosition(
                                                                    (position) => {
                                                                        const lat = position.coords.latitude;
                                                                        const lng = position.coords.longitude;
                                                                        // En una implementación real, usarías geocoding reverso
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                                                                        }));
                                                                    },
                                                                    (error) => {
                                                                        console.error('Error obteniendo ubicación:', error);
                                                                        alert('No se pudo obtener la ubicación. Verifica los permisos del navegador.');
                                                                    }
                                                                );
                                                            } else {
                                                                alert('Tu navegador no soporta geolocalización.');
                                                            }
                                                        }}
                                                        className="flex items-center space-x-1 whitespace-nowrap"
                                                    >
                                                        <MapPin size={14} />
                                                        <span>Ubicación actual</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Personas en la foto</label>
                                                <input
                                                    type="text"
                                                    name="people_in_photo"
                                                    value={formData.people_in_photo}
                                                    onChange={handleFormChange}
                                                    placeholder="Ej: Mamá, Papá, María, Juan (separados por comas)"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Categoría *</label>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {categories.slice(1).map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Etiquetas</label>
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        name="tags"
                                                        value={formData.tags}
                                                        onChange={handleFormChange}
                                                        placeholder="Ej: cumpleaños, sorpresa, felicidad (separadas por comas)"
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    
                                                    {/* Etiquetas sugeridas */}
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="text-xs text-gray-500 mr-2">Sugerencias:</span>
                                                        {['familia', 'vacaciones', 'cumpleaños', 'celebración', 'amor', 'diversión', 'recuerdo'].map(tag => (
                                                            <Button
                                                                key={tag}
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                                                                    if (!currentTags.includes(tag)) {
                                                                        const newTags = [...currentTags, tag].join(', ');
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            tags: newTags
                                                                        }));
                                                                    }
                                                                }}
                                                                className="text-xs h-6 px-2"
                                                            >
                                                                +{tag}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setShowUploadModal(false);
                                                    resetForm();
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button 
                                                onClick={handleSavePhoto}
                                                disabled={isLoading || !formData.date_taken}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                                            >
                                                <Camera className="mr-2" size={16} />
                                                {isLoading ? 'Subiendo...' : 'Guardar Foto'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Carrusel de fotos */}
                {showCarousel && filteredPhotos.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
                        {/* Botón cerrar */}
                        <button
                            onClick={() => setShowCarousel(false)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-20 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                            <X size={24} className="sm:w-8 sm:h-8" />
                        </button>

                        {/* Navegación izquierda */}
                        {filteredPhotos.length > 1 && (
                            <button
                                onClick={() => setCurrentPhotoIndex(prev => 
                                    prev === 0 ? filteredPhotos.length - 1 : prev - 1
                                )}
                                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20 p-2 sm:p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                            >
                                <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
                            </button>
                        )}

                        {/* Navegación derecha */}
                        {filteredPhotos.length > 1 && (
                            <button
                                onClick={() => setCurrentPhotoIndex(prev => 
                                    prev === filteredPhotos.length - 1 ? 0 : prev + 1
                                )}
                                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20 p-2 sm:p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                            >
                                <ChevronRight size={24} className="sm:w-8 sm:h-8" />
                            </button>
                        )}

                        {/* Contenido principal */}
                        <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-8">
                            {/* Imagen principal */}
                            <div className="relative max-w-full max-h-[70vh] sm:max-h-[75vh]">
                                <img
                                    src={filteredPhotos[currentPhotoIndex]?.display_url || filteredPhotos[currentPhotoIndex]?.photo_url}
                                    alt={filteredPhotos[currentPhotoIndex]?.description || 'Foto familiar'}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    loading="lazy"
                                />
                                
                                {/* Indicador de carga para siguientes imágenes */}
                                {filteredPhotos.length > 1 && (
                                    <>
                                        {/* Precargar imagen anterior */}
                                        <img
                                            src={filteredPhotos[currentPhotoIndex === 0 ? filteredPhotos.length - 1 : currentPhotoIndex - 1]?.display_url || filteredPhotos[currentPhotoIndex === 0 ? filteredPhotos.length - 1 : currentPhotoIndex - 1]?.photo_url}
                                            alt="Preload"
                                            className="hidden"
                                            loading="lazy"
                                        />
                                        {/* Precargar imagen siguiente */}
                                        <img
                                            src={filteredPhotos[currentPhotoIndex === filteredPhotos.length - 1 ? 0 : currentPhotoIndex + 1]?.display_url || filteredPhotos[currentPhotoIndex === filteredPhotos.length - 1 ? 0 : currentPhotoIndex + 1]?.photo_url}
                                            alt="Preload"
                                            className="hidden"
                                            loading="lazy"
                                        />
                                    </>
                                )}
                            </div>
                            
                            {/* Información de la foto */}
                            <div className="mt-4 text-center text-white max-w-4xl">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                    {filteredPhotos[currentPhotoIndex]?.filename || 'Foto familiar'}
                                </h3>
                                
                                {/* Metadatos */}
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mb-3">
                                    <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                                        {currentPhotoIndex + 1} de {filteredPhotos.length}
                                    </span>
                                    {filteredPhotos[currentPhotoIndex]?.date_taken && filteredPhotos[currentPhotoIndex]?.date_taken !== 'Invalid Date' && (
                                        <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                                            📅 {new Date(filteredPhotos[currentPhotoIndex].date_taken).toLocaleDateString('es-ES')}
                                        </span>
                                    )}
                                    {filteredPhotos[currentPhotoIndex]?.location && (
                                        <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                                            📍 {filteredPhotos[currentPhotoIndex].location}
                                        </span>
                                    )}
                                    {filteredPhotos[currentPhotoIndex]?.category && (
                                        <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                                            🏷️ {filteredPhotos[currentPhotoIndex].category}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Descripción */}
                                {filteredPhotos[currentPhotoIndex]?.description && (
                                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
                                        {filteredPhotos[currentPhotoIndex].description}
                                    </p>
                                )}
                                
                                {/* Personas en la foto */}
                                {filteredPhotos[currentPhotoIndex]?.people_in_photo && (
                                    <p className="mt-2 text-xs sm:text-sm text-gray-400">
                                        👥 {filteredPhotos[currentPhotoIndex].people_in_photo}
                                    </p>
                                )}
                            </div>

                            {/* Miniaturas navegación */}
                            {filteredPhotos.length > 1 && (
                                <div className="mt-6 w-full">
                                    <div className="flex justify-center">
                                        <div className="flex space-x-2 max-w-full overflow-x-auto pb-2 px-4">
                                            {filteredPhotos.map((photo, index) => (
                                                <button
                                                    key={photo.photo_id}
                                                    onClick={() => setCurrentPhotoIndex(index)}
                                                    className={`flex-shrink-0 w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                        index === currentPhotoIndex 
                                                            ? 'border-white shadow-lg ring-2 ring-white ring-opacity-50' 
                                                            : 'border-gray-600 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <img
                                                        src={photo.display_url || photo.photo_url}
                                                        alt={`Miniatura ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Indicador de ayuda de teclado (solo desktop) */}
                        <div className="hidden sm:block absolute bottom-4 left-4 text-gray-400 text-xs">
                            <p>💡 Usa ← → para navegar, ESC para cerrar</p>
                        </div>
                    </div>
                )}

                {/* Modal de Análisis de IA */}
                {showAiPhotoModal && selectedAiPhoto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                                        <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                                        <span>Análisis de IA - Foto</span>
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAiPhotoModal(false)}
                                        className="flex items-center space-x-1"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="hidden sm:inline">Cerrar</span>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-4">
                                        <div className="aspect-video sm:aspect-square relative rounded-lg overflow-hidden">
                                            <img 
                                                src={selectedAiPhoto.url || '/placeholder-image.jpg'} 
                                                alt={selectedAiPhoto.descripcionGenerica || 'Foto'} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    img.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                                            <p><strong>Archivo:</strong> <span className="break-all">{selectedAiPhoto.fileName || 'No disponible'}</span></p>
                                            <p><strong>ID:</strong> <span className="break-all">{selectedAiPhoto.id || 'No disponible'}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                                <Info className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm sm:text-base">Descripción General</span>
                                            </h4>
                                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{selectedAiPhoto.descripcionGenerica || 'No disponible'}</p>
                                        </div>

                                        {selectedAiPhoto.detailsHTML && (
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">📄 Análisis Detallado</h4>
                                                <div 
                                                    className="text-xs sm:text-sm text-gray-700 prose prose-sm max-w-none overflow-hidden"
                                                    dangerouslySetInnerHTML={{ __html: processAiAnalysisHTML(selectedAiPhoto.detailsHTML) }}
                                                    style={{ 
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'break-word'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
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
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">🤖 Análisis de IA en Progreso</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Nuestro sistema de inteligencia artificial está analizando tu foto para generar una descripción detallada y extraer información valiosa.
                                    </p>
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