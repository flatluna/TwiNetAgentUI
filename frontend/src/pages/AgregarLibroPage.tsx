import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bot, Save, Loader2, Sparkles, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Book } from '@/types/conocimiento';
import { useMsal } from '@azure/msal-react';

const AgregarLibroPage = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [selectedMethod, setSelectedMethod] = useState<'manual' | 'ai' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Función para obtener el TwinId real del usuario autenticado
  const getTwinId = (): string | null => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    if (account?.localAccountId) {
      return account.localAccountId;
    }
    return null;
  };

  // Estados para formulario manual
  const [manualData, setManualData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    genero: '',
    paginas: '',
    editorial: '',
    añoPublicacion: '',
    idioma: 'Español',
    formato: 'Físico',
    estado: 'Por leer',
    descripcion: '',
    opiniones: ''
  });

  // Estados para formulario IA
  const [bookName, setBookName] = useState('');
  const [aiData, setAiData] = useState<Book | null>(null);

  // Manejar cambios en formulario manual
  const handleManualChange = (field: string, value: string) => {
    setManualData(prev => ({ ...prev, [field]: value }));
  };

  // Guardar libro manual
  const handleSaveManual = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!manualData.titulo || !manualData.autor) {
        throw new Error('Título y autor son campos requeridos');
      }

      const twinId = getTwinId();
      if (!twinId) {
        throw new Error('No se pudo obtener el identificador del usuario. Por favor, inicia sesión nuevamente.');
      }

      const newBook: Book = {
        id: Date.now().toString(),
        titulo: manualData.titulo,
        autor: manualData.autor,
        isbn: manualData.isbn,
        fechaLectura: '',
        fechaInicio: '',
        fechaFin: '',
        genero: manualData.genero,
        paginas: parseInt(manualData.paginas) || 0,
        editorial: manualData.editorial,
        añoPublicacion: parseInt(manualData.añoPublicacion) || new Date().getFullYear(),
        idioma: manualData.idioma,
        formato: manualData.formato as 'Físico' | 'Digital' | 'Audiolibro',
        estado: manualData.estado as 'Por leer' | 'Leyendo' | 'Terminado' | 'Abandonado',
        calificacion: 0,
        portada: '',
        notas: [],
        tags: manualData.genero ? [manualData.genero] : [],
        opiniones: manualData.opiniones,
        recomendado: false,
        prestadoA: '',
        fechaPrestamo: '',
        descripcion: manualData.descripcion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Guardar libro en el backend
      const response = await fetch(`http://localhost:7011/api/twins/${twinId}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el libro en el servidor');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al guardar el libro');
      }

      setSuccessMessage('¡Libro agregado exitosamente a tu biblioteca!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/mi-conocimiento/libros');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar libro con IA
  const handleSearchWithAI = async () => {
    if (!bookName.trim()) {
      setError('Por favor ingresa el nombre del libro');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const twinId = getTwinId();
      if (!twinId) {
        throw new Error('No se pudo obtener el identificador del usuario. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`http://localhost:7011/api/twins/searchbook/${twinId}/books?question=${encodeURIComponent(bookName.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('El servicio de búsqueda inteligente de libros no está disponible. Por favor, usa la opción "Manual" para agregar libros.');
      }

      const backendResponse = await response.json();
      
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

      // Mapear la respuesta del backend con todos los campos disponibles
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
        formato: bookInfo.INFORMACIÓN_TÉCNICA?.Formatos?.includes('eBook') ? 'Digital' : 
                 bookInfo.INFORMACIÓN_TÉCNICA?.Formatos?.includes('Audiolibro') ? 'Audiolibro' : 'Físico',
        estado: 'Por leer' as any,
        calificacion: 0,
        portada: bookInfo.INFORMACIÓN_PRÁCTICA?.portadaURL?.[0] || '',
        notas: [],
        tags: bookInfo.CONTENIDO_Y_TESIS_PRINCIPAL?.Conceptos_principales || [],
        opiniones: backendResponse.data.answer || '',
        recomendado: bookInfo.RESEÑAS_CRÍTICAS?.Bestseller_internacional === 'SÍ' || false,
        prestadoA: '',
        fechaPrestamo: '',
        descripcion: bookInfo.DescripcionAI || bookInfo.CONTENIDO_Y_TESIS_PRINCIPAL?.Idea_central || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        datosIA: {
          INFORMACIÓN_TÉCNICA: bookInfo.INFORMACIÓN_TÉCNICA || {},
          RESEÑAS_CRÍTICAS: bookInfo.RESEÑAS_CRÍTICAS || {},
          CONTENIDO_Y_TESIS_PRINCIPAL: bookInfo.CONTENIDO_Y_TESIS_PRINCIPAL || {},
          RECEPCIÓN_GENERAL: bookInfo.RECEPCIÓN_GENERAL || {},
          INFORMACIÓN_PRÁCTICA: bookInfo.INFORMACIÓN_PRÁCTICA || {},
          DescripcionAI: bookInfo.DescripcionAI || '',
          detailHTMLReport: bookInfo.detailHTMLReport || ''
        }
      };
      
      setAiData(bookData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar y guardar libro de IA
  const handleConfirmAI = async () => {
    if (!aiData) return;

    setIsLoading(true);
    setError(null);

    try {
      const twinId = getTwinId();
      if (!twinId) {
        throw new Error('No se pudo obtener el identificador del usuario. Por favor, inicia sesión nuevamente.');
      }

      // Guardar libro en el backend
      const response = await fetch(`http://localhost:7011/api/twins/${twinId}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el libro en el servidor');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al guardar el libro');
      }

      setSuccessMessage('¡Libro agregado exitosamente a tu biblioteca con datos de IA!');
      
      setTimeout(() => {
        navigate('/mi-conocimiento/libros');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/mi-conocimiento/libros')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Libros
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agregar Nuevo Libro
            </h1>
            <p className="text-lg text-gray-600">
              Elige cómo quieres agregar el libro a tu biblioteca
            </p>
          </div>
        </div>

        {/* Selector de método */}
        {!selectedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Manual Method */}
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => setSelectedMethod('manual')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Manualmente</CardTitle>
                <CardDescription>
                  Ingresa todos los datos del libro tú mismo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Control total sobre los datos
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Información personalizada
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Funciona sin conexión
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Requiere más tiempo
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Method */}
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300"
              onClick={() => setSelectedMethod('ai')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Con Inteligencia Artificial</CardTitle>
                <CardDescription>
                  La IA busca y completa automáticamente la información
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Información completa automática
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Datos precisos y verificados
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Análisis y reseñas incluidas
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Requiere conexión a internet
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual Form */}
        {selectedMethod === 'manual' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Agregar Libro Manualmente
                </CardTitle>
                <CardDescription>
                  Completa la información del libro en el formulario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mensajes de estado */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={manualData.titulo}
                        onChange={(e) => handleManualChange('titulo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingresa el título del libro"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Autor *
                      </label>
                      <input
                        type="text"
                        value={manualData.autor}
                        onChange={(e) => handleManualChange('autor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del autor"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={manualData.isbn}
                        onChange={(e) => handleManualChange('isbn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="978-0123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género
                      </label>
                      <select
                        value={manualData.genero}
                        onChange={(e) => handleManualChange('genero', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar género</option>
                        <option value="Ficción">Ficción</option>
                        <option value="No ficción">No ficción</option>
                        <option value="Biografía">Biografía</option>
                        <option value="Historia">Historia</option>
                        <option value="Ciencia">Ciencia</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Autoayuda">Autoayuda</option>
                        <option value="Negocios">Negocios</option>
                        <option value="Romance">Romance</option>
                        <option value="Misterio">Misterio</option>
                        <option value="Fantasía">Fantasía</option>
                        <option value="Ciencia ficción">Ciencia ficción</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  </div>

                  {/* Detalles de publicación */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Detalles de Publicación</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Editorial
                      </label>
                      <input
                        type="text"
                        value={manualData.editorial}
                        onChange={(e) => handleManualChange('editorial', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de la editorial"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Año de Publicación
                      </label>
                      <input
                        type="number"
                        value={manualData.añoPublicacion}
                        onChange={(e) => handleManualChange('añoPublicacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2024"
                        min="1000"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Páginas
                      </label>
                      <input
                        type="number"
                        value={manualData.paginas}
                        onChange={(e) => handleManualChange('paginas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="300"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma
                      </label>
                      <select
                        value={manualData.idioma}
                        onChange={(e) => handleManualChange('idioma', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Español">Español</option>
                        <option value="Inglés">Inglés</option>
                        <option value="Francés">Francés</option>
                        <option value="Alemán">Alemán</option>
                        <option value="Italiano">Italiano</option>
                        <option value="Portugués">Portugués</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Formato
                      </label>
                      <select
                        value={manualData.formato}
                        onChange={(e) => handleManualChange('formato', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Físico">Físico</option>
                        <option value="Digital">Digital</option>
                        <option value="Audiolibro">Audiolibro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado de Lectura
                      </label>
                      <select
                        value={manualData.estado}
                        onChange={(e) => handleManualChange('estado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Por leer">Por leer</option>
                        <option value="Leyendo">Leyendo</option>
                        <option value="Leído">Leído</option>
                        <option value="Abandonado">Abandonado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descripción y opiniones */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={manualData.descripcion}
                      onChange={(e) => handleManualChange('descripcion', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Breve descripción del libro..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opiniones Personales
                    </label>
                    <textarea
                      value={manualData.opiniones}
                      onChange={(e) => handleManualChange('opiniones', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tus opiniones sobre el libro..."
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMethod(null)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveManual}
                    disabled={isLoading || !manualData.titulo || !manualData.autor}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Libro
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Form */}
        {selectedMethod === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Crear Libro con Inteligencia Artificial
                </CardTitle>
                <CardDescription>
                  Proporciona el nombre del libro y la IA completará automáticamente la información
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mensajes de estado */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                    {successMessage}
                  </div>
                )}

                {!aiData && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Libro *
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={bookName}
                          onChange={(e) => setBookName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Escribe el nombre del libro"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchWithAI()}
                        />
                        <Button
                          onClick={handleSearchWithAI}
                          disabled={!bookName.trim() || isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Buscando...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4 mr-2" />
                              Buscar
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        La IA buscará y completará automáticamente toda la información del libro
                      </p>
                    </div>
                  </div>
                )}

                {aiData && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        📚 Información encontrada por IA
                      </h3>
                      <p className="text-blue-700">
                        Revisa y confirma la información encontrada para el libro.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información básica */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Información Básica</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.titulo || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.autor || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.isbn || 'No disponible'}</p>
                            {aiData.datosIA?.INFORMACIÓN_TÉCNICA?.ISBN && Array.isArray(aiData.datosIA.INFORMACIÓN_TÉCNICA.ISBN) && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">ISBNs adicionales:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {aiData.datosIA.INFORMACIÓN_TÉCNICA.ISBN.slice(1).map((isbn: string, index: number) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{isbn}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Género / Conceptos</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <div className="flex flex-wrap gap-1">
                              {aiData.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detalles de publicación */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Detalles de Publicación</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.editorial || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Año de Publicación</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.añoPublicacion || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Páginas</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.paginas || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-800">{aiData.idioma || 'No disponible'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Formatos Disponibles</label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            {aiData.datosIA?.INFORMACIÓN_TÉCNICA?.Formatos ? (
                              <div className="flex flex-wrap gap-1">
                                {aiData.datosIA.INFORMACIÓN_TÉCNICA.Formatos.map((formato, index) => (
                                  <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{formato}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-800">No disponible</p>
                            )}
                          </div>
                        </div>

                        {/* Bestseller y recomendaciones */}
                        {aiData.datosIA?.RESEÑAS_CRÍTICAS?.Bestseller_internacional && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                              <p className="text-yellow-800 font-medium">
                                📚 Bestseller Internacional: {aiData.datosIA.RESEÑAS_CRÍTICAS.Bestseller_internacional}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Análisis completo de la IA */}
                    {aiData.datosIA?.DescripcionAI && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Análisis Completo de la IA</label>
                        <div className="p-4 bg-blue-50 rounded-md border border-blue-200 max-h-60 overflow-y-auto">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{aiData.datosIA.DescripcionAI}</p>
                        </div>
                      </div>
                    )}

                    {/* Información Práctica de la IA */}
                    {aiData.datosIA?.INFORMACIÓN_PRÁCTICA && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">📋 Información Práctica</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Precios Orientativos */}
                          {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">💰 Precios Orientativos</label>
                              <div className="p-3 bg-green-50 rounded-md border border-green-200 space-y-2">
                                {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.Tapa_dura && (
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">Tapa Dura:</span>
                                    <span className="text-sm text-green-700">{aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.Tapa_dura}</span>
                                  </div>
                                )}
                                {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.Rústica && (
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">Rústica:</span>
                                    <span className="text-sm text-green-700">{aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.Rústica}</span>
                                  </div>
                                )}
                                {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.eBook && (
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">eBook:</span>
                                    <span className="text-sm text-green-700">{aiData.datosIA.INFORMACIÓN_PRÁCTICA.Precio_orientativo.eBook}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Disponibilidad */}
                          {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Disponibilidad && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">🏪 Disponibilidad</label>
                              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                                <div className="flex flex-wrap gap-1">
                                  {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Disponibilidad.map((tienda: string, index: number) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">{tienda}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Portadas */}
                          {aiData.datosIA.INFORMACIÓN_PRÁCTICA.portadaURL && aiData.datosIA.INFORMACIÓN_PRÁCTICA.portadaURL.length > 0 && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">📚 Portadas Disponibles</label>
                              <div className="flex flex-wrap gap-3">
                                {aiData.datosIA.INFORMACIÓN_PRÁCTICA.portadaURL.slice(0, 3).map((url: string, index: number) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={url} 
                                      alt={`Portada ${index + 1}`}
                                      className="w-24 h-32 object-cover rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Público Recomendado */}
                          {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Público_recomendado && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">👥 Público Recomendado</label>
                              <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                                <p className="text-sm text-purple-800">{aiData.datosIA.INFORMACIÓN_PRÁCTICA.Público_recomendado}</p>
                              </div>
                            </div>
                          )}

                          {/* Traducciones */}
                          {aiData.datosIA.INFORMACIÓN_PRÁCTICA.Traducciones && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">🌍 Traducciones</label>
                              <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                                <p className="text-sm text-orange-800">{aiData.datosIA.INFORMACIÓN_PRÁCTICA.Traducciones}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Configuraciones personales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato de Lectura
                        </label>
                        <select
                          value={aiData.formato}
                          onChange={(e) => setAiData(prev => prev ? {...prev, formato: e.target.value as 'Físico' | 'Digital' | 'Audiolibro'} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Físico">Físico</option>
                          <option value="Digital">Digital</option>
                          <option value="Audiolibro">Audiolibro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado de Lectura
                        </label>
                        <select
                          value={aiData.estado}
                          onChange={(e) => setAiData(prev => prev ? {...prev, estado: e.target.value as 'Por leer' | 'Leyendo' | 'Terminado' | 'Abandonado'} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Por leer">Por leer</option>
                          <option value="Leyendo">Leyendo</option>
                          <option value="Terminado">Terminado</option>
                          <option value="Abandonado">Abandonado</option>
                        </select>
                      </div>
                    </div>

                    {/* Opiniones personales */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opiniones Personales (Opcional)
                      </label>
                      <textarea
                        value={aiData.opiniones}
                        onChange={(e) => setAiData(prev => prev ? {...prev, opiniones: e.target.value} : null)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Agrega tus opiniones sobre el libro..."
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAiData(null);
                          setBookName('');
                        }}
                        disabled={isLoading}
                      >
                        Buscar Otro
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmAI}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Confirmar y Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgregarLibroPage;