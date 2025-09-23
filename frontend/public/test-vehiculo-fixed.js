// Script de testing CORREGIDO con PascalCase para backend C#
// Usar este script después de corregir el problema de JSON format

// DATOS DE PRUEBA CORREGIDOS - PASCALCASE PARA C# BACKEND
const testCarDataFixed = {
  // Información básica - CONVERTIDO A PASCALCASE
  StockNumber: "TC001",
  Make: "Toyota",
  Model: "Camry",
  Year: 2022,
  Trim: "XLE",
  SubModel: "V6",
  BodyStyle: "Sedan",
  Doors: 4,
  LicensePlate: "ABC123",
  PlateState: "CA",
  Vin: "1HGBH41JXMN109186",

  // Especificaciones técnicas
  Transmission: "Automatic CVT",
  Drivetrain: "FWD",
  FuelType: "Gasoline",
  EngineDescription: "3.5L V6 DOHC",
  Cylinders: 6,
  EngineDisplacementLiters: 3.5,
  Mileage: 15000,
  MileageUnit: "miles",
  OdometerStatus: "actual",

  // Colores y apariencia
  ExteriorColor: "Super White",
  InteriorColor: "Black",
  Upholstery: "Leather",

  // Estado y condición
  Condition: "Excellent",
  StockStatus: "Available",
  HasOpenRecalls: false,
  HasAccidentHistory: false,
  IsCertifiedPreOwned: true,

  // Fechas y adquisición
  DateAcquired: "2024-01-15",
  DateListed: "2024-01-20",
  AcquisitionSource: "Personal Purchase",

  // Ubicación
  AddressComplete: "123 Main St, Los Angeles, CA 90210, USA",
  City: "Los Angeles",
  State: "CA",
  PostalCode: "90210",
  Country: "USA",
  Latitude: 34.0522,
  Longitude: -118.2437,
  ParkingLocation: "Garage",

  // Información financiera
  ListPrice: 35000,
  CurrentPrice: 33000,
  EstimatedTax: 2640,
  EstimatedRegistrationFee: 450,
  DealerProcessingFee: 0,

  // Financiamiento
  MonthlyPayment: 580,
  Apr: 4.5,
  TermMonths: 60,
  DownPayment: 5000,

  // Características
  StandardFeatures: ["Air Conditioning", "Power Windows", "Bluetooth", "Backup Camera"],
  OptionalFeatures: ["Sunroof", "Navigation System", "Premium Audio"],
  SafetyFeatures: ["ABS", "Airbags", "Stability Control", "Lane Departure Warning"],

  // Título
  TitleBrand: "Clean",
  HasLien: false,
  LienHolder: null,
  LienAmount: 0,
  TitleState: "CA",

  // Garantía
  WarrantyType: "Manufacturer",
  WarrantyStart: "2022-01-01",
  WarrantyEnd: "2025-01-01",
  WarrantyProvider: "Toyota",

  // Multimedia
  Photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
  VideoUrl: "https://example.com/video.mp4",

  // Notas
  InternalNotes: "Well maintained, single owner",
  Description: "Beautiful 2022 Toyota Camry XLE with low mileage and excellent condition",

  // Estado de propiedad
  Estado: "Owned",

  // Metadatos
  CreatedBy: "test-user"
};

// Datos mínimos CORREGIDOS (solo campos requeridos con PascalCase)
const testCarMinimal = {
  Make: "Toyota",
  Model: "Camry",
  Year: 2023,
  LicensePlate: "MIN-123"
};

// Función para test con datos corregidos (PascalCase)
async function testVehiculoCorregido(twinId = 'demo-twin-test') {
  console.log('🚗 TEST CORREGIDO - Usando PascalCase para C# backend...');
  
  // PASO 1: Mostrar comparación
  console.log('\n📋 ANTES (camelCase):', { make: "Toyota", model: "Camry" });
  console.log('📋 AHORA (PascalCase):', { Make: "Toyota", Model: "Camry" });
  
  // PASO 2: Validar JSON corregido
  console.log('\n📋 PASO 1: Validando JSON corregido...');
  const validation = validarJSON(testCarDataFixed);
  
  if (!validation.valid) {
    console.error('❌ ABORTANDO: JSON inválido');
    return { error: 'JSON inválido: ' + validation.error };
  }
  
  console.log('✅ JSON válido con PascalCase');
  console.log('📋 Primeras propiedades:', Object.keys(testCarDataFixed).slice(0, 5));
  
  try {
    console.log('\n📡 PASO 2: Enviando request con propiedades corregidas...');
    const url = `/api/twins/${twinId}/cars`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: validation.json
    });
    
    console.log(`\n📊 PASO 3: Procesando respuesta...`);
    console.log(`📡 Status: ${response.status} (${response.statusText})`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ ÉXITO! Error de JSON format resuelto:');
      console.log(result);
      return result;
    } else {
      const error = await response.text();
      console.log('\n❌ TODAVÍA HAY ERROR:');
      console.log('Status:', response.status);
      console.log('Response:', error);
      
      // Diagnóstico específico
      if (response.status === 400 && error.includes('JSON format')) {
        console.log('\n🔍 AUN PROBLEMAS DE JSON FORMAT:');
        console.log('- Verificar que TODAS las propiedades sean PascalCase');
        console.log('- Verificar que el backend use PropertyNameCaseInsensitive');
        console.log('- Verificar estructura exacta del C# class');
      }
      
      return { error, status: response.status };
    }
  } catch (error) {
    console.log('\n❌ ERROR DE CONEXIÓN:', error.message);
    return { error: error.message };
  }
}

// Función para test mínimo corregido
async function testMinimoCorregido(twinId = 'demo-twin-test') {
  console.log('🚗 TEST MÍNIMO CORREGIDO - Solo campos requeridos con PascalCase...');
  console.log('📋 Datos:', testCarMinimal);
  
  const validation = validarJSON(testCarMinimal);
  if (!validation.valid) {
    return { error: 'JSON inválido: ' + validation.error };
  }
  
  try {
    const response = await fetch(`/api/twins/${twinId}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: validation.json
    });
    
    console.log(`📡 Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ ÉXITO CON DATOS MÍNIMOS CORREGIDOS:', result);
      return result;
    } else {
      const error = await response.text();
      console.log('❌ ERROR:', error);
      return { error, status: response.status };
    }
  } catch (error) {
    console.log('❌ ERROR DE CONEXIÓN:', error.message);
    return { error: error.message };
  }
}

// Función para comparar formatos
function compararFormatos() {
  const camelCase = { make: "Toyota", model: "Camry", year: 2023 };
  const pascalCase = { Make: "Toyota", Model: "Camry", Year: 2023 };
  
  console.log('📋 COMPARACIÓN DE FORMATOS:');
  console.log('\nAntes (camelCase - ERROR):');
  console.log(JSON.stringify(camelCase, null, 2));
  console.log('\nAhora (PascalCase - CORRECTO):');
  console.log(JSON.stringify(pascalCase, null, 2));
  
  console.log('\n🎯 CLAVE DEL PROBLEMA:');
  console.log('- C# backend espera: Make, Model, Year');
  console.log('- Frontend enviaba: make, model, year');
  console.log('- PropertyNameCaseInsensitive NO funcionó');
  console.log('- Solución: Usar PascalCase exacto');
}

// Hacer funciones globales
window.testVehiculoCorregido = testVehiculoCorregido;
window.testMinimoCorregido = testMinimoCorregido;
window.compararFormatos = compararFormatos;
window.testCarDataFixed = testCarDataFixed;
window.testCarMinimal = testCarMinimal;

console.log(`
🚗 FUNCIONES DE TESTING CORREGIDAS (PASCALCASE):

✅ NUEVAS FUNCIONES CORREGIDAS:
1. testVehiculoCorregido(twinId)     - Test con PascalCase
2. testMinimoCorregido(twinId)       - Test mínimo con PascalCase
3. compararFormatos()                - Ver diferencia camelCase vs PascalCase
4. testCarDataFixed                  - Datos completos PascalCase
5. testCarMinimal                    - Datos mínimos PascalCase

❌ FUNCIONES ANTERIORES (con camelCase):
- testRapidoVehiculo()               - OBSOLETO (daba error 400)
- testMinimo()                       - OBSOLETO (daba error 400)

EJEMPLOS DE USO:
  testVehiculoCorregido()              // Test completo CORREGIDO
  testMinimoCorregido()                // Solo campos requeridos CORREGIDO
  compararFormatos()                   // Ver la diferencia
  
RESOLUCIÓN DEL ERROR 400:
✅ Problema identificado: camelCase vs PascalCase
✅ Solución implementada: Usar PascalCase en JSON
✅ Listo para testing
`);