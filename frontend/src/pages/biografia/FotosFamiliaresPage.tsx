import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Tag, Upload, Camera, Search, Filter, Trash2, Edit3, Download, Loader2, FileText, X, RefreshCw, Bot, ChevronDown, Eye, EyeOff, Palette, Clock, User, Info, CheckCircle, Image, Brain } from 'lucide-react';
import twinApiService, { ImageAI } from '@/services/twinApiService';
import { useTwinId } from '@/hooks/useTwinId';
import exifr from 'exifr';

interface FormData {
    description: string;
    date_taken: string;
    location: string;
    people_in_photo: string;
    category: string;
    tags: string;
    event_type: string;
}

interface ExifData {
    dateTime?: string;
    gps?: {
        latitude?: number;
        longitude?: number;
        altitude?: number;
    };
    camera?: {
        make?: string;
        model?: string;
        focalLength?: number;
        aperture?: number;
        iso?: number;
        exposureTime?: string;
    };
    dimensions?: {
        width?: number;
        height?: number;
    };
}

const FotosFamiliaresPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Obtener TwinID correctamente usando el hook
    const { twinId, loading: twinIdLoading, error: twinIdError } = useTwinId();

    // Estados principales
    const [photos, setPhotos] = useState<ImageAI[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>(''); // Estado para búsqueda
    
    // Estados para filtros
    const [selectedYear, setSelectedYear] = useState<string>('todos');
    const [selectedMonth, setSelectedMonth] = useState<string>('todos');
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    
    const [formData, setFormData] = useState<FormData>({
        description: '',
        date_taken: '',
        location: '',
        people_in_photo: '',
        category: 'familia',
        tags: '',
        event_type: 'general'
    });

    // Estados de UI
    const [selectedAiPhoto, setSelectedAiPhoto] = useState<ImageAI | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
    const [showAiProcessingModal, setShowAiProcessingModal] = useState(false);
    const [aiProcessingProgress, setAiProcessingProgress] = useState(0);
    const [aiProcessingStep, setAiProcessingStep] = useState('Preparando análisis...');
    const [editingPhoto, setEditingPhoto] = useState<ImageAI | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [savingPhoto, setSavingPhoto] = useState(false);

    // Estados para el carrusel
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [showCarousel, setShowCarousel] = useState(false);

    // Referencias para el formulario de edición
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const dateRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);
    const peopleRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLSelectElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);

    // Estados para metadatos EXIF
    const [extractedExif, setExtractedExif] = useState<ExifData | null>(null);
    const [extractingMetadata, setExtractingMetadata] = useState(false);
    const [showMetadataSection, setShowMetadataSection] = useState(false);

    // Funciones para el carousel
    const openCarousel = (index: number) => {
        setCurrentCarouselIndex(index);
        setShowCarousel(true);
    };

    const closeCarousel = () => {
        setShowCarousel(false);
        setCurrentCarouselIndex(0);
    };

    const nextPhoto = () => {
        setCurrentCarouselIndex((prev) => 
            prev >= filteredPhotos.length - 1 ? 0 : prev + 1
        );
    };

    const prevPhoto = () => {
        setCurrentCarouselIndex((prev) => 
            prev <= 0 ? filteredPhotos.length - 1 : prev - 1
        );
    };

    const goToPhoto = (index: number) => {
        setCurrentCarouselIndex(index);
    };

    // Función helper para limpiar fechas malformadas
    const cleanDateString = (dateString: string | undefined): string | null => {
        if (!dateString || dateString === 'Invalid Date') return null;
        
        // Limpiar la fecha si tiene hora duplicada (ej: "2009-05-10T16:57 16:57" o "2009-05-10T18:30 18:30")
        if (dateString.includes('T') && dateString.includes(' ')) {
            const parts = dateString.split(' ');
            if (parts.length >= 2) {
                // Extraer la hora de la parte después de T
                const timePart = parts[0].split('T')[1];
                // Si la hora está duplicada después del espacio, usar solo la parte hasta la primera hora
                if (timePart && (parts[1] === timePart || parts.slice(1).join(' ').includes(timePart))) {
                    return parts[0]; // Retorna solo "2009-05-10T18:30"
                }
            }
        }
        
        return dateString;
    };

    // Función helper para limpiar nombres de archivo cortados
    const cleanFileName = (fileName: string | undefined): string => {
        if (!fileName) return 'Sin nombre';
        
        // Si el nombre está cortado y no tiene extensión, intentar agregar una extensión común
        if (fileName.endsWith('.j') || fileName.endsWith('.jp') || fileName.endsWith('.jpe')) {
            return fileName + 'pg'; // Completar .jpg/.jpeg
        }
        
        if (fileName.endsWith('.png') === false && 
            fileName.endsWith('.jpg') === false && 
            fileName.endsWith('.jpeg') === false && 
            fileName.endsWith('.gif') === false && 
            fileName.endsWith('.webp') === false &&
            !fileName.includes('.')) {
            return fileName + '.jpg'; // Agregar extensión por defecto
        }
        
        return fileName;
    };

    // Función para convertir fecha a formato ISO de forma segura
    const safeToISOString = (dateString: string | undefined): string => {
        if (!dateString) return '';
        
        try {
            const cleanedDate = cleanDateString(dateString);
            if (!cleanedDate) return '';
            
            const date = new Date(cleanedDate);
            if (isNaN(date.getTime())) return '';
            
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Error converting date to ISO string:', dateString, error);
            return '';
        }
    };

    // Función para convertir fecha EXIF a formato datetime-local seguro
    const safeExifToDateTime = (exifDate: any): string | null => {
        if (!exifDate) return null;
        
        try {
            const date = new Date(exifDate);
            if (isNaN(date.getTime())) return null;
            
            return date.toISOString().slice(0, 16);
        } catch (error) {
            console.warn('Error converting EXIF date:', exifDate, error);
            return null;
        }
    };

    // Función para extraer año de una fecha
    const getPhotoYear = (photo: ImageAI): string => {
        // Usar las propiedades en orden de prioridad
        const rawDateString = photo.fecha || photo.elementos_temporales?.epoca_estimada;
        const dateString = cleanDateString(rawDateString);
        
        if (!dateString) return 'sin fecha';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'sin fecha';
            return date.getFullYear().toString();
        } catch (error) {
            return 'sin fecha';
        }
    };

    // Función para extraer mes de una fecha
    const getPhotoMonth = (photo: ImageAI): string => {
        // Usar las propiedades en orden de prioridad
        const rawDateString = photo.fecha || photo.elementos_temporales?.epoca_estimada;
        const dateString = cleanDateString(rawDateString);
        
        if (!dateString) return 'sin fecha';
        
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

    // Función para obtener años únicos
    const getUniqueYears = (): string[] => {
        const years = photos.map(photo => getPhotoYear(photo));
        const uniqueYears = [...new Set(years)].sort((a, b) => {
            if (a === 'sin fecha') return 1;
            if (b === 'sin fecha') return -1;
            return parseInt(b) - parseInt(a);
        });
        return uniqueYears;
    };

    // Función para obtener meses únicos
    const getUniqueMonths = (): string[] => {
        const months = [
            '01', '02', '03', '04', '05', '06',
            '07', '08', '09', '10', '11', '12'
        ];
        return months;
    };

    // Función para extraer metadatos EXIF de la imagen
    const extractMetadata = async (file: File): Promise<ExifData | null> => {
        try {
            setExtractingMetadata(true);
            console.log('📋 Extrayendo metadatos EXIF de:', file.name);

            const exifData = await exifr.parse(file, {
                tiff: true,
                exif: true,
                gps: true,
                xmp: true,
                iptc: true,
                icc: true
            });

            if (!exifData) {
                console.log('ℹ️ No se encontraron metadatos EXIF en la imagen');
                return null;
            }

            console.log('📋 Metadatos EXIF encontrados:', exifData);

            // Extraer información de fecha/hora
            let dateTime = null;
            if (exifData.DateTimeOriginal) {
                dateTime = safeExifToDateTime(exifData.DateTimeOriginal);
            } else if (exifData.DateTime) {
                dateTime = safeExifToDateTime(exifData.DateTime);
            } else if (exifData.CreateDate) {
                dateTime = safeExifToDateTime(exifData.CreateDate);
            }

            // Extraer información GPS
            let gps = undefined;
            if (exifData.latitude && exifData.longitude) {
                gps = {
                    latitude: exifData.latitude,
                    longitude: exifData.longitude,
                    altitude: exifData.altitude || undefined
                };
            }

            // Extraer información de cámara
            const camera = {
                make: exifData.Make || undefined,
                model: exifData.Model || undefined,
                focalLength: exifData.FocalLength || undefined,
                aperture: exifData.FNumber || undefined,
                iso: exifData.ISO || undefined,
                exposureTime: exifData.ExposureTime ? `1/${Math.round(1/exifData.ExposureTime)}s` : undefined
            };

            // Extraer dimensiones
            const dimensions = {
                width: exifData.ExifImageWidth || exifData.ImageWidth || undefined,
                height: exifData.ExifImageHeight || exifData.ImageHeight || undefined
            };

            const result: ExifData = {
                dateTime: dateTime || undefined,
                gps: Object.keys(gps || {}).length > 0 ? gps : undefined,
                camera: Object.values(camera).some(v => v !== undefined) ? camera : undefined,
                dimensions: Object.values(dimensions).some(v => v !== undefined) ? dimensions : undefined
            };

            console.log('✅ Metadatos procesados:', result);
            return result;

        } catch (error) {
            console.error('❌ Error extrayendo metadatos EXIF:', error);
            return null;
        } finally {
            setExtractingMetadata(false);
        }
    };

    // Función para obtener ubicación desde coordenadas GPS
    const getLocationFromGPS = async (latitude: number, longitude: number): Promise<string> => {
        try {
            // Usar un servicio de geocodificación inversa (aquí usando un ejemplo básico)
            // En producción, se puede usar Google Maps API, OpenStreetMap Nominatim, etc.
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
            );
            
            if (response.ok) {
                const data = await response.json();
                const location = `${data.city || data.locality || ''}, ${data.countryName || ''}`.replace(/^, |, $/, '');
                return location || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
        }
        
        // Fallback a coordenadas
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    };

    // Filtrar fotos
    // Mostrar todas las fotos sin filtros (el agente AI se encarga de la búsqueda)
    const filteredPhotos = photos;

    // Eliminar foto
    const handleDeletePhoto = async (photoId?: string) => {
        if (!photoId) {
            console.error('❌ No photo ID provided for deletion');
            return;
        }
        if (!twinId) {
            alert('Twin ID no disponible. No se puede eliminar la foto.');
            return;
        }

        const confirmed = window.confirm(
            '¿Estás seguro que deseas eliminar esta foto?\n\n' +
            '⚠️ ATENCIÓN: Se eliminará permanentemente:\n' +
            '• La imagen original\n' +
            '• Todo el análisis de IA generado\n' +
            '• Los metadatos y descripciones\n' +
            '• Esta acción NO se puede deshacer\n\n' +
            `ID de la foto: ${photoId}`
        );
        if (!confirmed) return;

        try {
            console.log(`🗑️ Iniciando eliminación de foto:`);
            console.log(`   - Twin ID: ${twinId}`);
            console.log(`   - Photo ID: ${photoId}`);
            console.log(`   - URL que se llamará: DELETE /api/twins/${twinId}/family-photos/${photoId}`);
            
            const response = await twinApiService.deleteFamilyPhoto(twinId, photoId);
            
            console.log('🗑️ Respuesta completa del servidor:', response);
            
            if (response && response.success) {
                // Quitar la foto del estado local
                setPhotos(prev => prev.filter(p => p.id !== photoId));
                alert('✅ Foto eliminada correctamente\n\nSe ha eliminado la foto y todo su contenido de IA asociado.');
                console.log('✅ Foto eliminada exitosamente del estado local');
            } else {
                console.error('❌ Error deleting photo - Response:', response);
                const errorMsg = response?.error || response?.data?.message || response?.data?.errorMessage || 'Error desconocido';
                alert(`❌ No se pudo eliminar la foto:\n${errorMsg}\n\nRevisa la consola para más detalles.`);
            }
        } catch (error) {
            console.error('❌ Exception al eliminar la foto:', error);
            alert('❌ Error eliminando la foto. Revisa la consola para más detalles.');
        }
    };

    // Cargar fotos
    const loadPhotos = async () => {
        if (!twinId || twinIdLoading) {
            console.log('🔄 Esperando TwinID...');
            return;
        }

        try {
            setLoading(true);
            console.log('🔄 Loading family photos for twin:', twinId);
            
            const response = await twinApiService.getFamilyPhotosWithAI(twinId);
            
            if (response.success && response.data?.photos) {
                console.log('✅ Loaded photos:', response.data.photos.length);
                setPhotos(response.data.photos);
            } else {
                console.error('❌ Error loading photos:', response.data?.message || 'Unknown error');
                setPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error loading photos:', error);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar fotos cuando twinId esté disponible
    useEffect(() => {
        if (!twinIdLoading && twinId) {
            loadPhotos();
        } else if (!twinIdLoading && !twinId) {
            console.error('❌ No TwinID available after loading');
            setLoading(false);
        }
    }, [twinId, twinIdLoading]);

    // useEffect para manejar teclas del carousel
    useEffect(() => {
        if (!showCarousel) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prevPhoto();
            } else if (e.key === 'ArrowRight') {
                nextPhoto();
            } else if (e.key === 'Escape') {
                closeCarousel();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showCarousel, filteredPhotos.length]);

    // Simular progreso de IA - ahora será más realista y bonito
    const simulateAiProgress = async (): Promise<void> => {
        return new Promise((resolve) => {
            setShowAiProcessingModal(true);
            setAiProcessingProgress(0);
            
            const steps = [
                { progress: 8, message: '🔍 Conectando con el servidor de IA...', duration: 800 },
                { progress: 18, message: '🧠 Cargando modelos de análisis avanzados...', duration: 1000 },
                { progress: 30, message: '👁️ Preparando análisis de imagen...', duration: 700 },
                { progress: 45, message: '👥 Detectando rostros y personas...', duration: 1200 },
                { progress: 58, message: '🏠 Identificando objetos y lugares...', duration: 900 },
                { progress: 70, message: '🎨 Analizando colores y composición...', duration: 1100 },
                { progress: 82, message: '😊 Reconociendo emociones y expresiones...', duration: 800 },
                { progress: 91, message: '📝 Generando descripción inteligente...', duration: 1000 },
                { progress: 96, message: '🏷️ Creando etiquetas automáticas...', duration: 600 },
                { progress: 98, message: '💾 Procesando metadatos finales...', duration: 400 }
            ];

            let currentStepIndex = 0;

            const executeStep = () => {
                if (currentStepIndex < steps.length) {
                    const step = steps[currentStepIndex];
                    setAiProcessingProgress(step.progress);
                    setAiProcessingStep(step.message);
                    currentStepIndex++;

                    // Añadir variabilidad realista a la duración
                    const variability = Math.random() * 300 + 200; // Entre 200-500ms adicionales
                    setTimeout(() => {
                        executeStep();
                    }, step.duration + variability);
                }
            };

            // Iniciar progreso
            setTimeout(executeStep, 500);
            
            // Resolver después del primer paso para no bloquear la subida
            setTimeout(resolve, 1000);
        });
    };

    // Función para guardar los cambios de la foto editada
    const handleSavePhoto = async () => {
        if (!editingPhoto || !twinId) {
            console.error('❌ No hay foto para editar o twinId no disponible');
            return;
        }

        setSavingPhoto(true);
        
        try {
            console.log('💾 Guardando cambios de foto:', editingPhoto.id);
            
            // IMPORTANTE: Preservar TODOS los datos de la foto original (AI) y solo actualizar campos editables
            const updatedPhotoData = {
                ...editingPhoto, // Preservar todos los datos existentes del AI
                // Solo actualizar los campos que el usuario puede modificar en el formulario
                descripcionUsuario: descriptionRef.current?.value || editingPhoto.descripcionUsuario || '',
                fecha: dateRef.current?.value || editingPhoto.fecha || '',
                places: locationRef.current?.value || editingPhoto.places || '',
                people: peopleRef.current?.value || editingPhoto.people || '',
                category: categoryRef.current?.value || editingPhoto.category || 'familia',
                etiquetas: tagsRef.current?.value || editingPhoto.etiquetas || ''
            };

            console.log('📝 Datos completos a enviar (preservando todo el AI):', updatedPhotoData);
            
            const response = await twinApiService.updateFamilyPhoto(twinId, editingPhoto.id || '', updatedPhotoData);
            
            console.log('✅ Foto actualizada exitosamente:', response);
            
            // Recargar las fotos para ver los cambios
            await loadPhotos();
            
            // Cerrar el modal
            setShowEditModal(false);
            setEditingPhoto(null);
            
            // Mostrar mensaje de éxito
            alert('✅ Foto actualizada exitosamente');
        } catch (error) {
            console.error('❌ Error al guardar cambios:', error);
            alert('❌ Error al guardar los cambios: ' + (error as Error).message);
        } finally {
            setSavingPhoto(false);
        }
    };

    // Manejar subida de archivo
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                setShowUploadModal(true);
                
                // Extraer metadatos EXIF automáticamente
                const metadata = await extractMetadata(file);
                setExtractedExif(metadata);
                
                // Prellenar formulario con metadatos extraídos
                if (metadata) {
                    const newFormData = { ...formData };
                    
                    // Usar fecha extraída si está disponible
                    if (metadata.dateTime) {
                        newFormData.date_taken = metadata.dateTime;
                    }
                    
                    // Usar ubicación GPS si está disponible
                    if (metadata.gps) {
                        try {
                            const location = await getLocationFromGPS(metadata.gps.latitude!, metadata.gps.longitude!);
                            newFormData.location = location;
                        } catch (error) {
                            console.error('Error obteniendo ubicación desde GPS:', error);
                        }
                    }
                    
                    setFormData(newFormData);
                    setShowMetadataSection(true);
                }
            } else {
                alert('Por favor selecciona un archivo de imagen válido.');
            }
        }
    };

    // Función para validar el formulario
    const validateForm = (): boolean => {
        if (!twinId) {
            alert('No se ha podido obtener el identificador del usuario');
            return false;
        }

        if (!formData.date_taken) {
            alert('La fecha y hora son obligatorias');
            return false;
        }

        const selectedDate = new Date(formData.date_taken);
        const now = new Date();
        
        if (selectedDate > now) {
            alert('La fecha no puede ser futura');
            return false;
        }

        const minDate = new Date('1900-01-01');
        if (selectedDate < minDate) {
            alert('La fecha debe ser posterior a 1900');
            return false;
        }

        return true;
    };

    // Subir foto
    const handlePhotoUpload = async () => {
        if (!selectedFile) return;

        // Validar formulario antes de continuar
        if (!validateForm()) {
            return;
        }

        try {
            setUploadingPhoto(true);

            // Iniciar progreso de análisis de IA (no esperar a que termine)
            simulateAiProgress();
            
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
                event_type: formData.event_type,
                // Agregar metadatos EXIF si están disponibles
                exif_data: extractedExif ? JSON.stringify(extractedExif) : undefined
            };

            console.log('🔍 Metadata being sent to backend:', metadata);

            // Actualizar progreso a "Subiendo archivo..."
            setAiProcessingStep('Subiendo archivo al servidor...');
            setAiProcessingProgress(96);

            if (!twinId) {
                throw new Error('Twin ID no disponible');
            }

            const response = await twinApiService.uploadFamilyPhotoWithMetadata(
                twinId,
                selectedFile,
                metadata
            );

            // Finalizar progreso
            setAiProcessingStep('¡Análisis completado exitosamente!');
            setAiProcessingProgress(100);

            if (response.success) {
                console.log('✅ Photo uploaded successfully:', response.data);
                
                // Esperar un momento para mostrar el 100% y luego cerrar
                setTimeout(() => {
                    setShowAiProcessingModal(false);
                    setAiProcessingProgress(0);
                    alert('¡Foto subida exitosamente! 📸');
                    resetForm();
                    loadPhotos(); // Recargar fotos
                }, 1500);
            } else {
                setAiProcessingStep('Error en el análisis');
                setTimeout(() => {
                    setShowAiProcessingModal(false);
                    setAiProcessingProgress(0);
                }, 1000);
                console.error('❌ Upload failed:', response.data?.message || 'Unknown error');
                alert(`Error al subir la foto: ${response.data?.message || 'Error desconocido'}`);
            }
        } catch (error) {
            setAiProcessingStep('Error en el análisis');
            setTimeout(() => {
                setShowAiProcessingModal(false);
                setAiProcessingProgress(0);
            }, 1000);
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
        setExtractedExif(null);
        setShowMetadataSection(false);
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
                                onClick={() => window.location.href = '/fotos-agente'}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                            >
                                <Bot className="w-4 h-4 mr-2" />
                                Twin Fotos Agent
                            </Button>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Foto
                            </Button>
                            <Button
                                onClick={() => filteredPhotos.length > 0 && openCarousel(0)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                                disabled={filteredPhotos.length === 0}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Carrusel
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

                {/* Layout principal */}
                <div className="w-full">
                    {/* Contenido principal */}
                    <div className="w-full">
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
                                                {year} {year !== 'sin fecha' && ` (${photos.filter(p => getPhotoYear(p) === year).length})`}
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
                                        <option value="viajes">Viajes</option>
                                        <option value="celebraciones">Celebraciones</option>
                                        <option value="eventos">Eventos especiales</option>
                                        <option value="cotidiano">Cotidiano</option>
                                        <option value="deportes">Deportes</option>
                                        <option value="trabajo">Trabajo</option>
                                        <option value="amigos">Amigos</option>
                                        <option value="mascotas">Mascotas</option>
                                        <option value="naturaleza">Naturaleza</option>
                                        <option value="hogar">Hogar</option>
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
                                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                                        >
                                            {/* Categoría encima de la foto */}
                                            {photo.descripcion_visual_detallada?.escenario?.tipo_espacio && (
                                                <div className="px-3 py-2 bg-blue-100 text-blue-600 text-sm font-medium text-center">
                                                    {photo.descripcion_visual_detallada.escenario.tipo_espacio}
                                                </div>
                                            )}
                                            
                                            {/* Imagen */}
                                            <div className="aspect-square relative group">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.descripcionGenerica || 'Foto familiar'}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                
                                                {/* Overlay con hover */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                                    {/* Botón centrado - Ver en grande */}
                                                    <Button 
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 hover:bg-gray-100"
                                                        size="sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver en grande
                                                    </Button>

                                                    {/* Botón de eliminar en la esquina superior derecha */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                                                        title="Eliminar foto"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-2 right-2 bg-white text-red-600 hover:bg-red-50 rounded-full p-2 shadow"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Información de la foto */}
                                            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50">
                                                {/* Descripción del usuario - prioridad */}
                                                {photo.descripcionUsuario ? (
                                                    <h4 className="font-semibold text-sm mb-3 line-clamp-2 text-slate-800 leading-relaxed">
                                                        {photo.descripcionUsuario}
                                                    </h4>
                                                ) : (
                                                    <h4 className="font-semibold text-sm mb-3 line-clamp-2 text-slate-800 leading-relaxed">
                                                        {photo.descripcionGenerica || 'Sin descripción'}
                                                    </h4>
                                                )}
                                                
                                                <div className="space-y-3 text-xs">
                                                    {/* Fecha y hora */}
                                                    {photo.fecha && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-indigo-100">
                                                            <Calendar className="w-3 h-3 mr-2 text-indigo-500" />
                                                            <span className="text-gray-700 font-medium">{(() => {
                                                                const cleanDate = cleanDateString(photo.fecha);
                                                                if (!cleanDate) return 'Fecha no disponible';
                                                                try {
                                                                    return new Date(cleanDate).toLocaleDateString();
                                                                } catch {
                                                                    return 'Fecha no válida';
                                                                }
                                                            })()}</span>
                                                            {photo.hora && (
                                                                <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                                    {photo.hora}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Categoría */}
                                                    {photo.category && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-emerald-100">
                                                            <Tag className="w-3 h-3 mr-2 text-emerald-500" />
                                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                                {photo.category}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Personas */}
                                                    {photo.people && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-rose-100">
                                                            <User className="w-3 h-3 mr-2 text-rose-500" />
                                                            <span className="text-gray-700 font-medium truncate">{photo.people}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Lugares */}
                                                    {photo.places && photo.places !== 'no disponible' && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-amber-100">
                                                            <MapPin className="w-3 h-3 mr-2 text-amber-500" />
                                                            <span className="text-gray-700 font-medium truncate">{photo.places}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Tipo de evento */}
                                                    {photo.eventType && photo.eventType !== 'general' && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-purple-100">
                                                            <span className="w-3 h-3 mr-2 text-purple-500">🎉</span>
                                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                                {photo.eventType}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Etiquetas */}
                                                    {photo.etiquetas && photo.etiquetas !== 'no disponible' && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-cyan-100">
                                                            <span className="w-3 h-3 mr-2 text-cyan-500">🏷️</span>
                                                            <span className="text-cyan-700 text-xs font-medium">{photo.etiquetas}</span>
                                                        </div>
                                                    )}

                                                    {/* Nombre del archivo */}
                                                    {photo.fileName && (
                                                        <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                                                            <FileText className="w-3 h-3 mr-2 text-gray-400" />
                                                            <span className="truncate text-gray-500 text-xs">{cleanFileName(photo.fileName)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Botones de acción */}
                                                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {/* Botón de carrusel */}
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openCarousel(index);
                                                            }}
                                                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                                            size="sm"
                                                        >
                                                            <Image className="w-3 h-3 mr-1" />
                                                            <span className="text-xs">Carrusel</span>
                                                        </Button>
                                                        
                                                        {/* Botón de detalles IA */}
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAiPhoto(photo);
                                                            }}
                                                            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                                            size="sm"
                                                        >
                                                            <Brain className="w-3 h-3 mr-1" />
                                                            <span className="text-xs">Detalle IA</span>
                                                        </Button>
                                                    </div>
                                                    
                                                    {/* Botón de editar */}
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPhoto(photo);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                                        size="sm"
                                                    >
                                                        <Edit3 className="w-3 h-3 mr-2" />
                                                        <span className="text-xs">Editar información</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                                        <Camera className="w-6 h-6 mr-2 text-blue-500" />
                                        Agregar Foto Familiar
                                    </h3>
                                    <Button
                                        onClick={resetForm}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Columna izquierda - Vista previa e información */}
                                    <div className="space-y-6">
                                        {/* Vista previa de la imagen */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-lg font-medium mb-3 flex items-center">
                                                <Eye className="w-5 h-5 mr-2" />
                                                Vista Previa
                                            </h4>
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Vista previa"
                                                className="w-full max-h-80 object-contain rounded-lg border"
                                            />
                                            <div className="mt-3 text-sm text-gray-600">
                                                <p><strong>Archivo:</strong> {selectedFile.name}</p>
                                                <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <p><strong>Tipo:</strong> {selectedFile.type}</p>
                                            </div>
                                        </div>

                                        {/* Metadatos EXIF extraídos */}
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-lg font-medium flex items-center">
                                                    <Info className="w-5 h-5 mr-2 text-blue-500" />
                                                    Metadatos Detectados
                                                </h4>
                                                {extractingMetadata && (
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                )}
                                            </div>

                                            {extractingMetadata ? (
                                                <div className="text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                        <span>Analizando metadatos de la imagen...</span>
                                                    </div>
                                                </div>
                                            ) : extractedExif ? (
                                                <div className="space-y-3">
                                                    {extractedExif.dateTime && (
                                                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-2 text-green-500" />
                                                                <span className="text-sm font-medium">Fecha y hora:</span>
                                                            </div>
                                                            <span className="text-sm text-gray-700">
                                                                {new Date(extractedExif.dateTime).toLocaleString()}
                                                            </span>
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        </div>
                                                    )}

                                                    {extractedExif.gps && (
                                                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                                                            <div className="flex items-center">
                                                                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                                                                <span className="text-sm font-medium">Ubicación GPS:</span>
                                                            </div>
                                                            <span className="text-sm text-gray-700">
                                                                {extractedExif.gps.latitude?.toFixed(6)}, {extractedExif.gps.longitude?.toFixed(6)}
                                                            </span>
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        </div>
                                                    )}

                                                    {extractedExif.camera && (
                                                        <div className="p-2 bg-white rounded border">
                                                            <div className="flex items-center mb-2">
                                                                <Camera className="w-4 h-4 mr-2 text-green-500" />
                                                                <span className="text-sm font-medium">Información de cámara:</span>
                                                            </div>
                                                            <div className="text-xs text-gray-600 space-y-1 ml-6">
                                                                {extractedExif.camera.make && (
                                                                    <p><strong>Marca:</strong> {extractedExif.camera.make}</p>
                                                                )}
                                                                {extractedExif.camera.model && (
                                                                    <p><strong>Modelo:</strong> {extractedExif.camera.model}</p>
                                                                )}
                                                                {extractedExif.camera.focalLength && (
                                                                    <p><strong>Distancia focal:</strong> {extractedExif.camera.focalLength}mm</p>
                                                                )}
                                                                {extractedExif.camera.aperture && (
                                                                    <p><strong>Apertura:</strong> f/{extractedExif.camera.aperture}</p>
                                                                )}
                                                                {extractedExif.camera.iso && (
                                                                    <p><strong>ISO:</strong> {extractedExif.camera.iso}</p>
                                                                )}
                                                                {extractedExif.camera.exposureTime && (
                                                                    <p><strong>Velocidad:</strong> {extractedExif.camera.exposureTime}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {extractedExif.dimensions && (
                                                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                                                            <div className="flex items-center">
                                                                <Palette className="w-4 h-4 mr-2 text-green-500" />
                                                                <span className="text-sm font-medium">Dimensiones:</span>
                                                            </div>
                                                            <span className="text-sm text-gray-700">
                                                                {extractedExif.dimensions.width} × {extractedExif.dimensions.height}px
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <Info className="w-4 h-4 text-gray-400" />
                                                        <span>No se encontraron metadatos EXIF en esta imagen</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Columna derecha - Formulario */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                                <Edit3 className="w-5 h-5 mr-2" />
                                                Información de la Foto
                                            </h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <FileText className="w-4 h-4 inline mr-1" />
                                                        Descripción
                                                    </label>
                                                    <Textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                        placeholder="Describe qué hay en la foto..."
                                                        className="min-h-[100px]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Calendar className="w-4 h-4 inline mr-1" />
                                                        Fecha y Hora {extractedExif?.dateTime && <span className="text-green-600 text-xs">(auto-detectada)</span>}
                                                    </label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={formData.date_taken}
                                                        onChange={(e) => setFormData({...formData, date_taken: e.target.value})}
                                                        className={extractedExif?.dateTime ? "border-green-300 bg-green-50" : ""}
                                                    />
                                                    {!formData.date_taken && (
                                                        <p className="text-xs text-red-500 mt-1">La fecha es obligatoria</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <MapPin className="w-4 h-4 inline mr-1" />
                                                        Ubicación {extractedExif?.gps && <span className="text-green-600 text-xs">(auto-detectada)</span>}
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                        placeholder="Dónde fue tomada la foto"
                                                        className={extractedExif?.gps ? "border-green-300 bg-green-50" : ""}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Users className="w-4 h-4 inline mr-1" />
                                                        Personas en la foto
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={formData.people_in_photo}
                                                        onChange={(e) => setFormData({...formData, people_in_photo: e.target.value})}
                                                        placeholder="Nombres de las personas"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            <Tag className="w-4 h-4 inline mr-1" />
                                                            Categoría
                                                        </label>
                                                        <select
                                                            value={formData.category}
                                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="familia">Familia</option>
                                                            <option value="vacaciones">Vacaciones</option>
                                                            <option value="viajes">Viajes</option>
                                                            <option value="celebraciones">Celebraciones</option>
                                                            <option value="eventos">Eventos especiales</option>
                                                            <option value="cotidiano">Cotidiano</option>
                                                            <option value="deportes">Deportes</option>
                                                            <option value="trabajo">Trabajo</option>
                                                            <option value="amigos">Amigos</option>
                                                            <option value="mascotas">Mascotas</option>
                                                            <option value="naturaleza">Naturaleza</option>
                                                            <option value="hogar">Hogar</option>
                                                            <option value="otros">Otros</option>
                                                        </select>
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

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Tag className="w-4 h-4 inline mr-1" />
                                                        Etiquetas
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={formData.tags}
                                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                                        placeholder="cumpleaños, navidad, playa..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex justify-end space-x-3 pt-4 border-t">
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
                        </div>
                    </div>
                )}

                {/* Modal de Progreso de Análisis de IA */}
                {showAiProcessingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
                            <div className="text-center">
                                {/* Icono animado */}
                                <div className="mb-6 relative">
                                    <div className="w-20 h-20 mx-auto mb-4 relative">
                                        {/* Círculo de fondo */}
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                                        
                                        {/* Círculo de progreso animado */}
                                        <svg className="w-20 h-20 transform -rotate-90 absolute inset-0">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="url(#gradient)"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 36}`}
                                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - aiProcessingProgress / 100)}`}
                                                className="transition-all duration-500 ease-out"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3B82F6" />
                                                    <stop offset="50%" stopColor="#8B5CF6" />
                                                    <stop offset="100%" stopColor="#EC4899" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        
                                        {/* Icono central animado */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Bot className="w-8 h-8 text-blue-500 animate-pulse" />
                                        </div>
                                    </div>
                                    
                                    {/* Partículas flotantes */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                                        <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                                        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                                        <div className="absolute bottom-4 right-4 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                                    </div>
                                </div>

                                {/* Título y descripción */}
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Análisis de IA en progreso</h3>
                                <p className="text-gray-600 mb-6">Analizando tu foto para obtener la mejor información posible</p>

                                {/* Barra de progreso moderna */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">Progreso del análisis</span>
                                        <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                            {aiProcessingProgress}%
                                        </span>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div 
                                            className="h-4 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
                                            style={{ width: `${aiProcessingProgress}%` }}
                                        >
                                            {/* Brillo animado en la barra */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado actual con animación */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        <span className="text-gray-700 font-medium">{aiProcessingStep}</span>
                                    </div>
                                </div>

                                {/* Lista de características */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 text-left">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">🎯 Análisis en tiempo real</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">👥 Detección de personas</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">🏠 Identificación de objetos</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">🎨 Análisis de colores</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">😊 Reconocimiento emocional</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">📝 Descripción inteligente</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-700">🏷️ Etiquetas automáticas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mensaje informativo */}
                                <div className="mt-6 text-sm text-gray-500 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>El análisis puede tomar varios segundos para obtener los mejores resultados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de detalle de foto */}
                {selectedAiPhoto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[95vw] h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header fijo */}
                            <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-white">
                                <div className="min-w-0 flex-1 mr-4">
                                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                                        {cleanFileName(selectedAiPhoto.fileName) || 'Detalle de foto'}
                                    </h3>
                                    {selectedAiPhoto.fecha && (
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            {(() => {
                                                const cleanDate = cleanDateString(selectedAiPhoto.fecha);
                                                if (!cleanDate) return 'Fecha no disponible';
                                                try {
                                                    return new Date(cleanDate).toLocaleDateString();
                                                } catch {
                                                    return 'Fecha no válida';
                                                }
                                            })()}
                                            {selectedAiPhoto.hora && ` • ${selectedAiPhoto.hora}`}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setSelectedAiPhoto(null)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Contenido principal con scroll */}
                            <div className="flex-1 overflow-hidden">
                                <div className="h-full flex flex-col md:flex-row">
                                    {/* Imagen - arriba en móvil/tablet, izquierda en desktop */}
                                    <div className="w-full md:w-1/3 lg:w-1/4 h-48 sm:h-56 md:h-full bg-gray-100 flex items-center justify-center p-2 sm:p-4">
                                        <img
                                            src={selectedAiPhoto.url}
                                            alt={selectedAiPhoto.descripcionGenerica || 'Foto familiar'}
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                        />
                                    </div>

                                    {/* Información - abajo en móvil/tablet, derecha en desktop */}
                                    <div className="flex-1 md:w-2/3 lg:w-3/4 overflow-y-auto">
                                        <div className="p-2 sm:p-4 lg:p-6">
                                            {selectedAiPhoto.pictureContentHTML ? (
                                                <div>
                                                    <h4 className="font-medium text-gray-800 mb-2 sm:mb-4 flex items-center text-sm sm:text-base">
                                                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
                                                        Análisis Detallado de IA
                                                    </h4>
                                                    <div 
                                                        className="w-full overflow-hidden"
                                                        style={{ 
                                                            fontSize: window.innerWidth < 640 ? '12px' : window.innerWidth < 768 ? '13px' : '14px',
                                                            lineHeight: '1.4'
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: selectedAiPhoto.pictureContentHTML }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Mensaje de debug (puedes comentar en producción) */}
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                                                        <p className="text-yellow-800">
                                                            <strong>Debug:</strong> pictureContentHTML {selectedAiPhoto.pictureContentHTML ? 'presente' : 'no disponible'}
                                                        </p>
                                                        {selectedAiPhoto.pictureContentHTML && (
                                                            <p className="text-yellow-600 mt-1">
                                                                Longitud: {selectedAiPhoto.pictureContentHTML.length} caracteres
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                                                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                                                            Descripción General
                                                        </h4>
                                                        <div className="bg-blue-50 p-2 sm:p-4 rounded-lg border border-blue-200">
                                                            <p className="text-gray-700 text-sm sm:text-base">
                                                                {selectedAiPhoto.descripcionGenerica || selectedAiPhoto.descripcionDetallada || 'No hay descripción disponible'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {selectedAiPhoto.elementos_temporales && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                                <Clock className="w-5 h-5 mr-2 text-green-500" />
                                                                Información Temporal
                                                            </h4>
                                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm space-y-2">
                                                                {selectedAiPhoto.elementos_temporales.estacion_probable && (
                                                                    <p><strong>Estación:</strong> {selectedAiPhoto.elementos_temporales.estacion_probable}</p>
                                                                )}
                                                                {selectedAiPhoto.elementos_temporales.momento_dia && (
                                                                    <p><strong>Momento del día:</strong> {selectedAiPhoto.elementos_temporales.momento_dia}</p>
                                                                )}
                                                                {selectedAiPhoto.elementos_temporales.epoca_estimada && (
                                                                    <p><strong>Época estimada:</strong> {selectedAiPhoto.elementos_temporales.epoca_estimada}</p>
                                                                )}
                                                                {selectedAiPhoto.elementos_temporales.indicadores_temporales?.length > 0 && (
                                                                    <div>
                                                                        <p><strong>Indicadores:</strong></p>
                                                                        <ul className="list-disc list-inside ml-2 text-gray-600">
                                                                            {selectedAiPhoto.elementos_temporales.indicadores_temporales.map((indicator, i) => (
                                                                                <li key={i}>{indicator}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedAiPhoto.descripcion_visual_detallada && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                                <Eye className="w-5 h-5 mr-2 text-purple-500" />
                                                                Análisis Visual Detallado
                                                            </h4>
                                                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-sm space-y-3">
                                                                {selectedAiPhoto.descripcion_visual_detallada.personas && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p className="font-medium text-purple-800 mb-2">👥 Personas:</p>
                                                                        <p className="text-gray-700">{selectedAiPhoto.descripcion_visual_detallada.personas.descripcion}</p>
                                                                        {selectedAiPhoto.descripcion_visual_detallada.personas.cantidad && (
                                                                            <p className="text-sm text-gray-600 mt-1">Cantidad: {selectedAiPhoto.descripcion_visual_detallada.personas.cantidad}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.descripcion_visual_detallada.escenario && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p className="font-medium text-purple-800 mb-2">🏞️ Escenario:</p>
                                                                        <p className="text-gray-700"><strong>Ubicación:</strong> {selectedAiPhoto.descripcion_visual_detallada.escenario.ubicacion}</p>
                                                                        <p className="text-gray-700"><strong>Tipo:</strong> {selectedAiPhoto.descripcion_visual_detallada.escenario.tipo_espacio}</p>
                                                                        <p className="text-gray-700"><strong>Ambiente:</strong> {selectedAiPhoto.descripcion_visual_detallada.escenario.ambiente}</p>
                                                                        {selectedAiPhoto.descripcion_visual_detallada.escenario.iluminacion && (
                                                                            <p className="text-gray-700"><strong>Iluminación:</strong> {selectedAiPhoto.descripcion_visual_detallada.escenario.iluminacion}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.descripcion_visual_detallada.objetos?.length > 0 && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p className="font-medium text-purple-800 mb-2">🏷️ Objetos destacados:</p>
                                                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                                                            {selectedAiPhoto.descripcion_visual_detallada.objetos.map((objeto, i) => (
                                                                                <li key={i}>
                                                                                    <strong>{objeto.nombre}:</strong> {objeto.descripcion}
                                                                                    {objeto.ubicacion && ` (${objeto.ubicacion})`}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.descripcion_visual_detallada.colores && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p className="font-medium text-purple-800 mb-2">🎨 Colores:</p>
                                                                        <p className="text-gray-700"><strong>Paleta general:</strong> {selectedAiPhoto.descripcion_visual_detallada.colores.paleta_general}</p>
                                                                        {selectedAiPhoto.descripcion_visual_detallada.colores.dominantes?.length > 0 && (
                                                                            <p className="text-gray-700"><strong>Colores dominantes:</strong> {selectedAiPhoto.descripcion_visual_detallada.colores.dominantes.join(', ')}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedAiPhoto.contexto_emocional && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                                <span className="text-lg mr-2">😊</span>
                                                                Contexto Emocional
                                                            </h4>
                                                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-sm space-y-2">
                                                                {selectedAiPhoto.contexto_emocional.energia_nivel && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p><strong>Nivel de energía:</strong> {selectedAiPhoto.contexto_emocional.energia_nivel}</p>
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.contexto_emocional.ambiente_general && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p><strong>Ambiente general:</strong> {selectedAiPhoto.contexto_emocional.ambiente_general}</p>
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.contexto_emocional.emociones_detectadas?.length > 0 && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p><strong>Emociones detectadas:</strong></p>
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {selectedAiPhoto.contexto_emocional.emociones_detectadas.map((emotion, i) => (
                                                                                <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                                                                    {emotion}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedAiPhoto.contexto_emocional.formalidad && (
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p><strong>Nivel de formalidad:</strong> {selectedAiPhoto.contexto_emocional.formalidad}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedAiPhoto.detalles_memorables && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                                <span className="text-lg mr-2">✨</span>
                                                                Detalles Memorables
                                                            </h4>
                                                            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 text-sm">
                                                                <div className="bg-white p-3 rounded border">
                                                                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                                                                        {JSON.stringify(selectedAiPhoto.detalles_memorables, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de edición de foto */}
                {showEditModal && editingPhoto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                                        <Edit3 className="w-6 h-6 mr-2 text-blue-500" />
                                        Editar Información de Foto
                                    </h3>
                                    <Button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingPhoto(null);
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Vista previa de la imagen */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-lg font-medium mb-3 flex items-center">
                                                <Eye className="w-5 h-5 mr-2" />
                                                Vista Previa
                                            </h4>
                                            <img
                                                src={editingPhoto.url}
                                                alt={editingPhoto.descripcionGenerica || 'Foto'}
                                                className="w-full max-h-80 object-contain rounded-lg border"
                                            />
                                            <div className="mt-3 text-sm text-gray-600">
                                                <p><strong>Archivo:</strong> {cleanFileName(editingPhoto.fileName)}</p>
                                                {editingPhoto.fecha && (
                                                    <p><strong>Fecha:</strong> {(() => {
                                                        const cleanDate = cleanDateString(editingPhoto.fecha);
                                                        return cleanDate || 'Fecha no disponible';
                                                    })()}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Formulario de edición */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                                <Edit3 className="w-5 h-5 mr-2" />
                                                Información Editable
                                            </h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <FileText className="w-4 h-4 inline mr-1" />
                                                        Descripción
                                                    </label>
                                                    <Textarea
                                                        ref={descriptionRef}
                                                        defaultValue={editingPhoto.descripcionUsuario || ''}
                                                        placeholder="Describe qué hay en la foto..."
                                                        className="min-h-[100px]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Calendar className="w-4 h-4 inline mr-1" />
                                                        Fecha
                                                    </label>
                                                    <Input
                                                        ref={dateRef}
                                                        type="date"
                                                        defaultValue={safeToISOString(editingPhoto.fecha)}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <MapPin className="w-4 h-4 inline mr-1" />
                                                        Ubicación
                                                    </label>
                                                    <Input
                                                        ref={locationRef}
                                                        type="text"
                                                        defaultValue={editingPhoto.places || ''}
                                                        placeholder="Dónde fue tomada la foto"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Users className="w-4 h-4 inline mr-1" />
                                                        Personas en la foto
                                                    </label>
                                                    <Input
                                                        ref={peopleRef}
                                                        type="text"
                                                        defaultValue={editingPhoto.people || ''}
                                                        placeholder="Nombres de las personas"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Tag className="w-4 h-4 inline mr-1" />
                                                        Categoría
                                                    </label>
                                                    <select
                                                        ref={categoryRef}
                                                        defaultValue={(editingPhoto as any).category || 'familia'}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="familia">Familia</option>
                                                        <option value="vacaciones">Vacaciones</option>
                                                        <option value="viajes">Viajes</option>
                                                        <option value="celebraciones">Celebraciones</option>
                                                        <option value="eventos">Eventos especiales</option>
                                                        <option value="cotidiano">Cotidiano</option>
                                                        <option value="deportes">Deportes</option>
                                                        <option value="trabajo">Trabajo</option>
                                                        <option value="amigos">Amigos</option>
                                                        <option value="mascotas">Mascotas</option>
                                                        <option value="naturaleza">Naturaleza</option>
                                                        <option value="hogar">Hogar</option>
                                                        <option value="otros">Otros</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        <Tag className="w-4 h-4 inline mr-1" />
                                                        Etiquetas
                                                    </label>
                                                    <Input
                                                        ref={tagsRef}
                                                        type="text"
                                                        defaultValue={editingPhoto.etiquetas || ''}
                                                        placeholder="cumpleaños, navidad, playa..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex justify-end space-x-3 pt-4 border-t">
                                            <Button
                                                onClick={() => {
                                                    setShowEditModal(false);
                                                    setEditingPhoto(null);
                                                }}
                                                variant="outline"
                                                disabled={savingPhoto}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleSavePhoto}
                                                disabled={savingPhoto}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {savingPhoto ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Guardar Cambios
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Carrusel de fotos */}
                {showCarousel && filteredPhotos.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Botón cerrar */}
                            <button
                                onClick={closeCarousel}
                                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Botón anterior */}
                            <button
                                onClick={prevPhoto}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                            >
                                <ChevronDown className="w-8 h-8 transform rotate-90" />
                            </button>

                            {/* Botón siguiente */}
                            <button
                                onClick={nextPhoto}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                            >
                                <ChevronDown className="w-8 h-8 transform -rotate-90" />
                            </button>

                            {/* Contenido principal del carrusel */}
                            <div className="flex flex-col items-center justify-center w-full h-full p-4">
                                {/* Imagen principal */}
                                <div className="relative max-w-4xl max-h-[70vh] mb-4">
                                    <img
                                        src={filteredPhotos[currentCarouselIndex]?.url}
                                        alt={filteredPhotos[currentCarouselIndex]?.descripcionGenerica || 'Foto'}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    />
                                </div>

                                {/* Información de la foto */}
                                <div className="bg-white bg-opacity-95 rounded-lg p-4 max-w-2xl w-full">
                                    <div className="text-center">
                                        {/* Título */}
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                            {filteredPhotos[currentCarouselIndex]?.descripcionUsuario || 
                                             filteredPhotos[currentCarouselIndex]?.descripcionGenerica || 
                                             'Sin descripción'}
                                        </h3>

                                        {/* Información básica en grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                            {/* Fecha */}
                                            {filteredPhotos[currentCarouselIndex]?.fecha && (
                                                <div className="flex items-center justify-center bg-indigo-50 rounded-lg p-2">
                                                    <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                                                    <span className="text-gray-700">
                                                        {(() => {
                                                            const cleanDate = cleanDateString(filteredPhotos[currentCarouselIndex].fecha);
                                                            if (!cleanDate) return 'Fecha no disponible';
                                                            try {
                                                                return new Date(cleanDate).toLocaleDateString();
                                                            } catch {
                                                                return 'Fecha no válida';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Hora */}
                                            {filteredPhotos[currentCarouselIndex]?.hora && (
                                                <div className="flex items-center justify-center bg-blue-50 rounded-lg p-2">
                                                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                                    <span className="text-gray-700">
                                                        {filteredPhotos[currentCarouselIndex].hora}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Categoría */}
                                            {filteredPhotos[currentCarouselIndex]?.category && (
                                                <div className="flex items-center justify-center bg-emerald-50 rounded-lg p-2">
                                                    <Tag className="w-4 h-4 mr-2 text-emerald-600" />
                                                    <span className="text-gray-700">
                                                        {filteredPhotos[currentCarouselIndex].category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Personas y lugares */}
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            {filteredPhotos[currentCarouselIndex]?.people && (
                                                <div className="flex items-center justify-center bg-rose-50 rounded-lg p-2">
                                                    <User className="w-4 h-4 mr-2 text-rose-600" />
                                                    <span className="text-gray-700 truncate">
                                                        {filteredPhotos[currentCarouselIndex].people}
                                                    </span>
                                                </div>
                                            )}

                                            {filteredPhotos[currentCarouselIndex]?.places && 
                                             filteredPhotos[currentCarouselIndex]?.places !== 'no disponible' && (
                                                <div className="flex items-center justify-center bg-amber-50 rounded-lg p-2">
                                                    <MapPin className="w-4 h-4 mr-2 text-amber-600" />
                                                    <span className="text-gray-700 truncate">
                                                        {filteredPhotos[currentCarouselIndex].places}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Contador de fotos */}
                                        <div className="mt-4 text-xs text-gray-500">
                                            {currentCarouselIndex + 1} de {filteredPhotos.length}
                                        </div>
                                    </div>
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