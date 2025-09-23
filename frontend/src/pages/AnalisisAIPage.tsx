import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowLeft, Brain, Calendar, Clock, TrendingUp, Home, AlertCircle, CheckCircle, Info, Shield, FileCheck, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAgentCreateHome, HomeData } from '../services/casaAgentApiService';

interface AIAnalysis {
  id: string;
  homeId: string;
  twinId: string;
  analyzedAt: string;
  status: string;
  success: boolean;
  executiveSummary: string;
  detailedHtmlReport: string;
  highlights: string[];
  processingTimeMs: number;
  searchScore: number;
  errorMessage?: string;
}

const AnalisisAIPage: React.FC = () => {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [casa, setCasa] = useState<HomeData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeInsuranceModalOpen, setHomeInsuranceModalOpen] = useState(false);

  const { obtenerCasaPorId } = useAgentCreateHome();

  useEffect(() => {
    const cargarAnalisisAI = async () => {
      if (!homeId) {
        setError('ID de casa no proporcionado');
        setLoading(false);
        return;
      }

      try {
        console.log('🤖 Cargando análisis de AI para casa:', homeId);
        
        // Obtener twinId desde la cuenta autenticada
        const account = accounts[0];
        if (!account) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const twinId = account.localAccountId;
        const casaEncontrada = await obtenerCasaPorId(twinId, homeId);
        
        setCasa(casaEncontrada);
        
        if (casaEncontrada.aiAnalysis) {
          setAiAnalysis(casaEncontrada.aiAnalysis);
          console.log('✅ Análisis de AI cargado:', casaEncontrada.aiAnalysis);
        } else {
          setError('No hay análisis de IA disponible para esta casa');
        }
      } catch (err) {
        console.error('❌ Error al cargar análisis de AI:', err);
        setError('Error al cargar el análisis de IA');
      } finally {
        setLoading(false);
      }
    };

    cargarAnalisisAI();
  }, [homeId, obtenerCasaPorId, accounts]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearTiempoProcesamiento = (tiempoMs: number) => {
    const segundos = Math.round(tiempoMs / 1000);
    if (segundos < 60) {
      return `${segundos}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
  };

  // Funciones para el modal de Home Insurance
  const handleHomeInsuranceClick = () => {
    setHomeInsuranceModalOpen(true);
  };

  const closeHomeInsuranceModal = () => {
    setHomeInsuranceModalOpen(false);
  };

  // Manejar tecla ESC para cerrar modal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && homeInsuranceModalOpen) {
        closeHomeInsuranceModal();
      }
    };

    if (homeInsuranceModalOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [homeInsuranceModalOpen]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Cargando análisis de IA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground text-center">{error}</p>
          <Button onClick={() => navigate('/mi-patrimonio/casas')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Casas
          </Button>
        </div>
      </div>
    );
  }

  if (!casa || !aiAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Info className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No hay análisis disponible</h2>
          <p className="text-muted-foreground text-center">
            No se encontró un análisis de IA para esta propiedad.
          </p>
          <Button onClick={() => navigate('/mi-patrimonio/casas')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Casas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mi-patrimonio/casas')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="mr-3 h-8 w-8 text-primary" />
              Análisis de IA
            </h1>
            <p className="text-muted-foreground">
              {casa.direccion}, {casa.ciudad}, {casa.estado}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={aiAnalysis.success ? "default" : "destructive"}>
            {aiAnalysis.success ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Completado
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                Error
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Cards de Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Información adicional de la propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Home Insurance Card */}
            <div 
              onClick={handleHomeInsuranceClick}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600 p-3 rounded-full mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-800">Home Insurance</span>
                <span className="text-xs text-blue-600 mt-1">
                  {casa?.aiAnalysis?.homeInsurance ? 'Ver Detalles' : 'No disponible'}
                </span>
              </div>
            </div>

            {/* Placeholder para futuros cards */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-200 opacity-50">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-400 p-3 rounded-full mb-2">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Documentos</span>
                <span className="text-xs text-gray-500 mt-1">Próximamente</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Información del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha de Análisis</p>
                <p className="text-sm text-muted-foreground">
                  {formatearFecha(aiAnalysis.analyzedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tiempo de Procesamiento</p>
                <p className="text-sm text-muted-foreground">
                  {formatearTiempoProcesamiento(aiAnalysis.processingTimeMs)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Puntuación de Búsqueda</p>
                <p className="text-sm text-muted-foreground">
                  {aiAnalysis.searchScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen ejecutivo */}
      {aiAnalysis.executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Ejecutivo</CardTitle>
            <CardDescription>
              Análisis condensado de la propiedad generado por IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{aiAnalysis.executiveSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Highlights */}
      {aiAnalysis.highlights && aiAnalysis.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aspectos Destacados</CardTitle>
            <CardDescription>
              Puntos clave identificados por el análisis de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiAnalysis.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{highlight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte detallado HTML */}
      {aiAnalysis.detailedHtmlReport && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte Detallado</CardTitle>
            <CardDescription>
              Análisis completo generado por la inteligencia artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: aiAnalysis.detailedHtmlReport }}
            />
          </CardContent>
        </Card>
      )}

      {/* Información de la casa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Información de la Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Dirección</p>
              <p className="text-sm text-muted-foreground">
                {casa.direccion}, {casa.ciudad}, {casa.estado} {casa.codigoPostal}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Tipo de Propiedad</p>
              <p className="text-sm text-muted-foreground capitalize">{casa.tipoPropiedad}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Año de Construcción</p>
              <p className="text-sm text-muted-foreground">{casa.anoConstruction}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Área Total</p>
              <p className="text-sm text-muted-foreground">{casa.areaTotal} sq ft</p>
            </div>
            <div>
              <p className="text-sm font-medium">Habitaciones</p>
              <p className="text-sm text-muted-foreground">{casa.habitaciones}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Baños</p>
              <p className="text-sm text-muted-foreground">{casa.banos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error del análisis si existe */}
      {aiAnalysis.errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 p-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700">Error en el análisis: {aiAnalysis.errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex justify-center pt-6">
        <Button onClick={() => navigate('/mi-patrimonio/casas')} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Casas
        </Button>
      </div>

      {/* Modal de Home Insurance */}
      {homeInsuranceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Home Insurance</h2>
                  <p className="text-gray-600">Información de seguro de hogar</p>
                </div>
              </div>
              <button
                onClick={closeHomeInsuranceModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {casa?.aiAnalysis?.homeInsurance ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-600" />
                        {casa.direccion}, {casa.ciudad}
                      </h3>
                      <p className="text-gray-600">{casa.estado} - {casa.codigoPostal}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <h4 className="font-medium text-gray-900 mb-3 p-4 border-b border-gray-200">Información del Seguro</h4>
                      <div 
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: casa.aiAnalysis.homeInsurance }}
                        style={{ 
                          maxWidth: '100%',
                          overflow: 'auto'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay información de seguros</h3>
                  <p className="text-gray-600">No se encontró información de Home Insurance en el análisis de IA de esta propiedad.</p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={closeHomeInsuranceModal}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisAIPage;