using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TwinNetAgent.Models.Requests
{
    /// <summary>
    /// Clase que representa exactamente los datos que envía el frontend al crear/editar una habilidad
    /// </summary>
    public class SkillPostRequest
    {
        /// <summary>
        /// ID de la habilidad (presente solo en actualizaciones)
        /// </summary>
        public string? Id { get; set; }

        /// <summary>
        /// Nombre de la habilidad
        /// </summary>
        [Required(ErrorMessage = "El nombre de la habilidad es requerido")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 200 caracteres")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Categoría de la habilidad
        /// </summary>
        [Required(ErrorMessage = "La categoría es requerida")]
        [StringLength(100, ErrorMessage = "La categoría no puede exceder 100 caracteres")]
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Nivel de dominio de la habilidad
        /// </summary>
        [Required(ErrorMessage = "El nivel es requerido")]
        public string Level { get; set; } = "Principiante";

        /// <summary>
        /// Descripción detallada de la habilidad
        /// </summary>
        [StringLength(2000, ErrorMessage = "La descripción no puede exceder 2000 caracteres")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Años de experiencia en esta habilidad
        /// </summary>
        [Range(0, 50, ErrorMessage = "Los años de experiencia deben estar entre 0 y 50")]
        public int ExperienceYears { get; set; } = 0;

        /// <summary>
        /// Lista de certificaciones relacionadas
        /// </summary>
        public List<string> Certifications { get; set; } = new List<string>();

        /// <summary>
        /// Lista de proyectos relacionados
        /// </summary>
        public List<string> Projects { get; set; } = new List<string>();

        /// <summary>
        /// Ruta de aprendizaje seguida
        /// </summary>
        public List<string> LearningPath { get; set; } = new List<string>();

        /// <summary>
        /// Sugerencias generadas por IA
        /// </summary>
        public List<string> AISuggestions { get; set; } = new List<string>();

        /// <summary>
        /// Etiquetas asociadas a la habilidad
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// Fecha de creación (formato: YYYY-MM-DD)
        /// </summary>
        public string DateAdded { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");

        /// <summary>
        /// Fecha de última actualización (formato: YYYY-MM-DD)
        /// </summary>
        public string LastUpdated { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");

        /// <summary>
        /// Indica si la habilidad ha sido validada
        /// </summary>
        public bool Validated { get; set; } = false;

        /// <summary>
        /// Convierte el nivel string a enum SkillLevel
        /// </summary>
        public SkillLevel GetSkillLevel()
        {
            return Level?.ToLower() switch
            {
                "principiante" => SkillLevel.Principiante,
                "intermedio" => SkillLevel.Intermedio,
                "avanzado" => SkillLevel.Avanzado,
                "experto" => SkillLevel.Experto,
                _ => SkillLevel.Principiante
            };
        }

        /// <summary>
        /// Convierte las fechas string a DateTime
        /// </summary>
        public DateTime GetDateAdded()
        {
            if (DateTime.TryParse(DateAdded, out var date))
                return date;
            return DateTime.UtcNow;
        }

        /// <summary>
        /// Convierte las fechas string a DateTime
        /// </summary>
        public DateTime GetLastUpdated()
        {
            if (DateTime.TryParse(LastUpdated, out var date))
                return date;
            return DateTime.UtcNow;
        }

        /// <summary>
        /// Valida que los datos sean consistentes
        /// </summary>
        public List<string> ValidateData()
        {
            var errors = new List<string>();

            // Validar nivel
            var validLevels = new[] { "Principiante", "Intermedio", "Avanzado", "Experto" };
            if (!validLevels.Contains(Level))
            {
                errors.Add($"Nivel '{Level}' no es válido. Debe ser uno de: {string.Join(", ", validLevels)}");
            }

            // Validar experiencia vs nivel
            if (Level == "Experto" && ExperienceYears < 5)
            {
                errors.Add("Un nivel Experto generalmente requiere al menos 5 años de experiencia");
            }

            if (Level == "Principiante" && ExperienceYears > 2)
            {
                errors.Add("Un nivel Principiante no suele tener más de 2 años de experiencia");
            }

            // Validar fechas
            if (!DateTime.TryParse(DateAdded, out _))
            {
                errors.Add("Formato de fecha DateAdded inválido");
            }

            if (!DateTime.TryParse(LastUpdated, out _))
            {
                errors.Add("Formato de fecha LastUpdated inválido");
            }

            return errors;
        }

        /// <summary>
        /// Convierte el request a un modelo de dominio Skill
        /// </summary>
        public Skill ToSkillModel(string userId)
        {
            return new Skill
            {
                Id = Id ?? Guid.NewGuid().ToString(),
                Name = Name.Trim(),
                Category = Category.Trim(),
                Level = GetSkillLevel(),
                Description = Description?.Trim() ?? string.Empty,
                ExperienceYears = ExperienceYears,
                DateAdded = GetDateAdded(),
                LastUpdated = GetLastUpdated(),
                Validated = Validated,
                UserId = userId,
                CreatedBy = userId,
                UpdatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Clase para respuesta después de crear/actualizar una habilidad
    /// </summary>
    public class SkillPostResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public List<string> Certifications { get; set; } = new List<string>();
        public List<string> Projects { get; set; } = new List<string>();
        public List<string> LearningPath { get; set; } = new List<string>();
        public List<string> AISuggestions { get; set; } = new List<string>();
        public List<string> Tags { get; set; } = new List<string>();
        public string DateAdded { get; set; } = string.Empty;
        public string LastUpdated { get; set; } = string.Empty;
        public bool Validated { get; set; }

        /// <summary>
        /// Crea una respuesta desde un modelo Skill
        /// </summary>
        public static SkillPostResponse FromSkill(Skill skill)
        {
            return new SkillPostResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Category = skill.Category,
                Level = skill.Level.ToString(),
                Description = skill.Description,
                ExperienceYears = skill.ExperienceYears,
                Certifications = skill.Certifications?.Select(c => c.Name).ToList() ?? new List<string>(),
                Projects = skill.Projects?.Select(p => p.Name).ToList() ?? new List<string>(),
                LearningPath = skill.LearningPaths?.OrderBy(lp => lp.OrderIndex).Select(lp => lp.PathName).ToList() ?? new List<string>(),
                AISuggestions = skill.AISuggestions?.Select(s => s.Suggestion).ToList() ?? new List<string>(),
                Tags = skill.Tags?.Select(t => t.TagName).ToList() ?? new List<string>(),
                DateAdded = skill.DateAdded.ToString("yyyy-MM-dd"),
                LastUpdated = skill.LastUpdated.ToString("yyyy-MM-dd"),
                Validated = skill.Validated
            };
        }
    }

    /// <summary>
    /// Clase específica para el request de mejora con IA
    /// </summary>
    public class SkillAIEnhancementPostRequest
    {
        /// <summary>
        /// IDs de las habilidades a mejorar
        /// </summary>
        [Required(ErrorMessage = "Debe proporcionar al menos una habilidad")]
        [MinLength(1, ErrorMessage = "Debe proporcionar al menos una habilidad")]
        public List<string> SkillIds { get; set; } = new List<string>();

        /// <summary>
        /// Incluir sugerencias de certificaciones
        /// </summary>
        public bool IncludeCertificationSuggestions { get; set; } = true;

        /// <summary>
        /// Incluir sugerencias de rutas de carrera
        /// </summary>
        public bool IncludeCareerPathSuggestions { get; set; } = true;

        /// <summary>
        /// Incluir tendencias del mercado
        /// </summary>
        public bool IncludeMarketTrends { get; set; } = true;

        /// <summary>
        /// Incluir recursos de aprendizaje
        /// </summary>
        public bool IncludeLearningResources { get; set; } = true;
    }

    /// <summary>
    /// Clase para la respuesta de mejora con IA que envía el backend al frontend
    /// </summary>
    public class SkillAIEnhancementPostResponse
    {
        public string SkillId { get; set; } = string.Empty;
        public string SkillName { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new List<string>();
        public List<string> NewCertifications { get; set; } = new List<string>();
        public List<string> CareerPaths { get; set; } = new List<string>();
        public List<string> MarketTrends { get; set; } = new List<string>();
        public double ConfidenceScore { get; set; } = 0.0;
    }

    /// <summary>
    /// Clase para validación de datos específicos del frontend
    /// </summary>
    public static class SkillValidationHelper
    {
        public static readonly string[] ValidCategories = {
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

        public static readonly string[] ValidLevels = {
            "Principiante",
            "Intermedio", 
            "Avanzado",
            "Experto"
        };

        /// <summary>
        /// Valida que la categoría sea válida
        /// </summary>
        public static bool IsValidCategory(string category)
        {
            return ValidCategories.Contains(category);
        }

        /// <summary>
        /// Valida que el nivel sea válido
        /// </summary>
        public static bool IsValidLevel(string level)
        {
            return ValidLevels.Contains(level);
        }

        /// <summary>
        /// Normaliza el nivel para asegurar que tenga la capitalización correcta
        /// </summary>
        public static string NormalizeLevel(string level)
        {
            return level?.ToLower() switch
            {
                "principiante" => "Principiante",
                "intermedio" => "Intermedio",
                "avanzado" => "Avanzado",
                "experto" => "Experto",
                _ => "Principiante"
            };
        }

        /// <summary>
        /// Limpia y valida tags
        /// </summary>
        public static List<string> CleanTags(List<string> tags)
        {
            return tags?
                .Where(tag => !string.IsNullOrWhiteSpace(tag))
                .Select(tag => tag.Trim().ToLower())
                .Distinct()
                .Take(10) // Máximo 10 tags
                .ToList() ?? new List<string>();
        }

        /// <summary>
        /// Limpia y valida certificaciones
        /// </summary>
        public static List<string> CleanCertifications(List<string> certifications)
        {
            return certifications?
                .Where(cert => !string.IsNullOrWhiteSpace(cert))
                .Select(cert => cert.Trim())
                .Distinct()
                .Take(20) // Máximo 20 certificaciones
                .ToList() ?? new List<string>();
        }

        /// <summary>
        /// Limpia y valida proyectos
        /// </summary>
        public static List<string> CleanProjects(List<string> projects)
        {
            return projects?
                .Where(proj => !string.IsNullOrWhiteSpace(proj))
                .Select(proj => proj.Trim())
                .Distinct()
                .Take(50) // Máximo 50 proyectos
                .ToList() ?? new List<string>();
        }
    }
}