import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAgentCreateHome, HomeData } from '@/services/casaAgentApiService';
import { 
    ArrowLeft, 
    Upload,
    FileText,
    Shield,
    Home,
    Clipboard,
    Receipt,
    Camera,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Trash2,
    Plus,
    Cloud,
    FileImage,
    FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentType {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
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

const DocumentosCasaPage: React.FC = () => {
    const { houseId } = useParams<{ houseId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const { obtenerCasaPorId, subirSeguroCasa } = useAgentCreateHome();
    
    const [casa, setCasa] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);

    const twinId = accounts[0]?.localAccountId;

    // Definir tipos de documentos
    const documentTypes: DocumentType[] = [
        {
            id: 'insurance',
            title: 'Seguro de Casa',
            description: 'Póliza de seguro, coberturas y documentos relacionados',
            icon: Shield,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-home-insurance',
            files: []
        },
        {
            id: 'title',
            title: 'Título de Propiedad',
            description: 'Escrituras, títulos y documentos de propiedad',
            icon: FileText,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-property-title',
            files: []
        },
        {
            id: 'inspection',
            title: 'Inspecciones',
            description: 'Reportes de inspección, evaluaciones y certificaciones',
            icon: Clipboard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-inspection',
            files: []
        },
        {
            id: 'receipts',
            title: 'Facturas y Recibos',
            description: 'Facturas de servicios, mejoras y mantenimiento',
            icon: Receipt,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-receipts',
            files: []
        },
        {
            id: 'maintenance',
            title: 'Mantenimiento',
            description: 'Registros de mantenimiento, reparaciones y mejoras',
            icon: FileCheck,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50',
            borderColor: 'border-teal-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-maintenance',
            files: []
        },
        {
            id: 'photos',
            title: 'Galería de Fotos',
            description: 'Fotos de la propiedad, antes/después, daños',
            icon: Camera,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            acceptedFiles: 'image/*',
            endpoint: 'simple-upload-photo',
            files: []
        }
    ];

    // Cargar información de la casa
    useEffect(() => {
        const cargarCasa = async () => {
            if (!twinId || !houseId) {
                setLoading(false);
                return;
            }

            try {
                const casaEncontrada = await obtenerCasaPorId(twinId, houseId);
                setCasa(casaEncontrada || null);
            } catch (error) {
                console.error('Error al cargar casa:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCasa();
    }, [twinId, houseId, obtenerCasaPorId]);

    // Manejar upload de documentos
    const handleUploadDocument = async (docType: DocumentType, files: FileList) => {
        if (!twinId || !houseId) return;

        setUploadingDoc(docType.id);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`📄 Subiendo ${docType.title}:`, file.name);
                
                // Por ahora usar la función de seguro, luego expandir para otros tipos
                if (docType.id === 'insurance') {
                    await subirSeguroCasa(twinId, houseId, file);
                }
                // TODO: Implementar otros tipos de documentos
            }

            alert(`✅ ${docType.title} subido exitosamente`);
        } catch (error) {
            console.error('Error al subir documento:', error);
            alert(`❌ Error al subir ${docType.title}`);
        } finally {
            setUploadingDoc(null);
        }
    };

    // Manejar drag and drop
    const handleDragOver = (e: React.DragEvent, docTypeId: string) => {
        e.preventDefault();
        setDraggedOver(docTypeId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedOver(null);
    };

    const handleDrop = (e: React.DragEvent, docType: DocumentType) => {
        e.preventDefault();
        setDraggedOver(null);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUploadDocument(docType, files);
        }
    };

    // Abrir selector de archivos
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando documentos...</p>
                </div>
            </div>
        );
    }

    if (!casa) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Casa no encontrada</h2>
                    <Button onClick={() => navigate('/mi-patrimonio/casas')} className="mt-4">
                        Volver a Mis Casas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/mi-patrimonio/casas')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Documentos de Propiedad
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {casa.direccion}, {casa.ciudad}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Gestión de Documentos
                                </h2>
                                <p className="text-gray-600">
                                    Organiza todos los documentos importantes de tu propiedad
                                </p>
                            </div>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="bg-gray-100 rounded-full p-1 max-w-md mx-auto">
                            <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                                 style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            3 de 6 tipos de documentos completados
                        </p>
                    </div>
                </div>

                {/* Document Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {documentTypes.map((docType) => {
                        const IconComponent = docType.icon;
                        const isUploading = uploadingDoc === docType.id;
                        const isDraggedOver = draggedOver === docType.id;
                        
                        return (
                            <Card 
                                key={docType.id} 
                                className={`
                                    relative overflow-hidden transition-all duration-300 cursor-pointer
                                    ${isDraggedOver ? 'scale-105 shadow-2xl ring-4 ring-blue-400' : 'hover:shadow-xl'}
                                    ${docType.borderColor} border-2
                                `}
                                onDragOver={(e) => handleDragOver(e, docType.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, docType)}
                                onClick={() => !isUploading && openFileSelector(docType)}
                            >
                                {/* Header */}
                                <div className={`${docType.bgColor} p-4 sm:p-6`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                                                <IconComponent className={`w-6 h-6 ${docType.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                                    {docType.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {docType.files.length > 0 ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-xs">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {docType.files.length} archivo(s)
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Sin documentos
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Status icon */}
                                        <div className={`p-1 rounded-full ${docType.files.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            {docType.files.length > 0 ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        {docType.description}
                                    </p>

                                    {/* Upload area */}
                                    <div className={`
                                        border-2 border-dashed rounded-lg p-4 text-center transition-all
                                        ${isDraggedOver 
                                            ? 'border-blue-400 bg-blue-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                                    `}>
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="text-sm text-gray-600">Subiendo...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Cloud className="w-8 h-8 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Arrastra archivos aquí
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        o haz click para seleccionar
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Files list */}
                                    {docType.files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Archivos subidos:
                                            </h4>
                                            {docType.files.slice(0, 2).map((file) => (
                                                <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileImage className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs text-gray-700 truncate">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button className="p-1 hover:bg-gray-200 rounded">
                                                            <Eye className="w-3 h-3 text-gray-500" />
                                                        </button>
                                                        <button className="p-1 hover:bg-gray-200 rounded">
                                                            <Download className="w-3 h-3 text-gray-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {docType.files.length > 2 && (
                                                <p className="text-xs text-gray-500 text-center">
                                                    +{docType.files.length - 2} archivo(s) más
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Tips section */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Consejos para organizar tus documentos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">📄 Formatos recomendados:</h4>
                            <ul className="space-y-1 ml-4">
                                <li>• PDF para documentos oficiales</li>
                                <li>• JPG/PNG para fotos de alta calidad</li>
                                <li>• Documentos escaneados a 300 DPI mínimo</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">🔒 Seguridad:</h4>
                            <ul className="space-y-1 ml-4">
                                <li>• Tus documentos están encriptados</li>
                                <li>• Acceso solo con tu autenticación</li>
                                <li>• Respaldo automático en la nube</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentosCasaPage;