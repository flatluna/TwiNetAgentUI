import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MisTwinsPage: React.FC = () => {
    const navigate = useNavigate();

    // TODO: Aquí cargaremos los twins desde la API
    const twins = []; // Placeholder para twins

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header con acción rápida */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Tus Twins Digitales</h2>
                        <p className="text-gray-600">Gestiona y visualiza todos tus Twins</p>
                    </div>
                    <Button onClick={() => navigate("/crear-twin")}>
                        Crear Nuevo Twin
                    </Button>
                </div>

                {twins.length === 0 ? (
                    // Estado vacío
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No tienes Twins aún
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Crea tu primer Twin digital para comenzar
                        </p>
                        <Button 
                            onClick={() => navigate("/crear-twin")}
                            size="lg"
                        >
                            Crear mi Primer Twin
                        </Button>
                    </div>
                ) : (
                    // Lista de twins (implementar cuando tengamos datos)
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Aquí mostraremos los twins cuando los tengamos */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisTwinsPage;
