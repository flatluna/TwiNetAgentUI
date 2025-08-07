import React from "react";
import { LoginButton } from "@/components/LoginButton";
import { MessageCircle, Mic, Users, BarChart3, Brain, Shield, Zap, Globe, User, Home, Car, Heart, Baby, Dog, BookOpen, Camera, Flower } from "lucide-react";
import logoPng from "@/assets/logo.png";

const LandingPage: React.FC = () => {
    const features = [
        {
            icon: MessageCircle,
            title: "Chat por Texto",
            description: "Conversa contigo mismo a través de mensajes de texto inteligentes"
        },
        {
            icon: Mic,
            title: "Chat por Voz",
            description: "Interactúa con tu Twin digital usando comandos de voz naturales"
        },
        {
            icon: Users,
            title: "Gestión de Twins",
            description: "Crea y administra múltiples versiones digitales de ti mismo"
        },
        {
            icon: Brain,
            title: "IA Avanzada",
            description: "Tecnología de inteligencia artificial de última generación"
        },
        {
            icon: Shield,
            title: "100% Seguro",
            description: "Tus datos están protegidos con encriptación de nivel empresarial"
        },
        {
            icon: Zap,
            title: "Respuestas Instantáneas",
            description: "Obtén respuestas inmediatas basadas en tu información personal"
        }
    ];

    const twinTypes = [
        {
            icon: User,
            title: "Tu Twin Personal",
            description: "Tu yo digital principal"
        },
        {
            icon: Heart,
            title: "Twins Familiares",
            description: "Pareja, hijos, padres"
        },
        {
            icon: Home,
            title: "Twin del Hogar",
            description: "Gestión inteligente de casa"
        },
        {
            icon: Car,
            title: "Twin del Vehículo",
            description: "Tu coche inteligente"
        },
        {
            icon: Dog,
            title: "Twins de Mascotas",
            description: "Perros, gatos y más"
        },
        {
            icon: BookOpen,
            title: "Twins de Libros",
            description: "Tu biblioteca personal"
        },
        {
            icon: Camera,
            title: "Twins de Recuerdos",
            description: "Fotos y colecciones"
        },
        {
            icon: Flower,
            title: "Twins de Plantas",
            description: "Jardín y vegetación"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img 
                                src={logoPng} 
                                alt="TwinAgent Logo" 
                                className="h-10 w-10"
                            />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                TwinAgent
                            </span>
                        </div>
                        <LoginButton />
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col justify-center">
                {/* Hero Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-6xl mx-auto text-center">
                        <div className="mb-8">
                            <img 
                                src={logoPng} 
                                alt="TwinAgent Logo" 
                                className="h-24 w-24 md:h-32 md:w-32 mx-auto mb-6"
                            />
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6">
                                Bienvenido a{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    TwinAgent
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                                Conversa contigo mismo a través de tu Twin Digital. Una experiencia única de autoconocimiento 
                                potenciada por inteligencia artificial avanzada.
                            </p>
                            
                            {/* Tipos de Twins que puede crear */}
                            <div className="mb-8 p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200 max-w-5xl mx-auto">
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                                    🎯 Crea Twins para Toda tu Vida
                                </h2>
                                <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                                    Tendrás acceso a tus propios Twins y podrás crear para tu familia, casa, coche y más. 
                                    Construye un ecosistema digital completo de tu mundo personal.
                                </p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
                                    {twinTypes.map((type, index) => (
                                        <div 
                                            key={index}
                                            className="text-center group hover:scale-105 transition-transform duration-300"
                                        >
                                            <div className="p-3 lg:p-4 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300 border border-gray-100 mb-2">
                                                <type.icon className="h-6 w-6 lg:h-8 lg:w-8 mx-auto text-blue-600 group-hover:text-green-600 transition-colors duration-300" />
                                            </div>
                                            <h3 className="text-xs lg:text-sm font-medium text-gray-900 mb-1">
                                                {type.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 leading-tight">
                                                {type.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 text-center">
                                    <p className="text-sm lg:text-base text-gray-600">
                                        ✨ <span className="font-semibold">¡Y muchos más!</span> Cada Twin aprende y evoluciona contigo
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <LoginButton />
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Globe className="h-4 w-4" />
                                <span>Disponible en múltiples idiomas</span>
                            </div>
                        </div>

                        {/* Features Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                                >
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
                                            <feature.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Security Section */}
            <section className="py-16 bg-white">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-green-50 rounded-2xl p-8 lg:p-12 border border-green-200">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 lg:p-6 bg-green-500 rounded-full">
                                <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Tu Información Personal está 100% Protegida
                        </h2>
                        <p className="text-lg lg:text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
                            Toda tu información personal te pertenece únicamente a ti. Está encriptada y almacenada 
                            de forma segura en Microsoft Azure, la nube más confiable del mundo. Nadie más puede 
                            acceder a tus datos personales - solo tú tienes el control total de tu información.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-8 max-w-5xl mx-auto">
                            <div className="text-center p-4">
                                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-3">🔐</div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Encriptación Avanzada</h3>
                                <p className="text-sm lg:text-base text-gray-600">Protección de datos de nivel empresarial</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-3">☁️</div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Microsoft Azure</h3>
                                <p className="text-sm lg:text-base text-gray-600">Infraestructura cloud más segura del mundo</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-3">👤</div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Control Total</h3>
                                <p className="text-sm lg:text-base text-gray-600">Solo tú decides qué datos compartir</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        ¿Listo para Conversar Contigo Mismo?
                    </h2>
                    <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Únete a TwinAgent y descubre una nueva forma de autoconocimiento y reflexión personal.
                    </p>
                    <div className="flex justify-center">
                        <LoginButton />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <img 
                                src={logoPng} 
                                alt="TwinAgent Logo" 
                                className="h-8 w-8"
                            />
                            <span className="text-xl font-bold">TwinAgent</span>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-gray-400 text-sm">
                                &copy; 2025 TwinAgent. Todos los derechos reservados.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Potenciado por Microsoft Azure
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
