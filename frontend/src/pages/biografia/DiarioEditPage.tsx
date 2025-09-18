import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import GoogleAddressAutocompleteModern from "@/components/GoogleAddressAutocompleteModern";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Save,
    Calendar,
    Camera,
    Plus,
    Clock,
    MapPin,
    Phone,
    Users,
    Heart,
    Briefcase,
    Coffee,
    Plane,
    Home,
    ShoppingBag,
    Utensils,
    Dumbbell,
    Book,
    Music,
    Gamepad2,
    Star,
    Link,
    Trash2,
    CheckCircle,
    AlertCircle,
    Image
} from "lucide-react";

interface DiaryEntry {
    id: string;
    fecha: string;
    hora: string;
    nombreActividad: string;
    tipoActividad: string;
    descripcion: string;
    fotos: string[];
    ubicacion: string;
    participantes: string;
    valoracion: number;
    camposExtra: { [key: string]: any };
}

interface CampoExtra {
    nombre: string;
    label: string;
    placeholder: string;
    type?: string;
    accept?: string;
    min?: string;
    max?: string;
}

interface TipoActividad {
    value: string;
    label: string;
    icon: any;
    color: string;
    plantilla: string;
    preguntas: string[];
    camposExtra: CampoExtra[];
}

const DiarioEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accounts } = useMsal();
    
    // Obtener el TwinId real del usuario autenticado
    const twinId = accounts[0]?.localAccountId;
    
    // Estado para almacenar archivos reales
    const [archivosSeleccionados, setArchivosSeleccionados] = useState<{ [key: string]: File }>({});

    // Estados para manejo de fotos por URL
    const [fotosUrls, setFotosUrls] = useState<string[]>([]);
    const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
    const [subiendoFotos, setSubiendoFotos] = useState(false);
    const [resultadosFotos, setResultadosFotos] = useState<any>(null);
    
    // Estados para manejo de archivos (subida inmediata)
    const [subiendoArchivos, setSubiendoArchivos] = useState(false);
    const [fotosSubidas, setFotosSubidas] = useState<string[]>([]);
    const [resultadoArchivos, setResultadoArchivos] = useState<any>(null);
    
    const [entrada, setEntrada] = useState<DiaryEntry>({
        id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
        nombreActividad: '',
        tipoActividad: '',
        descripcion: '',
        fotos: [],
        ubicacion: '',
        participantes: '',
        valoracion: 5,
        camposExtra: {}
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [preguntasContextuales, setPreguntasContextuales] = useState<string[]>([]);

    // Cargar diario existente
    useEffect(() => {
        if (id) {
            cargarDiario();
        }
    }, [id, twinId]);

    const cargarDiario = async () => {
        if (!twinId || !id) {
            setCargando(false);
            return;
        }

        try {
            setCargando(true);
            console.log('📔 Cargando diario para editar - Twin ID:', twinId, 'Diary ID:', id);
            
            const response = await fetch(`/api/twins/${twinId}/diary/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📔 Respuesta del diario para editar:', data);
                
                // El backend puede retornar directamente el diario o envuelto en un objeto
                // Si viene en 'entries' como una lista, tomar el primer elemento
                let diarioData;
                if (data.entries && data.entries.length > 0) {
                    diarioData = data.entries[0];
                    console.log('📔 Datos extraídos de entries[0]:', diarioData);
                } else {
                    diarioData = data.data || data.entry || data;
                    console.log('📔 Datos extraídos directamente:', diarioData);
                }
                
                // 🐛 DEBUG: Mostrar los datos que llegan del backend
                console.log('🐛 DEBUG - Datos del backend:', diarioData);
                console.log('🐛 DEBUG - tipoActividad:', diarioData.tipoActividad);
                console.log('🐛 DEBUG - productosComprados:', diarioData.productosComprados);
                console.log('🐛 DEBUG - tiendaLugar:', diarioData.tiendaLugar);
                console.log('🐛 DEBUG - gastoTotal:', diarioData.gastoTotal);
                console.log('🐛 DEBUG - metodoPago:', diarioData.metodoPago);
                console.log('🐛 DEBUG - categoriaCompra:', diarioData.categoriaCompra);
                console.log('🐛 DEBUG - satisfaccionCompra:', diarioData.satisfaccionCompra);
                
                // Mapear los datos del backend al formato del frontend
                const entradaMapeada = {
                    id: diarioData.id || '',
                    fecha: diarioData.fecha ? diarioData.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
                    hora: diarioData.fecha ? new Date(diarioData.fecha).toTimeString().split(' ')[0].substring(0, 5) : '12:00',
                    nombreActividad: diarioData.titulo || '',
                    tipoActividad: diarioData.tipoActividad?.toLowerCase() || '', // Normalizar a minúsculas para el frontend
                    descripcion: diarioData.descripcion || '',
                    fotos: [], // Por ahora vacío
                    ubicacion: diarioData.ubicacion || '',
                    participantes: diarioData.participantes || '',
                    valoracion: diarioData.nivelEnergia || 3,
                    camposExtra: {
                        // Campos de comida - Mapear a nombres con guión bajo que espera el frontend
                        costo_comida: diarioData.costoComida != null ? diarioData.costoComida : '',
                        restaurante_lugar: diarioData.restauranteLugar || '',
                        tipo_cocina: diarioData.tipoCocina || '',
                        platos_ordenados: diarioData.platosOrdenados || '',
                        calificacion_comida: diarioData.calificacionComida != null ? diarioData.calificacionComida : '',
                        ambiente: diarioData.ambienteComida || '',
                        recomendaria: diarioData.recomendariaComida === true ? 'Sí' : (diarioData.recomendariaComida === false ? 'No' : ''),
                        
                        // Campos de viaje - Mapear a nombres con guión bajo
                        costo_viaje: diarioData.costoViaje != null ? diarioData.costoViaje : '',
                        destino: diarioData.destinoViaje || '',
                        transporte: diarioData.transporteViaje || '',
                        proposito: diarioData.propositoViaje || '',
                        calificacion_viaje: diarioData.calificacionViaje != null ? diarioData.calificacionViaje : '',
                        duracion_viaje: diarioData.duracionViaje != null ? diarioData.duracionViaje : '',
                        
                        // Campos de trabajo - Mapear a nombres correctos
                        proyecto: diarioData.proyectoPrincipal || '',
                        horas_trabajadas: diarioData.horasTrabajadas != null ? diarioData.horasTrabajadas : '',
                        reuniones: diarioData.reunionesTrabajo != null ? diarioData.reunionesTrabajo : '',
                        logros: diarioData.logrosHoy || '',
                        desafios: diarioData.desafiosTrabajo || '',
                        mood_trabajo: diarioData.moodTrabajo != null ? diarioData.moodTrabajo : '',
                        
                        // Campos de llamada - Mapear a nombres correctos
                        contacto: diarioData.contactoLlamada || '',
                        duracion_llamada: diarioData.duracionLlamada != null ? diarioData.duracionLlamada : '',
                        proposito_llamada: diarioData.motivoLlamada || '',
                        resultado_llamada: diarioData.temasConversacion || '',
                        siguiente_accion: diarioData.seguimientoLlamada === true ? 'Sí' : (diarioData.seguimientoLlamada === false ? 'No' : ''),
                        
                        // Campos de salud
                        costoSalud: diarioData.costoSalud != null ? diarioData.costoSalud : '',
                        tipoConsulta: diarioData.tipoConsulta || '',
                        profesionalCentro: diarioData.profesionalCentro || '',
                        motivoConsulta: diarioData.motivoConsulta || '',
                        tratamientoRecetado: diarioData.tratamientoRecetado || '',
                        proximaCita: diarioData.proximaCita || '',
                        
                        // Campos de ejercicio - Mapear a nombres con guión bajo
                        costo_ejercicio: diarioData.costoEjercicio != null ? diarioData.costoEjercicio : '',
                        energia_post: diarioData.energiaPostEjercicio != null ? diarioData.energiaPostEjercicio : '',
                        calorias_quemadas: diarioData.caloriasQuemadas != null ? diarioData.caloriasQuemadas : '',
                        tipo_ejercicio: diarioData.tipoEjercicio || '',
                        duracion_ejercicio: diarioData.duracionEjercicio != null ? diarioData.duracionEjercicio : '',
                        intensidad: diarioData.intensidadEjercicio != null ? diarioData.intensidadEjercicio : '',
                        lugar_ejercicio: diarioData.lugarEjercicio || '',
                        rutina_especifica: diarioData.rutinaEspecifica || '',
                        
                        // Campos de estudio
                        costoEstudio: diarioData.costoEstudio != null ? diarioData.costoEstudio : '',
                        dificultadEstudio: diarioData.dificultadEstudio != null ? diarioData.dificultadEstudio : '',
                        estadoAnimoPost: diarioData.estadoAnimoPost != null ? diarioData.estadoAnimoPost : '',
                        materiaTema: diarioData.materiaTema || '',
                        materialEstudio: diarioData.materialEstudio || '',
                        duracionEstudio: diarioData.duracionEstudio != null ? diarioData.duracionEstudio : '',
                        progresoEstudio: diarioData.progresoEstudio != null ? diarioData.progresoEstudio : '',
                        
                        // Campos de entretenimiento
                        costoEntretenimiento: diarioData.costoEntretenimiento != null ? diarioData.costoEntretenimiento : '',
                        calificacionEntretenimiento: diarioData.calificacionEntretenimiento != null ? diarioData.calificacionEntretenimiento : '',
                        tipoEntretenimiento: diarioData.tipoEntretenimiento || '',
                        tituloNombre: diarioData.tituloNombre || '',
                        lugarEntretenimiento: diarioData.lugarEntretenimiento || '',
                        
                        // Campos de compras - Mapear correctamente desde el backend
                        productos_comprados: diarioData.productosComprados || '',
                        tienda_lugar: diarioData.tiendaLugar || '',
                        gasto_total: diarioData.gastoTotal != null ? diarioData.gastoTotal : '',
                        metodo_pago: diarioData.metodoPago || '',
                        categoria_compra: diarioData.categoriaCompra || '',
                        satisfaccion: diarioData.satisfaccionCompra != null ? diarioData.satisfaccionCompra : '',
                        
                        // Campos de ubicación detallados - Mapear desde backend
                        pais: diarioData.pais || '',
                        ciudad: diarioData.ciudad || '',
                        estado: diarioData.estadoProvincia || '', // Nota: backend usa "estadoProvincia"
                        codigoPostal: diarioData.codigoPostal || '',
                        direccion: diarioData.direccionEspecifica || '', // Nota: backend usa "direccionEspecifica"
                        distrito: diarioData.distritoColonia || '', // Nota: backend usa "distritoColonia"
                        telefono: diarioData.telefono || '',
                        website: diarioData.website || '',
                        latitud: diarioData.latitud != null ? diarioData.latitud.toString() : '',
                        longitud: diarioData.longitud != null ? diarioData.longitud.toString() : '',
                        
                        // Campo de archivo
                        pathFile: diarioData.pathFile || ''
                    }
                };
                
                // 🐛 DEBUG: Mostrar los datos después del mapeo
                console.log('🐛 DEBUG - Entrada mapeada:', entradaMapeada);
                console.log('🐛 DEBUG - camposExtra:', entradaMapeada.camposExtra);
                
                setEntrada(entradaMapeada);
                
                // Establecer preguntas contextuales basadas en el tipo de actividad
                // Normalizar el tipo para hacer la búsqueda (el backend puede enviar "Comida" pero el frontend usa "comida")
                const tipoNormalizado = diarioData.tipoActividad?.toLowerCase() || '';
                const tipoSeleccionado = tiposActividad.find(t => t.value === tipoNormalizado);
                if (tipoSeleccionado) {
                    setPreguntasContextuales(tipoSeleccionado.preguntas);
                }
            } else {
                const errorText = await response.text();
                console.error('📔 Error del servidor:', errorText);
                alert(`Error al cargar el diario: ${response.status}`);
                navigate('/biografia/diario-personal');
            }
        } catch (error) {
            console.error('Error cargando diario:', error);
            alert('Error de conexión');
            navigate('/biografia/diario-personal');
        } finally {
            setCargando(false);
        }
    };

    // Definición de tipos de actividad (misma que en DiarioPersonalPage)
    const tiposActividad: TipoActividad[] = [
        { 
            value: 'trabajo', 
            label: 'Trabajo', 
            icon: Briefcase, 
            color: 'bg-blue-500',
            plantilla: '💼 Día de trabajo...',
            preguntas: ['¿Qué proyectos trabajaste hoy?', '¿Tuviste reuniones importantes?', '¿Qué lograste completar?', '¿Hubo algún desafío?'],
            camposExtra: [
                { nombre: 'proyecto', label: 'Proyecto principal', placeholder: 'Nombre del proyecto en el que trabajaste' },
                { nombre: 'reuniones', label: 'Reuniones', placeholder: 'Reuniones importantes del día' },
                { nombre: 'logros', label: 'Logros del día', placeholder: 'Qué completaste o avanzaste' }
            ]
        },
        { 
            value: 'llamada', 
            label: 'Llamada Telefónica', 
            icon: Phone, 
            color: 'bg-green-500',
            plantilla: '📞 Llamada con...',
            preguntas: ['¿Con quién hablaste?', '¿De qué tema fue la conversación?', '¿Cuánto duró la llamada?', '¿Fue productiva o social?'],
            camposExtra: [
                { nombre: 'contacto', label: '👤 Persona contactada', placeholder: 'Nombre de la persona con quien hablaste', type: 'text' },
                { nombre: 'duracion_llamada', label: '⏱️ Duración', placeholder: '30 minutos, 1 hora...', type: 'text' },
                { nombre: 'proposito_llamada', label: '🎯 Propósito', placeholder: 'Trabajo, personal, familia, emergencia...', type: 'text' },
                { nombre: 'resultado_llamada', label: '✅ Resultado', placeholder: 'Qué se resolvió o acordó', type: 'text' },
                { nombre: 'siguiente_accion', label: '➡️ Próxima acción', placeholder: 'Follow-up necesario', type: 'text' }
            ]
        },
        { 
            value: 'social', 
            label: 'Evento Social', 
            icon: Coffee, 
            color: 'bg-orange-500',
            plantilla: '🎉 Evento social...',
            preguntas: ['¿Qué tipo de evento fue?', '¿Quién organizó?', '¿A quién conociste?', '¿Qué fue lo mejor del evento?'],
            camposExtra: [
                { nombre: 'tipo_evento', label: 'Tipo de evento', placeholder: 'Fiesta, conferencia, networking...' },
                { nombre: 'organizador', label: 'Organizador', placeholder: 'Quien organizó el evento' }
            ]
        },
        { 
            value: 'viaje', 
            label: 'Viaje/Salida', 
            icon: Plane, 
            color: 'bg-indigo-500',
            plantilla: '✈️ Viaje a...',
            preguntas: ['¿A dónde fuiste?', '¿Cómo llegaste?', '¿Qué viste o hiciste?', '¿Qué te gustó más?'],
            camposExtra: [
                { nombre: 'destino', label: '🗺️ Destino', placeholder: 'Ciudad, país o lugar visitado', type: 'text' },
                { nombre: 'transporte', label: '🚗 Medio de transporte', placeholder: 'Avión, auto, tren, autobús...', type: 'text' },
                { nombre: 'proposito', label: '🎯 Propósito', placeholder: 'Vacaciones, trabajo, visita familiar...', type: 'text' },
                { nombre: 'costo_viaje', label: '💰 Costo total', placeholder: '$200.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'duracion_viaje', label: '⏱️ Duración', placeholder: '3 días, 1 semana...', type: 'text' },
                { nombre: 'calificacion_viaje', label: '⭐ Calificación (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'hogar', 
            label: 'En Casa', 
            icon: Home, 
            color: 'bg-gray-500',
            plantilla: '🏠 En casa hoy...',
            preguntas: ['¿Qué hiciste en casa?', '¿Fue un día de descanso?', '¿Realizaste alguna tarea doméstica?', '¿Cómo te sentiste?'],
            camposExtra: [
                { nombre: 'actividades_casa', label: 'Actividades en casa', placeholder: 'Limpieza, cocina, relax...' },
                { nombre: 'estado_animo', label: 'Estado de ánimo', placeholder: 'Relajado, productivo, aburrido...' }
            ]
        },
        { 
            value: 'compras', 
            label: 'Compras', 
            icon: ShoppingBag, 
            color: 'bg-pink-500',
            plantilla: '🛍️ Día de compras...',
            preguntas: ['¿Qué compraste?', '¿Dónde fuiste de compras?', '¿Era algo necesario o un capricho?', '¿Cómo fue la experiencia?'],
            camposExtra: [
                { nombre: 'productos_comprados', label: '🛒 Productos comprados', placeholder: 'Lista de productos que compraste', type: 'text' },
                { nombre: 'tienda_lugar', label: '🏪 Tienda/Centro comercial', placeholder: 'Nombre de la tienda o lugar', type: 'text' },
                { nombre: 'gasto_total', label: '💰 Gasto total', placeholder: '$150.00', type: 'number' },
                { nombre: 'metodo_pago', label: '💳 Método de pago', placeholder: 'Efectivo, tarjeta, transferencia...', type: 'text' },
                { nombre: 'categoria_compra', label: '📂 Categoría', placeholder: 'Ropa, comida, electrónicos, hogar...', type: 'text' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'satisfaccion', label: '😊 Nivel de satisfacción (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'comida', 
            label: 'Comida/Restaurante', 
            icon: Utensils, 
            color: 'bg-yellow-500',
            plantilla: '🍽️ Experiencia culinaria...',
            preguntas: ['¿Dónde comiste?', '¿Qué platos probaste?', '¿Con quién compartiste la comida?', '¿Cómo estuvo la comida?'],
            camposExtra: [
                { nombre: 'restaurante_lugar', label: '🏪 Restaurante/Lugar', placeholder: 'Nombre del restaurante o lugar', type: 'text' },
                { nombre: 'tipo_cocina', label: '🍜 Tipo de cocina', placeholder: 'Italiana, mexicana, japonesa, casera...', type: 'text' },
                { nombre: 'platos_ordenados', label: '🍕 Platos que pediste', placeholder: 'Lista de platos, bebidas, postres...', type: 'text' },
                { nombre: 'costo_comida', label: '💰 Costo total', placeholder: '$45.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'calificacion_comida', label: '⭐ Calificación (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'ambiente', label: '🎵 Ambiente del lugar', placeholder: 'Ruidoso, romántico, familiar, casual...', type: 'text' },
                { nombre: 'recomendaria', label: '👍 ¿Lo recomendarías?', placeholder: 'Sí/No y por qué', type: 'text' }
            ]
        },
        { 
            value: 'ejercicio', 
            label: 'Ejercicio/Deporte', 
            icon: Dumbbell, 
            color: 'bg-teal-500',
            plantilla: '💪 Entrenamiento de hoy...',
            preguntas: ['¿Qué tipo de ejercicio hiciste?', '¿Cuánto tiempo entrenaste?', '¿Cómo te sentiste?', '¿Lograste tus objetivos?'],
            camposExtra: [
                { nombre: 'tipo_ejercicio', label: '🏃‍♂️ Tipo de ejercicio', placeholder: 'Cardio, pesas, yoga, natación...', type: 'text' },
                { nombre: 'duracion_ejercicio', label: '⏱️ Duración total', placeholder: '45 minutos', type: 'text' },
                { nombre: 'intensidad', label: '🔥 Intensidad', placeholder: 'Baja, media, alta', type: 'text' },
                { nombre: 'lugar_ejercicio', label: '📍 Lugar', placeholder: 'Gimnasio, casa, parque, piscina...', type: 'text' },
                { nombre: 'costo_ejercicio', label: '💰 Costo (si aplica)', placeholder: '$15.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'calorias_quemadas', label: '🔥 Calorías quemadas (aprox)', placeholder: '300', type: 'number' },
                { nombre: 'rutina_especifica', label: '📋 Rutina específica', placeholder: 'Ejercicios realizados, series, repeticiones...', type: 'text' },
                { nombre: 'energia_post', label: '⚡ Nivel de energía después (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'estudio', 
            label: 'Estudio/Lectura', 
            icon: Book, 
            color: 'bg-cyan-500',
            plantilla: '📚 Sesión de estudio...',
            preguntas: ['¿Qué estudiaste o leíste?', '¿Por cuánto tiempo?', '¿Qué aprendiste?', '¿Te resultó difícil o fácil?'],
            camposExtra: [
                { nombre: 'materia_tema', label: '📚 Materia/Tema', placeholder: 'Matemáticas, historia, programación, idiomas...', type: 'text' },
                { nombre: 'material', label: '📖 Material usado', placeholder: 'Libro, video, curso online, tutor...', type: 'text' },
                { nombre: 'duracion_estudio', label: '⏱️ Duración', placeholder: '2 horas, 45 minutos...', type: 'text' },
                { nombre: 'costo_estudio', label: '💰 Costo (si aplica)', placeholder: '$25.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'progreso', label: '📈 Progreso', placeholder: 'Capítulos leídos, temas completados...', type: 'text' },
                { nombre: 'dificultad', label: '🎯 Nivel de dificultad (1-5)', placeholder: '3', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'entretenimiento', 
            label: 'Entretenimiento', 
            icon: Music, 
            color: 'bg-violet-500',
            plantilla: '🎭 Entretenimiento...',
            preguntas: ['¿Qué tipo de entretenimiento disfrutaste?', '¿Fue en casa o fuera?', '¿Te gustó?', '¿Lo recomendarías?'],
            camposExtra: [
                { nombre: 'tipo_entretenimiento', label: '🎬 Tipo', placeholder: 'Película, concierto, teatro, museo...', type: 'text' },
                { nombre: 'nombre_evento', label: '🎪 Nombre del evento/show', placeholder: 'Título de la película, nombre del concierto...', type: 'text' },
                { nombre: 'lugar_entretenimiento', label: '📍 Lugar', placeholder: 'Cine, teatro, casa, centro cultural...', type: 'text' },
                { nombre: 'duracion_entretenimiento', label: '⏱️ Duración', placeholder: '2 horas, 3 horas...', type: 'text' },
                { nombre: 'costo_entretenimiento', label: '💰 Costo total', placeholder: '$30.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'calificacion', label: '⭐ Calificación (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' },
                { nombre: 'recomendacion', label: '👍 ¿Lo recomendarías?', placeholder: 'Sí/No y por qué', type: 'text' }
            ]
        },
        { 
            value: 'juegos', 
            label: 'Juegos', 
            icon: Gamepad2, 
            color: 'bg-lime-500',
            plantilla: '🎮 Sesión de juegos...',
            preguntas: ['¿A qué jugaste?', '¿Solo o con otros?', '¿Cuánto tiempo jugaste?', '¿Fue divertido o competitivo?'],
            camposExtra: [
                { nombre: 'juego_nombre', label: 'Nombre del juego', placeholder: 'Título del videojuego o juego' },
                { nombre: 'plataforma', label: 'Plataforma', placeholder: 'PC, PlayStation, móvil, mesa...' },
                { nombre: 'modo_juego', label: 'Modo de juego', placeholder: 'Solo, multijugador, cooperativo...' },
                { nombre: 'tiempo_jugado', label: 'Tiempo de juego', placeholder: '2 horas, 30 minutos...' }
            ]
        },
        { 
            value: 'salud', 
            label: 'Salud/Médico', 
            icon: Heart, 
            color: 'bg-red-500',
            plantilla: '🏥 Visita médica...',
            preguntas: ['¿Qué tipo de cita médica fue?', '¿Cómo te fue?', '¿Recibiste algún tratamiento?', '¿Hay seguimiento necesario?'],
            camposExtra: [
                { nombre: 'tipo_cita', label: '🩺 Tipo de cita', placeholder: 'Consulta general, especialista, examen...', type: 'text' },
                { nombre: 'medico_especialista', label: '👩‍⚕️ Médico/Especialista', placeholder: 'Nombre del doctor o especialista', type: 'text' },
                { nombre: 'sintomas_razon', label: '🤒 Síntomas/Razón de la visita', placeholder: 'Por qué fuiste al médico', type: 'text' },
                { nombre: 'diagnostico', label: '📋 Diagnóstico/Resultado', placeholder: 'Qué encontró el médico', type: 'text' },
                { nombre: 'tratamiento_recetado', label: '💊 Tratamiento/Medicamentos', placeholder: 'Medicamentos recetados, terapias...', type: 'text' },
                { nombre: 'costo_salud', label: '💰 Costo total', placeholder: '$80.00', type: 'number' },
                { nombre: 'pathFile', label: '🧾 Archivo/Recibo', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Sube recibos, documentos o fotos' },
                { nombre: 'proxima_cita', label: '📅 Próxima cita', placeholder: 'Fecha o "No necesaria"', type: 'text' },
                { nombre: 'estado_animo_post', label: '😊 Estado de ánimo después (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'otros', 
            label: 'Otros', 
            icon: Star, 
            color: 'bg-slate-500',
            plantilla: '⭐ Algo especial pasó hoy...',
            preguntas: ['¿Qué pasó hoy?', '¿Por qué fue especial?', '¿Cómo te hizo sentir?', '¿Qué aprendiste?'],
            camposExtra: [
                { nombre: 'categoria_personal', label: 'Categoría personal', placeholder: 'Tu propia categoría para esta actividad' }
            ]
        }
    ];

    const handleTipoActividadChange = (tipo: string) => {
        setEntrada(prev => ({ ...prev, tipoActividad: tipo }));
        
        const tipoSeleccionado = tiposActividad.find(t => t.value === tipo);
        if (tipoSeleccionado) {
            setPreguntasContextuales(tipoSeleccionado.preguntas);
            // Mantener los campos extra existentes, solo agregar los faltantes
            setEntrada(prev => {
                const nuevoCamposExtra = { ...prev.camposExtra };
                tipoSeleccionado.camposExtra.forEach(campo => {
                    if (!(campo.nombre in nuevoCamposExtra)) {
                        nuevoCamposExtra[campo.nombre] = '';
                    }
                });
                return { ...prev, camposExtra: nuevoCamposExtra };
            });
        }
    };

    const handleCampoExtraChange = (nombreCampo: string, valor: any) => {
        setEntrada(prev => ({
            ...prev,
            camposExtra: {
                ...prev.camposExtra,
                [nombreCampo]: valor
            }
        }));
    };

    const handleGooglePlaceSelected = (placeData: {
        direccion: string;
        ciudad: string;
        estado: string;
        codigoPostal: string;
        pais: string;
        telefono?: string;
        website?: string;
        latitud?: number;
        longitud?: number;
    }) => {
        console.log('🗺️ Google Place selected in DiarioEditPage:', placeData);
        
        // Actualizar los campos extraídos automáticamente
        setEntrada(prev => ({
            ...prev,
            camposExtra: {
                ...prev.camposExtra,
                pais: placeData.pais,
                ciudad: placeData.ciudad,
                estado: placeData.estado,
                codigoPostal: placeData.codigoPostal,
                direccion: placeData.direccion,
                telefono: placeData.telefono || '',
                website: placeData.website || '',
                latitud: placeData.latitud?.toString() || '',
                longitud: placeData.longitud?.toString() || ''
            }
        }));
    };

    const handleFileChange = (fieldName: string, file: File | null) => {
        if (file) {
            setArchivosSeleccionados(prev => ({
                ...prev,
                [fieldName]: file
            }));
            // También actualizar el campo extra con el nombre del archivo
            handleCampoExtraChange(fieldName, file.name);
        } else {
            setArchivosSeleccionados(prev => {
                const newState = { ...prev };
                delete newState[fieldName];
                return newState;
            });
            handleCampoExtraChange(fieldName, '');
        }
    };

    // Función para validar si una URL es de una imagen
    const esUrlFotoValida = (url: string): boolean => {
        if (!url) return false;
        
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname.toLowerCase();
            const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
            
            return extensionesValidas.some(ext => pathname.endsWith(ext));
        } catch {
            return false;
        }
    };

    // Función para agregar URL de foto
    const agregarFotoUrl = () => {
        if (!nuevaFotoUrl.trim()) {
            alert('Por favor ingresa una URL válida');
            return;
        }

        if (!esUrlFotoValida(nuevaFotoUrl)) {
            alert('La URL debe apuntar a una imagen válida (.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg)');
            return;
        }

        if (fotosUrls.includes(nuevaFotoUrl)) {
            alert('Esta URL ya fue agregada');
            return;
        }

        setFotosUrls(prev => [...prev, nuevaFotoUrl]);
        setNuevaFotoUrl('');
    };

    // Función para eliminar URL de foto
    const eliminarFotoUrl = (index: number) => {
        setFotosUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Función para subir fotos al backend
    const subirFotosUrls = async () => {
        if (fotosUrls.length === 0) {
            alert('No hay URLs de fotos para subir');
            return;
        }

        if (!twinId || !id) {
            alert('Error: Faltan parámetros necesarios');
            return;
        }

        setSubiendoFotos(true);
        setResultadosFotos(null);

        try {
            console.log('📸 Subiendo fotos por URL - Twin ID:', twinId, 'Diary ID:', id);
            console.log('📸 URLs a procesar:', fotosUrls);

            const response = await fetch(`/api/twins/${twinId}/diary/${id}/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    photoUrls: fotosUrls
                })
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('📸 Respuesta del servidor:', resultado);
                setResultadosFotos(resultado);
                
                // Mostrar resultado al usuario
                const { successfulUploads, failedUploads, totalPhotos } = resultado;
                if (successfulUploads > 0) {
                    alert(`✅ Fotos procesadas: ${successfulUploads} exitosas de ${totalPhotos} total${failedUploads > 0 ? `, ${failedUploads} fallaron` : ''}`);
                    
                    // Limpiar URLs exitosas
                    if (failedUploads === 0) {
                        setFotosUrls([]);
                    } else {
                        // Mantener solo las URLs que fallaron
                        const urlsFallidas = resultado.results
                            .filter((r: any) => !r.success)
                            .map((r: any) => r.photoUrl);
                        setFotosUrls(urlsFallidas);
                    }
                } else {
                    alert(`❌ No se pudieron procesar las fotos. Revisa las URLs.`);
                }
            } else {
                const errorText = await response.text();
                console.error('📸 Error del servidor:', errorText);
                alert(`❌ Error al subir fotos: ${response.status}`);
            }
        } catch (error) {
            console.error('📸 Error subiendo fotos:', error);
            alert('❌ Error de conexión al subir fotos');
        } finally {
            setSubiendoFotos(false);
        }
    };

    // Función para subir archivos inmediatamente cuando se seleccionan
    const subirArchivosInmediato = async (files: FileList) => {
        if (!files.length) return;

        setSubiendoArchivos(true);
        setResultadoArchivos(null);

        try {
            // Validar que tenemos twinId
            if (!twinId) {
                alert('❌ No hay un Twin seleccionado');
                setResultadoArchivos({
                    success: false,
                    message: '❌ No hay un Twin seleccionado'
                });
                return;
            }

            console.log('📸 Iniciando subida - Twin ID:', twinId, 'Diary ID:', id);
            console.log('📸 Archivos a subir:', Array.from(files).map(f => f.name));
            
            const urlsSubidas: string[] = [];
            
            // Subir cada archivo individualmente usando simple-upload-photo
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('photo', file);

                console.log(`📸 Subiendo archivo ${i + 1}/${files.length}:`, file.name);

                const uploadResponse = await fetch(`/api/twins/${twinId}/simple-upload-photo/diary/${id}/photos`, {
                    method: 'POST',
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    console.log(`✅ Archivo ${i + 1} subido:`, uploadResult);
                    
                    // Extraer la URL del resultado
                    const photoUrl = uploadResult.photoUrl || uploadResult.url || uploadResult.filePath;
                    if (photoUrl) {
                        urlsSubidas.push(photoUrl);
                    } else {
                        console.warn(`⚠️ Archivo ${file.name} subido pero sin URL en respuesta:`, uploadResult);
                    }
                } else {
                    const errorText = await uploadResponse.text();
                    console.error(`❌ Error subiendo archivo ${file.name}:`, uploadResponse.status, errorText);
                }
            }

            // Actualizar el estado con las fotos subidas
            if (urlsSubidas.length > 0) {
                setFotosSubidas(prev => [...prev, ...urlsSubidas]);
                
                setResultadoArchivos({
                    success: true,
                    message: `✅ ${urlsSubidas.length} foto(s) subida(s) correctamente`,
                    urls: urlsSubidas
                });

                // Limpiar el input de archivos
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setResultadoArchivos({
                    success: false,
                    message: '❌ No se pudieron subir los archivos'
                });
            }

        } catch (error) {
            console.error('📄 Error subiendo archivos:', error);
            setResultadoArchivos({
                success: false,
                message: '❌ Error de conexión al subir archivos'
            });
        } finally {
            setSubiendoArchivos(false);
        }
    };

    const aplicarPlantilla = () => {
        const tipoSeleccionado = tiposActividad.find(t => t.value === entrada.tipoActividad);
        if (tipoSeleccionado) {
            setEntrada(prev => ({
                ...prev,
                descripcion: tipoSeleccionado.plantilla
            }));
        }
    };

    const agregarPregunta = (pregunta: string) => {
        setEntrada(prev => ({
            ...prev,
            descripcion: prev.descripcion ? `${prev.descripcion}\n\n${pregunta}\n` : `${pregunta}\n`
        }));
    };

    const guardarEntrada = async () => {
        if (!entrada.nombreActividad.trim()) {
            alert('Por favor ingresa un nombre para la actividad');
            return;
        }

        if (!entrada.tipoActividad) {
            alert('Por favor selecciona un tipo de actividad');
            return;
        }

        if (!twinId) {
            alert('Error: No se encontró el ID del Twin. Por favor inicia sesión nuevamente.');
            return;
        }

        setGuardando(true);
        try {
            // Crear FormData para enviar archivos y datos
            const formData = new FormData();
            
            // Mapear los datos del frontend al formato que espera el backend
            const diaryData = {
                titulo: entrada.nombreActividad,
                descripcion: entrada.descripcion,
                fecha: entrada.fecha + 'T' + entrada.hora + ':00.000Z',
                tipoActividad: entrada.tipoActividad,
                labelActividad: entrada.tipoActividad, // Esto puede ser diferente según el tipo
                ubicacion: entrada.ubicacion || '',
                participantes: entrada.participantes || '', // ✅ Mapear participantes
                estadoEmocional: entrada.camposExtra?.estadoEmocional || '',
                nivelEnergia: entrada.valoracion || 3,
                
                // 🌍 Campos de ubicación detallados
                pais: entrada.camposExtra?.pais || '',
                ciudad: entrada.camposExtra?.ciudad || '',
                estado: entrada.camposExtra?.estado || '',
                codigoPostal: entrada.camposExtra?.codigoPostal || '',
                direccion: entrada.camposExtra?.direccion || '',
                distrito: entrada.camposExtra?.distrito || '',
                telefono: entrada.camposExtra?.telefono || '',
                website: entrada.camposExtra?.website || '',
                latitud: entrada.camposExtra?.latitud || null,
                longitud: entrada.camposExtra?.longitud || null,
                
                // Mapear campos extra según el tipo de actividad
                ...entrada.camposExtra,
                twinId: twinId
            };

            // Agregar datos del diario como JSON
            formData.append('diaryData', JSON.stringify(diaryData));

            // Agregar archivos al FormData
            Object.entries(archivosSeleccionados).forEach(([fieldName, file]) => {
                formData.append(fieldName, file);
            });

            // Log para debug
            console.log('📔 Actualizando diario - Twin ID:', twinId, 'Diary ID:', id);
            console.log('📔 Datos a enviar:', diaryData);
            console.log('🌍 Campos de ubicación enviados:', {
                pais: diaryData.pais,
                ciudad: diaryData.ciudad,
                estado: diaryData.estado,
                codigoPostal: diaryData.codigoPostal,
                direccion: diaryData.direccion,
                distrito: diaryData.distrito,
                telefono: diaryData.telefono,
                website: diaryData.website,
                latitud: diaryData.latitud,
                longitud: diaryData.longitud
            });
            console.log('📔 Archivos en FormData:', Object.keys(archivosSeleccionados));

            // Llamada real al API (PUT para actualizar)
            const response = await fetch(`/api/twins/${twinId}/diary/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('📔 Respuesta del servidor:', responseData);
                alert('✅ Diario actualizado exitosamente');
                navigate('/biografia/diario-personal');
            } else {
                const errorData = await response.text();
                console.error('📔 Error del servidor:', errorData);
                alert(`❌ Error al actualizar el diario: ${response.status}`);
            }
        } catch (error) {
            console.error('📔 Error actualizando entrada:', error);
            alert('❌ Error de conexión. Por favor verifica tu conexión a internet.');
        } finally {
            setGuardando(false);
        }
    };

    const tipoSeleccionado = tiposActividad.find(t => t.value === entrada.tipoActividad);

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando diario...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/biografia/diario-personal')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Button>
                    
                    <h1 className="text-3xl font-bold text-gray-800">
                        ✏️ Editar Diario Personal
                    </h1>
                    
                    <Button
                        onClick={guardarEntrada}
                        disabled={guardando}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                        <Save size={16} />
                        {guardando ? 'Actualizando...' : 'Actualizar Diario'}
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={entrada.fecha}
                                onChange={(e) => setEntrada(prev => ({ ...prev, fecha: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock size={16} className="inline mr-2" />
                                Hora
                            </label>
                            <input
                                type="time"
                                value={entrada.hora}
                                onChange={(e) => setEntrada(prev => ({ ...prev, hora: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Nombre de la Actividad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📝 Nombre de la Actividad
                        </label>
                        <input
                            type="text"
                            value={entrada.nombreActividad}
                            onChange={(e) => setEntrada(prev => ({ ...prev, nombreActividad: e.target.value }))}
                            placeholder="Ej: Reunión con el equipo, Cena en familia, Ejercicio matutino..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tipo de Actividad - Solo lectura en edición */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            🎯 Tipo de Actividad
                        </label>
                        {entrada.tipoActividad ? (
                            // Mostrar solo el tipo actual cuando está editando
                            <div className="p-4 rounded-lg border-2 bg-gray-50 border-gray-300">
                                {(() => {
                                    const tipoActual = tiposActividad.find(t => t.value === entrada.tipoActividad);
                                    if (tipoActual) {
                                        const IconComponent = tipoActual.icon;
                                        return (
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${tipoActual.color}`}>
                                                    <IconComponent size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">{tipoActual.label}</span>
                                                    <p className="text-xs text-gray-500 mt-1">El tipo de actividad no se puede cambiar al editar</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return <span className="text-sm text-gray-700">{entrada.tipoActividad}</span>;
                                })()}
                            </div>
                        ) : (
                            // Mostrar selector solo si no hay tipo de actividad (caso raro)
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {tiposActividad.map((tipo) => {
                                    const IconComponent = tipo.icon;
                                    return (
                                        <button
                                            key={tipo.value}
                                            type="button"
                                            onClick={() => handleTipoActividadChange(tipo.value)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 text-sm font-medium ${
                                                entrada.tipoActividad === tipo.value
                                                    ? `${tipo.color} text-white border-transparent shadow-lg scale-105`
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                        >
                                            <IconComponent size={20} />
                                            <span className="text-xs text-center">{tipo.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Preguntas Contextuales */}
                    {preguntasContextuales.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-3">
                                💡 Preguntas sugeridas para {tipoSeleccionado?.label}:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {preguntasContextuales.map((pregunta, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => agregarPregunta(pregunta)}
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                            {tipoSeleccionado && (
                                <button
                                    type="button"
                                    onClick={aplicarPlantilla}
                                    className="mt-3 text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                                >
                                    📝 Usar plantilla: {tipoSeleccionado.plantilla}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Campos Extra Dinámicos */}
                    {tipoSeleccionado && tipoSeleccionado.camposExtra.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                ⚙️ Información específica para {tipoSeleccionado.label}:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tipoSeleccionado.camposExtra.map((campo) => (
                                    <div key={campo.nombre}>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            {campo.label}
                                        </label>
                                        {campo.type === 'file' ? (
                                            <div>
                                                <input
                                                    type="file"
                                                    accept={campo.accept}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        handleFileChange(campo.nombre, file);
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{campo.placeholder}</p>
                                                {entrada.camposExtra[campo.nombre] && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✅ Archivo actual: {entrada.camposExtra[campo.nombre]}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                type={campo.type || 'text'}
                                                min={campo.min}
                                                max={campo.max}
                                                value={entrada.camposExtra[campo.nombre] || ''}
                                                onChange={(e) => handleCampoExtraChange(campo.nombre, e.target.value)}
                                                placeholder={campo.placeholder}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Editor de Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📝 Cuenta tu historia
                        </label>
                        <RichTextEditor
                            value={entrada.descripcion}
                            onChange={(value) => setEntrada(prev => ({ ...prev, descripcion: value }))}
                            placeholder="Cuenta qué pasó hoy, cómo te sentiste, qué aprendiste..."
                        />
                    </div>

                    {/* Ubicación y Participantes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-2" />
                                Dirección del lugar (opcional)
                            </label>
                            <GoogleAddressAutocompleteModern
                                value={entrada.ubicacion}
                                onChange={(value) => setEntrada(prev => ({ ...prev, ubicacion: value }))}
                                onPlaceSelected={handleGooglePlaceSelected}
                                placeholder="Busca la dirección usando Google Places"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users size={16} className="inline mr-2" />
                                Participantes
                            </label>
                            <input
                                type="text"
                                value={entrada.participantes}
                                onChange={(e) => setEntrada(prev => ({ ...prev, participantes: e.target.value }))}
                                placeholder="¿Quién estuvo contigo?"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Campos de Ubicación Detallados */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                            🗺️ Información detallada de ubicación (extraída automáticamente):
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    🌍 País
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.pais || ''}
                                    readOnly
                                    placeholder="Se extraerá automáticamente"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    🏙️ Ciudad
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.ciudad || ''}
                                    readOnly
                                    placeholder="Se extraerá automáticamente"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    🏛️ Estado/Provincia
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.estado || ''}
                                    readOnly
                                    placeholder="Se extraerá automáticamente"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    📮 Código Postal
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.codigoPostal || ''}
                                    readOnly
                                    placeholder="Se extraerá automáticamente"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    📍 Dirección específica
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.direccion || ''}
                                    readOnly
                                    placeholder="Se extraerá automáticamente"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    🏘️ Distrito/Colonia
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.distrito || ''}
                                    onChange={(e) => handleCampoExtraChange('distrito', e.target.value)}
                                    placeholder="Ej: Polanco, Beverly Hills..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Este campo se puede editar manualmente</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    📞 Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.telefono || ''}
                                    onChange={(e) => handleCampoExtraChange('telefono', e.target.value)}
                                    placeholder="Se extraerá automáticamente o ingresa manualmente"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    🌐 Website
                                </label>
                                <input
                                    type="text"
                                    value={entrada.camposExtra.website || ''}
                                    onChange={(e) => handleCampoExtraChange('website', e.target.value)}
                                    placeholder="Se extraerá automáticamente o ingresa manualmente"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Valoración */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Star size={16} className="inline mr-2" />
                            Valoración de la experiencia (1-5)
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setEntrada(prev => ({ ...prev, valoracion: value }))}
                                    className={`p-2 rounded-lg border-2 transition-all ${
                                        entrada.valoracion >= value
                                            ? 'bg-yellow-400 border-yellow-500 text-white'
                                            : 'bg-white border-gray-200 text-gray-400 hover:border-yellow-300'
                                    }`}
                                >
                                    <Star size={20} fill={entrada.valoracion >= value ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                            <span className="flex items-center ml-3 text-gray-600">
                                {entrada.valoracion}/5
                            </span>
                        </div>
                    </div>

                    {/* Fotos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Camera size={16} className="inline mr-2" />
                            Fotos (opcional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm mb-2">
                                Arrastra fotos aquí o haz clic para seleccionar
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        subirArchivosInmediato(e.target.files);
                                    }
                                }}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2"
                            >
                                <Plus size={16} className="mr-2" />
                                Seleccionar Fotos
                            </Button>
                        </div>

                        {/* Indicador de subida de archivos */}
                        {subiendoArchivos && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-blue-700">Subiendo archivos...</span>
                                </div>
                            </div>
                        )}

                        {/* Resultado de subida de archivos */}
                        {resultadoArchivos && (
                            <div className={`mt-4 p-3 rounded-lg ${
                                resultadoArchivos.success 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {resultadoArchivos.success ? (
                                        <CheckCircle size={16} className="text-green-600" />
                                    ) : (
                                        <AlertCircle size={16} className="text-red-600" />
                                    )}
                                    <span className={`text-sm ${
                                        resultadoArchivos.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {resultadoArchivos.message}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Lista de fotos subidas */}
                        {fotosSubidas.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Fotos subidas:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {fotosSubidas.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={url} 
                                                alt={`Foto subida ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fotos por URL */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Link size={16} className="inline mr-2" />
                            Fotos por URL (opcional)
                        </label>
                        
                        {/* Input para nueva URL */}
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={nuevaFotoUrl}
                                    onChange={(e) => setNuevaFotoUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={agregarFotoUrl}
                                disabled={!nuevaFotoUrl.trim() || !esUrlFotoValida(nuevaFotoUrl)}
                                className="px-4 py-2"
                            >
                                <Plus size={16} className="mr-2" />
                                Agregar
                            </Button>
                        </div>

                        {/* Lista de URLs agregadas */}
                        {fotosUrls.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">URLs agregadas:</p>
                                {fotosUrls.map((url, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Image size={16} className="text-gray-400" />
                                        <span className="flex-1 text-sm text-gray-700 truncate">{url}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => eliminarFotoUrl(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Botón para subir URLs */}
                        {fotosUrls.length > 0 && (
                            <Button
                                type="button"
                                onClick={subirFotosUrls}
                                disabled={subiendoFotos}
                                className="w-full"
                            >
                                {subiendoFotos ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Subiendo fotos...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={16} className="mr-2" />
                                        Subir {fotosUrls.length} foto{fotosUrls.length > 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Resultado de la subida */}
                        {resultadosFotos && (
                            <div className={`mt-4 p-3 rounded-lg ${
                                resultadosFotos.success 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {resultadosFotos.success ? (
                                        <CheckCircle size={16} className="text-green-600" />
                                    ) : (
                                        <AlertCircle size={16} className="text-red-600" />
                                    )}
                                    <span className={`text-sm ${
                                        resultadosFotos.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {resultadosFotos.message}
                                    </span>
                                </div>
                                {resultadosFotos.success && resultadosFotos.urls && (
                                    <div className="mt-2">
                                        <p className="text-xs text-green-600">URLs subidas:</p>
                                        {resultadosFotos.urls.map((url: string, index: number) => (
                                            <p key={index} className="text-xs text-green-600 truncate">{url}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/biografia/diario-personal')}
                            className="px-6"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={guardarEntrada}
                            disabled={guardando}
                            className="px-6"
                        >
                            {guardando ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    {id ? 'Actualizar' : 'Guardar'} Entrada
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiarioEditPage;
