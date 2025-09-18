import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    FileText, 
    Calendar, 
    DollarSign, 
    MapPin, 
    Building, 
    Clock,
    Download,
    Eye,
    Loader2,
    Receipt,
    CreditCard,
    Tag,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Interfaces
interface DocumentoActividad {
    id: string;
    titulo?: string;
    descripcion?: string;
    fileName: string;
    filePath: string;
    documentType: 'Receipt' | 'Invoice' | 'Expense' | 'Other';
    establishmentType: 'restaurant' | 'hotel' | 'transport' | 'activity' | 'other' | 'Other';
    vendorName?: string;
    vendorAddress?: string;
    documentDate?: string;
    totalAmount: number;
    currency: string;
    taxAmount?: number;
    items?: any[];
    extractedText?: string;
    htmlContent?: string;
    aiSummary?: string;
    travelId?: string;
    itineraryId?: string;
    activityId?: string;
    fileSize?: number;
    mimeType?: string;
    documentUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    TwinID?: string;
    docType?: string;
}

const DocumentoDetallePage: React.FC = () => {
    const { documentoId } = useParams<{ documentoId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [documento, setDocumento] = useState<DocumentoActividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [showPdf, setShowPdf] = useState(true); // Mostrar PDF por defecto

    // Obtener documento desde location.state o hacer fetch
    useEffect(() => {
        if (location.state?.documento) {
            const doc = location.state.documento;
            console.log('🔍 Documento recibido desde location.state:', doc);
            console.log('💰 totalAmount:', doc.totalAmount);
            console.log('💰 currency:', doc.currency);
            console.log('💰 taxAmount:', doc.taxAmount);
            setDocumento(doc);
            setLoading(false);
        } else if (documentoId) {
            // Aquí harías fetch del documento por ID si no viene en el state
            fetchDocumento(documentoId);
        } else {
            setLoading(false);
        }
    }, [documentoId, location.state]);

    const fetchDocumento = async (id: string) => {
        try {
            setLoading(true);
            // TODO: Implementar endpoint para obtener documento por ID
            const response = await fetch(`/api/documents/${id}`);
            if (response.ok) {
                const doc = await response.json();
                setDocumento(doc);
            }
        } catch (error) {
            console.error('Error fetching documento:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDocumentTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'receipt': return <Receipt className="h-5 w-5" />;
            case 'invoice': return <FileText className="h-5 w-5" />;
            case 'expense': return <CreditCard className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const getEstablishmentColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'restaurant': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'hotel': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'transport': return 'bg-green-100 text-green-800 border-green-200';
            case 'activity': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleViewPdf = () => {
        if (documento?.documentUrl) {
            setPdfLoading(true);
            setShowPdf(true);
            // El iframe manejará el loading
        }
    };

    const handleDownloadPdf = () => {
        if (documento?.documentUrl) {
            window.open(documento.documentUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!documento) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Documento no encontrado</h2>
                    <p className="text-gray-600 mb-4">No se pudo cargar la información del documento.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button 
                                onClick={() => navigate(-1)} 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div className="flex items-center space-x-2">
                                {getDocumentTypeIcon(documento.documentType)}
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {documento.titulo || documento.fileName}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {documento.documentUrl && (
                                <>
                                    <Button 
                                        onClick={handleViewPdf}
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver PDF
                                    </Button>
                                    <Button 
                                        onClick={handleDownloadPdf}
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Descargar
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Row Superior - Información Básica y Financiera */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Información Básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Info className="h-5 w-5 mr-2 text-blue-600" />
                                Información Básica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Tipo</label>
                                    <div className="flex items-center mt-1">
                                        {getDocumentTypeIcon(documento.documentType)}
                                        <span className="ml-2 text-sm">{documento.documentType}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Categoría</label>
                                    <div className="mt-1">
                                        <Badge className={getEstablishmentColor(documento.establishmentType)}>
                                            {documento.establishmentType}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Archivo</label>
                                    <div className="flex items-center mt-1">
                                        <FileText className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-sm truncate">{documento.fileName}</span>
                                    </div>
                                </div>
                                {documento.documentDate && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Fecha</label>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                                            <span className="text-sm">{formatDate(documento.documentDate)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Financiera */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                                Información Financiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <label className="text-xs font-medium text-green-800">Monto Total</label>
                                <div className="text-xl font-bold text-green-900 mt-1">
                                    {documento.totalAmount 
                                        ? formatCurrency(documento.totalAmount, documento.currency || 'USD')
                                        : 'No disponible'
                                    }
                                </div>
                                {/* Debug info */}
                                <div className="text-xs text-gray-500 mt-1">
                                    Raw: {documento.totalAmount} {documento.currency}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Impuestos</label>
                                    <div className="text-sm font-semibold text-gray-900 mt-1">
                                        {documento.taxAmount !== undefined 
                                            ? formatCurrency(documento.taxAmount, documento.currency || 'USD')
                                            : 'N/A'
                                        }
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Moneda</label>
                                    <div className="flex items-center mt-1">
                                        <Tag className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium">{documento.currency || 'USD'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Información adicional si está disponible */}
                            {documento.vendorName && (
                                <div className="pt-2 border-t">
                                    <label className="text-xs font-medium text-gray-600">Proveedor</label>
                                    <div className="text-sm text-gray-900 mt-1 truncate">
                                        {documento.vendorName}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información del Establecimiento */}
                    {documento.vendorName && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-purple-600" />
                                    Establecimiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Nombre</label>
                                    <div className="text-sm font-medium text-gray-900 mt-1">
                                        {documento.vendorName}
                                    </div>
                                </div>
                                {documento.vendorAddress && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Dirección</label>
                                        <div className="flex items-start mt-1">
                                            <MapPin className="h-3 w-3 text-gray-400 mr-2 mt-0.5" />
                                            <span className="text-xs text-gray-700 leading-relaxed">
                                                {documento.vendorAddress}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Row Principal - PDF Viewer y Datos de IA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna Izquierda - PDF Viewer */}
                    <div className="space-y-6">
                        {documento.documentUrl ? (
                            showPdf && (
                                <Card className="h-fit">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                                                Vista del Documento PDF
                                            </span>
                                            <Button 
                                                onClick={() => setShowPdf(false)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                Cerrar Vista
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="relative w-full h-[700px]">
                                            <iframe
                                                src={documento.documentUrl}
                                                className="w-full h-full border-0 rounded-b-lg"
                                                title={`Vista de ${documento.fileName}`}
                                                onLoad={() => setPdfLoading(false)}
                                            />
                                            {pdfLoading && (
                                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-b-lg">
                                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-gray-400" />
                                        Vista del Documento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No hay URL disponible para mostrar el documento</p>
                                        <p className="text-gray-400 text-sm mt-2">El documento puede no estar disponible o tener problemas de acceso</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Botón para mostrar PDF si está oculto */}
                        {documento.documentUrl && !showPdf && (
                            <Card>
                                <CardContent className="text-center py-6">
                                    <Button 
                                        onClick={() => setShowPdf(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Mostrar Documento PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Columna Derecha - Datos de IA */}
                    <div className="space-y-6">
                        {/* Resumen de AI */}
                        {documento.aiSummary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                                        Resumen de IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                        <p className="text-indigo-900 text-sm leading-relaxed">
                                            {documento.aiSummary}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contenido HTML (Análisis Detallado) */}
                        {documento.htmlContent && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-orange-600" />
                                        Análisis Detallado de IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="prose prose-sm max-w-none text-sm"
                                        dangerouslySetInnerHTML={{ __html: documento.htmlContent }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Items del documento (si existen) */}
                        {documento.items && documento.items.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Receipt className="h-5 w-5 mr-2 text-green-600" />
                                        Items Extraídos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {documento.items.map((item, index) => (
                                            <div 
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        {item.description || item.name || `Item ${index + 1}`}
                                                    </span>
                                                    {item.quantity && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.amount && (
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {formatCurrency(item.amount, documento.currency)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Información de procesamiento */}
                        {(documento.createdAt || documento.updatedAt) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2 text-gray-600" />
                                        Información de Procesamiento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {documento.createdAt && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Creado</label>
                                            <div className="text-sm text-gray-900 mt-1">
                                                {formatDate(documento.createdAt)}
                                            </div>
                                        </div>
                                    )}
                                    {documento.updatedAt && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Actualizado</label>
                                            <div className="text-sm text-gray-900 mt-1">
                                                {formatDate(documento.updatedAt)}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentoDetallePage;
