# 🧪 Guía de Testing - Creación de Vehículos

## 🎯 Objetivo
Probar la creación de vehículos sin llenar manualmente todo el formulario UI.

## 🛠️ Métodos de Testing Disponibles

### 1. 🖥️ **Página de Testing (Recomendado)**
Interfaz gráfica completa para testing.

**URL:** `http://127.0.0.1:5175/twin-vehiculo/test`

**Características:**
- ✅ Interfaz visual intuitiva
- ✅ 3 tipos de test (Servicio, Directo, Diagnóstico)
- ✅ TwinId configurable
- ✅ Resultados en tiempo real
- ✅ Datos de prueba pre-cargados

**Uso:**
1. Ir a la URL
2. Cambiar TwinId si necesario
3. Click en "Test con Servicio" o "Test Directo"
4. Ver resultados en pantalla

---

### 2. 🔧 **Consola del Navegador (Rápido)**
Para testing rápido desde DevTools.

**Cargar script:**
```javascript
// Opción 1: Cargar desde archivo
const script = document.createElement('script');
script.src = '/test-vehiculo.js';
document.head.appendChild(script);

// Opción 2: Copiar funciones directamente (ver abajo)
```

**Funciones disponibles:**
```javascript
// Test rápido básico
testRapidoVehiculo()

// Test con TwinId específico  
testRapidoVehiculo('mi-twin-id')

// Verificar backend
diagnosticoRapido()

// Test con múltiples IDs
testConVariosIds()

// Ver datos de prueba
console.log(vehiculoPrueba)
```

---

### 3. 📁 **Servicio Programático**
Para testing desde código TypeScript.

```typescript
import { useVehiculoService } from '@/services/vehiculoApiService';
import { datosVehiculoPrueba } from '@/utils/testVehiculoCreation';

const { crearVehiculo } = useVehiculoService();
const result = await crearVehiculo(datosVehiculoPrueba, 'demo-twin-id');
```

---

## 📋 Datos de Prueba Incluidos

### 🚗 **Vehículo: Toyota Camry 2023 Hybrid**

```json
{
  "make": "Toyota",
  "model": "Camry", 
  "year": 2023,
  "licensePlate": "ABC-123",
  "vin": "1HGBH41JXMN109186",
  "transmission": "Automatic",
  "drivetrain": "FWD",
  "fuelType": "Hybrid",
  "mileage": 25000,
  "listPrice": 28500,
  "currentPrice": 27500,
  "condition": "Excellent",
  "estado": "propio"
}
```

**Datos completos incluyen:**
- ✅ 60+ campos del estándar CarMaxVehicle
- ✅ Información financiera personal  
- ✅ Ubicación con coordenadas GPS
- ✅ Características y equipamiento
- ✅ Información de título y garantía
- ✅ Fotos de ejemplo

---

## 🚀 Paso a Paso - Testing Rápido

### **Método 1: Interfaz Gráfica**
1. **Abrir página:** `http://127.0.0.1:5175/twin-vehiculo/test`
2. **Configurar TwinId:** (opcional, usa 'demo-twin-id-test' por defecto)
3. **Click:** "Test con Servicio"
4. **Verificar:** Resultado en pantalla y consola

### **Método 2: Consola del Navegador**
1. **Abrir DevTools:** F12
2. **Ir a Console**
3. **Cargar script:**
   ```javascript
   const script = document.createElement('script');
   script.src = '/test-vehiculo.js';
   document.head.appendChild(script);
   ```
4. **Ejecutar test:**
   ```javascript
   testRapidoVehiculo('mi-twin-id')
   ```

### **Método 3: URL Directa (Solo Backend)**
```javascript
fetch('/api/twins/demo-twin/cars', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    make: "Toyota",
    model: "Camry",
    year: 2023, 
    licensePlate: "TEST-123"
  })
})
.then(r => r.json())
.then(console.log)
```

---

## 🔍 Diagnóstico de Problemas

### ❌ **Error: "Backend no responde"**
**Causas posibles:**
- Backend no está corriendo
- Puerto incorrecto
- Problemas de CORS

**Soluciones:**
1. Verificar que el backend esté en línea
2. Revisar logs del backend
3. Verificar URL del endpoint

### ❌ **Error: "HTTP 404"**
**Causas posibles:**
- Endpoint incorrecto
- Ruta no implementada en backend

**Soluciones:**
1. Verificar que `/api/twins/{twinId}/cars` existe
2. Revisar documentación del backend

### ❌ **Error: "HTTP 400/422"**
**Causas posibles:**
- Datos inválidos
- Campos requeridos faltantes
- Formato incorrecto

**Soluciones:**
1. Verificar campos requeridos (make, model, year, licensePlate)
2. Revisar tipos de datos
3. Verificar estructura JSON

### ❌ **Error: "HTTP 401/403"**
**Causas posibles:**
- Falta autenticación
- Token inválido

**Soluciones:**
1. Implementar autenticación en headers
2. Verificar token de usuario

---

## 📊 Información de Debug

### **Logs del Sistema**
Todos los métodos incluyen logging detallado:
```
🚗 Iniciando test de creación...
📋 TwinId: demo-twin-id
📋 Datos: {...}
📡 Response status: 200
✅ Éxito! Vehículo creado
```

### **Headers de Request**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN" // TODO: Implementar
}
```

### **Estructura de Response Esperada**
```json
{
  "success": true,
  "carData": {
    "id": "car-123",
    "make": "Toyota",
    "model": "Camry",
    // ... más campos
  }
}
```

---

## 🎯 Casos de Uso por Método

| Método | Uso Ideal | Ventajas | Desventajas |
|--------|-----------|----------|-------------|
| **Página UI** | Testing completo | Visual, fácil, completo | Requiere navegación |
| **Consola** | Testing rápido | Inmediato, flexible | Requiere DevTools |
| **Servicio** | Integración | Tipo-seguro, completo | Requiere código |

---

## ✅ Checklist de Testing

- [ ] Backend está corriendo
- [ ] Frontend compilando sin errores  
- [ ] Página de test carga: `/twin-vehiculo/test`
- [ ] Consola muestra funciones disponibles
- [ ] Test básico funciona
- [ ] TwinId personalizado funciona
- [ ] Diagnóstico reporta backend OK
- [ ] Logs muestran request/response
- [ ] Datos se guardan en backend

---

**¡Listo para probar! 🚀**

Comienza con la **página de testing** para la experiencia más fácil, o usa la **consola** para testing rápido.