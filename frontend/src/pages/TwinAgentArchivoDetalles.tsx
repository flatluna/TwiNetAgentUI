import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
    sasUrl?: string;
    AiExecutiveSummaryHtml?: string;
    metadata?: {
        vendor?: string;
        sasUrl?: string;
        [key: string]: any;
    };
}

interface RichDocumentData {
    htmlReport?: string;
    structuredData?: any;
    fullTextContent?: string;
    tablesContent?: any[];
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
    
    // Por defecto, si no coincide con ninguna categoría conocida
    return 'Estructurado';
};

const TwinAgentArchivoDetalles: React.FC = () => {
    const navigate = useNavigate();
    const { filename } = useParams<{ filename: string }>();
    const location = useLocation();
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    
    const [archivo, setArchivo] = useState<DocumentFile | null>(null);
    const [richDocumentData, setRichDocumentData] = useState<RichDocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const twinId = msalUser?.localAccountId;
    const decodedFilename = filename ? decodeURIComponent(filename) : '';

    useEffect(() => {
        const loadDocumentData = async () => {
            if (!twinId || !decodedFilename) {
                setError('Twin ID o nombre de archivo no disponible');
                setLoading(false);
                return;
            }

            try {
                console.log('🔍 TwinAgent - Cargando datos del documento:', decodedFilename);
                console.log('🆔 TwinAgent - Twin ID:', twinId);
                
                // Verificar si tenemos datos del estado de navegación
                if (location.state?.archivo) {
                    console.log('📄 TwinAgent - Usando datos del archivo desde navegación:', location.state.archivo);
                    console.log('🔗 TwinAgent - SAS URL desde navegación:', location.state.archivo.sasUrl);
                    console.log('🔗 TwinAgent - Metadata SAS URL desde navegación:', location.state.archivo.metadata?.sasUrl);
                    console.log('🔗 TwinAgent - Path desde navegación:', location.state.archivo.path);
                    console.log('🧠 TwinAgent - AiExecutiveSummaryHtml desde navegación:', location.state.archivo.AiExecutiveSummaryHtml ? 'Disponible' : 'No disponible');
                    
                    // Usar datos del estado de navegación (más confiables)
                    setArchivo(location.state.archivo);
                    
                    if (location.state?.richDocumentData) {
                        setRichDocumentData(location.state.richDocumentData);
                    }
                    
                    setLoading(false);
                    return;
                }
                
                console.log('⚠️ TwinAgent - No hay datos desde navegación, consultando backend...');
                
                // Llamar al endpoint para obtener los metadatos ricos del documento desde Cosmos DB
                const response = await documentApiService.getDocumentMetadata(twinId, decodedFilename);
                
                if (response.success && response.data) {
                    console.log('✅ TwinAgent - Metadatos del documento cargados:', response.data);
                    
                    // DEBUG: Revisar todas las URLs disponibles
                    console.log('🔍 DEBUG - URLs disponibles en response.data:');
                    console.log('  - response.data.public_url:', response.data.public_url);
                    console.log('  - response.data.metadata?.documentUrl:', response.data.metadata?.documentUrl);
                    console.log('  - response.data.metadata?.sasUrl:', response.data.metadata?.sasUrl);
                    console.log('  - response.data.metadata?.AiExecutiveSummaryHtml:', response.data.metadata?.AiExecutiveSummaryHtml ? 'Disponible' : 'No disponible');
                    
                    // Mapear los datos al formato esperado
                    const documentData: DocumentFile = {
                        id: response.data.id || decodedFilename,
                        filename: decodedFilename,
                        tipo: response.data.metadata?.content_type || 'application/pdf',
                        tamano: response.data.size_bytes?.toString() || 'N/A',
                        categoria: response.data.metadata?.sub_category || 'documento',
                        fechaSubida: response.data.last_modified || new Date().toISOString(),
                        path: response.data.metadata?.documentUrl || response.data.public_url,
                        sasUrl: response.data.metadata?.sasUrl || response.data.metadata?.documentUrl || response.data.public_url, // AGREGAR SASURL ESPECÍFICO
                        AiExecutiveSummaryHtml: response.data.metadata?.AiExecutiveSummaryHtml, // AGREGAR HTML SUMMARY
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
                    
                    // DEBUG: Verificar el objeto final que se usará
                    console.log('✅ TwinAgent - Documento mapeado correctamente:');
                    console.log('  - documentData.sasUrl:', documentData.sasUrl);
                    console.log('  - documentData.path:', documentData.path);
                    console.log('  - documentData.metadata?.sasUrl:', documentData.metadata?.sasUrl);
                    console.log('  - URL final para iframe:', documentData.sasUrl || documentData.metadata?.sasUrl || documentData.path || `/uploads/${documentData.filename}`);
                    
                    console.log('📊 TwinAgent - HTML Report disponible:', !!richData.htmlReport);
                    console.log('📊 TwinAgent - Datos estructurados disponibles:', !!richData.structuredData);
                    
                } else {
                    console.error('❌ TwinAgent - Error al cargar metadatos:', response.error);
                    setError(response.error || 'Error al cargar los metadatos del documento');
                }
                
            } catch (error) {
                console.error('❌ TwinAgent - Error inesperado:', error);
                setError('Error inesperado al cargar el documento');
            } finally {
                setLoading(false);
            }
        };

        loadDocumentData();
    }, [twinId, decodedFilename]);

    // Determinar el tipo de documento basado en la categoría
    const documentType = archivo ? getDocumentType(archivo.categoria) : 'Desconocido';

    const downloadHtml = () => {
        if ((!richDocumentData?.htmlReport && !archivo?.AiExecutiveSummaryHtml) || !archivo) return;
        
        const htmlContent = archivo.AiExecutiveSummaryHtml || richDocumentData?.htmlReport || '';
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${archivo.filename}_processed.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 text-blue-500 animate-spin" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cargando documento...</h2>
                    <p className="text-gray-600">Obteniendo datos del archivo desde TwinAgent</p>
                </div>
            </div>
        );
    }

    if (error || !archivo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error || 'No se pudieron cargar los detalles del documento.'}</p>
                    <button
                        onClick={() => navigate('/twin-agent')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a TwinAgent
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/twin-agent')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft size={20} />
                            <span>Volver a TwinAgent</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{archivo.filename}</h1>
                            <p className="text-sm text-gray-500">Documento del TwinAgent</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {(richDocumentData?.htmlReport || archivo.AiExecutiveSummaryHtml) && (
                            <button
                                onClick={downloadHtml}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Download size={16} />
                                <span>Descargar HTML</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content - 2 Column Layout: PDF Left, HTML Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* LEFT COLUMN - PDF Viewer */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="mr-2" size={20} />
                                Vista Previa del Documento
                            </h2>
                            
                            {archivo.filename.toLowerCase().endsWith('.pdf') && (archivo.sasUrl || archivo.metadata?.sasUrl) && (
                                <button
                                    onClick={() => {
                                        const url = archivo.sasUrl || archivo.metadata?.sasUrl;
                                        if (url) {
                                            console.log('🔗 Abriendo PDF en nueva ventana desde header:', url);
                                            window.open(url, '_blank');
                                        }
                                    }}
                                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                    title="Abrir PDF en nueva ventana"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="currentColor"/>
                                        <path d="M19 19H5V5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" fill="currentColor"/>
                                    </svg>
                                    <span>Nueva ventana</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '800px' }}>
                            {archivo.filename.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-full relative">
                                    {/* Loading indicator */}
                                    {pdfLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Cargando PDF...</p>
                                                <p className="text-xs text-gray-400 mt-2 break-all px-4">
                                                    SAS URL: {archivo.sasUrl || 'No disponible'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 break-all px-4">
                                                    Metadata SAS: {archivo.metadata?.sasUrl || 'No disponible'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 break-all px-4">
                                                    Path: {archivo.path || 'No disponible'}
                                                </p>
                                                <p className="text-xs text-blue-600 mt-2 break-all px-4 font-medium">
                                                    URL Final: {archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path || `/uploads/${archivo.filename}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <iframe
                                        src={archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path || `/uploads/${archivo.filename}`}
                                        className="w-full h-full border-0"
                                        title={`Vista previa de ${archivo.filename}`}
                                        allow="fullscreen"
                                        style={{ 
                                            minHeight: '800px',
                                            border: 'none',
                                            outline: 'none'
                                        }}
                                        onLoad={() => {
                                            console.log('✅ PDF Iframe cargado exitosamente');
                                            console.log('🔗 URL del iframe:', archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path);
                                            setPdfLoading(false);
                                            setPdfError(null);
                                        }}
                                        onError={(e) => {
                                            console.error('❌ Error al cargar PDF en iframe:', e);
                                            console.error('🔗 URL que falló:', archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path);
                                            setPdfLoading(false);
                                            setPdfError('Error al cargar el PDF. La URL puede haber expirado o ser inválida.');
                                        }}
                                    />
                                    
                                    {/* Mostrar error específico del PDF */}
                                    {pdfError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                                            <div className="text-center p-8 max-w-md">
                                                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el PDF</h3>
                                                <p className="text-gray-600 mb-4">{pdfError}</p>
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setPdfError(null);
                                                            setPdfLoading(true);
                                                            // Recargar el iframe forzando un refresh
                                                            const iframe = document.querySelector('iframe');
                                                            if (iframe) {
                                                                iframe.src = iframe.src;
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Intentar de nuevo
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const url = archivo.sasUrl || archivo.metadata?.sasUrl;
                                                            if (url) {
                                                                console.log('🔗 Abriendo PDF en nueva ventana:', url);
                                                                window.open(url, '_blank');
                                                            } else {
                                                                console.error('❌ No hay URL disponible para abrir en nueva ventana');
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Abrir en nueva ventana
                                                    </button>
                                                </div>
                                                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                                                    <p className="font-semibold mb-2">URLs disponibles:</p>
                                                    <p><strong>SAS URL:</strong> {archivo.sasUrl || 'No disponible'}</p>
                                                    <p><strong>Metadata SAS:</strong> {archivo.metadata?.sasUrl || 'No disponible'}</p>
                                                    <p><strong>Path:</strong> {archivo.path || 'No disponible'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (archivo.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path || `/uploads/${archivo.filename}`}
                                        alt={archivo.filename}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                                        <p className="text-lg font-medium text-gray-700">{archivo.filename}</p>
                                        <p className="text-sm text-gray-500">Tipo: {archivo.tipo}</p>
                                        <p className="text-xs text-gray-400 mt-2">URL: {archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path || 'No disponible'}</p>
                                        <button
                                            onClick={() => {
                                                const url = archivo.sasUrl || archivo.metadata?.sasUrl || archivo.path || `/uploads/${archivo.filename}`;
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = archivo.filename;
                                                link.click();
                                            }}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Descargar archivo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - HTML Content */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            🧠 Contenido Procesado por IA (TwinAgent)
                        </h2>
                        
                        {richDocumentData?.htmlReport || archivo.AiExecutiveSummaryHtml ? (
                            <div className="w-full">
                                <div className="bg-green-50 px-4 py-2 border border-green-200 rounded-t-lg mb-0">
                                    <span className="text-sm text-green-700 font-medium">
                                        📄 {archivo.AiExecutiveSummaryHtml ? 
                                            `AI Executive Summary (${archivo.AiExecutiveSummaryHtml.length.toLocaleString()} caracteres)` :
                                            `HTML Renderizado (${richDocumentData?.htmlReport?.length.toLocaleString() || 0} caracteres)`
                                        }
                                    </span>
                                </div>
                                <div 
                                    className="prose prose-sm max-w-none border border-green-200 border-t-0 rounded-b-lg p-4 bg-white 
                                               overflow-y-auto"
                                    style={{
                                        height: '750px',
                                        lineHeight: '1.6',
                                        fontSize: '14px',
                                        fontFamily: 'system-ui, -apple-system, sans-serif'
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: archivo.AiExecutiveSummaryHtml || richDocumentData?.htmlReport || ''
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg" style={{ height: '750px' }}>
                                <div className="flex flex-col items-center justify-center h-full">
                                    <AlertTriangle className="mb-4 text-gray-400" size={48} />
                                    <p className="text-lg mb-2">No hay contenido HTML disponible</p>
                                    <p className="text-sm">El documento no ha sido procesado por IA en TwinAgent</p>
                                    <div className="mt-4 text-xs text-gray-400">
                                        <p><strong>Estado de los datos (TwinAgent):</strong></p>
                                        <ul className="list-disc list-inside ml-2 mt-2">
                                            <li>Datos ricos disponibles: {richDocumentData ? '✅ Sí' : '❌ No'}</li>
                                            <li>HTML Report disponible: {richDocumentData?.htmlReport ? '✅ Sí' : '❌ No'}</li>
                                            <li>AI Executive Summary HTML disponible: {archivo.AiExecutiveSummaryHtml ? '✅ Sí' : '❌ No'}</li>
                                            <li>Datos estructurados disponibles: {richDocumentData?.structuredData ? '✅ Sí' : '❌ No'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Information - Below Both Columns */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        📄 Información del documento (TwinAgent)
                    </h2>
                    
                    {/* Basic Document Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del archivo
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {archivo.filename}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de archivo  
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {archivo.tipo}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {archivo.categoria}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Documento
                            </label>
                            <div className={`p-3 rounded-lg text-gray-900 ${
                                documentType === 'Semi-estructurado' 
                                    ? 'bg-orange-50 border border-orange-200' 
                                    : 'bg-blue-50 border border-blue-200'
                            }`}>
                                <span className={`font-medium ${
                                    documentType === 'Semi-estructurado' 
                                        ? 'text-orange-800' 
                                        : 'text-blue-800'
                                }`}>
                                    📄 {documentType}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de subida
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {new Date(archivo.fechaSubida).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tamaño
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {archivo.tamano}
                            </div>
                        </div>
                    </div>

                    {/* Additional sections if data exists */}
                    {richDocumentData?.structuredData && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📊 Datos Estructurados Extraídos
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <details className="cursor-pointer">
                                    <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                        Ver datos estructurados (JSON)
                                    </summary>
                                    <div className="mt-3">
                                        <div className="bg-white border rounded p-3 max-h-60 overflow-y-auto">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                                {JSON.stringify(richDocumentData.structuredData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* Tables Content if available */}
                    {richDocumentData?.tablesContent && Array.isArray(richDocumentData.tablesContent) && richDocumentData.tablesContent.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📋 Tablas Extraídas ({richDocumentData.tablesContent.length})
                            </label>
                            <div className="space-y-4">
                                {richDocumentData.tablesContent.map((table: any, index: number) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-2">Tabla {index + 1}</h4>
                                        <div className="bg-white border rounded p-3 max-h-60 overflow-auto">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                                {JSON.stringify(table, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full Text Content if available */}
                    {richDocumentData?.fullTextContent && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📝 Texto Completo Extraído ({richDocumentData.fullTextContent.length} caracteres)
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <details className="cursor-pointer">
                                    <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                        Ver texto completo
                                    </summary>
                                    <div className="mt-3">
                                        <div className="bg-white border rounded p-3 max-h-60 overflow-y-auto">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                                {richDocumentData.fullTextContent}
                                            </pre>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* AI Analysis Status */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="text-sm font-medium text-green-900 mb-2">🧠 Estado del Análisis de IA (TwinAgent)</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-green-700">
                                <strong>Tipo de Documento:</strong> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    documentType === 'Semi-estructurado' 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {documentType}
                                </span>
                            </p>
                            <p className="text-sm text-green-700">
                                <strong>Estado de Procesamiento:</strong> {archivo.AiExecutiveSummaryHtml || richDocumentData?.htmlReport ? 
                                    "✅ Este documento ha sido procesado por IA en TwinAgent y contiene información extraída." :
                                    "ℹ️ Este documento no ha sido procesado por IA en TwinAgent o el procesamiento no está disponible."
                                }
                            </p>
                            <p className="text-xs text-green-700 bg-green-100 p-2 rounded mt-2">
                                📋 <strong>Nota:</strong> Este documento fue accedido desde TwinAgent y sus metadatos se obtuvieron desde Cosmos DB.
                                Los datos mostrados están específicamente procesados para el contexto del chat TwinAgent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinAgentArchivoDetalles;
