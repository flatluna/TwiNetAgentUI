import React from "react";
import { useNavigate } from "react-router-dom";
import { Network, Bot, Users, Database } from "lucide-react";
import Logo from "@/assets/Logo.png";

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido al Dashboard</h1>
            <p className="text-gray-600 mb-6">Aquí puedes gestionar tus Twins, ver estadísticas y acceder a funcionalidades avanzadas.</p>
            
            {/* Acceso rápido a Twin Agents Network */}
            <div className="mb-8">
                <div 
                    onClick={() => navigate('/twin-agents-network')}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="flex items-center mb-2">
                                <Network className="w-8 h-8 mr-3" />
                                <h2 className="text-2xl font-bold">Twin Agents Network</h2>
                            </div>
                            <p className="text-cyan-100 text-lg">
                                Accede a tu red completa de agentes AI especializados
                            </p>
                        </div>
                        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards existentes del dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    onClick={() => navigate('/twin-agents-network')}
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                    <div className="flex items-center mb-3">
                        <img 
                            src={Logo} 
                            alt="TwinAgent Network" 
                            className="w-8 h-8 mr-3 rounded-full bg-white p-1"
                        />
                        <h2 className="text-xl font-semibold text-white">TwinAgent Network</h2>
                    </div>
                    <p className="text-indigo-100">Red completa de agentes AI especializados.</p>
                    <div className="mt-3 text-white group-hover:text-indigo-100 transition-colors">
                        Explorar Red →
                    </div>
                </div>
                
                <div 
                    onClick={() => navigate('/mis-twins')}
                    className="bg-blue-100 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition-shadow group"
                >
                    <div className="flex items-center mb-3">
                        <Users className="w-6 h-6 text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-blue-800">Tus Twins</h2>
                    </div>
                    <p className="text-gray-700">Gestiona y visualiza tus Twins personales.</p>
                    <div className="mt-3 text-blue-600 group-hover:text-blue-800 transition-colors">
                        Ver Twins →
                    </div>
                </div>
                
                <div 
                    onClick={() => navigate('/twin-agent')}
                    className="bg-green-100 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition-shadow group"
                >
                    <div className="flex items-center mb-3">
                        <Bot className="w-6 h-6 text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-green-800">Twin Agent</h2>
                    </div>
                    <p className="text-gray-700">Interactúa con tu asistente Twin AI.</p>
                    <div className="mt-3 text-green-600 group-hover:text-green-800 transition-colors">
                        Abrir Chat →
                    </div>
                </div>
                
                <div 
                    onClick={() => navigate('/mi-conocimiento')}
                    className="bg-purple-100 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition-shadow group"
                >
                    <div className="flex items-center mb-3">
                        <Database className="w-6 h-6 text-purple-600 mr-2" />
                        <h2 className="text-xl font-semibold text-purple-800">Mi Conocimiento</h2>
                    </div>
                    <p className="text-gray-700">Accede a tu biblioteca de conocimiento.</p>
                    <div className="mt-3 text-purple-600 group-hover:text-purple-800 transition-colors">
                        Explorar →
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
