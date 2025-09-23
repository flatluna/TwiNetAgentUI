import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAgentCreateHome, HomeData } from '@/services/casaAgentApiService';
import { 
    ArrowLeft, 
    Plus, 
    Home, 
    MapPin, 
    Calendar, 
    Eye, 
    Edit,
    Upload,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    Bed,
    Bath,
    Ruler,
    Building,
    Star,
    Car,
    Clock,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CasasPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const { obtenerCasas, subirFotosCasa } = useAgentCreateHome();
    const [casas, setCasas] = useState<HomeData[]>([]);
    const [tipoActivo, setTipoActivo] = useState<'actual' | 'pasado' | 'mudanza' | 'inversion' | 'vacacional' | 'todos'>('todos');
    const [loading, setLoading] = useState(true);
    const [uploadingPhotos, setUploadingPhotos] = useState<string | null>(null); // homeId que está subiendo fotos
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({}); // Índice de foto activa por casa
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [modalPhotos, setModalPhotos] = useState<string[]>([]);
    const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
    const [modalCasaTitle, setModalCasaTitle] = useState('');

    // Obtener twinId del usuario autenticado
    const twinId = accounts[0]?.localAccountId;

    // Cargar casas desde el backend
    useEffect(() => {
        const cargarCasas = async () => {
            if (!twinId) {
                console.warn('⚠️ No hay twinId disponible');
                setLoading(false);
                return;
            }

            try {
                console.log('🏠 Cargando casas desde backend para twin:', twinId);
                
                // Aplicar filtro si no es 'todos'
                const filters = tipoActivo !== 'todos' ? { tipo: tipoActivo } : undefined;
                const casasFromAPI = await obtenerCasas(twinId, filters);
                
                console.log('✅ Casas cargadas desde backend:', casasFromAPI);
                setCasas(casasFromAPI);
            } catch (error) {
                console.error('❌ Error al cargar casas desde backend:', error);
                // En caso de error, mostrar mensaje o array vacío
                setCasas([]);
            } finally {
                setLoading(false);
            }
        };

        cargarCasas();
    }, [twinId, obtenerCasas, tipoActivo]);

    // Manejar tecla ESC para cerrar modal
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && photoModalOpen) {
                closePhotoModal();
            }
        };

        if (photoModalOpen) {
            document.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [photoModalOpen]);

    const obtenerCasasPorTipo = (tipo: 'actual' | 'pasado' | 'mudanza' | 'inversion' | 'vacacional' | 'todos') => {
        if (tipo === 'todos') {
            return casas;
        }
        return casas.filter((c: HomeData) => c.tipo === tipo);
    };

    // Función para manejar la subida de fotos
    const handleUploadPhotos = async (casa: HomeData) => {
        if (!twinId) {
            alert('Error: No se encontró el ID del usuario');
            return;
        }

        // Crear input file temporal
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            setUploadingPhotos(casa.id);
            try {
                console.log('📸 Subiendo fotos para casa:', casa.direccion);
                const result = await subirFotosCasa(twinId, casa.id, files);
                
                // Mostrar resultado
                const successMsg = `✅ ${result.SuccessfulUploads} foto(s) subida(s) exitosamente`;
                const failMsg = result.FailedUploads > 0 ? `❌ ${result.FailedUploads} fallo(s)` : '';
                const message = failMsg ? `${successMsg}\n${failMsg}` : successMsg;
                
                alert(message);
                
                // Recargar casas para mostrar las nuevas fotos
                if (result.SuccessfulUploads > 0) {
                    const filters = tipoActivo !== 'todos' ? { tipo: tipoActivo } : undefined;
                    const casasActualizadas = await obtenerCasas(twinId, filters);
                    setCasas(casasActualizadas);
                }
            } catch (error) {
                console.error('❌ Error al subir fotos:', error);
                alert(`❌ Error al subir fotos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            } finally {
                setUploadingPhotos(null);
            }
        };

        input.click();
    };

    // Funciones para manejar el carrusel de fotos
    const nextPhoto = (casaId: string, totalPhotos: number) => {
        setCurrentPhotoIndex(prev => ({
            ...prev,
            [casaId]: ((prev[casaId] || 0) + 1) % totalPhotos
        }));
    };

    const prevPhoto = (casaId: string, totalPhotos: number) => {
        setCurrentPhotoIndex(prev => ({
            ...prev,
            [casaId]: ((prev[casaId] || 0) - 1 + totalPhotos) % totalPhotos
        }));
    };

    const setPhotoIndex = (casaId: string, index: number) => {
        setCurrentPhotoIndex(prev => ({
            ...prev,
            [casaId]: index
        }));
    };

    // Funciones para el modal de fotos ampliadas
    const openPhotoModal = (casa: HomeData) => {
        if (casa.fotos.length === 0) return;
        
        setModalPhotos(casa.fotos);
        setModalCurrentIndex(currentPhotoIndex[casa.id] || 0);
        setModalCasaTitle(`${casa.direccion}, ${casa.ciudad}`);
        setPhotoModalOpen(true);
    };

    const closePhotoModal = () => {
        setPhotoModalOpen(false);
        setModalPhotos([]);
        setModalCurrentIndex(0);
        setModalCasaTitle('');
    };

    const nextModalPhoto = () => {
        setModalCurrentIndex((prev) => (prev + 1) % modalPhotos.length);
    };

    const prevModalPhoto = () => {
        setModalCurrentIndex((prev) => (prev - 1 + modalPhotos.length) % modalPhotos.length);
    };

    const formatearPrecio = (precio?: number) => {
        if (!precio) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(precio);
    };

    const formatearArea = (area: number) => {
        return new Intl.NumberFormat('en-US').format(area) + ' sqft';
    };

    const obtenerIconoTipo = (tipo: string) => {
        switch (tipo) {
            case 'actual': return { icon: Home, color: 'text-green-600', bg: 'bg-green-100' };
            case 'pasado': return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'inversion': return { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' };
            case 'vacacional': return { icon: Star, color: 'text-orange-600', bg: 'bg-orange-100' };
            default: return { icon: Home, color: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };

    const renderCardCasa = (casa: HomeData) => {
        const tipoInfo = obtenerIconoTipo(casa.tipo);
        const IconoTipo = tipoInfo.icon;

        return (
            <Card key={casa.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                {/* Header con carrusel de fotos */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
                    {casa.fotos.length > 0 ? (
                        <div className="relative w-full h-full overflow-hidden">
                            {/* Foto actual - clickeable para ampliar */}
                            <img 
                                src={casa.fotos[currentPhotoIndex[casa.id] || 0]} 
                                alt={`${casa.direccion} - Foto ${(currentPhotoIndex[casa.id] || 0) + 1}`}
                                className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer" 
                                onClick={() => openPhotoModal(casa)}
                            />
                            
                            {/* Controles de navegación - solo mostrar si hay más de una foto */}
                            {casa.fotos.length > 1 && (
                                <>
                                    {/* Flecha izquierda */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevPhoto(casa.id, casa.fotos.length);
                                        }}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    
                                    {/* Flecha derecha */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextPhoto(casa.id, casa.fotos.length);
                                        }}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    
                                    {/* Indicadores de posición */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {casa.fotos.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPhotoIndex(casa.id, index);
                                                }}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                    (currentPhotoIndex[casa.id] || 0) === index 
                                                        ? 'bg-white' 
                                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-20 h-20 text-white opacity-50" />
                        </div>
                    )}
                    
                    {/* Badges superiores */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${tipoInfo.bg.replace('bg-', 'bg-opacity-90 bg-')}`}>
                            {casa.tipo.charAt(0).toUpperCase() + casa.tipo.slice(1)}
                        </span>
                        {casa.esPrincipal && (
                            <span className="bg-yellow-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Principal
                            </span>
                        )}
                    </div>

                    {/* Badge de estado */}
                    <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 bg-opacity-90`}>
                            {casa.tipoPropiedad}
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    {/* Título y ubicación */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <IconoTipo className={`w-5 h-5 ${tipoInfo.color}`} />
                            {casa.direccion}, {casa.ciudad}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{casa.direccion}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            {casa.ciudad}, {casa.estado} {casa.codigoPostal}
                        </div>
                    </div>

                    {/* Características principales */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="w-4 h-4" />
                            <span>{casa.habitaciones} hab</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bath className="w-4 h-4" />
                            <span>{casa.banos} baños</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Ruler className="w-4 h-4" />
                            <span>{formatearArea(casa.areaTotal)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            <span>{casa.anoConstruction}</span>
                        </div>
                    </div>

                    {/* Características especiales */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {casa.espaciosEstacionamiento && casa.espaciosEstacionamiento > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Car className="w-3 h-3" />
                                Estacionamiento ({casa.espaciosEstacionamiento})
                            </span>
                        )}
                        {casa.tieneHOA && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                �️ HOA
                            </span>
                        )}
                        {casa.caracteristicasTerreno && casa.caracteristicasTerreno.length > 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                🌿 {casa.caracteristicasTerreno[0]}
                            </span>
                        )}
                    </div>

                    {/* Información financiera */}
                    {casa.valorEstimado && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Valor Estimado</p>
                                    <p className="text-lg font-bold text-green-600">{formatearPrecio(casa.valorEstimado)}</p>
                                </div>
                                {casa.impuestosPrediales && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Impuestos Anuales</p>
                                        <p className="text-sm text-gray-800">{formatearPrecio(casa.impuestosPrediales)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                            {casa.fechaInicio} {casa.fechaFin && `- ${casa.fechaFin}`}
                        </span>
                    </div>

                    {/* Descripción */}
                    {casa.descripcion && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {casa.descripcion}
                        </p>
                    )}

                    {/* Acciones */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                console.log('Ver detalles casa:', casa.id);
                                navigate(`/mi-patrimonio/casas/analisis/${casa.id}`);
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/mi-patrimonio/casas/editar/${casa.id}`)}
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadPhotos(casa)}
                            disabled={uploadingPhotos === casa.id}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                            {uploadingPhotos === casa.id ? (
                                <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            ) : (
                                <Upload className="w-4 h-4 mr-1" />
                            )}
                            Fotos
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/mi-patrimonio/casas/${casa.id}/documentos`)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                            <FileText className="w-4 h-4 mr-1" />
                            Documentos
                        </Button>
                    </div>
                </div>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando propiedades...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/mi-patrimonio/twin-hogar')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={20} />
                                Volver a Twin Hogar
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="bg-blue-600 p-3 rounded-xl">
                                        <Home className="text-white w-8 h-8" />
                                    </div>
                                    Mis Casas y Propiedades
                                </h1>
                                <p className="text-gray-600">Gestiona todas tus propiedades inmobiliarias</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                                <p className="text-3xl font-bold text-gray-900">{casas.length}</p>
                            </div>
                            <Home className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatearPrecio(casas.reduce((sum: number, casa: HomeData) => sum + (casa.valorEstimado || 0), 0))}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Propiedades Actuales</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {casas.filter((c: HomeData) => c.tipo === 'actual').length}
                                </p>
                            </div>
                            <Star className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Área Total</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {formatearArea(casas.reduce((sum: number, casa: HomeData) => sum + casa.areaTotal, 0))}
                                </p>
                            </div>
                            <Ruler className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { key: 'todos', label: 'Todas', icon: Home, count: casas.length },
                                { key: 'actual', label: 'Actuales', icon: Home, count: obtenerCasasPorTipo('actual').length },
                                { key: 'pasado', label: 'Pasadas', icon: Clock, count: obtenerCasasPorTipo('pasado').length },
                                { key: 'inversion', label: 'Inversión', icon: DollarSign, count: obtenerCasasPorTipo('inversion').length },
                                { key: 'vacacional', label: 'Vacacional', icon: Star, count: obtenerCasasPorTipo('vacacional').length }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setTipoActivo(tab.key as any)}
                                    className={`${
                                        tipoActivo === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {tipoActivo === 'todos' && 'Todas las Propiedades'}
                                {tipoActivo === 'actual' && 'Propiedades Actuales'}
                                {tipoActivo === 'pasado' && 'Propiedades Pasadas'}
                                {tipoActivo === 'inversion' && 'Propiedades de Inversión'}
                                {tipoActivo === 'vacacional' && 'Propiedades Vacacionales'}
                            </h2>
                            <Button
                                onClick={() => navigate('/mi-patrimonio/casas/crear')}
                                className="flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Agregar Casa
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid de casas */}
                {obtenerCasasPorTipo(tipoActivo).length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No tienes casas registradas
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Comienza agregando información sobre tus propiedades
                        </p>
                        <Button
                            onClick={() => navigate('/mi-patrimonio/casas/crear')}
                            size="lg"
                        >
                            Agregar mi Primera Casa
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {obtenerCasasPorTipo(tipoActivo).map(renderCardCasa)}
                    </div>
                )}
            </div>

            {/* Modal de fotos ampliadas */}
            {photoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
                    <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4">
                        {/* Botón cerrar */}
                        <button
                            onClick={closePhotoModal}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Imagen principal */}
                        <div className="relative max-w-full max-h-full">
                            <img
                                src={modalPhotos[modalCurrentIndex]}
                                alt={`${modalCasaTitle} - Foto ${modalCurrentIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />

                            {/* Controles de navegación - solo si hay más de una foto */}
                            {modalPhotos.length > 1 && (
                                <>
                                    {/* Flecha izquierda */}
                                    <button
                                        onClick={prevModalPhoto}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    {/* Flecha derecha */}
                                    <button
                                        onClick={nextModalPhoto}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Información y indicadores en la parte inferior */}
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4">
                            {/* Título */}
                            <div className="text-white text-lg font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                                {modalCasaTitle} - {modalCurrentIndex + 1} de {modalPhotos.length}
                            </div>

                            {/* Indicadores de posición */}
                            {modalPhotos.length > 1 && (
                                <div className="flex gap-2">
                                    {modalPhotos.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setModalCurrentIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                modalCurrentIndex === index 
                                                    ? 'bg-white' 
                                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CasasPage;
