import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, Edit3, Trash2, RefreshCw, Calendar, Clock, 
    MapPin, Camera, Upload, X, ChevronLeft, ChevronRight,
    Users, Image, Utensils, Coffee, Plane, Car, Hotel, ShoppingBag,
    Mountain, Music, Gamepad2, BookOpen, Heart, Star, Eye, FileText,
    Bot, CheckCircle, Loader2, DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Tipos de actividades específicas para viajes
const actividadesViaje = [
    { value: 'desayuno', label: 'Desayuno', icon: Coffee },
    { value: 'almuerzo', label: 'Almuerzo', icon: Utensils },
    { value: 'cena', label: 'Cena', icon: Utensils },
    { value: 'vuelo', label: 'Vuelo', icon: Plane },
    { value: 'transporte', label: 'Transporte', icon: Car },
    { value: 'hotel', label: 'Check-in/out Hotel', icon: Hotel },
    { value: 'museo', label: 'Visita Museo', icon: BookOpen },
    { value: 'monumento', label: 'Monumento/Sitio', icon: Mountain },
    { value: 'playa', label: 'Playa/Costa', icon: Heart },
    { value: 'compras', label: 'Compras', icon: ShoppingBag },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: Music },
    { value: 'vida_nocturna', label: 'Vida Nocturna', icon: Star },
    { value: 'deportes', label: 'Deportes/Aventura', icon: Gamepad2 },
    { value: 'relax', label: 'Relax/Spa', icon: Heart },
    { value: 'otro', label: 'Otro', icon: Star }
];

// Interfaces
interface FotoActividad {
    id: string;
    url: string;
    nombre: string;
    descripcion?: string;
    fechaSubida: string;
}

interface DocumentoActividad {
    id: string;
    titulo?: string;
    descripcion?: string;
    fileName: string;
    filePath: string;
    documentType: 'Receipt' | 'Invoice' | 'Expense' | 'Other';
    establishmentType: 'restaurant' | 'hotel' | 'transport' | 'activity' | 'other' | 'Other';
    vendorName?: string;
    vendorAddress?: string;
    documentDate?: string;
    totalAmount: number;
    currency: string;
    taxAmount?: number;
    items?: any[];
    extractedText?: string;
    htmlContent?: string;
    aiSummary?: string;
    travelId?: string;
    itineraryId?: string;
    activityId?: string;
    fileSize?: number;
    mimeType?: string;
    documentUrl?: string; // URL SAS para ver el PDF
    createdAt?: string;
    updatedAt?: string;
    TwinID?: string;
    docType?: string;
    // Campos legacy para compatibilidad
    url?: string;
    nombre?: string;
    tipo?: 'recibo' | 'factura' | 'gasto' | 'otro';
    fechaSubida?: string;
    size?: number;
}

interface UploadTravelDocumentRequest {
    FileName: string;
    FileContent: string; // Base64
    EstablishmentType: 'restaurant' | 'hotel' | 'transport' | 'activity' | 'other';
    TravelId?: string;
    ItineraryId?: string;
    ActivityId?: string;
}

interface ActividadDiariaViaje {
    id?: string;
    itinerarioId: string;
    fecha: string;
    horaInicio: string;
    horaFin?: string;
    tipoActividad: string;
    titulo: string;
    descripcion?: string;
    ubicacion?: string;
    participantes: string[];
    fotos: FotoActividad[];
    documentos?: DocumentoActividad[];
    calificacion?: number; // 1-5 estrellas
    notas?: string;
    costo?: number;
    moneda?: string;
    coordenadas?: {
        latitud: number;
        longitud: number;
    };
    fechaCreacion: string;
    fechaActualizacion?: string;
}

interface Itinerario {
    id: string;
    titulo: string;
    viajeId: string;
    twinId: string;
    ciudadOrigen?: string;
    paisOrigen?: string;
    ciudadDestino?: string;
    paisDestino?: string;
    fechaInicio: string;
    fechaFin: string;
}

const ActividadesDiariasViajePage: React.FC = () => {
    const { itinerarioId } = useParams<{ viajeId: string; itinerarioId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Estados principales
    const [actividades, setActividades] = useState<ActividadDiariaViaje[]>([]);
    const [itinerario, setItinerario] = useState<Itinerario | null>(null);
    const [cargando, setCargando] = useState(true);

    // Estados del modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [actividadEditando, setActividadEditando] = useState<ActividadDiariaViaje | null>(null);

    // Estados del formulario
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [tipoActividad, setTipoActividad] = useState('museo');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [participantes, setParticipantes] = useState<string[]>(['']);
    const [calificacion, setCalificacion] = useState<number>(5);
    const [notas, setNotas] = useState('');
    const [costo, setCosto] = useState('');
    const [moneda, setMoneda] = useState('USD');

    // Estados para fotos
    const [fotosSeleccionadas, setFotosSeleccionadas] = useState<File[]>([]);
    const [previsualizacionFotos, setPrevisualizacionFotos] = useState<string[]>([]);
    const [subiendoFotos, setSubiendoFotos] = useState(false);
    const [fotosCarrusel, setFotosCarrusel] = useState<FotoActividad[]>([]); // Fotos para el carrusel
    
    // Estados para manejo de documentos PDF
    const [documentosSeleccionados, setDocumentosSeleccionados] = useState<File[]>([]);
    const [subiendoDocumentos, setSubiendoDocumentos] = useState(false);
    const [recargandoDocumentos, setRecargandoDocumentos] = useState<string | null>(null); // ID de actividad que se está recargando
    
    // Estado para dialog de progreso AI
    const [procesoAI, setProcesoAI] = useState<{
        activo: boolean;
        paso: string;
        progreso: number;
        archivo: string;
        descripcion: string;
    }>({
        activo: false,
        paso: '',
        progreso: 0,
        archivo: '',
        descripcion: ''
    });
    
    const [modalFoto, setModalFoto] = useState<{ abierto: boolean; fotoUrl: string; indice: number }>({
        abierto: false,
        fotoUrl: '',
        indice: 0
    });

    // Estado para modal de carrusel completo
    const [modalCarruselCompleto, setModalCarruselCompleto] = useState<{ 
        abierto: boolean; 
        fotos: FotoActividad[]; 
        indiceActual: number 
    }>({
        abierto: false,
        fotos: [],
        indiceActual: 0
    });

    // Estados de vista
    // const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('todas');
    // const [vistaDia, setVistaDia] = useState(false);

    // Funciones auxiliares
    const calcularTotalDocumentos = (actividad: ActividadDiariaViaje): number => {
        if (!actividad.documentos || actividad.documentos.length === 0) return 0;
        
        // Debug: verificar estructura de documentos
        console.log('🔍 Calculando total de documentos para:', actividad.titulo);
        console.log('📄 Documentos encontrados:', actividad.documentos);
        
        const total = actividad.documentos.reduce((sum, doc) => {
            const amount = doc.totalAmount || 0;
            console.log(`💰 Documento ${doc.fileName || doc.nombre}: $${amount}`);
            return sum + amount;
        }, 0);
        
        console.log(`💲 Total calculado: $${total}`);
        return total;
    };

    const formatCurrency = (amount: number, currency: string = 'USD'): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const navegarADocumento = (documento: DocumentoActividad) => {
        navigate(`/twin-biografia/documento/${documento.id}`, {
            state: { documento }
        });
    };

    useEffect(() => {
        cargarDatos();
    }, [location.state]);

    // Manejo de teclas para modal de carrusel completo
    useEffect(() => {
        const manejarTeclas = (e: KeyboardEvent) => {
            if (modalCarruselCompleto.abierto) {
                switch (e.key) {
                    case 'Escape':
                        cerrarModalCarruselCompleto();
                        break;
                    case 'ArrowLeft':
                        navegarCarruselCompleto('anterior');
                        break;
                    case 'ArrowRight':
                        navegarCarruselCompleto('siguiente');
                        break;
                }
            }
        };

        if (modalCarruselCompleto.abierto) {
            document.addEventListener('keydown', manejarTeclas);
        }

        return () => {
            document.removeEventListener('keydown', manejarTeclas);
        };
    }, [modalCarruselCompleto.abierto]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            console.log('CARGANDO ACTIVIDADES DIARIAS DE VIAJE');
            console.log('location.state:', location.state);
            
            // Cargar información del itinerario
            if (location.state && location.state.itinerario) {
                console.log('Itinerario desde location.state:', location.state.itinerario);
                setItinerario(location.state.itinerario);
            }
            
            // Obtener IDs necesarios para la API
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            const viajeId = itinerarioData?.viajeId || location.state?.viajeId;
            const itinerarioIdParam = itinerarioData?.id || itinerarioId;

            console.log('IDs para GET:', { twinId, viajeId, itinerarioId: itinerarioIdParam });

            if (twinId && viajeId && itinerarioIdParam) {
                // Usar el proxy de Vite en desarrollo
                const baseUrl = import.meta.env.DEV ? '' : 'http://localhost:7011';
                const url = `${baseUrl}/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioIdParam}/actividades-diarias`;
                
                console.log('Cargando actividades desde:', url);
                
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    console.log('Respuesta del servidor:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });

                    if (response.ok) {
                        const actividadesData = await response.json();
                        console.log('Actividades cargadas desde servidor:', actividadesData);
                        
                        // Manejar diferentes estructuras de respuesta del backend
                        let actividadesArray: ActividadDiariaViaje[] = [];
                        
                        if (actividadesData.success && Array.isArray(actividadesData.activities)) {
                            actividadesArray = actividadesData.activities;
                            console.log('Actividades establecidas desde success.activities:', actividadesArray.length, 'elementos');
                        } else if (Array.isArray(actividadesData)) {
                            actividadesArray = actividadesData;
                            console.log('Actividades establecidas correctamente (array directo):', actividadesArray.length, 'elementos');
                        } else if (actividadesData && Array.isArray(actividadesData.data)) {
                            actividadesArray = actividadesData.data;
                            console.log('Actividades establecidas desde data:', actividadesArray.length, 'elementos');
                        } else if (actividadesData && Array.isArray(actividadesData.actividades)) {
                            actividadesArray = actividadesData.actividades;
                            console.log('Actividades establecidas desde actividades:', actividadesArray.length, 'elementos');
                        } else {
                            console.warn('Respuesta del servidor no es un array válido:', actividadesData);
                            console.log('Cargando datos simulados como fallback...');
                            cargarDatosSimulados();
                            return;
                        }

                        // Validar que las actividades tengan la estructura correcta
                        const actividadesValidas = actividadesArray.filter(act => 
                            act && act.titulo && act.fecha && act.horaInicio
                        ).map(act => ({
                            ...act,
                            participantes: act.participantes || [],
                            fotos: act.fotos || []
                        }));

                        if (actividadesValidas.length !== actividadesArray.length) {
                            console.warn('Algunas actividades no tienen la estructura correcta');
                        }

                        setActividades(actividadesValidas);
                        console.log('Total de actividades válidas cargadas:', actividadesValidas.length);
                        
                    } else {
                        const errorText = await response.text();
                        console.warn('Error del servidor:', response.status, errorText);
                        console.log('Cargando datos simulados como fallback...');
                        cargarDatosSimulados();
                    }
                } catch (fetchError) {
                    console.error('Error en la petición fetch:', fetchError);
                    console.log('Cargando datos simulados como fallback...');
                    cargarDatosSimulados();
                }
            } else {
                console.warn('Faltan datos necesarios. Cargando datos simulados.');
                console.log('Datos faltantes:', { twinId, viajeId, itinerarioId: itinerarioIdParam });
                cargarDatosSimulados();
            }
            
        } catch (error) {
            console.error('Error general cargando actividades:', error);
            console.log('Cargando datos simulados como fallback...');
            cargarDatosSimulados();
        } finally {
            setCargando(false);
        }
    };

    const cargarDatosSimulados = () => {
        const actividadesSimuladas: ActividadDiariaViaje[] = [
            {
                id: 'act1',
                itinerarioId: itinerarioId || '',
                fecha: '2025-10-17',
                horaInicio: '08:00',
                horaFin: '09:00',
                tipoActividad: 'desayuno',
                titulo: 'Desayuno en Hotel Plaza',
                descripcion: 'Desayuno buffet continental con vista al mar',
                ubicacion: 'Hotel Plaza, Playa del Carmen',
                participantes: ['María García', 'Juan Pérez'],
                fotos: [],
                calificacion: 4,
                costo: 45,
                moneda: 'USD',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 'act2',
                itinerarioId: itinerarioId || '',
                fecha: '2025-10-17',
                horaInicio: '10:30',
                horaFin: '14:00',
                tipoActividad: 'museo',
                titulo: 'Museo Maya de Cancún',
                descripcion: 'Visita guiada por la historia maya y exposiciones arqueológicas',
                ubicacion: 'Museo Maya, Zona Hotelera, Cancún',
                participantes: ['María García', 'Juan Pérez', 'Ana López'],
                fotos: [],
                calificacion: 5,
                costo: 12,
                moneda: 'USD',
                notas: 'Excelente guía, muy recomendado para entender la cultura maya',
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 'act3',
                itinerarioId: itinerarioId || '',
                fecha: '2025-10-18',
                horaInicio: '09:00',
                horaFin: '17:00',
                tipoActividad: 'playa',
                titulo: 'Día de playa en Tulum',
                descripcion: 'Día completo en las playas de Tulum con ruinas mayas',
                ubicacion: 'Playa Tulum, Quintana Roo',
                participantes: ['María García', 'Juan Pérez'],
                fotos: [],
                calificacion: 5,
                costo: 25,
                moneda: 'USD',
                fechaCreacion: new Date().toISOString()
            }
        ];
        
        setActividades(actividadesSimuladas);
    };

    const recargarDatos = async () => {
        setCargando(true);
        await cargarDatos();
    };

    // Manejo de participantes
    const agregarParticipante = () => {
        setParticipantes([...participantes, '']);
    };

    const actualizarParticipante = (indice: number, valor: string) => {
        const nuevosParticipantes = [...participantes];
        nuevosParticipantes[indice] = valor;
        setParticipantes(nuevosParticipantes);
    };

    const eliminarParticipante = (indice: number) => {
        if (participantes.length > 1) {
            const nuevosParticipantes = participantes.filter((_, i) => i !== indice);
            setParticipantes(nuevosParticipantes);
        }
    };

    // Manejo de fotos
    const manejarSeleccionFotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const archivos = Array.from(event.target.files || []);
        const nuevasFotos = archivos.filter(archivo => 
            archivo.type.startsWith('image/') && archivo.size <= 10 * 1024 * 1024 // Max 10MB
        );

        console.log('📸 Fotos seleccionadas:', nuevasFotos.length);
        console.log('🔍 Estado actual - actividadEditando:', actividadEditando);
        console.log('🔍 ID de actividad en edición:', actividadEditando?.id);

        setFotosSeleccionadas(prev => [...prev, ...nuevasFotos]);

        // Crear previsualizaciones
        nuevasFotos.forEach(archivo => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPrevisualizacionFotos(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(archivo);
        });

        // Si estamos editando una actividad existente, subir fotos inmediatamente
        if (actividadEditando && actividadEditando.id && nuevasFotos.length > 0) {
            console.log('🔄 Actividad en edición detectada - subiendo fotos inmediatamente...');
            console.log('🔍 Actividad ID:', actividadEditando.id);
            
            // Obtener IDs necesarios
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            
            console.log('🔍 TwinId encontrado:', twinId);
            console.log('🔍 Datos del itinerario:', itinerarioData);
            
            if (twinId) {
                setSubiendoFotos(true);
                try {
                    console.log('🚀 Iniciando subida de fotos...');
                    // Pasar las nuevas fotos directamente a la función
                    await subirFotosActividad(actividadEditando.id, twinId, nuevasFotos);
                    console.log('✅ Fotos subidas inmediatamente durante edición');
                    
                    // Mostrar notificación de éxito
                    alert('✅ Fotos subidas exitosamente y agregadas a la actividad');
                    
                    // Recargar datos para mostrar las fotos actualizadas
                    await cargarDatos();
                    
                    // Limpiar las fotos seleccionadas ya que fueron subidas
                    setFotosSeleccionadas([]);
                    setPrevisualizacionFotos([]);
                    
                } catch (error) {
                    console.error('❌ Error subiendo fotos inmediatamente:', error);
                    alert(`Error subiendo fotos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                } finally {
                    setSubiendoFotos(false);
                }
            } else {
                console.warn('⚠️ No se puede subir fotos: twinId no disponible');
                alert('⚠️ No se puede subir las fotos: faltan datos necesarios (twinId)');
            }
        } else if (modalAbierto && nuevasFotos.length > 0) {
            // Respaldo: Si el modal está abierto pero actividadEditando no está configurado correctamente
            console.log('🔄 Modal abierto detectado - intentando subida manual...');
            
            // Intentar encontrar una actividad para editar de las que ya están cargadas
            const actividadParaEditar = actividades.length > 0 ? actividades[0] : null;
            
            if (actividadParaEditar && actividadParaEditar.id) {
                console.log('🔄 Usando actividad de respaldo:', actividadParaEditar.id);
                
                const itinerarioData = location.state?.itinerario;
                const twinId = itinerarioData?.twinId || location.state?.twinId;
                
                if (twinId) {
                    const confirmar = confirm('¿Quieres subir estas fotos a una actividad existente? (Se subirán a la primera actividad disponible)');
                    
                    if (confirmar) {
                        setSubiendoFotos(true);
                        try {
                            await subirFotosActividad(actividadParaEditar.id, twinId, nuevasFotos);
                            alert('✅ Fotos subidas como respaldo');
                            await cargarDatos();
                            setFotosSeleccionadas([]);
                            setPrevisualizacionFotos([]);
                        } catch (error) {
                            console.error('❌ Error en subida de respaldo:', error);
                            alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                        } finally {
                            setSubiendoFotos(false);
                        }
                    }
                }
            } else {
                console.log('ℹ️ No hay actividad de respaldo disponible');
            }
        } else {
            console.log('ℹ️ No se cumplen las condiciones para subida inmediata:');
            console.log('  - actividadEditando existe:', !!actividadEditando);
            console.log('  - tiene ID:', !!actividadEditando?.id);
            console.log('  - hay nuevas fotos:', nuevasFotos.length > 0);
            console.log('  - modal abierto:', modalAbierto);
        }
    };

    const eliminarFoto = (indice: number) => {
        const nuevasFotos = fotosSeleccionadas.filter((_, i) => i !== indice);
        const nuevasPrevisualizaciones = previsualizacionFotos.filter((_, i) => i !== indice);
        
        setFotosSeleccionadas(nuevasFotos);
        setPrevisualizacionFotos(nuevasPrevisualizaciones);
    };

    const abrirModalFoto = (fotoUrl: string, indice: number) => {
        setModalFoto({ abierto: true, fotoUrl, indice });
    };

    const cerrarModalFoto = () => {
        setModalFoto({ abierto: false, fotoUrl: '', indice: 0 });
        setFotosCarrusel([]); // Limpiar fotos del carrusel
    };

    const navegarFoto = (direccion: 'anterior' | 'siguiente', fotos?: FotoActividad[]) => {
        // Usar las fotos del carrusel si están disponibles, si no, usar las pasadas como parámetro
        const fotosParaNavegar = fotosCarrusel.length > 0 ? fotosCarrusel : (fotos || []);
        
        if (fotosParaNavegar.length === 0) return;
        
        const indiceActual = modalFoto.indice;
        let nuevoIndice;
        
        if (direccion === 'anterior') {
            nuevoIndice = indiceActual > 0 ? indiceActual - 1 : fotosParaNavegar.length - 1;
        } else {
            nuevoIndice = indiceActual < fotosParaNavegar.length - 1 ? indiceActual + 1 : 0;
        }
        
        setModalFoto({
            abierto: true,
            fotoUrl: fotosParaNavegar[nuevoIndice].url,
            indice: nuevoIndice
        });
    };

    // Funciones para modal de carrusel completo
    const abrirModalCarruselCompleto = (fotos: FotoActividad[], indiceInicial: number = 0) => {
        setModalCarruselCompleto({
            abierto: true,
            fotos: fotos,
            indiceActual: indiceInicial
        });
    };

    const cerrarModalCarruselCompleto = () => {
        setModalCarruselCompleto({
            abierto: false,
            fotos: [],
            indiceActual: 0
        });
    };

    const navegarCarruselCompleto = (direccion: 'anterior' | 'siguiente') => {
        const fotos = modalCarruselCompleto.fotos;
        if (fotos.length === 0) return;
        
        const indiceActual = modalCarruselCompleto.indiceActual;
        let nuevoIndice;
        
        if (direccion === 'anterior') {
            nuevoIndice = indiceActual > 0 ? indiceActual - 1 : fotos.length - 1;
        } else {
            nuevoIndice = indiceActual < fotos.length - 1 ? indiceActual + 1 : 0;
        }
        
        setModalCarruselCompleto(prev => ({
            ...prev,
            indiceActual: nuevoIndice
        }));
    };

    // Funciones para manejo del progreso AI
    const iniciarProcesoAI = (archivo: string) => {
        setProcesoAI({
            activo: true,
            paso: 'Subiendo documento...',
            progreso: 20,
            archivo: archivo,
            descripcion: 'Enviando archivo al servidor'
        });
    };

    const actualizarProgresoAI = (paso: string, progreso: number, descripcion: string) => {
        setProcesoAI(prev => ({
            ...prev,
            paso,
            progreso,
            descripcion
        }));
    };

    const finalizarProcesoAI = () => {
        // Mostrar progreso completo por un momento antes de cerrar
        setProcesoAI(prev => ({
            ...prev,
            paso: '¡Completado!',
            progreso: 100,
            descripcion: 'Documento procesado exitosamente'
        }));
        
        // Cerrar después de 1.5 segundos
        setTimeout(() => {
            setProcesoAI({
                activo: false,
                paso: '',
                progreso: 0,
                archivo: '',
                descripcion: ''
            });
        }, 1500);
    };

    const cancelarProcesoAI = () => {
        setProcesoAI({
            activo: false,
            paso: '',
            progreso: 0,
            archivo: '',
            descripcion: ''
        });
    };

    // Funciones para manejo de documentos PDF
    const subirDocumentosActividad = async (actividad: ActividadDiariaViaje, twinId: string, archivosParam?: File[]) => {
        // Usar archivos del parámetro o del estado
        const archivosParaSubir = archivosParam || documentosSeleccionados;
        
        if (archivosParaSubir.length === 0) {
            console.log('⚠️ No hay documentos para subir');
            return [];
        }

        const activityId = actividad.id;
        if (!twinId || !activityId) {
            const error = 'TwinId o ActivityId faltante';
            console.error('❌', error, { twinId, activityId });
            alert(error);
            return [];
        }

        // Obtener datos del itinerario para validación temprana
        const itinerarioData = location.state?.itinerario;
        const travelId = itinerarioData?.viajeId || location.state?.viajeId;
        const itineraryId = itinerarioData?.id || actividad.itinerarioId;
        
        console.log('🔍 Validando datos de contexto:', {
            twinId,
            activityId,
            travelId,
            itineraryId
        });

        const documentosSubidos: DocumentoActividad[] = [];
        
        try {
            setSubiendoDocumentos(true);
            console.log(`📄 Subiendo ${archivosParaSubir.length} documentos para actividad ${activityId} del twin ${twinId}`);
            
            for (let i = 0; i < archivosParaSubir.length; i++) {
                const file = archivosParaSubir[i];
                
                console.log(`📄 Subiendo documento ${i + 1}/${archivosParaSubir.length}: ${file.name}`);
                
                // Iniciar proceso AI para este archivo
                iniciarProcesoAI(file.name);
                
                // Convertir archivo a base64
                actualizarProgresoAI('Procesando archivo...', 30, 'Convirtiendo documento a formato requerido');
                const fileBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.split(',')[1]; // Remover el prefijo data:application/pdf;base64,
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Determinar tipo de establecimiento basado en el tipo de actividad
                const establishmentType = determinarTipoEstablecimiento(actividad.tipoActividad || 'other');

                const uploadRequest: UploadTravelDocumentRequest = {
                    FileName: file.name,
                    FileContent: fileBase64,
                    EstablishmentType: establishmentType,
                    TravelId: travelId,
                    ItineraryId: itineraryId,
                    ActivityId: activityId
                };

                const uploadUrl = `/api/twins/${twinId}/travels/upload-document`;
                console.log(`🔗 URL para subir documento: ${uploadUrl}`);
                console.log(`📄 Datos del request:`, {
                    FileName: uploadRequest.FileName,
                    EstablishmentType: uploadRequest.EstablishmentType,
                    TravelId: uploadRequest.TravelId || '❌ FALTANTE',
                    ItineraryId: uploadRequest.ItineraryId || '❌ FALTANTE',
                    ActivityId: uploadRequest.ActivityId || '❌ FALTANTE',
                    FileSize: fileBase64.length
                });

                // Advertir si faltan datos de contexto
                if (!uploadRequest.TravelId || !uploadRequest.ItineraryId) {
                    console.warn('⚠️ ADVERTENCIA: Faltan datos de contexto del viaje/itinerario');
                }

                actualizarProgresoAI('Enviando al servidor...', 50, 'Subiendo documento al almacén de datos');

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uploadRequest)
                });

                console.log(`📡 Response status: ${response.status} ${response.statusText}`);
                
                actualizarProgresoAI('Procesando con IA...', 75, 'Analizando contenido del documento con inteligencia artificial');
                
                // Simular tiempo de procesamiento AI (el backend ya está procesando)
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (response.ok) {
                    console.log(`✅ Documento subido exitosamente: ${file.name}`);
                    
                    actualizarProgresoAI('Guardando resultados...', 90, 'Almacenando información extraída');
                    
                    const documentoSubido: DocumentoActividad = {
                        id: `doc_${Date.now()}_${i}`,
                        fileName: file.name,
                        filePath: `documents/${file.name}`,
                        documentType: 'Receipt',
                        establishmentType: 'other',
                        totalAmount: 0,
                        currency: 'USD',
                        // Campos legacy para compatibilidad
                        url: `documents/${file.name}`,
                        nombre: file.name,
                        tipo: 'recibo',
                        fechaSubida: new Date().toISOString(),
                        size: file.size
                    };
                    
                    documentosSubidos.push(documentoSubido);
                    console.log(`✅ Documento subido: ${file.name}`);
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Error subiendo ${file.name}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        errorText: errorText,
                        url: uploadUrl
                    });
                    
                    // Cancelar progreso AI en caso de error
                    cancelarProcesoAI();
                    throw new Error(`Error subiendo ${file.name}: ${response.status} - ${errorText}`);
                }
            }
            
            // Finalizar proceso AI exitosamente
            finalizarProcesoAI();
            
            // Limpiar documentos seleccionados solo si no usamos archivos del parámetro
            if (!archivosParam) {
                setDocumentosSeleccionados([]);
            }
            
            // Actualizar la actividad específica con los documentos subidos
            setActividades(prev => prev.map(act => 
                act.id === activityId 
                    ? { ...act, documentos: [...(act.documentos || []), ...documentosSubidos] }
                    : act
            ));
            
            console.log(`🎉 Todos los documentos subidos exitosamente. Total: ${documentosSubidos.length}`);
            return documentosSubidos;
            
        } catch (error) {
            console.error('❌ Error subiendo documentos:', {
                error: error,
                message: error instanceof Error ? error.message : 'Error desconocido',
                stack: error instanceof Error ? error.stack : null
            });
            
            // Cancelar progreso AI en caso de error general
            cancelarProcesoAI();
            
            // Mostrar error al usuario
            alert(`Error subiendo documentos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            throw error;
        } finally {
            setSubiendoDocumentos(false);
        }
    };

    const determinarTipoEstablecimiento = (tipoActividad: string): 'restaurant' | 'hotel' | 'transport' | 'activity' | 'other' => {
        switch (tipoActividad) {
            case 'desayuno':
            case 'almuerzo':
            case 'cena':
                return 'restaurant';
            case 'hotel':
                return 'hotel';
            case 'vuelo':
            case 'transporte':
                return 'transport';
            case 'museo':
            case 'monumento':
            case 'senderismo':
            case 'playa':
            case 'tours':
                return 'activity';
            default:
                return 'other';
        }
    };

    // Función para subir fotos usando el nuevo endpoint simplificado
    const subirFotosActividad = async (activityId: string, twinId: string, fotosParaSubir?: File[]) => {
        // Usar las fotos pasadas como parámetro o las del estado
        const fotos = fotosParaSubir || fotosSeleccionadas;
        
        if (fotos.length === 0) {
            console.log('⚠️ No hay fotos para subir');
            return [];
        }

        const fotosSubidas: FotoActividad[] = [];
        
        try {
            console.log(`📤 Subiendo ${fotos.length} fotos para actividad ${activityId}`);
            console.log(`🔗 URL que se va a usar: /api/twins/${twinId}/activities/${activityId}/upload-photo`);
            
            for (let i = 0; i < fotos.length; i++) {
                const file = fotos[i];
                
                console.log(`📤 Subiendo foto ${i + 1}/${fotos.length}: ${file.name}`);
                
                const formData = new FormData();
                formData.append('photo', file);
                // Opcional: agregar nombre personalizado
                formData.append('fileName', `activity_${activityId}_${Date.now()}_${i + 1}.${file.name.split('.').pop()}`);
                
                // 🔗 URL simplificada - Solo twinId y activityId (corregida para coincidir con backend)
                const uploadUrl = `/api/twins/${twinId}/activities/${activityId}/upload-photo`;
                
                console.log(`🌐 Haciendo fetch a: ${uploadUrl}`);
                console.log(`📋 FormData contiene:`, {
                    photo: file.name,
                    fileName: `activity_${activityId}_${Date.now()}_${i + 1}.${file.name.split('.').pop()}`
                });
                
                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                console.log(`📡 Response status: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ Error subiendo foto ${file.name}:`, errorText);
                    throw new Error(`Error subiendo foto ${file.name}: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                console.log(`✅ Foto ${file.name} subida exitosamente:`, result);
                
                // Agregar la foto subida a la lista
                fotosSubidas.push({
                    id: result.fileName || file.name,
                    url: result.photoUrl,
                    nombre: result.fileName || file.name,
                    descripcion: `Foto ${i + 1}`,
                    fechaSubida: new Date().toISOString()
                });
            }
            
            console.log(`🎉 Todas las fotos subidas exitosamente. Total: ${fotosSubidas.length}`);
            return fotosSubidas;
            
        } catch (error) {
            console.error('❌ Error subiendo fotos:', error);
            throw error;
        }
    };

    // Función para obtener fotos de una actividad desde el backend
    const obtenerFotosActividad = async (activityId: string, twinId: string): Promise<FotoActividad[]> => {
        try {
            console.log(`📋 Obteniendo fotos para actividad ${activityId}`);
            
            const getPhotosUrl = `/api/twins/${twinId}/activities/${activityId}/fotos`;
            console.log(`🔗 URL para obtener fotos: ${getPhotosUrl}`);
            
            const response = await fetch(getPhotosUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error obteniendo fotos:`, errorText);
                throw new Error(`Error obteniendo fotos: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ Fotos obtenidas exitosamente:`, result);
            
            // Mapear la respuesta del backend al formato esperado del frontend
            const fotos: FotoActividad[] = result.photos?.map((photo: any, index: number) => ({
                id: photo.fileName || `photo_${index}`,
                url: photo.photoUrl || photo.url,
                nombre: photo.fileName || `Foto ${index + 1}`,
                descripcion: photo.description || `Foto ${index + 1} de la actividad`,
                fechaSubida: photo.uploadDate || new Date().toISOString()
            })) || [];
            
            console.log(`📸 ${fotos.length} fotos mapeadas correctamente`);
            return fotos;
            
        } catch (error) {
            console.error('❌ Error obteniendo fotos de la actividad:', error);
            throw error;
        }
    };

    // Función para recargar fotos de una actividad
    const recargarFotosActividad = async (actividad: ActividadDiariaViaje) => {
        try {
            console.log(`🔄 Recargando fotos para actividad: ${actividad.titulo}`);
            
            // Obtener IDs necesarios
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            
            if (!twinId || !actividad.id) {
                alert('⚠️ No se pueden cargar las fotos: faltan datos necesarios');
                return;
            }
            
            // Obtener fotos del backend
            const fotosDelBackend = await obtenerFotosActividad(actividad.id, twinId);
            
            console.log(`� ${fotosDelBackend.length} fotos obtenidas para ${actividad.titulo}`);
            
            // Actualizar las fotos de la actividad específica
            setActividades(prev => prev.map(act => 
                act.id === actividad.id 
                    ? { ...act, fotos: fotosDelBackend }
                    : act
            ));
            
        } catch (error) {
            console.error('❌ Error recargando fotos:', error);
            alert(`Error cargando fotos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    // Función para obtener documentos de una actividad desde el backend
    const obtenerDocumentosActividad = async (activityId: string, twinId: string): Promise<DocumentoActividad[]> => {
        try {
            console.log(`📋 Obteniendo documentos para actividad ${activityId}`);
            
            const getDocumentsUrl = `/api/twins/${twinId}/activities/${activityId}/documents`;
            console.log(`🔗 URL para obtener documentos: ${getDocumentsUrl}`);
            
            const response = await fetch(getDocumentsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                throw new Error(`Error obteniendo documentos: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📄 Respuesta completa del backend:', result);

            // Verificar que la respuesta sea exitosa
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            // Transformar la respuesta del backend al formato que esperamos
            const documentos: DocumentoActividad[] = result.documents || [];
            
            // Debug específico para documentos
            console.log('📄 Documentos recibidos del backend:');
            documentos.forEach((doc, index) => {
                console.log(`  Documento ${index + 1}:`);
                console.log(`    - ID: ${doc.id}`);
                console.log(`    - fileName: ${doc.fileName}`);
                console.log(`    - totalAmount: ${doc.totalAmount} (${typeof doc.totalAmount})`);
                console.log(`    - currency: ${doc.currency}`);
                console.log(`    - taxAmount: ${doc.taxAmount}`);
                console.log(`    - vendorName: ${doc.vendorName}`);
                console.log(`    - documentType: ${doc.documentType}`);
                console.log(`    - documentUrl: ${doc.documentUrl ? 'SÍ disponible' : 'NO disponible'}`);
                console.log(`    - Object keys:`, Object.keys(doc));
            });
            
            // Log de estadísticas si están disponibles
            if (result.statistics) {
                console.log('📊 Estadísticas de documentos:', result.statistics);
            }
            if (result.totalDocuments !== undefined) {
                console.log(`📈 Total de documentos: ${result.totalDocuments}`);
            }
            if (result.processedAt) {
                console.log(`⏰ Procesado en: ${result.processedAt}`);
            }
            
            return documentos;
            
        } catch (error) {
            console.error('❌ Error obteniendo documentos:', error);
            throw new Error(`Error obteniendo documentos de la actividad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const recargarDocumentosActividad = async (actividad: ActividadDiariaViaje) => {
        try {
            console.log(`🔄 Recargando documentos para actividad: ${actividad.titulo}`);
            
            // Activar estado de loading para esta actividad específica
            setRecargandoDocumentos(actividad.id || null);
            
            // Obtener IDs necesarios
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            
            if (!twinId || !actividad.id) {
                alert('⚠️ No se pueden cargar los documentos: faltan datos necesarios');
                return;
            }
            
            // Obtener documentos del backend
            const documentosDelBackend = await obtenerDocumentosActividad(actividad.id, twinId);
            
            console.log(`📄 ${documentosDelBackend.length} documentos obtenidos para ${actividad.titulo}`);
            
            // Actualizar los documentos de la actividad específica
            setActividades(prev => prev.map(act => 
                act.id === actividad.id 
                    ? { 
                        ...act, 
                        documentos: documentosDelBackend,
                        // Agregar timestamp de última actualización para futuras referencias
                        lastDocumentRefresh: new Date().toISOString()
                      }
                    : act
            ));
            
        } catch (error) {
            console.error('❌ Error recargando documentos:', error);
            alert(`Error cargando documentos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            // Desactivar estado de loading
            setRecargandoDocumentos(null);
        }
    };

    // Formulario
    const abrirModalNuevo = () => {
        limpiarFormulario();
        setModalAbierto(true);
    };

    const abrirModalEditar = (actividad: ActividadDiariaViaje) => {
        setActividadEditando(actividad);
        cargarDatosEnFormulario(actividad);
        setModalAbierto(true);
    };

    const limpiarFormulario = () => {
        setActividadEditando(null);
        setFecha('');
        setHoraInicio('');
        setHoraFin('');
        setTipoActividad('museo');
        setTitulo('');
        setDescripcion('');
        setUbicacion('');
        setParticipantes(['']);
        setCalificacion(5);
        setNotas('');
        setCosto('');
        setMoneda('USD');
        setFotosSeleccionadas([]);
        setPrevisualizacionFotos([]);
    };

    const cargarDatosEnFormulario = (actividad: ActividadDiariaViaje) => {
        setFecha(convertirFechaParaInput(actividad.fecha));
        setHoraInicio(actividad.horaInicio);
        setHoraFin(actividad.horaFin || '');
        setTipoActividad(actividad.tipoActividad);
        setTitulo(actividad.titulo);
        setDescripcion(actividad.descripcion || '');
        setUbicacion(actividad.ubicacion || '');
        setParticipantes((actividad.participantes && actividad.participantes.length > 0) ? actividad.participantes : ['']);
        setCalificacion(actividad.calificacion || 5);
        setNotas(actividad.notas || '');
        setCosto(actividad.costo?.toString() || '');
        setMoneda(actividad.moneda || 'USD');
        // Las fotos existentes se mantienen en la actividad
        setFotosSeleccionadas([]);
        setPrevisualizacionFotos([]);
    };

    const convertirFechaParaInput = (fechaISO: string): string => {
        if (!fechaISO) return '';
        try {
            const fecha = new Date(fechaISO);
            return fecha.toISOString().split('T')[0];
        } catch (error) {
            return '';
        }
    };

    const formatearFechaSafe = (fechaISO: string): string => {
        if (!fechaISO) return 'Fecha no disponible';
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return 'Fecha no válida';
            return fecha.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const guardarActividad = async () => {
        if (!titulo || !fecha || !horaInicio || !tipoActividad) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            console.log('Guardando actividad de viaje...');
            
            // Obtener IDs necesarios desde location.state o itinerario
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            const viajeId = itinerarioData?.viajeId || location.state?.viajeId;
            const itinerarioIdParam = itinerarioData?.id || itinerarioId;

            console.log('IDs para POST:', { twinId, viajeId, itinerarioId: itinerarioIdParam });

            if (!twinId || !viajeId || !itinerarioIdParam) {
                alert('Error: Faltan datos necesarios (twinId, viajeId, itinerarioId) para guardar la actividad.');
                console.error('Datos faltantes:', { twinId, viajeId, itinerarioId: itinerarioIdParam });
                return;
            }

            // Preparar datos para el POST (sin fotos primero)
            const actividadParaBackend = {
                ...(actividadEditando && { id: actividadEditando.id }), // Incluir ID cuando editamos
                twinId,
                viajeId,
                itinerarioId: itinerarioIdParam,
                fecha: `${fecha}T00:00:00`,
                horaInicio,
                horaFin: horaFin || undefined,
                tipoActividad,
                titulo,
                descripcion: descripcion || undefined,
                ubicacion: ubicacion || undefined,
                participantes: participantes.filter(p => p.trim() !== ''),
                calificacion,
                notas: notas || undefined,
                costo: costo ? parseFloat(costo) : undefined,
                moneda: moneda || 'USD',
                coordenadas: undefined // Se puede agregar después si se implementa geolocalización
            };

            console.log('Datos para POST:', actividadParaBackend);

            // Usar el proxy de Vite en desarrollo
            const baseUrl = import.meta.env.DEV ? '' : 'http://localhost:7011';
            const url = `${baseUrl}/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioIdParam}/actividades-diarias`;

            let response: Response;
            let actividadGuardada: ActividadDiariaViaje;

            if (actividadEditando) {
                // PUT para editar
                console.log('Editando actividad existente:', actividadEditando.id);
                console.log('Datos enviados para PUT:', JSON.stringify(actividadParaBackend, null, 2));
                response = await fetch(`${url}/${actividadEditando.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(actividadParaBackend)
                });
            } else {
                // POST para crear nueva
                console.log('Creando nueva actividad');
                console.log('Datos enviados para POST:', JSON.stringify(actividadParaBackend, null, 2));
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(actividadParaBackend)
                });
            }

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log('Respuesta exitosa:', responseData);
            console.log('Tipo de respuesta:', typeof responseData);
            console.log('Propiedades de respuesta:', Object.keys(responseData));

            // Extraer la actividad de la respuesta con manejo más flexible
            if (responseData.success && responseData.data) {
                console.log('Usando responseData.success.data');
                actividadGuardada = responseData.data;
            } else if (responseData.data && !responseData.success) {
                console.log('Usando responseData.data');
                actividadGuardada = responseData.data;
            } else if (responseData.id) {
                console.log('Usando respuesta directa (tiene id)');
                actividadGuardada = responseData;
            } else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                console.log('Usando respuesta como objeto directo');
                // Asumir que la respuesta es la actividad directamente
                actividadGuardada = {
                    ...responseData,
                    id: responseData.id || Date.now().toString(),
                    itinerarioId: itinerarioIdParam,
                    fecha: `${fecha}T00:00:00`,
                    horaInicio,
                    horaFin: horaFin || undefined,
                    tipoActividad,
                    titulo,
                    descripcion: descripcion || undefined,
                    ubicacion: ubicacion || undefined,
                    participantes: participantes.filter(p => p.trim() !== ''),
                    fotos: [],
                    calificacion,
                    notas: notas || undefined,
                    costo: costo ? parseFloat(costo) : undefined,
                    moneda: moneda || 'USD',
                    fechaCreacion: responseData.fechaCreacion || new Date().toISOString(),
                    fechaActualizacion: responseData.fechaActualizacion || new Date().toISOString()
                };
            } else {
                console.error('Estructura de respuesta no reconocida:', responseData);
                throw new Error(`Respuesta del servidor no contiene los datos esperados. Estructura recibida: ${JSON.stringify(responseData)}`);
            }

            // Simular URLs para fotos (hasta que se implemente subida real)
            const nuevasFotosActividad: FotoActividad[] = fotosSeleccionadas.map((archivo, indice) => ({
                id: `foto_${Date.now()}_${indice}`,
                url: previsualizacionFotos[indice],
                nombre: archivo.name,
                descripcion: `Foto de ${titulo}`,
                fechaSubida: new Date().toISOString()
            }));

            // Combinar con fotos existentes si está editando
            const fotosCompletas = actividadEditando ? 
                [...actividadEditando.fotos, ...nuevasFotosActividad] : 
                nuevasFotosActividad;

            // Crear objeto completo para el frontend
            const actividadCompleta: ActividadDiariaViaje = {
                ...actividadGuardada,
                fotos: fotosCompletas
            };

            console.log('ID original de edición:', actividadEditando?.id);
            console.log('ID devuelto por backend:', actividadCompleta.id);
            console.log('Actividad completa para actualizar:', actividadCompleta);

            // Actualizar estado local
            if (actividadEditando) {
                // Actualizar usando tanto el ID original como el nuevo ID del backend
                setActividades(prev => prev.map(act => 
                    (act.id === actividadEditando.id || act.id === actividadCompleta.id) ? actividadCompleta : act
                ));
                console.log('Actividad editada exitosamente');
                // Actualizar también la referencia de edición con el nuevo ID
                setActividadEditando(actividadCompleta);
            } else {
                setActividades(prev => [...prev, actividadCompleta]);
                console.log('Nueva actividad creada exitosamente');
            }

            // Recargar datos del backend para asegurar sincronización
            console.log('Recargando datos para sincronizar con backend...');
            await cargarDatos();

            // Subir fotos si hay archivos seleccionados
            if (fotosSeleccionadas.length > 0 && actividadGuardada.id) {
                console.log('📤 Subiendo fotos para la actividad...');
                setSubiendoFotos(true);
                try {
                    // 🔗 URL simplificada - Solo necesita twinId y activityId
                    await subirFotosActividad(
                        actividadGuardada.id, 
                        twinId
                    );
                    console.log('✅ Fotos subidas exitosamente');
                    
                    // Recargar datos nuevamente para mostrar las fotos subidas
                    await cargarDatos();
                } catch (photoError) {
                    console.error('❌ Error subiendo fotos:', photoError);
                    alert(`Actividad guardada, pero hubo un error subiendo las fotos: ${photoError instanceof Error ? photoError.message : 'Error desconocido'}`);
                } finally {
                    setSubiendoFotos(false);
                }
            } else if (fotosSeleccionadas.length > 0) {
                console.warn('⚠️ No se pudieron subir las fotos: ID de actividad no disponible');
            }

            setModalAbierto(false);
            limpiarFormulario();

        } catch (error) {
            console.error('Error guardando actividad:', error);
            alert(`Error al guardar la actividad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const eliminarActividad = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            return;
        }

        try {
            console.log('Eliminando actividad:', id);
            
            // Obtener IDs necesarios
            const itinerarioData = location.state?.itinerario;
            const twinId = itinerarioData?.twinId || location.state?.twinId;
            const viajeId = itinerarioData?.viajeId || location.state?.viajeId;
            const itinerarioIdParam = itinerarioData?.id || itinerarioId;

            if (!twinId || !viajeId || !itinerarioIdParam) {
                alert('Error: Faltan datos necesarios para eliminar la actividad.');
                return;
            }

            const baseUrl = import.meta.env.DEV ? '' : 'http://localhost:7011';
            const url = `${baseUrl}/api/twins/${twinId}/travels/${viajeId}/itinerarios/${itinerarioIdParam}/actividades-diarias/${id}`;

            console.log('DELETE request a:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Respuesta del DELETE:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor al eliminar:', errorText);
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            // Actualizar estado local solo si el backend confirmó la eliminación
            setActividades(prev => prev.filter(act => act.id !== id));
            console.log('Actividad eliminada exitosamente');

        } catch (error) {
            console.error('Error eliminando actividad:', error);
            alert(`Error al eliminar la actividad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    // Filtros y agrupación
    const actividadesPorFecha = actividades.reduce((grupos, actividad) => {
        const fecha = actividad.fecha.split('T')[0];
        if (!grupos[fecha]) {
            grupos[fecha] = [];
        }
        grupos[fecha].push(actividad);
        return grupos;
    }, {} as Record<string, ActividadDiariaViaje[]>);

    const fechasOrdenadas = Object.keys(actividadesPorFecha).sort();

    const renderEstrellas = (calificacion: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const getIconoActividad = (tipo: string) => {
        const actividad = actividadesViaje.find(a => a.value === tipo);
        const IconoComponent = actividad?.icon || Star;
        return <IconoComponent className="h-5 w-5" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate(-1)}
                                variant="outline"
                                className="mr-4 flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Actividades de Viaje</h1>
                                {itinerario && (
                                    <div className="mt-2">
                                        <p className="text-lg text-gray-700 font-medium">{itinerario.titulo}</p>
                                        <p className="text-gray-600">
                                            {itinerario.ciudadOrigen} → {itinerario.ciudadDestino} • 
                                            {formatearFechaSafe(itinerario.fechaInicio)} - {formatearFechaSafe(itinerario.fechaFin)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={recargarDatos}
                                variant="outline"
                                className="flex items-center"
                                disabled={cargando}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
                                Recargar
                            </Button>
                            <Button
                                onClick={abrirModalNuevo}
                                className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Actividad
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Vista por días */}
                <div className="space-y-6">
                    {cargando ? (
                        <Card className="p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">Cargando actividades...</p>
                            </div>
                        </Card>
                    ) : fechasOrdenadas.length === 0 ? (
                        <Card className="p-8">
                            <div className="text-center">
                                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No hay actividades registradas</h3>
                                <p className="text-gray-500 mb-4">Comienza documentando tu primera actividad de viaje</p>
                                <Button onClick={abrirModalNuevo} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Actividad
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        fechasOrdenadas.map(fecha => (
                            <div key={fecha} className="space-y-4">
                                {/* Header del día */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">{formatearFechaSafe(`${fecha}T00:00:00`)}</h2>
                                            <p className="text-indigo-100">
                                                {actividadesPorFecha[fecha].length} actividad{actividadesPorFecha[fecha].length !== 1 ? 'es' : ''}
                                            </p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-indigo-200" />
                                    </div>
                                </div>

                                {/* Actividades del día */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {actividadesPorFecha[fecha]
                                        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                                        .map((actividad) => (
                                        <Card key={actividad.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                                            {/* Header de la actividad */}
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                                            {getIconoActividad(actividad.tipoActividad)}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">{actividad.titulo}</h3>
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                                <span className="flex items-center">
                                                                    <Clock className="h-4 w-4 mr-1" />
                                                                    {actividad.horaInicio}
                                                                    {actividad.horaFin && ` - ${actividad.horaFin}`}
                                                                </span>
                                                                {actividad.ubicacion && (
                                                                    <span className="flex items-center">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        {actividad.ubicacion}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex">
                                                            {renderEstrellas(actividad.calificacion || 0)}
                                                        </div>
                                                        <Button
                                                            onClick={() => recargarFotosActividad(actividad)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-purple-600 hover:text-purple-700"
                                                            title="Recargar fotos de la actividad"
                                                        >
                                                            <Camera className="h-4 w-4" />
                                                        </Button>
                                                        
                                                        {/* Botón para subir documentos PDF */}
                                                        <Button
                                                            onClick={() => document.getElementById(`documentos-${actividad.id}`)?.click()}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700"
                                                            title="Subir documentos PDF (recibos, facturas)"
                                                            disabled={subiendoDocumentos}
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                        
                                                        {/* Input oculto para documentos */}
                                                        <input
                                                            id={`documentos-${actividad.id}`}
                                                            type="file"
                                                            multiple
                                                            accept=".pdf"
                                                            onChange={async (e) => {
                                                                if (e.target.files && e.target.files.length > 0) {
                                                                    // Validar archivos PDF
                                                                    const archivosSeleccionados = Array.from(e.target.files);
                                                                    const archivosPDF = archivosSeleccionados.filter(archivo => {
                                                                        if (archivo.type !== 'application/pdf') {
                                                                            alert(`El archivo ${archivo.name} no es un PDF válido`);
                                                                            return false;
                                                                        }
                                                                        if (archivo.size > 10 * 1024 * 1024) { // 10MB
                                                                            alert(`El archivo ${archivo.name} es demasiado grande (máximo 10MB)`);
                                                                            return false;
                                                                        }
                                                                        return true;
                                                                    });
                                                                    
                                                                    if (archivosPDF.length === 0) {
                                                                        console.log('⚠️ No hay archivos PDF válidos seleccionados');
                                                                        return;
                                                                    }
                                                                    
                                                                    console.log(`📄 Documentos PDF válidos: ${archivosPDF.length} de ${archivosSeleccionados.length} archivos`);
                                                                    
                                                                    // Actualizar el estado de documentos seleccionados
                                                                    setDocumentosSeleccionados(archivosPDF);
                                                                    
                                                                    // Obtener datos necesarios
                                                                    const itinerarioData = location.state?.itinerario;
                                                                    const twinId = itinerarioData?.twinId || location.state?.twinId;
                                                                    
                                                                    if (twinId && actividad.id) {
                                                                        try {
                                                                            // Subir documentos pasando los archivos directamente
                                                                            await subirDocumentosActividad(actividad, twinId, archivosPDF);
                                                                        } catch (error) {
                                                                            console.error('Error en el onChange:', error);
                                                                        }
                                                                    } else {
                                                                        console.error('❌ Faltan datos:', { twinId, actividadId: actividad.id });
                                                                        alert('Error: No se pudieron obtener los datos necesarios para subir documentos');
                                                                    }
                                                                }
                                                                
                                                                // Limpiar el input para permitir seleccionar el mismo archivo otra vez
                                                                e.target.value = '';
                                                            }}
                                                            style={{ display: 'none' }}
                                                        />
                                                        
                                                        <Button
                                                            onClick={() => abrirModalEditar(actividad)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => eliminarActividad(actividad.id!)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                {/* Descripción */}
                                                {actividad.descripcion && (
                                                    <p className="text-gray-700 mb-4">{actividad.descripcion}</p>
                                                )}

                                                {/* Participantes */}
                                                {actividad.participantes && actividad.participantes.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center mb-2">
                                                            <Users className="h-4 w-4 mr-2 text-gray-600" />
                                                            <span className="text-sm font-medium text-gray-700">Participantes:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(actividad.participantes || []).map((participante, idx) => (
                                                                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                                    {participante}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Carrusel de fotos integrado */}
                                                {actividad.fotos && actividad.fotos.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <Image className="h-4 w-4 mr-2 text-gray-600" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Fotos ({(actividad.fotos || []).length})
                                                                </span>
                                                            </div>
                                                            {actividad.fotos.length > 1 && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => abrirModalCarruselCompleto(actividad.fotos, 0)}
                                                                    className="text-xs px-2 py-1 h-6 flex items-center gap-1"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                    Ver todas
                                                                </Button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Carrusel horizontal */}
                                                        <div className="relative">
                                                            {actividad.fotos.length === 1 ? (
                                                                /* Una sola foto - mostrar completa */
                                                                <div 
                                                                    className="w-full cursor-pointer"
                                                                    onClick={() => abrirModalCarruselCompleto(actividad.fotos, 0)}
                                                                >
                                                                    <img
                                                                        src={actividad.fotos[0].url}
                                                                        alt={actividad.fotos[0].nombre}
                                                                        className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                                                        {actividad.fotos[0].nombre}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                /* Múltiples fotos - carrusel */
                                                                <div 
                                                                    className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2 scroll-smooth" 
                                                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                                                >
                                                                    {actividad.fotos.map((foto, fotoIdx) => (
                                                                        <div
                                                                            key={foto.id}
                                                                            className="flex-shrink-0 relative group cursor-pointer"
                                                                            onClick={() => abrirModalCarruselCompleto(actividad.fotos, fotoIdx)}
                                                                        >
                                                                            <img
                                                                                src={foto.url}
                                                                                alt={foto.nombre}
                                                                                className="w-32 h-24 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                                                                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 mt-1 text-center truncate w-32">
                                                                                {foto.nombre}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Indicador de scroll (solo si hay más de 4 fotos) */}
                                                            {actividad.fotos.length > 4 && (
                                                                <div className="text-xs text-gray-400 mt-2 text-center">
                                                                    ← Desliza para ver más fotos →
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Documentos PDF */}
                                                {actividad.documentos && actividad.documentos.length > 0 ? (
                                                    <div className="mb-4">
                                                        {/* Banner de Total de Gastos */}
                                                        {calcularTotalDocumentos(actividad) > 0 && (
                                                            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                                                                <div className="flex items-center justify-center">
                                                                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                                                    <span className="text-lg font-bold text-gray-800">Total de Gastos: </span>
                                                                    <span className="text-xl font-bold text-green-700 ml-2">
                                                                        {formatCurrency(calcularTotalDocumentos(actividad))}
                                                                    </span>
                                                                </div>
                                                                <div className="text-center text-xs text-gray-600 mt-1">
                                                                    Suma de {actividad.documentos.length} documento{actividad.documentos.length !== 1 ? 's' : ''}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <FileText className="h-4 w-4 mr-2 text-gray-600" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Documentos ({actividad.documentos.length})
                                                                </span>
                                                            </div>
                                                            <Button
                                                                onClick={() => recargarDocumentosActividad(actividad)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 hover:text-blue-700 px-2 py-1 h-6"
                                                                title="Recargar documentos de la actividad"
                                                                disabled={recargandoDocumentos === actividad.id}
                                                            >
                                                                {recargandoDocumentos === actividad.id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {actividad.documentos.map((documento) => (
                                                                <div
                                                                    key={documento.id}
                                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <div className="flex items-center flex-1">
                                                                        <FileText className="h-4 w-4 mr-3 text-red-600" />
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                                {documento.titulo || documento.fileName || documento.nombre}
                                                                            </p>
                                                                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                                                <span>{documento.documentType || documento.tipo}</span>
                                                                                {documento.vendorName && (
                                                                                    <>
                                                                                        <span>•</span>
                                                                                        <span>{documento.vendorName}</span>
                                                                                    </>
                                                                                )}
                                                                                {documento.totalAmount && (
                                                                                    <>
                                                                                        <span>•</span>
                                                                                        <span className="font-semibold text-green-600">
                                                                                            {formatCurrency(documento.totalAmount, documento.currency)}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Button
                                                                            onClick={() => navegarADocumento(documento)}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-blue-600 hover:text-blue-700 px-2 py-1 h-7"
                                                                        >
                                                                            <Eye className="h-3 w-3 mr-1" />
                                                                            Ver
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Sección de documentos vacía con botón de reload
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-500">
                                                                    Documentos (0)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                onClick={() => recargarDocumentosActividad(actividad)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 hover:text-blue-700 px-2 py-1 h-6"
                                                                title="Buscar documentos de la actividad"
                                                                disabled={recargandoDocumentos === actividad.id}
                                                            >
                                                                {recargandoDocumentos === actividad.id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-500">
                                                                No hay documentos disponibles
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Haz click en recargar para buscar documentos
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Información adicional */}
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <div>
                                                        {actividad.costo && (
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                {actividad.costo} {actividad.moneda}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs">
                                                            {actividadesViaje.find(a => a.value === actividad.tipoActividad)?.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Notas */}
                                                {actividad.notas && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-sm text-gray-600 italic">"{actividad.notas}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal para ver fotos con carrusel mejorado */}
                {modalFoto.abierto && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') cerrarModalFoto();
                            else if (e.key === 'ArrowLeft') navegarFoto('anterior');
                            else if (e.key === 'ArrowRight') navegarFoto('siguiente');
                        }}
                        tabIndex={0}
                    >
                        <div className="relative max-w-4xl w-full">
                            <button
                                onClick={cerrarModalFoto}
                                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            
                            {/* Navegación */}
                            {fotosCarrusel.length > 1 && (
                                <>
                                    <button
                                        onClick={() => navegarFoto('anterior')}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                                    >
                                        <ChevronLeft className="h-8 w-8" />
                                    </button>
                                    <button
                                        onClick={() => navegarFoto('siguiente')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                                    >
                                        <ChevronRight className="h-8 w-8" />
                                    </button>
                                </>
                            )}
                            
                            {/* Indicador de posición */}
                            {fotosCarrusel.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {modalFoto.indice + 1} / {fotosCarrusel.length}
                                </div>
                            )}
                            
                            <img
                                src={modalFoto.fotoUrl}
                                alt="Foto de actividad"
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                            
                            {/* Información de la foto */}
                            {fotosCarrusel.length > 0 && fotosCarrusel[modalFoto.indice] && (
                                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center max-w-md">
                                    <p className="text-sm font-medium">{fotosCarrusel[modalFoto.indice].nombre}</p>
                                    {fotosCarrusel[modalFoto.indice].descripcion && (
                                        <p className="text-xs text-gray-300 mt-1">{fotosCarrusel[modalFoto.indice].descripcion}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal para crear/editar actividad */}
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                        <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad de Viaje'}
                                </h2>
                                <Button
                                    onClick={() => setModalAbierto(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Columna 1: Información de la actividad */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                            Información de la Actividad
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={fecha}
                                                    onChange={(e) => setFecha(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tipo de Actividad *
                                                </label>
                                                <select
                                                    value={tipoActividad}
                                                    onChange={(e) => setTipoActividad(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                >
                                                    {actividadesViaje.map(actividad => (
                                                        <option key={actividad.value} value={actividad.value}>
                                                            {actividad.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Título de la Actividad *
                                            </label>
                                            <input
                                                type="text"
                                                value={titulo}
                                                onChange={(e) => setTitulo(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="ej. Visita al Museo Nacional"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hora de Inicio *
                                                </label>
                                                <input
                                                    type="time"
                                                    value={horaInicio}
                                                    onChange={(e) => setHoraInicio(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hora de Fin
                                                </label>
                                                <input
                                                    type="time"
                                                    value={horaFin}
                                                    onChange={(e) => setHoraFin(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={ubicacion}
                                                onChange={(e) => setUbicacion(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="ej. Centro Histórico, Ciudad de México"
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                rows={3}
                                                placeholder="Describe los detalles de la actividad..."
                                            />
                                        </div>
                                    </div>

                                    {/* Participantes */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                            👥 Participantes
                                        </h3>
                                        
                                        {participantes.map((participante, index) => (
                                            <div key={index} className="flex items-center space-x-2 mb-3">
                                                <input
                                                    type="text"
                                                    value={participante}
                                                    onChange={(e) => actualizarParticipante(index, e.target.value)}
                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="Nombre del participante"
                                                />
                                                {participantes.length > 1 && (
                                                    <Button
                                                        onClick={() => eliminarParticipante(index)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        
                                        <Button
                                            onClick={agregarParticipante}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Participante
                                        </Button>
                                    </div>

                                    {/* Calificación y costo */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                            ⭐ Evaluación
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Calificación
                                                </label>
                                                <select
                                                    value={calificacion}
                                                    onChange={(e) => setCalificacion(parseInt(e.target.value))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                >
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <option key={num} value={num}>
                                                            {'⭐'.repeat(num)} ({num}/5)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Costo
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={costo}
                                                    onChange={(e) => setCosto(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Moneda
                                                </label>
                                                <select
                                                    value={moneda}
                                                    onChange={(e) => setMoneda(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                >
                                                    {['USD', 'EUR', 'MXN', 'CAD', 'GBP', 'JPY'].map(moneda => (
                                                        <option key={moneda} value={moneda}>{moneda}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notas y Comentarios
                                            </label>
                                            <textarea
                                                value={notas}
                                                onChange={(e) => setNotas(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                rows={3}
                                                placeholder="Comparte tus pensamientos sobre esta actividad..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 2: Fotos */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                        📸 Fotos de la Actividad
                                    </h3>
                                    
                                    {/* Área de subida de fotos */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                                        <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <div className="mb-4">
                                            <label htmlFor="fotos" className="cursor-pointer">
                                                <span className={`${subiendoFotos ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center`}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {subiendoFotos ? 'Subiendo Fotos...' : 'Subir Fotos'}
                                                </span>
                                                <input
                                                    id="fotos"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={manejarSeleccionFotos}
                                                    className="hidden"
                                                    disabled={subiendoFotos}
                                                />
                                            </label>
                                            
                                            {/* Botón manual de subida para edición */}
                                            {actividadEditando && fotosSeleccionadas.length > 0 && (
                                                <button
                                                    onClick={async () => {
                                                        const itinerarioData = location.state?.itinerario;
                                                        const twinId = itinerarioData?.twinId || location.state?.twinId;
                                                        
                                                        if (actividadEditando.id && twinId) {
                                                            setSubiendoFotos(true);
                                                            try {
                                                                await subirFotosActividad(actividadEditando.id, twinId);
                                                                alert('✅ Fotos subidas manualmente');
                                                                await cargarDatos();
                                                                setFotosSeleccionadas([]);
                                                                setPrevisualizacionFotos([]);
                                                            } catch (error) {
                                                                alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                                                            } finally {
                                                                setSubiendoFotos(false);
                                                            }
                                                        }
                                                    }}
                                                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                                                    disabled={subiendoFotos}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Subir Manual
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {subiendoFotos 
                                                ? 'Subiendo fotos al servidor...' 
                                                : 'Selecciona múltiples fotos (máx. 10MB cada una)'
                                            }
                                        </p>
                                    </div>

                                    {/* Fotos existentes (si está editando) */}
                                    {actividadEditando && actividadEditando.fotos && actividadEditando.fotos.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-md font-medium text-gray-700 mb-3">Fotos Existentes</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(actividadEditando.fotos || []).map((foto, index) => (
                                                    <div key={foto.id} className="relative group">
                                                        <img
                                                            src={foto.url}
                                                            alt={foto.descripcion}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                                                            <button
                                                                onClick={() => abrirModalFoto(foto.url, index)}
                                                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Eye className="h-6 w-6" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview de fotos nuevas */}
                                    {previsualizacionFotos.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-md font-medium text-gray-700 mb-3">Fotos Nuevas</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {previsualizacionFotos.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => eliminarFoto(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={() => setModalAbierto(false)}
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={guardarActividad}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                >
                                    {actividadEditando ? 'Actualizar' : 'Crear'} Actividad
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de carrusel completo */}
                {modalCarruselCompleto.abierto && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') cerrarModalCarruselCompleto();
                            else if (e.key === 'ArrowLeft') navegarCarruselCompleto('anterior');
                            else if (e.key === 'ArrowRight') navegarCarruselCompleto('siguiente');
                        }}
                        tabIndex={0}
                    >
                        <div className="relative max-w-6xl w-full h-full flex items-center">
                            {/* Botón cerrar */}
                            <button
                                onClick={cerrarModalCarruselCompleto}
                                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            
                            {/* Navegación izquierda */}
                            {modalCarruselCompleto.fotos.length > 1 && (
                                <button
                                    onClick={() => navegarCarruselCompleto('anterior')}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                            )}

                            {/* Navegación derecha */}
                            {modalCarruselCompleto.fotos.length > 1 && (
                                <button
                                    onClick={() => navegarCarruselCompleto('siguiente')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            )}

                            {/* Contenedor principal de la imagen */}
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                {/* Imagen principal */}
                                <div className="flex-1 flex items-center justify-center max-h-[80vh]">
                                    <img
                                        src={modalCarruselCompleto.fotos[modalCarruselCompleto.indiceActual]?.url}
                                        alt={modalCarruselCompleto.fotos[modalCarruselCompleto.indiceActual]?.nombre}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    />
                                </div>

                                {/* Información de la foto */}
                                <div className="mt-4 text-center text-white">
                                    <p className="text-lg font-medium mb-2">
                                        {modalCarruselCompleto.fotos[modalCarruselCompleto.indiceActual]?.nombre}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Foto {modalCarruselCompleto.indiceActual + 1} de {modalCarruselCompleto.fotos.length}
                                    </p>
                                </div>

                                {/* Miniaturas navegables */}
                                {modalCarruselCompleto.fotos.length > 1 && (
                                    <div className="mt-4 flex space-x-2 overflow-x-auto max-w-full pb-2">
                                        {modalCarruselCompleto.fotos.map((foto, index) => (
                                            <button
                                                key={foto.id}
                                                onClick={() => setModalCarruselCompleto(prev => ({
                                                    ...prev,
                                                    indiceActual: index
                                                }))}
                                                className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                                                    index === modalCarruselCompleto.indiceActual
                                                        ? 'border-white shadow-lg'
                                                        : 'border-gray-500 opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={foto.url}
                                                    alt={foto.nombre}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de progreso AI */}
                {procesoAI.activo && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
                            {/* Fondo animado */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
                            
                            {/* Contenido principal */}
                            <div className="relative z-10">
                                {/* Header con icono animado */}
                                <div className="text-center mb-6">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        {procesoAI.progreso === 100 ? (
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        ) : (
                                            <div className="relative">
                                                <Bot className="h-8 w-8 text-white" />
                                                <Loader2 className="h-4 w-4 text-white absolute -top-1 -right-1 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {procesoAI.progreso === 100 ? '¡Documento Procesado!' : 'Procesando Documento'}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>{procesoAI.archivo}</strong>
                                    </p>
                                    
                                    <p className="text-sm text-gray-500">
                                        {procesoAI.descripcion}
                                    </p>
                                </div>

                                {/* Paso actual */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {procesoAI.paso}
                                        </span>
                                        <span className="text-sm font-bold text-blue-600">
                                            {procesoAI.progreso}%
                                        </span>
                                    </div>
                                    
                                    {/* Barra de progreso animada */}
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative"
                                            style={{ width: `${procesoAI.progreso}%` }}
                                        >
                                            {/* Efecto de brillo animado */}
                                            <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pasos del proceso */}
                                <div className="space-y-2 mb-6">
                                    <div className={`flex items-center text-xs ${procesoAI.progreso >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <CheckCircle className={`h-4 w-4 mr-2 ${procesoAI.progreso >= 20 ? 'text-green-500' : 'text-gray-300'}`} />
                                        Subiendo documento
                                    </div>
                                    <div className={`flex items-center text-xs ${procesoAI.progreso >= 30 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <CheckCircle className={`h-4 w-4 mr-2 ${procesoAI.progreso >= 30 ? 'text-green-500' : 'text-gray-300'}`} />
                                        Procesando archivo
                                    </div>
                                    <div className={`flex items-center text-xs ${procesoAI.progreso >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <CheckCircle className={`h-4 w-4 mr-2 ${procesoAI.progreso >= 50 ? 'text-green-500' : 'text-gray-300'}`} />
                                        Enviando al servidor
                                    </div>
                                    <div className={`flex items-center text-xs ${procesoAI.progreso >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <Bot className={`h-4 w-4 mr-2 ${procesoAI.progreso >= 75 ? 'text-blue-500' : 'text-gray-300'}`} />
                                        Analizando con IA
                                    </div>
                                    <div className={`flex items-center text-xs ${procesoAI.progreso >= 90 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <CheckCircle className={`h-4 w-4 mr-2 ${procesoAI.progreso >= 90 ? 'text-green-500' : 'text-gray-300'}`} />
                                        Guardando resultados
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start">
                                        <Bot className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <div className="text-xs text-blue-700">
                                            <p className="font-medium mb-1">Procesamiento con IA</p>
                                            <p>Nuestro sistema está extrayendo información importante del documento como fechas, montos, ubicaciones y categorizándolo automáticamente.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mensaje para completado */}
                                {procesoAI.progreso === 100 && (
                                    <div className="text-center">
                                        <p className="text-sm text-green-600 font-medium">
                                            ✨ El documento ha sido procesado y está listo para usar
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActividadesDiariasViajePage;
