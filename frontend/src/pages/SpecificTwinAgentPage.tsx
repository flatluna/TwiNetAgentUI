import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Send, RotateCcw, X } from 'lucide-react';
import Logo from '../assets/Logo.png';
import { useTwinId } from '../hooks/useTwinId';

interface PhotoRecord {
  id: string;
  filename: string;
  path: string;
  pictureContent: string;
  pictureContentHTML: string;
  yourResponse: string;
  twinID: string;
  pictureURL: string;
}

interface AgentInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
  purpose: string;
  instructions: string;
}

const SpecificTwinAgentPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { twinId } = useTwinId();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [photoGallery, setPhotoGallery] = useState<PhotoRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [serializedThread, setSerializedThread] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent configurations
  const agentConfigs: Record<string, AgentInfo> = {
    'family-photos': {
      id: 'family-photos',
      title: 'Fotos Familiares',
      description: 'Explora y analiza tus recuerdos familiares',
      icon: '📸',
      bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      textColor: 'text-white',
      purpose: 'Analizar y describir fotos familiares con contexto emocional',
      instructions: 'Este agente se especializa en analizar fotos familiares...'
    },
    'personal-data': {
      id: 'personal-data',
      title: 'Datos Personales',
      description: 'Gestiona tu información personal y perfil',
      icon: '👤',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-700',
      textColor: 'text-white',
      purpose: 'Gestionar y analizar información personal del usuario',
      instructions: 'Este agente ayuda con la gestión de datos personales, información de perfil y documentación personal.'
    },
    'family': {
      id: 'family',
      title: 'Mi Familia',
      description: 'Información y datos de tu familia',
      icon: '👨‍👩‍👧‍👦',
      bgColor: 'bg-gradient-to-r from-pink-500 to-pink-700',
      textColor: 'text-white',
      purpose: 'Gestionar información familiar y relaciones',
      instructions: 'Este agente se especializa en información familiar, árbol genealógico y relaciones familiares.'
    },
    'contacts': {
      id: 'contacts',
      title: 'Contactos',
      description: 'Gestiona tu red de contactos',
      icon: '📞',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-700',
      textColor: 'text-white',
      purpose: 'Organizar y gestionar contactos personales y profesionales',
      instructions: 'Este agente ayuda a gestionar tu red de contactos, información de contacto y relaciones profesionales.'
    },
    'structured-docs': {
      id: 'structured-docs',
      title: 'Documentos Estructurados',
      description: 'Archivos personales bien organizados',
      icon: '📄',
      bgColor: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
      textColor: 'text-white',
      purpose: 'Gestionar documentos estructurados y archivos organizados',
      instructions: 'Este agente se especializa en documentos con formato estructurado como CSV, Excel y bases de datos.'
    },
    'memories': {
      id: 'memories',
      title: 'Mis Memorias',
      description: 'Recuerdos y experiencias personales',
      icon: '🧠',
      bgColor: 'bg-gradient-to-r from-rose-500 to-rose-700',
      textColor: 'text-white',
      purpose: 'Gestionar y analizar memorias y experiencias personales',
      instructions: 'Este agente ayuda a organizar recuerdos, experiencias significativas y momentos importantes de tu vida.'
    }
  };

  useEffect(() => {
    if (agentId && agentConfigs[agentId]) {
      setAgentInfo(agentConfigs[agentId]);
      // Limpiar conversación y thread al cambiar de agente
      setMessages([]);
      setSerializedThread(null);
      setPhotoGallery([]);
    } else {
      navigate('/twin-agents-network');
    }
  }, [agentId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const goBack = () => {
    navigate('/twin-agents-network');
  };

  const clearChat = () => {
    setMessages([]);
    setPhotoGallery([]);
    setSerializedThread(null); // Limpiar también el thread
  };

  const openPhotoModal = (photo: PhotoRecord) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const deletePhoto = async (photo: PhotoRecord) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${photo.filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:7011/api/twins/${photo.twinID}/family/${photo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPhotoGallery(prev => prev.filter(p => p.id !== photo.id));
        if (selectedPhoto?.id === photo.id) {
          closePhotoModal();
        }
        alert('Foto eliminada correctamente.');
      } else {
        throw new Error('Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto. Por favor intenta de nuevo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !agentInfo) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      if (agentInfo.id === 'family-photos') {
        console.log('📸 Calling AskTwinFamilyPicturesQuestion with:', {
          twinId, 
          language: 'es', 
          question: userMessage
        });
        
        const response = await fetch('/agents-api/twin-family-pictures/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twinId: twinId,
            language: 'es',
            question: userMessage
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📤 ESTRUCTURA COMPLETA DE LA RESPUESTA:', data);
        
        // Usar el casing correcto (camelCase)
        const responseContent = data.lastAssistantResponse || 
                               data.lastResponse || 
                               data.message || 
                               'Respuesta procesada correctamente.';
        
        console.log('🎯 CONTENIDO RAW:', responseContent);
        
        // Parsear el JSON que contiene las fotos
        let photosArray = [];
        let displayMessage = responseContent;
        
        try {
          if (responseContent && typeof responseContent === 'string' && responseContent.startsWith('[')) {
            photosArray = JSON.parse(responseContent);
            console.log('📸 FOTOS PARSEADAS:', photosArray);
            
            // Crear mensaje de resumen
            if (photosArray.length > 0) {
              displayMessage = `Encontré ${photosArray.length} foto(s) de Tobi. Haz clic en las miniaturas para ver los detalles.`;
            }
          }
        } catch (parseError) {
          console.error('Error parseando JSON de fotos:', parseError);
        }
        
        const assistantMessage = {
          role: 'assistant',
          content: displayMessage,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Actualizar galería con las fotos encontradas
        if (photosArray.length > 0) {
          // Mapear al formato PhotoRecord que espera el componente
          const mappedPhotos = photosArray.map((photo: any) => ({
            id: photo.id,
            filename: photo.filename,
            path: photo.path,
            pictureContent: photo.pictureContent || '',
            pictureContentHTML: photo.pictureContentHTML || '',
            yourResponse: photo.yourResponse || '',
            twinID: photo.twinID || '',
            pictureURL: photo.pictureURL || ''
          }));
          
          console.log('🖼️ FOTOS MAPEADAS PARA GALERÍA:', mappedPhotos);
          setPhotoGallery(mappedPhotos);
        }

        // Si hay mensajes en la conversación, también los podríamos mostrar
        if (data.Messages && Array.isArray(data.Messages)) {
          console.log('💬 Mensajes de la conversación:', data.Messages);
        }
      } else if (agentInfo.id === 'personal-data') {
        console.log('👤 Calling personal data agent with:', {
          twinId, 
          language: 'es', 
          question: userMessage
        });
        
        const response = await fetch('/agents-api/twin-personal/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twinId: twinId,
            language: 'es',
            question: userMessage,
            serializedThreadJson: serializedThread // Usar el thread guardado o null
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📤 RESPUESTA DATOS PERSONALES:', data);
        
        // Guardar el thread serializado para la próxima conversación
        if (data.serializedThreadJson) {
          setSerializedThread(data.serializedThreadJson);
          console.log('🧵 Thread guardado para próxima conversación');
        }
        
        const responseContent = data.lastAssistantResponse || 
                               data.lastResponse || 
                               data.message || 
                               'Información de datos personales procesada correctamente.';
        
        const assistantMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else if (agentInfo.id === 'family') {
        console.log('👨‍👩‍👧‍👦 Calling family agent with:', {
          twinId, 
          language: 'Español', 
          question: userMessage
        });
        
        const response = await fetch('/agents-api/twin-family/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twinId: twinId,
            language: 'Español',
            question: userMessage,
            serializedThreadJson: serializedThread // Usar el thread guardado o null
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📤 RESPUESTA FAMILIA:', data);
        
        // Guardar el thread serializado para la próxima conversación
        if (data.serializedThreadJson) {
          setSerializedThread(data.serializedThreadJson);
          console.log('🧵 Thread guardado para próxima conversación');
        }
        
        const responseContent = data.lastAssistantResponse || 
                               data.lastResponse || 
                               data.message || 
                               'Información familiar procesada correctamente.';
        
        const assistantMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else if (agentInfo.id === 'contacts') {
        console.log('📞 Calling contacts agent with:', {
          twinId, 
          language: 'Español', 
          question: userMessage
        });
        
        const response = await fetch('/agents-api/twin-contacts/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twinId: twinId,
            language: 'Español',
            question: userMessage,
            serializedThreadJson: serializedThread // Usar el thread guardado o null
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📤 RESPUESTA CONTACTOS:', data);
        
        // Guardar el thread serializado para la próxima conversación
        if (data.serializedThreadJson) {
          setSerializedThread(data.serializedThreadJson);
          console.log('🧵 Thread guardado para próxima conversación');
        }
        
        const responseContent = data.lastAssistantResponse || 
                               data.lastResponse || 
                               data.message || 
                               'Información de contactos procesada correctamente.';
        
        const assistantMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Para otros agentes, usar un endpoint genérico o mostrar mensaje de desarrollo
        console.log(`🔧 Agente ${agentInfo.id} en desarrollo`);
        
        const assistantMessage = {
          role: 'assistant',
          content: `Hola, soy tu agente de ${agentInfo.title}. Esta funcionalidad está en desarrollo. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!agentInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">🤖</div>
          <div className="text-lg font-semibold text-gray-700">Cargando agente...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50 w-full overflow-hidden">
      {/* Main Chat Area */}
      <div className={`flex flex-col min-w-0 ${agentInfo.id === 'family-photos' ? 'w-[28rem]' : 'flex-1'}`}>
        {/* Header */}
        <div className={`${agentInfo.bgColor} ${agentInfo.textColor} p-3 md:p-4 shadow-lg flex-shrink-0`}>
          <div className="w-full max-w-none px-2 md:px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <Button
                  onClick={goBack}
                  variant="ghost"
                  size="sm"
                  className="mr-2 md:mr-3 text-white hover:bg-white/20 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
                <img 
                  src={Logo} 
                  alt="TwinAgent" 
                  className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 rounded-full bg-white p-1 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-bold truncate">
                    <span className="hidden sm:inline">Agente: </span>{agentInfo.title}
                  </h1>
                  <p className="text-xs opacity-90 truncate hidden md:block">{agentInfo.description}</p>
                </div>
              </div>
              <Button
                onClick={clearChat}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 flex-shrink-0 ml-2"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">{agentInfo.icon}</div>
              <div className="text-lg font-semibold mb-2">¡Hola! Soy tu {agentInfo.title}</div>
              <div className="text-sm text-gray-400 max-w-md mx-auto">{agentInfo.description}</div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t bg-white p-3 md:p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Escribe tu mensaje para ${agentInfo.title}...`}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Photos Sidebar - Only for family-photos agent */}
      {agentInfo.id === 'family-photos' && (
        <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">📸</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Galería Familiar
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {photoGallery.length} recuerdo{photoGallery.length !== 1 ? 's' : ''} especial{photoGallery.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {photoGallery.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📸</div>
                <div className="text-lg font-semibold mb-2">No hay fotos disponibles</div>
                <div className="text-sm text-gray-400">Haz una pregunta para buscar fotos familiares</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photoGallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                    onClick={() => openPhotoModal(photo)}
                  >
                    {/* Imagen */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={photo.pictureURL}
                        alt={photo.filename}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        ID: {photo.id.slice(0, 8)}...
                      </div>
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        📸
                      </div>
                    </div>
                    
                    {/* Contenido del card */}
                    <div className="p-4">
                      {/* Nombre del archivo */}
                      <h3 className="font-bold text-gray-800 text-sm mb-2 truncate">
                        📁 {photo.filename}
                      </h3>
                      
                      {/* Respuesta del AI */}
                      {photo.yourResponse && (
                        <div className="mb-3">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                🤖 AI Analysis
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {photo.yourResponse}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Botón para ver más */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Haz clic para ver detalles
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Ver más</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para mostrar foto ampliada y contenido HTML */}
      {isModalOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closePhotoModal}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center truncate mr-4">
                <span className="text-lg sm:text-xl lg:text-2xl mr-2 sm:mr-3">🖼️</span>
                <span className="truncate">{selectedPhoto.filename}</span>
              </h2>
              <button
                onClick={closePhotoModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200 flex-shrink-0 bg-white shadow-sm border border-gray-200"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex flex-col max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
              {/* Imagen - arriba */}
              <div className="p-3 sm:p-4 lg:p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] max-h-[250px] sm:max-h-[350px] lg:max-h-[400px]">
                <img 
                  src={selectedPhoto.pictureURL} 
                  alt={selectedPhoto.filename}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
              
              {/* Contenido HTML - abajo */}
              <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-white">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <span className="text-base sm:text-lg mr-2">📝</span>
                  Descripción Detallada
                </h3>
                
                {selectedPhoto.pictureContentHTML ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPhoto.pictureContentHTML }}
                  />
                ) : selectedPhoto.yourResponse ? (
                  <div className="text-gray-700 leading-relaxed">
                    <p>{selectedPhoto.yourResponse}</p>
                  </div>
                ) : selectedPhoto.pictureContent ? (
                  <div className="text-gray-700 leading-relaxed">
                    <p>{selectedPhoto.pictureContent}</p>
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center py-8">
                    <p>No hay descripción disponible para esta imagen.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer del modal */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => deletePhoto(selectedPhoto)}
                className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center"
              >
                <span className="mr-1">🗑️</span>
                Eliminar
              </button>
              <button
                onClick={closePhotoModal}
                className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificTwinAgentPage;