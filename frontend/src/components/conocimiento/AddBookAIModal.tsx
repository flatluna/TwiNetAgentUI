import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Book, BookAIResponse, mapBookAIResponseToBook } from '../../types/conocimiento';
import { getCurrentTwinId } from '../../hooks/useTwinId';

interface AddBookAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: Book) => void;
}

export const AddBookAIModal: React.FC<AddBookAIModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const [bookName, setBookName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Partial<Book> | null>(null);

  const handleAnalyzeBook = async () => {
    if (!bookName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener el twinId del usuario actual
      const twinId = getCurrentTwinId();
      if (!twinId) {
        throw new Error('No se pudo obtener el identificador del usuario');
      }
      
      // Llamada directa al backend en puerto 7011 (temporal)
      const response = await fetch(`http://localhost:7011/api/twins/searchbook/${twinId}/books?question=${encodeURIComponent(bookName.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock temporal para testing - eliminar cuando el backend esté listo
      if (!response.ok && response.status === 404) {
        throw new Error('El endpoint de búsqueda de libros no está disponible en el backend. Contacta al administrador del sistema.');
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const backendResponse = await response.json();
      
      // Verificar si la respuesta del backend es exitosa (nueva estructura)
      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Error en el servidor');
      }

      // Parsear la información del libro desde la nueva estructura
      let bookInfo;
      try {
        bookInfo = JSON.parse(backendResponse.data.bookInformation);
      } catch (error) {
        throw new Error('Error al procesar la información del libro');
      }

      // Mapear la respuesta real del backend a nuestro formato Book
      const bookData: Book = {
        id: Date.now().toString(),
        titulo: bookInfo.INFORMACIÓN_TÉCNICA?.Título_en_español || bookInfo.INFORMACIÓN_TÉCNICA?.Título_original || bookName,
        autor: bookInfo.INFORMACIÓN_TÉCNICA?.Autor || 'Autor desconocido',
        isbn: Array.isArray(bookInfo.INFORMACIÓN_TÉCNICA?.ISBN) ? bookInfo.INFORMACIÓN_TÉCNICA.ISBN[0] : bookInfo.INFORMACIÓN_TÉCNICA?.ISBN || '',
        fechaLectura: '',
        fechaInicio: '',
        fechaFin: '',
        genero: bookInfo.CONTENIDO_Y_TESIS_PRINCIPAL?.Conceptos_principales?.[0] || 'Otros',
        paginas: parseInt(bookInfo.INFORMACIÓN_TÉCNICA?.Páginas) || 0,
        editorial: bookInfo.INFORMACIÓN_TÉCNICA?.Editorial_principal || '',
        añoPublicacion: parseInt(bookInfo.INFORMACIÓN_TÉCNICA?.Primera_publicación) || new Date().getFullYear(),
        idioma: bookInfo.INFORMACIÓN_TÉCNICA?.Idioma_original || 'Español',
        formato: bookInfo.INFORMACIÓN_TÉCNICA?.Formatos?.[0] || 'Físico',
        estado: 'Por leer' as BookStatus,
        calificacion: 0,
        portada: bookInfo.INFORMACIÓN_PRÁCTICA?.portadaURL?.[0] || '',
        notas: [],
        opiniones: backendResponse.data.answer || '',
        recomendado: false,
        prestadoA: '',
        fechaPrestamo: '',
        descripcion: bookInfo.DescripcionAI || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        datosIA: {
          informacionTecnica: bookInfo.INFORMACIÓN_TÉCNICA || {},
          reseñasCriticas: bookInfo.RESEÑAS_CRÍTICAS || {},
          contenidoTesis: bookInfo.CONTENIDO_Y_TESIS_PRINCIPAL || {},
          recepcionGeneral: bookInfo.RECEPCIÓN_GENERAL || {},
          informacionPractica: bookInfo.INFORMACIÓN_PRÁCTICA || {},
          descripcionAI: bookInfo.DescripcionAI || '',
          detailHTMLReport: bookInfo.detailHTMLReport || '',
          processingTimeMs: backendResponse.ProcessingTimeMs || 0,
          processedAt: backendResponse.ProcessedAt || new Date().toISOString()
        }
      };
      
      setPreviewData(bookData);
    } catch (error) {
      console.error('Error al analizar libro:', error);
      
      // Manejo específico de errores
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('endpoint')) {
          setError('El servicio de búsqueda inteligente de libros no está disponible. Por favor, usa la opción "Manual" para agregar libros.');
        } else if (error.message.includes('Failed to fetch')) {
          setError('No se puede conectar con el servidor. Verifica tu conexión a internet.');
        } else if (error.message.includes('500')) {
          setError('Error interno del servidor. Intenta nuevamente en unos momentos.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError('Error inesperado. Por favor, usa la opción "Manual" para agregar libros.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (previewData && previewData.titulo && previewData.autor) {
      const completeBook: Book = {
        id: previewData.id || Date.now().toString(),
        titulo: previewData.titulo,
        autor: previewData.autor,
        isbn: previewData.isbn,
        fechaLectura: previewData.fechaLectura,
        fechaInicio: previewData.fechaInicio,
        fechaFin: previewData.fechaFin,
        genero: previewData.genero || 'Otro',
        paginas: previewData.paginas,
        editorial: previewData.editorial,
        añoPublicacion: previewData.añoPublicacion,
        idioma: previewData.idioma || 'Español',
        formato: previewData.formato || 'Físico',
        estado: previewData.estado || 'Por leer',
        calificacion: previewData.calificacion,
        portada: previewData.portada,
        notas: previewData.notas || [],
        opiniones: previewData.opiniones || '',
        recomendado: previewData.recomendado || false,
        tags: previewData.tags || [],
        ubicacion: previewData.ubicacion,
        prestado: previewData.prestado || false,
        prestadoA: previewData.prestadoA,
        fechaPrestamo: previewData.fechaPrestamo,
        descripcion: previewData.descripcion,
        createdAt: previewData.createdAt || new Date().toISOString(),
        updatedAt: previewData.updatedAt || new Date().toISOString(),
        datosIA: previewData.datosIA,
      };

      onBookAdded(completeBook);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setBookName('');
    setPreviewData(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && bookName.trim()) {
      handleAnalyzeBook();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤖 Agregar Libro con IA
          </DialogTitle>
          <DialogDescription>
            Ingresa el nombre del libro y nuestra IA buscará toda la información automáticamente
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          💡 <strong>Información:</strong> Accede desde{' '}
          <code className="bg-blue-100 px-1 rounded">http://127.0.0.1:5173</code>
          {' '}(modo desarrollo con datos mock hasta que el backend implemente el endpoint)
        </div>

        <div className="space-y-6 mt-4">
          {/* Input para el nombre del libro */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Libro
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: Cien años de soledad, El Quijote, 1984..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  disabled={isLoading}
                />
                <button
                  onClick={handleAnalyzeBook}
                  disabled={!bookName.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Buscando...
                    </div>
                  ) : (
                    'Buscar con IA'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Consejo: Incluye el autor si hay libros con títulos similares
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview de la información encontrada */}
          {previewData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <h3 className="text-lg font-semibold text-gray-800">Información Encontrada</h3>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Título</h4>
                    <p className="text-gray-600">{previewData.titulo}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Autor</h4>
                    <p className="text-gray-600">{previewData.autor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Género</h4>
                    <p className="text-gray-600">{previewData.genero}</p>
                  </div>
                  {previewData.añoPublicacion && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Año de Publicación</h4>
                      <p className="text-gray-600">{previewData.añoPublicacion}</p>
                    </div>
                  )}
                  {previewData.editorial && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Editorial</h4>
                      <p className="text-gray-600">{previewData.editorial}</p>
                    </div>
                  )}
                  {previewData.paginas && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Páginas</h4>
                      <p className="text-gray-600">{previewData.paginas}</p>
                    </div>
                  )}
                  {previewData.idioma && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Idioma</h4>
                      <p className="text-gray-600">{previewData.idioma}</p>
                    </div>
                  )}
                  {previewData.isbn && (
                    <div>
                      <h4 className="font-semibold text-gray-700">ISBN</h4>
                      <p className="text-gray-600">{previewData.isbn}</p>
                    </div>
                  )}
                </div>

                {previewData.descripcion && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Descripción</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{previewData.descripcion}</p>
                  </div>
                )}

                {previewData.tags && previewData.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {previewData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">💡</span>
                    <h4 className="font-semibold text-blue-800">¿Qué puedes hacer después?</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Editar cualquier información si es necesario</li>
                    <li>• Agregar tu puntuación y notas personales</li>
                    <li>• Cambiar el estado de lectura</li>
                    <li>• Establecer fecha de lectura</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            
            {previewData && (
              <button
                onClick={handleConfirmAdd}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Agregar a Mi Biblioteca
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};