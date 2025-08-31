import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TwinAgentClient, { type TwinAgentResponse, type ProcessQuestionRequest, type ProcessQuestionResponse } from '@/services/twinAgentService';
import TwinAgentFileViewerModal from '@/components/TwinAgentFileViewerModal';
import { TwinResponse } from '@/components/TwinResponse';
import { useMsal } from '@azure/msal-react';
import { twinApiService } from '@/services/twinApiService';
import logoPng from '@/assets/logo.png';

// Custom hook for processing questions (alternative approach)
const useProcessQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processQuestion = async (request: ProcessQuestionRequest): Promise<ProcessQuestionResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:7011/api/ProcessQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProcessQuestionResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.errorMessage || 'Unknown error occurred');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error processing question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    processQuestion,
    loading,
    error,
  };
};

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
    // Campos adicionales para TwinResponse
    twinId?: string;
    question?: string; // La pregunta original del usuario
    success?: boolean; // Si la respuesta fue exitosa
    errorMessage?: string; // Mensaje de error si aplica
    processedAt?: string; // Timestamp de cuando se procesó
    result?: string; // Campo Result del backend (contenido HTML)
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
    const [twinIdLoading, setTwinIdLoading] = useState(false);
    const [twinIdError, setTwinIdError] = useState<string | null>(null);
    const [agentClient] = useState(() => new TwinAgentClient());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const twinIdLoadAttemptedRef = useRef(false); // Evitar múltiples cargas
    
    // Hook para procesamiento directo de preguntas
    const { processQuestion } = useProcessQuestion();
    
    // Estados para el modal de visor de archivos
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    
    // Hooks para obtener datos del usuario
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;

    // Alternative approach using the custom hook (uncomment to use)
    // const { processQuestion, loading: hookLoading, error: hookError } = useProcessQuestion();

    // Efecto para cargar el Twin ID cuando el usuario esté disponible
    useEffect(() => {
        const loadTwinId = async () => {
            if (msalUser?.localAccountId && !twinId && !twinIdLoading && !twinIdLoadAttemptedRef.current) {
                console.log('🚀 TwinAgentPage: Iniciando carga única del Twin ID...');
                twinIdLoadAttemptedRef.current = true; // Marcar como intentado
                setTwinIdLoading(true);
                setTwinIdError(null);
                
                try {
                    const localAccountId = msalUser.localAccountId;
                    console.log('🔍 Cargando Twin ID para user (una sola vez):', localAccountId);
                    
                    // Add timeout to prevent hanging
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout loading Twin ID')), 10000)
                    );
                    
                    // First, try to get the Twin profile from the API
                    const resultPromise = twinApiService.getTwinByIdentifier(localAccountId);
                    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
                    
                    if (result.success && result.data) {
                        // Use localAccountId as Twin ID since it's the primary identifier
                        // The backend might not return 'id' field, but localAccountId IS the Twin ID
                        const twinIdToUse = result.data.id || localAccountId;
                        setTwinId(twinIdToUse);
                        console.log('✅ TwinAgentPage: Twin ID cargado desde API:', twinIdToUse);
                    } else {
                        console.warn('⚠️ TwinAgentPage: No se pudo obtener el Twin ID desde API, usando localAccountId como fallback:', result.error);
                        // Fallback: use localAccountId directly as twinId
                        setTwinId(localAccountId);
                        console.log('✅ TwinAgentPage: Twin ID establecido como fallback:', localAccountId);
                        setTwinIdError('API not available, using fallback ID');
                    }
                } catch (error) {
                    console.error('❌ TwinAgentPage: Error cargando Twin ID desde API, usando localAccountId como fallback:', error);
                    // Fallback: use localAccountId directly as twinId
                    if (msalUser.localAccountId) {
                        setTwinId(msalUser.localAccountId);
                        console.log('✅ TwinAgentPage: Twin ID establecido como fallback tras error:', msalUser.localAccountId);
                        setTwinIdError('API error, using fallback ID');
                    } else {
                        setTwinIdError('No localAccountId available');
                    }
                } finally {
                    setTwinIdLoading(false);
                    console.log('🏁 TwinAgentPage: Carga del Twin ID completada');
                }
            } else if (twinIdLoadAttemptedRef.current) {
                console.log('🛑 TwinAgentPage: Carga del Twin ID ya fue intentada, evitando loop');
            }
        };

        loadTwinId();
    }, [msalUser?.localAccountId]); // Solo depender del localAccountId, no de los estados internos
    
    // Reset attempt flag when user changes
    useEffect(() => {
        if (msalUser?.localAccountId) {
            console.log('🔄 TwinAgentPage: Usuario cambió, reiniciando banderas de carga');
            twinIdLoadAttemptedRef.current = false;
            setTwinId(null);
            setTwinIdError(null);
        }
    }, [msalUser?.localAccountId]);

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
        // Si es un mensaje del agente y tiene la información necesaria para TwinResponse
        if (message.type === 'agent' && (message.success !== undefined || message.result)) {
            const responseData = {
                success: message.success ?? true, // Default a true si no está definido
                result: message.result || message.content, // Usar result si está disponible, sino content
                question: message.question,
                twinId: message.twinId,
                processedAt: message.processedAt || message.timestamp.toISOString(),
                errorMessage: message.errorMessage
            };
            
            return <TwinResponse response={responseData} />;
        }
        
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
            // Method 2: Using the direct API call to get ProcessQuestionResponse
            const request: ProcessQuestionRequest = {
                twinId: twinId,
                question: userMessage.content,
                sessionId: agentClient.getCurrentSessionId() || undefined
            };
            
            const hookResponse = await processQuestion(request);
            if (!hookResponse) {
                throw new Error('No se pudo conectar con el servicio del TwinAgent');
            }
            
            console.log('🔍 Raw backend response:', hookResponse);
            
            // Map ProcessQuestionResponse to display format
            const response = {
                success: hookResponse.success,
                message: hookResponse.result || '', // Use 'result' field from backend as the main content
                sessionId: hookResponse.sessionId,
                statistics: hookResponse.statistics,
                twinId: hookResponse.twinId,
                agent_type: hookResponse.agent_type,
                fileNames: hookResponse.fileNames
            };
            
            /* 
            // Method 1: Using TwinAgentClient (alternative approach)
            const response: TwinAgentResponse = await agentClient.sendMessage(twinId, userMessage.content);
            */
            
            // Log limpio solo con la respuesta del backend
            console.log('✅ RESPUESTA DEL BACKEND:', {
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
                fileNames: response.fileNames, // Pasar los archivos para mostrar los botones
                // Campos adicionales para TwinResponse
                success: hookResponse.success,
                twinId: hookResponse.twinId || twinId,
                question: userMessage.content,
                processedAt: hookResponse.processedAt || new Date().toISOString(),
                // Pasar el Result original del backend
                result: hookResponse.result
            };
            
            setMessages(prev => [...prev, agentResponse]);

        } catch (error) {
            console.error('❌ Error al comunicarse con el TwinAgent:', error);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                content: 'Disculpa, estoy experimentando algunas dificultades técnicas en este momento. 😔 Podríamos intentarlo de nuevo en unos segundos, por favor? Gracias por tu paciencia.',
                timestamp: new Date(),
                // Campos adicionales para TwinResponse
                success: false,
                twinId: twinId,
                question: inputMessage,
                errorMessage: error instanceof Error ? error.message : 'Error desconocido',
                processedAt: new Date().toISOString(),
                result: '' // Resultado vacío para errores
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

    // Función para reiniciar/limpiar la ventana de chat
    const handleResetChat = () => {
        // Opcional: agregar confirmación si hay muchos mensajes
        if (messages.length > 3) {
            if (!confirm('¿Estás seguro de que quieres reiniciar la conversación? Se perderán todos los mensajes.')) {
                return;
            }
        }
        
        setMessages([
            {
                id: '1',
                type: 'agent',
                content: '¡Hola! Soy tu versión digital, creada a partir de tu información personal. Conozco tu historia, tus preferencias y tu forma de pensar. ¿Sobre qué te gustaría reflexionar conmigo hoy?',
                timestamp: new Date()
            }
        ]);
        setInputMessage('');
        console.log('🔄 Chat reiniciado');
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
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="text-green-600 text-xs flex-shrink-0">✅ Conectado (ID: {twinId.substring(0, 8)}...)</span>
                                {twinIdError && (
                                    <span className="text-yellow-600 text-xs flex-shrink-0" title={twinIdError}>⚠️ Modo fallback</span>
                                )}
                            </div>
                        ) : twinIdLoading ? (
                            <span className="text-orange-600 text-xs flex-shrink-0">⏳ Cargando Twin ID...</span>
                        ) : msalUser ? (
                            <span className="text-red-600 text-xs flex-shrink-0">❌ Error cargando Twin ID</span>
                        ) : (
                            <span className="text-red-600 text-xs flex-shrink-0">❌ No hay usuario autenticado</span>
                        )}
                    </div>
                </div>
                
                {/* Botón para reiniciar chat */}
                <div className="flex-shrink-0">
                    <button
                        onClick={handleResetChat}
                        className="h-8 w-8 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Reiniciar conversación"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
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
                                <span className="text-sm">Analizando...</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                La IA puede tardar unos momentos en procesar. Las respuestas no siempre son perfectas. Gracias por tu paciencia.
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
                            placeholder={
                                twinId 
                                    ? "¿Qué te gustaría preguntarte a ti mismo? (Enter para enviar, Shift+Enter para nueva línea)" 
                                    : twinIdLoading 
                                        ? "Cargando tu Twin digital..." 
                                        : twinIdError 
                                            ? `Twin ID cargado en modo fallback - puedes chatear (${twinIdError})`
                                            : "Esperando autenticación..."
                            }
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
                        ) : twinIdLoading ? (
                            <span>⏳ Preparando tu conexión con tu Twin digital...</span>
                        ) : twinIdError ? (
                            <span>⚠️ Usando modo fallback - puedes chatear pero con funcionalidad limitada</span>
                        ) : (
                            <span>❌ Problema conectando - revisa la consola del navegador para más detalles</span>
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
