import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Plus, 
    Car, 
    MapPin, 
    Calendar, 
    Eye, 
    Edit,
    Upload,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    Fuel,
    Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VehicleData {
    id: string;
    marca: string;
    modelo: string;
    año: number;
    color: string;
    placa: string;
    vin: string;
    tipo: string;
    kilometraje?: number;
    combustible?: string;
    transmision?: string;
    estado: 'propio' | 'financiado' | 'arrendado' | 'vendido';
    valorEstimado?: number;
    fechaCompra?: string;
    fotos: string[];
    documentos: number; // número de documentos subidos
}

const VehiculosPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const [vehiculos, setVehiculos] = useState<VehicleData[]>([]);
    const [tipoActivo, setTipoActivo] = useState<'propio' | 'financiado' | 'arrendado' | 'vendido' | 'todos'>('todos');
    const [loading, setLoading] = useState(true);
    const [uploadingPhotos, setUploadingPhotos] = useState<string | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({});
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [modalPhotos, setModalPhotos] = useState<string[]>([]);
    const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
    const [modalVehicleTitle, setModalVehicleTitle] = useState('');

    // Obtener twinId del usuario autenticado
    const twinId = accounts[0]?.localAccountId;

    // Datos simulados de vehículos (mientras no hay backend)
    const vehiculosSimulados: VehicleData[] = [
        {
            id: 'veh-1',
            marca: 'Toyota',
            modelo: 'Camry',
            año: 2022,
            color: 'Blanco',
            placa: 'ABC-123',
            vin: '1HGBH41JXMN109186',
            tipo: 'Sedán',
            kilometraje: 25000,
            combustible: 'Gasolina',
            transmision: 'Automática',
            estado: 'propio',
            valorEstimado: 450000,
            fechaCompra: '2022-03-15',
            fotos: [
                'https://images.unsplash.com/photo-1549399021-2f1c2e3d86b8?w=400',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'
            ],
            documentos: 3
        },
        {
            id: 'veh-2',
            marca: 'Honda',
            modelo: 'Civic',
            año: 2021,
            color: 'Azul',
            placa: 'XYZ-789',
            vin: '2HGFC2F59MH123456',
            tipo: 'Sedán',
            kilometraje: 45000,
            combustible: 'Gasolina',
            transmision: 'Manual',
            estado: 'financiado',
            valorEstimado: 380000,
            fechaCompra: '2021-08-20',
            fotos: [
                'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400'
            ],
            documentos: 5
        },
        {
            id: 'veh-3',
            marca: 'Ford',
            modelo: 'Explorer',
            año: 2023,
            color: 'Negro',
            placa: 'DEF-456',
            vin: '1FM5K8D89NGB12345',
            tipo: 'SUV',
            kilometraje: 15000,
            combustible: 'Gasolina',
            transmision: 'Automática',
            estado: 'arrendado',
            valorEstimado: 750000,
            fechaCompra: '2023-01-10',
            fotos: [
                'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
                'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
                'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400'
            ],
            documentos: 2
        }
    ];

    // Cargar vehículos (simulado por ahora)
    useEffect(() => {
        const cargarVehiculos = async () => {
            if (!twinId) {
                console.warn('⚠️ No hay twinId disponible');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Simular carga desde backend
                await new Promise(resolve => setTimeout(resolve, 800));
                setVehiculos(vehiculosSimulados);
            } catch (error) {
                console.error('Error al cargar vehículos:', error);
                // Mostrar datos simulados incluso con error
                setVehiculos(vehiculosSimulados);
            } finally {
                setLoading(false);
            }
        };

        cargarVehiculos();
    }, [twinId]);

    // Filtrar vehículos por tipo
    const vehiculosFiltrados = vehiculos.filter(vehiculo => {
        if (tipoActivo === 'todos') return true;
        return vehiculo.estado === tipoActivo;
    });

    // Navegación a documentos del vehículo
    const irADocumentos = (vehiculoId: string) => {
        navigate(`/twin-vehiculo/${vehiculoId}/documentos`);
    };

    // Navegación a editar vehículo
    const editarVehiculo = (vehiculoId: string) => {
        navigate(`/twin-vehiculo/${vehiculoId}/editar`);
    };

    // Crear nuevo vehículo
    const crearNuevoVehiculo = () => {
        navigate('/twin-vehiculo/crear');
    };

    // Subir fotos del vehículo
    const handleUploadPhotos = async (vehiculoId: string, files: FileList) => {
        setUploadingPhotos(vehiculoId);
        try {
            // Simular subida de fotos
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simular agregar las fotos al vehículo
            const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
            setVehiculos(prev => prev.map(v => 
                v.id === vehiculoId 
                    ? { ...v, fotos: [...v.fotos, ...newPhotos] }
                    : v
            ));
            
            console.log(`✅ Fotos subidas para vehículo ${vehiculoId}`);
        } catch (error) {
            console.error('Error al subir fotos:', error);
        } finally {
            setUploadingPhotos(null);
        }
    };

    // Abrir selector de archivos para fotos
    const openPhotoSelector = (vehiculoId: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                handleUploadPhotos(vehiculoId, files);
            }
        };
        
        input.click();
    };

    // Control del carrusel de fotos
    const nextPhoto = (vehiculoId: string, totalPhotos: number) => {
        setCurrentPhotoIndex(prev => ({
            ...prev,
            [vehiculoId]: ((prev[vehiculoId] || 0) + 1) % totalPhotos
        }));
    };

    const prevPhoto = (vehiculoId: string, totalPhotos: number) => {
        setCurrentPhotoIndex(prev => ({
            ...prev,
            [vehiculoId]: ((prev[vehiculoId] || 0) - 1 + totalPhotos) % totalPhotos
        }));
    };

    // Abrir modal de fotos
    const openPhotoModal = (fotos: string[], index: number, vehicleTitle: string) => {
        setModalPhotos(fotos);
        setModalCurrentIndex(index);
        setModalVehicleTitle(vehicleTitle);
        setPhotoModalOpen(true);
    };

    // Formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Obtener color del badge según el estado
    const getEstadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'propio': return 'bg-green-100 text-green-800';
            case 'financiado': return 'bg-blue-100 text-blue-800';
            case 'arrendado': return 'bg-yellow-100 text-yellow-800';
            case 'vendido': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando vehículos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate('/mi-patrimonio')}
                            variant="outline"
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Mi Patrimonio
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mis Vehículos</h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona tu flota de vehículos y documentos
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={crearNuevoVehiculo}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Vehículo
                    </Button>
                </div>

                {/* Filtros */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'todos', label: 'Todos', count: vehiculos.length },
                            { key: 'propio', label: 'Propios', count: vehiculos.filter(v => v.estado === 'propio').length },
                            { key: 'financiado', label: 'Financiados', count: vehiculos.filter(v => v.estado === 'financiado').length },
                            { key: 'arrendado', label: 'Arrendados', count: vehiculos.filter(v => v.estado === 'arrendado').length },
                            { key: 'vendido', label: 'Vendidos', count: vehiculos.filter(v => v.estado === 'vendido').length }
                        ].map((filtro) => (
                            <button
                                key={filtro.key}
                                onClick={() => setTipoActivo(filtro.key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    tipoActivo === filtro.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {filtro.label} ({filtro.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Banner informativo */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-center">
                        <Car className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                            <p className="text-sm text-blue-700">
                                <strong>Modo Demo:</strong> Los vehículos mostrados son datos simulados. 
                                La integración con el backend se realizará próximamente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid de vehículos */}
                {vehiculosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay vehículos {tipoActivo !== 'todos' ? `${tipoActivo}s` : ''}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {tipoActivo === 'todos' 
                                ? 'Comienza agregando tu primer vehículo'
                                : `No tienes vehículos ${tipoActivo}s registrados`
                            }
                        </p>
                        <Button
                            onClick={crearNuevoVehiculo}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Vehículo
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehiculosFiltrados.map((vehiculo) => (
                            <Card key={vehiculo.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                {/* Carrusel de fotos */}
                                <div className="relative h-48 bg-gray-200">
                                    {vehiculo.fotos.length > 0 ? (
                                        <>
                                            <img
                                                src={vehiculo.fotos[currentPhotoIndex[vehiculo.id] || 0]}
                                                alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => openPhotoModal(
                                                    vehiculo.fotos, 
                                                    currentPhotoIndex[vehiculo.id] || 0,
                                                    `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.año}`
                                                )}
                                            />
                                            {/* Controles del carrusel */}
                                            {vehiculo.fotos.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => prevPhoto(vehiculo.id, vehiculo.fotos.length)}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => nextPhoto(vehiculo.id, vehiculo.fotos.length)}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    {/* Indicadores */}
                                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                        {vehiculo.fotos.map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-2 h-2 rounded-full ${
                                                                    index === (currentPhotoIndex[vehiculo.id] || 0)
                                                                        ? 'bg-white'
                                                                        : 'bg-white bg-opacity-50'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Car className="w-16 h-16" />
                                        </div>
                                    )}
                                    
                                    {/* Badge de estado */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(vehiculo.estado)}`}>
                                            {vehiculo.estado.charAt(0).toUpperCase() + vehiculo.estado.slice(1)}
                                        </span>
                                    </div>

                                    {/* Botón de subir fotos */}
                                    <button
                                        onClick={() => openPhotoSelector(vehiculo.id)}
                                        disabled={uploadingPhotos === vehiculo.id}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-50"
                                        title="Subir fotos"
                                    >
                                        {uploadingPhotos === vehiculo.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Información del vehículo */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {vehiculo.marca} {vehiculo.modelo}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {vehiculo.año} • {vehiculo.color} • {vehiculo.tipo}
                                            </p>
                                        </div>
                                        {vehiculo.valorEstimado && (
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    {formatPrice(vehiculo.valorEstimado)}
                                                </p>
                                                <p className="text-xs text-gray-500">Valor estimado</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detalles técnicos */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{vehiculo.placa}</span>
                                        </div>
                                        {vehiculo.kilometraje && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Gauge className="w-4 h-4" />
                                                <span>{vehiculo.kilometraje.toLocaleString()} km</span>
                                            </div>
                                        )}
                                        {vehiculo.combustible && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Fuel className="w-4 h-4" />
                                                <span>{vehiculo.combustible}</span>
                                            </div>
                                        )}
                                        {vehiculo.fechaCompra && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(vehiculo.fechaCompra).getFullYear()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Documentos */}
                                    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            {vehiculo.documentos} documento{vehiculo.documentos !== 1 ? 's' : ''} subido{vehiculo.documentos !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => irADocumentos(vehiculo.id)}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Documentos
                                        </Button>
                                        <Button
                                            onClick={() => editarVehiculo(vehiculo.id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de fotos */}
            {photoModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
                        <button
                            onClick={() => setPhotoModalOpen(false)}
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <img
                            src={modalPhotos[modalCurrentIndex]}
                            alt={modalVehicleTitle}
                            className="max-w-full max-h-full object-contain"
                        />
                        
                        {modalPhotos.length > 1 && (
                            <>
                                <button
                                    onClick={() => setModalCurrentIndex((prev) => 
                                        prev === 0 ? modalPhotos.length - 1 : prev - 1
                                    )}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={() => setModalCurrentIndex((prev) => 
                                        prev === modalPhotos.length - 1 ? 0 : prev + 1
                                    )}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                            <p className="text-lg font-semibold">{modalVehicleTitle}</p>
                            <p className="text-sm opacity-75">
                                {modalCurrentIndex + 1} de {modalPhotos.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiculosPage;