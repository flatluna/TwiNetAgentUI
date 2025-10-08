using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TwinNetAgent.Models
{
    /// <summary>
    /// Modelo principal para representar una habilidad del usuario
    /// </summary>
    public class Skill
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public SkillLevel Level { get; set; } = SkillLevel.Principiante;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Range(0, 50)]
        public int ExperienceYears { get; set; } = 0;

        // Propiedades de navegación para relaciones uno a muchos
        public virtual ICollection<SkillCertification> Certifications { get; set; } = new List<SkillCertification>();
        public virtual ICollection<SkillProject> Projects { get; set; } = new List<SkillProject>();
        public virtual ICollection<SkillLearningPath> LearningPaths { get; set; } = new List<SkillLearningPath>();
        public virtual ICollection<SkillAISuggestion> AISuggestions { get; set; } = new List<SkillAISuggestion>();
        public virtual ICollection<SkillTag> Tags { get; set; } = new List<SkillTag>();

        [Required]
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public bool Validated { get; set; } = false;

        // Propiedades para auditoría
        [Required]
        [StringLength(450)] // Tamaño estándar para UserId en Identity
        public string UserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [StringLength(450)]
        public string? CreatedBy { get; set; }
        
        [StringLength(450)]
        public string? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Enumeración para los niveles de habilidad
    /// </summary>
    public enum SkillLevel
    {
        Principiante = 1,
        Intermedio = 2,
        Avanzado = 3,
        Experto = 4
    }

    /// <summary>
    /// Modelo para certificaciones asociadas a una habilidad
    /// </summary>
    public class SkillCertification
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(450)]
        public string SkillId { get; set; } = string.Empty;

        [ForeignKey("SkillId")]
        public virtual Skill Skill { get; set; } = null!;

        [Required]
        [StringLength(300)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string? IssuingOrganization { get; set; }

        public DateTime? DateObtained { get; set; }

        public DateTime? ExpirationDate { get; set; }

        [StringLength(500)]
        public string? CertificationUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Modelo para proyectos relacionados con una habilidad
    /// </summary>
    public class SkillProject
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(450)]
        public string SkillId { get; set; } = string.Empty;

        [ForeignKey("SkillId")]
        public virtual Skill Skill { get; set; } = null!;

        [Required]
        [StringLength(300)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(200)]
        public string? Client { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [StringLength(500)]
        public string? ProjectUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Modelo para rutas de aprendizaje de una habilidad
    /// </summary>
    public class SkillLearningPath
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(450)]
        public string SkillId { get; set; } = string.Empty;

        [ForeignKey("SkillId")]
        public virtual Skill Skill { get; set; } = null!;

        [Required]
        [StringLength(300)]
        public string PathName { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(1, 100)]
        public int OrderIndex { get; set; } = 1;

        public bool IsCompleted { get; set; } = false;

        public DateTime? CompletedDate { get; set; }

        [StringLength(500)]
        public string? ResourceUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Modelo para sugerencias de IA asociadas a una habilidad
    /// </summary>
    public class SkillAISuggestion
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(450)]
        public string SkillId { get; set; } = string.Empty;

        [ForeignKey("SkillId")]
        public virtual Skill Skill { get; set; } = null!;

        [Required]
        [StringLength(1000)]
        public string Suggestion { get; set; } = string.Empty;

        public SuggestionType Type { get; set; } = SuggestionType.General;

        [Range(0.0, 1.0)]
        public double Confidence { get; set; } = 0.0;

        public bool IsApplied { get; set; } = false;

        public DateTime? AppliedDate { get; set; }

        [StringLength(450)]
        public string? AppliedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Enumeración para tipos de sugerencias de IA
    /// </summary>
    public enum SuggestionType
    {
        General = 1,
        Certification = 2,
        CareerPath = 3,
        MarketTrend = 4,
        LearningResource = 5,
        ProjectIdea = 6
    }

    /// <summary>
    /// Modelo para etiquetas asociadas a una habilidad
    /// </summary>
    public class SkillTag
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(450)]
        public string SkillId { get; set; } = string.Empty;

        [ForeignKey("SkillId")]
        public virtual Skill Skill { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string TagName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Color { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// DTO para crear/actualizar una habilidad
    /// </summary>
    public class CreateSkillRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public SkillLevel Level { get; set; } = SkillLevel.Principiante;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Range(0, 50)]
        public int ExperienceYears { get; set; } = 0;

        public List<string> Certifications { get; set; } = new List<string>();
        public List<string> Projects { get; set; } = new List<string>();
        public List<string> LearningPaths { get; set; } = new List<string>();
        public List<string> Tags { get; set; } = new List<string>();

        public bool Validated { get; set; } = false;
    }

    /// <summary>
    /// DTO para respuesta de habilidad
    /// </summary>
    public class SkillResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public SkillLevel Level { get; set; }
        public string? Description { get; set; }
        public int ExperienceYears { get; set; }
        public List<string> Certifications { get; set; } = new List<string>();
        public List<string> Projects { get; set; } = new List<string>();
        public List<string> LearningPaths { get; set; } = new List<string>();
        public List<string> AISuggestions { get; set; } = new List<string>();
        public List<string> Tags { get; set; } = new List<string>();
        public DateTime DateAdded { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool Validated { get; set; }
    }

    /// <summary>
    /// DTO para filtros de búsqueda de habilidades
    /// </summary>
    public class SkillSearchRequest
    {
        public string? SearchTerm { get; set; }
        public string? Category { get; set; }
        public SkillLevel? Level { get; set; }
        public List<string>? Tags { get; set; }
        public bool? Validated { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "LastUpdated";
        public bool SortDescending { get; set; } = true;
    }

    /// <summary>
    /// DTO para estadísticas de habilidades
    /// </summary>
    public class SkillStatsResponse
    {
        public int TotalSkills { get; set; }
        public int ExpertLevelSkills { get; set; }
        public int TotalCertifications { get; set; }
        public int TotalExperienceYears { get; set; }
        public Dictionary<string, int> SkillsByCategory { get; set; } = new Dictionary<string, int>();
        public Dictionary<SkillLevel, int> SkillsByLevel { get; set; } = new Dictionary<SkillLevel, int>();
        public List<string> TopCategories { get; set; } = new List<string>();
        public List<string> RecentlyUpdated { get; set; } = new List<string>();
    }

    /// <summary>
    /// DTO para solicitud de mejora con IA
    /// </summary>
    public class AIEnhancementRequest
    {
        [Required]
        public List<string> SkillIds { get; set; } = new List<string>();
        
        public bool IncludeCertificationSuggestions { get; set; } = true;
        public bool IncludeCareerPathSuggestions { get; set; } = true;
        public bool IncludeMarketTrends { get; set; } = true;
        public bool IncludeLearningResources { get; set; } = true;
    }

    /// <summary>
    /// DTO para respuesta de mejora con IA
    /// </summary>
    public class AIEnhancementResponse
    {
        public string SkillId { get; set; } = string.Empty;
        public string SkillName { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new List<string>();
        public List<string> CertificationRecommendations { get; set; } = new List<string>();
        public List<string> CareerPaths { get; set; } = new List<string>();
        public List<string> MarketTrends { get; set; } = new List<string>();
        public List<string> LearningResources { get; set; } = new List<string>();
        public double ConfidenceScore { get; set; } = 0.0;
    }
}