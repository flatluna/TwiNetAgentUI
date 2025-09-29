import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTwinId } from '@/hooks/useTwinId';

const AgregarCursoConDocumentoPage: React.FC = () => {
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Información adicional del curso
  const [courseInfo, setCourseInfo] = useState({
    nombre: '',
    descripcion: '',
    notas: '',
    // Información del documento
    numeroPaginas: '',
    tieneIndice: '',
    paginaInicioIndice: '',
    paginaFInIndice: ''
  });

  // Tipos de archivo permitidos
  const allowedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.ppt',
    '.pptx'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    setError(null);
    
    // Validar tamaño
    if (file.size > maxFileSize) {
      setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      return;
    }
    
    // Validar tipo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setError('Tipo de archivo no permitido. Formatos válidos: PDF, DOC, DOCX, TXT, PPT, PPTX.');
      return;
    }
    
    setUploadedFile(file);
    setSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    
    if (file) {
      // Crear un evento simulado para reutilizar la lógica de validación
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelect(fakeEvent);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <File className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'txt':
        return <FileText className="w-8 h-8 text-gray-500" />;
      case 'ppt':
      case 'pptx':
        return <File className="w-8 h-8 text-orange-500" />;
      default:
        return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  const handleProcessDocument = async () => {
    if (!uploadedFile || !twinId) {
      setError('Faltan datos necesarios para procesar el documento.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Crear FormData para enviar archivo + datos adicionales
      const formData = new FormData();
      
      // Agregar el archivo con el nombre que espera el backend
      formData.append('document', uploadedFile); // Cambiar de 'documento' a 'document'
      
      // Agregar información adicional como JSON
      const documentoInfo = {
        nombre: courseInfo.nombre || uploadedFile.name.replace(/\.[^/.]+$/, ""), // Nombre sin extensión si no se especifica
        descripcion: courseInfo.descripcion || '',
        notas: courseInfo.notas || '',
        numeroPaginas: courseInfo.numeroPaginas ? parseInt(courseInfo.numeroPaginas) : null,
        tieneIndice: courseInfo.tieneIndice === 'si',
        paginaInicioIndice: courseInfo.tieneIndice === 'si' && courseInfo.paginaInicioIndice 
          ? parseInt(courseInfo.paginaInicioIndice) 
          : null,
        paginaFInIndice: courseInfo.tieneIndice === 'si' && courseInfo.paginaFInIndice 
          ? parseInt(courseInfo.paginaFInIndice) 
          : null,
        // Información del archivo
        nombreArchivo: uploadedFile.name,
        tipoArchivo: uploadedFile.type,
        tamanoArchivo: uploadedFile.size
      };
      
      // Agregar información adicional con el nombre que espera el backend
      formData.append('courseConfig', JSON.stringify(documentoInfo)); // Cambiar de 'documentoInfo' a 'courseConfig'
      
      console.log('🚀 Procesando documento:', uploadedFile.name);
      console.log('📝 Información adicional:', documentoInfo);
      console.log('👤 TwinId:', twinId);

      // Generar un cursoId temporal para el documento
      const tempCursoId = `temp-${Date.now()}`;
      
      // Crear el path del archivo (codificado para URL)
      const encodedFileName = encodeURIComponent(uploadedFile.name);
      
      // Llamada al endpoint: POST /api/twins/{twinId}/cursos/{cursoId}/upload-document/{filePath}
      const response = await fetch(`/api/twins/${twinId}/cursos/${tempCursoId}/upload-document/${encodedFileName}`, {
        method: 'POST',
        body: formData // No agregar Content-Type header, el browser lo hace automáticamente con boundary
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new Error(`Error HTTP ${response.status}: ${errorData || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Documento procesado exitosamente:', result);
      
      setSuccess(true);
      
      // Redirigir al curso creado o a la lista de cursos
      setTimeout(() => {
        if (result.cursoId) {
          navigate(`/mi-conocimiento/cursos/detalles/${result.cursoId}`);
        } else {
          navigate('/mi-conocimiento/cursos');
        }
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error al procesar documento:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar el documento. Por favor intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (twinIdLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/mi-conocimiento/cursos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Cursos
        </Button>
        <div className="h-6 w-px bg-gray-300"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agregar Curso con Documento
          </h1>
          <p className="text-gray-600">
            Sube un documento y crearemos un curso personalizado para ti
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">¡Éxito!</span>
          </div>
          <p className="text-green-700 mt-1">Documento procesado correctamente. Redirigiendo...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Área de Subida de Archivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Arrastra y suelta tu documento aquí
                </h3>
                <p className="text-gray-500 mb-4">
                  O haz clic para seleccionar un archivo
                </p>
                <div className="text-sm text-gray-400">
                  <p>Formatos permitidos: PDF, DOC, DOCX, TXT, PPT, PPTX</p>
                  <p>Tamaño máximo: 10MB</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedFileTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(uploadedFile.name)}
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información Adicional del Curso */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Curso (Opcional)</Label>
              <Input
                id="nombre"
                value={courseInfo.nombre}
                onChange={(e) => setCourseInfo(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Fundamentos de Machine Learning"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <Textarea
                id="descripcion"
                value={courseInfo.descripcion}
                onChange={(e) => setCourseInfo(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe brevemente el contenido del documento..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas Personales (Opcional)</Label>
              <Textarea
                id="notas"
                value={courseInfo.notas}
                onChange={(e) => setCourseInfo(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Agrega notas o comentarios personales..."
                rows={3}
              />
            </div>

            {/* Separador visual */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Documento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroPaginas">¿Cuántas páginas tiene?</Label>
                  <Input
                    id="numeroPaginas"
                    type="number"
                    min="1"
                    value={courseInfo.numeroPaginas}
                    onChange={(e) => setCourseInfo(prev => ({ ...prev, numeroPaginas: e.target.value }))}
                    placeholder="Ej: 120"
                  />
                </div>

                <div>
                  <Label htmlFor="tieneIndice">¿Tiene índice?</Label>
                  <select
                    id="tieneIndice"
                    value={courseInfo.tieneIndice}
                    onChange={(e) => setCourseInfo(prev => ({ ...prev, tieneIndice: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {courseInfo.tieneIndice === 'si' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="paginaInicioIndice">¿En qué página comienza el índice?</Label>
                    <Input
                      id="paginaInicioIndice"
                      type="number"
                      min="1"
                      value={courseInfo.paginaInicioIndice}
                      onChange={(e) => setCourseInfo(prev => ({ ...prev, paginaInicioIndice: e.target.value }))}
                      placeholder="Ej: 3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="paginaFInIndice">¿Donde termina el índice?</Label>
                    <Input
                      id="paginaFInIndice"
                      type="number"
                      min="1"
                      value={courseInfo.paginaFInIndice}
                      onChange={(e) => setCourseInfo(prev => ({ ...prev, paginaFInIndice: e.target.value }))}
                      placeholder="Ej: 5"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información sobre el proceso */}
      {uploadedFile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>¿Qué haremos con tu documento?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Análisis</h3>
                <p className="text-sm text-gray-600">
                  Analizaremos el contenido de tu documento para extraer información clave
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Estructuración</h3>
                <p className="text-sm text-gray-600">
                  Organizaremos el contenido en capítulos y secciones lógicas
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Creación</h3>
                <p className="text-sm text-gray-600">
                  Generaremos un curso completo con capítulos y material de estudio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de Procesamiento */}
      {uploadedFile && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleProcessDocument}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 px-8"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando Documento...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Crear Curso desde Documento
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgregarCursoConDocumentoPage;