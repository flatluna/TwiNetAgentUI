using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TwinNetAgentUI.Models
{
    /// <summary>
    /// Entrada del diario personal con campos dinámicos por tipo de actividad
    /// </summary>
    public class DiaryEntry
    {
        // === CAMPOS BÁSICOS ===
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public DateTime Fecha { get; set; } = DateTime.Now;
        
        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }
        
        [Required]
        public string Descripcion { get; set; } // Rich text content
        
        // === ACTIVIDAD ===
        [Required]
        public string TipoActividad { get; set; } // 'compras', 'comida', 'viaje', etc.
        
        public string LabelActividad { get; set; } // "Compras", "Comida/Restaurante", etc.
        
        // === UBICACIÓN ===
        public string Ubicacion { get; set; }
        
        public double? Latitud { get; set; }
        
        public double? Longitud { get; set; }
        
        // === ESTADO EMOCIONAL ===
        public string EstadoEmocional { get; set; }
        
        [Range(1, 5)]
        public int? NivelEnergia { get; set; }
        
        // === CAMPOS ESPECÍFICOS POR ACTIVIDAD ===
        
        // COMPRAS
        public string ProductosComprados { get; set; }
        public string TiendaLugar { get; set; }
        public decimal? GastoTotal { get; set; }
        public string MetodoPago { get; set; }
        public string CategoriaCompra { get; set; }
        public string ReciboCompra { get; set; } // URL del archivo
        public int? SatisfaccionCompra { get; set; }
        
        // COMIDA
        public string RestauranteLugar { get; set; }
        public string TipoCocina { get; set; }
        public string PlatosOrdenados { get; set; }
        public decimal? CostoComida { get; set; }
        public string ReciboComida { get; set; } // URL del archivo
        public int? CalificacionComida { get; set; }
        public string AmbienteComida { get; set; }
        public string RecomendariaComida { get; set; }
        
        // VIAJE
        public string DestinoViaje { get; set; }
        public string TransporteViaje { get; set; }
        public string PropositoViaje { get; set; }
        public decimal? CostoViaje { get; set; }
        public string ReciboViaje { get; set; } // URL del archivo
        public string DuracionViaje { get; set; }
        public int? CalificacionViaje { get; set; }
        
        // ENTRETENIMIENTO
        public string TipoEntretenimiento { get; set; }
        public string TituloNombre { get; set; }
        public string LugarEntretenimiento { get; set; }
        public decimal? CostoEntretenimiento { get; set; }
        public string ReciboEntretenimiento { get; set; } // URL del archivo
        public int? CalificacionEntretenimiento { get; set; }
        public string RecomendacionEntretenimiento { get; set; }
        
        // EJERCICIO
        public string TipoEjercicio { get; set; }
        public string DuracionEjercicio { get; set; }
        public string IntensidadEjercicio { get; set; }
        public string LugarEjercicio { get; set; }
        public decimal? CostoEjercicio { get; set; }
        public string ReciboEjercicio { get; set; } // URL del archivo
        public int? CaloriasQuemadas { get; set; }
        public string RutinaEspecifica { get; set; }
        public int? EnergiaPostEjercicio { get; set; }
        
        // ESTUDIO
        public string MateriaTema { get; set; }
        public string MaterialEstudio { get; set; }
        public string DuracionEstudio { get; set; }
        public decimal? CostoEstudio { get; set; }
        public string ReciboEstudio { get; set; } // URL del archivo
        public string ProgresoEstudio { get; set; }
        public int? DificultadEstudio { get; set; }
        
        // SALUD/MEDICINA
        public string TipoConsulta { get; set; }
        public string ProfesionalCentro { get; set; }
        public string MotivoConsulta { get; set; }
        public string TratamientoRecetado { get; set; }
        public decimal? CostoSalud { get; set; }
        public string ReciboSalud { get; set; } // URL del archivo
        public string ProximaCita { get; set; }
        public int? EstadoAnimoPost { get; set; }
        
        // LLAMADA
        public string ContactoLlamada { get; set; }
        public string DuracionLlamada { get; set; }
        public string MotivoLlamada { get; set; }
        public string TemasConversacion { get; set; }
        public string TipoLlamada { get; set; }
        public string SeguimientoLlamada { get; set; }
        
        // TRABAJO
        public string ProyectoPrincipal { get; set; }
        public int? HorasTrabajadas { get; set; }
        public string ReunionesTrabajo { get; set; }
        public string LogrosHoy { get; set; }
        public string DesafiosTrabajo { get; set; }
        public string MoodTrabajo { get; set; }
        
        // === ARCHIVOS ADICIONALES ===
        public string FotoAdicional1 { get; set; }
        public string FotoAdicional2 { get; set; }
        public string FotoAdicional3 { get; set; }
        public string DocumentoAdicional { get; set; }
        
        // === AUDITORÍA ===
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        
        public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;
        
        public int Version { get; set; } = 1;
        
        public bool Eliminado { get; set; } = false;
        
        public string CreadoPor { get; set; }
        
        public string ModificadoPor { get; set; }
    }

    /// <summary>
    /// DTO para crear/actualizar entradas del diario
    /// </summary>
    public class DiaryEntryRequest
    {
        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }
        
        [Required]
        public string Descripcion { get; set; }
        
        [Required]
        public string TipoActividad { get; set; }
        
        public string LabelActividad { get; set; }
        
        public DateTime? Fecha { get; set; }
        
        public string Ubicacion { get; set; }
        
        public double? Latitud { get; set; }
        
        public double? Longitud { get; set; }
        
        public string EstadoEmocional { get; set; }
        
        [Range(1, 5)]
        public int? NivelEnergia { get; set; }
        
        // COMPRAS
        public string ProductosComprados { get; set; }
        public string TiendaLugar { get; set; }
        public decimal? GastoTotal { get; set; }
        public string MetodoPago { get; set; }
        public string CategoriaCompra { get; set; }
        public int? SatisfaccionCompra { get; set; }
        
        // COMIDA
        public string RestauranteLugar { get; set; }
        public string TipoCocina { get; set; }
        public string PlatosOrdenados { get; set; }
        public decimal? CostoComida { get; set; }
        public int? CalificacionComida { get; set; }
        public string AmbienteComida { get; set; }
        public string RecomendariaComida { get; set; }
        
        // VIAJE
        public string DestinoViaje { get; set; }
        public string TransporteViaje { get; set; }
        public string PropositoViaje { get; set; }
        public decimal? CostoViaje { get; set; }
        public string DuracionViaje { get; set; }
        public int? CalificacionViaje { get; set; }
        
        // ENTRETENIMIENTO
        public string TipoEntretenimiento { get; set; }
        public string TituloNombre { get; set; }
        public string LugarEntretenimiento { get; set; }
        public decimal? CostoEntretenimiento { get; set; }
        public int? CalificacionEntretenimiento { get; set; }
        public string RecomendacionEntretenimiento { get; set; }
        
        // EJERCICIO
        public string TipoEjercicio { get; set; }
        public string DuracionEjercicio { get; set; }
        public string IntensidadEjercicio { get; set; }
        public string LugarEjercicio { get; set; }
        public decimal? CostoEjercicio { get; set; }
        public int? CaloriasQuemadas { get; set; }
        public string RutinaEspecifica { get; set; }
        public int? EnergiaPostEjercicio { get; set; }
        
        // ESTUDIO
        public string MateriaTema { get; set; }
        public string MaterialEstudio { get; set; }
        public string DuracionEstudio { get; set; }
        public decimal? CostoEstudio { get; set; }
        public string ProgresoEstudio { get; set; }
        public int? DificultadEstudio { get; set; }
        
        // SALUD
        public string TipoConsulta { get; set; }
        public string ProfesionalCentro { get; set; }
        public string MotivoConsulta { get; set; }
        public string TratamientoRecetado { get; set; }
        public decimal? CostoSalud { get; set; }
        public string ProximaCita { get; set; }
        public int? EstadoAnimoPost { get; set; }
        
        // LLAMADA
        public string ContactoLlamada { get; set; }
        public string DuracionLlamada { get; set; }
        public string MotivoLlamada { get; set; }
        public string TemasConversacion { get; set; }
        public string TipoLlamada { get; set; }
        public string SeguimientoLlamada { get; set; }
        
        // TRABAJO
        public string ProyectoPrincipal { get; set; }
        public int? HorasTrabajadas { get; set; }
        public string ReunionesTrabajo { get; set; }
        public string LogrosHoy { get; set; }
        public string DesafiosTrabajo { get; set; }
        public string MoodTrabajo { get; set; }
    }

    /// <summary>
    /// Response model para entradas del diario
    /// </summary>
    public class DiaryEntryResponse
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public DateTime Fecha { get; set; }
        public string Titulo { get; set; }
        public string Descripcion { get; set; }
        public string TipoActividad { get; set; }
        public string LabelActividad { get; set; }
        public string Ubicacion { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public string EstadoEmocional { get; set; }
        public int? NivelEnergia { get; set; }
        
        // URLs de archivos
        public List<string> ArchivosAdjuntos { get; set; } = new List<string>();
        
        // Campos dinámicos según el tipo de actividad
        public Dictionary<string, object> CamposActividad { get; set; } = new Dictionary<string, object>();
        
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaModificacion { get; set; }
        public int Version { get; set; }
    }
}
