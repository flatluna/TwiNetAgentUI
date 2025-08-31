import React, { useState, useEffect } from 'react';
import { X, FileText, AlertTriangle, Loader2, Download } from 'lucide-react';
import { documentApiService } from '@/services/documentApiService';
import { EducationDocument } from '@/services/twinApiService';

interface EducationDocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: EducationDocument | null;
}

const EducationDocumentViewerModal: React.FC<EducationDocumentViewerModalProps> = ({ 
    isOpen, 
    onClose, 
    document 
}) => {
    const [sasUrl, setSasUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);

    useEffect(() => {
        const loadSasUrl = async () => {
            if (!isOpen || !document) {
                return;
            }

            console.log('🔍 Document data received:', document);
            console.log('🔍 Document sasUrl:', document.sasUrl);
            console.log('🔍 Document sourceUri:', document.sourceUri);
            
            // Check if document already has sasUrl or sourceUri
            const documentUrl = document.sasUrl || document.sourceUri;
            
            if (documentUrl) {
                console.log('✅ Using existing document URL:', documentUrl);
                setSasUrl(documentUrl);
                setLoading(false);
                return;
            }

            // If no URL available and we have container and documentId, try to get SAS URL from API
            if (!document.containerName || !document.documentId) {
                setError('Información del documento incompleta');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setSasUrl(null);

            try {
                console.log('🔍 Loading SAS URL for education document:', document);
                
                const response = await documentApiService.getEducationDocumentSasUrl(
                    document.containerName,
                    document.documentId
                );
                
                if (response.success && response.sasUrl) {
                    console.log('✅ SAS URL loaded successfully:', response.sasUrl);
                    setSasUrl(response.sasUrl);
                } else {
                    console.error('❌ Error loading SAS URL:', response.error);
                    setError(response.error || 'Error al cargar la URL del documento');
                }
                
            } catch (error) {
                console.error('❌ Unexpected error loading SAS URL:', error);
                setError('Error inesperado al cargar el documento');
            } finally {
                setLoading(false);
            }
        };

        loadSasUrl();
    }, [isOpen, document]);

    const handleClose = () => {
        setSasUrl(null);
        setError(null);
        setPdfLoading(true);
        onClose();
    };

    const handleDownload = () => {
        if (sasUrl && document) {
            const link = window.document.createElement('a');
            link.href = sasUrl;
            link.download = document.fileName;
            link.click();
        }
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                        <FileText className="text-blue-600 flex-shrink-0" size={20} />
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                                {document.fileName}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500">Documento de Educación</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {sasUrl && (
                            <button
                                onClick={handleDownload}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Descargar documento"
                            >
                                <Download size={18} />
                            </button>
                        )}
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
                                <Loader2 className="mx-auto mb-4 text-blue-500 animate-spin" size={36} />
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Cargando documento...</h3>
                                <p className="text-sm text-gray-600">Obteniendo acceso al archivo</p>
                            </div>
                        </div>
                    ) : error || !sasUrl ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Error</h3>
                                <p className="text-sm text-gray-600 mb-4">{error || 'No se pudo cargar el documento.'}</p>
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
                            {/* PDF Viewer - Left Column */}
                            <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-200 flex flex-col overflow-hidden">
                                <div className="p-2 md:p-3 bg-blue-50 border-b border-blue-200 flex-shrink-0">
                                    <h3 className="text-xs md:text-sm font-semibold text-blue-700 flex items-center">
                                        <FileText className="mr-2" size={14} />
                                        Vista Previa del PDF
                                    </h3>
                                </div>
                                
                                <div className="flex-1 relative bg-white overflow-hidden">
                                    {/* Loading indicator */}
                                    {pdfLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-xs md:text-sm text-gray-600">Cargando PDF...</p>
                                            </div>
                                        </div>
                                    )}
                                    <iframe
                                        src={sasUrl}
                                        className="w-full h-full border-0"
                                        title={`Vista previa de ${document.fileName}`}
                                        allow="fullscreen"
                                        onLoad={() => setPdfLoading(false)}
                                        onError={() => setPdfLoading(false)}
                                    />
                                </div>
                            </div>

                            {/* Document Content - Right Column */}
                            <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden">
                                <div className="p-2 md:p-3 bg-green-50 border-b border-green-200 flex-shrink-0">
                                    <h3 className="text-xs md:text-sm font-semibold text-green-700">
                                        🧠 Contenido Procesado por IA
                                    </h3>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    {document.htmlContent ? (
                                        <div className="h-full">
                                            <div className="p-2 bg-green-100 border-b border-green-200 sticky top-0 z-10">
                                                <span className="text-xs text-green-700 font-medium">
                                                    📄 Contenido HTML ({document.htmlContent.length.toLocaleString()} caracteres)
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
                                                    __html: document.htmlContent 
                                                }}
                                            />
                                        </div>
                                    ) : document.textContent ? (
                                        <div className="h-full">
                                            <div className="p-2 bg-blue-100 border-b border-blue-200 sticky top-0 z-10">
                                                <span className="text-xs text-blue-700 font-medium">
                                                    📝 Contenido de Texto ({document.textContent.length.toLocaleString()} caracteres)
                                                </span>
                                            </div>
                                            <div className="p-2 md:p-3 bg-white">
                                                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-800 font-mono">
                                                    {document.textContent}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 text-center p-4 md:p-6">
                                            <div>
                                                <AlertTriangle className="mx-auto mb-3 text-gray-400" size={24} />
                                                <p className="text-xs md:text-sm mb-1">No hay contenido procesado disponible</p>
                                                <p className="text-xs">El documento no ha sido procesado por IA</p>
                                                <div className="mt-3 text-xs text-gray-400">
                                                    <p><strong>Estado:</strong></p>
                                                    <ul className="text-left mt-1 space-y-1">
                                                        <li>• Contenido HTML: {document.htmlContent ? '✅' : '❌'}</li>
                                                        <li>• Contenido de texto: {document.textContent ? '✅' : '❌'}</li>
                                                        <li>• Procesamiento exitoso: {document.success ? '✅' : '❌'}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Document Information Section */}
                                    <div className="p-2 md:p-3 bg-gray-50 border-t border-gray-200">
                                        <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">📄 Información del documento</h4>
                                        <div className="grid grid-cols-1 gap-1 md:gap-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Archivo:</span>
                                                <span className="text-gray-800 text-right text-xs truncate ml-2">{document.fileName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Tipo:</span>
                                                <span className="text-gray-800">{document.documentType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Ruta:</span>
                                                <span className="text-gray-800 text-right truncate ml-2">{document.filePath}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Procesado:</span>
                                                <span className="text-gray-800">{new Date(document.processedAt).toLocaleDateString('es-ES')}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-600">Estado:</span>
                                                <span className={`px-1 md:px-2 py-1 rounded text-xs font-medium ${
                                                    document.success 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {document.success ? 'Procesado ✅' : 'Error ❌'}
                                                </span>
                                            </div>
                                            {document.errorMessage && (
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Error:</span>
                                                    <span className="text-red-600 text-right text-xs truncate ml-2">{document.errorMessage}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Processing Status */}
                                        <div className="mt-2 md:mt-3 p-2 bg-blue-100 rounded border border-blue-200">
                                            <p className="text-xs text-blue-700">
                                                <strong>Estado del procesamiento:</strong> {document.success ? 
                                                    "✅ Documento procesado exitosamente" :
                                                    "❌ Error en el procesamiento"
                                                }
                                            </p>
                                            {document.htmlContent && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    💡 Contenido HTML disponible para visualización mejorada
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with document info */}
                <div className="p-2 md:p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs text-gray-600 space-y-2 md:space-y-0">
                        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                            <span className="truncate"><strong>Archivo:</strong> {document.fileName}</span>
                            <span><strong>Tipo:</strong> {document.documentType}</span>
                            <span className="truncate"><strong>Container:</strong> {document.containerName}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                            <span><strong>ID:</strong> {document.documentId}</span>
                            <span><strong>Procesado:</strong> {new Date(document.processedAt).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationDocumentViewerModal;
