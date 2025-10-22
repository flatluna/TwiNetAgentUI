import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, FileText, Search, ArrowLeft, BookOpen, MessageSquare, Bot, Send } from 'lucide-react';
import { documentApiService, ExtractedChapterSubsIndex, GetNoStructuredDocumentResponse } from '../services/documentApiService';

interface ChatMessage {
    id: string;
    message: string;
    isUser: boolean;
    timestamp: Date;
}

const DocumentoViewer: React.FC = () => {
    const { twinId, documentId } = useParams<{ twinId: string; documentId: string }>();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState<GetNoStructuredDocumentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<ExtractedChapterSubsIndex | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        cargarDocumento();
    }, [twinId, documentId]);

    const cargarDocumento = async () => {
        if (!twinId || !documentId) {
            setError('Twin ID y Document ID son requeridos');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await documentApiService.getNoStructuredDocument(twinId, documentId);
            
            console.log('Datos recibidos:', data);

            if (!data || !data.document || !data.document.capitulos || data.document.capitulos.length === 0) {
                setError('No se encontraron datos para este documento');
                setLoading(false);
                return;
            }

            // Agrupar subtemas por capítulo
            const capitulosMap = new Map<string, Capitulo>();
            let totalTokens = 0;
            let totalSubtemas = 0;

            data.document.capitulos.forEach((item: any) => {
                const capituloID = item.CapituloID || 'sin-capitulo';
                
                if (!capitulosMap.has(capituloID)) {
                    capitulosMap.set(capituloID, {
                        capituloID,
                        titulo: item.titleSubCapitulo || `Capítulo ${capituloID}`,
                        subtemas: [],
                        totalTokens: 0,
                        expanded: false
                    });
                }

                const capitulo = capitulosMap.get(capituloID)!;
                const subtema: Subtema = {
                    id: item.SubtemaID || `${capituloID}-${capitulo.subtemas.length + 1}`,
                    subTemaID: item.SubtemaID || `${capituloID}-${capitulo.subtemas.length + 1}`,
                    titulo: item.titleSubCapitulo || 'Sin título',
                    textoCompleto: item.textoSubCapitulo || '',
                    html: item.html || '',
                    tokens: item.capituloTotalTokens || 0
                };

                capitulo.subtemas.push(subtema);
                capitulo.totalTokens += subtema.tokens;
                totalTokens += subtema.tokens;
                totalSubtemas++;
            });

            // Expandir el primer capítulo por defecto
            const firstCapitulo = Array.from(capitulosMap.values())[0];
            if (firstCapitulo) {
                firstCapitulo.expanded = true;
                if (firstCapitulo.subtemas.length > 0) {
                    setSelectedSubtema(firstCapitulo.subtemas[0]);
                }
            }

            const documentoCompleto: DocumentoCompleto = {
                documentID: documentId,
                titulo: data.document.documentTitle || 'Documento sin título',
                capitulos: capitulosMap,
                totalTokens,
                totalSubtemas
            };

            setDocumento(documentoCompleto);
            setError(null);
        } catch (err) {
            console.error('Error al cargar documento:', err);
            setError('Error al cargar el documento');
        } finally {
            setLoading(false);
        }
    };

    const toggleCapitulo = (capituloID: string) => {
        if (!documento) return;

        const capitulo = documento.capitulos.get(capituloID);
        if (capitulo) {
            capitulo.expanded = !capitulo.expanded;
            setDocumento({ ...documento });
        }
    };

    const selectSubtema = (subtema: Subtema) => {
        setSelectedSubtema(subtema);
    };

    const filteredCapitulos = () => {
        if (!documento) return [];
        if (!searchTerm) return Array.from(documento.capitulos.values());

        return Array.from(documento.capitulos.values()).filter(capitulo =>
            capitulo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            capitulo.subtemas.some(subtema => 
                subtema.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (subtema.textoCompleto && subtema.textoCompleto.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    };

    const renderContent = () => {
        if (!selectedSubtema) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 mb-4" />
                        <p>Selecciona un subtema para ver su contenido</p>
                    </div>
                </div>
            );
        }

        // Determinar si mostrar HTML o texto
        const hasValidHtml = selectedSubtema.html && 
            selectedSubtema.html.trim() !== '' && 
            selectedSubtema.html !== selectedSubtema.textoCompleto;

        if (hasValidHtml) {
            return (
                <div className="prose max-w-none">
                    <div 
                        dangerouslySetInnerHTML={{ __html: selectedSubtema.html }}
                        className="document-content"
                    />
                </div>
            );
        } else {
            // Mostrar texto plano con formato mejorado
            return (
                <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                        {selectedSubtema.textoCompleto}
                    </div>
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando documento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {documento?.titulo}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {documento?.totalSubtemas} subtemas • {documento?.totalTokens} tokens
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            {/* Búsqueda */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar en el documento..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Navegación de capítulos */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-900 mb-3">Contenido</h3>
                                {filteredCapitulos().map((capitulo) => (
                                    <div key={capitulo.capituloID}>
                                        {/* Capítulo */}
                                        <button
                                            onClick={() => toggleCapitulo(capitulo.capituloID)}
                                            className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
                                        >
                                            <div className="flex items-center">
                                                {capitulo.expanded ? (
                                                    <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                                                )}
                                                <span className="font-medium text-sm text-gray-900">
                                                    {capitulo.titulo}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {capitulo.subtemas.length}
                                            </span>
                                        </button>

                                        {/* Subtemas */}
                                        {capitulo.expanded && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {capitulo.subtemas.map((subtema) => (
                                                    <button
                                                        key={subtema.id}
                                                        onClick={() => selectSubtema(subtema)}
                                                        className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                                            selectedSubtema?.id === subtema.id
                                                                ? 'bg-blue-100 text-blue-900'
                                                                : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="truncate">
                                                            {subtema.titulo}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {subtema.tokens} tokens
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border">
                            {selectedSubtema && (
                                <div className="border-b bg-gray-50 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedSubtema.titulo}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ID: {selectedSubtema.subTemaID} • {selectedSubtema.tokens} tokens
                                    </p>
                                </div>
                            )}
                            <div className="p-6">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentoViewer;