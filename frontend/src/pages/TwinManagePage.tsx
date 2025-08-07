import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Eye, Settings, BarChart3, BookOpen } from "lucide-react";

const TwinManagePage: React.FC = () => {
    const navigate = useNavigate();

    const managementOptions = [
        {
            id: "crear-twin",
            title: "Crear Nuevo Twin",
            description: "Configura y crea un nuevo Twin digital con toda la información básica",
            icon: UserPlus,
            path: "/crear-twin",
            color: "bg-green-500 hover:bg-green-600",
            stats: "0 creados hoy"
        },
        {
            id: "biografia-digital",
            title: "Biografía Digital",
            description: "Documenta tu historia de vida completa: familia, trabajo, educación, lugares, experiencias, recuerdos y todo lo que te hace único",
            icon: BookOpen,
            path: "/twin-biografia",
            color: "bg-indigo-500 hover:bg-indigo-600",
            stats: "Historia completa",
            featured: true
        },
        {
            id: "ver-twins",
            title: "Ver Mis Twins",
            description: "Gestiona y visualiza todos tus Twins existentes",
            icon: Eye,
            path: "/mis-twins",
            color: "bg-blue-500 hover:bg-blue-600",
            stats: "0 twins activos"
        },
        {
            id: "estadisticas",
            title: "Estadísticas",
            description: "Analiza el rendimiento y uso de tus Twins",
            icon: BarChart3,
            path: "/estadisticas",
            color: "bg-purple-500 hover:bg-purple-600",
            stats: "Sin datos aún"
        },
        {
            id: "configuracion-twins",
            title: "Configuración Avanzada",
            description: "Ajustes avanzados para el comportamiento de los Twins",
            icon: Settings,
            path: "/configuracion-twins",
            color: "bg-gray-500 hover:bg-gray-600",
            stats: "Configuración básica"
        }
    ];

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground heading-clear-dark mb-2">TwinAgent Management</h1>
                    <p className="text-muted-foreground text-clear-dark">
                        Centro de control para la gestión completa de tus Twins digitales
                    </p>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card rounded-lg shadow p-6 border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 dark-blue:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 dark-blue:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-foreground heading-clear-dark">0</h3>
                                <p className="text-sm text-muted-foreground text-clear-dark">Twins Totales</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow p-6 border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 dark-blue:bg-green-900/30">
                                <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400 dark-blue:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-foreground heading-clear-dark">0</h3>
                                <p className="text-sm text-muted-foreground text-clear-dark">Creados Hoy</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow p-6 border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 dark-blue:bg-yellow-900/30">
                                <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400 dark-blue:text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-foreground heading-clear-dark">0</h3>
                                <p className="text-sm text-muted-foreground text-clear-dark">Conversaciones</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow p-6 border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 dark-blue:bg-purple-900/30">
                                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400 dark-blue:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-foreground heading-clear-dark">Básica</h3>
                                <p className="text-sm text-muted-foreground text-clear-dark">Configuración</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opciones de gestión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {managementOptions.map((option) => (
                        <div 
                            key={option.id} 
                            className={`bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow border ${
                                option.featured ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
                            }`}
                        >
                            {option.featured && (
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-2 rounded-t-lg">
                                    <span className="text-sm font-semibold">📖 TU HISTORIA HUMANA COMPLETA</span>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${option.color.split(' ')[0]} text-white`}>
                                        <option.icon size={24} />
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded text-clear-dark">
                                        {option.stats}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-semibold text-foreground heading-clear-dark mb-2">
                                    {option.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-clear-dark mb-4">
                                    {option.description}
                                </p>
                                
                                <Button 
                                    className={`w-full ${option.color} text-white`}
                                    onClick={() => navigate(option.path)}
                                >
                                    {option.featured ? 'Explorar Biografía' : 'Acceder'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Acceso rápido */}
                <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
                    <div className="p-6 text-white">
                        <h3 className="text-xl font-semibold mb-2">🚀 Acceso Rápido</h3>
                        <p className="mb-4 opacity-90">
                            ¿Quieres empezar inmediatamente? Crea tu primer Twin en segundos
                        </p>
                        <div className="flex space-x-4">
                            <Button 
                                variant="outline" 
                                className="bg-white text-blue-600 hover:bg-gray-100 border-white"
                                onClick={() => navigate("/crear-twin")}
                            >
                                Crear Twin Ahora
                            </Button>
                            <Button 
                                variant="outline" 
                                className="border-white text-white hover:bg-white hover:text-blue-600"
                                onClick={() => navigate("/chat-voice")}
                            >
                                Probar Chat Voice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinManagePage;
