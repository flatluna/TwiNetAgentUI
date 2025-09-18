/**
 * API service para viajes de vacaciones, turismo y aventuras
 */

// En desarrollo, usar proxy de Vite (rutas relativas /api)
// En producción, usar la URL completa
const API_BASE_URL = import.meta.env.DEV 
    ? '' // Usar rutas relativas para que Vite proxy las redirija
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

console.log('✈️ ViajesApiService - API_BASE_URL configured as:', API_BASE_URL || 'RELATIVE PATHS (using Vite proxy)');

const API_KEY = import.meta.env.VITE_API_KEY || '';

// Enum para las fases del viaje
export enum FaseViaje {
    PLANEACION = 'planeacion',
    BOOKINGS = 'bookings', 
    EN_CURSO = 'en_curso',
    FINALIZADO = 'finalizado'
}

// Interfaz para booking de hotel
export interface BookingHotel {
    id?: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    pais: string;
    fechaCheckIn: string;
    fechaCheckOut: string;
    numeroNoches: number;
    tipoHabitacion: string;
    precioTotal: number;
    moneda: string;
    numeroConfirmacion?: string;
    telefono?: string;
    email?: string;
    archivoConfirmacion?: ArchivoAdjunto[];
    cancelacionGratuita?: boolean;
    fechaCancelacionLimite?: string;
    politicaCancelacion?: string;
    serviciosIncluidos?: string[];
    calificacionHotel?: number;
    notas?: string;
}

// Interfaz para booking de vuelo
export interface BookingVuelo {
    id?: string;
    aerolinea: string;
    numeroVuelo: string;
    origen: string;
    destino: string;
    fechaIda: string;
    horaIda: string;
    fechaVuelta?: string;
    horaVuelta?: string;
    tipoVuelo: 'ida' | 'ida_vuelta';
    clase: 'economica' | 'premium_economy' | 'business' | 'primera';
    pasajeros: string[];
    precioTotal: number;
    moneda: string;
    numeroConfirmacion?: string;
    codigoReserva?: string;
    equipajeIncluido?: boolean;
    pesoEquipaje?: number;
    asientosSeleccionados?: string[];
    archivoConfirmacion?: ArchivoAdjunto[];
    seguroViaje?: boolean;
    fechaLimiteCheckIn?: string;
    terminal?: string;
    puertaEmbarque?: string;
    notas?: string;
}

// Interfaz para otros bookings (tours, transporte, etc.)
export interface OtroBooking {
    id?: string;
    tipo: 'tour' | 'transporte' | 'actividad' | 'seguro' | 'otro';
    nombre: string;
    proveedor?: string;
    descripcion?: string;
    fecha?: string;
    hora?: string;
    duracion?: string;
    ubicacion?: string;
    precioTotal: number;
    moneda: string;
    numeroConfirmacion?: string;
    archivoConfirmacion?: ArchivoAdjunto[];
    politicaCancelacion?: string;
    incluyeTransporte?: boolean;
    incluyeComida?: boolean;
    notas?: string;
}

// Interfaz para dashboard de costos finales
export interface DashboardCostos {
    id?: string;
    viajeId: string;
    
    // Costos desglosados
    costosHoteles: number;
    costosVuelos: number;
    costosOtros: number;
    costosActividades: number;
    
    // Totales
    totalBookings: number;
    totalGastado: number;
    presupuestoOriginal: number;
    diferencia: number;
    porcentajeGastado: number;
    
    // Análisis detallado
    desglosePorDia: {
        fecha: string;
        total: number;
    }[];
    desglosePorTipoActividad: {
        [tipo: string]: number;
    };
    
    // Estadísticas
    diaConMayorGasto: {
        fecha: string;
        total: number;
    };
    tipoActividadMasCostosa: {
        tipo: string;
        total: number;
    };
    
    // Metadata
    monedaPrincipal: string;
    fechaGeneracion: string;
}

// Interfaz para registro diario del viaje
export interface RegistroDiario {
    id?: string;
    viajeId?: string;
    fecha: string; // Fecha específica del registro
    actividades: ActividadDiaria[];
    gastosTotalDia?: number;
    moneda?: string;
    notas?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

// Interfaz para cada actividad del día
export interface ActividadDiaria {
    id?: string;
    nombre: string; // Nombre de la actividad
    tipo: 'desayuno' | 'almuerzo' | 'cena' | 'museo' | 'tour' | 'compras' | 'transporte' | 'hotel' | 'entretenimiento' | 'otro';
    lugar: string; // Nombre del lugar (restaurante, museo, hotel, etc.)
    direccion?: string; // Dirección del lugar
    horaInicio?: string; // Hora de inicio (HH:mm)
    horaFin?: string; // Hora de fin (HH:mm)
    costo?: number; // Costo de la actividad
    moneda?: string;
    descripcion?: string; // Descripción de la actividad
    calificacion?: number; // Calificación de 1-5
    archivosAdjuntos?: ArchivoAdjunto[]; // Recibos, tickets, etc.
}

// Interfaz para archivos adjuntos (recibos, tickets, etc.)
export interface ArchivoAdjunto {
    id?: string;
    nombre: string;
    tipo: 'recibo' | 'ticket' | 'factura' | 'comprobante' | 'foto' | 'otro';
    url: string;
    tamaño?: number;
    fechaSubida?: string;
    descripcion?: string;
}

// Interfaz para segmento de ciudad en el itinerario
export interface SegmentoCiudad {
    id?: string;
    ciudad: string;
    pais: string;
    fechaLlegada: string;
    fechaSalida: string;
    numeroNoches: number;
    presupuestoHotel?: number;
    presupuestoActividades?: number;
    presupuestoComida?: number;
    notas?: string;
    orden: number; // Para mantener el orden del itinerario
}

// Interfaz para conexión de transporte entre ciudades
export interface ConexionTransporte {
    id?: string;
    origen: string; // Ciudad origen
    destino: string; // Ciudad destino
    tipoTransporte: 'avion' | 'tren' | 'autobus' | 'auto' | 'barco';
    fecha: string;
    hora?: string;
    duracionEstimada?: string; // "2h 30m"
    presupuestoEstimado?: number;
    aerolinea?: string; // Si es avión
    numeroVuelo?: string;
    notas?: string;
    orden: number;
}

// Interfaz para el itinerario completo
export interface ItinerarioViaje {
    id?: string;
    viajeId?: string;
    ciudades: SegmentoCiudad[];
    conexiones: ConexionTransporte[];
    ciudadOrigen: string; // Ciudad desde donde parte
    paisOrigen: string;
    fechaInicioViaje: string;
    fechaFinViaje: string;
    duracionTotalDias: number;
    presupuestoTotal?: number;
    moneda: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

// INTERFAZ PRINCIPAL DEL VIAJE
export interface Viaje {
    id?: string;
    twinId?: string;
    
    // FASE DEL VIAJE
    fase: FaseViaje;
    
    tipoViaje: 'vacaciones' | 'turismo' | 'aventura' | 'trabajo' | 'otro';
    titulo: string;
    descripcion?: string;
    
    // Información de destino
    pais: string;
    ciudad: string;
    lugaresVisitados: string[]; // Lugares famosos visitados
    
    // Fechas
    fechaInicio: string;
    fechaFin?: string;
    duracionDias?: number;
    
    // Información del viaje
    motivoViaje: string;
    acompanantes: string[]; // Con quién viajó
    medioTransporte: 'avion' | 'auto' | 'tren' | 'barco' | 'autobus' | 'otro';
    
    // Experiencias generales
    lugarFavorito?: string;
    comidaTypica?: string;
    experienciaDestacada?: string;
    
    // FASE 1: PLANEACIÓN - Información práctica
    presupuestoTotal?: number;
    moneda?: string;
    calificacionExperiencia?: number; // 1-5 estrellas
    
    // FASE 2: BOOKINGS
    bookingsHoteles?: BookingHotel[];
    bookingsVuelos?: BookingVuelo[];
    otrosBookings?: OtroBooking[];
    totalBookings?: number; // Calculado automáticamente
    
    // FASE 3: EN CURSO - Registros diarios
    registrosDiarios?: RegistroDiario[];
    gastoRealActividades?: number; // Calculado desde registros diarios
    
    // FASE 4: FINALIZADO - Dashboard y análisis
    dashboardCostos?: DashboardCostos;
    gastoTotal?: number; // bookings + actividades diarias
    diferenciaPorcentual?: number; // (gastoTotal - presupuesto) / presupuesto * 100
    
    // Itinerarios del viaje
    itinerarios?: any[]; // Array de itinerarios asociados al viaje
    
    // Multimedia
    fotos?: string[];
    videos?: string[];
    recuerdos?: string[]; // Souvenirs, etc.
    
    // Metadata
    fechaCreacion?: string;
    fechaActualizacion?: string;
    notas?: string;
}

// Interfaz para respuestas de la API
export interface ViajeResponse {
    success: boolean;
    data: Viaje;
    message: string;
}

export interface ViajesListResponse {
    success: boolean;
    data: Viaje[];
    message: string;
}

// Interfaz para datos del formulario (FASE 1 - PLANEACIÓN)
export interface ViajeFormData {
    // La fase siempre inicia en PLANEACION
    tipoViaje: 'vacaciones' | 'turismo' | 'aventura' | 'trabajo' | 'otro';
    titulo: string;
    descripcion?: string;
    pais: string;
    ciudad: string;
    lugaresVisitados: string[];
    fechaInicio: string;
    fechaFin?: string;
    motivoViaje: string;
    acompanantes: string[];
    medioTransporte: 'avion' | 'auto' | 'tren' | 'barco' | 'autobus' | 'otro';
    lugarFavorito?: string;
    comidaTypica?: string;
    experienciaDestacada?: string;
    presupuestoTotal?: number;
    moneda?: string;
    alojamiento?: string;
    calificacionExperiencia?: number;
    notas?: string;
}

// Datos de países y sus ciudades/lugares famosos
export const PAISES_CIUDADES_LUGARES = {
    'España': {
        ciudades: {
            'Madrid': ['Museo del Prado', 'Palacio Real', 'Puerta del Sol', 'Parque del Retiro', 'Gran Vía'],
            'Barcelona': ['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Casa Batlló', 'Barrio Gótico'],
            'Sevilla': ['Catedral de Sevilla', 'Alcázar', 'Plaza de España', 'Barrio de Santa Cruz', 'Torre del Oro'],
            'Valencia': ['Ciudad de las Artes y las Ciencias', 'Mercado Central', 'Playa de la Malvarrosa', 'Catedral de Valencia'],
            'Bilbao': ['Museo Guggenheim', 'Casco Viejo', 'Puente de Bizkaia', 'Monte Artxanda']
        }
    },
    'Francia': {
        ciudades: {
            'París': ['Torre Eiffel', 'Museo del Louvre', 'Notre-Dame', 'Arco del Triunfo', 'Champs-Élysées'],
            'Niza': ['Promenade des Anglais', 'Vieux Nice', 'Château de Nice', 'Playa de Niza'],
            'Lyon': ['Vieux Lyon', 'Basilique Notre-Dame de Fourvière', 'Parc de la Tête d\'Or'],
            'Marsella': ['Puerto Viejo', 'Basílica Notre-Dame de la Garde', 'Château d\'If']
        }
    },
    'Italia': {
        ciudades: {
            'Roma': ['Coliseo', 'Vaticano', 'Fontana di Trevi', 'Panteón', 'Foro Romano'],
            'Venecia': ['Plaza San Marcos', 'Puente de Rialto', 'Gran Canal', 'Palacio Ducal'],
            'Florencia': ['Duomo', 'Ponte Vecchio', 'Galería Uffizi', 'Plaza de la Señoría'],
            'Milán': ['Duomo de Milán', 'Teatro La Scala', 'Castillo Sforzesco', 'Quadrilátero de la Moda']
        }
    },
    'Estados Unidos': {
        ciudades: {
            'Nueva York': ['Estatua de la Libertad', 'Times Square', 'Central Park', 'Empire State Building', 'Brooklyn Bridge'],
            'Los Ángeles': ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Griffith Observatory', 'Venice Beach'],
            'San Francisco': ['Golden Gate Bridge', 'Alcatraz', 'Fisherman\'s Wharf', 'Lombard Street'],
            'Las Vegas': ['Strip de Las Vegas', 'Bellagio', 'Caesars Palace', 'Fremont Street'],
            'Miami': ['South Beach', 'Art Deco District', 'Little Havana', 'Wynwood Walls']
        }
    },
    'México': {
        ciudades: {
            'Ciudad de México': ['Zócalo', 'Templo Mayor', 'Palacio de Bellas Artes', 'Xochimilco', 'Frida Kahlo Museum'],
            'Cancún': ['Zona Hotelera', 'Chichen Itzá', 'Isla Mujeres', 'Xcaret', 'Tulum'],
            'Guadalajara': ['Centro Histórico', 'Instituto Cultural Cabañas', 'Tlaquepaque', 'Tequila'],
            'Puerto Vallarta': ['Malecón', 'Zona Romántica', 'Islas Marietas', 'Playa de los Muertos']
        }
    },
    'Reino Unido': {
        ciudades: {
            'Londres': ['Big Ben', 'Tower Bridge', 'Buckingham Palace', 'British Museum', 'London Eye'],
            'Edimburgo': ['Castillo de Edimburgo', 'Royal Mile', 'Arthur\'s Seat', 'Princes Street'],
            'Liverpool': ['Albert Dock', 'Cavern Club', 'The Beatles Story', 'Liverpool Cathedral']
        }
    },
    'Japón': {
        ciudades: {
            'Tokio': ['Torre de Tokio', 'Templo Senso-ji', 'Shibuya Crossing', 'Palacio Imperial', 'Harajuku'],
            'Kioto': ['Templo Kiyomizu-dera', 'Bosque de Bambú de Arashiyama', 'Fushimi Inari', 'Gion'],
            'Osaka': ['Castillo de Osaka', 'Dotonbori', 'Universal Studios Japan', 'Sumiyoshi Taisha']
        }
    },
    'Brasil': {
        ciudades: {
            'Río de Janeiro': ['Cristo Redentor', 'Pan de Azúcar', 'Copacabana', 'Ipanema', 'Lapa'],
            'São Paulo': ['Avenida Paulista', 'Mercado Municipal', 'Beco do Batman', 'Pinacoteca'],
            'Salvador': ['Pelourinho', 'Elevador Lacerda', 'Mercado Modelo', 'Igreja do Bonfim']
        }
    },
    'Argentina': {
        ciudades: {
            'Buenos Aires': ['Plaza de Mayo', 'La Boca', 'Puerto Madero', 'Recoleta', 'San Telmo'],
            'Mendoza': ['Aconcagua', 'Viñedos', 'Cerro de la Gloria', 'Parque San Martín'],
            'Bariloche': ['Cerro Catedral', 'Lago Nahuel Huapi', 'Centro Cívico', 'Cerro Campanario']
        }
    }
};

class ViajesApiService {
    private BASE_PATH = '/api/twins';

    // Método genérico para hacer requests
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        console.log('✈️ Making request to:', url);
        console.log('✈️ Request options:', options);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('✈️ API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✈️ Response data:', data);
        return data;
    }

    // Obtener todos los viajes de un twin
    async getViajes(twinId: string): Promise<ViajesListResponse> {
        console.log('✈️ Obteniendo viajes para twin:', twinId);
        
        try {
            const data = await this.makeRequest<Viaje[]>(
                `${this.BASE_PATH}/${twinId}/viajes`
            );
            
            console.log('✅ Viajes obtenidos exitosamente:', data);
            return {
                success: true,
                data,
                message: 'Viajes obtenidos exitosamente'
            };
        } catch (error) {
            console.error('❌ Error obteniendo viajes:', error);
            return {
                success: false,
                data: [],
                message: 'Error al obtener los viajes'
            };
        }
    }

    // Obtener viajes por tipo
    async getViajesPorTipo(twinId: string, tipo: string): Promise<ViajesListResponse> {
        console.log('✈️ Obteniendo viajes por tipo:', tipo);
        
        try {
            const data = await this.makeRequest<Viaje[]>(
                `${this.BASE_PATH}/${twinId}/viajes?tipo=${tipo}`
            );
            
            console.log('✅ Viajes por tipo obtenidos exitosamente:', data);
            return {
                success: true,
                data,
                message: 'Viajes obtenidos exitosamente'
            };
        } catch (error) {
            console.error('❌ Error obteniendo viajes por tipo:', error);
            return {
                success: false,
                data: [],
                message: 'Error al obtener los viajes'
            };
        }
    }

    // Obtener viaje específico por ID
    async getViajeById(twinId: string, viajeId: string): Promise<ViajeResponse> {
        console.log('✈️ Obteniendo viaje específico:', viajeId);
        
        try {
            const data = await this.makeRequest<Viaje>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}`
            );
            
            console.log('✅ Viaje obtenido exitosamente:', data);
            return {
                success: true,
                data,
                message: 'Viaje obtenido exitosamente'
            };
        } catch (error) {
            console.error('❌ Error obteniendo viaje:', error);
            return {
                success: false,
                data: {} as Viaje,
                message: 'Error al obtener el viaje'
            };
        }
    }

    // Crear nuevo viaje
    async crearViaje(twinId: string, viajeData: ViajeFormData): Promise<ViajeResponse> {
        console.log('✈️ Creando nuevo viaje:', viajeData);
        
        try {
            // Calcular duración en días si hay fecha fin
            const duracionDias = viajeData.fechaFin ? 
                Math.ceil((new Date(viajeData.fechaFin).getTime() - new Date(viajeData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) 
                : undefined;

            const viajeCompleto = {
                ...viajeData,
                twinId,
                fase: FaseViaje.PLANEACION, // Siempre inicia en planeación
                duracionDias,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            const data = await this.makeRequest<Viaje>(
                `${this.BASE_PATH}/${twinId}/viajes`,
                {
                    method: 'POST',
                    body: JSON.stringify(viajeCompleto)
                }
            );
            
            console.log('✅ Viaje creado exitosamente - RAW data:', data);
            console.log('✅ ID del viaje creado:', data?.id);
            return {
                success: true,
                data,
                message: 'Viaje creado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error creando viaje:', error);
            return {
                success: false,
                data: {} as Viaje,
                message: 'Error al crear el viaje'
            };
        }
    }

    // Actualizar viaje existente
    async actualizarViaje(twinId: string, viajeId: string, viajeData: Partial<ViajeFormData>): Promise<ViajeResponse> {
        console.log('✈️ Actualizando viaje:', viajeId, viajeData);
        
        try {
            // Calcular duración si se están actualizando las fechas
            const duracionDias = (viajeData.fechaFin && viajeData.fechaInicio) ? 
                Math.ceil((new Date(viajeData.fechaFin).getTime() - new Date(viajeData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) 
                : undefined;

            const viajeActualizado = {
                ...viajeData,
                duracionDias,
                fechaActualizacion: new Date().toISOString()
            };

            const data = await this.makeRequest<Viaje>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(viajeActualizado)
                }
            );
            
            console.log('✅ Viaje actualizado exitosamente:', data);
            return {
                success: true,
                data,
                message: 'Viaje actualizado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error actualizando viaje:', error);
            return {
                success: false,
                data: {} as Viaje,
                message: 'Error al actualizar el viaje'
            };
        }
    }

    // Eliminar viaje
    async eliminarViaje(twinId: string, viajeId: string): Promise<{ success: boolean; message: string }> {
        console.log('✈️ Eliminando viaje:', viajeId);
        
        try {
            await this.makeRequest(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}`,
                {
                    method: 'DELETE'
                }
            );
            
            console.log('✅ Viaje eliminado exitosamente');
            return {
                success: true,
                message: 'Viaje eliminado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error eliminando viaje:', error);
            return {
                success: false,
                message: 'Error al eliminar el viaje'
            };
        }
    }

    // Obtener lugares famosos por ciudad
    getLugaresFamosos(pais: string, ciudad: string): string[] {
        const paisData = PAISES_CIUDADES_LUGARES[pais as keyof typeof PAISES_CIUDADES_LUGARES];
        if (!paisData) return [];
        
        const ciudadData = paisData.ciudades[ciudad as keyof typeof paisData.ciudades];
        return ciudadData || [];
    }

    // Obtener ciudades por país
    getCiudadesPorPais(pais: string): string[] {
        const paisData = PAISES_CIUDADES_LUGARES[pais as keyof typeof PAISES_CIUDADES_LUGARES];
        if (!paisData) return [];
        
        return Object.keys(paisData.ciudades);
    }

    // Obtener todos los países disponibles
    getPaisesDisponibles(): string[] {
        return Object.keys(PAISES_CIUDADES_LUGARES);
    }

    // MÉTODOS PARA MANEJO DE FASES DEL VIAJE

    // Avanzar a la siguiente fase del viaje
    async avanzarFaseViaje(twinId: string, viajeId: string, nuevaFase: FaseViaje): Promise<ViajeResponse> {
        console.log(`🔄 Avanzando viaje ${viajeId} a fase: ${nuevaFase}`);
        
        try {
            const data = await this.makeRequest<Viaje>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/fase`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ fase: nuevaFase, fechaActualizacion: new Date().toISOString() })
                }
            );
            
            console.log('✅ Fase actualizada exitosamente:', data);
            return {
                success: true,
                data,
                message: `Viaje avanzado a fase: ${nuevaFase}`
            };
        } catch (error) {
            console.error('❌ Error actualizando fase:', error);
            return {
                success: false,
                data: {} as Viaje,
                message: 'Error al actualizar la fase del viaje'
            };
        }
    }

    // MÉTODOS PARA BOOKINGS (FASE 2)

    // Crear booking de hotel
    async crearBookingHotel(twinId: string, viajeId: string, booking: BookingHotel): Promise<BookingHotel | null> {
        console.log('🏨 Creando booking de hotel:', booking);
        
        try {
            const data = await this.makeRequest<BookingHotel>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/bookings/hoteles`,
                {
                    method: 'POST',
                    body: JSON.stringify(booking)
                }
            );
            
            console.log('✅ Booking de hotel creado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando booking de hotel:', error);
            return null;
        }
    }

    // Crear booking de vuelo
    async crearBookingVuelo(twinId: string, viajeId: string, booking: BookingVuelo): Promise<BookingVuelo | null> {
        console.log('✈️ Creando booking de vuelo:', booking);
        
        try {
            const data = await this.makeRequest<BookingVuelo>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/bookings/vuelos`,
                {
                    method: 'POST',
                    body: JSON.stringify(booking)
                }
            );
            
            console.log('✅ Booking de vuelo creado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando booking de vuelo:', error);
            return null;
        }
    }

    // Crear otro booking
    async crearOtroBooking(twinId: string, viajeId: string, booking: OtroBooking): Promise<OtroBooking | null> {
        console.log('📋 Creando otro booking:', booking);
        
        try {
            const data = await this.makeRequest<OtroBooking>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/bookings/otros`,
                {
                    method: 'POST',
                    body: JSON.stringify(booking)
                }
            );
            
            console.log('✅ Otro booking creado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando otro booking:', error);
            return null;
        }
    }

    // Obtener todos los bookings de un viaje
    async getBookingsViaje(twinId: string, viajeId: string): Promise<{
        hoteles: BookingHotel[];
        vuelos: BookingVuelo[];
        otros: OtroBooking[];
        total: number;
    }> {
        console.log('📋 Obteniendo bookings para viaje:', viajeId);
        
        try {
            const data = await this.makeRequest<{
                hoteles: BookingHotel[];
                vuelos: BookingVuelo[];
                otros: OtroBooking[];
                total: number;
            }>(`${this.BASE_PATH}/${twinId}/viajes/${viajeId}/bookings`);
            
            console.log('✅ Bookings obtenidos exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo bookings:', error);
            return {
                hoteles: [],
                vuelos: [],
                otros: [],
                total: 0
            };
        }
    }

    // MÉTODOS PARA DASHBOARD FINAL (FASE 4)

    // Generar dashboard de costos finales
    async generarDashboardCostos(twinId: string, viajeId: string): Promise<DashboardCostos | null> {
        console.log('📊 Generando dashboard de costos para viaje:', viajeId);
        
        try {
            const data = await this.makeRequest<DashboardCostos>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/dashboard`,
                {
                    method: 'POST'
                }
            );
            
            console.log('✅ Dashboard generado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error generando dashboard:', error);
            return null;
        }
    }

    // Obtener dashboard existente
    async getDashboardCostos(twinId: string, viajeId: string): Promise<DashboardCostos | null> {
        console.log('📊 Obteniendo dashboard de costos para viaje:', viajeId);
        
        try {
            const data = await this.makeRequest<DashboardCostos>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/dashboard`
            );
            
            console.log('✅ Dashboard obtenido exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo dashboard:', error);
            return null;
        }
    }

    // MÉTODOS PARA REGISTROS DIARIOS (FASE 3)

    // Obtener registros diarios de un viaje
    async getRegistrosDiarios(twinId: string, viajeId: string): Promise<RegistroDiario[]> {
        console.log('📅 Obteniendo registros diarios para viaje:', viajeId);
        
        try {
            const data = await this.makeRequest<RegistroDiario[]>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/registros-diarios`
            );
            
            console.log('✅ Registros diarios obtenidos exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo registros diarios:', error);
            return [];
        }
    }

    // Crear/actualizar registro diario
    async saveRegistroDiario(twinId: string, viajeId: string, fecha: string, registro: Omit<RegistroDiario, 'fecha'>): Promise<RegistroDiario | null> {
        console.log('📅 Guardando registro diario:', fecha, registro);
        
        try {
            const registroCompleto = {
                ...registro,
                fecha,
                viajeId,
                fechaActualizacion: new Date().toISOString()
            };

            const data = await this.makeRequest<RegistroDiario>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/registros-diarios/${fecha}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(registroCompleto)
                }
            );
            
            console.log('✅ Registro diario guardado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error guardando registro diario:', error);
            return null;
        }
    }

    // Subir archivo adjunto para una actividad
    async uploadArchivoAdjunto(twinId: string, viajeId: string, fecha: string, actividadIndex: number, file: File): Promise<ArchivoAdjunto | null> {
        console.log('📎 Subiendo archivo adjunto:', file.name);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tipo', this.getArchivoTipo(file.name));

            const data = await this.makeRequest<ArchivoAdjunto>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/registros-diarios/${fecha}/actividades/${actividadIndex}/archivos`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {} // Don't set Content-Type for FormData
                }
            );
            
            console.log('✅ Archivo adjunto subido exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error subiendo archivo adjunto:', error);
            return null;
        }
    }

    // Eliminar archivo adjunto
    async deleteArchivoAdjunto(twinId: string, viajeId: string, fecha: string, actividadIndex: number, archivoId: string): Promise<boolean> {
        console.log('🗑️ Eliminando archivo adjunto:', archivoId);
        
        try {
            await this.makeRequest(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/registros-diarios/${fecha}/actividades/${actividadIndex}/archivos/${archivoId}`,
                {
                    method: 'DELETE'
                }
            );
            
            console.log('✅ Archivo adjunto eliminado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error eliminando archivo adjunto:', error);
            return false;
        }
    }

    // Función helper para determinar el tipo de archivo
    getArchivoTipo(fileName: string): 'recibo' | 'ticket' | 'factura' | 'comprobante' | 'foto' | 'otro' {
        const extension = fileName.toLowerCase().split('.').pop();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const pdfExtensions = ['pdf'];
        
        if (imageExtensions.includes(extension || '')) {
            return 'foto';
        }
        
        if (pdfExtensions.includes(extension || '')) {
            // Los PDFs suelen ser recibos o facturas
            return 'comprobante';
        }
        
        // Por defecto, consideramos que es un recibo
        return 'recibo';
    }

    // Calcular gastos totales de un viaje
    calcularGastosViaje(registrosDiarios: RegistroDiario[]): number {
        return registrosDiarios.reduce((total, registro) => {
            const gastosDia = registro.actividades.reduce((totalDia, actividad) => {
                return totalDia + (actividad.costo || 0);
            }, 0);
            return total + gastosDia;
        }, 0);
    }

    // Obtener estadísticas de gastos por tipo de actividad
    getEstadisticasGastos(registrosDiarios: RegistroDiario[]): { [tipo: string]: number } {
        const estadisticas: { [tipo: string]: number } = {};
        
        registrosDiarios.forEach(registro => {
            registro.actividades.forEach(actividad => {
                if (!estadisticas[actividad.tipo]) {
                    estadisticas[actividad.tipo] = 0;
                }
                estadisticas[actividad.tipo] += actividad.costo || 0;
            });
        });
        
        return estadisticas;
    }

    // Obtener actividades por día específico
    async getActividadesPorDia(twinId: string, viajeId: string, fecha: string): Promise<ActividadDiaria[]> {
        console.log('📅 Obteniendo actividades para fecha:', fecha);
        
        try {
            const data = await this.makeRequest<RegistroDiario>(
                `${this.BASE_PATH}/${twinId}/viajes/${viajeId}/registros-diarios/${fecha}`
            );
            
            console.log('✅ Actividades obtenidas exitosamente:', data.actividades);
            return data.actividades || [];
        } catch (error) {
            console.error('❌ Error obteniendo actividades:', error);
            return [];
        }
    }

    // Generar rango de fechas para un viaje
    generarFechasViaje(fechaInicio: string, fechaFin?: string): string[] {
        const fechas: string[] = [];
        const inicio = new Date(fechaInicio);
        const fin = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);
        
        // Asegurar que fin sea al menos igual a inicio
        if (fin < inicio) {
            fin.setTime(inicio.getTime());
        }
        
        const fechaActual = new Date(inicio);
        while (fechaActual <= fin) {
            fechas.push(fechaActual.toISOString().split('T')[0]);
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        
        return fechas;
    }

    // Validar estructura de actividad diaria
    validarActividadDiaria(actividad: ActividadDiaria): { valida: boolean; errores: string[] } {
        const errores: string[] = [];
        
        if (!actividad.nombre?.trim()) {
            errores.push('El nombre de la actividad es obligatorio');
        }
        
        if (!actividad.tipo) {
            errores.push('El tipo de actividad es obligatorio');
        }
        
        if (!actividad.lugar?.trim()) {
            errores.push('El lugar de la actividad es obligatorio');
        }
        
        if (actividad.costo !== undefined && actividad.costo < 0) {
            errores.push('El costo no puede ser negativo');
        }
        
        if (actividad.calificacion !== undefined && (actividad.calificacion < 1 || actividad.calificacion > 5)) {
            errores.push('La calificación debe estar entre 1 y 5');
        }
        
        return {
            valida: errores.length === 0,
            errores
        };
    }
}

const viajesApiService = new ViajesApiService();
export default viajesApiService;
