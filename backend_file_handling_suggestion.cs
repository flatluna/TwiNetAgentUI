// MODIFICACIÓN SUGERIDA PARA EL BACKEND

// En lugar de buscar solo "file", "receipt" o "recibo", 
// buscar todos los campos que terminen en "_recibo" o contengan "recibo"

var fileparts = parts.Where(p => 
    p.Name != null && 
    (p.Name.Contains("recibo") || 
     p.Name.EndsWith("_recibo") || 
     p.Name.StartsWith("recibo_")) &&
    p.Data != null && 
    p.Data.Length > 0
).ToList();

if (fileparts.Any())
{
    _logger.LogInformation("📄 {Count} archivo(s) detectado(s) en multipart data", fileparts.Count);
    
    foreach (var filePart in fileparts)
    {
        _logger.LogInformation("📎 Archivo: {FieldName} -> {FileName}, Size: {Size} bytes", 
            filePart.Name, filePart.FileName, filePart.Data.Length);
        
        // Validar archivo
        if (!IsValidReceiptFile(filePart.FileName ?? "file", filePart.Data))
        {
            return await CreateErrorResponse(req, $"Invalid file format for {filePart.Name}. Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed", HttpStatusCode.BadRequest);
        }
    }
}

// Ejemplos de nombres de campo que llegará desde el frontend:
// - recibo_compra
// - recibo_comida  
// - recibo_viaje
// - recibo_entretenimiento
// - recibo_ejercicio
// - recibo_estudio
// - recibo_salud
