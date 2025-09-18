import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { useMsal } from '@azure/msal-react';
import {
    Send,
    Bot,
    User,
    MessageCircle,
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

const TwinDiaryAgent: React.FC = () => {
    const { accounts } = useMsal();
    const twinId = accounts[0]?.localAccountId;
    
    const [messages, setMessages] = useState<DiaryMessage[]>([
        {
            id: '1',
            type: 'agent',
            content: '¡Hola! Soy tu asistente personal de diario. Puedo ayudarte a analizar todas tus actividades como:\n\n🍽️ Experiencias en restaurantes y comidas\n📞 Llamadas y contactos con amigos/familia\n🎬 Películas, cine y entretenimiento\n💰 Gastos y patrones financieros\n👥 Actividades sociales y viajes\n💼 Trabajo y ejercicio\n\n¿Sobre qué te gustaría que analice tus entradas del diario?',
            timestamp: new Date()
        }
    ]);
    
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || isLoading || !twinId) return;

        const userMessage: DiaryMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: newMessage.trim(),
            timestamp: new Date()
        };

        // Añadir mensaje del usuario
        setMessages(prev => [...prev, userMessage]);
        
        // Limpiar input
        setNewMessage('');
        setIsLoading(true);

        // Añadir mensaje de carga del agente
        const loadingMessage: DiaryMessage = {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            console.log('📚 Enviando pregunta al Diary AI:', userMessage.content);
            
            const response = await fetch(`/api/twins/${twinId}/diary/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content
                })
            });

            if (response.ok) {
                const data: DiaryAIResponse = await response.json();
                console.log('📚 Respuesta del Diary AI:', data);

                if (data.success) {
                    // La respuesta viene en formato HTML, renderizarla directamente
                    let messageContent = data.answer;
                    
                    // Solo agregar timestamp de procesamiento si está disponible
                    if (data.processedAt) {
                        const processedTime = new Date(data.processedAt).toLocaleTimeString('es-ES');
                        messageContent += `<div style="text-align: right; margin-top: 10px; font-size: 12px; color: #6b7280;">⏱️ ${processedTime}</div>`;
                    }

                    // Reemplazar mensaje de carga con la respuesta real
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

    const suggestedQuestions = [
        "¿Cuáles son mis restaurantes favoritos y por qué?",
        "¿Con quién he hablado más por teléfono últimamente?",
        "¿Qué películas he visto en el cine este año?",
        "¿Cuánto gasté en comida la semana pasada?",
        "¿Cuáles fueron mis mejores experiencias gastronómicas?",
        "¿A qué amigos veo con más frecuencia?",
        "¿Cuál fue mi actividad más costosa del mes?",
        "¿En qué lugares he estado más veces?",
        "¿Cómo califico mis salidas de entretenimiento?",
        "¿Qué tipo de cocina prefiero cuando salgo?",
        "¿Cuáles son mis horarios más comunes para actividades sociales?",
        "¿Con qué familiares he pasado más tiempo?",
        "¿Qué actividades me dan más energía y satisfacción?",
        "¿Cuáles son mis patrones de gasto en entretenimiento?",
        "¿Qué días de la semana soy más activo socialmente?"
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-t-xl text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <Brain size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Twin Diary Agent</h3>
                        <p className="text-purple-100 text-sm">Analiza e interpreta tus diarios</p>
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
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                                        <span className="text-sm">Buscando en tus diarios y analizando patrones...</span>
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

            {/* Suggested Questions */}
            {messages.length <= 1 && (
                <div className="p-4 border-t bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={16} />
                        Preguntas sugeridas sobre tus actividades:
                    </h4>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {suggestedQuestions.slice(0, 8).map((question, index) => (
                            <button
                                key={index}
                                onClick={() => setNewMessage(question)}
                                className="text-left text-sm p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                            >
                                <span className="text-purple-600 font-medium">
                                    {index < 3 ? '🍽️' : index < 6 ? '📞' : index < 9 ? '🎬' : '💰'}
                                </span> {question}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const randomIndex = Math.floor(Math.random() * suggestedQuestions.length);
                                setNewMessage(suggestedQuestions[randomIndex]);
                            }}
                            className="text-left text-sm p-3 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all"
                        >
                            <span className="text-purple-600 font-medium">🎲</span> Pregunta aleatoria
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Pregúntame sobre tus diarios..."
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
