// ===== TIPOS PARA DIARIO PERSONAL =====
// Interfaces que coinciden exactamente con el backend C# DiaryEntry

export interface DiaryEntry {
    // ===== IDENTIFICACIÓN Y CONTROL =====
    id: string;
    twinId: string;
    type: string;
    version: number;
    eliminado: boolean;

    // ===== INFORMACIÓN BÁSICA =====
    titulo: string;
    descripcion: string;
    fecha: string; // DateTime en formato ISO
    fechaCreacion: string;
    fechaModificacion: string;

    // ===== CATEGORIZACIÓN =====
    tipoActividad: string;
    labelActividad: string;

    // ===== UBICACIÓN =====
    ubicacion: string;
    latitud?: number;
    longitud?: number;
    participantes?: string; // Personas que participaron
    
    // ===== UBICACIÓN DETALLADA =====
    pais?: string; // País
    ciudad?: string; // Ciudad
    estado?: string; // Estado/Provincia/Región
    codigoPostal?: string; // Código Postal/ZIP
    direccion?: string; // Dirección específica (calle, número)
    distrito?: string; // Distrito/Barrio/Colonia
    telefono?: string; // Teléfono del lugar (extraído de Google Places)
    website?: string; // Website del lugar (extraído de Google Places)

    // ===== ESTADO EMOCIONAL Y ENERGÍA =====
    estadoEmocional: string;
    nivelEnergia?: number; // 1-5

    // ===== ACTIVIDADES COMERCIALES (COMPRAS) =====
    gastoTotal?: number;
    productosComprados: string;
    tiendaLugar: string;
    metodoPago: string;
    categoriaCompra: string;
    satisfaccionCompra?: number; // 1-5

    // ===== ACTIVIDADES GASTRONÓMICAS =====
    costoComida?: number;
    restauranteLugar: string;
    tipoCocina: string;
    platosOrdenados: string;
    calificacionComida?: number; // 1-5
    ambienteComida: string;
    recomendariaComida?: boolean;

    // ===== ACTIVIDADES DE VIAJE =====
    costoViaje?: number;
    destinoViaje: string;
    transporteViaje: string;
    propositoViaje: string;
    calificacionViaje?: number; // 1-5
    duracionViaje?: number; // horas

    // ===== ACTIVIDADES DE ENTRETENIMIENTO =====
    costoEntretenimiento?: number;
    calificacionEntretenimiento?: number; // 1-5
    tipoEntretenimiento: string;
    tituloNombre: string;
    lugarEntretenimiento: string;

    // ===== ACTIVIDADES DE EJERCICIO =====
    costoEjercicio?: number;
    energiaPostEjercicio?: number; // 1-5
    caloriasQuemadas?: number;
    tipoEjercicio: string;
    duracionEjercicio?: number; // minutos
    intensidadEjercicio?: number; // 1-5
    lugarEjercicio: string;
    rutinaEspecifica: string;

    // ===== ACTIVIDADES DE ESTUDIO =====
    costoEstudio?: number;
    dificultadEstudio?: number; // 1-5
    estadoAnimoPost?: number; // 1-5
    materiaTema: string;
    materialEstudio: string;
    duracionEstudio?: number; // minutos
    progresoEstudio?: number; // 1-5

    // ===== ACTIVIDADES DE TRABAJO =====
    horasTrabajadas?: number; // 0-24
    proyectoPrincipal: string;
    reunionesTrabajo?: number;
    logrosHoy: string;
    desafiosTrabajo: string;
    moodTrabajo?: number; // 1-5

    // ===== ACTIVIDADES DE SALUD =====
    costoSalud?: number;
    tipoConsulta: string;
    profesionalCentro: string;
    motivoConsulta: string;
    tratamientoRecetado: string;
    proximaCita?: string; // DateTime en formato ISO

    // ===== ACTIVIDADES DE COMUNICACIÓN (LLAMADAS) =====
    contactoLlamada: string;
    duracionLlamada?: number; // minutos
    motivoLlamada: string;
    temasConversacion: string;
    tipoLlamada: string;
    seguimientoLlamada?: boolean;

    // ===== ARCHIVOS Y DOCUMENTOS =====
    pathFile: string; // Campo unificado para archivos
    sasUrl: string; // URL SAS para acceso al archivo

    // ===== CAMPOS ADICIONALES PARA FRONTEND =====
    nombreActividad?: string; // Alias para titulo
    hora?: string; // Hora extraída de fecha
    valoracion?: number; // Alias para nivelEnergia
    camposExtra?: { [key: string]: any }; // Campos dinámicos adicionales
    fotos?: string[]; // URLs de fotos
    createdAt?: string; // Alias para fechaCreacion
    updatedAt?: string; // Alias para fechaModificacion

    // ===== CAMPOS LEGACY (deprecated pero mantenidos por compatibilidad) =====
    reciboCompra: string;
    reciboComida: string;
    reciboViaje: string;
    reciboEntretenimiento: string;
    reciboEjercicio: string;
    reciboEstudio: string;
    reciboSalud: string;
}

// ===== REQUEST MODELS =====

export interface CreateDiaryEntryRequest {
    titulo: string;
    descripcion: string;
    fecha: string; // DateTime en formato ISO
    tipoActividad: string;
    labelActividad: string;
    ubicacion: string;
    latitud?: number;
    longitud?: number;
    participantes?: string; // Personas que participaron
    
    // Ubicación detallada
    pais?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    direccion?: string;
    distrito?: string;
    telefono?: string;
    website?: string;
    
    estadoEmocional: string;
    nivelEnergia?: number;

    // Campos específicos por actividad
    gastoTotal?: number;
    productosComprados: string;
    tiendaLugar: string;
    metodoPago: string;
    categoriaCompra: string;
    satisfaccionCompra?: number;

    costoComida?: number;
    restauranteLugar: string;
    tipoCocina: string;
    platosOrdenados: string;
    calificacionComida?: number;
    ambienteComida: string;
    recomendariaComida?: boolean;

    costoViaje?: number;
    destinoViaje: string;
    transporteViaje: string;
    propositoViaje: string;
    calificacionViaje?: number;
    duracionViaje?: number;

    costoEntretenimiento?: number;
    calificacionEntretenimiento?: number;
    tipoEntretenimiento: string;
    tituloNombre: string;
    lugarEntretenimiento: string;

    costoEjercicio?: number;
    energiaPostEjercicio?: number;
    caloriasQuemadas?: number;
    tipoEjercicio: string;
    duracionEjercicio?: number;
    intensidadEjercicio?: number;
    lugarEjercicio: string;
    rutinaEspecifica: string;

    costoEstudio?: number;
    dificultadEstudio?: number;
    estadoAnimoPost?: number;
    materiaTema: string;
    materialEstudio: string;
    duracionEstudio?: number;
    progresoEstudio?: number;

    horasTrabajadas?: number;
    proyectoPrincipal: string;
    reunionesTrabajo?: number;
    logrosHoy: string;
    desafiosTrabajo: string;
    moodTrabajo?: number;

    costoSalud?: number;
    tipoConsulta: string;
    profesionalCentro: string;
    motivoConsulta: string;
    tratamientoRecetado: string;
    proximaCita?: string;

    contactoLlamada: string;
    duracionLlamada?: number;
    motivoLlamada: string;
    temasConversacion: string;
    tipoLlamada: string;
    seguimientoLlamada?: boolean;

    // Archivo adjunto
    pathFile: string;

    // Campos legacy (deprecated)
    reciboCompra: string;
    reciboComida: string;
    reciboViaje: string;
    reciboEntretenimiento: string;
    reciboEjercicio: string;
    reciboEstudio: string;
    reciboSalud: string;
}

export interface UpdateDiaryEntryRequest {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    tipoActividad?: string;
    labelActividad?: string;
    ubicacion?: string;
    latitud?: number;
    longitud?: number;
    participantes?: string; // Personas que participaron
    
    // Ubicación detallada
    pais?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    direccion?: string;
    distrito?: string;
    telefono?: string;
    website?: string;
    
    estadoEmocional?: string;
    nivelEnergia?: number;

    // Campos específicos por actividad (todos opcionales para update)
    gastoTotal?: number;
    productosComprados?: string;
    tiendaLugar?: string;
    metodoPago?: string;
    categoriaCompra?: string;
    satisfaccionCompra?: number;

    costoComida?: number;
    restauranteLugar?: string;
    tipoCocina?: string;
    platosOrdenados?: string;
    calificacionComida?: number;
    ambienteComida?: string;
    recomendariaComida?: boolean;

    costoViaje?: number;
    destinoViaje?: string;
    transporteViaje?: string;
    propositoViaje?: string;
    calificacionViaje?: number;
    duracionViaje?: number;

    costoEntretenimiento?: number;
    calificacionEntretenimiento?: number;
    tipoEntretenimiento?: string;
    tituloNombre?: string;
    lugarEntretenimiento?: string;

    costoEjercicio?: number;
    energiaPostEjercicio?: number;
    caloriasQuemadas?: number;
    tipoEjercicio?: string;
    duracionEjercicio?: number;
    intensidadEjercicio?: number;
    lugarEjercicio?: string;
    rutinaEspecifica?: string;

    costoEstudio?: number;
    dificultadEstudio?: number;
    estadoAnimoPost?: number;
    materiaTema?: string;
    materialEstudio?: string;
    duracionEstudio?: number;
    progresoEstudio?: number;

    horasTrabajadas?: number;
    proyectoPrincipal?: string;
    reunionesTrabajo?: number;
    logrosHoy?: string;
    desafiosTrabajo?: string;
    moodTrabajo?: number;

    costoSalud?: number;
    tipoConsulta?: string;
    profesionalCentro?: string;
    motivoConsulta?: string;
    tratamientoRecetado?: string;
    proximaCita?: string;

    contactoLlamada?: string;
    duracionLlamada?: number;
    motivoLlamada?: string;
    temasConversacion?: string;
    tipoLlamada?: string;
    seguimientoLlamada?: boolean;

    // Archivo adjunto
    pathFile?: string;

    // Campos legacy (deprecated)
    reciboCompra?: string;
    reciboComida?: string;
    reciboViaje?: string;
    reciboEntretenimiento?: string;
    reciboEjercicio?: string;
    reciboEstudio?: string;
    reciboSalud?: string;
}

// ===== QUERY PARAMETERS =====

export interface DiaryEntryQuery {
    tipoActividad?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    ubicacion?: string;
    estadoEmocional?: string;
    nivelEnergiaMin?: number;
    gastoMaximo?: number;
    searchTerm?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
}

// ===== RESPONSE MODELS =====

export interface DiaryEntryResponse {
    success: boolean;
    message?: string;
    errorMessage?: string;
    entry?: DiaryEntry;
    entries?: DiaryEntry[];
    stats?: DiaryStats;
    totalEntries: number;
    twinId: string;
    uploadedReceipts?: any[];
}

export interface DiaryStats {
    totalEntries: number;
    byActivityType: Record<string, number>;
    byEmotionalState: Record<string, number>;
    totalSpent: number;
    averageEnergyLevel: number;
    totalCaloriesBurned: number;
    totalHoursWorked: number;
    spendingByCategory: Record<string, number>;
    topLocations: string[];
    mostRecentEntry?: string;
    oldestEntry?: string;
}

// ===== TIPOS Y ENUMS ÚTILES =====

export type TipoActividad = 
    | 'Compras'
    | 'Comida'
    | 'Viaje'
    | 'Entretenimiento'
    | 'Ejercicio'
    | 'Estudio'
    | 'Trabajo'
    | 'Salud'
    | 'Llamadas'
    | 'Personal';

export type EstadoEmocional = 
    | 'Muy Feliz'
    | 'Feliz'
    | 'Neutral'
    | 'Triste'
    | 'Muy Triste'
    | 'Enojado'
    | 'Ansioso'
    | 'Relajado'
    | 'Motivado'
    | 'Cansado';

export type MetodoPago = 
    | 'Efectivo'
    | 'Tarjeta de Crédito'
    | 'Tarjeta de Débito'
    | 'Transferencia'
    | 'PayPal'
    | 'Otro';

export type TipoTransporte = 
    | 'Caminando'
    | 'Bicicleta'
    | 'Auto'
    | 'Transporte Público'
    | 'Avión'
    | 'Tren'
    | 'Taxi/Uber'
    | 'Otro';

export type IntensidadEjercicio = 
    | 'Muy Baja'
    | 'Baja'
    | 'Moderada'
    | 'Alta'
    | 'Muy Alta';
