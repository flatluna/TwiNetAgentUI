// Services/CasaService.cs
using TwinAgentAPI.Models;
using TwinAgentAPI.DTOs;
using TwinAgentAPI.Repositories;

namespace TwinAgentAPI.Services
{
    public class CasaService : ICasaService
    {
        private readonly ICasaRepository _casaRepository;
        private readonly ILogger<CasaService> _logger;

        public CasaService(ICasaRepository casaRepository, ILogger<CasaService> logger)
        {
            _casaRepository = casaRepository;
            _logger = logger;
        }

        public async Task<Casa> CreateCasaAsync(CreateCasaRequest request)
        {
            try
            {
                // Si esta casa se marca como principal, desmarcar las demás
                if (request.EsPrincipal)
                {
                    await _casaRepository.UnmarkAllAsPrincipalAsync(request.TwinId);
                }

                // Mapear el DTO a la entidad
                var casa = MapToEntity(request);

                // Crear la casa
                var createdCasa = await _casaRepository.CreateAsync(casa);

                _logger.LogInformation($"Casa creada exitosamente: {createdCasa.Id}");

                return createdCasa;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear casa en el servicio");
                throw;
            }
        }

        public async Task<Casa?> GetCasaByIdAsync(string id)
        {
            return await _casaRepository.GetByIdAsync(id);
        }

        public async Task<List<Casa>> GetCasasByTwinIdAsync(string twinId)
        {
            return await _casaRepository.GetByTwinIdAsync(twinId);
        }

        public async Task<Casa> UpdateCasaAsync(string id, CreateCasaRequest request)
        {
            var existingCasa = await _casaRepository.GetByIdAsync(id);
            if (existingCasa == null)
            {
                throw new ArgumentException("Casa no encontrada");
            }

            // Si esta casa se marca como principal, desmarcar las demás
            if (request.EsPrincipal && !existingCasa.EsPrincipal)
            {
                await _casaRepository.UnmarkAllAsPrincipalAsync(request.TwinId);
            }

            // Mapear cambios
            var updatedCasa = MapToEntity(request);
            updatedCasa.Id = id;
            updatedCasa.FechaCreacion = existingCasa.FechaCreacion;
            updatedCasa.FechaModificacion = DateTime.UtcNow;

            return await _casaRepository.UpdateAsync(updatedCasa);
        }

        public async Task<bool> DeleteCasaAsync(string id)
        {
            return await _casaRepository.DeleteAsync(id);
        }

        public async Task<bool> ExisteCasaPrincipalAsync(string twinId)
        {
            return await _casaRepository.ExistsPrincipalAsync(twinId);
        }

        private Casa MapToEntity(CreateCasaRequest request)
        {
            return new Casa
            {
                TwinId = request.TwinId,
                Nombre = request.Nombre,
                Direccion = request.Direccion,
                Ciudad = request.Ciudad,
                Estado = request.Estado,
                CodigoPostal = request.CodigoPostal,
                Pais = request.Pais,
                Tipo = ParseTipoCasa(request.Tipo),
                TipoPropiedad = ParseTipoPropiedad(request.TipoPropiedad),
                FechaCompra = request.FechaCompra,
                FechaVenta = request.FechaVenta,
                FechaInicio = request.FechaInicio,
                FechaFin = request.FechaFin,
                AreaTotal = request.AreaTotal,
                AreaConstruida = request.AreaConstruida,
                AreaTerreno = request.AreaTerreno,
                Habitaciones = request.Habitaciones,
                Banos = request.Banos,
                MedioBanos = request.MedioBanos,
                Pisos = request.Pisos,
                AnoConstructorcion = request.AnoConstructorcion,
                TieneGaraje = request.TieneGaraje,
                EspaciosGaraje = request.EspaciosGaraje,
                TienePiscina = request.TienePiscina,
                TieneJardin = request.TieneJardin,
                TieneSotano = request.TieneSotano,
                TieneAtico = request.TieneAtico,
                TieneTerraza = request.TieneTerraza,
                TieneBalcon = request.TieneBalcon,
                Calefaccion = request.Calefaccion,
                AireAcondicionado = request.AireAcondicionado,
                TipoAgua = request.TipoAgua,
                SistemaElectrico = request.SistemaElectrico,
                Internet = request.Internet,
                SistemaSeguridad = request.SistemaSeguridad,
                ValorCompra = request.ValorCompra,
                ValorActual = request.ValorActual,
                ValorEstimado = request.ValorEstimado,
                ImpuestosPrediales = request.ImpuestosPrediales,
                SeguroAnual = request.SeguroAnual,
                HoaFee = request.HoaFee,
                ServiciosPublicos = request.ServiciosPublicos,
                Vecindario = request.Vecindario,
                ColegiosCercanos = request.ColegiosCercanos ?? new List<string>(),
                TransportePublico = request.TransportePublico,
                ComerciosCercanos = request.ComerciosCercanos ?? new List<string>(),
                EstadoGeneral = ParseEstadoGeneral(request.EstadoGeneral),
                UltimaRenovacion = request.UltimaRenovacion,
                ReparacionesPendientes = request.ReparacionesPendientes ?? new List<string>(),
                Mejoras = request.Mejoras ?? new List<string>(),
                Descripcion = request.Descripcion,
                AspectosPositivos = request.AspectosPositivos ?? new List<string>(),
                AspectosNegativos = request.AspectosNegativos ?? new List<string>(),
                RecuerdosEspeciales = request.RecuerdosEspeciales ?? new List<string>(),
                Fotos = request.Fotos ?? new List<string>(),
                Documentos = request.Documentos ?? new List<string>(),
                EsPrincipal = request.EsPrincipal
            };
        }

        private TipoCasa ParseTipoCasa(string tipo)
        {
            return tipo.ToLower() switch
            {
                "actual" => TipoCasa.Actual,
                "pasado" => TipoCasa.Pasado,
                "inversion" => TipoCasa.Inversion,
                "vacacional" => TipoCasa.Vacacional,
                _ => throw new ArgumentException($"Tipo de casa inválido: {tipo}")
            };
        }

        private TipoPropiedad ParseTipoPropiedad(string tipoPropiedad)
        {
            return tipoPropiedad.ToLower() switch
            {
                "casa" => TipoPropiedad.Casa,
                "apartamento" => TipoPropiedad.Apartamento,
                "condominio" => TipoPropiedad.Condominio,
                "townhouse" => TipoPropiedad.Townhouse,
                "duplex" => TipoPropiedad.Duplex,
                "mansion" => TipoPropiedad.Mansion,
                "cabana" => TipoPropiedad.Cabana,
                "otro" => TipoPropiedad.Otro,
                _ => throw new ArgumentException($"Tipo de propiedad inválido: {tipoPropiedad}")
            };
        }

        private EstadoGeneral ParseEstadoGeneral(string estado)
        {
            return estado.ToLower() switch
            {
                "excelente" => EstadoGeneral.Excelente,
                "muy_bueno" => EstadoGeneral.MuyBueno,
                "bueno" => EstadoGeneral.Bueno,
                "regular" => EstadoGeneral.Regular,
                "necesita_reparaciones" => EstadoGeneral.NecesitaReparaciones,
                _ => throw new ArgumentException($"Estado general inválido: {estado}")
            };
        }
    }
}

// Repositories/ICasaRepository.cs
using TwinAgentAPI.Models;

namespace TwinAgentAPI.Repositories
{
    public interface ICasaRepository
    {
        Task<Casa> CreateAsync(Casa casa);
        Task<Casa?> GetByIdAsync(string id);
        Task<List<Casa>> GetByTwinIdAsync(string twinId);
        Task<Casa> UpdateAsync(Casa casa);
        Task<bool> DeleteAsync(string id);
        Task<bool> ExistsPrincipalAsync(string twinId);
        Task UnmarkAllAsPrincipalAsync(string twinId);
    }
}

// Repositories/CasaRepository.cs (Entity Framework example)
using Microsoft.EntityFrameworkCore;
using TwinAgentAPI.Models;
using TwinAgentAPI.Data;

namespace TwinAgentAPI.Repositories
{
    public class CasaRepository : ICasaRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CasaRepository> _logger;

        public CasaRepository(ApplicationDbContext context, ILogger<CasaRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Casa> CreateAsync(Casa casa)
        {
            try
            {
                _context.Casas.Add(casa);
                await _context.SaveChangesAsync();
                return casa;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al crear casa en la base de datos: {casa.Id}");
                throw;
            }
        }

        public async Task<Casa?> GetByIdAsync(string id)
        {
            return await _context.Casas.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Casa>> GetByTwinIdAsync(string twinId)
        {
            return await _context.Casas
                .Where(c => c.TwinId == twinId)
                .OrderByDescending(c => c.EsPrincipal)
                .ThenByDescending(c => c.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Casa> UpdateAsync(Casa casa)
        {
            try
            {
                _context.Casas.Update(casa);
                await _context.SaveChangesAsync();
                return casa;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar casa: {casa.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var casa = await GetByIdAsync(id);
                if (casa == null) return false;

                _context.Casas.Remove(casa);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar casa: {id}");
                throw;
            }
        }

        public async Task<bool> ExistsPrincipalAsync(string twinId)
        {
            return await _context.Casas.AnyAsync(c => c.TwinId == twinId && c.EsPrincipal);
        }

        public async Task UnmarkAllAsPrincipalAsync(string twinId)
        {
            try
            {
                var casasPrincipales = await _context.Casas
                    .Where(c => c.TwinId == twinId && c.EsPrincipal)
                    .ToListAsync();

                foreach (var casa in casasPrincipales)
                {
                    casa.EsPrincipal = false;
                    casa.FechaModificacion = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al desmarcar casas principales para twin: {twinId}");
                throw;
            }
        }
    }
}

// Data/ApplicationDbContext.cs (Entity Framework)
using Microsoft.EntityFrameworkCore;
using TwinAgentAPI.Models;
using System.Text.Json;

namespace TwinAgentAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Casa> Casas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Casa>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.TwinId)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.Nombre)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(e => e.Direccion)
                    .IsRequired();

                entity.Property(e => e.Ciudad)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.Estado)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.CodigoPostal)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(e => e.Pais)
                    .HasMaxLength(100)
                    .IsRequired();

                // Configurar enums
                entity.Property(e => e.Tipo)
                    .HasConversion<string>()
                    .IsRequired();

                entity.Property(e => e.TipoPropiedad)
                    .HasConversion<string>()
                    .IsRequired();

                entity.Property(e => e.EstadoGeneral)
                    .HasConversion<string>()
                    .HasDefaultValue(EstadoGeneral.Bueno);

                // Configurar decimales
                entity.Property(e => e.AreaTotal)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(e => e.AreaConstruida)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(e => e.AreaTerreno)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(e => e.ValorCompra)
                    .HasColumnType("decimal(12,2)");

                entity.Property(e => e.ValorActual)
                    .HasColumnType("decimal(12,2)");

                entity.Property(e => e.ValorEstimado)
                    .HasColumnType("decimal(12,2)");

                entity.Property(e => e.ImpuestosPrediales)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.SeguroAnual)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.HoaFee)
                    .HasColumnType("decimal(8,2)");

                entity.Property(e => e.ServiciosPublicos)
                    .HasColumnType("decimal(8,2)");

                // Configurar arrays como JSON
                entity.Property(e => e.ColegiosCercanos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.ComerciosCercanos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.ReparacionesPendientes)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.Mejoras)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.AspectosPositivos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.AspectosNegativos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.RecuerdosEspeciales)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.Fotos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                entity.Property(e => e.Documentos)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                    );

                // Configurar defaults
                entity.Property(e => e.TieneGaraje)
                    .HasDefaultValue(false);

                entity.Property(e => e.EspaciosGaraje)
                    .HasDefaultValue(0);

                entity.Property(e => e.TienePiscina)
                    .HasDefaultValue(false);

                entity.Property(e => e.TieneJardin)
                    .HasDefaultValue(false);

                entity.Property(e => e.TieneSotano)
                    .HasDefaultValue(false);

                entity.Property(e => e.TieneAtico)
                    .HasDefaultValue(false);

                entity.Property(e => e.TieneTerraza)
                    .HasDefaultValue(false);

                entity.Property(e => e.TieneBalcon)
                    .HasDefaultValue(false);

                entity.Property(e => e.EsPrincipal)
                    .HasDefaultValue(false);

                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.FechaModificacion)
                    .HasDefaultValueSql("GETUTCDATE()");

                // Índices
                entity.HasIndex(e => e.TwinId)
                    .HasDatabaseName("IX_Casas_TwinId");

                entity.HasIndex(e => e.Tipo)
                    .HasDatabaseName("IX_Casas_Tipo");

                entity.HasIndex(e => e.EsPrincipal)
                    .HasDatabaseName("IX_Casas_EsPrincipal");

                entity.HasIndex(e => new { e.TwinId, e.EsPrincipal })
                    .HasDatabaseName("IX_Casas_TwinId_EsPrincipal");
            });
        }
    }
}

// Program.cs - Configuración de servicios
// Agregar estas líneas en Program.cs

builder.Services.AddScoped<ICasaService, CasaService>();
builder.Services.AddScoped<ICasaRepository, CasaRepository>();
