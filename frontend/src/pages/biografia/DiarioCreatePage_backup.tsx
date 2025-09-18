import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Save,
    Calendar,
    Camera,
    Plus,
    X,
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
    Star
} from "lucide-react";
import { DiaryEntry as BackendDiaryEntry } from '@/types/DiaryEntry';

interface DiaryEntry {
    id: string;
    fecha: string;
    hora: string;
    nombreActividad: string;
    tipoActividad: string;
    descripcion: string;
    fotos: string[];
    ubicacion?: string;
    participantes?: string;
    valoracion?: number;
    camposExtra?: { [key: string]: string };
}

interface CampoExtra {
    nombre: string;
    label: string;
    placeholder: string;
    type?: string;
    min?: string;
    max?: string;
    accept?: string;
}

interface TipoActividad {
    value: string;
    label: string;
    icon: any;
    color: string;
    plantilla?: string;
    preguntas?: string[];
    camposExtra?: CampoExtra[];
}

const DiarioCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accounts } = useMsal();
    
    // Obtener el TwinId real del usuario autenticado
    const twinId = accounts[0]?.localAccountId;
    const [archivosSeleccionados, setArchivosSeleccionados] = useState<{ [key: string]: File }>({});
    
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

    const [guardando, setGuardando] = useState(false);

    const tiposActividad: TipoActividad[] = [
        { 
            value: 'Compras', 
            label: 'Compras', 
            icon: ShoppingBag, 
            color: 'bg-blue-500',
            plantilla: '🛍️ Hoy fui de compras...',
            preguntas: ['¿Qué compraste?', '¿Dónde fuiste?', '¿Cuánto gastaste?', '¿Estás satisfecho con la compra?'],
            camposExtra: [
                { nombre: 'gastoTotal', label: '💰 Gasto total', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'productosComprados', label: '� Productos comprados', placeholder: 'Lista de productos', type: 'text' },
                { nombre: 'tiendaLugar', label: '🏪 Tienda o lugar', placeholder: 'Nombre de la tienda', type: 'text' },
                { nombre: 'metodoPago', label: '💳 Método de pago', placeholder: 'Efectivo, tarjeta, etc.', type: 'text' },
                { nombre: 'categoriaCompra', label: '📂 Categoría de compra', placeholder: 'Ropa, comida, electrónicos...', type: 'text' },
                { nombre: 'satisfaccionCompra', label: '😊 Satisfacción (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Comida', 
            label: 'Comida', 
            icon: Utensils, 
            color: 'bg-red-500',
            plantilla: '🍽️ Experiencia gastronómica...',
            preguntas: ['¿Dónde comiste?', '¿Qué platillos probaste?', '¿Cómo estuvo la comida?', '¿Recomendarías el lugar?'],
            camposExtra: [
                { nombre: 'costoComida', label: '💰 Costo de la comida', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'restauranteLugar', label: '🏪 Restaurante o lugar', placeholder: 'Nombre del restaurante', type: 'text' },
                { nombre: 'tipoCocina', label: '🍜 Tipo de cocina', placeholder: 'Mexicana, italiana, asiática...', type: 'text' },
                { nombre: 'platosOrdenados', label: '� Platos ordenados', placeholder: 'Lista de platos, bebidas...', type: 'text' },
                { nombre: 'calificacionComida', label: '⭐ Calificación (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'ambienteComida', label: '🎼 Ambiente del lugar', placeholder: 'Familiar, romántico, casual...', type: 'text' },
                { nombre: 'recomendariaComida', label: '� ¿Recomendarías? (Sí/No)', placeholder: 'Sí', type: 'text' }
            ]
        },
        { 
            value: 'Viaje', 
            label: 'Viaje', 
            icon: Plane, 
            color: 'bg-purple-500',
            plantilla: '✈️ Experiencia de viaje...',
            preguntas: ['¿A dónde fuiste?', '¿Cómo viajaste?', '¿Cuál fue el propósito?', '¿Cómo te fue?'],
            camposExtra: [
                { nombre: 'costoViaje', label: '💰 Costo del viaje', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'destinoViaje', label: '📍 Destino', placeholder: 'Ciudad, país...', type: 'text' },
                { nombre: 'transporteViaje', label: '🚗 Transporte', placeholder: 'Avión, auto, tren...', type: 'text' },
                { nombre: 'propositoViaje', label: '🎯 Propósito', placeholder: 'Trabajo, vacaciones, familia...', type: 'text' },
                { nombre: 'calificacionViaje', label: '⭐ Calificación (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'duracionViaje', label: '⏰ Duración (horas)', placeholder: '8', type: 'number', min: '1' }
            ]
        },
        { 
            value: 'Entretenimiento', 
            label: 'Entretenimiento', 
            icon: Music, 
            color: 'bg-green-500',
            plantilla: '🎭 Entretenimiento...',
            preguntas: ['¿Qué actividad hiciste?', '¿Dónde fue?', '¿Con quién?', '¿Cómo te pareció?'],
            camposExtra: [
                { nombre: 'costoEntretenimiento', label: '💰 Costo', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'calificacionEntretenimiento', label: '⭐ Calificación (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'tipoEntretenimiento', label: '🎪 Tipo', placeholder: 'Cine, concierto, teatro...', type: 'text' },
                { nombre: 'tituloNombre', label: '📝 Título/Nombre', placeholder: 'Nombre de la película, obra...', type: 'text' },
                { nombre: 'lugarEntretenimiento', label: '🏢 Lugar', placeholder: 'Nombre del lugar', type: 'text' }
            ]
        },
        { 
            value: 'Ejercicio', 
            label: 'Ejercicio', 
            icon: Dumbbell, 
            color: 'bg-orange-500',
            plantilla: '💪 Sesión de ejercicio...',
            preguntas: ['¿Qué ejercicio hiciste?', '¿Dónde?', '¿Cuánto tiempo?', '¿Cómo te sentiste?'],
            camposExtra: [
                { nombre: 'costoEjercicio', label: '💰 Costo', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'energiaPostEjercicio', label: '⚡ Energía después (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'caloriasQuemadas', label: '🔥 Calorías quemadas', placeholder: '300', type: 'number', min: '0' },
                { nombre: 'tipoEjercicio', label: '🏃 Tipo de ejercicio', placeholder: 'Correr, gym, yoga...', type: 'text' },
                { nombre: 'duracionEjercicio', label: '⏰ Duración (minutos)', placeholder: '60', type: 'number', min: '1' },
                { nombre: 'intensidadEjercicio', label: '💪 Intensidad (1-5)', placeholder: '3', type: 'number', min: '1', max: '5' },
                { nombre: 'lugarEjercicio', label: '📍 Lugar', placeholder: 'Gimnasio, parque, casa...', type: 'text' },
                { nombre: 'rutinaEspecifica', label: '📋 Rutina específica', placeholder: 'Descripción de ejercicios', type: 'text' }
            ]
        },
        { 
            value: 'Estudio', 
            label: 'Estudio', 
            icon: Book, 
            color: 'bg-indigo-500',
            plantilla: '� Sesión de estudio...',
            preguntas: ['¿Qué estudiaste?', '¿Cuánto tiempo?', '¿Qué tan difícil fue?', '¿Cómo te sentiste?'],
            camposExtra: [
                { nombre: 'costoEstudio', label: '💰 Costo', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'dificultadEstudio', label: '🧠 Dificultad (1-5)', placeholder: '3', type: 'number', min: '1', max: '5' },
                { nombre: 'estadoAnimoPost', label: '😊 Estado después (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'materiaTema', label: '📖 Materia/Tema', placeholder: 'Matemáticas, inglés...', type: 'text' },
                { nombre: 'materialEstudio', label: '📝 Material usado', placeholder: 'Libros, videos, cursos...', type: 'text' },
                { nombre: 'duracionEstudio', label: '⏰ Duración (minutos)', placeholder: '120', type: 'number', min: '1' },
                { nombre: 'progresoEstudio', label: '📈 Progreso (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Trabajo', 
            label: 'Trabajo', 
            icon: Briefcase, 
            color: 'bg-blue-600',
            plantilla: '🏢 Jornada laboral...',
            preguntas: ['¿En qué proyectos trabajaste?', '¿Hubo reuniones?', '¿Qué lograste?', '¿Algún desafío?'],
            camposExtra: [
                { nombre: 'horasTrabajadas', label: '⏰ Horas trabajadas', placeholder: '8', type: 'number', min: '1', max: '24' },
                { nombre: 'proyectoPrincipal', label: '📂 Proyecto principal', placeholder: 'Nombre del proyecto', type: 'text' },
                { nombre: 'reunionesTrabajo', label: '🤝 Reuniones', placeholder: '3', type: 'number', min: '0' },
                { nombre: 'logrosHoy', label: '🎯 Logros del día', placeholder: 'Qué completaste', type: 'text' },
                { nombre: 'desafiosTrabajo', label: '🚧 Desafíos', placeholder: 'Problemas enfrentados', type: 'text' },
                { nombre: 'moodTrabajo', label: '😊 Estado laboral (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Salud', 
            label: 'Salud', 
            icon: Heart, 
            color: 'bg-red-600',
            plantilla: '🏥 Cuidado de la salud...',
            preguntas: ['¿Qué tipo de consulta?', '¿Con qué profesional?', '¿Motivo?', '¿Qué tratamiento?'],
            camposExtra: [
                { nombre: 'costoSalud', label: '💰 Costo', placeholder: '0.00', type: 'number', min: '0' },
                { nombre: 'tipoConsulta', label: '🩺 Tipo de consulta', placeholder: 'Médico general, dental...', type: 'text' },
                { nombre: 'profesionalCentro', label: '👨‍⚕️ Profesional/Centro', placeholder: 'Nombre del doctor/clínica', type: 'text' },
                { nombre: 'motivoConsulta', label: '📋 Motivo', placeholder: 'Revisión, síntomas...', type: 'text' },
                { nombre: 'tratamientoRecetado', label: '💊 Tratamiento', placeholder: 'Medicamentos, terapia...', type: 'text' },
                { nombre: 'proximaCita', label: '📅 Próxima cita', placeholder: 'YYYY-MM-DD', type: 'date' }
            ]
        },
        { 
            value: 'Llamadas', 
            label: 'Llamadas', 
            icon: Phone, 
            color: 'bg-purple-600',
            plantilla: '📞 Conversación telefónica...',
            preguntas: ['¿Con quién hablaste?', '¿Cuánto duró?', '¿De qué hablaron?', '¿Requiere seguimiento?'],
            camposExtra: [
                { nombre: 'contactoLlamada', label: '👤 Contacto', placeholder: 'Nombre de la persona', type: 'text' },
                { nombre: 'duracionLlamada', label: '⏰ Duración (minutos)', placeholder: '30', type: 'number', min: '1' },
                { nombre: 'motivoLlamada', label: '🎯 Motivo', placeholder: 'Trabajo, personal, familia...', type: 'text' },
                { nombre: 'temasConversacion', label: '💭 Temas', placeholder: 'Principales temas tratados', type: 'text' },
                { nombre: 'tipoLlamada', label: '📱 Tipo', placeholder: 'Voz, video, WhatsApp...', type: 'text' },
                { nombre: 'seguimientoLlamada', label: '📋 ¿Requiere seguimiento?', placeholder: 'Sí/No', type: 'text' }
            ]
        },
        { 
            value: 'Personal', 
            label: 'Personal', 
            icon: Heart, 
            color: 'bg-pink-500',
            plantilla: '💭 Reflexión personal...',
            preguntas: ['¿Cómo te sientes hoy?', '¿Qué te ha pasado?', '¿Hay algo que te preocupa?', '¿Qué agradeces?'],
            camposExtra: [
                { nombre: 'estadoEmocional', label: '💭 Estado emocional', placeholder: 'Feliz, triste, ansioso...', type: 'text' },
                { nombre: 'nivelEnergia', label: '⚡ Nivel de energía (1-5)', placeholder: '3', type: 'number', min: '1', max: '5' }
            ]
        }
    ];

    const tipoSeleccionado = tiposActividad.find(tipo => tipo.value === entrada.tipoActividad);
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
                { nombre: 'tipo_entretenimiento', label: '🎭 Tipo de entretenimiento', placeholder: 'Película, concierto, teatro, museo...', type: 'text' },
                { nombre: 'titulo_nombre', label: '📋 Título/Nombre', placeholder: 'Nombre de la película, show, obra...', type: 'text' },
                { nombre: 'lugar_entretenimiento', label: '🏢 Lugar', placeholder: 'Cine, teatro, estadio, casa...', type: 'text' },
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
                { nombre: 'modalidad', label: 'Modalidad', placeholder: 'Solo, multijugador, cooperativo...' }
            ]
        },
        { 
            value: 'salud', 
            label: 'Salud/Medicina', 
            icon: Heart, 
            color: 'bg-red-500',
            plantilla: '🏥 Cuidado de la salud...',
            preguntas: ['¿Qué tipo de consulta o tratamiento fue?', '¿Cómo te sentiste durante la visita?', '¿Qué recomendaciones recibiste?', '¿Hay seguimiento necesario?'],
            camposExtra: [
                { nombre: 'tipo_consulta', label: '👩‍⚕️ Tipo de consulta', placeholder: 'Médico general, dentista, especialista...', type: 'text' },
                { nombre: 'profesional_centro', label: '🏥 Profesional/Centro', placeholder: 'Nombre del doctor o centro médico', type: 'text' },
                { nombre: 'motivo_consulta', label: '📋 Motivo de consulta', placeholder: 'Revisión rutinaria, síntomas, tratamiento...', type: 'text' },
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

    const handleInputChange = (field: keyof DiaryEntry, value: any) => {
        setEntrada(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleActividadChange = (tipoValue: string) => {
        const tipoSeleccionado = tiposActividad.find(tipo => tipo.value === tipoValue);
        
        setEntrada(prev => ({
            ...prev,
            tipoActividad: tipoValue,
            camposExtra: {}, // Reset campos extra cuando cambia la actividad
            // Auto-añadir plantilla si la descripción está vacía
            descripcion: prev.descripcion === '' && tipoSeleccionado?.plantilla 
                ? tipoSeleccionado.plantilla + '\n\n' 
                : prev.descripcion
        }));
    };

    const handleCampoExtraChange = (nombreCampo: string, valor: string) => {
        setEntrada(prev => ({
            ...prev,
            camposExtra: {
                ...prev.camposExtra,
                [nombreCampo]: valor
            }
        }));
    };

    const handleFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    setEntrada(prev => ({
                        ...prev,
                        fotos: [...prev.fotos, base64]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const eliminarFoto = (index: number) => {
        setEntrada(prev => ({
            ...prev,
            fotos: prev.fotos.filter((_, i) => i !== index)
        }));
    };

    const guardarEntrada = async () => {
        if (!entrada.nombreActividad.trim() || !entrada.descripcion.trim()) {
            alert('Por favor completa el título y la descripción');
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
            // Encontrar el tipo seleccionado
            const tipoSeleccionado = tiposActividad.find(tipo => tipo.value === entrada.tipoActividad);
            
            // Crear FormData para enviar archivos y datos
            const formData = new FormData();
            
            // Preparar los datos de la entrada según el modelo del backend
            const diaryData = {
                titulo: entrada.nombreActividad,
                descripcion: entrada.descripcion,
                fecha: entrada.fecha + 'T' + entrada.hora + ':00.000Z',
                tipoActividad: entrada.tipoActividad, // Usar el valor tal como está
                labelActividad: tipoSeleccionado?.label || entrada.tipoActividad,
                ubicacion: entrada.ubicacion || '',
                estadoEmocional: entrada.camposExtra?.estadoEmocional || '',
                nivelEnergia: entrada.valoracion || 3,
                
                // Mapear campos extra a propiedades específicas del backend
                ...(entrada.camposExtra?.gastoTotal && { gastoTotal: Number(entrada.camposExtra.gastoTotal) }),
                ...(entrada.camposExtra?.productosComprados && { productosComprados: entrada.camposExtra.productosComprados }),
                ...(entrada.camposExtra?.tiendaLugar && { tiendaLugar: entrada.camposExtra.tiendaLugar }),
                ...(entrada.camposExtra?.metodoPago && { metodoPago: entrada.camposExtra.metodoPago }),
                ...(entrada.camposExtra?.categoriaCompra && { categoriaCompra: entrada.camposExtra.categoriaCompra }),
                ...(entrada.camposExtra?.satisfaccionCompra && { satisfaccionCompra: Number(entrada.camposExtra.satisfaccionCompra) }),
                
                ...(entrada.camposExtra?.costoComida && { costoComida: Number(entrada.camposExtra.costoComida) }),
                ...(entrada.camposExtra?.restauranteLugar && { restauranteLugar: entrada.camposExtra.restauranteLugar }),
                ...(entrada.camposExtra?.tipoCocina && { tipoCocina: entrada.camposExtra.tipoCocina }),
                ...(entrada.camposExtra?.platosOrdenados && { platosOrdenados: entrada.camposExtra.platosOrdenados }),
                ...(entrada.camposExtra?.calificacionComida && { calificacionComida: Number(entrada.camposExtra.calificacionComida) }),
                ...(entrada.camposExtra?.ambienteComida && { ambienteComida: entrada.camposExtra.ambienteComida }),
                ...(entrada.camposExtra?.recomendariaComida && { recomendariaComida: entrada.camposExtra.recomendariaComida === 'Sí' }),
                
                ...(entrada.camposExtra?.costoViaje && { costoViaje: Number(entrada.camposExtra.costoViaje) }),
                ...(entrada.camposExtra?.destinoViaje && { destinoViaje: entrada.camposExtra.destinoViaje }),
                ...(entrada.camposExtra?.transporteViaje && { transporteViaje: entrada.camposExtra.transporteViaje }),
                ...(entrada.camposExtra?.propositoViaje && { propositoViaje: entrada.camposExtra.propositoViaje }),
                ...(entrada.camposExtra?.calificacionViaje && { calificacionViaje: Number(entrada.camposExtra.calificacionViaje) }),
                ...(entrada.camposExtra?.duracionViaje && { duracionViaje: Number(entrada.camposExtra.duracionViaje) }),
                
                // Archivo adjunto unificado
                pathFile: entrada.fotos?.[0] || ''
            };

            // Añadir datos como JSON
            formData.append('diaryData', JSON.stringify(diaryData));

            // Añadir archivos reales al FormData
            Object.entries(archivosSeleccionados).forEach(([fieldName, file]) => {
                if (file instanceof File) {
                    // Usar el nombre del campo como nombre del archivo en el FormData
                    formData.append(fieldName, file, file.name);
                    console.log(`📎 Archivo añadido: ${fieldName} -> ${file.name} (${file.size} bytes)`);
                }
            });

            // Log para debug
            console.log('📔 Creando nuevo diario - Twin ID:', twinId);
            console.log('📔 Datos a enviar:', diaryData);
            console.log('📔 Archivos en FormData:', Object.keys(archivosSeleccionados));

            // Llamada real al API usando la función GetDiaryEntries del backend
            const response = await fetch(`/api/twins/${twinId}/diary`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('📔 Respuesta del servidor:', responseData);
                alert('✅ Entrada del diario guardada exitosamente');
                
                // Navegar a la lista de diarios
                navigate('/biografia/diario-personal');
            } else {
                const errorText = await response.text();
                console.error('📔 Error del servidor:', errorText);
                alert(`❌ Error al guardar el diario: ${response.status}`);
            }

        } catch (error) {
            console.error('📔 Error guardando entrada:', error);
            alert('❌ Error de conexión. Por favor verifica tu conexión a internet.');
        } finally {
            setGuardando(false);
        }
    };

    const tipoSeleccionado = tiposActividad.find(tipo => tipo.value === entrada.tipoActividad);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/biografia/diario-personal")}
                                className="mr-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">✏️ Crear Nuevo Diario Personal</h1>
                                <p className="text-gray-600">Registra tus experiencias diarias</p>
                            </div>
                        </div>
                        <Button
                            onClick={guardarEntrada}
                            disabled={guardando}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar Entrada'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Principal - Editor */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Información Básica */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label htmlFor="fecha" className="flex items-center mb-2 text-sm font-medium">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Fecha
                                    </label>
                                    <input
                                        id="fecha"
                                        type="date"
                                        value={entrada.fecha}
                                        onChange={(e) => handleInputChange('fecha', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="hora" className="flex items-center mb-2 text-sm font-medium">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Hora
                                    </label>
                                    <input
                                        id="hora"
                                        type="time"
                                        value={entrada.hora}
                                        onChange={(e) => handleInputChange('hora', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="valoracion" className="flex items-center mb-2 text-sm font-medium">
                                        <Star className="w-4 h-4 mr-2" />
                                        Valoración (1-10)
                                    </label>
                                    <input
                                        id="valoracion"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={entrada.valoracion}
                                        onChange={(e) => handleInputChange('valoracion', parseInt(e.target.value))}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Nombre de la Actividad */}
                            <div className="mb-6">
                                <label htmlFor="nombreActividad" className="text-lg font-semibold mb-2 block">
                                    ¿Qué hiciste hoy?
                                </label>
                                <input
                                    id="nombreActividad"
                                    type="text"
                                    placeholder="Ej: Almuerzo con mamá, Reunión de trabajo, Paseo en el parque..."
                                    value={entrada.nombreActividad}
                                    onChange={(e) => handleInputChange('nombreActividad', e.target.value)}
                                    className="w-full p-3 border rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Descripción Principal */}
                            <div className="mb-6">
                                <label htmlFor="descripcion" className="text-lg font-semibold mb-2 block">
                                    Cuenta tu historia
                                </label>
                                <RichTextEditor
                                    value={entrada.descripcion}
                                    onChange={(value) => handleInputChange('descripcion', value)}
                                    placeholder="Escribe aquí todo lo que quieras recordar sobre este momento. ¿Cómo te sentiste? ¿Qué pasó? ¿Qué aprendiste? ¿Con quién estuviste? ¿Qué fue lo más divertido o interesante?"
                                    minHeight="350px"
                                />
                            </div>

                            {/* Información Adicional - Campos dinámicos según actividad */}
                            {tipoSeleccionado && tipoSeleccionado.camposExtra && tipoSeleccionado.camposExtra.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-indigo-800">
                                        📋 Información específica para {tipoSeleccionado.label}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                                        {tipoSeleccionado.camposExtra.map((campo, index) => (
                                            <div key={index} className="space-y-2">
                                                <label htmlFor={campo.nombre} className="block text-sm font-medium text-indigo-900">
                                                    {campo.label}
                                                </label>
                                                {campo.type === 'file' ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            id={campo.nombre}
                                                            type="file"
                                                            accept={campo.accept}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    // Guardar el archivo real en el estado
                                                                    setArchivosSeleccionados(prev => ({
                                                                        ...prev,
                                                                        [campo.nombre]: file
                                                                    }));
                                                                    
                                                                    // Guardar el nombre para mostrar en la UI
                                                                    handleCampoExtraChange(campo.nombre, file.name);
                                                                }
                                                            }}
                                                            className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                        />
                                                        {entrada.camposExtra?.[campo.nombre] && (
                                                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                                                📎 Archivo seleccionado: {entrada.camposExtra[campo.nombre]}
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-500">{campo.placeholder}</p>
                                                    </div>
                                                ) : (
                                                    <input
                                                        id={campo.nombre}
                                                        type={campo.type || 'text'}
                                                        min={campo.min}
                                                        max={campo.max}
                                                        placeholder={campo.placeholder}
                                                        value={entrada.camposExtra?.[campo.nombre] || ''}
                                                        onChange={(e) => handleCampoExtraChange(campo.nombre, e.target.value)}
                                                        className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Información Adicional - Campos generales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="ubicacion" className="flex items-center mb-2 text-sm font-medium">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Ubicación
                                    </label>
                                    <input
                                        id="ubicacion"
                                        type="text"
                                        placeholder="¿Dónde pasó?"
                                        value={entrada.ubicacion}
                                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="participantes" className="flex items-center mb-2 text-sm font-medium">
                                        <Users className="w-4 h-4 mr-2" />
                                        ¿Con quién estuviste?
                                    </label>
                                    <input
                                        id="participantes"
                                        type="text"
                                        placeholder="Nombres de las personas"
                                        value={entrada.participantes}
                                        onChange={(e) => handleInputChange('participantes', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Fotos */}
                            <div>
                                <label className="flex items-center mb-4 text-lg font-semibold">
                                    <Camera className="w-5 h-5 mr-2" />
                                    Fotos del momento
                                </label>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {entrada.fotos.map((foto, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={foto}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => eliminarFoto(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                                    >
                                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Agregar foto</span>
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFotoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Columna Lateral - Tipo de Actividad */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h3 className="text-lg font-semibold mb-4">Tipo de Actividad</h3>
                            
                            <div className="grid grid-cols-1 gap-2">
                                {tiposActividad.map((tipo) => {
                                    const IconComponent = tipo.icon;
                                    const isSelected = entrada.tipoActividad === tipo.value;
                                    
                                    return (
                                        <button
                                            key={tipo.value}
                                            onClick={() => handleActividadChange(tipo.value)}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                isSelected
                                                    ? `${tipo.color} text-white shadow-md`
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <IconComponent className={`w-5 h-5 mr-3 ${
                                                    isSelected ? 'text-white' : 'text-gray-600'
                                                }`} />
                                                <span className={`font-medium ${
                                                    isSelected ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    {tipo.label}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Panel de sugerencias cuando hay una actividad seleccionada */}
                            {tipoSeleccionado && (
                                <div className="mt-6 space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <div className={`w-3 h-3 rounded-full ${tipoSeleccionado.color} mr-2`}></div>
                                            <span className="font-medium">Seleccionado: {tipoSeleccionado.label}</span>
                                        </div>
                                    </div>

                                    {/* Preguntas sugeridas */}
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">💡 Preguntas para reflexionar:</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            {tipoSeleccionado.preguntas?.map((pregunta, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-600 mr-2">•</span>
                                                    {pregunta}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Indicador de campos específicos */}
                                    {tipoSeleccionado.camposExtra && tipoSeleccionado.camposExtra.length > 0 && (
                                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                            <h4 className="font-medium text-green-900 mb-2">✅ Campos específicos activados</h4>
                                            <p className="text-sm text-green-800">
                                                Se han añadido {tipoSeleccionado.camposExtra.length} campos específicos para {tipoSeleccionado.label} en el formulario principal.
                                            </p>
                                            <div className="mt-2 text-xs text-green-700">
                                                Campos: {tipoSeleccionado.camposExtra.map(c => c.label.replace(/[^\w\s]/gi, '')).join(', ')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón para añadir plantilla */}
                                    {tipoSeleccionado.plantilla && (
                                        <button
                                            onClick={() => {
                                                if (tipoSeleccionado.plantilla && !entrada.descripcion.includes(tipoSeleccionado.plantilla)) {
                                                    handleInputChange('descripcion', 
                                                        entrada.descripcion + '\n\n' + tipoSeleccionado.plantilla + '\n\n'
                                                    );
                                                }
                                            }}
                                            className="w-full p-3 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                                        >
                                            ✨ Añadir plantilla: "{tipoSeleccionado.plantilla}"
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiarioCreatePage;
