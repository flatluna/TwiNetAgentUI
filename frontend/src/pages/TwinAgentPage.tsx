import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TwinAgentClient, { type TwinAgentResponse } from '@/services/twinAgentService';
import TwinAgentFileViewerModal from '@/components/TwinAgentFileViewerModal';
import { useMsal } from '@azure/msal-react';
import { twinApiService } from '@/services/twinApiService';
import logoPng from '@/assets/logo.png';

interface Message {
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
    fileNames?: string[]; // Archivos encontrados en la respuesta
    photoFiles?: Array<{
        fileName: string;
        filePath: string;
    }>; // Fotos encontradas en la respuesta
    typeQuestion?: string; // Tipo de pregunta (ej: "Photos")
}

const TwinAgentPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'agent',
            content: '¡Hola! Soy tu versión digital, creada a partir de tu información personal. Conozco tu historia, tus preferencias y tu forma de pensar. ¿Sobre qué te gustaría reflexionar conmigo hoy?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [twinId, setTwinId] = useState<string | null>(null);
    const [agentClient] = useState(() => new TwinAgentClient());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Estados para el modal de visor de archivos
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    
    // Hooks para obtener datos del usuario
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;

    // Efecto para cargar el Twin ID cuando el usuario esté disponible
    useEffect(() => {
        const loadTwinId = async () => {
            if (msalUser && !twinId) {
                try {
                    const localAccountId = msalUser.localAccountId;
                    console.log('🔍 Cargando Twin ID para user:', localAccountId);
                    
                    const result = await twinApiService.getTwinByIdentifier(localAccountId);
                    if (result.success && result.data) {
                        setTwinId(result.data.id);
                        console.log('✅ Twin ID cargado:', result.data.id);
                    } else {
                        console.error('❌ No se pudo obtener el Twin ID:', result.error);
                    }
                } catch (error) {
                    console.error('❌ Error cargando Twin ID:', error);
                }
            }
        };

        loadTwinId();
    }, [msalUser, twinId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputMessage]);

    // Función para renderizar el contenido del mensaje con formato especial para archivos
    const renderMessageContent = (message: Message) => {
        // Caso para archivos detectados
        if (message.type === 'agent' && message.fileNames && message.fileNames.length > 0) {
            console.log('📁 Renderizando archivos:', message.fileNames);
            // Mostrar el mensaje completo tal como viene
            return (
                <div>
                    <div className="text-xs md:text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <span className="text-blue-600 font-semibold text-xs md:text-sm">📁 Archivos detectados en esta respuesta:</span>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            {message.fileNames.map((fileName, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 bg-white border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="text-blue-700 font-medium text-xs md:text-sm truncate flex-1">{fileName}</span>
                                    </div>
                                    <div className="flex gap-2 sm:flex-shrink-0">
                                        <button
                                            onClick={() => handleFileView(fileName)}
                                            className="px-2 md:px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors w-full sm:w-auto"
                                            title={`Ver ${fileName}`}
                                        >
                                            👁️ Ver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Caso para fotos detectadas
        if (message.type === 'agent' && message.typeQuestion === 'Photos' && message.photoFiles && message.photoFiles.length > 0) {
            console.log('📸 Renderizando fotos:', message.photoFiles);
            return (
                <div>
                    <div className="text-xs md:text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <span className="text-green-600 font-semibold text-xs md:text-sm">📸 Fotos encontradas:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                            {message.photoFiles.map((photo, index) => (
                                <div key={index} className="p-2 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-5 h-5 md:w-6 md:h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="text-green-700 font-medium text-xs md:text-sm truncate flex-1" title={photo.fileName}>
                                            {photo.fileName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePhotoView(photo.fileName, photo.filePath)}
                                        className="w-full px-2 md:px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                        title={`Ver foto ${photo.fileName}`}
                                    >
                                        📸 Ver Foto
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        
        return <div className="text-xs md:text-sm whitespace-pre-wrap">{message.content}</div>;
    };

    // Función para manejar la visualización de archivos
    const handleFileView = (fileName: string) => {
        console.log('👁️ TwinAgent - Ver archivo en modal:', fileName);
        setSelectedFileName(fileName);
        setShowFileViewer(true);
    };

    // Función para manejar la visualización de fotos
    const handlePhotoView = (fileName: string, filePath: string) => {
        console.log('📸 TwinAgent - Ver foto:', fileName, 'Path:', filePath);
        // Por ahora usamos el mismo modal de archivos pero podríamos hacer uno específico para fotos
        setSelectedFileName(fileName);
        setShowFileViewer(true);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Verificar que tengamos el Twin ID
        if (!twinId) {
            console.error('❌ No hay Twin ID disponible');
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response: TwinAgentResponse = await agentClient.sendMessage(twinId, userMessage.content);
            
            // Log limpio solo con la respuesta del backend
            console.log('� RESPUESTA DEL BACKEND:', {
                success: response.success,
                message: response.message,
                fileNames: response.fileNames,
                twinId: response.twinId,
                agentType: response.agent_type
            });

            const agentResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                content: response.message, // Usar el mensaje tal como viene del backend
                timestamp: new Date(),
                fileNames: response.fileNames // Pasar los archivos para mostrar los botones
            };
            
            setMessages(prev => [...prev, agentResponse]);

        } catch (error) {
            console.error('❌ Error al comunicarse con el TwinAgent:', error);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b border-gray-200 bg-gray-50">
                <img 
                    src={logoPng} 
                    alt="Mi Yo Digital" 
                    className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Chat por Texto</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm text-gray-600">
                        <span className="truncate">Conversa por texto con tu yo digital</span>
                        {twinId ? (
                            <span className="text-green-600 text-xs flex-shrink-0">✅ Conectado</span>
                        ) : (
                            <span className="text-orange-600 text-xs flex-shrink-0">⏳ Cargando...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-2 md:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.type === 'agent' && (
                            <div className="flex-shrink-0">
                                <img 
                                    src={logoPng} 
                                    alt="Mi Yo Digital" 
                                    className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-100 p-1"
                                />
                            </div>
                        )}
                        
                        <div
                            className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg px-3 md:px-4 py-2 ${
                                message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                        >
                            {renderMessageContent(message)}
                            <div className={`text-xs mt-1 ${
                                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                                {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                        </div>

                        {message.type === 'user' && (
                            <div className="flex-shrink-0">
                                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">TÚ</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-2 md:gap-3 justify-start">
                        <div className="flex-shrink-0">
                            <img 
                                src={logoPng} 
                                alt="Mi Yo Digital" 
                                className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-100 p-1"
                            />
                        </div>
                        <div className="bg-gray-100 text-gray-800 border border-gray-200 rounded-lg px-3 md:px-4 py-2">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Reflexionando...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 md:p-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={twinId ? "¿Qué te gustaría preguntarte a ti mismo? (Enter para enviar, Shift+Enter para nueva línea)" : "Cargando tu Twin digital..."}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-24 md:max-h-32 disabled:bg-gray-100 disabled:text-gray-500"
                            rows={1}
                            disabled={isLoading || !twinId}
                        />
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading || !twinId}
                        size="sm"
                        className="h-10 w-10 p-0 flex-shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span>💡 Tip: Usa Shift+Enter para crear nuevas líneas</span>
                        {twinId ? (
                            <span>🤔 Tu yo digital está listo para dialogar contigo</span>
                        ) : (
                            <span>⏳ Preparando tu conexión con tu Twin digital...</span>
                        )}
                    </div>
                </div>
                
                {/* Privacy and Security Notice */}
                <div className="mt-3 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <div className="text-green-600 mt-0.5 flex-shrink-0">🔐</div>
                        <div className="text-xs text-green-700">
                            <p className="font-medium mb-1">Tu información personal está 100% protegida</p>
                            <p className="leading-relaxed">
                                Toda tu información personal te pertenece únicamente a ti. Está encriptada y almacenada de forma segura en Microsoft Azure, 
                                la nube más confiable del mundo. Nadie más puede acceder a tus datos personales - solo tú tienes el control total de tu información.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de visor de archivos */}
            <TwinAgentFileViewerModal
                isOpen={showFileViewer}
                onClose={() => {
                    setShowFileViewer(false);
                    setSelectedFileName(null);
                }}
                filename={selectedFileName}
            />
        </div>
    );
};

export default TwinAgentPage;
