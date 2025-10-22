import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText, Database, RefreshCw, Search, Eye, Trash2, Calendar } from 'lucide-react';
import { documentApiService } from '../services/documentApiService';
import { useMsal } from '@azure/msal-react';

const SUBCATEGORIAS_ESTRUCTURADOS = [
  'CSV',
  'JSON',
  'XML',
  'Base de datos'
];

const DocumentosEstructurados: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tieneIndice, setTieneIndice] = useState<boolean>(false);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Estados para la lista de documentos
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSubcategory, setCurrentSubcategory] = useState('CSV');

  // Obtener Twin ID del usuario actual
  const twinId = accounts && accounts.length > 0 ? accounts[0].localAccountId : null;

  // Cargar documentos al montar el componente
  useEffect(() => {
    if (twinId) {
      cargarDocumentos();
    }
  }, [twinId, currentSubcategory]);

  const cargarDocumentos = async () => {
    if (!twinId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Cargando documentos estructurados: ${currentSubcategory}`);
      
      const response = await documentApiService.listStructuredDocuments(
        twinId,
        'estructurado',
        currentSubcategory
      );
      
      if (response.success && response.documents) {
        setDocumentos(response.documents);
        console.log(`✅ ${response.documents.length} documentos cargados`);
      } else {
        setDocumentos([]);
      }
    } catch (error) {
      console.error('❌ Error cargando documentos:', error);
      setError(`Error cargando documentos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubirDocumento = (subcategoria: string) => {
    setSelectedSubcategoria(subcategoria);
    setIsUploadModalOpen(true);
    setSelectedFile(null);
    setTieneIndice(false);
    setTotalPaginas(1);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipos de archivo para estructurados
      const allowedTypes = ['text/csv', 'application/json', 'text/xml', 'application/xml', 'application/sql', 'application/x-sqlite3'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|json|xml|sql|db)$/i)) {
        setUploadError('Tipo de archivo no permitido. Solo se permiten CSV, JSON, XML, SQL, DB');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSubcategoria) {
      setUploadError('Por favor selecciona un archivo y subcategoría');
      return;
    }

    // Validación: documentos de más de 30 páginas deben tener índice
    if (totalPaginas > 30 && !tieneIndice) {
      setUploadError('Los documentos de más de 30 páginas deben tener un índice');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const currentAccount = accounts[0];
      if (!currentAccount) {
        throw new Error('No hay usuario autenticado');
      }

      const twinId = currentAccount.localAccountId;

      await documentApiService.uploadNoStructuredDocument(
        twinId,
        selectedFile,
        selectedSubcategoria,
        'Estructurado',
        totalPaginas,
        tieneIndice
      );

      setUploadSuccess('Documento subido exitosamente');
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error al subir documento:', error);
      setUploadError('Error al subir el documento. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setSelectedSubcategoria('');
    setUploadError(null);
    setUploadSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/twin-biografia/archivos-personales')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Documentos Estructurados
          </h1>
        </div>

        {/* Descripción */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            Los documentos estructurados contienen datos organizados en formato predefinido con estructura clara. 
            Son ideales para análisis automático, importación de datos y procesamiento sistemático.
          </p>
        </div>

        {/* Grid de subcategorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBCATEGORIAS_ESTRUCTURADOS.map((subcategoria) => (
            <div
              key={subcategoria}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {subcategoria}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {subcategoria === 'CSV' && 'Archivos de valores separados por comas, hojas de cálculo'}
                  {subcategoria === 'JSON' && 'Datos JavaScript Object Notation, APIs y configuraciones'}
                  {subcategoria === 'XML' && 'Documentos de marcado extensible, intercambio de datos'}
                  {subcategoria === 'Base de datos' && 'Archivos de base de datos SQL, SQLite, dumps'}
                </p>
                <button
                  onClick={() => handleSubirDocumento(subcategoria)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {subcategoria}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de documentos CSV existentes */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Archivos CSV Procesados
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar archivos CSV..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Botón de actualizar */}
              <button
                onClick={cargarDocumentos}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Contenido de documentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mr-3" />
              <p className="text-gray-600">Cargando archivos CSV...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={cargarDocumentos}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : documentos.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay archivos CSV
              </h3>
              <p className="text-gray-600 mb-6">
                Sube tu primer archivo CSV usando los botones de arriba
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentos
                .filter(doc => 
                  doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  doc.subcategoria?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((documento, index) => (
                  <div
                    key={`${documento.fileName}_${index}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
                  >
                    {/* Header con ícono */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                      <div className="flex items-center justify-between">
                        <FileText className="h-8 w-8 text-white" />
                        <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-medium">
                          CSV
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-green-700 mb-2 line-clamp-2 group-hover:text-green-800 transition-colors">
                        {documento.fileName}
                      </h3>
                      
                      {/* Información del archivo */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {documento.uploadDate ? 
                              new Date(documento.uploadDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) 
                              : 'Fecha no disponible'
                            }
                          </span>
                        </div>
                        
                        {documento.fileSize && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Database className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{(documento.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // TODO: Implementar visualización de CSV
                            console.log('Ver CSV:', documento.fileName);
                          }}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Implementar eliminación
                            console.log('Eliminar CSV:', documento.fileName);
                          }}
                          className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Modal de upload */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Subir Documento: {selectedSubcategoria}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Selección de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.json,.xml,.sql,.db"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos soportados: CSV, JSON, XML, SQL, DB
                  </p>
                </div>

                {/* Campos de validación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total de páginas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={totalPaginas}
                      onChange={(e) => setTotalPaginas(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Tiene índice?
                    </label>
                    <select
                      value={tieneIndice.toString()}
                      onChange={(e) => setTieneIndice(e.target.value === 'true')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                </div>

                {/* Validación de páginas */}
                {totalPaginas > 30 && !tieneIndice && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      ⚠️ Los documentos de más de 30 páginas deben tener un índice
                    </p>
                  </div>
                )}

                {/* Mensajes de error y éxito */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{uploadError}</p>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">{uploadSuccess}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading || (totalPaginas > 30 && !tieneIndice)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Documento
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentosEstructurados;