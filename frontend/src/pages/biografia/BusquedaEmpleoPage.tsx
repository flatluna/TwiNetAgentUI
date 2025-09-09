import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    Target,
    TrendingUp,
    Users,
    MessageSquare,
    Search,
    Briefcase,
    Star,
    DollarSign,
    ChevronRight,
    Building,
    Brain,
    CheckCircle
} from "lucide-react";

const BusquedaEmpleoPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const empleoSections = [
        {
            id: "analisis-mercado",
            title: "Análisis de Mercado Laboral",
            description: "Explora tendencias del mercado, salarios promedio y demanda por habilidades",
            icon: TrendingUp,
            color: "bg-blue-500",
            features: [
                "Tendencias salariales por industria",
                "Demanda de habilidades técnicas",
                "Análisis de competencia",
                "Mercados emergentes"
            ]
        },
        {
            id: "sugerencias-trabajos",
            title: "Trabajos Recomendados",
            description: "Encuentra oportunidades laborales basadas en tu perfil y experiencia",
            icon: Search,
            color: "bg-green-500",
            features: [
                "Trabajos compatibles con tu CV",
                "Oportunidades en tu área",
                "Roles de crecimiento profesional",
                "Empresas que contratan"
            ]
        },
        {
            id: "preparacion-entrevistas",
            title: "Preparación para Entrevistas",
            description: "Practica y perfecciona tus habilidades de entrevista",
            icon: MessageSquare,
            color: "bg-purple-500",
            features: [
                "Simulador de entrevistas",
                "Preguntas frecuentes por industria",
                "Tips de comunicación",
                "Evaluación de respuestas"
            ]
        },
        {
            id: "optimizacion-perfil",
            title: "Optimización del Perfil",
            description: "Mejora tu CV, LinkedIn y presencia profesional online",
            icon: Star,
            color: "bg-orange-500",
            features: [
                "Análisis de CV con IA",
                "Optimización de LinkedIn",
                "Carta de presentación",
                "Portfolio profesional"
            ]
        },
        {
            id: "networking",
            title: "Conexiones y Networking",
            description: "Conecta con reclutadores y expande tu red profesional",
            icon: Users,
            color: "bg-pink-500",
            features: [
                "Directorio de reclutadores",
                "Eventos de networking",
                "Grupos profesionales",
                "Mentores de la industria"
            ]
        }
    ];

    const estadisticasMercado = [
        { label: "Trabajos disponibles", value: "12,450", icon: Briefcase, color: "text-blue-600" },
        { label: "Salario promedio", value: "$75,000", icon: DollarSign, color: "text-green-600" },
        { label: "Tasa de empleo", value: "94.2%", icon: TrendingUp, color: "text-purple-600" },
        { label: "Empresas activas", value: "2,340", icon: Building, color: "text-orange-600" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate("/twin-biografia")}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                                    <Target size={28} />
                                </div>
                                Búsqueda de Empleo
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Tu asistente inteligente para encontrar el trabajo perfecto
                            </p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas del mercado */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {estadisticasMercado.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secciones principales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {empleoSections.map((section) => (
                        <div 
                            key={section.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${section.color} text-white`}>
                                    <section.icon size={28} />
                                </div>
                                <ChevronRight 
                                    size={20} 
                                    className={`text-gray-400 transition-transform duration-200 ${
                                        activeSection === section.id ? 'rotate-90' : ''
                                    }`}
                                />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                {section.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-4">
                                {section.description}
                            </p>

                            {/* Features expandibles */}
                            {activeSection === section.id && (
                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <h4 className="font-semibold text-gray-700 mb-3">Características:</h4>
                                    <ul className="space-y-2">
                                        {section.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle size={16} className="text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <Button 
                                        className="w-full mt-4"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Aquí irían las navegaciones específicas para cada sección
                                            console.log(`Navegando a ${section.id}`);
                                        }}
                                    >
                                        Comenzar
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 mt-8">
                    <div className="text-center">
                        <Brain size={48} className="mx-auto mb-4 opacity-90" />
                        <h2 className="text-2xl font-bold mb-4">
                            ¿Listo para encontrar tu próximo trabajo?
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Nuestro asistente de IA analizará tu perfil y te ayudará a encontrar las mejores 
                            oportunidades laborales adaptadas a tus habilidades y objetivos profesionales.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                variant="secondary" 
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                <Target className="mr-2" size={20} />
                                Análisis Completo
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-blue-600"
                            >
                                <Search className="mr-2" size={20} />
                                Buscar Trabajos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusquedaEmpleoPage;
