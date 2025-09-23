import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/services/vehiculoApiService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car as CarIcon, 
  Calendar, 
  MapPin, 
  Gauge, 
  Eye,
  Edit,
  FileText,
  Fuel,
  Settings,
  Upload,
  Star
} from 'lucide-react';

interface VehiculosListProps {
  vehiculos: Car[];
  loading?: boolean;
  onUploadPhotos?: (vehiculo: Car) => void;
  uploadingPhotos?: string | null;
}

const VehiculosList: React.FC<VehiculosListProps> = ({ 
  vehiculos, 
  loading = false,
  onUploadPhotos,
  uploadingPhotos
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse shadow-lg">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <div className="text-center py-12">
        <CarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay vehículos registrados
        </h3>
        <p className="text-gray-500">
          Comienza agregando tu primer vehículo para llevar un registro completo
        </p>
      </div>
    );
  }

  // Renderizar card de vehículo (similar al estilo de casas)
  const renderCardVehiculo = (vehiculo: Car) => {
    return (
      <Card 
        key={vehiculo.id} 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
      >
        {/* Header con imagen del vehículo */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
          {(vehiculo.photos && vehiculo.photos.length > 0) ? (
            <img 
              src={vehiculo.photos[0]} 
              alt={`${vehiculo.make} ${vehiculo.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CarIcon className="w-20 h-20 text-white opacity-50" />
            </div>
          )}
          
          {/* Badges superiores */}
          <div className="absolute top-4 left-4 flex gap-2">
            {vehiculo.condition && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                vehiculo.condition === 'Excellent' ? 'bg-green-500 bg-opacity-90' :
                vehiculo.condition === 'Good' ? 'bg-blue-500 bg-opacity-90' :
                vehiculo.condition === 'Fair' ? 'bg-yellow-500 bg-opacity-90' :
                'bg-gray-500 bg-opacity-90'
              }`}>
                {vehiculo.condition === 'Excellent' ? 'Excelente' :
                 vehiculo.condition === 'Good' ? 'Bueno' :
                 vehiculo.condition === 'Fair' ? 'Regular' : 'Pobre'}
              </span>
            )}
            {vehiculo.estado === 'propio' && (
              <span className="bg-yellow-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                Propio
              </span>
            )}
          </div>

          {/* Badge del tipo de vehículo */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 bg-opacity-90">
              {vehiculo.bodyStyle || 'Vehículo'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Título y información básica */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CarIcon className="w-5 h-5 text-blue-600" />
              {vehiculo.make} {vehiculo.model}
            </h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">{vehiculo.year}</span>
                {vehiculo.trim && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-sm">{vehiculo.trim}</span>
                  </>
                )}
              </div>
              {vehiculo.licensePlate && (
                <Badge variant="outline" className="font-mono text-xs">
                  {vehiculo.licensePlate}
                </Badge>
              )}
            </div>
            {(vehiculo.city || vehiculo.state) && (
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {vehiculo.city}{vehiculo.city && vehiculo.state ? ', ' : ''}{vehiculo.state}
                </span>
              </div>
            )}
          </div>

          {/* Características principales */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {vehiculo.mileage && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span>{vehiculo.mileage.toLocaleString()} {vehiculo.mileageUnit || 'mi'}</span>
              </div>
            )}
            {vehiculo.fuelType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Fuel className="w-4 h-4 text-green-500" />
                <span>{vehiculo.fuelType}</span>
              </div>
            )}
            {vehiculo.transmission && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Settings className="w-4 h-4 text-purple-500" />
                <span>{vehiculo.transmission}</span>
              </div>
            )}
            {vehiculo.drivetrain && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-orange-500">🚗</span>
                <span>{vehiculo.drivetrain}</span>
              </div>
            )}
            {vehiculo.engineDescription && (
              <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                <span className="text-red-500">⚙️</span>
                <span className="truncate">{vehiculo.engineDescription}</span>
              </div>
            )}
          </div>

          {/* Colores y características adicionales */}
          {(vehiculo.exteriorColor || vehiculo.interiorColor) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {vehiculo.exteriorColor && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  🎨 Exterior: {vehiculo.exteriorColor}
                </span>
              )}
              {vehiculo.interiorColor && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  🪑 Interior: {vehiculo.interiorColor}
                </span>
              )}
              {vehiculo.upholstery && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  📄 {vehiculo.upholstery}
                </span>
              )}
            </div>
          )}

          {/* Información financiera */}
          {(vehiculo.currentPrice || vehiculo.listPrice || vehiculo.originalListPrice || vehiculo.actualPaidPrice) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-4 border border-green-200">
              <div className="grid grid-cols-2 gap-3">
                {(vehiculo.currentPrice || vehiculo.listPrice) && (
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Precio Actual</p>
                    <p className="text-lg font-bold text-green-600">
                      ${(vehiculo.currentPrice || vehiculo.listPrice)?.toLocaleString()}
                    </p>
                  </div>
                )}
                {vehiculo.originalListPrice && (
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Precio Original</p>
                    <p className="text-sm font-semibold text-blue-600">
                      ${vehiculo.originalListPrice.toLocaleString()}
                    </p>
                  </div>
                )}
                {vehiculo.actualPaidPrice && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 font-medium">Precio Pagado</p>
                    <p className="text-sm font-semibold text-purple-600">
                      ${vehiculo.actualPaidPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechas y estado */}
          <div className="space-y-2 mb-4">
            {vehiculo.dateAcquired && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-2" />
                <span>Adquirido: {new Date(vehiculo.dateAcquired).toLocaleDateString('es-ES')}</span>
              </div>
            )}
            {vehiculo.acquisitionSource && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-3 h-3 mr-2 text-orange-500">📋</span>
                <span>Origen: {vehiculo.acquisitionSource}</span>
              </div>
            )}
            {vehiculo.hasLien && (
              <div className="flex items-center text-xs text-red-600">
                <span className="w-3 h-3 mr-2">🏦</span>
                <span>Con financiamiento{vehiculo.lienHolder ? ` - ${vehiculo.lienHolder}` : ''}</span>
              </div>
            )}
          </div>

          {/* Descripción o notas */}
          {vehiculo.description && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border-l-4 border-blue-400">
              <p className="text-sm text-gray-700 line-clamp-2">
                {vehiculo.description}
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/twin-vehiculo/detalles/${vehiculo.id}`);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/twin-vehiculo/editar/${vehiculo.id}`);
              }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUploadPhotos?.(vehiculo);
              }}
              disabled={uploadingPhotos === vehiculo.id}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {uploadingPhotos === vehiculo.id ? (
                <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}
              Fotos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/twin-vehiculo/${vehiculo.id}/documentos`);
              }}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <FileText className="w-4 h-4 mr-1" />
              Documentos
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiculos.map(renderCardVehiculo)}
    </div>
  );
};

export default VehiculosList;