import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Plus, 
  Eye,
  Edit,
  Star,
  Calendar,
  User,
  Tag,
  Clock,
  BookOpen,
  FileText,
  Heart,
  Bookmark,
  RefreshCw,
  Loader2,
  X,
  PenTool,
  Search,
  Loader,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMsal } from '@azure/msal-react';
import type { 
  Book as BookType, 
  BookFilter
} from '@/types/conocimiento';
import BooksPicture from '@/assets/BooksPicture.png';

interface LibrosSectionProps {
  searchTerm?: string;
}

const LibrosSection: React.FC<LibrosSectionProps> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [libros, setLibros] = useState<BookType[]>([]);
  const [filter] = useState<BookFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados para modal de progreso de actualización
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [librosActualizados, setLibrosActualizados] = useState(0);
  const [totalLibros, setTotalLibros] = useState(0);
  
  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);

  // Función para obtener el TwinId real del usuario autenticado
  const getTwinId = (): string | null => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    if (account?.localAccountId) {
      return account.localAccountId;
    }
    return null;
  };

  // Función para cargar libros desde el backend
  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const twinId = getTwinId();
      
      if (!twinId) {
        throw new Error('No se pudo obtener el identificador del usuario. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`http://localhost:7011/api/twins/${twinId}/books`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Usuario no tiene libros aún
          setLibros([]);
          return;
        }
        throw new Error('Error al cargar los libros desde el servidor');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener los libros');
      }

      // Mapear los datos del backend al formato esperado
      const booksData = Array.isArray(result.data) ? result.data.map((bookItem: any, index: number) => {
        // Actualizar progreso si el modal está activo
        if (showProgressModal) {
          setLibrosActualizados(index + 1);
          setTotalLibros(result.data.length);
        }
        
        // Los datos reales están en bookMainData
        const book = bookItem.bookMainData || bookItem;
        
        // Debug temporal para verificar detailHTMLReport
        console.log('📖 Mapping book:', book.titulo);
        console.log('📖 datosIA exists:', !!book.datosIA);
        console.log('📖 detailHTMLReport:', book.datosIA?.detailHTMLReport ? 'Found' : 'Missing');
        
        return {
          id: book.id || bookItem.id,
          titulo: book.titulo,
          autor: book.autor,
          isbn: book.isbn,
          fechaLectura: book.fechaLectura,
          fechaInicio: book.fechaInicio,
          fechaFin: book.fechaFin,
          genero: book.genero,
          paginas: book.paginas,
          editorial: book.editorial,
          añoPublicacion: book.añoPublicacion,
          idioma: book.idioma || 'Español',
          formato: book.formato,
          estado: book.estado,
          calificacion: book.calificacion,
          portada: book.portada,
          notas: book.notas || [],
          tags: book.tags || [],
          opiniones: book.opiniones,
          recomendado: book.recomendado,
          prestadoA: book.prestadoA,
          fechaPrestamo: book.fechaPrestamo,
          descripcion: book.descripcion,
          detailHTMLReport: book.datosIA?.detailHTMLReport || book.detailHTMLReport,
          createdAt: book.createdAt || bookItem.createdAt,
          updatedAt: book.updatedAt || bookItem.updatedAt,
          datosIA: book.datosIA
        };
      }) : [];
      
      setLibros(booksData);

    } catch (err) {
      console.error('Error loading books:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los libros');
    } finally {
      setIsLoading(false);
    }
  }, [accounts]); // Depende de accounts para obtener el twinId

  // Cargar libros al montar el componente
  useEffect(() => {
    // Solo cargar si hay cuentas disponibles
    if (accounts && accounts.length > 0) {
      loadBooks();
    }
  }, [accounts, loadBooks]); // Agregar loadBooks como dependencia

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    // Mostrar modal de progreso
    setShowProgressModal(true);
    setProgressStep(1);
    setLibrosActualizados(0);
    setTotalLibros(libros.length || 10); // Estimado si no hay libros cargados
    
    try {
      // Simular pasos del proceso
      setProgressStep(1); // Conectando al servidor
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgressStep(2); // Obteniendo lista de libros
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProgressStep(3); // Procesando datos
      
      // Llamar a la función real de carga
      await loadBooks();
      
      setProgressStep(4); // Finalizando
      await new Promise(resolve => setTimeout(resolve, 400));
      
    } catch (error) {
      console.error('Error durante la actualización:', error);
    } finally {
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        setShowProgressModal(false);
        setProgressStep(1);
        setLibrosActualizados(0);
        setTotalLibros(0);
      }, 500);
    }
  };

  // Filtrar libros basado en searchTerm, searchQuery y filtros
  const filteredLibros = libros.filter(libro => {
    // Verificar que los campos requeridos existan antes de usar toLowerCase
    const titulo = libro.titulo || '';
    const autor = libro.autor || '';
    const genero = libro.genero || '';
    const editorial = libro.editorial || '';
    
    // Búsqueda por término (prop externa) y búsqueda interna
    const searchTerms = `${searchTerm} ${searchQuery}`.toLowerCase().trim();
    const matchesSearch = searchTerms === '' || 
                         titulo.toLowerCase().includes(searchTerms) ||
                         autor.toLowerCase().includes(searchTerms) ||
                         genero.toLowerCase().includes(searchTerms) ||
                         editorial.toLowerCase().includes(searchTerms);
    
    // Filtro por estado
    const matchesStatus = statusFilter === 'todos' || libro.estado === statusFilter;
    
    // Mantener filtros existentes
    const matchesGenre = !filter.genero || libro.genero === filter.genero;
    
    return matchesSearch && matchesStatus && matchesGenre;
  });

  // Estadísticas calculadas
  const stats = {
    totalLibros: libros.length,
    librosLeyendo: libros.filter(l => l.estado === 'Leyendo').length,
    librosLeidos: libros.filter(l => l.estado === 'Terminado').length,
    librosPorLeer: libros.filter(l => l.estado === 'Por leer').length,
    librosRecomendados: libros.filter(l => l.recomendado === true).length,
    ultimaLectura: libros.filter(l => l.fechaLectura && l.fechaLectura.trim() !== '').length
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Función para abrir el modal de detalles
  const handleShowDetails = (libro: BookType) => {
    console.log('📖 Opening details for:', libro.titulo);
    console.log('📖 detailHTMLReport available:', !!libro.detailHTMLReport);
    console.log('📖 detailHTMLReport content:', libro.detailHTMLReport ? 'Present' : 'Missing');
    setSelectedBook(libro);
    setShowDetailsModal(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetails = () => {
    setSelectedBook(null);
    setShowDetailsModal(false);
  };

  // Componente para mostrar estrellas de calificación
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalLibros}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.librosLeyendo}</p>
            <p className="text-sm text-gray-600">Leyendo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bookmark className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.librosLeidos}</p>
            <p className="text-sm text-gray-600">Leídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.librosPorLeer}</p>
            <p className="text-sm text-gray-600">Por Leer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.librosRecomendados}</p>
            <p className="text-sm text-gray-600">Favoritos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.ultimaLectura}</p>
            <p className="text-sm text-gray-600">Con Fecha</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Búsqueda y Filtros */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Barra de búsqueda principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título, autor, género o editorial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === 'todos' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('todos')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Todos ({libros.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Leyendo' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('Leyendo')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Leyendo ({libros.filter(l => l.estado === 'Leyendo').length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Terminado' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('Terminado')}
              className="flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Leídos ({libros.filter(l => l.estado === 'Terminado').length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Por leer' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('Por leer')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Por Leer ({libros.filter(l => l.estado === 'Por leer').length})
            </Button>
          </div>

          {/* Información de resultados */}
          {(searchQuery || statusFilter !== 'todos') && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span>
                Mostrando {filteredLibros.length} de {libros.length} libros
                {searchQuery && ` • Búsqueda: "${searchQuery}"`}
                {statusFilter !== 'todos' && ` • Estado: ${statusFilter}`}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('todos');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Botón para agregar libro y refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Mi Biblioteca</h3>
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualizar
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/mi-conocimiento/libros/agregar')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Libro
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error al cargar los libros</p>
          <p className="text-sm mt-1">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Lista de Libros */}
      <div className="space-y-4">
        {filteredLibros.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {libros.length === 0 
                ? "Tu biblioteca está vacía" 
                : searchQuery || statusFilter !== 'todos'
                  ? "No se encontraron libros con estos filtros"
                  : "No se encontraron libros"
              }
            </h3>
            <p className="text-gray-400 mb-6">
              {libros.length === 0 
                ? "Comienza agregando tu primer libro a la biblioteca" 
                : searchQuery || statusFilter !== 'todos'
                  ? "Intenta ajustar los filtros de búsqueda o estado"
                  : "Intenta ajustar los filtros de búsqueda"
              }
            </p>
            {libros.length === 0 ? (
              <Button 
                onClick={() => navigate('/mi-conocimiento/libros/agregar')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Libro
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('todos');
                }}
                variant="outline"
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
            {filteredLibros.map((libro) => (
              <Card key={libro.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-indigo-500 bg-gradient-to-r from-white to-indigo-50/30">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Portada compacta */}
                    <div className="flex-shrink-0">
                      {libro.portada ? (
                        <img 
                          src={libro.portada} 
                          alt={libro.titulo}
                          className="w-20 h-28 object-cover rounded-lg border-2 border-indigo-200 shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = BooksPicture;
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <img 
                          src={BooksPicture} 
                          alt="Portada predeterminada"
                          className="w-20 h-28 object-cover rounded-lg border-2 border-indigo-200 shadow-md"
                        />
                      )}
                    </div>

                    {/* Información del libro comprimida */}
                    <div className="flex-grow space-y-3 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-bold text-gray-900 leading-tight truncate">
                            {libro.titulo || 'Título no disponible'}
                            {libro.recomendado && (
                              <Heart className="w-4 h-4 text-red-500 fill-red-500 inline ml-2" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-700 mt-1">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium truncate">{libro.autor || 'Autor desconocido'}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${libro.estado === 'Terminado' ? 'bg-green-500 hover:bg-green-600' :
                            libro.estado === 'Leyendo' ? 'bg-blue-500 hover:bg-blue-600' : 
                            'bg-gray-500 hover:bg-gray-600'} 
                            text-white px-2 py-1 text-xs whitespace-nowrap
                          `}
                        >
                          {libro.estado}
                        </Badge>
                      </div>

                      {/* Información comprimida */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {libro.genero && (
                          <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                            <Tag className="w-3 h-3 text-purple-600" />
                            <span className="text-purple-700 truncate max-w-20">{libro.genero}</span>
                          </div>
                        )}
                        {libro.paginas && libro.paginas > 0 && (
                          <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
                            <Book className="w-3 h-3 text-orange-600" />
                            <span className="text-orange-700">{libro.paginas}p</span>
                          </div>
                        )}
                        {libro.editorial && libro.editorial.trim() !== '' && (
                          <div className="flex items-center gap-1 bg-cyan-100 px-2 py-1 rounded-full">
                            <BookOpen className="w-3 h-3 text-cyan-600" />
                            <span className="text-cyan-700 truncate max-w-20">{libro.editorial}</span>
                          </div>
                        )}
                      </div>

                      {libro.calificacion && libro.calificacion > 0 && (
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= libro.calificacion 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Botones compactos */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs flex-1 max-w-20"
                          onClick={() => handleShowDetails(libro)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs flex-1 max-w-20"
                          onClick={() => {
                            const currentTwinId = getTwinId();
                            navigate(`/mi-conocimiento/libros/${libro.id}/notas`, { 
                              state: { 
                                bookData: libro,
                                twinId: currentTwinId
                              } 
                            });
                          }}
                        >
                          <PenTool className="w-3 h-3 mr-1" />
                          Notas
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-1 rounded text-xs flex-1 max-w-20"
                          onClick={() => {
                            const currentTwinId = getTwinId();
                            navigate(`/mi-conocimiento/libros/${libro.id}/editar`, { 
                              state: { 
                                bookData: libro,
                                twinId: currentTwinId
                              } 
                            });
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del libro */}
      <Dialog open={showDetailsModal} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-xl -m-6 mb-6 relative">
            <button
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <DialogTitle className="text-3xl font-bold pr-12">
              {selectedBook?.titulo || 'Detalles del Libro'}
            </DialogTitle>
            {selectedBook?.autor && (
              <p className="text-indigo-100 text-lg mt-2">por {selectedBook.autor}</p>
            )}
          </DialogHeader>
          
          {selectedBook && (
            <div className="overflow-y-auto max-h-[75vh] px-2">
              {/* Información Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Información técnica sin portada */}
                <div className="lg:col-span-1">
                  <div className="sticky top-0 bg-white">
                    {/* Calificación */}
                    {selectedBook.calificacion && selectedBook.calificacion > 0 && (
                      <div className="mb-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">Tu Calificación</p>
                        <div className="flex justify-center">
                          <StarRating rating={selectedBook.calificacion} />
                        </div>
                      </div>
                    )}

                    {/* Estado */}
                    <div className="text-center mb-4">
                      <Badge 
                        className={
                          selectedBook.estado === 'Terminado' ? 'bg-green-500 hover:bg-green-600 text-white px-4 py-2' :
                          selectedBook.estado === 'Leyendo' ? 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2' : 
                          'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2'
                        }
                      >
                        {selectedBook.estado}
                      </Badge>
                    </div>

                    {/* Metadatos técnicos */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Información Técnica</h4>
                      
                      {selectedBook.isbn && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">ISBN:</span>
                          <span className="font-mono text-gray-900">{selectedBook.isbn}</span>
                        </div>
                      )}

                      {selectedBook.editorial && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Editorial:</span>
                          <span className="text-gray-900">{selectedBook.editorial}</span>
                        </div>
                      )}

                      {selectedBook.añoPublicacion && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Calendar className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Año:</span>
                          <span className="text-gray-900">{selectedBook.añoPublicacion}</span>
                        </div>
                      )}

                      {selectedBook.paginas && selectedBook.paginas > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <Book className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Páginas:</span>
                          <span className="text-gray-900">{selectedBook.paginas}</span>
                        </div>
                      )}

                      {selectedBook.idioma && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Tag className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Idioma:</span>
                          <span className="text-gray-900">{selectedBook.idioma}</span>
                        </div>
                      )}

                      {selectedBook.formato && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Formato:</span>
                          <span className="text-gray-900">{selectedBook.formato}</span>
                        </div>
                      )}

                      {selectedBook.genero && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                            <Tag className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-600">Género:</span>
                          <span className="text-gray-900">{selectedBook.genero}</span>
                        </div>
                      )}
                    </div>

                    {/* Fechas de lectura */}
                    {(selectedBook.fechaInicio || selectedBook.fechaFin || selectedBook.fechaLectura) && (
                      <div className="mt-4 space-y-3 bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Fechas de Lectura</h4>
                        
                        {selectedBook.fechaInicio && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-600">Inicio:</span>
                            <span className="text-gray-900">{formatDate(selectedBook.fechaInicio)}</span>
                          </div>
                        )}

                        {selectedBook.fechaFin && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-600">Fin:</span>
                            <span className="text-gray-900">{formatDate(selectedBook.fechaFin)}</span>
                          </div>
                        )}

                        {selectedBook.fechaLectura && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-600">Lectura:</span>
                            <span className="text-gray-900">{formatDate(selectedBook.fechaLectura)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {selectedBook.tags && selectedBook.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Etiquetas</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBook.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Opiniones personales */}
                  {selectedBook.opiniones && selectedBook.opiniones.trim() !== '' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-amber-600" />
                        Mis Opiniones
                      </h4>
                      <p className="text-gray-700 italic">"{selectedBook.opiniones}"</p>
                    </div>
                  )}

                  {/* Descripción de IA */}
                  {selectedBook.datosIA?.DescripcionAI && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-indigo-600" />
                        Resumen IA
                      </h4>
                      <p className="text-gray-700">{selectedBook.datosIA.DescripcionAI}</p>
                    </div>
                  )}

                  {/* Reporte HTML detallado */}
                  {selectedBook.detailHTMLReport ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Análisis Detallado
                      </h4>
                      <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
                        ✅ Reporte HTML cargado correctamente
                      </div>
                      <div 
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-strong:text-gray-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-800"
                        dangerouslySetInnerHTML={{ __html: selectedBook.detailHTMLReport }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                        ❌ No se encontró detailHTMLReport para este libro
                      </div>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Book className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No hay análisis detallado disponible
                      </h3>
                      <p className="text-gray-500 text-lg">
                        Este libro no tiene un reporte detallado disponible.
                      </p>
                      <div className="mt-4 text-xs text-gray-400">
                        Debug: Book ID: {selectedBook.id}, datosIA: {selectedBook.datosIA ? 'Present' : 'Missing'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-4">
            <div className="text-sm text-gray-500">
              {selectedBook?.createdAt && (
                <span>Agregado el {formatDate(selectedBook.createdAt)}</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300 rounded-lg transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de progreso de actualización */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl max-w-md w-full p-6 border border-green-200 shadow-2xl">
            {/* Header colorido */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                📚 Actualizando Biblioteca
              </h3>
              <p className="text-sm text-gray-600">
                Sincronizando tu biblioteca personal desde el servidor...
              </p>
            </div>

            {/* Progress de libros */}
            {totalLibros > 0 && progressStep === 3 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Libro {librosActualizados} de {totalLibros}</span>
                  <span>{Math.round((librosActualizados / totalLibros) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${(librosActualizados / totalLibros) * 100}%`}}
                  ></div>
                </div>
              </div>
            )}

            {/* Pasos del proceso */}
            <div className="space-y-3">
              {[
                { id: 1, emoji: "🔗", titulo: "Conectando al servidor", descripcion: "Estableciendo conexión segura" },
                { id: 2, emoji: "📋", titulo: "Obteniendo lista de libros", descripcion: "Descargando información actualizada" },
                { id: 3, emoji: "📖", titulo: "Procesando biblioteca", descripcion: "Organizando y validando datos" },
                { id: 4, emoji: "✅", titulo: "Finalizando actualización", descripcion: "Completando sincronización" }
              ].map((paso) => (
                <div 
                  key={paso.id}
                  className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                    progressStep === paso.id 
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 border-l-4 border-green-500 shadow-md' 
                      : progressStep > paso.id 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : 'bg-gray-50 border-l-4 border-gray-300'
                  }`}
                >
                  <div className="text-2xl mr-3">{paso.emoji}</div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${
                      progressStep === paso.id ? 'text-green-700' : 
                      progressStep > paso.id ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {paso.titulo}
                    </div>
                    <div className={`text-xs ${
                      progressStep === paso.id ? 'text-green-600' : 
                      progressStep > paso.id ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {paso.descripcion}
                    </div>
                  </div>
                  {progressStep === paso.id && (
                    <Loader className="h-4 w-4 text-green-600 animate-spin" />
                  )}
                  {progressStep > paso.id && (
                    <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer informativo */}
            <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 text-center">
                📚 <strong>Actualizando</strong> tu biblioteca personal con la información más reciente del servidor. Esto puede incluir nuevas notas, análisis de IA y metadatos actualizados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrosSection;