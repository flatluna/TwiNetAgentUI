// Models/Casa.cs
using System.ComponentModel.DataAnnotations;

namespace TwinAgentAPI.Models
{
    public class Casa
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string TwinId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Nombre { get; set; }
        
        [Required]
        public string Direccion { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Ciudad { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Estado { get; set; }
        
        [Required]
        [StringLength(20)]
        public string CodigoPostal { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Pais { get; set; }
        
        [Required]
        public TipoCasa Tipo { get; set; }
        
        [Required]
        public TipoPropiedad TipoPropiedad { get; set; }
        
        // Fechas
        public DateTime? FechaCompra { get; set; }
        public DateTime? FechaVenta { get; set; }
        
        [Required]
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        
        // Características físicas
        [Required]
        [Range(0.1, double.MaxValue)]
        public decimal AreaTotal { get; set; }
        
        [Required]
        [Range(0.1, double.MaxValue)]
        public decimal AreaConstruida { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal AreaTerreno { get; set; }
        
        [Required]
        [Range(0, 50)]
        public int Habitaciones { get; set; }
        
        [Required]
        [Range(0, 20)]
        public int Banos { get; set; }
        
        [Range(0, 10)]
        public int MedioBanos { get; set; }
        
        [Required]
        [Range(1, 10)]
        public int Pisos { get; set; }
        
        [Required]
        [Range(1800, 2030)]
        public int AnoConstructorcion { get; set; }
        
        // Características especiales
        public bool TieneGaraje { get; set; } = false;
        
        [Range(0, 10)]
        public int EspaciosGaraje { get; set; } = 0;
        
        public bool TienePiscina { get; set; } = false;
        public bool TieneJardin { get; set; } = false;
        public bool TieneSotano { get; set; } = false;
        public bool TieneAtico { get; set; } = false;
        public bool TieneTerraza { get; set; } = false;
        public bool TieneBalcon { get; set; } = false;
        
        // Sistemas y servicios
        [StringLength(100)]
        public string? Calefaccion { get; set; }
        
        [StringLength(100)]
        public string? AireAcondicionado { get; set; }
        
        [StringLength(100)]
        public string? TipoAgua { get; set; }
        
        [StringLength(100)]
        public string? SistemaElectrico { get; set; }
        
        [StringLength(100)]
        public string? Internet { get; set; }
        
        [StringLength(100)]
        public string? SistemaSeguridad { get; set; }
        
        // Información financiera
        [Range(0, double.MaxValue)]
        public decimal? ValorCompra { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ValorActual { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ValorEstimado { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ImpuestosPrediales { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? SeguroAnual { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? HoaFee { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ServiciosPublicos { get; set; }
        
        // Ubicación y entorno
        [StringLength(200)]
        public string? Vecindario { get; set; }
        
        public List<string> ColegiosCercanos { get; set; } = new List<string>();
        
        public string? TransportePublico { get; set; }
        
        public List<string> ComerciosCercanos { get; set; } = new List<string>();
        
        // Estado y condición
        public EstadoGeneral EstadoGeneral { get; set; } = EstadoGeneral.Bueno;
        
        public DateTime? UltimaRenovacion { get; set; }
        
        public List<string> ReparacionesPendientes { get; set; } = new List<string>();
        
        public List<string> Mejoras { get; set; } = new List<string>();
        
        // Información adicional
        public string? Descripcion { get; set; }
        
        public List<string> AspectosPositivos { get; set; } = new List<string>();
        
        public List<string> AspectosNegativos { get; set; } = new List<string>();
        
        public List<string> RecuerdosEspeciales { get; set; } = new List<string>();
        
        // Multimedia
        public List<string> Fotos { get; set; } = new List<string>();
        
        public List<string> Documentos { get; set; } = new List<string>();
        
        // Metadata
        public bool EsPrincipal { get; set; } = false;
        
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        
        public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;
    }
    
    public enum TipoCasa
    {
        Actual,
        Pasado,
        Inversion,
        Vacacional
    }
    
    public enum TipoPropiedad
    {
        Casa,
        Apartamento,
        Condominio,
        Townhouse,
        Duplex,
        Mansion,
        Cabana,
        Otro
    }
    
    public enum EstadoGeneral
    {
        Excelente,
        MuyBueno,
        Bueno,
        Regular,
        NecesitaReparaciones
    }
}

// DTOs/CreateCasaRequest.cs
using System.ComponentModel.DataAnnotations;
using TwinAgentAPI.Models;

namespace TwinAgentAPI.DTOs
{
    public class CreateCasaRequest
    {
        [Required]
        public string TwinId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Nombre { get; set; }
        
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string Direccion { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Ciudad { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Estado { get; set; }
        
        [Required]
        [StringLength(20, MinimumLength = 1)]
        public string CodigoPostal { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Pais { get; set; }
        
        [Required]
        public string Tipo { get; set; } // Se validará que sea válido en el controller
        
        [Required]
        public string TipoPropiedad { get; set; } // Se validará que sea válido en el controller
        
        // Fechas
        public DateTime? FechaCompra { get; set; }
        public DateTime? FechaVenta { get; set; }
        
        [Required]
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        
        // Características físicas
        [Required]
        [Range(0.1, double.MaxValue, ErrorMessage = "El área total debe ser mayor a 0")]
        public decimal AreaTotal { get; set; }
        
        [Required]
        [Range(0.1, double.MaxValue, ErrorMessage = "El área construida debe ser mayor a 0")]
        public decimal AreaConstruida { get; set; }
        
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "El área del terreno debe ser mayor o igual a 0")]
        public decimal AreaTerreno { get; set; }
        
        [Required]
        [Range(0, 50, ErrorMessage = "El número de habitaciones debe estar entre 0 y 50")]
        public int Habitaciones { get; set; }
        
        [Required]
        [Range(0, 20, ErrorMessage = "El número de baños debe estar entre 0 y 20")]
        public int Banos { get; set; }
        
        [Range(0, 10, ErrorMessage = "El número de medios baños debe estar entre 0 y 10")]
        public int MedioBanos { get; set; }
        
        [Required]
        [Range(1, 10, ErrorMessage = "El número de pisos debe estar entre 1 y 10")]
        public int Pisos { get; set; }
        
        [Required]
        [Range(1800, 2030, ErrorMessage = "El año de construcción debe estar entre 1800 y 2030")]
        public int AnoConstructorcion { get; set; }
        
        // Características especiales
        public bool TieneGaraje { get; set; } = false;
        
        [Range(0, 10)]
        public int EspaciosGaraje { get; set; } = 0;
        
        public bool TienePiscina { get; set; } = false;
        public bool TieneJardin { get; set; } = false;
        public bool TieneSotano { get; set; } = false;
        public bool TieneAtico { get; set; } = false;
        public bool TieneTerraza { get; set; } = false;
        public bool TieneBalcon { get; set; } = false;
        
        // Sistemas y servicios
        [StringLength(100)]
        public string? Calefaccion { get; set; }
        
        [StringLength(100)]
        public string? AireAcondicionado { get; set; }
        
        [StringLength(100)]
        public string? TipoAgua { get; set; }
        
        [StringLength(100)]
        public string? SistemaElectrico { get; set; }
        
        [StringLength(100)]
        public string? Internet { get; set; }
        
        [StringLength(100)]
        public string? SistemaSeguridad { get; set; }
        
        // Información financiera
        [Range(0, double.MaxValue)]
        public decimal? ValorCompra { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ValorActual { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ValorEstimado { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ImpuestosPrediales { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? SeguroAnual { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? HoaFee { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? ServiciosPublicos { get; set; }
        
        // Ubicación y entorno
        [StringLength(200)]
        public string? Vecindario { get; set; }
        
        public List<string> ColegiosCercanos { get; set; } = new List<string>();
        
        public string? TransportePublico { get; set; }
        
        public List<string> ComerciosCercanos { get; set; } = new List<string>();
        
        // Estado y condición
        public string EstadoGeneral { get; set; } = "bueno";
        
        public DateTime? UltimaRenovacion { get; set; }
        
        public List<string> ReparacionesPendientes { get; set; } = new List<string>();
        
        public List<string> Mejoras { get; set; } = new List<string>();
        
        // Información adicional
        public string? Descripcion { get; set; }
        
        public List<string> AspectosPositivos { get; set; } = new List<string>();
        
        public List<string> AspectosNegativos { get; set; } = new List<string>();
        
        public List<string> RecuerdosEspeciales { get; set; } = new List<string>();
        
        // Multimedia
        public List<string> Fotos { get; set; } = new List<string>();
        
        public List<string> Documentos { get; set; } = new List<string>();
        
        // Metadata
        public bool EsPrincipal { get; set; } = false;
    }
}

// Controllers/CasasController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TwinAgentAPI.Models;
using TwinAgentAPI.DTOs;
using TwinAgentAPI.Services;

namespace TwinAgentAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CasasController : ControllerBase
    {
        private readonly ICasaService _casaService;
        private readonly ILogger<CasasController> _logger;

        public CasasController(ICasaService casaService, ILogger<CasasController> logger)
        {
            _casaService = casaService;
            _logger = logger;
        }

        /// <summary>
        /// Crear una nueva casa/propiedad
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCasa([FromBody] CreateCasaRequest request)
        {
            try
            {
                // Validar modelo
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "VALIDATION_ERROR",
                            message = "Campos requeridos faltantes o inválidos",
                            details = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                            )
                        }
                    });
                }

                // Validar enums personalizados
                if (!IsValidTipoCasa(request.Tipo))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "INVALID_TIPO",
                            message = "Tipo de casa inválido. Valores permitidos: actual, pasado, inversion, vacacional"
                        }
                    });
                }

                if (!IsValidTipoPropiedad(request.TipoPropiedad))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "INVALID_TIPO_PROPIEDAD",
                            message = "Tipo de propiedad inválido. Valores permitidos: casa, apartamento, condominio, townhouse, duplex, mansion, cabana, otro"
                        }
                    });
                }

                if (!IsValidEstadoGeneral(request.EstadoGeneral))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "INVALID_ESTADO",
                            message = "Estado general inválido. Valores permitidos: excelente, muy_bueno, bueno, regular, necesita_reparaciones"
                        }
                    });
                }

                // Validaciones de negocio
                var validationErrors = await ValidateBusinessRules(request);
                if (validationErrors.Any())
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "BUSINESS_VALIDATION_ERROR",
                            message = "Errores de validación de negocio",
                            details = validationErrors
                        }
                    });
                }

                // Crear la casa
                var casa = await _casaService.CreateCasaAsync(request);

                _logger.LogInformation($"Casa creada exitosamente: {casa.Id} para twin: {casa.TwinId}");

                return CreatedAtAction(nameof(GetCasa), new { id = casa.Id }, new
                {
                    success = true,
                    data = casa,
                    message = "Casa creada exitosamente"
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Error de validación al crear casa: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = new
                    {
                        code = "VALIDATION_ERROR",
                        message = ex.Message
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Error de operación al crear casa: {ex.Message}");
                return Conflict(new
                {
                    success = false,
                    error = new
                    {
                        code = "OPERATION_ERROR",
                        message = ex.Message
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear casa");
                return StatusCode(500, new
                {
                    success = false,
                    error = new
                    {
                        code = "INTERNAL_ERROR",
                        message = "Error interno del servidor"
                    }
                });
            }
        }

        /// <summary>
        /// Obtener todas las casas de un twin
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCasas([FromQuery] string twinId)
        {
            try
            {
                if (string.IsNullOrEmpty(twinId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = new
                        {
                            code = "MISSING_TWIN_ID",
                            message = "El twinId es requerido"
                        }
                    });
                }

                var casas = await _casaService.GetCasasByTwinIdAsync(twinId);

                return Ok(new
                {
                    success = true,
                    data = casas,
                    total = casas.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener casas para twin: {twinId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = new
                    {
                        code = "INTERNAL_ERROR",
                        message = "Error interno del servidor"
                    }
                });
            }
        }

        /// <summary>
        /// Obtener una casa específica
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCasa(string id)
        {
            try
            {
                var casa = await _casaService.GetCasaByIdAsync(id);

                if (casa == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        error = new
                        {
                            code = "CASA_NOT_FOUND",
                            message = "Casa no encontrada"
                        }
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = casa
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener casa: {id}");
                return StatusCode(500, new
                {
                    success = false,
                    error = new
                    {
                        code = "INTERNAL_ERROR",
                        message = "Error interno del servidor"
                    }
                });
            }
        }

        // Métodos de validación privados
        private bool IsValidTipoCasa(string tipo)
        {
            return new[] { "actual", "pasado", "inversion", "vacacional" }.Contains(tipo.ToLower());
        }

        private bool IsValidTipoPropiedad(string tipoPropiedad)
        {
            return new[] { "casa", "apartamento", "condominio", "townhouse", "duplex", "mansion", "cabana", "otro" }
                .Contains(tipoPropiedad.ToLower());
        }

        private bool IsValidEstadoGeneral(string estado)
        {
            return new[] { "excelente", "muy_bueno", "bueno", "regular", "necesita_reparaciones" }
                .Contains(estado.ToLower());
        }

        private async Task<List<string>> ValidateBusinessRules(CreateCasaRequest request)
        {
            var errors = new List<string>();

            // Validar que si tiene garaje, debe tener espacios
            if (request.TieneGaraje && request.EspaciosGaraje == 0)
            {
                errors.Add("Si tiene garaje, debe especificar el número de espacios");
            }

            // Validar que si no tiene garaje, no debe tener espacios
            if (!request.TieneGaraje && request.EspaciosGaraje > 0)
            {
                errors.Add("Si no tiene garaje, el número de espacios debe ser 0");
            }

            // Validar fechas
            if (request.FechaFin.HasValue && request.FechaFin <= request.FechaInicio)
            {
                errors.Add("La fecha fin debe ser posterior a la fecha de inicio");
            }

            // Validar que casas pasadas tengan fecha fin
            if (request.Tipo.ToLower() == "pasado" && !request.FechaFin.HasValue)
            {
                errors.Add("Las casas tipo 'pasado' deben tener fecha fin");
            }

            // Validar que casas actuales no tengan fecha fin
            if (request.Tipo.ToLower() == "actual" && request.FechaFin.HasValue)
            {
                errors.Add("Las casas tipo 'actual' no deben tener fecha fin");
            }

            // Validar que el área construida no sea mayor al área total
            if (request.AreaConstruida > request.AreaTotal)
            {
                errors.Add("El área construida no puede ser mayor al área total");
            }

            // Validar que solo haya una casa principal por twin
            if (request.EsPrincipal)
            {
                var existePrincipal = await _casaService.ExisteCasaPrincipalAsync(request.TwinId);
                if (existePrincipal)
                {
                    errors.Add("Ya existe una casa marcada como principal para este usuario");
                }
            }

            return errors;
        }
    }
}

// Services/ICasaService.cs
using TwinAgentAPI.Models;
using TwinAgentAPI.DTOs;

namespace TwinAgentAPI.Services
{
    public interface ICasaService
    {
        Task<Casa> CreateCasaAsync(CreateCasaRequest request);
        Task<Casa?> GetCasaByIdAsync(string id);
        Task<List<Casa>> GetCasasByTwinIdAsync(string twinId);
        Task<Casa> UpdateCasaAsync(string id, CreateCasaRequest request);
        Task<bool> DeleteCasaAsync(string id);
        Task<bool> ExisteCasaPrincipalAsync(string twinId);
    }
}
