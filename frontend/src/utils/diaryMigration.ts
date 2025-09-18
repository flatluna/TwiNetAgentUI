// Utilidades para migración del DiaryEntry
import { DiaryEntry } from '@/types/DiaryEntry';

// Interfaz legacy para mantener compatibilidad
export interface LegacyDiaryEntry {
    id: string;
    fecha: string;
    hora?: string;
    nombreActividad: string;
    tipoActividad: string;
    descripcion: string;
    fotos?: string[];
    ubicacion?: string;
    participantes?: string;
    valoracion?: number;
    camposExtra?: { [key: string]: any };
    createdAt?: string;
    updatedAt?: string;
}

// Convertir de formato legacy a nuevo formato
export function convertLegacyToNew(legacy: LegacyDiaryEntry): DiaryEntry {
    const fechaCompleta = legacy.hora ? 
        `${legacy.fecha}T${legacy.hora}:00.000Z` : 
        `${legacy.fecha}T00:00:00.000Z`;

    return {
        // Identificación y control
        id: legacy.id,
        twinId: '', // Se asignará en runtime
        type: 'diary_entry',
        version: 1,
        eliminado: false,

        // Información básica
        titulo: legacy.nombreActividad,
        descripcion: legacy.descripcion,
        fecha: fechaCompleta,
        fechaCreacion: legacy.createdAt || new Date().toISOString(),
        fechaModificacion: legacy.updatedAt || new Date().toISOString(),

        // Categorización
        tipoActividad: legacy.tipoActividad,
        labelActividad: '',

        // Ubicación
        ubicacion: legacy.ubicacion || '',
        latitud: undefined,
        longitud: undefined,

        // Estado emocional y energía
        estadoEmocional: '',
        nivelEnergia: legacy.valoracion,

        // Todos los otros campos se inicializan como vacíos
        gastoTotal: undefined,
        productosComprados: '',
        tiendaLugar: '',
        metodoPago: '',
        categoriaCompra: '',
        satisfaccionCompra: undefined,

        costoComida: undefined,
        restauranteLugar: '',
        tipoCocina: '',
        platosOrdenados: '',
        calificacionComida: undefined,
        ambienteComida: '',
        recomendariaComida: undefined,

        costoViaje: undefined,
        destinoViaje: '',
        transporteViaje: '',
        propositoViaje: '',
        calificacionViaje: undefined,
        duracionViaje: undefined,

        costoEntretenimiento: undefined,
        calificacionEntretenimiento: undefined,
        tipoEntretenimiento: '',
        tituloNombre: '',
        lugarEntretenimiento: '',

        costoEjercicio: undefined,
        energiaPostEjercicio: undefined,
        caloriasQuemadas: undefined,
        tipoEjercicio: '',
        duracionEjercicio: undefined,
        intensidadEjercicio: undefined,
        lugarEjercicio: '',
        rutinaEspecifica: '',

        costoEstudio: undefined,
        dificultadEstudio: undefined,
        estadoAnimoPost: undefined,
        materiaTema: '',
        materialEstudio: '',
        duracionEstudio: undefined,
        progresoEstudio: undefined,

        horasTrabajadas: undefined,
        proyectoPrincipal: '',
        reunionesTrabajo: undefined,
        logrosHoy: '',
        desafiosTrabajo: '',
        moodTrabajo: undefined,

        costoSalud: undefined,
        tipoConsulta: '',
        profesionalCentro: '',
        motivoConsulta: '',
        tratamientoRecetado: '',
        proximaCita: undefined,

        contactoLlamada: '',
        duracionLlamada: undefined,
        motivoLlamada: '',
        temasConversacion: '',
        tipoLlamada: '',
        seguimientoLlamada: undefined,

        // Archivos
        pathFile: legacy.fotos?.[0] || '',
        sasUrl: '',

        // Campos legacy (deprecated)
        reciboCompra: '',
        reciboComida: '',
        reciboViaje: '',
        reciboEntretenimiento: '',
        reciboEjercicio: '',
        reciboEstudio: '',
        reciboSalud: ''
    };
}

// Convertir de nuevo formato a legacy para compatibilidad
export function convertNewToLegacy(entry: DiaryEntry): LegacyDiaryEntry {
    console.log('🔄 convertNewToLegacy input entry:', entry);
    
    const fechaDate = new Date(entry.fecha);
    const fecha = fechaDate.toISOString().split('T')[0];
    const hora = fechaDate.getHours() === 0 && fechaDate.getMinutes() === 0 ? 
        undefined : 
        fechaDate.toTimeString().substring(0, 5);

    const result: LegacyDiaryEntry = {
        id: entry.id,
        fecha,
        hora,
        nombreActividad: entry.titulo,
        tipoActividad: entry.tipoActividad,
        descripcion: entry.descripcion,
        fotos: entry.pathFile ? [entry.pathFile] : [],
        ubicacion: entry.ubicacion,
        participantes: (entry as any).participantes, // Agregar participantes desde el backend
        valoracion: entry.nivelEnergia,
        camposExtra: {
            estadoEmocional: entry.estadoEmocional,
            labelActividad: entry.labelActividad,
            
            // 🌍 Campos de ubicación detallados
            pais: (entry as any).pais,
            ciudad: (entry as any).ciudad,
            estado: (entry as any).estado,
            codigoPostal: (entry as any).codigoPostal,
            direccion: (entry as any).direccion || (entry as any).direccionEspecifica,
            distrito: (entry as any).distrito || (entry as any).distritoColonia,
            telefono: (entry as any).telefono,
            website: (entry as any).website,
            latitud: entry.latitud,
            longitud: entry.longitud,
            
            // Agregar otros campos importantes como extras
            ...(entry.gastoTotal && { gastoTotal: entry.gastoTotal }),
            ...(entry.costoComida && { costoComida: entry.costoComida }),
            ...(entry.costoViaje && { costoViaje: entry.costoViaje }),
            ...(entry.tipoEjercicio && { tipoEjercicio: entry.tipoEjercicio }),
            ...(entry.proyectoPrincipal && { proyectoPrincipal: entry.proyectoPrincipal }),
            ...(entry.tipoConsulta && { tipoConsulta: entry.tipoConsulta }),
            ...(entry.contactoLlamada && { contactoLlamada: entry.contactoLlamada })
        },
        createdAt: entry.fechaCreacion,
        updatedAt: entry.fechaModificacion
    };
    
    console.log('🔄 convertNewToLegacy result:', result);
    return result;
}

// Función para procesar respuesta del API
export function processApiResponse(response: any): LegacyDiaryEntry[] {
    console.log('🔄 processApiResponse input:', response);
    console.log('🔄 processApiResponse response type:', typeof response);
    
    if (Array.isArray(response)) {
        console.log('🔄 Processing as direct array');
        // Si es un array directo
        return response.map(item => {
            if (item.titulo) {
                console.log('🔄 Converting new format to legacy:', item);
                // Es formato nuevo, convertir a legacy
                return convertNewToLegacy(item);
            } else {
                console.log('🔄 Processing raw backend data:', item);
                // Procesar datos directos del backend
                return {
                    id: item.id,
                    fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '',
                    hora: item.fecha ? new Date(item.fecha).toTimeString().substring(0, 5) : undefined,
                    nombreActividad: item.titulo || 'Sin título',
                    tipoActividad: item.tipoActividad || 'otros',
                    descripcion: item.descripcion || '',
                    fotos: item.pathFile ? [item.pathFile] : [],
                    ubicacion: item.ubicacion || '',
                    participantes: item.participantes || '',
                    valoracion: item.nivelEnergia || 0,
                    camposExtra: {
                        estadoEmocional: item.estadoEmocional || '',
                        // 🌍 Campos de ubicación detallados del backend
                        pais: item.pais || '',
                        ciudad: item.ciudad || '',
                        estado: item.estado || '',
                        codigoPostal: item.codigoPostal || '',
                        direccion: item.direccionEspecifica || item.direccion || '',
                        distrito: item.distritoColonia || item.distrito || '',
                        telefono: item.telefono || '',
                        website: item.website || '',
                        latitud: item.latitud,
                        longitud: item.longitud,
                        // Otros campos específicos
                        gastoTotal: item.gastoTotal,
                        costoComida: item.costoComida,
                        restauranteLugar: item.restauranteLugar,
                        tipoCocina: item.tipoCocina,
                        platosOrdenados: item.platosOrdenados,
                        calificacionComida: item.calificacionComida,
                        ambienteComida: item.ambienteComida,
                        recomendariaComida: item.recomendariaComida
                    },
                    createdAt: item.fechaCreacion,
                    updatedAt: item.fechaModificacion
                };
            }
        });
    } else if (response.entries && Array.isArray(response.entries)) {
        console.log('🔄 Processing response.entries:', response.entries);
        // Es respuesta del nuevo API
        return response.entries.map((entry: DiaryEntry) => {
            console.log('🔄 Converting entry:', entry);
            const converted = convertNewToLegacy(entry);
            console.log('🔄 Converted result:', converted);
            return converted;
        });
    } else if (response.data && Array.isArray(response.data)) {
        console.log('🔄 Processing response.data:', response.data);
        // Es respuesta con wrapper data
        return response.data.map((item: any) => {
            if (item.titulo) {
                return convertNewToLegacy(item);
            } else {
                return item;
            }
        });
    }
    
    console.log('🔄 No matching format, returning empty array');
    return [];
}

// Función para preparar datos para envío al API
export function prepareForApi(legacy: LegacyDiaryEntry, twinId: string): any {
    const entry = convertLegacyToNew(legacy);
    entry.twinId = twinId;
    
    // Convertir a formato de request del backend
    return {
        titulo: entry.titulo,
        descripcion: entry.descripcion,
        fecha: entry.fecha,
        tipoActividad: entry.tipoActividad,
        labelActividad: entry.labelActividad,
        ubicacion: entry.ubicacion,
        latitud: entry.latitud,
        longitud: entry.longitud,
        estadoEmocional: entry.estadoEmocional,
        nivelEnergia: entry.nivelEnergia,
        
        // Campos específicos que no estén vacíos
        ...(entry.gastoTotal && { gastoTotal: entry.gastoTotal }),
        ...(entry.productosComprados && { productosComprados: entry.productosComprados }),
        ...(entry.tiendaLugar && { tiendaLugar: entry.tiendaLugar }),
        ...(entry.metodoPago && { metodoPago: entry.metodoPago }),
        ...(entry.categoriaCompra && { categoriaCompra: entry.categoriaCompra }),
        ...(entry.satisfaccionCompra && { satisfaccionCompra: entry.satisfaccionCompra }),
        
        ...(entry.costoComida && { costoComida: entry.costoComida }),
        ...(entry.restauranteLugar && { restauranteLugar: entry.restauranteLugar }),
        ...(entry.tipoCocina && { tipoCocina: entry.tipoCocina }),
        ...(entry.platosOrdenados && { platosOrdenados: entry.platosOrdenados }),
        ...(entry.calificacionComida && { calificacionComida: entry.calificacionComida }),
        ...(entry.ambienteComida && { ambienteComida: entry.ambienteComida }),
        ...(entry.recomendariaComida !== undefined && { recomendariaComida: entry.recomendariaComida }),
        
        // Archivo adjunto
        pathFile: entry.pathFile
    };
}
