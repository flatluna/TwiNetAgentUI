// Test directo para crear vehículo con datos de prueba
// Usar en la consola del navegador

import { CreateCarRequest } from '../services/vehiculoApiService';

/**
 * Datos de prueba para crear un vehículo Toyota Camry
 */
export const datosVehiculoPrueba: CreateCarRequest = {
  // ✅ CAMPOS REQUERIDOS
  make: "Toyota",
  model: "Camry",
  year: 2023,
  licensePlate: "ABC-123",
  
  // Información básica adicional
  stockNumber: "TEST001",
  plateState: "CA",
  trim: "LE Hybrid",
  subModel: "Hybrid",
  bodyStyle: "Sedan",
  doors: 4,
  vin: "1HGBH41JXMN109186",
  
  // Especificaciones técnicas
  transmission: "Automatic",
  drivetrain: "FWD",
  fuelType: "Hybrid",
  engineDescription: "2.5L 4-Cylinder Hybrid",
  cylinders: 4,
  engineDisplacementLiters: 2.5,
  mileage: 25000,
  mileageUnit: "mi",
  odometerStatus: "Actual",
  
  // Colores
  exteriorColor: "Midnight Black Metallic",
  interiorColor: "Black",
  upholstery: "Fabric",
  
  // Estado
  condition: "Excellent",
  stockStatus: "Available",
  hasOpenRecalls: false,
  hasAccidentHistory: false,
  isCertifiedPreOwned: true,
  
  // Fechas
  dateAcquired: "2024-01-15",
  dateListed: "2024-01-20",
  acquisitionSource: "Trade-in",
  
  // Ubicación (como propietario personal)
  addressComplete: "123 Main Street, Los Angeles, CA 90210, USA",
  city: "Los Angeles",
  state: "CA",
  postalCode: "90210",
  country: "USA",
  latitude: 34.0736,
  longitude: -118.4004,
  parkingLocation: "Garage Space #1",
  
  // Finanzas (perspectiva personal)
  listPrice: 28500,
  currentPrice: 27500,
  estimatedTax: 2200,
  estimatedRegistrationFee: 350,
  dealerProcessingFee: 85,
  
  // Financiamiento
  monthlyPayment: 485,
  apr: 3.9,
  termMonths: 60,
  downPayment: 5000,
  
  // Características
  standardFeatures: [
    "Toyota Safety Sense 2.0",
    "8-inch Touchscreen",
    "Apple CarPlay",
    "Android Auto",
    "Automatic Climate Control"
  ],
  optionalFeatures: [
    "Wireless Phone Charger",
    "Premium Audio System",
    "Moonroof",
    "Leather Seats"
  ],
  safetyFeatures: [
    "Pre-Collision System",
    "Lane Departure Alert",
    "Automatic High Beams",
    "Dynamic Radar Cruise Control"
  ],
  
  // Título
  titleBrand: "Clean",
  hasLien: true,
  lienHolder: "Toyota Financial Services",
  lienAmount: 22500,
  titleState: "CA",
  
  // Garantía
  warrantyType: "Manufacturer + Extended",
  warrantyStart: "2024-01-15",
  warrantyEnd: "2029-01-15",
  warrantyProvider: "Toyota",
  
  // Fotos de ejemplo
  photos: [
    {
      url: "https://via.placeholder.com/800x600/000/fff?text=Front+View",
      caption: "Vista frontal del vehículo",
      isPrimary: true,
      mimeType: "image/jpeg",
      uploadedAt: new Date().toISOString()
    },
    {
      url: "https://via.placeholder.com/800x600/333/fff?text=Interior",
      caption: "Interior del vehículo",
      isPrimary: false,
      mimeType: "image/jpeg", 
      uploadedAt: new Date().toISOString()
    }
  ],
  
  // Notas
  internalNotes: "Vehículo de prueba - Toyota Camry Hybrid 2023 en excelente estado",
  description: "Toyota Camry Hybrid 2023 con todas las características de seguridad y tecnología. Excelente para propietario personal.",
  
  // Estado
  estado: "propio"
};

/**
 * Función para probar la creación directa desde la consola
 */
export async function testCrearVehiculoDirecto(twinId: string = 'demo-twin-id-test') {
  try {
    console.log('🚗 INICIANDO TEST DE CREACIÓN DE VEHÍCULO');
    console.log('📋 TwinId:', twinId);
    console.log('📋 Datos del vehículo:', datosVehiculoPrueba);
    
    // Hacer la petición directamente al backend
    const response = await fetch(`/api/twins/${twinId}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Agregar autenticación cuando esté disponible
      },
      body: JSON.stringify(datosVehiculoPrueba)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ ÉXITO! Vehículo creado:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ ERROR EN EL TEST:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('🔧 DIAGNÓSTICO: Problema de conectividad');
      console.log('   - Verificar que el backend esté corriendo');
      console.log('   - Verificar la URL del endpoint');
      console.log('   - Verificar CORS si aplica');
    }
    
    throw error;
  }
}

/**
 * Función para probar usando el servicio
 */
export async function testCrearVehiculoConServicio(twinId: string = 'demo-twin-id-test') {
  try {
    console.log('🚗 INICIANDO TEST CON SERVICIO');
    
    // Importar dinámicamente el servicio
    const { VehiculoApiService } = await import('../services/vehiculoApiService');
    const vehiculoService = new (VehiculoApiService as any)();
    
    console.log('📋 Enviando datos con servicio...');
    const result = await vehiculoService.createCar(twinId, datosVehiculoPrueba);
    
    console.log('✅ RESULTADO DEL SERVICIO:', result);
    return result;
    
  } catch (error) {
    console.error('❌ ERROR CON SERVICIO:', error);
    throw error;
  }
}

/**
 * Función para diagnosticar conectividad
 */
export async function diagnosticarBackend() {
  console.log('🔍 DIAGNÓSTICO DEL BACKEND');
  
  try {
    // Test 1: Verificar si el endpoint responde
    console.log('📡 Test 1: Verificando conectividad...');
    const response = await fetch('/api/twins', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`📡 Status: ${response.status}`);
    console.log(`📡 StatusText: ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Backend está respondiendo');
    } else {
      console.log('⚠️ Backend responde pero con error');
    }
    
  } catch (error) {
    console.log('❌ Backend no está respondiendo');
    console.log('📋 Error:', error);
    
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verificar que el backend esté corriendo');
    console.log('2. Verificar la URL del backend');
    console.log('3. Verificar configuración de CORS');
    console.log('4. Verificar que el puerto sea correcto');
  }
}

// Exportar para uso global en la consola
if (typeof window !== 'undefined') {
  (window as any).testCrearVehiculoDirecto = testCrearVehiculoDirecto;
  (window as any).testCrearVehiculoConServicio = testCrearVehiculoConServicio;
  (window as any).diagnosticarBackend = diagnosticarBackend;
  (window as any).datosVehiculoPrueba = datosVehiculoPrueba;
  
  console.log('🚗 Funciones de testing disponibles globalmente:');
  console.log('   - testCrearVehiculoDirecto(twinId?)');
  console.log('   - testCrearVehiculoConServicio(twinId?)'); 
  console.log('   - diagnosticarBackend()');
  console.log('   - datosVehiculoPrueba (objeto con datos)');
}