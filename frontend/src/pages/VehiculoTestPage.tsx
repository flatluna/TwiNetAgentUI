import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { useVehiculoService } from '@/services/vehiculoApiService';
import { datosVehiculoPrueba } from '@/utils/testVehiculoCreation';
import { Loader2, TestTube, CheckCircle, XCircle, Play, User } from 'lucide-react';

const VehiculoTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { accounts } = useMsal();
  const { crearVehiculo } = useVehiculoService();

  // Obtener twinId real del usuario autenticado
  const getRealTwinId = (): string | null => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    return account?.localAccountId || null;
  };

  const realTwinId = getRealTwinId();

  // Debug: Mostrar información del usuario
  useEffect(() => {
    console.log('🔍 VehiculoTestPage - Información del usuario:');
    console.log('📱 Cuentas disponibles:', accounts);
    console.log('🆔 TwinId real:', realTwinId);
  }, [accounts, realTwinId]);

  const ejecutarTest = async () => {
    if (!realTwinId) {
      setError('No se encontró un TwinId válido. Por favor, inicia sesión.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      console.log('🚗 Iniciando test de creación de vehículo...');
      console.log('📋 TwinId REAL:', realTwinId);
      console.log('📋 Datos:', datosVehiculoPrueba);

      const result = await crearVehiculo(datosVehiculoPrueba, realTwinId);
      
      console.log('✅ Test completado exitosamente:', result);
      setResultado(result);
    } catch (err) {
      console.error('❌ Error en el test:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const testDirecto = async () => {
    if (!realTwinId) {
      setError('No se encontró un TwinId válido. Por favor, inicia sesión.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      console.log('🚗 Test directo al backend...');
      
      const response = await fetch(`/api/twins/${realTwinId}/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosVehiculoPrueba)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Test directo exitoso:', result);
      setResultado(result);
    } catch (err) {
      console.error('❌ Error en test directo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const diagnosticar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      console.log('🔍 Diagnosticando backend...');
      
      const response = await fetch('/api/twins', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const diagnostico = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      };
      
      console.log('📋 Diagnóstico:', diagnostico);
      setResultado(diagnostico);
    } catch (err) {
      console.error('❌ Error en diagnóstico:', err);
      setError(err instanceof Error ? err.message : 'Backend no responde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-blue-600" />
            Test de Creación de Vehículos
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twin ID del Usuario Autenticado:
            </label>
            <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              {realTwinId ? (
                <span className="text-gray-900 font-mono text-sm">{realTwinId}</span>
              ) : (
                <span className="text-red-600">❌ Usuario no autenticado</span>
              )}
            </div>
            {realTwinId && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Se usará este Twin ID real para crear el vehículo
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={ejecutarTest}
              disabled={loading || !realTwinId}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Test con Servicio
            </Button>

            <Button
              onClick={testDirecto}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Test Directo
            </Button>

            <Button
              onClick={diagnosticar}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Diagnosticar Backend
            </Button>
          </div>

          {/* Datos de prueba */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              📋 Datos de Prueba (Toyota Camry 2023)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Marca:</span> {datosVehiculoPrueba.Make}
              </div>
              <div>
                <span className="font-medium">Modelo:</span> {datosVehiculoPrueba.Model}
              </div>
              <div>
                <span className="font-medium">Año:</span> {datosVehiculoPrueba.Year}
              </div>
              <div>
                <span className="font-medium">Placa:</span> {datosVehiculoPrueba.LicensePlate}
              </div>
              <div>
                <span className="font-medium">VIN:</span> {datosVehiculoPrueba.Vin}
              </div>
              <div>
                <span className="font-medium">Precio:</span> ${datosVehiculoPrueba.ListPrice?.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Kilometraje:</span> {datosVehiculoPrueba.Mileage?.toLocaleString()} mi
              </div>
              <div>
                <span className="font-medium">Estado:</span> {datosVehiculoPrueba.Condition}
              </div>
            </div>
          </div>

          {/* Resultado */}
          {(resultado || error) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                {error ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                Resultado del Test
              </h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">❌ Error:</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                  
                  <div className="mt-3 text-xs text-red-600">
                    <p><strong>Posibles causas:</strong></p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Backend no está corriendo</li>
                      <li>Endpoint incorrecto</li>
                      <li>Problema de CORS</li>
                      <li>Datos inválidos</li>
                      <li>Falta autenticación</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {resultado && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Éxito:</h4>
                  <pre className="text-xs text-green-700 overflow-x-auto">
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              📖 Instrucciones de Uso
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1. Test con Servicio:</strong> Usa el servicio vehiculoApiService.ts</p>
              <p><strong>2. Test Directo:</strong> Hace fetch directo al endpoint</p>
              <p><strong>3. Diagnosticar:</strong> Verifica si el backend responde</p>
              <p><strong>4. Consola:</strong> Revisa la consola del navegador para logs detallados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoTestPage;