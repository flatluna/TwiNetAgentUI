using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TwinNetAgent.Models;
using TwinNetAgent.Services;

namespace TwinNetAgent.Controllers
{
    /// <summary>
    /// Controlador para gestionar las habilidades del usuario
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SkillsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ISkillService _skillService;
        private readonly IAIEnhancementService _aiService;
        private readonly ILogger<SkillsController> _logger;

        public SkillsController(
            ApplicationDbContext context,
            ISkillService skillService,
            IAIEnhancementService aiService,
            ILogger<SkillsController> logger)
        {
            _context = context;
            _skillService = skillService;
            _aiService = aiService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las habilidades del usuario autenticado
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SkillResponse>>> GetSkills([FromQuery] SkillSearchRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var skills = await _skillService.GetUserSkillsAsync(userId, request);
                
                return Ok(skills);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las habilidades del usuario");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene una habilidad específica por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SkillResponse>> GetSkill(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var skill = await _skillService.GetSkillByIdAsync(id, userId);

                if (skill == null)
                {
                    return NotFound($"No se encontró la habilidad con ID: {id}");
                }

                return Ok(skill);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la habilidad {SkillId}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea una nueva habilidad
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<SkillResponse>> CreateSkill([FromBody] CreateSkillRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var skill = await _skillService.CreateSkillAsync(request, userId);

                return CreatedAtAction(
                    nameof(GetSkill),
                    new { id = skill.Id },
                    skill);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la habilidad");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza una habilidad existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<SkillResponse>> UpdateSkill(string id, [FromBody] CreateSkillRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var skill = await _skillService.UpdateSkillAsync(id, request, userId);

                if (skill == null)
                {
                    return NotFound($"No se encontró la habilidad con ID: {id}");
                }

                return Ok(skill);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la habilidad {SkillId}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina una habilidad
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSkill(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _skillService.DeleteSkillAsync(id, userId);

                if (!success)
                {
                    return NotFound($"No se encontró la habilidad con ID: {id}");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la habilidad {SkillId}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene estadísticas de las habilidades del usuario
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<SkillStatsResponse>> GetSkillStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _skillService.GetSkillStatsAsync(userId);
                
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de habilidades");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene las categorías disponibles de habilidades
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<List<string>>> GetCategories()
        {
            try
            {
                var categories = await _skillService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener categorías");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida una habilidad como verificada
        /// </summary>
        [HttpPost("{id}/validate")]
        public async Task<ActionResult> ValidateSkill(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _skillService.ValidateSkillAsync(id, userId);

                if (!success)
                {
                    return NotFound($"No se encontró la habilidad con ID: {id}");
                }

                return Ok(new { message = "Habilidad validada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar la habilidad {SkillId}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene sugerencias de IA para mejorar las habilidades
        /// </summary>
        [HttpPost("ai-enhancement")]
        public async Task<ActionResult<List<AIEnhancementResponse>>> GetAIEnhancements([FromBody] AIEnhancementRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var enhancements = await _aiService.GenerateEnhancementsAsync(request.SkillIds, userId, request);

                return Ok(enhancements);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar mejoras con IA");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Aplica las sugerencias de IA a las habilidades
        /// </summary>
        [HttpPost("apply-ai-enhancements")]
        public async Task<ActionResult> ApplyAIEnhancements([FromBody] List<AIEnhancementResponse> enhancements)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _aiService.ApplyEnhancementsAsync(enhancements, userId);

                return Ok(new { message = "Mejoras aplicadas exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al aplicar mejoras con IA");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Exporta las habilidades del usuario en formato JSON
        /// </summary>
        [HttpGet("export")]
        public async Task<ActionResult> ExportSkills()
        {
            try
            {
                var userId = GetCurrentUserId();
                var skills = await _skillService.ExportUserSkillsAsync(userId);

                return File(
                    System.Text.Encoding.UTF8.GetBytes(skills),
                    "application/json",
                    $"skills-export-{DateTime.UtcNow:yyyy-MM-dd}.json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al exportar habilidades");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Importa habilidades desde un archivo JSON
        /// </summary>
        [HttpPost("import")]
        public async Task<ActionResult> ImportSkills([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No se proporcionó ningún archivo");
                }

                if (!file.ContentType.Contains("json"))
                {
                    return BadRequest("El archivo debe ser de tipo JSON");
                }

                var userId = GetCurrentUserId();
                using var stream = file.OpenReadStream();
                
                var result = await _skillService.ImportUserSkillsAsync(stream, userId);

                return Ok(new { 
                    message = $"Se importaron {result.ImportedCount} habilidades exitosamente",
                    importedCount = result.ImportedCount,
                    skippedCount = result.SkippedCount,
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al importar habilidades");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Busca habilidades similares basadas en texto
        /// </summary>
        [HttpGet("search-similar")]
        public async Task<ActionResult<List<SkillResponse>>> SearchSimilarSkills([FromQuery] string searchText, [FromQuery] int maxResults = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchText))
                {
                    return BadRequest("El texto de búsqueda es requerido");
                }

                var userId = GetCurrentUserId();
                var similarSkills = await _skillService.SearchSimilarSkillsAsync(searchText, userId, maxResults);

                return Ok(similarSkills);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar habilidades similares");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene el ID del usuario actual desde el token JWT
        /// </summary>
        private string GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Usuario no autenticado");
            }

            return userId;
        }
    }

    /// <summary>
    /// Modelo para resultado de importación
    /// </summary>
    public class ImportResult
    {
        public int ImportedCount { get; set; }
        public int SkippedCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}