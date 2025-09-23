import { Book, BookNote } from '@/types/conocimiento';

/**
 * API service for books management
 */
class BooksApiService {
  private baseUrl: string;

  constructor() {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011';
    // Remover /api del final si ya está incluido para evitar duplicación
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
    }
    this.baseUrl = baseUrl;
    console.log('🔧 BooksApiService baseUrl configurado:', this.baseUrl);
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Update a book (including adding new notes/comments)
   */
  async updateBook(twinId: string, bookId: string, bookData: Partial<Book>): Promise<Book | null> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/api/twins/${twinId}/books/${bookId}`;
      
      console.log('🌐 Haciendo PUT request a:', url);
      console.log('📤 Headers:', headers);
      console.log('📤 Body:', JSON.stringify(bookData, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bookData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating book:', response.status, errorText);
        throw new Error(`Error updating book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateBook:', error);
      throw error;
    }
  }

  /**
   * Get a book by ID
   */
  async getBook(twinId: string, bookId: string): Promise<Book | null> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/twins/${twinId}/books/${bookId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        console.error('Error getting book:', response.status, errorText);
        throw new Error(`Error getting book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getBook:', error);
      throw error;
    }
  }

  /**
   * Add a note/comment to a book
   * This method handles the full workflow:
   * 1. Gets the current book data
   * 2. Adds the new note to the book's notes array
   * 3. Updates the book via the UpdateBook endpoint
   */
  async addNoteToBook(twinId: string, bookId: string, newNote: BookNote): Promise<Book | null> {
    try {
      console.log('🔧 addNoteToBook iniciado:', { twinId, bookId, newNote });
      
      // 1. Get current book data
      const currentBook = await this.getBook(twinId, bookId);
      console.log('📚 Libro actual obtenido:', currentBook);
      
      if (!currentBook) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      // 2. Add the new note to the book's notes array
      const bookMainData = (currentBook as any).data?.bookMainData;
      let currentNotes = bookMainData?.datosIA?.BookNotes || [];
      
      // If no notes in BookNotes, try bookNotes (camelCase)
      if (currentNotes.length === 0) {
        currentNotes = bookMainData?.datosIA?.bookNotes || [];
      }
      
      console.log('📝 Notas actuales antes de agregar:', currentNotes);
      
      const updatedNotes = [...currentNotes, newNote];
      console.log('📝 Notas actualizadas después de agregar:', updatedNotes);

      // 3. Prepare the updated book data following backend structure
      const bookData = (currentBook as any).data;
      
      // Send only the bookMainData structure that the backend expects (BookMain)
      const updatedBookData = {
        ...bookData.bookMainData, // Extract bookMainData directly
        datosIA: {
          ...bookData.bookMainData.datosIA,
          BookNotes: updatedNotes  // Only use BookNotes (remove any bookNotes duplication)
        },
        updatedAt: new Date().toISOString()
      };

      // Remove any duplicate bookNotes property if it exists to avoid confusion
      if ('bookNotes' in updatedBookData.datosIA) {
        delete (updatedBookData.datosIA as any).bookNotes;
      }
      
      console.log('📤 Datos del libro a enviar:', updatedBookData);      
      
      // 4. Update the book - Send the data as BookMain structure directly
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/api/twins/${twinId}/books/${bookId}`;
      
      console.log('🌐 Haciendo PUT request a:', url);
      console.log('📤 Headers:', headers);
      console.log('📤 Body:', JSON.stringify(updatedBookData, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBookData) // Send BookMain structure directly
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating book:', response.status, errorText);
        throw new Error(`Error updating book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding note to book:', error);
      throw error;
    }
  }

  /**
   * Update a specific note in a book
   */
  async updateNoteInBook(twinId: string, bookId: string, noteId: string, updatedNote: Partial<BookNote>): Promise<Book | null> {
    try {
      // 1. Get current book data
      const currentBook = await this.getBook(twinId, bookId);
      if (!currentBook) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      // 2. Get current notes from all possible locations
      const bookMainData = (currentBook as any).data?.bookMainData;
      let currentNotes = bookMainData?.datosIA?.BookNotes || [];
      
      // If no notes in BookNotes, try bookNotes (camelCase)
      if (currentNotes.length === 0) {
        currentNotes = bookMainData?.datosIA?.bookNotes || [];
      }
      
      console.log('📝 Notas actuales antes de actualizar:', currentNotes);
      console.log('🎯 Actualizando nota con ID:', noteId);
      console.log('📤 Datos de actualización:', updatedNote);
      
      // 3. Update the specific note in the array
      const updatedNotes = currentNotes.map((note: any) => 
        note.id === noteId 
          ? { 
              ...note, 
              ...updatedNote,
              updatedAt: new Date().toISOString() // Add timestamp
            } 
          : note
      );
      
      console.log('📝 Notas después de actualizar:', updatedNotes);
      
      // 4. Prepare the updated book data following backend structure
      const bookData = (currentBook as any).data;
      const updatedBookData = {
        ...bookData.bookMainData, // Extract bookMainData directly
        datosIA: {
          ...bookData.bookMainData.datosIA,
          BookNotes: updatedNotes // Use the updated notes array
        },
        updatedAt: new Date().toISOString()
      };

      // Remove any duplicate bookNotes property if it exists to avoid confusion
      if ('bookNotes' in updatedBookData.datosIA) {
        delete (updatedBookData.datosIA as any).bookNotes;
      }

      console.log('📤 Datos del libro a enviar (actualización de nota):', updatedBookData);

      // 5. Update the book - Send the data as BookMain structure directly
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/api/twins/${twinId}/books/${bookId}`;
      
      console.log('🌐 Haciendo PUT request a:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBookData) // Send BookMain structure directly
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating book:', response.status, errorText);
        throw new Error(`Error updating book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating note in book:', error);
      throw error;
    }
  }

  /**
   * Delete a note from a book
   */
  async deleteNoteFromBook(twinId: string, bookId: string, noteId: string): Promise<Book | null> {
    try {
      // 1. Get current book data
      const currentBook = await this.getBook(twinId, bookId);
      if (!currentBook) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      // 2. Remove the note from the array
      const bookMainData = (currentBook as any).data?.bookMainData;
      let currentNotes = bookMainData?.datosIA?.BookNotes || [];
      
      // If no notes in BookNotes, try bookNotes (camelCase)
      if (currentNotes.length === 0) {
        currentNotes = bookMainData?.datosIA?.bookNotes || [];
      }
      
      console.log('📝 Notas actuales antes de eliminar:', currentNotes);
      console.log('🗑️ Eliminando nota con ID:', noteId);
      
      const updatedNotes = currentNotes.filter((note: any) => note.id !== noteId);
      console.log('📝 Notas después de eliminar:', updatedNotes);
      
      // 3. Prepare the updated book data following backend structure
      const bookData = (currentBook as any).data;
      const updatedBookData = {
        ...bookData.bookMainData, // Extract bookMainData directly
        datosIA: {
          ...bookData.bookMainData.datosIA,
          BookNotes: updatedNotes
        },
        updatedAt: new Date().toISOString()
      };

      // Remove any duplicate bookNotes property if it exists to avoid confusion
      if ('bookNotes' in updatedBookData.datosIA) {
        delete (updatedBookData.datosIA as any).bookNotes;
      }

      console.log('📤 Datos del libro a enviar (eliminación de nota):', updatedBookData);

      // 4. Update the book - Send the data as BookMain structure directly
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/api/twins/${twinId}/books/${bookId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBookData) // Send BookMain structure directly
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating book:', response.status, errorText);
        throw new Error(`Error updating book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting note from book:', error);
      throw error;
    }
  }

  /**
   * Get all notes for a specific book
   */
  async getBookNotes(twinId: string, bookId: string): Promise<BookNote[]> {
    try {
      const book = await this.getBook(twinId, bookId);
      // Access notes from the correct location: data.bookMainData.datosIA.BookNotes
      const bookData = (book as any)?.data?.bookMainData;
      let rawNotes = bookData?.datosIA?.BookNotes || [];
      
      // If no notes in BookNotes, try bookNotes (camelCase)
      if (rawNotes.length === 0) {
        rawNotes = bookData?.datosIA?.bookNotes || [];
      }
      
      // Normalize notes to ensure correct data types
      return rawNotes.map((note: any) => ({
        id: note.id,
        bookId: note.bookId,
        tipo: this.mapTipoToString(note.tipo),
        titulo: note.titulo,
        contenido: note.contenido,
        capitulo: note.capitulo || '',
        pagina: note.pagina,
        ubicacion: note.ubicacion || '',
        tags: note.tags || [],
        destacada: note.destacada || false,
        color: note.color || '#3B82F6',
        fecha: note.fecha ? note.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error getting book notes:', error);
      throw error;
    }
  }

  /**
   * Map numeric tipo to string
   */
  private mapTipoToString(tipo: any): string {
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
  }

  /**
   * Update basic book information (without notes)
   */
  async updateBookBasicInfo(twinId: string, bookId: string, bookUpdates: Partial<Book>): Promise<Book | null> {
    try {
      console.log('📝 Actualizando información básica del libro:', bookUpdates);
      
      // 1. Get current book data
      const currentBook = await this.getBook(twinId, bookId);
      if (!currentBook) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      // 2. Prepare the updated book data (preserving existing notes and datosIA)
      const bookData = (currentBook as any).data;
      
      // Send only the bookMainData structure that the backend expects
      const updatedBookData = {
        ...bookData.bookMainData,
        // Update only the basic book information, preserve datosIA and notes
        titulo: bookUpdates.titulo || bookData.bookMainData.titulo,
        autor: bookUpdates.autor || bookData.bookMainData.autor,
        isbn: bookUpdates.isbn || bookData.bookMainData.isbn,
        añoPublicacion: bookUpdates.añoPublicacion || bookData.bookMainData.añoPublicacion,
        calificacion: bookUpdates.calificacion !== undefined ? bookUpdates.calificacion : bookData.bookMainData.calificacion,
        descripcion: bookUpdates.descripcion || bookData.bookMainData.descripcion,
        editorial: bookUpdates.editorial || bookData.bookMainData.editorial,
        estado: bookUpdates.estado || bookData.bookMainData.estado,
        fechaFin: bookUpdates.fechaFin || bookData.bookMainData.fechaFin,
        fechaInicio: bookUpdates.fechaInicio || bookData.bookMainData.fechaInicio,
        fechaLectura: bookUpdates.fechaLectura || bookData.bookMainData.fechaLectura,
        formato: bookUpdates.formato || bookData.bookMainData.formato,
        genero: bookUpdates.genero || bookData.bookMainData.genero,
        paginas: bookUpdates.paginas !== undefined ? bookUpdates.paginas : bookData.bookMainData.paginas,
        portada: bookUpdates.portada || bookData.bookMainData.portada,
        recomendado: bookUpdates.recomendado !== undefined ? bookUpdates.recomendado : bookData.bookMainData.recomendado,
        tags: bookUpdates.tags || bookData.bookMainData.tags,
        updatedAt: new Date().toISOString()
      };

      console.log('📤 Datos del libro a enviar (info básica):', updatedBookData);

      // 3. Update the book - Send the data as BookMain structure directly
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/api/twins/${twinId}/books/${bookId}`;
      
      console.log('🌐 Haciendo PUT request a:', url);
      console.log('📤 Headers:', headers);
      console.log('📤 Body:', JSON.stringify(updatedBookData, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBookData) // Send BookMain structure directly
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating book:', response.status, errorText);
        throw new Error(`Error updating book: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating book basic info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const booksApiService = new BooksApiService();
export default booksApiService;