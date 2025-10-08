using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TwinNetAgent.Models;
using TwinNetAgent.Models.Requests;
using TwinNetAgent.Services;

namespace TwinNetAgent.Controllers
{
    /// <summary>
    /// Controlador actualizado para manejar las requests específicas del frontend
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
        public async Task<ActionResult<IEnumerable<SkillPostResponse>>> GetSkills(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? category = null,
            [FromQuery] string? level = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var searchRequest = new SkillSearchRequest
                {
                    SearchTerm = searchTerm,
                    Category = category,
                    Level = !string.IsNullOrEmpty(level) ? Enum.Parse<SkillLevel>(level) : null,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                var skills = await _skillService.GetUserSkillsAsync(userId, searchRequest);
                
                // Convertir a formato que espera el frontend
                var response = skills.Select(skill => new SkillPostResponse
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Category = skill.Category,
                    Level = skill.Level.ToString(),
                    Description = skill.Description,
                    ExperienceYears = skill.ExperienceYears,
                    Certifications = skill.Certifications,
                    Projects = skill.Projects,
                    LearningPath = skill.LearningPaths,
                    AISuggestions = skill.AISuggestions,
                    Tags = skill.Tags,
                    DateAdded = skill.DateAdded.ToString("yyyy-MM-dd"),
                    LastUpdated = skill.LastUpdated.ToString("yyyy-MM-dd"),
                    Validated = skill.Validated
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las habilidades del usuario");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene una habilidad específica por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SkillPostResponse>> GetSkill(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var skill = await _skillService.GetSkillByIdAsync(id, userId);

                if (skill == null)
                {
                    return NotFound(new { message = $"No se encontró la habilidad con ID: {id}" });
                }

                var response = new SkillPostResponse
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Category = skill.Category,
                    Level = skill.Level.ToString(),
                    Description = skill.Description,
                    ExperienceYears = skill.ExperienceYears,
                    Certifications = skill.Certifications,
                    Projects = skill.Projects,
                    LearningPath = skill.LearningPaths,
                    AISuggestions = skill.AISuggestions,
                    Tags = skill.Tags,
                    DateAdded = skill.DateAdded.ToString("yyyy-MM-dd"),
                    LastUpdated = skill.LastUpdated.ToString("yyyy-MM-dd"),
                    Validated = skill.Validated
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la habilidad {SkillId}", id);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Crea una nueva habilidad con el formato exacto del frontend
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<SkillPostResponse>> CreateSkill([FromBody] SkillPostRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .SelectMany(x => x.Value?.Errors ?? new Microsoft.AspNetCore.Mvc.ModelBinding.ModelErrorCollection())
                        .Select(x => x.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(new { message = "Datos inválidos", errors });
                }

                // Validaciones adicionales específicas
                var validationErrors = request.ValidateData();
                if (validationErrors.Any())
                {
                    return BadRequest(new { message = "Errores de validación", errors = validationErrors });
                }

                // Validar categoría
                if (!SkillValidationHelper.IsValidCategory(request.Category))
                {
                    return BadRequest(new { message = $"Categoría '{request.Category}' no es válida" });
                }

                // Normalizar y limpiar datos
                request.Level = SkillValidationHelper.NormalizeLevel(request.Level);
                request.Tags = SkillValidationHelper.CleanTags(request.Tags);
                request.Certifications = SkillValidationHelper.CleanCertifications(request.Certifications);
                request.Projects = SkillValidationHelper.CleanProjects(request.Projects);

                var userId = GetCurrentUserId();

                // Verificar que no exista una habilidad con el mismo nombre
                var existingSkill = await _context.Skills
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.Name.ToLower() == request.Name.ToLower());

                if (existingSkill != null)
                {
                    return Conflict(new { message = $"Ya existe una habilidad con el nombre '{request.Name}'" });
                }

                // Convertir request a CreateSkillRequest para el servicio
                var createRequest = new CreateSkillRequest
                {
                    Name = request.Name,
                    Category = request.Category,
                    Level = request.GetSkillLevel(),
                    Description = request.Description,
                    ExperienceYears = request.ExperienceYears,
                    Certifications = request.Certifications,
                    Projects = request.Projects,
                    LearningPaths = request.LearningPath,
                    Tags = request.Tags,
                    Validated = request.Validated
                };

                var skill = await _skillService.CreateSkillAsync(createRequest, userId);

                var response = new SkillPostResponse
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Category = skill.Category,
                    Level = skill.Level.ToString(),
                    Description = skill.Description,
                    ExperienceYears = skill.ExperienceYears,
                    Certifications = skill.Certifications,
                    Projects = skill.Projects,
                    LearningPath = skill.LearningPaths,
                    AISuggestions = skill.AISuggestions,
                    Tags = skill.Tags,
                    DateAdded = skill.DateAdded.ToString("yyyy-MM-dd"),
                    LastUpdated = skill.LastUpdated.ToString("yyyy-MM-dd"),
                    Validated = skill.Validated
                };

                return CreatedAtAction(
                    nameof(GetSkill),
                    new { id = response.Id },
                    response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la habilidad");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualiza una habilidad existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<SkillPostResponse>> UpdateSkill(string id, [FromBody] SkillPostRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .SelectMany(x => x.Value?.Errors ?? new Microsoft.AspNetCore.Mvc.ModelBinding.ModelErrorCollection())
                        .Select(x => x.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(new { message = "Datos inválidos", errors });
                }

                // Asignar el ID del parámetro al request
                request.Id = id;

                // Validaciones adicionales
                var validationErrors = request.ValidateData();
                if (validationErrors.Any())
                {
                    return BadRequest(new { message = "Errores de validación", errors = validationErrors });
                }

                // Normalizar datos
                request.Level = SkillValidationHelper.NormalizeLevel(request.Level);
                request.Tags = SkillValidationHelper.CleanTags(request.Tags);
                request.Certifications = SkillValidationHelper.CleanCertifications(request.Certifications);
                request.Projects = SkillValidationHelper.CleanProjects(request.Projects);

                var userId = GetCurrentUserId();

                // Convertir a CreateSkillRequest para el servicio
                var updateRequest = new CreateSkillRequest
                {
                    Name = request.Name,
                    Category = request.Category,
                    Level = request.GetSkillLevel(),
                    Description = request.Description,
                    ExperienceYears = request.ExperienceYears,
                    Certifications = request.Certifications,
                    Projects = request.Projects,
                    LearningPaths = request.LearningPath,
                    Tags = request.Tags,
                    Validated = request.Validated
                };

                var skill = await _skillService.UpdateSkillAsync(id, updateRequest, userId);

                if (skill == null)
                {
                    return NotFound(new { message = $"No se encontró la habilidad con ID: {id}" });
                }

                var response = new SkillPostResponse
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Category = skill.Category,
                    Level = skill.Level.ToString(),
                    Description = skill.Description,
                    ExperienceYears = skill.ExperienceYears,
                    Certifications = skill.Certifications,
                    Projects = skill.Projects,
                    LearningPath = skill.LearningPaths,
                    AISuggestions = skill.AISuggestions,
                    Tags = skill.Tags,
                    DateAdded = skill.DateAdded.ToString("yyyy-MM-dd"),
                    LastUpdated = skill.LastUpdated.ToString("yyyy-MM-dd"),
                    Validated = skill.Validated
                };

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la habilidad {SkillId}", id);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
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
                    return NotFound(new { message = $"No se encontró la habilidad con ID: {id}" });
                }

                return Ok(new { message = "Habilidad eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la habilidad {SkillId}", id);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene estadísticas de las habilidades del usuario
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetSkillStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _skillService.GetSkillStatsAsync(userId);
                
                // Formato esperado por el frontend
                var response = new
                {
                    totalSkills = stats.TotalSkills,
                    expertLevelSkills = stats.ExpertLevelSkills,
                    totalCertifications = stats.TotalCertifications,
                    totalExperienceYears = stats.TotalExperienceYears,
                    skillsByCategory = stats.SkillsByCategory,
                    skillsByLevel = stats.SkillsByLevel.ToDictionary(
                        kvp => kvp.Key.ToString(), 
                        kvp => kvp.Value
                    ),
                    topCategories = stats.TopCategories,
                    recentlyUpdated = stats.RecentlyUpdated
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de habilidades");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
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
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene mejoras con IA para las habilidades especificadas
        /// </summary>
        [HttpPost("ai-enhancement")]
        public async Task<ActionResult<List<SkillAIEnhancementPostResponse>>> GetAIEnhancements([FromBody] SkillAIEnhancementPostRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                
                // Convertir a formato del servicio
                var serviceRequest = new AIEnhancementRequest
                {
                    SkillIds = request.SkillIds,
                    IncludeCertificationSuggestions = request.IncludeCertificationSuggestions,
                    IncludeCareerPathSuggestions = request.IncludeCareerPathSuggestions,
                    IncludeMarketTrends = request.IncludeMarketTrends,
                    IncludeLearningResources = request.IncludeLearningResources
                };

                var enhancements = await _aiService.GenerateEnhancementsAsync(request.SkillIds, userId, serviceRequest);

                // Convertir a formato esperado por el frontend
                var response = enhancements.Select(e => new SkillAIEnhancementPostResponse
                {
                    SkillId = e.SkillId,
                    SkillName = e.SkillName,
                    Suggestions = e.Suggestions,
                    NewCertifications = e.CertificationRecommendations,
                    CareerPaths = e.CareerPaths,
                    MarketTrends = e.MarketTrends,
                    ConfidenceScore = e.ConfidenceScore
                }).ToList();

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar mejoras con IA");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Aplica las mejoras de IA a las habilidades
        /// </summary>
        [HttpPost("apply-ai-enhancements")]
        public async Task<ActionResult> ApplyAIEnhancements([FromBody] List<SkillAIEnhancementPostResponse> enhancements)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Convertir a formato del servicio
                var serviceEnhancements = enhancements.Select(e => new AIEnhancementResponse
                {
                    SkillId = e.SkillId,
                    SkillName = e.SkillName,
                    Suggestions = e.Suggestions,
                    CertificationRecommendations = e.NewCertifications,
                    CareerPaths = e.CareerPaths,
                    MarketTrends = e.MarketTrends,
                    ConfidenceScore = e.ConfidenceScore
                }).ToList();

                await _aiService.ApplyEnhancementsAsync(serviceEnhancements, userId);

                return Ok(new { message = "Mejoras aplicadas exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al aplicar mejoras con IA");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
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
}