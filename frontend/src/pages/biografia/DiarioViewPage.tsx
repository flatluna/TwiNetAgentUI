import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMsal } from "@azure/msal-react";
import {
    ArrowLeft,
    Edit,
    Calendar,
    Clock,
    MapPin,
    Star,
    User,
    FileText,
    Image,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Lightbulb,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    ZoomIn
} from "lucide-react";

const DiarioViewPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { accounts } = useMsal();
    const twinId = accounts[0]?.localAccountId;

    const [diario, setDiario] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para el carrusel de fotos
    const [fotos, setFotos] = useState<any[]>([]);
    const [cargandoFotos, setCargandoFotos] = useState(false);
    const [carruselAbierto, setCarruselAbierto] = useState(false);
    const [fotoActual, setFotoActual] = useState(0);

    const cargarFotos = async () => {
        if (!twinId || !id) return;

        try {
            setCargandoFotos(true);
            console.log('📸 Cargando fotos del diario - Twin ID:', twinId, 'Diary ID:', id);
            
            const response = await fetch(`/api/twins/${twinId}/diary/${id}/photos`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📸 Respuesta completa de fotos:', data);
                
                // El backend retorna un array de objetos DiaryPhotoInfo
                let fotosArray = [];
                
                if (Array.isArray(data)) {
                    // Si data es directamente un array
                    fotosArray = data;
                } else if (data.photos && Array.isArray(data.photos)) {
                    // Si data tiene una propiedad photos que es array
                    fotosArray = data.photos;
                } else if (data.data && Array.isArray(data.data)) {
                    // Si data tiene una propiedad data que es array
                    fotosArray = data.data;
                }
                
                console.log('📸 Array de fotos procesado:', fotosArray);
                
                // Mapear los objetos DiaryPhotoInfo para extraer las URLs y metadatos
                const fotosConMetadatos = fotosArray.map((foto: any) => {
                    if (typeof foto === 'string') {
                        // Si es string directo (legacy)
                        return {
                            url: foto,
                            fileName: 'Foto',
                            fileSize: 0,
                            mimeType: 'image/jpeg'
                        };
                    } else if (foto.sasUrl || foto.SasUrl) {
                        // Si es objeto DiaryPhotoInfo del backend
                        return {
                            url: foto.sasUrl || foto.SasUrl,
                            fileName: foto.fileName || foto.FileName || 'Foto sin nombre',
                            fileSize: foto.fileSize || foto.FileSize || 0,
                            mimeType: foto.mimeType || foto.MimeType || 'image/jpeg',
                            createdAt: foto.createdAt || foto.CreatedAt,
                            lastModified: foto.lastModified || foto.LastModified,
                            filePath: foto.filePath || foto.FilePath
                        };
                    } else {
                        console.warn('📸 Formato de foto no reconocido:', foto);
                        return null;
                    }
                }).filter(Boolean); // Filtrar elementos null
                
                setFotos(fotosConMetadatos);
                console.log('📸 Fotos con metadatos cargadas:', fotosConMetadatos.length, fotosConMetadatos);
            } else {
                console.warn('📸 No se pudieron cargar las fotos:', response.status, response.statusText);
                setFotos([]);
            }
        } catch (error) {
            console.error('📸 Error cargando fotos:', error);
            setFotos([]);
        } finally {
            setCargandoFotos(false);
        }
    };

    useEffect(() => {
        if (id && twinId) {
            cargarDiario();
            cargarFotos();
        }
    }, [id, twinId]);

    const cargarDiario = async () => {
        if (!twinId || !id) {
            setError('Parámetros faltantes');
            setCargando(false);
            return;
        }

        try {
            setCargando(true);
            console.log('📔 Cargando diario específico - Twin ID:', twinId, 'Diary ID:', id);
            
            const response = await fetch(`/api/twins/${twinId}/diary/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📔 Respuesta del diario específico:', data);
                
                // El backend puede retornar directamente el diario o envuelto en un objeto
                const diarioData = data.data || data.entry || data;
                
                // Mapear los datos del backend al formato esperado por el frontend
                const diarioMapeado = {
                    ...diarioData,
                    nombreActividad: diarioData.titulo || diarioData.nombreActividad,
                    camposExtra: {
                        // Campos específicos de comida
                        ...(diarioData.costoComida && { costoComida: diarioData.costoComida }),
                        ...(diarioData.restauranteLugar && { restauranteLugar: diarioData.restauranteLugar }),
                        ...(diarioData.tipoCocina && { tipoCocina: diarioData.tipoCocina }),
                        ...(diarioData.platosOrdenados && { platosOrdenados: diarioData.platosOrdenados }),
                        ...(diarioData.calificacionComida && { calificacionComida: diarioData.calificacionComida }),
                        ...(diarioData.ambienteComida && { ambienteComida: diarioData.ambienteComida }),
                        ...(typeof diarioData.recomendariaComida === 'boolean' && { recomendariaComida: diarioData.recomendariaComida ? 'Sí' : 'No' }),
                        
                        // Campos de viaje
                        ...(diarioData.costoViaje && { costoViaje: diarioData.costoViaje }),
                        ...(diarioData.destinoViaje && { destinoViaje: diarioData.destinoViaje }),
                        ...(diarioData.transporteViaje && { transporteViaje: diarioData.transporteViaje }),
                        ...(diarioData.propositoViaje && { propositoViaje: diarioData.propositoViaje }),
                        ...(diarioData.calificacionViaje && { calificacionViaje: diarioData.calificacionViaje }),
                        ...(diarioData.duracionViaje && { duracionViaje: diarioData.duracionViaje }),
                        
                        // Campos de trabajo
                        ...(diarioData.proyectoPrincipal && { proyectoPrincipal: diarioData.proyectoPrincipal }),
                        ...(diarioData.horasTrabajadas && { horasTrabajadas: diarioData.horasTrabajadas }),
                        ...(diarioData.reunionesTrabajo && { reunionesTrabajo: diarioData.reunionesTrabajo }),
                        ...(diarioData.logrosHoy && { logrosHoy: diarioData.logrosHoy }),
                        ...(diarioData.desafiosTrabajo && { desafiosTrabajo: diarioData.desafiosTrabajo }),
                        ...(diarioData.moodTrabajo && { moodTrabajo: diarioData.moodTrabajo }),
                        
                        // Campos de llamada
                        ...(diarioData.contactoLlamada && { contactoLlamada: diarioData.contactoLlamada }),
                        ...(diarioData.duracionLlamada && { duracionLlamada: diarioData.duracionLlamada }),
                        ...(diarioData.motivoLlamada && { motivoLlamada: diarioData.motivoLlamada }),
                        ...(diarioData.temasConversacion && { temasConversacion: diarioData.temasConversacion }),
                        ...(diarioData.tipoLlamada && { tipoLlamada: diarioData.tipoLlamada }),
                        ...(typeof diarioData.seguimientoLlamada === 'boolean' && { seguimientoLlamada: diarioData.seguimientoLlamada ? 'Sí' : 'No' }),
                        
                        // Campos de salud
                        ...(diarioData.costoSalud && { costoSalud: diarioData.costoSalud }),
                        ...(diarioData.tipoConsulta && { tipoConsulta: diarioData.tipoConsulta }),
                        ...(diarioData.profesionalCentro && { profesionalCentro: diarioData.profesionalCentro }),
                        ...(diarioData.motivoConsulta && { motivoConsulta: diarioData.motivoConsulta }),
                        ...(diarioData.tratamientoRecetado && { tratamientoRecetado: diarioData.tratamientoRecetado }),
                        ...(diarioData.proximaCita && { proximaCita: diarioData.proximaCita }),
                        
                        // Campos de ejercicio
                        ...(diarioData.costoEjercicio && { costoEjercicio: diarioData.costoEjercicio }),
                        ...(diarioData.energiaPostEjercicio && { energiaPostEjercicio: diarioData.energiaPostEjercicio }),
                        ...(diarioData.caloriasQuemadas && { caloriasQuemadas: diarioData.caloriasQuemadas }),
                        ...(diarioData.tipoEjercicio && { tipoEjercicio: diarioData.tipoEjercicio }),
                        ...(diarioData.duracionEjercicio && { duracionEjercicio: diarioData.duracionEjercicio }),
                        ...(diarioData.intensidadEjercicio && { intensidadEjercicio: diarioData.intensidadEjercicio }),
                        ...(diarioData.lugarEjercicio && { lugarEjercicio: diarioData.lugarEjercicio }),
                        ...(diarioData.rutinaEspecifica && { rutinaEspecifica: diarioData.rutinaEspecifica }),
                        
                        // Campos de estudio
                        ...(diarioData.costoEstudio && { costoEstudio: diarioData.costoEstudio }),
                        ...(diarioData.dificultadEstudio && { dificultadEstudio: diarioData.dificultadEstudio }),
                        ...(diarioData.estadoAnimoPost && { estadoAnimoPost: diarioData.estadoAnimoPost }),
                        ...(diarioData.materiaTema && { materiaTema: diarioData.materiaTema }),
                        ...(diarioData.materialEstudio && { materialEstudio: diarioData.materialEstudio }),
                        ...(diarioData.duracionEstudio && { duracionEstudio: diarioData.duracionEstudio }),
                        ...(diarioData.progresoEstudio && { progresoEstudio: diarioData.progresoEstudio }),
                        
                        // Campos de entretenimiento
                        ...(diarioData.costoEntretenimiento && { costoEntretenimiento: diarioData.costoEntretenimiento }),
                        ...(diarioData.calificacionEntretenimiento && { calificacionEntretenimiento: diarioData.calificacionEntretenimiento }),
                        ...(diarioData.tipoEntretenimiento && { tipoEntretenimiento: diarioData.tipoEntretenimiento }),
                        ...(diarioData.tituloNombre && { tituloNombre: diarioData.tituloNombre }),
                        ...(diarioData.lugarEntretenimiento && { lugarEntretenimiento: diarioData.lugarEntretenimiento }),
                        
                        // Campos de compras
                        ...(diarioData.gastoTotal && { gastoTotal: diarioData.gastoTotal }),
                        ...(diarioData.productosComprados && { productosComprados: diarioData.productosComprados }),
                        ...(diarioData.tiendaLugar && { tiendaLugar: diarioData.tiendaLugar }),
                        ...(diarioData.metodoPago && { metodoPago: diarioData.metodoPago }),
                        ...(diarioData.categoriaCompra && { categoriaCompra: diarioData.categoriaCompra }),
                        ...(diarioData.satisfaccionCompra && { satisfaccionCompra: diarioData.satisfaccionCompra }),
                        
                        // Campos de ubicación detallados
                        ...(diarioData.pais && { pais: diarioData.pais }),
                        ...(diarioData.ciudad && { ciudad: diarioData.ciudad }),
                        ...(diarioData.estado && { estado: diarioData.estado }),
                        ...(diarioData.codigoPostal && { codigoPostal: diarioData.codigoPostal }),
                        ...(diarioData.direccion && { direccion: diarioData.direccion }),
                        ...(diarioData.direccionEspecifica && { direccionEspecifica: diarioData.direccionEspecifica }),
                        ...(diarioData.distrito && { distrito: diarioData.distrito }),
                        ...(diarioData.distritoColonia && { distritoColonia: diarioData.distritoColonia }),
                        ...(diarioData.telefono && { telefono: diarioData.telefono }),
                        ...(diarioData.website && { website: diarioData.website }),
                        
                        // Campo de archivo
                        ...(diarioData.pathFile && { pathFile: diarioData.pathFile })
                    },
                    
                    // Campos adicionales del backend
                    sasUrl: diarioData.sasUrl,
                    diaryIndex: diarioData.diaryIndex,
                    latitud: diarioData.latitud,
                    longitud: diarioData.longitud
                };
                
                setDiario(diarioMapeado);
            } else {
                const errorText = await response.text();
                console.error('📔 Error del servidor:', errorText);
                setError(`Diario no encontrado: ${response.status}`);
            }
        } catch (error) {
            console.error('Error cargando diario:', error);
            setError('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    const getActivityIcon = (tipo: string) => {
        const iconMap: { [key: string]: string } = {
            'trabajo': '💼',
            'social': '👥',
            'viaje': '✈️',
            'hogar': '🏠',
            'compras': '🛍️',
            'comida': '🍽️',
            'ejercicio': '💪',
            'estudio': '📚',
            'entretenimiento': '🎭',
            'juegos': '🎮',
            'llamada': '📞',
            'salud': '🏥',
            'otros': '⭐'
        };
        return iconMap[tipo?.toLowerCase()] || '📝';
    };

    const getLabelForField = (fieldName: string): string => {
        const labels: { [key: string]: string } = {
            // Comida
            'costoComida': '💰 Costo de comida',
            'restauranteLugar': '🏪 Restaurante/Lugar',
            'tipoCocina': '🍽️ Tipo de cocina',
            'platosOrdenados': '🍴 Platos ordenados',
            'calificacionComida': '⭐ Calificación de comida',
            'ambienteComida': '🌟 Ambiente',
            'recomendariaComida': '👍 ¿Recomendarías?',
            
            // Viaje
            'costoViaje': '💰 Costo de viaje',
            'destinoViaje': '🗺️ Destino',
            'transporteViaje': '🚗 Transporte',
            'propositoViaje': '🎯 Propósito',
            'calificacionViaje': '⭐ Calificación de viaje',
            'duracionViaje': '⏱️ Duración',
            
            // Trabajo
            'proyectoPrincipal': '💼 Proyecto principal',
            'horasTrabajadas': '⏰ Horas trabajadas',
            'reunionesTrabajo': '👥 Reuniones',
            'logrosHoy': '🏆 Logros del día',
            'desafiosTrabajo': '⚡ Desafíos',
            'moodTrabajo': '😊 Estado de ánimo',
            
            // Llamada
            'contactoLlamada': '👤 Contacto',
            'duracionLlamada': '⏱️ Duración',
            'motivoLlamada': '📞 Motivo',
            'temasConversacion': '💬 Temas de conversación',
            'tipoLlamada': '📱 Tipo de llamada',
            'seguimientoLlamada': '📋 Requiere seguimiento',
            
            // Salud
            'costoSalud': '💰 Costo',
            'tipoConsulta': '🩺 Tipo de consulta',
            'profesionalCentro': '👩‍⚕️ Profesional/Centro',
            'motivoConsulta': '🏥 Motivo de consulta',
            'tratamientoRecetado': '💊 Tratamiento recetado',
            'proximaCita': '📅 Próxima cita',
            
            // Ejercicio
            'costoEjercicio': '💰 Costo',
            'energiaPostEjercicio': '⚡ Energía post-ejercicio',
            'caloriasQuemadas': '🔥 Calorías quemadas',
            'tipoEjercicio': '🏃‍♂️ Tipo de ejercicio',
            'duracionEjercicio': '⏱️ Duración',
            'intensidadEjercicio': '💪 Intensidad',
            'lugarEjercicio': '📍 Lugar',
            'rutinaEspecifica': '📋 Rutina específica',
            
            // Estudio
            'costoEstudio': '💰 Costo',
            'dificultadEstudio': '📊 Dificultad',
            'estadoAnimoPost': '😊 Estado de ánimo post-estudio',
            'materiaTema': '📚 Materia/Tema',
            'materialEstudio': '📖 Material de estudio',
            'duracionEstudio': '⏱️ Duración',
            'progresoEstudio': '📈 Progreso',
            
            // Entretenimiento
            'costoEntretenimiento': '💰 Costo',
            'calificacionEntretenimiento': '⭐ Calificación',
            'tipoEntretenimiento': '🎭 Tipo',
            'tituloNombre': '🎬 Título/Nombre',
            'lugarEntretenimiento': '📍 Lugar',
            
            // Compras
            'gastoTotal': '💰 Gasto total',
            'productosComprados': '🛍️ Productos comprados',
            'tiendaLugar': '🏪 Tienda/Lugar',
            'metodoPago': '💳 Método de pago',
            'categoriaCompra': '📂 Categoría',
            'satisfaccionCompra': '😊 Satisfacción',
            
            // Archivo
            'pathFile': '📎 Archivo adjunto'
        };
        
        return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    };

    const formatearFecha = (fecha: string) => {
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const formatearCampoExtra = (key: string, value: any) => {
        if (key === 'pathFile' && value) {
            return (
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Ver archivo adjunto
                    </a>
                </div>
            );
        }
        
        if (typeof value === 'number') {
            return value.toString();
        }
        
        return value || 'No especificado';
    };

    // Componente para mostrar el mapa
    const MapaUbicacion: React.FC<{ latitud: number; longitud: number; titulo: string }> = ({ latitud, longitud, titulo }) => {
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${latitud},${longitud}&zoom=15`;
        
        return (
            <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200 shadow-md">
                <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa de ${titulo}`}
                />
            </div>
        );
    };

    // Componente para mostrar análisis inteligente completo
    const AnalisisInteligente: React.FC<{ diaryIndex: any }> = ({ diaryIndex }) => {
        if (!diaryIndex || !diaryIndex.success) return null;

        const insights = typeof diaryIndex.insights === 'string' 
            ? JSON.parse(diaryIndex.insights) 
            : diaryIndex.insights || [];
        
        const alerts = typeof diaryIndex.alerts === 'string' 
            ? JSON.parse(diaryIndex.alerts) 
            : diaryIndex.alerts || [];

        return (
            <div className="space-y-4">
                {/* Resumen ejecutivo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <TrendingUp size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h5 className="font-semibold text-blue-800 mb-2">Análisis Inteligente</h5>
                            <p className="text-blue-700 leading-relaxed">{diaryIndex.executiveSummary}</p>
                            {diaryIndex.processingTimeMs && (
                                <p className="text-blue-500 text-sm mt-2">
                                    Procesado en: {(diaryIndex.processingTimeMs / 1000).toFixed(1)}s
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Discrepancia financiera si existe */}
                {diaryIndex.totalDiscrepancy && diaryIndex.totalDiscrepancy > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={20} className="text-amber-600" />
                            <div>
                                <h6 className="font-semibold text-amber-800">Discrepancia Financiera</h6>
                                <p className="text-amber-700">
                                    <DollarSign size={16} className="inline mr-1" />
                                    ${diaryIndex.totalDiscrepancy.toFixed(2)}
                                </p>
                                {diaryIndex.confidenceLevel && (
                                    <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs mt-1">
                                        Confianza: {diaryIndex.confidenceLevel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Insights y alertas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-3">
                                <Lightbulb size={18} className="text-green-600 mt-1" />
                                <h6 className="font-semibold text-green-800">Insights</h6>
                            </div>
                            <ul className="text-green-700 space-y-2">
                                {insights.map((insight: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        <span className="text-sm">{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {alerts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-3">
                                <AlertCircle size={18} className="text-red-600 mt-1" />
                                <h6 className="font-semibold text-red-800">Alertas y Recomendaciones</h6>
                            </div>
                            <ul className="text-red-700 space-y-2">
                                {alerts.map((alert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">⚠</span>
                                        <span className="text-sm">{alert}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Reporte HTML detallado */}
                {diaryIndex.detailedHtmlReport && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h6 className="font-semibold text-gray-800 mb-3">Reporte Detallado</h6>
                        <div 
                            className="prose max-w-none text-sm"
                            dangerouslySetInnerHTML={{ __html: diaryIndex.detailedHtmlReport }}
                        />
                    </div>
                )}
            </div>
        );
    };

    // Funciones del carrusel de fotos
    const abrirCarrusel = (indice: number) => {
        setFotoActual(indice);
        setCarruselAbierto(true);
    };

    const cerrarCarrusel = () => {
        setCarruselAbierto(false);
    };

    const fotoAnterior = () => {
        setFotoActual((prev) => (prev > 0 ? prev - 1 : fotos.length - 1));
    };

    const fotoSiguiente = () => {
        setFotoActual((prev) => (prev < fotos.length - 1 ? prev + 1 : 0));
    };

    // Manejar teclas de navegación
    useEffect(() => {
        const manejarTecla = (e: KeyboardEvent) => {
            if (!carruselAbierto) return;
            
            switch (e.key) {
                case 'Escape':
                    cerrarCarrusel();
                    break;
                case 'ArrowLeft':
                    fotoAnterior();
                    break;
                case 'ArrowRight':
                    fotoSiguiente();
                    break;
            }
        };

        document.addEventListener('keydown', manejarTecla);
        return () => document.removeEventListener('keydown', manejarTecla);
    }, [carruselAbierto]);

    // Loading state - debe estar después de todos los hooks
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

    if (error || !diario) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-red-600 mb-4">{error || 'Diario no encontrado'}</p>
                        <Button onClick={() => navigate('/biografia/diario-personal')}>
                            Volver a la lista
                        </Button>
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
                        Volver a la lista
                    </Button>
                    
                    <Button
                        onClick={() => navigate(`/biografia/diario-personal/editar/${diario.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Editar Diario
                    </Button>
                </div>

                {/* Diario Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header del Diario */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{getActivityIcon(diario.tipoActividad)}</span>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {diario.titulo || diario.nombreActividad || 'Sin título'}
                                    </h1>
                                    <p className="text-blue-100 capitalize">
                                        {diario.labelActividad || diario.tipoActividad || 'Sin categoría'}
                                    </p>
                                </div>
                            </div>
                            {(diario.valoracion || diario.nivelEnergia) && (
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                                    <Star size={20} className="text-yellow-300" fill="currentColor" />
                                    <span className="text-xl font-semibold">{diario.valoracion || diario.nivelEnergia}/5</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Imagen SAS si existe */}
                    {diario.sasUrl && (
                        <div className="relative">
                            <img 
                                src={diario.sasUrl} 
                                alt={diario.nombreActividad || diario.titulo}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                                <Image size={16} />
                                <span className="text-sm">Archivo adjunto</span>
                            </div>
                        </div>
                    )}

                    {/* Información básica */}
                    <div className="p-6 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Fecha</p>
                                    <p className="font-semibold">{formatearFecha(diario.fecha)}</p>
                                </div>
                            </div>
                            
                            {diario.hora && (
                                <div className="flex items-center gap-3">
                                    <Clock className="text-green-600" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Hora</p>
                                        <p className="font-semibold">{diario.hora}</p>
                                    </div>
                                </div>
                            )}
                            
                            {(diario.ubicacion || diario.camposExtra?.ciudad || diario.camposExtra?.pais) && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-red-600 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Ubicación</p>
                                        <div className="font-semibold space-y-1">
                                            {diario.ubicacion && <p>{diario.ubicacion}</p>}
                                            {diario.camposExtra?.direccion && diario.camposExtra.direccion !== diario.ubicacion && (
                                                <p className="text-sm text-gray-600">{diario.camposExtra.direccion}</p>
                                            )}
                                            {(diario.camposExtra?.ciudad || diario.camposExtra?.pais) && (
                                                <p className="text-sm text-gray-600">
                                                    {[diario.camposExtra?.ciudad, diario.camposExtra?.estado, diario.camposExtra?.pais].filter(Boolean).join(', ')}
                                                    {diario.camposExtra?.codigoPostal && ` ${diario.camposExtra.codigoPostal}`}
                                                </p>
                                            )}
                                            {diario.camposExtra?.telefono && (
                                                <p className="text-sm text-blue-600">📞 {diario.camposExtra.telefono}</p>
                                            )}
                                            {diario.camposExtra?.website && (
                                                <p className="text-sm text-blue-600">
                                                    🌐 <a href={diario.camposExtra.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {diario.camposExtra.website}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {diario.participantes && (
                                <div className="flex items-center gap-3">
                                    <User className="text-purple-600" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Participantes</p>
                                        <p className="font-semibold">{diario.participantes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                        <div 
                            className="prose max-w-none text-gray-700 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: diario.descripcion || 'Sin descripción' }}
                        />
                    </div>

                    {/* Campos Extra */}
                    {diario.camposExtra && Object.keys(diario.camposExtra).length > 0 && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-4">Detalles Adicionales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(diario.camposExtra).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {getLabelForField(key)}
                                        </p>
                                        <div className="text-gray-800">
                                            {formatearCampoExtra(key, value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fotos del endpoint */}
                    {fotos.length > 0 && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Image className="text-purple-600" />
                                Fotos ({fotos.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {fotos.map((foto: any, index: number) => (
                                    <div 
                                        key={index}
                                        className="relative group cursor-pointer"
                                        onClick={() => abrirCarrusel(index)}
                                    >
                                        <img 
                                            src={foto.url}
                                            alt={foto.fileName || `Foto ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                            onError={(e) => {
                                                console.error('📸 Error cargando imagen:', foto.url);
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                                        </div>
                                        {/* Información adicional en hover */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="truncate">{foto.fileName}</p>
                                            {foto.fileSize > 0 && (
                                                <p>{(foto.fileSize / 1024).toFixed(1)} KB</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fotos legacy (del diario.fotos) */}
                    {diario.fotos && diario.fotos.length > 0 && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-4">Fotos (Legacy)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {diario.fotos.map((foto: string, index: number) => (
                                    <img 
                                        key={index}
                                        src={foto}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => window.open(foto, '_blank')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Estado de carga de fotos */}
                    {cargandoFotos && (
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                                <span className="text-gray-600">Cargando fotos...</span>
                            </div>
                        </div>
                    )}

                    {/* Mapa si hay coordenadas */}
                    {diario.latitud && diario.longitud && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="text-red-600" />
                                Ubicación en el Mapa
                            </h3>
                            <MapaUbicacion 
                                latitud={diario.latitud} 
                                longitud={diario.longitud} 
                                titulo={diario.nombreActividad || diario.titulo || 'Ubicación'} 
                            />
                        </div>
                    )}

                    {/* Análisis Inteligente */}
                    {diario.diaryIndex && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" />
                                Análisis Inteligente
                            </h3>
                            <AnalisisInteligente diaryIndex={diario.diaryIndex} />
                        </div>
                    )}

                    {/* Footer con fechas */}
                    <div className="bg-gray-50 px-6 py-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            {(diario.createdAt || diario.fechaCreacion) && (
                                <p>Creado: {new Date(diario.createdAt || diario.fechaCreacion).toLocaleString('es-ES')}</p>
                            )}
                            {((diario.updatedAt || diario.fechaModificacion) && (diario.updatedAt || diario.fechaModificacion) !== (diario.createdAt || diario.fechaCreacion)) && (
                                <p>Última edición: {new Date(diario.updatedAt || diario.fechaModificacion).toLocaleString('es-ES')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal del carrusel de fotos */}
            {carruselAbierto && fotos.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {/* Botón cerrar */}
                        <button
                            onClick={cerrarCarrusel}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Botón anterior */}
                        {fotos.length > 1 && (
                            <button
                                onClick={fotoAnterior}
                                className="absolute left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Imagen principal */}
                        <div className="max-w-full max-h-full flex items-center justify-center">
                            <img
                                src={fotos[fotoActual]?.url}
                                alt={fotos[fotoActual]?.fileName || `Foto ${fotoActual + 1} de ${fotos.length}`}
                                className="max-w-full max-h-full object-contain shadow-2xl"
                                style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                                onError={(e) => {
                                    console.error('📸 Error en carrusel:', fotos[fotoActual]?.url);
                                    const target = e.target as HTMLImageElement;
                                    target.style.opacity = '0.5';
                                }}
                            />
                        </div>

                        {/* Botón siguiente */}
                        {fotos.length > 1 && (
                            <button
                                onClick={fotoSiguiente}
                                className="absolute right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Indicador de posición y info */}
                        {fotos.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-center">
                                <div className="text-sm font-semibold">
                                    {fotoActual + 1} de {fotos.length}
                                </div>
                                {fotos[fotoActual]?.fileName && (
                                    <div className="text-xs opacity-80 max-w-xs truncate">
                                        {fotos[fotoActual].fileName}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Miniaturas */}
                        {fotos.length > 1 && (
                            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-xs overflow-x-auto">
                                {fotos.map((foto: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setFotoActual(index)}
                                        className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-colors ${
                                            index === fotoActual ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'
                                        }`}
                                    >
                                        <img
                                            src={foto.url}
                                            alt={foto.fileName || `Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiarioViewPage;
