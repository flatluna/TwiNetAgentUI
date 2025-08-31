import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import TwinManagePage from "@/pages/TwinManagePage";
import TwinBiografiaPage from "@/pages/TwinBiografiaPage";
import FotosFamiliaresPage from "@/pages/biografia/FotosFamiliaresPage";
import DatosPersonalesPage from "@/pages/biografia/DatosPersonalesPage";
import ArchivosPersonalesPage from "@/pages/biografia/ArchivosPersonalesPage";
import ContactosPage from "@/pages/biografia/ContactosPage";
import EducacionPage from "@/pages/biografia/EducacionPage";
import FamiliaPage from "@/pages/biografia/FamiliaPage";
import CarreraProfesionalPage from "@/pages/biografia/CarreraProfesionalPage";
import ArchivoDetalles from "@/pages/biografia/ArchivoDetalles";
import TwinAgentArchivoDetalles from "@/pages/TwinAgentArchivoDetalles";
import AdvancedCSVViewer from "@/pages/biografia/AdvancedCSVViewer";
import CrearTwinPage from "@/pages/CrearTwinPage";
import MisTwinsPage from "@/pages/MisTwinsPage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";
import ChatVoicePage from "@/pages/ChatVoicePage";
import TwinAgentPage from "@/pages/TwinAgentPage";
import ProtectedRoute from "@/components/ProtectedRoute";

// Configuración de rutas
const router = createBrowserRouter([
    {
        path: "/auth-redirect",
        element: <AuthRedirectHandler />,
    },
    // ...existing code...
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
            {
                path: "dashboard",
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
            // Rutas protegidas
            {
                path: "twin-manage",
                element: <ProtectedRoute><TwinManagePage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia",
                element: <ProtectedRoute><TwinBiografiaPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/fotos",
                element: <ProtectedRoute><FotosFamiliaresPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/datos-personales",
                element: <ProtectedRoute><DatosPersonalesPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/archivos-personales",
                element: <ProtectedRoute><ArchivosPersonalesPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/contactos",
                element: <ProtectedRoute><ContactosPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/educacion",
                element: <ProtectedRoute><EducacionPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/familia",
                element: <ProtectedRoute><FamiliaPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/carrera-profesional",
                element: <ProtectedRoute><CarreraProfesionalPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/archivos-personales/:filename",
                element: <ProtectedRoute><ArchivoDetalles /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/csv-viewer/:filename",
                element: <ProtectedRoute><AdvancedCSVViewer /></ProtectedRoute>,
            },
            {
                path: "twin-agent/archivos/:filename",
                element: <ProtectedRoute><TwinAgentArchivoDetalles /></ProtectedRoute>,
            },
            {
                path: "crear-twin",
                element: <ProtectedRoute><CrearTwinPage /></ProtectedRoute>,
            },
            {
                path: "mis-twins",
                element: <ProtectedRoute><MisTwinsPage /></ProtectedRoute>,
            },
            {
                path: "configuracion",
                element: <ProtectedRoute><ConfiguracionPage /></ProtectedRoute>,
            },
            {
                path: "chat-voice",
                element: <ProtectedRoute><ChatVoicePage /></ProtectedRoute>,
            },
            {
                path: "twin-agent",
                element: <ProtectedRoute><TwinAgentPage /></ProtectedRoute>,
            },
        ],
    },
    // Ruta para manejar 404
    {
        path: "*",
        element: (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Página no encontrada</p>
                    <a 
                        href="/" 
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Volver al Inicio
                    </a>
                </div>
            </div>
        ),
    },
]);

// Componente principal del router
const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
