import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { useMsal } from '@azure/msal-react';
import {
    Send,
    Bot,
    User,
    Brain
} from 'lucide-react';

interface DiaryMessage {
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
}

interface DiaryAIResponse {
    success: boolean;
    twinId: string;
    question: string;
    answer: string;
    error?: string;
    searchInfo: {
        totalResults: number;
        searchType: string;
        processingTimeMs: number;
        averageRelevanceScore: number;
        referencedEntryIds: string[];
    };
    processingTimeMs: number;
    processedAt: string;
}

interface TwinDiaryAgentProps {
    courseName?: string;
    twinId?: string;
    cursoId: string;
    capituloId?: string;
}

const TwinDiaryAgent: React.FC<TwinDiaryAgentProps> = ({ courseName, twinId, cursoId, capituloId }) => {
    // Prefer twinId from MSAL account when available
    const { accounts } = useMsal();
    const resolvedTwinId = twinId || accounts?.[0]?.localAccountId || (window as any).TWIN_ID || null;

    const [messages, setMessages] = useState<DiaryMessage[]>([
        {
            id: '1',
            type: 'agent',
            content: '<div class="text-sm">Hola — Soy Twin Cursos. Pregunta sobre el curso o un capítulo para obtener contenido, ejemplos o aclaraciones.</div>',
            timestamp: new Date()
        }
    ]);
    
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [thinkingDots, setThinkingDots] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Animate dots while thinking (isLoading)
    useEffect(() => {
        let timer: any = null;
        if (isLoading) {
            timer = setInterval(() => {
                setThinkingDots(d => (d + 1) % 4);
            }, 400);
        } else {
            setThinkingDots(0);
            if (timer) clearInterval(timer);
        }
        return () => timer && clearInterval(timer);
    }, [isLoading]);

    const initialGreeting: DiaryMessage = {
        id: '1',
        type: 'agent',
        content: '<div class="text-sm">Hola — Soy Twin Cursos. Pregunta sobre el curso o un capítulo para obtener contenido, ejemplos o aclaraciones.</div>',
        timestamp: new Date()
    };

    const clearConversation = () => {
        setMessages([initialGreeting]);
        setIsLoading(false);
    };

    const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !resolvedTwinId || !cursoId) return;

        const userMessage: DiaryMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: newMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsLoading(true);

        const loadingMessage: DiaryMessage = {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            console.log('📚 Enviando pregunta al Twin Cursos:', userMessage.content);
            // Usar el endpoint específico para capítulos si capituloId está disponible
            const endpoint = capituloId 
                ? `/api/twins/${resolvedTwinId}/cursos/${cursoId}/capitulos/${capituloId}/ask-question`
                : `/api/twins/${resolvedTwinId}/cursos/${cursoId}/ask-question`;
            
            const body = capituloId 
                ? { Question: userMessage.content } // Para el endpoint específico de capítulo
                : { Question: userMessage.content, CapituloId: capituloId || undefined }; // Para el endpoint general
            
            console.log('🔗 Endpoint:', endpoint);
            console.log('📦 Body:', body);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data: DiaryAIResponse = await response.json();
                console.log('📚 Respuesta del Diary AI:', data);

                if (data.success) {
                    // Si el backend indica éxito pero no hay resultados relevantes, mostrar mensaje conciso
                    let messageContent: string;
                    if (data.searchInfo && data.searchInfo.totalResults === 0) {
                        // Mensaje corto y directo (evita largos listados de razones)
                        messageContent = `No encontré entradas del diario relacionadas con "${userMessage.content}". Prueba con una pregunta más general.`;
                    } else {
                        // La respuesta viene en formato HTML, renderizarla directamente
                        messageContent = data.answer;
                    }

                    // Solo agregar timestamp de procesamiento si está disponible
                    if (data.processedAt && messageContent) {
                        const processedTime = new Date(data.processedAt).toLocaleTimeString('es-ES');
                        messageContent += `<div style="text-align: right; margin-top: 10px; font-size: 12px; color: #6b7280;">⏱️ ${processedTime}</div>`;
                    }

                    // Reemplazar mensaje de carga con la respuesta real (concisa o HTML)
                    setMessages(prev => prev.map(msg => 
                        msg.id === loadingMessage.id
                            ? {
                                ...msg,
                                content: messageContent,
                                isLoading: false
                            }
                            : msg
                    ));
                } else {
                    // Error en el procesamiento del agente
                    setMessages(prev => prev.map(msg => 
                        msg.id === loadingMessage.id
                            ? {
                                ...msg,
                                content: `❌ Error del agente: ${data.error || 'Error desconocido'}`,
                                isLoading: false
                            }
                            : msg
                    ));
                }

            } else {
                // Error del servidor
                const errorText = await response.text();
                console.error('📚 Error del servidor:', errorText);
                
                setMessages(prev => prev.map(msg => 
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: `❌ Error del servidor: ${response.status}. ${errorText}`,
                            isLoading: false
                        }
                        : msg
                ));
            }

        } catch (error) {
            console.error('📚 Error enviando mensaje:', error);
            
            setMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id
                    ? {
                        ...msg,
                        content: '❌ Error de conexión. Por favor intenta de nuevo.',
                        isLoading: false
                    }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Suggested questions removed per UX request; the agent will present a neutral greeting only.

    return (
        // Fixed large height for the agent panel to keep consistent layout
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[720px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-t-xl text-white">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Twin Cursos</h3>
                            <p className="text-purple-100 text-sm">{courseName ? `${courseName} — Asistente del curso` : 'Asistente del curso'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={clearConversation} title="Limpiar conversación">Limpiar</Button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                            message.type === 'user' ? 'flex-row-reverse' : ''
                        }`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-purple-100 text-purple-600'
                        }`}>
                            {message.type === 'user' ? (
                                <User size={16} />
                            ) : (
                                <Bot size={16} />
                            )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 max-w-[80%] ${
                            message.type === 'user' ? 'text-right' : ''
                        }`}>
                            <div className={`inline-block p-3 rounded-lg ${
                                message.type === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                {message.isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
                                        <span className="text-sm">Twin Curso pensando{'.'.repeat(thinkingDots)}</span>
                                    </div>
                                ) : (
                                    <div 
                                        className="text-sm leading-relaxed diary-ai-content prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: message.content }}
                                        style={{
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            wordWrap: 'break-word'
                                        }}
                                    />
                                )}
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${
                                message.type === 'user' ? 'text-right' : ''
                            }`}>
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions intentionally removed */}

            {/* Input Area */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Pregunta sobre el curso o un capítulo (Enter para enviar)..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-purple-600 hover:bg-purple-700 px-4"
                    >
                        <Send size={16} />
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
            </div>
        </div>
    );
};

export default TwinDiaryAgent;
