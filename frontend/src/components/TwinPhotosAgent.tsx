import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Camera, Search, Loader2, Image, Calendar, MapPin, Users, Tag, Trash2, Eye, X, Clock } from 'lucide-react';
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
    const [selectedPhoto, setSelectedPhoto] = useState<PictureFoundResponse | null>(null);
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

    const clearChat = () => {
        setMessages([]);
        setCurrentMessage('');
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
                
                // Mostrar la respuesta HTML del servidor si existe
                if (searchResult.aiResponse?.htmlResponse) {
                    const htmlMessage: ChatMessage = {
                        id: (Date.now()).toString(),
                        type: 'html',
                        content: 'Respuesta de búsqueda:',
                        timestamp: new Date(),
                        htmlContent: searchResult.aiResponse.htmlResponse,
                        searchQuery: searchResult.query
                    };
                    setMessages(prev => [...prev, htmlMessage]);
                }
                
                // Mostrar las fotos encontradas después del HTML
                if (searchResult.aiResponse?.picturesFound && searchResult.aiResponse.picturesFound.length > 0) {
                    const photosMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        type: 'photos',
                        content: `📸 ${searchResult.aiResponse.picturesFound.length} foto${searchResult.aiResponse.picturesFound.length !== 1 ? 's' : ''} encontrada${searchResult.aiResponse.picturesFound.length !== 1 ? 's' : ''}:`,
                        timestamp: new Date(),
                        photos: searchResult.aiResponse.picturesFound,
                        searchQuery: searchResult.query
                    };
                    setMessages(prev => [...prev, photosMessage]);
                }
                
                // Si no hay HTML ni fotos, mostrar mensaje de error
                if (!searchResult.aiResponse?.htmlResponse && (!searchResult.aiResponse?.picturesFound || searchResult.aiResponse.picturesFound.length === 0)) {
                    const noResultsMessage: ChatMessage = {
                        id: (Date.now()).toString(),
                        type: 'system',
                        content: `No encontré fotos relacionadas con: "${currentMessage}"`,
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
        <Card className="h-full max-h-full flex flex-col shadow-lg border-2 border-blue-100">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Camera className="h-6 w-6 text-blue-600" />
                            Twin Fotos Familiares
                        </CardTitle>
                    </div>
                    <Button
                        onClick={clearChat}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        title="Limpiar conversación"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpiar
                    </Button>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                    🤖 Busca y explora tus fotos usando inteligencia artificial
                </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages Area - Altura fija con scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 min-h-0">{messages.map((message) => (
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
                                    <div className="mt-3 space-y-3">
                                        {message.photos.slice(0, 6).map((photo) => (
                                            <div
                                                key={photo.pictureId}
                                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <img
                                                            src={photo.url || photo.path}
                                                            alt={photo.descripcionGenerica || photo.filename}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute -top-1 -right-1">
                                                            <Badge variant="secondary" className="text-xs px-1 py-0">
                                                                {formatSearchScore(photo.searchScore)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-900 mb-1">
                                                                    {photo.filename}
                                                                </div>
                                                                {photo.descripcionGenerica && (
                                                                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                        {photo.descripcionGenerica}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {photo.createdAt && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <Calendar className="w-3 h-3 mr-1" />
                                                                            {new Date(photo.createdAt).toLocaleDateString('es-ES')}
                                                                        </Badge>
                                                                    )}
                                                                    {photo.contextoRecordatorio && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <MapPin className="w-3 h-3 mr-1" />
                                                                            {photo.contextoRecordatorio.substring(0, 30)}...
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                
                                                                {photo.highlights && photo.highlights.length > 0 && (
                                                                    <div className="text-xs text-blue-600 font-medium">
                                                                        🔍 {photo.highlights.slice(0, 2).join(', ')}
                                                                        {photo.highlights.length > 2 && ` +${photo.highlights.length - 2} más`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <Button
                                                                onClick={() => setSelectedPhoto(photo)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="ml-2 flex items-center gap-1"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                Ver detalles
                                                            </Button>
                                                        </div>
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

            {/* Modal de detalles de foto */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b bg-white">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedPhoto.filename}
                                </h3>
                                {selectedPhoto.createdAt && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {new Date(selectedPhoto.createdAt).toLocaleDateString('es-ES')}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={() => setSelectedPhoto(null)}
                                variant="outline"
                                size="sm"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full flex flex-col lg:flex-row">
                                {/* Imagen */}
                                <div className="w-full lg:w-1/2 h-64 lg:h-full bg-gray-100 flex items-center justify-center p-4">
                                    <img
                                        src={selectedPhoto.url || selectedPhoto.path}
                                        alt={selectedPhoto.descripcionGenerica || selectedPhoto.filename}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                    />
                                </div>

                                {/* Detalles */}
                                <div className="flex-1 lg:w-1/2 overflow-y-auto p-4 lg:p-6">
                                    <div className="space-y-4">
                                        {/* Descripción principal */}
                                        {selectedPhoto.descripcionGenerica && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">📸 Descripción</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {selectedPhoto.descripcionGenerica}
                                                </p>
                                            </div>
                                        )}

                                        {/* Contenido detallado */}
                                        {selectedPhoto.pictureContent && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">🔍 Análisis detallado</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {selectedPhoto.pictureContent}
                                                </p>
                                            </div>
                                        )}

                                        {/* Contexto */}
                                        {selectedPhoto.contextoRecordatorio && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">📍 Contexto</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {selectedPhoto.contextoRecordatorio}
                                                </p>
                                            </div>
                                        )}

                                        {/* Highlights */}
                                        {selectedPhoto.highlights && selectedPhoto.highlights.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">✨ Aspectos destacados</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPhoto.highlights.map((highlight, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {highlight}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Información técnica */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Información</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-600 w-24">ID:</span>
                                                    <span className="text-gray-800 text-xs break-all">{selectedPhoto.pictureId}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-600 w-24">Score:</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {formatSearchScore(selectedPhoto.searchScore)}
                                                    </Badge>
                                                </div>
                                                {selectedPhoto.totalTokens && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-600 w-24">Tokens:</span>
                                                        <span className="text-gray-800">{selectedPhoto.totalTokens}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default TwinPhotosAgent;