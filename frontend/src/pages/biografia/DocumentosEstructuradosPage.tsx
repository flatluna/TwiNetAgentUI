import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { documentApiService } from "@/services/documentApiService";
import { 
    ArrowLeft,
    Database,
    Upload,
    FileText,
    Download,
    Eye,
    Search,
    Filter,
    Grid,
    List
} from "lucide-react";

// Subcategorías específicas para documentos estructurados
const SUBCATEGORIAS_ESTRUCTURADOS = [
    { id: "csv", label: "CSV", icon: "📊", description: "Datos separados por comas, ideal para hojas de cálculo" },
    { id: "json", label: "JSON", icon: "🔗", description: "Formato de intercambio de datos estructurados" },
    { id: "xml", label: "XML", icon: "📝", description: "Lenguaje de marcado extensible para datos estructurados" },
    { id: "database", label: "Base de datos", icon: "🗃️", description: "Archivos de bases de datos y exportaciones" }
];

const DocumentosEstructuradosPage: React.FC = () => {
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
            console.log(`📊 Cargando documentos estructurados para twin: ${TWIN_ID}`);
            
            if (subcategoriaSeleccionada === "todas") {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "estructurado");
                setDocumentos(response.documents || []);
            } else {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "estructurado", subcategoriaSeleccionada);
                setDocumentos(response.documents || []);
            }
        } catch (error) {
            console.error("Error cargando documentos estructurados:", error);
            setDocumentos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const documentosFiltrados = documentos.filter(doc => 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
                                    <Database className="w-8 h-8 text-blue-500 mr-3" />
                                    Documentos Estructurados
                                </h1>
                                <p className="text-gray-600">Gestiona archivos con datos organizados y estructura definida</p>
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
                            >
                                Todas las categorías
                            </Button>
                            {SUBCATEGORIAS_ESTRUCTURADOS.map((sub) => (
                                <Button
                                    key={sub.id}
                                    variant={subcategoriaSeleccionada === sub.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSubcategoriaSeleccionada(sub.id)}
                                    className="flex items-center gap-2"
                                >
                                    <span>{sub.icon}</span>
                                    {sub.label}
                                </Button>
                            ))}
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
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        {(() => {
                            const subcategoria = SUBCATEGORIAS_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada);
                            return subcategoria ? (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{subcategoria.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-blue-900">
                                            {subcategoria.label}
                                        </h3>
                                        <p className="text-blue-700 text-sm">
                                            {subcategoria.description}
                                        </p>
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
                        <Button className="bg-blue-500 hover:bg-blue-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Documento Estructurado
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Cargando documentos...</p>
                        </div>
                    ) : documentosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay documentos estructurados
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {subcategoriaSeleccionada === "todas" 
                                    ? "Comienza subiendo tu primer documento estructurado"
                                    : `No hay documentos de tipo ${SUBCATEGORIAS_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada)?.label}`
                                }
                            </p>
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
                                        <FileText className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <h3 className="font-medium text-gray-800 truncate">
                                                {doc.filename}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : "Tamaño desconocido"}
                                            </p>
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

export default DocumentosEstructuradosPage;