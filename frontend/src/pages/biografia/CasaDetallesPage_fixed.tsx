import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, FileText, Eye, RefreshCw, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { twinApiService } from '../../services/twinApiService';

interface Foto {
    id: number;
    nombre: string;
    url: string;
    zona: string;
}

interface DocumentoLocal {
    id: number;
    nombre: string;
    tipo: TipoDocumento;
    archivo: File;
}

interface DocumentoBackend {
    id: string;
    fileName: string;
    originalDocumentType: string;
    documentUrl: string;
    pageCount: number;
    tableCount: number;
    insightCount: number;
    totalPages: number;
    processedAt: string;
    createdAt: string;
    executiveSummary?: string;
    description?: string;
    htmlOutput?: string;
    keyInsights?: string[];
    structuredData?: any;
}

type TipoDocumento = 'titulo' | 'escritura' | 'contrato' | 'seguro' | 'factura' | 'otros';

const TIPOS_DOCUMENTOS = [
    { value: 'titulo' as TipoDocumento, label: 'Título de Propiedad', descripcion: 'Documento legal que acredita la propiedad' },
    { value: 'escritura' as TipoDocumento, label: 'Escritura Pública', descripcion: 'Documento notarial de compraventa' },
    { value: 'contrato' as TipoDocumento, label: 'Contrato de Arrendamiento', descripcion: 'Contratos de alquiler o renta' },
    { value: 'seguro' as TipoDocumento, label: 'Seguro de Hogar', descripcion: 'Pólizas y documentos de seguros' },
    { value: 'factura' as TipoDocumento, label: 'Facturas y Recibos', descripcion: 'Servicios, reparaciones, mejoras' },
    { value: 'otros' as TipoDocumento, label: 'Otros Documentos', descripcion: 'Documentos varios relacionados con la propiedad' }
];

const ZONAS_CASA = [
    { value: 'salon', label: 'Salón', descripcion: 'Área principal de estar y recepción' },
    { value: 'cocina', label: 'Cocina', descripcion: 'Zona de preparación de alimentos' },
    { value: 'comedor', label: 'Comedor', descripcion: 'Área destinada para comer' },
    { value: 'dormitorio_principal', label: 'Dormitorio Principal', descripcion: 'Habitación principal de la casa' },
    { value: 'dormitorio_secundario', label: 'Dormitorio Secundario', descripcion: 'Habitaciones adicionales' },
    { value: 'bano_principal', label: 'Baño Principal', descripcion: 'Baño completo principal' },
    { value: 'bano_secundario', label: 'Baño Secundario', descripcion: 'Baños adicionales o de cortesía' },
    { value: 'terraza', label: 'Terraza/Balcón', descripcion: 'Espacios exteriores cubiertos' },
    { value: 'jardin', label: 'Jardín', descripcion: 'Áreas verdes y exteriores' },
    { value: 'garaje', label: 'Garaje/Estacionamiento', descripcion: 'Área para vehículos' },
    { value: 'sotano', label: 'Sótano/Bodega', descripcion: 'Espacios de almacenamiento subterráneos' },
    { value: 'atico', label: 'Ático/Desván', descripcion: 'Espacios superiores de almacenamiento' },
    { value: 'lavanderia', label: 'Lavandería', descripcion: 'Área de lavado y limpieza' },
    { value: 'entrada', label: 'Entrada/Recibidor', descripcion: 'Área de acceso principal' },
    { value: 'pasillo', label: 'Pasillo/Distribuidor', descripcion: 'Espacios de circulación' },
    { value: 'exterior', label: 'Exterior General', descripcion: 'Fachada y vistas exteriores' }
];

export default function CasaDetallesPage() {
    const { casaId } = useParams<{ casaId: string }>();
    const [activeTab, setActiveTab] = useState<'fotos' | 'documentos'>('fotos');
    
    // Estados para fotos
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [fotoCarruselModal, setFotoCarruselModal] = useState<number | null>(null);
    const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('salon');
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    
    // Estados para documentos
    const [documentos, setDocumentos] = useState<DocumentoLocal[]>([]);
    const [documentosBackend, setDocumentosBackend] = useState<DocumentoBackend[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<TipoDocumento>('titulo');
    const [documentoModal, setDocumentoModal] = useState<DocumentoBackend | null>(null);

    useEffect(() => {
        if (casaId) {
            cargarDatos();
        }
    }, [casaId]);

    const cargarDatos = () => {
        cargarFotos();
        cargarDocumentosBackend();
    };

    const cargarFotos = () => {
        const fotosGuardadas = localStorage.getItem(`fotos-casa-${casaId}`);
        if (fotosGuardadas) {
            setFotos(JSON.parse(fotosGuardadas));
        }
    };

    const cargarDocumentosBackend = async () => {
        if (!casaId) return;
        
        setIsLoadingDocuments(true);
        try {
            const response = await twinApiService.getGlobalDocumentsByCategory(casaId, 'all');
            if (response && Array.isArray(response)) {
                setDocumentosBackend(response);
            }
        } catch (error) {
            console.error('Error al cargar documentos del backend:', error);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const nuevasFotos: Foto[] = [];
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        const nuevaFoto: Foto = {
                            id: Date.now() + index,
                            nombre: file.name,
                            url: e.target.result as string,
                            zona: zonaSeleccionada
                        };
                        nuevasFotos.push(nuevaFoto);
                        
                        if (nuevasFotos.length === files.length) {
                            const fotosActualizadas = [...fotos, ...nuevasFotos];
                            setFotos(fotosActualizadas);
                            localStorage.setItem(`fotos-casa-${casaId}`, JSON.stringify(fotosActualizadas));
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const nuevosDocumentos: DocumentoLocal[] = Array.from(files).map((file, index) => ({
                id: Date.now() + index,
                nombre: file.name,
                tipo: tipoDocumentoSeleccionado,
                archivo: file
            }));
            
            const documentosActualizados = [...documentos, ...nuevosDocumentos];
            setDocumentos(documentosActualizados);
            localStorage.setItem(`documentos-casa-${casaId}`, JSON.stringify(documentosActualizados));
        }
    };

    const eliminarFoto = (fotoId: number) => {
        const fotosActualizadas = fotos.filter(f => f.id !== fotoId);
        setFotos(fotosActualizadas);
        localStorage.setItem(`fotos-casa-${casaId}`, JSON.stringify(fotosActualizadas));
    };

    const fotosFiltradas = fotos.filter(foto => foto.zona === zonaSeleccionada);

    const abrirModalDocumento = (doc: DocumentoBackend) => {
        setDocumentoModal(doc);
    };

    const cerrarModalDocumento = () => {
        setDocumentoModal(null);
    };

    const navegarCarrusel = (direccion: 'anterior' | 'siguiente') => {
        if (fotoCarruselModal === null) return;
        
        const totalFotos = fotosFiltradas.length;
        if (direccion === 'anterior') {
            setFotoCarruselModal(fotoCarruselModal > 0 ? fotoCarruselModal - 1 : totalFotos - 1);
        } else {
            setFotoCarruselModal(fotoCarruselModal < totalFotos - 1 ? fotoCarruselModal + 1 : 0);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalles de la Casa</h1>
                <p className="text-gray-600">Gestiona las fotos y documentos de tu propiedad</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('fotos')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'fotos'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Camera className="inline w-4 h-4 mr-2" />
                    Fotos ({fotos.length})
                </button>
                <button
                    onClick={() => setActiveTab('documentos')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'documentos'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <FileText className="inline w-4 h-4 mr-2" />
                    Documentos ({documentosBackend.length})
                </button>
            </div>

            {/* Contenido de las tabs */}
            {activeTab === 'fotos' ? (
                <div className="space-y-6">
                    {/* Selector de Zona */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Selecciona la zona de la casa</h3>
                        <select
                            value={zonaSeleccionada}
                            onChange={(e) => setZonaSeleccionada(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {ZONAS_CASA.map((zona) => (
                                <option key={zona.value} value={zona.value}>
                                    {zona.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            {ZONAS_CASA.find(z => z.value === zonaSeleccionada)?.descripcion}
                        </p>
                    </Card>

                    {/* Upload de Fotos */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Subir Fotos</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">Selecciona fotos</p>
                                <p className="text-sm text-gray-500">
                                    JPG, PNG o GIF (máx. 5MB cada una)
                                </p>
                            </label>
                        </div>
                    </Card>

                    {/* Galería de Fotos */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Fotos de {ZONAS_CASA.find(z => z.value === zonaSeleccionada)?.label} ({fotosFiltradas.length})
                        </h3>
                        
                        {fotosFiltradas.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {fotosFiltradas.map((foto, index) => (
                                    <div key={foto.id} className="relative group">
                                        <img
                                            src={foto.url}
                                            alt={foto.nombre}
                                            className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                                            onClick={() => setFotoCarruselModal(index)}
                                        />
                                        <button
                                            onClick={() => eliminarFoto(foto.id)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">No hay fotos para esta zona</p>
                                <p className="text-sm text-gray-400 mt-1">Sube fotos para comenzar</p>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Card 1: Subir Documentos */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Upload className="text-blue-500" size={24} />
                            <h3 className="text-lg font-semibold text-gray-900">Subir Nuevo Documento</h3>
                        </div>
                        
                        {/* Selector de Tipo de Documento */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-3">Tipo de Documento:</h4>
                            <select
                                value={tipoDocumentoSeleccionado}
                                onChange={(e) => setTipoDocumentoSeleccionado(e.target.value as TipoDocumento)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {TIPOS_DOCUMENTOS.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {TIPOS_DOCUMENTOS.find(t => t.value === tipoDocumentoSeleccionado)?.descripcion}
                            </p>
                        </div>

                        {/* Área de Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleDocumentUpload}
                                className="hidden"
                                id="document-upload"
                            />
                            <label htmlFor="document-upload" className="cursor-pointer">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">Selecciona documentos</p>
                                <p className="text-sm text-gray-500">
                                    PDF, DOC, DOCX, JPG, PNG (máx. 10MB cada uno)
                                </p>
                            </label>
                        </div>

                        {/* Lista de Documentos Locales */}
                        {documentos.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium mb-3">
                                    Documentos Subidos Localmente ({documentos.length} archivos)
                                </h4>
                                <div className="space-y-2">
                                    {documentos.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-gray-400" size={16} />
                                                <div>
                                                    <p className="font-medium text-sm">{doc.nombre}</p>
                                                    <p className="text-xs text-gray-500">{doc.tipo}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const documentosActualizados = documentos.filter(d => d.id !== doc.id);
                                                    setDocumentos(documentosActualizados);
                                                    localStorage.setItem(`documentos-casa-${casaId}`, JSON.stringify(documentosActualizados));
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Card 2: Ver Documentos del Backend */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Eye className="text-green-500" size={24} />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Documentos Procesados ({documentosBackend.length})
                                </h3>
                                {isLoadingDocuments && (
                                    <span className="ml-2 text-gray-500 text-xs">(Cargando...)</span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cargarDocumentosBackend}
                                disabled={isLoadingDocuments}
                                className="text-blue-600 hover:text-blue-700"
                                title="Recargar documentos"
                            >
                                <RefreshCw size={14} className={isLoadingDocuments ? 'animate-spin' : ''} />
                            </Button>
                        </div>
                        
                        {isLoadingDocuments ? (
                            <div className="text-center py-6">
                                <RefreshCw className="animate-spin mx-auto h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-gray-500 text-sm">Cargando documentos...</p>
                            </div>
                        ) : documentosBackend.length > 0 ? (
                            <div className="space-y-3">
                                {documentosBackend.map((doc) => (
                                    <div 
                                        key={doc.id} 
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-blue-500" size={20} />
                                            <div>
                                                <p className="font-medium text-sm">{doc.fileName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {doc.originalDocumentType} • {doc.totalPages} páginas
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Procesado: {new Date(doc.processedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => abrirModalDocumento(doc)}
                                                className="text-green-600 hover:text-green-700"
                                                title="Ver documento en modal"
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">No hay documentos subidos</p>
                                <p className="text-sm text-gray-400 mt-1">Sube documentos importantes de tu casa</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Modal del carrusel de fotos */}
            {fotoCarruselModal !== null && fotosFiltradas.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl max-h-full p-4">
                        <button
                            onClick={() => setFotoCarruselModal(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                        
                        <img
                            src={fotosFiltradas[fotoCarruselModal].url}
                            alt={fotosFiltradas[fotoCarruselModal].nombre}
                            className="max-w-full max-h-full object-contain"
                        />
                        
                        {fotosFiltradas.length > 1 && (
                            <>
                                <button
                                    onClick={() => navegarCarrusel('anterior')}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={() => navegarCarrusel('siguiente')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                            {fotoCarruselModal + 1} de {fotosFiltradas.length}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de documento */}
            {documentoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-full overflow-hidden">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {documentoModal.fileName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {documentoModal.originalDocumentType} • {documentoModal.totalPages} páginas
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cerrarModalDocumento}
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Panel izquierdo: PDF Viewer */}
                                <div className="space-y-4">
                                    <h5 className="font-medium text-gray-900">Documento Original (PDF)</h5>
                                    <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                                        <iframe
                                            src={documentoModal.documentUrl}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                            title={`PDF Viewer - ${documentoModal.fileName}`}
                                        />
                                    </div>
                                </div>

                                {/* Panel derecho: Análisis */}
                                <div className="space-y-4">
                                    <h5 className="font-medium text-gray-900">Análisis del Documento</h5>
                                    
                                    {/* Resumen Ejecutivo */}
                                    {documentoModal.executiveSummary && (
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <h6 className="font-semibold text-blue-900 mb-1 text-sm">Resumen Ejecutivo</h6>
                                            <p className="text-blue-800 text-sm">{documentoModal.executiveSummary}</p>
                                        </div>
                                    )}

                                    {/* Estadísticas básicas */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Páginas</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.pageCount}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Tablas</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.tableCount}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Insights</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.insightCount}</p>
                                        </div>
                                    </div>

                                    {/* Información de procesamiento */}
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                                        <p><strong>Procesado:</strong> {new Date(documentoModal.processedAt).toLocaleString()}</p>
                                        <p><strong>Subido:</strong> {new Date(documentoModal.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                            <div className="text-sm text-gray-600">
                                {documentoModal.description}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(documentoModal.documentUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    Abrir en nueva pestaña
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={cerrarModalDocumento}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
