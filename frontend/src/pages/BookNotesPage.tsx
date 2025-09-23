import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  BookOpen as BookIcon, 
  Plus, 
  ArrowLeft,
  Trash2,
  Search,
  BookOpen,
  FileText,
  Hash,
  MapPin,
  Clock,
  Star,
  Tag,
  Quote,
  MessageCircle,
  Save,
  X,
  User,
  Calendar,
  Bookmark,
  Edit
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, BookNote } from "@/types/conocimiento";
import { booksApiService } from "@/services/booksApiService";
import { useMsal } from "@azure/msal-react";

const BookNotesPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts } = useMsal();
  
  // Función para obtener el TwinId del usuario autenticado (fallback)
  const getTwinId = (): string | null => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    if (account?.localAccountId) {
      return account.localAccountId;
    }
    return null;
  };
  
  // Obtener el twinId del state de navegación o como fallback de MSAL
  const twinId = location.state?.twinId || getTwinId();
  
  console.log('🔍 BookNotesPage - location.state completo:', location.state);
  console.log('🆔 BookNotesPage - twinId desde state:', location.state?.twinId);
  console.log('🆔 BookNotesPage - twinId desde MSAL fallback:', getTwinId());
  console.log('🆔 BookNotesPage - twinId final:', twinId);
  
  // Estado para el libro y los comentarios
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<BookNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<BookNote>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Estado para el formulario de nuevo comentario
  const [newNote, setNewNote] = useState<Partial<BookNote>>({
    tipo: 'Resumen',
    titulo: '',
    contenido: '',
    capitulo: '',
    pagina: undefined,
    ubicacion: '',
    tags: [],
    destacada: false,
    color: '#3B82F6'
  });

  // Tipos de comentarios más específicos (como capítulo, página, etc.)
  const noteTypes = [
    { value: 'Resumen', label: 'Resumen de Capítulo', icon: FileText, color: '#3B82F6' },
    { value: 'Cita', label: 'Cita Textual', icon: Quote, color: '#10B981' },
    { value: 'Nota', label: 'Comentario de Página', icon: Hash, color: '#F59E0B' },
    { value: 'Reflexión', label: 'Reflexión Personal', icon: MessageCircle, color: '#8B5CF6' },
    { value: 'Pregunta', label: 'Pregunta/Duda', icon: MessageCircle, color: '#EF4444' },
    { value: 'Conexión', label: 'Conexión/Insight', icon: Star, color: '#EC4899' }
  ];

  // Mapear el tipo numérico a string
  const mapTipoToString = (tipo: any): string => {
    if (typeof tipo === 'string') return tipo;
    
    const tipoMap: { [key: number]: string } = {
      0: 'Nota',
      1: 'Cita',
      2: 'Reflexión',
      3: 'Resumen',
      4: 'Pregunta',
      5: 'Conexión'
    };
    
    return tipoMap[tipo] || 'Nota';
  };

  // Normalizar nota del backend para el frontend
  const normalizeNote = (note: any): BookNote => {
    return {
      id: note.id,
      bookId: note.bookId,
      tipo: mapTipoToString(note.tipo) as any,
      titulo: note.titulo,
      contenido: note.contenido,
      capitulo: note.capitulo || '',
      pagina: note.pagina,
      ubicacion: note.ubicacion || '',
      tags: note.tags || [],
      destacada: note.destacada || false,
      color: note.color || '#3B82F6',
      fecha: note.fecha ? note.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
    };
  };

  // Cargar datos del libro y comentarios
  useEffect(() => {
    const loadBookData = async () => {
      if (!bookId || !twinId) {
        console.error('BookId o TwinId no disponible');
        return;
      }
      
      try {
        setLoading(true);
        
        // Obtener datos reales del libro desde el API
        const bookData = location.state?.bookData;
        
        if (bookData && twinId) {
          // Obtener el libro completo desde el API para tener la estructura correcta
          console.log('📥 Obteniendo libro desde API...');
          const apiResponse = await booksApiService.getBook(twinId, bookData.id);
          console.log('📦 Respuesta del API:', apiResponse);
          
          if (apiResponse) {
            // Extraer las notas de la ubicación correcta en la estructura del backend
            const bookMainData = (apiResponse as any)?.data?.bookMainData;
            let rawBookNotes = bookMainData?.datosIA?.BookNotes || [];
            
            // Si no hay notas en BookNotes, buscar en bookNotes (camelCase)
            if (rawBookNotes.length === 0) {
              rawBookNotes = bookMainData?.datosIA?.bookNotes || [];
            }
            
            // Si aún no hay notas en API, usar las del estado
            if (rawBookNotes.length === 0 && bookData.datosIA?.bookNotes) {
              rawBookNotes = bookData.datosIA.bookNotes;
            }
            
            console.log('📝 Notas crudas del backend:', rawBookNotes);
            
            // Normalizar las notas para el frontend
            const normalizedNotes = rawBookNotes.map(normalizeNote);
            console.log('📝 Notas normalizadas:', normalizedNotes);
            
            // Crear el objeto libro para la UI
            const realBook: Book = {
              ...bookData,
              notas: normalizedNotes // Usar las notas normalizadas del backend
            };
            setBook(realBook);
            setNotes(normalizedNotes);
          } else {
            // Fallback si no se puede obtener del API
            const realBook: Book = {
              ...bookData,
              notas: bookData.notas || []
            };
            setBook(realBook);
            setNotes(realBook.notas || []);
          }
        } else {
          // Fallback: Si no hay datos en el estado, crear datos básicos
          const fallbackBook: Book = {
            id: bookId || '',
            titulo: "Libro sin título",
            autor: "Autor desconocido",
            idioma: "Español",
            formato: "Digital",
            estado: "Leyendo",
            notas: [],
            opiniones: "",
            recomendado: false,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            genero: "General",
            descripcion: "No hay descripción disponible"
          };
          setBook(fallbackBook);
          setNotes([]);
        }
      } catch (error) {
        console.error('Error al cargar datos del libro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, [bookId, location.state, twinId]);

  // Filtrar comentarios
  const filteredNotes = notes.filter(note => {
    // Filtro por término de búsqueda
    const matchesSearch = note.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por página
    let matchesPage = true;
    if (pageFilter.trim() && pageFilter !== 'all') {
      const targetPage = parseInt(pageFilter);
      if (!isNaN(targetPage) && note.pagina) {
        matchesPage = note.pagina === targetPage;
      } else {
        matchesPage = false;
      }
    }
    
    return matchesSearch && matchesPage;
  });

  // Obtener páginas únicas de todas las notas para el combo box
  const availablePages = Array.from(new Set(
    notes
      .filter(note => note.pagina && note.pagina > 0)
      .map(note => note.pagina!)
  )).sort((a, b) => a - b);

  // Crear nuevo comentario y guardarlo en el backend
  const handleCreateNote = async () => {
    console.log('🎯 handleCreateNote iniciado');
    console.log('📝 newNote.titulo:', newNote.titulo);
    console.log('📝 newNote.contenido:', newNote.contenido);
    console.log('📚 book:', book);
    console.log('🆔 twinId:', twinId);
    
    if (!newNote.titulo || !newNote.contenido || !book || !twinId) {
      console.log('❌ Condición no cumplida para crear nota');
      console.log('- titulo:', !!newNote.titulo);
      console.log('- contenido:', !!newNote.contenido);
      console.log('- book:', !!book);
      console.log('- twinId:', !!twinId);
      return;
    }
    
    try {
      setSaving(true);
      
      const note: BookNote = {
        id: Date.now().toString(),
        bookId: book.id,
        tipo: newNote.tipo || 'Resumen',
        titulo: newNote.titulo,
        contenido: newNote.contenido,
        capitulo: newNote.capitulo || '',
        pagina: newNote.pagina,
        ubicacion: newNote.ubicacion || '',
        tags: newNote.tags || [],
        destacada: newNote.destacada || false,
        color: newNote.color || '#3B82F6',
        fecha: new Date().toISOString().split('T')[0]
      };
      
      console.log('📤 Enviando nota al backend:', note);
      console.log('🆔 TwinId para API:', twinId);
      console.log('📚 BookId para API:', book.id);
      
      // Guardar en el backend
      const updatedBook = await booksApiService.addNoteToBook(twinId, book.id, note);
      
      console.log('📥 Respuesta del backend:', updatedBook);
      
      if (updatedBook) {
        console.log('📦 Respuesta del backend después de crear:', updatedBook);
        
        // Intentar obtener las notas de diferentes estructuras posibles
        let rawBookNotes = [];
        
        // Opción 1: Estructura con data.bookMainData
        if ((updatedBook as any)?.data?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.BookNotes;
        }
        // Opción 2: Estructura con data.bookMainData con bookNotes (camelCase)
        else if ((updatedBook as any)?.data?.bookMainData?.datosIA?.bookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.bookNotes;
        }
        // Opción 3: Estructura directa con bookMainData
        else if ((updatedBook as any)?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).bookMainData.datosIA.BookNotes;
        }
        // Opción 4: Si no encuentra notas, agregar manualmente
        else {
          console.log('⚠️ No se encontraron notas en la respuesta, agregando manualmente');
          setNotes([...notes, note]);
          setSelectedNote(note);
          setIsCreating(false);
          setNewNote({
            tipo: 'Resumen',
            titulo: '',
            contenido: '',
            capitulo: '',
            pagina: undefined,
            ubicacion: '',
            tags: [],
            destacada: false,
            color: '#3B82F6'
          });
          console.log('Comentario guardado exitosamente (manual)');
          return;
        }
        
        console.log('📝 Notas crudas del backend después de crear:', rawBookNotes);
        
        // Obtener las notas actualizadas y normalizarlas
        const normalizedNotes = rawBookNotes.map(normalizeNote);
        console.log('📝 Notas normalizadas después de crear:', normalizedNotes);
        
        // Encontrar la nota recién creada
        const createdNote = normalizedNotes.find((n: BookNote) => n.id === note.id);
        console.log('🎯 Nota creada encontrada:', createdNote);
        
        // Actualizar estado local
        setNotes(normalizedNotes);
        setSelectedNote(createdNote || note);
        setBook(updatedBook);
        setIsCreating(false);
        setNewNote({
          tipo: 'Resumen',
          titulo: '',
          contenido: '',
          capitulo: '',
          pagina: undefined,
          ubicacion: '',
          tags: [],
          destacada: false,
          color: '#3B82F6'
        });
        console.log('Comentario guardado exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
      alert('Error al guardar el comentario. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar comentario
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?') || !book || !twinId) return;
    
    try {
      setSaving(true);
      
      // Eliminar del backend
      const updatedBook = await booksApiService.deleteNoteFromBook(twinId, book.id, noteId);
      
      if (updatedBook) {
        console.log('📦 Respuesta del backend después de eliminar:', updatedBook);
        
        // Intentar obtener las notas de diferentes estructuras posibles
        let rawBookNotes = [];
        
        // Opción 1: Estructura con data.bookMainData
        if ((updatedBook as any)?.data?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.BookNotes;
        }
        // Opción 2: Estructura con data.bookMainData con bookNotes (camelCase)
        else if ((updatedBook as any)?.data?.bookMainData?.datosIA?.bookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.bookNotes;
        }
        // Opción 3: Estructura directa con bookMainData
        else if ((updatedBook as any)?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).bookMainData.datosIA.BookNotes;
        }
        // Opción 4: Si no encuentra notas, eliminar manualmente
        else {
          console.log('⚠️ No se encontraron notas en la respuesta, eliminando manualmente');
          setNotes(notes.filter(note => note.id !== noteId));
          if (selectedNote?.id === noteId) {
            setSelectedNote(null);
          }
          console.log('Comentario eliminado exitosamente (manual)');
          return;
        }
        
        console.log('📝 Notas crudas del backend después de eliminar:', rawBookNotes);
        
        // Obtener las notas actualizadas y normalizarlas
        const normalizedNotes = rawBookNotes.map(normalizeNote);
        console.log('📝 Notas normalizadas después de eliminar:', normalizedNotes);
        
        // Actualizar estado local
        setNotes(normalizedNotes);
        setBook(updatedBook);
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
        console.log('Comentario eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
      alert('Error al eliminar el comentario. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Iniciar edición de nota
  const handleStartEdit = (note: BookNote) => {
    setEditingNote({
      id: note.id,
      tipo: note.tipo,
      titulo: note.titulo,
      contenido: note.contenido,
      capitulo: note.capitulo,
      pagina: note.pagina,
      ubicacion: note.ubicacion,
      tags: note.tags,
      destacada: note.destacada,
      color: note.color
    });
    setIsEditing(true);
  };

  // Guardar edición de nota
  const handleSaveEdit = async () => {
    if (!editingNote.titulo || !editingNote.contenido || !selectedNote || !book || !twinId) {
      return;
    }
    
    try {
      setSaving(true);
      
      const updatedNoteData: Partial<BookNote> = {
        tipo: editingNote.tipo,
        titulo: editingNote.titulo,
        contenido: editingNote.contenido,
        capitulo: editingNote.capitulo || '',
        pagina: editingNote.pagina,
        ubicacion: editingNote.ubicacion || '',
        tags: editingNote.tags || [],
        destacada: editingNote.destacada || false,
        color: editingNote.color || '#3B82F6'
      };
      
      console.log('📤 Actualizando nota en backend:', updatedNoteData);
      
      // Actualizar en el backend
      const updatedBook = await booksApiService.updateNoteInBook(twinId, book.id, selectedNote.id, updatedNoteData);
      
      if (updatedBook) {
        console.log('📦 Respuesta del backend después de actualizar:', updatedBook);
        
        // Intentar obtener las notas de diferentes estructuras posibles
        let rawBookNotes = [];
        
        // Opción 1: Estructura con data.bookMainData
        if ((updatedBook as any)?.data?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.BookNotes;
        }
        // Opción 2: Estructura con data.bookMainData con bookNotes (camelCase)
        else if ((updatedBook as any)?.data?.bookMainData?.datosIA?.bookNotes) {
          rawBookNotes = (updatedBook as any).data.bookMainData.datosIA.bookNotes;
        }
        // Opción 3: Estructura directa con bookMainData
        else if ((updatedBook as any)?.bookMainData?.datosIA?.BookNotes) {
          rawBookNotes = (updatedBook as any).bookMainData.datosIA.BookNotes;
        }
        // Opción 4: Si no encuentra notas, mantener las actuales y actualizar manualmente
        else {
          console.log('⚠️ No se encontraron notas en la respuesta, actualizando manualmente');
          const updatedNotes = notes.map(note => 
            note.id === selectedNote.id 
              ? { ...note, ...updatedNoteData }
              : note
          );
          setNotes(updatedNotes);
          setSelectedNote({ ...selectedNote, ...updatedNoteData });
          setIsEditing(false);
          setEditingNote({});
          console.log('Comentario actualizado exitosamente (manual)');
          return;
        }
        
        console.log('📝 Notas crudas del backend después de actualizar:', rawBookNotes);
        
        // Normalizar las notas para el frontend
        const normalizedNotes = rawBookNotes.map(normalizeNote);
        console.log('📝 Notas normalizadas después de actualizar:', normalizedNotes);
        
        // Encontrar la nota actualizada
        const updatedNote = normalizedNotes.find((note: BookNote) => note.id === selectedNote.id);
        console.log('🎯 Nota actualizada encontrada:', updatedNote);
        
        // Actualizar estado local
        setNotes(normalizedNotes);
        setSelectedNote(updatedNote || { ...selectedNote, ...updatedNoteData });
        setBook(updatedBook);
        setIsEditing(false);
        setEditingNote({});
        console.log('Comentario actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar el comentario:', error);
      alert('Error al actualizar el comentario. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote({});
  };

  // Obtener ícono del tipo de comentario
  const getTypeIcon = (type: string) => {
    const noteType = noteTypes.find(t => t.value === type);
    return noteType ? noteType.icon : FileText;
  };

  // Obtener color del tipo de comentario
  const getTypeColor = (type: string) => {
    const noteType = noteTypes.find(t => t.value === type);
    return noteType ? noteType.color : '#3B82F6';
  };

  // Configuración de ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'code-block', 'list', 'bullet', 'color', 'background', 'link'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar el libro</p>
          <Button 
            onClick={() => navigate('/conocimiento')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Volver a Libros
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información del libro */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/conocimiento')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Libros</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <BookIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{book.titulo}</h1>
                  <p className="text-sm text-gray-600">por {book.autor}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {book.añoPublicacion && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{book.añoPublicacion}</span>
                </div>
              )}
              
              {book.genero && (
                <Badge variant="secondary" className="text-xs">
                  {book.genero}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Lista de comentarios */}
          <div className="w-1/4 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
            {/* Header del sidebar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">Comentarios</h2>
                <Button
                  onClick={() => setIsCreating(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo</span>
                </Button>
              </div>
              
              {/* Barra de búsqueda */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar comentarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por página */}
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none"
                >
                  <option value="all">Todas las páginas</option>
                  {availablePages.length > 0 && (
                    <>
                      <option disabled>──────────</option>
                      {availablePages.map(page => (
                        <option key={page} value={page.toString()}>
                          Página {page}
                        </option>
                      ))}
                    </>
                  )}
                  {availablePages.length === 0 && (
                    <option disabled>No hay páginas con notas</option>
                  )}
                </select>
                {/* Icono de flecha para el select */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Información de filtro */}
              {(searchTerm || (pageFilter && pageFilter !== 'all')) && (
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Mostrando {filteredNotes.length} de {notes.length} comentarios
                    {searchTerm && ` • Búsqueda: "${searchTerm}"`}
                    {pageFilter && pageFilter !== 'all' && ` • Página: ${pageFilter}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setPageFilter('all');
                    }}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                </div>
              )}
            </div>

            {/* Lista de comentarios */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No hay comentarios aún</p>
                  <p className="text-xs text-gray-400 mt-1">Crea tu primer comentario</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredNotes.map((note) => {
                    const TypeIcon = getTypeIcon(note.tipo);
                    const isSelected = selectedNote?.id === note.id;
                    
                    return (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className={`p-3 rounded-lg cursor-pointer border-l-4 transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-l-blue-500' 
                            : 'bg-gray-50 border-l-gray-300 hover:bg-gray-100'
                        }`}
                        style={{
                          borderLeftColor: isSelected ? undefined : note.color
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <TypeIcon className="w-4 h-4 flex-shrink-0" style={{ color: note.color }} />
                              <Badge variant="outline" className="text-xs">{note.tipo}</Badge>
                              {note.destacada && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            </div>
                            
                            <h4 className="font-medium text-sm text-gray-900 truncate">{note.titulo}</h4>
                            
                            <div className="mt-1 space-y-1">
                              {note.capitulo && (
                                <p className="text-xs text-gray-600">📖 {note.capitulo}</p>
                              )}
                              {note.pagina && (
                                <p className="text-xs text-gray-600">📄 Página {note.pagina}</p>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">{note.fecha}</p>
                            
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {note.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-500 p-1"
                            disabled={saving}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
            {isCreating ? (
              /* Formulario de nuevo comentario */
              <div className="h-full flex flex-col">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Nuevo Comentario</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => setIsCreating(false)}
                        disabled={saving}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateNote}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!newNote.titulo || !newNote.contenido || saving}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  {/* Tipo de comentario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de comentario
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {noteTypes.map((type) => {
                        const TypeIcon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setNewNote({ ...newNote, tipo: type.value as any, color: type.color })}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              newNote.tipo === type.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <TypeIcon className="w-4 h-4" style={{ color: type.color }} />
                              <span className="text-sm font-medium">{type.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del comentario
                    </label>
                    <input
                      type="text"
                      value={newNote.titulo || ''}
                      onChange={(e) => setNewNote({ ...newNote, titulo: e.target.value })}
                      placeholder="Ej: Mi reflexión sobre el capítulo 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Ubicación en el libro */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capítulo (opcional)
                      </label>
                      <input
                        type="text"
                        value={newNote.capitulo || ''}
                        onChange={(e) => setNewNote({ ...newNote, capitulo: e.target.value })}
                        placeholder="Ej: Capítulo 5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Página (opcional)
                      </label>
                      <input
                        type="number"
                        value={newNote.pagina || ''}
                        onChange={(e) => setNewNote({ ...newNote, pagina: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="127"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido del comentario
                    </label>
                    <div className="h-64">
                      <ReactQuill
                        theme="snow"
                        value={newNote.contenido || ''}
                        onChange={(content) => setNewNote({ ...newNote, contenido: content })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Escribe tu comentario aquí..."
                        className="h-48"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="importante, relectura, concepto-clave (separadas por comas)"
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setNewNote({ ...newNote, tags });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Destacada */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="destacada"
                      checked={newNote.destacada || false}
                      onChange={(e) => setNewNote({ ...newNote, destacada: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="destacada" className="ml-2 block text-sm text-gray-700">
                      Marcar como destacada
                    </label>
                  </div>
                </div>
              </div>
            ) : selectedNote ? (
              /* Vista de comentario seleccionado */
              <div className="h-full flex flex-col">
                {isEditing ? (
                  /* Formulario de edición */
                  <>
                    <div className="p-6 border-b bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Editar Comentario</h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!editingNote.titulo || !editingNote.contenido || saving}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {saving ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      {/* Tipo de comentario */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de comentario
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {noteTypes.map((type) => {
                            const TypeIcon = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setEditingNote({ ...editingNote, tipo: type.value as any, color: type.color })}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  editingNote.tipo === type.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <TypeIcon className="w-4 h-4" style={{ color: type.color }} />
                                  <span className="text-sm font-medium">{type.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título del comentario
                        </label>
                        <input
                          type="text"
                          value={editingNote.titulo || ''}
                          onChange={(e) => setEditingNote({ ...editingNote, titulo: e.target.value })}
                          placeholder="Ej: Mi reflexión sobre el capítulo 5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Ubicación en el libro */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capítulo (opcional)
                          </label>
                          <input
                            type="text"
                            value={editingNote.capitulo || ''}
                            onChange={(e) => setEditingNote({ ...editingNote, capitulo: e.target.value })}
                            placeholder="Ej: Capítulo 5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Página (opcional)
                          </label>
                          <input
                            type="number"
                            value={editingNote.pagina || ''}
                            onChange={(e) => setEditingNote({ ...editingNote, pagina: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="127"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenido del comentario
                        </label>
                        <div className="h-64">
                          <ReactQuill
                            theme="snow"
                            value={editingNote.contenido || ''}
                            onChange={(content) => setEditingNote({ ...editingNote, contenido: content })}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Escribe tu comentario aquí..."
                            className="h-48"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiquetas (opcional)
                        </label>
                        <input
                          type="text"
                          value={editingNote.tags?.join(', ') || ''}
                          placeholder="importante, relectura, concepto-clave (separadas por comas)"
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                            setEditingNote({ ...editingNote, tags });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Destacada */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="destacada-edit"
                          checked={editingNote.destacada || false}
                          onChange={(e) => setEditingNote({ ...editingNote, destacada: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="destacada-edit" className="ml-2 block text-sm text-gray-700">
                          Marcar como destacada
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Vista normal del comentario */
                  <>
                    <div className="p-6 border-b bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {React.createElement(getTypeIcon(selectedNote.tipo), { 
                              className: "w-5 h-5", 
                              style: { color: selectedNote.color } 
                            })}
                            <Badge variant="outline">{selectedNote.tipo}</Badge>
                            {selectedNote.destacada && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedNote.titulo}</h3>
                          
                          <div className="mt-3 space-y-1 text-sm text-gray-600">
                            {selectedNote.capitulo && <div><strong>Capítulo:</strong> {selectedNote.capitulo}</div>}
                            {selectedNote.pagina && <div><strong>Página:</strong> {selectedNote.pagina}</div>}
                            {selectedNote.ubicacion && <div><strong>Ubicación:</strong> {selectedNote.ubicacion}</div>}
                            <div><strong>Fecha:</strong> {selectedNote.fecha}</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleStartEdit(selectedNote)}
                            className="text-gray-600 hover:text-blue-600"
                            disabled={saving}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteNote(selectedNote.id)}
                            className="text-gray-400 hover:text-red-500"
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedNote.contenido }}
                      />
                      
                      {selectedNote.tags.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Vista inicial */
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="mb-6">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Información del Libro</h3>
                    <div className="space-y-2 text-sm text-gray-600 max-w-md mx-auto">
                      <div><strong>Título:</strong> {book.titulo}</div>
                      <div><strong>Autor:</strong> {book.autor}</div>
                      {book.genero && <div><strong>Género:</strong> {book.genero}</div>}
                      {book.añoPublicacion && <div><strong>Publicación:</strong> {book.añoPublicacion}</div>}
                      {book.descripcion && <div><strong>Descripción:</strong> {book.descripcion}</div>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-gray-600">Selecciona un comentario del panel izquierdo</p>
                    <p className="text-gray-600">o crea uno nuevo para comenzar</p>
                  </div>
                  
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Comentario
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNotesPage;