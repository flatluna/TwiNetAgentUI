import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FileViewer from '../../components/ui/file-viewer';

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

const ArchivoDetalles: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { archivo, twinId, richDocumentData } = location.state as { 
        archivo: DocumentFile; 
        twinId: string;
        richDocumentData?: RichDocumentData;
    };

    const [isDeleting, setIsDeleting] = useState(false);

    // Debug: Log the received data
    console.log('🎯 ArchivoDetalles - archivo:', archivo);
    console.log('🎯 ArchivoDetalles - twinId:', twinId);
    console.log('🎯 ArchivoDetalles - richDocumentData:', richDocumentData);
    console.log('🎯 ArchivoDetalles - htmlReport present:', !!richDocumentData?.htmlReport);
    console.log('🎯 ArchivoDetalles - htmlReport length:', richDocumentData?.htmlReport?.length || 0);

    if (!archivo || !twinId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">No se pudieron cargar los detalles del documento.</p>
                    <button
                        onClick={() => navigate('/twin-biografia')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a Biografía
                    </button>
                </div>
            </div>
        );
    }

    const downloadHtml = () => {
        if (!richDocumentData?.htmlReport) return;
        
        const blob = new Blob([richDocumentData.htmlReport], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${archivo.filename}_processed.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/delete-document/${twinId}/${archivo.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            navigate(-1);
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            alert('Error al eliminar el documento');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft size={20} />
                            <span>Volver</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{archivo.filename}</h1>
                            <p className="text-sm text-gray-500">Detalles del documento</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {richDocumentData?.htmlReport && (
                            <button
                                onClick={downloadHtml}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Download size={16} />
                                <span>Descargar HTML</span>
                            </button>
                        )}
                        
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Content - 2 Column Layout: PDF Left, HTML Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* LEFT COLUMN - PDF Viewer */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="mr-2" size={20} />
                            Vista Previa del Documento
                        </h2>
                        
                        <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '800px' }}>
                            <FileViewer 
                                isOpen={true}
                                onClose={() => {}}
                                fileUrl={archivo.path || `/uploads/${archivo.filename}`}
                                fileType={archivo.tipo}
                                fileName={archivo.filename}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - HTML Content */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            🧠 Contenido Procesado por IA
                        </h2>
                        
                        {richDocumentData?.htmlReport ? (
                            <div className="w-full">
                                <div className="bg-blue-50 px-4 py-2 border border-blue-200 rounded-t-lg mb-0">
                                    <span className="text-sm text-blue-700 font-medium">
                                        📄 HTML Renderizado ({richDocumentData.htmlReport.length.toLocaleString()} caracteres)
                                    </span>
                                </div>
                                <div 
                                    className="prose prose-sm max-w-none border border-blue-200 border-t-0 rounded-b-lg p-4 bg-white 
                                               overflow-y-auto"
                                    style={{
                                        height: '750px',
                                        lineHeight: '1.6',
                                        fontSize: '14px',
                                        fontFamily: 'system-ui, -apple-system, sans-serif'
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: richDocumentData.htmlReport 
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg" style={{ height: '750px' }}>
                                <div className="flex flex-col items-center justify-center h-full">
                                    <AlertTriangle className="mb-4 text-gray-400" size={48} />
                                    <p className="text-lg mb-2">No hay contenido HTML disponible</p>
                                    <p className="text-sm">El documento no ha sido procesado por IA</p>
                                    <div className="mt-4 text-xs text-gray-400">
                                        <p><strong>Estado de los datos:</strong></p>
                                        <ul className="list-disc list-inside ml-2 mt-2">
                                            <li>Datos ricos disponibles: {richDocumentData ? '✅ Sí' : '❌ No'}</li>
                                            <li>HTML Report disponible: {richDocumentData?.htmlReport ? '✅ Sí' : '❌ No'}</li>
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
                        📄 Información del documento
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
                                Fecha de subida
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                {archivo.fechaSubida}
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
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">🧠 Estado del Análisis de IA</h3>
                        <p className="text-sm text-blue-700">
                            {richDocumentData?.htmlReport ? 
                                "✅ Este documento ha sido procesado por IA y contiene información extraída." :
                                "ℹ️ Este documento no ha sido procesado por IA o el procesamiento no está disponible."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivoDetalles;
