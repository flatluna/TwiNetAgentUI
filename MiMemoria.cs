using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace TwinAgent.Models
{
    /// <summary>
    /// Modelo para las memorias digitales del usuario
    /// Representa los recuerdos, experiencias y momentos importantes guardados por el Twin
    /// </summary>
    public class MiMemoria
    {
        // === IDENTIFICACIÓN ===
        
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("partitionKey")]
        public string PartitionKey { get; set; } // twinId para particionado en CosmosDB

        [JsonProperty("twinId")]
        [Required]
        public string TwinId { get; set; }

        // === CONTENIDO PRINCIPAL ===
        
        [JsonProperty("titulo")]
        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }

        [JsonProperty("contenido")]
        [Required]
        public string Contenido { get; set; } // Rich text content (HTML)

        // === CLASIFICACIÓN ===
        
        [JsonProperty("categoria")]
        [Required]
        public string Categoria { get; set; } // 'personal', 'trabajo', 'familia', 'aprendizaje', 'ideas', 'viajes', 'otros'

        [JsonProperty("tipo")]
        [Required]
        public string Tipo { get; set; } // 'evento', 'nota', 'idea', 'logro', 'recordatorio'

        [JsonProperty("importancia")]
        [Required]
        public string Importancia { get; set; } // 'alta', 'media', 'baja'

        // === CONTEXTO TEMPORAL ===
        
        [JsonProperty("fecha")]
        [Required]
        public string Fecha { get; set; } // Fecha del evento/memoria (formato string como en el frontend)

        [JsonProperty("fechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [JsonProperty("fechaActualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        // === CONTEXTO SOCIAL Y GEOGRÁFICO ===
        
        [JsonProperty("ubicacion")]
        public string Ubicacion { get; set; }

        [JsonProperty("personas")]
        public List<string> Personas { get; set; } = new List<string>();

        // === ORGANIZACIÓN ===
        
        [JsonProperty("etiquetas")]
        public List<string> Etiquetas { get; set; } = new List<string>();

        // === MULTIMEDIA ===
        
        [JsonProperty("multimedia")]
        public List<string> Multimedia { get; set; } = new List<string>(); // URLs de archivos multimedia

        // === AUDITORÍA ===
        
        [JsonProperty("version")]
        public int Version { get; set; } = 1;

        // === MÉTODOS DE UTILIDAD ===

        /// <summary>
        /// Establece el PartitionKey basado en el TwinId
        /// </summary>
        public void SetPartitionKey()
        {
            PartitionKey = TwinId;
        }

        /// <summary>
        /// Actualiza la fecha de modificación y incrementa la versión
        /// </summary>
        public void UpdateVersion()
        {
            FechaActualizacion = DateTime.UtcNow;
            Version++;
        }

        /// <summary>
        /// Valida que la memoria tenga los campos requeridos
        /// </summary>
        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(TwinId) &&
                   !string.IsNullOrWhiteSpace(Titulo) &&
                   !string.IsNullOrWhiteSpace(Contenido) &&
                   !string.IsNullOrWhiteSpace(Categoria) &&
                   !string.IsNullOrWhiteSpace(Tipo) &&
                   !string.IsNullOrWhiteSpace(Importancia) &&
                   !string.IsNullOrWhiteSpace(Fecha);
        }

        /// <summary>
        /// Obtiene el nivel de importancia como número para ordenamiento
        /// </summary>
        public int GetImportanciaNumero()
        {
            return Importancia switch
            {
                "alta" => 3,
                "media" => 2,
                "baja" => 1,
                _ => 0
            };
        }

        /// <summary>
        /// Convierte la fecha string a DateTime si es posible
        /// </summary>
        public DateTime? GetFechaDateTime()
        {
            if (DateTime.TryParse(Fecha, out var resultado))
            {
                return resultado;
            }
            return null;
        }
    }

    /// <summary>
    /// DTO para crear una nueva memoria
    /// </summary>
    public class CreateMemoriaRequest
    {
        [Required]
        public string TwinId { get; set; }

        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }

        [Required]
        public string Contenido { get; set; }

        [Required]
        public string Categoria { get; set; }

        [Required]
        public string Tipo { get; set; }

        [Required]
        public string Importancia { get; set; }

        [Required]
        public string Fecha { get; set; }

        public string Ubicacion { get; set; }

        public List<string> Personas { get; set; } = new List<string>();

        public List<string> Etiquetas { get; set; } = new List<string>();

        public List<string> Multimedia { get; set; } = new List<string>();

        /// <summary>
        /// Convierte el DTO a la entidad MiMemoria
        /// </summary>
        public MiMemoria ToEntity()
        {
            var memoria = new MiMemoria
            {
                TwinId = this.TwinId,
                Titulo = this.Titulo,
                Contenido = this.Contenido,
                Categoria = this.Categoria,
                Tipo = this.Tipo,
                Importancia = this.Importancia,
                Fecha = this.Fecha,
                Ubicacion = this.Ubicacion,
                Personas = this.Personas ?? new List<string>(),
                Etiquetas = this.Etiquetas ?? new List<string>(),
                Multimedia = this.Multimedia ?? new List<string>()
            };

            memoria.SetPartitionKey();
            return memoria;
        }
    }

    /// <summary>
    /// DTO para actualizar una memoria existente
    /// </summary>
    public class UpdateMemoriaRequest
    {
        [Required]
        public string Id { get; set; }

        [StringLength(200)]
        public string Titulo { get; set; }

        public string Contenido { get; set; }

        public string Categoria { get; set; }

        public string Tipo { get; set; }

        public string Importancia { get; set; }

        public string Fecha { get; set; }

        public string Ubicacion { get; set; }

        public List<string> Personas { get; set; }

        public List<string> Etiquetas { get; set; }

        public List<string> Multimedia { get; set; }

        /// <summary>
        /// Aplica los cambios a una memoria existente
        /// </summary>
        public void ApplyChanges(MiMemoria memoria)
        {
            if (!string.IsNullOrWhiteSpace(Titulo))
                memoria.Titulo = Titulo;

            if (!string.IsNullOrWhiteSpace(Contenido))
                memoria.Contenido = Contenido;

            if (!string.IsNullOrWhiteSpace(Categoria))
                memoria.Categoria = Categoria;

            if (!string.IsNullOrWhiteSpace(Tipo))
                memoria.Tipo = Tipo;

            if (!string.IsNullOrWhiteSpace(Importancia))
                memoria.Importancia = Importancia;

            if (!string.IsNullOrWhiteSpace(Fecha))
                memoria.Fecha = Fecha;

            if (!string.IsNullOrWhiteSpace(Ubicacion))
                memoria.Ubicacion = Ubicacion;

            if (Personas != null)
                memoria.Personas = Personas;

            if (Etiquetas != null)
                memoria.Etiquetas = Etiquetas;

            if (Multimedia != null)
                memoria.Multimedia = Multimedia;

            memoria.UpdateVersion();
        }
    }

    /// <summary>
    /// Filtros para consultar memorias
    /// </summary>
    public class MemoriaFilter
    {
        [Required]
        public string TwinId { get; set; }

        public string Categoria { get; set; }

        public string Tipo { get; set; }

        public string Importancia { get; set; }

        public string TextoBusqueda { get; set; }

        public DateTime? FechaDesde { get; set; }

        public DateTime? FechaHasta { get; set; }

        public List<string> Etiquetas { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Valida que el filtro tenga al menos el TwinId
        /// </summary>
        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(TwinId);
        }
    }

    /// <summary>
    /// Resultado paginado de memorias
    /// </summary>
    public class MemoriaPagedResult
    {
        public List<MiMemoria> Items { get; set; } = new List<MiMemoria>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }

    /// <summary>
    /// Respuesta estándar para operaciones con memorias
    /// </summary>
    public class MemoriaResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public MiMemoria Data { get; set; }
        public string Id { get; set; }

        public static MemoriaResponse Success(MiMemoria memoria, string message = "Operación exitosa")
        {
            return new MemoriaResponse
            {
                Success = true,
                Message = message,
                Data = memoria,
                Id = memoria?.Id
            };
        }

        public static MemoriaResponse Error(string message)
        {
            return new MemoriaResponse
            {
                Success = false,
                Message = message
            };
        }
    }

    /// <summary>
    /// Estadísticas de memorias para dashboard
    /// </summary>
    public class MemoriaStats
    {
        public string TwinId { get; set; }
        public int TotalMemorias { get; set; }
        public int MemoriasEsteMes { get; set; }
        public int CategoriasUnicas { get; set; }
        public int MemoriasImportantes { get; set; }
        public Dictionary<string, int> MemoriasPorCategoria { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> MemoriasPorTipo { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> MemoriasPorImportancia { get; set; } = new Dictionary<string, int>();
        public DateTime? UltimaMemoria { get; set; }
        public List<string> EtiquetasMasUsadas { get; set; } = new List<string>();
    }
}