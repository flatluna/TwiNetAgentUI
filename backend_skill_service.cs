using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TwinNetAgent.Models;

namespace TwinNetAgent.Services
{
    /// <summary>
    /// Interfaz para el servicio de habilidades
    /// </summary>
    public interface ISkillService
    {
        Task<List<SkillResponse>> GetUserSkillsAsync(string userId, SkillSearchRequest request);
        Task<SkillResponse?> GetSkillByIdAsync(string skillId, string userId);
        Task<SkillResponse> CreateSkillAsync(CreateSkillRequest request, string userId);
        Task<SkillResponse?> UpdateSkillAsync(string skillId, CreateSkillRequest request, string userId);
        Task<bool> DeleteSkillAsync(string skillId, string userId);
        Task<SkillStatsResponse> GetSkillStatsAsync(string userId);
        Task<List<string>> GetCategoriesAsync();
        Task<bool> ValidateSkillAsync(string skillId, string userId);
        Task<string> ExportUserSkillsAsync(string userId);
        Task<ImportResult> ImportUserSkillsAsync(Stream jsonStream, string userId);
        Task<List<SkillResponse>> SearchSimilarSkillsAsync(string searchText, string userId, int maxResults);
    }

    /// <summary>
    /// Servicio para gestionar las habilidades del usuario
    /// </summary>
    public class SkillService : ISkillService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SkillService> _logger;

        // Categorías predefinidas de habilidades
        private readonly List<string> _defaultCategories = new()
        {
            "Tecnología",
            "Construcción",
            "Contabilidad & Finanzas",
            "Legal",
            "Medicina & Salud",
            "Educación",
            "Arte & Diseño",
            "Ventas & Marketing",
            "Idiomas",
            "Oficios",
            "Gestión & Liderazgo",
            "Otros"
        };

        public SkillService(ApplicationDbContext context, ILogger<SkillService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<SkillResponse>> GetUserSkillsAsync(string userId, SkillSearchRequest request)
        {
            var query = _context.Skills
                .Include(s => s.Certifications)
                .Include(s => s.Projects)
                .Include(s => s.LearningPaths)
                .Include(s => s.AISuggestions)
                .Include(s => s.Tags)
                .Where(s => s.UserId == userId);

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchLower = request.SearchTerm.ToLower();
                query = query.Where(s => 
                    s.Name.ToLower().Contains(searchLower) ||
                    s.Description.ToLower().Contains(searchLower) ||
                    s.Tags.Any(t => t.TagName.ToLower().Contains(searchLower)));
            }

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                query = query.Where(s => s.Category == request.Category);
            }

            if (request.Level.HasValue)
            {
                query = query.Where(s => s.Level == request.Level.Value);
            }

            if (request.Validated.HasValue)
            {
                query = query.Where(s => s.Validated == request.Validated.Value);
            }

            if (request.Tags != null && request.Tags.Any())
            {
                query = query.Where(s => s.Tags.Any(t => request.Tags.Contains(t.TagName)));
            }

            // Aplicar ordenamiento
            query = request.SortBy?.ToLower() switch
            {
                "name" => request.SortDescending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
                "category" => request.SortDescending ? query.OrderByDescending(s => s.Category) : query.OrderBy(s => s.Category),
                "level" => request.SortDescending ? query.OrderByDescending(s => s.Level) : query.OrderBy(s => s.Level),
                "experienceyears" => request.SortDescending ? query.OrderByDescending(s => s.ExperienceYears) : query.OrderBy(s => s.ExperienceYears),
                "dateadded" => request.SortDescending ? query.OrderByDescending(s => s.DateAdded) : query.OrderBy(s => s.DateAdded),
                _ => request.SortDescending ? query.OrderByDescending(s => s.LastUpdated) : query.OrderBy(s => s.LastUpdated)
            };

            // Aplicar paginación
            var skills = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return skills.Select(MapToResponse).ToList();
        }

        public async Task<SkillResponse?> GetSkillByIdAsync(string skillId, string userId)
        {
            var skill = await _context.Skills
                .Include(s => s.Certifications)
                .Include(s => s.Projects)
                .Include(s => s.LearningPaths)
                .Include(s => s.AISuggestions)
                .Include(s => s.Tags)
                .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

            return skill != null ? MapToResponse(skill) : null;
        }

        public async Task<SkillResponse> CreateSkillAsync(CreateSkillRequest request, string userId)
        {
            // Validar que no exista una habilidad con el mismo nombre para el usuario
            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Name.ToLower() == request.Name.ToLower());

            if (existingSkill != null)
            {
                throw new ArgumentException($"Ya existe una habilidad con el nombre '{request.Name}'");
            }

            var skill = new Skill
            {
                Name = request.Name,
                Category = request.Category,
                Level = request.Level,
                Description = request.Description ?? string.Empty,
                ExperienceYears = request.ExperienceYears,
                Validated = request.Validated,
                UserId = userId,
                CreatedBy = userId,
                UpdatedBy = userId
            };

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            // Agregar certificaciones
            if (request.Certifications.Any())
            {
                var certifications = request.Certifications.Select(cert => new SkillCertification
                {
                    SkillId = skill.Id,
                    Name = cert
                }).ToList();

                _context.SkillCertifications.AddRange(certifications);
            }

            // Agregar proyectos
            if (request.Projects.Any())
            {
                var projects = request.Projects.Select(proj => new SkillProject
                {
                    SkillId = skill.Id,
                    Name = proj
                }).ToList();

                _context.SkillProjects.AddRange(projects);
            }

            // Agregar rutas de aprendizaje
            if (request.LearningPaths.Any())
            {
                var learningPaths = request.LearningPaths.Select((path, index) => new SkillLearningPath
                {
                    SkillId = skill.Id,
                    PathName = path,
                    OrderIndex = index + 1
                }).ToList();

                _context.SkillLearningPaths.AddRange(learningPaths);
            }

            // Agregar etiquetas
            if (request.Tags.Any())
            {
                var tags = request.Tags.Select(tag => new SkillTag
                {
                    SkillId = skill.Id,
                    TagName = tag
                }).ToList();

                _context.SkillTags.AddRange(tags);
            }

            await _context.SaveChangesAsync();

            // Recargar la habilidad con todas las relaciones
            return await GetSkillByIdAsync(skill.Id, userId) ?? throw new InvalidOperationException("Error al crear la habilidad");
        }

        public async Task<SkillResponse?> UpdateSkillAsync(string skillId, CreateSkillRequest request, string userId)
        {
            var skill = await _context.Skills
                .Include(s => s.Certifications)
                .Include(s => s.Projects)
                .Include(s => s.LearningPaths)
                .Include(s => s.Tags)
                .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

            if (skill == null)
            {
                return null;
            }

            // Validar que no exista otra habilidad con el mismo nombre
            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Name.ToLower() == request.Name.ToLower() && s.Id != skillId);

            if (existingSkill != null)
            {
                throw new ArgumentException($"Ya existe otra habilidad con el nombre '{request.Name}'");
            }

            // Actualizar propiedades básicas
            skill.Name = request.Name;
            skill.Category = request.Category;
            skill.Level = request.Level;
            skill.Description = request.Description ?? string.Empty;
            skill.ExperienceYears = request.ExperienceYears;
            skill.Validated = request.Validated;
            skill.LastUpdated = DateTime.UtcNow;
            skill.UpdatedBy = userId;

            // Actualizar certificaciones
            _context.SkillCertifications.RemoveRange(skill.Certifications);
            if (request.Certifications.Any())
            {
                var certifications = request.Certifications.Select(cert => new SkillCertification
                {
                    SkillId = skill.Id,
                    Name = cert
                }).ToList();

                _context.SkillCertifications.AddRange(certifications);
            }

            // Actualizar proyectos
            _context.SkillProjects.RemoveRange(skill.Projects);
            if (request.Projects.Any())
            {
                var projects = request.Projects.Select(proj => new SkillProject
                {
                    SkillId = skill.Id,
                    Name = proj
                }).ToList();

                _context.SkillProjects.AddRange(projects);
            }

            // Actualizar rutas de aprendizaje
            _context.SkillLearningPaths.RemoveRange(skill.LearningPaths);
            if (request.LearningPaths.Any())
            {
                var learningPaths = request.LearningPaths.Select((path, index) => new SkillLearningPath
                {
                    SkillId = skill.Id,
                    PathName = path,
                    OrderIndex = index + 1
                }).ToList();

                _context.SkillLearningPaths.AddRange(learningPaths);
            }

            // Actualizar etiquetas
            _context.SkillTags.RemoveRange(skill.Tags);
            if (request.Tags.Any())
            {
                var tags = request.Tags.Select(tag => new SkillTag
                {
                    SkillId = skill.Id,
                    TagName = tag
                }).ToList();

                _context.SkillTags.AddRange(tags);
            }

            await _context.SaveChangesAsync();

            return await GetSkillByIdAsync(skill.Id, userId);
        }

        public async Task<bool> DeleteSkillAsync(string skillId, string userId)
        {
            var skill = await _context.Skills
                .Include(s => s.Certifications)
                .Include(s => s.Projects)
                .Include(s => s.LearningPaths)
                .Include(s => s.AISuggestions)
                .Include(s => s.Tags)
                .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

            if (skill == null)
            {
                return false;
            }

            // Eliminar todas las entidades relacionadas
            _context.SkillCertifications.RemoveRange(skill.Certifications);
            _context.SkillProjects.RemoveRange(skill.Projects);
            _context.SkillLearningPaths.RemoveRange(skill.LearningPaths);
            _context.SkillAISuggestions.RemoveRange(skill.AISuggestions);
            _context.SkillTags.RemoveRange(skill.Tags);
            _context.Skills.Remove(skill);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SkillStatsResponse> GetSkillStatsAsync(string userId)
        {
            var skills = await _context.Skills
                .Include(s => s.Certifications)
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var stats = new SkillStatsResponse
            {
                TotalSkills = skills.Count,
                ExpertLevelSkills = skills.Count(s => s.Level == SkillLevel.Experto),
                TotalCertifications = skills.Sum(s => s.Certifications.Count),
                TotalExperienceYears = skills.Sum(s => s.ExperienceYears),
                SkillsByCategory = skills.GroupBy(s => s.Category)
                    .ToDictionary(g => g.Key, g => g.Count()),
                SkillsByLevel = skills.GroupBy(s => s.Level)
                    .ToDictionary(g => g.Key, g => g.Count()),
                TopCategories = skills.GroupBy(s => s.Category)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList(),
                RecentlyUpdated = skills.OrderByDescending(s => s.LastUpdated)
                    .Take(5)
                    .Select(s => s.Name)
                    .ToList()
            };

            return stats;
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            var userCategories = await _context.Skills
                .Select(s => s.Category)
                .Distinct()
                .ToListAsync();

            return _defaultCategories.Union(userCategories).OrderBy(c => c).ToList();
        }

        public async Task<bool> ValidateSkillAsync(string skillId, string userId)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

            if (skill == null)
            {
                return false;
            }

            skill.Validated = true;
            skill.LastUpdated = DateTime.UtcNow;
            skill.UpdatedBy = userId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> ExportUserSkillsAsync(string userId)
        {
            var skills = await GetUserSkillsAsync(userId, new SkillSearchRequest
            {
                PageSize = int.MaxValue,
                PageNumber = 1
            });

            var exportData = new
            {
                ExportDate = DateTime.UtcNow,
                UserId = userId,
                Skills = skills
            };

            return JsonSerializer.Serialize(exportData, new JsonSerializerOptions
            {
                WriteIndented = true
            });
        }

        public async Task<ImportResult> ImportUserSkillsAsync(Stream jsonStream, string userId)
        {
            var result = new ImportResult();

            try
            {
                using var reader = new StreamReader(jsonStream);
                var json = await reader.ReadToEndAsync();
                
                var importData = JsonSerializer.Deserialize<ImportSkillsData>(json);
                
                if (importData?.Skills == null)
                {
                    result.Errors.Add("Formato de archivo inválido");
                    return result;
                }

                foreach (var skillData in importData.Skills)
                {
                    try
                    {
                        // Verificar si ya existe
                        var existing = await _context.Skills
                            .FirstOrDefaultAsync(s => s.UserId == userId && s.Name.ToLower() == skillData.Name.ToLower());

                        if (existing != null)
                        {
                            result.SkippedCount++;
                            continue;
                        }

                        var createRequest = new CreateSkillRequest
                        {
                            Name = skillData.Name,
                            Category = skillData.Category,
                            Level = skillData.Level,
                            Description = skillData.Description,
                            ExperienceYears = skillData.ExperienceYears,
                            Certifications = skillData.Certifications,
                            Projects = skillData.Projects,
                            LearningPaths = skillData.LearningPaths,
                            Tags = skillData.Tags,
                            Validated = skillData.Validated
                        };

                        await CreateSkillAsync(createRequest, userId);
                        result.ImportedCount++;
                    }
                    catch (Exception ex)
                    {
                        result.Errors.Add($"Error al importar '{skillData.Name}': {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Error al procesar el archivo: {ex.Message}");
            }

            return result;
        }

        public async Task<List<SkillResponse>> SearchSimilarSkillsAsync(string searchText, string userId, int maxResults)
        {
            var searchLower = searchText.ToLower();
            
            var skills = await _context.Skills
                .Include(s => s.Certifications)
                .Include(s => s.Projects)
                .Include(s => s.LearningPaths)
                .Include(s => s.AISuggestions)
                .Include(s => s.Tags)
                .Where(s => s.UserId == userId)
                .Where(s => 
                    s.Name.ToLower().Contains(searchLower) ||
                    s.Description.ToLower().Contains(searchLower) ||
                    s.Category.ToLower().Contains(searchLower) ||
                    s.Tags.Any(t => t.TagName.ToLower().Contains(searchLower)))
                .Take(maxResults)
                .ToListAsync();

            return skills.Select(MapToResponse).ToList();
        }

        private static SkillResponse MapToResponse(Skill skill)
        {
            return new SkillResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Category = skill.Category,
                Level = skill.Level,
                Description = skill.Description,
                ExperienceYears = skill.ExperienceYears,
                Certifications = skill.Certifications.Select(c => c.Name).ToList(),
                Projects = skill.Projects.Select(p => p.Name).ToList(),
                LearningPaths = skill.LearningPaths.OrderBy(lp => lp.OrderIndex).Select(lp => lp.PathName).ToList(),
                AISuggestions = skill.AISuggestions.Select(s => s.Suggestion).ToList(),
                Tags = skill.Tags.Select(t => t.TagName).ToList(),
                DateAdded = skill.DateAdded,
                LastUpdated = skill.LastUpdated,
                Validated = skill.Validated
            };
        }
    }

    /// <summary>
    /// Modelo para importar datos de habilidades
    /// </summary>
    public class ImportSkillsData
    {
        public DateTime ExportDate { get; set; }
        public string UserId { get; set; } = string.Empty;
        public List<SkillResponse> Skills { get; set; } = new();
    }
}