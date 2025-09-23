// Ejemplo de uso del servicio de vehículos
// Este archivo demuestra cómo usar vehiculoApiService.ts

import { useVehiculoService, CreateCarRequest } from '../services/vehiculoApiService';

/**
 * Ejemplo de datos para crear un vehículo
 */
export const ejemploVehiculoData: CreateCarRequest = {
  // Información básica requerida
  make: "Toyota",
  model: "Camry",
  year: 2023,
  licensePlate: "ABC-123",
  
  // Información básica opcional
  stockNumber: "STK001",
  plateState: "CA",
  trim: "LE",
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
  
  // Colores y apariencia
  exteriorColor: "Midnight Black Metallic",
  interiorColor: "Black",
  upholstery: "Fabric",
  
  // Estado y condición
  condition: "Excellent",
  stockStatus: "Available",
  hasOpenRecalls: false,
  hasAccidentHistory: false,
  isCertifiedPreOwned: true,
  
  // Fechas y adquisición
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
  
  // Información financiera (perspectiva personal)
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
  
  // Multimedia
  photos: [
    {
      url: "https://example.com/photos/front.jpg",
      caption: "Vista frontal",
      isPrimary: true,
      mimeType: "image/jpeg",
      uploadedAt: "2024-01-20T10:00:00Z"
    },
    {
      url: "https://example.com/photos/interior.jpg",
      caption: "Interior completo",
      isPrimary: false,
      mimeType: "image/jpeg",
      uploadedAt: "2024-01-20T10:05:00Z"
    }
  ],
  videoUrl: "https://example.com/videos/walkthrough.mp4",
  
  // Notas
  internalNotes: "Excelente condición, mantenimiento regular, un solo propietario",
  description: "Toyota Camry Hybrid 2023 en excelente estado con todas las características de seguridad.",
  
  // Compatibilidad
  estado: "propio"
};

/**
 * Hook de ejemplo para usar el servicio de vehículos
 */
export function useEjemploVehiculo() {
  const { crearVehiculo, obtenerVehiculos } = useVehiculoService();
  
  const crearVehiculoEjemplo = async (twinId: string) => {
    try {
      console.log('🚗 Creando vehículo de ejemplo...');
      const resultado = await crearVehiculo(ejemploVehiculoData, twinId);
      console.log('✅ Vehículo creado exitosamente:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Error al crear vehículo de ejemplo:', error);
      throw error;
    }
  };
  
  const obtenerVehiculosDelTwin = async (twinId: string) => {
    try {
      console.log('🚗 Obteniendo vehículos del Twin...');
      const vehiculos = await obtenerVehiculos(twinId);
      console.log('✅ Vehículos obtenidos:', vehiculos);
      return vehiculos;
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      throw error;
    }
  };
  
  return {
    crearVehiculoEjemplo,
    obtenerVehiculosDelTwin,
    ejemploData: ejemploVehiculoData
  };
}

/**
 * Función para testing del backend
 */
export async function testBackendVehiculo(twinId: string = 'demo-twin-id') {
  const { crearVehiculoEjemplo, obtenerVehiculosDelTwin } = useEjemploVehiculo();
  
  try {
    console.log('🧪 Iniciando test del backend de vehículos...');
    
    // Test 1: Crear vehículo
    console.log('📝 Test 1: Creando vehículo...');
    await crearVehiculoEjemplo(twinId);
    
    // Test 2: Obtener vehículos
    console.log('📋 Test 2: Obteniendo vehículos...');
    await obtenerVehiculosDelTwin(twinId);
    
    console.log('✅ Todos los tests completados exitosamente');
  } catch (error) {
    console.error('❌ Error en el test:', error);
    throw error;
  }
}

/**
 * Para usar en la consola del navegador:
 * 
 * import { testBackendVehiculo } from './path/to/this/file';
 * testBackendVehiculo('your-twin-id');
 */