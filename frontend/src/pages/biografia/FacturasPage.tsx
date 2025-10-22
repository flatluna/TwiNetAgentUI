import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, RefreshCw, FileText, Eye, Trash2, Plus, Loader2, BarChart3 } from 'lucide-react';
import { documentApiService, type InvoiceMetadata, type InvoicesMetadataResponse, type GetInvoiceByIdResponse } from '../../services/documentApiService';
import { useMsal } from '@azure/msal-react';

interface Factura {
  id: string;
  nombre: string;
  estructura: string;
  subcategoria: string;
  categoria?: string;
  detectedType?: string;
  twinID: string;
  // Datos adicionales de metadata de facturas
  totalAmount?: number;
  currency?: string;
  invoiceDate?: string;
  dueDate?: string;
  vendorName?: string;
  lineItemsCount?: number;
  taxAmount?: number;
  status?: string;
  documentMetadata?: {
    structuredData?: {
      vendor?: {
        name?: string;
      };
      invoice?: {
        invoiceNumber?: string;
        invoiceTotal?: {
          amount?: number;
          currencyCode?: string;
        };
        invoiceDate?: string;
        dueDate?: string;
      };
    };
  };
}

const FacturasPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [resumenFacturas, setResumenFacturas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tieneIndice, setTieneIndice] = useState<boolean>(false);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFacturaId, setLoadingFacturaId] = useState<string | null>(null);

  const twinID = accounts[0]?.idTokenClaims?.oid || '';

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando facturas con endpoint optimizado...');
      
      // Usar el nuevo endpoint optimizado para metadata de facturas
      const response: InvoicesMetadataResponse = await documentApiService.getInvoicesMetadata(twinID);
      
      if (response.success && response.invoices) {
        console.log(`✅ ${response.totalInvoices} facturas obtenidas`);
        console.log('📊 Resumen:', response.summary);
        
        // Mapear InvoiceMetadata a Factura
        const facturasData: Factura[] = response.invoices.map((invoice: InvoiceMetadata) => ({
          id: invoice.id,
          nombre: invoice.fileName,
          estructura: 'semi-estructurado',
          subcategoria: 'Facturas',
          categoria: 'Invoice',
          detectedType: 'Invoice',
          twinID: invoice.twinID,
          // Mapear datos específicos de facturas
          totalAmount: invoice.invoiceTotal,
          currency: 'USD', // Por defecto si no viene
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          vendorName: invoice.vendorName,
          lineItemsCount: invoice.lineItemsCount,
          taxAmount: invoice.totalTax,
          status: invoice.success ? 'Procesado' : 'Error'
        }));
        
        setFacturas(facturasData);
        setResumenFacturas(response.summary);
        console.log(`📋 ${facturasData.length} facturas procesadas y cargadas`);
      } else {
        console.log('📭 No se encontraron facturas');
        setFacturas([]);
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipos de archivo para facturas (PDF principalmente)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de archivo no permitido. Solo se permiten PDF, JPEG, PNG, TIFF');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !twinID) {
      setUploadError('Selecciona un archivo válido');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Usar el método uploadDocument correcto con parámetros individuales
      const response = await documentApiService.uploadDocument(
        twinID,
        selectedFile,
        'Facturas', // subcategoria usando "Facturas" en el path
        'semi-estructurado' // estructura
      );
      
      if (response.success) {
        setUploadSuccess('✅ Factura subida exitosamente');
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        // Recargar las facturas
        await cargarFacturas();
      } else {
        setUploadError(response.message || 'Error al subir la factura');
      }
    } catch (error) {
      console.error('Error en upload:', error);
      setUploadError('Error al subir la factura');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFactura = async (facturaId: string, facturaName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la factura "${facturaName}"?`)) {
      return;
    }

    try {
      await documentApiService.deleteDocument(twinID, facturaId);
      setFacturas(prev => prev.filter(f => f.id !== facturaId));
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      alert('Error al eliminar la factura');
    }
  };

  const handleViewInvoice = async (facturaId: string, facturaName: string) => {
    try {
      console.log(`👁️ Obteniendo detalles de factura: ${facturaName} (ID: ${facturaId})`);
      
      // Establecer loading state para esta factura específica
      setLoadingFacturaId(facturaId);
      
      // Llamar al endpoint GetInvoiceById
      const invoiceResponse: any = await documentApiService.getInvoiceById(twinID, facturaId);
      
      console.log('🔍 Respuesta completa del backend:', JSON.stringify(invoiceResponse, null, 2));
      
      if (invoiceResponse.success) {
        const invoiceData = invoiceResponse.invoice;
        console.log('✅ Factura obtenida exitosamente:', invoiceResponse);
        console.log('🔍 Estructura de Invoice:', JSON.stringify(invoiceData, null, 2));
        console.log('🔑 Propiedades de Invoice:', Object.keys(invoiceData || {}));
        
        // Mapear los datos de la respuesta al formato esperado por DocumentoDetallePage
        const documentoData = {
          id: invoiceResponse.documentId || facturaId,
          titulo: invoiceData.fileName || facturaName,
          fileName: invoiceData.fileName || facturaName,
          filePath: invoiceData.filePath || '',
          documentType: 'Invoice' as const,
          establishmentType: 'other' as const,
          vendorName: invoiceData.vendorName || 'Vendor no disponible',
          vendorAddress: invoiceData.invoiceData?.vendorAddress || '',
          documentDate: invoiceData.invoiceDate || '',
          totalAmount: invoiceData.invoiceTotal || 0,
          currency: 'USD', // No viene en la respuesta, usar default
          taxAmount: invoiceData.totalTax || 0,
          items: invoiceData.invoiceData?.lineItems || [],
          extractedText: invoiceData.aiTextReport || '',
          htmlContent: invoiceData.aiHtmlOutput || '',
          aiSummary: invoiceData.aiExecutiveSummaryText || '',
          TwinID: twinID,
          docType: 'Invoice',
          // Datos adicionales específicos de factura
          invoiceNumber: invoiceData.invoiceNumber || '',
          dueDate: invoiceData.dueDate || '',
          subTotal: invoiceData.subTotal || 0,
          documentUrl: invoiceData.fileURL || invoiceData.fileUrl || '', // URL del documento PDF
          // Metadata completa
          fullInvoiceData: invoiceData,
          // Datos adicionales específicos del backend
          customerName: invoiceData.customerName || '',
          customerAddress: invoiceData.invoiceData?.customerAddress || '',
          lineItemsCount: invoiceData.lineItemsCount || 0,
          totalPages: invoiceData.totalPages || 0,
          source: invoiceData.source || '',
          confidence: {
            vendorName: invoiceData.vendorNameConfidence || 0,
            customerName: invoiceData.customerNameConfidence || 0,
            invoiceTotal: invoiceData.invoiceTotalConfidence || 0,
            subTotal: invoiceData.subTotalConfidence || 0
          },
          aiData: {
            executiveSummaryHtml: invoiceData.aiExecutiveSummaryHtml || '',
            executiveSummaryText: invoiceData.aiExecutiveSummaryText || '',
            textSummary: invoiceData.aiTextSummary || '',
            htmlOutput: invoiceData.aiHtmlOutput || '',
            textReport: invoiceData.aiTextReport || '',
            tablesContent: invoiceData.aiTablesContent || '',
            structuredData: invoiceData.aiStructuredData || '',
            processedText: invoiceData.aiProcessedText || '',
            completeSummary: invoiceData.aiCompleteSummary || '',
            completeInsights: invoiceData.aiCompleteInsights || ''
          }
        };
        
        // Navegar a la página de detalles con los datos completos
        navigate(`/twin-biografia/documento/${facturaId}`, {
          state: { 
            documento: documentoData,
            originalResponse: invoiceResponse
          }
        });
      } else {
        console.error('❌ Error en la respuesta del servidor:', invoiceResponse);
        alert('Error al obtener los detalles de la factura');
      }
    } catch (error) {
      console.error('❌ Error al obtener detalles de factura:', error);
      alert('Error al cargar los detalles de la factura');
    } finally {
      // Limpiar loading state
      setLoadingFacturaId(null);
    }
  };

  const facturasFiltradas = facturas.filter(factura =>
    factura.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.documentMetadata?.structuredData?.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.documentMetadata?.structuredData?.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount?: number, currencyCode?: string) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode || 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/twin-biografia/archivos-personales')}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span>💰 Gestión de Facturas</span>
                </h1>
                <p className="text-gray-600 mt-1">Administra todas tus facturas en un solo lugar</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={cargarFacturas}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                <span>Actualizar</span>
              </button>

              <button
                onClick={() => navigate('/twin-biografia/facturas/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BarChart3 size={18} />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                <Plus size={18} />
                <span>Subir Factura</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar facturas por nombre, vendor o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{facturas.length}</div>
                <div>Total Facturas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{facturasFiltradas.length}</div>
                <div>Filtradas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Facturas */}
        {resumenFacturas && !isLoading && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Resumen de Facturas
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  ${resumenFacturas.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-500">Total Facturado</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  ${resumenFacturas.averageAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-500">Promedio por Factura</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {resumenFacturas.totalLineItems || 0}
                </div>
                <div className="text-sm text-gray-500">Total Artículos</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {resumenFacturas.dateRange || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Rango de Fechas</div>
              </div>
            </div>
            
            {resumenFacturas.topVendors && resumenFacturas.topVendors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Principales Proveedores:</h4>
                <div className="flex flex-wrap gap-2">
                  {resumenFacturas.topVendors.slice(0, 3).map((vendor: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => navigate(`/twin-biografia/facturas/dashboard/${encodeURIComponent(vendor.vendorName || vendor.name || 'Vendor desconocido')}`)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm shadow-sm transition-colors flex items-center space-x-2"
                    >
                      <span>{vendor.vendorName || vendor.name || 'Vendor desconocido'}</span>
                      {vendor.invoiceCount && (
                        <span className="bg-indigo-500 px-2 py-1 rounded-full text-xs">
                          {vendor.invoiceCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{uploadSuccess}</p>
            <button 
              onClick={() => setUploadSuccess(null)}
              className="text-green-600 underline text-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        )}

        {/* Facturas Grid */}
        {!isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facturasFiltradas.map((factura) => {
              // Usar los campos optimizados de metadata de facturas
              const vendor = factura.vendorName || 'Vendor no disponible';
              const invoiceDate = factura.invoiceDate;
              const dueDate = factura.dueDate;

              return (
                <div key={factura.id} className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{factura.nombre}</h3>
                        <p className="text-xs text-gray-500">ID: {factura.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewInvoice(factura.id, factura.nombre)}
                        disabled={loadingFacturaId === factura.id}
                        className={`p-2 rounded-lg transition-colors ${
                          loadingFacturaId === factura.id 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={loadingFacturaId === factura.id ? "Cargando..." : "Ver factura completa"}
                      >
                        {loadingFacturaId === factura.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteFactura(factura.id, factura.nombre)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar factura"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Proveedor</div>
                    <div className="font-medium text-gray-900">{vendor}</div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">Total</div>
                      <div className="font-bold text-green-600">
                        ${factura.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Artículos</div>
                      <div className="font-medium text-gray-900">{factura.lineItemsCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Fecha</div>
                      <div className="font-medium text-gray-900">{formatDate(invoiceDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Vencimiento</div>
                      <div className="font-medium text-gray-900">{formatDate(dueDate)}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      factura.status === 'Procesado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {factura.status || 'Sin Estado'}
                    </span>
                    
                    <div className="text-xs text-gray-400">
                      {factura.taxAmount && factura.taxAmount > 0 && `Tax: $${factura.taxAmount.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && facturasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas</h3>
            <p className="text-gray-600 mb-6">
              {facturas.length === 0 
                ? 'Sube tu primera factura para comenzar'
                : 'No se encontraron facturas con los criterios de búsqueda'
              }
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Plus size={18} />
              <span>Subir Primera Factura</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span>Subir Nueva Factura</span>
                </h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">{uploadError}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo de Factura
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.tiff"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos soportados: PDF, JPEG, PNG, TIFF
                  </p>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tieneIndice}
                        onChange={(e) => setTieneIndice(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Tiene índice</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total páginas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={totalPaginas}
                      onChange={(e) => setTotalPaginas(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Subir Factura</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturasPage;