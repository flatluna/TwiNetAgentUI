import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Camera, Search, Loader2, Image, Calendar, MapPin, Users, Tag } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import twinApiService, { PictureFoundResponse, FamilyPhotosSearchResult } from '@/services/twinApiService';

interface TwinPhotosAgentProps {
    onPhotoClick?: (photo: PictureFoundResponse) => void;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'system' | 'photos' | 'html';
    content: string;
    timestamp: Date;
    photos?: PictureFoundResponse[];
    htmlContent?: string;
    searchQuery?: string;
}

const TwinPhotosAgent: React.FC<TwinPhotosAgentProps> = ({ onPhotoClick }) => {
    const { accounts } = useMsal();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!currentMessage.trim() || isLoading) return;

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID available');
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: currentMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        try {
            console.log('🔍 Searching photos with query:', currentMessage);
            
            const response = await twinApiService.searchFamilyPictures(twinId, currentMessage.trim());

            if (response.success && response.data) {
                const searchResult = response.data;
                
                // Mostrar primero el HTML response si existe
                if (searchResult.aiResponse?.htmlResponse) {
                    const htmlMessage: ChatMessage = {
                        id: (Date.now()).toString(),
                        type: 'html',
                        content: 'Análisis de IA sobre tus fotos:',
                        timestamp: new Date(),
                        htmlContent: searchResult.aiResponse.htmlResponse,
                        searchQuery: searchResult.query
                    };
                    setMessages(prev => [...prev, htmlMessage]);
                }
                
                // Luego mostrar las fotos encontradas
                if (searchResult.aiResponse?.picturesFound && searchResult.aiResponse.picturesFound.length > 0) {
                    const photosMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        type: 'photos',
                        content: `Encontré ${searchResult.aiResponse.picturesFound.length} foto${searchResult.aiResponse.picturesFound.length !== 1 ? 's' : ''} relacionada${searchResult.aiResponse.picturesFound.length !== 1 ? 's' : ''} con: "${searchResult.query}"`,
                        timestamp: new Date(),
                        photos: searchResult.aiResponse.picturesFound,
                        searchQuery: searchResult.query
                    };
                    setMessages(prev => [...prev, photosMessage]);
                } else {
                    const noResultsMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        type: 'system',
                        content: `No encontré fotos relacionadas con: "${currentMessage}"\n\nIntenta con términos diferentes como:\n• Ubicaciones (playa, casa, parque)\n• Personas (familia, niños, amigos)\n• Eventos (cumpleaños, navidad, vacaciones)\n• Objetos (coche, mascota, juguetes)`,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, noResultsMessage]);
                }
            } else {
                throw new Error(response.error || 'Error en la búsqueda');
            }
        } catch (error) {
            console.error('❌ Error searching photos:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'system',
                content: '❌ Hubo un error al buscar las fotos. Por favor, inténtalo de nuevo.',
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

    const formatSearchScore = (score: number): string => {
        return `${Math.round(score * 100)}%`;
    };

    const getSearchTypeColor = (searchType: string): string => {
        switch (searchType.toLowerCase()) {
            case 'semantic': return 'bg-purple-100 text-purple-800';
            case 'keyword': return 'bg-blue-100 text-blue-800';
            case 'hybrid': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="h-[calc(100vh-6rem)] min-h-[600px] flex flex-col shadow-lg border-2 border-blue-100">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Camera className="h-6 w-6 text-blue-600" />
                    Twin Fotos Familiares
                </CardTitle>
                <p className="text-sm text-gray-600 font-medium">
                    🤖 Busca y explora tus fotos usando inteligencia artificial
                </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area - Increased height */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 min-h-[600px]">{messages.map((message) => (
                        <div key={message.id} className={`${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                            <div className={`rounded-xl p-4 shadow-sm ${
                                message.type === 'user' 
                                    ? 'bg-blue-600 text-white ml-auto max-w-[85%]' 
                                    : message.type === 'system'
                                    ? 'bg-white text-gray-800 border border-gray-200'
                                    : 'bg-white text-gray-800 border border-blue-200'
                            }`}>
                                <div className="text-sm font-medium whitespace-pre-wrap">{message.content}</div>
                                
                                {/* HTML Content */}
                                {message.htmlContent && (
                                    <div 
                                        className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                                        dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                                    />
                                )}
                                
                                {/* Photos Grid */}
                                {message.photos && message.photos.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {message.photos.slice(0, 6).map((photo) => (
                                            <div
                                                key={photo.pictureId}
                                                className="bg-white rounded-lg p-3 border cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => onPhotoClick?.(photo)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="relative w-16 h-16 flex-shrink-0">
                                                        <img
                                                            src={photo.path}
                                                            alt={photo.descripcionGenerica || photo.filename}
                                                            className="w-full h-full object-cover rounded"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute -top-1 -right-1">
                                                            <Badge variant="secondary" className="text-xs px-1 py-0">
                                                                {formatSearchScore(photo.searchScore)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">
                                                            {photo.filename}
                                                        </div>
                                                        {photo.descripcionGenerica && (
                                                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                {photo.descripcionGenerica}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {photo.createdAt && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Calendar className="w-3 h-3 mr-1" />
                                                                    {new Date(photo.createdAt).toLocaleDateString('es-ES')}
                                                                </Badge>
                                                            )}
                                                            {photo.contextoRecordatorio && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {photo.contextoRecordatorio}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        {photo.highlights && photo.highlights.length > 0 && (
                                                            <div className="text-xs text-purple-600 mt-1 font-medium">
                                                                {photo.highlights.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {message.photos.length > 6 && (
                                            <div className="text-center text-xs text-gray-500 pt-2">
                                                Y {message.photos.length - 6} foto{message.photos.length - 6 !== 1 ? 's' : ''} más...
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="text-xs opacity-70 mt-2">
                                    {message.timestamp.toLocaleTimeString('es-ES', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="mr-8">
                            <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Buscando fotos...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-6 bg-white">
                    <div className="flex gap-3">
                        <Input
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="🔍 Busca fotos: 'navidad 2023', 'fotos con niños', 'playa'..."
                            disabled={isLoading}
                            className="flex-1 h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!currentMessage.trim() || isLoading}
                            size="lg"
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                        Pregunta sobre tus fotos usando lenguaje natural
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TwinPhotosAgent;