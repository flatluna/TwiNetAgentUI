import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    FileText,
    Database,
    BarChart3,
    FileImage,
    ChevronRight
} from "lucide-react";

const ArchivosPersonalesHome: React.FC = () => {
    const navigate = useNavigate();

    const tiposDocumentos = [
        {
            id: "estructurados",
            title: "Documentos Estructurados",
            description: "Datos organizados en formatos específicos con estructura fija",
            icon: Database,
            iconColor: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            examples: ["CSV", "JSON", "XML", "Bases de datos"],
            path: "/twin-biografia/archivos-personales/estructurados",
            count: "4 subcategorías"
        },
        {
            id: "semi-estructurados",
            title: "Documentos Semi-estructurados",
            description: "Documentos con algunos elementos estructurados y campos específicos",
            icon: BarChart3,
            iconColor: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            examples: ["Facturas", "Licencias", "Certificados", "Estados de cuenta"],
            path: "/twin-biografia/archivos-personales/semi-estructurados",
            count: "5 subcategorías"
        },
        {
            id: "no-estructurados",
            title: "Documentos No estructurados",
            description: "Documentos de texto libre sin estructura fija predefinida",
            icon: FileText,
            iconColor: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            examples: ["Contratos", "Cursos", "Reportes", "Cartas", "Artículos"],
            path: "/twin-biografia/archivos-personales/no-estructurados",
            count: "6 subcategorías"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate("/twin-biografia")}
                                variant="outline"
                                size="sm"
                                className="mr-4"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Tus Archivos Personales</h1>
                                <p className="text-gray-600">Organiza y gestiona tus documentos por tipo de estructura</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Descripción general */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="flex items-start space-x-4">
                        <FileImage className="w-8 h-8 text-indigo-600 mt-1" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Gestión Inteligente de Documentos
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Organiza tus documentos según su estructura para un procesamiento óptimo con IA. 
                                Cada tipo de documento tiene características específicas que permiten una mejor 
                                extracción de datos y análisis.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">💡 ¿Cómo elegir el tipo correcto?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>Estructurados:</strong> Si el archivo tiene datos en tablas, columnas o formato específico</li>
                                    <li>• <strong>Semi-estructurados:</strong> Si es un documento con campos fijos (como facturas o formularios)</li>
                                    <li>• <strong>No estructurados:</strong> Si es texto libre, narrativo o sin formato específico</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de tipos de documentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiposDocumentos.map((tipo) => {
                        const IconComponent = tipo.icon;
                        return (
                            <div
                                key={tipo.id}
                                className={`bg-white rounded-lg shadow-sm border ${tipo.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                                onClick={() => navigate(tipo.path)}
                            >
                                <div className="p-6">
                                    {/* Header del card */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${tipo.bgColor}`}>
                                            <IconComponent className={`w-6 h-6 ${tipo.iconColor}`} />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500">{tipo.count}</span>
                                        </div>
                                    </div>

                                    {/* Título y descripción */}
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {tipo.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {tipo.description}
                                    </p>

                                    {/* Ejemplos */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-gray-500 mb-2">EJEMPLOS:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {tipo.examples.map((ejemplo, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                >
                                                    {ejemplo}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                        <span className="text-sm font-medium text-gray-700">
                                            Ver subcategorías
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Información adicional */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                        🚀 Procesamiento con IA
                    </h3>
                    <p className="text-indigo-800 mb-4">
                        Cada tipo de documento se procesa con tecnologías específicas de Azure AI para 
                        extraer la máxima información útil:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <h4 className="font-medium text-indigo-900 mb-1">Estructurados</h4>
                            <p className="text-sm text-indigo-700">Análisis de datos tabulares y extracción de métricas</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <h4 className="font-medium text-indigo-900 mb-1">Semi-estructurados</h4>
                            <p className="text-sm text-indigo-700">Azure Document Intelligence para campos específicos</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <h4 className="font-medium text-indigo-900 mb-1">No estructurados</h4>
                            <p className="text-sm text-indigo-700">Análisis de texto con validación de índices</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivosPersonalesHome;