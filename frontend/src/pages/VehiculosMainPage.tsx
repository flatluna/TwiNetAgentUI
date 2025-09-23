import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehiculoService, Car } from '@/services/vehiculoApiService';
import VehiculosList from '@/components/VehiculosList';
import { Plus, Car as CarIcon, Loader2, RefreshCw } from 'lucide-react';

const VehiculosMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { twinId: paramTwinId } = useParams();
  const { accounts } = useMsal();
  const { obtenerVehiculos, subirFotosVehiculo } = useVehiculoService();
  
  const [vehiculos, setVehiculos] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<string | null>(null); // carId que está subiendo fotos

  // Obtener twinId real del usuario autenticado (igual que en AnalisisAIPage)
  const getTwinId = (): string | null => {
    // 1. Usar parámetro de URL si está disponible
    if (paramTwinId) return paramTwinId;
    
    // 2. Obtener desde la cuenta autenticada (método real)
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    if (account?.localAccountId) {
      return account.localAccountId;
    }
    
    return null;
  };

  const currentTwinId = getTwinId();

  // Debug: Mostrar twinId real en consola
  useEffect(() => {
    if (currentTwinId) {
      console.log('🚗 VehiculosMainPage - Twin ID Real del usuario:', currentTwinId);
      console.log('🚗 Tipo:', typeof currentTwinId);
      console.log('🚗 Longitud:', currentTwinId.length);
    } else {
      console.log('❌ VehiculosMainPage - No se pudo obtener Twin ID real');
      console.log('🔍 Cuentas disponibles:', accounts);
    }
  }, [currentTwinId, accounts]);

  /**
   * Cargar vehículos del backend
   */
  const cargarVehiculos = async (showRefreshing = false) => {
    if (!currentTwinId) {
      setError('No se encontró un Twin ID válido. Por favor inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🚗 Cargando vehículos para Twin:', currentTwinId);
      
      const vehiculosData = await obtenerVehiculos(currentTwinId);
      
      console.log('✅ Vehículos cargados:', vehiculosData);
      setVehiculos(vehiculosData);
    } catch (err) {
      console.error('❌ Error al cargar vehículos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar vehículos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Cargar vehículos al montar el componente
   */
  useEffect(() => {
    cargarVehiculos();
  }, [currentTwinId]);

  /**
   * Ir a crear nuevo vehículo
   */
  const handleCrearVehiculo = () => {
    navigate(`/twin-vehiculo/crear?twinId=${currentTwinId}`);
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    cargarVehiculos(true);
  };

  /**
   * Función para manejar la subida de fotos
   */
  const handleUploadPhotos = async (vehiculo: Car) => {
    if (!currentTwinId) {
      alert('Error: No se encontró el ID del usuario');
      return;
    }

    // Crear input file temporal
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      setUploadingPhotos(vehiculo.id!);
      try {
        console.log('📸 Subiendo fotos para vehículo:', `${vehiculo.make} ${vehiculo.model}`);
        const result = await subirFotosVehiculo(currentTwinId, vehiculo.id!, files);
        
        // Mostrar resultado
        const successMsg = `✅ ${result.SuccessfulUploads} foto(s) subida(s) exitosamente`;
        const failMsg = result.FailedUploads > 0 ? `❌ ${result.FailedUploads} fallo(s)` : '';
        const message = failMsg ? `${successMsg}\n${failMsg}` : successMsg;
        
        alert(message);
        
        // Recargar vehículos para mostrar las nuevas fotos
        if (result.SuccessfulUploads > 0) {
          await cargarVehiculos();
        }
      } catch (error) {
        console.error('❌ Error al subir fotos:', error);
        alert(`❌ Error al subir fotos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setUploadingPhotos(null);
      }
    };

    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <CarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Vehículos
              </h1>
              {currentTwinId ? (
                <p className="text-gray-600">
                  Twin ID: {currentTwinId.substring(0, 8)}... (Usuario Real)
                </p>
              ) : (
                <p className="text-red-600 text-sm">
                  ⚠️ Usuario no autenticado
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading || refreshing || !currentTwinId}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Actualizar
            </Button>

            <Button 
              onClick={handleCrearVehiculo}
              disabled={!currentTwinId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Vehículo
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {!loading && !error && currentTwinId && vehiculos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Vehículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {vehiculos.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${vehiculos
                    .reduce((total, v) => total + (v.CurrentPrice || v.ListPrice || 0), 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Condición Excelente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {vehiculos.filter(v => v.Condition === 'Excellent').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Promedio Año
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {vehiculos.length > 0 
                    ? Math.round(vehiculos.reduce((sum, v) => sum + v.Year, 0) / vehiculos.length)
                    : '-'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error state o estado sin Twin ID */}
        {(error || !currentTwinId) && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <h3 className="font-medium text-red-900">
                    {!currentTwinId ? 'Usuario no autenticado' : 'Error al cargar vehículos'}
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    {!currentTwinId 
                      ? 'Por favor, inicia sesión para ver tus vehículos.'
                      : error
                    }
                  </p>
                  {!currentTwinId ? (
                    <div className="mt-3 space-x-3">
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        size="sm"
                      >
                        Ir al inicio
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Reintentar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de vehículos */}
        {currentTwinId && (
          <VehiculosList
            vehiculos={vehiculos}
            loading={loading}
            onUploadPhotos={handleUploadPhotos}
            uploadingPhotos={uploadingPhotos}
          />
        )}

        {/* Información adicional si no hay vehículos */}
        {!loading && !error && currentTwinId && vehiculos.length === 0 && (
          <Card className="mt-8 border-dashed border-2 border-gray-300">
            <CardContent className="pt-12 pb-12 text-center">
              <CarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                ¡Comienza tu colección de vehículos!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Registra tus autos, motos, camiones o cualquier vehículo.
                Mantén un registro completo de tus propiedades.
              </p>
              <Button onClick={handleCrearVehiculo} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Registrar Mi Primer Vehículo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VehiculosMainPage;