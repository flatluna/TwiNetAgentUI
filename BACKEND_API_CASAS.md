# API Backend - Gestión de Casas y Propiedades

## Endpoint: Crear Nueva Casa

### **POST** `/api/casas`

Este endpoint permite crear una nueva casa/propiedad en el sistema de patrimonio del usuario.

## Estructura de Datos - Casa

### **Campos Requeridos (Required)**

```json
{
  "twinId": "string",                    // ID del twin/usuario propietario
  "nombre": "string",                    // Nombre descriptivo de la propiedad
  "direccion": "string",                 // Dirección completa
  "ciudad": "string",                    // Ciudad
  "estado": "string",                    // Estado/Provincia
  "codigoPostal": "string",              // Código postal
  "pais": "string",                      // País
  "tipo": "enum",                        // 'actual' | 'pasado' | 'inversion' | 'vacacional'
  "tipoPropiedad": "enum",               // 'casa' | 'apartamento' | 'condominio' | 'townhouse' | 'duplex' | 'mansion' | 'cabana' | 'otro'
  "fechaInicio": "string (ISO date)",    // Fecha de inicio de posesión
  "areaTotal": "number",                 // Área total en metros cuadrados o pies cuadrados
  "areaConstruida": "number",            // Área construida
  "areaTerreno": "number",               // Área del terreno
  "habitaciones": "number",              // Número de habitaciones
  "banos": "number",                     // Número de baños completos
  "medioBanos": "number",                // Número de medios baños
  "pisos": "number",                     // Número de pisos
  "anoConstructorcion": "number",        // Año de construcción
  "descripcion": "string",               // Descripción detallada
  "esPrincipal": "boolean"               // Si es la vivienda principal
}
```

### **Campos Opcionales (Optional)**

#### **Fechas**
```json
{
  "fechaCompra": "string (ISO date)",    // Fecha de compra
  "fechaVenta": "string (ISO date)",     // Fecha de venta (solo para propiedades pasadas)
  "fechaFin": "string (ISO date)"        // Fecha fin de posesión
}
```

#### **Características Especiales**
```json
{
  "tieneGaraje": "boolean",              // Default: false
  "espaciosGaraje": "number",            // Default: 0
  "tienePiscina": "boolean",             // Default: false
  "tieneJardin": "boolean",              // Default: false
  "tieneSotano": "boolean",              // Default: false
  "tieneAtico": "boolean",               // Default: false
  "tieneTerraza": "boolean",             // Default: false
  "tieneBalcon": "boolean"               // Default: false
}
```

#### **Sistemas y Servicios**
```json
{
  "calefaccion": "string",               // Tipo de calefacción (Gas Natural, Eléctrica, etc.)
  "aireAcondicionado": "string",         // Tipo de A/C (Central, Split, etc.)
  "tipoAgua": "string",                  // Tipo de agua (Municipal, Pozo, etc.)
  "sistemaElectrico": "string",          // Sistema eléctrico (110V, 220V, etc.)
  "internet": "string",                  // Tipo de internet (Fibra, Cable, etc.)
  "sistemaSeguridad": "string"           // Sistema de seguridad (ADT, Ring, etc.)
}
```

#### **Información Financiera**
```json
{
  "valorCompra": "number",               // Valor de compra en USD
  "valorActual": "number",               // Valor actual en USD
  "valorEstimado": "number",             // Valor estimado en USD
  "impuestosPrediales": "number",        // Impuestos anuales en USD
  "seguroAnual": "number",               // Seguro anual en USD
  "hoaFee": "number",                    // Cuota mensual HOA en USD
  "serviciosPublicos": "number"          // Promedio mensual servicios en USD
}
```

#### **Ubicación y Entorno**
```json
{
  "vecindario": "string",                // Nombre del vecindario
  "colegiosCercanos": ["string"],        // Array de colegios cercanos
  "transportePublico": "string",         // Descripción transporte público
  "comerciosCercanos": ["string"]        // Array de comercios cercanos
}
```

#### **Estado y Condición**
```json
{
  "estadoGeneral": "enum",               // 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_reparaciones'
  "ultimaRenovacion": "string (ISO date)", // Fecha última renovación
  "reparacionesPendientes": ["string"],  // Array de reparaciones pendientes
  "mejoras": ["string"]                  // Array de mejoras realizadas
}
```

#### **Información Adicional**
```json
{
  "aspectosPositivos": ["string"],       // Array de aspectos positivos
  "aspectosNegativos": ["string"],       // Array de aspectos negativos
  "recuerdosEspeciales": ["string"]      // Array de recuerdos especiales
}
```

#### **Multimedia**
```json
{
  "fotos": ["string"],                   // Array de URLs de fotos
  "documentos": ["string"]               // Array de URLs de documentos
}
```

## Ejemplo de Request Completo

### **POST** `/api/casas`

```json
{
  "twinId": "user123",
  "nombre": "Casa Principal Teravista",
  "direccion": "18625 Schultz Lane",
  "ciudad": "Round Rock",
  "estado": "Texas",
  "codigoPostal": "78664",
  "pais": "Estados Unidos",
  "tipo": "actual",
  "tipoPropiedad": "casa",
  "fechaInicio": "2018-06-15",
  "fechaCompra": "2018-06-15",
  "areaTotal": 2130,
  "areaConstruida": 2130,
  "areaTerreno": 7500,
  "habitaciones": 4,
  "banos": 3,
  "medioBanos": 1,
  "pisos": 2,
  "anoConstructorcion": 2016,
  "tieneGaraje": true,
  "espaciosGaraje": 2,
  "tienePiscina": false,
  "tieneJardin": true,
  "tieneSotano": false,
  "tieneAtico": true,
  "tieneTerraza": true,
  "tieneBalcon": false,
  "calefaccion": "Gas Natural",
  "aireAcondicionado": "Central",
  "tipoAgua": "Municipal",
  "sistemaElectrico": "220V",
  "internet": "Fibra Óptica",
  "sistemaSeguridad": "ADT",
  "valorCompra": 412000,
  "valorActual": 485000,
  "valorEstimado": 490000,
  "impuestosPrediales": 9540,
  "seguroAnual": 1800,
  "hoaFee": 33,
  "serviciosPublicos": 180,
  "vecindario": "Teravista",
  "colegiosCercanos": ["Teravista Elementary", "Canyon Vista Middle School"],
  "transportePublico": "Capital Metro Bus",
  "comerciosCercanos": ["H-E-B", "Target", "Home Depot"],
  "estadoGeneral": "muy_bueno",
  "ultimaRenovacion": "2022-03-01",
  "reparacionesPendientes": ["Pintar habitación principal"],
  "mejoras": ["Renovación de cocina 2022", "Nuevo sistema HVAC 2021"],
  "descripcion": "Hermosa casa de dos pisos en el vecindario de Teravista. Cocina renovada, jardín grande y excelente ubicación.",
  "aspectosPositivos": ["Cocina renovada", "Jardín grande", "Excelente vecindario", "Cerca de colegios"],
  "aspectosNegativos": ["Necesita pintura en algunas habitaciones", "Piscina pequeña del vecindario"],
  "recuerdosEspeciales": ["Primera casa propia", "Navidades familiares", "Fiestas de cumpleaños en el jardín"],
  "fotos": [],
  "documentos": [],
  "esPrincipal": true
}
```

## Response Esperado

### **Success (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "casa_123abc",
    "twinId": "user123",
    "nombre": "Casa Principal Teravista",
    // ... todos los campos enviados
    "fechaCreacion": "2024-09-17T20:30:00Z",
    "fechaModificacion": "2024-09-17T20:30:00Z"
  },
  "message": "Casa creada exitosamente"
}
```

### **Error (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos requeridos faltantes",
    "details": {
      "missing_fields": ["nombre", "direccion", "ciudad"],
      "invalid_fields": ["tipo", "anoConstructorcion"]
    }
  }
}
```

## Validaciones Backend Requeridas

### **Campos Requeridos**
- ✅ `twinId` debe existir en la base de datos
- ✅ `nombre` no puede estar vacío
- ✅ `direccion` no puede estar vacía
- ✅ `ciudad`, `estado`, `pais` no pueden estar vacíos
- ✅ `tipo` debe ser uno de: 'actual', 'pasado', 'inversion', 'vacacional'
- ✅ `tipoPropiedad` debe ser válido según enum
- ✅ `fechaInicio` debe ser fecha válida

### **Validaciones de Datos**
- ✅ `areaTotal`, `areaConstruida`, `areaTerreno` deben ser números positivos
- ✅ `habitaciones`, `banos`, `medioBanos`, `pisos` deben ser números enteros positivos
- ✅ `anoConstructorcion` debe ser entre 1800 y año actual + 5
- ✅ `espaciosGaraje` debe ser 0 si `tieneGaraje` es false
- ✅ Valores financieros deben ser números positivos si se proporcionan
- ✅ Arrays no pueden tener elementos vacíos
- ✅ `fechaFin` debe ser posterior a `fechaInicio` si se proporciona

### **Reglas de Negocio**
- ✅ Solo puede haber una casa marcada como `esPrincipal: true` por usuario
- ✅ Si se marca como principal, actualizar las demás a `false`
- ✅ Casas tipo 'pasado' deben tener `fechaFin`
- ✅ Casas tipo 'actual' no deben tener `fechaFin`

## Otros Endpoints Necesarios

### **GET** `/api/casas?twinId={twinId}`
Obtener todas las casas de un usuario

### **GET** `/api/casas/{id}`
Obtener una casa específica

### **PUT** `/api/casas/{id}`
Actualizar una casa existente

### **DELETE** `/api/casas/{id}`
Eliminar una casa

### **POST** `/api/casas/{id}/fotos`
Subir fotos a una casa

### **POST** `/api/casas/{id}/documentos`
Subir documentos a una casa

## Base de Datos Sugerida

### Tabla: `casas`
```sql
CREATE TABLE casas (
    id VARCHAR(50) PRIMARY KEY,
    twin_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    tipo ENUM('actual', 'pasado', 'inversion', 'vacacional') NOT NULL,
    tipo_propiedad ENUM('casa', 'apartamento', 'condominio', 'townhouse', 'duplex', 'mansion', 'cabana', 'otro') NOT NULL,
    
    -- Fechas
    fecha_compra DATE,
    fecha_venta DATE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    
    -- Características físicas
    area_total DECIMAL(10,2) NOT NULL,
    area_construida DECIMAL(10,2) NOT NULL,
    area_terreno DECIMAL(10,2) NOT NULL,
    habitaciones INT NOT NULL,
    banos INT NOT NULL,
    medio_banos INT NOT NULL,
    pisos INT NOT NULL,
    ano_construccion INT NOT NULL,
    
    -- Características especiales
    tiene_garaje BOOLEAN DEFAULT FALSE,
    espacios_garaje INT DEFAULT 0,
    tiene_piscina BOOLEAN DEFAULT FALSE,
    tiene_jardin BOOLEAN DEFAULT FALSE,
    tiene_sotano BOOLEAN DEFAULT FALSE,
    tiene_atico BOOLEAN DEFAULT FALSE,
    tiene_terraza BOOLEAN DEFAULT FALSE,
    tiene_balcon BOOLEAN DEFAULT FALSE,
    
    -- Sistemas y servicios
    calefaccion VARCHAR(100),
    aire_acondicionado VARCHAR(100),
    tipo_agua VARCHAR(100),
    sistema_electrico VARCHAR(100),
    internet VARCHAR(100),
    sistema_seguridad VARCHAR(100),
    
    -- Información financiera
    valor_compra DECIMAL(12,2),
    valor_actual DECIMAL(12,2),
    valor_estimado DECIMAL(12,2),
    impuestos_prediales DECIMAL(10,2),
    seguro_anual DECIMAL(10,2),
    hoa_fee DECIMAL(8,2),
    servicios_publicos DECIMAL(8,2),
    
    -- Ubicación y entorno
    vecindario VARCHAR(200),
    colegios_cercanos JSON,
    transporte_publico TEXT,
    comercios_cercanos JSON,
    
    -- Estado y condición
    estado_general ENUM('excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_reparaciones') DEFAULT 'bueno',
    ultima_renovacion DATE,
    reparaciones_pendientes JSON,
    mejoras JSON,
    
    -- Información adicional
    descripcion TEXT,
    aspectos_positivos JSON,
    aspectos_negativos JSON,
    recuerdos_especiales JSON,
    
    -- Multimedia
    fotos JSON,
    documentos JSON,
    
    -- Metadata
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_twin_id (twin_id),
    INDEX idx_tipo (tipo),
    INDEX idx_es_principal (es_principal)
);
```

## Notas para el Desarrollador Backend

1. **Usar transacciones** para operaciones que afecten múltiples registros (ej: marcar como principal)
2. **Validar permisos** - solo el propietario puede modificar sus casas
3. **Logs de auditoría** para cambios importantes
4. **Backup automático** antes de eliminaciones
5. **Compresión de imágenes** para las fotos subidas
6. **Límites de archivos** para fotos y documentos
7. **Sanitización** de todos los inputs de texto
8. **Rate limiting** en endpoints de creación/modificación
