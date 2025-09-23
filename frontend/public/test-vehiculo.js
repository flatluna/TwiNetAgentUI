// Script simple para testing rápido desde la consola del navegador
// Copiar y pegar en la consola del navegador

// Datos de prueba rápidos - VERSION LIMPIA
const vehiculoPrueba = {
  make: "Toyota",
  model: "Camry", 
  year: 2023,
  licensePlate: "TEST-123",
  vin: "1HGBH41JXMN109186",
  transmission: "Automatic",
  fuelType: "Hybrid",
  mileage: 25000,
  listPrice: 28500,
  currentPrice: 27500,
  condition: "Excellent",
  estado: "propio"
};

// Función para validar JSON antes de enviar
function validarJSON(data) {
  try {
    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    console.log('✅ JSON es válido');
    console.log('📋 Tamaño del JSON:', jsonString.length, 'caracteres');
    console.log('📋 Primeros 200 chars:', jsonString.substring(0, 200) + '...');
    return { valid: true, json: jsonString, data: parsed };
  } catch (error) {
    console.error('❌ JSON inválido:', error);
    return { valid: false, error: error.message };
  }
}

// Función de test con validación mejorada
async function testRapidoVehiculo(twinId = 'demo-twin-test') {
  console.log('🚗 TEST RÁPIDO - Creando vehículo de prueba...');
  
  // PASO 1: Validar JSON primero
  console.log('\n📋 PASO 1: Validando JSON...');
  const validation = validarJSON(vehiculoPrueba);
  
  if (!validation.valid) {
    console.error('❌ ABORTANDO: JSON inválido');
    return { error: 'JSON inválido: ' + validation.error };
  }
  
  console.log('📋 Datos a enviar:', vehiculoPrueba);
  
  try {
    // PASO 2: Verificar endpoint
    console.log('\n📡 PASO 2: Enviando request...');
    const url = `/api/twins/${twinId}/cars`;
    console.log('📡 URL:', url);
    console.log('📡 Method: POST');
    console.log('📡 Headers: Content-Type: application/json');
    
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
    console.log(`📡 OK: ${response.ok}`);
    console.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ ÉXITO! Vehículo creado:');
      console.log(result);
      return result;
    } else {
      const error = await response.text();
      console.log('\n❌ ERROR DEL SERVIDOR:');
      console.log('Status:', response.status);
      console.log('Response:', error);
      
      // Diagnóstico específico para errores comunes
      if (response.status === 400) {
        console.log('\n🔍 DIAGNÓSTICO ERROR 400:');
        console.log('- Verificar formato JSON');
        console.log('- Verificar campos requeridos');
        console.log('- Verificar tipos de datos');
      } else if (response.status === 404) {
        console.log('\n🔍 DIAGNÓSTICO ERROR 404:');
        console.log('- Verificar que el endpoint existe');
        console.log('- Verificar TwinId:', twinId);
      } else if (response.status === 500) {
        console.log('\n🔍 DIAGNÓSTICO ERROR 500:');
        console.log('- Error interno del servidor');
        console.log('- Revisar logs del backend');
      }
      
      return { error, status: response.status };
    }
  } catch (error) {
    console.log('\n❌ ERROR DE CONEXIÓN:', error.message);
    console.log('\n🔧 DIAGNÓSTICO:');
    console.log('- Verificar que el backend esté corriendo');
    console.log('- Verificar la URL del backend');
    console.log('- Verificar configuración de CORS');
    return { error: error.message };
  }
}

// Función para test con datos mínimos (solo requeridos)
async function testMinimo(twinId = 'demo-twin-test') {
  const datosMinimos = {
    make: "Toyota",
    model: "Camry",
    year: 2023,
    licensePlate: "MIN-123"
  };
  
  console.log('🚗 TEST MÍNIMO - Solo campos requeridos...');
  console.log('📋 Datos:', datosMinimos);
  
  const validation = validarJSON(datosMinimos);
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
      console.log('✅ ÉXITO CON DATOS MÍNIMOS:', result);
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

// Función para diagnosticar
async function diagnosticoRapido() {
  console.log('🔍 DIAGNÓSTICO RÁPIDO...');
  
  try {
    const response = await fetch('/api/twins');
    console.log(`📡 Backend status: ${response.status}`);
    console.log(response.ok ? '✅ Backend responde' : '⚠️ Backend con problemas');
    return { status: response.status, ok: response.ok };
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return { error: error.message };
  }
}

// Función para test con diferentes TwinIds
async function testConVariosIds() {
  const ids = ['demo-twin', 'test-twin', 'user-123', 'vehicle-test'];
  
  for (const id of ids) {
    console.log(`\n🧪 Testing con TwinId: ${id}`);
    await testRapidoVehiculo(id);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1 segundo
  }
}

// Hacer funciones globales
window.testRapidoVehiculo = testRapidoVehiculo;
window.testMinimo = testMinimo;
window.validarJSON = validarJSON;
window.diagnosticoRapido = diagnosticoRapido;
window.testConVariosIds = testConVariosIds;
window.vehiculoPrueba = vehiculoPrueba;

console.log(`
🚗 FUNCIONES DE TESTING DISPONIBLES (MEJORADAS):

1. testRapidoVehiculo(twinId)     - Test con validación JSON
2. testMinimo(twinId)             - Test solo campos requeridos
3. validarJSON(data)              - Validar JSON antes de enviar  
4. diagnosticoRapido()            - Verificar si backend responde  
5. testConVariosIds()             - Test con múltiples TwinIds
6. vehiculoPrueba                 - Ver datos de prueba

EJEMPLOS DE USO:
  testRapidoVehiculo()              // Test completo con validación
  testMinimo()                      // Solo campos requeridos
  validarJSON(vehiculoPrueba)       // Verificar JSON
  
PARA RESOLVER ERROR 400:
  testMinimo('tu-twin-id')          // Probar con datos mínimos primero
`);