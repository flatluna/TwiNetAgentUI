import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import { Button } from "@/components/ui/button";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";
import { useVehiculoService, Car } from "@/services/vehiculoApiService";
import { 
    ArrowLeft,
    Save,
    Camera,
    X,
    DollarSign,
    Calendar,
    Car as CarIcon,
    Settings,
    Loader2,
    MapPin
} from 'lucide-react';

interface Photo {
    url: string;
    caption: string;
    isPrimary: boolean;
    width?: number;
    height?: number;
    mimeType?: string;
    uploadedAt: string;
}

const EditarVehiculoPage: React.FC = () => {
    const navigate = useNavigate();
    const { carId } = useParams<{ carId: string }>();
    const { accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { actualizarVehiculo, obtenerVehiculoPorId } = useVehiculoService();
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [fotos, setFotos] = useState<Photo[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [vehiculoOriginal, setVehiculoOriginal] = useState<Car | null>(null);
    
    // Obtener twinId del usuario autenticado
    const twinId = accounts[0]?.localAccountId;

    const [formData, setFormData] = useState({
        // Información básica requerida
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        vin: '',
        
        // Información básica opcional
        stockNumber: '',
        plateState: '',
        trim: '',
        subModel: '',
        bodyStyle: '',
        doors: '',
        
        // Especificaciones técnicas
        transmission: '',
        drivetrain: '',
        fuelType: '',
        engineDescription: '',
        cylinders: '',
        engineDisplacementLiters: '',
        mileage: '',
        mileageUnit: 'miles',
        odometerStatus: '',
        
        // Colores y apariencia
        exteriorColor: '',
        interiorColor: '',
        upholstery: '',
        
        // Estado y condición
        condition: '',
        stockStatus: '',
        hasOpenRecalls: false,
        hasAccidentHistory: false,
        isCertifiedPreOwned: false,
        
        // Fechas y adquisición
        dateAcquired: '',
        dateListed: '',
        acquisitionSource: '',
        
        // Ubicación automática con Google Maps
        addressComplete: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        latitude: null as number | null,
        longitude: null as number | null,
        parkingLocation: '',
        
        // Información financiera personal - Campos exactos del backend
        originalListPrice: '',
        listPrice: '',
        currentPrice: '',
        actualPaidPrice: '',
        estimatedTax: '',
        estimatedRegistrationFee: '',
        dealerProcessingFee: '',
        
        // Financiamiento personal
        monthlyPayment: '',
        apr: '',
        termMonths: '',
        downPayment: '',
        
        // Características
        standardFeatures: '',
        optionalFeatures: '',
        safetyFeatures: '',
        
        // Título
        titleBrand: '',
        hasLien: false,
        lienHolder: '',
        lienAmount: '',
        titleState: '',
        
        // Garantía
        warrantyType: '',
        warrantyStart: '',
        warrantyEnd: '',
        warrantyProvider: '',
        
        // Multimedia
        videoUrl: '',
        
        // Notas
        internalNotes: '',
        description: '',
        
        // Estado de propiedad
        estado: 'Owned'
    });

    // Cargar datos del vehículo al montar el componente
    useEffect(() => {
        const cargarVehiculo = async () => {
            if (!twinId || !carId) {
                console.error('TwinId o CarId no disponible');
                navigate('/twin-vehiculo');
                return;
            }

            try {
                setLoadingData(true);
                console.log('🚗 Cargando vehículo para editar:', { twinId, carId });
                
                const vehiculo = await obtenerVehiculoPorId(twinId, carId);
                setVehiculoOriginal(vehiculo);
                
                console.log('🔍 Datos del vehículo obtenido:', vehiculo);
                console.log('🔍 Campos específicos para mapeo:', {
                    make: vehiculo.make,
                    model: vehiculo.model,
                    year: vehiculo.year,
                    licensePlate: vehiculo.licensePlate,
                    exteriorColor: vehiculo.exteriorColor,
                    mileage: vehiculo.mileage,
                    listPrice: vehiculo.listPrice,
                    currentPrice: vehiculo.currentPrice,
                    estado: vehiculo.estado
                });
                
                // Mapear datos del vehículo al formulario
                setFormData({
                    make: vehiculo.make || vehiculo.Make || '',
                    model: vehiculo.model || vehiculo.Model || '',
                    year: vehiculo.year || vehiculo.Year || new Date().getFullYear(),
                    licensePlate: vehiculo.licensePlate || vehiculo.LicensePlate || '',
                    vin: vehiculo.vin || vehiculo.Vin || '',
                    stockNumber: vehiculo.stockNumber || vehiculo.StockNumber || '',
                    plateState: vehiculo.plateState || '',
                    trim: vehiculo.trim || '',
                    subModel: vehiculo.subModel || '',
                    bodyStyle: vehiculo.bodyStyle || '',
                    doors: vehiculo.doors?.toString() || '',
                    transmission: vehiculo.transmission || '',
                    drivetrain: vehiculo.drivetrain || '',
                    fuelType: vehiculo.fuelType || '',
                    engineDescription: vehiculo.engineDescription || '',
                    cylinders: vehiculo.cylinders?.toString() || '',
                    engineDisplacementLiters: vehiculo.engineDisplacementLiters?.toString() || '',
                    mileage: vehiculo.mileage?.toString() || vehiculo.Mileage?.toString() || '',
                    mileageUnit: vehiculo.mileageUnit || vehiculo.MileageUnit || 'miles',
                    odometerStatus: vehiculo.odometerStatus || '',
                    exteriorColor: vehiculo.exteriorColor || '',
                    interiorColor: vehiculo.interiorColor || '',
                    upholstery: vehiculo.upholstery || '',
                    condition: vehiculo.condition || vehiculo.Condition || '',
                    stockStatus: vehiculo.stockStatus || '',
                    hasOpenRecalls: vehiculo.hasOpenRecalls || false,
                    hasAccidentHistory: vehiculo.hasAccidentHistory || false,
                    isCertifiedPreOwned: vehiculo.isCertifiedPreOwned || false,
                    dateAcquired: vehiculo.dateAcquired || '',
                    dateListed: vehiculo.dateListed || '',
                    acquisitionSource: vehiculo.acquisitionSource || '',
                    addressComplete: vehiculo.addressComplete || vehiculo.AddressComplete || '',
                    city: vehiculo.city || vehiculo.City || '',
                    state: vehiculo.state || vehiculo.State || '',
                    postalCode: vehiculo.postalCode || vehiculo.PostalCode || '',
                    country: vehiculo.country || 'US',
                    latitude: vehiculo.latitude || null,
                    longitude: vehiculo.longitude || null,
                    parkingLocation: vehiculo.parkingLocation || '',
                    originalListPrice: vehiculo.originalListPrice?.toString() || '',
                    listPrice: vehiculo.listPrice?.toString() || '',
                    currentPrice: vehiculo.currentPrice?.toString() || '',
                    actualPaidPrice: vehiculo.actualPaidPrice?.toString() || '',
                    estimatedTax: vehiculo.estimatedTax?.toString() || '',
                    estimatedRegistrationFee: vehiculo.estimatedRegistrationFee?.toString() || '',
                    dealerProcessingFee: vehiculo.dealerProcessingFee?.toString() || '',
                    monthlyPayment: vehiculo.monthlyPayment?.toString() || '',
                    apr: vehiculo.apr?.toString() || '',
                    termMonths: vehiculo.termMonths?.toString() || '',
                    downPayment: vehiculo.downPayment?.toString() || '',
                    standardFeatures: Array.isArray(vehiculo.standardFeatures) ? vehiculo.standardFeatures.join(', ') : vehiculo.standardFeatures || '',
                    optionalFeatures: Array.isArray(vehiculo.optionalFeatures) ? vehiculo.optionalFeatures.join(', ') : vehiculo.optionalFeatures || '',
                    safetyFeatures: Array.isArray(vehiculo.safetyFeatures) ? vehiculo.safetyFeatures.join(', ') : vehiculo.safetyFeatures || '',
                    titleBrand: vehiculo.titleBrand || '',
                    hasLien: vehiculo.hasLien || false,
                    lienHolder: vehiculo.lienHolder || '',
                    lienAmount: vehiculo.lienAmount?.toString() || '',
                    titleState: vehiculo.titleState || '',
                    warrantyType: vehiculo.warrantyType || '',
                    warrantyStart: vehiculo.warrantyStart || '',
                    warrantyEnd: vehiculo.warrantyEnd || '',
                    warrantyProvider: vehiculo.warrantyProvider || '',
                    videoUrl: vehiculo.videoUrl || '',
                    internalNotes: vehiculo.internalNotes || '',
                    description: vehiculo.description || '',
                    estado: vehiculo.estado || 'Owned'
                });

                console.log('✅ FormData mapeado correctamente:', {
                    make: vehiculo.make || vehiculo.Make,
                    model: vehiculo.model || vehiculo.Model, 
                    year: vehiculo.year || vehiculo.Year,
                    licensePlate: vehiculo.licensePlate || vehiculo.LicensePlate,
                    originalListPrice: vehiculo.originalListPrice?.toString(),
                    listPrice: vehiculo.listPrice?.toString() || vehiculo.ListPrice?.toString(),
                    currentPrice: vehiculo.currentPrice?.toString() || vehiculo.CurrentPrice?.toString(),
                    actualPaidPrice: vehiculo.actualPaidPrice?.toString()
                });

                console.log('🔍 DEBUG - Valores de precios específicos:', {
                    'vehiculo.originalListPrice': vehiculo.originalListPrice,
                    'vehiculo.listPrice': vehiculo.listPrice,
                    'vehiculo.currentPrice': vehiculo.currentPrice,
                    'vehiculo.actualPaidPrice': vehiculo.actualPaidPrice,
                    'formData.originalListPrice después de mapeo': vehiculo.originalListPrice?.toString() || '',
                    'formData.listPrice después de mapeo': vehiculo.listPrice?.toString() || vehiculo.ListPrice?.toString() || '',
                    'formData.currentPrice después de mapeo': vehiculo.currentPrice?.toString() || vehiculo.CurrentPrice?.toString() || '',
                    'formData.actualPaidPrice después de mapeo': vehiculo.actualPaidPrice?.toString() || ''
                });

                setVehiculoOriginal(vehiculo);
                setLoadingData(false);

                // Log para verificar que setFormData se ejecuta correctamente
                setTimeout(() => {
                    console.log('🔄 Estado del formulario después del setFormData:', {
                        make: formData.make,
                        model: formData.model,
                        year: formData.year,
                        originalListPrice: formData.originalListPrice,
                        listPrice: formData.listPrice,
                        currentPrice: formData.currentPrice,
                        actualPaidPrice: formData.actualPaidPrice,
                        estado: formData.estado
                    });
                }, 100);

                // Cargar fotos si existen
                if (vehiculo.photos && vehiculo.photos.length > 0) {
                    setPreviewImages(vehiculo.photos);
                    const fotosData = vehiculo.photos.map((url, index) => ({
                        url,
                        caption: `Foto ${index + 1}`,
                        isPrimary: index === 0,
                        uploadedAt: new Date().toISOString()
                    }));
                    setFotos(fotosData);
                } else if (vehiculo.Photos && vehiculo.Photos.length > 0) {
                    // Fallback para PascalCase
                    setPreviewImages(vehiculo.Photos);
                    const fotosData = vehiculo.Photos.map((url, index) => ({
                        url,
                        caption: `Foto ${index + 1}`,
                        isPrimary: index === 0,
                        uploadedAt: new Date().toISOString()
                    }));
                    setFotos(fotosData);
                }

            } catch (error) {
                console.error('❌ Error al cargar vehículo:', error);
                alert(`Error al cargar vehículo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                navigate('/twin-vehiculo');
            } finally {
                setLoadingData(false);
            }
        };

        cargarVehiculo();
    }, [twinId, carId, obtenerVehiculoPorId, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLocationSelect = (placeData: any) => {
        console.log('📍 Ubicación seleccionada:', placeData);
        setFormData(prev => ({
            ...prev,
            addressComplete: placeData.direccion || '',
            city: placeData.ciudad || '',
            state: placeData.estado || '',
            postalCode: placeData.codigoPostal || '',
            country: placeData.pais || 'US',
            latitude: placeData.latitud || null,
            longitude: placeData.longitud || null
        }));
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    setPreviewImages(prev => [...prev, url]);
                    
                    const newPhoto: Photo = {
                        url,
                        caption: `Foto ${fotos.length + 1}`,
                        isPrimary: fotos.length === 0,
                        mimeType: file.type,
                        uploadedAt: new Date().toISOString()
                    };
                    setFotos(prev => [...prev, newPhoto]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!twinId || !carId) {
            alert('Error: TwinId o CarId no disponible');
            return;
        }

        if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
            alert('Por favor completa todos los campos requeridos: Marca, Modelo, Año y Placa');
            return;
        }

        setLoading(true);

        try {
            console.log('🚗 Actualizando vehículo:', { twinId, carId, formData });

            // Agregar fotos al formData
            const dataWithPhotos = {
                ...formData,
                photos: fotos.map(foto => foto.url)
            };

            await actualizarVehiculo(twinId, carId, dataWithPhotos);
            
            console.log('✅ Vehículo actualizado exitosamente');
            alert('¡Vehículo actualizado exitosamente!');
            navigate('/twin-vehiculo');
            
        } catch (error) {
            console.error('❌ Error al actualizar vehículo:', error);
            alert(`Error al actualizar vehículo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando datos del vehículo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-vehiculo')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={20} />
                                Volver a Vehículos
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="bg-blue-600 p-3 rounded-xl">
                                        <CarIcon className="text-white w-8 h-8" />
                                    </div>
                                    Editar Vehículo
                                </h1>
                                <p className="text-gray-600">
                                    Actualiza la información de tu vehículo
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {vehiculoOriginal && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Editando: {vehiculoOriginal.make || vehiculoOriginal.Make} {vehiculoOriginal.model || vehiculoOriginal.Model} {vehiculoOriginal.year || vehiculoOriginal.Year}
                        </h3>
                        <p className="text-gray-600">
                            Placa: {vehiculoOriginal.licensePlate || vehiculoOriginal.LicensePlate}
                        </p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Información Básica */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <CarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marca <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    placeholder="Toyota, Honda, Ford..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Modelo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="Camry, Civic, F-150..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Año <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Placa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleInputChange}
                                    placeholder="ABC-123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    VIN
                                </label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                    placeholder="17 caracteres"
                                    maxLength={17}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado de la Placa
                                </label>
                                <input
                                    type="text"
                                    name="plateState"
                                    value={formData.plateState}
                                    onChange={handleInputChange}
                                    placeholder="CA, TX, NY..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trim/Versión
                                </label>
                                <input
                                    type="text"
                                    name="trim"
                                    value={formData.trim}
                                    onChange={handleInputChange}
                                    placeholder="LX, EX, Sport..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Carrocería
                                </label>
                                <select
                                    name="bodyStyle"
                                    value={formData.bodyStyle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Sedan">Sedán</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Coupe">Coupé</option>
                                    <option value="Convertible">Convertible</option>
                                    <option value="Pickup">Pickup</option>
                                    <option value="Van">Van</option>
                                    <option value="Wagon">Station Wagon</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condición
                                </label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Excellent">Excelente</option>
                                    <option value="Good">Buena</option>
                                    <option value="Fair">Regular</option>
                                    <option value="Poor">Pobre</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Especificaciones Técnicas */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Settings className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Especificaciones Técnicas</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transmisión
                                </label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Automatic">Automática</option>
                                    <option value="Manual">Manual</option>
                                    <option value="CVT">CVT</option>
                                    <option value="Semi-Automatic">Semi-automática</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Combustible
                                </label>
                                <select
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Gasoline">Gasolina</option>
                                    <option value="Diesel">Diésel</option>
                                    <option value="Hybrid">Híbrido</option>
                                    <option value="Electric">Eléctrico</option>
                                    <option value="Plug-in Hybrid">Híbrido Enchufable</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kilometraje
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="mileage"
                                        value={formData.mileage}
                                        onChange={handleInputChange}
                                        placeholder="50000"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <select
                                        name="mileageUnit"
                                        value={formData.mileageUnit}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="miles">Millas</option>
                                        <option value="kilometers">Kilómetros</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colores */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Colores y Apariencia</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Exterior
                                </label>
                                <input
                                    type="text"
                                    name="exteriorColor"
                                    value={formData.exteriorColor}
                                    onChange={handleInputChange}
                                    placeholder="Blanco, Negro, Rojo..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Interior
                                </label>
                                <input
                                    type="text"
                                    name="interiorColor"
                                    value={formData.interiorColor}
                                    onChange={handleInputChange}
                                    placeholder="Beige, Negro, Gris..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación con Google Maps */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Ubicación del Vehículo</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección Completa
                                </label>
                                <GoogleAddressAutocompleteModern
                                    value={formData.addressComplete}
                                    onChange={(value) => setFormData(prev => ({ ...prev, addressComplete: value }))}
                                    onPlaceSelected={handleLocationSelect}
                                    placeholder="Buscar dirección..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ubicación de Estacionamiento (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="parkingLocation"
                                    value={formData.parkingLocation}
                                    onChange={handleInputChange}
                                    placeholder="Garaje, Calle, Estacionamiento cubierto..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información Financiera */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-yellow-100 p-2 rounded-lg">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Información Financiera Personal</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio de Lista Original
                                </label>
                                <input
                                    type="number"
                                    name="originalListPrice"
                                    value={formData.originalListPrice}
                                    onChange={handleInputChange}
                                    placeholder="30000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio de Lista Actual
                                </label>
                                <input
                                    type="number"
                                    name="listPrice"
                                    value={formData.listPrice}
                                    onChange={handleInputChange}
                                    placeholder="25000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio Actual (Valor de Mercado)
                                </label>
                                <input
                                    type="number"
                                    name="currentPrice"
                                    value={formData.currentPrice}
                                    onChange={handleInputChange}
                                    placeholder="23000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio Pagado Real
                                </label>
                                <input
                                    type="number"
                                    name="actualPaidPrice"
                                    value={formData.actualPaidPrice}
                                    onChange={handleInputChange}
                                    placeholder="22000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pago Mensual (si aplica)
                                </label>
                                <input
                                    type="number"
                                    name="monthlyPayment"
                                    value={formData.monthlyPayment}
                                    onChange={handleInputChange}
                                    placeholder="450"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Fechas Importantes</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Adquisición
                                </label>
                                <input
                                    type="date"
                                    name="dateAcquired"
                                    value={formData.dateAcquired}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado de Propiedad
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Owned">Propietario</option>
                                    <option value="Financed">Financiado</option>
                                    <option value="Leased">Arrendado</option>
                                    <option value="Sold">Vendido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fotos */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-pink-100 p-2 rounded-lg">
                                <Camera className="w-6 h-6 text-pink-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Fotos del Vehículo</h2>
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Camera size={20} />
                                Agregar Fotos
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />

                            {previewImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                    Principal
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Descripción y Notas */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Descripción y Notas</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción General
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Descripción del vehículo, características especiales, etc..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas Personales (Privadas)
                                </label>
                                <textarea
                                    name="internalNotes"
                                    value={formData.internalNotes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Notas personales, recordatorios de mantenimiento, etc..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/twin-vehiculo')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Actualizar Vehículo
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarVehiculoPage;