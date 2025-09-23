import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";
import { useVehiculoService } from "@/services/vehiculoApiService";
import { 
    ArrowLeft,
    Save,
    Camera,
    X,
    DollarSign,
    Calendar,
    Car,
    Fuel,
    Settings,
    Loader2,
    Gauge,
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

const CrearVehiculoPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { crearVehiculo } = useVehiculoService();
    
    const [loading, setLoading] = useState(false);
    const [fotos, setFotos] = useState<Photo[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    
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
        bodyStyle: 'Sedan' as 'Unknown' | 'Sedan' | 'Coupe' | 'Hatchback' | 'Wagon' | 'SUV' | 'Truck' | 'Van' | 'Convertible' | 'Other',
        doors: '',
        
        // Especificaciones técnicas
        transmission: 'Automatic' as 'Unknown' | 'Automatic' | 'Manual' | 'CVT' | 'DualClutch' | 'Other',
        drivetrain: 'FWD' as 'Unknown' | 'FWD' | 'RWD' | 'AWD' | 'FourWheelDrive',
        fuelType: 'Gasoline' as 'Unknown' | 'Gasoline' | 'Diesel' | 'Hybrid' | 'PlugInHybrid' | 'Electric' | 'FlexFuel' | 'Other',
        engineDescription: '',
        cylinders: '',
        engineDisplacementLiters: '',
        mileage: '',
        mileageUnit: 'km' as 'mi' | 'km',
        odometerStatus: 'Actual' as 'Unknown' | 'Actual' | 'ExceedsMechanicalLimits' | 'NotActual',
        
        // Colores y apariencia
        exteriorColor: '',
        interiorColor: '',
        upholstery: '',
        
        // Estado y condición
        condition: 'VeryGood' as 'Unknown' | 'New' | 'LikeNew' | 'Excellent' | 'VeryGood' | 'Good' | 'Fair' | 'Salvage',
        stockStatus: 'Available' as 'Unknown' | 'Available' | 'PendingSale' | 'OnHold' | 'Sold' | 'Transferred' | 'InTransit',
        
        // Fechas
        dateAcquired: '',
        dateListed: '',
        acquisitionSource: '',
        
        // Ubicación
        addressComplete: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        latitude: '',
        longitude: '',
        parkingLocation: '',
        
        // Precios - Campos exactos del backend
        originalListPrice: '',
        listPrice: '',
        currentPrice: '',
        actualPaidPrice: '',
        estimatedTax: '',
        estimatedRegistrationFee: '',
        dealerProcessingFee: '',
        
        // Finanzas
        monthlyPayment: '',
        apr: '',
        termMonths: '',
        downPayment: '',
        
        // Multimedia
        videoUrl: '',
        
        // Características (como strings separados por comas)
        standardFeatures: '',
        optionalFeatures: '',
        safetyFeatures: '',
        
        // Título
        titleBrand: 'Clean' as 'Unknown' | 'Clean' | 'Salvage' | 'Rebuilt' | 'Flood' | 'Lemon' | 'OdometerProblem' | 'Junk',
        hasLien: false,
        lienHolder: '',
        lienAmount: '',
        titleState: '',
        
        // Historial y estado
        hasOpenRecalls: false,
        hasAccidentHistory: false,
        isCertifiedPreOwned: false,
        
        // Garantía
        warrantyType: '',
        warrantyStart: '',
        warrantyEnd: '',
        warrantyProvider: '',
        
        // Notas
        internalNotes: '',
        description: '',
        
        // Campos de compatibilidad
        estado: 'propio' as 'propio' | 'financiado' | 'arrendado' | 'vendido'
    });

    // Opciones para los selectores
    const bodyStyles = [
        'Sedan', 'Coupe', 'Hatchback', 'Wagon', 'SUV', 'Truck', 'Van', 'Convertible', 'Other'
    ];

    const transmissionTypes = [
        'Automatic', 'Manual', 'CVT', 'DualClutch', 'Other'
    ];

    const drivetrainTypes = [
        { value: 'FWD', label: 'FWD (Tracción Delantera)' },
        { value: 'RWD', label: 'RWD (Tracción Trasera)' },
        { value: 'AWD', label: 'AWD (Tracción Integral)' },
        { value: 'FourWheelDrive', label: '4WD (Doble Tracción)' }
    ];

    const fuelTypes = [
        'Gasoline', 'Diesel', 'Hybrid', 'PlugInHybrid', 'Electric', 'FlexFuel', 'Other'
    ];

    const conditionTypes = [
        { value: 'New', label: 'Nuevo' },
        { value: 'LikeNew', label: 'Como Nuevo' },
        { value: 'Excellent', label: 'Excelente' },
        { value: 'VeryGood', label: 'Muy Bueno' },
        { value: 'Good', label: 'Bueno' },
        { value: 'Fair', label: 'Regular' },
        { value: 'Salvage', label: 'Salvamento' }
    ];

    const stockStatuses = [
        { value: 'Available', label: 'Disponible' },
        { value: 'PendingSale', label: 'Venta Pendiente' },
        { value: 'OnHold', label: 'En Espera' },
        { value: 'Sold', label: 'Vendido' },
        { value: 'Transferred', label: 'Transferido' },
        { value: 'InTransit', label: 'En Tránsito' }
    ];

    const titleBrands = [
        { value: 'Clean', label: 'Limpio' },
        { value: 'Salvage', label: 'Salvamento' },
        { value: 'Rebuilt', label: 'Reconstruido' },
        { value: 'Flood', label: 'Inundación' },
        { value: 'Lemon', label: 'Lemon Law' },
        { value: 'OdometerProblem', label: 'Problema Odómetro' },
        { value: 'Junk', label: 'Chatarra' }
    ];

    const odometerStatuses = [
        { value: 'Actual', label: 'Real' },
        { value: 'ExceedsMechanicalLimits', label: 'Excede Límites' },
        { value: 'NotActual', label: 'No Real' }
    ];

    const acquisitionSources = [
        'Compra Directa', 'Intercambio', 'Subasta', 'Consignación', 'Arrendamiento Terminado', 'Otro'
    ];

    const estadosVehiculo = [
        { value: 'propio', label: 'Propio' },
        { value: 'financiado', label: 'Financiado' },
        { value: 'arrendado', label: 'Arrendado' },
        { value: 'vendido', label: 'Vendido' }
    ];

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

    const handleGooglePlaceSelected = (placeData: any) => {
        console.log('🗺️ Google Place selected for vehicle:', placeData);
        
        setFormData(prev => ({
            ...prev,
            addressComplete: placeData.direccion,
            city: placeData.ciudad,
            state: placeData.estado,
            postalCode: placeData.codigoPostal,
            country: placeData.pais,
            latitude: placeData.latitud,
            longitude: placeData.longitud
        }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPhotos: Photo[] = [];
            const newPreviews: string[] = [];
            
            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            const imageUrl = event.target.result as string;
                            newPreviews.push(imageUrl);
                            
                            const photo: Photo = {
                                url: imageUrl,
                                caption: `Foto ${fotos.length + index + 1}`,
                                isPrimary: fotos.length === 0 && index === 0,
                                mimeType: file.type,
                                uploadedAt: new Date().toISOString()
                            };
                            newPhotos.push(photo);
                            
                            setPreviewImages(prev => [...prev, ...newPreviews]);
                            setFotos(prev => [...prev, ...newPhotos]);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const removePhoto = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFotos(prev => prev.filter((_, i) => i !== index));
    };

    const openFileSelector = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
            alert('Por favor completa los campos obligatorios: Marca, Modelo, Año y Placa');
            return;
        }

        setLoading(true);
        
        try {
            // TODO: Obtener TwinId del contexto de autenticación
            const twinId = 'demo-twin-id'; // Por ahora usar un ID temporal
            
            console.log('🚗 Enviando datos del vehículo al backend...');
            
            // Preparar datos para el backend
            const dataToSend = {
                ...formData,
                photos: fotos,
                // Mapear campos específicos del formulario
                addressComplete: formData.addressComplete,
                parkingLocation: formData.parkingLocation,
                // Asegurar tipos correctos
                year: Number(formData.year),
                doors: formData.doors ? Number(formData.doors) : undefined,
                cylinders: formData.cylinders ? Number(formData.cylinders) : undefined,
                engineDisplacementLiters: formData.engineDisplacementLiters ? Number(formData.engineDisplacementLiters) : undefined,
                mileage: formData.mileage ? Number(formData.mileage) : undefined,
                listPrice: formData.listPrice ? Number(formData.listPrice) : undefined,
                currentPrice: formData.currentPrice ? Number(formData.currentPrice) : undefined,
                estimatedTax: formData.estimatedTax ? Number(formData.estimatedTax) : undefined,
                estimatedRegistrationFee: formData.estimatedRegistrationFee ? Number(formData.estimatedRegistrationFee) : undefined,
                dealerProcessingFee: formData.dealerProcessingFee ? Number(formData.dealerProcessingFee) : undefined,
                monthlyPayment: formData.monthlyPayment ? Number(formData.monthlyPayment) : undefined,
                apr: formData.apr ? Number(formData.apr) : undefined,
                termMonths: formData.termMonths ? Number(formData.termMonths) : undefined,
                downPayment: formData.downPayment ? Number(formData.downPayment) : undefined,
                lienAmount: formData.lienAmount ? Number(formData.lienAmount) : undefined,
                latitude: formData.latitude ? Number(formData.latitude) : undefined,
                longitude: formData.longitude ? Number(formData.longitude) : undefined,
                // Boolean fields
                hasOpenRecalls: formData.hasOpenRecalls || false,
                hasAccidentHistory: formData.hasAccidentHistory || false,
                isCertifiedPreOwned: formData.isCertifiedPreOwned || false,
                hasLien: formData.hasLien || false
            };

            // Usar el servicio para crear el vehículo
            const result = await crearVehiculo(dataToSend, twinId);
            
            console.log('✅ Vehículo creado exitosamente:', result);
            alert('¡Vehículo creado exitosamente en el backend!');
            navigate('/twin-vehiculo');
            
        } catch (error) {
            console.error('❌ Error al crear vehículo:', error);
            
            // Mostrar mensaje de error más específico
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Error desconocido al crear el vehículo';
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        onClick={() => navigate('/twin-vehiculo')}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Vehículo</h1>
                        <p className="text-gray-600 mt-1">
                            Registra un nuevo vehículo en tu patrimonio
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Información Básica */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Información Básica
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Stock
                                </label>
                                <input
                                    type="text"
                                    name="stockNumber"
                                    value={formData.stockNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ST-2024-001"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marca *
                                </label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Toyota, Honda, Ford..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Modelo *
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Camry, Civic, Explorer..."
                                    required
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="LE, EX, Limited..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Submodelo
                                </label>
                                <input
                                    type="text"
                                    name="subModel"
                                    value={formData.subModel}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Hybrid, Sport, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Año *
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {bodyStyles.map(style => (
                                        <option key={style} value={style}>{style}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Puertas
                                </label>
                                <input
                                    type="number"
                                    name="doors"
                                    value={formData.doors}
                                    onChange={handleInputChange}
                                    min="2"
                                    max="8"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="4"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Placa *
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ABC-123"
                                    required
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Estado/Provincia"
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="17 caracteres del VIN"
                                    maxLength={17}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado del Vehículo
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {estadosVehiculo.map(estado => (
                                        <option key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Especificaciones Técnicas */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Especificaciones Técnicas
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transmisión
                                </label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {transmissionTypes.map(transmission => (
                                        <option key={transmission} value={transmission}>
                                            {transmission}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tracción
                                </label>
                                <select
                                    name="drivetrain"
                                    value={formData.drivetrain}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {drivetrainTypes.map(drivetrain => (
                                        <option key={drivetrain.value} value={drivetrain.value}>
                                            {drivetrain.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Combustible
                                </label>
                                <div className="relative">
                                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        name="fuelType"
                                        value={formData.fuelType}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {fuelTypes.map(fuel => (
                                            <option key={fuel} value={fuel}>
                                                {fuel}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción del Motor
                                </label>
                                <input
                                    type="text"
                                    name="engineDescription"
                                    value={formData.engineDescription}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2.0L I4, 3.5L V6, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cilindros
                                </label>
                                <input
                                    type="number"
                                    name="cylinders"
                                    value={formData.cylinders}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="16"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="4"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Desplazamiento (Litros)
                                </label>
                                <input
                                    type="number"
                                    name="engineDisplacementLiters"
                                    value={formData.engineDisplacementLiters}
                                    onChange={handleInputChange}
                                    step="0.1"
                                    min="0.1"
                                    max="10"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2.0"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kilometraje
                                </label>
                                <div className="relative">
                                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="mileage"
                                        value={formData.mileage}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <select
                                        name="mileageUnit"
                                        value={formData.mileageUnit}
                                        onChange={handleInputChange}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm border-none bg-transparent"
                                    >
                                        <option value="km">km</option>
                                        <option value="mi">mi</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado del Odómetro
                                </label>
                                <select
                                    name="odometerStatus"
                                    value={formData.odometerStatus}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {odometerStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Colores y Apariencia */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Colores y Apariencia
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Exterior
                                </label>
                                <input
                                    type="text"
                                    name="exteriorColor"
                                    value={formData.exteriorColor}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Blanco, Negro, Azul..."
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Negro, Beige, Gris..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tapicería
                                </label>
                                <input
                                    type="text"
                                    name="upholstery"
                                    value={formData.upholstery}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tela, Cuero, Semicuero..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado y Condición */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Estado y Condición
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condición General
                                </label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {conditionTypes.map(condition => (
                                        <option key={condition.value} value={condition.value}>
                                            {condition.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado en Inventario
                                </label>
                                <select
                                    name="stockStatus"
                                    value={formData.stockStatus}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {stockStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="hasOpenRecalls"
                                    checked={formData.hasOpenRecalls}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Tiene Recalls Abiertos
                                </label>
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="hasAccidentHistory"
                                    checked={formData.hasAccidentHistory}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Historial de Accidentes
                                </label>
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isCertifiedPreOwned"
                                    checked={formData.isCertifiedPreOwned}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Vehículo Certificado (CPO)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Fechas y Adquisición */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Fechas y Adquisición
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Adquisición
                                </label>
                                <input
                                    type="date"
                                    name="dateAcquired"
                                    value={formData.dateAcquired}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Listado
                                </label>
                                <input
                                    type="date"
                                    name="dateListed"
                                    value={formData.dateListed}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fuente de Adquisición
                                </label>
                                <select
                                    name="acquisitionSource"
                                    value={formData.acquisitionSource}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    {acquisitionSources.map(source => (
                                        <option key={source} value={source}>{source}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Ubicación del Vehículo */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Ubicación del Vehículo
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección donde se encuentra el vehículo *
                                </label>
                                <GoogleAddressAutocompleteModern
                                    value={formData.addressComplete}
                                    onChange={(value) => setFormData(prev => ({...prev, addressComplete: value}))}
                                    onPlaceSelected={handleGooglePlaceSelected}
                                    placeholder="Busca tu dirección usando Google Places"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Usa el buscador para encontrar tu dirección exacta
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ciudad"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Se llena automáticamente</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado/Provincia
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Estado o provincia"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Se llena automáticamente</p>
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="12345"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Se llena automáticamente</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        País
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="País"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Se llena automáticamente</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ubicación específica del estacionamiento
                                </label>
                                <input
                                    type="text"
                                    name="parkingLocation"
                                    value={formData.parkingLocation}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Cochera, Cajón #5, Lado derecho de la casa, Estacionamiento público, etc."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Describe dónde específicamente tienes estacionado el vehículo
                                </p>
                            </div>
                            
                            {/* Información adicional de ubicación */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 ¿Por qué es importante la ubicación?</h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• <strong>Seguros:</strong> Algunas aseguradoras ajustan tarifas según la ubicación</li>
                                    <li>• <strong>Seguridad:</strong> Te ayuda a recordar dónde dejaste el vehículo</li>
                                    <li>• <strong>Mantenimiento:</strong> Útil para programar servicios según la distancia</li>
                                    <li>• <strong>Documentos:</strong> Algunos trámites requieren domicilio del vehículo</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Información Financiera */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Información Financiera Personal
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio de Lista Original
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="originalListPrice"
                                        value={formData.originalListPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Precio MSRP original del fabricante</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio de Lista Actual
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="listPrice"
                                        value={formData.listPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Precio de lista cuando lo compraste</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor Actual de Mercado
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="currentPrice"
                                        value={formData.currentPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Valor actual de mercado estimado</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio Real Pagado
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="actualPaidPrice"
                                        value={formData.actualPaidPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Lo que realmente pagaste por el vehículo</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gastos de Compra
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="estimatedTax"
                                        value={formData.estimatedTax}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Impuestos, trámites, etc.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Costo de Matriculación
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="estimatedRegistrationFee"
                                        value={formData.estimatedRegistrationFee}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Placas, registro, documentos</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gastos Adicionales
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        name="dealerProcessingFee"
                                        value={formData.dealerProcessingFee}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Seguros, mejoras, accesorios</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Inversión Total
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        value={
                                            (Number(formData.listPrice) || 0) + 
                                            (Number(formData.estimatedTax) || 0) + 
                                            (Number(formData.estimatedRegistrationFee) || 0) + 
                                            (Number(formData.dealerProcessingFee) || 0)
                                        }
                                        readOnly
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Total invertido (calculado automáticamente)</p>
                            </div>
                        </div>
                        
                        {/* Información de Financiamiento Personal */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Financiamiento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pago Mensual
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="monthlyPayment"
                                            value={formData.monthlyPayment}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Si tienes financiamiento</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tasa de Interés (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="apr"
                                        value={formData.apr}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="5.99"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">APR del préstamo</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plazo (Meses)
                                    </label>
                                    <input
                                        type="number"
                                        name="termMonths"
                                        value={formData.termMonths}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="120"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="60"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Duración del préstamo</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enganche Pagado
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="downPayment"
                                            value={formData.downPayment}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Pago inicial realizado</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Resumen Financiero */}
                        {(Number(formData.currentPrice) > 0 && Number(formData.listPrice) > 0) && (
                            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-md font-medium text-blue-900 mb-2">📊 Resumen Financiero</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-blue-800">Inversión Total:</span>
                                        <span className="block text-blue-700">
                                            ${((Number(formData.listPrice) || 0) + 
                                            (Number(formData.estimatedTax) || 0) + 
                                            (Number(formData.estimatedRegistrationFee) || 0) + 
                                            (Number(formData.dealerProcessingFee) || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-800">Valor Actual:</span>
                                        <span className="block text-blue-700">
                                            ${Number(formData.currentPrice).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-800">
                                            {Number(formData.currentPrice) >= (Number(formData.listPrice) + Number(formData.estimatedTax) + Number(formData.estimatedRegistrationFee) + Number(formData.dealerProcessingFee)) ? 'Ganancia:' : 'Pérdida:'}
                                        </span>
                                        <span className={`block font-bold ${
                                            Number(formData.currentPrice) >= (Number(formData.listPrice) + Number(formData.estimatedTax) + Number(formData.estimatedRegistrationFee) + Number(formData.dealerProcessingFee)) 
                                            ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            ${Math.abs(
                                                Number(formData.currentPrice) - 
                                                (Number(formData.listPrice) + Number(formData.estimatedTax) + Number(formData.estimatedRegistrationFee) + Number(formData.dealerProcessingFee))
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Características */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Características del Vehículo
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características Estándar
                                </label>
                                <textarea
                                    name="standardFeatures"
                                    value={formData.standardFeatures}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Separar características con comas: A/C, Radio, Bolsas de aire..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características Opcionales
                                </label>
                                <textarea
                                    name="optionalFeatures"
                                    value={formData.optionalFeatures}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Separar características con comas: Techo solar, GPS, Asientos de cuero..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características de Seguridad
                                </label>
                                <textarea
                                    name="safetyFeatures"
                                    value={formData.safetyFeatures}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Separar características con comas: ABS, Control de estabilidad, Cámara trasera..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información del Título */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Información del Título
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marca del Título
                                </label>
                                <select
                                    name="titleBrand"
                                    value={formData.titleBrand}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {titleBrands.map(brand => (
                                        <option key={brand.value} value={brand.value}>
                                            {brand.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado del Título
                                </label>
                                <input
                                    type="text"
                                    name="titleState"
                                    value={formData.titleState}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Estado donde se emitió"
                                />
                            </div>
                            
                            <div className="flex items-center pt-8">
                                <input
                                    type="checkbox"
                                    name="hasLien"
                                    checked={formData.hasLien}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Tiene Gravamen
                                </label>
                            </div>
                        </div>
                        
                        {formData.hasLien && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Acreedor Prendario
                                    </label>
                                    <input
                                        type="text"
                                        name="lienHolder"
                                        value={formData.lienHolder}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nombre del banco o financiera"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto del Gravamen
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="lienAmount"
                                            value={formData.lienAmount}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Garantía */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Información de Garantía
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Garantía
                                </label>
                                <input
                                    type="text"
                                    name="warrantyType"
                                    value={formData.warrantyType}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Manufacturera, Extendida, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proveedor de Garantía
                                </label>
                                <input
                                    type="text"
                                    name="warrantyProvider"
                                    value={formData.warrantyProvider}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Toyota, Honda, etc."
                                />
                            </div>
                            
                            <div></div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Inicio de Garantía
                                </label>
                                <input
                                    type="date"
                                    name="warrantyStart"
                                    value={formData.warrantyStart}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fin de Garantía
                                </label>
                                <input
                                    type="date"
                                    name="warrantyEnd"
                                    value={formData.warrantyEnd}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Multimedia */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Multimedia y Video
                        </h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL de Video / Tour Virtual
                            </label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Fotos */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Fotos del Vehículo
                        </h2>
                        
                        <div className="space-y-4">
                            <Button
                                type="button"
                                onClick={openFileSelector}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Subir Fotos
                            </Button>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
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
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            {fotos[index]?.isPrimary && (
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                    Principal
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notas Internas */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Notas y Descripción
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas Internas
                                </label>
                                <textarea
                                    name="internalNotes"
                                    value={formData.internalNotes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Notas internas para el equipo de ventas, condiciones especiales, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción General
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Descripción detallada del vehículo para publicaciones, historial de mantenimiento, modificaciones, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <Button
                            type="button"
                            onClick={() => navigate('/twin-vehiculo')}
                            variant="outline"
                            className="sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Guardando...' : 'Guardar Vehículo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearVehiculoPage;