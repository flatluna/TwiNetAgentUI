import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTwinId } from "@/hooks/useTwinId";
import { 
    ArrowLeft,
    Plus,
    Calendar as CalendarIcon,
    Activity,
    Edit,
    Trash2,
    Dumbbell,
    Timer,
    Zap,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Droplets,
    Heart,
    TrendingUp,
    RotateCw,
    Check,
    Target,
    Clock,
    Flame
} from "lucide-react";

// Tipos de datos - Actualizado para coincidir con backend C#
interface ActividadEjercicio {
    id: string;
    fecha: string;
    tipoActividad: string;
    duracionMinutos: number;
    intensidad: 'baja' | 'moderada' | 'alta';
    calorias?: number;
    pasos?: number;
    distanciaKm?: number;
    frecuenciaCardiacaPromedio?: number;
    frecuenciaCardiacaMaxima?: number;
    ubicacion?: string;
    notas?: string;
    nivelEsfuerzo?: number;
    hidratacionMl?: number;
    condicionClimatica?: string;
    fechaCreacion: string;
    fechaActualizacion: string;
}

// Interfaces para el Plan de Ejercicio - Coinciden con backend C#
interface ExerciseDetail {
    Name: string;
    Type: string; // Cardio, Strength, Flexibility, etc.
    DurationMinutes: number;
    Intensity: string; // Low, Moderate, High
    Description: string;
    Equipment: string[];
    Instructions: string[];
    EstimatedCaloriesBurn: number;
    HealthBenefits: string[];
    TargetedHealthMetrics: string;
}

interface DailyExercisePlan {
    DayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    DayName: string;
    Exercises: ExerciseDetail[];
    TotalDurationMinutes: number;
    TotalEstimatedCalories: number;
    Focus: string; // Upper Body, Lower Body, Cardio, Rest, etc.
    Notes: string;
}

interface WeeklyExercisePlan {
    id: string;
    TwinID: string;
    CreatedDate: string;
    StartDate: string;
    EndDate: string;
    PlanName: string;
    UserPreferences: string;
    Goals: string;
    FitnessLevel: string; // Beginner, Intermediate, Advanced
    DailyPlans: DailyExercisePlan[];
    TotalWeeklyMinutes: number;
    TotalWeeklyCalories: number;
    GeneralNotes: string;
    SafetyRecommendations: string[];
    HealthExecutiveSummary: string;
    HealthObjectives: string[];
    ExerciseStrategies: string[];
}

type VistaCalendario = 'dia' | 'semana' | 'mes';

const EjercicioActividadPage: React.FC = () => {
    const navigate = useNavigate();
    const { twinId } = useTwinId();
    
    const [actividades, setActividades] = useState<ActividadEjercicio[]>([]);
    const [loading, setLoading] = useState(false);
    const [vistaActual, setVistaActual] = useState<VistaCalendario>('dia');
    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
    const [planEjercicio, setPlanEjercicio] = useState<any>(null); // any para soportar camelCase y PascalCase
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [ejerciciosExpandidos, setEjerciciosExpandidos] = useState<Set<number>>(new Set());

    const toggleEjercicioExpandido = (index: number) => {
        const newSet = new Set(ejerciciosExpandidos);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setEjerciciosExpandidos(newSet);
    };

    // Función para formatear fecha en YYYY-MM-DD
    const formatearFechaISO = (fecha: Date): string => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        cargarActividades();
        cargarPlanEjercicio();
    }, [twinId, fechaSeleccionada, vistaActual]);

    const cargarPlanEjercicio = async () => {
        if (!twinId) return;
        
        setLoadingPlan(true);
        try {
            console.log('📋 Cargando plan activo de ejercicio para TwinID:', twinId);
            
            // Endpoint para obtener el plan activo de ejercicios
            const response = await fetch(`/agents-api/exercise/plan/active/${twinId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Plan activo recibido:', result);
                
                if (result.success && result.structuredPlan) {
                    // El plan viene en result.structuredPlan
                    console.log('💪 Plan estructurado encontrado:', result.structuredPlan);
                    // El plan real está dentro de planEjercicio
                    setPlanEjercicio(result.structuredPlan.planEjercicio || result.structuredPlan);
                } else if (result.success && result.plan) {
                    // Fallback: también puede venir en result.plan
                    console.log('💪 Plan encontrado en result.plan:', result.plan);
                    setPlanEjercicio(result.plan);
                } else if (result.hasActivePlan === false) {
                    console.log('ℹ️ No hay plan de ejercicio activo');
                    setPlanEjercicio(null);
                } else {
                    console.log('ℹ️ No hay plan de ejercicio guardado');
                    setPlanEjercicio(null);
                }
            } else if (response.status === 404) {
                console.log('⚠️ No se encontró plan de ejercicio activo');
                setPlanEjercicio(null);
            } else {
                console.log('⚠️ Error al cargar plan:', response.status);
                setPlanEjercicio(null);
            }
        } catch (error) {
            console.error('❌ Error cargando plan de ejercicio:', error);
            setPlanEjercicio(null);
        } finally {
            setLoadingPlan(false);
        }
    };

    const cargarActividades = async () => {
        if (!twinId) return;
        
        setLoading(true);
        try {
            console.log('🏃‍♂️ Cargando actividades para TwinID:', twinId);
            
            const response = await fetch(`/api/sports-activities/${twinId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const activities = data.activities || data || [];
                
                const actividadesConvertidas = activities.map((item: any) => ({
                    id: item.ID || item.id,
                    fecha: item.Fecha || item.ActivityDate || item.fecha,
                    tipoActividad: item.TipoActividad || item.ActivityType || item.tipoActividad,
                    duracionMinutos: item.DuracionMinutos || item.DurationMinutes || item.duracionMinutos,
                    intensidad: item.Intensidad || item.Intensity || item.intensidad || 'moderada',
                    calorias: item.Calorias || item.Calories || item.calorias,
                    pasos: item.Pasos || item.Steps || item.pasos,
                    distanciaKm: item.DistanciaKm || item.DistanceKm || item.distanciaKm,
                    frecuenciaCardiacaPromedio: item.FrecuenciaCardiacaPromedio || item.HeartRateAverage || item.frecuenciaCardiacaPromedio,
                    frecuenciaCardiacaMaxima: item.FrecuenciaCardiacaMaxima || item.HeartRateMax || item.frecuenciaCardiacaMaxima,
                    ubicacion: item.Ubicacion || item.Location || item.ubicacion,
                    nivelEsfuerzo: item.NivelEsfuerzo || item.EffortLevel || item.nivelEsfuerzo,
                    hidratacionMl: item.HidratacionMl || item.HydrationMl || item.hidratacionMl,
                    condicionClimatica: item.CondicionClimatica || item.condicionClimatica || item.Clima || item.Weather || item.clima,
                    notas: item.Notas || item.Notes || item.notas,
                    fechaCreacion: item.CreatedDate || new Date().toISOString(),
                    fechaActualizacion: item.UpdatedDate || new Date().toISOString()
                }));
                
                setActividades(actividadesConvertidas);
            }
        } catch (error) {
            console.error('Error loading activities:', error);
            setActividades([]);
        } finally {
            setLoading(false);
        }
    };

    const eliminarActividad = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/sports-activities/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ twinId })
            });

            if (response.ok) {
                await cargarActividades();
                alert('Actividad eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Error al eliminar la actividad');
        } finally {
            setLoading(false);
        }
    };

    // Funciones de navegación de fecha
    const irPeriodoAnterior = () => {
        const nuevaFecha = new Date(fechaSeleccionada);
        if (vistaActual === 'dia') {
            nuevaFecha.setDate(nuevaFecha.getDate() - 1);
        } else if (vistaActual === 'semana') {
            nuevaFecha.setDate(nuevaFecha.getDate() - 7);
        } else if (vistaActual === 'mes') {
            nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
        }
        setFechaSeleccionada(nuevaFecha);
    };

    const irPeriodoSiguiente = () => {
        const nuevaFecha = new Date(fechaSeleccionada);
        if (vistaActual === 'dia') {
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
        } else if (vistaActual === 'semana') {
            nuevaFecha.setDate(nuevaFecha.getDate() + 7);
        } else if (vistaActual === 'mes') {
            nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
        }
        setFechaSeleccionada(nuevaFecha);
    };

    const irHoy = () => {
        setFechaSeleccionada(new Date());
    };

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filtrar actividades del día seleccionado
    const fechaStr = formatearFechaISO(fechaSeleccionada);
    const actividadesDia = actividades.filter(a => a.fecha === fechaStr);

    // Obtener el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const diaSemana = fechaSeleccionada.getDay();
    
    // Obtener el plan del día desde el plan de ejercicios
    // IMPORTANTE: dailyPlans viene con minúscula desde el backend
    const planDelDia = planEjercicio?.dailyPlans?.find(
        (plan: any) => plan.dayOfWeek === diaSemana
    ) || planEjercicio?.DailyPlans?.find(
        (plan: DailyExercisePlan) => plan.DayOfWeek === diaSemana
    ) || null;

    // Debug: Log del plan del día
    useEffect(() => {
        console.log('📅 Día de la semana seleccionado:', diaSemana, '(0=Domingo, 1=Lunes, etc.)');
        console.log('📋 Plan de ejercicio cargado:', planEjercicio);
        console.log('📆 Plan del día encontrado:', planDelDia);
        if (planDelDia) {
            console.log('💪 Ejercicios del día:', planDelDia.Exercises);
        }
    }, [diaSemana, planEjercicio, planDelDia]);

    // Calcular totales planificados del día
    const totalesPlanificados = planDelDia ? {
        duracion: planDelDia.totalDurationMinutes || planDelDia.TotalDurationMinutes || 0,
        calorias: planDelDia.totalEstimatedCalories || planDelDia.TotalEstimatedCalories || 0,
        ejercicios: (planDelDia.exercises || planDelDia.Exercises || []).length
    } : { duracion: 0, calorias: 0, ejercicios: 0 };

    // Calcular totales realizados del día
    const totalesDia = actividadesDia.reduce((acc, actividad) => {
        return {
            duracion: acc.duracion + actividad.duracionMinutos,
            calorias: acc.calorias + (actividad.calorias || 0),
            pasos: acc.pasos + (actividad.pasos || 0),
            distancia: acc.distancia + (actividad.distanciaKm || 0),
            ejercicios: acc.ejercicios + 1
        };
    }, { duracion: 0, calorias: 0, pasos: 0, distancia: 0, ejercicios: 0 });

    // Verificar si es el día actual
    const hoy = new Date();
    const hoyStr = formatearFechaISO(hoy);
    const esDiaActual = fechaStr === hoyStr;

    const getIntensidadColor = (intensidad: string) => {
        switch (intensidad) {
            case 'baja': return 'from-green-400 to-green-500';
            case 'moderada': return 'from-yellow-400 to-yellow-500';
            case 'alta': return 'from-red-400 to-red-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const getActividadEmoji = (tipo: string) => {
        const emojiMap: { [key: string]: string } = {
            'Caminar': '🚶',
            'Correr': '🏃',
            'Ciclismo': '🚴',
            'Natación': '🏊',
            'Gimnasio': '🏋️',
            'Yoga': '🧘',
            'Pilates': '🤸',
            'Futbol': '⚽',
            'Basketball': '🏀',
            'Tenis': '🎾',
            'Boxeo': '🥊',
            'Baile': '💃',
            'Hiking': '🥾',
            'default': '🏃'
        };
        return emojiMap[tipo] || emojiMap['default'];
    };

    const formatearDuracion = (minutos: number) => {
        if (minutos < 60) return `${minutos}m`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="max-w-[1600px] mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={20} />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-400 to-green-500 p-2 rounded-xl">
                                        <Dumbbell size={28} className="text-white" />
                                    </div>
                                    Mi Diario de Ejercicios
                                </h1>
                                <p className="text-gray-500 mt-1">Registra y analiza tu actividad física</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={cargarPlanEjercicio}
                                disabled={loadingPlan}
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 flex items-center gap-2 text-lg px-6 py-6 shadow-lg"
                            >
                                {loadingPlan ? (
                                    <>
                                        <RotateCw size={24} className="animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <Target size={24} />
                                        Cargar Plan Activo
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => navigate('/twin-biografia/salud/ejercicio/crear-plan')}
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 flex items-center gap-2 text-lg px-6 py-6 shadow-lg"
                            >
                                <Dumbbell size={24} />
                                Crear Plan de Ejercicios
                            </Button>
                        </div>
                    </div>

                    {/* Tabs de vista y navegación */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="flex gap-2">
                            <Button
                                variant={vistaActual === 'mes' ? 'default' : 'outline'}
                                onClick={() => setVistaActual('mes')}
                                className={vistaActual === 'mes' ? 'bg-blue-600' : ''}
                            >
                                Mes
                            </Button>
                            <Button
                                variant={vistaActual === 'semana' ? 'default' : 'outline'}
                                onClick={() => setVistaActual('semana')}
                                className={vistaActual === 'semana' ? 'bg-blue-600' : ''}
                            >
                                Semana
                            </Button>
                            <Button
                                variant={vistaActual === 'dia' ? 'default' : 'outline'}
                                onClick={() => setVistaActual('dia')}
                                className={vistaActual === 'dia' ? 'bg-blue-600' : ''}
                            >
                                Día
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={cargarActividades}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
                                Actualizar
                            </Button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <Button variant="outline" size="sm" onClick={irPeriodoAnterior}>
                                <ChevronLeft size={20} />
                            </Button>
                            <div className="flex items-center gap-2">
                                <CalendarIcon size={20} className="text-gray-500" />
                                <span className="font-semibold text-gray-700 capitalize min-w-[280px] text-center">
                                    {formatearFecha(fechaSeleccionada)}
                                </span>
                            </div>
                            {!esDiaActual && (
                                <Button variant="outline" size="sm" onClick={irHoy}>
                                    Hoy
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={irPeriodoSiguiente}>
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Selector de Días de la Semana - Solo visible en vista día */}
                {vistaActual === 'dia' && planEjercicio && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Acceso Rápido por Día - Semana del {(() => {
                                const lunesSemana = new Date(fechaSeleccionada);
                                const dia = lunesSemana.getDay();
                                const diff = dia === 0 ? -6 : 1 - dia;
                                lunesSemana.setDate(lunesSemana.getDate() + diff);
                                return lunesSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                            })()}
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                            {(() => {
                                // Obtener el lunes de la semana de la fecha SELECCIONADA (no la actual)
                                const lunesSemana = new Date(fechaSeleccionada);
                                const dia = lunesSemana.getDay();
                                const diff = dia === 0 ? -6 : 1 - dia; // Si es domingo, retroceder 6 días
                                lunesSemana.setDate(lunesSemana.getDate() + diff);

                                // Crear array de 7 días (Lunes a Domingo) de esa semana
                                return Array.from({ length: 7 }, (_, i) => {
                                    const fecha = new Date(lunesSemana);
                                    fecha.setDate(lunesSemana.getDate() + i);
                                    
                                    const diaSemanaNum = fecha.getDay(); // 0=Domingo, 1=Lunes, etc.
                                    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                    const nombreDia = nombresDias[diaSemanaNum];
                                    
                                    // Formato de fecha: "Lun Nov/4"
                                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                    const mesAbreviado = meses[fecha.getMonth()];
                                    const diaDelMes = fecha.getDate();
                                    const fechaFormateada = `${nombreDia} ${mesAbreviado}/${diaDelMes}`;
                                    
                                    // Obtener plan del día
                                    const planDia = planEjercicio?.dailyPlans?.find(
                                        (plan: any) => plan.dayOfWeek === diaSemanaNum
                                    ) || planEjercicio?.DailyPlans?.find(
                                        (plan: any) => plan.DayOfWeek === diaSemanaNum
                                    );
                                    
                                    // Calorías planeadas
                                    const caloriasPlaneadas = planDia 
                                        ? (planDia.totalEstimatedCalories || planDia.TotalEstimatedCalories || 0)
                                        : 0;
                                    
                                    // Obtener actividades realizadas de ese día
                                    const fechaStr = formatearFechaISO(fecha);
                                    const actividadesDia = actividades.filter(a => a.fecha === fechaStr);
                                    const caloriasRealizadas = actividadesDia.reduce((sum, a) => sum + (a.calorias || 0), 0);
                                    const caloriasPendientes = Math.max(0, caloriasPlaneadas - caloriasRealizadas);
                                    
                                    // Verificar si es el día seleccionado
                                    const esSeleccionado = formatearFechaISO(fecha) === formatearFechaISO(fechaSeleccionada);
                                    const esHoy = formatearFechaISO(fecha) === formatearFechaISO(new Date());
                                    
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setFechaSeleccionada(fecha)}
                                            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                                                esSeleccionado
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white shadow-lg'
                                                    : esHoy
                                                    ? 'bg-green-50 border-green-400 text-green-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            <div className="text-xs font-bold mb-1">{fechaFormateada}</div>
                                            {caloriasPlaneadas > 0 ? (
                                                <>
                                                    <div className={`text-xs ${esSeleccionado ? 'text-white' : 'text-gray-500'}`}>
                                                        {caloriasPlaneadas} kcal
                                                    </div>
                                                    {caloriasPendientes > 0 ? (
                                                        <div className={`text-xs font-semibold mt-1 ${
                                                            esSeleccionado 
                                                                ? 'text-yellow-200' 
                                                                : 'text-orange-600'
                                                        }`}>
                                                            <Flame className="h-3 w-3 inline mr-1" />
                                                            {caloriasPendientes}
                                                        </div>
                                                    ) : (
                                                        <div className={`text-xs font-semibold mt-1 ${
                                                            esSeleccionado 
                                                                ? 'text-green-200' 
                                                                : 'text-green-600'
                                                        }`}>
                                                            <Check className="h-3 w-3 inline mr-1" />
                                                            Completo
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className={`text-xs ${esSeleccionado ? 'text-white opacity-70' : 'text-gray-400'}`}>
                                                    Sin plan
                                                </div>
                                            )}
                                            {esHoy && (
                                                <div className="text-xs font-bold mt-1 text-green-700">
                                                    HOY
                                                </div>
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {/* Mensaje cuando no hay plan en vista día */}
                {vistaActual === 'dia' && !planDelDia && !loadingPlan && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-400 p-3 rounded-full">
                                <Target size={32} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                    No hay plan de ejercicios para hoy
                                </h3>
                                <p className="text-yellow-700 mb-3">
                                    {planEjercicio 
                                        ? `No encontramos ejercicios planificados para ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]}`
                                        : 'No tienes un plan de ejercicios activo. Presiona "Cargar Plan Activo" o crea uno nuevo.'
                                    }
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={cargarPlanEjercicio}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                    >
                                        <RotateCw size={18} className="mr-2" />
                                        Recargar Plan
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/twin-biografia/salud/ejercicio/crear-plan')}
                                        className="bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                        <Dumbbell size={18} className="mr-2" />
                                        Crear Plan Nuevo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard de Progreso - Plan vs Realizado */}
                {vistaActual === 'dia' && planDelDia && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                                <div className="bg-gradient-to-br from-green-400 to-blue-500 p-2 rounded-xl">
                                    <Activity size={24} className="text-white" />
                                </div>
                                Progreso del Día
                            </h2>
                            <p className="text-gray-600">Comparación entre tu actividad y tu plan de ejercicios</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Duración Total */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        Duración Total
                                    </h3>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {totalesPlanificados.duracion > 0 
                                            ? Math.round((totalesDia.duracion / totalesPlanificados.duracion) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Realizado:</span>
                                        <span className="font-semibold text-blue-700">{totalesDia.duracion} min</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Planificado:</span>
                                        <span className="font-semibold text-gray-700">{totalesPlanificados.duracion} min</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((totalesDia.duracion / (totalesPlanificados.duracion || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Calorías Quemadas */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-orange-500" />
                                        Calorías Quemadas
                                    </h3>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {totalesPlanificados.calorias > 0 
                                            ? Math.round((totalesDia.calorias / totalesPlanificados.calorias) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Realizado:</span>
                                        <span className="font-semibold text-orange-700">{Math.round(totalesDia.calorias)} kcal</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Planificado:</span>
                                        <span className="font-semibold text-gray-700">{Math.round(totalesPlanificados.calorias)} kcal</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                        <div 
                                            className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((totalesDia.calorias / (totalesPlanificados.calorias || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Ejercicios Completados */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Dumbbell className="h-5 w-5 text-purple-500" />
                                        Ejercicios
                                    </h3>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {totalesPlanificados.ejercicios > 0 
                                            ? Math.round((totalesDia.ejercicios / totalesPlanificados.ejercicios) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Realizados:</span>
                                        <span className="font-semibold text-purple-700">{totalesDia.ejercicios}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Planificados:</span>
                                        <span className="font-semibold text-gray-700">{totalesPlanificados.ejercicios}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                        <div 
                                            className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((totalesDia.ejercicios / (totalesPlanificados.ejercicios || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumen simple cuando no hay plan */}
                {vistaActual === 'dia' && !planDelDia && actividadesDia.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-2 rounded-xl">
                                <Activity size={24} className="text-white" />
                            </div>
                            Resumen del Día
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                    <Timer className="h-5 w-5 text-blue-500" />
                                    Duración Total
                                </h3>
                                <p className="text-3xl font-bold text-blue-600">{formatearDuracion(totalesDia.duracion)}</p>
                                <p className="text-sm text-gray-600 mt-2">{totalesDia.ejercicios} actividad{totalesDia.ejercicios !== 1 ? 'es' : ''}</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                    <Zap className="h-5 w-5 text-orange-500" />
                                    Calorías
                                </h3>
                                <p className="text-3xl font-bold text-orange-600">{Math.round(totalesDia.calorias)}</p>
                                <p className="text-sm text-gray-600 mt-2">kcal quemadas</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                    <Activity className="h-5 w-5 text-purple-500" />
                                    Pasos
                                </h3>
                                <p className="text-3xl font-bold text-purple-600">{totalesDia.pasos.toLocaleString()}</p>
                                <p className="text-sm text-gray-600 mt-2">pasos totales</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                    <MapPin className="h-5 w-5 text-green-500" />
                                    Distancia
                                </h3>
                                <p className="text-3xl font-bold text-green-600">{totalesDia.distancia.toFixed(1)}</p>
                                <p className="text-sm text-gray-600 mt-2">kilómetros</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan de Ejercicios Guardado */}
                {planEjercicio && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="bg-gradient-to-br from-purple-400 to-indigo-500 p-2 rounded-xl">
                                    <Dumbbell size={24} className="text-white" />
                                </div>
                                Mi Plan de Ejercicios
                            </h2>
                            <Button
                                onClick={() => navigate('/twin-biografia/salud/ejercicio/revisar-plan', { state: { plan: planEjercicio } })}
                                variant="outline"
                                className="border-purple-500 text-purple-600 hover:bg-purple-50"
                            >
                                Ver Plan Completo
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                                <p className="text-sm text-gray-600 mb-1">Nombre del Plan</p>
                                <p className="text-lg font-bold text-purple-700">{planEjercicio.PlanName || 'Mi Plan Personalizado'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-1">Nivel de Fitness</p>
                                <p className="text-lg font-bold text-blue-700">{planEjercicio.FitnessLevel || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Objetivo</p>
                                <p className="text-lg font-bold text-green-700">{planEjercicio.Goals || 'Mejorar salud general'}</p>
                            </div>
                        </div>
                        {planEjercicio.HealthExecutiveSummary && (
                            <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-lg">
                                <p className="text-sm text-gray-700">{planEjercicio.HealthExecutiveSummary}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Título del Día */}
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl shadow-lg p-8 mb-6 text-white">
                    <div className="flex items-center justify-center gap-3">
                        <CalendarIcon className="h-10 w-10" />
                        <div className="text-center">
                            <p className="text-sm font-medium opacity-90 mb-1">Tus actividades para este día</p>
                            <h1 className="text-4xl font-bold capitalize">
                                {formatearFecha(fechaSeleccionada)}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Sección: Ejercicios Planificados vs Realizados */}
                {vistaActual === 'dia' && planDelDia && (planDelDia.exercises || planDelDia.Exercises || []).length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-xl font-bold text-indigo-900">
                                📋 Plan de Ejercicios para {planDelDia.dayName || planDelDia.DayName}
                            </h3>
                        </div>
                        
                        {(planDelDia.focus || planDelDia.Focus) && (
                            <div className="bg-white rounded-lg p-3 mb-4 border-l-4 border-indigo-500">
                                <p className="text-sm font-semibold text-indigo-700">Enfoque del Día:</p>
                                <p className="text-gray-800">{planDelDia.focus || planDelDia.Focus}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {(planDelDia.exercises || planDelDia.Exercises || []).map((ejercicio: any, index: number) => {
                                // Buscar si este ejercicio fue realizado
                                const nombreEjercicio = ejercicio.name || ejercicio.Name || '';
                                const ejercicioRealizado = actividadesDia.find(
                                    act => act.tipoActividad.toLowerCase().includes(nombreEjercicio.toLowerCase()) ||
                                           nombreEjercicio.toLowerCase().includes(act.tipoActividad.toLowerCase())
                                );
                                
                                const estaCompleto = ejercicioRealizado !== undefined;
                                const estaExpandido = ejerciciosExpandidos.has(index);

                                return (
                                    <div 
                                        key={index}
                                        className={`bg-white rounded-lg p-4 shadow border-2 transition-all ${
                                            estaCompleto 
                                                ? 'border-green-400 bg-green-50' 
                                                : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkmark Icon */}
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                estaCompleto ? 'bg-green-500' : 'bg-gray-200'
                                            }`}>
                                                {estaCompleto ? (
                                                    <Check className="h-5 w-5 text-white" />
                                                ) : (
                                                    <span className="text-gray-400 font-bold">{index + 1}</span>
                                                )}
                                            </div>

                                            {/* Ejercicio Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className={`font-bold text-lg ${estaCompleto ? 'text-green-700' : 'text-gray-800'}`}>
                                                        {nombreEjercicio}
                                                    </h4>
                                                    {estaCompleto && (
                                                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                                                            ✅ Completado
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-3 text-sm mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-indigo-600" />
                                                        <span className="font-semibold">{ejercicio.durationMinutes || ejercicio.DurationMinutes || 0} min</span>
                                                        {estaCompleto && ejercicioRealizado && (
                                                            <span className="text-green-600 ml-1">
                                                                (Real: {ejercicioRealizado.duracionMinutos} min)
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        <Flame className="h-4 w-4 text-orange-500" />
                                                        <span>{ejercicio.estimatedCaloriesBurn || ejercicio.EstimatedCaloriesBurn || 0} kcal</span>
                                                        {estaCompleto && ejercicioRealizado?.calorias && (
                                                            <span className="text-green-600 ml-1">
                                                                (Real: {ejercicioRealizado.calorias} kcal)
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        <Activity className="h-4 w-4 text-blue-600" />
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                            {ejercicio.intensity || ejercicio.Intensity || 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                            {ejercicio.type || ejercicio.Type || 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* Pasos Estimados */}
                                                    {(ejercicio.estimatedSteps || ejercicio.EstimatedSteps) && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-semibold">
                                                                🚶 {ejercicio.estimatedSteps || ejercicio.EstimatedSteps} pasos
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {(ejercicio.description || ejercicio.Description) && (
                                                    <p className="text-sm text-gray-600 mb-3">{ejercicio.description || ejercicio.Description}</p>
                                                )}

                                                {/* Botón Ver Más / Menos */}
                                                <button
                                                    onClick={() => toggleEjercicioExpandido(index)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 mb-2"
                                                >
                                                    {estaExpandido ? '▼ Ver menos' : '▶ Ver más detalles'}
                                                </button>

                                                {/* Detalles Expandidos */}
                                                {estaExpandido && (
                                                    <div className="mt-3 space-y-3 border-t pt-3">
                                                        {/* Equipment */}
                                                        {(ejercicio.equipment || ejercicio.Equipment) && (
                                                            <div className="bg-gray-50 rounded p-3">
                                                                <p className="text-sm font-semibold text-gray-700 mb-1">🏋️ Equipo Necesario:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-600">
                                                                    {(ejercicio.equipment || ejercicio.Equipment).map((item: string, i: number) => (
                                                                        <li key={i}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Instructions */}
                                                        {(ejercicio.instructions || ejercicio.Instructions) && (
                                                            <div className="bg-blue-50 rounded p-3">
                                                                <p className="text-sm font-semibold text-blue-700 mb-1">📝 Instrucciones:</p>
                                                                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                                                                    {(ejercicio.instructions || ejercicio.Instructions).map((inst: string, i: number) => (
                                                                        <li key={i}>{inst}</li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {/* Health Benefits */}
                                                        {(ejercicio.healthBenefits || ejercicio.HealthBenefits) && (
                                                            <div className="bg-green-50 rounded p-3">
                                                                <p className="text-sm font-semibold text-green-700 mb-1">💚 Beneficios para la Salud:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                                    {(ejercicio.healthBenefits || ejercicio.HealthBenefits).map((benefit: string, i: number) => (
                                                                        <li key={i}>{benefit}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Targeted Health Metrics */}
                                                        {(ejercicio.targetedHealthMetrics || ejercicio.TargetedHealthMetrics) && (
                                                            <div className="bg-purple-50 rounded p-3">
                                                                <p className="text-sm font-semibold text-purple-700 mb-1">🎯 Métricas de Salud Objetivo:</p>
                                                                <p className="text-sm text-gray-600">{ejercicio.targetedHealthMetrics || ejercicio.TargetedHealthMetrics}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!estaCompleto && esDiaActual && (
                                                    <Button
                                                        size="sm"
                                                        className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white"
                                                        onClick={() => navigate('/twin-biografia/salud/ejercicio/agregar-ia')}
                                                    >
                                                        <Plus size={16} className="mr-1" />
                                                        Registrar Ejercicio
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {(planDelDia.notes || planDelDia.Notes) && (
                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                <p className="text-sm font-semibold text-yellow-800">📝 Notas:</p>
                                <p className="text-sm text-gray-700">{planDelDia.notes || planDelDia.Notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Título: Actividades Realizadas */}
                {vistaActual === 'dia' && actividadesDia.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-6 w-6 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-800">📊 Actividades Realizadas</h3>
                    </div>
                )}

                {/* Lista de Actividades */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Cargando actividades...</span>
                    </div>
                ) : actividadesDia.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Dumbbell size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin actividades registradas</h3>
                        <p className="text-gray-500 mb-6">No hay actividades de ejercicio registradas para este día</p>
                        <Button
                            onClick={() => navigate('/twin-biografia/salud/ejercicio/agregar-ia')}
                            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                        >
                            <Plus size={20} className="mr-2" />
                            Agregar Ejercicio con IA
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {actividadesDia.map((actividad) => (
                            <div key={actividad.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Header de la actividad */}
                                <div className={`bg-gradient-to-r ${getIntensidadColor(actividad.intensidad)} p-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getActividadEmoji(actividad.tipoActividad)}</span>
                                            <div>
                                                <h3 className="text-xl font-bold">{actividad.tipoActividad}</h3>
                                                <p className="text-sm opacity-90">Intensidad {actividad.intensidad}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white text-white"
                                                onClick={() => navigate(`/twin-biografia/salud/ejercicio/editar/${actividad.id}`)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white text-white"
                                                onClick={() => eliminarActividad(actividad.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido de la actividad */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Timer size={18} className="text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Duración</p>
                                                <p className="font-semibold">{formatearDuracion(actividad.duracionMinutos)}</p>
                                            </div>
                                        </div>
                                        {actividad.calorias && actividad.calorias > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Zap size={18} className="text-orange-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Calorías</p>
                                                    <p className="font-semibold">{Math.round(actividad.calorias)} kcal</p>
                                                </div>
                                            </div>
                                        )}
                                        {actividad.distanciaKm && actividad.distanciaKm > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={18} className="text-green-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Distancia</p>
                                                    <p className="font-semibold">{actividad.distanciaKm.toFixed(1)} km</p>
                                                </div>
                                            </div>
                                        )}
                                        {actividad.pasos && actividad.pasos > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Activity size={18} className="text-purple-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Pasos</p>
                                                    <p className="font-semibold">{actividad.pasos.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información adicional */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                        {actividad.ubicacion && (
                                            <div>
                                                <p className="text-xs text-gray-500">Ubicación</p>
                                                <p className="font-medium text-gray-700">{actividad.ubicacion}</p>
                                            </div>
                                        )}
                                        {actividad.frecuenciaCardiacaPromedio && actividad.frecuenciaCardiacaPromedio > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Heart size={16} className="text-red-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">FC Promedio</p>
                                                    <p className="font-medium text-gray-700">{actividad.frecuenciaCardiacaPromedio} bpm</p>
                                                </div>
                                            </div>
                                        )}
                                        {actividad.nivelEsfuerzo && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={16} className="text-indigo-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Esfuerzo</p>
                                                    <p className="font-medium text-gray-700">{actividad.nivelEsfuerzo}/10</p>
                                                </div>
                                            </div>
                                        )}
                                        {actividad.hidratacionMl && actividad.hidratacionMl > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Droplets size={16} className="text-blue-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Hidratación</p>
                                                    <p className="font-medium text-gray-700">{actividad.hidratacionMl}ml</p>
                                                </div>
                                            </div>
                                        )}
                                        {actividad.condicionClimatica && (
                                            <div>
                                                <p className="text-xs text-gray-500">Clima</p>
                                                <p className="font-medium text-gray-700">{actividad.condicionClimatica}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notas */}
                                    {actividad.notas && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Notas</p>
                                            <p className="text-gray-700 italic">"{actividad.notas}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botón flotante para agregar actividad con IA */}
                <div className="fixed bottom-8 right-8">
                    <Button
                        onClick={() => navigate('/twin-biografia/salud/ejercicio/agregar-ia')}
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-full w-16 h-16 shadow-2xl"
                        size="lg"
                        title="Agregar ejercicio con IA"
                    >
                        <Plus size={32} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EjercicioActividadPage;
