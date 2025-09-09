// ===== TIPOS PARA EJERCICIOS (COINCIDE CON UI) =====

// Enum para intensidad del ejercicio
export type IntensidadEjercicio = "baja" | "moderada" | "alta";

// Detalle de ejercicios específicos
export interface EjercicioDetalle {
    nombre: string;
    series?: number;
    repeticiones?: number;
    peso?: number;
    tiempoSegundos?: number;
    distancia?: number;
}

// Interfaz principal para una actividad de ejercicio (coincide exactamente con UI)
export interface ActividadEjercicio {
    // Campos básicos
    id: string;
    fecha: string; // formato: YYYY-MM-DD
    tipoActividad: string; // de lista predefinida del UI
    
    // Duración y métricas
    duracionMinutos: number;
    intensidad: IntensidadEjercicio;
    calorias?: number;
    pasos?: number;
    distanciaKm?: number;
    
    // Frecuencia cardíaca
    frecuenciaCardiacaPromedio?: number;
    frecuenciaCardiacaMaxima?: number;
    
    // Ubicación y notas
    ubicacion?: string;
    notas?: string;
    
    // Nuevos campos agregados al UI
    nivelEsfuerzo?: number; // Escala 1-10
    hidratacionMl?: number; // Cantidad de agua en ml
    clima?: string; // Condiciones climáticas
    
    // Ejercicios detallados
    ejerciciosDetalle?: EjercicioDetalle[];
    
    // Campos de sistema
    fechaCreacion: string;
    fechaActualizacion: string;
}

// ===== TIPOS PARA API =====

// Request para crear nueva actividad
export interface CrearActividadRequest {
    fecha: string;
    tipoActividad: string;
    duracionMinutos: number;
    intensidad: IntensidadEjercicio;
    calorias?: number;
    pasos?: number;
    distanciaKm?: number;
    frecuenciaCardiacaPromedio?: number;
    frecuenciaCardiacaMaxima?: number;
    ubicacion?: string;
    notas?: string;
    ejerciciosDetalle?: EjercicioDetalle[];
}

// Request para actualizar actividad existente
export interface ActualizarActividadRequest extends CrearActividadRequest {
    id: string;
}

// Response estándar de la API
export interface ActividadResponse {
    exito: boolean;
    mensaje: string;
    actividad: ActividadEjercicio;
}

// Response para lista de actividades
export interface ListaActividadesResponse {
    exito: boolean;
    mensaje: string;
    actividades: ActividadEjercicio[];
    total: number;
}

// Filtros para búsqueda de actividades
export interface FiltrosActividad {
    fechaInicio?: string;
    fechaFin?: string;
    tipoActividad?: string;
    intensidad?: IntensidadEjercicio;
    ubicacion?: string;
    busqueda?: string; // búsqueda en notas
}

// ===== TIPOS PARA VALIDACIÓN =====
export type TipoActividad = 
    | 'Caminar' | 'Correr' | 'Ciclismo' | 'Natación' | 'Gimnasio' 
    | 'Yoga' | 'Pilates' | 'Futbol' | 'Basketball' | 'Tenis' 
    | 'Boxeo' | 'Escalada' | 'Baile' | 'Hiking' | 'Spinning' 
    | 'Crossfit' | 'Cardio' | 'Pesas' | 'Funcional' | 'Stretching' 
    | 'Remo' | 'Golf' | 'Esquí' | 'Surf' | 'Voleibol' | 'Otro';

export type IntensidadEjercicio = 'baja' | 'moderada' | 'alta';

export type EstadoAnimo = 'excelente' | 'bueno' | 'regular' | 'malo';

export type NivelEnergia = 'alto' | 'medio' | 'bajo';

export type TipoCompania = 'solo' | 'entrenador' | 'amigos' | 'grupo' | 'familia';

// ===== INTERFACES PARA API REQUESTS =====
export interface CrearActividadRequest {
    twinId: string;
    fecha: string;
    tipoActividad: TipoActividad;
    duracionMinutos: number;
    intensidad: IntensidadEjercicio;
    calorias?: number;
    pasos?: number;
    distanciaKm?: number;
    velocidadPromedio?: number;
    frecuenciaCardiacaPromedio?: number;
    frecuenciaCardiacaMaxima?: number;
    frecuenciaCardiacaMinima?: number;
    ubicacion?: string;
    clima?: string;
    temperatura?: number;
    ejerciciosDetalle?: EjercicioDetalle[];
    equipoUtilizado?: string[];
    pesoUtilizado?: number;
    nivelEsfuerzo?: number;
    estadoAnimo?: EstadoAnimo;
    nivelEnergia?: NivelEnergia;
    notas?: string;
    objetivoAlcanzado?: boolean;
    objetivoDescripcion?: string;
    logrosEspeciales?: string;
    tipoCompania?: TipoCompania;
    numeroCompaneros?: number;
    fotoAntes?: string;
    fotoDespues?: string;
    videoActividad?: string;
}

export interface ActualizarActividadRequest extends Partial<CrearActividadRequest> {
    id: string;
}

export interface FiltrosActividadRequest {
    twinId: string;
    fechaInicio?: string;
    fechaFin?: string;
    tiposActividad?: TipoActividad[];
    intensidades?: IntensidadEjercicio[];
    ubicaciones?: string[];
    busqueda?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: 'fecha' | 'duracion' | 'calorias' | 'fechaCreacion';
    ordenDireccion?: 'asc' | 'desc';
}

// ===== INTERFACES PARA API RESPONSES =====
export interface ActividadResponse {
    actividad: ActividadEjercicio;
    mensaje: string;
    exito: boolean;
}

export interface ListaActividadesResponse {
    actividades: ActividadEjercicio[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    exito: boolean;
}

export interface EstadisticasActividadResponse {
    // ===== ESTADÍSTICAS DIARIAS =====
    actividadesHoy: number;
    minutosHoy: number;
    caloriasHoy: number;
    pasosHoy: number;
    distanciaHoy: number;
    
    // ===== ESTADÍSTICAS SEMANALES =====
    actividadesSemana: number;
    minutosSemana: number;
    caloriasSemana: number;
    pasosSemana: number;
    distanciaSemana: number;
    
    // ===== ESTADÍSTICAS MENSUALES =====
    actividadesMes: number;
    minutosMes: number;
    caloriasMes: number;
    pasosMes: number;
    distanciaMes: number;
    
    // ===== PROMEDIOS =====
    duracionPromedio: number;
    caloriasPromedio: number;
    pasosPromedio: number;
    
    // ===== ACTIVIDADES MÁS FRECUENTES =====
    actividadesFrecuentes: Array<{
        tipoActividad: string;
        cantidad: number;
        tiempoTotal: number;
    }>;
    
    // ===== TENDENCIAS =====
    tendenciaActividad: 'creciente' | 'estable' | 'decreciente';
    rachaActual: number; // Días consecutivos con actividad
    
    exito: boolean;
}

// ===== VALIDACIONES DE CAMPOS =====
export const validacionesCampos = {
    duracionMinutos: { min: 1, max: 1440 }, // Máximo 24 horas
    calorias: { min: 0, max: 10000 },
    pasos: { min: 0, max: 100000 },
    distanciaKm: { min: 0, max: 500 },
    velocidadPromedio: { min: 0, max: 100 },
    frecuenciaCardiaca: { min: 40, max: 220 },
    temperatura: { min: -30, max: 60 },
    peso: { min: 0, max: 1000 },
    nivelEsfuerzo: { min: 1, max: 10 },
    numeroCompaneros: { min: 0, max: 100 },
    notas: { maxLength: 1000 },
    objetivoDescripcion: { maxLength: 500 },
    logrosEspeciales: { maxLength: 500 }
};

// ===== CONFIGURACIÓN DE VALORES POR DEFECTO =====
export const valoresPorDefecto = {
    intensidad: 'moderada' as IntensidadEjercicio,
    estadoAnimo: 'bueno' as EstadoAnimo,
    nivelEnergia: 'medio' as NivelEnergia,
    tipoCompania: 'solo' as TipoCompania,
    activo: true,
    sincronizado: false,
    objetivoAlcanzado: false,
    completado: true
};
