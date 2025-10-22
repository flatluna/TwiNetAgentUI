import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    Database,
    FileText,
    FolderOpen,
    ChevronRight
} from "lucide-react";

const ArchivosPersonalesHomePage: React.FC = () => {
    const navigate = useNavigate();

    const documentTypes = [
        {
            id: "estructurados",
            title: "Documentos Estructurados",
            description: "Datos organizados en formatos específicos con estructura clara y predefinida",
            icon: Database,
            color: "bg-blue-500",
            hoverColor: "hover:bg-blue-600",
            examples: ["CSV", "JSON", "XML", "Bases de datos"],
            path: "/twin-biografia/archivos-personales/estructurados",
            stats: "Ideal para análisis de datos"
        },
        {
            id: "semi-estructurados", 
            title: "Documentos Semi-estructurados",
            description: "Documentos con formato parcial que contienen tanto datos estructurados como no estructurados",
            icon: FileText,
            color: "bg-green-500", 
            hoverColor: "hover:bg-green-600",
            examples: ["Facturas", "Certificados", "Formularios", "Estados de cuenta"],
            path: "/twin-biografia/archivos-personales/semi-estructurados",
            stats: "Procesamiento con IA avanzada"
        },
        {
            id: "no-estructurados",
            title: "Documentos No estructurados", 
            description: "Contenido libre sin formato específico, principalmente texto narrativo",
            icon: FolderOpen,
            color: "bg-purple-500",
            hoverColor: "hover:bg-purple-600", 
            examples: ["Contratos", "Cursos", "Reportes", "Emails", "Artículos"],
            path: "/twin-biografia/archivos-personales/no-estructurados",
            stats: "Análisis de contenido inteligente"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
                                <h1 className="text-3xl font-bold text-gray-800">Gestión de Archivos Personales</h1>
                                <p className="text-gray-600">Organiza y gestiona tus documentos por tipo de estructura</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {documentTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                            <div 
                                key={type.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
                                onClick={() => navigate(type.path)}
                            >
                                {/* Header del card */}
                                <div className={`${type.color} ${type.hoverColor} p-6 rounded-t-xl text-white transition-colors duration-300`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <IconComponent className="w-8 h-8" />
                                        <ChevronRight className="w-5 h-5 opacity-70" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                                    <p className="text-sm opacity-90">{type.stats}</p>
                                </div>

                                {/* Contenido del card */}
                                <div className="p-6">
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                        {type.description}
                                    </p>

                                    {/* Ejemplos */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            Ejemplos:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {type.examples.map((example, index) => (
                                                <span 
                                                    key={index}
                                                    className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                                >
                                                    {example}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <Button 
                                        className={`w-full ${type.color} ${type.hoverColor} text-white transition-colors duration-300`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(type.path);
                                        }}
                                    >
                                        Gestionar {type.title}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Información adicional */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">¿Qué tipo de documento tienes?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <Database className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-2">Estructurados</h3>
                            <p className="text-sm text-gray-600">
                                Datos con formato fijo y columnas definidas. Perfectos para análisis y reportes.
                            </p>
                        </div>
                        <div className="text-center">
                            <FileText className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-2">Semi-estructurados</h3>
                            <p className="text-sm text-gray-600">
                                Formularios y documentos oficiales con campos específicos que pueden ser extraídos automáticamente.
                            </p>
                        </div>
                        <div className="text-center">
                            <FolderOpen className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-2">No estructurados</h3>
                            <p className="text-sm text-gray-600">
                                Documentos con texto libre como contratos, artículos o reportes narrativos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivosPersonalesHomePage;