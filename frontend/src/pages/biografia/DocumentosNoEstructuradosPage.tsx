import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { documentApiService } from "@/services/documentApiService";
import { 
    ArrowLeft,
    FolderOpen,
    Upload,
    Download,
    Eye,
    Search,
    Grid,
    List,
    FileText,
    Mail,
    MessageSquare,
    Newspaper,
    GraduationCap,
    Folder
} from "lucide-react";

// Subcategorías específicas para documentos no estructurados
const SUBCATEGORIAS_NO_ESTRUCTURADOS = [
    { 
        id: "contract", 
        label: "Contratos", 
        icon: "📄", 
        description: "Contratos legales y acuerdos comerciales",
        iconComponent: FileText,
        color: "text-blue-600"
    },
    { 
        id: "cursos", 
        label: "Cursos", 
        icon: "🎓", 
        description: "Material educativo, certificados y contenido de cursos",
        iconComponent: GraduationCap,
        color: "text-purple-600"
    },
    { 
        id: "report", 
        label: "Reportes", 
        icon: "📊", 
        description: "Reportes narrativos y documentos analíticos",
        iconComponent: FileText,
        color: "text-green-600"
    },
    { 
        id: "email", 
        label: "Emails", 
        icon: "✉️", 
        description: "Correspondencia electrónica y comunicaciones",
        iconComponent: Mail,
        color: "text-red-600"
    },
    { 
        id: "letter", 
        label: "Cartas", 
        icon: "💌", 
        description: "Correspondencia formal y comunicaciones escritas",
        iconComponent: MessageSquare,
        color: "text-pink-600"
    },
    { 
        id: "article", 
        label: "Artículos", 
        icon: "📰", 
        description: "Artículos, publicaciones y contenido editorial",
        iconComponent: Newspaper,
        color: "text-yellow-600"
    },
    { 
        id: "otros", 
        label: "Otros", 
        icon: "📁", 
        description: "Otros documentos no estructurados",
        iconComponent: Folder,
        color: "text-gray-600"
    }
];

const DocumentosNoEstructuradosPage: React.FC = () => {
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
            console.log(`📝 Cargando documentos no estructurados para twin: ${TWIN_ID}`);
            
            if (subcategoriaSeleccionada === "todas") {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "no-estructurado");
                setDocumentos(response.documents || []);
            } else {
                const response = await documentApiService.listStructuredDocuments(TWIN_ID, "no-estructurado", subcategoriaSeleccionada);
                setDocumentos(response.documents || []);
            }
        } catch (error) {
            console.error("Error cargando documentos no estructurados:", error);
            setDocumentos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const documentosFiltrados = documentos.filter(doc => 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
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
                                    <FolderOpen className="w-8 h-8 text-purple-500 mr-3" />
                                    Documentos No estructurados
                                </h1>
                                <p className="text-gray-600">Gestiona documentos con contenido libre y análisis inteligente</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validación especial para documentos no estructurados */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-yellow-900 mb-2">
                                Validación especial para documentos no estructurados
                            </h3>
                            <ul className="text-yellow-800 text-sm space-y-1">
                                <li>• <strong>Con índice:</strong> Cualquier cantidad de páginas ✅</li>
                                <li>• <strong>Sin índice:</strong> Máximo 30 páginas ⚠️</li>
                                <li>• <strong>Sin índice + más de 30 páginas:</strong> Requiere agregar índice antes de subir ❌</li>
                            </ul>
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
                                className="bg-purple-500 hover:bg-purple-600"
                            >
                                Todas las categorías
                            </Button>
                            {SUBCATEGORIAS_NO_ESTRUCTURADOS.map((sub) => {
                                const IconComponent = sub.iconComponent;
                                return (
                                    <Button
                                        key={sub.id}
                                        variant={subcategoriaSeleccionada === sub.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSubcategoriaSeleccionada(sub.id)}
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
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        {(() => {
                            const subcategoria = SUBCATEGORIAS_NO_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada);
                            const IconComponent = subcategoria?.iconComponent;
                            return subcategoria && IconComponent ? (
                                <div className="flex items-start gap-3">
                                    <IconComponent className={`w-8 h-8 ${subcategoria.color}`} />
                                    <div>
                                        <h3 className="font-semibold text-purple-900">
                                            {subcategoria.label}
                                        </h3>
                                        <p className="text-purple-700 text-sm">
                                            {subcategoria.description}
                                        </p>
                                        <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full inline-block">
                                            🧠 Análisis de contenido con IA
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
                        <Button className="bg-purple-500 hover:bg-purple-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Documento No estructurado
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Cargando documentos...</p>
                        </div>
                    ) : documentosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay documentos no estructurados
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {subcategoriaSeleccionada === "todas" 
                                    ? "Comienza subiendo contratos, reportes o documentos narrativos"
                                    : `No hay documentos de tipo ${SUBCATEGORIAS_NO_ESTRUCTURADOS.find(s => s.id === subcategoriaSeleccionada)?.label}`
                                }
                            </p>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
                                <h4 className="font-medium text-purple-800 mb-2">💡 Tip para documentos no estructurados:</h4>
                                <p className="text-purple-700 text-sm">
                                    Estos documentos son analizados con IA para extraer temas clave, resúmenes y puntos importantes del contenido narrativo.
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
                                            <FolderOpen className="w-8 h-8 text-purple-500" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 truncate">
                                                {doc.filename}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : "Tamaño desconocido"}
                                            </p>
                                            {doc.metadata?.hasAiCompleteAnalysis && (
                                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                    🧠 Analizado con IA
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

export default DocumentosNoEstructuradosPage;