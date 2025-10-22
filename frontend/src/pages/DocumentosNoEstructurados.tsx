import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Eye, Search, FileText, BookOpen, RefreshCw, Trash2, Calendar, FileIcon, Hash, Sparkles } from 'lucide-react';
import { documentApiService, NoStructuredSearchMetadataResult, type DeleteNoStructuredDocumentResponse } from '../services/documentApiService';
import { useMsal } from '@azure/msal-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const SUBCATEGORIAS_NO_ESTRUCTURADOS = [
  'Contratos',
  'Cursos', 
  'Reportes',
  'Emails',
  'Cartas',
  'Artículos',
  'Otros'
];

interface DocumentoAgrupado {
  documentID: string;
  titulo: string;
  subcategoria: string;
  estructura: string;
  totalCapitulos: number;
  totalPages: number;
  totalTokens: number;
  fechaProcesamiento: string;
  searchScore: number;
}

const DocumentosNoEstructurados: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  
  // Lista de idiomas más importantes para traducción
  const idiomasDisponibles = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Lista de modelos de IA disponibles
  const modelosIA = [
    { code: 'gpt-5-mini', name: 'GPT-5 Mini', icon: '🤖', description: 'Modelo rápido y eficiente' },
    { code: 'gpt4mini', name: 'GPT-4 Mini', icon: '🧠', description: 'Modelo avanzado y preciso' }
  ];
  
  // Estados para upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tieneIndice, setTieneIndice] = useState<boolean>(false);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [paginaInicioIndice, setPaginaInicioIndice] = useState<number>(1);
  const [paginaFinIndice, setPaginaFinIndice] = useState<number>(1);
  const [requiereTraduccion, setRequiereTraduccion] = useState<boolean>(false);
  const [idiomaDestino, setIdiomaDestino] = useState<string>('es');
  const [modeloIA, setModeloIA] = useState<string>('gpt-5-mini');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Estados para listado y filtros
  const [documentosAgrupados, setDocumentosAgrupados] = useState<DocumentoAgrupado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados para el modal de confirmación de borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar documentos al inicializar
  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      setIsLoading(true);
      const currentAccount = accounts[0];
      if (!currentAccount) {
        throw new Error('No hay usuario autenticado');
      }

      const twinId = currentAccount.localAccountId;
      
      // Llamar al nuevo servicio de búsqueda de metadatos (más ligero)
      const response: NoStructuredSearchMetadataResult = await documentApiService.searchNoStructuredDocumentsMetadata(
        twinId, 
        'no-estructurado'
      );
      
      if (response.success && response.documents) {
        // Mapear los metadatos a nuestro formato
        const documentos = response.documents.map(doc => ({
          documentID: doc.documentID,
          titulo: doc.documentTitle,
          subcategoria: doc.subcategoria,
          estructura: doc.estructura,
          totalCapitulos: doc.totalChapters,
          totalPages: doc.totalPages,
          totalTokens: doc.totalTokens,
          fechaProcesamiento: doc.processedAt,
          searchScore: doc.searchScore
        }));
        
        setDocumentosAgrupados(documentos);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const borrarDocumento = async (documentID: string, titulo: string) => {
    // Mostrar modal de confirmación
    setDocumentToDelete({ id: documentID, title: titulo });
    setIsDeleteModalOpen(true);
  };

  const confirmarBorrarDocumento = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      const currentAccount = accounts[0];
      if (!currentAccount) {
        throw new Error('No hay usuario autenticado');
      }

      const twinId = currentAccount.localAccountId;
      
      console.log(`🗑️ Borrando documento: ${documentToDelete.id}`);
      
      const response: DeleteNoStructuredDocumentResponse = await documentApiService.deleteNoStructuredDocument(
        twinId, 
        documentToDelete.id
      );
      
      if (response.success) {
        console.log(`✅ Documento borrado exitosamente: ${response.deletedChaptersCount}/${response.totalChaptersFound} capítulos eliminados`);
        
        // Cerrar modal
        setIsDeleteModalOpen(false);
        setDocumentToDelete(null);
        
        // Recargar la lista de documentos
        await cargarDocumentos();
        
        // Mostrar mensaje de éxito (puedes reemplazar con un toast más elegante)
        alert(`Documento "${documentToDelete.title}" borrado exitosamente.\n${response.deletedChaptersCount} capítulos eliminados.`);
      } else {
        throw new Error(`Error al borrar documento: ${response.message}`);
      }
    } catch (error) {
      console.error('Error al borrar documento:', error);
      alert(`Error al borrar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelarBorrarDocumento = () => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
    setIsDeleting(false);
  };

  // Función para obtener estilos y iconos por subcategoría
  const getSubcategoriaStyle = (subcategoria: string) => {
    switch (subcategoria.toLowerCase()) {
      case 'contratos':
        return {
          bgGradient: 'from-blue-50 to-indigo-100',
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: FileText
        };
      case 'cursos':
        return {
          bgGradient: 'from-purple-50 to-violet-100',
          iconColor: 'text-purple-600',
          badgeBg: 'bg-purple-100',
          badgeText: 'text-purple-800',
          borderColor: 'border-purple-200',
          icon: BookOpen
        };
      case 'reportes':
        return {
          bgGradient: 'from-emerald-50 to-teal-100',
          iconColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-100',
          badgeText: 'text-emerald-800',
          borderColor: 'border-emerald-200',
          icon: FileIcon
        };
      case 'emails':
        return {
          bgGradient: 'from-orange-50 to-amber-100',
          iconColor: 'text-orange-600',
          badgeBg: 'bg-orange-100',
          badgeText: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: FileText
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-slate-100',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: FileText
        };
    }
  };

  // Filtrar documentos
  const documentosFiltrados = documentosAgrupados.filter(doc => {
    const matchSubcategoria = !filtroSubcategoria || doc.subcategoria === filtroSubcategoria;
    
    const matchSearch = !searchQuery || 
      doc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subcategoria.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchSubcategoria && matchSearch;
  });

  const handleSubirDocumento = () => {
    if (!selectedSubcategoria) {
      setUploadError('Por favor selecciona una subcategoría');
      return;
    }
    
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
      // Validación específica para Cursos
      if (selectedSubcategoria === 'Cursos') {
        if (file.type !== 'application/pdf') {
          setUploadError('🚫 Para documentos de Cursos solo se aceptan archivos PDF');
          return;
        }
      } else {
        // Validar tipos de archivo para otras subcategorías
        const allowedTypes = [
          'application/pdf', 
          'image/jpeg', 
          'image/png', 
          'image/tiff',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type)) {
          setUploadError('Tipo de archivo no permitido. Se permiten: PDF, JPEG, PNG, TIFF, TXT, DOC, DOCX');
          return;
        }
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

    // Validación específica para Cursos: máximo 50 páginas
    if (selectedSubcategoria === 'Cursos' && totalPaginas > 50) {
      setUploadError('🚫 Los documentos de Cursos no pueden tener más de 50 páginas');
      return;
    }

    // Validación general: documentos de más de 30 páginas deben tener índice (excepto Cursos)
    if (selectedSubcategoria !== 'Cursos' && totalPaginas > 30 && !tieneIndice) {
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

      console.log('📤 Iniciando subida de documento no estructurado:');
      console.log(`   👤 Twin ID: ${twinId}`);
      console.log(`   📁 Archivo: ${selectedFile.name}`);
      console.log(`   🏷️ Subcategoría: ${selectedSubcategoria}`);
      console.log(`   📄 Total páginas: ${totalPaginas}`);
      console.log(`   📚 Tiene índice: ${tieneIndice ? 'Sí' : 'No'}`);
      console.log(`   📍 Índice páginas: ${tieneIndice ? `${paginaInicioIndice}-${paginaFinIndice}` : 'N/A'}`);
      console.log(`   🌐 Requiere traducción: ${requiereTraduccion ? 'Sí' : 'No'}`);
      console.log(`   🗣️ Idioma destino: ${requiereTraduccion ? idiomasDisponibles.find(i => i.code === idiomaDestino)?.name : 'N/A'}`);
      console.log(`   🤖 Modelo IA: ${selectedSubcategoria === 'Cursos' ? modelosIA.find(m => m.code === modeloIA)?.name : 'N/A'}`);
      console.log(`   📝 Estructura: no-estructurado`);

      const uploadResult = await documentApiService.uploadNoStructuredDocument(
        twinId,
        selectedFile,
        selectedSubcategoria,
        'no-estructurado',
        totalPaginas,
        tieneIndice,
        paginaInicioIndice,
        paginaFinIndice,
        requiereTraduccion,
        idiomaDestino,
        selectedSubcategoria === 'Cursos' ? modeloIA : 'gpt-5-mini'
      );

      console.log('✅ Documento subido exitosamente:', uploadResult);
      
      // Usar los datos reales del backend
      const traduccioMsg = requiereTraduccion 
        ? ` Será traducido a ${idiomasDisponibles.find(i => i.code === idiomaDestino)?.name}.`
        : '';
      
      const processingMsg = uploadResult.processing_time 
        ? ` Procesado en ${uploadResult.processing_time}s.`
        : '';
        
      setUploadSuccess(
        `${uploadResult.message || 'Documento subido exitosamente'} ` +
        `Páginas: ${uploadResult.total_paginas || totalPaginas}, ` +
        `Índice: ${uploadResult.tiene_indice || (tieneIndice ? 'Sí' : 'No')}.` +
        `${traduccioMsg}${processingMsg}`
      );
      
      // Recargar la lista de documentos
      await cargarDocumentos();
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(null);
      }, 4000); // Aumentar tiempo para leer el mensaje con traducción
    } catch (error) {
      console.error('❌ Error al subir documento:', error);
      setUploadError('Error al subir el documento. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setSelectedSubcategoria('');
    setTotalPaginas(1);
    setTieneIndice(false);
    setPaginaInicioIndice(1);
    setPaginaFinIndice(1);
    setRequiereTraduccion(false);
    setIdiomaDestino('es');
    setModeloIA('gpt-5-mini');
    setUploadError(null);
    setUploadSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header principal mejorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/twin-biografia/archivos-personales')}
                className="flex items-center text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Documentos No Estructurados
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestiona y visualiza tus documentos procesados
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Contador de documentos */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    {isLoading ? 'Cargando...' : `${documentosFiltrados.length} documentos`}
                  </span>
                </div>
              </div>
              
              {/* Botón de refresh */}
              <button
                onClick={cargarDocumentos}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800">
            Los documentos no estructurados contienen principalmente texto libre sin una estructura 
            predefinida. Incluyen contratos, reportes, emails, cartas y artículos que requieren 
            análisis de contenido natural.
          </p>
        </div>

        {/* Controles de subida y filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Combo box para seleccionar subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                value={selectedSubcategoria}
                onChange={(e) => setSelectedSubcategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccionar subcategoría</option>
                {SUBCATEGORIAS_NO_ESTRUCTURADOS.map((subcategoria) => (
                  <option key={subcategoria} value={subcategoria}>
                    {subcategoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de subir */}
            <div>
              <button
                onClick={handleSubirDocumento}
                disabled={!selectedSubcategoria}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Subir Documento
              </button>
            </div>

            {/* Filtro por subcategoría para la lista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por subcategoría
              </label>
              <select
                value={filtroSubcategoria}
                onChange={(e) => setFiltroSubcategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas las subcategorías</option>
                {SUBCATEGORIAS_NO_ESTRUCTURADOS.map((subcategoria) => (
                  <option key={subcategoria} value={subcategoria}>
                    {subcategoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar documentos
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o contenido..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Documentos No Estructurados Procesados
              </h2>
              <div className="text-sm text-gray-500">
                {isLoading ? 'Cargando...' : `${documentosFiltrados.length} documentos`}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando documentos...</p>
            </div>
          ) : documentosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filtroSubcategoria || searchQuery ? 'No se encontraron documentos con los filtros aplicados' : 'No hay documentos procesados aún'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los documentos aparecerán aquí una vez que hayan sido procesados por el sistema
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {documentosFiltrados.map((documento, index) => {
                const style = getSubcategoriaStyle(documento.subcategoria);
                const IconComponent = style.icon;
                
                return (
                  <div 
                    key={`${documento.titulo}_${documento.subcategoria}_${index}`} 
                    className={`bg-white border-2 ${style.borderColor} rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group`}
                  >
                    {/* Header de la tarjeta con gradiente personalizado */}
                    <div className={`bg-gradient-to-r ${style.bgGradient} p-4 border-b border-opacity-20 ${style.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                            <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
                          </div>
                          <div>
                            <span className={`text-sm font-semibold ${style.badgeText}`}>
                              {documento.estructura}
                            </span>
                            <div className="flex items-center mt-1">
                              <Sparkles className={`h-3 w-3 ${style.iconColor} mr-1`} />
                              <span className={`text-xs ${style.badgeText} opacity-75`}>
                                Procesado
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`${style.badgeBg} ${style.badgeText} px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>
                          {documento.subcategoria}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-5">
                      <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-3 line-clamp-2 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-indigo-800 transition-all duration-300 leading-tight">
                        {documento.titulo}
                      </h3>
                      
                      {/* Document ID - fuente muy pequeña con icono */}
                      <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
                        <Hash className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500 font-mono break-all">
                          {documento.documentID}
                        </p>
                      </div>
                      
                      {/* Información del documento con ICONOS PROFESIONALES */}
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm mr-3">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <defs>
                                  <linearGradient id="bookGradientPro" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#dc2626" />
                                  </linearGradient>
                                </defs>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#bookGradientPro)" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="url(#bookGradientPro)" stroke="#ffffff" strokeWidth="1"/>
                                <path d="M9 7h6M9 11h6M9 15h4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className="text-base text-orange-700 font-semibold">Capítulos</span>
                          </div>
                          <span className="font-bold px-3 py-1 rounded-lg text-base bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                            {documento.totalCapitulos}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <defs>
                                  <linearGradient id="pageGradientPro" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                  </linearGradient>
                                </defs>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pageGradientPro)" stroke="#ffffff" strokeWidth="1"/>
                                <path d="M14 2v6h6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 13H8M16 17H8M10 9H8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className="text-base text-blue-700 font-semibold">Páginas</span>
                          </div>
                          <span className="font-bold px-3 py-1 rounded-lg text-base bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                            {documento.totalPages}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600 font-medium">Procesado</span>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {new Date(documento.fechaProcesamiento).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción mejorados */}
                      <div className="flex space-x-2">
                        {/* Botón para ver documento */}
                        <button
                          onClick={() => {
                            const currentAccount = accounts[0];
                            if (currentAccount) {
                              const twinId = currentAccount.localAccountId;
                              navigate(`/twin-biografia/archivos-personales/no-estructurados/documento/${encodeURIComponent(twinId)}/${encodeURIComponent(documento.documentID)}`, {
                                state: { twinId, documentID: documento.documentID, documentTitle: documento.titulo }
                              });
                            }
                          }}
                          className={`flex-1 bg-gradient-to-r ${style.bgGradient} ${style.badgeText} border-2 ${style.borderColor} py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 font-semibold`}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Agent Twin Documento</span>
                        </button>
                        
                        {/* Botón para borrar documento */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            borrarDocumento(documento.documentID, documento.titulo);
                          }}
                          className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                          title={`Borrar documento: ${documento.titulo}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Efecto de brillo en hover */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de upload */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedSubcategoria === 'Cursos' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-green-100'
                  }`}>
                    <Upload className={`h-5 w-5 ${
                      selectedSubcategoria === 'Cursos' ? 'text-white' : 'text-green-600'
                    }`} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Subir Documento: {selectedSubcategoria}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Información específica para Cursos */}
              {selectedSubcategoria === 'Cursos' && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        📚 Requisitos para Documentos de Cursos
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-gray-700">
                            <strong>Formato:</strong> Solo se aceptan archivos PDF para garantizar la mejor calidad de procesamiento
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-gray-700">
                            <strong>Límite de páginas:</strong> Máximo 50 páginas por documento
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          <span className="text-gray-700">
                            <strong>Contenido recomendado:</strong> Certificados, diplomas, materiales de estudio, transcripciones
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                          <span className="text-gray-700">
                            <strong>Calidad:</strong> Asegúrate de que el texto sea legible para un mejor procesamiento automático
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Selección de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={selectedSubcategoria === 'Cursos' ? '.pdf' : '.pdf,.jpg,.jpeg,.png,.tiff,.txt,.doc,.docx'}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      selectedSubcategoria === 'Cursos' 
                        ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                  />
                  <p className={`text-sm mt-1 ${
                    selectedSubcategoria === 'Cursos' ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {selectedSubcategoria === 'Cursos' 
                      ? '📄 Solo archivos PDF (máximo 50 páginas)' 
                      : 'Formatos soportados: PDF, JPEG, PNG, TIFF, TXT, DOC, DOCX'
                    }
                  </p>
                </div>

                {/* Campos de validación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total de páginas
                      {selectedSubcategoria === 'Cursos' && (
                        <span className="text-blue-600 font-normal"> (máximo 50)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedSubcategoria === 'Cursos' ? 50 : undefined}
                      value={totalPaginas}
                      onChange={(e) => setTotalPaginas(parseInt(e.target.value) || 1)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        selectedSubcategoria === 'Cursos' 
                          ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                    />
                    {selectedSubcategoria === 'Cursos' && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Para documentos de cursos recomendamos máximo 50 páginas para un procesamiento óptimo
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Tiene índice?
                      {selectedSubcategoria === 'Cursos' && (
                        <span className="text-blue-600 font-normal"> (recomendado)</span>
                      )}
                    </label>
                    <select
                      value={tieneIndice.toString()}
                      onChange={(e) => setTieneIndice(e.target.value === 'true')}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        selectedSubcategoria === 'Cursos' 
                          ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                    {selectedSubcategoria === 'Cursos' && (
                      <p className="text-xs text-blue-600 mt-1">
                        📋 Un índice ayuda a organizar mejor el contenido del curso
                      </p>
                    )}
                  </div>
                </div>

                {/* Campos adicionales del índice - Solo cuando tiene índice */}
                {tieneIndice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Página donde comienza el índice
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={totalPaginas}
                        value={paginaInicioIndice}
                        onChange={(e) => setPaginaInicioIndice(parseInt(e.target.value) || 1)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                          selectedSubcategoria === 'Cursos' 
                            ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                            : 'border-gray-300 focus:ring-green-500'
                        }`}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        📍 Número de página donde inicia el índice
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Página donde termina el índice
                      </label>
                      <input
                        type="number"
                        min={paginaInicioIndice}
                        max={totalPaginas}
                        value={paginaFinIndice}
                        onChange={(e) => setPaginaFinIndice(parseInt(e.target.value) || paginaInicioIndice)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                          selectedSubcategoria === 'Cursos' 
                            ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                            : 'border-gray-300 focus:ring-green-500'
                        }`}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        🏁 Número de página donde termina el índice
                      </p>
                    </div>
                  </div>
                )}

                {/* Validación de páginas del índice */}
                {tieneIndice && paginaFinIndice < paginaInicioIndice && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-800 text-sm">
                      ⚠️ La página de fin del índice debe ser mayor o igual a la página de inicio
                    </p>
                  </div>
                )}

                {tieneIndice && (paginaInicioIndice > totalPaginas || paginaFinIndice > totalPaginas) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-800 text-sm">
                      ⚠️ Las páginas del índice no pueden ser mayores al total de páginas del documento
                    </p>
                  </div>
                )}

                {/* Campos de traducción */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🌐</span>
                    </div>
                    Opciones de Traducción
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Requiere traducción?
                      </label>
                      <select
                        value={requiereTraduccion.toString()}
                        onChange={(e) => setRequiereTraduccion(e.target.value === 'true')}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                          selectedSubcategoria === 'Cursos' 
                            ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                            : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        💡 La AI puede traducir el documento durante el procesamiento
                      </p>
                    </div>

                    {requiereTraduccion && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Idioma de destino
                        </label>
                        <select
                          value={idiomaDestino}
                          onChange={(e) => setIdiomaDestino(e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                            selectedSubcategoria === 'Cursos' 
                              ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                              : 'border-gray-300 focus:ring-indigo-500'
                          }`}
                        >
                          {idiomasDisponibles.map((idioma) => (
                            <option key={idioma.code} value={idioma.code}>
                              {idioma.flag} {idioma.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-indigo-600 mt-1">
                          🌍 Selecciona el idioma al que quieres traducir el documento
                        </p>
                      </div>
                    )}
                  </div>

                  {requiereTraduccion && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">🤖</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                            Procesamiento con IA y Traducción
                          </h4>
                          <p className="text-xs text-indigo-800">
                            El documento será procesado con IA y traducido al {idiomasDisponibles.find(i => i.code === idiomaDestino)?.flag} {idiomasDisponibles.find(i => i.code === idiomaDestino)?.name}. 
                            Este proceso puede tomar más tiempo dependiendo del tamaño del documento.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo de selección de modelo IA - Solo para Cursos */}
                {selectedSubcategoria === 'Cursos' && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      Modelo de Procesamiento con IA
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar modelo de IA
                        </label>
                        <select
                          value={modeloIA}
                          onChange={(e) => setModeloIA(e.target.value)}
                          className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                        >
                          {modelosIA.map((modelo) => (
                            <option key={modelo.code} value={modelo.code}>
                              {modelo.icon} {modelo.name} - {modelo.description}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-blue-600 mt-1">
                          🚀 El modelo seleccionado procesará el contenido del curso con IA
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {modelosIA.find(m => m.code === modeloIA)?.icon || '🤖'}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Procesamiento con {modelosIA.find(m => m.code === modeloIA)?.name}
                          </h4>
                          <p className="text-xs text-blue-800">
                            {modelosIA.find(m => m.code === modeloIA)?.description}. 
                            Este modelo analizará y estructurará el contenido educativo del curso.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validaciones específicas */}
                {selectedSubcategoria === 'Cursos' && totalPaginas > 50 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      🚫 Los documentos de Cursos no pueden tener más de 50 páginas
                    </p>
                  </div>
                )}

                {selectedSubcategoria !== 'Cursos' && totalPaginas > 30 && !tieneIndice && (
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

                {/* Resumen de datos a enviar */}
                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Resumen de envío al backend
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600 font-medium">Archivo:</span>
                        <span className="text-blue-800 ml-1">{selectedFile.name}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Tamaño:</span>
                        <span className="text-blue-800 ml-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Subcategoría:</span>
                        <span className="text-blue-800 ml-1">{selectedSubcategoria}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Estructura:</span>
                        <span className="text-blue-800 ml-1">no-estructurado</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Total páginas:</span>
                        <span className="text-blue-800 ml-1">{totalPaginas}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Tiene índice:</span>
                        <span className="text-blue-800 ml-1">
                          {tieneIndice ? `Sí (págs. ${paginaInicioIndice}-${paginaFinIndice})` : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Traducción:</span>
                        <span className="text-blue-800 ml-1">
                          {requiereTraduccion 
                            ? `Sí, a ${idiomasDisponibles.find(i => i.code === idiomaDestino)?.flag} ${idiomasDisponibles.find(i => i.code === idiomaDestino)?.name}`
                            : 'No'
                          }
                        </span>
                      </div>
                      {selectedSubcategoria === 'Cursos' && (
                        <div>
                          <span className="text-blue-600 font-medium">Modelo IA:</span>
                          <span className="text-blue-800 ml-1">
                            {modelosIA.find(m => m.code === modeloIA)?.icon} {modelosIA.find(m => m.code === modeloIA)?.name}
                          </span>
                        </div>
                      )}
                    </div>
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
                    disabled={
                      !selectedFile || 
                      isUploading || 
                      (selectedSubcategoria === 'Cursos' && totalPaginas > 50) ||
                      (selectedSubcategoria !== 'Cursos' && totalPaginas > 30 && !tieneIndice)
                    }
                    className={`px-6 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center ${
                      selectedSubcategoria === 'Cursos' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedSubcategoria === 'Cursos' ? 'Subir Curso' : 'Subir Documento'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={cancelarBorrarDocumento}
        onConfirm={confirmarBorrarDocumento}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este documento? Esta acción eliminará permanentemente el documento y todos sus capítulos."
        itemName={documentToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DocumentosNoEstructurados;