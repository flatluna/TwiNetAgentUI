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
            color: 'bg-pink-500',
            plantilla: '🛍️ Día de compras...',
            preguntas: ['¿Qué compraste?', '¿Dónde fuiste de compras?', '¿Era algo necesario o un capricho?', '¿Cómo fue la experiencia?'],
            camposExtra: [
                { nombre: 'gastoTotal', label: '💰 Gasto total', placeholder: '150.00', type: 'number' },
                { nombre: 'productosComprados', label: '🛒 Productos comprados', placeholder: 'Lista de productos que compraste', type: 'text' },
                { nombre: 'tiendaLugar', label: '🏪 Tienda/Centro comercial', placeholder: 'Nombre de la tienda o lugar', type: 'text' },
                { nombre: 'metodoPago', label: '💳 Método de pago', placeholder: 'Efectivo, tarjeta, transferencia...', type: 'text' },
                { nombre: 'categoriaCompra', label: '📂 Categoría', placeholder: 'Ropa, comida, electrónicos, hogar...', type: 'text' },
                { nombre: 'satisfaccionCompra', label: '😊 Nivel de satisfacción (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Comida', 
            label: 'Comida/Restaurante', 
            icon: Utensils, 
            color: 'bg-yellow-500',
            plantilla: '🍽️ Experiencia culinaria...',
            preguntas: ['¿Dónde comiste?', '¿Qué platos probaste?', '¿Con quién compartiste la comida?', '¿Cómo estuvo la comida?'],
            camposExtra: [
                { nombre: 'costoComida', label: '💰 Costo total', placeholder: '45.00', type: 'number' },
                { nombre: 'restauranteLugar', label: '🏪 Restaurante/Lugar', placeholder: 'Nombre del restaurante o lugar', type: 'text' },
                { nombre: 'tipoCocina', label: '🍜 Tipo de cocina', placeholder: 'Italiana, mexicana, japonesa, casera...', type: 'text' },
                { nombre: 'platosOrdenados', label: '🍕 Platos que pediste', placeholder: 'Lista de platos, bebidas, postres...', type: 'text' },
                { nombre: 'calificacionComida', label: '⭐ Calificación (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' },
                { nombre: 'ambienteComida', label: '🎵 Ambiente del lugar', placeholder: 'Ruidoso, romántico, familiar, casual...', type: 'text' },
                { nombre: 'recomendariaComida', label: '👍 ¿Lo recomendarías?', placeholder: 'Sí/No', type: 'text' }
            ]
        },
        { 
            value: 'Viaje', 
            label: 'Viaje/Turismo', 
            icon: Plane, 
            color: 'bg-green-600',
            plantilla: '✈️ Aventura viajera...',
            preguntas: ['¿A dónde fuiste?', '¿Cómo te trasladaste?', '¿Qué lugares visitaste?', '¿Cómo fue la experiencia?'],
            camposExtra: [
                { nombre: 'costoViaje', label: '💰 Gasto total', placeholder: '500.00', type: 'number', min: '0' },
                { nombre: 'destinoViaje', label: '🏝️ Destino', placeholder: 'Ciudad, país, lugar visitado', type: 'text' },
                { nombre: 'transporteViaje', label: '🚗 Transporte', placeholder: 'Auto, avión, bus, tren...', type: 'text' },
                { nombre: 'duracionViaje', label: '⏱️ Duración (días)', placeholder: '3', type: 'number', min: '1' },
                { nombre: 'propositoViaje', label: '🎯 Propósito', placeholder: 'Turístico, trabajo, familiar, aventura...', type: 'text' },
                { nombre: 'calificacionViaje', label: '😊 Calificación experiencia (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Entretenimiento', 
            label: 'Entretenimiento', 
            icon: Music, 
            color: 'bg-violet-500',
            plantilla: '🎭 Entretenimiento...',
            preguntas: ['¿Qué tipo de entretenimiento disfrutaste?', '¿Fue en casa o fuera?', '¿Te gustó?', '¿Lo recomendarías?'],
            camposExtra: [
                { nombre: 'tipoEntretenimiento', label: '🎭 Tipo de entretenimiento', placeholder: 'Película, concierto, teatro, museo...', type: 'text' },
                { nombre: 'tituloNombre', label: '📋 Título/Nombre', placeholder: 'Nombre de la película, show, obra...', type: 'text' },
                { nombre: 'lugarEntretenimiento', label: '🏢 Lugar', placeholder: 'Cine, teatro, estadio, casa...', type: 'text' },
                { nombre: 'costoEntretenimiento', label: '💰 Costo total', placeholder: '30.00', type: 'number' },
                { nombre: 'calificacionEntretenimiento', label: '⭐ Calificación (1-5)', placeholder: '5', type: 'number', min: '1', max: '5' },
                { nombre: 'recomendacionEntretenimiento', label: '👍 ¿Lo recomendarías?', placeholder: 'Sí/No y por qué', type: 'text' }
            ]
        },
        { 
            value: 'Ejercicio', 
            label: 'Ejercicio/Deporte', 
            icon: Dumbbell, 
            color: 'bg-teal-500',
            plantilla: '💪 Entrenamiento de hoy...',
            preguntas: ['¿Qué tipo de ejercicio hiciste?', '¿Cuánto tiempo entrenaste?', '¿Cómo te sentiste?', '¿Lograste tus objetivos?'],
            camposExtra: [
                { nombre: 'tipoEjercicio', label: '🏃‍♂️ Tipo de ejercicio', placeholder: 'Cardio, pesas, yoga, natación...', type: 'text' },
                { nombre: 'duracionEjercicio', label: '⏱️ Duración (minutos)', placeholder: '45', type: 'number' },
                { nombre: 'intensidadEjercicio', label: '🔥 Intensidad', placeholder: 'Baja, media, alta', type: 'text' },
                { nombre: 'lugarEjercicio', label: '📍 Lugar', placeholder: 'Gimnasio, casa, parque, piscina...', type: 'text' },
                { nombre: 'costoEjercicio', label: '💰 Costo (si aplica)', placeholder: '15.00', type: 'number' },
                { nombre: 'caloriasQuemadas', label: '🔥 Calorías quemadas (aprox)', placeholder: '300', type: 'number' },
                { nombre: 'energiaPost', label: '⚡ Nivel de energía después (1-5)', placeholder: '4', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Estudio', 
            label: 'Estudio/Lectura', 
            icon: Book, 
            color: 'bg-cyan-500',
            plantilla: '📚 Sesión de estudio...',
            preguntas: ['¿Qué estudiaste o leíste?', '¿Por cuánto tiempo?', '¿Qué aprendiste?', '¿Te resultó difícil o fácil?'],
            camposExtra: [
                { nombre: 'materiaTema', label: '📚 Materia/Tema', placeholder: 'Matemáticas, historia, programación, idiomas...', type: 'text' },
                { nombre: 'materialEstudio', label: '📖 Material usado', placeholder: 'Libro, video, curso online, tutor...', type: 'text' },
                { nombre: 'duracionEstudio', label: '⏱️ Duración (horas)', placeholder: '2', type: 'number' },
                { nombre: 'costoEstudio', label: '💰 Costo (si aplica)', placeholder: '25.00', type: 'number' },
                { nombre: 'progresoEstudio', label: '📈 Progreso', placeholder: 'Capítulos leídos, temas completados...', type: 'text' },
                { nombre: 'dificultadEstudio', label: '🎯 Nivel de dificultad (1-5)', placeholder: '3', type: 'number', min: '1', max: '5' }
            ]
        },
        { 
            value: 'Trabajo', 
            label: 'Trabajo', 
            icon: Briefcase, 
            color: 'bg-blue-600',
            plantilla: '💼 Jornada laboral...',
            preguntas: ['¿En qué trabajaste hoy?', '¿Fue productivo?', '¿Tuviste reuniones?', '¿Lograste tus objetivos?'],
            camposExtra: [
                { nombre: 'horasLaborales', label: '⏰ Horas trabajadas', placeholder: '8', type: 'number', min: '0', max: '24' },
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
            camposExtra: {}, // Limpiar campos extra cuando cambia el tipo
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

            // Agregar datos JSON
            Object.keys(diaryData).forEach(key => {
                formData.append(key, (diaryData as any)[key]);
            });

            // Agregar archivos si existen
            Object.keys(archivosSeleccionados).forEach(key => {
                formData.append('files', archivosSeleccionados[key]);
            });

            console.log('📝 Enviando datos del diario:', diaryData);

            const response = await fetch(`https://twinnetapi.azurewebsites.net/api/CreateDiaryEntry?code=lUGBJBYOLzCJxKm8lM0hh5CJyxNzz7OO7uqYBFWa0GzGAzFuOYGfbQ%3D%3D&twinId=${twinId}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log('✅ Entrada de diario guardada exitosamente');
                alert('✅ ¡Entrada de diario guardada exitosamente!');
                navigate('/biografia/diario-personal');
            } else {
                const errorData = await response.text();
                console.error('❌ Error al guardar la entrada:', errorData);
                throw new Error(`Error ${response.status}: ${errorData}`);
            }
        } catch (error) {
            console.error('Error al guardar la entrada del diario:', error);
            alert('❌ Error al guardar la entrada del diario. Por favor intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => navigate('/biografia/diario-personal')}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver</span>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-800">✨ Nueva Entrada de Diario</h1>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Calendar className="w-4 h-4" />
                                <span>Fecha</span>
                            </label>
                            <input
                                type="date"
                                value={entrada.fecha}
                                onChange={(e) => handleInputChange('fecha', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Clock className="w-4 h-4" />
                                <span>Hora</span>
                            </label>
                            <input
                                type="time"
                                value={entrada.hora}
                                onChange={(e) => handleInputChange('hora', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Star className="w-4 h-4" />
                                <span>Valoración</span>
                            </label>
                            <select
                                value={entrada.valoracion}
                                onChange={(e) => handleInputChange('valoracion', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={1}>1 - Muy malo</option>
                                <option value={2}>2 - Malo</option>
                                <option value={3}>3 - Regular</option>
                                <option value={4}>4 - Bueno</option>
                                <option value={5}>5 - Excelente</option>
                            </select>
                        </div>
                    </div>

                    {/* Título de la actividad */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título de la actividad
                        </label>
                        <input
                            type="text"
                            value={entrada.nombreActividad}
                            onChange={(e) => handleInputChange('nombreActividad', e.target.value)}
                            placeholder="Ej: Cena en restaurante italiano"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Tipo de actividad */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Tipo de actividad
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {tiposActividad.map((tipo) => {
                                const IconComponent = tipo.icon;
                                return (
                                    <button
                                        key={tipo.value}
                                        type="button"
                                        onClick={() => handleActividadChange(tipo.value)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                            entrada.tipoActividad === tipo.value
                                                ? `${tipo.color} border-white text-white shadow-lg transform scale-105`
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    >
                                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                                        <span className="text-sm font-medium">{tipo.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Campos específicos por tipo de actividad */}
                    {tipoSeleccionado && tipoSeleccionado.camposExtra && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Detalles específicos de {tipoSeleccionado.label}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tipoSeleccionado.camposExtra.map((campo) => (
                                    <div key={campo.nombre} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {campo.label}
                                        </label>
                                        {campo.type === 'file' ? (
                                            <input
                                                type="file"
                                                accept={campo.accept}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setArchivosSeleccionados(prev => ({
                                                            ...prev,
                                                            [campo.nombre]: file
                                                        }));
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : campo.type === 'textarea' ? (
                                            <textarea
                                                value={entrada.camposExtra?.[campo.nombre] || ''}
                                                onChange={(e) => handleCampoExtraChange(campo.nombre, e.target.value)}
                                                placeholder={campo.placeholder}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <input
                                                type={campo.type || 'text'}
                                                value={entrada.camposExtra?.[campo.nombre] || ''}
                                                onChange={(e) => handleCampoExtraChange(campo.nombre, e.target.value)}
                                                placeholder={campo.placeholder}
                                                min={campo.min}
                                                max={campo.max}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4" />
                                <span>Ubicación (opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={entrada.ubicacion}
                                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                placeholder="Ej: Ciudad de México, Polanco"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Users className="w-4 h-4" />
                                <span>Participantes (opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={entrada.participantes}
                                onChange={(e) => handleInputChange('participantes', e.target.value)}
                                placeholder="Ej: Juan, María, familia"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción detallada
                        </label>
                        <RichTextEditor
                            content={entrada.descripcion}
                            onChange={(content) => handleInputChange('descripcion', content)}
                            placeholder={tipoSeleccionado?.plantilla || "Describe tu experiencia..."}
                        />
                    </div>

                    {/* Preguntas guía */}
                    {tipoSeleccionado && tipoSeleccionado.preguntas && (
                        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                💡 Preguntas para inspirarte:
                            </h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                {tipoSeleccionado.preguntas.map((pregunta, index) => (
                                    <li key={index}>• {pregunta}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fotos */}
                    <div className="mb-8">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-4">
                            <Camera className="w-4 h-4" />
                            <span>Fotos (opcional)</span>
                        </label>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {entrada.fotos.map((foto, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={foto}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => eliminarFoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Agregar fotos</span>
                        </button>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/biografia/diario-personal')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={guardarEntrada}
                            disabled={guardando}
                            className="flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{guardando ? 'Guardando...' : 'Guardar Entrada'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiarioCreatePage;
