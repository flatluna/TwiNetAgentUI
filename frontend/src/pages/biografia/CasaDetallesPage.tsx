import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { 
    ArrowLeft, 
    Upload, 
    Trash2, 
    Edit2, 
    Save,
    Home,
    Camera,
    MapPin,
    Calendar,
    Bed,
    Bath,
    Car,
    Thermometer,
    Snowflake,
    DollarSign,
    Ruler,
    FileText,
    Download,
    Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { lugaresApiService, LugarVivienda } from '../../services/lugaresApiService';

interface DocumentoCasa {
    id: string;
    nombre: string;
    tipo: TipoDocumento;
    url: string;
    fechaSubida: Date;
    tamaño: number;
    descripcion?: string;
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

type ZonaCasa = 
    | 'exterior'
    | 'sala'
    | 'cocina'
    | 'comedor'
    | 'recamara_principal'
    | 'recamara_secundaria'
    | 'bano_principal'
    | 'bano_secundario'
    | 'garage'
    | 'jardin'
    | 'sotano'
    | 'atico'
    | 'oficina'
    | 'lavanderia'
    | 'otros';

const ZONAS_CASA: { value: ZonaCasa; label: string; icon: React.ReactNode }[] = [
    { value: 'exterior', label: 'Exterior', icon: <Home size={16} /> },
    { value: 'sala', label: 'Sala', icon: <Home size={16} /> },
    { value: 'cocina', label: 'Cocina', icon: <Home size={16} /> },
    { value: 'comedor', label: 'Comedor', icon: <Home size={16} /> },
    { value: 'recamara_principal', label: 'Recámara Principal', icon: <Bed size={16} /> },
    { value: 'recamara_secundaria', label: 'Recámara Secundaria', icon: <Bed size={16} /> },
    { value: 'bano_principal', label: 'Baño Principal', icon: <Bath size={16} /> },
    { value: 'bano_secundario', label: 'Baño Secundario', icon: <Bath size={16} /> },
    { value: 'garage', label: 'Garaje', icon: <Car size={16} /> },
    { value: 'jardin', label: 'Jardín', icon: <Home size={16} /> },
    { value: 'sotano', label: 'Sótano', icon: <Home size={16} /> },
    { value: 'atico', label: 'Ático', icon: <Home size={16} /> },
    { value: 'oficina', label: 'Oficina', icon: <Home size={16} /> },
    { value: 'lavanderia', label: 'Lavandería', icon: <Home size={16} /> },
    { value: 'otros', label: 'Otros', icon: <Home size={16} /> },
];

export default function CasaDetallesPage() {
    const navigate = useNavigate();
    const { casaId } = useParams<{ casaId: string }>();
    const { accounts } = useMsal();
    
    const [casa, setCasa] = useState<LugarVivienda | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaCasa>('exterior');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState<'fotos' | 'documentos'>('fotos');
    const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<TipoDocumento>('titulo_propiedad');
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    
    // Estado local para fotos organizadas por zona (simulado)
    const [fotosPorZona, setFotosPorZona] = useState<{ [key in ZonaCasa]?: string[] }>({});
    
    // Estado local para documentos (simulado)
    const [documentos, setDocumentos] = useState<DocumentoCasa[]>([]);

    const twinId = accounts[0]?.localAccountId;

    useEffect(() => {
        if (casaId && twinId) {
            cargarCasa();
            cargarFotosLocales();
        }
    }, [casaId, twinId]);

    const cargarFotosLocales = () => {
        // Simular carga de fotos organizadas por zona desde localStorage
        const fotosGuardadas = localStorage.getItem(`fotos-casa-${casaId}`);
        if (fotosGuardadas) {
            try {
                setFotosPorZona(JSON.parse(fotosGuardadas));
            } catch (error) {
                console.error('Error cargando fotos locales:', error);
            }
        }
        
        // Cargar documentos locales
        const docsGuardados = localStorage.getItem(`documentos-casa-${casaId}`);
        if (docsGuardados) {
            try {
                setDocumentos(JSON.parse(docsGuardados));
            } catch (error) {
                console.error('Error cargando documentos locales:', error);
            }
        }
    };

    const guardarFotosLocales = (nuevasFotos: { [key in ZonaCasa]?: string[] }) => {
        localStorage.setItem(`fotos-casa-${casaId}`, JSON.stringify(nuevasFotos));
        setFotosPorZona(nuevasFotos);
    };

    const cargarCasa = async () => {
        if (!casaId || !twinId) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('🏠 Cargando detalles de casa:', casaId);
            const response = await lugaresApiService.getLugarById(twinId, casaId);
            
            if (response.success && response.data) {
                setCasa(response.data);
                console.log('✅ Casa cargada:', response.data);
            } else {
                setError('No se pudo cargar la información de la casa');
            }
        } catch (error) {
            console.error('❌ Error cargando casa:', error);
            setError('Error al cargar los detalles de la casa');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !casa) return;

        setIsUploadingPhoto(true);

        try {
            console.log('📸 Subiendo fotos para zona:', zonaSeleccionada);
            
            const nuevasUrls: string[] = [];
            
            for (const file of files) {
                // Simular subida de archivo
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Crear URL temporal para la imagen
                const url = URL.createObjectURL(file);
                nuevasUrls.push(url);
            }

            // Actualizar fotos por zona
            const fotosActualizadas = {
                ...fotosPorZona,
                [zonaSeleccionada]: [...(fotosPorZona[zonaSeleccionada] || []), ...nuevasUrls]
            };
            
            guardarFotosLocales(fotosActualizadas);

        } catch (error) {
            console.error('❌ Error subiendo fotos:', error);
            setError('Error al subir las fotos');
        } finally {
            setIsUploadingPhoto(false);
            // Limpiar el input
            event.target.value = '';
        }
    };

    const eliminarFoto = async (urlFoto: string) => {
        if (!casa) return;

        try {
            console.log('🗑️ Eliminando foto:', urlFoto);
            
            const fotosActualizadas = {
                ...fotosPorZona,
                [zonaSeleccionada]: fotosPorZona[zonaSeleccionada]?.filter(url => url !== urlFoto) || []
            };
            
            guardarFotosLocales(fotosActualizadas);

        } catch (error) {
            console.error('❌ Error eliminando foto:', error);
            setError('Error al eliminar la foto');
        }
    };

    const obtenerFotosPorZona = (zona: ZonaCasa) => {
        return fotosPorZona[zona] || [];
    };

    const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !casa) return;

        setIsUploadingDoc(true);

        try {
            console.log('📄 Subiendo documentos del tipo:', tipoDocumentoSeleccionado);
            
            const nuevosDocumentos: DocumentoCasa[] = [];
            
            for (const file of files) {
                // Simular subida de archivo
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const nuevoDoc: DocumentoCasa = {
                    id: `doc-${Date.now()}-${Math.random()}`,
                    nombre: file.name,
                    tipo: tipoDocumentoSeleccionado,
                    url: URL.createObjectURL(file),
                    fechaSubida: new Date(),
                    tamaño: file.size,
                    descripcion: TIPOS_DOCUMENTOS.find(t => t.value === tipoDocumentoSeleccionado)?.descripcion
                };

                nuevosDocumentos.push(nuevoDoc);
            }

            const documentosActualizados = [...documentos, ...nuevosDocumentos];
            setDocumentos(documentosActualizados);
            localStorage.setItem(`documentos-casa-${casaId}`, JSON.stringify(documentosActualizados));

        } catch (error) {
            console.error('❌ Error subiendo documentos:', error);
            setError('Error al subir los documentos');
        } finally {
            setIsUploadingDoc(false);
            // Limpiar el input
            event.target.value = '';
        }
    };

    const eliminarDocumento = async (docId: string) => {
        if (!casa) return;

        try {
            console.log('🗑️ Eliminando documento:', docId);
            
            const documentosActualizados = documentos.filter(doc => doc.id !== docId);
            setDocumentos(documentosActualizados);
            localStorage.setItem(`documentos-casa-${casaId}`, JSON.stringify(documentosActualizados));

        } catch (error) {
            console.error('❌ Error eliminando documento:', error);
            setError('Error al eliminar el documento');
        }
    };

    const descargarDocumento = (doc: DocumentoCasa) => {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.nombre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const obtenerDocumentosPorTipo = (tipo: TipoDocumento) => {
        return documentos.filter(doc => doc.tipo === tipo);
    };

    const formatearTamaño = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const obtenerIconoTipo = () => {
        if (!casa) return <Home size={24} />;
        
        switch (casa.tipo) {
            case 'actual':
                return <Home size={24} className="text-green-600" />;
            case 'pasado':
                return <Calendar size={24} className="text-blue-600" />;
            case 'mudanza':
                return <MapPin size={24} className="text-orange-600" />;
            default:
                return <Home size={24} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Cargando detalles de la casa...</span>
                </div>
            </div>
        );
    }

    if (error || !casa) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error || 'Casa no encontrada'}</div>
                    <Button onClick={() => navigate('/twin-biografia')} variant="outline">
                        <ArrowLeft size={16} className="mr-2" />
                        Volver
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/twin-biografia')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </Button>
                        <div className="flex items-center gap-3">
                            {obtenerIconoTipo()}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{casa.direccion}</h1>
                                <p className="text-gray-600">{casa.ciudad}, {casa.estado} {casa.codigoPostal}</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                    >
                        {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                        {isEditing ? 'Guardar' : 'Editar'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Información General */}
                    <div className="lg:col-span-1">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Información General</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Bed size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Habitaciones:</span>
                                    <span className="text-sm">{casa.habitaciones || 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Bath size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Baños:</span>
                                    <span className="text-sm">{casa.banos || 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Ruler size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Área Total:</span>
                                    <span className="text-sm">{casa.areaTotal ? `${casa.areaTotal} m²` : 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Año de Construcción:</span>
                                    <span className="text-sm">{casa.anoConstruction || 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Thermometer size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Calefacción:</span>
                                    <span className="text-sm">{casa.calefaccion || 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Snowflake size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Aire Acondicionado:</span>
                                    <span className="text-sm">{casa.aireAcondicionado || 'No especificado'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Car size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium">Estacionamiento:</span>
                                    <span className="text-sm">{casa.tipoEstacionamiento || 'No especificado'}</span>
                                </div>
                                
                                {casa.valorEstimado && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium">Valor Estimado:</span>
                                        <span className="text-sm">${casa.valorEstimado.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Fotos y Documentos */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            {/* Tabs para alternar entre Fotos y Documentos */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setSeccionActiva('fotos')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            seccionActiva === 'fotos'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <Camera size={16} className="inline mr-2" />
                                        Fotos ({Object.values(fotosPorZona).flat().length})
                                    </button>
                                    <button
                                        onClick={() => setSeccionActiva('documentos')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            seccionActiva === 'documentos'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <FileText size={16} className="inline mr-2" />
                                        Documentos ({documentos.length})
                                    </button>
                                </div>
                                
                                {/* Botón de subir según la sección activa */}
                                <div className="flex items-center gap-2">
                                    {seccionActiva === 'fotos' ? (
                                        <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700">
                                            {isUploadingPhoto ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                            Subir Fotos
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                disabled={isUploadingPhoto}
                                            />
                                        </label>
                                    ) : (
                                        <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700">
                                            {isUploadingDoc ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                            Subir Documentos
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                                onChange={handleDocumentUpload}
                                                className="hidden"
                                                disabled={isUploadingDoc}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {seccionActiva === 'fotos' ? (
                                <>
                                    {/* Selector de Zona para Fotos */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium mb-3">Seleccionar Zona:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {ZONAS_CASA.map((zona) => (
                                                <Button
                                                    key={zona.value}
                                                    variant={zonaSeleccionada === zona.value ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setZonaSeleccionada(zona.value)}
                                                    className="flex items-center gap-1"
                                                >
                                                    {zona.icon}
                                                    {zona.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fotos de la Zona Seleccionada */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">
                                            {ZONAS_CASA.find(z => z.value === zonaSeleccionada)?.label} 
                                            ({obtenerFotosPorZona(zonaSeleccionada).length} fotos)
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {obtenerFotosPorZona(zonaSeleccionada).map((fotoUrl, index) => (
                                                <div key={`${zonaSeleccionada}-${index}`} className="relative group">
                                                    <img
                                                        src={fotoUrl}
                                                        alt={`${ZONAS_CASA.find(z => z.value === zonaSeleccionada)?.label} ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => eliminarFoto(fotoUrl)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {obtenerFotosPorZona(zonaSeleccionada).length === 0 && (
                                                <div className="col-span-full text-center py-12">
                                                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <p className="text-gray-500">No hay fotos en esta zona</p>
                                                    <p className="text-sm text-gray-400 mt-1">Sube algunas fotos para comenzar</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Selector de Tipo de Documento */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium mb-3">Tipo de Documento:</h3>
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

                                    {/* Lista de Documentos */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">
                                            Documentos Subidos ({documentos.length} archivos)
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            {documentos.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="text-blue-500" size={20} />
                                                        <div>
                                                            <p className="font-medium text-sm">{doc.nombre}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {TIPOS_DOCUMENTOS.find(t => t.value === doc.tipo)?.label} • {formatearTamaño(doc.tamaño)}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Subido: {doc.fechaSubida.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => descargarDocumento(doc)}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Download size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(doc.url, '_blank')}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => eliminarDocumento(doc.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {documentos.length === 0 && (
                                                <div className="text-center py-12">
                                                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <p className="text-gray-500">No hay documentos subidos</p>
                                                    <p className="text-sm text-gray-400 mt-1">Sube documentos importantes de tu casa</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
