import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";
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
import OportunidadesEmpleoPage from "@/pages/biografia/OportunidadesEmpleoPage";
import OportunidadEmpleoDetalle from "@/pages/biografia/OportunidadEmpleoDetalle";
import EjercicioActividadPage from "@/pages/biografia/EjercicioActividadPage";
import DiarioAlimentacionPage from "@/pages/biografia/DiarioAlimentacionPage";
import RecetasSaludablesPage from "@/pages/biografia/RecetasSaludablesPage";
import LugaresDondeVivoPage from "@/pages/biografia/LugaresDondeVivoPage";
import ViajesVacacionesPage from "@/pages/biografia/ViajesVacacionesPage";
import ViajePrincipalPage from "@/pages/biografia/ViajePrincipalPage";
import ItinerarioDetallePage from "@/pages/biografia/ItinerarioDetallePage";
import BookingsPage from "@/pages/biografia/BookingsPage";
import ActividadesDiariasPage from "@/pages/biografia/ActividadesDiariasPage";
import ActividadesDiariasViajePage from "@/pages/biografia/ActividadesDiariasViajePage";
import ItinerarioPage from "@/pages/biografia/ItinerarioPage";
import { HistorialViajesPage } from "@/pages/biografia/HistorialViajesPage";
import CasaDetallesPage from "@/pages/biografia/CasaDetallesPage";
import ArchivoDetalles from "@/pages/biografia/ArchivoDetalles";
import TwinAgentArchivoDetalles from "@/pages/TwinAgentArchivoDetalles";
import AdvancedCSVViewer from "@/pages/biografia/AdvancedCSVViewer";
import DocumentoDetallePage from "@/pages/biografia/DocumentoDetallePage";
import DiarioListPage from "@/pages/biografia/DiarioListPage";
import DiarioCreatePage from "@/pages/biografia/DiarioCreatePage";
import DiarioViewPage from "@/pages/biografia/DiarioViewPage";
import DiarioEditPage from "@/pages/biografia/DiarioEditPage";
import CrearTwinPage from "@/pages/CrearTwinPage";
import MisTwinsPage from "@/pages/MisTwinsPage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";
import ChatVoicePage from "@/pages/ChatVoicePage";
import TwinAgentPage from "@/pages/TwinAgentPage";
import TwinCasaPage from "@/pages/TwinCasaPage";
import CasasPage from "@/pages/CasasPage";
import CrearCasaPage from "@/pages/CrearCasaPage";
import EditarCasaPage from "@/pages/EditarCasaPage";
import DocumentosCasaPage from "@/pages/DocumentosCasaPage";
import AnalisisAIPage from "@/pages/AnalisisAIPage";
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
                path: "twin-biografia/oportunidades-empleo",
                element: <ProtectedRoute><OportunidadesEmpleoPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/oportunidades-empleo/:id",
                element: <ProtectedRoute><OportunidadEmpleoDetalle /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/salud/ejercicio",
                element: <ProtectedRoute><EjercicioActividadPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/salud/diario-alimentacion",
                element: <ProtectedRoute><DiarioAlimentacionPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/salud/recetas",
                element: <ProtectedRoute><RecetasSaludablesPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/lugares",
                element: <ProtectedRoute><LugaresDondeVivoPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/lugares/:casaId",
                element: <ProtectedRoute><CasaDetallesPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/viajes-vacaciones",
                element: <ProtectedRoute><ViajesVacacionesPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/viajes-vacaciones/viaje-activo/:viajeId",
                element: <ProtectedRoute><ViajePrincipalPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/viajes-vacaciones/viaje-activo/:viajeId/itinerario-detalle/:itinerarioId",
                element: <ProtectedRoute><ItinerarioDetallePage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/viajes-vacaciones/viaje-activo/:viajeId/itinerario-detalle/:itinerarioId/bookings",
                element: <ProtectedRoute><BookingsPage /></ProtectedRoute>,
            },
            {
                path: "actividades-diarias",
                element: <ProtectedRoute><ActividadesDiariasPage /></ProtectedRoute>,
            },
            {
                path: "actividades-diarias-viaje",
                element: <ProtectedRoute><ActividadesDiariasViajePage /></ProtectedRoute>,
            },
            {
                path: "biografia/viaje-principal",
                element: <ProtectedRoute><ViajePrincipalPage /></ProtectedRoute>,
            },
            {
                path: "biografia/itinerario-detalle",
                element: <ProtectedRoute><ItinerarioDetallePage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/viaje/:viajeId/itinerario/:itinerarioId",
                element: <ProtectedRoute><ItinerarioPage /></ProtectedRoute>,
            },
            {
                path: "twin-biografia/historial-viajes",
                element: <ProtectedRoute><HistorialViajesPage /></ProtectedRoute>,
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
                path: "twin-biografia/documento/:documentoId",
                element: <ProtectedRoute><DocumentoDetallePage /></ProtectedRoute>,
            },
            {
                path: "biografia/diario-personal",
                element: <ProtectedRoute><DiarioListPage /></ProtectedRoute>,
            },
            {
                path: "biografia/diario-personal/crear",
                element: <ProtectedRoute><DiarioCreatePage /></ProtectedRoute>,
            },
            {
                path: "biografia/diario-personal/ver/:id",
                element: <ProtectedRoute><DiarioViewPage /></ProtectedRoute>,
            },
            {
                path: "biografia/diario-personal/editar/:id",
                element: <ProtectedRoute><DiarioEditPage /></ProtectedRoute>,
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
            {
                path: "mi-patrimonio/twin-hogar",
                element: <ProtectedRoute><TwinCasaPage /></ProtectedRoute>,
            },
            {
                path: "mi-patrimonio/casas",
                element: <ProtectedRoute><CasasPage /></ProtectedRoute>,
            },
            {
                path: "mi-patrimonio/casas/crear",
                element: <ProtectedRoute><CrearCasaPage /></ProtectedRoute>,
            },
            {
                path: "mi-patrimonio/casas/editar/:homeId",
                element: <ProtectedRoute><EditarCasaPage /></ProtectedRoute>,
            },
            {
                path: "mi-patrimonio/casas/:houseId/documentos",
                element: <ProtectedRoute><DocumentosCasaPage /></ProtectedRoute>,
            },
            {
                path: "mi-patrimonio/casas/analisis/:homeId",
                element: <ProtectedRoute><AnalisisAIPage /></ProtectedRoute>,
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
