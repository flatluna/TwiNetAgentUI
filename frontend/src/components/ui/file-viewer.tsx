import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Table, FileImage, FileVideo, Music, Archive, ExternalLink } from "lucide-react";
import { Button } from "./button";

interface FileViewerProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
}

interface CSVData {
    headers: string[];
    rows: string[][];
}

const FileViewer: React.FC<FileViewerProps> = ({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
    fileSize
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Removed unused csvData and setCsvData
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Determinar el tipo de archivo basado en la extensión
    const getFileCategory = (fileName: string, mimeType: string) => {
        const extension = fileName.toLowerCase().split('.').pop() || '';
        const type = mimeType.toLowerCase();

        if (['pdf'].includes(extension) || type.includes('pdf')) {
            return 'pdf';
        }
        if (['csv'].includes(extension) || type.includes('csv')) {
            return 'csv';
        }
        if (['json'].includes(extension) || type.includes('json')) {
            return 'json';
        }
        if (['xml'].includes(extension) || type.includes('xml')) {
            return 'xml';
        }
        if (['txt', 'text'].includes(extension) || type.includes('text')) {
            return 'text';
        }
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension) || type.includes('image')) {
            return 'image';
        }
        if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension) || type.includes('video')) {
            return 'video';
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(extension) || type.includes('audio')) {
            return 'audio';
        }
        return 'unknown';
    };

    const fileCategory = getFileCategory(fileName, fileType);

    // Redirigir a página dedicada para CSV
    const handleCSVRedirect = () => {
        onClose(); // Cerrar el modal primero
        navigate(`/twin-biografia/csv-viewer/${encodeURIComponent(fileName)}`);
    };

    // Funciones de control
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    // Obtener icono por categoría
    const getFileIcon = (category: string) => {
        switch (category) {
            case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
            case 'csv': return <Table className="w-8 h-8 text-green-500" />;
            case 'json':
            case 'xml': 
            case 'text': return <FileText className="w-8 h-8 text-blue-500" />;
            case 'image': return <FileImage className="w-8 h-8 text-purple-500" />;
            case 'video': return <FileVideo className="w-8 h-8 text-orange-500" />;
            case 'audio': return <Music className="w-8 h-8 text-pink-500" />;
            default: return <Archive className="w-8 h-8 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                        <div className="flex items-center space-x-3">
                            {getFileIcon(fileCategory)}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                                    {fileName}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {fileSize && formatFileSize(fileSize)} • {fileCategory.toUpperCase()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {/* Controles para imágenes */}
                            {fileCategory === 'image' && !imageError && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600 px-2">{zoom}%</span>
                                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleRotate}>
                                        <RotateCw className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                            
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4">
                        {loading && (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2">Cargando archivo...</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="text-red-500 mb-2">❌ Error al cargar el archivo</div>
                                <div className="text-gray-600 text-sm">{error}</div>
                                <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={() => fileCategory === 'csv' && handleCSVRedirect()}
                                >
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {/* PDF Viewer */}
                                {fileCategory === 'pdf' && (
                                    <div className="w-full h-full min-h-[600px]">
                                        <iframe
                                            src={fileUrl}
                                            className="w-full h-full border-0 rounded"
                                            title={fileName}
                                        />
                                    </div>
                                )}

                                {/* CSV Viewer - Redirect to dedicated page */}
                                {fileCategory === 'csv' && (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="p-4 bg-green-100 rounded-full mb-4">
                                            <Table className="w-12 h-12 text-green-600" />
                                        </div>
                                        <div className="text-gray-800 text-lg font-medium mb-2">Archivo CSV detectado</div>
                                        <div className="text-gray-600 mb-6 max-w-md">
                                            Este archivo se visualiza mejor en nuestra vista de tabla dedicada con funciones de búsqueda, ordenamiento y paginación.
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button onClick={handleCSVRedirect} className="bg-green-600 hover:bg-green-700">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Abrir en Vista de Tabla
                                            </Button>
                                            <Button variant="outline" onClick={handleDownload}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Descargar CSV
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Image Viewer */}
                                {fileCategory === 'image' && (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        {!imageError ? (
                                            <img
                                                src={fileUrl}
                                                alt={fileName}
                                                className="max-w-full max-h-full object-contain rounded transition-transform"
                                                style={{
                                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
                                                }}
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-gray-500 mb-2">❌ Error al cargar la imagen</div>
                                                <Button variant="outline" onClick={handleDownload}>
                                                    Descargar archivo
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Video Viewer */}
                                {fileCategory === 'video' && (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        <video
                                            src={fileUrl}
                                            controls
                                            className="max-w-full max-h-full rounded"
                                        >
                                            Tu navegador no soporta video HTML5.
                                        </video>
                                    </div>
                                )}

                                {/* Audio Viewer */}
                                {fileCategory === 'audio' && (
                                    <div className="flex items-center justify-center min-h-[200px]">
                                        <audio
                                            src={fileUrl}
                                            controls
                                            className="w-full max-w-md"
                                        >
                                            Tu navegador no soporta audio HTML5.
                                        </audio>
                                    </div>
                                )}

                                {/* Text/JSON/XML Viewer */}
                                {['text', 'json', 'xml'].includes(fileCategory) && (
                                    <div className="min-h-[400px]">
                                        <iframe
                                            src={fileUrl}
                                            className="w-full h-full min-h-[400px] border rounded"
                                            title={fileName}
                                        />
                                    </div>
                                )}

                                {/* Unsupported file type */}
                                {fileCategory === 'unknown' && (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <Archive className="w-16 h-16 text-gray-400 mb-4" />
                                        <div className="text-gray-600 mb-2">Tipo de archivo no soportado para vista previa</div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            Puedes descargar el archivo para abrirlo con la aplicación apropiada
                                        </div>
                                        <Button onClick={handleDownload}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Descargar {fileName}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FileViewer;
