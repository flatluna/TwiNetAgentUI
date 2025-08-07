import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService } from "@/services/twinApiService";
import { 
    Upload, 
    Camera, 
    Users, 
    Calendar, 
    MapPin, 
    Trash2,
    Edit3,
    Eye,
    X,
    Tag,
    Download,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Maximize2
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
    display_url?: string; // For displaying images via proxy
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
    event_type: string; // Added for folder structure
}

const FotosFamiliaresPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<FamilyPhoto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('todas');
    const [selectedYear, setSelectedYear] = useState<string>('todos');
    const [selectedMonth, setSelectedMonth] = useState<string>('todos');
    const [selectedCountry, setSelectedCountry] = useState<string>('todos');
    const [selectedDestination, setSelectedDestination] = useState<string>('todos');
    const [otherLocation, setOtherLocation] = useState<string>('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<FamilyPhoto | null>(null);
    const [showCarousel, setShowCarousel] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PhotoFormData>({
        description: '',
        date_taken: new Date().toISOString().split('T')[0],
        location: '',
        country: 'todos',
        place: 'todos',
        people_in_photo: '',
        tags: '',
        category: 'familia',
        event_type: 'general'
    });

    // Get Twin ID from authentication
    const getTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Load family photos on component mount
    useEffect(() => {
        loadFamilyPhotos();
    }, []);

    // Keyboard controls for carousel
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!showCarousel) return;
            
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    handlePreviousPhoto();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleNextPhoto();
                    break;
                case 'Escape':
                    event.preventDefault();
                    handleCloseCarousel();
                    break;
            }
        };

        if (showCarousel) {
            document.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [showCarousel]);

    const loadFamilyPhotos = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        try {
            console.log('🔄 Cargando fotos familiares para Twin:', twinId);
            
            // Use the updated family photos API endpoint
            const response = await twinApiService.getFamilyPhotos(twinId);
            
            if (response.success && response.data && response.data.photos) {
                const photosWithUrls = response.data.photos.map(photo => ({
                    // Map new backend structure to existing frontend structure
                    photo_id: photo.id,
                    photo_url: photo.photoUrl, // Use the photoUrl from backend
                    description: photo.description,
                    date_taken: photo.dateTaken,
                    location: photo.location,
                    country: photo.country,
                    place: photo.place,
                    people_in_photo: photo.peopleInPhoto,
                    tags: photo.tags,
                    category: photo.category.toLowerCase() as 'familia' | 'eventos' | 'vacaciones' | 'celebraciones' | 'cotidiano',
                    uploaded_at: photo.uploadDate,
                    file_size: photo.fileSize,
                    filename: photo.fileName,
                    // Use photoUrl directly from backend
                    display_url: photo.photoUrl
                }));
                setPhotos(photosWithUrls);
                console.log('✅ Fotos familiares cargadas:', photosWithUrls.length);
                console.log('📸 Primera foto con datos completos:', photosWithUrls[0]);
                console.log('🔍 Campos de ubicación de la primera foto:', {
                    location: photosWithUrls[0]?.location,
                    country: photosWithUrls[0]?.country,
                    place: photosWithUrls[0]?.place
                });
            } else {
                console.error('❌ Error cargando fotos familiares:', response.error);
                setPhotos([]);
            }
        } catch (error) {
            console.error('❌ Error en loadFamilyPhotos:', error);
            setPhotos([]);
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

    // Países populares y sus destinos
    const popularCountries = {
        'todos': { name: 'Todos los países', destinations: [] },
        'usa': { 
            name: 'Estados Unidos', 
            destinations: [
                'New York', 'Los Angeles', 'Miami', 'Las Vegas', 'San Francisco', 
                'Chicago', 'Orlando', 'Washington DC', 'Boston', 'Seattle'
            ]
        },
        'mexico': { 
            name: 'México', 
            destinations: [
                'Cancún', 'Playa del Carmen', 'Ciudad de México', 'Guadalajara', 
                'Puerto Vallarta', 'Acapulco', 'Monterrey', 'Tulum', 'Oaxaca', 'Mérida'
            ]
        },
        'francia': { 
            name: 'Francia', 
            destinations: [
                'París', 'Niza', 'Lyon', 'Marsella', 'Cannes', 'Burdeos', 
                'Toulouse', 'Estrasburgo', 'Montpellier', 'Lille'
            ]
        },
        'espana': { 
            name: 'España', 
            destinations: [
                'Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Bilbao', 
                'Granada', 'Málaga', 'Palma de Mallorca', 'Las Palmas', 'Zaragoza'
            ]
        },
        'italia': { 
            name: 'Italia', 
            destinations: [
                'Roma', 'Milán', 'Venecia', 'Florencia', 'Nápoles', 
                'Turín', 'Palermo', 'Génova', 'Bolonia', 'Bari'
            ]
        },
        'reino_unido': { 
            name: 'Reino Unido', 
            destinations: [
                'Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol', 
                'Leeds', 'Sheffield', 'Newcastle', 'Nottingham', 'Leicester'
            ]
        },
        'alemania': { 
            name: 'Alemania', 
            destinations: [
                'Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Frankfurt', 
                'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'
            ]
        },
        'japon': { 
            name: 'Japón', 
            destinations: [
                'Tokio', 'Osaka', 'Kioto', 'Yokohama', 'Kobe', 
                'Nagoya', 'Sapporo', 'Fukuoka', 'Hiroshima', 'Sendai'
            ]
        },
        'canada': { 
            name: 'Canadá', 
            destinations: [
                'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 
                'Edmonton', 'Quebec City', 'Winnipeg', 'Hamilton', 'Victoria'
            ]
        },
        'australia': { 
            name: 'Australia', 
            destinations: [
                'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 
                'Gold Coast', 'Canberra', 'Newcastle', 'Darwin', 'Hobart'
            ]
        }
    };

    // Función auxiliar para extraer año de una fecha
    const getPhotoYear = (dateString: string): string => {
        if (!dateString) return 'unknown';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'unknown' : date.getFullYear().toString();
    };

    // Función auxiliar para extraer mes de una fecha
    const getPhotoMonth = (dateString: string): string => {
        if (!dateString) return 'unknown';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'unknown' : (date.getMonth() + 1).toString().padStart(2, '0');
    };

    // Obtener años únicos de las fotos
    const availableYears = React.useMemo(() => {
        const years = new Set<string>();
        photos.forEach(photo => {
            const year = getPhotoYear(photo.date_taken);
            years.add(year);
        });
        return Array.from(years).sort((a, b) => {
            if (a === 'unknown') return 1;
            if (b === 'unknown') return -1;
            return parseInt(b) - parseInt(a); // Orden descendente
        });
    }, [photos]);

    // Obtener meses únicos de las fotos (del año seleccionado si aplica)
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        const photosToCheck = selectedYear === 'todos' 
            ? photos 
            : photos.filter(photo => getPhotoYear(photo.date_taken) === selectedYear);
        
        photosToCheck.forEach(photo => {
            const month = getPhotoMonth(photo.date_taken);
            months.add(month);
        });
        return Array.from(months).sort((a, b) => {
            if (a === 'unknown') return 1;
            if (b === 'unknown') return -1;
            return parseInt(b) - parseInt(a); // Orden descendente
        });
    }, [photos, selectedYear]);

    // Mapeo de números de mes a nombres
    const monthNames: { [key: string]: string } = {
        '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
        '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
        '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
        'unknown': 'Sin fecha'
    };

    // Función auxiliar para normalizar ubicaciones para comparación
    const normalizeLocation = (location: string): string => {
        return location.toLowerCase().trim().replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n');
    };

    // Función auxiliar para verificar si una foto coincide con el filtro de ubicación
    const matchesLocationFilter = (photo: FamilyPhoto): boolean => {
        // Sin filtros de ubicación, mostrar todas
        if (selectedCountry === 'todos' && selectedDestination === 'todos' && otherLocation.trim() === '') {
            return true;
        }

        // Si hay texto en "otro lugar", buscar en todos los campos
        if (otherLocation.trim() !== '') {
            const searchTerm = normalizeLocation(otherLocation);
            const allText = [
                photo.location || '',
                photo.country || '',
                photo.place || ''
            ].join(' ');
            return normalizeLocation(allText).includes(searchTerm);
        }
        
        // Filtros por país y destino
        let countryMatches = true;
        let destinationMatches = true;
        
        // Verificar país
        if (selectedCountry !== 'todos') {
            const countryData = popularCountries[selectedCountry as keyof typeof popularCountries];
            if (countryData) {
                // Comparar el nombre del país directamente
                countryMatches = normalizeLocation(photo.country || '') === normalizeLocation(countryData.name);
                console.log('🔍 País:', {
                    photoCountry: photo.country,
                    selectedCountryName: countryData.name,
                    matches: countryMatches
                });
            } else {
                countryMatches = false;
            }
        }
        
        // Verificar destino (solo si hay país seleccionado)
        if (selectedCountry !== 'todos' && selectedDestination !== 'todos') {
            // Comparar el destino directamente
            destinationMatches = normalizeLocation(photo.place || '') === normalizeLocation(selectedDestination);
            console.log('🔍 Destino:', {
                photoPlace: photo.place,
                selectedDestination,
                matches: destinationMatches
            });
        }
        
        const result = countryMatches && destinationMatches;
        console.log('📍 Resultado final:', {
            photoId: photo.photo_id,
            country: photo.country,
            place: photo.place,
            countryMatches,
            destinationMatches,
            result
        });
        
        return result;
    };

    // Obtener destinos disponibles según el país seleccionado
    const availableDestinations = React.useMemo(() => {
        if (selectedCountry === 'todos') return [];
        const countryData = popularCountries[selectedCountry as keyof typeof popularCountries];
        return countryData?.destinations || [];
    }, [selectedCountry]);

    // Filtrado principal que combina categoría, año, mes y ubicación
    const filteredPhotos = React.useMemo(() => {
        return photos.filter(photo => {
            // Filtro por categoría
            const categoryMatch = selectedCategory === 'todas' || photo.category === selectedCategory;
            
            // Filtro por año
            const photoYear = getPhotoYear(photo.date_taken);
            const yearMatch = selectedYear === 'todos' || photoYear === selectedYear;
            
            // Filtro por mes
            const photoMonth = getPhotoMonth(photo.date_taken);
            const monthMatch = selectedMonth === 'todos' || photoMonth === selectedMonth;
            
            // Filtro por ubicación
            const locationMatch = matchesLocationFilter(photo);
            
            return categoryMatch && yearMatch && monthMatch && locationMatch;
        });
    }, [photos, selectedCategory, selectedYear, selectedMonth, selectedCountry, selectedDestination, otherLocation]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setShowUploadModal(true);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Si el usuario está escribiendo en el campo de ubicación, resetear selectores
        if (name === 'location') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Solo resetear si realmente está escribiendo algo diferente
                country: value !== prev.location ? 'todos' : prev.country,
                place: value !== prev.location ? 'todos' : prev.place
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryValue = e.target.value;
        setFormData(prev => ({
            ...prev,
            country: countryValue,
            place: 'todos' // Reset destino cuando cambia país
            // NO copiamos automáticamente el país al campo location
        }));
    };

    const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const destinationValue = e.target.value;
        setFormData(prev => ({
            ...prev,
            place: destinationValue
            // NO copiamos automáticamente el destino al campo location
        }));
    };

    // Obtener destinos disponibles para el formulario
    const formAvailableDestinations = React.useMemo(() => {
        if (formData.country === 'todos') return [];
        const countryData = popularCountries[formData.country as keyof typeof popularCountries];
        return countryData?.destinations || [];
    }, [formData.country]);

    const handleSavePhoto = async () => {
        if (!selectedFile) return;

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        try {
            setIsLoading(true);
            console.log('📷 Uploading family photo...');

            // Prepare metadata for new API
            const metadata = {
                description: formData.description,
                date_taken: formData.date_taken,
                location: formData.location,
                country: formData.country !== 'todos' ? 
                    (popularCountries[formData.country as keyof typeof popularCountries]?.name || formData.country) : '',
                place: formData.place !== 'todos' ? formData.place : '',
                people_in_photo: formData.people_in_photo,
                category: formData.category,
                tags: formData.tags,
                event_type: formData.event_type
            };

            // Debug: Log the form data and metadata being sent
            console.log('🔍 Form Data:', formData);
            console.log('🔍 Metadata being sent to backend:', metadata);

            // Use the new API endpoint with FormData
            const response = await twinApiService.uploadFamilyPhotoWithMetadata(
                twinId,
                selectedFile,
                metadata
            );

            if (response.success && response.data) {
                console.log('✅ Photo uploaded successfully:', response.data);
                
                // Create new photo object for local state
                const newPhoto: FamilyPhoto = {
                    photo_id: response.data.photo_id,
                    photo_url: response.data.photo_url,
                    description: formData.description,
                    date_taken: formData.date_taken,
                    location: formData.location,
                    country: formData.country !== 'todos' ? 
                        (popularCountries[formData.country as keyof typeof popularCountries]?.name || formData.country) : '',
                    place: formData.place !== 'todos' ? formData.place : '',
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
            } else {
                console.error('❌ Error uploading photo:', response.error);
                alert('Error al subir la foto: ' + response.error);
            }
        } catch (error) {
            console.error('❌ Error in handleSavePhoto:', error);
            alert('Error al subir la foto. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para ver detalles de la foto
    const handleViewPhoto = (photo: FamilyPhoto) => {
        setViewingPhoto(photo);
    };

    // Función para eliminar foto
    const handleDeletePhoto = async (photoId: string) => {
        const photoToDelete = photos.find(p => p.photo_id === photoId);
        if (!photoToDelete) {
            console.error('❌ Foto no encontrada para eliminar');
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar la foto "${photoToDelete.filename || 'sin nombre'}"?`)) {
            return;
        }

        const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
        const twinId = msalUser?.localAccountId;

        if (!twinId) {
            console.error('❌ No Twin ID disponible para eliminar foto');
            alert('Error: No se pudo identificar el usuario.');
            return;
        }

        try {
            setDeletingPhotoId(photoId); // Marcar foto como eliminándose
            console.log('🗑️ Eliminando foto:', photoId);
            
            const response = await twinApiService.deleteFamilyPhoto(twinId, photoId);
            
            if (response.success) {
                console.log('✅ Foto eliminada exitosamente:', response.data?.message);
                // Actualizar la UI eliminando la foto del estado local
                setPhotos(prevPhotos => prevPhotos.filter(photo => photo.photo_id !== photoId));
                
                // Si estamos viendo esta foto en el modal, cerrarlo
                if (viewingPhoto?.photo_id === photoId) {
                    setViewingPhoto(null);
                }
                
                alert('Foto eliminada exitosamente');
            } else {
                console.error('❌ Error eliminando foto:', response.error);
                alert('Error al eliminar la foto: ' + response.error);
            }
        } catch (error) {
            console.error('❌ Error en handleDeletePhoto:', error);
            alert('Error al eliminar la foto. Por favor, inténtalo de nuevo.');
        } finally {
            setDeletingPhotoId(null); // Limpiar estado de eliminación
        }
    };

    // Función para descargar foto
    const handleDownloadPhoto = async (photo: FamilyPhoto) => {
        try {
            const response = await fetch(photo.display_url || photo.photo_url);
            if (!response.ok) {
                throw new Error('Error al descargar la imagen');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = photo.filename || `foto_${photo.photo_id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading photo:', error);
            alert('Error al descargar la foto. Por favor, inténtalo de nuevo.');
        }
    };

    // Función para abrir carrusel
    const handleOpenCarousel = (photo: FamilyPhoto) => {
        const photoIndex = filteredPhotos.findIndex(p => p.photo_id === photo.photo_id);
        setCurrentPhotoIndex(photoIndex);
        setShowCarousel(true);
    };

    // Función para abrir carrusel globalmente (desde la primera foto)
    const handleOpenCarouselGlobal = () => {
        if (filteredPhotos.length > 0) {
            setCurrentPhotoIndex(0);
            setShowCarousel(true);
        }
    };

    // Función para navegar a la foto anterior
    const handlePreviousPhoto = () => {
        setCurrentPhotoIndex(prev => 
            prev === 0 ? filteredPhotos.length - 1 : prev - 1
        );
    };

    // Función para navegar a la siguiente foto
    const handleNextPhoto = () => {
        setCurrentPhotoIndex(prev => 
            prev === filteredPhotos.length - 1 ? 0 : prev + 1
        );
    };

    // Función para cerrar carrusel
    const handleCloseCarousel = () => {
        setShowCarousel(false);
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFormData({
            description: '',
            date_taken: new Date().toISOString().split('T')[0],
            location: '',
            country: 'todos',
            place: 'todos',
            people_in_photo: '',
            tags: '',
            category: 'familia',
            event_type: 'general'
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
                                        {new Set(photos.map(p => p.people_in_photo).filter(Boolean).flatMap(p => p!.split(',').map(person => person.trim()))).size}
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
                                        {new Set(photos.map(p => new Date(p.date_taken).getFullYear())).size}
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
                                        {new Set(photos.map(p => p.location)).size}
                                    </h3>
                                    <p className="text-sm text-gray-600">Lugares</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón global para carrusel - movido arriba */}
                    {filteredPhotos.length > 0 && (
                        <div className="mb-6">
                            <Button
                                onClick={handleOpenCarouselGlobal}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 text-base font-medium"
                            >
                                <Maximize2 size={20} />
                                <span>Ver todas las fotos en carrusel ({filteredPhotos.length})</span>
                            </Button>
                        </div>
                    )}

                    {/* Filtros por categoría */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros</h3>
                        
                        {/* Filtros de categoría */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Por Categoría:</h4>
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

                        {/* Filtros de año y mes */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Filtro por Año */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Por Año:</h4>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setSelectedMonth('todos'); // Reset mes cuando cambia año
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los años</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>
                                                {year === 'unknown' ? 'Sin fecha' : year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Mes */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Por Mes:</h4>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={selectedYear === 'todos' && availableMonths.length === 0}
                                    >
                                        <option value="todos">Todos los meses</option>
                                        {availableMonths.map(month => (
                                            <option key={month} value={month}>
                                                {monthNames[month] || month}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Filtros de ubicación */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Por Ubicación:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Filtro por País */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">País:</label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => {
                                            setSelectedCountry(e.target.value);
                                            setSelectedDestination('todos'); // Reset destino cuando cambia país
                                            setOtherLocation(''); // Reset otro lugar
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los países</option>
                                        {Object.entries(popularCountries).map(([key, country]) => {
                                            if (key === 'todos') return null;
                                            return (
                                                <option key={key} value={key}>
                                                    {country.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Filtro por Destino */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Destino:</label>
                                    <select
                                        value={selectedDestination}
                                        onChange={(e) => {
                                            setSelectedDestination(e.target.value);
                                            setOtherLocation(''); // Reset otro lugar
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={selectedCountry === 'todos' || availableDestinations.length === 0}
                                    >
                                        <option value="todos">Todos los destinos</option>
                                        {availableDestinations.map(destination => (
                                            <option key={destination} value={destination}>
                                                {destination}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Campo "Otro lugar" */}
                            <div className="mt-3">
                                <label className="text-xs text-gray-500 mb-1 block">Otro lugar (búsqueda libre):</label>
                                <input
                                    type="text"
                                    value={otherLocation}
                                    onChange={(e) => {
                                        setOtherLocation(e.target.value);
                                        if (e.target.value.trim() !== '') {
                                            setSelectedCountry('todos');
                                            setSelectedDestination('todos');
                                        }
                                    }}
                                    placeholder="Ej: Playa, Montaña, Casa de la abuela..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Busca fotos que contengan este texto en su ubicación
                                </p>
                            </div>
                        </div>
                        
                        {/* Indicador de filtros activos */}
                        {(selectedCategory !== 'todas' || selectedYear !== 'todos' || selectedMonth !== 'todos' || selectedCountry !== 'todos' || selectedDestination !== 'todos' || otherLocation.trim() !== '') && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <span className="text-blue-700 font-medium">Filtros activos:</span>
                                        {selectedCategory !== 'todas' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {categories.find(c => c.id === selectedCategory)?.label}
                                            </span>
                                        )}
                                        {selectedYear !== 'todos' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {selectedYear === 'unknown' ? 'Sin fecha' : selectedYear}
                                            </span>
                                        )}
                                        {selectedMonth !== 'todos' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {monthNames[selectedMonth] || selectedMonth}
                                            </span>
                                        )}
                                        {selectedCountry !== 'todos' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {popularCountries[selectedCountry as keyof typeof popularCountries]?.name}
                                            </span>
                                        )}
                                        {selectedDestination !== 'todos' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {selectedDestination}
                                            </span>
                                        )}
                                        {otherLocation.trim() !== '' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                "{otherLocation}"
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('todas');
                                            setSelectedYear('todos');
                                            setSelectedMonth('todos');
                                            setSelectedCountry('todos');
                                            setSelectedDestination('todos');
                                            setOtherLocation('');
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Galería de fotos */}
                {filteredPhotos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">📷</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {(selectedCategory === 'todas' && selectedYear === 'todos' && selectedMonth === 'todos' && selectedCountry === 'todos' && selectedDestination === 'todos' && otherLocation.trim() === '') 
                                ? 'No hay fotos aún' 
                                : 'No hay fotos con los filtros seleccionados'
                            }
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {(selectedCategory === 'todas' && selectedYear === 'todos' && selectedMonth === 'todos' && selectedCountry === 'todos' && selectedDestination === 'todos' && otherLocation.trim() === '')
                                ? 'Comienza subiendo tus primeras fotos familiares para crear recuerdos digitales'
                                : 'Prueba ajustando los filtros o agrega nuevas fotos que coincidan con los criterios seleccionados'
                            }
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPhotos.map(photo => (
                            <div key={photo.photo_id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                {/* Imagen */}
                                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden relative group">
                                    <img 
                                        src={photo.display_url || photo.photo_url} 
                                        alt={photo.description || 'Family photo'}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay con acciones */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleViewPhoto(photo)}
                                                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                                                title="Ver foto"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenCarousel(photo)}
                                                className="p-2 bg-white rounded-full text-gray-700 hover:text-indigo-600 transition-colors"
                                                title="Ver en grande (carrusel)"
                                            >
                                                <Maximize2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadPhoto(photo)}
                                                className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 transition-colors"
                                                title="Descargar foto"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button 
                                                className="p-2 bg-white rounded-full text-gray-700 hover:text-green-600 transition-colors"
                                                title="Editar foto"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePhoto(photo.photo_id)}
                                                disabled={deletingPhotoId === photo.photo_id}
                                                className={`p-2 bg-white rounded-full text-gray-700 transition-colors ${
                                                    deletingPhotoId === photo.photo_id 
                                                        ? 'opacity-50 cursor-not-allowed' 
                                                        : 'hover:text-red-600'
                                                }`}
                                                title={deletingPhotoId === photo.photo_id ? "Eliminando..." : "Eliminar foto"}
                                            >
                                                {deletingPhotoId === photo.photo_id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Información */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{photo.filename || 'Foto familiar'}</h3>
                                    {photo.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{photo.description}</p>
                                    )}
                                    
                                    {/* Metadatos */}
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar size={12} className="mr-1 flex-shrink-0" />
                                            <span>{new Date(photo.date_taken).toLocaleDateString('es-ES')}</span>
                                        </div>
                                        {photo.location && (
                                            <div className="flex items-center">
                                                <MapPin size={12} className="mr-1 flex-shrink-0" />
                                                <span className="truncate">{photo.location}</span>
                                            </div>
                                        )}
                                        {photo.people_in_photo && (
                                            <div className="flex items-center">
                                                <Users size={12} className="mr-1 flex-shrink-0" />
                                                <span className="truncate">
                                                    {photo.people_in_photo.split(',').slice(0, 2).map(p => p.trim()).join(', ')}
                                                    {photo.people_in_photo.split(',').length > 2 ? ` +${photo.people_in_photo.split(',').length - 2}` : ''}
                                                </span>
                                            </div>
                                        )}
                                        {photo.tags && (
                                            <div className="flex items-center">
                                                <Tag size={12} className="mr-1 flex-shrink-0" />
                                                <span className="truncate">
                                                    {photo.tags.split(',').slice(0, 2).map(t => t.trim()).join(', ')}
                                                    {photo.tags.split(',').length > 2 ? '...' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Categoría */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                        <span className={`text-xs px-2 py-1 rounded-full text-white ${
                                            categories.find(c => c.id === photo.category)?.color
                                        }`}>
                                            {categories.find(c => c.id === photo.category)?.label}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {photo.people_in_photo ? photo.people_in_photo.split(',').length : 0} {photo.people_in_photo && photo.people_in_photo.split(',').length === 1 ? 'persona' : 'personas'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de subida mejorado */}
                {showUploadModal && selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header del modal */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-800">📸 Agregar Foto Familiar</h3>
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
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>📁 {selectedFile.name}</p>
                                            <p>📊 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                                    placeholder="Describe qué está pasando en la foto, el contexto, emociones..."
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Fecha tomada *</label>
                                                <input
                                                    type="date"
                                                    name="date_taken"
                                                    value={formData.date_taken}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ubicación</label>
                                                
                                                {/* Selectores de País y Destino */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    {/* Selector de País */}
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">País:</label>
                                                        <select
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleCountryChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            <option value="todos">Seleccionar país</option>
                                                            {Object.entries(popularCountries).map(([key, country]) => {
                                                                if (key === 'todos') return null;
                                                                return (
                                                                    <option key={key} value={key}>
                                                                        {country.name}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>

                                                    {/* Selector de Destino */}
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Destino:</label>
                                                        <select
                                                            name="place"
                                                            value={formData.place}
                                                            onChange={handleDestinationChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            disabled={formData.country === 'todos' || formAvailableDestinations.length === 0}
                                                        >
                                                            <option value="todos">Seleccionar destino</option>
                                                            {formAvailableDestinations.map(destination => (
                                                                <option key={destination} value={destination}>
                                                                    {destination}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Campo de ubicación libre */}
                                                <div className="mt-3">
                                                    <label className="text-xs text-gray-500 mb-1 block">Escribe una ubicación personalizada:</label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleFormChange}
                                                        placeholder="Ej: México, Playa de Cancún | España, Madrid | Casa de la abuela..."
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        💡 Sugerimos empezar con el país, luego el lugar específico (Ej: Francia, París)
                                                    </p>
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
                                                <p className="text-xs text-gray-500 mt-1">Separa los nombres con comas</p>
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
                                                <label className="block text-sm font-medium mb-1">Tipo de Evento *</label>
                                                <select
                                                    name="event_type"
                                                    value={formData.event_type}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option key="general" value="general">General</option>
                                                    <option key="cumpleanos" value="cumpleanos">Cumpleaños</option>
                                                    <option key="reuniones" value="reuniones">Reuniones Familiares</option>
                                                    <option key="vacaciones" value="vacaciones">Vacaciones</option>
                                                    <option key="navidad" value="navidad">Navidad</option>
                                                    <option key="graduaciones" value="graduaciones">Graduaciones</option>
                                                    <option key="bodas" value="bodas">Bodas</option>
                                                    <option key="bautizos" value="bautizos">Bautizos</option>
                                                    <option key="deportes" value="deportes">Deportes</option>
                                                    <option key="viajes" value="viajes">Viajes</option>
                                                    <option key="cotidiano" value="cotidiano">Vida Cotidiana</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Ayuda a organizar las fotos en carpetas específicas</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Etiquetas</label>
                                                <input
                                                    type="text"
                                                    name="tags"
                                                    value={formData.tags}
                                                    onChange={handleFormChange}
                                                    placeholder="Ej: cumpleaños, sorpresa, felicidad (separadas por comas)"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Palabras clave para encontrar la foto fácilmente</p>
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

                {/* Modal para ver detalles de la foto */}
                {viewingPhoto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">{viewingPhoto.filename || 'Foto Familiar'}</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setViewingPhoto(null);
                                            handleOpenCarousel(viewingPhoto);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        title="Ver en carrusel"
                                    >
                                        <Maximize2 size={18} />
                                        <span>Carrusel</span>
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPhoto(viewingPhoto)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        title="Descargar foto"
                                    >
                                        <Download size={18} />
                                        <span>Descargar</span>
                                    </button>
                                    <button
                                        onClick={() => setViewingPhoto(null)}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Imagen */}
                                    <div className="space-y-4">
                                        <img 
                                            src={viewingPhoto.display_url || viewingPhoto.photo_url} 
                                            alt={viewingPhoto.filename || 'Family photo'}
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                    
                                    {/* Detalles */}
                                    <div className="space-y-4">
                                        {viewingPhoto.description && (
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                                                <p className="text-gray-600">{viewingPhoto.description}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-2">Información</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="mr-2 text-gray-500" />
                                                    <span>{new Date(viewingPhoto.date_taken).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                {viewingPhoto.location && (
                                                    <div className="flex items-center">
                                                        <MapPin size={16} className="mr-2 text-gray-500" />
                                                        <span>{viewingPhoto.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Tag size={16} className="mr-2 text-gray-500" />
                                                    <span className={`px-2 py-1 rounded-full text-white text-xs ${
                                                        categories.find(c => c.id === viewingPhoto.category)?.color
                                                    }`}>
                                                        {categories.find(c => c.id === viewingPhoto.category)?.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {viewingPhoto.people_in_photo && (
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">Personas en la foto</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewingPhoto.people_in_photo.split(',').map((person, index) => (
                                                        <span 
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                        >
                                                            {person.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {viewingPhoto.tags && (
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">Etiquetas</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewingPhoto.tags.split(',').map((tag, index) => (
                                                        <span 
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                        >
                                                            #{tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Carrusel de fotos */}
                {showCarousel && filteredPhotos.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                        {/* Botón cerrar */}
                        <button
                            onClick={handleCloseCarousel}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <X size={32} />
                        </button>

                        {/* Flecha izquierda */}
                        <button
                            onClick={handlePreviousPhoto}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                            disabled={filteredPhotos.length <= 1}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        {/* Flecha derecha */}
                        <button
                            onClick={handleNextPhoto}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                            disabled={filteredPhotos.length <= 1}
                        >
                            <ChevronRight size={32} />
                        </button>

                        {/* Imagen principal */}
                        <div className="flex flex-col items-center justify-center max-w-full max-h-full p-8">
                            <img
                                src={filteredPhotos[currentPhotoIndex]?.display_url || filteredPhotos[currentPhotoIndex]?.photo_url}
                                alt={filteredPhotos[currentPhotoIndex]?.description || 'Foto familiar'}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                            
                            {/* Información de la foto */}
                            <div className="mt-4 text-center text-white">
                                <h3 className="text-xl font-semibold mb-2">
                                    {filteredPhotos[currentPhotoIndex]?.filename || 'Foto familiar'}
                                </h3>
                                <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                                    <span>{currentPhotoIndex + 1} de {filteredPhotos.length}</span>
                                    {filteredPhotos[currentPhotoIndex]?.date_taken && (
                                        <span>
                                            {new Date(filteredPhotos[currentPhotoIndex].date_taken).toLocaleDateString('es-ES')}
                                        </span>
                                    )}
                                    {filteredPhotos[currentPhotoIndex]?.location && (
                                        <span>{filteredPhotos[currentPhotoIndex].location}</span>
                                    )}
                                </div>
                                {filteredPhotos[currentPhotoIndex]?.description && (
                                    <p className="mt-2 text-gray-300 max-w-md">
                                        {filteredPhotos[currentPhotoIndex].description}
                                    </p>
                                )}
                                
                                {/* Botones de acción en carrusel */}
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <button
                                        onClick={() => handleDownloadPhoto(filteredPhotos[currentPhotoIndex])}
                                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        title="Descargar foto"
                                    >
                                        <Download size={16} />
                                        <span>Descargar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Indicadores de puntos */}
                        {filteredPhotos.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {filteredPhotos.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPhotoIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            index === currentPhotoIndex 
                                                ? 'bg-white' 
                                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FotosFamiliaresPage;
