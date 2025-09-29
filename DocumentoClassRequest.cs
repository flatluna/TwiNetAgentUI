using System;
using System.ComponentModel.DataAnnotations;

namespace TwinNetAgent.Models
{
    public class DocumentoClassRequest
    {
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; }

        [StringLength(1000)]
        public string? Descripcion { get; set; }

        [StringLength(2000)]
        public string? Notas { get; set; }

        public int? NumeroPaginas { get; set; }

        public bool TieneIndice { get; set; }

        public int? PaginaInicioIndice { get; set; }

        /// <summary>
        /// Campo para indicar en qué página termina el índice del documento
        /// </summary>
        public int? PaginaFInIndice { get; set; }

        [Required]
        [StringLength(255)]
        public string NombreArchivo { get; set; }

        [StringLength(100)]
        public string? TipoArchivo { get; set; }

        public long? TamanoArchivo { get; set; }
    }
}