using System;
using System.ComponentModel.DataAnnotations;

namespace TwinNetAgentUI.Models
{
    /// <summary>
    /// Request completo para crear nueva entrada de diario con todos los campos del frontend
    /// </summary>
    public class CreateDiaryEntryRequest
    {
        // === CAMPOS BÁSICOS ===
        [Required(ErrorMessage = "Título is required")]
        [StringLength(200, ErrorMessage = "Título no puede exceder 200 caracteres")]
        public string Titulo { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Descripción is required")]
        public string Descripcion { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Fecha is required")]
        public DateTime Fecha { get; set; }
        
        [Required(ErrorMessage = "Tipo de actividad is required")]
        public string TipoActividad { get; set; } = string.Empty;
        
        public string LabelActividad { get; set; } = string.Empty;
        
        // === UBICACIÓN ===
        public string Ubicacion { get; set; } = string.Empty;
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        
        // === PARTICIPANTES ===
        public string Participantes { get; set; } = string.Empty;
        
        // === ESTADO EMOCIONAL ===
        public string EstadoEmocional { get; set; } = string.Empty;
        
        [Range(1, 5, ErrorMessage = "Nivel de energía debe estar entre 1 y 5")]
        public int? NivelEnergia { get; set; }
        
        // === COMPRAS ===
        public string ProductosComprados { get; set; } = string.Empty;
        public string TiendaLugar { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Gasto total debe ser positivo")]
        public decimal? GastoTotal { get; set; }
        public string MetodoPago { get; set; } = string.Empty;
        public string CategoriaCompra { get; set; } = string.Empty;
        public string ReciboCompra { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Satisfacción debe estar entre 1 y 5")]
        public int? SatisfaccionCompra { get; set; }
        
        // === COMIDA ===
        public string RestauranteLugar { get; set; } = string.Empty;
        public string TipoCocina { get; set; } = string.Empty;
        public string PlatosOrdenados { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo comida debe ser positivo")]
        public decimal? CostoComida { get; set; }
        public string ReciboComida { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Calificación debe estar entre 1 y 5")]
        public int? CalificacionComida { get; set; }
        public string AmbienteComida { get; set; } = string.Empty;
        public string RecomendariaComida { get; set; } = string.Empty;
        
        // === VIAJE ===
        public string DestinoViaje { get; set; } = string.Empty;
        public string TransporteViaje { get; set; } = string.Empty;
        public string PropositoViaje { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo viaje debe ser positivo")]
        public decimal? CostoViaje { get; set; }
        public string ReciboViaje { get; set; } = string.Empty;
        public string DuracionViaje { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Calificación debe estar entre 1 y 5")]
        public int? CalificacionViaje { get; set; }
        
        // === ENTRETENIMIENTO ===
        public string TipoEntretenimiento { get; set; } = string.Empty;
        public string TituloNombre { get; set; } = string.Empty;
        public string LugarEntretenimiento { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo entretenimiento debe ser positivo")]
        public decimal? CostoEntretenimiento { get; set; }
        public string ReciboEntretenimiento { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Calificación debe estar entre 1 y 5")]
        public int? CalificacionEntretenimiento { get; set; }
        public string RecomendacionEntretenimiento { get; set; } = string.Empty;
        
        // === EJERCICIO ===
        public string TipoEjercicio { get; set; } = string.Empty;
        public string DuracionEjercicio { get; set; } = string.Empty;
        public string IntensidadEjercicio { get; set; } = string.Empty;
        public string LugarEjercicio { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo ejercicio debe ser positivo")]
        public decimal? CostoEjercicio { get; set; }
        public string ReciboEjercicio { get; set; } = string.Empty;
        [Range(0, 10000, ErrorMessage = "Calorías debe ser un valor válido")]
        public int? CaloriasQuemadas { get; set; }
        public string RutinaEspecifica { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Energía post debe estar entre 1 y 5")]
        public int? EnergiaPostEjercicio { get; set; }
        
        // === ESTUDIO ===
        public string MateriaTema { get; set; } = string.Empty;
        public string MaterialEstudio { get; set; } = string.Empty;
        public string DuracionEstudio { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo estudio debe ser positivo")]
        public decimal? CostoEstudio { get; set; }
        public string ReciboEstudio { get; set; } = string.Empty;
        public string ProgresoEstudio { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Dificultad debe estar entre 1 y 5")]
        public int? DificultadEstudio { get; set; }
        
        // === SALUD/MEDICINA ===
        public string TipoConsulta { get; set; } = string.Empty;
        public string ProfesionalCentro { get; set; } = string.Empty;
        public string MotivoConsulta { get; set; } = string.Empty;
        public string TratamientoRecetado { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Costo salud debe ser positivo")]
        public decimal? CostoSalud { get; set; }
        public string ReciboSalud { get; set; } = string.Empty;
        public string ProximaCita { get; set; } = string.Empty;
        [Range(1, 5, ErrorMessage = "Estado de ánimo debe estar entre 1 y 5")]
        public int? EstadoAnimoPost { get; set; }
        
        // === LLAMADA ===
        public string ContactoLlamada { get; set; } = string.Empty;
        public string DuracionLlamada { get; set; } = string.Empty;
        public string MotivoLlamada { get; set; } = string.Empty;
        public string TemasConversacion { get; set; } = string.Empty;
        public string TipoLlamada { get; set; } = string.Empty;
        public string SeguimientoLlamada { get; set; } = string.Empty;
        
        // === TRABAJO ===
        public string ProyectoPrincipal { get; set; } = string.Empty;
        [Range(0, 24, ErrorMessage = "Horas trabajadas debe estar entre 0 y 24")]
        public int? HorasTrabajadas { get; set; }
        public string ReunionesTrabajo { get; set; } = string.Empty;
        public string LogrosHoy { get; set; } = string.Empty;
        public string DesafiosTrabajo { get; set; } = string.Empty;
        public string MoodTrabajo { get; set; } = string.Empty;
        
        // === CAMPOS GENERALES ADICIONALES ===
        public string CategoriaPersonal { get; set; } = string.Empty; // Para "otros"
        
        // === VALIDACIÓN PERSONALIZADA ===
        public bool IsValid()
        {
            // Validar que al menos uno de los campos específicos de actividad esté lleno
            return !string.IsNullOrEmpty(Titulo) && !string.IsNullOrEmpty(TipoActividad);
        }
        
        // === MÉTODO HELPER PARA OBTENER CAMPOS POR ACTIVIDAD ===
        public Dictionary<string, object> GetCamposActividad()
        {
            var campos = new Dictionary<string, object>();
            
            switch (TipoActividad?.ToLower())
            {
                case "compras":
                    if (!string.IsNullOrEmpty(ProductosComprados)) campos["productos_comprados"] = ProductosComprados;
                    if (!string.IsNullOrEmpty(TiendaLugar)) campos["tienda_lugar"] = TiendaLugar;
                    if (GastoTotal.HasValue) campos["gasto_total"] = GastoTotal.Value;
                    if (!string.IsNullOrEmpty(MetodoPago)) campos["metodo_pago"] = MetodoPago;
                    if (!string.IsNullOrEmpty(CategoriaCompra)) campos["categoria_compra"] = CategoriaCompra;
                    if (!string.IsNullOrEmpty(ReciboCompra)) campos["recibo_compra"] = ReciboCompra;
                    if (SatisfaccionCompra.HasValue) campos["satisfaccion"] = SatisfaccionCompra.Value;
                    break;
                    
                case "comida":
                    if (!string.IsNullOrEmpty(RestauranteLugar)) campos["restaurante_lugar"] = RestauranteLugar;
                    if (!string.IsNullOrEmpty(TipoCocina)) campos["tipo_cocina"] = TipoCocina;
                    if (!string.IsNullOrEmpty(PlatosOrdenados)) campos["platos_ordenados"] = PlatosOrdenados;
                    if (CostoComida.HasValue) campos["costo_comida"] = CostoComida.Value;
                    if (!string.IsNullOrEmpty(ReciboComida)) campos["recibo_comida"] = ReciboComida;
                    if (CalificacionComida.HasValue) campos["calificacion_comida"] = CalificacionComida.Value;
                    if (!string.IsNullOrEmpty(AmbienteComida)) campos["ambiente"] = AmbienteComida;
                    if (!string.IsNullOrEmpty(RecomendariaComida)) campos["recomendaria"] = RecomendariaComida;
                    break;
                    
                case "viaje":
                    if (!string.IsNullOrEmpty(DestinoViaje)) campos["destino"] = DestinoViaje;
                    if (!string.IsNullOrEmpty(TransporteViaje)) campos["transporte"] = TransporteViaje;
                    if (!string.IsNullOrEmpty(PropositoViaje)) campos["proposito"] = PropositoViaje;
                    if (CostoViaje.HasValue) campos["costo_viaje"] = CostoViaje.Value;
                    if (!string.IsNullOrEmpty(ReciboViaje)) campos["recibo_viaje"] = ReciboViaje;
                    if (!string.IsNullOrEmpty(DuracionViaje)) campos["duracion_viaje"] = DuracionViaje;
                    if (CalificacionViaje.HasValue) campos["calificacion_viaje"] = CalificacionViaje.Value;
                    break;
                    
                // Agregar casos para otros tipos de actividad...
            }
            
            return campos;
        }
    }
}
