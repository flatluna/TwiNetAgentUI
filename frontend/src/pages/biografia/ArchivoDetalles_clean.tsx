import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Brain, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FileViewer from '../../components/ui/file-viewer';
import { deleteDocument } from '../../services/documentApiService';

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

interface DocumentAnalysisResult {
    success: boolean;
    data?: {
        content?: string;
        keyValuePairs?: Array<{ key: string; value: string }>;
        tables?: Array<any>;
    };
    error?: string;
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
    const [cosmosAiAnalysis, setCosmosAiAnalysis] = useState<any>(null);
    const [cosmosAnalysisLoading, setCosmosAnalysisLoading] = useState(false);

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
            await deleteDocument(twinId, archivo.id);
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - File Preview */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            <FileText className="inline mr-2" size={20} />
                            Vista previa del archivo
                        </h2>
                        
                        <div className="border rounded-lg overflow-hidden">
                            <FileViewer 
                                filePath={archivo.path || `/uploads/${archivo.filename}`}
                                fileType={archivo.tipo}
                                fileName={archivo.filename}
                            />
                        </div>
                    </div>

                    {/* Right Column - Document Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            📄 Información del documento
                        </h2>
                        
                        {/* Basic Document Info */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
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

                        {/* AI Processed Content - MAIN FEATURE */}
                        {richDocumentData?.htmlReport ? (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🧠 Contenido Procesado por IA ({richDocumentData.htmlReport.length} caracteres)
                                </label>
                                <div className="border rounded-lg p-4 bg-white shadow-sm max-h-[500px] overflow-y-auto">
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ 
                                            __html: richDocumentData.htmlReport 
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800">
                                    ⚠️ No se encontró contenido procesado por IA para este documento.
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {!richDocumentData && "No hay datos de procesamiento disponibles."}
                                    {richDocumentData && !richDocumentData.htmlReport && "Los datos están disponibles pero sin contenido HTML."}
                                </p>
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
                                        </details>
                                    </div>
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
                                        </details>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tables Content if available */}
                        {richDocumentData?.tablesContent && richDocumentData.tablesContent.length > 0 && (
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
