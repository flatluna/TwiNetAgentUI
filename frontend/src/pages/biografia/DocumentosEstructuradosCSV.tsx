import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText, Database, RefreshCw, Search, Eye, Trash2, Calendar, Plus } from 'lucide-react';
import { documentApiService } from '../../services/documentApiService';
import { useMsal } from '@azure/msal-react';

const DocumentosEstructuradosCSV: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Estados para la lista de documentos
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');



  // Obtener Twin ID del usuario actual
  const twinId = accounts && accounts.length > 0 ? accounts[0].localAccountId : null;

  // Cargar documentos al montar el componente
  useEffect(() => {
    if (twinId) {
      cargarDocumentos();
    }
  }, [twinId]);

  const cargarDocumentos = async () => {
    if (!twinId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Cargando metadata de archivos CSV (sin registros para rapidez)`);
      
      const files = await documentApiService.getCSVFilesMetadata(twinId);
      
      setDocumentos(files);
      console.log(`✅ ${files.length} archivos CSV metadata cargados`);
    } catch (error) {
      console.error('❌ Error cargando metadata de archivos CSV:', error);
      setError(`Error cargando archivos CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo CSV
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        setUploadError('Solo se permiten archivos CSV');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor selecciona un archivo CSV');
      return;
    }

    if (!twinId) {
      setUploadError('No se pudo obtener el ID del usuario');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('📊 Subiendo archivo CSV específico');
      const response = await documentApiService.uploadCSVDocument(twinId, selectedFile);

      if (response.success) {
        setUploadSuccess(`Archivo CSV "${selectedFile.name}" subido exitosamente`);
        setSelectedFile(null);
        setIsUploadModalOpen(false);
        // Recargar la lista de documentos
        cargarDocumentos();
      } else {
        setUploadError(`Error al subir archivo CSV: ${response.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadError(`Error al subir archivo CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/twin-biografia/archivos-personales/estructurados')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Archivos CSV
              </h1>
              <p className="text-gray-600 mt-1">
                Archivos de valores separados por comas, hojas de cálculo
              </p>
            </div>
          </div>
          
          {/* Botón de subir nuevo archivo */}
          <button
            onClick={handleOpenUploadModal}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Subir CSV
          </button>
        </div>

        {/* Descripción */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800">
            Los archivos CSV contienen datos tabulares estructurados que pueden ser procesados y analizados automáticamente. 
            Ideales para importar datos desde hojas de cálculo y bases de datos.
          </p>
        </div>

        {/* Sección de documentos CSV */}
        <div>
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
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              <RefreshCw className="h-8 w-8 text-green-600 animate-spin mr-3" />
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
                Sube tu primer archivo CSV usando el botón "Subir CSV"
              </p>
              <button
                onClick={handleOpenUploadModal}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2 inline" />
                Subir primer CSV
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentos
                .filter(doc => 
                  (doc.fileName || doc.FileName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (doc.filePath || doc.FilePath)?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((documento, index) => (
                  <div
                    key={`${documento.id || documento.Id}_${index}`}
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
                        {documento.fileName || documento.FileName || `CSV-${index + 1}`}
                      </h3>
                      
                      {/* Información del archivo CSV */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {(documento.processedAt || documento.ProcessedAt) ? 
                              new Date(documento.processedAt || documento.ProcessedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) 
                              : 'Fecha no disponible'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Database className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{documento.totalRows || documento.TotalRows} filas × {documento.totalColumns || documento.TotalColumns} columnas</span>
                        </div>

                        {(documento.success || documento.Success) ? (
                          <div className="flex items-center text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            <span>Procesado exitosamente</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-red-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                            <span>Error en procesamiento</span>
                          </div>
                        )}
                      </div>

                      {/* Acción - Abrir página de detalles */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/twin-biografia/archivos-personales/estructurados/csv/${documento.id || documento.Id}`)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Datos
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Implementar eliminación
                            console.log('Eliminar CSV:', documento.fileName || documento.FileName);
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Subir archivo CSV
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {uploadSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{uploadSuccess}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Selector de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo CSV
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,text/csv"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isUploading}
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                </div>

                {uploadError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{uploadError}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir archivo CSV
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

export default DocumentosEstructuradosCSV;