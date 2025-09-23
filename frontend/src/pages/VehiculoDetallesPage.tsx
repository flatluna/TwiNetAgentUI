import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVehiculoService, Car } from '@/services/vehiculoApiService';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign,
  Car as CarIcon,
  Fuel,
  Gauge,
  Palette,
  Settings,
  Shield,
  Star,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CarAnalytics {
  id: string;
  carID: string;
  twinID: string;
  analyzedAt: string;
  success: boolean;
  executiveSummary: string;
  detaileHTMLReport: string;
  processingTimeMS: number;
  searchScore: number;
  errorMessage: string | null;
  carInsurance: string;
  carLoan: string;
  carTitle: string;
}

interface VehiculoConAnalytics extends Car {
  carAnalytics?: CarAnalytics;
}

const VehiculoDetallesPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const { obtenerVehiculoPorId } = useVehiculoService();
  
  const [vehiculo, setVehiculo] = useState<VehiculoConAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener twinId real del usuario autenticado
  const getTwinId = (): string | null => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    return account?.localAccountId || null;
  };

  const currentTwinId = getTwinId();

  useEffect(() => {
    const cargarVehiculo = async () => {
      if (!currentTwinId || !carId) {
        setError('ID de usuario o vehículo no disponible');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🚗 Cargando detalles del vehículo:', carId);
        const vehiculoData = await obtenerVehiculoPorId(currentTwinId, carId);
        
        console.log('✅ Vehículo obtenido:', vehiculoData);
        setVehiculo(vehiculoData);
      } catch (err) {
        console.error('❌ Error al cargar vehículo:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el vehículo');
      } finally {
        setLoading(false);
      }
    };

    cargarVehiculo();
  }, [currentTwinId, carId]);

  const handleEdit = () => {
    navigate(`/twin-vehiculo/editar/${carId}`);
  };

  const handleDocuments = () => {
    navigate(`/twin-vehiculo/${carId}/documentos`);
  };

  const handleBack = () => {
    navigate(`/twin-vehiculo/${currentTwinId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando detalles del vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !vehiculo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-900">Error al cargar vehículo</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CarIcon className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {vehiculo.make} {vehiculo.model} {vehiculo.trim}
                </h1>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {vehiculo.year}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vehiculo.city}, {vehiculo.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Adquirido: {vehiculo.dateAcquired ? new Date(vehiculo.dateAcquired).toLocaleDateString() : 'N/A'}
                </span>
                {vehiculo.acquisitionSource && (
                  <span className="flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Origen: {vehiculo.acquisitionSource}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleDocuments}>
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Foto Principal */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-80 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {vehiculo.photos && vehiculo.photos.length > 0 ? (
                    <img
                      src={vehiculo.photos[0]}
                      alt={`${vehiculo.make} ${vehiculo.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <CarIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Sin foto disponible</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Estado del vehículo */}
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant={vehiculo.condition === 'Excellent' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {vehiculo.condition}
                    </Badge>
                  </div>
                  
                  {/* Estado de propiedad */}
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant="outline" 
                      className="bg-white/90 border-yellow-400 text-yellow-700"
                    >
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {vehiculo.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehiculo.originalListPrice && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">Precio Original</p>
                      <p className="text-lg font-bold text-blue-900">
                        ${vehiculo.originalListPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {vehiculo.listPrice && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-medium">Precio de Lista</p>
                      <p className="text-lg font-bold text-green-900">
                        ${vehiculo.listPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {vehiculo.actualPaidPrice && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium">Precio Pagado</p>
                      <p className="text-lg font-bold text-purple-900">
                        ${vehiculo.actualPaidPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {vehiculo.currentPrice && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 font-medium">Valor Actual</p>
                      <p className="text-lg font-bold text-orange-900">
                        ${vehiculo.currentPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Información de financiamiento */}
                {vehiculo.hasLien && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Financiamiento Activo</span>
                    </div>
                    {vehiculo.lienHolder && (
                      <p className="text-sm text-yellow-700">
                        Prestamista: <strong>{vehiculo.lienHolder}</strong>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Especificaciones Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Especificaciones Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vehiculo.mileage && (
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Millaje</p>
                        <p className="font-semibold">{vehiculo.mileage.toLocaleString()} {vehiculo.mileageUnit}</p>
                      </div>
                    </div>
                  )}
                  
                  {vehiculo.fuelType && (
                    <div className="flex items-center gap-3">
                      <Fuel className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Combustible</p>
                        <p className="font-semibold">{vehiculo.fuelType}</p>
                      </div>
                    </div>
                  )}
                  
                  {vehiculo.transmission && (
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Transmisión</p>
                        <p className="font-semibold">{vehiculo.transmission}</p>
                      </div>
                    </div>
                  )}
                  
                  {vehiculo.drivetrain && (
                    <div className="flex items-center gap-3">
                      <CarIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Tracción</p>
                        <p className="font-semibold">{vehiculo.drivetrain}</p>
                      </div>
                    </div>
                  )}
                  
                  {vehiculo.bodyStyle && (
                    <div className="flex items-center gap-3">
                      <CarIcon className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-600">Carrocería</p>
                        <p className="font-semibold">{vehiculo.bodyStyle}</p>
                      </div>
                    </div>
                  )}
                  
                  {vehiculo.engineDescription && (
                    <div className="flex items-center gap-3 col-span-full">
                      <Settings className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Motor</p>
                        <p className="font-semibold">{vehiculo.engineDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Características y Colores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  Apariencia y Características
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Colores */}
                  <div className="grid grid-cols-2 gap-4">
                    {vehiculo.exteriorColor && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Color Exterior</p>
                        <Badge variant="outline" className="text-sm">
                          🎨 {vehiculo.exteriorColor}
                        </Badge>
                      </div>
                    )}
                    
                    {vehiculo.interiorColor && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Color Interior</p>
                        <Badge variant="outline" className="text-sm">
                          🪑 {vehiculo.interiorColor}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Características de seguridad */}
                  {vehiculo.safetyFeatures && vehiculo.safetyFeatures.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Características de Seguridad</p>
                      <div className="flex flex-wrap gap-2">
                        {vehiculo.safetyFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            🛡️ {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Características estándar */}
                  {vehiculo.standardFeatures && vehiculo.standardFeatures.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Características Estándar</p>
                      <div className="flex flex-wrap gap-2">
                        {vehiculo.standardFeatures.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            ✅ {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Características opcionales */}
                  {vehiculo.optionalFeatures && vehiculo.optionalFeatures.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Características Opcionales</p>
                      <div className="flex flex-wrap gap-2">
                        {vehiculo.optionalFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            ⭐ {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reporte de Análisis HTML */}
            {vehiculo.carAnalytics?.detaileHTMLReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Reporte de Análisis Detallado
                    <Badge variant="outline" className="ml-auto">
                      <Clock className="w-3 h-3 mr-1" />
                      {vehiculo.carAnalytics.analyzedAt ? new Date(vehiculo.carAnalytics.analyzedAt).toLocaleDateString() : 'N/A'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: vehiculo.carAnalytics.detaileHTMLReport 
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehiculo.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placa:</span>
                    <Badge variant="outline" className="font-mono">
                      {vehiculo.licensePlate}
                    </Badge>
                  </div>
                )}
                
                {vehiculo.vin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIN:</span>
                    <span className="font-mono text-sm">{vehiculo.vin}</span>
                  </div>
                )}
                
                {vehiculo.stockNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{vehiculo.stockNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado y Verificaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado y Verificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recalls Abiertos:</span>
                  <div className="flex items-center gap-1">
                    {vehiculo.hasOpenRecalls ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className={vehiculo.hasOpenRecalls ? 'text-red-600' : 'text-green-600'}>
                      {vehiculo.hasOpenRecalls ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Historial de Accidentes:</span>
                  <div className="flex items-center gap-1">
                    {vehiculo.hasAccidentHistory ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className={vehiculo.hasAccidentHistory ? 'text-red-600' : 'text-green-600'}>
                      {vehiculo.hasAccidentHistory ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificado Pre-Owned:</span>
                  <div className="flex items-center gap-1">
                    {vehiculo.isCertifiedPreOwned ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={vehiculo.isCertifiedPreOwned ? 'text-green-600' : 'text-gray-500'}>
                      {vehiculo.isCertifiedPreOwned ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vehiculo.addressComplete && (
                  <p className="text-sm text-gray-700">{vehiculo.addressComplete}</p>
                )}
                
                {vehiculo.parkingLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estacionamiento:</span>
                    <span className="font-medium">{vehiculo.parkingLocation}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen Ejecutivo de Analytics */}
            {vehiculo.carAnalytics?.executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Resumen Ejecutivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vehiculo.carAnalytics.executiveSummary}
                  </p>
                  
                  {vehiculo.carAnalytics.processingTimeMS && (
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Procesado en {(vehiculo.carAnalytics.processingTimeMS / 1000).toFixed(1)}s
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Descripción */}
            {vehiculo.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vehiculo.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notas Internas */}
            {vehiculo.internalNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vehiculo.internalNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoDetallesPage;