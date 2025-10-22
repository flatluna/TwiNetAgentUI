import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Building2, 
  BarChart3, 
  PieChart, 
  Calendar,
  Filter,
  Download,
  Loader2,
  HelpCircle,
  X,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { documentApiService, type InvoicesMetadataResponse, type AiInvoicesAnalysisResponse } from '../../services/documentApiService';
import { useMsal } from '@azure/msal-react';

// Interfaces para el dashboard
interface VendorSummary {
  vendorName: string;
  totalInvoices: number;
  totalAmount: number;
  totalTax: number;
  averageAmount: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  lineItemsSummary: LineItemSummary[];
  confidence: {
    avgVendorNameConfidence: number;
    avgTotalConfidence: number;
  };
}

interface LineItemSummary {
  description: string;
  totalAmount: number;
  frequency: number;
  averageAmount: number;
  avgConfidence: number;
}

interface DashboardData {
  vendors: VendorSummary[];
  totalInvoices: number;
  grandTotal: number;
  topVendorByAmount: VendorSummary | null;
  topVendorByInvoices: VendorSummary | null;
}

interface ChatMessage {
  id: string;
  text: string;
  htmlContent?: string;
  isUser: boolean;
  timestamp: Date;
}

const InvoicesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendorName: urlVendorName } = useParams<{ vendorName?: string }>();
  const { accounts } = useMsal();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'invoices' | 'name'>('amount');
  
  // Estados para el chat AI
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFileID, setCurrentFileID] = useState<string>("null");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isTwinExpanded, setIsTwinExpanded] = useState(false);

  const twinID = accounts[0]?.idTokenClaims?.oid || '';

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Si viene un vendorName en la URL, configurarlo como seleccionado
    if (urlVendorName && dashboardData) {
      const decodedVendorName = decodeURIComponent(urlVendorName);
      setSelectedVendor(decodedVendorName);
    }
  }, [urlVendorName, dashboardData]);

  useEffect(() => {
    // Inicializar chat con mensaje de bienvenida
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: `👋 ¡Hola! Soy tu Twin AI especializado en facturas${urlVendorName ? ` de ${decodeURIComponent(urlVendorName)}` : ''}. ¿En qué puedo ayudarte con el análisis de estos datos?`,
      isUser: false,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  }, [urlVendorName]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Cargando datos del dashboard de facturas...');

      // Obtener metadata de todas las facturas
      const response: InvoicesMetadataResponse = await documentApiService.getInvoicesMetadata(twinID);
      
      if (response.success && response.invoices) {
        console.log('✅ Facturas obtenidas para dashboard:', response.invoices.length);
        
        // Procesar los datos para crear el dashboard por proveedores
        const processedData = await processInvoicesForDashboard(response.invoices);
        setDashboardData(processedData);
      } else {
        console.log('📭 No se encontraron facturas para el dashboard');
        setDashboardData({
          vendors: [],
          totalInvoices: 0,
          grandTotal: 0,
          topVendorByAmount: null,
          topVendorByInvoices: null
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processInvoicesForDashboard = async (invoices: any[]): Promise<DashboardData> => {
    // Obtener datos completos de cada factura para acceder a line items
    const fullInvoicesPromises = invoices.map(invoice => 
      documentApiService.getInvoiceById(twinID, invoice.id)
    );
    
    const fullInvoices = await Promise.all(fullInvoicesPromises);
    
    // Agrupar por proveedor
    const vendorGroups: { [vendorName: string]: any[] } = {};
    
    fullInvoices.forEach(response => {
      if (response.success && response.invoice) {
        const invoice = response.invoice;
        const vendorName = invoice.vendorName || 'Proveedor Desconocido';
        
        if (!vendorGroups[vendorName]) {
          vendorGroups[vendorName] = [];
        }
        vendorGroups[vendorName].push(invoice);
      }
    });

    // Procesar cada grupo de proveedor
    const vendors: VendorSummary[] = Object.entries(vendorGroups).map(([vendorName, invoices]) => {
      const totalInvoices = invoices.length;
      const totalAmount = invoices.reduce((sum, inv) => sum + (inv.invoiceTotal || 0), 0);
      const totalTax = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
      const averageAmount = totalAmount / totalInvoices;

      // Procesar line items
      const lineItemsMap: { [description: string]: { amounts: number[], confidences: number[] } } = {};
      
      invoices.forEach(invoice => {
        const lineItems = invoice.invoiceData?.lineItems || [];
        lineItems.forEach((item: any) => {
          const description = item.description?.trim() || 'Sin descripción';
          const amount = item.amount || 0;
          
          // Log para debugging de valores negativos
          if (amount < 0) {
            console.log(`🔍 Descuento encontrado: "${description}" = ${amount}`);
          }
          
          if (!lineItemsMap[description]) {
            lineItemsMap[description] = { amounts: [], confidences: [] };
          }
          lineItemsMap[description].amounts.push(amount);
          lineItemsMap[description].confidences.push(item.amountConfidence || 0);
        });
      });

      const lineItemsSummary: LineItemSummary[] = Object.entries(lineItemsMap)
        .map(([description, data]) => ({
          description,
          totalAmount: data.amounts.reduce((sum, amount) => sum + amount, 0),
          frequency: data.amounts.length,
          averageAmount: data.amounts.reduce((sum, amount) => sum + amount, 0) / data.amounts.length,
          avgConfidence: data.confidences.reduce((sum, conf) => sum + conf, 0) / data.confidences.length
        }))
        .filter(item => item.totalAmount !== 0) // Mostrar tanto positivos como negativos, pero no cero
        .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount)); // Ordenar por valor absoluto para que descuentos grandes aparezcan arriba

      // Log para debugging - mostrar todos los line items de este vendor
      console.log(`📋 Line items para ${vendorName}:`, lineItemsSummary.map(item => ({
        desc: item.description,
        amount: item.totalAmount,
        freq: item.frequency
      })));

      // Calcular fechas
      const dates = invoices
        .map(inv => inv.invoiceDate)
        .filter(date => date)
        .sort();

      return {
        vendorName,
        totalInvoices,
        totalAmount,
        totalTax,
        averageAmount,
        dateRange: {
          earliest: dates[0] || '',
          latest: dates[dates.length - 1] || ''
        },
        lineItemsSummary,
        confidence: {
          avgVendorNameConfidence: invoices.reduce((sum, inv) => sum + (inv.vendorNameConfidence || 0), 0) / totalInvoices,
          avgTotalConfidence: invoices.reduce((sum, inv) => sum + (inv.invoiceTotalConfidence || 0), 0) / totalInvoices
        }
      };
    });

    // Ordenar vendors por monto total
    vendors.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      vendors,
      totalInvoices: fullInvoices.length,
      grandTotal: vendors.reduce((sum, vendor) => sum + vendor.totalAmount, 0),
      topVendorByAmount: vendors[0] || null,
      topVendorByInvoices: vendors.sort((a, b) => b.totalInvoices - a.totalInvoices)[0] || null
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getSortedVendors = () => {
    if (!dashboardData) return [];
    
    const vendors = [...dashboardData.vendors];
    switch (sortBy) {
      case 'amount':
        return vendors.sort((a, b) => b.totalAmount - a.totalAmount);
      case 'invoices':
        return vendors.sort((a, b) => b.totalInvoices - a.totalInvoices);
      case 'name':
        return vendors.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
      default:
        return vendors;
    }
  };

  const getSelectedVendorData = () => {
    if (!dashboardData || selectedVendor === 'all') return null;
    return dashboardData.vendors.find(v => v.vendorName === selectedVendor);
  };

  const handleSendQuestion = async (question: string) => {
    if (!question.trim() || isAnalyzing) return;

    // Agregar pregunta del usuario al chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsAnalyzing(true);

    try {
      // Determinar el vendor a usar (de la URL o 'General')
      const vendorForAnalysis = urlVendorName ? decodeURIComponent(urlVendorName) : 'General';
      
      console.log('🤖 Enviando pregunta al AI:', question);
      console.log('🏢 Vendor:', vendorForAnalysis);
      console.log('📁 FileID actual:', currentFileID);

      const response: AiInvoicesAnalysisResponse = await documentApiService.aiInvoicesAnalysis(
        twinID,
        vendorForAnalysis,
        question,
        currentFileID
      );

      console.log('✅ Respuesta completa del AI:', response);

      // Actualizar el FileID para reutilizar en próximas preguntas
      if (response.fileID && response.fileID !== currentFileID) {
        console.log('📁 Actualizando FileID:', currentFileID, '→', response.fileID);
        setCurrentFileID(response.fileID);
      }

      // Determinar el contenido de la respuesta
      const responseContent = response.analysisResult?.aiResponse || 
                             response.analysisResult?.htmlContent || 
                             response.message || 
                             'Análisis completado, pero no se recibió contenido detallado.';

      console.log('📝 Contenido de respuesta detectado:', responseContent.substring(0, 200) + '...');

      // Agregar respuesta del AI al chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseContent.includes('<') ? '' : responseContent, // Solo texto si no es HTML
        htmlContent: responseContent.includes('<') ? responseContent : undefined, // HTML si contiene tags
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // Log de estadísticas de respuesta
      if (response.features) {
        console.log('🚀 Características AI:', response.features);
      }
      console.log(`⏱️ Tiempo de procesamiento: ${response.processingTimeSeconds}s`);

    } catch (error) {
      console.error('❌ Error al obtener respuesta del AI:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionButtonClick = (question: string) => {
    setCurrentQuestion(question);
    setShowHelpModal(false); // Cerrar modal si está abierto
    handleSendQuestion(question);
  };

  const handleClearChat = () => {
    // Resetear el chat con solo el mensaje de bienvenida
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: `👋 ¡Hola! Soy tu Twin AI especializado en facturas${urlVendorName ? ` de ${decodeURIComponent(urlVendorName)}` : ''}. ¿En qué puedo ayudarte con el análisis de estos datos?`,
      isUser: false,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
    setCurrentQuestion('');
    console.log('🧹 Chat limpiado - Solo mensaje de bienvenida');
  };

  const handleExpandTwin = () => {
    setIsTwinExpanded(true);
  };

  const handleMinimizeTwin = () => {
    setIsTwinExpanded(false);
  };

  const handleCloseTwin = () => {
    setIsTwinExpanded(false);
    // Opcional: también limpiar el chat al cerrar
    handleClearChat();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Creando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/twin-biografia/facturas')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3 text-indigo-600" />
                  {urlVendorName ? 
                    `Dashboard: ${decodeURIComponent(urlVendorName)}` : 
                    'Dashboard de Facturas por Proveedor'
                  }
                </h1>
                <p className="text-gray-600 mt-1">
                  {urlVendorName ? 
                    `Análisis detallado de facturas de ${decodeURIComponent(urlVendorName)}` :
                    'Análisis ejecutivo y consolidación de gastos por proveedor'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="amount">Ordenar por Monto</option>
                <option value="invoices">Ordenar por # Facturas</option>
                <option value="name">Ordenar por Nombre</option>
              </select>
              
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardData && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Columna Principal - Dashboard */}
            <div className="xl:col-span-1">
              {/* Métricas Generales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Facturas</p>
                  <p className="text-lg font-bold text-gray-900">{dashboardData.totalInvoices}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total General</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(dashboardData.grandTotal)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Proveedores</p>
                  <p className="text-lg font-bold text-gray-900">{dashboardData.vendors.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Promedio/Factura</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(dashboardData.grandTotal / dashboardData.totalInvoices)}
                  </p>
                </div>
              </div>
            </div>

            {/* Filtro por Proveedor */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Análisis por Proveedor</h2>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos los Proveedores</option>
                  {dashboardData.vendors.map(vendor => (
                    <option key={vendor.vendorName} value={vendor.vendorName}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVendor === 'all' ? (
                // Vista de todos los proveedores
                <div className="grid gap-6">
                  {getSortedVendors().map((vendor, index) => (
                    <div key={vendor.vendorName} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-indigo-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-gray-900">{vendor.vendorName}</h3>
                            <p className="text-gray-600">
                              {vendor.totalInvoices} facturas • {formatDate(vendor.dateRange.earliest)} - {formatDate(vendor.dateRange.latest)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(vendor.totalAmount)}</p>
                          <p className="text-sm text-gray-600">Promedio: {formatCurrency(vendor.averageAmount)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Impuestos Totales</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(vendor.totalTax)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Confianza Promedio</p>
                          <p className="text-lg font-bold text-gray-900">
                            {(vendor.confidence.avgTotalConfidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedVendor(vendor.vendorName)}
                        className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                      >
                        Ver Desglose Detallado
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // Vista detallada de un proveedor específico
                (() => {
                  const vendorData = getSelectedVendorData();
                  if (!vendorData) return null;

                  return (
                    <div>
                      <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                        <h3 className="text-2xl font-bold text-indigo-900 mb-2">{vendorData.vendorName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-indigo-700">Total Gastado</p>
                            <p className="text-xl font-bold text-indigo-900">{formatCurrency(vendorData.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-indigo-700">Número de Facturas</p>
                            <p className="text-xl font-bold text-indigo-900">{vendorData.totalInvoices}</p>
                          </div>
                          <div>
                            <p className="text-sm text-indigo-700">Promedio por Factura</p>
                            <p className="text-xl font-bold text-indigo-900">{formatCurrency(vendorData.averageAmount)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Desglose de Servicios/Productos</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Incluye cargos, servicios, impuestos, descuentos/créditos y totales de facturas. 
                          Los totales complementan los detalles para análisis completo.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Frecuencia</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Promedio</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Confianza</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vendorData.lineItemsSummary.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900 text-sm leading-tight">{item.description}</div>
                                    {item.totalAmount < 0 && (
                                      <div className="text-xs text-red-600 font-medium mt-1">Descuento/Crédito</div>
                                    )}
                                  </td>
                                  <td className={`py-3 px-4 text-right font-bold ${item.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(item.totalAmount)}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {item.frequency}x
                                    </span>
                                  </td>
                                  <td className={`py-3 px-4 text-right ${item.averageAmount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    {formatCurrency(item.averageAmount)}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                      item.avgConfidence > 0.8 ? 'bg-green-100 text-green-800' :
                                      item.avgConfidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {(item.avgConfidence * 100).toFixed(0)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
            </div>

            {/* Columna Lateral - Twin AI Agent */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 h-[700px] flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🤖</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Twin Facturas - {urlVendorName ? decodeURIComponent(urlVendorName) : 'General'}
                          </h3>
                          <p className="text-sm text-gray-600">Asistente AI Especializado</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExpandTwin}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Expandir Twin AI"
                        >
                          <Maximize2 size={20} />
                        </button>
                        
                        <button
                          onClick={handleClearChat}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Limpiar conversación"
                        >
                          <Trash2 size={20} />
                        </button>
                        
                        <button
                          onClick={() => setShowHelpModal(true)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver capacidades del AI"
                        >
                          <HelpCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning Disclaimer */}
                  <div className="px-4 py-2 bg-red-50 border-l-2 border-red-200">
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Los totales pueden tener variaciones ya que los items incluyen totals y subtotales. Siempre consulte la factura original para información oficial.
                    </p>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 overflow-hidden">
                    <div className="h-full p-4 overflow-y-auto">
                      <div className="space-y-3">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={`rounded-lg p-3 ${
                            message.isUser 
                              ? 'bg-indigo-100 ml-4 text-indigo-900' 
                              : 'bg-gray-100 mr-4 text-gray-700'
                          }`}>
                            {message.htmlContent ? (
                              <div 
                                className="text-sm prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                        
                        {isAnalyzing && (
                          <div className="bg-gray-100 mr-4 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              <p className="text-sm font-medium text-gray-700">Realizando análisis profundo...</p>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                              Procesando facturas con Azure AI para generar análisis detallado, gráficos y recomendaciones personalizadas. 
                              Este proceso puede tomar unos momentos debido al análisis exhaustivo de datos.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Input Fixed at Bottom */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSendQuestion(currentQuestion)}
                        placeholder="Pregúntame sobre las facturas..."
                        disabled={isAnalyzing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
                      />
                      <button 
                        onClick={() => handleSendQuestion(currentQuestion)}
                        disabled={isAnalyzing || !currentQuestion.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="text-sm">Enviar</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ayuda */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🤖</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-900">Capacidades del Twin AI</h3>
                  <p className="text-sm text-gray-600">Especializado en análisis financiero</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Explicación detallada del proceso */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-3">📊 ¿Cómo funciono?</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">1.</span>
                    <div>
                      <span className="font-medium">📁 Cargo tus datos:</span> Accedo a tus facturas y documentos financieros
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">2.</span>
                    <div>
                      <span className="font-medium">🔍 Leo y analizo:</span> Proceso cada factura para extraer información clave
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">3.</span>
                    <div>
                      <span className="font-medium">🧠 Uso Azure AI:</span> Aplico inteligencia artificial avanzada para análisis profundo
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">4.</span>
                    <div>
                      <span className="font-medium">📈 Genero insights:</span> Creo gráficos, tendencias y recomendaciones personalizadas
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-medium">5.</span>
                    <div>
                      <span className="font-medium">💬 Respondo tus preguntas:</span> Converso contigo sobre tus finanzas de manera natural
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  ✨ Puedes preguntarme sobre:
                </p>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Gastos por categoría o proveedor</li>
                  <li>• Tendencias y patrones de gasto</li>
                  <li>• Oportunidades de ahorro</li>
                  <li>• Análisis comparativos</li>
                  <li>• Proyecciones financieras</li>
                </ul>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  💡 Puedo ayudarte con:
                </p>
                <ul className="text-sm text-indigo-700 space-y-2">
                  <li>• Análisis de patrones de gasto</li>
                  <li>• Comparación de precios</li>
                  <li>• Identificación de tendencias</li>
                  <li>• Optimización de costos</li>
                  <li>• Predicciones financieras</li>
                  <li>• Gráficos y visualizaciones</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  🚀 Tecnología Azure AI:
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Code Interpreter Python</li>
                  <li>• Pandas & Matplotlib</li>
                  <li>• Análisis estadístico avanzado</li>
                  <li>• Visualizaciones interactivas</li>
                </ul>
              </div>

              {currentFileID !== "null" && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-800 font-medium mb-2">
                    ⚡ Estado de Optimización:
                  </p>
                  <p className="text-sm text-orange-700">
                    Archivo cargado - Respuestas más rápidas y eficientes
                  </p>
                </div>
              )}

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-800 font-medium mb-3">
                  💬 Preguntas sugeridas:
                </p>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleQuestionButtonClick('Analiza mis patrones de gasto mensual y crea un gráfico de tendencias')}
                    disabled={isAnalyzing}
                    className="w-full text-left px-3 py-2 bg-white hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors disabled:opacity-50 border border-purple-200"
                  >
                    📊 Analiza mis patrones de gasto mensual
                  </button>
                  <button 
                    onClick={() => handleQuestionButtonClick('¿Cuáles son mis 5 proveedores más costosos y cuánto gasto con cada uno?')}
                    disabled={isAnalyzing}
                    className="w-full text-left px-3 py-2 bg-white hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors disabled:opacity-50 border border-purple-200"
                  >
                    🏢 Top 5 proveedores más costosos
                  </button>
                  <button 
                    onClick={() => handleQuestionButtonClick('Identifica oportunidades de ahorro en mis facturas y sugiere acciones específicas')}
                    disabled={isAnalyzing}
                    className="w-full text-left px-3 py-2 bg-white hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors disabled:opacity-50 border border-purple-200"
                  >
                    💡 Encuentra oportunidades de ahorro
                  </button>
                  <button 
                    onClick={() => handleQuestionButtonClick('Crea un dashboard visual con mis métricas financieras más importantes')}
                    disabled={isAnalyzing}
                    className="w-full text-left px-3 py-2 bg-white hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors disabled:opacity-50 border border-purple-200"
                  >
                    📈 Dashboard visual de métricas
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Expandido del Twin AI */}
      {isTwinExpanded && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header del Modal Expandido */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Twin Facturas - {urlVendorName ? decodeURIComponent(urlVendorName) : 'General'}
                </h1>
                <p className="text-sm text-gray-600">Asistente AI Especializado - Modo Expandido</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Limpiar conversación"
              >
                <Trash2 size={20} />
              </button>
              
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Ver capacidades del AI"
              >
                <HelpCircle size={20} />
              </button>
              
              <button
                onClick={handleMinimizeTwin}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Minimizar"
              >
                <Minimize2 size={20} />
              </button>
              
              <button
                onClick={handleCloseTwin}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Contenido del Chat Expandido */}
          <div className="flex-1 h-[calc(100vh-80px)] flex flex-col">
            {/* Warning Disclaimer Expandido */}
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-200">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Los totales pueden tener variaciones ya que los items incluyen totals y subtotales. Siempre consulte la factura original para información oficial.
              </p>
            </div>

            {/* Chat Area Expandida */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-6 overflow-y-auto bg-gray-50">
                <div className="max-w-4xl mx-auto space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`rounded-xl p-4 ${
                      message.isUser 
                        ? 'bg-indigo-600 text-white ml-12' 
                        : 'bg-white text-gray-800 mr-12 border border-gray-200 shadow-sm'
                    }`}>
                      {message.htmlContent ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      )}
                      <div className={`text-xs mt-2 ${
                        message.isUser ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  
                  {isAnalyzing && (
                    <div className="bg-white text-gray-800 mr-12 rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="animate-spin text-indigo-600" size={16} />
                        <span className="text-sm text-gray-600">Realizando análisis detallado de facturas con Azure AI... Esto puede tomar unos momentos debido al procesamiento profundo de datos.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Area Expandida */}
            <div className="border-t border-gray-200 bg-white p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSendQuestion(currentQuestion)}
                    placeholder="Pregunta sobre las facturas..."
                    disabled={isAnalyzing}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-sm"
                  />
                  <button
                    onClick={() => handleSendQuestion(currentQuestion)}
                    disabled={isAnalyzing || !currentQuestion.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : 'Enviar'}
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

export default InvoicesDashboardPage;