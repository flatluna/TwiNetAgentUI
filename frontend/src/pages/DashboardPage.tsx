import React from "react";

const DashboardPage: React.FC = () => {
    return (
        <>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido al Dashboard</h1>
            <p className="text-gray-600 mb-6">Aquí puedes gestionar tus Twins, ver estadísticas y acceder a funcionalidades avanzadas.</p>
            {/* Aquí irán los cards y widgets del dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-100 p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Tus Twins</h2>
                    <p className="text-gray-700">Gestiona y visualiza tus Twins personales.</p>
                </div>
                <div className="bg-green-100 p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Estadísticas</h2>
                    <p className="text-gray-700">Consulta estadísticas y actividad reciente.</p>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
