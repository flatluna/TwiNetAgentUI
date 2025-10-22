import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { documentApiService } from "@/services/documentApiService";
import { 
    ArrowLeft,
    FileText,
    Upload,
    Download,
    Eye,
    Search,
    Grid,
    List,
    DollarSign,
    Award,
    CreditCard,
    ClipboardList
} from "lucide-react";

// Subcategorías específicas para documentos semi-estructurados
const SUBCATEGORIAS_SEMI_ESTRUCTURADOS = [
    { 
        id: "invoice", 
        label: "Facturas", 
        icon: "🧾", 
        description: "Facturas comerciales y recibos de pago",
        iconComponent: DollarSign,
        color: "text-green-600",
        isNavigation: true,
        navigationPath: "/twin-biografia/facturas"
    },
    { 
        id: "license", 
        label: "Licencias", 
        icon: "📜", 
        description: "Licencias profesionales, permisos y autorizaciones",
        iconComponent: Award,
        color: "text-blue-600",
        isNavigation: true,
        navigationPath: "/twin-biografia/licencias"
    },
    { 
        id: "certificate", 
        label: "Certificados", 
        icon: "🏆", 
        description: "Certificados académicos, profesionales y de capacitación",
        iconComponent: Award,
        color: "text-yellow-600",
        isNavigation: true,
        navigationPath: "/twin-biografia/certificados"
    },
    { 
        id: "account_statement", 
        label: "Estados de cuenta", 
        icon: "💳", 
        description: "Estados bancarios, financieros y de servicios",
        iconComponent: CreditCard,
        color: "text-purple-600",
        isNavigation: true,
        navigationPath: "/twin-biografia/estados-cuenta"
    },
    { 
        id: "form", 
        label: "Formularios", 
        icon: "📋", 
        description: "Formularios oficiales, solicitudes y registros",
        iconComponent: ClipboardList,
        color: "text-orange-600",
        isNavigation: true,
        navigationPath: "/twin-biografia/formularios"
    }
];

const DocumentosSemiEstructuradosPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    const TWIN_ID = msalUser?.localAccountId || null;

    const [documentos, setDocumentos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<string>("todas");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        if (TWIN_ID) {
            cargarDocumentos();
        }
    }, [TWIN_ID, subcategoriaSeleccionada]);

    const cargarDocumentos = async () => {
        if (!TWIN_ID) return;
        
        setIsLoading(true);
        try {
            console.log(`📋 Cargando documentos semi-estructurados para twin: ${TWIN_ID}`);
            
            if (subcategoriaSeleccionada === "todas") {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "semi-estructurado");
                setDocumentos(response.documents || []);
            } else {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "semi-estructurado", subcategoriaSeleccionada);
                setDocumentos(response.documents || []);
            }
        } catch (error) {
            console.error("Error cargando documentos semi-estructurados:", error);
            setDocumentos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const documentosFiltrados = documentos.filter(doc => 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate("/twin-biografia/archivos-personales")}
                                variant="outline"
                                size="sm"
                                className="mr-4"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                    <FileText className="w-8 h-8 text-green-500 mr-3" />
                                    Documentos Semi-estructurados
                                </h1>
                                <p className="text-gray-600">Selecciona el tipo de documento semi-estructurado que deseas gestionar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y controles */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Filtro por subcategoría */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={subcategoriaSeleccionada === "todas" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSubcategoriaSeleccionada("todas")}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Todas las categorías
                            </Button>
                            {SUBCATEGORIAS_SEMI_ESTRUCTURADOS.map((sub) => {
                                const IconComponent = sub.iconComponent;
                                return (
                                    <Button
                                        key={sub.id}
                                        variant={subcategoriaSeleccionada === sub.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            if (sub.isNavigation && sub.navigationPath) {
                                                navigate(sub.navigationPath);
                                            } else {
                                                setSubcategoriaSeleccionada(sub.id);
                                            }
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <IconComponent className={`w-4 h-4 ${sub.color}`} />
                                        {sub.label}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar documentos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            
                            <div className="flex border border-gray-300 rounded-lg">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="rounded-r-none"
                                >
                                    <Grid size={16} />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-l-none"
                                >
                                    <List size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información de subcategorías */}
                {subcategoriaSeleccionada !== "todas" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        {(() => {
                            const subcategoria = SUBCATEGORIAS_SEMI_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada);
                            const IconComponent = subcategoria?.iconComponent;
                            return subcategoria && IconComponent ? (
                                <div className="flex items-start gap-3">
                                    <IconComponent className={`w-8 h-8 ${subcategoria.color}`} />
                                    <div>
                                        <h3 className="font-semibold text-green-900">
                                            {subcategoria.label}
                                        </h3>
                                        <p className="text-green-700 text-sm">
                                            {subcategoria.description}
                                        </p>
                                        <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full inline-block">
                                            ✨ Procesamiento automático con IA
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>
                )}

                {/* Lista de documentos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Documentos ({documentosFiltrados.length})
                        </h2>
                        <Button className="bg-green-500 hover:bg-green-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Documento Semi-estructurado
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Cargando documentos...</p>
                        </div>
                    ) : documentosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay documentos semi-estructurados
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {subcategoriaSeleccionada === "todas" 
                                    ? "Selecciona una categoría para gestionar tus documentos"
                                    : `No hay documentos de tipo ${SUBCATEGORIAS_SEMI_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada)?.label}`
                                }
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                                <h4 className="font-medium text-green-800 mb-2">💡 Tip para documentos semi-estructurados:</h4>
                                <p className="text-green-700 text-sm">
                                    Estos documentos son procesados automáticamente con IA para extraer información clave como montos, fechas, nombres y otros campos específicos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                            {documentosFiltrados.map((doc, index) => (
                                <div 
                                    key={index}
                                    className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                        viewMode === "list" ? "flex items-center justify-between" : ""
                                    }`}
                                >
                                    <div className={viewMode === "list" ? "flex items-center gap-3" : ""}>
                                        <div className="relative">
                                            <FileText className="w-8 h-8 text-green-500" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 truncate">
                                                {doc.filename}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : "Tamaño desconocido"}
                                            </p>
                                            {doc.metadata?.hasAiInvoiceAnalysis && (
                                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                    ✨ Procesado con IA
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={`${viewMode === "list" ? "flex" : "flex mt-3"} gap-2`}>
                                        <Button size="sm" variant="outline">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentosSemiEstructuradosPage;