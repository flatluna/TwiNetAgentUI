import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { ArrowLeft, Brain, Calendar, Clock, TrendingUp, Home, AlertCircle, CheckCircle, Info } from 'lucide-react';
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

  const { obtenerCasas } = useAgentCreateHome();

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
        const casas = await obtenerCasas(twinId);
        
        const casaEncontrada = casas.find((c: HomeData) => c.id === homeId);
        
        if (!casaEncontrada) {
          setError('Casa no encontrada');
          setLoading(false);
          return;
        }

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
  }, [homeId, obtenerCasas, accounts]);

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
    </div>
  );
};

export default AnalisisAIPage;