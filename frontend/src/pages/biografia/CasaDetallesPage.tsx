import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Upload, 
    Trash2, 
    Camera,
    FileText,
    Eye,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Grid,
    X,
    Loader
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { lugaresApiService, LugarVivienda } from '../../services/lugaresApiService';
import { twinApiService } from '../../services/twinApiService';

// Interfaz para documentos del backend
interface DocumentoBackend {
    id: string;
    twinId: string;
    documentType: string;
    fileName: string;
    filePath: string;
    fullFilePath: string;
    containerName: string;
    documentUrl: string;
    originalDocumentType: string;
    category: string;
    description: string;
    totalPages: number;
    textContent: string;
    processedAt: string;
    createdAt: string;
    success: boolean;
    structuredData: {
        documentType: string;
        category: string;
        description: string;
        executiveSummary: string;
        pageData: Array<{
            pageNumber: number;
            content: string;
            keyPoints: string[];
            entities: {
                names: string[];
                dates: string[];
                amounts: string[];
                locations: string[];
            };
        }>;
        tableData: Array<{
            tableNumber: number;
            pageNumber: number;
            title: string;
            headers: string[];
            rows: string[][];
            summary: string;
        }>;
        keyInsights: Array<{
            type: string;
            title: string;
            description: string;
            value: string;
            importance: string;
        }>;
        htmlOutput: string;
        rawAIResponse: string;
        processedAt: string;
    };
    executiveSummary: string;
    pageData: any[];
    tableData: any[];
    keyInsights: any[];
    htmlOutput: string;
    rawAIResponse: string;
    aiProcessedAt: string;
    pageCount: number;
    tableCount: number;
    insightCount: number;
    hasExecutiveSummary: boolean;
    hasHtmlOutput: boolean;
}

type TipoDocumento = 
    | 'titulo_propiedad'
    | 'escritura'
    | 'certificado_registro'
    | 'contrato_compra'
    | 'documentos_hipoteca'
    | 'evaluacion'
    | 'inspeccion'
    | 'certificado_ocupacion'
    | 'permisos_construccion'
    | 'documentos_hoa'
    | 'seguro_casa'
    | 'contratos_servicios'
    | 'garantias'
    | 'manuales'
    | 'facturas_reparaciones'
    | 'otros';

const TIPOS_DOCUMENTOS: { value: TipoDocumento; label: string; descripcion: string }[] = [
    { value: 'titulo_propiedad', label: 'Título de Propiedad', descripcion: 'Documento legal que prueba la propiedad' },
    { value: 'escritura', label: 'Escritura', descripcion: 'Documento notarial de compra-venta' },
    { value: 'certificado_registro', label: 'Certificado de Registro', descripcion: 'Registro oficial de la propiedad' },
    { value: 'contrato_compra', label: 'Contrato de Compra/Venta', descripcion: 'Acuerdo de transacción' },
    { value: 'documentos_hipoteca', label: 'Documentos de Hipoteca', descripcion: 'Contratos y estados de cuenta' },
    { value: 'evaluacion', label: 'Evaluación/Tasación', descripcion: 'Valoración profesional de la propiedad' },
    { value: 'inspeccion', label: 'Inspección de Casa', descripcion: 'Reportes de inspección técnica' },
    { value: 'certificado_ocupacion', label: 'Certificado de Ocupación', descripcion: 'Autorización para habitar' },
    { value: 'permisos_construccion', label: 'Permisos de Construcción', descripcion: 'Autorizaciones municipales' },
    { value: 'documentos_hoa', label: 'Documentos HOA', descripcion: 'Asociación de propietarios' },
    { value: 'seguro_casa', label: 'Seguro de Casa', descripcion: 'Pólizas y reclamos de seguro' },
    { value: 'contratos_servicios', label: 'Contratos de Servicios', descripcion: 'Jardinería, limpieza, etc.' },
    { value: 'garantias', label: 'Garantías', descripcion: 'Garantías de electrodomésticos y equipos' },
    { value: 'manuales', label: 'Manuales', descripcion: 'Manuales de equipos y sistemas' },
    { value: 'facturas_reparaciones', label: 'Facturas de Reparaciones', descripcion: 'Historial de mantenimiento' },
    { value: 'otros', label: 'Otros', descripcion: 'Otros documentos relacionados' },
];

const ZONAS = [
    'Exterior', 'Sala', 'Comedor', 'Cocina', 'Habitación principal', 
    'Habitación secundaria', 'Baño principal', 'Baño secundario', 
    'Pasillo', 'Lavandería', 'Otro'
];

export default function CasaDetallesPage() {
    const navigate = useNavigate();
    const { casaId } = useParams<{ casaId: string }>();
    const { accounts } = useMsal();
    
    // Estados principales
    const [casa, setCasa] = useState<LugarVivienda | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para la interfaz
    const [seccionActiva, setSeccionActiva] = useState<'fotos' | 'documentos'>('fotos');
    const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('Exterior');

    // Estados para fotos
    const [fotosZona, setFotosZona] = useState<Record<string, any[]>>({});
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [cargandoFotos, setCargandoFotos] = useState(false);
    const [modalProgresoAI, setModalProgresoAI] = useState(false);
    const [pasoActualAI, setPasoActualAI] = useState(1);
    const [fotosSubiendose, setFotosSubiendose] = useState(0);
    const [totalFotosSubir, setTotalFotosSubir] = useState(0);

    // Estados para modal de detalles de foto
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [fotoDetalle, setFotoDetalle] = useState<any | null>(null);

    // Estados para carrusel
    const [carruselModalAbierto, setCarruselModalAbierto] = useState(false);
    const [indiceCarruselActual, setIndiceCarruselActual] = useState(0);

    // Estados para documentos
    const [documentosBackend, setDocumentosBackend] = useState<DocumentoBackend[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [modalDocumentoAbierto, setModalDocumentoAbierto] = useState(false);
    const [documentoModal, setDocumentoModal] = useState<DocumentoBackend | null>(null);
    const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<TipoDocumento>('titulo_propiedad');

    // Refs para file inputs
    const fotoInputRef = useRef<HTMLInputElement>(null);
    const documentoInputRef = useRef<HTMLInputElement>(null);

    // ID del usuario actual
    const twinId = accounts.length > 0 ? accounts[0].localAccountId : null;

    // Cargar datos de la casa
    useEffect(() => {
        if (casaId) {
            cargarCasa();
        }
    }, [casaId]);

    // Cargar fotos cuando cambia la zona seleccionada
    useEffect(() => {
        if (casaId && zonaSeleccionada && seccionActiva === 'fotos') {
            cargarFotosZona(zonaSeleccionada);
        }
    }, [casaId, zonaSeleccionada, seccionActiva]);

    // Cargar documentos cuando esté en sección documentos o cuando se monta el componente
    useEffect(() => {
        if (twinId && (seccionActiva === 'documentos' || documentosBackend.length === 0)) {
            console.log('📄 Cargando documentos del backend...', { seccionActiva, twinId });
            cargarDocumentosBackend();
        }
    }, [seccionActiva, twinId]);

    const cargarCasa = async () => {
        if (!casaId) return;

        try {
            setLoading(true);
            setError(null);
            
            // Usar el método correcto del servicio
            const response = await lugaresApiService.getLugarById(twinId || '', casaId);
            
            if (response.success && response.data) {
                setCasa(response.data);
                console.log('✅ Casa cargada:', response.data);
            } else {
                setError('No se pudo cargar la información de la casa');
            }
        } catch (error) {
            console.error('❌ Error cargando casa:', error);
            setError('Error al cargar la casa');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar fotos de una zona específica usando la API real
    const cargarFotosZona = useCallback(async (zona: string) => {
        if (!twinId || !casaId) {
            console.log('⏭️ No se pueden cargar fotos - faltan parámetros:', { twinId, casaId, zona });
            return;
        }

        try {
            setCargandoFotos(true);
            console.log('📸 Cargando fotos de zona:', zona, 'para casa:', casaId);
            
            // Usar el método correcto: listPhotos(twinId, casaId, zona)
            const response = await twinApiService.listPhotos(twinId, casaId, zona);
            
            if (response.success && response.data) {
                // Almacenar los objetos completos de fotos con metadata
                const fotosData = response.data.photos || [];
                
                console.log('✅ Fotos cargadas para zona', zona, ':', fotosData.length);
                console.log('📊 Datos de fotos:', fotosData.map(f => ({
                    fileName: f.fileName,
                    id: f.eTag,
                    tipoEspacio: f.metadata?.tipoEspacio,
                    hasMetadata: !!f.metadata,
                    hasDetailsHTML: !!f.metadata?.detailsHTML && f.metadata.detailsHTML !== 'No HTML'
                })));
                
                setFotosZona(prev => ({
                    ...prev,
                    [zona]: fotosData
                }));
            } else {
                console.log('📭 No hay fotos en zona:', zona);
                setFotosZona(prev => ({
                    ...prev,
                    [zona]: []
                }));
            }
        } catch (error) {
            console.error('❌ Error cargando fotos de zona:', zona, error);
            setFotosZona(prev => ({
                ...prev,
                [zona]: []
            }));
        } finally {
            setCargandoFotos(false);
        }
    }, [twinId, casaId]);

    // Función para cargar documentos reales del backend
    const cargarDocumentosBackend = useCallback(async () => {
        if (!twinId) {
            console.log('⏭️ No se pueden cargar documentos - falta twinId');
            return;
        }

        console.log('📄 Cargando TODOS los documentos para twin:', twinId);
        setIsLoadingDocuments(true);

        try {
            const response = await twinApiService.getGlobalDocumentsByCategory(twinId, 'CASA_VIVIENDA');
            
            console.log('📄 Respuesta completa del backend:', response);
            
            if (response.success && response.data) {
                console.log('✅ Documentos cargados:', response.data);
                console.log('📊 Cantidad de documentos:', response.data.documents?.length || 0);
                setDocumentosBackend(response.data.documents || []);
            } else {
                console.log('📭 No hay documentos o error:', response.error);
                setDocumentosBackend([]);
            }
        } catch (error) {
            console.error('❌ Error cargando documentos:', error);
            setDocumentosBackend([]);
        } finally {
            setIsLoadingDocuments(false);
        }
    }, [twinId]);

    // Funciones para el modal de documento
    const abrirModalDocumento = (documento: DocumentoBackend) => {
        setDocumentoModal(documento);
        setModalDocumentoAbierto(true);
    };

    const cerrarModalDocumento = () => {
        setModalDocumentoAbierto(false);
        setDocumentoModal(null);
    };

    const manejarSubidaFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !twinId || !casaId) return;

        // Configurar y mostrar modal de progreso AI
        setTotalFotosSubir(files.length);
        setFotosSubiendose(0);
        setPasoActualAI(1);
        setModalProgresoAI(true);
        setSubiendoFoto(true);

        try {
            console.log('📸 Subiendo', files.length, 'fotos a zona:', zonaSeleccionada);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Actualizar progreso
                setFotosSubiendose(i + 1);
                
                // Simular pasos del proceso AI
                setPasoActualAI(1); // Subiendo archivo
                await new Promise(resolve => setTimeout(resolve, 500));
                
                setPasoActualAI(2); // Procesando con AI
                
                // Usar el método correcto del servicio
                const response = await twinApiService.uploadPhotoSimple(
                    twinId, 
                    file, 
                    casaId,
                    file.name,
                    zonaSeleccionada
                );
                
                setPasoActualAI(3); // Generando descripción
                await new Promise(resolve => setTimeout(resolve, 300));
                
                setPasoActualAI(4); // Guardando análisis
                await new Promise(resolve => setTimeout(resolve, 200));
                
                if (response.success) {
                    console.log('✅ Foto subida:', file.name);
                } else {
                    console.error('❌ Error subiendo foto:', file.name, response.error);
                }
            }

            // Recargar fotos de la zona actual
            await cargarFotosZona(zonaSeleccionada);
            
        } catch (error) {
            console.error('❌ Error en subida masiva de fotos:', error);
            setError('Error al subir las fotos');
        } finally {
            setSubiendoFoto(false);
            setModalProgresoAI(false);
            setPasoActualAI(1);
            setFotosSubiendose(0);
            setTotalFotosSubir(0);
            // Limpiar el input
            if (fotoInputRef.current) {
                fotoInputRef.current.value = '';
            }
        }
    };

    const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !twinId || !casaId) return;

        try {
            console.log('📄 Subiendo documentos del tipo:', tipoDocumentoSeleccionado);

            for (const file of Array.from(files)) {
                // Usar el método correcto con File en lugar de FormData
                const response = await twinApiService.uploadGlobalDocument(
                    twinId, 
                    file,
                    {
                        path: `homes/${casaId}/${tipoDocumentoSeleccionado}`,
                        fileName: file.name,
                        documentType: tipoDocumentoSeleccionado.toUpperCase(),
                        category: 'CASA_VIVIENDA',
                        description: `${TIPOS_DOCUMENTOS.find(t => t.value === tipoDocumentoSeleccionado)?.descripcion} - ${casa?.direccion}, ${casa?.ciudad}`
                    }
                );
                
                if (response.success) {
                    console.log('✅ Documento subido:', file.name);
                } else {
                    console.error('❌ Error subiendo documento:', file.name, response.error);
                }
            }

            // Recargar documentos del backend
            await cargarDocumentosBackend();
            
        } catch (error) {
            console.error('❌ Error subiendo documentos:', error);
            setError('Error al subir los documentos');
        } finally {
            if (documentoInputRef.current) {
                documentoInputRef.current.value = '';
            }
        }
    };

    const eliminarFoto = async (fotoUrl: string) => {
        if (!twinId) return;

        try {
            console.log('🗑️ Eliminando foto:', fotoUrl);
            
            // Temporalmente removemos de la vista local, después implementaremos el backend
            const fotosZonaActual = obtenerFotosPorZona(zonaSeleccionada);
            const nuevasFotos = fotosZonaActual.filter(foto => foto.photoUrl !== fotoUrl);
            setFotosZona(prev => ({
                ...prev,
                [zonaSeleccionada]: nuevasFotos
            }));
            
            console.log('✅ Foto eliminada temporalmente de la vista');
            
            // TODO: Implementar eliminación real cuando esté disponible en la API
            // const response = await twinApiService.deletePhoto(twinId, fotoUrl);
            
        } catch (error) {
            console.error('❌ Error eliminando foto:', error);
            setError('Error al eliminar la foto');
            // Recargar fotos en caso de error
            await cargarFotosZona(zonaSeleccionada);
        }
    };

    // Función para obtener fotos de una zona específica
    const obtenerFotosPorZona = (zona: string): any[] => {
        return fotosZona[zona] || [];
    };

    // Función para abrir modal de detalles
    const abrirModalDetalle = (foto: any) => {
        console.log('📸 Abriendo modal de detalles para foto:', foto);
        console.log('🔍 Metadata completa:', foto.metadata);
        console.log('📝 DetailsHTML content:', foto.metadata?.detailsHTML);
        setFotoDetalle(foto);
        setModalDetalleAbierto(true);
    };

    // Función para cambiar de zona y recargar fotos
    const cambiarZona = async (nuevaZona: string) => {
        console.log('🔄 Cambiando a zona:', nuevaZona);
        
        // Cambiar la zona seleccionada
        setZonaSeleccionada(nuevaZona);
        
        // Cargar fotos de la nueva zona (cargarFotosZona ya maneja el loading state)
        await cargarFotosZona(nuevaZona);
    };

    // Funciones del carrusel
    const abrirCarrusel = () => {
        const fotos = obtenerFotosPorZona(zonaSeleccionada);
        if (fotos.length > 0) {
            setIndiceCarruselActual(0);
            setCarruselModalAbierto(true);
        }
    };

    const cerrarCarrusel = () => {
        setCarruselModalAbierto(false);
        setIndiceCarruselActual(0);
    };

    const anteriorFotoCarrusel = () => {
        const fotos = obtenerFotosPorZona(zonaSeleccionada);
        setIndiceCarruselActual(prev => 
            prev > 0 ? prev - 1 : fotos.length - 1
        );
    };

    const siguienteFotoCarrusel = () => {
        const fotos = obtenerFotosPorZona(zonaSeleccionada);
        setIndiceCarruselActual(prev => 
            prev < fotos.length - 1 ? prev + 1 : 0
        );
    };

    const irAFotoCarrusel = (indice: number) => {
        setIndiceCarruselActual(indice);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded mb-6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">{error}</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="mt-2"
                        variant="outline"
                    >
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (!casa) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p className="text-gray-500">Casa no encontrada</p>
                <Button onClick={() => navigate('/mis-twins')} className="mt-4">
                    Volver a Mis Twins
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/twin-manage')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{casa.direccion}</h1>
                        <p className="text-gray-600">{casa.ciudad}, {casa.estado}</p>
                    </div>
                </div>
            </div>

            {/* Tabs de navegación */}
            <div className="flex space-x-1 mb-6">
                <Button
                    variant={seccionActiva === 'fotos' ? 'default' : 'outline'}
                    onClick={() => setSeccionActiva('fotos')}
                    className="flex items-center gap-2"
                >
                    <Camera size={16} />
                    Fotos ({Object.values(fotosZona).flat().length})
                </Button>
                <Button
                    variant={seccionActiva === 'documentos' ? 'default' : 'outline'}
                    onClick={() => setSeccionActiva('documentos')}
                    className="flex items-center gap-2"
                >
                    <FileText size={16} />
                    Documentos ({documentosBackend.length})
                </Button>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
                {seccionActiva === 'fotos' ? (
                    <>
                        {/* Selector de zona */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Seleccionar zona de la casa</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {ZONAS.map(zona => (
                                    <Button
                                        key={zona}
                                        variant={zonaSeleccionada === zona ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => cambiarZona(zona)}
                                        className="text-xs"
                                    >
                                        {zona}
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* Upload de fotos */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Subir fotos a {zonaSeleccionada}</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            console.log('🔄 Actualizando fotos de zona:', zonaSeleccionada);
                                            cargarFotosZona(zonaSeleccionada);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Camera size={14} />
                                        Actualizar Fotos
                                    </Button>
                                    <input
                                        ref={fotoInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={manejarSubidaFoto}
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={() => fotoInputRef.current?.click()}
                                        disabled={subiendoFoto}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload size={16} />
                                        {subiendoFoto ? 'Subiendo...' : 'Subir Fotos'}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Galería de fotos */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Fotos de {zonaSeleccionada} ({obtenerFotosPorZona(zonaSeleccionada).length})
                                </h3>
                                {obtenerFotosPorZona(zonaSeleccionada).length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={abrirCarrusel}
                                        className="flex items-center gap-2"
                                    >
                                        <Grid size={16} />
                                        Ver en carrusel
                                    </Button>
                                )}
                            </div>
                            
                            {/* Loading state */}
                            {cargandoFotos && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                                    <p className="text-gray-600 text-sm">Cargando fotos de {zonaSeleccionada}...</p>
                                    <div className="w-full max-w-xs mt-3">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Grid de fotos */}
                            {!cargandoFotos && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {obtenerFotosPorZona(zonaSeleccionada).map((foto, index) => (
                                    <Card key={foto.eTag || index} className="overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={foto.photoUrl}
                                                alt={foto.fileName}
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Botón de eliminar en esquina superior derecha */}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    eliminarFoto(foto.photoUrl);
                                                }}
                                                className="absolute top-2 right-2 h-8 w-8 p-0"
                                                title="Eliminar foto"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-medium text-sm mb-2 truncate" title={foto.fileName}>
                                                {foto.fileName}
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-2 truncate" title={foto.eTag}>
                                                ID: {foto.eTag}
                                            </p>
                                            {foto.metadata?.tipoEspacio && (
                                                <p className="text-xs text-blue-600 font-medium mb-3 truncate" title={foto.metadata.tipoEspacio}>
                                                    📍 {foto.metadata.tipoEspacio}
                                                </p>
                                            )}
                                            <Button
                                                onClick={() => abrirModalDetalle(foto)}
                                                className="w-full"
                                                size="sm"
                                            >
                                                Ver Detalles
                                            </Button>
                                        </div>
                                    </Card>
                                    ))}
                                    
                                    {obtenerFotosPorZona(zonaSeleccionada).length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-500">No hay fotos en esta zona</p>
                                            <p className="text-sm text-gray-400 mt-1">Sube algunas fotos para comenzar</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </>
                ) : (
                    <>
                        {/* CARD 1: Subir Nuevo Documento */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">📤 Subir Nuevo Documento</h3>
                            
                            {/* Selector de Tipo de Documento */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium mb-3">Tipo de Documento:</h4>
                                <select
                                    value={tipoDocumentoSeleccionado}
                                    onChange={(e) => setTipoDocumentoSeleccionado(e.target.value as TipoDocumento)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {TIPOS_DOCUMENTOS.map((tipo) => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {TIPOS_DOCUMENTOS.find(t => t.value === tipoDocumentoSeleccionado)?.descripcion}
                                </p>
                            </div>

                            {/* Upload de documentos */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    ref={documentoInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={handleDocumentUpload}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => documentoInputRef.current?.click()}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Upload size={16} />
                                    Seleccionar Documentos
                                </Button>
                                <p className="text-sm text-gray-500 mt-2">
                                    PDF, DOC, DOCX, JPG, PNG (máx. 10MB cada uno)
                                </p>
                            </div>
                        </Card>

                        {/* CARD 2: Documentos Procesados */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-green-600">📋 Documentos Procesados</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cargarDocumentosBackend}
                                    disabled={isLoadingDocuments}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Recargar documentos"
                                >
                                    <RefreshCw size={14} className={isLoadingDocuments ? 'animate-spin' : ''} />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium">
                                    Documentos ({documentosBackend.length})
                                    {isLoadingDocuments && (
                                        <span className="ml-2 text-gray-500 text-xs">(Cargando...)</span>
                                    )}
                                </h4>
                            </div>
                            
                            {isLoadingDocuments ? (
                                <div className="text-center py-6">
                                    <RefreshCw className="animate-spin mx-auto h-6 w-6 text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm">Cargando documentos...</p>
                                </div>
                            ) : documentosBackend.length > 0 ? (
                                <div className="space-y-3">
                                    {documentosBackend.map((doc) => (
                                        <div 
                                            key={doc.id} 
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-blue-500" size={20} />
                                                <div>
                                                    <p className="font-medium text-sm">{doc.fileName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.originalDocumentType} • {doc.totalPages} páginas
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Procesado: {new Date(doc.processedAt).toLocaleDateString()}
                                                    </p>
                                                    {doc.description && (
                                                        <p className="text-xs text-gray-600 mt-1 max-w-md truncate">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        abrirModalDocumento(doc);
                                                    }}
                                                    className="text-green-600 hover:text-green-700"
                                                    title="Ver documento en modal"
                                                >
                                                    <Eye size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">No hay documentos procesados</p>
                                    <p className="text-sm text-gray-400 mt-1">Los documentos aparecerán aquí una vez procesados por el sistema</p>
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>
            
            {/* Modal del carrusel de fotos */}
            {carruselModalAbierto && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={cerrarCarrusel}
                >
                    <div 
                        className="relative w-full h-full flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Imagen principal */}
                        <img
                            src={obtenerFotosPorZona(zonaSeleccionada)[indiceCarruselActual]?.photoUrl}
                            alt={`Foto ${indiceCarruselActual + 1} de ${zonaSeleccionada}`}
                            className="max-w-full max-h-full object-contain"
                        />
                        
                        {/* Botón cerrar */}
                        <button
                            onClick={cerrarCarrusel}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                        >
                            <X size={24} />
                        </button>
                        
                        {/* Navegación solo si hay más de una foto */}
                        {obtenerFotosPorZona(zonaSeleccionada).length > 1 && (
                            <>
                                {/* Botón anterior */}
                                <button
                                    onClick={anteriorFotoCarrusel}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                
                                {/* Botón siguiente */}
                                <button
                                    onClick={siguienteFotoCarrusel}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                        
                        {/* Indicadores de fotos (thumbnails) */}
                        {obtenerFotosPorZona(zonaSeleccionada).length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-3 rounded-lg">
                                {obtenerFotosPorZona(zonaSeleccionada).map((fotoUrl, index) => (
                                    <button
                                        key={index}
                                        onClick={() => irAFotoCarrusel(index)}
                                        className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                                            index === indiceCarruselActual 
                                                ? 'border-white' 
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={fotoUrl}
                                            alt={`Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Footer con acciones */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <Button
                                variant="outline"
                                onClick={cerrarCarrusel}
                                className="bg-white text-black hover:bg-gray-100"
                            >
                                Cerrar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    const fotoActual = obtenerFotosPorZona(zonaSeleccionada)[indiceCarruselActual];
                                    eliminarFoto(fotoActual.photoUrl);
                                    
                                    // Si era la última foto, cerrar el carrusel
                                    if (obtenerFotosPorZona(zonaSeleccionada).length === 1) {
                                        cerrarCarrusel();
                                    } else {
                                        // Ajustar índice si es necesario
                                        const nuevaCantidad = obtenerFotosPorZona(zonaSeleccionada).length - 1;
                                        if (indiceCarruselActual >= nuevaCantidad) {
                                            setIndiceCarruselActual(nuevaCantidad - 1);
                                        }
                                    }
                                }}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal del documento */}
            {modalDocumentoAbierto && documentoModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={cerrarModalDocumento}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-500" size={24} />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {documentoModal.fileName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {documentoModal.originalDocumentType} • {documentoModal.totalPages} páginas
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cerrarModalDocumento}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Contenido del modal - Dual panel */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Panel izquierdo: PDF Viewer */}
                            <div className="w-1/2 border-r bg-gray-50 flex flex-col">
                                <div className="p-3 border-b bg-gray-100">
                                    <h4 className="font-medium text-gray-900 text-sm">Documento Original (PDF)</h4>
                                </div>
                                <div className="flex-1 p-3">
                                    <iframe
                                        src={documentoModal.documentUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none', borderRadius: '8px' }}
                                        title={`PDF Viewer - ${documentoModal.fileName}`}
                                    />
                                </div>
                            </div>

                            {/* Panel derecho: Contenido Estructurado */}
                            <div className="w-1/2 flex flex-col">
                                <div className="p-3 border-b bg-gray-100">
                                    <h4 className="font-medium text-gray-900 text-sm">Análisis del Documento</h4>
                                </div>
                                <div className="flex-1 p-4 overflow-auto space-y-4">
                                    {/* Resumen Ejecutivo */}
                                    {documentoModal.executiveSummary && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h5 className="font-semibold text-blue-900 mb-2 text-sm">Resumen Ejecutivo</h5>
                                            <p className="text-blue-800 text-sm">{documentoModal.executiveSummary}</p>
                                        </div>
                                    )}

                                    {/* Contenido HTML Estructurado */}
                                    {(documentoModal.htmlOutput || documentoModal.structuredData?.htmlOutput) && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-100 px-3 py-2 border-b">
                                                <h5 className="font-semibold text-gray-900 text-sm">Contenido Procesado</h5>
                                            </div>
                                            <div 
                                                className="p-3 max-h-60 overflow-auto text-sm"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: documentoModal.htmlOutput || documentoModal.structuredData?.htmlOutput || ''
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Key Insights */}
                                    {(documentoModal.keyInsights || documentoModal.structuredData?.keyInsights) && 
                                     (documentoModal.keyInsights?.length > 0 || documentoModal.structuredData?.keyInsights?.length > 0) && (
                                        <div className="space-y-3">
                                            <h5 className="font-semibold text-gray-900 text-sm">Insights Clave</h5>
                                            <div className="space-y-2">
                                                {(documentoModal.keyInsights || documentoModal.structuredData?.keyInsights || []).map((insight, index) => (
                                                    <div 
                                                        key={index}
                                                        className={`p-3 rounded-lg border-l-4 ${
                                                            insight.importance === 'HIGH' ? 'bg-red-50 border-red-400' :
                                                            insight.importance === 'MEDIUM' ? 'bg-yellow-50 border-yellow-400' :
                                                            'bg-green-50 border-green-400'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h6 className="font-medium text-sm text-gray-900">{insight.title}</h6>
                                                                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                                                                {insight.value && (
                                                                    <p className="text-sm font-semibold text-gray-800 mt-1">{insight.value}</p>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                insight.type === 'FINANCIAL' ? 'bg-blue-100 text-blue-800' :
                                                                insight.type === 'LEGAL' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {insight.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Estadísticas del Documento */}
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Páginas</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.pageCount}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Tablas</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.tableCount}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                                            <p className="font-semibold text-gray-700">Insights</p>
                                            <p className="text-lg font-bold text-gray-900">{documentoModal.insightCount}</p>
                                        </div>
                                    </div>

                                    {/* Información de procesamiento */}
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                                        <p><strong>Procesado:</strong> {new Date(documentoModal.processedAt).toLocaleString()}</p>
                                        <p><strong>Subido:</strong> {new Date(documentoModal.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                            <div className="text-sm text-gray-600">
                                {documentoModal.description}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(documentoModal.documentUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    Abrir en nueva pestaña
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={cerrarModalDocumento}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalles de foto */}
            {modalDetalleAbierto && fotoDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg max-w-7xl w-full h-[95vh] sm:h-[90vh] overflow-hidden">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold truncate">{fotoDetalle.fileName}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {fotoDetalle.eTag}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalDetalleAbierto(false)}
                                className="ml-2 flex-shrink-0"
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(90vh-100px)]">
                            {/* Imagen */}
                            <div className="w-full lg:w-2/5 h-48 sm:h-64 lg:h-auto bg-gray-100 flex items-center justify-center">
                                <img
                                    src={fotoDetalle.photoUrl}
                                    alt={fotoDetalle.fileName}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Detalles */}
                            <div className="flex-1 lg:w-3/5 p-3 sm:p-4 lg:p-6 overflow-y-auto">
                                <h4 className="text-sm sm:text-md font-semibold mb-3">Análisis de la Imagen</h4>
                                
                                {/* Descripción genérica */}
                                {fotoDetalle.metadata?.descripcionGenerica && (
                                    <div className="mb-4">
                                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Descripción:</h5>
                                        <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded">
                                            {fotoDetalle.metadata.descripcionGenerica}
                                        </p>
                                    </div>
                                )}

                                {/* Detalles HTML */}
                                {fotoDetalle.metadata?.detailsHTML && fotoDetalle.metadata.detailsHTML !== 'No HTML' ? (
                                    <div>
                                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Análisis Detallado:</h5>
                                        <div 
                                            className="text-xs sm:text-sm prose prose-sm max-w-none bg-gray-50 p-2 sm:p-3 lg:p-4 rounded border overflow-x-auto"
                                            dangerouslySetInnerHTML={{ __html: fotoDetalle.metadata.detailsHTML }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-4 sm:py-8 text-gray-500">
                                        <p className="text-xs sm:text-sm">No hay análisis detallado disponible para esta imagen.</p>
                                    </div>
                                )}

                                {/* Información técnica */}
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                    <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Información Técnica:</h5>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <p className="break-all"><strong>Archivo:</strong> {fotoDetalle.fileName}</p>
                                        <p className="break-all"><strong>Ruta:</strong> {fotoDetalle.filePath}</p>
                                        <p className="break-all"><strong>ID:</strong> {fotoDetalle.eTag}</p>
                                        {fotoDetalle.metadata?.tipoEspacio && (
                                            <p><strong>Tipo de Espacio:</strong> {fotoDetalle.metadata.tipoEspacio}</p>
                                        )}
                                        {fotoDetalle.metadata?.twinID && (
                                            <p className="break-all"><strong>Twin ID:</strong> {fotoDetalle.metadata.twinID}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 border-t bg-gray-50 gap-2 sm:gap-0">
                            <div className="text-xs sm:text-sm text-gray-600">
                                Zona: {zonaSeleccionada}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(fotoDetalle.photoUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                                >
                                    <span className="hidden sm:inline">Abrir imagen completa</span>
                                    <span className="sm:hidden">Ver imagen</span>
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setModalDetalleAbierto(false)}
                                    className="text-xs sm:text-sm"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de progreso AI */}
            {modalProgresoAI && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md w-full p-6 border border-blue-200 shadow-2xl">
                        {/* Header colorido */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader className="h-8 w-8 text-white animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                🤖 Procesando con IA
                            </h3>
                            <p className="text-sm text-gray-600">
                                Nuestro sistema de inteligencia artificial está analizando tus fotos...
                            </p>
                        </div>

                        {/* Progress de fotos */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                                <span>Foto {fotosSubiendose} de {totalFotosSubir}</span>
                                <span>{Math.round((fotosSubiendose / totalFotosSubir) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{width: `${(fotosSubiendose / totalFotosSubir) * 100}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Pasos del proceso */}
                        <div className="space-y-3">
                            {[
                                { id: 1, emoji: "📤", titulo: "Subiendo archivo", descripcion: "Transfiriendo imagen al servidor" },
                                { id: 2, emoji: "🔍", titulo: "Análisis visual con IA", descripcion: "Detectando elementos y características" },
                                { id: 3, emoji: "📝", titulo: "Generando descripción", descripcion: "Creando análisis detallado del espacio" },
                                { id: 4, emoji: "💾", titulo: "Guardando análisis", descripcion: "Almacenando datos procesados" }
                            ].map((paso) => (
                                <div 
                                    key={paso.id}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                                        pasoActualAI === paso.id 
                                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-blue-500 shadow-md' 
                                            : pasoActualAI > paso.id 
                                                ? 'bg-green-50 border-l-4 border-green-500' 
                                                : 'bg-gray-50 border-l-4 border-gray-300'
                                    }`}
                                >
                                    <div className="text-2xl mr-3">{paso.emoji}</div>
                                    <div className="flex-1">
                                        <div className={`font-medium text-sm ${
                                            pasoActualAI === paso.id ? 'text-blue-700' : 
                                            pasoActualAI > paso.id ? 'text-green-700' : 'text-gray-500'
                                        }`}>
                                            {paso.titulo}
                                        </div>
                                        <div className={`text-xs ${
                                            pasoActualAI === paso.id ? 'text-blue-600' : 
                                            pasoActualAI > paso.id ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                            {paso.descripcion}
                                        </div>
                                    </div>
                                    {pasoActualAI === paso.id && (
                                        <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                                    )}
                                    {pasoActualAI > paso.id && (
                                        <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer informativo */}
                        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700 text-center">
                                💡 <strong>¿Sabías que?</strong> La IA analiza elementos arquitectónicos, colores, distribución y genera un análisis completo del espacio para ayudarte a entender mejor tu hogar.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
