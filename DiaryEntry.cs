using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace TwinAgent.Models
{
    /// <summary>
    /// Entrada del diario personal con campos dinámicos y archivos adjuntos
    /// </summary>
    public class DiaryEntry
    {
        // === CAMPOS FIJOS (Estructura base) ===
        
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("partitionKey")]
        public string PartitionKey { get; set; } // userId para particionado en CosmosDB

        [JsonProperty("userId")]
        [Required]
        public string UserId { get; set; }

        // === METADATOS ===
        
        [JsonProperty("fecha")]
        [Required]
        public DateTime Fecha { get; set; }

        [JsonProperty("titulo")]
        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }

        [JsonProperty("descripcion")]
        public string Descripcion { get; set; } // Rich text content (HTML)

        // === ACTIVIDAD ===
        
        [JsonProperty("tipoActividad")]
        [Required]
        public string TipoActividad { get; set; } // 'compras', 'comida', 'viaje', etc.

        [JsonProperty("labelActividad")]
        [Required]
        public string LabelActividad { get; set; } // "Compras", "Comida/Restaurante", etc.

        // === UBICACIÓN ===
        
        [JsonProperty("ubicacion")]
        public string Ubicacion { get; set; }

        [JsonProperty("coordenadas")]
        public Coordenadas Coordenadas { get; set; }

        // === ESTADO EMOCIONAL ===
        
        [JsonProperty("estadoEmocional")]
        public string EstadoEmocional { get; set; }

        [JsonProperty("nivelEnergia")]
        [Range(1, 5)]
        public int? NivelEnergia { get; set; } // 1-5

        // === CAMPOS DINÁMICOS (FLEXIBLE) ===
        
        [JsonProperty("camposExtra")]
        public Dictionary<string, object> CamposExtra { get; set; } = new Dictionary<string, object>();

        // === ARCHIVOS ADJUNTOS ===
        
        [JsonProperty("archivos")]
        public List<FileAttachment> Archivos { get; set; } = new List<FileAttachment>();

        // === AUDITORÍA ===
        
        [JsonProperty("fechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [JsonProperty("fechaModificacion")]
        public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;

        [JsonProperty("version")]
        public int Version { get; set; } = 1;

        // === MÉTODOS DE UTILIDAD ===

        /// <summary>
        /// Establece el PartitionKey basado en el UserId
        /// </summary>
        public void SetPartitionKey()
        {
            PartitionKey = UserId;
        }

        /// <summary>
        /// Actualiza la fecha de modificación y incrementa la versión
        /// </summary>
        public void UpdateVersion()
        {
            FechaModificacion = DateTime.UtcNow;
            Version++;
        }

        /// <summary>
        /// Obtiene un campo extra de forma tipada
        /// </summary>
        public T GetCampoExtra<T>(string nombreCampo, T defaultValue = default(T))
        {
            if (CamposExtra.TryGetValue(nombreCampo, out var valor))
            {
                try
                {
                    if (valor is T directValue)
                        return directValue;
                    
                    return (T)Convert.ChangeType(valor, typeof(T));
                }
                catch
                {
                    return defaultValue;
                }
            }
            return defaultValue;
        }

        /// <summary>
        /// Establece un campo extra
        /// </summary>
        public void SetCampoExtra(string nombreCampo, object valor)
        {
            CamposExtra[nombreCampo] = valor;
        }

        /// <summary>
        /// Obtiene el gasto total si existe en los campos extra
        /// </summary>
        public decimal? GetGastoTotal()
        {
            var gastoCampos = new[] { "gasto_total", "costo_comida", "costo_viaje", 
                                    "costo_entretenimiento", "costo_ejercicio", 
                                    "costo_estudio", "costo_salud" };

            foreach (var campo in gastoCampos)
            {
                var gasto = GetCampoExtra<decimal?>(campo);
                if (gasto.HasValue && gasto.Value > 0)
                    return gasto.Value;
            }
            return null;
        }

        /// <summary>
        /// Obtiene todos los archivos de un tipo específico
        /// </summary>
        public List<FileAttachment> GetArchivosPorTipo(TipoArchivo tipo)
        {
            return Archivos.FindAll(a => a.Tipo == tipo);
        }
    }

    /// <summary>
    /// Coordenadas geográficas
    /// </summary>
    public class Coordenadas
    {
        [JsonProperty("lat")]
        [Range(-90, 90)]
        public double Lat { get; set; }

        [JsonProperty("lng")]
        [Range(-180, 180)]
        public double Lng { get; set; }
    }

    /// <summary>
    /// Archivo adjunto a una entrada del diario
    /// </summary>
    public class FileAttachment
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("nombre")]
        [Required]
        public string Nombre { get; set; }

        [JsonProperty("tipo")]
        public TipoArchivo Tipo { get; set; }

        [JsonProperty("mimeType")]
        public string MimeType { get; set; }

        [JsonProperty("url")]
        public string Url { get; set; } // URL en Azure Blob Storage

        [JsonProperty("tamaño")]
        public long Tamaño { get; set; } // bytes

        [JsonProperty("fechaSubida")]
        public DateTime FechaSubida { get; set; } = DateTime.UtcNow;

        [JsonProperty("descripcion")]
        public string Descripcion { get; set; }

        /// <summary>
        /// Obtiene el tamaño en formato legible
        /// </summary>
        public string GetTamañoLegible()
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = Tamaño;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }

    /// <summary>
    /// Tipos de archivos que se pueden adjuntar
    /// </summary>
    public enum TipoArchivo
    {
        Recibo,
        Foto,
        Documento,
        Factura,
        Ticket,
        Certificado,
        Otro
    }

    /// <summary>
    /// DTO para crear una nueva entrada de diario
    /// </summary>
    public class CreateDiaryEntryDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }

        public string Descripcion { get; set; }

        [Required]
        public string TipoActividad { get; set; }

        [Required]
        public string LabelActividad { get; set; }

        public string Ubicacion { get; set; }
        public Coordenadas Coordenadas { get; set; }
        public string EstadoEmocional { get; set; }
        
        [Range(1, 5)]
        public int? NivelEnergia { get; set; }

        public Dictionary<string, object> CamposExtra { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// DTO para actualizar una entrada de diario
    /// </summary>
    public class UpdateDiaryEntryDto
    {
        [Required]
        public string Id { get; set; }

        [StringLength(200)]
        public string Titulo { get; set; }

        public string Descripcion { get; set; }
        public string Ubicacion { get; set; }
        public Coordenadas Coordenadas { get; set; }
        public string EstadoEmocional { get; set; }
        
        [Range(1, 5)]
        public int? NivelEnergia { get; set; }

        public Dictionary<string, object> CamposExtra { get; set; }
    }

    /// <summary>
    /// Filtros para consultar entradas del diario
    /// </summary>
    public class DiaryEntryFilter
    {
        public string UserId { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public string TipoActividad { get; set; }
        public string TextoBusqueda { get; set; }
        public bool? TieneArchivos { get; set; }
        public bool? TieneGastos { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    /// <summary>
    /// Resultado paginado de entradas del diario
    /// </summary>
    public class DiaryEntryPagedResult
    {
        public List<DiaryEntry> Items { get; set; } = new List<DiaryEntry>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}
