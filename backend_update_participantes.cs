// ACTUALIZACIÓN NECESARIA PARA EL BACKEND - AGREGAR PARTICIPANTES

// En el método donde se mapea CreateDiaryEntryRequest, agregar esta línea:

return new CreateDiaryEntryRequest
{
    Titulo = GetStringValue("titulo"),
    Descripcion = GetStringValue("descripcion"),
    Fecha = GetDateTimeValue("fecha"),
    TipoActividad = GetStringValue("tipoActividad"),
    LabelActividad = GetStringValue("labelActividad"),
    Ubicacion = GetStringValue("ubicacion"),
    Latitud = GetDoubleValue("latitud"),
    Longitud = GetDoubleValue("longitud"),
    Participantes = GetStringValue("participantes"), // ✅ AGREGAR ESTA LÍNEA
    EstadoEmocional = GetStringValue("estadoEmocional"),
    NivelEnergia = GetIntValue("nivelEnergia"),
    
    // ... resto de campos existentes
    
    // Archivo adjunto
    PathFile = GetStringValue("pathFile")
};

// TAMBIÉN ACTUALIZAR EL MODELO DiaryEntry EN LA BASE DE DATOS SI ES NECESARIO
// Agregar la propiedad Participantes al modelo que se guarda en Cosmos DB

public class DiaryEntry
{
    // ... campos existentes ...
    public string Participantes { get; set; } = string.Empty; // ✅ AGREGAR ESTA PROPIEDAD
    // ... resto de campos ...
}
