# 📋 Documentación API Backend - Guardar Itinerarios

## 🎯 Endpoint: POST `/api/twins/{twinId}/travels/{travelId}/itinerarios`

### ✅ Azure Function Implementation
```csharp
[Function("CreateItinerary")]
public async Task<HttpResponseData> CreateItinerary(
    [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "twins/{twinId}/travels/{travelId}/itinerarios")] HttpRequestData req,
    string twinId, string travelId)
```

### 📡 Request Headers
```
Content-Type: application/json
Accept: application/json
X-Request-ID: itinerary-{timestamp}  // Para tracking y debugging
X-Client: TwinAgent-Web              // Identificador del cliente
```

### 📦 Payload Structure (JSON)

El frontend envía exactamente este payload:

```json
{
  // === DATOS DEL ITINERARIO ===
  "id": "1726001234567",                    // String: Timestamp único generado por frontend
  "titulo": "Viaje de Negocios a Austin",   // String: Título del itinerario
  "descripcion": "Reunión con socios...",   // String: Descripción opcional
  
  // === UBICACIONES (desde combo boxes) ===
  "ciudadOrigen": "New York",               // String: Ciudad de origen
  "paisOrigen": "Estados Unidos",           // String: País de origen  
  "ciudadDestino": "Austin",                // String: Ciudad de destino
  "paisDestino": "Estados Unidos",          // String: País de destino
  
  // === FECHAS ===
  "fechaInicio": "2025-09-15",             // String: Fecha inicio (YYYY-MM-DD)
  "fechaFin": "2025-09-18",                // String: Fecha fin (YYYY-MM-DD)
  "fechaCreacion": "2025-09-10T21:05:15.123Z",  // String: ISO timestamp de creación
  "fechaActualizacion": "2025-09-10T21:05:15.123Z", // String: ISO timestamp de actualización
  
  // === DETALLES DEL VIAJE ===
  "medioTransporte": "avion",              // String: "avion", "auto", "bus", "tren", "barco"
  "presupuestoEstimado": 2500.50,          // Number: Presupuesto en formato decimal
  "moneda": "USD",                         // String: Código de moneda
  "tipoAlojamiento": "hotel",              // String: "hotel", "hostal", "apartamento", "casa", "camping"
  "notas": "Llevar documentos...",         // String: Notas adicionales
  
  // === METADATOS DE CONTEXTO ===
  "twinId": "user123",                     // String: ID del usuario/twin (también en URL)
  "viajeId": "viaje456",                   // String: ID del viaje padre (también en URL como travelId)
  "documentType": "itinerary",             // String: Tipo de documento
  
  // === INFORMACIÓN DEL VIAJE PADRE (para contexto) ===
  "viajeInfo": {
    "titulo": "Viajes de Trabajo 2025",
    "descripcion": "Viajes laborales del año",
    "tipoViaje": "business"
  }
}
```

## 🗄️ Implementación Azure Functions (C#)

### **Estructura de la Function**
```csharp
[Function("CreateItinerary")]
public async Task<HttpResponseData> CreateItinerary(
    [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "twins/{twinId}/travels/{travelId}/itinerarios")] HttpRequestData req,
    string twinId, string travelId)
{
    try 
    {
        // 1. Leer el JSON del request body
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var itineraryData = JsonSerializer.Deserialize<ItineraryRequest>(requestBody);
        
        // 2. Validar datos requeridos
        if (string.IsNullOrEmpty(itineraryData.titulo) || 
            string.IsNullOrEmpty(itineraryData.ciudadOrigen) ||
            string.IsNullOrEmpty(itineraryData.paisOrigen) ||
            string.IsNullOrEmpty(itineraryData.ciudadDestino) ||
            string.IsNullOrEmpty(itineraryData.paisDestino) ||
            string.IsNullOrEmpty(itineraryData.fechaInicio) ||
            string.IsNullOrEmpty(itineraryData.fechaFin))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteAsJsonAsync(new { 
                error = "Campos requeridos faltantes",
                requestId = req.Headers.GetValues("X-Request-ID").FirstOrDefault()
            });
            return errorResponse;
        }
        
        // 3. Verificar que travelId coincida con el del payload
        if (travelId != itineraryData.viajeId) 
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteAsJsonAsync(new { 
                error = "El ID del viaje en la URL no coincide con el payload",
                urlTravelId = travelId,
                payloadViajeId = itineraryData.viajeId
            });
            return errorResponse;
        }
        
        // 4. Guardar en base de datos (ejemplo con Cosmos DB)
        var itinerary = new ItineraryDocument 
        {
            id = itineraryData.id,
            twinId = twinId,
            viajeId = travelId,
            titulo = itineraryData.titulo,
            descripcion = itineraryData.descripcion,
            ciudadOrigen = itineraryData.ciudadOrigen,
            paisOrigen = itineraryData.paisOrigen,
            ciudadDestino = itineraryData.ciudadDestino,
            paisDestino = itineraryData.paisDestino,
            fechaInicio = DateTime.Parse(itineraryData.fechaInicio),
            fechaFin = DateTime.Parse(itineraryData.fechaFin),
            medioTransporte = itineraryData.medioTransporte,
            presupuestoEstimado = itineraryData.presupuestoEstimado,
            moneda = itineraryData.moneda,
            tipoAlojamiento = itineraryData.tipoAlojamiento,
            notas = itineraryData.notas,
            documentType = itineraryData.documentType ?? "itinerary",
            viajeInfo = itineraryData.viajeInfo,
            fechaCreacion = DateTime.Parse(itineraryData.fechaCreacion),
            fechaActualizacion = DateTime.UtcNow
        };
        
        // Aquí insertar en tu base de datos
        // await cosmosContainer.CreateItemAsync(itinerary);
        
        // 5. Respuesta exitosa
        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(new {
            success = true,
            message = "Itinerario guardado exitosamente",
            data = itinerary,
            metadata = new {
                requestId = req.Headers.GetValues("X-Request-ID").FirstOrDefault(),
                timestamp = DateTime.UtcNow.ToString("O")
            }
        });
        
        return response;
    }
    catch (Exception ex)
    {
        var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
        await errorResponse.WriteAsJsonAsync(new { 
            error = "Error interno del servidor",
            message = ex.Message,
            requestId = req.Headers.GetValues("X-Request-ID").FirstOrDefault()
        });
        return errorResponse;
    }
}
```

### **Modelos C# Necesarios**
```csharp
public class ItineraryRequest 
{
    public string id { get; set; }
    public string titulo { get; set; }
    public string descripcion { get; set; }
    public string ciudadOrigen { get; set; }
    public string paisOrigen { get; set; }
    public string ciudadDestino { get; set; }
    public string paisDestino { get; set; }
    public string fechaInicio { get; set; }
    public string fechaFin { get; set; }
    public string medioTransporte { get; set; }
    public decimal? presupuestoEstimado { get; set; }
    public string moneda { get; set; }
    public string tipoAlojamiento { get; set; }
    public string notas { get; set; }
    public string twinId { get; set; }
    public string viajeId { get; set; }
    public string documentType { get; set; }
    public string fechaCreacion { get; set; }
    public string fechaActualizacion { get; set; }
    public ViajeInfo viajeInfo { get; set; }
}

public class ViajeInfo 
{
    public string titulo { get; set; }
    public string descripcion { get; set; }
    public string tipoViaje { get; set; }
}

public class ItineraryDocument 
{
    public string id { get; set; }
    public string twinId { get; set; }
    public string viajeId { get; set; }
    public string titulo { get; set; }
    public string descripcion { get; set; }
    public string ciudadOrigen { get; set; }
    public string paisOrigen { get; set; }
    public string ciudadDestino { get; set; }
    public string paisDestino { get; set; }
    public DateTime fechaInicio { get; set; }
    public DateTime fechaFin { get; set; }
    public string medioTransporte { get; set; }
    public decimal? presupuestoEstimado { get; set; }
    public string moneda { get; set; }
    public string tipoAlojamiento { get; set; }
    public string notas { get; set; }
    public string documentType { get; set; }
    public ViajeInfo viajeInfo { get; set; }
    public DateTime fechaCreacion { get; set; }
    public DateTime fechaActualizacion { get; set; }
}
```

## 🗄️ Cómo Debe Guardarlo el Backend

### 1. **Validación de Datos**
```javascript
// Campos requeridos
const requiredFields = [
  'titulo', 'ciudadOrigen', 'paisOrigen', 
  'ciudadDestino', 'paisDestino', 
  'fechaInicio', 'fechaFin'
];

// Validar que todos los campos requeridos estén presentes
if (!requiredFields.every(field => payload[field])) {
  return res.status(400).json({ 
    error: 'Campos requeridos faltantes',
    missing: requiredFields.filter(field => !payload[field])
  });
}
```

### 2. **Estructura de Base de Datos Sugerida**

#### Tabla: `itinerarios`
```sql
CREATE TABLE itinerarios (
  id VARCHAR(50) PRIMARY KEY,           -- ID único del itinerario
  twin_id VARCHAR(50) NOT NULL,        -- ID del usuario
  viaje_id VARCHAR(50) NOT NULL,       -- ID del viaje padre
  
  -- Datos básicos
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  
  -- Ubicaciones
  ciudad_origen VARCHAR(100) NOT NULL,
  pais_origen VARCHAR(100) NOT NULL,
  ciudad_destino VARCHAR(100) NOT NULL,
  pais_destino VARCHAR(100) NOT NULL,
  
  -- Fechas
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Detalles
  medio_transporte VARCHAR(50),
  presupuesto_estimado DECIMAL(10,2),
  moneda VARCHAR(10),
  tipo_alojamiento VARCHAR(50),
  notas TEXT,
  
  -- Metadatos
  document_type VARCHAR(50) DEFAULT 'itinerary',
  viaje_info JSON,  -- Para guardar info del viaje padre
  
  -- Índices y constraints
  INDEX idx_twin_viaje (twin_id, viaje_id),
  INDEX idx_fechas (fecha_inicio, fecha_fin),
  FOREIGN KEY (viaje_id) REFERENCES viajes(id)
);
```

### 3. **Lógica de Guardado (Ejemplo Node.js/Express)**

```javascript
app.post('/api/twins/:twinId/travels/:viajeId/itinerarios', async (req, res) => {
  try {
    const { twinId, viajeId } = req.params;
    const payload = req.body;
    
    // 1. Validar que el viaje existe y pertenece al usuario
    const viaje = await db.query(
      'SELECT id FROM viajes WHERE id = ? AND twin_id = ?', 
      [viajeId, twinId]
    );
    
    if (!viaje.length) {
      return res.status(404).json({ 
        error: 'Viaje no encontrado o no autorizado' 
      });
    }
    
    // 2. Verificar que no existe itinerario con mismo ID
    const existingItinerary = await db.query(
      'SELECT id FROM itinerarios WHERE id = ?', 
      [payload.id]
    );
    
    if (existingItinerary.length) {
      return res.status(409).json({ 
        error: 'Itinerario ya existe' 
      });
    }
    
    // 3. Preparar datos para inserción
    const itinerarioData = {
      id: payload.id,
      twin_id: twinId,
      viaje_id: viajeId,
      titulo: payload.titulo,
      descripcion: payload.descripcion || null,
      ciudad_origen: payload.ciudadOrigen,
      pais_origen: payload.paisOrigen,
      ciudad_destino: payload.ciudadDestino,
      pais_destino: payload.paisDestino,
      fecha_inicio: payload.fechaInicio,
      fecha_fin: payload.fechaFin,
      medio_transporte: payload.medioTransporte || null,
      presupuesto_estimado: payload.presupuestoEstimado || null,
      moneda: payload.moneda || null,
      tipo_alojamiento: payload.tipoAlojamiento || null,
      notas: payload.notas || null,
      document_type: payload.documentType || 'itinerary',
      viaje_info: JSON.stringify(payload.viajeInfo || {}),
      fecha_creacion: new Date(payload.fechaCreacion),
      fecha_actualizacion: new Date(payload.fechaActualizacion)
    };
    
    // 4. Insertar en base de datos
    const result = await db.query(
      `INSERT INTO itinerarios SET ?`, 
      [itinerarioData]
    );
    
    // 5. Devolver el itinerario guardado
    const savedItinerary = await db.query(
      'SELECT * FROM itinerarios WHERE id = ?', 
      [payload.id]
    );
    
    // 6. Log para auditoría
    console.log(`✅ Itinerario creado: ${payload.id} por ${twinId} en viaje ${viajeId}`);
    
    // 7. Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Itinerario guardado exitosamente',
      data: savedItinerary[0],
      metadata: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error guardando itinerario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      requestId: req.headers['x-request-id']
    });
  }
});
```

## 📋 Response Formats

### ✅ Success Response (201 Created)
```json
{
  "success": true,
  "message": "Itinerario guardado exitosamente",
  "data": {
    "id": "1726001234567",
    "titulo": "Viaje de Negocios a Austin",
    "ciudadOrigen": "New York",
    "ciudadDestino": "Austin",
    // ... resto de datos del itinerario
    "fecha_creacion": "2025-09-10T21:05:15.123Z"
  },
  "metadata": {
    "requestId": "itinerary-1726001234567",
    "timestamp": "2025-09-10T21:05:15.456Z"
  }
}
```

### ❌ Error Responses

#### 400 Bad Request
```json
{
  "error": "Campos requeridos faltantes",
  "missing": ["titulo", "fechaInicio"],
  "requestId": "itinerary-1726001234567"
}
```

#### 404 Not Found
```json
{
  "error": "Viaje no encontrado o no autorizado",
  "requestId": "itinerary-1726001234567"
}
```

#### 409 Conflict
```json
{
  "error": "Itinerario ya existe",
  "existingId": "1726001234567",
  "requestId": "itinerary-1726001234567"
}
```

## 🔍 Consideraciones Adicionales

### 1. **Índices de Base de Datos**
- Crear índice en `(twin_id, viaje_id)` para consultas rápidas
- Índice en fechas para búsquedas por rango
- Índice en `ciudad_destino` para búsquedas geográficas

### 2. **Validaciones Adicionales**
- Validar formato de fechas
- Verificar que `fecha_fin >= fecha_inicio`
- Validar códigos de moneda (USD, EUR, etc.)
- Validar valores de enum (medioTransporte, tipoAlojamiento)

### 3. **Logs y Auditoría**
- Registrar todas las operaciones con `X-Request-ID`
- Log de errores para debugging
- Métricas de uso por usuario

### 4. **Seguridad**
- Verificar autorización del usuario para el viaje
- Sanitizar inputs para prevenir SQL injection
- Rate limiting para prevenir spam

Esta documentación proporciona al backend toda la información necesaria para implementar correctamente el endpoint de guardado de itinerarios. 🚀
