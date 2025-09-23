# Integración con Backend - Búsqueda Inteligente de Libros

## Endpoint del Backend

El modal de IA llama al siguiente endpoint para la búsqueda inteligente de libros:

```
GET /api/twins/searchbook/{twinId}/books?question={bookName}
```

### Parámetros
- **twinId**: Identificador único del twin del usuario
- **question**: Nombre del libro a buscar (URL encoded)

### Headers
```
Content-Type: application/json
```

## Respuesta Esperada

El backend debe retornar un objeto que coincida con la interface `BookAIResponse`:

```typescript
interface BookAIResponse {
  INFORMACIÓN_TÉCNICA: {
    Título_original: string;
    Título_en_español: string;
    Autor: string;
    Idioma_original: string;
    Primera_publicación: string;
    Editorial_principal: string;
    Páginas: string;
    Formatos: string[];
    Duración_audiolibro: string;
  };
  RESEÑAS_CRÍTICAS: {
    The_New_York_Times: {
      Lo_positivo: string;
      Lo_crítico: string;
      Conclusión: string;
    };
    The_Guardian: {
      Lo_positivo: string;
      Lo_crítico: string;
      Conclusión: string;
    };
    Reseñas_Académicas: {
      Recepción_mixta: string;
      Críticas_recurrentes: string;
      Evaluación: string;
    };
  };
  CONTENIDO_Y_TESIS_PRINCIPAL: {
    Idea_central: string;
    Tecnologías_clave: string[];
    Conceptos_principales: string[];
  };
  RECEPCIÓN_GENERAL: {
    Aspectos_elogiados: string[];
    Aspectos_criticados: string[];
    Recomendación: string;
  };
  INFORMACIÓN_PRÁCTICA: {
    Precio_orientativo: {
      Tapa_dura: string;
      Rústica: string;
      eBook: string;
    };
    Disponibilidad: string[];
    Público_recomendado: string;
    Traducciones: string;
  };
  detailHTMLReport: string;
}
```

## Flujo de Datos

1. **Usuario ingresa nombre del libro** en el modal IA
2. **Frontend obtiene twinId** usando `getCurrentTwinId()`
3. **Frontend hace llamada GET** a `/api/twins/searchbook/{twinId}/books?question={bookName}`
4. **Backend procesa la búsqueda** con IA y retorna datos estructurados
5. **Frontend mapea la respuesta** usando `mapBookAIResponseToBook()`
6. **Frontend muestra preview** de la información encontrada
7. **Usuario confirma** y el libro se agrega a la biblioteca

## Twin ID Management

### Desarrollo
- Se usa un valor por defecto: `'default-twin-id'`
- Se almacena en localStorage y sessionStorage

### Producción
Para integrar con el sistema de autenticación real, actualizar el hook `useTwinId`:

```typescript
// Ejemplo de integración con contexto de usuario
const userContext = useContext(UserContext);
if (userContext?.user?.twinId) {
  setTwinId(userContext.user.twinId);
  return;
}

// O llamada a API con token de autenticación
const response = await fetch('/api/user/twin-id', {
  headers: { Authorization: `Bearer ${authToken}` }
});
const { twinId } = await response.json();
```

## Manejo de Errores

El frontend maneja los siguientes casos de error:

- **Twin ID no disponible**: "No se pudo obtener el identificador del usuario"
- **Error HTTP**: Se muestra el status code y mensaje
- **Error de red**: "No se pudo obtener información del libro"
- **Libro no encontrado**: El usuario puede intentar con otro nombre

## Testing

Para probar la integración:

1. **Mock del endpoint**: Crear un mock que retorne datos de ejemplo
2. **Twin ID de prueba**: Usar el valor por defecto para desarrollo
3. **Casos de prueba**:
   - Libro encontrado exitosamente
   - Libro no encontrado (404)
   - Error de servidor (500)
   - Error de red
   - Twin ID inválido

## Ejemplo de Uso

```typescript
// El usuario ingresa "1984" en el modal
// Se hace la llamada:
GET /api/twins/searchbook/default-twin-id/books?question=1984

// Backend retorna datos estructurados
// Frontend muestra preview con:
// - Título: "1984"
// - Autor: "George Orwell"
// - Género: "Ciencia ficción"
// - Editorial: "Secker & Warburg"
// - Año: 1949
// - Descripción: "Novela distópica..."
```