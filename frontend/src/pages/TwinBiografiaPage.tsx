import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    User,
    GraduationCap, 
    Home, 
    Users, 
    Heart, 
    Briefcase,
    Camera,
    Plane,
    Gift,
    ChevronRight,
    FolderOpen,
    Phone,
    Target,
    Dumbbell,
    Apple,
    BookOpen,
    ChefHat,
    Sun,
    PenTool
} from "lucide-react";

const TwinBiografiaPage: React.FC = () => {
    const navigate = useNavigate();

    // BLOQUE 1: INFORMACIÓN ESTRUCTURADA (Datos estáticos)
    const informacionEstructurada = [
        {
            category: "Información Personal",
            color: "bg-blue-500",
            items: [
                {
                    id: "datos-personales",
                    title: "Datos Personales",
                    description: "Información básica, contacto, identificación",
                    icon: User,
                    path: "/twin-biografia/datos-personales",
                    progress: 0
                },
                {
                    id: "familia",
                    title: "Mi Familia",
                    description: "Padres, hermanos, hijos, familia extendida",
                    icon: Users,
                    path: "/twin-biografia/familia",
                    progress: 0
                },
                {
                    id: "contactos",
                    title: "Contactos",
                    description: "Amigos, colegas, contactos importantes",
                    icon: Phone,
                    path: "/twin-biografia/contactos",
                    progress: 0
                },
                {
                    id: "fotos-familiares",
                    title: "Fotos Familiares",
                    description: "Álbum de fotos de familia y eventos importantes",
                    icon: Camera,
                    path: "/twin-biografia/fotos",
                    progress: 0
                },
                {
                    id: "archivos-personales",
                    title: "Tus archivos personales",
                    description: "Documentos, certificados, archivos importantes",
                    icon: FolderOpen,
                    path: "/twin-biografia/archivos-personales",
                    progress: 0
                },
                {
                    id: "mi-salud",
                    title: "Mi Salud",
                    description: "Historial médico, citas, medicamentos, bienestar",
                    icon: Heart,
                    path: "/twin-biografia/salud",
                    progress: 0
                },
                {
                    id: "lugares-donde-vivo",
                    title: "Lugares donde Vivo",
                    description: "Viviendas actuales y pasadas, mudanzas, detalles de propiedades",
                    icon: Home,
                    path: "/twin-biografia/lugares",
                    progress: 0
                }
            ]
        },
        {
            category: "Carrera & Educación",
            color: "bg-green-500",
            items: [
                {
                    id: "educacion",
                    title: "Educación",
                    description: "Estudios, universidades, certificaciones",
                    icon: GraduationCap,
                    path: "/twin-biografia/educacion",
                    progress: 0
                },
                {
                    id: "carrera",
                    title: "Carrera Profesional",
                    description: "CV, historial laboral, empresas, sueldos, crecimiento",
                    icon: Briefcase,
                    path: "/twin-biografia/carrera-profesional",
                    progress: 0
                },
                {
                    id: "oportunidades-empleo",
                    title: "Oportunidades de Empleo",
                    description: "Gestiona y da seguimiento a las oportunidades laborales que estás considerando",
                    icon: Target,
                    path: "/twin-biografia/oportunidades-empleo",
                    progress: 0
                }
            ]
        },
        {
            category: "Mi Salud",
            color: "bg-red-500",
            items: [
                {
                    id: "ejercicio",
                    title: "Ejercicio y Actividad Física",
                    description: "Rutinas de ejercicio, deportes, actividad física diaria",
                    icon: Dumbbell,
                    path: "/twin-biografia/salud/ejercicio",
                    progress: 0
                },
                {
                    id: "diario-alimentacion",
                    title: "Diario de Alimentación",
                    description: "Registro diario de comidas, hábitos alimenticios",
                    icon: Apple,
                    path: "/twin-biografia/salud/diario-alimentacion",
                    progress: 0
                },
                {
                    id: "recetas",
                    title: "Recetas Saludables",
                    description: "Recetas favoritas, comidas saludables, preparaciones especiales",
                    icon: ChefHat,
                    path: "/twin-biografia/salud/recetas",
                    progress: 0
                },
                {
                    id: "bienestar",
                    title: "Bienestar y Relajación",
                    description: "Meditación, yoga, técnicas de relajación, mindfulness",
                    icon: BookOpen,
                    path: "/twin-biografia/salud/bienestar",
                    progress: 0
                },
                {
                    id: "habitos-saludables",
                    title: "Hábitos Saludables",
                    description: "Rutinas diarias, patrones de sueño, hábitos de hidratación",
                    icon: Sun,
                    path: "/twin-biografia/salud/habitos",
                    progress: 0
                },
                {
                    id: "objetivos-fitness",
                    title: "Objetivos de Fitness",
                    description: "Metas de ejercicio, logros deportivos, desafíos personales",
                    icon: Target,
                    path: "/twin-biografia/salud/objetivos",
                    progress: 0
                }
            ]
        }
    ];

    // BLOQUE 2: CRONOLOGÍA DE EVENTOS (Historia día a día)
    const cronologiaEventos = [
        {
            category: "Historias del Día",
            color: "bg-indigo-500",
            items: [
                {
                    id: "mi-diario-personal",
                    title: "📖 Mi Diario Personal",
                    description: "Registra día a día tus pensamientos, experiencias y memorias cotidianas",
                    icon: PenTool,
                    path: "/biografia/diario-personal",
                    progress: 0
                }
            ]
        },
        {
            category: "Eventos de Vida",
            color: "bg-purple-500",
            items: [
                {
                    id: "viajes",
                    title: "Viajes y Vacaciones",
                    description: "Vacaciones, turismo, aventuras y viajes de trabajo",
                    icon: Plane,
                    path: "/twin-biografia/viajes-vacaciones",
                    progress: 0
                },
                {
                    id: "cumpleanos",
                    title: "Cumpleaños",
                    description: "Celebraciones de cumpleaños memorables",
                    icon: Gift,
                    path: "/twin-biografia/eventos/cumpleanos",
                    progress: 0
                },
                {
                    id: "trabajo-eventos",
                    title: "Eventos de Trabajo",
                    description: "Conferencias, reuniones importantes, logros",
                    icon: Briefcase,
                    path: "/twin-biografia/eventos/trabajo",
                    progress: 0
                }
            ]
        }
    ];

    const handleNavigateToSection = (path: string) => {
        navigate(path);
    };

    const calculateCategoryProgress = (items: any[]) => {
        const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
        return Math.round(totalProgress / items.length);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Tu Historia Humana Completa
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Documenta tu vida completa: información personal, carrera y todos los eventos que han marcado tu historia
                    </p>
                </div>

                {/* BLOQUE 1: INFORMACIÓN ESTRUCTURADA */}
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                            1
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Información Estructurada
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-6 ml-11">
                        Datos permanentes sobre ti: información personal, familia, educación, carrera y lugares donde has vivido
                    </p>

                    <div className="grid gap-8 ml-11">
                        {informacionEstructurada.map((section) => (
                            <div key={section.category} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-4">
                                    <div className={`w-4 h-4 rounded-full ${section.color} mr-3`}></div>
                                    <h3 className="text-xl font-semibold text-gray-800">{section.category}</h3>
                                    <div className="ml-auto text-sm text-gray-500">
                                        {calculateCategoryProgress(section.items)}% completado
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.items.map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleNavigateToSection(item.path)}
                                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`p-2 rounded-lg ${section.color} bg-opacity-10`}>
                                                        <IconComponent className={`w-5 h-5 text-gray-700`} />
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                                
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${section.color}`}
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BLOQUE 2: CRONOLOGÍA DE EVENTOS */}
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                            2
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Historia Día a Día
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-6 ml-11">
                        Cronología de eventos: viajes, cumpleaños, trabajo y momentos casuales que han marcado tu vida
                    </p>

                    <div className="grid gap-8 ml-11">
                        {cronologiaEventos.map((section) => (
                            <div key={section.category} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-4">
                                    <div className={`w-4 h-4 rounded-full ${section.color} mr-3`}></div>
                                    <h3 className="text-xl font-semibold text-gray-800">{section.category}</h3>
                                    <div className="ml-auto text-sm text-gray-500">
                                        {calculateCategoryProgress(section.items)}% completado
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.items.map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleNavigateToSection(item.path)}
                                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`p-2 rounded-lg ${section.color} bg-opacity-10`}>
                                                        <IconComponent className={`w-5 h-5 text-gray-700`} />
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                                
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${section.color}`}
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <Button
                        onClick={() => navigate("/")}
                        variant="outline"
                        size="lg"
                        className="mr-4"
                    >
                        Volver al Inicio
                    </Button>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        Comenzar Mi Historia
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TwinBiografiaPage;
