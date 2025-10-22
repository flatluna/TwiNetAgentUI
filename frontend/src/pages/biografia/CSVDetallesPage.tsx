import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Database, Calendar, RefreshCw, Download, Trash2, Send, Bot } from 'lucide-react';
import { documentApiService } from '../../services/documentApiService';
import { useMsal } from '@azure/msal-react';
import DOMPurify from 'dompurify';

const CSVDetallesPage: React.FC = () => {
  const navigate = useNavigate();
  const { csvId } = useParams<{ csvId: string }>();
  const { accounts } = useMsal();
  
  // Función para detectar si el contenido es HTML
  const isHtmlContent = (content: string): boolean => {
    return /<[a-z][\s\S]*>/i.test(content);
  };

  // Función para renderizar contenido (HTML o texto plano)
  const renderMessageContent = (content: string) => {
    if (isHtmlContent(content)) {
      // Si es HTML, sanitizarlo y renderizarlo
      const sanitizedHTML = DOMPurify.sanitize(content);
      return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    } else {
      // Si es texto plano, renderizarlo normalmente
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }
  };
  
  // Estados
  const [csvData, setCsvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para Twin Agent CSV
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [csvFileId, setCsvFileId] = useState<string | null>(null);

  // Obtener Twin ID del usuario actual
  const twinId = accounts && accounts.length > 0 ? accounts[0].localAccountId : null;

  // Cargar datos del CSV específico
  useEffect(() => {
    if (twinId && csvId) {
      cargarCSVDetalles();
    }
  }, [twinId, csvId]);

  const cargarCSVDetalles = async () => {
    if (!twinId || !csvId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Cargando detalles completos del CSV: ${csvId}`);
      
      // Usar el nuevo método específico que obtiene solo el archivo solicitado con todos sus datos
      const csvFile = await documentApiService.getCSVFileById(twinId, csvId);
      
      if (csvFile) {
        setCsvData(csvFile);
        console.log(`✅ CSV encontrado:`, csvFile.FileName);
      } else {
        setError('Archivo CSV no encontrado');
      }
    } catch (error) {
      console.error('❌ Error cargando detalles del CSV:', error);
      setError(`Error cargando detalles: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el Twin Agent CSV
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAiThinking || !twinId) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage('');
    setIsAiThinking(true);

    try {
      // Log para debugging del FileID
      console.log('🔍 Estado actual de csvFileId:', csvFileId);
      console.log('🔍 Enviando FileID al servicio:', csvFileId || "");
      
      // Llamar al servicio real de análisis CSV con Azure AI Agent
      // Si tenemos csvFileId, lo pasamos para optimizar la carga del archivo
      const analysisResult = await documentApiService.analyzeCSVFile(
        twinId,
        csvData.FileName,
        question,
        csvFileId || ""
      );

      // Capturar FileID de la respuesta para optimizar futuras consultas
      const responseFileID = analysisResult.analysisResult?.fileID;
      console.log('🔍 FileID desde analysisResult.analysisResult.fileID:', responseFileID);
      console.log('🔍 FileID actual en estado:', csvFileId);
      
      if (responseFileID && !csvFileId) {
        setCsvFileId(responseFileID);
        console.log('🆔 FileID capturado para optimización:', responseFileID);
      } else if (responseFileID && csvFileId) {
        console.log('⚠️ Ya teníamos FileID, no se sobrescribe:', csvFileId);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: analysisResult.analysisResult?.aiResponse || 'Lo siento, no pude procesar tu consulta en este momento.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ Error en análisis CSV:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `Lo siento, ocurrió un error al analizar el CSV: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta con otra pregunta.`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-green-600 animate-spin mr-3" />
            <p className="text-gray-600">Cargando detalles del archivo CSV...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/twin-biografia/archivos-personales/estructurados/csv')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a CSV
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={cargarCSVDetalles}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!csvData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/twin-biografia/archivos-personales/estructurados/csv')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a CSV
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No se encontraron datos del archivo CSV</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/twin-biografia/archivos-personales/estructurados/csv')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4 lg:mr-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Volver a CSV</span>
              </button>
              
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {csvData.FileName}
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  {csvData.TotalRows || 0} filas × {csvData.TotalColumns || 0} columnas
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 lg:space-x-3">
              <button
                onClick={() => {
                  console.log('Descargar CSV:', csvData.FileName);
                }}
                className="flex items-center px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
              >
                <Download className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Descargar</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('Eliminar CSV:', csvData.FileName);
                }}
                className="flex items-center px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base"
              >
                <Trash2 className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Layout de 2 columnas responsive */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* COLUMNA 1: Datos del CSV */}
          <div className="space-y-6 xl:max-h-[calc(100vh-200px)] xl:overflow-y-auto">
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Filas</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{csvData.TotalRows?.toLocaleString() || '0'}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Columnas</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{csvData.TotalColumns || 0}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Procesado</span>
                </div>
                <p className="text-sm font-bold text-purple-900">
                  {csvData.ProcessedAt ? new Date(csvData.ProcessedAt).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${csvData.Success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${csvData.Success ? 'text-green-800' : 'text-red-800'}`}>Estado</span>
                </div>
                <p className={`text-sm font-bold ${csvData.Success ? 'text-green-900' : 'text-red-900'}`}>
                  {csvData.Success ? 'Procesado OK' : 'Error'}
                </p>
              </div>
            </div>

            {/* Grid de datos CSV */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Datos del CSV
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        #
                      </th>
                      {(csvData.ColumnNames || []).map((column: string, index: number) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(csvData.Records || []).map((record: any, rowIndex: number) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50">
                          {rowIndex + 1}
                        </td>
                        {(csvData.ColumnNames || []).map((column: string, colIndex: number) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                            title={record.data?.[column] || record.Data?.[column] || ''}
                          >
                            <div className="max-w-xs truncate">
                              {record.data?.[column] || record.Data?.[column] || ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    Archivo: {csvData.FilePath}
                  </div>
                  <div>
                    Total registros: {csvData.TotalRows?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* COLUMNA 2: Twin Agent CSV */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
              
              {/* Header del chat */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-2 mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Twin Agent CSV</h3>
                    <p className="text-sm text-gray-600">Analiza {csvData.FileName} con Azure AI + Code Interpreter</p>
                  </div>
                </div>
              </div>

              {/* Área de mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">¡Hola! Soy tu Twin Agent CSV</h4>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Uso <strong>Azure AI + Code Interpreter</strong> para analizar <strong>{csvData.FileName}</strong> ({csvData.TotalRows} filas × {csvData.TotalColumns} columnas). 
                      Puedo crear gráficos, estadísticas, filtros y análisis avanzados.
                    </p>
                    <div className="grid grid-cols-1 gap-3 max-w-md mx-auto text-left">
                      <button
                        onClick={() => setInputMessage("¿Cuál es el total de Cost Pesos?")}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition-colors"
                      >
                        <p className="text-sm text-gray-700">💡 "¿Cuál es el total de Cost Pesos?"</p>
                      </button>
                      <button
                        onClick={() => setInputMessage("Muestra los 5 items más caros y crea una tabla")}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition-colors"
                      >
                        <p className="text-sm text-gray-700">📊 "Muestra los 5 items más caros y crea una tabla"</p>
                      </button>
                      <button
                        onClick={() => setInputMessage("Analiza las diferencias entre Cost Pesos y Cost US, hay algún patrón?")}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition-colors"
                      >
                        <p className="text-sm text-gray-700">🔍 "Analiza las diferencias entre Cost Pesos y Cost US"</p>
                      </button>
                      <button
                        onClick={() => setInputMessage("Crea un gráfico de barras con los items y sus costos")}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition-colors"
                      >
                        <p className="text-sm text-gray-700">📈 "Crea un gráfico de barras con los items y sus costos"</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-2xl ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md' 
                          : 'bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md border border-gray-200'
                      } px-4 py-3`}>
                        {message.type === 'assistant' && (
                          <div className="flex items-center mb-2">
                            <Bot className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">Twin Agent CSV</span>
                          </div>
                        )}
                        {renderMessageContent(message.content)}
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md border border-gray-200 px-4 py-3 max-w-xs">
                      <div className="flex items-center mb-2">
                        <Bot className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Twin Agent CSV</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">Analizando datos...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de mensajes */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Pregunta sobre los datos del CSV..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    disabled={isAiThinking}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isAiThinking}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Enter para enviar • Shift+Enter para nueva línea</span>
                    <span className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      Azure AI + Code Interpreter
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CSVDetallesPage;