import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehiculoService } from '@/services/vehiculoApiService';
import { useUser } from '@/context/UserContext';
import { 
    ArrowLeft, 
    FileText,
    Shield,
    Receipt,
    CheckCircle2,
    AlertCircle,
    Eye,
    Plus,
    Cloud,
    FileCheck,
    CreditCard,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentType {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    acceptedFiles: string;
    endpoint: string;
    files: DocumentFile[];
}

interface DocumentFile {
    id: string;
    name: string;
    url: string;
    uploadDate: string;
    size: string;
    type: string;
}

interface Vehicle {
    id: string;
    marca: string;
    modelo: string;
    año: number;
    placa: string;
    color: string;
    vin: string;
    tipo: string;
}

const DocumentosVehiculoPage: React.FC = () => {
    const { vehicleId } = useParams<{ vehicleId?: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { uploadCarInsurance } = useVehiculoService();

    // Obtener currentTwinId del usuario autenticado
    const currentTwinId = user?.twinId;

    const [loading, setLoading] = useState(true);
    const [vehiculo, setVehiculo] = useState<Vehicle | null>(null);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    // Tipos de documentos para vehículos
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
        {
            id: 'title',
            title: 'Título de Propiedad',
            description: 'Documento que acredita la propiedad del vehículo',
            icon: FileCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-title',
            files: []
        },
        {
            id: 'insurance',
            title: 'Seguro Auto',
            description: 'Póliza vigente del seguro del vehículo',
            icon: Shield,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-insurance',
            files: []
        },
        {
            id: 'financing',
            title: 'Financiamiento',
            description: 'Contratos de préstamo o financiamiento del vehículo',
            icon: CreditCard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-financing',
            files: []
        },
        {
            id: 'maintenance',
            title: 'Mantenimiento',
            description: 'Registros de servicios y mantenimiento del vehículo',
            icon: Settings,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-maintenance',
            files: []
        },
        {
            id: 'inspection',
            title: 'Verificación',
            description: 'Certificados de verificación vehicular y emisiones',
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
            borderColor: 'border-emerald-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-inspection',
            files: []
        },
        {
            id: 'receipts',
            title: 'Comprobantes',
            description: 'Facturas, recibos y comprobantes relacionados',
            icon: Receipt,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            borderColor: 'border-indigo-200',
            acceptedFiles: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
            endpoint: 'vehicle-receipts',
            files: []
        }
    ]);

    // Función auxiliar para formatear el tamaño de archivo
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Cargar información del vehículo (simulado por ahora)
    useEffect(() => {
        if (hasLoadedRef.current) return; // Evitar múltiples cargas
        
        const loadVehicle = async () => {
            setLoading(true);
            try {
                // Simulando carga del vehículo - datos fake mientras no hay backend
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Datos simulados del vehículo basados en el vehicleId
                const vehiculoSimulado = {
                    id: vehicleId || '1',
                    marca: 'Toyota',
                    modelo: 'Camry',
                    año: 2022,
                    placa: 'ABC-123',
                    color: 'Blanco',
                    vin: '1HGBH41JXMN109186',
                    tipo: 'Sedán'
                };

                // Si no hay vehicleId en la URL, usar datos por defecto
                if (!vehicleId) {
                    vehiculoSimulado.id = 'demo-vehicle';
                    vehiculoSimulado.marca = 'Honda';
                    vehiculoSimulado.modelo = 'Civic';
                    vehiculoSimulado.año = 2023;
                    vehiculoSimulado.placa = 'XYZ-789';
                    vehiculoSimulado.color = 'Azul';
                    vehiculoSimulado.tipo = 'Sedán';
                }
                
                setVehiculo(vehiculoSimulado);

                // Simular algunos documentos de ejemplo para demostración
                const documentosEjemplo = documentTypes.map(docType => {
                    // Agregar documentos de ejemplo para algunos tipos
                    if (docType.id === 'insurance') {
                        return {
                            ...docType,
                            files: [
                                {
                                    id: 'ins-1',
                                    name: 'Póliza_Seguro_Auto_2024.pdf',
                                    url: '#documento-ejemplo',
                                    uploadDate: '15/08/2024',
                                    size: '2.3 MB',
                                    type: 'application/pdf'
                                }
                            ]
                        };
                    }
                    if (docType.id === 'title') {
                        return {
                            ...docType,
                            files: [
                                {
                                    id: 'title-1',
                                    name: 'Título_Propiedad_Vehiculo.pdf',
                                    url: '#documento-ejemplo',
                                    uploadDate: '01/03/2024',
                                    size: '1.8 MB',
                                    type: 'application/pdf'
                                }
                            ]
                        };
                    }
                    if (docType.id === 'financing') {
                        return {
                            ...docType,
                            files: [
                                {
                                    id: 'fin-1',
                                    name: 'Contrato_Financiamiento.pdf',
                                    url: '#documento-ejemplo',
                                    uploadDate: '10/01/2024',
                                    size: '3.1 MB',
                                    type: 'application/pdf'
                                }
                            ]
                        };
                    }
                    return docType;
                });

                setDocumentTypes(documentosEjemplo);
                hasLoadedRef.current = true; // Marcar como cargado
                
            } catch (error) {
                console.error('Error loading vehicle:', error);
                // Incluso con error, mostrar datos simulados
                setVehiculo({
                    id: vehicleId || 'demo-vehicle',
                    marca: 'Toyota',
                    modelo: 'Camry',
                    año: 2022,
                    placa: 'ABC-123',
                    color: 'Blanco',
                    vin: '1HGBH41JXMN109186',
                    tipo: 'Sedán'
                });
                hasLoadedRef.current = true; // Marcar como cargado incluso con error
            } finally {
                setLoading(false);
            }
        };

        // Siempre cargar, incluso sin twinId o vehicleId para demo
        loadVehicle();
    }, []); // Solo ejecutar una vez al montar el componente

    const handleUploadDocument = async (docType: DocumentType, files: FileList) => {
        // Verificar si tenemos TwinId y VehicleId para usar servicios reales
        if (!currentTwinId || !vehicleId) {
            console.warn('⚠️ Sin TwinId o VehicleId, usando modo demo');
            return handleUploadDocumentDemo(docType, files);
        }

        setUploadingDoc(docType.id);
        
        try {
            // Manejar específicamente el seguro auto con función real
            if (docType.id === 'insurance') {
                console.log('🛡️ Subiendo seguro auto usando servicio real');
                
                const result = await uploadCarInsurance(currentTwinId, vehicleId, files, 'seguro-auto');
                
                if (result.Success) {
                    // Actualizar la UI con los archivos subidos exitosamente
                    const newFiles = result.Results
                        .filter((r: any) => r.success)
                        .map((r: any, index: number) => ({
                            id: `insurance-${Date.now()}-${index}`,
                            name: r.fileName,
                            url: r.result?.filePath || r.result?.url || '#uploaded',
                            uploadDate: new Date().toLocaleDateString('es-ES'),
                            size: formatFileSize(files[index]?.size || 0),
                            type: files[index]?.type || 'unknown'
                        }));

                    // Actualizar el tipo de documento con los nuevos archivos
                    setDocumentTypes(prev => prev.map(dt => {
                        if (dt.id === docType.id) {
                            return {
                                ...dt,
                                files: [...(dt.files || []), ...newFiles]
                            };
                        }
                        return dt;
                    }));

                    alert(`✅ ${result.Message}`);
                } else {
                    throw new Error('Error al subir seguro auto');
                }
            } else {
                // Para otros tipos de documento, usar modo demo por ahora
                console.log(`📄 Usando modo demo para ${docType.title}`);
                return handleUploadDocumentDemo(docType, files);
            }
        } catch (error) {
            console.error('Error al subir documento:', error);
            alert(`❌ Error al subir ${docType.title}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setUploadingDoc(null);
        }
    };

    // Función de demo para documentos que aún no tienen servicio real
    const handleUploadDocumentDemo = async (docType: DocumentType, files: FileList) => {
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`📄 Subiendo ${docType.title} (DEMO):`, file.name);
                
                // Simular subida de archivo
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Agregar el archivo a la lista de documentos del tipo
                const newFile = {
                    id: `file-${Date.now()}-${i}`,
                    name: file.name,
                    url: URL.createObjectURL(file), // URL temporal para previsualización
                    uploadDate: new Date().toLocaleDateString('es-ES'),
                    size: formatFileSize(file.size),
                    type: file.type
                };

                // Actualizar el tipo de documento con el nuevo archivo
                setDocumentTypes(prev => prev.map(dt => {
                    if (dt.id === docType.id) {
                        return {
                            ...dt,
                            files: [...(dt.files || []), newFile]
                        };
                    }
                    return dt;
                }));
            }

            alert(`✅ ${docType.title} subido exitosamente (DEMO)`);
        } catch (error) {
            console.error('Error en demo:', error);
            alert(`❌ Error al subir ${docType.title} (DEMO)`);
        }
    };

    const openFileSelector = (docType: DocumentType) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = docType.acceptedFiles;
        
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                handleUploadDocument(docType, files);
            }
        };
        
        input.click();
    };

    // Función para ver archivos
    const handleViewFile = (file: DocumentFile) => {
        // Si es una URL temporal de Object URL o una URL válida, abrirla
        if (file.url && (file.url.startsWith('blob:') || file.url.startsWith('http'))) {
            window.open(file.url, '_blank');
        } else {
            // Para URLs que no son válidas, mostrar el modal
            setSelectedFile(file);
            setShowViewModal(true);
        }
    };

    // Manejar drag and drop
    const handleDragOver = (e: React.DragEvent, docTypeId: string) => {
        e.preventDefault();
        setDragOverId(docTypeId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, docType: DocumentType) => {
        e.preventDefault();
        setDragOverId(null);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUploadDocument(docType, files);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando documentos del vehículo...</p>
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
                            onClick={() => navigate(-1)}
                            variant="outline"
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Documentos del Vehículo
                            </h1>
                            {vehiculo && (
                                <p className="text-gray-600 mt-1">
                                    {vehiculo.marca} {vehiculo.modelo} {vehiculo.año} - {vehiculo.placa}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Banner de información */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                            <p className="text-sm text-blue-700">
                                <strong>Estado del Sistema:</strong> 
                                {currentTwinId && vehicleId ? (
                                    <>
                                        <span className="text-green-700 font-medium"> ✅ Seguro Auto</span> integrado con backend real. 
                                        Otros documentos en modo demo temporal.
                                    </>
                                ) : (
                                    <>
                                        Modo Demo: Los documentos se almacenan temporalmente. 
                                        Necesita autenticación para funcionalidad completa.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid de tipos de documentos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {documentTypes.map((docType) => (
                        <Card
                            key={docType.id}
                            className={`hover:shadow-lg transition-shadow duration-200 ${
                                dragOverId === docType.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                            }`}
                            onDragOver={(e) => handleDragOver(e, docType.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, docType)}
                        >
                            <div className="p-6">
                                {/* Header del card */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${docType.bgColor}`}>
                                            <docType.icon className={`w-6 h-6 ${docType.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {docType.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {docType.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Área de subida */}
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                                    {uploadingDoc === docType.id ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="text-sm text-blue-600">Subiendo...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-3">
                                                Arrastra archivos aquí o
                                            </p>
                                            <Button
                                                onClick={() => openFileSelector(docType)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                size="sm"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Seleccionar archivos
                                            </Button>
                                            <p className="text-xs text-gray-500 mt-2">
                                                PDF, DOC, DOCX, Imágenes
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Lista de archivos subidos */}
                                {docType.files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Archivos subidos:</h4>
                                        {docType.files.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {file.uploadDate} • {file.size}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleViewFile(file)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Ver documento"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal para ver archivos */}
            {showViewModal && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Vista previa no disponible para este tipo de archivo
                                </p>
                                <p className="text-sm text-gray-500">
                                    Tamaño: {selectedFile.size} • Subido: {selectedFile.uploadDate}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentosVehiculoPage;