import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, AlertTriangle, FileText } from 'lucide-react';
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
    console.log('🎯 ArchivoDetalles - htmlReport preview:', richDocumentData?.htmlReport?.substring(0, 200) + '...');
    console.log('🎯 ArchivoDetalles - tablesContent type:', typeof richDocumentData?.tablesContent);
    console.log('🎯 ArchivoDetalles - tablesContent isArray:', Array.isArray(richDocumentData?.tablesContent));
    console.log('🎯 ArchivoDetalles - tablesContent value:', richDocumentData?.tablesContent);

    if (!archivo || !twinId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Error: Datos no disponibles</h2>
                    <p className="text-gray-600 mb-4">No se pudieron cargar los detalles del documento.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

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

    const downloadHtml = () => {
        if (!richDocumentData?.htmlReport) {
            alert('No hay contenido HTML disponible para descargar');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análisis de ${archivo.filename}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .content { max-width: 800px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Análisis de Documento: ${archivo.filename}</h1>
        <p>Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
    </div>
    <div class="content">
        ${richDocumentData.htmlReport}
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analisis_${archivo.filename.replace(/\.[^/.]+$/, '')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <div className="bg-blue-50 px-4 py-2 border border-blue-200 rounded-t-lg">
                                    <span className="text-sm text-blue-700 font-medium">
                                        📄 HTML Renderizado ({richDocumentData.htmlReport.length.toLocaleString()} caracteres)
                                    </span>
                                </div>
                                <div 
                                    className="prose prose-lg max-w-none border border-blue-200 border-t-0 rounded-b-lg p-6 bg-white 
                                               overflow-y-auto"
                                    style={{
                                        height: '750px',
                                        lineHeight: '1.7',
                                        fontSize: '15px',
                                        fontFamily: 'Georgia, "Times New Roman", serif'
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: richDocumentData.htmlReport 
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                                <p className="text-lg mb-2">No hay contenido HTML disponible</p>
                                <p className="text-sm">El documento no ha sido procesado por IA</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Information - Below Both Columns */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        📄 Información del documento
                    </h2>
                        
                        {/* Basic Document Info - Compact Section */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📋 Información básica del documento
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        </div>

                        {/* AI Processed Content - LA FUNCIONALIDAD PRINCIPAL QUE EL USUARIO NECESITA */}
                        {richDocumentData?.htmlReport ? (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xl font-bold text-gray-900">
                                        🧠 Contenido Procesado por IA
                                    </label>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {richDocumentData.htmlReport.length.toLocaleString()} caracteres
                                    </span>
                                </div>
                                
                                {/* MAIN HTML DISPLAY - MAXIMIZED */}
                                <div className="w-full bg-white border-2 border-blue-200 rounded-xl shadow-lg">
                                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-200 rounded-t-xl">
                                        <h3 className="text-lg font-semibold text-blue-900">
                                            📄 Documento HTML Renderizado
                                        </h3>
                                    </div>
                                    <div 
                                        className="prose prose-lg max-w-none p-8 
                                                   min-h-[900px] max-h-[1400px] overflow-y-auto
                                                   bg-white"
                                        style={{
                                            lineHeight: '1.7',
                                            fontSize: '16px',
                                            fontFamily: 'Georgia, "Times New Roman", serif'
                                        }}
                                        dangerouslySetInnerHTML={{ 
                                            __html: richDocumentData.htmlReport 
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h3 className="text-yellow-900 font-medium mb-2">
                                    ⚠️ No se encontró contenido procesado por IA
                                </h3>
                                <div className="text-sm text-yellow-700 space-y-1">
                                    <p><strong>Estado de los datos:</strong></p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Datos ricos disponibles: {richDocumentData ? '✅ Sí' : '❌ No'}</li>
                                        <li>HTML Report disponible: {richDocumentData?.htmlReport ? '✅ Sí' : '❌ No'}</li>
                                        <li>Datos estructurados disponibles: {richDocumentData?.structuredData ? '✅ Sí' : '❌ No'}</li>
                                    </ul>
                                    {richDocumentData?.htmlReport && (
                                        <div className="mt-3 p-3 bg-white border rounded">
                                            <p className="font-medium">Preview del HTML Report:</p>
                                            <pre className="text-xs mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
                                                {richDocumentData.htmlReport.substring(0, 500)}...
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Structured Data if available */}
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

                        {/* Full Text Content if available */}
                        {richDocumentData?.fullTextContent && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📝 Contenido de Texto Completo
                                </label>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <details className="cursor-pointer">
                                        <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                            Ver texto completo ({richDocumentData.fullTextContent.length} caracteres)
                                        </summary>
                                        <div className="mt-3">
                                            <div className="bg-white border rounded p-3 max-h-60 overflow-y-auto">
                                                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {richDocumentData.fullTextContent}
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
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <details className="cursor-pointer">
                                        <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                            Ver tablas extraídas
                                        </summary>
                                        <div className="mt-3 space-y-4">
                                            {richDocumentData.tablesContent.map((table, index) => (
                                                <div key={index} className="bg-white border rounded p-3">
                                                    <h4 className="text-sm font-medium text-gray-800 mb-2">
                                                        Tabla {index + 1}
                                                    </h4>
                                                    <div className="overflow-x-auto">
                                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                                            {JSON.stringify(table, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}
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
        </div>
    );
};

export default ArchivoDetalles;
