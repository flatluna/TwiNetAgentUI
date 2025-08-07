import React, { useState, useEffect } from 'react';
import { X, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { documentApiService } from '@/services/documentApiService';
import { useMsal } from '@azure/msal-react';

interface DocumentFile {
    id: string;
    filename: string;
    tipo: string;
    tamano: string;
    categoria: string;
    fechaSubida: string;
    path?: string;
    metadata?: {
        vendor?: string;
        [key: string]: any;
    };
}

interface RichDocumentData {
    htmlReport?: string;
    structuredData?: any;
    fullTextContent?: string;
    tablesContent?: any[];
}

interface TwinAgentFileViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    filename: string | null;
}

// Función para determinar el tipo de documento basado en la subcategoría
const getDocumentType = (categoria: string): string => {
    const semiStructuredCategories = [
        'factura', 'facturas', 'invoice', 'invoices',
        'licencia', 'licensias', 'licencias', 'license', 'licenses',
        'contrato', 'contratos', 'contract', 'contracts',
        'recibo', 'recibos', 'receipt', 'receipts',
        'orden', 'ordenes', 'order', 'orders',
        'certificado', 'certificados', 'certificate', 'certificates',
        'diploma', 'diplomas',
        'formulario', 'formularios', 'form', 'forms'
    ];
    
    const categoryLower = categoria.toLowerCase().trim();
    
    if (semiStructuredCategories.some(cat => categoryLower.includes(cat))) {
        return 'Semi-estructurado';
    }
    
    return 'Estructurado';
};

const TwinAgentFileViewerModal: React.FC<TwinAgentFileViewerModalProps> = ({ isOpen, onClose, filename }) => {
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    
    const [archivo, setArchivo] = useState<DocumentFile | null>(null);
    const [richDocumentData, setRichDocumentData] = useState<RichDocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);

    const twinId = msalUser?.localAccountId;

    useEffect(() => {
        const loadDocumentData = async () => {
            if (!isOpen || !twinId || !filename) {
                return;
            }

            setLoading(true);
            setError(null);
            setArchivo(null);
            setRichDocumentData(null);

            try {
                console.log('🔍 TwinAgent Modal - Cargando datos del documento:', filename);
                console.log('🆔 TwinAgent Modal - Twin ID:', twinId);
                
                // Llamar al endpoint para obtener los metadatos ricos del documento desde Cosmos DB
                const response = await documentApiService.getDocumentMetadata(twinId, filename);
                
                if (response.success && response.data) {
                    console.log('✅ TwinAgent Modal - Metadatos del documento cargados:', response.data);
                    
                    // Mapear los datos al formato esperado
                    const documentData: DocumentFile = {
                        id: response.data.id || filename,
                        filename: filename,
                        tipo: response.data.metadata?.content_type || 'application/pdf',
                        tamano: response.data.size_bytes?.toString() || 'N/A',
                        categoria: response.data.metadata?.sub_category || 'documento',
                        fechaSubida: response.data.metadata?.created_at || new Date().toISOString(),
                        path: response.data.metadata?.documentUrl || response.data.public_url,
                        metadata: response.data.metadata
                    };

                    const richData: RichDocumentData = {
                        htmlReport: response.data.metadata?.htmlReport,
                        structuredData: response.data.metadata?.structuredData,
                        fullTextContent: response.data.metadata?.fullTextContent,
                        tablesContent: response.data.metadata?.tablesContent
                    };

                    setArchivo(documentData);
                    setRichDocumentData(richData);
                    
                    console.log('📊 TwinAgent Modal - HTML Report disponible:', !!richData.htmlReport);
                    console.log('📊 TwinAgent Modal - Datos estructurados disponibles:', !!richData.structuredData);
                    
                } else {
                    console.error('❌ TwinAgent Modal - Error al cargar metadatos:', response.error);
                    setError(response.error || 'Error al cargar los metadatos del documento');
                }
                
            } catch (error) {
                console.error('❌ TwinAgent Modal - Error inesperado:', error);
                setError('Error inesperado al cargar el documento');
            } finally {
                setLoading(false);
            }
        };

        loadDocumentData();
    }, [isOpen, twinId, filename]);

    // Determinar el tipo de documento basado en la categoría
    const documentType = archivo ? getDocumentType(archivo.categoria) : 'Desconocido';

    const handleClose = () => {
        setArchivo(null);
        setRichDocumentData(null);
        setError(null);
        setPdfLoading(true);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                        <FileText className="text-green-600 flex-shrink-0" size={20} />
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                                {filename || 'Documento'}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500">TwinAgent - Visor de Archivos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content with Scroll */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <Loader2 className="mx-auto mb-4 text-green-500 animate-spin" size={36} />
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Cargando documento...</h3>
                                <p className="text-sm text-gray-600">Obteniendo datos del archivo desde TwinAgent</p>
                            </div>
                        </div>
                    ) : error || !archivo ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Error</h3>
                                <p className="text-sm text-gray-600 mb-4">{error || 'No se pudieron cargar los detalles del documento.'}</p>
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* PDF Viewer - Mobile first, then left side on desktop */}
                            <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-200 flex flex-col overflow-hidden">
                                <div className="p-2 md:p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 flex items-center">
                                        <FileText className="mr-2" size={14} />
                                        Vista Previa del Documento
                                    </h3>
                                </div>
                                
                                <div className="flex-1 relative bg-white overflow-hidden">
                                    {archivo.filename.toLowerCase().endsWith('.pdf') ? (
                                        <div className="w-full h-full relative">
                                            {/* Loading indicator */}
                                            {pdfLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                                                        <p className="text-xs md:text-sm text-gray-600">Cargando PDF...</p>
                                                    </div>
                                                </div>
                                            )}
                                            <iframe
                                                src={archivo.path || `/uploads/${archivo.filename}`}
                                                className="w-full h-full border-0"
                                                title={`Vista previa de ${archivo.filename}`}
                                                allow="fullscreen"
                                                onLoad={() => setPdfLoading(false)}
                                                onError={() => setPdfLoading(false)}
                                            />
                                        </div>
                                    ) : (archivo.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) ? (
                                        <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-auto">
                                            <img
                                                src={archivo.path || `/uploads/${archivo.filename}`}
                                                alt={archivo.filename}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                                            <div className="text-center">
                                                <FileText className="mx-auto mb-4 text-gray-400" size={36} />
                                                <p className="text-sm font-medium text-gray-700">{archivo.filename}</p>
                                                <p className="text-xs text-gray-500">Tipo: {archivo.tipo}</p>
                                                <button
                                                    onClick={() => {
                                                        const url = archivo.path || `/uploads/${archivo.filename}`;
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = archivo.filename;
                                                        link.click();
                                                    }}
                                                    className="mt-3 px-3 py-2 bg-green-600 text-white text-xs md:text-sm rounded-lg hover:bg-green-700"
                                                >
                                                    Descargar archivo
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Content - Mobile second, then right side on desktop */}
                            <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden">
                                <div className="p-2 md:p-3 bg-green-50 border-b border-green-200 flex-shrink-0">
                                    <h3 className="text-xs md:text-sm font-semibold text-green-700">
                                        🧠 Contenido Procesado por IA (TwinAgent)
                                    </h3>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    {richDocumentData?.htmlReport ? (
                                        <div className="h-full">
                                            <div className="p-2 bg-green-100 border-b border-green-200 sticky top-0 z-10">
                                                <span className="text-xs text-green-700 font-medium">
                                                    📄 HTML Renderizado ({richDocumentData.htmlReport.length.toLocaleString()} caracteres)
                                                </span>
                                            </div>
                                            <div 
                                                className="p-2 md:p-3 bg-white prose prose-sm max-w-none"
                                                style={{
                                                    lineHeight: '1.6',
                                                    fontSize: '12px',
                                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                                }}
                                                dangerouslySetInnerHTML={{ 
                                                    __html: richDocumentData.htmlReport 
                                                }}
                                            />
                                            
                                            {/* Document Information Section */}
                                            <div className="p-2 md:p-3 bg-gray-50 border-t border-gray-200">
                                                <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">📄 Información del documento</h4>
                                                <div className="grid grid-cols-1 gap-1 md:gap-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Archivo:</span>
                                                        <span className="text-gray-800 text-right text-xs truncate ml-2">{archivo.filename}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Tipo:</span>
                                                        <span className="text-gray-800">{archivo.tipo}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Categoría:</span>
                                                        <span className="text-gray-800 text-right truncate ml-2">{archivo.categoria}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Tamaño:</span>
                                                        <span className="text-gray-800">{archivo.tamano}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Fecha:</span>
                                                        <span className="text-gray-800">{new Date(archivo.fechaSubida).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-600">Tipo de Doc:</span>
                                                        <span className={`px-1 md:px-2 py-1 rounded text-xs font-medium ${
                                                            documentType === 'Semi-estructurado' 
                                                                ? 'bg-orange-100 text-orange-800' 
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {documentType}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* AI Analysis Status */}
                                                <div className="mt-2 md:mt-3 p-2 bg-green-100 rounded border border-green-200">
                                                    <p className="text-xs text-green-700">
                                                        <strong>Estado:</strong> {richDocumentData?.htmlReport ? 
                                                            "✅ Procesado por IA en TwinAgent" :
                                                            "ℹ️ Sin procesamiento de IA disponible"
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 text-center p-4 md:p-6">
                                            <div>
                                                <AlertTriangle className="mx-auto mb-3 text-gray-400" size={24} />
                                                <p className="text-xs md:text-sm mb-1">No hay contenido HTML disponible</p>
                                                <p className="text-xs">El documento no ha sido procesado por IA en TwinAgent</p>
                                                <div className="mt-3 text-xs text-gray-400">
                                                    <p><strong>Estado:</strong></p>
                                                    <ul className="text-left mt-1 space-y-1">
                                                        <li>• HTML Report: {richDocumentData?.htmlReport ? '✅' : '❌'}</li>
                                                        <li>• Datos estructurados: {richDocumentData?.structuredData ? '✅' : '❌'}</li>
                                                        <li>• Texto completo: {richDocumentData?.fullTextContent ? '✅' : '❌'}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with document info - Fixed */}
                {archivo && (
                    <div className="p-2 md:p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs text-gray-600 space-y-2 md:space-y-0">
                            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                                <span className="truncate"><strong>Archivo:</strong> {archivo.filename}</span>
                                <span><strong>Tipo:</strong> {documentType}</span>
                                <span className="truncate"><strong>Categoría:</strong> {archivo.categoria}</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                                <span><strong>Tamaño:</strong> {archivo.tamano}</span>
                                <span><strong>Fecha:</strong> {new Date(archivo.fechaSubida).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwinAgentFileViewerModal;
