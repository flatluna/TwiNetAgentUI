import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { useMsal } from '@azure/msal-react';
import {
    Send,
    Bot,
    User,
    Brain,
    Maximize2,
    Minimize2,
    X
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
    capituloTitulo?: string;
    capituloTranscript?: string;
}

const TwinDiaryAgentMaximizable: React.FC<TwinDiaryAgentProps> = ({ courseName, twinId, cursoId, capituloId, capituloTitulo, capituloTranscript }) => {
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
    const [isMaximized, setIsMaximized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [thinkingDots, setThinkingDots] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const clearConversation = () => {
        setMessages([{
            id: '1',
            type: 'agent',
            content: '<div class="text-sm">Hola — Soy Twin Cursos. Pregunta sobre el curso o un capítulo para obtener contenido, ejemplos o aclaraciones.</div>',
            timestamp: new Date()
        }]);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isLoading) return;

        const userMessage: DiaryMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: newMessage.trim(),
            timestamp: new Date()
        };

        const loadingMessage: DiaryMessage = {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setNewMessage('');
        setIsLoading(true);

        try {
            console.log('📚 Enviando pregunta al Twin Cursos:', userMessage.content);
            console.log('📋 capituloTitulo received:', capituloTitulo);
            console.log('📋 capituloTranscript length:', capituloTranscript?.length || 0);
            console.log('📋 capituloId received:', capituloId);
            const endpoint = `/api/twins/${resolvedTwinId}/cursos/${cursoId}/ask-question`;
            
            const body = {
                Question: userMessage.content,
                CapituloId: capituloId ? parseInt(capituloId, 10) : undefined,
                Titulo: capituloTitulo || '',
                Context: capituloTranscript || ''
            };
            
            console.log('🔗 Endpoint:', endpoint);
            console.log('📦 Body:', body);
            console.log('📦 Body.Titulo specifically:', body.Titulo);
            
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
                    let messageContent: string;
                    if (data.searchInfo && data.searchInfo.totalResults === 0) {
                        messageContent = `No encontré entradas del diario relacionadas con "${userMessage.content}". Prueba con una pregunta más general.`;
                    } else {
                        messageContent = data.answer;
                    }

                    setMessages(prev => prev.map(msg => 
                        msg.id === loadingMessage.id
                            ? { ...msg, content: messageContent, isLoading: false }
                            : msg
                    ));
                } else {
                    setMessages(prev => prev.map(msg => 
                        msg.id === loadingMessage.id
                            ? { ...msg, content: data.error || 'Hubo un error al procesar tu pregunta.', isLoading: false }
                            : msg
                    ));
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Error en la respuesta:', response.status, errorText);
                setMessages(prev => prev.map(msg => 
                    msg.id === loadingMessage.id
                        ? { ...msg, content: 'Lo siento, hubo un problema al procesar tu pregunta. Por favor intenta de nuevo.', isLoading: false }
                        : msg
                ));
            }
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            setMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id
                    ? { ...msg, content: 'Error de conexión. Verifica tu internet e intenta de nuevo.', isLoading: false }
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

    return (
        <>
            {/* Componente Normal (modo embebido) */}
            {!isMaximized && (
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
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setIsMaximized(true)} 
                                    title="Maximizar ventana"
                                    className="hover:bg-white/20 p-2"
                                >
                                    <Maximize2 size={16} />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={clearConversation} 
                                    title="Limpiar conversación"
                                    className="hover:bg-white/20"
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.type === 'agent' && (
                                    <div className="bg-purple-100 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} className="text-purple-600" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${
                                    message.type === 'user' ? 'bg-blue-500 text-white rounded-l-xl rounded-tr-xl' : 'bg-gray-100 rounded-r-xl rounded-tl-xl'
                                } p-3`}>
                                    <div className="mb-1">
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
                                {message.type === 'user' && (
                                    <div className="bg-blue-100 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                        <User size={16} className="text-blue-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

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
            )}

            {/* Modal Maximizado (modo pantalla completa) */}
            {isMaximized && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
                        {/* Header Maximizado */}
                        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 rounded-t-xl text-white">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl">Twin Cursos</h3>
                                        <p className="text-purple-100 text-lg">{courseName ? `${courseName} — Asistente del curso` : 'Asistente del curso'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        size="lg" 
                                        variant="ghost" 
                                        onClick={() => setIsMaximized(false)} 
                                        title="Restaurar ventana"
                                        className="hover:bg-white/20 p-3"
                                    >
                                        <Minimize2 size={20} />
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="ghost" 
                                        onClick={clearConversation} 
                                        title="Limpiar conversación"
                                        className="hover:bg-white/20"
                                    >
                                        Limpiar
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="ghost" 
                                        onClick={() => setIsMaximized(false)} 
                                        title="Cerrar ventana maximizada"
                                        className="hover:bg-white/20 p-3"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area Maximizada */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {message.type === 'agent' && (
                                        <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                                            <Bot size={20} className="text-purple-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] ${
                                        message.type === 'user' ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl' : 'bg-gray-100 rounded-r-2xl rounded-tl-2xl'
                                    } p-6`}>
                                        <div className="mb-2">
                                            {message.isLoading ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-purple-500 border-t-transparent" />
                                                    <span className="text-base">Twin Curso pensando{'.'.repeat(thinkingDots)}</span>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-base leading-relaxed diary-ai-content prose prose-base max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                                    style={{
                                                        maxWidth: '100%',
                                                        overflow: 'hidden',
                                                        wordWrap: 'break-word'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className={`text-sm text-gray-500 mt-2 ${
                                            message.type === 'user' ? 'text-right' : ''
                                        }`}>
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                    {message.type === 'user' && (
                                        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area Maximizada */}
                        <div className="p-8 border-t">
                            <div className="flex gap-4">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Pregunta sobre el curso o un capítulo (Enter para enviar)..."
                                    className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-base"
                                    rows={3}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 px-6 py-4 text-base"
                                >
                                    <Send size={20} />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                Presiona Enter para enviar, Shift+Enter para nueva línea
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TwinDiaryAgentMaximizable;