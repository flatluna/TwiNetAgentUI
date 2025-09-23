import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Star, Calendar, BookOpen } from 'lucide-react';
import { Book } from '@/types/conocimiento';
import { booksApiService } from '@/services/booksApiService';
import { useTwinId } from '@/hooks/useTwinId';

const EditarLibroPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTwinId } = useTwinId();
  const twinId = location.state?.twinId || getTwinId();

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    añoPublicacion: 0,
    calificacion: 0,
    descripcion: '',
    editorial: '',
    estado: 'Por leer',
    fechaFin: '',
    fechaInicio: '',
    fechaLectura: '',
    formato: 'Digital',
    genero: '',
    paginas: 0,
    portada: '',
    recomendado: false,
    tags: [] as string[]
  });

  // Estados y calificaciones disponibles
  const estadosDisponibles = [
    'Por leer',
    'Leyendo',
    'Leído',
    'Abandonado',
    'Re-leyendo'
  ];

  const formatosDisponibles = [
    'Digital',
    'Físico',
    'Audiolibro',
    'PDF'
  ];

  // Cargar datos del libro
  useEffect(() => {
    const loadBookData = async () => {
      try {
        setLoading(true);
        
        if (!twinId || !bookId) {
          console.error('TwinId o BookId faltantes');
          return;
        }

        // Obtener datos del libro desde el API
        console.log('📥 Obteniendo libro desde API...');
        const apiResponse = await booksApiService.getBook(twinId, bookId);
        console.log('📦 Respuesta del API:', apiResponse);
        
        if (apiResponse) {
          const bookMainData = (apiResponse as any)?.data?.bookMainData;
          
          if (bookMainData) {
            setBook(bookMainData);
            
            // Llenar el formulario con los datos existentes
            setFormData({
              titulo: bookMainData.titulo || '',
              autor: bookMainData.autor || '',
              isbn: bookMainData.isbn || '',
              añoPublicacion: bookMainData.añoPublicacion || 0,
              calificacion: bookMainData.calificacion || 0,
              descripcion: bookMainData.descripcion || '',
              editorial: bookMainData.editorial || '',
              estado: bookMainData.estado || 'Por leer',
              fechaFin: bookMainData.fechaFin || '',
              fechaInicio: bookMainData.fechaInicio || '',
              fechaLectura: bookMainData.fechaLectura || '',
              formato: bookMainData.formato || 'Digital',
              genero: bookMainData.genero || '',
              paginas: bookMainData.paginas || 0,
              portada: bookMainData.portada || '',
              recomendado: bookMainData.recomendado || false,
              tags: bookMainData.tags || []
            });
          }
        }
      } catch (error) {
        console.error('Error cargando datos del libro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, [twinId, bookId]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambios en tags
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  // Guardar cambios
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!twinId || !bookId) {
        console.error('TwinId o BookId faltantes');
        return;
      }

      console.log('💾 Guardando cambios del libro...');
      
      // Actualizar solo la información básica del libro
      await booksApiService.updateBookBasicInfo(twinId, bookId, formData);
      
      console.log('✅ Libro actualizado exitosamente');
      
      // Volver a la lista de libros
      navigate('/mi-conocimiento/libros');
      
    } catch (error) {
      console.error('❌ Error guardando cambios del libro:', error);
      alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Renderizar estrellas para calificación
  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del libro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar el libro</p>
          <Button onClick={() => navigate('/mi-conocimiento/libros')}>
            Volver a Libros
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mi-conocimiento/libros')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Libros
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Título principal */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Libro
          </h1>
          <p className="text-gray-600">
            Modifica la información básica del libro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información básica */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Información Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Título del libro"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Autor *</label>
                    <Input
                      value={formData.autor}
                      onChange={(e) => handleInputChange('autor', e.target.value)}
                      placeholder="Nombre del autor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Editorial</label>
                    <Input
                      value={formData.editorial}
                      onChange={(e) => handleInputChange('editorial', e.target.value)}
                      placeholder="Editorial"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ISBN</label>
                    <Input
                      value={formData.isbn}
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                      placeholder="ISBN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Año de Publicación</label>
                    <Input
                      type="number"
                      value={formData.añoPublicacion || ''}
                      onChange={(e) => handleInputChange('añoPublicacion', parseInt(e.target.value) || 0)}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Páginas</label>
                    <Input
                      type="number"
                      value={formData.paginas || ''}
                      onChange={(e) => handleInputChange('paginas', parseInt(e.target.value) || 0)}
                      placeholder="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Descripción del libro..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Estado y Formato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Estado y Formato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {estadosDisponibles.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Formato</label>
                    <select
                      value={formData.formato}
                      onChange={(e) => handleInputChange('formato', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {formatosDisponibles.map(formato => (
                        <option key={formato} value={formato}>{formato}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Género</label>
                  <Input
                    value={formData.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    placeholder="Ficción, Historia, Ciencia, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                    <Input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha Fin</label>
                    <Input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha Lectura</label>
                    <Input
                      type="date"
                      value={formData.fechaLectura}
                      onChange={(e) => handleInputChange('fechaLectura', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (separados por comas)</label>
                  <Input
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="ficción, ciencia, historia"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Calificación y Vista previa */}
          <div className="space-y-6">
            {/* Calificación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Calificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Tu calificación</p>
                  {renderStars(formData.calificacion, (rating) => handleInputChange('calificacion', rating))}
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.calificacion}/5 estrellas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recomendado */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="recomendado"
                    checked={formData.recomendado}
                    onChange={(e) => handleInputChange('recomendado', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="recomendado" className="text-sm font-medium text-gray-700">
                    Libro recomendado
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Vista previa de Tags */}
            {formData.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portada */}
            {formData.portada && (
              <Card>
                <CardHeader>
                  <CardTitle>Portada Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={formData.portada}
                    alt={formData.titulo}
                    className="w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarLibroPage;