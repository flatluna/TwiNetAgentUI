import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, FileText, Search, ArrowLeft, BookOpen, MessageSquare, Bot, Send, Hash, Eye } from 'lucide-react';
import { documentApiService, ExtractedChapterSubsIndex, GetNoStructuredDocumentResponse, TwinAgentDocumentResponse } from '../services/documentApiService';

interface ChatMessage {
    id: string;
    message: string;
    isUser: boolean;
    timestamp: Date;
}

const DocumentoViewer: React.FC = () => {
    const { twinId, documentId } = useParams<{ twinId: string; documentId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [documentData, setDocumentData] = useState<GetNoStructuredDocumentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<ExtractedChapterSubsIndex | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-5-mini');
    const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Obtener información del estado de navegación
    const { documentTitle } = location.state || {};

    useEffect(() => {
        cargarDocumento();
    }, [twinId, documentId]);

    useEffect(() => {
        // Scroll al final del chat cuando hay nuevos mensajes
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    const cargarDocumento = async () => {
        if (!twinId || !documentId) {
            setError('Twin ID y Document ID son requeridos');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await documentApiService.getNoStructuredDocument(twinId, documentId);
            
            console.log('📄 Datos recibidos del nuevo endpoint:', data);

            if (!data || !data.success || !data.documentData || data.documentData.length === 0) {
                setError('No se encontraron datos para este documento');
                setLoading(false);
                return;
            }

            setDocumentData(data);
            
            // Expandir el primer capítulo por defecto
            if (data.documentData.length > 0) {
                const firstChapterId = data.documentData[0].chapterID;
                setExpandedChapters(new Set([firstChapterId]));
                setSelectedChapter(data.documentData[0]);
            }

            // Mensaje de bienvenida del AI Agent
            setChatMessages([{
                id: '1',
                message: `¡Bienvenido! Soy tu Twin Digital de documentos 📋. ¿En qué puedo ayudarte con "${data.fileName}"?`,
                isUser: false,
                timestamp: new Date()
            }]);

            setLoading(false);

        } catch (error) {
            console.error('❌ Error cargando documento:', error);
            setError(`Error cargando documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            setLoading(false);
        }
    };

    const toggleChapter = (chapterId: string) => {
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId);
        } else {
            newExpanded.add(chapterId);
        }
        setExpandedChapters(newExpanded);
    };

    const selectChapter = (chapter: ExtractedChapterSubsIndex) => {
        setSelectedChapter(chapter);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading || !documentData || !twinId) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            message: chatInput.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentQuestion = chatInput.trim();
        setChatInput('');
        setChatLoading(true);

        try {
            console.log(`🚀 Enviando pregunta al AI Agent: "${currentQuestion}"`);
            console.log(`📁 Archivo: ${documentData.fileName}`);
            console.log(`👤 TwinID: ${twinId}`);

            // Llamar al AI Agent real
            const aiResponse = await documentApiService.answerSearchQuestion(
                twinId, 
                documentData.fileName, 
                currentQuestion,
                selectedModel,
                selectedLanguage
            );

            console.log(`🎯 Respuesta recibida del AI Agent:`, aiResponse);

            // Crear mensaje de respuesta del AI
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                message: aiResponse.success ? aiResponse.answer : `Error: ${aiResponse.errorMessage || 'No se pudo procesar la pregunta'}`,
                isUser: false,
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, aiMessage]);
            setChatLoading(false);

        } catch (error) {
            console.error('❌ Error al comunicarse con el AI Agent:', error);
            
            // Mensaje de error
            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                message: `Lo siento, hubo un error al procesar tu pregunta: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor intenta de nuevo.`,
                isUser: false,
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, errorMessage]);
            setChatLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    // Agrupar capítulos por chapterID
    const groupedChapters = documentData?.documentData.reduce((acc, item) => {
        if (!acc[item.chapterID]) {
            acc[item.chapterID] = [];
        }
        acc[item.chapterID].push(item);
        return acc;
    }, {} as Record<string, ExtractedChapterSubsIndex[]>) || {};

    const filteredChapters = Object.entries(groupedChapters).filter(([, chapters]) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return chapters.some(chapter => 
            chapter.chapter.toLowerCase().includes(searchLower) ||
            chapter.titleSub.toLowerCase().includes(searchLower) ||
            chapter.textChapter.toLowerCase().includes(searchLower) ||
            chapter.textSub.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Cargando documento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar documento</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!documentData) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-full mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Volver</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 truncate max-w-96">
                                    {documentTitle || documentData.fileName}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>📁 {documentData.subcategoria}</span>
                                    <span>📄 {documentData.totalPages} páginas</span>
                                    <span>🔤 {documentData.totalTokens.toLocaleString()} tokens</span>
                                    <span>📚 {documentData.totalChapters} capítulos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout de 3 columnas */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] lg:h-[calc(100vh-100px)]">
                {/* Columna 1: Metadata y Capítulos */}
                <div className="w-full lg:w-1/4 bg-white border-r border-gray-200 lg:border-b-0 border-b flex flex-col h-96 lg:h-full">
                    {/* Buscador */}
                    <div className="p-2 lg:p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar capítulos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Lista de capítulos */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                                Capítulos ({filteredChapters.length})
                            </h2>
                            
                            <div className="space-y-2">
                                {filteredChapters.map(([chapterId, chapters]) => (
                                    <div key={chapterId} className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleChapter(chapterId)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {expandedChapters.has(chapterId) ? (
                                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                                    )}
                                                    <span className="font-medium text-gray-800">
                                                        {chapters[0].chapter || `Capítulo ${chapterId}`}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {chapters.length}
                                                </span>
                                            </div>
                                        </button>
                                        
                                        {expandedChapters.has(chapterId) && (
                                            <div className="border-t border-gray-200 bg-gray-50">
                                                {chapters.map((chapter, index) => (
                                                    <button
                                                        key={`${chapter.id}-${index}`}
                                                        onClick={() => selectChapter(chapter)}
                                                        className={`w-full px-6 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                                                            selectedChapter?.id === chapter.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                                        }`}
                                                    >
                                                        <div className="font-medium text-gray-700 mb-1">
                                                            {chapter.titleSub || chapter.chapter || 'Sin título'}
                                                        </div>
                                                        <div className="text-gray-500 text-xs">
                                                            📄 Páginas {chapter.fromPageChapter}-{chapter.toPageChapter} | 🔤 {chapter.totalTokens} tokens
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
                </div>

                {/* Columna 2: AI Agent Chat */}
                <div className="w-full lg:w-1/2 bg-white border-r border-gray-200 lg:border-b-0 border-b flex flex-col h-96 lg:h-full">
                    <div className="p-2 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-base lg:text-lg font-semibold text-white">AI Agent</h2>
                                <p className="text-blue-100 text-xs lg:text-sm hidden lg:block">Tu asistente de documentos</p>
                            </div>
                        </div>
                    </div>

                    {/* Configuración del AI Agent */}
                    <div className="p-2 lg:p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                            {/* Selector de Modelo */}
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Modelo
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-2 py-1 text-xs lg:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="gpt-5-mini">GPT-5-Mini</option>
                                    <option value="gpt4mini">GPT4Mini</option>
                                </select>
                            </div>

                            {/* Selector de Idioma */}
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Idioma
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full px-2 py-1 text-xs lg:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="Spanish">Español</option>
                                    <option value="English">English</option>
                                    <option value="French">Français</option>
                                    <option value="Portuguese">Português</option>
                                    <option value="Italian">Italiano</option>
                                    <option value="German">Deutsch</option>
                                    <option value="Chinese">中文</option>
                                    <option value="Japanese">日本語</option>
                                    <option value="Korean">한국어</option>
                                    <option value="Arabic">العربية</option>
                                    <option value="Russian">Русский</option>
                                    <option value="Yucatec Maya">Yucatec Maya</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4">
                        {chatMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] lg:max-w-[80%] p-2 lg:p-3 rounded-lg ${
                                        message.isUser
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <div 
                                        className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-800'} prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit`}
                                        dangerouslySetInnerHTML={{ __html: message.message }}
                                        style={{
                                            // Override any inline styles from the backend that might conflict
                                            fontFamily: 'inherit',
                                            maxWidth: '100%',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    />
                                    <p className={`text-xs mt-1 ${
                                        message.isUser ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg max-w-[80%]">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        <span className="text-sm text-blue-700">AI Agent está analizando el documento...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="p-2 lg:p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Pregúntame..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={chatLoading}
                                className="flex-1 px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            />
                            <button
                                onClick={sendChatMessage}
                                disabled={chatLoading || !chatInput.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Columna 3: PDF Viewer */}
                <div className="w-full lg:w-1/4 bg-white flex flex-col h-96 lg:h-full">
                    <div className="p-2 lg:p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base lg:text-lg font-semibold text-gray-800 flex items-center">
                                <Eye className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2 text-green-600" />
                                <span className="hidden lg:inline">Visualizador PDF</span>
                                <span className="lg:hidden">PDF</span>
                            </h2>
                            {selectedChapter && (
                                <div className="text-xs lg:text-sm text-gray-500">
                                    {selectedChapter.fromPageChapter}-{selectedChapter.toPageChapter}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex-1 p-2 lg:p-4">
                        {documentData.documentData[0]?.fileURL ? (
                            <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                                <iframe
                                    src={`${documentData.documentData[0].fileURL}#toolbar=1&navpanes=1&scrollbar=1&page=${selectedChapter?.fromPageChapter || 1}`}
                                    className="w-full h-full"
                                    title="PDF Viewer"
                                />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">PDF no disponible</p>
                                    <p className="text-sm text-gray-400">El archivo PDF no está disponible para visualización</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información del capítulo seleccionado */}
                    {selectedChapter && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 mb-2">Capítulo Seleccionado</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div><strong>Título:</strong> {selectedChapter.titleSub || selectedChapter.chapter}</div>
                                <div><strong>Páginas:</strong> {selectedChapter.fromPageChapter} - {selectedChapter.toPageChapter}</div>
                                <div><strong>Tokens:</strong> {selectedChapter.totalTokens.toLocaleString()}</div>
                                <div className="mt-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">ID del Capítulo:</span>
                                    </div>
                                    <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                                        {selectedChapter.chapterID}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentoViewer;